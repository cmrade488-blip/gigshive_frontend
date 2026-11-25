import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeTestApiError } from "../api/test-error";
import { authCopy } from "../copy/auth";
import { VerifyEmailScreen } from "./VerifyEmailScreen";

const mocks = vi.hoisted(() => ({
  verify: vi.fn(),
  resend: vi.fn(),
}));

vi.mock("../state/use-verify-email", () => ({
  useVerifyEmail: () => ({ mutateAsync: mocks.verify, isPending: false }),
}));

vi.mock("../state/use-resend-email-otp", () => ({
  useResendEmailOtp: () => ({ mutateAsync: mocks.resend, isPending: false }),
}));

async function fillForm(user: ReturnType<typeof userEvent.setup>, otp = "123456"): Promise<void> {
  await user.type(screen.getByLabelText(/^Email/), "person@example.com");
  const input = screen.getByLabelText(/^Verification code/);
  await user.type(input, otp);
}

describe("VerifyEmailScreen", () => {
  beforeEach(() => {
    mocks.verify.mockReset();
    mocks.resend.mockReset();
  });

  it("renders the email and one-time-code fields with no axe violations", async () => {
    const { container } = render(<VerifyEmailScreen />);

    expect(
      screen.getByRole("heading", { level: 1, name: authCopy.verify.heading }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Verification code/)).toHaveAttribute(
      "autocomplete",
      "one-time-code",
    );
    expect(screen.getByRole("button", { name: authCopy.verify.resendLabel })).toBeInTheDocument();
    expect((await axe(container)).violations).toEqual([]);
  });

  it("validates before submitting", async () => {
    const user = userEvent.setup();
    render(<VerifyEmailScreen />);

    await user.click(screen.getByRole("button", { name: authCopy.verify.submitLabel }));

    expect(await screen.findByText(authCopy.validation.emailRequired)).toBeInTheDocument();
    expect(screen.getByText(authCopy.validation.codeRequired)).toBeInTheDocument();
    expect(mocks.verify).not.toHaveBeenCalled();
  });

  it("accepts a pasted code and submits normalised digits", async () => {
    const user = userEvent.setup();
    mocks.verify.mockResolvedValue({ id: "user_1" });
    render(<VerifyEmailScreen />);

    await user.type(screen.getByLabelText(/^Email/), "person@example.com");
    const code = screen.getByLabelText(/^Verification code/);
    fireEvent.paste(code, { clipboardData: { getData: () => "123 456" } });
    expect(code).toHaveValue("123456");

    await user.click(screen.getByRole("button", { name: authCopy.verify.submitLabel }));

    await waitFor(() =>
      expect(mocks.verify).toHaveBeenCalledWith({
        email: "person@example.com",
        otp: "123456",
      }),
    );
    expect(
      await screen.findByRole("link", { name: authCopy.verify.successActionLabel }),
    ).toHaveAttribute("href", "/");
  });

  it("maps a 422 code error to fixed copy", async () => {
    const user = userEvent.setup();
    mocks.verify.mockRejectedValue(
      makeTestApiError({
        status: 422,
        code: "VALIDATION_FAILED",
        message: "raw backend message",
        details: { otp: ["raw otp detail"] },
        requestId: "req_422",
      }),
    );
    render(<VerifyEmailScreen />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: authCopy.verify.submitLabel }));

    expect(await screen.findByText(authCopy.errors.code)).toBeInTheDocument();
    expect(screen.queryByText("raw backend message")).not.toBeInTheDocument();
    expect(screen.queryByText("raw otp detail")).not.toBeInTheDocument();
  });

  it("backs off after a throttled verification attempt", async () => {
    const user = userEvent.setup();
    mocks.verify.mockRejectedValue(
      makeTestApiError({
        status: 429,
        code: "TOO_MANY_REQUESTS",
        message: "raw throttle detail",
        requestId: "req_429",
        retryAfterSeconds: 30,
      }),
    );
    render(<VerifyEmailScreen />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: authCopy.verify.submitLabel }));

    expect(
      await screen.findByRole("button", { name: authCopy.verify.cooldown(30) }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: authCopy.verify.submitLabel })).toBeDisabled();
  });

  it("clears the code and starts the API cooldown when a resend succeeds", async () => {
    const user = userEvent.setup();
    mocks.resend.mockResolvedValue({ retry_after: 5 });
    render(<VerifyEmailScreen />);

    await fillForm(user, "654321");
    await user.click(screen.getByRole("button", { name: authCopy.verify.resendLabel }));

    await waitFor(() => expect(mocks.resend).toHaveBeenCalledWith("person@example.com"));
    expect(screen.getByLabelText(/^Verification code/)).toHaveValue("");
    expect(await screen.findByText(authCopy.verify.sentTitle)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: authCopy.verify.cooldown(5) })).toBeDisabled();
  });
});
