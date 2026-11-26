"use client";

import { siteRoutes } from "@gigshive/shared/routes";
import { Button, Input, StateMessage } from "@gigshive/ui";
import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { describeAuthError, type AuthFormIssue } from "../api/error-copy";
import { AuthShell } from "../components/AuthShell";
import { authCopy } from "../copy/auth";
import { emptyForgotPasswordForm, validateForgotPasswordForm } from "../schemas/password";
import { useForgotPassword } from "../state/use-forgot-password";

/** Enumeration-safe reset request: the same confirmation is shown for every email. */
export function ForgotPasswordScreen() {
  const forgotPassword = useForgotPassword();
  const [email, setEmail] = useState(emptyForgotPasswordForm.email);
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [issue, setIssue] = useState<AuthFormIssue | null>(null);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const emailRef = useRef<HTMLInputElement | null>(null);

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

  function updateEmail(event: ChangeEvent<HTMLInputElement>): void {
    setEmail(event.target.value);
    setFieldError(undefined);
    setIssue(null);
    setCooldown(0);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (forgotPassword.isPending || cooldown > 0) {
      return;
    }

    const validation = validateForgotPasswordForm({ email });
    if (!validation.ok) {
      setFieldError(validation.errors.email);
      emailRef.current?.focus();
      return;
    }

    setFieldError(undefined);
    setIssue(null);
    try {
      await forgotPassword.mutateAsync(validation.value);
      setSent(true);
    } catch (error) {
      const mapped = describeAuthError(error);
      setIssue(mapped);
      setFieldError(mapped.fieldErrors.email);
    }
  }

  const visibleIssue = issue
    ? {
        ...issue.copy,
        ...(issue.kind === "rateLimit" && cooldown > 0
          ? { description: authCopy.login.rateLimitCountdown(cooldown) }
          : {}),
      }
    : null;

  return (
    <AuthShell title={authCopy.forgotPassword.heading}>
      <p className="mt-2 text-sm leading-relaxed text-ink-600">
        {authCopy.forgotPassword.subtitle}
      </p>

      {sent ? (
        <div className="mt-6 space-y-4">
          <StateMessage
            role="status"
            tone="info"
            title={authCopy.forgotPassword.sentTitle}
            description={authCopy.forgotPassword.sentText}
            action={
              <Link
                href={siteRoutes.login}
                className="rounded font-semibold text-gh-primary underline focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:outline-none"
              >
                {authCopy.forgotPassword.backToSignIn}
              </Link>
            }
          />
          <p className="text-sm text-ink-600">{authCopy.forgotPassword.sentNote}</p>
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
              ref={emailRef}
              label={authCopy.forgotPassword.emailLabel}
              type="email"
              autoComplete="email"
              required
              value={email}
              error={fieldError}
              onChange={updateEmail}
            />
            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={forgotPassword.isPending}
              disabled={forgotPassword.isPending || cooldown > 0}
            >
              {forgotPassword.isPending
                ? authCopy.forgotPassword.submittingLabel
                : authCopy.forgotPassword.submitLabel}
            </Button>
          </form>

          <p className="mt-5 text-sm text-ink-600">
            <Link
              href={siteRoutes.login}
              className="font-semibold text-gh-primary underline focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:outline-none"
            >
              {authCopy.forgotPassword.backToSignIn}
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
