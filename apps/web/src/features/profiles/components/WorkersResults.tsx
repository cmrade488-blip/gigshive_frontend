"use client";

import { EmptyState, ErrorState, LoadingState } from "@gigshive/ui";

import { workersCopy } from "../copy/workers";
import type { WorkersFilterValues } from "../state/workers-filters";
import { useWorkers } from "../state/use-workers";
import { WorkersCard } from "./WorkersCard";

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:ring-offset-2 focus-visible:outline-none";

function isForbiddenError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "status" in error && error.status === 403;
}

/** Results grid: count, all standard states and cursor paging. */
export function WorkersResults({ filters }: { filters: WorkersFilterValues }) {
  const { data, error, isPending, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useWorkers(filters);

  const workers = data?.pages.flatMap((page) => page.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  return (
    <div className="min-w-0 flex-1">
      <p className="m-0 text-[15px] text-ink-600">
        {workersCopy.resultsLabel}
        {!isPending && !isError ? (
          <span className="ml-2 font-semibold text-ink-900">
            {workers.length} / {total}
          </span>
        ) : null}
      </p>
      <p className="mt-2 text-xs text-ink-500">{workersCopy.sampleNotice}</p>

      {isPending ? <LoadingState label={workersCopy.loading} className="mt-6" /> : null}

      {isError ? (
        <ErrorState
          title={isForbiddenError(error) ? workersCopy.forbidden : workersCopy.error}
          className="mt-6"
        />
      ) : null}

      {!isPending && !isError && workers.length === 0 ? (
        <EmptyState title={workersCopy.empty} className="mt-6" />
      ) : null}

      <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {workers.map((worker) => (
          <li key={worker.id}>
            <WorkersCard worker={worker} />
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
            {isFetchingNextPage ? workersCopy.loadingMore : workersCopy.loadMore}
          </button>
        </div>
      ) : null}

      {!hasNextPage && !isPending && !isError && workers.length > 0 ? (
        <p className="mt-8 text-center text-sm text-ink-500">{workersCopy.endOfResults}</p>
      ) : null}
    </div>
  );
}
