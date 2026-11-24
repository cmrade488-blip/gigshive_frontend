import { describe, expect, it } from "vitest";

import { getHomeJobs, getHomeWorkers } from "./home";

describe("home samples", () => {
  it("does not attach verification claims to sample workers", async () => {
    const workers = await getHomeWorkers();
    expect(workers.length).toBeGreaterThan(0);

    for (const worker of workers) {
      expect(Object.keys(worker), worker.id).not.toContain("verified");
      expect(Object.keys(worker), worker.id).not.toContain("identityVerified");
      expect(Object.keys(worker), worker.id).not.toContain("emailVerified");
    }
  });

  it("still supplies typed sample jobs and workers", async () => {
    await expect(getHomeJobs()).resolves.toHaveLength(3);
    await expect(getHomeWorkers()).resolves.toHaveLength(4);
  });
});
