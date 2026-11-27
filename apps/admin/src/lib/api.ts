import { createApiClient, type ApiClient } from "@gigshive/api-client";
import { csrfHeaderName, readCsrfToken } from "@gigshive/session/browser";

/** Staff credential calls: password, OTP and logout through same-origin routes. */
export const staffAuthClient: ApiClient = createApiClient({ baseUrl: "/api/auth" });

/**
 * Authenticated console calls. The token stays in the server-held cookie; the
 * FE-018 bootstrap installs one 401 handler that clears the session and signs
 * the user out. Session reads opt out so they return `null` without redirect.
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

/** The CSRF cookie is readable on purpose and is not an auth secret. */
export async function csrfHeaders(): Promise<Record<string, string>> {
  const existing = readCsrfToken("admin");
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
