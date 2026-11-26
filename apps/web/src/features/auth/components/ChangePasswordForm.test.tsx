import { errorCopy } from "@gigshive/shared/error-copy";
import { siteRoutes } from "@gigshive/shared/routes";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeTestApiError } from "../api/test-error";
import { authCopy } from "../copy/auth";
import { ChangePasswordForm } from "./ChangePasswordForm";

const mocks = vi.hoisted(() => ({
  change: vi.fn(),
  pending: false,
}));

vi.mock("../state/use-change-password", () => ({
  useChangePassword: () => ({ mutateAsync: mocks.change, isPending: mocks.pending }),
}));

async function fillPasswords(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^Current password/), "old-password");
  await user.type(screen.getByLabelText(/^New password/), "new-password");
}

async function submit(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.click(screen.getByRole("button", { name: authCopy.changePassword.submitLabel }));
}

describe("ChangePasswordForm", () => {
  beforeEach(() => {
    mocks.change.mockReset();
    mocks.pending = false;
  });

  it("renders the settings section and has no axe violations", async () => {
    const { container } = render(<ChangePasswordForm />);

    expect(
      screen.getByRole("heading", { level: 2, name: authCopy.changePassword.heading }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^Current password/)).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
    expect(screen.getByLabelText(/^New password/)).toHaveAttribute("autocomplete", "new-password");
    expect((await axe(container)).violations).toEqual([]);
  });

  it("validates both fields before submitting", async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm />);

    await submit(user);

    expect(
      await screen.findByText(authCopy.validation.currentPasswordRequired),
    ).toBeInTheDocument();
    expect(screen.getByText(authCopy.validation.passwordRequired)).toBeInTheDocument();
    expect(mocks.change).not.toHaveBeenCalled();
    expect(document.activeElement).toHaveAttribute("autocomplete", "current-password");
  });

  it("submits contract fields, clears the inputs and shows success", async () => {
    const user = userEvent.setup();
    mocks.change.mockResolvedValue(undefined);
    render(<ChangePasswordForm />);

    await fillPasswords(user);
    await submit(user);

    await waitFor(() =>
      expect(mocks.change).toHaveBeenCalledWith({
        current_password: "old-password",
        password: "new-password",
      }),
    );
    expect(await screen.findByText(authCopy.changePassword.successTitle)).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("old-password");
    expect(document.body.textContent).not.toContain("new-password");
  });

  it("shows fixed field copy for a wrong current password without ending the session", async () => {
    const user = userEvent.setup();
    mocks.change.mockRejectedValue(
      makeTestApiError({
        status: 422,
        code: "VALIDATION_FAILED",
        message: "raw current password detail",
        details: { current_password: ["raw current password detail"] },
        requestId: "req_422",
      }),
    );
    render(<ChangePasswordForm />);

    await fillPasswords(user);
    await submit(user);

    expect(await screen.findByText(authCopy.errors.currentPassword)).toBeInTheDocument();
    expect(screen.queryByText("raw current password detail")).not.toBeInTheDocument();
    expect(screen.queryByText(authCopy.changePassword.sessionEndedTitle)).not.toBeInTheDocument();
  });

  it("offers sign-in when the session has expired", async () => {
    const user = userEvent.setup();
    mocks.change.mockRejectedValue(
      makeTestApiError({
        status: 401,
        code: "UNAUTHENTICATED",
        message: "raw session detail",
        requestId: "req_401",
      }),
    );
    render(<ChangePasswordForm />);

    await fillPasswords(user);
    await submit(user);

    expect(await screen.findByText(authCopy.changePassword.sessionEndedTitle)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: authCopy.changePassword.signInLabel })).toHaveAttribute(
      "href",
      siteRoutes.login,
    );
    expect(screen.queryByText("raw session detail")).not.toBeInTheDocument();
  });

  it("shows a Retry-After countdown and blocks submission after a 429", async () => {
    const user = userEvent.setup();
    mocks.change.mockRejectedValue(
      makeTestApiError({
        status: 429,
        code: "TOO_MANY_REQUESTS",
        message: "raw rate detail",
        requestId: "req_429",
        retryAfterSeconds: 20,
      }),
    );
    render(<ChangePasswordForm />);

    await fillPasswords(user);
    await submit(user);

    expect(await screen.findByText(authCopy.login.rateLimitCountdown(20))).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: authCopy.changePassword.submitLabel }),
    ).toBeDisabled();
  });

  it("shows fixed copy for a forbidden response", async () => {
    const user = userEvent.setup();
    mocks.change.mockRejectedValue(
      makeTestApiError({
        status: 403,
        code: "HTTP_403",
        message: "raw forbidden detail",
        requestId: "req_403",
      }),
    );
    render(<ChangePasswordForm />);

    await fillPasswords(user);
    await submit(user);

    expect(await screen.findByText(errorCopy.forbidden.title)).toBeInTheDocument();
    expect(screen.queryByText("raw forbidden detail")).not.toBeInTheDocument();
  });

  it("shows a support reference for a server error", async () => {
    const user = userEvent.setup();
    mocks.change.mockRejectedValue(
      makeTestApiError({
        status: 503,
        code: "SERVER_ERROR",
        message: "private server detail",
        requestId: "req_503",
      }),
    );
    render(<ChangePasswordForm />);

    await fillPasswords(user);
    await submit(user);

    expect(await screen.findByText("Reference: req_503")).toBeInTheDocument();
    expect(screen.queryByText("private server detail")).not.toBeInTheDocument();
  });

  it("disables the submit button while in flight", () => {
    mocks.pending = true;
    render(<ChangePasswordForm />);

    expect(
      screen.getByRole("button", { name: authCopy.changePassword.submittingLabel }),
    ).toBeDisabled();
  });
});
