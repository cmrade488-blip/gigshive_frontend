import { describe, expect, it } from "vitest";

import { normaliseStaffOtp, validateStaffOtpStep, validateStaffPasswordStep } from "./staff-login";

describe("normaliseStaffOtp", () => {
  it("keeps six digits from pasted or autofilled values", () => {
    expect(normaliseStaffOtp("12a3-45 6789")).toBe("123456");
    expect(normaliseStaffOtp("abcdef")).toBe("");
  });
});

describe("validateStaffPasswordStep", () => {
  it("accepts and normalises a valid email", () => {
    expect(validateStaffPasswordStep({ email: " Ada@Example.COM ", password: "secret" })).toEqual({
      ok: true,
      value: { email: "ada@example.com", password: "secret" },
    });
  });

  it("reports both invalid fields", () => {
    const result = validateStaffPasswordStep({ email: "not-an-email", password: "" });
    expect(result).toEqual({ ok: false, errors: { email: "email", password: "password" } });
  });

  it("reports each field independently", () => {
    expect(validateStaffPasswordStep({ email: "ada@example.com", password: "" })).toEqual({
      ok: false,
      errors: { password: "password" },
    });
    expect(validateStaffPasswordStep({ email: "bad", password: "secret" })).toEqual({
      ok: false,
      errors: { email: "email" },
    });
  });
});

describe("validateStaffOtpStep", () => {
  it("normalises then accepts a six-digit code", () => {
    expect(validateStaffOtpStep({ otp: "12 34-56" })).toEqual({
      ok: true,
      value: { otp: "123456" },
    });
  });

  it("rejects short, long and non-digit codes", () => {
    expect(validateStaffOtpStep({ otp: "12345" })).toEqual({ ok: false, errors: { otp: "otp" } });
    expect(validateStaffOtpStep({ otp: "1234567" })).toEqual({ ok: false, errors: { otp: "otp" } });
    expect(validateStaffOtpStep({ otp: "abcdef" })).toEqual({ ok: false, errors: { otp: "otp" } });
  });
});
