import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeTestCategory } from "../__tests__/fixtures";
import { getCategories } from "./categories";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  sessionClient: { get: mocks.get },
}));

beforeEach(() => {
  mocks.get.mockReset();
});

describe("getCategories", () => {
  it("reads the generated category envelope through the session proxy", async () => {
    const category = makeTestCategory();
    mocks.get.mockResolvedValue({ data: [category] });

    await expect(getCategories()).resolves.toEqual([category]);
    expect(mocks.get).toHaveBeenCalledWith("/categories");
  });

  it("treats a missing data array as an empty category list", async () => {
    mocks.get.mockResolvedValue({ data: undefined });

    await expect(getCategories()).resolves.toEqual([]);
  });
});
