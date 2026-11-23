import { workerCategories } from "../copy/workers";

export type WorkerCategoryFilter = "all" | "design" | "writing" | "web";

export interface WorkersFilterValues {
  readonly query: string;
  readonly category: WorkerCategoryFilter;
}

export const defaultWorkersFilters: WorkersFilterValues = {
  query: "",
  category: "all",
};

function isWorkerCategory(value: string | null): value is WorkerCategoryFilter {
  return (
    value !== null && workerCategories.some((category) => category.id === value && value !== "all")
  );
}

/** Reads search state from the URL; invalid values fall back to defaults. */
export function parseWorkersFilters(params: URLSearchParams): WorkersFilterValues {
  const query = params.get("q")?.trim() ?? "";
  const categoryParam = params.get("category");
  const category = isWorkerCategory(categoryParam) ? categoryParam : "all";

  return { query, category };
}

/** Writes only non-default search state, so a clean list has a clean URL. */
export function serializeWorkersFilters(filters: WorkersFilterValues): string {
  const params = new URLSearchParams();
  if (filters.query !== "") {
    params.set("q", filters.query);
  }
  if (filters.category !== "all") {
    params.set("category", filters.category);
  }
  return params.toString();
}

/** Pure keyword and category filter over the typed sample workers. */
export function filterWorkers<
  T extends {
    displayName: string;
    headline: string;
    skills: readonly string[];
    categoryId: string;
  },
>(workers: readonly T[], filters: WorkersFilterValues): readonly T[] {
  const needle = filters.query.toLowerCase();

  return workers.filter((worker) => {
    if (filters.category !== "all" && worker.categoryId !== filters.category) {
      return false;
    }
    if (needle === "") {
      return true;
    }
    return [worker.displayName, worker.headline, ...worker.skills].some((value) =>
      value.toLowerCase().includes(needle),
    );
  });
}
