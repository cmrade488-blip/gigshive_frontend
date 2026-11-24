import { afterEach, describe, expect, it, vi } from "vitest";

import robots from "./robots";

function disallowed(): readonly string[] {
  const rules = robots().rules;
  const rule = Array.isArray(rules) ? rules[0] : rules;
  const value = rule?.disallow;
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("robots", () => {
  it("disallows sample listings by default in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SHOW_SAMPLE_DATA", "");
    vi.stubEnv("PUBLIC_SITE_URL", "https://example.com");

    expect(disallowed()).toEqual(
      expect.arrayContaining([
        "/access-denied",
        "/server-error",
        "/maintenance",
        "/jobs",
        "/jobs/*",
        "/workers",
        "/workers/*",
      ]),
    );
  });

  it("does not disallow sample listings when explicitly enabled", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SHOW_SAMPLE_DATA", "true");
    vi.stubEnv("PUBLIC_SITE_URL", "https://example.com");

    const disallow = disallowed();
    expect(disallow).not.toContain("/jobs");
    expect(disallow).not.toContain("/workers");
  });
});
