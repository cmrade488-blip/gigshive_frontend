import { useQuery } from "@tanstack/react-query";

import { getConsoleSession } from "../api/session";

export const consoleSessionQueryKey = ["admin", "session"] as const;

/** One shared staff-session query for the bootstrap, shell and sign-out. */
export function useSessionStatus() {
  return useQuery({
    queryKey: consoleSessionQueryKey,
    queryFn: getConsoleSession,
    staleTime: 30_000,
    retry: false,
  });
}
