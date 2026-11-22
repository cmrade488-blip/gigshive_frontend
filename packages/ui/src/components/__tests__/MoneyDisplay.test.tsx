import { render, screen } from "@testing-library/react";
import React from "react";
import { MoneyDisplay } from "../MoneyDisplay";
import "@testing-library/jest-dom";

describe("MoneyDisplay", () => {
  it("formats kobo amount with symbol", () => {
    render(<MoneyDisplay amountKobo={150050} currency />);
    const amount = screen.getByText(/₦1,500\.50/);
    expect(amount).toBeInTheDocument();
  });

  it("formats amount without currency when requested", () => {
    render(<MoneyDisplay amountKobo={999} currency={false} />);
    expect(screen.getByText(/9\.99/)).toBeInTheDocument();
  });

  it("formats zero", () => {
    render(<MoneyDisplay amountKobo={0} />);
    expect(screen.getByText(/0\.00/)).toBeInTheDocument();
  });
});
