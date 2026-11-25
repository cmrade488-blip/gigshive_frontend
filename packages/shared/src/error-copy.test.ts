import { describe, expect, it } from "vitest";

import { errorCopy, errorCopyFor, type ErrorCopyKind } from "./error-copy";

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

describe("errorCopyFor", () => {
  it.each(kinds)("maps the %s kind to its public copy", (kind) => {
    expect(errorCopyFor({ kind })).toEqual(errorCopy[kind]);
  });

  it.each([
    [401, "auth"],
    [403, "forbidden"],
    [404, "notFound"],
    [409, "conflict"],
    [422, "validation"],
    [429, "rateLimit"],
    [500, "server"],
    [503, "server"],
    [400, "unknown"],
  ] as const)("falls back from status %s to %s", (status, kind) => {
    expect(errorCopyFor({ status })).toEqual(errorCopy[kind]);
  });

  it("prefers a recognised kind over the status", () => {
    expect(errorCopyFor({ kind: "network", status: 500 })).toEqual(errorCopy.network);
  });

  it("ignores an unrecognised kind and uses the status", () => {
    expect(errorCopyFor({ kind: "SOMETHING_NEW", status: 403 })).toEqual(errorCopy.forbidden);
  });

  it.each([null, undefined, "FORBIDDEN", 42, {}, { code: "DB_PASSWORD", message: "secret" }])(
    "returns neutral-to-danger fallback copy for %p",
    (error) => {
      expect(errorCopyFor(error)).toEqual(errorCopy.unknown);
      expect(JSON.stringify(errorCopyFor(error))).not.toContain("DB_PASSWORD");
      expect(JSON.stringify(errorCopyFor(error))).not.toContain("secret");
    },
  );
});
