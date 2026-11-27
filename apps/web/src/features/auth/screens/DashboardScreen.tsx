"use client";

import { formatDate } from "@gigshive/shared/date";
import { EmptyState, LoadingState, StateMessage, type StateTone } from "@gigshive/ui";
import Link from "next/link";

import { dashboardCopy } from "../copy/dashboard";
import {
  dashboardBanners,
  dashboardNextActions,
  type DashboardActionId,
  type DashboardBanner,
  type DashboardBannerKind,
  type DashboardRole,
} from "../schemas/dashboard";
import { useDashboardRole } from "../state/dashboard-role";

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:outline-none";

const bannerTones = {
  EMAIL_UNVERIFIED: "warning",
  ACCOUNT_SUSPENDED: "danger",
  ACCOUNT_DELETED: "danger",
  NO_PROFILE: "info",
  PROFILE_PENDING: "info",
  PROFILE_SUBMITTED: "info",
  PROFILE_REJECTED: "warning",
  PROFILE_SUSPENDED: "danger",
} satisfies Record<DashboardBannerKind, StateTone>;

type BannerText = {
  title: string;
  text: string;
  action?: DashboardActionId;
};

function bannerCopy(kind: DashboardBannerKind, role: DashboardRole): BannerText {
  const copy = dashboardCopy.status;
  const profileLabel = dashboardCopy.shell.roleLabels[role];

  switch (kind) {
    case "EMAIL_UNVERIFIED":
      return copy.emailUnverified;
    case "ACCOUNT_SUSPENDED":
      return copy.accountSuspended;
    case "ACCOUNT_DELETED":
      return copy.accountDeleted;
    case "NO_PROFILE":
      return copy.noProfile;
    case "PROFILE_PENDING":
      return {
        title: copy.profile.PENDING.title(profileLabel),
        text: copy.profile.PENDING.text(profileLabel),
      };
    case "PROFILE_SUBMITTED":
      return {
        title: copy.profile.SUBMITTED.title(profileLabel),
        text: copy.profile.SUBMITTED.text(profileLabel),
      };
    case "PROFILE_REJECTED":
      return {
        title: copy.profile.REJECTED.title(profileLabel),
        text: copy.profile.REJECTED.text(profileLabel),
        action: "viewProfile",
      };
    case "PROFILE_SUSPENDED":
      return {
        title: copy.profile.SUSPENDED.title(profileLabel),
        text: copy.profile.SUSPENDED.text(profileLabel),
        action: "viewProfile",
      };
  }
}

function formatUntil(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  try {
    return formatDate(value);
  } catch {
    // A malformed API value must never be rendered as a raw string.
    return null;
  }
}

function ActionLink({ action }: { action: DashboardActionId }) {
  const item = dashboardCopy.actions.items[action];
  return (
    <Link
      href={item.href}
      className={`inline-flex min-h-11 items-center rounded-full border border-gh-border bg-gh-surface px-4 py-2 text-sm font-semibold text-ink-900 ${focusRing}`}
    >
      {item.label}
    </Link>
  );
}

function StatusBanner({
  banner,
  role,
  allowActions,
}: {
  banner: DashboardBanner;
  role: DashboardRole;
  allowActions: boolean;
}) {
  const text = bannerCopy(banner.kind, role);
  const until = formatUntil(banner.until);

  return (
    <StateMessage
      tone={bannerTones[banner.kind]}
      title={text.title}
      description={
        <>
          <span>{text.text}</span>
          {banner.reason ? (
            <span className="mt-2 block text-sm">
              {dashboardCopy.status.reasonLabel}: {banner.reason}
            </span>
          ) : null}
          {until ? (
            <span className="mt-1 block text-sm">
              {dashboardCopy.status.untilLabel}: {until}
            </span>
          ) : null}
        </>
      }
      action={allowActions && text.action ? <ActionLink action={text.action} /> : undefined}
    />
  );
}

/** Role-aware dashboard content built only from the shared /me session. */
export function DashboardScreen() {
  const { session, role } = useDashboardRole();

  if (!session) {
    return <LoadingState label={dashboardCopy.states.loading} className="mt-6" />;
  }

  const banners = dashboardBanners(session, role);
  const actions = dashboardNextActions(session, role);
  const allowActions = session.status === "ACTIVE";

  return (
    <div className="mt-6 grid gap-6">
      <section aria-labelledby="dashboard-status-heading" className="space-y-3">
        <h2 id="dashboard-status-heading" className="text-lg font-semibold text-ink-900">
          {dashboardCopy.status.title}
        </h2>
        {banners.length > 0 ? (
          banners.map((banner) => (
            <StatusBanner key={banner.id} banner={banner} role={role} allowActions={allowActions} />
          ))
        ) : (
          <EmptyState
            title={dashboardCopy.actions.emptyTitle}
            description={dashboardCopy.actions.emptyText}
          />
        )}
      </section>

      <section aria-labelledby="dashboard-actions-heading">
        <h2 id="dashboard-actions-heading" className="mb-3 text-lg font-semibold text-ink-900">
          {dashboardCopy.actions.title}
        </h2>
        {actions.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {actions.map((action) => {
              const item = dashboardCopy.actions.items[action];
              return (
                <li
                  key={action}
                  className="rounded-2xl border border-gh-border bg-gh-surface p-5 shadow-sm"
                >
                  <p className="font-semibold text-ink-900">{item.label}</p>
                  <p className="mt-1 text-sm text-ink-600">{item.description}</p>
                  <div className="mt-4">
                    <ActionLink action={action} />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            title={dashboardCopy.actions.emptyTitle}
            description={dashboardCopy.actions.emptyText}
          />
        )}
      </section>
    </div>
  );
}
