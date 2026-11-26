"use client";

import { useQuery } from "@tanstack/react-query";

import { getSession } from "../api/session";

export const sessionQueryKey = ["auth", "session"] as const;

/** Header-only session state; full bootstrap and guards belong to FE-017. */
export function useSessionStatus() {
  return useQuery({
    queryKey: sessionQueryKey,
    queryFn: getSession,
    retry: false,
    staleTime: 30_000,
  });
}
