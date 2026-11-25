"use client";

import { siteRoutes } from "@gigshive/shared/routes";
import { Button, Input, StateMessage } from "@gigshive/ui";
import Link from "next/link";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { describeAuthError, type AuthFormIssue } from "../api/error-copy";
import { AuthShell } from "../components/AuthShell";
import { authCopy } from "../copy/auth";
import {
  emptyRegisterForm,
  registerFieldOrder,
  validateRegisterForm,
  type RegisterField,
  type RegisterFormErrors,
  type RegisterFormValues,
} from "../schemas/register";
import { useRegister } from "../state/use-register";

/** Registration form for the fields accepted by POST /auth/register. */
export function RegisterScreen() {
  const [values, setValues] = useState<RegisterFormValues>(emptyRegisterForm);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [issue, setIssue] = useState<AuthFormIssue | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const register = useRegister();
  const fields = useRef<Partial<Record<RegisterField, HTMLInputElement | null>>>({});

  function updateField(field: RegisterField, value: string): void {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setIssue(null);
  }

  function fieldProps(field: RegisterField) {
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
    if (register.isPending) {
      return;
    }

    const validation = validateRegisterForm(values);
    if (!validation.ok) {
      setErrors(validation.errors);
      const firstInvalid = registerFieldOrder.find((field) => validation.errors[field]);
      if (firstInvalid) {
        fields.current[firstInvalid]?.focus();
      }
      return;
    }

    setErrors({});
    setIssue(null);
    try {
      await register.mutateAsync(validation.value);
      setSucceeded(true);
    } catch (error) {
      const mapped = describeAuthError(error);
      setIssue(mapped);
      setErrors(mapped.fieldErrors);
    }
  }

  if (succeeded) {
    return (
      <AuthShell step="verify" title={authCopy.register.successTitle}>
        <div className="mt-5 space-y-5">
          <StateMessage
            role="status"
            tone="info"
            title={authCopy.register.successTitle}
            description={authCopy.register.successText}
            action={
              <Link
                href={siteRoutes.verifyEmail}
                className="inline-flex min-h-11 items-center rounded-md bg-gh-primary px-4 py-2 font-semibold text-gh-primary-text hover:bg-gh-primary-hover focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:outline-none"
              >
                {authCopy.register.successActionLabel}
              </Link>
            }
          />
          <p className="text-xs text-ink-500">{authCopy.verify.privacyNote}</p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell step="account" title={authCopy.register.heading}>
      <p className="mt-2 text-sm leading-relaxed text-ink-600">{authCopy.register.subtitle}</p>

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

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        <Input
          {...fieldProps("email")}
          label={authCopy.register.emailLabel}
          type="email"
          autoComplete="email"
          required
        />
        <Input
          {...fieldProps("password")}
          label={authCopy.register.passwordLabel}
          hint={authCopy.register.passwordHint}
          type="password"
          autoComplete="new-password"
          required
        />
        <Input
          {...fieldProps("phone")}
          label={authCopy.register.phoneLabel}
          hint={authCopy.register.phoneHint}
          type="tel"
          autoComplete="tel"
        />

        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={register.isPending}
          disabled={register.isPending}
        >
          {register.isPending ? authCopy.register.submittingLabel : authCopy.register.submitLabel}
        </Button>
      </form>

      <p className="mt-5 text-xs leading-relaxed text-ink-500">
        {authCopy.register.termsPrefix}
        <Link href={siteRoutes.terms} className="underline">
          {authCopy.register.termsLabel}
        </Link>
        {authCopy.register.termsJoin}
        <Link href={siteRoutes.privacy} className="underline">
          {authCopy.register.privacyLabel}
        </Link>
        {authCopy.register.termsSuffix}
      </p>
    </AuthShell>
  );
}
