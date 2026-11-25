import { Input } from "@gigshive/ui";
import * as React from "react";

import { authCopy } from "../copy/auth";
import { normaliseOtp } from "../schemas/verify-email";

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

/** Single six-digit field with paste and one-time-code autofill support. */
export const OtpInput = React.forwardRef<HTMLInputElement, OtpInputProps>(function OtpInput(
  { value, onChange, error, disabled },
  ref,
) {
  return (
    <Input
      ref={ref}
      label={authCopy.verify.codeLabel}
      hint={authCopy.verify.codeHint}
      error={error}
      value={value}
      onChange={(event) => onChange(normaliseOtp(event.target.value))}
      onPaste={(event) => {
        const pasted = normaliseOtp(event.clipboardData.getData("text"));
        if (pasted) {
          event.preventDefault();
          onChange(pasted);
        }
      }}
      disabled={disabled}
      autoComplete="one-time-code"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={6}
      required
    />
  );
});
