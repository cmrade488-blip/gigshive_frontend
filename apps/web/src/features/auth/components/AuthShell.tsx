import { siteRoutes } from "@gigshive/shared/routes";
import Link from "next/link";
import type { ReactNode } from "react";

import { authCopy } from "../copy/auth";
import { AuthTabs, type AuthTab } from "./AuthTabs";
import { StepIndicator, type AuthStep } from "./StepIndicator";

export interface AuthShellProps {
  /** Recovery screens have no registration steps, so the indicator is optional. */
  step?: AuthStep;
  title: string;
  children: ReactNode;
  /** Login and registration show the design's account switcher. */
  activeTab?: AuthTab;
}

/** Public auth pages: skip link, narrow header, brand panel and form card. */
export function AuthShell({ step, title, children, activeTab }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-ink-50 font-sans text-ink-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-honey-500 focus:px-4 focus:py-2 focus:font-semibold focus:text-ink-900"
      >
        {authCopy.shell.skipToContent}
      </a>

      <header className="border-b border-ink-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link
            href={siteRoutes.home}
            className="font-poppins text-xl font-bold tracking-tight text-ink-900 focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:outline-none"
          >
            {authCopy.shell.brand}
          </Link>
          <Link
            href={siteRoutes.home}
            className="rounded-full px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 hover:text-ink-900 focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:outline-none"
          >
            {authCopy.shell.homeLabel}
          </Link>
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:py-16"
      >
        <section
          aria-labelledby="auth-hero-title"
          className="relative overflow-hidden rounded-3xl bg-ink-900 px-7 py-10 text-white"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[url('/brand/images/patterns/hex-pattern.svg')] bg-[length:104px_120px] opacity-[0.07]"
          />
          <div className="relative max-w-lg">
            <p className="mb-5 inline-block rounded-full bg-honey-500 px-3 py-1 text-xs font-semibold text-ink-900">
              {authCopy.shell.brand}
            </p>
            <h2 id="auth-hero-title" className="font-poppins text-4xl leading-tight font-bold">
              {authCopy.shell.titleLead}{" "}
              <span className="bg-honey-200 text-ink-900">{authCopy.shell.titleAccent}</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink-100">{authCopy.shell.subtitle}</p>
          </div>
        </section>

        <section className="w-full rounded-2xl border border-ink-100 bg-white p-6 shadow-sm sm:p-8">
          {step ? <StepIndicator step={step} /> : null}
          {activeTab ? <AuthTabs active={activeTab} /> : null}
          <h1 className="mt-7 font-poppins text-2xl font-bold text-ink-900">{title}</h1>
          {children}
        </section>
      </main>
    </div>
  );
}
