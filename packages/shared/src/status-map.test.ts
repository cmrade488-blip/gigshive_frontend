import { describe, expect, it } from "vitest";
import { createStatusMap, createAvailableActions } from "./status-map";

describe("createStatusMap", () => {
  const resolve = createStatusMap({
    ACTIVE: { label: "Active", tone: "success" },
    PENDING: { label: "Pending", tone: "warning", description: "Awaiting review" },
  });

  it("resolves known statuses", () => {
    expect(resolve("ACTIVE")).toEqual({ label: "Active", tone: "success" });
    expect(resolve("PENDING").description).toBe("Awaiting review");
  });

  it("falls back for unknown", () => {
    expect(resolve("NOPE")).toEqual({ label: "Unknown", tone: "neutral" });
  });
});

describe("createAvailableActions", () => {
  const actions = createAvailableActions({
    ACTIVE: {
      client: ["cancel", "approve"] as const,
      worker: ["submit"] as const,
    },
    PENDING_FUNDING: {
      client: ["fund"] as const,
    },
  });

  it("returns actions for status+role", () => {
    expect(actions("ACTIVE", "client")).toEqual(["cancel", "approve"]);
    expect(actions("ACTIVE", "worker")).toEqual(["submit"]);
  });

  it("returns empty for missing combinations", () => {
    expect(actions("PENDING_FUNDING", "worker")).toEqual([]);
    expect(actions("ACTIVE", "staff" as "client")).toEqual([]);
  });
});
