import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getJobById } from "../api/jobs";
import { JobApplyCard } from "./JobApplyCard";

const mocks = vi.hoisted(() => ({
  status: "ANONYMOUS",
  suspended: false,
}));

vi.mock("@/features/auth", () => ({
  useSessionStatus: () => ({ data: null }),
  sessionStatus: () => mocks.status,
  hasSuspendedProfile: () => mocks.suspended,
}));

const job = getJobById("sample-clinic-site");
if (!job) {
  throw new Error("JobApplyCard test fixture is missing.");
}

describe("JobApplyCard", () => {
  beforeEach(() => {
    mocks.status = "ANONYMOUS";
    mocks.suspended = false;
  });

  it("offers sign-in to anonymous visitors and has no axe violations", async () => {
    const { container } = render(<JobApplyCard job={job} />);

    expect(screen.getByRole("link", { name: "Sign in to send a proposal" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect((await axe(container)).violations).toEqual([]);
  });

  it("gates the proposal action for unverified users", () => {
    mocks.status = "UNVERIFIED";
    render(<JobApplyCard job={job} />);

    expect(
      screen.getByRole("link", { name: "Verify your email to send a proposal" }),
    ).toHaveAttribute("href", "/verify-email");
    expect(screen.queryByRole("link", { name: "Sign in to send a proposal" })).toBeNull();
  });

  it("explains the gate for suspended profiles", () => {
    mocks.status = "AUTHENTICATED";
    mocks.suspended = true;
    render(<JobApplyCard job={job} />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Your profile is suspended, so you cannot send proposals right now.",
    );
    expect(screen.queryByRole("link", { name: /proposal/ })).toBeNull();
  });
});
