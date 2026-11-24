import { describe, expect, it } from "vitest";

import {
  clearSessionCookie,
  csrfSetCookie,
  isSessionCurrent,
  sealSession,
  sessionSetCookie,
  unsealSession,
} from "./cookie";
import { makeConfig, makeState, NOW } from "./test-helpers";

describe("session cookies", () => {
  const config = makeConfig();

  it("round-trips a sealed state without exposing the token", () => {
    const state = makeState(config);
    const sealed = sealSession(state, config);

    expect(sealed).not.toContain(state.token);
    expect(sealed).not.toContain("surface");
    expect(unsealSession(sealed, config)).toEqual(state);
  });

  it("rejects tampering, another secret and another surface", () => {
    const sealed = sealSession(makeState(config), config);
    const tampered = `${sealed.slice(0, -2)}AA`;

    expect(unsealSession(tampered, config)).toBeNull();
    expect(
      unsealSession(sealed, { ...config, secret: "a-different-secret-0123456789" }),
    ).toBeNull();
    expect(unsealSession(sealed, makeConfig("admin"))).toBeNull();
    expect(unsealSession(null, config)).toBeNull();
    expect(unsealSession("not-base64", config)).toBeNull();
  });

  it("never accepts a session past its idle or absolute lifetime", () => {
    const state = makeState(config, { lastSeen: NOW - 8 * 24 * 60 * 60 * 1000 });
    expect(isSessionCurrent(state, config, NOW)).toBe(false);
    expect(isSessionCurrent(makeState(config, { issuedAt: NOW + 1 }), config, NOW)).toBe(false);
    expect(isSessionCurrent(makeState(config, { lastSeen: NOW + 1 }), config, NOW)).toBe(false);
  });

  it("sets opaque, HttpOnly, Secure, SameSite=Lax cookies", () => {
    const cookie = sessionSetCookie(config, makeState(config), NOW);

    expect(cookie).toContain(`${config.sessionCookieName}=`);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Secure");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain(`Max-Age=${Math.floor(config.idleMs / 1000)}`);
  });

  it("caps the cookie age at the remaining absolute lifetime", () => {
    const state = makeState(config, { issuedAt: NOW - 29 * 24 * 60 * 60 * 1000 });
    const cookie = sessionSetCookie(config, state, NOW);
    expect(cookie).toContain("Max-Age=86400");
  });

  it("clears cookies with Max-Age=0", () => {
    expect(clearSessionCookie(config)).toContain("Max-Age=0");
    expect(csrfSetCookie(config, "token").match(/HttpOnly/)).toBeNull();
    expect(csrfSetCookie(config, "token")).toContain("SameSite=Lax");
  });
});
