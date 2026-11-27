import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { makeTestProfile, makeTestSession } from "../__tests__/session-fixtures";
import { dashboardCopy } from "../copy/dashboard";
import { DashboardRoleProvider } from "../state/dashboard-role";
import { DashboardScreen } from "./DashboardScreen";

function renderScreen(session: Parameters<typeof DashboardRoleProvider>[0]["session"]) {
  return render(
    <DashboardRoleProvider session={session}>
      <DashboardScreen />
    </DashboardRoleProvider>,
  );
}

describe("DashboardScreen", () => {
  it("shows an accessible loading state without a session", () => {
    renderScreen(null);

    expect(screen.getByRole("status")).toHaveTextContent(dashboardCopy.states.loading);
  });

  it("renders session banners and next actions with no raw status codes", async () => {
    const session = makeTestSession({
      email_verified_at: null,
      profiles: [
        makeTestProfile({
          profile_type: "CLIENT",
          worker_type: null,
          status: "REJECTED",
          status_reason: "Add a category",
        }),
      ],
    });
    const { container } = renderScreen(session);

    expect(screen.getByText(dashboardCopy.status.emailUnverified.title)).toBeInTheDocument();
    expect(
      screen.getByText(dashboardCopy.status.profile.REJECTED.title("Client profile")),
    ).toBeInTheDocument();
    expect(screen.getByText(/Add a category/)).toBeInTheDocument();
    expect(screen.queryByText("REJECTED")).not.toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: dashboardCopy.actions.items.verifyEmail.label }),
    ).not.toHaveLength(0);
    expect(
      screen.getAllByRole("link", { name: dashboardCopy.actions.items.viewProfile.label }),
    ).not.toHaveLength(0);
    expect((await axe(container)).violations).toEqual([]);
  });

  it("shows setup actions when the selected role has no profile", async () => {
    const session = makeTestSession({ profiles: [] });
    const { container } = renderScreen(session);

    expect(screen.getByText(dashboardCopy.status.noProfile.title)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: dashboardCopy.actions.items.createClientProfile.label }),
    ).toBeInTheDocument();
    expect((await axe(container)).violations).toEqual([]);
  });

  it("formats the suspension end date and shows no unsupported action", () => {
    const session = makeTestSession({
      profiles: [
        makeTestProfile({
          profile_type: "CLIENT",
          worker_type: null,
          status: "SUSPENDED",
          status_reason: "Temporary review",
          suspended_until: "2026-12-01T00:00:00.000Z",
        }),
      ],
    });
    renderScreen(session);

    expect(screen.getByText(new RegExp(dashboardCopy.status.untilLabel))).toBeInTheDocument();
    expect(screen.getByText(/1 Dec 2026/)).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: dashboardCopy.actions.items.viewProfile.label }),
    ).not.toHaveLength(0);
    expect(
      screen.queryByRole("link", { name: dashboardCopy.actions.items.browseWorkers.label }),
    ).not.toBeInTheDocument();
  });

  it("limits a suspended account to account settings", () => {
    renderScreen(makeTestSession({ status: "SUSPENDED" }));

    expect(
      screen.getAllByRole("link", { name: dashboardCopy.actions.items.accountSettings.label }),
    ).not.toHaveLength(0);
    expect(
      screen.queryByRole("link", { name: dashboardCopy.actions.items.browseWorkers.label }),
    ).not.toBeInTheDocument();
  });

  it("does not offer email verification from a suspended account banner", () => {
    renderScreen(makeTestSession({ status: "SUSPENDED", email_verified_at: null }));

    expect(screen.getByText(dashboardCopy.status.emailUnverified.title)).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: dashboardCopy.actions.items.verifyEmail.label }),
    ).not.toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: dashboardCopy.actions.items.accountSettings.label }),
    ).not.toHaveLength(0);
  });

  it("uses worker actions for a worker-only session", () => {
    renderScreen(
      makeTestSession({
        profiles: [makeTestProfile({ profile_type: "WORKER", worker_type: "CREATOR" })],
      }),
    );

    expect(
      screen.getByRole("link", { name: dashboardCopy.actions.items.browseJobs.label }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: dashboardCopy.actions.items.browseWorkers.label }),
    ).not.toBeInTheDocument();
  });

  it("shows an empty status state and a browse action for a verified active client", async () => {
    const session = makeTestSession({
      profiles: [makeTestProfile({ profile_type: "CLIENT", worker_type: null, status: "ACTIVE" })],
    });
    const { container } = renderScreen(session);

    expect(screen.getByText(dashboardCopy.actions.emptyTitle)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: dashboardCopy.actions.items.browseWorkers.label }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: dashboardCopy.actions.items.verifyEmail.label }),
    ).not.toBeInTheDocument();
    expect((await axe(container)).violations).toEqual([]);
  });

  it("shows an empty next-actions state while a profile is in review", async () => {
    const session = makeTestSession({
      profiles: [
        makeTestProfile({ profile_type: "CLIENT", worker_type: null, status: "SUBMITTED" }),
      ],
    });
    const { container } = renderScreen(session);

    expect(screen.getByText(dashboardCopy.actions.emptyTitle)).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: dashboardCopy.actions.items.browseWorkers.label }),
    ).not.toBeInTheDocument();
    expect((await axe(container)).violations).toEqual([]);
  });
});
