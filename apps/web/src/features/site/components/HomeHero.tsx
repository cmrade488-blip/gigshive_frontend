import Image from "next/image";
import Link from "next/link";

import { homeCopy as copy } from "../copy/home";
import { siteRoutes } from "../routes";
import { SiteHeader } from "./SiteHeader";

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:ring-offset-2 focus-visible:outline-none";

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="flex-none text-honey-400"
    >
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

/** Home-only hero: left-aligned copy, search form and collage on a dark band. */
export function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-b-[32px] bg-ink-900 pb-10 sm:rounded-b-[56px] sm:pb-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[url('/brand/images/patterns/hex-pattern.svg')] bg-[length:104px_120px] opacity-[0.07]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 h-[420px] w-[420px] bg-[radial-gradient(circle,rgba(245,160,0,0.42),rgba(245,160,0,0)_66%)] sm:-top-[200px] sm:-right-[160px] sm:h-[760px] sm:w-[760px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[260px] -left-[200px] h-[600px] w-[600px] bg-[radial-gradient(circle,rgba(37,99,235,0.25),rgba(37,99,235,0)_66%)]"
      />
      <div className="relative">
        <SiteHeader />
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-10 px-5 pt-9 sm:px-10 sm:pt-[72px]">
          <div className="min-w-0 flex-1 basis-[300px]">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-honey-200 sm:text-[13px]">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-honey-400" />
              {copy.heroEyebrow}
            </p>
            <h1 className="mt-6 font-display text-[36px] leading-[1.08] font-bold tracking-[-1px] text-white sm:text-[62px] sm:tracking-[-1.5px]">
              {copy.heroTitleBefore}
              <br />
              <span className="text-honey-400">{copy.heroTitleAccent}</span>
            </h1>
            <p className="mt-4 max-w-[520px] text-base text-ink-300 sm:mt-5 sm:text-[19px]">
              {copy.heroSubtitle}
            </p>
            <form
              action={siteRoutes.jobs}
              method="get"
              role="search"
              className="mt-7 flex flex-col gap-2.5 sm:max-w-[600px] sm:flex-row sm:items-center sm:gap-2 sm:rounded-full sm:bg-white sm:py-2 sm:pr-2 sm:pl-7 sm:shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
            >
              <label htmlFor="home-search" className="sr-only">
                {copy.searchLabel}
              </label>
              <input
                id="home-search"
                name="q"
                type="search"
                placeholder={copy.searchPlaceholder}
                className={`min-h-12 w-full rounded-full bg-white px-6 text-base text-ink-900 sm:min-h-0 sm:flex-1 sm:bg-transparent sm:px-0 ${focusRing}`}
              />
              <button
                type="submit"
                className={`inline-flex min-h-12 items-center justify-center rounded-full bg-honey-500 px-8 font-semibold text-ink-900 hover:bg-honey-400 sm:min-h-11 ${focusRing}`}
              >
                {copy.searchButton}
              </button>
            </form>
            <Link
              href={siteRoutes.register}
              className={`mt-2.5 inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 font-semibold text-white sm:hidden ${focusRing}`}
            >
              {copy.mobilePostJobLabel}
            </Link>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-200 sm:mt-7">
              {copy.heroTrust.map((item) => (
                <li key={item} className="inline-flex items-center gap-2">
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-1 basis-[280px] justify-center">
            <Image
              src="/brand/images/illustrations/hero-collage.svg"
              width={640}
              height={560}
              alt={copy.heroImageAlt}
              priority
              className="h-auto w-full max-w-[580px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
