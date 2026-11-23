"use client";

import { jobsCopy } from "../copy/jobs";
import { jobsRoutes } from "../routes";
import type { JobSort, JobsFilterValues } from "../state/jobs-filters";
import { useJobs } from "../state/use-jobs";
import { JobsCard } from "./JobsCard";

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:ring-offset-2 focus-visible:outline-none";

const sortOptions: readonly { value: JobSort; label: string }[] = [
  { value: "newest", label: jobsCopy.sortNewest },
  { value: "budget-desc", label: jobsCopy.sortBudgetDesc },
  { value: "budget-asc", label: jobsCopy.sortBudgetAsc },
];

function isJobSort(value: string): value is JobSort {
  return value === "newest" || value === "budget-desc" || value === "budget-asc";
}

function isForbiddenError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "status" in error && error.status === 403;
}

export interface JobsResultsProps {
  filters: JobsFilterValues;
  onSortChange: (sort: JobSort) => void;
}

/** Results column: count, sort control, all standard states and cursor paging. */
export function JobsResults({ filters, onSortChange }: JobsResultsProps) {
  const { data, error, isPending, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useJobs(filters);

  const jobs = data?.pages.flatMap((page) => page.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 sm:pt-[72px]">
        <p className="m-0 text-[15px] text-ink-600">
          {jobsCopy.resultsLabel}
          {!isPending && !isError ? (
            <span className="ml-2 font-semibold text-ink-900">
              {jobs.length} / {total}
            </span>
          ) : null}
        </p>
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="jobs-sort" className="text-ink-600">
            {jobsCopy.sortLabel}
          </label>
          <select
            id="jobs-sort"
            value={filters.sort}
            onChange={(event) => {
              const value = event.target.value;
              if (isJobSort(value)) {
                onSortChange(value);
              }
            }}
            className={`rounded-full border border-ink-200 bg-white px-4 py-2.5 font-sans text-sm ${focusRing}`}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-3 text-xs text-ink-500">{jobsCopy.sampleNotice}</p>

      {isPending ? (
        <p role="status" className="mt-6 text-base text-ink-600">
          {jobsCopy.loading}
        </p>
      ) : null}

      {isError ? (
        <p role="alert" className="mt-6 rounded-2xl bg-gh-danger-bg p-4 text-base text-gh-danger">
          {isForbiddenError(error) ? jobsCopy.forbidden : jobsCopy.error}
        </p>
      ) : null}

      {!isPending && !isError && jobs.length === 0 ? (
        <p role="status" className="mt-6 text-base text-ink-600">
          {jobsCopy.empty}
        </p>
      ) : null}

      <ul className="mt-5 grid gap-4 sm:gap-5">
        {jobs.map((job) => (
          <li key={job.id}>
            <JobsCard job={job} href={jobsRoutes.detail(job.id)} />
          </li>
        ))}
      </ul>

      {hasNextPage ? (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            disabled={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
            className={`rounded-full bg-ink-900 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
          >
            {isFetchingNextPage ? jobsCopy.loadingMore : jobsCopy.loadMore}
          </button>
        </div>
      ) : null}

      {!hasNextPage && !isPending && !isError && jobs.length > 0 ? (
        <p className="mt-8 text-center text-sm text-ink-500">{jobsCopy.endOfResults}</p>
      ) : null}
    </div>
  );
}
