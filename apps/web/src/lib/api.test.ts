import { createSessionConfig, csrfCookieNameFor, csrfHeaderName } from "@gigshive/session";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CsrfTokenError, csrfHeaders } from "./api";

const config = createSessionConfig({
  surface: "web",
  env: {
    API_BASE_URL: "https://api.example.test/api/v1",
    PUBLIC_SITE_URL: "https://app.example.test",
    SESSION_SECRET: "session-secret-for-tests-0123456789",
    NODE_ENV: "test",
  },
});

function clearCsrfCookie(): void {
  document.cookie = `${csrfCookieNameFor("web")}=; Max-Age=0; path=/`;
}

afterEach(() => {
  clearCsrfCookie();
  vi.unstubAllGlobals();
});

describe("csrfHeaders", () => {
  it("reuses the readable CSRF cookie without another request", async () => {
    document.cookie = `${config.csrfCookieName}=cookie-token; path=/`;
    const fetchFn = vi.fn();
    vi.stubGlobal("fetch", fetchFn);

    expect(await csrfHeaders()).toEqual({ [csrfHeaderName]: "cookie-token" });
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("bootstraps a token once when the cookie is missing", async () => {
    const fetchFn = vi.fn(
      async () =>
        new Response(JSON.stringify({ data: { csrfToken: "fresh-token" } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );
    vi.stubGlobal("fetch", fetchFn);

    expect(await csrfHeaders()).toEqual({ [csrfHeaderName]: "fresh-token" });
    expect(fetchFn).toHaveBeenCalledWith("/api/session/csrf", {
      cache: "no-store",
      credentials: "same-origin",
    });
  });

  it("throws fixed public copy when bootstrap fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 503 })),
    );

    await expect(csrfHeaders()).rejects.toEqual(
      expect.objectContaining({
        name: "CsrfTokenError",
        message: "The secure form could not be prepared. Please try again.",
      }),
    );
    await expect(csrfHeaders()).rejects.toBeInstanceOf(CsrfTokenError);
  });
});
