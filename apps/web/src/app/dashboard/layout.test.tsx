import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import DashboardLayout, { metadata } from "./layout";

vi.mock("@/features/auth", () => ({
  DashboardShell: ({ children }: { children: ReactNode }) => (
    <div data-testid="dashboard-shell">{children}</div>
  ),
}));

describe("dashboard layout", () => {
  it("wraps private content in the dashboard shell without indexing it", () => {
    render(
      <DashboardLayout>
        <p>Private content</p>
      </DashboardLayout>,
    );

    expect(screen.getByTestId("dashboard-shell")).toHaveTextContent("Private content");
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
