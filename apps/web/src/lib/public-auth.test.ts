import {
  createCsrfToken,
  createSessionConfig,
  csrfHeaderName,
  expectedOrigin,
  type SessionConfig,
} from "@gigshive/session";
import { describe, expect, it, vi } from "vitest";

import { forwardPublicAuth } from "./public-auth";

const config: SessionConfig = createSessionConfig({
  surface: "web",
  env: {
    API_BASE_URL: "https://api.example.test/api/v1",
    PUBLIC_SITE_URL: "https://app.example.test",
    SESSION_SECRET: "session-secret-for-tests-0123456789",
    NODE_ENV: "production",
  },
});

const csrfToken = createCsrfToken();

function makeRequest(
  options: {
    method?: string;
    body?: string;
    csrf?: boolean;
    origin?: string | null;
  } = {},
): Request {
  const headers: Record<string, string> = {};
  if (options.origin !== null) {
    headers["origin"] = options.origin ?? expectedOrigin(config);
  }
  if (options.csrf !== false) {
    headers["cookie"] = `${config.csrfCookieName}=${csrfToken}`;
    headers[csrfHeaderName] = csrfToken;
  }

  return new Request("https://app.example.test/api/auth/register", {
    method: options.method ?? "POST",
    headers,
    ...(options.body === undefined ? {} : { body: options.body }),
  });
}

function mockFetch(status = 201, headers: Record<string, string> = {}) {
  const fn = vi.fn(
    async () =>
      new Response(JSON.stringify({ data: {} }), {
        status,
        headers: { "Content-Type": "application/json", ...headers },
      }),
  );
  return { fn, fetchFn: fn as unknown as typeof fetch };
}

describe("forwardPublicAuth", () => {
  it("forwards a validated JSON POST without forwarding a session token", async () => {
    const body = JSON.stringify({ email: "person@example.com", password: "long-enough" });
    const { fn, fetchFn } = mockFetch(201, { "X-Request-Id": "upstream-request" });

    const response = await forwardPublicAuth(makeRequest({ body }), "/auth/register", {
      config,
      fetchFn,
    });

    expect(response.status).toBe(201);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-request-id")).toBe("upstream-request");
    expect(fn).toHaveBeenCalledOnce();

    const [url, init] = fn.mock.calls[0] as unknown as [string, RequestInit];
    const headers = new Headers(init.headers);
    expect(url).toBe("https://api.example.test/api/v1/auth/register");
    expect(init.method).toBe("POST");
    expect(init.body).toBe(body);
    expect(headers.has("authorization")).toBe(false);
    expect(headers.has(csrfHeaderName)).toBe(false);
  });

  it("rejects a missing CSRF pair before calling the API", async () => {
    const { fn, fetchFn } = mockFetch();
    const response = await forwardPublicAuth(makeRequest({ csrf: false }), "/auth/register", {
      config,
      fetchFn,
    });

    expect(response.status).toBe(403);
    expect(fn).not.toHaveBeenCalled();
    const body = (await response.json()) as { error: { message: string } };
    expect(body.error.message).toBe("The request could not be completed.");
  });

  it("rejects methods other than POST", async () => {
    const { fn, fetchFn } = mockFetch();
    const response = await forwardPublicAuth(makeRequest({ method: "GET" }), "/auth/register", {
      config,
      fetchFn,
    });

    expect(response.status).toBe(405);
    expect(fn).not.toHaveBeenCalled();
  });

  it("rejects an oversized body before calling the API", async () => {
    const { fn, fetchFn } = mockFetch();
    const response = await forwardPublicAuth(
      makeRequest({ body: "x".repeat(64 * 1024 + 1) }),
      "/auth/register",
      { config, fetchFn },
    );

    expect(response.status).toBe(413);
    expect(fn).not.toHaveBeenCalled();
  });

  it("returns a fixed gateway error when the API is unreachable", async () => {
    const fetchFn = vi.fn(async () => {
      throw new Error("private upstream url");
    }) as unknown as typeof fetch;

    const response = await forwardPublicAuth(makeRequest(), "/auth/register", { config, fetchFn });

    expect(response.status).toBe(502);
    const text = await response.text();
    expect(text).not.toContain("private upstream url");
  });
});
