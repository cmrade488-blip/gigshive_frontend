import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeTestApiError } from "../api/test-error";
import { authCopy } from "../copy/auth";
import { PhoneVerificationForm } from "./PhoneVerificationForm";

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  verify: vi.fn(),
}));

vi.mock("../state/use-send-phone-otp", () => ({
  useSendPhoneOtp: () => ({ mutateAsync: mocks.send, isPending: false }),
}));

vi.mock("../state/use-verify-phone", () => ({
  useVerifyPhone: () => ({ mutateAsync: mocks.verify, isPending: false }),
}));

async function startVerification(
  user: ReturnType<typeof userEvent.setup>,
  phone = "+2348012345678",
): Promise<void> {
  await user.click(screen.getByRole("button", { name: authCopy.phoneVerification.addLabel }));
  await user.type(screen.getByLabelText(/^Phone number/), phone);
  await user.click(screen.getByRole("button", { name: authCopy.phoneVerification.sendLabel }));
}

async function enterCode(user: ReturnType<typeof userEvent.setup>, code = "123456"): Promise<void> {
  await user.type(screen.getByLabelText(/^Verification code/), code);
  await user.click(screen.getByRole("button", { name: authCopy.phoneVerification.verifyLabel }));
}

describe("PhoneVerificationForm", () => {
  beforeEach(() => {
    mocks.send.mockReset();
    mocks.verify.mockReset();
  });

  it("renders the add action with no axe violations", async () => {
    const { container } = render(<PhoneVerificationForm phone={null} verified={false} />);

    expect(
      screen.getByRole("button", { name: authCopy.phoneVerification.addLabel }),
    ).toBeInTheDocument();
    expect((await axe(container)).violations).toEqual([]);
  });

  it("offers change instead of add for a saved number", () => {
    render(<PhoneVerificationForm phone="+2348012345678" verified />);

    expect(
      screen.getByRole("button", { name: authCopy.phoneVerification.changeLabel }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(authCopy.phoneVerification.phoneLabel)).not.toBeInTheDocument();
  });

  it("offers verification for a saved number that is not verified", () => {
    render(<PhoneVerificationForm phone="+2348012345678" verified={false} />);

    expect(
      screen.getByRole("button", { name: authCopy.phoneVerification.verifyLabel }),
    ).toBeInTheDocument();
  });

  it("validates the number before calling the API", async () => {
    const user = userEvent.setup();
    render(<PhoneVerificationForm phone={null} verified={false} />);

    await user.click(screen.getByRole("button", { name: authCopy.phoneVerification.addLabel }));
    await user.type(screen.getByLabelText(/^Phone number/), "08012345678");
    await user.click(screen.getByRole("button", { name: authCopy.phoneVerification.sendLabel }));

    expect(await screen.findByText(authCopy.validation.phoneInvalid)).toBeInTheDocument();
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("sends the E.164 number and applies the API resend cooldown", async () => {
    const user = userEvent.setup();
    mocks.send.mockResolvedValue({ retry_after: 5 });
    render(<PhoneVerificationForm phone={null} verified={false} />);

    await startVerification(user);

    await waitFor(() =>
      expect(mocks.send).toHaveBeenCalledWith({
        channel: "PHONE",
        phone: "+2348012345678",
      }),
    );
    expect(await screen.findByText(authCopy.phoneVerification.sentTitle)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: authCopy.phoneVerification.cooldown(5) }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: authCopy.phoneVerification.verifyLabel }),
    ).toBeDisabled();
  });

  it("reuses the number on resend and verifies with the OTP only", async () => {
    const user = userEvent.setup();
    mocks.send.mockResolvedValue({ retry_after: 0 });
    mocks.verify.mockResolvedValue({ id: "user_1" });
    render(<PhoneVerificationForm phone={null} verified={false} />);

    await startVerification(user);
    await waitFor(() => expect(screen.getByLabelText(/^Verification code/)).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: authCopy.phoneVerification.resendLabel }));
    await waitFor(() => expect(mocks.send).toHaveBeenCalledTimes(2));
    expect(mocks.send).toHaveBeenLastCalledWith({
      channel: "PHONE",
      phone: "+2348012345678",
    });

    await enterCode(user);

    await waitFor(() => expect(mocks.verify).toHaveBeenCalledWith({ otp: "123456" }));
    expect(await screen.findByText(authCopy.phoneVerification.successTitle)).toBeInTheDocument();
  });

  it("accepts a pasted OTP", async () => {
    const user = userEvent.setup();
    mocks.send.mockResolvedValue({ retry_after: 0 });
    mocks.verify.mockResolvedValue({ id: "user_1" });
    render(<PhoneVerificationForm phone={null} verified={false} />);

    await startVerification(user);
    const code = await screen.findByLabelText(/^Verification code/);
    fireEvent.paste(code, { clipboardData: { getData: () => "123 456" } });
    expect(code).toHaveValue("123456");

    await user.click(screen.getByRole("button", { name: authCopy.phoneVerification.verifyLabel }));
    await waitFor(() => expect(mocks.verify).toHaveBeenCalledWith({ otp: "123456" }));
  });

  it("maps a 422 OTP error to fixed copy without showing backend text", async () => {
    const user = userEvent.setup();
    mocks.send.mockResolvedValue({ retry_after: 0 });
    mocks.verify.mockRejectedValue(
      makeTestApiError({
        status: 422,
        code: "VALIDATION_FAILED",
        message: "raw backend message",
        details: { otp: ["raw otp detail"] },
        requestId: "req_422",
      }),
    );
    render(<PhoneVerificationForm phone={null} verified={false} />);

    await startVerification(user);
    await enterCode(user);

    expect(await screen.findByText(authCopy.errors.code)).toBeInTheDocument();
    expect(screen.queryByText("raw backend message")).not.toBeInTheDocument();
    expect(screen.queryByText("raw otp detail")).not.toBeInTheDocument();
  });

  it("shows the sign-in path when the session has ended", async () => {
    const user = userEvent.setup();
    mocks.send.mockResolvedValue({ retry_after: 0 });
    mocks.verify.mockRejectedValue(
      makeTestApiError({
        status: 401,
        code: "UNAUTHENTICATED",
        message: "raw session detail",
        requestId: "req_401",
      }),
    );
    render(<PhoneVerificationForm phone={null} verified={false} />);

    await startVerification(user);
    await enterCode(user);

    expect(
      await screen.findByText(authCopy.phoneVerification.sessionEndedTitle),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: authCopy.phoneVerification.signInLabel }),
    ).toHaveAttribute("href", "/login");
    expect(screen.queryByText("raw session detail")).not.toBeInTheDocument();
  });

  it("backs off after a throttled verification attempt", async () => {
    const user = userEvent.setup();
    mocks.send.mockResolvedValue({ retry_after: 0 });
    mocks.verify.mockRejectedValue(
      makeTestApiError({
        status: 429,
        code: "TOO_MANY_REQUESTS",
        message: "raw throttle detail",
        requestId: "req_429",
        retryAfterSeconds: 20,
      }),
    );
    render(<PhoneVerificationForm phone={null} verified={false} />);

    await startVerification(user);
    await enterCode(user);

    expect(await screen.findByText(authCopy.login.rateLimitCountdown(20))).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: authCopy.phoneVerification.verifyLabel }),
    ).toBeDisabled();
  });
});
