"use client";

import { siteRoutes } from "@gigshive/shared/routes";
import { Button, Input, StateMessage } from "@gigshive/ui";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { describeAuthError, type AuthFormIssue } from "../api/error-copy";
import { authCopy } from "../copy/auth";
import { emptyPhoneOtpForm, validatePhoneOtpForm, validatePhoneNumberForm } from "../schemas/phone";
import { useSendPhoneOtp } from "../state/use-send-phone-otp";
import { useVerifyPhone } from "../state/use-verify-phone";
import { OtpInput } from "./OtpInput";

/** FE-016 phone OTP flow. The phone and code stay in component memory only. */
export function PhoneVerificationForm({
  phone,
  verified,
}: {
  phone: string | null;
  verified: boolean;
}) {
  const send = useSendPhoneOtp();
  const verify = useVerifyPhone();
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<"number" | "code">("number");
  const [phoneValue, setPhoneValue] = useState(phone ?? "");
  const [otp, setOtp] = useState(emptyPhoneOtpForm.otp);
  const [errors, setErrors] = useState<{ phone?: string; otp?: string }>({});
  const [issue, setIssue] = useState<AuthFormIssue | null>(null);
  const [sendIssue, setSendIssue] = useState<AuthFormIssue | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [sent, setSent] = useState(false);
  const [success, setSuccess] = useState(false);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const otpRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (cooldownUntil === null) {
      return;
    }

    const tick = (): void => {
      const remaining = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        setCooldownUntil(null);
      }
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownUntil]);

  const blocked = secondsLeft > 0;
  const sessionEnded = issue?.kind === "auth" || sendIssue?.kind === "auth";

  function startCooldown(seconds: number): void {
    if (seconds > 0) {
      setCooldownUntil(Date.now() + seconds * 1000);
      setSecondsLeft(seconds);
    }
  }

  function reset(): void {
    setOpen(false);
    setStage("number");
    setOtp(emptyPhoneOtpForm.otp);
    setErrors({});
    setIssue(null);
    setSendIssue(null);
    setSent(false);
    setSuccess(false);
    setCooldownUntil(null);
    setSecondsLeft(0);
  }

  function begin(): void {
    reset();
    setOpen(true);
  }

  async function handleSend(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (send.isPending || blocked) {
      return;
    }

    const validation = validatePhoneNumberForm({ phone: phoneValue });
    if (!validation.ok) {
      setErrors({ phone: validation.errors.phone });
      phoneRef.current?.focus();
      return;
    }

    setErrors({});
    setSendIssue(null);
    setIssue(null);
    try {
      const result = await send.mutateAsync({ channel: "PHONE", phone: validation.value.phone });
      setStage("code");
      setOtp(emptyPhoneOtpForm.otp);
      setSent(true);
      startCooldown(result.retry_after ?? 0);
    } catch (error) {
      const mapped = describeAuthError(error);
      setSendIssue(mapped);
      setErrors({ phone: mapped.fieldErrors.phone });
      startCooldown(mapped.retryAfterSeconds ?? 0);
      if (mapped.fieldErrors.phone) {
        phoneRef.current?.focus();
      }
    }
  }

  async function handleResend(): Promise<void> {
    if (send.isPending || blocked) {
      return;
    }

    const validation = validatePhoneNumberForm({ phone: phoneValue });
    if (!validation.ok) {
      setErrors({ phone: validation.errors.phone });
      phoneRef.current?.focus();
      return;
    }

    setErrors({});
    setSendIssue(null);
    setIssue(null);
    try {
      const result = await send.mutateAsync({ channel: "PHONE", phone: validation.value.phone });
      setOtp(emptyPhoneOtpForm.otp);
      setSent(true);
      startCooldown(result.retry_after ?? 0);
    } catch (error) {
      const mapped = describeAuthError(error);
      setSendIssue(mapped);
      startCooldown(mapped.retryAfterSeconds ?? 0);
    }
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (verify.isPending || blocked) {
      return;
    }

    const validation = validatePhoneOtpForm({ otp });
    if (!validation.ok) {
      setErrors({ otp: validation.errors.otp });
      otpRef.current?.focus();
      return;
    }

    setErrors({});
    setIssue(null);
    setSendIssue(null);
    try {
      await verify.mutateAsync(validation.value);
      setOtp(emptyPhoneOtpForm.otp);
      setSent(false);
      setSuccess(true);
      setOpen(false);
    } catch (error) {
      const mapped = describeAuthError(error);
      setIssue(mapped);
      setErrors({ otp: mapped.fieldErrors.otp });
      startCooldown(mapped.retryAfterSeconds ?? 0);
      if (mapped.fieldErrors.otp) {
        otpRef.current?.focus();
      }
    }
  }

  const actionLabel = verified
    ? authCopy.phoneVerification.changeLabel
    : phone
      ? authCopy.phoneVerification.verifyLabel
      : authCopy.phoneVerification.addLabel;
  const visibleIssue = issue ?? sendIssue;
  const visibleIssueCopy = visibleIssue
    ? {
        ...visibleIssue.copy,
        ...(visibleIssue.kind === "rateLimit" && blocked
          ? { description: authCopy.login.rateLimitCountdown(secondsLeft) }
          : {}),
      }
    : null;

  return (
    <div className="mt-3">
      {success ? (
        <StateMessage
          role="status"
          tone="info"
          title={authCopy.phoneVerification.successTitle}
          description={authCopy.phoneVerification.successText}
        />
      ) : null}

      {!open || sessionEnded ? null : (
        <div className="space-y-4 rounded-xl border border-gh-border bg-gh-surface p-4">
          {sent && stage === "code" ? (
            <StateMessage
              role="status"
              tone="info"
              title={authCopy.phoneVerification.sentTitle}
              description={authCopy.phoneVerification.sentText}
            />
          ) : null}

          {visibleIssueCopy && !sessionEnded ? (
            <StateMessage
              role="alert"
              tone={visibleIssueCopy.tone}
              title={visibleIssueCopy.title}
              description={visibleIssueCopy.description}
              reference={visibleIssue?.reference}
            />
          ) : null}

          <form onSubmit={handleSend} noValidate className="space-y-4">
            <Input
              ref={phoneRef}
              label={authCopy.phoneVerification.phoneLabel}
              hint={authCopy.phoneVerification.phoneHint}
              type="tel"
              autoComplete="tel"
              required
              disabled={stage === "code"}
              value={phoneValue}
              error={errors.phone}
              onChange={(event) => {
                setPhoneValue(event.target.value);
                setErrors((previous) => ({ ...previous, phone: undefined }));
                setSendIssue(null);
              }}
            />
            {stage === "number" ? (
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" loading={send.isPending} disabled={send.isPending || blocked}>
                  {send.isPending
                    ? authCopy.phoneVerification.sendingLabel
                    : authCopy.phoneVerification.sendLabel}
                </Button>
                <Button type="button" variant="secondary" onClick={reset}>
                  {authCopy.phoneVerification.cancelLabel}
                </Button>
              </div>
            ) : null}
          </form>

          {stage === "code" ? (
            <form onSubmit={handleVerify} noValidate className="space-y-4">
              <OtpInput
                ref={otpRef}
                label={authCopy.phoneVerification.codeLabel}
                hint={authCopy.phoneVerification.codeHint}
                value={otp}
                error={errors.otp}
                disabled={blocked}
                onChange={(value) => {
                  setOtp(value);
                  setErrors((previous) => ({ ...previous, otp: undefined }));
                  setIssue(null);
                }}
              />
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="submit"
                  loading={verify.isPending}
                  disabled={verify.isPending || blocked}
                >
                  {verify.isPending
                    ? authCopy.phoneVerification.verifyingLabel
                    : authCopy.phoneVerification.verifyLabel}
                </Button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={send.isPending || blocked}
                  className="rounded-sm text-sm font-semibold text-ink-700 underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:text-ink-400"
                >
                  {blocked
                    ? authCopy.phoneVerification.cooldown(secondsLeft)
                    : send.isPending
                      ? authCopy.phoneVerification.resendingLabel
                      : authCopy.phoneVerification.resendLabel}
                </button>
                <Button type="button" variant="secondary" onClick={reset}>
                  {authCopy.phoneVerification.cancelLabel}
                </Button>
              </div>
            </form>
          ) : null}
        </div>
      )}

      {sessionEnded ? (
        <StateMessage
          role="alert"
          tone="danger"
          title={authCopy.phoneVerification.sessionEndedTitle}
          description={authCopy.phoneVerification.sessionEndedText}
          action={
            <Link
              href={siteRoutes.login}
              className="rounded font-semibold text-gh-primary underline focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:outline-none"
            >
              {authCopy.phoneVerification.signInLabel}
            </Link>
          }
        />
      ) : open ? null : (
        <Button type="button" variant="secondary" onClick={begin}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
