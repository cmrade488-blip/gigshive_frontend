import { formatMoney, parseMoney, type Kobo } from "@gigshive/shared/money";

import type { Job } from "../api/jobs";

export type JobModeFilter = "all" | "priced" | "application";
export type JobSort = "newest" | "budget-desc" | "budget-asc";

export interface JobsFilterValues {
  query: string;
  categories: readonly string[];
  mode: JobModeFilter;
  minKobo: Kobo | null;
  maxKobo: Kobo | null;
  sort: JobSort;
}

export const defaultJobsFilters: JobsFilterValues = {
  query: "",
  categories: [],
  mode: "all",
  minKobo: null,
  maxKobo: null,
  sort: "newest",
};

export const jobsFilterParams = {
  query: "q",
  category: "category",
  mode: "mode",
  min: "min",
  max: "max",
  sort: "sort",
} as const;

function isModeFilter(value: string | null): value is JobModeFilter {
  return value === "all" || value === "priced" || value === "application";
}

function isJobSort(value: string | null): value is JobSort {
  return value === "newest" || value === "budget-desc" || value === "budget-asc";
}

function parseKoboParam(value: string | null): Kobo | null {
  if (value === null || value.trim() === "") {
    return null;
  }
  const parsed = parseMoney(value);
  return parsed.ok ? parsed.kobo : null;
}

/** Reads filter state from the URL. Unknown or invalid values fall back to defaults. */
export function parseJobsFilters(params: URLSearchParams): JobsFilterValues {
  const mode = params.get(jobsFilterParams.mode);
  const sort = params.get(jobsFilterParams.sort);

  return {
    query: params.get(jobsFilterParams.query)?.trim() ?? "",
    categories: params.getAll(jobsFilterParams.category).filter((value) => value !== ""),
    mode: isModeFilter(mode) ? mode : defaultJobsFilters.mode,
    minKobo: parseKoboParam(params.get(jobsFilterParams.min)),
    maxKobo: parseKoboParam(params.get(jobsFilterParams.max)),
    sort: isJobSort(sort) ? sort : defaultJobsFilters.sort,
  };
}

/** Writes only non-default values, so a clean list has a clean URL. */
export function serializeJobsFilters(filters: JobsFilterValues): string {
  const params = new URLSearchParams();
  const query = filters.query.trim();

  if (query !== "") {
    params.set(jobsFilterParams.query, query);
  }
  for (const category of filters.categories) {
    if (category !== "") {
      params.append(jobsFilterParams.category, category);
    }
  }
  if (filters.mode !== "all") {
    params.set(jobsFilterParams.mode, filters.mode);
  }
  if (filters.minKobo !== null) {
    params.set(jobsFilterParams.min, formatMoney(filters.minKobo, { currency: false }));
  }
  if (filters.maxKobo !== null) {
    params.set(jobsFilterParams.max, formatMoney(filters.maxKobo, { currency: false }));
  }
  if (filters.sort !== "newest") {
    params.set(jobsFilterParams.sort, filters.sort);
  }

  return params.toString();
}

/** Number of active constraints, used to show that filters are applied. */
export function activeFilterCount(filters: JobsFilterValues): number {
  return (
    (filters.query.trim() === "" ? 0 : 1) +
    filters.categories.length +
    (filters.mode === "all" ? 0 : 1) +
    (filters.minKobo === null ? 0 : 1) +
    (filters.maxKobo === null ? 0 : 1)
  );
}

/** Filters the typed sample data. A real API would do this server-side. */
export function filterJobs(jobs: readonly Job[], filters: JobsFilterValues): readonly Job[] {
  const query = filters.query.trim().toLowerCase();

  return jobs.filter((job) => {
    if (
      query !== "" &&
      !`${job.title} ${job.summary} ${job.category}`.toLowerCase().includes(query)
    ) {
      return false;
    }
    if (filters.categories.length > 0 && !filters.categories.includes(job.categoryId)) {
      return false;
    }
    if (filters.mode === "priced" && job.mode !== "priced") {
      return false;
    }
    if (filters.mode === "application" && job.mode !== "application") {
      return false;
    }
    if (filters.minKobo !== null && (job.budget === null || job.budget.maxKobo < filters.minKobo)) {
      return false;
    }
    if (filters.maxKobo !== null && (job.budget === null || job.budget.minKobo > filters.maxKobo)) {
      return false;
    }
    return true;
  });
}

function budgetForSort(job: Job): number | null {
  if (job.budget === null) {
    return null;
  }
  return job.mode === "priced" ? job.budget.maxKobo : job.budget.minKobo;
}

/** Sorts by newest or by budget. Jobs without a budget go last; the input is never mutated. */
export function sortJobs(jobs: readonly Job[], sort: JobSort): readonly Job[] {
  if (sort === "newest") {
    return jobs;
  }

  const direction = sort === "budget-desc" ? -1 : 1;
  return [...jobs].sort((left, right) => {
    const leftBudget = budgetForSort(left);
    const rightBudget = budgetForSort(right);
    if (leftBudget === null && rightBudget === null) {
      return 0;
    }
    if (leftBudget === null) {
      return 1;
    }
    if (rightBudget === null) {
      return -1;
    }
    return (leftBudget - rightBudget) * direction;
  });
}
