import { ApiError, NetworkError } from "@gigshive/api-client";
import { type ErrorCopyKind } from "@gigshive/shared/error-copy";
import { describe, expect, it } from "vitest";

import { catalogCopy } from "../copy/catalog";
import { describeCatalogError } from "./error-copy";

const kinds: ErrorCopyKind[] = [
  "auth",
  "forbidden",
  "notFound",
  "conflict",
  "validation",
  "rateLimit",
  "server",
  "network",
  "unknown",
];

describe("describeCatalogError", () => {
  it.each(kinds)("maps %s to fixed feature copy", (kind) => {
    const issue = describeCatalogError({ kind });

    expect(issue.kind).toBe(kind);
    expect(issue.title).toBe(catalogCopy.errors.kinds[kind].title);
    expect(issue.description).toBe(catalogCopy.errors.kinds[kind].description);
  });

  it("ignores backend messages and codes on 5xx", () => {
    const issue = describeCatalogError(
      new ApiError({
        status: 500,
        code: "RAW_CODE",
        message: "RAW BACKEND MESSAGE",
        requestId: "req_5xx",
      }),
    );

    expect(issue.reference).toBe("req_5xx");
    expect(JSON.stringify(issue)).not.toContain("RAW");
  });

  it("keeps Retry-After for 429 only", () => {
    const issue = describeCatalogError(
      new ApiError({
        status: 429,
        code: "TOO_MANY_REQUESTS",
        message: "RAW BACKEND MESSAGE",
        requestId: "req_429",
        retryAfterSeconds: 2,
      }),
    );

    expect(issue.retryAfterSeconds).toBe(2);
    expect(issue.reference).toBeUndefined();
    expect(issue.actionLabel).toBe(catalogCopy.errors.kinds.rateLimit.actionLabel);
  });

  it("maps network and unknown failures to retryable copy", () => {
    expect(describeCatalogError(new NetworkError("req_network")).kind).toBe("network");
    expect(describeCatalogError(new Error("RAW BACKEND MESSAGE")).kind).toBe("unknown");
    expect(JSON.stringify(describeCatalogError(new Error("RAW BACKEND MESSAGE")))).not.toContain(
      "RAW",
    );
  });

  it("omits an action where retrying or signing in cannot recover", () => {
    const nonRetryable = ["auth", "forbidden", "notFound", "validation"] as const;

    for (const kind of nonRetryable) {
      expect(describeCatalogError({ kind }).actionLabel).toBeUndefined();
    }
  });

  it("uses fixed copy actions for retryable failures", () => {
    const retryable = ["conflict", "rateLimit", "server", "network", "unknown"] as const;

    for (const kind of retryable) {
      const copy = catalogCopy.errors.kinds[kind];
      const expected = "actionLabel" in copy ? copy.actionLabel : undefined;

      expect(describeCatalogError({ kind }).actionLabel).toBe(expected);
    }
  });
});
