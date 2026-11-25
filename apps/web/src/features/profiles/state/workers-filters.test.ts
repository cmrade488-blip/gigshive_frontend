import { describe, expect, it } from "vitest";

import {
  defaultWorkersFilters,
  filterWorkers,
  parseWorkersFilters,
  serializeWorkersFilters,
  type WorkersFilterValues,
} from "./workers-filters";

const workers = [
  {
    id: "a",
    displayName: "Amaka O.",
    headline: "Brand designer",
    skills: ["Figma", "Identity"],
    categoryId: "design",
  },
  {
    id: "b",
    displayName: "Tunde A.",
    headline: "Web developer",
    skills: ["React", "Accessibility"],
    categoryId: "web",
  },
] as const;

describe("workers URL filter state", () => {
  it("parses valid values and falls back for invalid ones", () => {
    expect(
      parseWorkersFilters(new URLSearchParams("q=%20brand%20&category=not-a-category")),
    ).toEqual({ query: "brand", category: "all" });
    expect(parseWorkersFilters(new URLSearchParams("q=design&category=design"))).toEqual({
      query: "design",
      category: "design",
    });
  });

  it("serialises only non-default values and round-trips", () => {
    const filters: WorkersFilterValues = { query: "react", category: "web" };
    const serialized = serializeWorkersFilters(filters);

    expect(serializeWorkersFilters(defaultWorkersFilters)).toBe("");
    expect(serialized).toBe("q=react&category=web");
    expect(parseWorkersFilters(new URLSearchParams(serialized))).toEqual(filters);
  });

  it("filters by keyword across name, headline and skills", () => {
    expect(
      filterWorkers(workers, { ...defaultWorkersFilters, query: "FIGMA" }).map((w) => w.id),
    ).toEqual(["a"]);
    expect(
      filterWorkers(workers, { ...defaultWorkersFilters, query: "react" }).map((w) => w.id),
    ).toEqual(["b"]);
    expect(filterWorkers(workers, { ...defaultWorkersFilters, category: "web" })).toEqual([
      workers[1],
    ]);
  });
});
