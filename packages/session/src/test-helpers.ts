import {
  createSessionConfig,
  csrfCookieNameFor,
  sessionCookieNameFor,
  expectedOrigin,
} from "./config";
import { sealSession, type SessionState } from "./cookie";
import { createCsrfToken, csrfHeaderName } from "./csrf";
import type { SessionConfig, SessionSurface } from "./config";

export const NOW = 1_800_000_000_000;

export function makeConfig(surface: SessionSurface = "web"): SessionConfig {
  return createSessionConfig({
    surface,
    env: {
      API_BASE_URL: "https://api.example.test/api/v1",
      PUBLIC_SITE_URL: "https://app.example.test",
      SESSION_SECRET: "session-secret-for-tests-0123456789",
      NODE_ENV: "production",
    },
  });
}

export function makeState(
  config: SessionConfig,
  overrides: Partial<SessionState> = {},
): SessionState {
  return {
    surface: config.surface,
    token: "sanctum-token",
    issuedAt: NOW - 60_000,
    lastSeen: NOW - 60_000,
    ...overrides,
  };
}

export interface RequestOptions {
  method?: string;
  body?: string;
  state?: SessionState | null;
  csrfToken?: string | null;
  /** Override the header independently of the cookie to test mismatch cases. */
  headerToken?: string | null;
  origin?: string | null;
  extraHeaders?: Record<string, string>;
}

/** Builds a same-origin request with a sealed session and a matching CSRF pair. */
export function makeRequest(
  path: string,
  config: SessionConfig,
  options: RequestOptions = {},
): Request {
  const csrfToken = options.csrfToken === undefined ? createCsrfToken() : options.csrfToken;
  const state = options.state === undefined ? makeState(config) : options.state;
  const cookies: string[] = [];
  if (state) {
    cookies.push(`${config.sessionCookieName}=${sealSession(state, config)}`);
  }
  if (csrfToken) {
    cookies.push(`${config.csrfCookieName}=${csrfToken}`);
  }

  const headers: Record<string, string> = { ...options.extraHeaders };
  if (cookies.length > 0) {
    headers["cookie"] = cookies.join("; ");
  }
  if (options.origin !== null) {
    headers["origin"] = options.origin ?? expectedOrigin(config);
  }
  const headerToken = options.headerToken === undefined ? csrfToken : options.headerToken;
  if (headerToken) {
    headers[csrfHeaderName] = headerToken;
  }

  return new Request(`https://app.example.test${path}`, {
    method: options.method ?? "GET",
    headers,
    ...(options.body === undefined ? {} : { body: options.body }),
  });
}

export function cookieNames(config: SessionConfig): string[] {
  return [sessionCookieNameFor(config.surface), csrfCookieNameFor(config.surface)];
}
