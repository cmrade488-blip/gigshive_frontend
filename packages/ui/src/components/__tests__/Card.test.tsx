import React from "react";
import { render, screen } from "@testing-library/react";
import { Card } from "../Card";
import "@testing-library/jest-dom";

describe("Card", () => {
  it("renders with children and no header/footer", () => {
    render(<Card>Card body content</Card>);
    expect(screen.getByText("Card body content")).toBeInTheDocument();
  });

  it("renders header and footer", () => {
    render(
      <Card header={<span>Header</span>} footer={<span>Footer</span>}>
        Body
      </Card>,
    );
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });
});
