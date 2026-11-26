import { type schema } from "@gigshive/api-client";

import { authClient, csrfHeaders } from "@/lib/api";

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
