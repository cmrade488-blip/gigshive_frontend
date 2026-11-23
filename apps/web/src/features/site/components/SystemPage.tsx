import Image from "next/image";
import type { ReactNode } from "react";

import { siteCopy } from "../copy/site";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export interface SystemPageProps {
  code: string;
  title: string;
  description: ReactNode;
  image: string;
  /** Action links or buttons, rendered in a wrapping row. */
  children?: ReactNode;
  /** Short support reference, rendered in a pill below the actions (5xx only). */
  reference?: ReactNode;
  /**
   * global-error.tsx replaces the root layout, so it cannot rely on the site
   * chrome or its navigation context. Omit the header and footer there.
   */
  standalone?: boolean;
}

export const systemPrimaryClass =
  "inline-flex min-h-[52px] flex-1 items-center justify-center rounded-full bg-honey-500 px-7 font-semibold text-ink-900 hover:bg-honey-400 focus-visible:ring-2 focus-visible:ring-honey-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 focus-visible:outline-none";

export const systemSecondaryClass =
  "inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/40 px-[26px] font-semibold text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-honey-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 focus-visible:outline-none";

/** Shared full-page system screen: dark band, header, message, actions and footer. */
export function SystemPage({
  code,
  title,
  description,
  image,
  children,
  reference,
  standalone = false,
}: SystemPageProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-900 pb-[72px] font-sans text-ink-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-honey-500 focus:px-4 focus:py-2 focus:font-semibold focus:text-ink-900"
      >
        {siteCopy.skipToContent}
      </a>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[url('/brand/images/patterns/hex-pattern.svg')] bg-[length:104px_120px] opacity-[0.07]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[200px] -right-[160px] h-[760px] w-[760px] bg-[radial-gradient(circle,rgba(245,160,0,0.4),rgba(245,160,0,0)_66%)]"
      />
      <div className="relative">
        {standalone ? null : <SiteHeader />}
        <main
          id="main-content"
          className="mx-auto mt-16 flex max-w-[880px] flex-wrap items-center justify-center gap-10 px-6 text-left"
        >
          <div className="flex-[1_1_380px] text-white">
            <p className="bg-gradient-to-br from-honey-300 to-honey-500 bg-clip-text font-display text-[90px] leading-none font-bold tracking-[-4px] text-transparent sm:text-[112px]">
              {code}
            </p>
            <h1 className="mt-3 font-display text-[32px] leading-[1.15] font-bold tracking-[-1px] sm:text-[40px]">
              {title}
            </h1>
            <p className="mt-3.5 text-[18px] text-ink-300">{description}</p>
            {children ? <div className="mt-7 flex flex-wrap gap-3">{children}</div> : null}
            {reference ? (
              <p className="mt-5 inline-block rounded-full border border-white/15 bg-white/[0.08] px-[18px] py-2 text-sm text-ink-200">
                {reference}
              </p>
            ) : null}
          </div>
          <div className="flex flex-[1_1_300px] justify-center">
            <Image
              src={image}
              alt=""
              width={340}
              height={340}
              unoptimized
              className="h-auto w-full max-w-[340px]"
            />
          </div>
        </main>
        {standalone ? null : (
          <div className="mt-14">
            <SiteFooter />
          </div>
        )}
      </div>
    </div>
  );
}
