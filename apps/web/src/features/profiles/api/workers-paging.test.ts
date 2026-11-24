import { describe, expect, it } from "vitest";

import { defaultWorkersFilters } from "../state/workers-filters";
import { getWorkersPage } from "./workers";

describe("getWorkersPage", () => {
  it("walks opaque cursors without gaps or repeats", async () => {
    const seen: string[] = [];
    let cursor: string | null = null;
    let expectedTotal = 0;

    for (let page = 0; page < 10; page += 1) {
      const result = await getWorkersPage({ filters: defaultWorkersFilters, cursor });
      expectedTotal = result.total;
      seen.push(...result.items.map((worker) => worker.id));

      if (result.nextCursor === null) {
        expect(result.items.length).toBeGreaterThan(0);
        break;
      }
      cursor = result.nextCursor;
    }

    expect(seen).toHaveLength(expectedTotal);
    expect(new Set(seen).size).toBe(expectedTotal);
  });

  it("starts over for an invalid cursor and ends at a cursor past the list", async () => {
    const first = await getWorkersPage({ filters: defaultWorkersFilters, cursor: null });

    const invalid = await getWorkersPage({
      filters: defaultWorkersFilters,
      cursor: "not-a-cursor",
    });
    expect(invalid.items.map((worker) => worker.id)).toEqual(
      first.items.map((worker) => worker.id),
    );
    expect(invalid.nextCursor).toBe(first.nextCursor);

    const beyond = await getWorkersPage({ filters: defaultWorkersFilters, cursor: "9999" });
    expect(beyond.items).toEqual([]);
    expect(beyond.nextCursor).toBeNull();
    expect(beyond.total).toBe(first.total);
  });
});
