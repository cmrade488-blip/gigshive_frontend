"use client";

import { LogoutButton, useSessionStatus } from "@/features/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { isActiveConsoleNavItem, visibleConsoleNav } from "../api/console-nav";
import { consoleCopy } from "../copy/console";

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:outline-none";

/** Permission-aware console layout: dark sidebar, topbar and content well. */
export function ConsoleShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSessionStatus();
  const items = visibleConsoleNav(session);
  const active = items.find((item) => isActiveConsoleNavItem(item, pathname));

  return (
    <div className="min-h-screen bg-ink-900 font-sans text-ink-900 lg:flex">
      <a
        href="#console-content"
        className={`sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-honey-500 focus:px-4 focus:py-2 focus:font-semibold ${focusRing}`}
      >
        {consoleCopy.skipToContent}
      </a>

      <aside className="shrink-0 bg-ink-900 px-4 py-6 text-white lg:w-[264px] lg:px-4">
        <div className="mb-6 flex items-center justify-between gap-2 px-2">
          <img
            src="/brand/logo/gigshive-logo-reversed.svg"
            alt={consoleCopy.brand}
            className="h-8 w-auto"
          />
          <span className="rounded-full bg-gh-info px-2.5 py-1 text-[11px] font-bold tracking-wide text-white">
            {consoleCopy.adminBadge}
          </span>
        </div>
        <nav aria-label="Admin" className="flex flex-row flex-wrap gap-1 lg:flex-col">
          {items.map((item) => {
            const current = isActiveConsoleNavItem(item, pathname);
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={`flex items-center rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors lg:text-[15px] ${
                  current ? "bg-honey-500 text-ink-900" : "text-ink-100 hover:bg-white/10"
                } ${focusRing}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <p className="mt-8 hidden rounded-2xl bg-white/10 px-4 py-3 text-[13px] text-ink-100 lg:block">
          {consoleCopy.auditNote}
        </p>
      </aside>

      <main
        id="console-content"
        className="min-w-0 flex-1 rounded-t-[32px] bg-ink-50 px-5 py-7 sm:px-8 lg:rounded-l-[40px] lg:rounded-tr-none lg:px-10 lg:py-8"
      >
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="m-0 font-display text-2xl font-bold text-ink-900">
              {active?.label ?? consoleCopy.nav.overview}
            </h1>
            <p className="mt-1 text-sm text-ink-600">{consoleCopy.overview.subtitle}</p>
          </div>
          <LogoutButton />
        </div>
        {children}
      </main>
    </div>
  );
}
