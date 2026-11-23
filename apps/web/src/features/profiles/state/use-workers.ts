"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { getWorkersPage } from "../api/workers";
import type { WorkersFilterValues } from "./workers-filters";

/** Public worker list: one-minute staleness from Data and State Design §4.2. */
export function useWorkers(filters: WorkersFilterValues) {
  return useInfiniteQuery({
    queryKey: ["workers", "list", { query: filters.query, category: filters.category }],
    queryFn: ({ pageParam }) => getWorkersPage({ filters, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 60_000,
  });
}
