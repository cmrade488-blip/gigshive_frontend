import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { ActionToast } from "../ActionToast";
import { EmptyState } from "../EmptyState";
import { ErrorState } from "../ErrorState";
import { ForbiddenState } from "../ForbiddenState";
import { LoadingState } from "../LoadingState";
import { NotFoundState } from "../NotFoundState";
import { OfflineBanner } from "../OfflineBanner";

describe("standard screen states", () => {
  it("announces loading without presenting it as an error", () => {
    render(<LoadingState label="Loading jobs" description="This will only take a moment." />);

    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Loading jobs")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("announces empty and not-found states politely", () => {
    const { rerender } = render(
      <EmptyState title="No jobs yet" description="Try another filter." />,
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("No jobs yet")).toBeInTheDocument();

    rerender(<NotFoundState title="We cannot find that" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("We cannot find that")).toBeInTheDocument();
  });

  it("announces forbidden and error states as alerts", () => {
    const { rerender } = render(<ForbiddenState title="You do not have access" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();

    rerender(
      <ErrorState
        title="Something went wrong"
        description="Please try again."
        reference="digest_abc123"
      />,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Reference/)).toBeInTheDocument();
    expect(screen.getByText(/digest_abc123/)).toBeInTheDocument();
  });

  it("separates an offline banner from a server error", () => {
    render(<OfflineBanner message="You are offline. We will reconnect when you are back." />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("gives a failed action a working retry button", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();

    render(
      <ActionToast
        message="That did not go through. Please try again."
        actionLabel="Retry"
        onAction={onRetry}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it.each([
    ["loading", <LoadingState label="Loading" />],
    ["empty", <EmptyState title="Nothing here yet" />],
    ["not found", <NotFoundState title="Not found" />],
    ["forbidden", <ForbiddenState title="Access denied" />],
    ["error", <ErrorState title="Something went wrong" reference="ref_123" />],
    ["offline", <OfflineBanner message="You are offline" />],
    [
      "action toast",
      <ActionToast
        message="That did not go through"
        actionLabel="Retry"
        onAction={() => undefined}
      />,
    ],
  ] as const)("%s state has no axe violations", async (_name, element) => {
    const { container } = render(element);
    expect((await axe(container)).violations).toEqual([]);
  });
});
