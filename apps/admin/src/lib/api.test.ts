import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CsrfTokenError, csrfHeaders, registerUnauthorizedHandler, sessionClient } from "./api";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("admin api client", () => {
  beforeEach(() => {
    document.cookie = "gh_csrf_admin=; Max-Age=0";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.cookie = "gh_csrf_admin=; Max-Age=0";
  });

  it("reuses the readable CSRF cookie without another request", async () => {
    document.cookie = "gh_csrf_admin=cookie-token";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(csrfHeaders()).resolves.toEqual({ "x-csrf-token": "cookie-token" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("bootstraps a missing CSRF token from the same-origin route", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ data: { csrfToken: "boot-token" } }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(csrfHeaders()).resolves.toEqual({ "x-csrf-token": "boot-token" });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/session/csrf",
      expect.objectContaining({ cache: "no-store", credentials: "same-origin" }),
    );
  });

  it("throws fixed copy when CSRF bootstrap fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({}, 503)),
    );

    await expect(csrfHeaders()).rejects.toBeInstanceOf(CsrfTokenError);
  });

  it("calls the registered handler once on a 401 and honours the opt-out", async () => {
    const handler = vi.fn();
    const cleanup = registerUnauthorizedHandler(handler);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(
          { error: { code: "UNAUTHENTICATED", message: "raw", details: null, request_id: "r" } },
          401,
        ),
      ),
    );

    await expect(sessionClient.get("/me", { skipUnauthorizedHandler: true })).rejects.toMatchObject(
      {
        status: 401,
      },
    );
    expect(handler).not.toHaveBeenCalled();

    await expect(sessionClient.get("/me")).rejects.toMatchObject({ status: 401 });
    expect(handler).toHaveBeenCalledOnce();
    cleanup();
  });

  it("replaces the handler rather than accumulating callbacks", async () => {
    const first = vi.fn();
    const second = vi.fn();
    const cleanupFirst = registerUnauthorizedHandler(first);
    const cleanupSecond = registerUnauthorizedHandler(second);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(
          { error: { code: "UNAUTHENTICATED", message: "raw", details: null, request_id: "r" } },
          401,
        ),
      ),
    );

    await expect(sessionClient.get("/me")).rejects.toMatchObject({ status: 401 });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
    cleanupFirst();
    cleanupSecond();
  });
});
