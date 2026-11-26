import { siteRoutes } from "@gigshive/shared/routes";
import { describe, expect, it } from "vitest";

import { DEFAULT_RETURN_PATH, resolveReturnPath, returnPathFromParams } from "./return-path";

describe("resolveReturnPath", () => {
  it("keeps a valid local path with its query and hash", () => {
    expect(resolveReturnPath("/jobs?category=design#results")).toBe(
      "/jobs?category=design#results",
    );
  });

  it.each([
    [null],
    [undefined],
    [""],
    ["jobs"],
    ["https://evil.example/login"],
    ["//evil.example"],
    ["/\\evil.example"],
    ["/%5Cevil.example"],
    ["/\u0000evil"],
    ["/%"],
    [siteRoutes.login],
    [siteRoutes.register],
    [siteRoutes.verifyEmail],
  ])("falls back to the dashboard for %j", (candidate) => {
    expect(resolveReturnPath(candidate)).toBe(DEFAULT_RETURN_PATH);
    expect(DEFAULT_RETURN_PATH).toBe(siteRoutes.dashboard);
  });
});

describe("returnPathFromParams", () => {
  it("prefers next and accepts returnTo as a fallback", () => {
    expect(returnPathFromParams(new URLSearchParams("next=/jobs&returnTo=/workers"))).toBe("/jobs");
    expect(returnPathFromParams(new URLSearchParams("returnTo=/workers"))).toBe("/workers");
    expect(returnPathFromParams(new URLSearchParams())).toBe(DEFAULT_RETURN_PATH);
  });
});
