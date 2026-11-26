"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { resetPassword } from "../api/auth";
import { sessionQueryKey } from "./use-session-status";

/** Password change revokes other sessions, so refresh the header session. */
export function useResetPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetPassword,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sessionQueryKey }),
  });
}
