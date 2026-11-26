"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { changePassword } from "../api/auth";
import { sessionQueryKey } from "./use-session-status";

/** Current session stays valid; other sessions are revoked by the API. */
export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sessionQueryKey }),
  });
}
