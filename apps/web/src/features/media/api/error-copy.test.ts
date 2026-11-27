import { ApiError } from "@gigshive/api-client";
import { type ErrorCopyKind } from "@gigshive/shared/error-copy";
import { describe, expect, it } from "vitest";

import { mediaCopy } from "../copy/media";
import { describeMediaError } from "./error-copy";
import { MediaFetchError } from "./media";

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

describe("describeMediaError", () => {
  it.each(kinds)("maps %s to fixed feature copy", (kind) => {
    const issue = describeMediaError({ kind });

    expect(issue.kind).toBe(kind);
    expect(issue.title).toBe(mediaCopy.errors.kinds[kind].title);
    expect(issue.description).toBe(mediaCopy.errors.kinds[kind].description);
  });

  it("ignores backend messages and codes on 422", () => {
    const issue = describeMediaError(
      new ApiError({
        status: 422,
        code: "RAW_CODE",
        message: "RAW BACKEND MESSAGE",
        details: { file: ["RAW DETAIL"] },
        requestId: "req_1",
      }),
    );

    expect(issue.fieldErrors.file).toBe(mediaCopy.uploader.fileInvalid);
    expect(JSON.stringify(issue)).not.toContain("RAW");
  });

  it("exposes only a support reference for 5xx", () => {
    const issue = describeMediaError(
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
    const issue = describeMediaError(
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
  });

  it("maps private-file read failures by status without a raw message", () => {
    expect(describeMediaError(new MediaFetchError(404)).kind).toBe("notFound");
    expect(describeMediaError(new MediaFetchError(503)).kind).toBe("server");
    expect(describeMediaError(new MediaFetchError(null)).kind).toBe("unknown");
  });

  it("omits an action where retrying or signing in cannot recover", () => {
    const nonRetryable = ["auth", "forbidden", "notFound", "validation"] as const;

    for (const kind of nonRetryable) {
      expect(describeMediaError({ kind }).actionLabel).toBeUndefined();
    }
  });

  it("uses fixed copy actions for retryable failures", () => {
    const retryable = ["conflict", "rateLimit", "server", "network", "unknown"] as const;

    for (const kind of retryable) {
      const copy = mediaCopy.errors.kinds[kind];
      const expected = "actionLabel" in copy ? copy.actionLabel : undefined;

      expect(describeMediaError({ kind }).actionLabel).toBe(expected);
    }
  });
});
