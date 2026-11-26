import { describe, expect, it } from "vitest";

import { authCopy } from "../copy/auth";
import {
  emptyPhoneNumberForm,
  emptyPhoneOtpForm,
  validatePhoneNumberForm,
  validatePhoneOtpForm,
} from "./phone";

describe("validatePhoneNumberForm", () => {
  it("trims and accepts an E.164 number", () => {
    expect(validatePhoneNumberForm({ phone: " +2348012345678 " })).toEqual({
      ok: true,
      value: { phone: "+2348012345678" },
    });
  });

  it("requires a phone number", () => {
    expect(validatePhoneNumberForm(emptyPhoneNumberForm)).toEqual({
      ok: false,
      errors: { phone: authCopy.validation.phoneRequired },
    });
  });

  it("rejects a number without its country code", () => {
    expect(validatePhoneNumberForm({ phone: "08012345678" })).toEqual({
      ok: false,
      errors: { phone: authCopy.validation.phoneInvalid },
    });
  });
});

describe("validatePhoneOtpForm", () => {
  it("normalises a pasted code before validating", () => {
    expect(validatePhoneOtpForm({ otp: "123 456" })).toEqual({
      ok: true,
      value: { otp: "123456" },
    });
  });

  it("requires a code", () => {
    expect(validatePhoneOtpForm(emptyPhoneOtpForm)).toEqual({
      ok: false,
      errors: { otp: authCopy.validation.phoneCodeRequired },
    });
  });

  it("rejects a partial code", () => {
    expect(validatePhoneOtpForm({ otp: "123" })).toEqual({
      ok: false,
      errors: { otp: authCopy.validation.phoneCodeInvalid },
    });
  });
});
