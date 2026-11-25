import { describe, expect, it } from "vitest";

import { jobDetailPath, siteRoutes, workerDetailPath } from "./routes";

describe("siteRoutes", () => {
  it("is importable without loading a feature barrel", () => {
    expect(siteRoutes.home).toBe("/");
    expect(siteRoutes.jobs).toBe("/jobs");
    expect(siteRoutes.workers).toBe("/workers");
    expect(siteRoutes.login).toBe("/login");
    expect(siteRoutes.register).toBe("/register");
    expect(siteRoutes.verifyEmail).toBe("/verify-email");
  });

  it("keeps every public path absolute", () => {
    for (const path of Object.values(siteRoutes)) {
      expect(path.startsWith("/")).toBe(true);
    }
  });
});

describe("public detail paths", () => {
  it("builds worker profile URLs", () => {
    expect(workerDetailPath("user_1")).toBe("/workers/user_1");
    expect(workerDetailPath("a b/c")).toBe("/workers/a%20b%2Fc");
  });

  it("builds job URLs", () => {
    expect(jobDetailPath("job_1")).toBe("/jobs/job_1");
    expect(jobDetailPath("a b/c")).toBe("/jobs/a%20b%2Fc");
  });
});
