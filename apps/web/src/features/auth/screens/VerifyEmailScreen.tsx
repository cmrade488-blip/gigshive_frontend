"use client";

import { siteRoutes } from "@gigshive/shared/routes";
import { Button, Input, StateMessage } from "@gigshive/ui";
import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { describeAuthError, type AuthFormIssue } from "../api/error-copy";
import { AuthShell } from "../components/AuthShell";
import { OtpInput } from "../components/OtpInput";
import { authCopy } from "../copy/auth";
import {
  emptyVerifyEmailForm,
  validateResendEmail,
  validateVerifyEmailForm,
  verifyEmailFieldOrder,
  type VerifyEmailField,
  type VerifyEmailFormErrors,
  type VerifyEmailFormValues,
} from "../schemas/verify-email";
import { useResendEmailOtp } from "../state/use-resend-email-otp";
import { useVerifyEmail } from "../state/use-verify-email";

/** Email OTP confirmation. The code lives only in component memory. */
export function VerifyEmailScreen() {
  const [values, setValues] = useState<VerifyEmailFormValues>(emptyVerifyEmailForm);
  const [errors, setErrors] = useState<VerifyEmailFormErrors>({});
  const [issue, setIssue] = useState<AuthFormIssue | null>(null);
  const [resendIssue, setResendIssue] = useState<AuthFormIssue | null>(null);
  const [resent, setResent] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const verify = useVerifyEmail();
  const resend = useResendEmailOtp();
  const fields = useRef<Partial<Record<VerifyEmailField, HTMLInputElement | null>>>({});

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

  function startCooldown(seconds: number): void {
    if (seconds > 0) {
      setCooldownUntil(Date.now() + seconds * 1000);
      setSecondsLeft(seconds);
    }
  }

  function updateField(field: VerifyEmailField, value: string): void {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setIssue(null);
    setResendIssue(null);
    setResent(false);
  }

  function focusFirst(invalid: VerifyEmailFormErrors): void {
    const firstInvalid = verifyEmailFieldOrder.find((field) => invalid[field]);
    if (firstInvalid) {
      fields.current[firstInvalid]?.focus();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (verify.isPending || blocked) {
      return;
    }

    const validation = validateVerifyEmailForm(values);
    if (!validation.ok) {
      setErrors(validation.errors);
      focusFirst(validation.errors);
      return;
    }

    setErrors({});
    setIssue(null);
    setResendIssue(null);
    setResent(false);
    try {
      await verify.mutateAsync(validation.value);
      // OTP is sensitive: discard it from component memory as soon as it is used.
      setValues(emptyVerifyEmailForm);
      setSucceeded(true);
    } catch (error) {
      const mapped = describeAuthError(error);
      setIssue(mapped);
      setErrors(mapped.fieldErrors);
      startCooldown(mapped.retryAfterSeconds ?? 0);
    }
  }

  async function handleResend(): Promise<void> {
    if (resend.isPending || blocked) {
      return;
    }

    const validation = validateResendEmail(values.email);
    if (!validation.ok) {
      setErrors({ email: validation.error });
      setResendIssue(null);
      fields.current.email?.focus();
      return;
    }

    setErrors({});
    setResendIssue(null);
    setIssue(null);
    try {
      const result = await resend.mutateAsync(validation.value);
      setValues((previous) => ({ ...previous, otp: "" }));
      setResent(true);
      startCooldown(result.retry_after);
    } catch (error) {
      const mapped = describeAuthError(error);
      setResendIssue(mapped);
      startCooldown(mapped.retryAfterSeconds ?? 0);
    }
  }

  if (succeeded) {
    return (
      <AuthShell step="verify" title={authCopy.verify.successTitle}>
        <div className="mt-5 space-y-5">
          <StateMessage
            role="status"
            tone="info"
            title={authCopy.verify.successTitle}
            description={authCopy.verify.successText}
            action={
              <Link
                href={siteRoutes.home}
                className="inline-flex min-h-11 items-center rounded-md bg-gh-primary px-4 py-2 font-semibold text-gh-primary-text hover:bg-gh-primary-hover focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:outline-none"
              >
                {authCopy.verify.successActionLabel}
              </Link>
            }
          />
          <p className="text-xs text-ink-500">{authCopy.verify.privacyNote}</p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell step="verify" title={authCopy.verify.heading}>
      <p className="mt-2 text-sm leading-relaxed text-ink-600">{authCopy.verify.intro}</p>

      {resent ? (
        <div className="mt-5">
          <StateMessage
            role="status"
            tone="info"
            title={authCopy.verify.sentTitle}
            description={authCopy.verify.sentText}
          />
        </div>
      ) : null}

      {issue ? (
        <div className="mt-5">
          <StateMessage
            role="alert"
            tone={issue.copy.tone}
            title={issue.copy.title}
            description={issue.copy.description}
            reference={issue.reference}
          />
        </div>
      ) : null}

      {resendIssue ? (
        <div className="mt-5">
          <StateMessage
            role="alert"
            tone={resendIssue.copy.tone}
            title={resendIssue.copy.title}
            description={resendIssue.copy.description}
            reference={resendIssue.reference}
          />
        </div>
      ) : null}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        <Input
          label={authCopy.verify.emailLabel}
          type="email"
          autoComplete="email"
          value={values.email}
          error={errors.email}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            updateField("email", event.target.value)
          }
          ref={(node) => {
            fields.current.email = node;
          }}
          required
        />

        <OtpInput
          value={values.otp}
          error={errors.otp}
          disabled={blocked}
          onChange={(value) => updateField("otp", value)}
          ref={(node) => {
            fields.current.otp = node;
          }}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={blocked || resend.isPending}
            className="rounded-sm text-sm font-semibold text-ink-700 underline underline-offset-4 hover:text-ink-900 focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:text-ink-400"
          >
            {blocked
              ? authCopy.verify.cooldown(secondsLeft)
              : resend.isPending
                ? authCopy.verify.resendingLabel
                : authCopy.verify.resendLabel}
          </button>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={verify.isPending}
          disabled={verify.isPending || blocked}
        >
          {verify.isPending ? authCopy.verify.submittingLabel : authCopy.verify.submitLabel}
        </Button>
      </form>

      <p className="mt-5 text-xs leading-relaxed text-ink-500">{authCopy.verify.privacyNote}</p>
    </AuthShell>
  );
}
