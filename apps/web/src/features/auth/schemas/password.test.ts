import { describe, expect, it } from "vitest";

import { authCopy } from "../copy/auth";
import {
  emptyChangePasswordForm,
  emptyForgotPasswordForm,
  emptyResetPasswordForm,
  validateChangePasswordForm,
  validateForgotPasswordForm,
  validateResetPasswordForm,
} from "./password";

describe("validateForgotPasswordForm", () => {
  it("trims and accepts a valid email", () => {
    expect(validateForgotPasswordForm({ email: "  person@example.com " })).toEqual({
      ok: true,
      value: { email: "person@example.com" },
    });
  });

  it("requires an email", () => {
    expect(validateForgotPasswordForm(emptyForgotPasswordForm)).toEqual({
      ok: false,
      errors: { email: authCopy.validation.emailRequired },
    });
  });

  it("rejects a malformed email", () => {
    expect(validateForgotPasswordForm({ email: "not-an-email" })).toEqual({
      ok: false,
      errors: { email: authCopy.validation.emailInvalid },
    });
  });
});

describe("validateResetPasswordForm", () => {
  it("returns only contract fields and never the confirmation", () => {
    expect(
      validateResetPasswordForm({
        token: " reset_token ",
        password: "long-enough",
        confirmPassword: "long-enough",
      }),
    ).toEqual({
      ok: true,
      value: { token: "reset_token", password: "long-enough" },
    });
  });

  it("requires a token", () => {
    const result = validateResetPasswordForm({
      ...emptyResetPasswordForm,
      password: "long-enough",
      confirmPassword: "long-enough",
    });

    expect(result).toEqual({
      ok: false,
      errors: { token: authCopy.validation.tokenRequired },
    });
  });

  it("requires and length-checks the new password", () => {
    expect(
      validateResetPasswordForm({ token: "token", password: "", confirmPassword: "" }),
    ).toEqual({ ok: false, errors: { password: authCopy.validation.passwordRequired } });
    expect(
      validateResetPasswordForm({ token: "token", password: "short", confirmPassword: "short" }),
    ).toEqual({ ok: false, errors: { password: authCopy.validation.passwordTooShort } });
  });

  it("requires and checks the confirmation", () => {
    expect(
      validateResetPasswordForm({ token: "token", password: "long-enough", confirmPassword: "" }),
    ).toEqual({ ok: false, errors: { confirmPassword: authCopy.validation.passwordRequired } });
    expect(
      validateResetPasswordForm({
        token: "token",
        password: "long-enough",
        confirmPassword: "different-one",
      }),
    ).toEqual({ ok: false, errors: { confirmPassword: authCopy.validation.passwordMismatch } });
  });
});

describe("validateChangePasswordForm", () => {
  it("maps to the snake_case contract fields", () => {
    expect(
      validateChangePasswordForm({ currentPassword: "old-password", password: "new-password" }),
    ).toEqual({
      ok: true,
      value: { current_password: "old-password", password: "new-password" },
    });
  });

  it("requires the current password", () => {
    expect(validateChangePasswordForm(emptyChangePasswordForm)).toEqual({
      ok: false,
      errors: {
        currentPassword: authCopy.validation.currentPasswordRequired,
        password: authCopy.validation.passwordRequired,
      },
    });
  });

  it("requires and length-checks the new password", () => {
    expect(validateChangePasswordForm({ currentPassword: "old-password", password: "" })).toEqual({
      ok: false,
      errors: { password: authCopy.validation.passwordRequired },
    });
    expect(
      validateChangePasswordForm({ currentPassword: "old-password", password: "short" }),
    ).toEqual({ ok: false, errors: { password: authCopy.validation.passwordTooShort } });
  });
});
