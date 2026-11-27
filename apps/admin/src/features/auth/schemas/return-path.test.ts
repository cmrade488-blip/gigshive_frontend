import { describe, expect, it } from "vitest";

import { resolveConsoleReturnPath } from "./return-path";

describe("resolveConsoleReturnPath", () => {
  it("accepts same-origin relative paths with queries", () => {
    expect(resolveConsoleReturnPath("/profiles?page=2")).toBe("/profiles?page=2");
    expect(resolveConsoleReturnPath("/")).toBe("/");
  });

  it("rejects missing, absolute, protocol-relative and backslash paths", () => {
    expect(resolveConsoleReturnPath(null)).toBe("/");
    expect(resolveConsoleReturnPath(undefined)).toBe("/");
    expect(resolveConsoleReturnPath("")).toBe("/");
    expect(resolveConsoleReturnPath("https://example.com")).toBe("/");
    expect(resolveConsoleReturnPath("//example.com")).toBe("/");
    expect(resolveConsoleReturnPath("/\\example.com")).toBe("/");
  });

  it("rejects control characters", () => {
    expect(resolveConsoleReturnPath("/profiles\nSet-Cookie: x")).toBe("/");
  });
});
