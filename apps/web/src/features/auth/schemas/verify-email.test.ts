import { describe, expect, it } from "vitest";

import { authCopy } from "../copy/auth";
import {
  emptyVerifyEmailForm,
  normaliseOtp,
  validateResendEmail,
  validateVerifyEmailForm,
} from "./verify-email";

describe("normaliseOtp", () => {
  it("keeps only the first six digits of pasted or autofilled text", () => {
    expect(normaliseOtp("123 456-7890")).toBe("123456");
    expect(normaliseOtp("code: 654321")).toBe("654321");
  });
});

describe("validateVerifyEmailForm", () => {
  it("accepts a valid email and a normalised six-digit code", () => {
    const result = validateVerifyEmailForm({
      email: "  person@example.com ",
      otp: "12 34 56",
    });

    expect(result).toEqual({
      ok: true,
      value: { email: "person@example.com", otp: "123456" },
    });
  });

  it("reports missing email and code", () => {
    const result = validateVerifyEmailForm(emptyVerifyEmailForm);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toEqual({
        email: authCopy.validation.emailRequired,
        otp: authCopy.validation.codeRequired,
      });
    }
  });

  it("reports an invalid email and a code that is not six digits", () => {
    const result = validateVerifyEmailForm({ email: "invalid", otp: "123" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toEqual({
        email: authCopy.validation.emailInvalid,
        otp: authCopy.validation.codeInvalid,
      });
    }
  });
});

describe("validateResendEmail", () => {
  it("trims a valid address", () => {
    expect(validateResendEmail(" person@example.com ")).toEqual({
      ok: true,
      value: "person@example.com",
    });
  });

  it("rejects an empty or invalid address", () => {
    expect(validateResendEmail("  ")).toEqual({
      ok: false,
      error: authCopy.validation.emailRequired,
    });
    expect(validateResendEmail("invalid")).toEqual({
      ok: false,
      error: authCopy.validation.emailInvalid,
    });
  });
});
