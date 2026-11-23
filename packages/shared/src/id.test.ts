import { describe, expect, it } from "vitest";

import { createSupportReference } from "./id";

describe("createSupportReference", () => {
  it("returns a short prefixed reference", () => {
    expect(createSupportReference()).toMatch(/^GH-[0-9A-F]{6}$/);
  });

  it("honours a custom prefix", () => {
    expect(createSupportReference("AB-")).toMatch(/^AB-[0-9A-F]{6}$/);
  });

  it("returns different references on successive calls", () => {
    expect(createSupportReference()).not.toBe(createSupportReference());
  });
});
