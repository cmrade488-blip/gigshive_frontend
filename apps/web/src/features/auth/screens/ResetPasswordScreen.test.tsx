import { errorCopy } from "@gigshive/shared/error-copy";
import { siteRoutes } from "@gigshive/shared/routes";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeTestApiError } from "../api/test-error";
import { authCopy } from "../copy/auth";
import { ResetPasswordScreen } from "./ResetPasswordScreen";

const mocks = vi.hoisted(() => ({
  reset: vi.fn(),
  pending: false,
  replace: vi.fn(),
  query: "token=reset_token",
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: () => new URLSearchParams(mocks.query),
}));

vi.mock("../state/use-reset-password", () => ({
  useResetPassword: () => ({ mutateAsync: mocks.reset, isPending: mocks.pending }),
}));

async function fillPasswords(user: ReturnType<typeof userEvent.setup>, password = "long-enough") {
  await user.type(screen.getByLabelText(/^New password/), password);
  await user.type(screen.getByLabelText(/^Confirm new password/), password);
}

async function submit(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.click(screen.getByRole("button", { name: authCopy.resetPassword.submitLabel }));
}

describe("ResetPasswordScreen", () => {
  beforeEach(() => {
    mocks.reset.mockReset();
    mocks.replace.mockReset();
    mocks.pending = false;
    mocks.query = "token=reset_token";
  });

  it("renders the form, strips the token from the URL and has no axe violations", async () => {
    const { container } = render(<ResetPasswordScreen />);

    expect(
      screen.getByRole("heading", { level: 1, name: authCopy.resetPassword.heading }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^New password/)).toHaveAttribute("autocomplete", "new-password");
    expect(mocks.replace).toHaveBeenCalledWith(siteRoutes.resetPassword);
    expect(screen.queryByText("reset_token")).not.toBeInTheDocument();
    expect((await axe(container)).violations).toEqual([]);
  });

  it("asks for a new link when the token is missing", async () => {
    mocks.query = "";
    const { container } = render(<ResetPasswordScreen />);

    expect(await screen.findByText(authCopy.resetPassword.missingTokenTitle)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: authCopy.resetPassword.requestNewLabel }),
    ).toHaveAttribute("href", siteRoutes.forgotPassword);
    expect(screen.queryByRole("button", { name: authCopy.resetPassword.submitLabel })).toBeNull();
    expect((await axe(container)).violations).toEqual([]);
  });

  it("validates password length and confirmation before submitting", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordScreen />);

    await fillPasswords(user, "short");
    await submit(user);

    expect(await screen.findByText(authCopy.validation.passwordTooShort)).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/^New password/));
    await user.clear(screen.getByLabelText(/^Confirm new password/));
    await fillPasswords(user, "long-enough");
    await user.clear(screen.getByLabelText(/^Confirm new password/));
    await user.type(screen.getByLabelText(/^Confirm new password/), "different-one");
    await submit(user);

    expect(await screen.findByText(authCopy.validation.passwordMismatch)).toBeInTheDocument();
    expect(mocks.reset).not.toHaveBeenCalled();
  });

  it("submits only the token and password then shows success", async () => {
    const user = userEvent.setup();
    mocks.reset.mockResolvedValue(undefined);
    render(<ResetPasswordScreen />);

    await fillPasswords(user);
    await submit(user);

    await waitFor(() =>
      expect(mocks.reset).toHaveBeenCalledWith({
        token: "reset_token",
        password: "long-enough",
      }),
    );
    expect(await screen.findByText(authCopy.resetPassword.successTitle)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: authCopy.resetPassword.signInLabel })).toHaveAttribute(
      "href",
      siteRoutes.login,
    );
  });

  it("offers a new link when the API rejects an expired token", async () => {
    const user = userEvent.setup();
    mocks.reset.mockRejectedValue(
      makeTestApiError({
        status: 422,
        code: "VALIDATION_FAILED",
        message: "raw token detail",
        details: { token: ["raw token detail"] },
        requestId: "req_422",
      }),
    );
    render(<ResetPasswordScreen />);

    await fillPasswords(user);
    await submit(user);

    expect(await screen.findByText(authCopy.resetPassword.expiredTitle)).toBeInTheDocument();
    expect(screen.queryByText("raw token detail")).not.toBeInTheDocument();
  });

  it("maps a password detail to fixed field copy", async () => {
    const user = userEvent.setup();
    mocks.reset.mockRejectedValue(
      makeTestApiError({
        status: 422,
        code: "VALIDATION_FAILED",
        message: "raw validation detail",
        details: { password: ["raw password detail"] },
        requestId: "req_422",
      }),
    );
    render(<ResetPasswordScreen />);

    await fillPasswords(user);
    await submit(user);

    expect(await screen.findByText(authCopy.errors.password)).toBeInTheDocument();
    expect(screen.queryByText("raw password detail")).not.toBeInTheDocument();
  });

  it("shows a Retry-After countdown and blocks submission after a 429", async () => {
    const user = userEvent.setup();
    mocks.reset.mockRejectedValue(
      makeTestApiError({
        status: 429,
        code: "TOO_MANY_REQUESTS",
        message: "raw rate detail",
        requestId: "req_429",
        retryAfterSeconds: 15,
      }),
    );
    render(<ResetPasswordScreen />);

    await fillPasswords(user);
    await submit(user);

    expect(await screen.findByText(authCopy.login.rateLimitCountdown(15))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: authCopy.resetPassword.submitLabel })).toBeDisabled();
  });

  it("shows fixed copy for a forbidden response", async () => {
    const user = userEvent.setup();
    mocks.reset.mockRejectedValue(
      makeTestApiError({
        status: 403,
        code: "HTTP_403",
        message: "raw forbidden detail",
        requestId: "req_403",
      }),
    );
    render(<ResetPasswordScreen />);

    await fillPasswords(user);
    await submit(user);

    expect(await screen.findByText(errorCopy.forbidden.title)).toBeInTheDocument();
    expect(screen.queryByText("raw forbidden detail")).not.toBeInTheDocument();
  });

  it("shows a support reference for a server error", async () => {
    const user = userEvent.setup();
    mocks.reset.mockRejectedValue(
      makeTestApiError({
        status: 500,
        code: "SERVER_ERROR",
        message: "private server detail",
        requestId: "req_500",
      }),
    );
    render(<ResetPasswordScreen />);

    await fillPasswords(user);
    await submit(user);

    expect(await screen.findByText("Reference: req_500")).toBeInTheDocument();
    expect(screen.queryByText("private server detail")).not.toBeInTheDocument();
  });

  it("disables the submit button while in flight", () => {
    mocks.pending = true;
    render(<ResetPasswordScreen />);

    expect(
      screen.getByRole("button", { name: authCopy.resetPassword.submittingLabel }),
    ).toBeDisabled();
  });
});
