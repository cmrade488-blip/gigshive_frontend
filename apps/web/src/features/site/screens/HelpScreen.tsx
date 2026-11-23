import Link from "next/link";

import { FaqList } from "../components/FaqList";
import { SitePage } from "../components/SitePage";
import { helpCopy as copy } from "../copy/help";
import { siteRoutes } from "../routes";

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:ring-offset-2 focus-visible:outline-none";

export function HelpScreen() {
  return (
    <SitePage
      title={copy.heroTitle}
      subtitle={copy.heroSubtitle}
      content={
        <>
          <section className="px-6 pt-24 pb-16 sm:px-10">
            <div className="mx-auto max-w-[1200px]">
              <FaqList
                faqs={copy.faqs}
                categories={copy.categories}
                searchLabel={copy.searchLabel}
                searchPlaceholder={copy.searchPlaceholder}
                searchButton={copy.searchButton}
                categoryLabel={copy.categoryLabel}
                allCategoriesLabel={copy.allCategoriesLabel}
                emptyLabel={copy.emptyLabel}
              />
            </div>
          </section>

          <section className="px-6 pb-24 sm:px-10">
            <div className="mx-auto grid max-w-[1200px] gap-5 md:grid-cols-2">
              <div className="rounded-[32px] bg-honey-50 p-8">
                <h2 className="mb-2 text-xl font-bold">{copy.stillStuckTitle}</h2>
                <p className="mb-5 text-base text-ink-600">{copy.stillStuckText}</p>
                <Link
                  href={siteRoutes.contact}
                  className={`inline-flex min-h-11 items-center rounded-full bg-honey-500 px-6 font-semibold text-ink-900 hover:bg-honey-400 ${focusRing}`}
                >
                  {copy.stillStuckLabel}
                </Link>
              </div>

              <div className="rounded-[32px] border border-gh-border p-8">
                <h2 className="mb-2 text-xl font-bold">{copy.safetyFeeTitle}</h2>
                <p className="mb-5 text-base text-ink-600">{copy.safetyFeeText}</p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={siteRoutes.safety}
                    className={`inline-flex min-h-11 items-center rounded-full border border-gh-border px-5 font-semibold text-ink-900 hover:bg-ink-50 ${focusRing}`}
                  >
                    {copy.safetyLabel}
                  </Link>
                  <Link
                    href={siteRoutes.fees}
                    className={`inline-flex min-h-11 items-center rounded-full border border-gh-border px-5 font-semibold text-ink-900 hover:bg-ink-50 ${focusRing}`}
                  >
                    {copy.feesLabel}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </>
      }
    />
  );
}
