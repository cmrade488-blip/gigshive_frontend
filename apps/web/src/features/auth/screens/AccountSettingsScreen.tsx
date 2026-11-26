"use client";

import { siteRoutes } from "@gigshive/shared/routes";
import { Badge, Card, StateMessage } from "@gigshive/ui";
import Link from "next/link";
import type { ReactNode } from "react";

import { ChangePasswordForm } from "../components/ChangePasswordForm";
import { PhoneVerificationForm } from "../components/PhoneVerificationForm";
import { authCopy } from "../copy/auth";
import { useSessionStatus } from "../state/use-session-status";

const focusRing =
  "rounded font-semibold text-gh-primary underline focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:outline-none";

const profileStatusCopy = authCopy.settings.profileStatus as Readonly<Record<string, string>>;
const profileStatusTone = {
  PENDING: "info",
  SUBMITTED: "warning",
  ACTIVE: "success",
  REJECTED: "danger",
  SUSPENDED: "danger",
} as const;

function Frame({ children }: { children: ReactNode }) {
  return (
    <main id="main-content" className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 sm:py-10">
      {children}
    </main>
  );
}

/** FE-016 settings route. FE-017 still owns full bootstrap and route guards. */
export function AccountSettingsScreen() {
  const sessionQuery = useSessionStatus();

  if (sessionQuery.isPending) {
    return (
      <Frame>
        <p role="status" aria-live="polite" className="text-ink-600">
          {authCopy.settings.loading}
        </p>
      </Frame>
    );
  }

  const session = sessionQuery.data;

  if (!session) {
    return (
      <Frame>
        <StateMessage
          role="alert"
          tone="warning"
          title={authCopy.settings.signedOutTitle}
          description={authCopy.settings.signedOutText}
          action={
            <Link href={siteRoutes.login} className={focusRing}>
              {authCopy.settings.signInLabel}
            </Link>
          }
        />
      </Frame>
    );
  }

  if (session.status !== "ACTIVE") {
    return (
      <Frame>
        <StateMessage
          role="alert"
          tone="warning"
          title={authCopy.settings.unavailableTitle}
          description={authCopy.settings.unavailableText}
        />
      </Frame>
    );
  }

  return (
    <Frame>
      <h1 className="font-poppins text-2xl font-bold text-ink-900 sm:text-3xl">
        {authCopy.settings.heading}
      </h1>
      <p className="mt-2 text-sm text-ink-600 sm:text-base">{authCopy.settings.subtitle}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-bold text-ink-900">{authCopy.settings.detailsTitle}</h2>

            <div className="mt-4 space-y-4 divide-y divide-gh-border">
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 first:pt-0">
                <div>
                  <p className="text-sm text-ink-600">{authCopy.settings.emailLabel}</p>
                  <p className="font-semibold text-ink-900">{session.email}</p>
                </div>
                <Badge variant={session.email_verified_at ? "success" : "warning"}>
                  {session.email_verified_at
                    ? authCopy.settings.verified
                    : authCopy.settings.notVerified}
                </Badge>
              </div>

              <div className="pt-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-ink-600">{authCopy.settings.phoneLabel}</p>
                    <p className="font-semibold text-ink-900">
                      {session.phone ?? authCopy.settings.noPhone}
                    </p>
                  </div>
                  <Badge variant={session.phone_verified_at ? "success" : "warning"}>
                    {session.phone_verified_at
                      ? authCopy.settings.verified
                      : authCopy.settings.notVerified}
                  </Badge>
                </div>
                <PhoneVerificationForm
                  phone={session.phone ?? null}
                  verified={Boolean(session.phone_verified_at)}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
                <div>
                  <p className="text-sm text-ink-600">{authCopy.settings.passwordLabel}</p>
                  <p className="font-semibold text-ink-900">{authCopy.settings.passwordMask}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <ChangePasswordForm />
          </Card>
        </div>

        <aside className="space-y-6" aria-label={authCopy.settings.profilesTitle}>
          <Card>
            <h2 className="text-lg font-bold text-ink-900">{authCopy.settings.profilesTitle}</h2>
            {session.profiles.length === 0 ? (
              <p className="mt-3 text-sm text-ink-600">{authCopy.settings.profilesEmpty}</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {session.profiles.map((profile) => (
                  <li key={profile.id} className="flex items-center justify-between gap-3">
                    <span className="font-medium text-ink-900">{profile.display_name}</span>
                    <Badge variant={profileStatusTone[profile.status] ?? "neutral"}>
                      {profileStatusCopy[profile.status] ?? authCopy.settings.unknownStatus}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="bg-gh-warning-bg">
            <p className="font-semibold text-ink-900">{authCopy.settings.securityTitle}</p>
            <p className="mt-1 text-sm text-ink-700">{authCopy.settings.securityText}</p>
          </Card>
        </aside>
      </div>
    </Frame>
  );
}
