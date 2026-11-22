import React from "react";
import { render, screen } from "@testing-library/react";
import { Button } from "../Button";
import "@testing-library/jest-dom";

describe("Button", () => {
  it("renders primary button with default props", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toHaveClass("bg-gh-primary");
  });

  it("applies custom variant and size", () => {
    render(
      <Button variant="secondary" size="sm">
        Small secondary
      </Button>,
    );
    const button = screen.getByText("Small secondary");
    expect(button).toHaveClass("bg-gh-secondary");
    expect(button).toHaveClass("text-sm");
  });

  it("shows loading state with spinner", () => {
    render(<Button loading>Loading...</Button>);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveAttribute("disabled");
  });
});
