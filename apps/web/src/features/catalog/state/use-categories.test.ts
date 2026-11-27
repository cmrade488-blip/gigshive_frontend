import { describe, expect, it, vi } from "vitest";

import { getCategories } from "../api/categories";
import { useCategories } from "./use-categories";

const mocks = vi.hoisted(() => ({
  useQuery: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: mocks.useQuery,
}));

describe("useCategories", () => {
  it("uses one cached public query with a one-minute staleness", () => {
    useCategories();

    expect(mocks.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["catalog", "categories"],
        queryFn: getCategories,
        staleTime: 60_000,
        retry: false,
      }),
    );
  });
});
