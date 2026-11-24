import { afterEach, describe, expect, it, vi } from "vitest";

import { FeeExampleUnavailableError, getFeeExample, isFeeExampleEnabled } from "./fees";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("fee example availability", () => {
  it("returns the typed kobo example in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_SHOW_SAMPLE_DATA", "");

    expect(isFeeExampleEnabled()).toBe(true);
    await expect(getFeeExample()).resolves.toEqual({
      agreedAmountKobo: 12_000_000,
      platformFeeKobo: 1_200_000,
      workerReceivesKobo: 10_800_000,
    });
  });

  it("stays unavailable in production even with sample data enabled", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SHOW_SAMPLE_DATA", "true");

    expect(isFeeExampleEnabled()).toBe(false);
    await expect(getFeeExample()).rejects.toBeInstanceOf(FeeExampleUnavailableError);
  });
});
