"use client";

import { useEffect, useState } from "react";

import { workersCopy, workerCategories } from "../copy/workers";
import type { WorkerCategoryFilter, WorkersFilterValues } from "../state/workers-filters";

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:ring-offset-2 focus-visible:outline-none";

function isWorkerCategory(value: string): value is WorkerCategoryFilter {
  return workerCategories.some((category) => category.id === value);
}

export interface WorkersSearchProps {
  value: WorkersFilterValues;
  onSearch: (filters: WorkersFilterValues) => void;
}

/** Keyword and category pill in the Browse workers hero. */
export function WorkersSearch({ value, onSearch }: WorkersSearchProps) {
  const [queryDraft, setQueryDraft] = useState(value.query);
  const [categoryDraft, setCategoryDraft] = useState<WorkerCategoryFilter>(value.category);

  useEffect(() => {
    setQueryDraft(value.query);
    setCategoryDraft(value.category);
  }, [value.query, value.category]);

  return (
    <form
      role="search"
      className="flex flex-wrap items-center gap-2 rounded-[32px] bg-white py-2 pr-2 pl-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)] sm:max-w-[760px]"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch({ query: queryDraft.trim(), category: categoryDraft });
      }}
    >
      <label htmlFor="workers-search" className="sr-only">
        {workersCopy.searchLabel}
      </label>
      <input
        id="workers-search"
        type="search"
        value={queryDraft}
        placeholder={workersCopy.searchPlaceholder}
        onChange={(event) => setQueryDraft(event.target.value)}
        className={`min-w-[220px] flex-1 border-0 bg-transparent py-3 font-sans text-[17px] text-ink-900 outline-none placeholder:text-ink-400 ${focusRing}`}
      />
      <label htmlFor="workers-category" className="sr-only">
        {workersCopy.categoryLabel}
      </label>
      <select
        id="workers-category"
        value={categoryDraft}
        onChange={(event) => {
          const next = event.target.value;
          if (isWorkerCategory(next)) {
            setCategoryDraft(next);
          }
        }}
        className={`min-h-12 rounded-full border-0 bg-ink-50 px-5 font-sans text-base ${focusRing}`}
      >
        {workerCategories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className={`shrink-0 rounded-full bg-honey-500 px-7 py-3.5 font-semibold text-ink-900 transition-colors hover:bg-honey-400 ${focusRing}`}
      >
        {workersCopy.searchButton}
      </button>
    </form>
  );
}
