import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SessionData } from "../api/session";
import { authCopy } from "../copy/auth";
import { AccountSettingsScreen } from "./AccountSettingsScreen";

const mocks = vi.hoisted(() => ({
  pending: false,
  session: null as SessionData | null,
}));

vi.mock("../state/use-session-status", () => ({
  useSessionStatus: () => ({ isPending: mocks.pending, data: mocks.session }),
}));

vi.mock("../components/ChangePasswordForm", () => ({
  ChangePasswordForm: () => <form>Change password form</form>,
}));

vi.mock("../components/PhoneVerificationForm", () => ({
  PhoneVerificationForm: () => <form>Phone verification form</form>,
}));

const session: SessionData = {
  id: "user_1",
  email: "person@example.test",
  phone: "+2348012345678",
  email_verified_at: "2026-01-01T00:00:00Z",
  phone_verified_at: null,
  account_type: "USER",
  status: "ACTIVE",
  profiles: [
    {
      id: "profile_1",
      profile_type: "CLIENT",
      display_name: "Amaka",
      status: "ACTIVE",
    },
  ],
  abilities: ["client"],
};

describe("AccountSettingsScreen", () => {
  beforeEach(() => {
    mocks.pending = false;
    mocks.session = null;
  });

  it("shows a loading state while checking the session", () => {
    mocks.pending = true;
    render(<AccountSettingsScreen />);

    expect(screen.getByRole("status")).toHaveTextContent(authCopy.settings.loading);
  });

  it("asks a signed-out visitor to sign in", () => {
    render(<AccountSettingsScreen />);

    expect(screen.getByText(authCopy.settings.signedOutTitle)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: authCopy.settings.signInLabel })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("hides settings from a non-active account", () => {
    mocks.session = { ...session, status: "SUSPENDED" };
    render(<AccountSettingsScreen />);

    expect(screen.getByText(authCopy.settings.unavailableTitle)).toBeInTheDocument();
    expect(screen.queryByText(authCopy.settings.detailsTitle)).not.toBeInTheDocument();
  });

  it("renders sign in details, profile status and both settings forms", async () => {
    mocks.session = session;
    const { container } = render(<AccountSettingsScreen />);

    expect(
      screen.getByRole("heading", { level: 1, name: authCopy.settings.heading }),
    ).toBeInTheDocument();
    expect(screen.getByText("person@example.test")).toBeInTheDocument();
    expect(screen.getByText("+2348012345678")).toBeInTheDocument();
    expect(screen.getAllByText(authCopy.settings.verified)).toHaveLength(1);
    expect(screen.getByText(authCopy.settings.notVerified)).toBeInTheDocument();
    expect(screen.getByText("Amaka")).toBeInTheDocument();
    expect(screen.getByText(authCopy.settings.profileStatus.ACTIVE)).toBeInTheDocument();
    expect(screen.getByText("Change password form")).toBeInTheDocument();
    expect(screen.getByText("Phone verification form")).toBeInTheDocument();
    expect((await axe(container)).violations).toEqual([]);
  });

  it("shows the empty profile state", () => {
    mocks.session = { ...session, profiles: [] };
    render(<AccountSettingsScreen />);

    expect(screen.getByText(authCopy.settings.profilesEmpty)).toBeInTheDocument();
  });
});
