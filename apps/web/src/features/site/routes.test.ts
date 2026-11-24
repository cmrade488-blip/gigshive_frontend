import {
  jobDetailPath,
  siteRoutes as sharedRoutes,
  workerDetailPath,
} from "@gigshive/shared/routes";
import { describe, expect, it } from "vitest";

import { siteRoutes } from "./routes";

describe("site routes", () => {
  it("re-exports the shared route table", () => {
    expect(siteRoutes).toBe(sharedRoutes);
  });

  it("builds encoded public detail paths", () => {
    expect(workerDetailPath("user_1")).toBe("/workers/user_1");
    expect(workerDetailPath("a b/c")).toBe("/workers/a%20b%2Fc");
    expect(jobDetailPath("job_1")).toBe("/jobs/job_1");
    expect(jobDetailPath("a b/c")).toBe("/jobs/a%20b%2Fc");
  });
});
