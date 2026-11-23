import Image from "next/image";
import Link from "next/link";

import { homeCopy as copy } from "../copy/home";
import { siteRoutes } from "../routes";

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:ring-offset-2 focus-visible:outline-none";

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-ink-900"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** Design's "Browse by category" grid. Sample links point at the reserved jobs route. */
export function CategoryGrid() {
  return (
    <section aria-labelledby="home-categories-title" className="px-5 pt-16 pb-6 sm:px-10 sm:pt-24">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3 sm:mb-9">
          <div>
            <h2
              id="home-categories-title"
              className="font-display text-[26px] font-bold tracking-[-0.5px] sm:text-[40px]"
            >
              {copy.categoriesTitle}
            </h2>
            <p className="mt-2 text-base text-ink-600">{copy.categoriesSubtitle}</p>
          </div>
          <Link
            href={siteRoutes.jobs}
            className={`border-b-2 border-honey-500 pb-0.5 font-semibold hover:text-ink-600 ${focusRing}`}
          >
            {copy.categoriesAllLabel}
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {copy.categories.map((category) => (
            <li key={category.name}>
              <Link
                href={siteRoutes.jobs}
                className={`block overflow-hidden rounded-[18px] border border-gh-border bg-white shadow-[0_4px_12px_rgba(15,22,38,0.06)] transition-transform hover:-translate-y-1 sm:rounded-[24px] ${focusRing}`}
              >
                <Image
                  src={category.image}
                  width={320}
                  height={200}
                  alt=""
                  className="h-auto w-full"
                />
                <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:px-5 sm:py-4">
                  <b className="text-sm font-semibold sm:text-base">{category.name}</b>
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-honey-100"
                  >
                    <ArrowIcon />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
