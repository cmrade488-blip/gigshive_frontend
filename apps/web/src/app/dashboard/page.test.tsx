import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import DashboardPage, { metadata } from "./page";

vi.mock("@/features/auth", () => ({
  dashboardCopy: {
    meta: { title: "Dashboard", description: "Your GigsHive workspace." },
  },
  DashboardScreen: () => <main>Dashboard content</main>,
}));

describe("dashboard route", () => {
  it("renders the dashboard screen and is not indexable", () => {
    render(<DashboardPage />);

    expect(screen.getByRole("main")).toHaveTextContent("Dashboard content");
    expect(metadata.title).toBe("Dashboard");
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
