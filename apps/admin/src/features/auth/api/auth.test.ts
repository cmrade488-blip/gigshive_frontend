import { beforeEach, describe, expect, it, vi } from "vitest";

import { loginStaff, logoutStaff, verifyStaffOtp } from "./auth";
import { getConsoleSession } from "./session";

const mocks = vi.hoisted(() => ({
  csrfHeaders: vi.fn(async () => ({ "x-csrf-token": "token" })),
  post: vi.fn(),
  get: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  csrfHeaders: mocks.csrfHeaders,
  staffAuthClient: { post: mocks.post },
  sessionClient: { get: mocks.get },
}));

describe("staff auth API", () => {
  beforeEach(() => {
    mocks.csrfHeaders.mockClear();
    mocks.post.mockReset();
    mocks.get.mockReset();
  });

  it("posts step one to the documented staff login route", async () => {
    mocks.post.mockResolvedValue({ data: { otp_required: true } });

    await expect(loginStaff({ email: "ada@example.com", password: "pw" })).resolves.toEqual({
      otpRequired: true,
    });
    expect(mocks.post).toHaveBeenCalledWith(
      "/login",
      { email: "ada@example.com", password: "pw" },
      {
        headers: { "x-csrf-token": "token" },
        skipUnauthorizedHandler: true,
      },
    );
  });

  it("posts the OTP to step two and returns the session data", async () => {
    const session = { id: "staff-1" };
    mocks.post.mockResolvedValue({ data: session });

    await expect(verifyStaffOtp({ otp: "123456" })).resolves.toBe(session);
    expect(mocks.post).toHaveBeenCalledWith(
      "/verify-otp",
      { otp: "123456" },
      {
        headers: { "x-csrf-token": "token" },
        skipUnauthorizedHandler: true,
      },
    );
  });

  it("revokes the session through the shared logout route", async () => {
    mocks.post.mockResolvedValue({ data: null });

    await logoutStaff();
    expect(mocks.post).toHaveBeenCalledWith("/logout", undefined, {
      headers: { "x-csrf-token": "token" },
      skipUnauthorizedHandler: true,
    });
  });

  it("reads /me with the 401 handler opted out", async () => {
    const session = { id: "staff-1", account_type: "STAFF" };
    mocks.get.mockResolvedValue({ data: session });

    await expect(getConsoleSession()).resolves.toBe(session);
    expect(mocks.get).toHaveBeenCalledWith("/me", { skipUnauthorizedHandler: true });
  });

  it("returns null when the session read fails", async () => {
    mocks.get.mockRejectedValue(new Error("offline"));

    await expect(getConsoleSession()).resolves.toBeNull();
  });
});
