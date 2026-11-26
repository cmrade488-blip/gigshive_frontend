"use client";

import { siteRoutes } from "@gigshive/shared/routes";
import { Button, Input, StateMessage } from "@gigshive/ui";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { describeAuthError, type AuthFormIssue } from "../api/error-copy";
import { AuthShell } from "../components/AuthShell";
import { authCopy } from "../copy/auth";
import {
  emptyLoginForm,
  loginFieldOrder,
  validateLoginForm,
  type LoginField,
  type LoginFormErrors,
  type LoginFormValues,
} from "../schemas/login";
import { returnPathFromParams } from "../schemas/return-path";
import { useLogin } from "../state/use-login";

/** Sign-in form for POST /auth/login, with a validated local return path. */
export function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnPath = returnPathFromParams(searchParams);
  const login = useLogin();
  const [values, setValues] = useState<LoginFormValues>(emptyLoginForm);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [issue, setIssue] = useState<AuthFormIssue | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const fields = useRef<Partial<Record<LoginField, HTMLInputElement | null>>>({});

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

  function updateField(field: LoginField, value: string): void {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setIssue(null);
    setCooldown(0);
  }

  function fieldProps(field: LoginField) {
    return {
      value: values[field],
      error: errors[field],
      onChange: (event: ChangeEvent<HTMLInputElement>) => updateField(field, event.target.value),
      ref: (node: HTMLInputElement | null) => {
        fields.current[field] = node;
      },
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (login.isPending || cooldown > 0) {
      return;
    }

    const validation = validateLoginForm(values);
    if (!validation.ok) {
      setErrors(validation.errors);
      const firstInvalid = loginFieldOrder.find((field) => validation.errors[field]);
      if (firstInvalid) {
        fields.current[firstInvalid]?.focus();
      }
      return;
    }

    setErrors({});
    setIssue(null);
    try {
      await login.mutateAsync(validation.value);
      router.push(returnPath);
    } catch (error) {
      const mapped = describeAuthError(error);
      setIssue(mapped);
      setErrors(mapped.fieldErrors);
    }
  }

  const visibleIssue = issue
    ? {
        ...issue.copy,
        ...(issue.kind === "auth"
          ? {
              title: authCopy.login.invalidCredentialsTitle,
              description: authCopy.login.invalidCredentialsDescription,
            }
          : {}),
        ...(issue.kind === "rateLimit" && cooldown > 0
          ? { description: authCopy.login.rateLimitCountdown(cooldown) }
          : {}),
      }
    : null;

  return (
    <AuthShell step="account" title={authCopy.login.heading} activeTab="signin">
      <p className="mt-2 text-sm leading-relaxed text-ink-600">{authCopy.login.subtitle}</p>

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
          {...fieldProps("email")}
          label={authCopy.login.emailLabel}
          type="email"
          autoComplete="email"
          required
        />
        <Input
          {...fieldProps("password")}
          label={authCopy.login.passwordLabel}
          type="password"
          autoComplete="current-password"
          required
        />

        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={login.isPending}
          disabled={login.isPending || cooldown > 0}
        >
          {login.isPending ? authCopy.login.submittingLabel : authCopy.login.submitLabel}
        </Button>
      </form>

      <p className="mt-5 text-sm text-ink-600">
        {authCopy.login.newHereLabel}{" "}
        <Link
          href={siteRoutes.register}
          className="font-semibold text-gh-primary underline focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:outline-none"
        >
          {authCopy.login.createAccountLabel}
        </Link>
      </p>
    </AuthShell>
  );
}
