import { FeeExampleCard } from "../components/FeeExampleCard";
import { InfoCta } from "../components/InfoCta";
import { SitePage } from "../components/SitePage";
import { feesCopy as copy } from "../copy/fees";
import { siteRoutes } from "../routes";

export function FeesScreen() {
  return (
    <SitePage
      eyebrow={copy.eyebrow}
      title={copy.heroTitle}
      subtitle={copy.heroSubtitle}
      content={
        <>
          <section className="px-6 pt-24 pb-10 sm:px-10">
            <div className="mx-auto grid max-w-[1200px] items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <FeeExampleCard />
              <div className="flex flex-col gap-5">
                <div className="rounded-[32px] bg-ink-50 p-8">
                  <h2 className="mb-2 text-xl font-bold">{copy.postingHeading}</h2>
                  <p className="text-base text-ink-600">{copy.postingText}</p>
                </div>
                <div className="rounded-[32px] bg-honey-50 p-8">
                  <h2 className="mb-2 text-xl font-bold">{copy.payoutHeading}</h2>
                  <p className="text-base text-ink-600">{copy.payoutText}</p>
                </div>
                <div className="rounded-[32px] border border-gh-border p-8">
                  <h2 className="mb-3 text-xl font-bold">{copy.goodToKnowHeading}</h2>
                  <ul className="flex list-none flex-col gap-2.5 p-0">
                    {copy.goodToKnow.map((item) => (
                      <li key={item} className="flex gap-2.5 text-base text-ink-600">
                        <span aria-hidden="true" className="font-bold text-honey-700">
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <InfoCta
            title={copy.ctaTitle}
            text={copy.ctaText}
            label={copy.ctaLabel}
            href={siteRoutes.help}
          />
        </>
      }
    />
  );
}
