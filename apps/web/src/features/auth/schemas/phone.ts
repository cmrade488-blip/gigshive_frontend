import { authCopy } from "../copy/auth";
import { normaliseOtp } from "./verify-email";

/** FE-016 phone-verification fields. The OTP is never persisted or put in a URL. */
export interface PhoneNumberFormValues {
  phone: string;
}

export interface PhoneOtpFormValues {
  otp: string;
}

export type PhoneValidationResult<T, V> =
  { ok: true; value: V } | { ok: false; errors: Partial<Record<keyof T, string>> };

export const emptyPhoneNumberForm: PhoneNumberFormValues = { phone: "" };
export const emptyPhoneOtpForm: PhoneOtpFormValues = { otp: "" };

const E164_PATTERN = /^\+[1-9]\d{7,14}$/;
const OTP_PATTERN = /^\d{6}$/;

/** E.164 is the only phone format accepted by the generated contract. */
export function validatePhoneNumberForm(
  values: PhoneNumberFormValues,
): PhoneValidationResult<PhoneNumberFormValues, PhoneNumberFormValues> {
  const phone = values.phone.trim();
  if (!phone) {
    return { ok: false, errors: { phone: authCopy.validation.phoneRequired } };
  }
  if (!E164_PATTERN.test(phone)) {
    return { ok: false, errors: { phone: authCopy.validation.phoneInvalid } };
  }
  return { ok: true, value: { phone } };
}

/** Pasted codes are normalised before validation, as with email OTP. */
export function validatePhoneOtpForm(
  values: PhoneOtpFormValues,
): PhoneValidationResult<PhoneOtpFormValues, PhoneOtpFormValues> {
  const otp = normaliseOtp(values.otp);
  if (!otp) {
    return { ok: false, errors: { otp: authCopy.validation.phoneCodeRequired } };
  }
  if (!OTP_PATTERN.test(otp)) {
    return { ok: false, errors: { otp: authCopy.validation.phoneCodeInvalid } };
  }
  return { ok: true, value: { otp } };
}
