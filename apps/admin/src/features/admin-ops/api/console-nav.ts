import { canAccessConsole, type ConsoleSession } from "@/features/auth";

import { consoleCopy } from "../copy/console";

export interface ConsoleNavItem {
  id: string;
  label: string;
  href: string;
  /** Any one of these permissions is enough; an empty list means any staff member. */
  permissions: readonly string[];
}

/** Permission names come from the Data and State Design console route map. */
export const consoleNavItems: readonly ConsoleNavItem[] = [
  { id: "overview", label: consoleCopy.nav.overview, href: "/", permissions: [] },
  {
    id: "profiles",
    label: consoleCopy.nav.profiles,
    href: "/profiles",
    permissions: ["profiles.review", "profiles.suspend"],
  },
  {
    id: "verifications",
    label: consoleCopy.nav.verifications,
    href: "/verifications",
    permissions: ["verifications.review"],
  },
  { id: "jobs", label: consoleCopy.nav.jobs, href: "/jobs", permissions: ["jobs.moderate"] },
  {
    id: "contracts",
    label: consoleCopy.nav.contracts,
    href: "/contracts",
    permissions: ["finance.view"],
  },
  {
    id: "payments",
    label: consoleCopy.nav.payments,
    href: "/payments",
    permissions: ["finance.view"],
  },
  {
    id: "payouts",
    label: consoleCopy.nav.payouts,
    href: "/payouts",
    permissions: ["finance.view"],
  },
  {
    id: "categories",
    label: consoleCopy.nav.categories,
    href: "/categories",
    permissions: ["catalog.manage"],
  },
  { id: "config", label: consoleCopy.nav.config, href: "/config", permissions: ["config.manage"] },
  {
    id: "audit-logs",
    label: consoleCopy.nav.auditLogs,
    href: "/audit-logs",
    permissions: ["audit.view"],
  },
];

export function visibleConsoleNav(
  session: ConsoleSession | null | undefined,
): readonly ConsoleNavItem[] {
  if (!canAccessConsole(session)) {
    return [];
  }
  const granted = new Set(session?.permissions ?? []);
  return consoleNavItems.filter(
    (item) =>
      item.permissions.length === 0 ||
      item.permissions.some((permission) => granted.has(permission)),
  );
}

export function isActiveConsoleNavItem(item: ConsoleNavItem, pathname: string): boolean {
  return item.href === "/"
    ? pathname === "/"
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
}
