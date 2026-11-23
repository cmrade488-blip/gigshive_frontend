import { InfoCta } from "../components/InfoCta";
import { SitePage } from "../components/SitePage";
import { aboutCopy as copy } from "../copy/about";
import { siteRoutes } from "../routes";

export function AboutScreen() {
  return (
    <SitePage
      title={copy.heroTitle}
      subtitle={copy.heroSubtitle}
      content={
        <>
          <section className="px-6 pt-24 pb-10 sm:px-10">
            <div className="mx-auto max-w-[820px]">
              <h2 className="mb-5 font-display text-[36px] font-bold tracking-[-0.5px]">
                {copy.whyHeading}
              </h2>
              <p className="mb-4 text-lg text-ink-600">{copy.whyText1}</p>
              <p className="text-lg text-ink-600">{copy.whyText2}</p>
            </div>
          </section>

          <section className="px-6 py-14 sm:px-10">
            <div className="mx-auto max-w-[1200px]">
              <h2 className="mb-9 font-display text-[36px] font-bold tracking-[-0.5px]">
                {copy.beliefsHeading}
              </h2>
              <div className="grid gap-5 md:grid-cols-3">
                {copy.beliefs.map((belief) => (
                  <div
                    key={belief.title}
                    className="rounded-[32px] border border-gh-border bg-white p-8 shadow-sm"
                  >
                    <h3 className="mb-2 text-xl font-bold">{belief.title}</h3>
                    <p className="text-base text-ink-600">{belief.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <InfoCta
            title={copy.ctaTitle}
            text={copy.ctaText}
            label={copy.ctaLabel}
            href={siteRoutes.register}
          />
        </>
      }
    />
  );
}
