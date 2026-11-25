"use client";

import { useMutation } from "@tanstack/react-query";

import { resendEmailOtp } from "../api/auth";

/** Requests a fresh email code and returns the API's retry cooldown. */
export function useResendEmailOtp() {
  return useMutation({ mutationFn: resendEmailOtp });
}
