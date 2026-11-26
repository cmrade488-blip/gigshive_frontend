import { errorCopy, type ErrorCopyKind } from "@gigshive/shared/error-copy";
import { siteRoutes } from "@gigshive/shared/routes";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeTestApiError } from "../api/test-error";
import { authCopy } from "../copy/auth";
import { LoginScreen } from "./LoginScreen";

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  pending: false,
  push: vi.fn(),
  search: "",
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
  useSearchParams: () => new URLSearchParams(mocks.search),
}));

vi.mock("../state/use-login", () => ({
  useLogin: () => ({ mutateAsync: mocks.login, isPending: mocks.pending }),
}));

async function fillValidForm(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.type(screen.getByLabelText(/^Email/), "  person@example.com  ");
  await user.type(screen.getByLabelText(/^Password/), "correct horse");
}

async function submit(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.click(screen.getByRole("button", { name: authCopy.login.submitLabel }));
}

function fixedCopy(kind: ErrorCopyKind) {
  return errorCopy[kind];
}

describe("LoginScreen", () => {
  beforeEach(() => {
    mocks.login.mockReset();
    mocks.push.mockReset();
    mocks.pending = false;
    mocks.search = "";
  });

  it("renders the sign-in form and tabs with no axe violations", async () => {
    const { container } = render(<LoginScreen />);

    expect(
      screen.getByRole("heading", { level: 1, name: authCopy.login.heading }),
    ).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: authCopy.tabs.label })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/)).toHaveAttribute("autocomplete", "email");
    expect(screen.getByLabelText(/^Password/)).toHaveAttribute("autocomplete", "current-password");
    expect(screen.queryByText(/forgot password/i)).not.toBeInTheDocument();
    expect((await axe(container)).violations).toEqual([]);
  });

  it("validates before submitting and focuses the first invalid field", async () => {
    const user = userEvent.setup();
    render(<LoginScreen />);

    await submit(user);

    expect(await screen.findByText(authCopy.validation.emailRequired)).toBeInTheDocument();
    expect(screen.getByText(authCopy.validation.passwordRequired)).toBeInTheDocument();
    expect(mocks.login).not.toHaveBeenCalled();
    expect(document.activeElement).toHaveAttribute("type", "email");
  });

  it("submits a trimmed email and follows a safe return path", async () => {
    const user = userEvent.setup();
    mocks.search = "next=/jobs?category=design";
    mocks.login.mockResolvedValue({ id: "user_1" });
    render(<LoginScreen />);

    await fillValidForm(user);
    await submit(user);

    await waitFor(() =>
      expect(mocks.login).toHaveBeenCalledWith({
        email: "person@example.com",
        password: "correct horse",
      }),
    );
    expect(mocks.push).toHaveBeenCalledWith("/jobs?category=design");
  });

  it("falls back to the dashboard for an unsafe return path", async () => {
    const user = userEvent.setup();
    mocks.search = "next=https://evil.example/steal";
    mocks.login.mockResolvedValue({ id: "user_1" });
    render(<LoginScreen />);

    await fillValidForm(user);
    await submit(user);

    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith(siteRoutes.dashboard));
  });

  it("shows fixed invalid-credentials copy for a 401", async () => {
    const user = userEvent.setup();
    mocks.login.mockRejectedValue(
      makeTestApiError({
        status: 401,
        code: "INVALID_CREDENTIALS",
        message: "raw database detail",
        requestId: "req_401",
      }),
    );
    render(<LoginScreen />);

    await fillValidForm(user);
    await submit(user);

    expect(await screen.findByText(authCopy.login.invalidCredentialsTitle)).toBeInTheDocument();
    expect(screen.getByText(authCopy.login.invalidCredentialsDescription)).toBeInTheDocument();
    expect(screen.queryByText("raw database detail")).not.toBeInTheDocument();
  });

  it("maps 422 details to fixed field copy", async () => {
    const user = userEvent.setup();
    mocks.login.mockRejectedValue(
      makeTestApiError({
        status: 422,
        code: "VALIDATION_FAILED",
        message: "raw validation detail",
        details: { email: ["raw email detail"] },
        requestId: "req_422",
      }),
    );
    render(<LoginScreen />);

    await fillValidForm(user);
    await submit(user);

    expect(await screen.findByText(authCopy.errors.email)).toBeInTheDocument();
    expect(screen.queryByText("raw validation detail")).not.toBeInTheDocument();
    expect(screen.queryByText("raw email detail")).not.toBeInTheDocument();
  });

  it("shows a Retry-After countdown and blocks submission after a 429", async () => {
    const user = userEvent.setup();
    mocks.login.mockRejectedValue(
      makeTestApiError({
        status: 429,
        code: "TOO_MANY_REQUESTS",
        message: "raw rate detail",
        requestId: "req_429",
        retryAfterSeconds: 17,
      }),
    );
    render(<LoginScreen />);

    await fillValidForm(user);
    await submit(user);

    expect(await screen.findByText(authCopy.login.rateLimitCountdown(17))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: authCopy.login.submitLabel })).toBeDisabled();
    expect(screen.queryByText("raw rate detail")).not.toBeInTheDocument();
  });

  it("shows fixed copy for a forbidden response", async () => {
    const user = userEvent.setup();
    mocks.login.mockRejectedValue(
      makeTestApiError({
        status: 403,
        code: "HTTP_403",
        message: "raw csrf detail",
        requestId: "req_403",
      }),
    );
    render(<LoginScreen />);

    await fillValidForm(user);
    await submit(user);

    expect(await screen.findByText(fixedCopy("forbidden").title)).toBeInTheDocument();
    expect(screen.queryByText("raw csrf detail")).not.toBeInTheDocument();
  });

  it("shows a support reference for a server error", async () => {
    const user = userEvent.setup();
    mocks.login.mockRejectedValue(
      makeTestApiError({
        status: 503,
        code: "SERVER_ERROR",
        message: "private connection string",
        requestId: "req_503",
      }),
    );
    render(<LoginScreen />);

    await fillValidForm(user);
    await submit(user);

    expect(await screen.findByText("Reference: req_503")).toBeInTheDocument();
    expect(screen.queryByText("private connection string")).not.toBeInTheDocument();
  });

  it("disables the submit button while in flight", () => {
    mocks.pending = true;
    render(<LoginScreen />);

    expect(screen.getByRole("button", { name: authCopy.login.submittingLabel })).toBeDisabled();
  });
});
