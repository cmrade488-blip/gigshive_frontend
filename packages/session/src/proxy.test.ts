import { describe, expect, it, vi } from "vitest";

import { unsealSession } from "./cookie";
import { handleLogout, handleProxy, handleSessionStart } from "./proxy";
import { makeConfig, makeRequest, makeState, NOW } from "./test-helpers";

function mockFetch(body: string, status = 200, headers: Record<string, string> = {}) {
  const fn = vi.fn(
    async (_input: RequestInfo | URL, _init?: RequestInit) =>
      new Response(status === 204 ? null : body, {
        status,
        headers: { "Content-Type": "application/json", ...headers },
      }),
  );
  return { fn, fetchFn: fn as unknown as typeof fetch };
}

function cookiesOf(response: Response): string[] {
  return response.headers.getSetCookie();
}

describe("handleProxy", () => {
  const config = makeConfig();
  const deps = { now: () => NOW };

  it("rejects a missing session without calling the API", async () => {
    const { fn, fetchFn } = mockFetch("{}");
    const request = makeRequest("/api/proxy/jobs", config, { state: null, csrfToken: null });

    const response = await handleProxy(request, config, { ...deps, fetchFn });

    expect(response.status).toBe(401);
    expect(fn).not.toHaveBeenCalled();
    expect(cookiesOf(response).join(" ")).toContain("Max-Age=0");
  });

  it("attaches the bearer token and forwards path, query, method and body", async () => {
    const { fn, fetchFn } = mockFetch('{"data":[]}');
    const request = makeRequest("/api/proxy/jobs?category=design", config, {
      state: makeState(config, { lastSeen: NOW - 10_000 }),
      method: "POST",
      body: '{"title":"A job"}',
      extraHeaders: { "Content-Type": "application/json", "Idempotency-Key": "key-1" },
    });

    const response = await handleProxy(request, config, { ...deps, fetchFn });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: [] });
    expect(fn).toHaveBeenCalledTimes(1);
    const [url, init] = fn.mock.calls[0] ?? [];
    expect(String(url)).toBe("https://api.example.test/api/v1/jobs?category=design");
    const headers = new Headers(init?.headers as HeadersInit);
    expect(headers.get("authorization")).toBe("Bearer sanctum-token");
    expect(headers.get("idempotency-key")).toBe("key-1");
    expect(init?.method).toBe("POST");
    expect(await new Response(init?.body as BodyInit).text()).toBe('{"title":"A job"}');
    expect(cookiesOf(response)).toHaveLength(0);
  });

  it("rotates the cookie after the idle threshold while keeping the absolute limit", async () => {
    const { fetchFn } = mockFetch("{}");
    const request = makeRequest("/api/proxy/me", config);

    const response = await handleProxy(request, config, { ...deps, fetchFn });
    const cookie = cookiesOf(response).find((value) => value.startsWith("gh_session_web=")) ?? "";
    const sealed = cookie.split(";")[0]?.split("=")[1] ?? "";

    expect(cookiesOf(response)).toHaveLength(1);
    expect(unsealSession(sealed, config)?.lastSeen).toBe(NOW);
  });

  it("rejects mutations with a missing CSRF header or a foreign Origin", async () => {
    const { fn, fetchFn } = mockFetch("{}");

    const noHeader = await handleProxy(
      makeRequest("/api/proxy/jobs", config, { method: "POST", headerToken: null }),
      config,
      { ...deps, fetchFn },
    );
    const foreignOrigin = await handleProxy(
      makeRequest("/api/proxy/jobs", config, {
        method: "POST",
        origin: "https://evil.example.test",
      }),
      config,
      { ...deps, fetchFn },
    );

    expect(noHeader.status).toBe(403);
    expect(foreignOrigin.status).toBe(403);
    expect(fn).not.toHaveBeenCalled();
  });

  it("clears the session when it is idle-expired or the API returns 401", async () => {
    const expired = makeState(config, { lastSeen: NOW - 8 * 24 * 60 * 60 * 1000 });
    const expiredResponse = await handleProxy(
      makeRequest("/api/proxy/me", config, { state: expired }),
      config,
      { ...deps, fetchFn: mockFetch("{}").fetchFn },
    );
    expect(expiredResponse.status).toBe(401);
    expect(cookiesOf(expiredResponse).join(" ")).toContain("Max-Age=0");

    const { fetchFn } = mockFetch("{}", 401);
    const unauthorized = await handleProxy(makeRequest("/api/proxy/me", config), config, {
      ...deps,
      fetchFn,
    });
    expect(unauthorized.status).toBe(401);
    expect(unauthorized.headers.get("x-session-expired")).toBe("1");
    expect(cookiesOf(unauthorized).join(" ")).toContain("Max-Age=0");
  });

  it("rejects unsafe paths and maps network failures to 502", async () => {
    const traversal = await handleProxy(makeRequest("/api/proxy/%2e%2e/admin/me", config), config, {
      ...deps,
      fetchFn: mockFetch("{}").fetchFn,
    });
    expect(traversal.status).toBe(400);

    const offline = vi.fn(async () => {
      throw new Error("offline");
    }) as unknown as typeof fetch;
    const response = await handleProxy(makeRequest("/api/proxy/me", config), config, {
      ...deps,
      fetchFn: offline,
    });
    expect(response.status).toBe(502);
  });
});

describe("handleSessionStart", () => {
  const config = makeConfig();
  const deps = { now: () => NOW };

  it("seals the returned token and strips it from the browser response", async () => {
    const { fn, fetchFn } = mockFetch('{"data":{"id":"user_1"},"token":"new-token"}');
    const request = makeRequest("/api/auth/login", config, {
      method: "POST",
      body: '{"email":"a@example.test","password":"secret"}',
    });

    const response = await handleSessionStart(request, config, "/auth/login", { ...deps, fetchFn });

    expect(response.status).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toEqual({ data: { id: "user_1" } });
    const body = await new Response(fn.mock.calls[0]?.[1]?.body as BodyInit).text();
    expect(body).toContain("a@example.test");
    expect(JSON.stringify(responseBody)).not.toContain("new-token");

    const cookies = cookiesOf(response);
    const sealed = cookies
      .find((value) => value.startsWith("gh_session_web="))
      ?.split(";")[0]
      ?.split("=")[1];
    expect(unsealSession(sealed ?? null, config)?.token).toBe("new-token");
    expect(cookies.find((value) => value.startsWith("gh_csrf_web="))).toBeDefined();
  });

  it("passes through a pending staff step without opening a session", async () => {
    const { fetchFn } = mockFetch('{"data":{"otp_required":true}}');
    const response = await handleSessionStart(
      makeRequest("/api/auth/login", config, { method: "POST", body: "{}" }),
      config,
      "/admin/auth/login",
      { ...deps, fetchFn },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { otp_required: true } });
    expect(cookiesOf(response).some((value) => value.startsWith("gh_session_admin="))).toBe(false);
  });

  it("passes backend validation errors through unchanged", async () => {
    const { fetchFn } = mockFetch(
      '{"error":{"code":"VALIDATION_FAILED","message":"Invalid"}}',
      422,
    );
    const response = await handleSessionStart(
      makeRequest("/api/auth/login", config, { method: "POST", body: "{}" }),
      config,
      "/auth/login",
      { ...deps, fetchFn },
    );

    expect(response.status).toBe(422);
    expect(cookiesOf(response)).toHaveLength(0);
  });
});

describe("handleLogout", () => {
  const config = makeConfig();

  it("revokes on the API and clears both cookies", async () => {
    const { fn, fetchFn } = mockFetch("", 204);
    const response = await handleLogout(
      makeRequest("/api/auth/logout", config, { method: "POST" }),
      config,
      { now: () => NOW, fetchFn },
    );

    expect(response.status).toBe(204);
    expect(String(fn.mock.calls[0]?.[0])).toBe("https://api.example.test/api/v1/auth/logout");
    const headers = new Headers(fn.mock.calls[0]?.[1]?.headers as HeadersInit);
    expect(headers.get("authorization")).toBe("Bearer sanctum-token");
    expect(cookiesOf(response).join(" ")).toContain("gh_session_web=;");
    expect(cookiesOf(response).join(" ")).toContain("gh_csrf_web=;");
  });

  it("still clears locally when the API is unreachable", async () => {
    const offline = vi.fn(async () => {
      throw new Error("offline");
    }) as unknown as typeof fetch;
    const response = await handleLogout(
      makeRequest("/api/auth/logout", config, { method: "POST" }),
      config,
      { fetchFn: offline },
    );
    expect(response.status).toBe(204);
    expect(cookiesOf(response)).toHaveLength(2);
  });
});
