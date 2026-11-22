import React from "react";
import { render, screen } from "@testing-library/react";
import { Badge } from "../Badge";
import "@testing-library/jest-dom";

describe("Badge", () => {
  it("renders neutral status", () => {
    render(<Badge>Active</Badge>);
    const badge = screen.getByRole("status", { name: "Active" });
    expect(badge).toHaveClass("bg-ink-500 text-white");
  });

  it("renders success status", () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByRole("status", { name: "Success" });
    expect(badge).toHaveClass("bg-gh-success-bg text-gh-success");
  });

  it("renders danger status", () => {
    render(<Badge variant="danger">Danger</Badge>);
    const badge = screen.getByRole("status", { name: "Error" });
    expect(badge).toHaveClass("bg-gh-danger-bg text-gh-danger");
  });
});
