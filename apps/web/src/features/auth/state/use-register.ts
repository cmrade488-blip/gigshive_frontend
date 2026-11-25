"use client";

import { useMutation } from "@tanstack/react-query";

import { registerAccount } from "../api/auth";

/** Creates the account; the OTP step is a separate mutation. */
export function useRegister() {
  return useMutation({ mutationFn: registerAccount });
}
