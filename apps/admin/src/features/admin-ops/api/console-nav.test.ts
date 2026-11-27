import { makeSessionUser, makeStaffSessionUser } from "@gigshive/testing";
import { describe, expect, it } from "vitest";

import { consoleNavItems, isActiveConsoleNavItem, visibleConsoleNav } from "./console-nav";

const allPermissions = [
  "profiles.review",
  "profiles.suspend",
  "verifications.review",
  "jobs.moderate",
  "finance.view",
  "catalog.manage",
  "config.manage",
  "audit.view",
];

describe("visibleConsoleNav", () => {
  it("hides all navigation from anonymous and non-staff sessions", () => {
    expect(visibleConsoleNav(null)).toEqual([]);
    expect(visibleConsoleNav(makeSessionUser({ permissions: allPermissions }))).toEqual([]);
    expect(visibleConsoleNav(makeStaffSessionUser({ status: "SUSPENDED" }))).toEqual([]);
  });

  it("always shows overview to eligible staff", () => {
    expect(
      visibleConsoleNav(makeStaffSessionUser({ permissions: [] })).map((item) => item.id),
    ).toEqual(["overview"]);
  });

  it("shows every documented section when all permissions are present", () => {
    expect(
      visibleConsoleNav(makeStaffSessionUser({ permissions: allPermissions })).map(
        (item) => item.id,
      ),
    ).toEqual(consoleNavItems.map((item) => item.id));
  });

  it("gates each permission group independently", () => {
    const cases: Array<[string[], string[]]> = [
      [["profiles.suspend"], ["overview", "profiles"]],
      [["verifications.review"], ["overview", "verifications"]],
      [["jobs.moderate"], ["overview", "jobs"]],
      [["finance.view"], ["overview", "contracts", "payments", "payouts"]],
      [["catalog.manage"], ["overview", "categories"]],
      [["config.manage"], ["overview", "config"]],
      [["audit.view"], ["overview", "audit-logs"]],
    ];

    for (const [permissions, expected] of cases) {
      expect(
        visibleConsoleNav(makeStaffSessionUser({ permissions })).map((item) => item.id),
      ).toEqual(expected);
    }
  });

  it("accepts either profile permission", () => {
    const review = visibleConsoleNav(
      makeStaffSessionUser({ permissions: ["profiles.review"] }),
    ).map((item) => item.id);
    expect(review).toEqual(["overview", "profiles"]);
  });
});

describe("isActiveConsoleNavItem", () => {
  it("matches the root only for the overview", () => {
    const overview = consoleNavItems[0];
    if (!overview) {
      throw new Error("Missing overview navigation item.");
    }
    expect(isActiveConsoleNavItem(overview, "/")).toBe(true);
    expect(isActiveConsoleNavItem(overview, "/profiles")).toBe(false);
  });

  it("matches exact and nested section paths", () => {
    const profiles = consoleNavItems.find((item) => item.id === "profiles");
    if (!profiles) {
      throw new Error("Missing profiles navigation item.");
    }
    expect(isActiveConsoleNavItem(profiles, "/profiles")).toBe(true);
    expect(isActiveConsoleNavItem(profiles, "/profiles/123")).toBe(true);
    expect(isActiveConsoleNavItem(profiles, "/jobs")).toBe(false);
  });
});
