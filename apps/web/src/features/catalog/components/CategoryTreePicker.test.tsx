import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeTestApiError } from "../api/test-error";
import { makeTestCategory } from "../__tests__/fixtures";
import { catalogCopy } from "../copy/catalog";
import { CategoryTreePicker } from "./CategoryTreePicker";

const mocks = vi.hoisted(() => ({
  state: {
    data: [] as ReturnType<typeof makeTestCategory>[],
    isPending: false,
    isSuccess: true,
    isError: false,
    isFetching: false,
    error: null as unknown,
    refetch: vi.fn(async () => undefined),
  },
}));

vi.mock("../state/use-categories", () => ({
  useCategories: () => mocks.state,
}));

const parent = makeTestCategory({ id: "cat_parent", name: "Design & Creative" });
const child = makeTestCategory({
  id: "cat_branding",
  name: "Branding",
  parent_id: parent.id,
});

beforeEach(() => {
  mocks.state.data = [parent, child];
  mocks.state.isPending = false;
  mocks.state.isSuccess = true;
  mocks.state.isError = false;
  mocks.state.isFetching = false;
  mocks.state.error = null;
  mocks.state.refetch.mockReset();
});

describe("CategoryTreePicker", () => {
  it("renders an accessible two-level tree", async () => {
    const { container } = render(<CategoryTreePicker value={[]} onChange={vi.fn()} />);

    expect(screen.getByRole("checkbox", { name: "Design & Creative" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Branding" })).toBeInTheDocument();
    expect((await axe(container)).violations).toEqual([]);
  });

  it("adds and removes categories in multi-select mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CategoryTreePicker value={["cat_parent"]} onChange={onChange} />);

    await user.click(screen.getByRole("checkbox", { name: "Branding" }));
    expect(onChange).toHaveBeenCalledWith(["cat_parent", "cat_branding"]);

    await user.click(screen.getByRole("checkbox", { name: "Design & Creative" }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("uses radios for a single category", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CategoryTreePicker multiple={false} value={[]} onChange={onChange} />);

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(2);

    await user.click(screen.getByRole("radio", { name: "Branding" }));
    expect(onChange).toHaveBeenCalledWith(["cat_branding"]);
  });

  it("applies the optional category type restriction", () => {
    mocks.state.data = [
      parent,
      makeTestCategory({ id: "cat_repair", name: "Home repair", category_type: "PHYSICAL" }),
    ];
    render(<CategoryTreePicker value={[]} onChange={vi.fn()} categoryType="PHYSICAL" />);

    expect(screen.queryByRole("checkbox", { name: "Design & Creative" })).toBeNull();
    expect(screen.getByRole("checkbox", { name: "Home repair" })).toBeInTheDocument();
  });

  it("shows a loading state before the tree is available", () => {
    mocks.state.isPending = true;
    mocks.state.isSuccess = false;
    render(<CategoryTreePicker value={[]} onChange={vi.fn()} />);

    expect(screen.getByRole("status")).toHaveTextContent(catalogCopy.picker.loading);
    expect(screen.queryByRole("checkbox")).toBeNull();
  });

  it("shows the empty state when the API returns no usable categories", () => {
    mocks.state.data = [];
    render(<CategoryTreePicker value={[]} onChange={vi.fn()} />);

    expect(screen.getByText(catalogCopy.picker.emptyTitle)).toBeInTheDocument();
    expect(screen.getByText(catalogCopy.picker.emptyText)).toBeInTheDocument();
  });

  it("shows a forbidden state without a misleading retry action", () => {
    mocks.state.isError = true;
    mocks.state.isSuccess = false;
    mocks.state.error = makeTestApiError({
      status: 403,
      code: "RAW_CODE",
      message: "RAW BACKEND MESSAGE",
      requestId: "req_403",
    });
    render(<CategoryTreePicker value={[]} onChange={vi.fn()} />);

    expect(screen.getByText(catalogCopy.errors.kinds.forbidden.title)).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
    expect(document.body).not.toHaveTextContent("RAW");
  });

  it("backs off from retrying after 429", () => {
    vi.useFakeTimers();
    try {
      mocks.state.isError = true;
      mocks.state.isSuccess = false;
      mocks.state.error = makeTestApiError({
        status: 429,
        code: "TOO_MANY_REQUESTS",
        message: "RAW BACKEND MESSAGE",
        requestId: "req_429",
        retryAfterSeconds: 2,
      });
      render(<CategoryTreePicker value={[]} onChange={vi.fn()} />);

      expect(screen.getByRole("button", { name: catalogCopy.retry.cooldown(2) })).toBeDisabled();
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      const retry = screen.getByRole("button", {
        name: catalogCopy.errors.kinds.rateLimit.actionLabel,
      });
      expect(retry).toBeEnabled();
      fireEvent.click(retry);
      expect(mocks.state.refetch).toHaveBeenCalledTimes(1);
      expect(document.body).not.toHaveTextContent("RAW BACKEND MESSAGE");
    } finally {
      vi.useRealTimers();
    }
  });

  it("retries a server failure with fixed copy and a support reference", () => {
    mocks.state.isError = true;
    mocks.state.isSuccess = false;
    mocks.state.error = makeTestApiError({
      status: 503,
      code: "RAW_CODE",
      message: "RAW BACKEND MESSAGE",
      requestId: "req_503",
    });
    render(<CategoryTreePicker value={[]} onChange={vi.fn()} />);

    const retry = screen.getByRole("button", { name: catalogCopy.errors.kinds.server.actionLabel });
    expect(retry).toBeEnabled();
    fireEvent.click(retry);
    expect(mocks.state.refetch).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Reference: req_503")).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("RAW BACKEND MESSAGE");
  });

  it("shows caller validation copy alongside invalid inputs", () => {
    render(<CategoryTreePicker value={[]} onChange={vi.fn()} error="Choose a category." />);

    expect(screen.getByRole("alert")).toHaveTextContent("Choose a category.");
    for (const input of screen.getAllByRole("checkbox")) {
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveAttribute("aria-describedby");
    }
  });
});
