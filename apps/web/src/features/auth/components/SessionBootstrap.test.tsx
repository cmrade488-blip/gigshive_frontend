import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sessionClient } from "@/lib/api";

import { makeTestSession } from "../__tests__/session-fixtures";
import type { SessionData } from "../api/session";
import { sessionQueryKey } from "../state/use-session-status";
import { SessionBootstrap } from "./SessionBootstrap";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  sessionCheck: vi.fn(),
  pathname: "/",
  session: null as SessionData | null,
  isPending: false,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock("../state/use-session-status", () => ({
  sessionQueryKey: ["auth", "session"],
  useSessionStatus: () => {
    mocks.sessionCheck();
    return { data: mocks.session, isPending: mocks.isPending };
  },
}));

function unauthorisedResponse(): Response {
  return new Response(
    JSON.stringify({
      error: {
        code: "UNAUTHENTICATED",
        message: "raw backend message",
        details: null,
        request_id: "req_401",
      },
    }),
    { status: 401, headers: { "Content-Type": "application/json" } },
  );
}

function renderBootstrap() {
  const queryClient = new QueryClient();
  const setQueryData = vi.spyOn(queryClient, "setQueryData");
  render(
    <QueryClientProvider client={queryClient}>
      <SessionBootstrap>
        <p>page content</p>
      </SessionBootstrap>
    </QueryClientProvider>,
  );
  return { setQueryData };
}

describe("SessionBootstrap", () => {
  beforeEach(() => {
    mocks.replace.mockReset();
    mocks.sessionCheck.mockReset();
    mocks.pathname = "/";
    mocks.session = null;
    mocks.isPending = false;
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.history.replaceState({}, "", "/");
  });

  it("seeds the session query on mount and renders public pages", () => {
    renderBootstrap();

    expect(mocks.sessionCheck).toHaveBeenCalledOnce();
    expect(screen.getByText("page content")).toBeInTheDocument();
  });

  it("withholds a private page and returns an anonymous user to sign-in", async () => {
    mocks.pathname = "/settings/account";
    window.history.replaceState({}, "", "/settings/account?tab=security");
    renderBootstrap();

    expect(screen.queryByText("page content")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Checking your session");
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith(
        "/login?next=%2Fsettings%2Faccount%3Ftab%3Dsecurity",
      ),
    );
  });

  it("waits for the session check before deciding on a private route", () => {
    mocks.pathname = "/settings/account";
    mocks.isPending = true;
    renderBootstrap();

    expect(screen.queryByText("page content")).not.toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("sends a signed-in user away from an auth page", async () => {
    mocks.pathname = "/login";
    mocks.session = makeTestSession();
    renderBootstrap();

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/dashboard"));
  });

  it("allows an unverified user to reach the verification screen", () => {
    mocks.pathname = "/verify-email";
    mocks.session = makeTestSession({ email_verified_at: null });
    renderBootstrap();

    expect(screen.getByText("page content")).toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("clears the session and restores the destination after a 401", async () => {
    mocks.pathname = "/settings/account";
    mocks.session = makeTestSession();
    window.history.replaceState({}, "", "/settings/account?tab=security");
    const { setQueryData } = renderBootstrap();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => unauthorisedResponse()),
    );

    await expect(sessionClient.get("/me")).rejects.toMatchObject({ status: 401 });

    expect(setQueryData).toHaveBeenCalledWith(sessionQueryKey, null);
    expect(mocks.replace).toHaveBeenCalledWith(
      "/login?next=%2Fsettings%2Faccount%3Ftab%3Dsecurity",
    );
  });

  it("redirects only once for repeated 401 responses", async () => {
    mocks.pathname = "/jobs";
    window.history.replaceState({}, "", "/jobs");
    renderBootstrap();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => unauthorisedResponse()),
    );

    await expect(sessionClient.get("/me")).rejects.toMatchObject({ status: 401 });
    await expect(sessionClient.get("/me")).rejects.toMatchObject({ status: 401 });

    expect(mocks.replace).toHaveBeenCalledTimes(1);
    expect(mocks.replace).toHaveBeenCalledWith("/login?next=%2Fjobs");
  });

  it("does not redirect again from a sign-in page", async () => {
    mocks.pathname = "/login";
    window.history.replaceState({}, "", "/login?next=%2Fdashboard");
    const { setQueryData } = renderBootstrap();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => unauthorisedResponse()),
    );

    await expect(sessionClient.get("/me")).rejects.toMatchObject({ status: 401 });

    expect(setQueryData).toHaveBeenCalledWith(sessionQueryKey, null);
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});
