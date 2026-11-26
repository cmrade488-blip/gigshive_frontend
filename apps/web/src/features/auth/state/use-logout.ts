"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { logoutSession } from "../api/auth";
import { sessionQueryKey } from "./use-session-status";

/** Clears the server-held session and updates the header immediately. */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutSession,
    onSuccess: () => queryClient.setQueryData(sessionQueryKey, null),
  });
}
