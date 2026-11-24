/**
 * Session configuration for both Next.js apps (FE-008, FOI-01).
 *
 * The bearer token never reaches the browser. Each app seals it in an opaque
 * HttpOnly cookie; the proxy attaches it on the server. Lifetimes differ by
 * surface as decided in FOI-01.
 */

export type SessionSurface = "web" | "admin";

export interface SessionConfig {
  surface: SessionSurface;
  apiBaseUrl: string;
  siteUrl: string;
  secret: string;
  idleMs: number;
  absoluteMs: number;
  /** Secure is on in production; localhost HTTP needs it off in development. */
  secureCookie: boolean;
  production: boolean;
  sessionCookieName: string;
  csrfCookieName: string;
}

const LIFETIMES: Record<SessionSurface, { idleMs: number; absoluteMs: number }> = {
  web: { idleMs: 7 * 24 * 60 * 60 * 1000, absoluteMs: 30 * 24 * 60 * 60 * 1000 },
  admin: { idleMs: 30 * 60 * 1000, absoluteMs: 8 * 60 * 60 * 1000 },
};

/** Only used when NODE_ENV is not production, so a deployed app cannot run with it. */
const DEVELOPMENT_SECRET = "gigshive-local-development-session-secret";

export function sessionCookieNameFor(surface: SessionSurface): string {
  return `gh_session_${surface}`;
}

export function csrfCookieNameFor(surface: SessionSurface): string {
  return `gh_csrf_${surface}`;
}

function normaliseUrl(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`${name} must be set for the session proxy.`);
  }
  return value.replace(/\/+$/, "");
}

export function createSessionConfig(params: {
  surface: SessionSurface;
  env: Record<string, string | undefined>;
}): SessionConfig {
  const { surface, env } = params;
  const production = env["NODE_ENV"] === "production";
  const configuredSecret = env["SESSION_SECRET"];

  if (production && (!configuredSecret || configuredSecret.length < 32)) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters in production.");
  }
  const secret = configuredSecret || DEVELOPMENT_SECRET;

  const siteUrl = normaliseUrl(env["PUBLIC_SITE_URL"], "PUBLIC_SITE_URL");
  const secureCookie = production || siteUrl.startsWith("https://");

  return {
    surface,
    apiBaseUrl: normaliseUrl(env["API_BASE_URL"], "API_BASE_URL"),
    siteUrl,
    secret,
    ...LIFETIMES[surface],
    secureCookie,
    production,
    sessionCookieName: sessionCookieNameFor(surface),
    csrfCookieName: csrfCookieNameFor(surface),
  };
}

/** Same-origin origin used for Origin-header verification. */
export function expectedOrigin(config: SessionConfig): string {
  return new URL(config.siteUrl).origin;
}
