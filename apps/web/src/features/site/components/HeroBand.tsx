import type { ReactNode } from "react";

import { SiteHeader } from "./SiteHeader";

export interface HeroBandProps {
  /** Small label above the page heading. */
  eyebrow?: ReactNode;
  /** Page heading. Wrap highlighted words in <span className="text-honey-400">. */
  title: ReactNode;
  subtitle?: ReactNode;
  /** Extra content under the subtitle, for example buttons or a search box. */
  children?: ReactNode;
}

export function HeroBand({ eyebrow, title, subtitle, children }: HeroBandProps) {
  return (
    <section className="relative overflow-hidden rounded-b-[56px] bg-ink-900 pb-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[url('/brand/images/patterns/hex-pattern.svg')] bg-[length:104px_120px] opacity-[0.07]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[220px] -right-[140px] h-[700px] w-[700px] bg-[radial-gradient(circle,rgba(245,160,0,0.4),rgba(245,160,0,0)_66%)]"
      />
      <div className="relative">
        <SiteHeader />
        <div className="mx-auto max-w-[820px] px-6 pt-14 text-center sm:px-10 sm:pt-[72px]">
          {eyebrow ? (
            <p className="mb-4 text-sm font-semibold tracking-[0.14em] text-honey-400 uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="font-display text-4xl leading-[1.08] font-bold tracking-[-1.5px] text-white sm:text-[56px]">
            {title}
          </h1>
          {subtitle ? <p className="mt-5 text-[19px] text-ink-300">{subtitle}</p> : null}
          {children}
        </div>
      </div>
    </section>
  );
}
