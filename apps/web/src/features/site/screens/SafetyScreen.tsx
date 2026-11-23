import Image from "next/image";

import { InfoCta } from "../components/InfoCta";
import { SitePage } from "../components/SitePage";
import { safetyCopy as copy } from "../copy/safety";
import { siteRoutes } from "../routes";

export function SafetyScreen() {
  return (
    <SitePage
      eyebrow={copy.eyebrow}
      title={copy.heroTitle}
      subtitle={copy.heroSubtitle}
      content={
        <>
          <section className="px-6 pt-24 pb-10 sm:px-10">
            <div className="mx-auto max-w-[1200px]">
              <div className="grid gap-5 sm:grid-cols-2">
                {copy.features.map((feature) => (
                  <div
                    key={feature.title}
                    className="rounded-[32px] border border-gh-border bg-white p-8 shadow-sm"
                  >
                    <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                    <p className="text-base text-ink-600">{feature.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="px-6 py-14 sm:px-10">
            <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[48px] bg-ink-900 p-8 text-white sm:px-14 sm:py-16">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[url('/brand/images/patterns/hex-pattern.svg')] bg-[length:104px_120px] opacity-[0.07]"
              />
              <h2 className="relative mb-10 font-display text-[36px] font-bold tracking-[-0.5px]">
                {copy.paymentHeading}
              </h2>
              <ol className="relative grid list-none gap-5 p-0 sm:grid-cols-3">
                {copy.paymentSteps.map((step, index) => (
                  <li
                    key={step.title}
                    className="rounded-3xl border border-white/10 bg-white/[0.06] p-7"
                  >
                    <Image
                      src={step.image}
                      alt=""
                      width={180}
                      height={135}
                      unoptimized
                      className="mb-5 h-auto w-[180px] max-w-full"
                    />
                    <h3 className="text-sm font-bold text-honey-400">
                      {index + 1}. {step.title}
                    </h3>
                    <p className="mt-2.5 text-[15px] text-ink-200">{step.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="px-6 py-14 sm:px-10">
            <div className="mx-auto max-w-[820px]">
              <h2 className="mb-7 font-display text-[36px] font-bold tracking-[-0.5px]">
                {copy.tipsHeading}
              </h2>
              <ul className="flex list-none flex-col gap-3 p-0">
                {copy.tips.map((tip) => (
                  <li key={tip} className="flex gap-3 rounded-[20px] bg-ink-50 px-6 py-5">
                    <span aria-hidden="true" className="font-bold text-honey-700">
                      ✓
                    </span>
                    <span className="text-base text-ink-700">{tip}</span>
                  </li>
                ))}
              </ul>
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
