"use client";

import { useQuery } from "@tanstack/react-query";

import { getFeeExample } from "../api/fees";

/** Loads the sample fee amounts from the typed mock (see api/fees.ts). */
export function useFeeExample() {
  return useQuery({
    queryKey: ["site", "fees", "example"],
    queryFn: getFeeExample,
  });
}
