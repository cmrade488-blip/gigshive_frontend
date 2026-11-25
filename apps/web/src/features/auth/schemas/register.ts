import { authCopy } from "../copy/auth";

/** Only fields accepted by POST /auth/register are collected (FE-013). */
export interface RegisterFormValues {
  email: string;
  password: string;
  phone: string;
}

export type RegisterField = keyof RegisterFormValues;
export type RegisterFormErrors = Partial<Record<RegisterField, string>>;
export type ValidationResult<T> =
  { ok: true; value: T } | { ok: false; errors: RegisterFormErrors };

export const emptyRegisterForm: RegisterFormValues = {
  email: "",
  password: "",
  phone: "",
};

export const registerFieldOrder: readonly RegisterField[] = ["email", "password", "phone"];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

export interface RegisterPayload {
  email: string;
  password: string;
  phone?: string;
}

/**
 * Pure validation seam. React Hook Form and Zod are not installed yet; adding
 * them needs an ADR. This function is the single source of register rules.
 */
export function validateRegisterForm(
  values: RegisterFormValues,
): ValidationResult<RegisterPayload> {
  const errors: RegisterFormErrors = {};
  const email = values.email.trim();
  const phone = values.phone.trim();

  if (!email) {
    errors.email = authCopy.validation.emailRequired;
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = authCopy.validation.emailInvalid;
  }

  if (!values.password) {
    errors.password = authCopy.validation.passwordRequired;
  } else if (values.password.length < 8) {
    errors.password = authCopy.validation.passwordTooShort;
  }

  if (phone && !E164_PATTERN.test(phone)) {
    errors.phone = authCopy.validation.phoneInvalid;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      email,
      password: values.password,
      ...(phone ? { phone } : {}),
    },
  };
}
