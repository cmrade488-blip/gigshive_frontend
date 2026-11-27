import { makeSessionUser, makeStaffSessionUser } from "@gigshive/testing";
import { describe, expect, it } from "vitest";

import { guardConsoleRoute } from "./console-guard";

describe("guardConsoleRoute", () => {
  it("sends anonymous users to sign-in with the destination preserved", () => {
    expect(guardConsoleRoute(null, "/")).toEqual({
      allowed: false,
      redirectTo: "/login?next=%2F",
    });
    expect(guardConsoleRoute(null, "/profiles", "?page=2")).toEqual({
      allowed: false,
      redirectTo: "/login?next=%2Fprofiles%3Fpage%3D2",
    });
  });

  it("allows anonymous users on both sign-in steps", () => {
    expect(guardConsoleRoute(null, "/login")).toEqual({ allowed: true });
    expect(guardConsoleRoute(null, "/login/otp")).toEqual({ allowed: true });
  });

  it("sends eligible staff away from sign-in with a validated next", () => {
    const session = makeStaffSessionUser();
    expect(guardConsoleRoute(session, "/login", "?next=%2Fprofiles")).toEqual({
      allowed: false,
      redirectTo: "/profiles",
    });
    expect(guardConsoleRoute(session, "/login/otp", "?next=https%3A%2F%2Fexample.com")).toEqual({
      allowed: false,
      redirectTo: "/",
    });
  });

  it("allows eligible staff on console routes", () => {
    expect(guardConsoleRoute(makeStaffSessionUser(), "/")).toEqual({ allowed: true });
  });

  it("forbids non-staff, suspended and deleted sessions", () => {
    expect(guardConsoleRoute(makeSessionUser(), "/")).toEqual({ allowed: false, forbidden: true });
    expect(guardConsoleRoute(makeStaffSessionUser({ status: "SUSPENDED" }), "/")).toEqual({
      allowed: false,
      forbidden: true,
    });
    expect(guardConsoleRoute(makeStaffSessionUser({ status: "DELETED" }), "/")).toEqual({
      allowed: false,
      forbidden: true,
    });
  });
});
