import { errorCopy } from "@gigshive/shared/error-copy";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeTestApiError } from "../api/test-error";
import { authCopy } from "../copy/auth";
import { RegisterScreen } from "./RegisterScreen";

const mocks = vi.hoisted(() => ({
  register: vi.fn(),
  pending: false,
}));

vi.mock("../state/use-register", () => ({
  useRegister: () => ({ mutateAsync: mocks.register, isPending: mocks.pending }),
}));

async function fillValidForm(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.type(screen.getByLabelText(/^Email/), "person@example.com");
  await user.type(screen.getByLabelText(/^Password/), "long-enough");
}

describe("RegisterScreen", () => {
  beforeEach(() => {
    mocks.register.mockReset();
    mocks.pending = false;
  });

  it("renders only API-supported fields and has no axe violations", async () => {
    const { container } = render(<RegisterScreen />);

    expect(
      screen.getByRole("heading", { level: 1, name: authCopy.register.heading }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/)).toBeInTheDocument();
    expect(screen.getByLabelText(authCopy.register.phoneLabel)).not.toBeRequired();
    expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Hire people")).not.toBeInTheDocument();
    expect((await axe(container)).violations).toEqual([]);
  });

  it("validates before submitting and focuses the first invalid field", async () => {
    const user = userEvent.setup();
    render(<RegisterScreen />);

    await user.click(screen.getByRole("button", { name: authCopy.register.submitLabel }));

    expect(await screen.findByText(authCopy.validation.emailRequired)).toBeInTheDocument();
    expect(screen.getByText(authCopy.validation.passwordRequired)).toBeInTheDocument();
    expect(mocks.register).not.toHaveBeenCalled();
    expect(document.activeElement).toHaveAttribute("type", "email");
  });

  it("submits trimmed email and optional phone only when provided", async () => {
    const user = userEvent.setup();
    mocks.register.mockResolvedValue({ email: "person@example.com", verification_required: true });
    render(<RegisterScreen />);

    await fillValidForm(user);
    await user.type(screen.getByLabelText(authCopy.register.phoneLabel), "+2348012345678");
    await user.click(screen.getByRole("button", { name: authCopy.register.submitLabel }));

    await waitFor(() =>
      expect(mocks.register).toHaveBeenCalledWith({
        email: "person@example.com",
        password: "long-enough",
        phone: "+2348012345678",
      }),
    );
    expect(
      await screen.findByRole("link", { name: authCopy.register.successActionLabel }),
    ).toHaveAttribute("href", "/verify-email");
  });

  it("maps 422 details to fixed field copy without showing backend text", async () => {
    const user = userEvent.setup();
    mocks.register.mockRejectedValue(
      makeTestApiError({
        status: 422,
        code: "VALIDATION_FAILED",
        message: "raw database detail",
        details: { email: ["raw email detail"] },
        requestId: "req_422",
      }),
    );
    render(<RegisterScreen />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: authCopy.register.submitLabel }));

    expect(await screen.findByText(authCopy.errors.email)).toBeInTheDocument();
    expect(screen.queryByText("raw database detail")).not.toBeInTheDocument();
    expect(screen.queryByText("raw email detail")).not.toBeInTheDocument();
  });

  it("shows fixed copy for a forbidden response", async () => {
    const user = userEvent.setup();
    mocks.register.mockRejectedValue(
      makeTestApiError({
        status: 403,
        code: "HTTP_403",
        message: "raw csrf detail",
        requestId: "req_403",
      }),
    );
    render(<RegisterScreen />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: authCopy.register.submitLabel }));

    expect(await screen.findByText(errorCopy.forbidden.title)).toBeInTheDocument();
    expect(screen.queryByText("raw csrf detail")).not.toBeInTheDocument();
  });

  it("shows a support reference for a server error", async () => {
    const user = userEvent.setup();
    mocks.register.mockRejectedValue(
      makeTestApiError({
        status: 503,
        code: "SERVER_ERROR",
        message: "private connection string",
        requestId: "req_503",
      }),
    );
    render(<RegisterScreen />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: authCopy.register.submitLabel }));

    expect(await screen.findByText("Reference: req_503")).toBeInTheDocument();
    expect(screen.queryByText("private connection string")).not.toBeInTheDocument();
  });

  it("disables the submit button while in flight", () => {
    mocks.pending = true;
    render(<RegisterScreen />);

    expect(screen.getByRole("button", { name: authCopy.register.submittingLabel })).toBeDisabled();
  });
});
