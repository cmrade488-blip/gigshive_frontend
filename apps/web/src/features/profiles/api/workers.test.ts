import { describe, expect, it } from "vitest";

import { getWorkerById, getWorkerIds } from "./workers";

describe("sample workers", () => {
  it("never claims a sample person is verified", () => {
    const ids = getWorkerIds();
    expect(ids.length).toBeGreaterThan(0);

    for (const id of ids) {
      const worker = getWorkerById(id);
      expect(worker, id).not.toBeNull();
      expect(worker?.verified, id).toBe(false);
      expect(worker?.identityVerified, id).toBe(false);
      expect(worker?.emailVerified, id).toBe(false);
    }
  });
});
