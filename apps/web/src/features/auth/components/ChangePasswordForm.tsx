"use client";

import { siteRoutes } from "@gigshive/shared/routes";
import { Button, Input, StateMessage } from "@gigshive/ui";
import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { describeAuthError, type AuthFormIssue } from "../api/error-copy";
import { authCopy } from "../copy/auth";
import { emptyChangePasswordForm, validateChangePasswordForm } from "../schemas/password";
import { useChangePassword } from "../state/use-change-password";

/**
 * Settings section for FE-016 to embed. It never re-renders a password and
 * keeps the current session when the API reports a wrong current password.
 */
export function ChangePasswordForm() {
  const changePassword = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState(emptyChangePasswordForm.currentPassword);
  const [password, setPassword] = useState(emptyChangePasswordForm.password);
  const [errors, setErrors] = useState<{ currentPassword?: string; password?: string }>({});
  const [issue, setIssue] = useState<AuthFormIssue | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [saved, setSaved] = useState(false);
  const fields = useRef<Partial<Record<"currentPassword" | "password", HTMLInputElement | null>>>(
    {},
  );

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

  function updateField(field: "currentPassword" | "password", value: string): void {
    if (field === "currentPassword") {
      setCurrentPassword(value);
    } else {
      setPassword(value);
    }
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setIssue(null);
    setCooldown(0);
    setSaved(false);
  }

  function fieldProps(field: "currentPassword" | "password") {
    return {
      value: field === "currentPassword" ? currentPassword : password,
      error: errors[field],
      onChange: (event: ChangeEvent<HTMLInputElement>) => updateField(field, event.target.value),
      ref: (node: HTMLInputElement | null) => {
        fields.current[field] = node;
      },
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (changePassword.isPending || cooldown > 0) {
      return;
    }

    const validation = validateChangePasswordForm({ currentPassword, password });
    if (!validation.ok) {
      setErrors(validation.errors);
      if (validation.errors.currentPassword) {
        fields.current.currentPassword?.focus();
      } else if (validation.errors.password) {
        fields.current.password?.focus();
      }
      return;
    }

    setErrors({});
    setIssue(null);
    try {
      await changePassword.mutateAsync(validation.value);
      setCurrentPassword(emptyChangePasswordForm.currentPassword);
      setPassword(emptyChangePasswordForm.password);
      setSaved(true);
    } catch (error) {
      const mapped = describeAuthError(error);
      setIssue(mapped);
      setErrors({
        currentPassword: mapped.fieldErrors.current_password,
        password: mapped.fieldErrors.password,
      });
    }
  }

  const sessionEnded = issue?.kind === "auth";
  const visibleIssue =
    issue && !sessionEnded
      ? {
          ...issue.copy,
          ...(issue.kind === "rateLimit" && cooldown > 0
            ? { description: authCopy.login.rateLimitCountdown(cooldown) }
            : {}),
        }
      : null;

  return (
    <section aria-labelledby="change-password-heading">
      <h2 id="change-password-heading" className="font-poppins text-xl font-bold text-ink-900">
        {authCopy.changePassword.heading}
      </h2>

      {saved ? (
        <div className="mt-4">
          <StateMessage
            role="status"
            tone="info"
            title={authCopy.changePassword.successTitle}
            description={authCopy.changePassword.successText}
          />
        </div>
      ) : (
        <>
          {sessionEnded ? (
            <div className="mt-4">
              <StateMessage
                role="alert"
                tone={issue?.copy.tone}
                title={authCopy.changePassword.sessionEndedTitle}
                description={authCopy.changePassword.sessionEndedText}
                action={
                  <Link
                    href={siteRoutes.login}
                    className="rounded font-semibold text-gh-primary underline focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:outline-none"
                  >
                    {authCopy.changePassword.signInLabel}
                  </Link>
                }
              />
            </div>
          ) : null}

          {visibleIssue ? (
            <div className="mt-4">
              <StateMessage
                role="alert"
                tone={visibleIssue.tone}
                title={visibleIssue.title}
                description={visibleIssue.description}
                reference={issue?.reference}
              />
            </div>
          ) : null}

          <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
            <Input
              {...fieldProps("currentPassword")}
              label={authCopy.changePassword.currentLabel}
              type="password"
              autoComplete="current-password"
              required
            />
            <Input
              {...fieldProps("password")}
              label={authCopy.changePassword.newLabel}
              type="password"
              autoComplete="new-password"
              hint={authCopy.changePassword.passwordHint}
              required
            />
            <Button
              type="submit"
              loading={changePassword.isPending}
              disabled={changePassword.isPending || cooldown > 0}
            >
              {changePassword.isPending
                ? authCopy.changePassword.submittingLabel
                : authCopy.changePassword.submitLabel}
            </Button>
          </form>
        </>
      )}
    </section>
  );
}
