import { describe, expect, it } from "vitest";

import { createCsrfResponse, createCsrfToken, isMutationMethod, verifyCsrf } from "./csrf";
import { makeConfig, makeRequest } from "./test-helpers";

describe("CSRF protection", () => {
  const config = makeConfig();

  it("generates a high-entropy token", () => {
    const first = createCsrfToken();
    expect(first).not.toBe(createCsrfToken());
    expect(first).toMatch(/^[A-Za-z0-9_-]{40,}$/);
  });

  it("recognises every state-changing method", () => {
    for (const method of ["POST", "PATCH", "PUT", "DELETE"]) {
      expect(isMutationMethod(method)).toBe(true);
    }
    for (const method of ["GET", "HEAD", "OPTIONS"]) {
      expect(isMutationMethod(method)).toBe(false);
    }
  });

  it("accepts a matching token and Origin", () => {
    expect(verifyCsrf(makeRequest("/api/proxy/jobs", config, { method: "POST" }), config)).toBe(
      true,
    );
  });

  it("rejects a missing, mismatched or replayed token", () => {
    expect(verifyCsrf(makeRequest("/api/proxy/jobs", config, { csrfToken: null }), config)).toBe(
      false,
    );
    expect(
      verifyCsrf(makeRequest("/api/proxy/jobs", config, { headerToken: "wrong" }), config),
    ).toBe(false);
    expect(verifyCsrf(new Request("https://app.example.test/api/proxy/jobs"), config)).toBe(false);
  });

  it("rejects a missing or foreign Origin", () => {
    expect(verifyCsrf(makeRequest("/api/proxy/jobs", config, { origin: null }), config)).toBe(
      false,
    );
    expect(
      verifyCsrf(
        makeRequest("/api/proxy/jobs", config, { origin: "https://evil.example.test" }),
        config,
      ),
    ).toBe(false);
    expect(
      verifyCsrf(makeRequest("/api/proxy/jobs", config, { origin: "not a url" }), config),
    ).toBe(false);
  });

  it("plants the readable token on GET /api/session/csrf", async () => {
    const response = createCsrfResponse(config);
    const body = (await response.json()) as { data: { csrfToken: string } };
    const setCookie = response.headers.get("set-cookie") ?? "";

    expect(response.status).toBe(200);
    expect(body.data.csrfToken).toMatch(/^[A-Za-z0-9_-]{40,}$/);
    expect(setCookie).toContain(`${config.csrfCookieName}=${body.data.csrfToken}`);
    expect(setCookie).toContain("SameSite=Lax");
    expect(setCookie).not.toContain("HttpOnly");
  });
});
