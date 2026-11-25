import { authCopy } from "../copy/auth";

/** Email and OTP only; neither value is persisted or placed in a URL. */
export interface VerifyEmailFormValues {
  email: string;
  otp: string;
}

export type VerifyEmailField = keyof VerifyEmailFormValues;
export type VerifyEmailFormErrors = Partial<Record<VerifyEmailField, string>>;
export type VerifyResult<T> = { ok: true; value: T } | { ok: false; errors: VerifyEmailFormErrors };

export const emptyVerifyEmailForm: VerifyEmailFormValues = {
  email: "",
  otp: "",
};

export const verifyEmailFieldOrder: readonly VerifyEmailField[] = ["email", "otp"];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_PATTERN = /^\d{6}$/;

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

/** Strips spacing from pasted codes before validating, then keeps digits only. */
export function normaliseOtp(value: string): string {
  return value.replace(/\D/g, "").slice(0, 6);
}

export type ResendEmailResult = { ok: true; value: string } | { ok: false; error: string };

/** Resending needs only a valid email; OTP state is cleared after success. */
export function validateResendEmail(email: string): ResendEmailResult {
  const trimmed = email.trim();
  if (!trimmed) {
    return { ok: false, error: authCopy.validation.emailRequired };
  }
  if (!EMAIL_PATTERN.test(trimmed)) {
    return { ok: false, error: authCopy.validation.emailInvalid };
  }
  return { ok: true, value: trimmed };
}

export function validateVerifyEmailForm(
  values: VerifyEmailFormValues,
): VerifyResult<VerifyEmailPayload> {
  const errors: VerifyEmailFormErrors = {};
  const email = values.email.trim();
  const otp = normaliseOtp(values.otp);

  if (!email) {
    errors.email = authCopy.validation.emailRequired;
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = authCopy.validation.emailInvalid;
  }

  if (!otp) {
    errors.otp = authCopy.validation.codeRequired;
  } else if (!OTP_PATTERN.test(otp)) {
    errors.otp = authCopy.validation.codeInvalid;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: { email, otp } };
}
