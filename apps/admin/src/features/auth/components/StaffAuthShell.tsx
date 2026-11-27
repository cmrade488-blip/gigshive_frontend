import type { ReactNode } from "react";

import { staffAuthCopy } from "../copy/staff-auth";

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:outline-none";

/** Public two-step staff sign-in page, following the AdminLogin design. */
export function StaffAuthShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-900 font-sans text-ink-900">
      <a
        href="#staff-auth-content"
        className={`sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-honey-500 focus:px-4 focus:py-2 focus:font-semibold ${focusRing}`}
      >
        {staffAuthCopy.shell.skipToContent}
      </a>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[url('/brand/images/patterns/hex-pattern.svg')] bg-[length:104px_120px] opacity-[0.07]"
      />
      <main
        id="staff-auth-content"
        className="relative mx-auto flex min-h-screen max-w-[480px] flex-col justify-center px-6 py-12"
      >
        <div className="mb-6 flex items-center justify-center gap-3">
          <img
            src="/brand/logo/gigshive-logo-reversed.svg"
            alt={staffAuthCopy.shell.brand}
            className="h-9 w-auto"
          />
          <span className="rounded-full bg-gh-info px-3 py-1 text-xs font-bold tracking-wide text-white">
            {staffAuthCopy.shell.adminBadge}
          </span>
        </div>
        <section className="flex min-h-[440px] flex-col rounded-[28px] bg-white p-8 shadow-[0_30px_80px_rgba(0,0,0,0.4)] sm:p-10">
          <h1 className="m-0 font-display text-[28px] font-bold tracking-tight">{title}</h1>
          {children}
        </section>
        <p className="mt-4 text-center text-[13px] text-ink-300">{staffAuthCopy.shell.footnote}</p>
      </main>
    </div>
  );
}
