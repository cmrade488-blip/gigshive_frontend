import { createApiClient, type ApiClient } from "@gigshive/api-client";
import { csrfHeaderName, readCsrfToken } from "@gigshive/session/browser";

/**
 * Browser-side API client for unauthenticated auth calls (FE-013). These calls
 * go through same-origin route handlers; the Sanctum token stays on the server.
 */
export const authClient: ApiClient = createApiClient({ baseUrl: "/api/auth" });

/**
 * Browser client for authenticated calls. The proxy attaches the server-held
 * token. FE-017 installs one app-level handler so a 401 clears the session and
 * returns to sign-in; session and credential checks opt out per request.
 */
let unauthorizedHandler: (() => void) | null = null;

export const sessionClient: ApiClient = createApiClient({
  baseUrl: "/api/proxy",
  onUnauthorized: () => unauthorizedHandler?.(),
});

/** Registers the single global 401 handler and returns its cleanup function. */
export function registerUnauthorizedHandler(handler: () => void): () => void {
  unauthorizedHandler = handler;
  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = null;
    }
  };
}

/** Fixed public copy: a failed CSRF bootstrap is never surfaced as raw text. */
export class CsrfTokenError extends Error {
  constructor() {
    super("The secure form could not be prepared. Please try again.");
    this.name = "CsrfTokenError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * The CSRF cookie is readable on purpose and is not an auth secret. Reuse it
 * until it expires; bootstrap it once when a fresh page has none.
 */
export async function csrfHeaders(): Promise<Record<string, string>> {
  const existing = readCsrfToken("web");
  if (existing) {
    return { [csrfHeaderName]: existing };
  }

  const response = await fetch("/api/session/csrf", {
    cache: "no-store",
    credentials: "same-origin",
  });
  if (!response.ok) {
    throw new CsrfTokenError();
  }

  const payload: unknown = await response.json().catch(() => null);
  const token =
    isRecord(payload) && isRecord(payload["data"]) ? payload["data"]["csrfToken"] : undefined;

  if (typeof token !== "string" || token.length === 0) {
    throw new CsrfTokenError();
  }

  return { [csrfHeaderName]: token };
}
