import { describe, expect, it } from "vitest";

import {
  browserContext,
  coarseRoute,
  deviceClassFromWidth,
  requestIdFromError,
  requestIdFromHeaders,
  safeIdentifier,
  supportReferenceFromError,
} from "./context";

const ULID = "01J8ZQ3Z8ZQ3Z8ZQ3Z8ZQ3Z8ZQ";
const UUID = "01a8b3c4-abcd-4abc-8abc-abcdefabcdef";

describe("coarseRoute", () => {
  it.each([
    [undefined, "/"],
    ["", "/"],
    ["workers/sample-amaka", "/"],
    ["/?email=ada@example.com", "/"],
    ["/jobs?keyword=secret", "/jobs"],
    ["/how-it-works#pricing", "/how-it-works"],
    ["/workers/sample-amaka", "/workers/:id"],
    ["/jobs/sample-clinic-site/extra/more/even-more/too-much", "/jobs/:id/:id/:id/:id"],
    [`/${ULID}/details`, "/:id/:id"],
    [`/${UUID}/details`, "/:id/:id"],
  ])("maps %s to %s without query values or dynamic segments", (input, expected) => {
    expect(coarseRoute(input)).toBe(expected);
  });
});

describe("deviceClassFromWidth", () => {
  it.each([
    [360, "mobile"],
    [800, "tablet"],
    [1440, "desktop"],
    [0, "unknown"],
    [Number.NaN, "unknown"],
    ["360", "unknown"],
  ] as const)("maps width %s to %s", (width, expected) => {
    expect(deviceClassFromWidth(width)).toBe(expected);
  });
});

describe("safeIdentifier", () => {
  it("keeps opaque server-issued identifiers", () => {
    expect(safeIdentifier(ULID)).toBe(ULID);
    expect(safeIdentifier(" digest_abc123 ")).toBe("digest_abc123");
  });

  it.each(["abc", "hello world", "a/b?c=d", "'; DROP TABLE", 42, null])("rejects %p", (value) => {
    expect(safeIdentifier(value)).toBeUndefined();
  });
});

describe("request identifiers", () => {
  it("reads an API request id from common error fields", () => {
    expect(requestIdFromError({ requestId: ULID })).toBe(ULID);
    expect(requestIdFromError({ request_id: UUID })).toBe(UUID);
    expect(requestIdFromError({ "x-request-id": ULID })).toBe(ULID);
  });

  it("reads a Next digest only as a support reference", () => {
    expect(supportReferenceFromError({ digest: "digest_abc123" })).toBe("digest_abc123");
    expect(supportReferenceFromError({ supportReference: ULID })).toBe(ULID);
    expect(requestIdFromError({ digest: "digest_abc123" })).toBeUndefined();
  });

  it("ignores arbitrary values on non-objects", () => {
    expect(requestIdFromError(ULID)).toBeUndefined();
    expect(supportReferenceFromError(null)).toBeUndefined();
  });

  it("reads the x-request-id response header", () => {
    const headers = new Headers({ "x-request-id": ULID });
    expect(requestIdFromHeaders(headers)).toBe(ULID);
    expect(requestIdFromHeaders(null)).toBeUndefined();
  });
});

describe("browserContext", () => {
  it("builds fixed metadata from a pathname and viewport", () => {
    expect(
      browserContext("admin", "v1.0.0", {
        location: { pathname: "/verification/01J8ZQ3Z8ZQ3Z8ZQ3Z8ZQ3Z8ZQ?tab=docs" },
        innerWidth: 360,
      }),
    ).toEqual({
      surface: "admin",
      release: "v1.0.0",
      route: "/verification/:id",
      deviceClass: "mobile",
    });
  });

  it("falls back safely with no browser globals", () => {
    expect(browserContext("web", "", {})).toEqual({
      surface: "web",
      release: "local",
      route: "/",
      deviceClass: "unknown",
    });
  });
});
