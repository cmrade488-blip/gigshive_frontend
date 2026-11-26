"use client";

import { useMutation } from "@tanstack/react-query";

import { requestPasswordReset } from "../api/auth";

/** Sends the enumeration-safe reset request; no session state is changed. */
export function useForgotPassword() {
  return useMutation({ mutationFn: requestPasswordReset });
}
