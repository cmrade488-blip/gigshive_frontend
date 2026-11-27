import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import { makeSessionUser, makeStaffSessionUser } from "@gigshive/testing";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type * as AuthFeature from "@/features/auth";

import { ConsoleShell } from "./ConsoleShell";

const mocks = vi.hoisted(() => ({
  pathname: "/",
  session: null as AuthFeature.ConsoleSession | null,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
}));

vi.mock("@/features/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof AuthFeature>();
  return {
    ...actual,
    useSessionStatus: () => ({ data: mocks.session }),
    LogoutButton: () => createElement("button", { type: "button" }, "Sign out"),
  };
});

describe("ConsoleShell", () => {
  beforeEach(() => {
    mocks.pathname = "/";
    mocks.session = null;
  });

  it("renders no navigation for a non-staff viewer", () => {
    mocks.session = makeSessionUser();
    render(
      <ConsoleShell>
        <p>content</p>
      </ConsoleShell>,
    );

    expect(screen.queryByRole("link", { name: "Overview" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Profiles" })).toBeNull();
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("marks the active item and has no axe violations", async () => {
    mocks.session = makeStaffSessionUser();
    const { container } = render(
      <ConsoleShell>
        <p>content</p>
      </ConsoleShell>,
    );

    const overview = screen.getByRole("link", { name: "Overview" });
    expect(overview).toHaveAttribute("aria-current", "page");
    expect((await axe(container)).violations).toEqual([]);
  });

  it("shows only permitted sections and marks nested active paths", () => {
    mocks.session = makeStaffSessionUser({ permissions: ["verifications.review"] });
    mocks.pathname = "/verifications/123";
    render(
      <ConsoleShell>
        <p>content</p>
      </ConsoleShell>,
    );

    expect(screen.getByRole("link", { name: "Verifications" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.queryByRole("link", { name: "Jobs" })).toBeNull();
  });
});
