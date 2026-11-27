import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { makeSessionUser, makeStaffSessionUser } from "@gigshive/testing";
import { axe } from "jest-axe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sessionClient } from "@/lib/api";

import type { ConsoleSession } from "../api/session";
import { ConsoleSessionBootstrap } from "./ConsoleSessionBootstrap";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  sessionCheck: vi.fn(),
  pathname: "/",
  session: null as ConsoleSession | null,
  isPending: false,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock("../state/use-session-status", () => ({
  consoleSessionQueryKey: ["admin", "session"],
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
  const rendered = render(
    <QueryClientProvider client={queryClient}>
      <ConsoleSessionBootstrap>
        <p>console content</p>
      </ConsoleSessionBootstrap>
    </QueryClientProvider>,
  );
  return { container: rendered.container, setQueryData };
}

describe("ConsoleSessionBootstrap", () => {
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

  it("seeds the shared session query and renders console pages", () => {
    mocks.session = makeStaffSessionUser();
    renderBootstrap();
    expect(mocks.sessionCheck).toHaveBeenCalledOnce();
    expect(screen.getByText("console content")).toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("withholds a private page until the session resolves and remembers next", async () => {
    mocks.pathname = "/profiles";
    window.history.replaceState({}, "", "/profiles?page=2");
    renderBootstrap();

    expect(screen.queryByText("console content")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Checking your staff session");
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith("/login?next=%2Fprofiles%3Fpage%3D2"),
    );
  });

  it("waits for a pending session check before redirecting", () => {
    mocks.pathname = "/profiles";
    mocks.isPending = true;
    renderBootstrap();

    expect(screen.queryByText("console content")).not.toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("sends signed-in staff away from sign-in with a validated destination", async () => {
    mocks.pathname = "/login";
    window.history.replaceState({}, "", "/login?next=%2Fjobs");
    mocks.session = makeStaffSessionUser();
    renderBootstrap();

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/jobs"));
  });

  it("shows a forbidden state for a non-staff session", async () => {
    mocks.session = makeSessionUser();
    const { container } = renderBootstrap();

    expect(screen.queryByText("console content")).not.toBeInTheDocument();
    expect(screen.getByText("This account cannot use the console")).toBeInTheDocument();
    expect((await axe(container)).violations).toEqual([]);
  });

  it("clears the session and signs out once after a 401", async () => {
    mocks.pathname = "/profiles";
    window.history.replaceState({}, "", "/profiles?page=2");
    mocks.session = makeStaffSessionUser();
    const { setQueryData } = renderBootstrap();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => unauthorisedResponse()),
    );

    await expect(sessionClient.get("/me")).rejects.toMatchObject({ status: 401 });
    await expect(sessionClient.get("/me")).rejects.toMatchObject({ status: 401 });

    expect(setQueryData).toHaveBeenCalledWith(["admin", "session"], null);
    expect(mocks.replace).toHaveBeenCalledTimes(1);
    expect(mocks.replace).toHaveBeenCalledWith("/login?next=%2Fprofiles%3Fpage%3D2");
    expect(screen.queryByText("raw backend message")).not.toBeInTheDocument();
  });

  it("does not redirect again from a sign-in page", async () => {
    mocks.pathname = "/login";
    window.history.replaceState({}, "", "/login?next=%2Fjobs");
    const { setQueryData } = renderBootstrap();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => unauthorisedResponse()),
    );

    await expect(sessionClient.get("/me")).rejects.toMatchObject({ status: 401 });

    expect(setQueryData).toHaveBeenCalledWith(["admin", "session"], null);
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});
