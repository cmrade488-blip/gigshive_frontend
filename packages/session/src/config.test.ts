import { describe, expect, it } from "vitest";

import { createSessionConfig, csrfCookieNameFor, sessionCookieNameFor } from "./config";

const baseEnv = {
  API_BASE_URL: "https://api.example.test/api/v1/",
  PUBLIC_SITE_URL: "https://app.example.test/",
  SESSION_SECRET: "session-secret-for-tests-0123456789",
  NODE_ENV: "production",
};

describe("createSessionConfig", () => {
  it("uses the decided lifetimes for each surface", () => {
    const web = createSessionConfig({ surface: "web", env: baseEnv });
    const admin = createSessionConfig({ surface: "admin", env: baseEnv });

    expect(web.idleMs).toBe(7 * 24 * 60 * 60 * 1000);
    expect(web.absoluteMs).toBe(30 * 24 * 60 * 60 * 1000);
    expect(admin.idleMs).toBe(30 * 60 * 1000);
    expect(admin.absoluteMs).toBe(8 * 60 * 60 * 1000);
  });

  it("normalises URLs and keeps cookies separate per app", () => {
    const web = createSessionConfig({ surface: "web", env: baseEnv });
    const admin = createSessionConfig({ surface: "admin", env: baseEnv });

    expect(web.apiBaseUrl).toBe("https://api.example.test/api/v1");
    expect(web.siteUrl).toBe("https://app.example.test");
    expect(web.sessionCookieName).toBe("gh_session_web");
    expect(admin.sessionCookieName).toBe("gh_session_admin");
    expect(web.csrfCookieName).toBe("gh_csrf_web");
    expect(csrfCookieNameFor("admin")).toBe("gh_csrf_admin");
    expect(sessionCookieNameFor("web")).toBe("gh_session_web");
  });

  it("requires a strong secret in production", () => {
    expect(() =>
      createSessionConfig({ surface: "web", env: { ...baseEnv, SESSION_SECRET: "short" } }),
    ).toThrow(/SESSION_SECRET/);
    expect(() =>
      createSessionConfig({ surface: "web", env: { ...baseEnv, SESSION_SECRET: undefined } }),
    ).toThrow();
  });

  it("requires the API and site URLs", () => {
    expect(() =>
      createSessionConfig({ surface: "web", env: { ...baseEnv, API_BASE_URL: undefined } }),
    ).toThrow(/API_BASE_URL/);
    expect(() =>
      createSessionConfig({ surface: "web", env: { ...baseEnv, PUBLIC_SITE_URL: undefined } }),
    ).toThrow(/PUBLIC_SITE_URL/);
  });

  it("allows a local-only fallback outside production", () => {
    const dev = createSessionConfig({
      surface: "web",
      env: {
        ...baseEnv,
        NODE_ENV: "development",
        SESSION_SECRET: undefined,
        PUBLIC_SITE_URL: "http://localhost:3000",
      },
    });
    expect(dev.secret.length).toBeGreaterThan(32);
    expect(dev.secureCookie).toBe(false);
    expect(dev.production).toBe(false);
  });
});
