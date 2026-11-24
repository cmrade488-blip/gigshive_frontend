/** Browser-side CSRF helper. The token is not secret; it is never an auth token. */
import { csrfCookieNameFor, type SessionSurface } from "./config";
import { csrfHeaderName } from "./constants";

export { csrfHeaderName };

export function readCsrfToken(surface: SessionSurface): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const prefix = `${csrfCookieNameFor(surface)}=`;
  for (const part of document.cookie.split(";")) {
    const cookie = part.trim();
    if (cookie.startsWith(prefix)) {
      return decodeURIComponent(cookie.slice(prefix.length));
    }
  }
  return null;
}

/** Spread onto feature API calls so same-origin mutations pass the proxy check. */
export function csrfHeaders(surface: SessionSurface): Record<string, string> {
  const token = readCsrfToken(surface);
  return token ? { [csrfHeaderName]: token } : {};
}
