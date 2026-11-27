import { type schema } from "@gigshive/api-client";

import { csrfHeaders, staffAuthClient } from "@/lib/api";

import type { ConsoleSession } from "./session";

type StaffLoginPayload = NonNullable<
  schema.paths["/admin/auth/login"]["post"]["requestBody"]
>["content"]["application/json"];
type StaffOtpPayload = NonNullable<
  schema.paths["/admin/auth/verify-otp"]["post"]["requestBody"]
>["content"]["application/json"];

export interface StaffLoginResult {
  otpRequired: boolean;
}

/**
 * Staff step one. A 200 from `/admin/auth/login` always means the mandatory
 * OTP step follows; the generated response marks `otp_required` optional, so
 * the flag is not relied on to decide whether to continue.
 */
export async function loginStaff(payload: StaffLoginPayload): Promise<StaffLoginResult> {
  await staffAuthClient.post("/login", payload, {
    headers: await csrfHeaders(),
    skipUnauthorizedHandler: true,
  });
  return { otpRequired: true };
}

/** Staff step two. The backend correlates the pending challenge. */
export async function verifyStaffOtp(payload: StaffOtpPayload): Promise<ConsoleSession> {
  const response = await staffAuthClient.post<ConsoleSession>("/verify-otp", payload, {
    headers: await csrfHeaders(),
    skipUnauthorizedHandler: true,
  });
  return response.data;
}

/** Revokes the server-held session and clears the console cookies. */
export async function logoutStaff(): Promise<void> {
  await staffAuthClient.post("/logout", undefined, {
    headers: await csrfHeaders(),
    skipUnauthorizedHandler: true,
  });
}
