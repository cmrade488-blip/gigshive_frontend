"use client";

import { useMutation } from "@tanstack/react-query";

import { verifyEmail } from "../api/auth";

/** Confirms the OTP and opens the session through the route handler. */
export function useVerifyEmail() {
  return useMutation({ mutationFn: verifyEmail });
}
