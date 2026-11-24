/** Double-submit CSRF protection plus Origin verification for same-origin mutations. */
import { randomBytes, timingSafeEqual } from "node:crypto";

import { expectedOrigin, type SessionConfig } from "./config";
import { csrfSetCookie, readCookie } from "./cookie";
import { csrfHeaderName } from "./constants";

export { csrfHeaderName };

export function createCsrfToken(): string {
  return randomBytes(32).toString("base64url");
}

export function isMutationMethod(method: string): boolean {
  return method === "POST" || method === "PATCH" || method === "PUT" || method === "DELETE";
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left, "utf8");
  const b = Buffer.from(right, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Both the token and the Origin check are required. Browsers send Origin on
 * same-origin POSTs; a missing Origin is rejected rather than trusted.
 */
export function verifyCsrf(request: Request, config: SessionConfig): boolean {
  const cookieToken = readCookie(request, config.csrfCookieName);
  const headerToken = request.headers.get(csrfHeaderName);
  const origin = request.headers.get("origin");

  if (!cookieToken || !headerToken || !origin) {
    return false;
  }

  let requestOrigin: string;
  try {
    requestOrigin = new URL(origin).origin;
  } catch {
    return false;
  }

  return safeEqual(cookieToken, headerToken) && requestOrigin === expectedOrigin(config);
}

/** GET /api/session/csrf: plants the readable token and returns it to the caller. */
export function createCsrfResponse(config: SessionConfig): Response {
  const csrfToken = createCsrfToken();
  return new Response(JSON.stringify({ data: { csrfToken } }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Set-Cookie": csrfSetCookie(config, csrfToken),
    },
  });
}
