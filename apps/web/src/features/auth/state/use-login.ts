"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { login } from "../api/auth";
import { sessionQueryKey } from "./use-session-status";

/** Opens the session through the route handler, then refreshes header state. */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sessionQueryKey }),
  });
}
