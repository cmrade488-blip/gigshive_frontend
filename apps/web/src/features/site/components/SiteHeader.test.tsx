import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SiteHeader } from "./SiteHeader";

const mocks = vi.hoisted(() => ({
  session: null as { email: string } | null,
}));

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

vi.mock("@/features/auth", () => ({
  useSessionStatus: () => ({ data: mocks.session }),
  LogoutButton: () => <button type="button">Sign out</button>,
}));

describe("SiteHeader", () => {
  beforeEach(() => {
    mocks.session = null;
  });

  it("opens and closes the mobile menu by button and Escape", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("navigation", { name: "Mobile" })).not.toBeInTheDocument();

    await user.click(toggle);
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("navigation", { name: "Mobile" })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("navigation", { name: "Mobile" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("shows sign-in and join links when signed out", () => {
    render(<SiteHeader />);

    expect(screen.getAllByRole("link", { name: "Sign in" }).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Join free" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Sign out" })).not.toBeInTheDocument();
  });

  it("shows sign-out instead of sign-in and join when signed in", () => {
    mocks.session = { email: "person@example.com" };
    render(<SiteHeader />);

    expect(screen.getAllByRole("button", { name: "Sign out" }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: "Sign in" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Join free" })).not.toBeInTheDocument();
  });

  it("has no axe violations when closed or open", async () => {
    const user = userEvent.setup();
    const { container } = render(<SiteHeader />);

    expect((await axe(container)).violations).toEqual([]);

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect((await axe(container)).violations).toEqual([]);
  });
});
