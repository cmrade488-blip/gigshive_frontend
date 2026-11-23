"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { getJobsPage } from "../api/jobs";
import type { JobsFilterValues } from "./jobs-filters";

/** Loads one page at a time from the typed sample source (FE-004/FE-005 pending). */
export function useJobs(filters: JobsFilterValues) {
  return useInfiniteQuery({
    queryKey: ["jobs", "list", filters],
    queryFn: ({ pageParam }) => getJobsPage({ filters, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}
