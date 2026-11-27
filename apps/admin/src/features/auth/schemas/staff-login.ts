export type StaffLoginField = "email" | "password" | "otp";

export interface StaffPasswordFormValues {
  email: string;
  password: string;
}

export interface StaffOtpFormValues {
  otp: string;
}

export type StaffLoginFormErrors = Partial<Record<StaffLoginField, string>>;

type ValidationResult<T> = { ok: true; value: T } | { ok: false; errors: StaffLoginFormErrors };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** OTP fields accept paste and autofill, then keep digits only. */
export function normaliseStaffOtp(value: string): string {
  return value.replace(/\D/g, "").slice(0, 6);
}

export function validateStaffPasswordStep(
  values: StaffPasswordFormValues,
): ValidationResult<StaffPasswordFormValues> {
  const email = values.email.trim().toLowerCase();
  const password = values.password;
  const errors: StaffLoginFormErrors = {};

  if (!EMAIL_PATTERN.test(email)) {
    errors.email = "email";
  }
  if (password.length === 0) {
    errors.password = "password";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, value: { email, password } };
}

export function validateStaffOtpStep(
  values: StaffOtpFormValues,
): ValidationResult<StaffOtpFormValues> {
  const digits = values.otp.replace(/\D/g, "");
  const otp = normaliseStaffOtp(values.otp);
  if (digits.length !== 6 || !/^\d{6}$/.test(otp)) {
    return { ok: false, errors: { otp: "otp" } };
  }
  return { ok: true, value: { otp } };
}
