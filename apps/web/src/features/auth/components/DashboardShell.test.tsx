import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeTestProfile, makeTestSession } from "../__tests__/session-fixtures";
import type { SessionData } from "../api/session";
import { dashboardCopy } from "../copy/dashboard";
import { DashboardShell } from "./DashboardShell";

const mocks = vi.hoisted(() => ({
  session: null as SessionData | null,
  isPending: false,
  isError: false,
  pathname: "/dashboard",
  refetch: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
}));

vi.mock("../state/use-session-status", () => ({
  sessionQueryKey: ["auth", "session"],
  useSessionStatus: () => ({
    data: mocks.session,
    isPending: mocks.isPending,
    isError: mocks.isError,
    refetch: mocks.refetch,
  }),
}));

function renderShell() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <DashboardShell>
        <p>dashboard content</p>
      </DashboardShell>
    </QueryClientProvider>,
  );
}

describe("DashboardShell", () => {
  beforeEach(() => {
    mocks.session = null;
    mocks.isPending = false;
    mocks.isError = false;
    mocks.pathname = "/dashboard";
    mocks.refetch.mockReset();
  });

  it("announces the session check while /me is pending", () => {
    mocks.isPending = true;
    renderShell();

    expect(screen.getByRole("status")).toHaveTextContent(dashboardCopy.states.loading);
    expect(screen.queryByText("dashboard content")).not.toBeInTheDocument();
  });

  it("offers a retry without showing backend error text", async () => {
    mocks.isError = true;
    const user = userEvent.setup();
    renderShell();

    expect(screen.getByRole("alert")).toHaveTextContent(dashboardCopy.states.errorTitle);
    await user.click(screen.getByRole("button", { name: dashboardCopy.states.retryLabel }));
    expect(mocks.refetch).toHaveBeenCalledOnce();
  });

  it("shows a forbidden state for a staff session", () => {
    mocks.session = makeTestSession({ account_type: "STAFF" });
    renderShell();

    expect(screen.getByRole("alert")).toHaveTextContent(dashboardCopy.states.forbiddenTitle);
    expect(screen.queryByText("dashboard content")).not.toBeInTheDocument();
  });

  it("renders the active role and switches navigation from the profile types", async () => {
    mocks.session = makeTestSession({
      profiles: [
        makeTestProfile({ profile_type: "CLIENT", worker_type: null }),
        makeTestProfile({ profile_type: "WORKER", worker_type: "CREATOR" }),
      ],
    });
    const user = userEvent.setup();
    renderShell();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      dashboardCopy.topbar.CLIENT.title,
    );
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("aria-current", "page");

    await user.click(screen.getByRole("button", { name: dashboardCopy.shell.roles.WORKER }));

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      dashboardCopy.topbar.WORKER.title,
    );
    expect(screen.getAllByRole("link", { name: "Find work" })).not.toHaveLength(0);
    expect(screen.getByRole("button", { name: dashboardCopy.shell.roles.WORKER })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("dashboard content")).toBeInTheDocument();
  });

  it("starts on the only role available to a worker-only session", () => {
    mocks.session = makeTestSession({
      profiles: [makeTestProfile({ profile_type: "WORKER", worker_type: "CREATOR" })],
    });
    renderShell();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      dashboardCopy.topbar.WORKER.title,
    );
    expect(
      screen.queryByRole("button", { name: dashboardCopy.shell.roles.CLIENT }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Find work" })).not.toHaveLength(0);
  });

  it("starts keyboard focus at the skip link and has no axe violations", async () => {
    mocks.session = makeTestSession();
    const user = userEvent.setup();
    const { container } = renderShell();

    await user.tab();
    expect(screen.getByRole("link", { name: dashboardCopy.shell.skipToContent })).toHaveFocus();
    expect((await axe(container)).violations).toEqual([]);
  });
});
