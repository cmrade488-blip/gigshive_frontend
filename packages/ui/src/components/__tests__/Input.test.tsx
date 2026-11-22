import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "../Input";
import "@testing-library/jest-dom";

describe("Input", () => {
  it("renders with label and accepts typing", async () => {
    render(<Input label="Email" placeholder="you@example.com" />);
    const input = screen.getByLabelText("Email");
    await userEvent.type(input, "test@example.com");
    expect(input).toHaveValue("test@example.com");
  });

  it("shows error and links it via aria-describedby", () => {
    render(<Input label="Email" error="Invalid email" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", expect.stringContaining("error"));
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid email");
  });

  it("shows hint text", () => {
    render(<Input label="Email" hint="We will never share it" />);
    expect(screen.getByText("We will never share it")).toBeInTheDocument();
  });
});
