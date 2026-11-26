"use client";

import { useMutation } from "@tanstack/react-query";

import { sendPhoneOtp } from "../api/auth";

/** Starts or restarts pending phone verification through the session proxy. */
export function useSendPhoneOtp() {
  return useMutation({ mutationFn: sendPhoneOtp });
}
