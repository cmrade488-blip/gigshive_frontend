"use client";

import { Button, ErrorState, ForbiddenState, LoadingState } from "@gigshive/ui";
import { siteRoutes } from "@gigshive/shared/routes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { dashboardCopy } from "../copy/dashboard";
import { useSessionStatus } from "../state/use-session-status";
import { DashboardRoleProvider, useDashboardRole } from "../state/dashboard-role";
import { LogoutButton } from "./LogoutButton";

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:outline-none";

const defaultNavIcon = "M3 10.5 12 3l9 7.5M5 9.5V20h14V9.5M10 20v-6h4v6";
const navIcons: Record<string, string | undefined> = {
  dashboard: defaultNavIcon,
  myJobs: "M3 7h18v13H3zM9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18",
  proposals: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20c0-3.3 2.9-5 6.5-5s6.5 1.7 6.5 5",
  findWork: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-3.5-3.5",
  contracts: "M6 3h8l5 5v12H6zM14 3v5h5M8.5 13h7M8.5 17h5",
  wallet:
    "M3 7a2 2 0 0 1 2-2h11v2M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2M3 7h16a2 2 0 0 1 2 2v3M21 12v4h-4a2 2 0 0 1 0-4z",
  profile: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20c0-4 3.6-6 8-6s8 2 8 6",
};

function isActive(itemHref: string, pathname: string): boolean {
  return itemHref === pathname || pathname.startsWith(`${itemHref}/`);
}

/**
 * FE-019 app shell. The marketplace console is driven by the profile types on
 * /me; the API still decides whether any action offered by the screen succeeds.
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  const sessionQuery = useSessionStatus();
  const session = sessionQuery.data ?? null;
  const skipLink = (
    <a
      href="#dashboard-content"
      className={`sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-honey-500 focus:px-4 focus:py-2 focus:font-semibold focus:text-ink-900 ${focusRing}`}
    >
      {dashboardCopy.shell.skipToContent}
    </a>
  );

  let body: ReactNode;
  if (sessionQuery.isPending) {
    body = (
      <div className="min-h-screen bg-ink-50 px-4 py-12">
        {skipLink}
        <main id="dashboard-content" className="mx-auto max-w-xl">
          <LoadingState label={dashboardCopy.states.loading} />
        </main>
      </div>
    );
  } else if (sessionQuery.isError) {
    body = (
      <div className="min-h-screen bg-ink-50 px-4 py-12">
        {skipLink}
        <main id="dashboard-content" className="mx-auto max-w-xl">
          <ErrorState
            variant="page"
            title={dashboardCopy.states.errorTitle}
            description={dashboardCopy.states.errorText}
            action={
              <Button type="button" variant="outline" onClick={() => void sessionQuery.refetch()}>
                {dashboardCopy.states.retryLabel}
              </Button>
            }
          />
        </main>
      </div>
    );
  } else if (!session) {
    body = (
      <div className="min-h-screen bg-ink-50 px-4 py-12">
        {skipLink}
        <main id="dashboard-content" className="mx-auto max-w-xl">
          <LoadingState label={dashboardCopy.states.loading} />
        </main>
      </div>
    );
  } else if (session.account_type === "STAFF") {
    body = (
      <div className="min-h-screen bg-ink-50 px-4 py-12">
        {skipLink}
        <main id="dashboard-content" className="mx-auto max-w-xl">
          <ForbiddenState
            variant="page"
            title={dashboardCopy.states.forbiddenTitle}
            description={dashboardCopy.states.forbiddenText}
          />
        </main>
      </div>
    );
  } else {
    body = (
      <DashboardRoleProvider session={session}>
        <DashboardLayout>{children}</DashboardLayout>
      </DashboardRoleProvider>
    );
  }

  return body;
}

function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { session, role, roles, setRole } = useDashboardRole();
  const topbar = dashboardCopy.topbar[role];
  const items = dashboardCopy.nav[role];
  const primary = items.find((item) => item.id === "myJobs" || item.id === "findWork");

  return (
    <div className="min-h-screen bg-ink-900 lg:flex">
      <a
        href="#dashboard-content"
        className={`sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-honey-500 focus:px-4 focus:py-2 focus:font-semibold focus:text-ink-900 ${focusRing}`}
      >
        {dashboardCopy.shell.skipToContent}
      </a>

      <aside className="relative shrink-0 overflow-hidden bg-ink-900 px-4 py-5 text-white lg:w-[264px] lg:px-4 lg:py-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "url(/brand/images/patterns/hex-pattern.svg)" }}
        />
        <div className="relative">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2 px-2">
            <Link href={siteRoutes.home} aria-label={dashboardCopy.shell.homeLabel}>
              <img
                src="/brand/logo/gigshive-logo-reversed.svg"
                alt={dashboardCopy.shell.brand}
                className="h-8 w-auto"
              />
            </Link>
          </div>

          <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.07] p-3">
            <p className="px-1 text-[11px] font-semibold tracking-wide text-ink-300 uppercase">
              {dashboardCopy.shell.actingAs}
            </p>
            <div
              role="group"
              aria-label={dashboardCopy.shell.roleSwitcherLabel}
              className="mt-2 flex flex-wrap gap-2"
            >
              {roles.map((availableRole) => {
                const current = availableRole === role;
                return (
                  <button
                    key={availableRole}
                    type="button"
                    aria-pressed={current}
                    onClick={() => setRole(availableRole)}
                    className={`min-h-11 rounded-full px-4 text-sm font-semibold ${focusRing} ${
                      current
                        ? "bg-honey-500 text-ink-900"
                        : "bg-white/10 text-ink-100 hover:bg-white/20"
                    }`}
                  >
                    {dashboardCopy.shell.roles[availableRole]}
                  </button>
                );
              })}
            </div>
            {session ? (
              <p className="mt-3 px-1 text-sm font-semibold text-honey-300">
                {dashboardCopy.shell.roleLabels[role]}
              </p>
            ) : null}
          </div>

          <nav
            aria-label={dashboardCopy.shell.appNavLabel}
            className="flex flex-wrap gap-1 lg:flex-col"
          >
            {items.map((item) => {
              const current = isActive(item.href, pathname);
              const iconPath = navIcons[item.id] ?? defaultNavIcon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition-colors ${focusRing} ${
                    current ? "bg-honey-500 text-ink-900" : "text-ink-100 hover:bg-white/10"
                  }`}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d={iconPath} />
                  </svg>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <main
        id="dashboard-content"
        className="min-w-0 flex-1 rounded-t-[32px] bg-ink-50 px-4 py-6 sm:px-6 lg:rounded-l-[40px] lg:rounded-tr-none lg:px-10 lg:py-8"
      >
        <div className="mx-auto max-w-[1200px]">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
                {topbar.title}
              </h1>
              <p className="mt-1 text-sm text-ink-600 sm:text-base">{topbar.subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {primary ? (
                <Link
                  href={primary.href}
                  className={`min-h-11 rounded-full border border-gh-border bg-gh-surface px-4 py-2 text-sm font-semibold text-ink-900 ${focusRing}`}
                >
                  {primary.label}
                </Link>
              ) : null}
              <Link
                href={siteRoutes.settingsAccount}
                className={`min-h-11 rounded-full border border-gh-border bg-gh-surface px-4 py-2 text-sm font-semibold text-ink-900 ${focusRing}`}
              >
                {dashboardCopy.shell.accountLabel}
              </Link>
              <LogoutButton />
            </div>
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
