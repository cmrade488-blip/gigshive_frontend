import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { ConsoleDashboardScreen } from "./ConsoleDashboardScreen";

describe("ConsoleDashboardScreen", () => {
  it("shows the empty overview state without invented metrics and passes axe", async () => {
    const { container } = render(<ConsoleDashboardScreen />);

    expect(screen.getByText("No queue is available yet")).toBeInTheDocument();
    expect((await axe(container)).violations).toEqual([]);
  });
});
