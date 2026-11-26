import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { HowItWorksScreen } from "./HowItWorksScreen";

vi.mock("next/navigation", () => ({ usePathname: () => "/how-it-works" }));

// The header reads session state; this screen test only checks its own content.
vi.mock("@/features/auth", () => ({
  useSessionStatus: () => ({ data: null }),
  LogoutButton: () => null,
}));

describe("HowItWorksScreen", () => {
  it("renders both audiences and has no axe violations", async () => {
    const { container } = render(<HowItWorksScreen />);

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Hire with confidence", level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Do good work and get paid", level: 2 }),
    ).toBeInTheDocument();
    expect((await axe(container)).violations).toEqual([]);
  });
});
