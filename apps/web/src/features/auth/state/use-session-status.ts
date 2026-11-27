"use client";

import { useQuery } from "@tanstack/react-query";

import { getSession } from "../api/session";

export const sessionQueryKey = ["auth", "session"] as const;

/** Shared session query, seeded app-wide by FE-017's SessionBootstrap. */
export function useSessionStatus() {
  return useQuery({
    queryKey: sessionQueryKey,
    queryFn: getSession,
    retry: false,
    staleTime: 30_000,
  });
}
