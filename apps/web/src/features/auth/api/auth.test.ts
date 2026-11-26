import { beforeEach, describe, expect, it, vi } from "vitest";

import { changePassword, sendPhoneOtp, verifyPhone } from "./auth";

const mocks = vi.hoisted(() => ({
  sessionPost: vi.fn(),
  csrfHeaders: vi.fn(async () => ({ "X-CSRF-Token": "test-token" })),
}));

vi.mock("@/lib/api", () => ({
  sessionClient: { post: mocks.sessionPost },
  csrfHeaders: mocks.csrfHeaders,
}));

describe("authenticated auth calls", () => {
  beforeEach(() => {
    mocks.sessionPost.mockReset();
  });

  it("posts change-password to the API's /auth path", async () => {
    mocks.sessionPost.mockResolvedValue({ data: undefined });
    const payload = { current_password: "old-password", password: "new-password" };

    await changePassword(payload);

    expect(mocks.sessionPost).toHaveBeenCalledWith("/auth/change-password", payload, {
      headers: { "X-CSRF-Token": "test-token" },
      skipUnauthorizedHandler: true,
    });
  });

  it("posts a phone OTP request with the E.164 number", async () => {
    mocks.sessionPost.mockResolvedValue({ data: { retry_after: 30 } });
    const payload = { channel: "PHONE" as const, phone: "+2348012345678" };

    await expect(sendPhoneOtp(payload)).resolves.toEqual({ retry_after: 30 });

    expect(mocks.sessionPost).toHaveBeenCalledWith("/auth/resend-otp", payload, {
      headers: { "X-CSRF-Token": "test-token" },
      skipUnauthorizedHandler: true,
    });
  });

  it("posts only the OTP to verify the pending phone", async () => {
    const session = {
      id: "user_1",
      email: "person@example.test",
      account_type: "USER" as const,
      status: "ACTIVE" as const,
      profiles: [],
      abilities: ["client"],
      phone: "+2348012345678",
      phone_verified_at: "2026-01-01T00:00:00Z",
    };
    mocks.sessionPost.mockResolvedValue({ data: session });

    await expect(verifyPhone({ otp: "123456" })).resolves.toEqual(session);

    expect(mocks.sessionPost).toHaveBeenCalledWith(
      "/auth/verify-phone",
      { otp: "123456" },
      {
        headers: { "X-CSRF-Token": "test-token" },
        skipUnauthorizedHandler: true,
      },
    );
  });
});
