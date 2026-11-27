import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeTestApiError } from "../api/test-error";
import { makeTestCategory } from "../__tests__/fixtures";
import { catalogCopy } from "../copy/catalog";
import { CategoryFilterChips } from "./CategoryFilterChips";

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

beforeEach(() => {
  mocks.state.data = [
    makeTestCategory({ id: "cat_design", name: "Design & Creative" }),
    makeTestCategory({ id: "cat_web", name: "Web and software", category_type: "DIGITAL" }),
  ];
  mocks.state.isPending = false;
  mocks.state.isSuccess = true;
  mocks.state.isError = false;
  mocks.state.isFetching = false;
  mocks.state.error = null;
  mocks.state.refetch.mockReset();
});

describe("CategoryFilterChips", () => {
  it("renders accessible named chips and never exposes an unknown raw id", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const { container } = render(
      <CategoryFilterChips
        selectedIds={["cat_design", "cat_missing"]}
        onRemove={onRemove}
        onClear={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: catalogCopy.chips.remove("Design & Creative") }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: catalogCopy.chips.remove(catalogCopy.chips.unknown) }),
    ).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("cat_missing");
    expect((await axe(container)).violations).toEqual([]);

    await user.click(
      screen.getByRole("button", { name: catalogCopy.chips.remove(catalogCopy.chips.unknown) }),
    );
    expect(onRemove).toHaveBeenCalledWith("cat_missing");
  });

  it("clears the selection through the caller", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<CategoryFilterChips selectedIds={["cat_web"]} onRemove={vi.fn()} onClear={onClear} />);

    await user.click(screen.getByRole("button", { name: catalogCopy.chips.clear }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("renders nothing when no filter is selected", () => {
    const { container } = render(<CategoryFilterChips selectedIds={[]} onRemove={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("shows a loading state while categories are pending", () => {
    mocks.state.isPending = true;
    mocks.state.isSuccess = false;
    render(<CategoryFilterChips selectedIds={["cat_design"]} onRemove={vi.fn()} />);

    expect(screen.getByRole("status")).toHaveTextContent(catalogCopy.chips.loading);
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
    render(<CategoryFilterChips selectedIds={["cat_design"]} onRemove={vi.fn()} />);

    expect(screen.getByText(catalogCopy.errors.kinds.forbidden.title)).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
    expect(document.body).not.toHaveTextContent("RAW");
  });
});
