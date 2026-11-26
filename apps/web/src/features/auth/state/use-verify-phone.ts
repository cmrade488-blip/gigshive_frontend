"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { verifyPhone } from "../api/auth";
import type { SessionData } from "../api/session";
import { sessionQueryKey } from "./use-session-status";

/** Applies the returned session user immediately; no extra /me round trip. */
export function useVerifyPhone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyPhone,
    onSuccess: (session) => {
      queryClient.setQueryData<SessionData>(sessionQueryKey, session);
    },
  });
}
