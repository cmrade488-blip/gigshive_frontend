import { type schema } from "@gigshive/api-client";

import { authClient, csrfHeaders, sessionClient } from "@/lib/api";

export type LoginRequest =
  schema.paths["/auth/login"]["post"]["requestBody"]["content"]["application/json"];
export type LoginData = NonNullable<
  schema.paths["/auth/login"]["post"]["responses"][200]["content"]["application/json"]["data"]
>;
export type RegisterRequest =
  schema.paths["/auth/register"]["post"]["requestBody"]["content"]["application/json"];
export type RegisterData = NonNullable<
  schema.paths["/auth/register"]["post"]["responses"][201]["content"]["application/json"]["data"]
>;
export type VerifyEmailRequest =
  schema.paths["/auth/verify-email"]["post"]["requestBody"]["content"]["application/json"];
export type SessionUser = schema.components["schemas"]["SessionUser"];
export type ResendOtpRequest =
  schema.paths["/auth/resend-otp"]["post"]["requestBody"]["content"]["application/json"];
export type ResendOtpData =
  schema.paths["/auth/resend-otp"]["post"]["responses"][202]["content"]["application/json"]["data"];
export type ForgotPasswordRequest =
  schema.paths["/auth/forgot-password"]["post"]["requestBody"]["content"]["application/json"];
export type ForgotPasswordData = NonNullable<
  schema.paths["/auth/forgot-password"]["post"]["responses"][202]["content"]["application/json"]["data"]
>;
export type ResetPasswordRequest =
  schema.paths["/auth/reset-password"]["post"]["requestBody"]["content"]["application/json"];
export type ChangePasswordRequest =
  schema.paths["/auth/change-password"]["post"]["requestBody"]["content"]["application/json"];
export type VerifyPhoneRequest =
  schema.paths["/auth/verify-phone"]["post"]["requestBody"]["content"]["application/json"];
export type PhoneVerificationData =
  schema.paths["/auth/verify-phone"]["post"]["responses"][200]["content"]["application/json"]["data"];

/** POST /auth/login through the session-start route handler. */
export async function login(payload: LoginRequest): Promise<LoginData> {
  const response = await authClient.post<LoginData>("/login", payload, {
    headers: await csrfHeaders(),
    skipUnauthorizedHandler: true,
  });
  return response.data;
}

/** POST /auth/logout; the route clears the session cookies on success. */
export async function logoutSession(): Promise<void> {
  await authClient.post<void>("/logout", undefined, {
    headers: await csrfHeaders(),
    skipUnauthorizedHandler: true,
  });
}

/** POST /auth/register through the same-origin public-auth forwarder. */
export async function registerAccount(payload: RegisterRequest): Promise<RegisterData> {
  const response = await authClient.post<RegisterData>("/register", payload, {
    headers: await csrfHeaders(),
    skipUnauthorizedHandler: true,
  });
  return response.data;
}

/** POST /auth/verify-email through the session-start route handler. */
export async function verifyEmail(payload: VerifyEmailRequest): Promise<SessionUser> {
  const response = await authClient.post<SessionUser>("/verify-email", payload, {
    headers: await csrfHeaders(),
    skipUnauthorizedHandler: true,
  });
  return response.data;
}

/** POST /auth/resend-otp for the unauthenticated registration case. */
export async function resendEmailOtp(email: string): Promise<ResendOtpData> {
  const payload: ResendOtpRequest = { channel: "EMAIL", email };
  const response = await authClient.post<ResendOtpData>("/resend-otp", payload, {
    headers: await csrfHeaders(),
    skipUnauthorizedHandler: true,
  });
  return response.data;
}

/**
 * POST /auth/forgot-password. The 202 response is deliberately identical for
 * every email so the UI cannot reveal whether an account exists.
 */
export async function requestPasswordReset(
  payload: ForgotPasswordRequest,
): Promise<ForgotPasswordData> {
  const response = await authClient.post<ForgotPasswordData>("/forgot-password", payload, {
    headers: await csrfHeaders(),
    skipUnauthorizedHandler: true,
  });
  return response.data;
}

/** POST /auth/reset-password with the one-time token read from the email link. */
export async function resetPassword(payload: ResetPasswordRequest): Promise<void> {
  await authClient.post<void>("/reset-password", payload, {
    headers: await csrfHeaders(),
    skipUnauthorizedHandler: true,
  });
}

/** POST /auth/change-password through the authenticated session proxy. */
export async function changePassword(payload: ChangePasswordRequest): Promise<void> {
  await sessionClient.post<void>("/auth/change-password", payload, {
    headers: await csrfHeaders(),
    skipUnauthorizedHandler: true,
  });
}

/**
 * POST /auth/resend-otp for PHONE through the authenticated session proxy.
 * Sending the same E.164 number restarts pending phone verification.
 */
export async function sendPhoneOtp(payload: ResendOtpRequest): Promise<ResendOtpData> {
  const response = await sessionClient.post<ResendOtpData>("/auth/resend-otp", payload, {
    headers: await csrfHeaders(),
    skipUnauthorizedHandler: true,
  });
  return response.data;
}

/** POST /auth/verify-phone; the response is the updated session user. */
export async function verifyPhone(payload: VerifyPhoneRequest): Promise<PhoneVerificationData> {
  const response = await sessionClient.post<PhoneVerificationData>("/auth/verify-phone", payload, {
    headers: await csrfHeaders(),
    skipUnauthorizedHandler: true,
  });
  return response.data;
}
