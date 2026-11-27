import { describe, expect, it } from "vitest";

import { makeTestProfile, makeTestSession } from "../__tests__/session-fixtures";
import type { SessionData } from "../api/session";
import {
  dashboardBanners,
  dashboardNextActions,
  dashboardRoles,
  preferredDashboardRole,
} from "./dashboard";

type ProfileStatus = SessionData["profiles"][number]["status"];
type AccountStatus = SessionData["status"];

const profileStatuses: ProfileStatus[] = [
  "PENDING",
  "SUBMITTED",
  "ACTIVE",
  "REJECTED",
  "SUSPENDED",
];

function sessionWithProfile(status: ProfileStatus, role: "CLIENT" | "WORKER" = "CLIENT") {
  return makeTestSession({
    profiles: [
      makeTestProfile({
        profile_type: role,
        worker_type: role === "WORKER" ? "CREATOR" : null,
        status,
      }),
    ],
  });
}

describe("dashboardRoles", () => {
  it("uses the profile types on /me in session order", () => {
    const session = makeTestSession({
      profiles: [
        makeTestProfile({ profile_type: "WORKER", worker_type: "ARTISAN" }),
        makeTestProfile({ profile_type: "CLIENT", worker_type: null }),
      ],
    });

    expect(dashboardRoles(session)).toEqual(["WORKER", "CLIENT"]);
  });

  it("offers only the available role for client-only and worker-only sessions", () => {
    expect(dashboardRoles(sessionWithProfile("ACTIVE", "CLIENT"))).toEqual(["CLIENT"]);
    expect(dashboardRoles(sessionWithProfile("ACTIVE", "WORKER"))).toEqual(["WORKER"]);
  });

  it("offers both setup roles when no profile exists", () => {
    expect(dashboardRoles(makeTestSession({ profiles: [] }))).toEqual(["CLIENT", "WORKER"]);
    expect(dashboardRoles(null)).toEqual(["CLIENT", "WORKER"]);
  });

  it("keeps a valid role choice and ignores an unavailable one", () => {
    const session = sessionWithProfile("ACTIVE", "WORKER");

    expect(preferredDashboardRole(session, "WORKER")).toBe("WORKER");
    expect(preferredDashboardRole(session, "CLIENT")).toBe("WORKER");
    expect(preferredDashboardRole(null)).toBe("CLIENT");
  });
});

describe("dashboardBanners", () => {
  it("maps every account status", () => {
    const expected: Record<AccountStatus, string | null> = {
      ACTIVE: null,
      SUSPENDED: "ACCOUNT_SUSPENDED",
      DELETED: "ACCOUNT_DELETED",
    };

    for (const status of Object.keys(expected) as AccountStatus[]) {
      const banners = dashboardBanners(makeTestSession({ status }), "CLIENT");
      expect(banners.some((banner) => banner.id === "account")).toBe(expected[status] !== null);
      if (expected[status]) {
        expect(banners.find((banner) => banner.id === "account")?.kind).toBe(expected[status]);
      }
    }
  });

  it("maps every profile status", () => {
    const expected: Record<ProfileStatus, string | null> = {
      PENDING: "PROFILE_PENDING",
      SUBMITTED: "PROFILE_SUBMITTED",
      ACTIVE: null,
      REJECTED: "PROFILE_REJECTED",
      SUSPENDED: "PROFILE_SUSPENDED",
    };

    for (const status of profileStatuses) {
      const [banner] = dashboardBanners(sessionWithProfile(status), "CLIENT");
      expect(banner?.kind ?? null).toBe(expected[status]);
    }
  });

  it("shows review notes only for rejected and suspended profiles", () => {
    const session = makeTestSession({
      profiles: [
        makeTestProfile({
          profile_type: "CLIENT",
          worker_type: null,
          status: "REJECTED",
          status_reason: "Add a category",
        }),
      ],
    });

    expect(dashboardBanners(session, "CLIENT")[0]?.reason).toBe("Add a category");

    const pending = makeTestSession({
      profiles: [
        makeTestProfile({
          profile_type: "CLIENT",
          worker_type: null,
          status: "PENDING",
          status_reason: "Do not show this",
        }),
      ],
    });
    expect(dashboardBanners(pending, "CLIENT")[0]?.reason).toBeNull();
  });

  it("includes an end date only for a suspended profile", () => {
    const session = makeTestSession({
      profiles: [
        makeTestProfile({
          profile_type: "CLIENT",
          worker_type: null,
          status: "SUSPENDED",
          suspended_until: "2026-12-01T00:00:00.000Z",
        }),
      ],
    });

    expect(dashboardBanners(session, "CLIENT")[0]?.until).toBe("2026-12-01T00:00:00.000Z");
    expect(dashboardBanners(sessionWithProfile("ACTIVE"), "CLIENT")[0]).toBeUndefined();
  });

  it("adds email and setup banners and filters by role", () => {
    const session = makeTestSession({
      email_verified_at: null,
      profiles: [makeTestProfile({ profile_type: "WORKER", worker_type: "CREATOR" })],
    });

    expect(dashboardBanners(session, "WORKER").map((banner) => banner.kind)).toContain(
      "EMAIL_UNVERIFIED",
    );
    expect(dashboardBanners(session, "CLIENT").map((banner) => banner.kind)).toContain(
      "NO_PROFILE",
    );
    expect(dashboardBanners(session, "CLIENT")).toHaveLength(2);
  });

  it("does not build banners for staff or a missing session", () => {
    expect(dashboardBanners(null, "CLIENT")).toEqual([]);
    expect(dashboardBanners(makeTestSession({ account_type: "STAFF" }), "CLIENT")).toEqual([]);
  });
});

describe("dashboardNextActions", () => {
  it("maps every profile status for both roles", () => {
    const expected: Record<ProfileStatus, Record<"CLIENT" | "WORKER", string | null>> = {
      PENDING: { CLIENT: null, WORKER: null },
      SUBMITTED: { CLIENT: null, WORKER: null },
      ACTIVE: { CLIENT: "browseWorkers", WORKER: "browseJobs" },
      REJECTED: { CLIENT: "viewProfile", WORKER: "viewProfile" },
      SUSPENDED: { CLIENT: "viewProfile", WORKER: "viewProfile" },
    };

    for (const status of profileStatuses) {
      for (const role of ["CLIENT", "WORKER"] as const) {
        expect(dashboardNextActions(sessionWithProfile(status, role), role)).toEqual(
          expected[status][role] ? [expected[status][role]] : [],
        );
      }
    }
  });

  it("offers role-specific setup for a missing profile", () => {
    const session = makeTestSession({ profiles: [] });

    expect(dashboardNextActions(session, "CLIENT")).toEqual(["createClientProfile"]);
    expect(dashboardNextActions(session, "WORKER")).toEqual(["createWorkerProfile"]);
  });

  it("puts verification first without dropping the profile action", () => {
    const session = makeTestSession({
      email_verified_at: null,
      profiles: [makeTestProfile({ profile_type: "CLIENT", worker_type: null })],
    });

    expect(dashboardNextActions(session, "CLIENT")).toEqual(["verifyEmail", "browseWorkers"]);
  });

  it("limits suspended accounts to account settings and hides deleted and staff sessions", () => {
    expect(dashboardNextActions(makeTestSession({ status: "SUSPENDED" }), "CLIENT")).toEqual([
      "accountSettings",
    ]);
    expect(dashboardNextActions(makeTestSession({ status: "DELETED" }), "CLIENT")).toEqual([]);
    expect(dashboardNextActions(makeTestSession({ account_type: "STAFF" }), "CLIENT")).toEqual([]);
    expect(dashboardNextActions(null, "CLIENT")).toEqual([]);
  });
});
