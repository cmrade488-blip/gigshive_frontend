"use client";

import { SiteFooter, siteCopy } from "@/features/site";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { JobsFilterPanel } from "../components/JobsFilterPanel";
import { JobsHero } from "../components/JobsHero";
import { JobsResults } from "../components/JobsResults";
import {
  defaultJobsFilters,
  parseJobsFilters,
  serializeJobsFilters,
  type JobsFilterValues,
  type JobSort,
} from "../state/jobs-filters";

/** Find work: hero search, filter card and cursor-paged results. */
export function JobsScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseJobsFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const commit = useCallback(
    (next: JobsFilterValues) => {
      const query = serializeJobsFilters(next);
      router.replace(query === "" ? pathname : `${pathname}?${query}`, { scroll: false });
    },
    [pathname, router],
  );

  return (
    <div className="min-h-screen bg-white font-sans text-ink-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-honey-500 focus:px-4 focus:py-2 focus:font-semibold focus:text-ink-900"
      >
        {siteCopy.skipToContent}
      </a>
      <JobsHero query={filters.query} onSearch={(query) => commit({ ...filters, query })} />
      <main id="main-content" className="bg-ink-50 px-5 pb-24 sm:px-10">
        <div className="relative mx-auto -mt-16 flex max-w-[1200px] flex-wrap items-start gap-8">
          <JobsFilterPanel
            filters={filters}
            onApply={commit}
            onClear={() => commit(defaultJobsFilters)}
          />
          <JobsResults
            filters={filters}
            onSortChange={(sort: JobSort) => commit({ ...filters, sort })}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
