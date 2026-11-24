import { kobo } from "@gigshive/shared/money";
import { describe, expect, it } from "vitest";

import type { Job } from "../api/jobs";
import {
  activeFilterCount,
  defaultJobsFilters,
  filterJobs,
  parseJobsFilters,
  serializeJobsFilters,
  sortJobs,
  type JobsFilterValues,
} from "./jobs-filters";

function job(overrides: Partial<Job> & Pick<Job, "id">): Job {
  return {
    categoryId: "web-and-software",
    category: "Web and software",
    mode: "priced",
    posted: "1 day ago",
    title: "Sample job",
    summary: "Sample summary",
    budget: { minKobo: kobo(100_000), maxKobo: kobo(200_000) },
    proposals: 0,
    client: "Sample client",
    avatar: "/brand/images/avatars/avatar-01.svg",
    ...overrides,
  };
}

const jobs: readonly Job[] = [
  job({ id: "landing", title: "Build a landing page", categoryId: "web-and-software" }),
  job({
    id: "poster",
    title: "Design a poster",
    categoryId: "design",
    category: "Design and creative",
    mode: "application",
    budget: { minKobo: kobo(50_000), maxKobo: kobo(90_000) },
  }),
  job({ id: "no-budget", title: "Landing copy review", budget: null }),
];

describe("jobs URL filter state", () => {
  it("parses valid values and falls back for invalid ones", () => {
    const parsed = parseJobsFilters(
      new URLSearchParams(
        "q=%20landing%20&category=web-and-software&category=&mode=bogus&min=abc&max=-5&sort=bogus",
      ),
    );

    expect(parsed).toEqual({
      query: "landing",
      categories: ["web-and-software"],
      mode: "all",
      minKobo: null,
      maxKobo: null,
      sort: "newest",
    });
  });

  it("serialises only non-default values and round-trips", () => {
    const filters: JobsFilterValues = {
      query: " landing ",
      categories: ["web-and-software", "design"],
      mode: "priced",
      minKobo: kobo(100_000),
      maxKobo: kobo(500_000),
      sort: "budget-desc",
    };
    const serialized = serializeJobsFilters(filters);
    const params = new URLSearchParams(serialized);

    expect(serializeJobsFilters(defaultJobsFilters)).toBe("");
    expect(params.get("q")).toBe("landing");
    expect(params.getAll("category")).toEqual(["web-and-software", "design"]);
    expect(parseJobsFilters(params)).toEqual({ ...filters, query: "landing" });
  });

  it("counts only active constraints", () => {
    expect(activeFilterCount(defaultJobsFilters)).toBe(0);
    expect(
      activeFilterCount({
        ...defaultJobsFilters,
        query: "landing",
        categories: ["design"],
        mode: "priced",
        minKobo: kobo(100_000),
      }),
    ).toBe(4);
  });
});

describe("jobs filtering", () => {
  it("matches query, category, mode and overlapping budget range", () => {
    expect(
      filterJobs(jobs, { ...defaultJobsFilters, query: "landing" }).map((item) => item.id),
    ).toEqual(["landing", "no-budget"]);
    expect(filterJobs(jobs, { ...defaultJobsFilters, categories: ["design"] })).toEqual([jobs[1]]);
    expect(filterJobs(jobs, { ...defaultJobsFilters, mode: "application" })).toEqual([jobs[1]]);
    expect(filterJobs(jobs, { ...defaultJobsFilters, minKobo: kobo(100_000) })).toEqual([jobs[0]]);
    expect(filterJobs(jobs, { ...defaultJobsFilters, maxKobo: kobo(60_000) })).toEqual([jobs[1]]);
  });

  it("leaves the input untouched when sorting", () => {
    const before = jobs.map((item) => item.id);

    expect(sortJobs(jobs, "budget-desc").map((item) => item.id)).toEqual([
      "landing",
      "poster",
      "no-budget",
    ]);
    expect(sortJobs(jobs, "budget-asc").map((item) => item.id)).toEqual([
      "poster",
      "landing",
      "no-budget",
    ]);
    expect(jobs.map((item) => item.id)).toEqual(before);
  });
});
