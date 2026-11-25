import { describe, expect, it, vi } from "vitest";

import { createApiClient } from "./client";
import { ApiError, NetworkError } from "./errors";

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

function clientFor(
  response: Response | (() => Response),
  options: Partial<Parameters<typeof createApiClient>[0]> = {},
) {
  // A Response body can be read once, so each call needs a fresh instance.
  const makeResponse = typeof response === "function" ? response : () => response;
  const fetchFn = vi.fn<typeof fetch>().mockImplementation(async () => makeResponse());
  const client = createApiClient({
    baseUrl: "https://api.example.test/api/v1/",
    fetchFn,
    ...options,
  });
  return { client, fetchFn };
}

function headerOf(init: RequestInit | undefined, name: string): string | undefined {
  const headers = new Headers(init?.headers);
  return headers.get(name) ?? undefined;
}

describe("createApiClient request building", () => {
  it("normalises the base path and skips empty query values", async () => {
    const { client, fetchFn } = clientFor(jsonResponse({ data: { id: "1" } }));

    await client.get("workers", {
      query: { q: "design", category: "all", cursor: null, per_page: undefined, blank: "" },
    });

    expect(fetchFn.mock.calls[0]?.[0]).toBe(
      "https://api.example.test/api/v1/workers?q=design&category=all",
    );
    const init = fetchFn.mock.calls[0]?.[1];
    expect(init?.method).toBe("GET");
    expect(init?.credentials).toBe("same-origin");
    expect(headerOf(init, "Accept")).toBe("application/json");
    expect(headerOf(init, "X-Request-Id")).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it("sends caller headers, bearer headers and the idempotency key only when supplied", async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => jsonResponse({ data: { id: "1" } }));
    const client = createApiClient({
      baseUrl: "/api/proxy",
      fetchFn,
      getHeaders: () => ({ Authorization: "Bearer server-token" }),
    });

    await client.post(
      "/fund",
      { amount: 100 },
      {
        headers: { "X-Custom": "yes" },
        idempotencyKey: "intent-123",
      },
    );

    const init = fetchFn.mock.calls[0]?.[1];
    expect(fetchFn.mock.calls[0]?.[0]).toBe("/api/proxy/fund");
    expect(headerOf(init, "Authorization")).toBe("Bearer server-token");
    expect(headerOf(init, "X-Custom")).toBe("yes");
    expect(headerOf(init, "Idempotency-Key")).toBe("intent-123");
    expect(headerOf(init, "Content-Type")).toBe("application/json");
    expect(init?.body).toBe('{"amount":100}');

    await client.get("/no-key");
    expect(headerOf(fetchFn.mock.calls[1]?.[1], "Idempotency-Key")).toBeUndefined();
    expect(headerOf(fetchFn.mock.calls[1]?.[1], "Content-Type")).toBeUndefined();
  });

  it("unwraps the single envelope for every write verb", async () => {
    const { client } = clientFor(() => jsonResponse({ data: { id: "ok" } }));

    await expect(client.post("/a", {})).resolves.toEqual({ data: { id: "ok" } });
    await expect(client.patch("/a", {})).resolves.toEqual({ data: { id: "ok" } });
    await expect(client.put("/a", {})).resolves.toEqual({ data: { id: "ok" } });
    await expect(client.delete("/a")).resolves.toEqual({ data: { id: "ok" } });
  });

  it("unwraps collection envelopes with the API-supplied meta", async () => {
    const paged = clientFor(
      jsonResponse({ data: [{ id: "1" }], meta: { next_cursor: "2", per_page: 1 } }),
    );
    await expect(paged.client.getCollection("/workers")).resolves.toEqual({
      data: [{ id: "1" }],
      meta: { next_cursor: "2", per_page: 1 },
    });
  });

  it("rejects collection envelopes without a valid meta instead of inventing one", async () => {
    const missing = clientFor(jsonResponse({ data: [{ id: "2" }] }));
    await expect(missing.client.getCollection("/workers")).rejects.toMatchObject({
      code: "MALFORMED_RESPONSE",
      status: 200,
    });

    const invalid = clientFor(
      jsonResponse({ data: [{ id: "3" }], meta: { next_cursor: "2", per_page: "twenty" } }),
    );
    await expect(invalid.client.postCollection("/workers", {})).rejects.toMatchObject({
      code: "MALFORMED_RESPONSE",
    });
  });

  it("returns null data for 204 responses without parsing a body", async () => {
    const { client } = clientFor(new Response(null, { status: 204 }));
    await expect(client.delete("/a")).resolves.toEqual({ data: null });
  });
});

describe("createApiClient error mapping", () => {
  it("calls onUnauthorized once for 401 and maps the error code", async () => {
    const onUnauthorized = vi.fn();
    const { client } = clientFor(
      jsonResponse(
        { error: { code: "UNAUTHENTICATED", message: "Sign in", request_id: "req-1" } },
        { status: 401 },
      ),
      { onUnauthorized },
    );

    await expect(client.get("/me")).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      code: "UNAUTHENTICATED",
      kind: "auth",
      requestId: "req-1",
    });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("lets credential checks skip the global 401 handler", async () => {
    const onUnauthorized = vi.fn();
    const response = () =>
      jsonResponse(
        { error: { code: "INVALID_CREDENTIALS", message: "Sign in", request_id: "req-login" } },
        { status: 401 },
      );
    const { client } = clientFor(response, { onUnauthorized });

    await expect(
      client.post("/auth/login", { email: "a@example.test" }, { skipUnauthorizedHandler: true }),
    ).rejects.toMatchObject({ status: 401, code: "INVALID_CREDENTIALS" });
    expect(onUnauthorized).not.toHaveBeenCalled();

    await expect(client.post("/auth/verify-otp", { code: "123456" })).rejects.toMatchObject({
      status: 401,
    });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("maps 422 details to field errors and 429 to a retry hint", async () => {
    const validation = clientFor(
      jsonResponse(
        {
          error: {
            code: "VALIDATION_FAILED",
            message: "Invalid",
            details: { email: ["Required"] },
            request_id: "req-2",
          },
        },
        { status: 422 },
      ),
    );
    try {
      await validation.client.post("/register", {});
      expect.unreachable("expected a validation error");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      const apiError = error as ApiError;
      expect(apiError.kind).toBe("validation");
      expect(apiError.fieldErrors).toEqual({ email: ["Required"] });
    }

    const rateLimited = clientFor(
      jsonResponse(
        { error: { code: "TOO_MANY_REQUESTS", message: "Slow down", request_id: "req-3" } },
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "30" } },
      ),
    );
    try {
      await rateLimited.client.get("/jobs");
      expect.unreachable("expected a rate limit error");
    } catch (error) {
      const apiError = error as ApiError;
      expect(apiError.kind).toBe("rateLimit");
      expect(apiError.retryAfterSeconds).toBe(30);
    }
  });

  it("accepts an HTTP-date Retry-After header and ignores unparseable values", async () => {
    const retryAt = new Date(Date.now() + 45_000);
    const dated = clientFor(
      jsonResponse(
        { error: { code: "TOO_MANY_REQUESTS", message: "Slow down", request_id: "req-date" } },
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": retryAt.toUTCString(),
          },
        },
      ),
    );
    try {
      await dated.client.get("/jobs");
      expect.unreachable("expected a rate limit error");
    } catch (error) {
      const apiError = error as ApiError;
      expect(apiError.retryAfterSeconds).toBeGreaterThanOrEqual(44);
      expect(apiError.retryAfterSeconds).toBeLessThanOrEqual(45);
    }

    const nonsense = clientFor(
      jsonResponse(
        { error: { code: "TOO_MANY_REQUESTS", message: "Slow down", request_id: "req-nope" } },
        {
          status: 429,
          headers: { "Content-Type": "application/json", "Retry-After": "later" },
        },
      ),
    );
    await expect(nonsense.client.get("/jobs")).rejects.toMatchObject({
      retryAfterSeconds: null,
    });
  });

  it("classifies every documented status without exposing raw codes as copy", () => {
    const kinds: Array<[number, string]> = [
      [401, "auth"],
      [403, "forbidden"],
      [404, "notFound"],
      [409, "conflict"],
      [422, "validation"],
      [429, "rateLimit"],
      [500, "server"],
      [400, "unknown"],
    ];
    for (const [status, kind] of kinds) {
      const error = new ApiError({
        status,
        code: "SECRET_INTERNAL",
        message: "Fallback",
        requestId: "r",
      });
      expect(error.kind).toBe(kind);
      expect(error.message).toBe("Fallback");
      expect(error.fieldErrors).toEqual({});
    }
  });

  it("falls back to HTTP status and the response request id for malformed errors", async () => {
    const { client } = clientFor(
      new Response("not json", { status: 503, statusText: "Service Unavailable" }),
    );
    try {
      await client.get("/jobs");
      expect.unreachable("expected a server error");
    } catch (error) {
      const apiError = error as ApiError;
      expect(apiError.code).toBe("HTTP_503");
      expect(apiError.kind).toBe("server");
      expect(apiError.requestId).toMatch(/^[0-9a-f-]{36}$/i);
    }
  });

  it("rejects unreadable success payloads with MALFORMED_RESPONSE", async () => {
    const { client } = clientFor(new Response("nope", { status: 200 }));
    await expect(client.get("/jobs")).rejects.toMatchObject({
      code: "MALFORMED_RESPONSE",
      status: 200,
    });
  });

  it("captures the server request id when the error body omits one", async () => {
    const response = jsonResponse(
      { error: { code: "BAD", message: "Bad" } },
      { status: 400, headers: { "Content-Type": "application/json", "X-Request-Id": "server-9" } },
    );
    const { client } = clientFor(response);
    await expect(client.get("/jobs")).rejects.toMatchObject({
      requestId: "server-9",
      code: "BAD",
    });
  });

  it("maps fetch failures to fixed NetworkError copy with the raw cause hidden", async () => {
    const cause = new Error("offline: db-password=secret");
    const fetchFn = vi.fn<typeof fetch>().mockRejectedValue(cause);
    const client = createApiClient({ baseUrl: "/api/proxy", fetchFn });

    try {
      await client.get("/jobs");
      expect.unreachable("expected a network error");
    } catch (error) {
      expect(error).toBeInstanceOf(NetworkError);
      const networkError = error as NetworkError;
      expect(networkError.kind).toBe("network");
      expect(networkError.requestId).toMatch(/^[0-9a-f-]{36}$/i);
      expect(networkError.message).toBe("The network request could not be completed.");
      expect(networkError.message).not.toContain("db-password");
      expect(networkError.cause).toBe(cause);
    }
  });
});

describe("createApiClient upload", () => {
  it("posts multipart data without a JSON content type", async () => {
    const { client, fetchFn } = clientFor(jsonResponse({ data: { id: "media-1" } }));
    const form = new FormData();
    form.append("file", new Blob(["x"]), "x.txt");

    await expect(client.upload("/media", form, { idempotencyKey: "key-1" })).resolves.toEqual({
      id: "media-1",
    });
    const init = fetchFn.mock.calls[0]?.[1];
    expect(init?.body).toBe(form);
    expect(headerOf(init, "Content-Type")).toBeUndefined();
    expect(headerOf(init, "Idempotency-Key")).toBe("key-1");
  });

  it("rejects a non-JSON success response with MALFORMED_RESPONSE", async () => {
    const { client } = clientFor(new Response("<html>oops</html>", { status: 200 }));
    const form = new FormData();

    await expect(client.upload("/media", form)).rejects.toMatchObject({
      code: "MALFORMED_RESPONSE",
      status: 200,
    });
  });

  it("honours skipUnauthorizedHandler on uploads", async () => {
    const onUnauthorized = vi.fn();
    const { client } = clientFor(
      jsonResponse(
        { error: { code: "UNAUTHENTICATED", message: "Sign in", request_id: "req-upload" } },
        { status: 401 },
      ),
      { onUnauthorized },
    );
    const form = new FormData();

    await expect(
      client.upload("/media", form, { skipUnauthorizedHandler: true }),
    ).rejects.toMatchObject({ status: 401, code: "UNAUTHENTICATED" });
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it("maps upload errors the same way as JSON requests", async () => {
    const { client } = clientFor(
      jsonResponse(
        { error: { code: "FORBIDDEN", message: "No", request_id: "req-4" } },
        { status: 403 },
      ),
    );
    const form = new FormData();
    await expect(client.upload("/media", form)).rejects.toMatchObject({
      code: "FORBIDDEN",
      kind: "forbidden",
      requestId: "req-4",
    });
  });
});
