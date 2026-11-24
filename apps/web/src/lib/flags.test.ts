import { afterEach, describe, expect, it, vi } from "vitest";

import { isSampleDataEnabled } from "./flags";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isSampleDataEnabled", () => {
  it("enables sample data in development by default", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_SHOW_SAMPLE_DATA", "");

    expect(isSampleDataEnabled()).toBe(true);
  });

  it("disables sample data in production by default", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SHOW_SAMPLE_DATA", "");

    expect(isSampleDataEnabled()).toBe(false);
  });

  it("allows an explicit production opt-in", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SHOW_SAMPLE_DATA", "true");

    expect(isSampleDataEnabled()).toBe(true);
  });
});
