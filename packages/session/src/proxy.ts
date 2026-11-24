/**
 * Same-origin session proxy (FE-008, FOI-01).
 *
 * The browser calls /api/proxy/<backend path>. This layer reads the opaque
 * session cookie, attaches the Sanctum bearer token, forwards a narrow set of
 * headers, and never returns the token. Auth start/logout are handled beside it
 * because only a route handler may move the token into or out of the cookie.
 */
import { randomUUID } from "node:crypto";

import { type SessionConfig } from "./config";
import {
  clearCsrfCookie,
  clearSessionCookie,
  csrfSetCookie,
  readSession,
  sessionSetCookie,
  touchSession,
} from "./cookie";
import { createCsrfToken, isMutationMethod, verifyCsrf } from "./csrf";

export interface ProxyDeps {
  now?: () => number;
  fetchFn?: typeof fetch;
}

const FORWARDED_REQUEST_HEADERS = ["content-type", "idempotency-key", "x-request-id"] as const;
const FORWARDED_RESPONSE_HEADERS = [
  "content-type",
  "cache-control",
  "retry-after",
  "x-request-id",
  "x-ratelimit-limit",
  "x-ratelimit-remaining",
  "x-ratelimit-reset",
] as const;

const MAX_JSON_BODY_BYTES = 64 * 1024;

function jsonResponse(
  status: number,
  code: string,
  message: string,
  requestId: string,
  setCookies: string[] = [],
  extraHeaders: Record<string, string> = {},
): Response {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "X-Request-Id": requestId,
    ...extraHeaders,
  });
  for (const cookie of setCookies) {
    headers.append("Set-Cookie", cookie);
  }
  return new Response(
    JSON.stringify({
      error: { code, message, details: null, request_id: requestId },
    }),
    { status, headers },
  );
}

function clearedCookies(config: SessionConfig): string[] {
  return [clearSessionCookie(config), clearCsrfCookie(config)];
}

function passthroughHeaders(upstream: Response): Headers {
  const headers = new Headers({ "Cache-Control": "no-store" });
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}

function addCookies(headers: Headers, cookies: string[]): void {
  for (const cookie of cookies) {
    headers.append("Set-Cookie", cookie);
  }
}

function requestIdFor(request: Request): string {
  return request.headers.get("x-request-id") ?? randomUUID();
}

function proxyPath(request: Request): string | null {
  const pathname = new URL(request.url).pathname.replace(/^\/api\/proxy\/?/, "");
  let decoded = pathname;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (!decoded || decoded.startsWith("/") || decoded.includes("..") || decoded.includes("\\")) {
    return null;
  }
  return pathname;
}

function refreshedCookie(
  state: NonNullable<ReturnType<typeof readSession>>,
  config: SessionConfig,
  now: number,
): string | null {
  if (now - state.lastSeen < 60_000) {
    return null;
  }
  return sessionSetCookie(config, touchSession(state, now), now);
}

/** All methods allowed by the API are forwarded; unauthenticated calls stop here. */
export async function handleProxy(
  request: Request,
  config: SessionConfig,
  deps: ProxyDeps = {},
): Promise<Response> {
  const now = deps.now?.() ?? Date.now();
  const requestId = requestIdFor(request);
  const fetchFn = deps.fetchFn ?? fetch;
  const state = readSession(request, config, now);

  if (!state) {
    return jsonResponse(401, "HTTP_401", "Unauthorized", requestId, clearedCookies(config));
  }
  if (isMutationMethod(request.method) && !verifyCsrf(request, config)) {
    return jsonResponse(403, "HTTP_403", "Forbidden", requestId);
  }

  const path = proxyPath(request);
  if (!path) {
    return jsonResponse(400, "HTTP_400", "Bad request", requestId);
  }

  const url = new URL(request.url);
  const target = `${config.apiBaseUrl}/${path}${url.search}`;
  const headers = new Headers({
    Accept: "application/json",
    Authorization: `Bearer ${state.token}`,
    "X-Request-Id": requestId,
  });
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }

  let upstream: Response;
  try {
    upstream = await fetchFn(target, {
      method: request.method,
      headers,
      ...(request.method === "GET" || request.method === "HEAD"
        ? {}
        : { body: await request.arrayBuffer() }),
      cache: "no-store",
      redirect: "manual",
    });
  } catch {
    return jsonResponse(502, "HTTP_502", "Bad gateway", requestId);
  }

  if (upstream.status === 401) {
    return jsonResponse(401, "HTTP_401", "Unauthorized", requestId, clearedCookies(config), {
      "X-Session-Expired": "1",
    });
  }

  const responseHeaders = passthroughHeaders(upstream);
  const cookie = refreshedCookie(state, config, now);
  if (cookie) {
    responseHeaders.append("Set-Cookie", cookie);
  }
  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}

/** POST /api/auth/* — moves a SessionStartEnvelope token into the cookie. */
export async function handleSessionStart(
  request: Request,
  config: SessionConfig,
  backendPath: string,
  deps: ProxyDeps = {},
): Promise<Response> {
  const requestId = requestIdFor(request);
  const fetchFn = deps.fetchFn ?? fetch;
  const now = deps.now?.() ?? Date.now();

  if (request.method !== "POST") {
    return jsonResponse(405, "HTTP_405", "Method not allowed", requestId);
  }
  if (!verifyCsrf(request, config)) {
    return jsonResponse(403, "HTTP_403", "Forbidden", requestId);
  }

  let body: string;
  try {
    body = await request.text();
  } catch {
    return jsonResponse(400, "HTTP_400", "Bad request", requestId);
  }
  if (new TextEncoder().encode(body).byteLength > MAX_JSON_BODY_BYTES) {
    return jsonResponse(413, "HTTP_413", "Payload too large", requestId);
  }

  let upstream: Response;
  try {
    upstream = await fetchFn(`${config.apiBaseUrl}/${backendPath}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Request-Id": requestId,
      },
      body,
      cache: "no-store",
      redirect: "manual",
    });
  } catch {
    return jsonResponse(502, "HTTP_502", "Bad gateway", requestId);
  }

  const responseHeaders = passthroughHeaders(upstream);
  if (!upstream.ok) {
    const failedBody = await upstream.text();
    return new Response(failedBody, { status: upstream.status, headers: responseHeaders });
  }

  const raw = await upstream.text();
  let envelope: unknown;
  try {
    envelope = JSON.parse(raw);
  } catch {
    return jsonResponse(502, "HTTP_502", "Bad gateway", requestId);
  }

  const token =
    typeof envelope === "object" &&
    envelope !== null &&
    "token" in envelope &&
    typeof envelope.token === "string" &&
    envelope.token.length > 0
      ? envelope.token
      : null;

  if (!token) {
    // Staff step one (password only) has no token yet: the OTP screen follows.
    return new Response(raw || "{}", { status: upstream.status, headers: responseHeaders });
  }

  const csrfToken = createCsrfToken();
  addCookies(responseHeaders, [
    sessionSetCookie(config, { surface: config.surface, token, issuedAt: now, lastSeen: now }, now),
    csrfSetCookie(config, csrfToken),
  ]);
  const data =
    typeof envelope === "object" && envelope !== null && "data" in envelope ? envelope.data : null;
  return new Response(JSON.stringify({ data }), {
    status: upstream.status,
    headers: responseHeaders,
  });
}

/** POST /api/auth/logout — revoke on the API, then clear both cookies locally. */
export async function handleLogout(
  request: Request,
  config: SessionConfig,
  deps: ProxyDeps = {},
): Promise<Response> {
  const requestId = requestIdFor(request);
  const fetchFn = deps.fetchFn ?? fetch;

  if (request.method !== "POST") {
    return jsonResponse(405, "HTTP_405", "Method not allowed", requestId);
  }
  if (!verifyCsrf(request, config)) {
    return jsonResponse(403, "HTTP_403", "Forbidden", requestId);
  }

  const state = readSession(request, config, deps.now?.() ?? Date.now());
  if (state) {
    try {
      await fetchFn(`${config.apiBaseUrl}/auth/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${state.token}`,
          "X-Request-Id": requestId,
        },
        cache: "no-store",
        redirect: "manual",
      });
    } catch {
      // Local logout must succeed even when the API is unreachable.
    }
  }

  const headers = new Headers({ "Cache-Control": "no-store", "X-Request-Id": requestId });
  addCookies(headers, clearedCookies(config));
  return new Response(null, { status: 204, headers });
}
