import { afterEach, describe, expect, it, vi } from "vitest";

import sitemap from "./sitemap";

function urls(): readonly string[] {
  return sitemap().map((entry) => entry.url);
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("sitemap", () => {
  it("omits sample listing routes by default in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SHOW_SAMPLE_DATA", "");
    vi.stubEnv("PUBLIC_SITE_URL", "https://example.com");

    const generated = urls();
    expect(generated).toContain("https://example.com/");
    expect(generated).not.toContain("https://example.com/jobs");
    expect(generated).not.toContain("https://example.com/workers");
  });

  it("includes sample listing routes when explicitly enabled", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SHOW_SAMPLE_DATA", "true");
    vi.stubEnv("PUBLIC_SITE_URL", "https://example.com");

    const generated = urls();
    expect(generated).toContain("https://example.com/jobs");
    expect(generated).toContain("https://example.com/workers");
  });
});
