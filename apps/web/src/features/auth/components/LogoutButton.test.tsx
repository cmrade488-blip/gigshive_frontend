import { errorCopy } from "@gigshive/shared/error-copy";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeTestApiError } from "../api/test-error";
import { authCopy } from "../copy/auth";
import { LogoutButton } from "./LogoutButton";

const mocks = vi.hoisted(() => ({
  logout: vi.fn(),
  pending: false,
}));

vi.mock("../state/use-logout", () => ({
  useLogout: () => ({ mutateAsync: mocks.logout, isPending: mocks.pending }),
}));

describe("LogoutButton", () => {
  beforeEach(() => {
    mocks.logout.mockReset();
    mocks.pending = false;
  });

  it("renders an accessible sign-out control", async () => {
    const { container } = render(<LogoutButton />);

    expect(screen.getByRole("button", { name: authCopy.session.logoutLabel })).toBeInTheDocument();
    expect((await axe(container)).violations).toEqual([]);
  });

  it("signs out on click", async () => {
    const user = userEvent.setup();
    mocks.logout.mockResolvedValue(undefined);
    render(<LogoutButton />);

    await user.click(screen.getByRole("button", { name: authCopy.session.logoutLabel }));

    expect(mocks.logout).toHaveBeenCalledOnce();
  });

  it("disables the control while in flight", () => {
    mocks.pending = true;
    render(<LogoutButton />);

    expect(screen.getByRole("button", { name: authCopy.session.loggingOutLabel })).toBeDisabled();
  });

  it("shows fixed copy and a support reference on failure", async () => {
    const user = userEvent.setup();
    mocks.logout.mockRejectedValue(
      makeTestApiError({
        status: 500,
        code: "SERVER_ERROR",
        message: "private server detail",
        requestId: "req_500",
      }),
    );
    render(<LogoutButton />);

    await user.click(screen.getByRole("button", { name: authCopy.session.logoutLabel }));

    expect(await screen.findByRole("alert")).toHaveTextContent(errorCopy.server.title);
    expect(screen.getByRole("alert")).toHaveTextContent("Reference: req_500");
    expect(screen.queryByText("private server detail")).not.toBeInTheDocument();
  });
});
