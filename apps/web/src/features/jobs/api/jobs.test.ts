import { describe, expect, it } from "vitest";

import { getJobById, getJobIds } from "./jobs";

describe("sample jobs", () => {
  it("never claims a sample client's email is verified", () => {
    const ids = getJobIds();
    expect(ids.length).toBeGreaterThan(0);

    for (const id of ids) {
      const job = getJobById(id);
      expect(job, id).not.toBeNull();
      expect(job?.clientEmailVerified, id).toBe(false);
    }
  });
});
