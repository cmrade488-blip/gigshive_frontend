import { afterEach, describe, expect, it, vi } from "vitest";

import { getSiteUrl } from "./site-url";

const LOCAL_FALLBACK = "http://localhost:3000";

function stubProduction(): void {
  vi.stubEnv("GIGSHIVE_ENV", "production");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("getSiteUrl", () => {
  it("returns a valid URL in a production build", () => {
    stubProduction();
    vi.stubEnv("PUBLIC_SITE_URL", "https://gigs.example");

    expect(getSiteUrl()).toBe("https://gigs.example");
  });

  it("removes a trailing slash in a production build", () => {
    stubProduction();
    vi.stubEnv("PUBLIC_SITE_URL", "https://gigs.example/");

    expect(getSiteUrl()).toBe("https://gigs.example");
  });

  it("rejects credentials in a production build", () => {
    stubProduction();
    vi.stubEnv("PUBLIC_SITE_URL", "https://user:secret@gigs.example");

    expect(getSiteUrl).toThrow(/credentials/);
  });

  it("rejects an invalid URL in a production build", () => {
    stubProduction();
    vi.stubEnv("PUBLIC_SITE_URL", "not-a-url");

    expect(getSiteUrl).toThrow(/PUBLIC_SITE_URL/);
  });

  it("rejects an unsupported protocol in a production build", () => {
    stubProduction();
    vi.stubEnv("PUBLIC_SITE_URL", "ftp://gigs.example");

    expect(getSiteUrl).toThrow(/PUBLIC_SITE_URL/);
  });

  it("throws when PUBLIC_SITE_URL is missing in a production build", () => {
    stubProduction();
    vi.stubEnv("PUBLIC_SITE_URL", undefined);

    expect(getSiteUrl).toThrow(/PUBLIC_SITE_URL/);
  });

  it("falls back to localhost when PUBLIC_SITE_URL is missing in a local build", () => {
    vi.stubEnv("GIGSHIVE_ENV", "development");
    vi.stubEnv("PUBLIC_SITE_URL", undefined);

    expect(getSiteUrl()).toBe(LOCAL_FALLBACK);
  });

  it("falls back to localhost when GIGSHIVE_ENV is unset", () => {
    vi.stubEnv("GIGSHIVE_ENV", undefined);
    vi.stubEnv("PUBLIC_SITE_URL", undefined);

    expect(getSiteUrl()).toBe(LOCAL_FALLBACK);
  });

  it("warns without echoing an invalid local value", () => {
    vi.stubEnv("GIGSHIVE_ENV", "development");
    vi.stubEnv("PUBLIC_SITE_URL", "https://user:secret@gigs.example");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    expect(getSiteUrl()).toBe(LOCAL_FALLBACK);
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls.join(" ")).not.toContain("secret");
  });
});
