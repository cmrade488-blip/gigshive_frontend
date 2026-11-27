import { describe, expect, it } from "vitest";

import { makeTestProfile, makeTestSession } from "../__tests__/session-fixtures";
import { guardWebRoute, hasSuspendedProfile, isPrivateRoute, sessionStatus } from "./session";

describe("sessionStatus", () => {
  it("maps every session state", () => {
    expect(sessionStatus(null)).toBe("ANONYMOUS");
    expect(sessionStatus(makeTestSession({ email_verified_at: null }))).toBe("UNVERIFIED");
    expect(sessionStatus(makeTestSession({ status: "SUSPENDED" }))).toBe("SUSPENDED");
    expect(sessionStatus(makeTestSession({ status: "DELETED" }))).toBe("SUSPENDED");
    expect(sessionStatus(makeTestSession())).toBe("AUTHENTICATED");
  });
});

describe("hasSuspendedProfile", () => {
  it("detects a suspended profile without treating a normal session as suspended", () => {
    expect(hasSuspendedProfile(null)).toBe(false);
    expect(hasSuspendedProfile(makeTestSession())).toBe(false);
    expect(
      hasSuspendedProfile(
        makeTestSession({
          profiles: [
            makeTestProfile(),
            makeTestProfile({ id: "profile-suspended", status: "SUSPENDED" }),
          ],
        }),
      ),
    ).toBe(true);
  });
});

describe("isPrivateRoute", () => {
  it("marks documented user areas as private", () => {
    expect(isPrivateRoute("/dashboard")).toBe(true);
    expect(isPrivateRoute("/settings/account")).toBe(true);
    expect(isPrivateRoute("/my/jobs/new")).toBe(true);
    expect(isPrivateRoute("/jobs/job-1/propose")).toBe(true);
  });

  it("leaves public and unknown routes alone", () => {
    expect(isPrivateRoute("/")).toBe(false);
    expect(isPrivateRoute("/jobs/job-1")).toBe(false);
    expect(isPrivateRoute("/login")).toBe(false);
    expect(isPrivateRoute("/does-not-exist")).toBe(false);
  });
});

describe("guardWebRoute", () => {
  it("lets anonymous users see public pages", () => {
    expect(guardWebRoute(null, "/jobs")).toEqual({ allowed: true });
    expect(guardWebRoute(null, "/")).toEqual({ allowed: true });
  });

  it("returns anonymous users to sign-in with the intended destination", () => {
    expect(guardWebRoute(null, "/settings/account", "?tab=security")).toEqual({
      allowed: false,
      redirectTo: "/login?next=%2Fsettings%2Faccount%3Ftab%3Dsecurity",
    });
  });

  it("keeps suspended and unverified users in account settings", () => {
    expect(
      guardWebRoute(makeTestSession({ status: "SUSPENDED" }), "/settings/account").allowed,
    ).toBe(true);
    expect(
      guardWebRoute(makeTestSession({ email_verified_at: null }), "/settings/account").allowed,
    ).toBe(true);
  });

  it("sends signed-in users away from auth pages except verify email while unverified", () => {
    expect(guardWebRoute(makeTestSession(), "/login")).toEqual({
      allowed: false,
      redirectTo: "/dashboard",
    });
    expect(guardWebRoute(makeTestSession({ email_verified_at: null }), "/verify-email")).toEqual({
      allowed: true,
    });
  });

  it("lets anonymous users complete auth pages", () => {
    expect(guardWebRoute(null, "/verify-email")).toEqual({ allowed: true });
  });
});
