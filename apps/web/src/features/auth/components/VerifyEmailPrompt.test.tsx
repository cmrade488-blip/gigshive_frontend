import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeTestSession } from "../__tests__/session-fixtures";
import { VerifyEmailPrompt } from "./VerifyEmailPrompt";

const mocks = vi.hoisted(() => ({
  pathname: "/jobs",
  session: null as ReturnType<typeof makeTestSession> | null,
}));

vi.mock("next/navigation", () => ({ usePathname: () => mocks.pathname }));

vi.mock("../state/use-session-status", () => ({
  useSessionStatus: () => ({ data: mocks.session }),
}));

describe("VerifyEmailPrompt", () => {
  beforeEach(() => {
    mocks.pathname = "/jobs";
    mocks.session = null;
  });

  it("shows a persistent prompt with a link to verification for unverified users", async () => {
    mocks.session = makeTestSession({ email_verified_at: null });
    const { container } = render(<VerifyEmailPrompt />);

    expect(screen.getByRole("status")).toHaveTextContent("Verify your email");
    expect(screen.getByRole("link", { name: "Verify now" })).toHaveAttribute(
      "href",
      "/verify-email",
    );
    expect((await axe(container)).violations).toEqual([]);
  });

  it("does not repeat the prompt on the verification screen", () => {
    mocks.pathname = "/verify-email";
    mocks.session = makeTestSession({ email_verified_at: null });
    render(<VerifyEmailPrompt />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("is hidden for verified, suspended and signed-out users", () => {
    mocks.session = makeTestSession();
    const { rerender } = render(<VerifyEmailPrompt />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    mocks.session = makeTestSession({ email_verified_at: null, status: "SUSPENDED" });
    rerender(<VerifyEmailPrompt />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    mocks.session = null;
    rerender(<VerifyEmailPrompt />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
