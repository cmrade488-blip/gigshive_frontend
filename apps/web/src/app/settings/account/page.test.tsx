import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AccountSettingsPage from "./page";

vi.mock("@/features/site", () => ({
  SiteHeader: () => <header>Site header</header>,
}));

vi.mock("@/features/auth", () => ({
  AccountSettingsScreen: () => <main id="main-content">Settings content</main>,
  authCopy: {
    shell: { skipToContent: "Skip to content" },
    meta: {
      settingsAccount: { title: "Account settings", description: "Manage your account." },
    },
  },
}));

describe("account settings route", () => {
  it("composes the skip link, site header and settings screen", () => {
    render(<AccountSettingsPage />);

    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute(
      "href",
      "#main-content",
    );
    expect(screen.getByRole("banner")).toHaveTextContent("Site header");
    expect(screen.getByRole("main")).toHaveTextContent("Settings content");
  });
});
