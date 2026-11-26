import { describe, expect, it } from "vitest";

import { authCopy } from "../copy/auth";
import { describeAuthError } from "./error-copy";
import { makeTestApiError } from "./test-error";

describe("describeAuthError", () => {
  it("maps 422 details to fixed field copy and ignores backend messages", () => {
    const issue = describeAuthError(
      makeTestApiError({
        status: 422,
        code: "VALIDATION_FAILED",
        message: "raw database message: email already used",
        details: {
          email: ["raw email detail"],
          password: ["raw password detail"],
          phone: ["raw phone detail"],
          code: ["raw otp detail"],
          unrelated: ["raw unknown detail"],
        },
        requestId: "req_1",
      }),
    );

    expect(issue.kind).toBe("validation");
    expect(issue.fieldErrors).toEqual({
      email: authCopy.errors.email,
      password: authCopy.errors.password,
      phone: authCopy.errors.phone,
      otp: authCopy.errors.code,
    });
    expect(JSON.stringify(issue)).not.toContain("raw");
  });

  it("maps password-reset and change-password details to fixed copy", () => {
    const issue = describeAuthError(
      makeTestApiError({
        status: 422,
        code: "VALIDATION_FAILED",
        message: "raw password detail",
        details: {
          current_password: ["raw current detail"],
          token: ["raw token detail"],
        },
        requestId: "req_password",
      }),
    );

    expect(issue.fieldErrors).toEqual({
      current_password: authCopy.errors.currentPassword,
      token: authCopy.errors.token,
    });
    expect(JSON.stringify(issue)).not.toContain("raw");
  });

  it("keeps the retry window from a 429", () => {
    const issue = describeAuthError(
      makeTestApiError({
        status: 429,
        code: "TOO_MANY_REQUESTS",
        message: "raw rate text",
        requestId: "req_2",
        retryAfterSeconds: 17,
      }),
    );

    expect(issue.kind).toBe("rateLimit");
    expect(issue.retryAfterSeconds).toBe(17);
    expect(issue.copy.title).toBe("Please wait a moment");
    expect(issue.reference).toBeUndefined();
  });

  it("exposes a support reference only for server errors", () => {
    const issue = describeAuthError(
      makeTestApiError({
        status: 503,
        code: "SERVER_ERROR",
        message: "connection string leaked",
        requestId: "req_3",
      }),
    );

    expect(issue.kind).toBe("server");
    expect(issue.reference).toBe("req_3");
    expect(issue.copy.description).toBe(authCopy.errors.serverWithReference);
    expect(JSON.stringify(issue)).not.toContain("connection string leaked");
  });

  it.each([
    [401, "auth"],
    [403, "forbidden"],
    [404, "notFound"],
    [409, "conflict"],
    [422, "validation"],
    [429, "rateLimit"],
    [500, "server"],
    [400, "unknown"],
  ] as const)("maps status %i to %s", (status, kind) => {
    expect(describeAuthError({ status }).kind).toBe(kind);
  });

  it.each([
    [null, "unknown"],
    ["db-password", "unknown"],
    [{ kind: "network" }, "network"],
    [{ kind: "not-a-kind", status: 503 }, "server"],
  ] as const)("maps %j to %s", (error, kind) => {
    expect(describeAuthError(error).kind).toBe(kind);
  });
});
