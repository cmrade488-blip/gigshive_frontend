"use client";

import { Button, Input, LoadingState, StateMessage } from "@gigshive/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";

import { loginStaff, verifyStaffOtp } from "../api/auth";
import { describeStaffAuthError, type StaffAuthFormIssue } from "../api/error-copy";
import { StaffAuthShell } from "../components/StaffAuthShell";
import { staffAuthCopy } from "../copy/staff-auth";
import { resolveConsoleReturnPath } from "../schemas/return-path";
import {
  normaliseStaffOtp,
  validateStaffOtpStep,
  validateStaffPasswordStep,
  type StaffLoginFormErrors,
} from "../schemas/staff-login";
import { useStaffLogin } from "../state/staff-login";
import { consoleSessionQueryKey } from "../state/use-session-status";

export interface StaffLoginScreenProps {
  step: "password" | "otp";
}

function copyValidationErrors(errors: StaffLoginFormErrors): StaffLoginFormErrors {
  return {
    ...(errors.email ? { email: staffAuthCopy.errors.email } : {}),
    ...(errors.password ? { password: staffAuthCopy.errors.password } : {}),
    ...(errors.otp ? { otp: staffAuthCopy.errors.code } : {}),
  };
}

/** Two-step staff sign-in: password, then the mandatory OTP (BR-05, BR-41). */
export function StaffLoginScreen({ step }: StaffLoginScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const returnPath = resolveConsoleReturnPath(searchParams.get("next"));
  const { pendingEmail, beginLogin, clearPendingLogin } = useStaffLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<StaffLoginFormErrors>({});
  const [issue, setIssue] = useState<StaffAuthFormIssue | null>(null);
  const [pending, setPending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

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

  useEffect(() => {
    if (step === "otp" && !pendingEmail) {
      router.replace("/login");
    }
  }, [pendingEmail, router, step]);

  function resetIssue(): void {
    setIssue(null);
    setErrors({});
    setCooldown(0);
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (pending || cooldown > 0) {
      return;
    }

    const validation = validateStaffPasswordStep({ email, password });
    if (!validation.ok) {
      setErrors(copyValidationErrors(validation.errors));
      return;
    }

    resetIssue();
    setPending(true);
    try {
      const result = await loginStaff(validation.value);
      if (!result.otpRequired) {
        throw new Error("Unexpected staff login response.");
      }
      beginLogin(validation.value.email);
      setPassword("");
      router.push("/login/otp");
    } catch (error) {
      const mapped = describeStaffAuthError(error);
      setIssue(mapped);
      setErrors(mapped.fieldErrors);
    } finally {
      setPending(false);
    }
  }

  async function handleOtpSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (pending || cooldown > 0 || !pendingEmail) {
      return;
    }

    const validation = validateStaffOtpStep({ otp });
    if (!validation.ok) {
      setErrors(copyValidationErrors(validation.errors));
      return;
    }

    resetIssue();
    setPending(true);
    try {
      const session = await verifyStaffOtp(validation.value);
      queryClient.setQueryData(consoleSessionQueryKey, session);
      clearPendingLogin();
      setOtp("");
      router.replace(returnPath);
    } catch (error) {
      const mapped = describeStaffAuthError(error);
      setIssue(mapped);
      setErrors(mapped.fieldErrors);
    } finally {
      setPending(false);
    }
  }

  const visibleIssue = issue
    ? {
        ...issue.copy,
        ...(issue.kind === "auth" && step === "password"
          ? {
              title: staffAuthCopy.errors.invalidCredentialsTitle,
              description: staffAuthCopy.errors.invalidCredentialsDescription,
            }
          : {}),
        ...(issue.kind === "auth" && step === "otp"
          ? {
              title: staffAuthCopy.errors.codeInvalidTitle,
              description: staffAuthCopy.errors.codeInvalidDescription,
            }
          : {}),
        ...(issue.kind === "forbidden"
          ? {
              title: staffAuthCopy.errors.forbiddenTitle,
              description: staffAuthCopy.errors.forbiddenDescription,
            }
          : {}),
        ...(issue.kind === "rateLimit" && cooldown > 0
          ? { description: issue.copy.description }
          : {}),
      }
    : null;

  if (step === "otp" && !pendingEmail) {
    return <LoadingState label={staffAuthCopy.session.checkingLabel} />;
  }

  return (
    <StaffAuthShell
      title={
        step === "password" ? staffAuthCopy.passwordStep.heading : staffAuthCopy.otpStep.heading
      }
    >
      <p className="mt-1.5 text-sm text-ink-600">
        {step === "password" ? staffAuthCopy.passwordStep.subtitle : staffAuthCopy.otpStep.subtitle}
      </p>

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

      {step === "password" ? (
        <form
          onSubmit={handlePasswordSubmit}
          noValidate
          className="mt-6 flex flex-1 flex-col gap-4"
        >
          <Input
            label={staffAuthCopy.passwordStep.emailLabel}
            type="email"
            autoComplete="email"
            required
            value={email}
            error={errors.email}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setEmail(event.target.value);
              resetIssue();
            }}
          />
          <Input
            label={staffAuthCopy.passwordStep.passwordLabel}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            error={errors.password}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setPassword(event.target.value);
              resetIssue();
            }}
          />
          <Button
            type="submit"
            size="lg"
            className="mt-auto w-full"
            loading={pending}
            disabled={pending || cooldown > 0}
          >
            {pending
              ? staffAuthCopy.passwordStep.submittingLabel
              : staffAuthCopy.passwordStep.submitLabel}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit} noValidate className="mt-6 flex flex-1 flex-col gap-4">
          <Input
            label={staffAuthCopy.otpStep.codeLabel}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            value={otp}
            error={errors.otp}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setOtp(normaliseStaffOtp(event.target.value));
              resetIssue();
            }}
          />
          <div className="mt-auto flex gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => {
                clearPendingLogin();
                setOtp("");
                resetIssue();
                router.push("/login");
              }}
            >
              {staffAuthCopy.otpStep.backLabel}
            </Button>
            <Button
              type="submit"
              size="lg"
              className="flex-1"
              loading={pending}
              disabled={pending || cooldown > 0}
            >
              {pending ? staffAuthCopy.otpStep.submittingLabel : staffAuthCopy.otpStep.submitLabel}
            </Button>
          </div>
        </form>
      )}
    </StaffAuthShell>
  );
}
