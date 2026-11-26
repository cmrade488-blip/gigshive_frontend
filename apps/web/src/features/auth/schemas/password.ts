import { authCopy } from "../copy/auth";

/** FE-015 payloads use only fields accepted by the generated OpenAPI contract. */
export interface ForgotPasswordFormValues {
  email: string;
}

export interface ResetPasswordFormValues {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordFormValues {
  currentPassword: string;
  password: string;
}

export type FormErrors<T> = Partial<Record<keyof T, string>>;
export type FormValidationResult<T, V> =
  { ok: true; value: V } | { ok: false; errors: FormErrors<T> };

export const emptyForgotPasswordForm: ForgotPasswordFormValues = { email: "" };
export const emptyResetPasswordForm: ResetPasswordFormValues = {
  token: "",
  password: "",
  confirmPassword: "",
};
export const emptyChangePasswordForm: ChangePasswordFormValues = {
  currentPassword: "",
  password: "",
};

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function passwordError(password: string): string | undefined {
  if (!password) {
    return authCopy.validation.passwordRequired;
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return authCopy.validation.passwordTooShort;
  }
  return undefined;
}

/** Enumeration-safe request: validate the address format, never account existence. */
export function validateForgotPasswordForm(
  values: ForgotPasswordFormValues,
): FormValidationResult<ForgotPasswordFormValues, ForgotPasswordFormValues> {
  const email = values.email.trim();
  if (!email) {
    return { ok: false, errors: { email: authCopy.validation.emailRequired } };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, errors: { email: authCopy.validation.emailInvalid } };
  }
  return { ok: true, value: { email } };
}

/** The token is held only in component memory; it is never written back to a URL. */
export function validateResetPasswordForm(
  values: ResetPasswordFormValues,
): FormValidationResult<ResetPasswordFormValues, { token: string; password: string }> {
  const errors: FormErrors<ResetPasswordFormValues> = {};
  const token = values.token.trim();

  if (!token) {
    errors.token = authCopy.validation.tokenRequired;
  }

  const invalidPassword = passwordError(values.password);
  if (invalidPassword) {
    errors.password = invalidPassword;
  } else if (!values.confirmPassword) {
    errors.confirmPassword = authCopy.validation.passwordRequired;
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = authCopy.validation.passwordMismatch;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: { token, password: values.password } };
}

/** A wrong current password arrives as a 422 field detail, not a 401. */
export function validateChangePasswordForm(
  values: ChangePasswordFormValues,
): FormValidationResult<ChangePasswordFormValues, { current_password: string; password: string }> {
  const errors: FormErrors<ChangePasswordFormValues> = {};
  if (!values.currentPassword) {
    errors.currentPassword = authCopy.validation.currentPasswordRequired;
  }

  const invalidPassword = passwordError(values.password);
  if (invalidPassword) {
    errors.password = invalidPassword;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: { current_password: values.currentPassword, password: values.password },
  };
}
