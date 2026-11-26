import { errorCopy } from "@gigshive/shared/error-copy";
import { siteRoutes } from "@gigshive/shared/routes";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeTestApiError } from "../api/test-error";
import { authCopy } from "../copy/auth";
import { ForgotPasswordScreen } from "./ForgotPasswordScreen";

const mocks = vi.hoisted(() => ({
  forgot: vi.fn(),
  pending: false,
}));

vi.mock("../state/use-forgot-password", () => ({
  useForgotPassword: () => ({ mutateAsync: mocks.forgot, isPending: mocks.pending }),
}));

async function submit(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.click(screen.getByRole("button", { name: authCopy.forgotPassword.submitLabel }));
}

describe("ForgotPasswordScreen", () => {
  beforeEach(() => {
    mocks.forgot.mockReset();
    mocks.pending = false;
  });

  it("renders the form and has no axe violations", async () => {
    const { container } = render(<ForgotPasswordScreen />);

    expect(
      screen.getByRole("heading", { level: 1, name: authCopy.forgotPassword.heading }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/)).toHaveAttribute("autocomplete", "email");
    expect((await axe(container)).violations).toEqual([]);
  });

  it("validates the address before submitting", async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordScreen />);

    await submit(user);

    expect(await screen.findByText(authCopy.validation.emailRequired)).toBeInTheDocument();
    expect(mocks.forgot).not.toHaveBeenCalled();
    expect(document.activeElement).toHaveAttribute("type", "email");
  });

  it("submits a trimmed email and shows enumeration-safe confirmation", async () => {
    const user = userEvent.setup();
    mocks.forgot.mockResolvedValue({ sent: true });
    render(<ForgotPasswordScreen />);

    await user.type(screen.getByLabelText(/^Email/), "  person@example.com  ");
    await submit(user);

    await waitFor(() => expect(mocks.forgot).toHaveBeenCalledWith({ email: "person@example.com" }));
    expect(await screen.findByText(authCopy.forgotPassword.sentTitle)).toBeInTheDocument();
    expect(screen.getByText(authCopy.forgotPassword.sentText)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: authCopy.forgotPassword.backToSignIn }),
    ).toHaveAttribute("href", siteRoutes.login);
  });

  it("maps 422 details to fixed field copy", async () => {
    const user = userEvent.setup();
    mocks.forgot.mockRejectedValue(
      makeTestApiError({
        status: 422,
        code: "VALIDATION_FAILED",
        message: "raw validation detail",
        details: { email: ["raw email detail"] },
        requestId: "req_422",
      }),
    );
    render(<ForgotPasswordScreen />);

    await user.type(screen.getByLabelText(/^Email/), "person@example.com");
    await submit(user);

    expect(await screen.findByText(authCopy.errors.email)).toBeInTheDocument();
    expect(screen.queryByText("raw validation detail")).not.toBeInTheDocument();
    expect(screen.queryByText("raw email detail")).not.toBeInTheDocument();
  });

  it("shows a Retry-After countdown and blocks submission after a 429", async () => {
    const user = userEvent.setup();
    mocks.forgot.mockRejectedValue(
      makeTestApiError({
        status: 429,
        code: "TOO_MANY_REQUESTS",
        message: "raw rate detail",
        requestId: "req_429",
        retryAfterSeconds: 12,
      }),
    );
    render(<ForgotPasswordScreen />);

    await user.type(screen.getByLabelText(/^Email/), "person@example.com");
    await submit(user);

    expect(await screen.findByText(authCopy.login.rateLimitCountdown(12))).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: authCopy.forgotPassword.submitLabel }),
    ).toBeDisabled();
    expect(screen.queryByText("raw rate detail")).not.toBeInTheDocument();
  });

  it("shows fixed copy for a forbidden response", async () => {
    const user = userEvent.setup();
    mocks.forgot.mockRejectedValue(
      makeTestApiError({
        status: 403,
        code: "HTTP_403",
        message: "raw csrf detail",
        requestId: "req_403",
      }),
    );
    render(<ForgotPasswordScreen />);

    await user.type(screen.getByLabelText(/^Email/), "person@example.com");
    await submit(user);

    expect(await screen.findByText(errorCopy.forbidden.title)).toBeInTheDocument();
    expect(screen.queryByText("raw csrf detail")).not.toBeInTheDocument();
  });

  it("shows a support reference for a server error", async () => {
    const user = userEvent.setup();
    mocks.forgot.mockRejectedValue(
      makeTestApiError({
        status: 503,
        code: "SERVER_ERROR",
        message: "private connection string",
        requestId: "req_503",
      }),
    );
    render(<ForgotPasswordScreen />);

    await user.type(screen.getByLabelText(/^Email/), "person@example.com");
    await submit(user);

    expect(await screen.findByText("Reference: req_503")).toBeInTheDocument();
    expect(screen.queryByText("private connection string")).not.toBeInTheDocument();
  });

  it("disables the submit button while in flight", () => {
    mocks.pending = true;
    render(<ForgotPasswordScreen />);

    expect(
      screen.getByRole("button", { name: authCopy.forgotPassword.submittingLabel }),
    ).toBeDisabled();
  });
});
