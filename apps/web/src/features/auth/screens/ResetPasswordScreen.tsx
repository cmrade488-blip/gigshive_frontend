"use client";

import { siteRoutes } from "@gigshive/shared/routes";
import { Button, Input, StateMessage } from "@gigshive/ui";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { describeAuthError, type AuthFormIssue } from "../api/error-copy";
import { AuthShell } from "../components/AuthShell";
import { authCopy } from "../copy/auth";
import { emptyResetPasswordForm, validateResetPasswordForm } from "../schemas/password";
import { useResetPassword } from "../state/use-reset-password";

const signInLinkClass =
  "rounded font-semibold text-gh-primary underline focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:outline-none";

/**
 * Reads the one-time token from the email link, removes it from the URL and
 * keeps it only in component memory until the reset request is submitted.
 */
export function ResetPasswordScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token] = useState(() => searchParams.get("token") ?? "");
  const resetPassword = useResetPassword();
  const [password, setPassword] = useState(emptyResetPasswordForm.password);
  const [confirmPassword, setConfirmPassword] = useState(emptyResetPasswordForm.confirmPassword);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [issue, setIssue] = useState<AuthFormIssue | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [saved, setSaved] = useState(false);
  const fields = useRef<Partial<Record<"password" | "confirmPassword", HTMLInputElement | null>>>(
    {},
  );

  useEffect(() => {
    // The design requires the token to disappear from the address after it is read.
    if (searchParams.has("token")) {
      router.replace(siteRoutes.resetPassword);
    }
  }, [router, searchParams]);

  useEffect(() => {
    const seconds = issue?.kind === "rateLimit" ? (issue.retryAfterSeconds ?? 0) : 0;
    setCooldown(seconds);
    if (seconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setCooldown((remaining) => Math.max(0, remaining - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [issue]);

  function updateField(field: "password" | "confirmPassword", value: string): void {
    if (field === "password") {
      setPassword(value);
    } else {
      setConfirmPassword(value);
    }
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setIssue(null);
    setCooldown(0);
  }

  function fieldProps(field: "password" | "confirmPassword") {
    return {
      value: field === "password" ? password : confirmPassword,
      error: errors[field],
      onChange: (event: ChangeEvent<HTMLInputElement>) => updateField(field, event.target.value),
      ref: (node: HTMLInputElement | null) => {
        fields.current[field] = node;
      },
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (resetPassword.isPending || cooldown > 0 || !token) {
      return;
    }

    const validation = validateResetPasswordForm({ token, password, confirmPassword });
    if (!validation.ok) {
      setErrors({
        password: validation.errors.password,
        confirmPassword: validation.errors.confirmPassword,
      });
      if (validation.errors.password) {
        fields.current.password?.focus();
      } else {
        fields.current.confirmPassword?.focus();
      }
      return;
    }

    setErrors({});
    setIssue(null);
    try {
      await resetPassword.mutateAsync(validation.value);
      setSaved(true);
    } catch (error) {
      const mapped = describeAuthError(error);
      setIssue(mapped);
      setErrors({ password: mapped.fieldErrors.password, confirmPassword: undefined });
    }
  }

  const tokenExpired = Boolean(issue?.fieldErrors.token);
  const visibleIssue =
    issue && !tokenExpired
      ? {
          ...issue.copy,
          ...(issue.kind === "rateLimit" && cooldown > 0
            ? { description: authCopy.login.rateLimitCountdown(cooldown) }
            : {}),
        }
      : null;

  const requestNewLink = (
    <Link href={siteRoutes.forgotPassword} className={signInLinkClass}>
      {authCopy.resetPassword.requestNewLabel}
    </Link>
  );

  return (
    <AuthShell title={authCopy.resetPassword.heading}>
      <p className="mt-2 text-sm leading-relaxed text-ink-600">{authCopy.resetPassword.subtitle}</p>

      {saved ? (
        <div className="mt-6">
          <StateMessage
            role="status"
            tone="info"
            title={authCopy.resetPassword.successTitle}
            description={authCopy.resetPassword.successText}
            action={
              <Link href={siteRoutes.login} className={signInLinkClass}>
                {authCopy.resetPassword.signInLabel}
              </Link>
            }
          />
        </div>
      ) : !token || tokenExpired ? (
        <div className="mt-6">
          <StateMessage
            role="alert"
            tone="warning"
            title={
              tokenExpired
                ? authCopy.resetPassword.expiredTitle
                : authCopy.resetPassword.missingTokenTitle
            }
            description={
              tokenExpired
                ? authCopy.resetPassword.expiredText
                : authCopy.resetPassword.missingTokenText
            }
            action={requestNewLink}
          />
        </div>
      ) : (
        <>
          {visibleIssue ? (
            <div className="mt-5">
              <StateMessage
                role="alert"
                tone={visibleIssue.tone}
                title={visibleIssue.title}
                description={visibleIssue.description}
                reference={issue?.reference}
              />
            </div>
          ) : null}

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
            <Input
              {...fieldProps("password")}
              label={authCopy.resetPassword.newPasswordLabel}
              type="password"
              autoComplete="new-password"
              hint={authCopy.resetPassword.passwordHint}
              required
            />
            <Input
              {...fieldProps("confirmPassword")}
              label={authCopy.resetPassword.confirmLabel}
              type="password"
              autoComplete="new-password"
              required
            />
            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={resetPassword.isPending}
              disabled={resetPassword.isPending || cooldown > 0}
            >
              {resetPassword.isPending
                ? authCopy.resetPassword.submittingLabel
                : authCopy.resetPassword.submitLabel}
            </Button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
