import { verifyCsrf, type SessionConfig } from "@gigshive/session";

import { sessionConfig } from "./session";

/**
 * Same-origin forwarding for unauthenticated auth calls (FE-013). Unlike the
 * session proxy, these endpoints must work before a session exists; they still
 * require the same CSRF/Origin checks and never see a token.
 */
const MAX_JSON_BODY_BYTES = 64 * 1024;
const FORWARDED_RESPONSE_HEADERS = ["content-type", "retry-after", "x-request-id"] as const;

export interface PublicAuthDeps {
  config?: SessionConfig;
  fetchFn?: typeof fetch;
}

function jsonError(status: number, code: string, requestId: string): Response {
  return new Response(
    JSON.stringify({
      error: {
        code,
        message: "The request could not be completed.",
        details: null,
        request_id: requestId,
      },
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "X-Request-Id": requestId,
      },
    },
  );
}

function responseHeaders(upstream: Response, requestId: string): Headers {
  const headers = new Headers({ "Cache-Control": "no-store" });
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }
  if (!headers.has("x-request-id")) {
    headers.set("X-Request-Id", requestId);
  }
  return headers;
}

export async function forwardPublicAuth(
  request: Request,
  backendPath: string,
  deps: PublicAuthDeps = {},
): Promise<Response> {
  const config = deps.config ?? sessionConfig();
  const fetchFn = deps.fetchFn ?? fetch;
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();

  if (request.method !== "POST") {
    return jsonError(405, "HTTP_405", requestId);
  }
  if (!verifyCsrf(request, config)) {
    return jsonError(403, "HTTP_403", requestId);
  }

  let body: string;
  try {
    body = await request.text();
  } catch {
    return jsonError(400, "HTTP_400", requestId);
  }
  if (new TextEncoder().encode(body).byteLength > MAX_JSON_BODY_BYTES) {
    return jsonError(413, "HTTP_413", requestId);
  }

  let upstream: Response;
  try {
    const base = config.apiBaseUrl.replace(/\/+$/, "");
    const path = backendPath.replace(/^\/+/, "");
    upstream = await fetchFn(`${base}/${path}`, {
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
    return jsonError(502, "HTTP_502", requestId);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders(upstream, requestId),
  });
}
