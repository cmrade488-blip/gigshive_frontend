import Image from "next/image";
import Link from "next/link";

import { homeCopy as copy } from "../copy/home";
import { siteRoutes } from "../routes";

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:ring-offset-2 focus-visible:outline-none";

/** Closing sign-up band on the home page. */
export function HomeCta() {
  return (
    <section aria-labelledby="home-cta-title" className="px-5 pb-16 sm:px-10 sm:pb-24">
      <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[32px] bg-ink-900 p-8 sm:rounded-[48px] sm:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[url('/brand/images/patterns/hex-pattern.svg')] bg-[length:104px_120px] opacity-[0.07]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-[140px] -right-[100px] h-[520px] w-[520px] bg-[radial-gradient(circle,rgba(245,160,0,0.4),rgba(245,160,0,0)_66%)]"
        />
        <div className="relative flex flex-wrap items-center justify-between gap-8">
          <div className="min-w-0 flex-1 basis-[300px]">
            <h2
              id="home-cta-title"
              className="mb-3 font-display text-[28px] leading-[1.15] font-bold tracking-[-0.5px] text-white sm:text-[40px]"
            >
              {copy.ctaTitle}
            </h2>
            <p className="mb-7 text-base text-ink-300 sm:text-[18px]">{copy.ctaText}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={siteRoutes.register}
                className={`inline-flex min-h-12 items-center rounded-full bg-honey-500 px-8 font-semibold text-ink-900 hover:bg-honey-400 ${focusRing}`}
              >
                {copy.ctaPrimaryLabel}
              </Link>
              <Link
                href={siteRoutes.jobs}
                className={`inline-flex min-h-12 items-center rounded-full border border-white/20 bg-white/10 px-8 font-semibold text-white hover:bg-white/20 ${focusRing}`}
              >
                {copy.ctaSecondaryLabel}
              </Link>
            </div>
          </div>
          <Image
            src="/brand/images/steps/get-paid.svg"
            width={360}
            height={240}
            alt={copy.ctaImageAlt}
            className="mx-auto h-auto w-[300px] max-w-full"
          />
        </div>
      </div>
    </section>
  );
}
