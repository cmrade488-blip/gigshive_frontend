"use client";

import { useQuery } from "@tanstack/react-query";

import { getCategories } from "../api/categories";

/**
 * Public category tree with the one-minute staleness used by other public
 * lists. Retrying is user-driven so a 429 is not hammered in the background.
 */
export function useCategories() {
  return useQuery({
    queryKey: ["catalog", "categories"],
    queryFn: getCategories,
    staleTime: 60_000,
    retry: false,
  });
}
