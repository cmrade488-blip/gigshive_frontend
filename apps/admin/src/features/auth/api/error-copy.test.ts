import { ApiError, NetworkError } from "@gigshive/api-client";
import { describe, expect, it } from "vitest";

import { describeStaffAuthError } from "./error-copy";

function apiError(status: number, details: Record<string, string[]> = {}): ApiError {
  return new ApiError({
    status,
    code: "BACKEND_CODE",
    message: "raw backend message",
    details,
    requestId: "req_1",
    retryAfterSeconds: status === 429 ? 12 : null,
  });
}

describe("describeStaffAuthError", () => {
  it("maps every HTTP kind without exposing the backend message", () => {
    expect(describeStaffAuthError(apiError(401)).kind).toBe("auth");
    expect(describeStaffAuthError(apiError(403)).kind).toBe("forbidden");
    expect(describeStaffAuthError(apiError(404)).kind).toBe("notFound");
    expect(describeStaffAuthError(apiError(409)).kind).toBe("conflict");
    expect(describeStaffAuthError(apiError(422)).kind).toBe("validation");
    expect(describeStaffAuthError(apiError(429)).kind).toBe("rateLimit");
    expect(describeStaffAuthError(apiError(503)).kind).toBe("server");
    expect(describeStaffAuthError(new NetworkError("req_2")).kind).toBe("network");
    expect(describeStaffAuthError(new Error("raw backend message")).kind).toBe("unknown");
    expect(JSON.stringify(describeStaffAuthError(apiError(401)))).not.toContain(
      "raw backend message",
    );
  });

  it("maps 422 details onto known form fields only", () => {
    const issue = describeStaffAuthError(
      apiError(422, { email: ["x"], password: ["x"], code: ["x"], unknown: ["x"] }),
    );

    expect(issue.fieldErrors).toEqual({
      email: "Enter a valid work email address.",
      password: "Enter your password.",
      otp: "Enter the 6-digit code.",
    });
  });

  it("keeps a support reference for server errors and retry seconds for 429", () => {
    expect(describeStaffAuthError(apiError(503)).reference).toBe("req_1");
    expect(describeStaffAuthError(apiError(429)).retryAfterSeconds).toBe(12);
  });
});
