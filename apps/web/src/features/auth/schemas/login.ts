import { authCopy } from "../copy/auth";

/** Only fields accepted by POST /auth/login are collected (FE-014). */
export interface LoginFormValues {
  email: string;
  password: string;
}

export type LoginField = keyof LoginFormValues;
export type LoginFormErrors = Partial<Record<LoginField, string>>;
export type LoginValidationResult<T> =
  { ok: true; value: T } | { ok: false; errors: LoginFormErrors };

export interface LoginPayload {
  email: string;
  password: string;
}

export const emptyLoginForm: LoginFormValues = {
  email: "",
  password: "",
};

export const loginFieldOrder: readonly LoginField[] = ["email", "password"];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Pure validation seam. Password length is a registration rule, not a login
 * rule, so an existing short password must still be accepted here.
 */
export function validateLoginForm(values: LoginFormValues): LoginValidationResult<LoginPayload> {
  const errors: LoginFormErrors = {};
  const email = values.email.trim();

  if (!email) {
    errors.email = authCopy.validation.emailRequired;
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = authCopy.validation.emailInvalid;
  }

  if (!values.password) {
    errors.password = authCopy.validation.passwordRequired;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: { email, password: values.password } };
}
