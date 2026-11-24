import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ServerErrorScreen } from "./ServerErrorScreen";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("ServerErrorScreen", () => {
  it("shows the Next digest as the support reference in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { container } = render(
      <ServerErrorScreen digest="digest_abc123" error={new Error("db-password")} standalone />,
    );

    expect(screen.getByText(/Reference/)).toBeInTheDocument();
    expect(screen.getByText("digest_abc123")).toBeInTheDocument();
    expect(screen.queryByText("db-password")).not.toBeInTheDocument();
    expect(screen.queryByText("Technical detail (development only)")).not.toBeInTheDocument();
    expect((await axe(container)).violations).toEqual([]);
  });

  it("shows no support reference when Next supplies no digest", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { container } = render(<ServerErrorScreen error={new Error("db-password")} standalone />);

    expect(screen.queryByText(/Reference/)).not.toBeInTheDocument();
    expect(screen.queryByText("quote the reference below")).not.toBeInTheDocument();
    expect(screen.queryByText("db-password")).not.toBeInTheDocument();
    expect((await axe(container)).violations).toEqual([]);
  });

  it("shows technical detail only in development", () => {
    vi.stubEnv("NODE_ENV", "development");

    render(
      <ServerErrorScreen digest="digest_abc123" error={new Error("dev-only-detail")} standalone />,
    );

    expect(screen.getByText("dev-only-detail")).toBeInTheDocument();
    expect(screen.getByText("Technical detail (development only)")).toBeInTheDocument();
  });
});
