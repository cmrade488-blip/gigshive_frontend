import Image from "next/image";
import Link from "next/link";

import { SitePage } from "../components/SitePage";
import { howItWorksCopy as copy, type Step } from "../copy/how-it-works";
import { siteRoutes } from "../routes";

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:ring-offset-2 focus-visible:outline-none";

function StepList({ steps, badgeClass }: { steps: readonly Step[]; badgeClass: string }) {
  return (
    <ol className="m-0 flex list-none flex-col gap-6 p-0">
      {steps.map((step, index) => (
        <li key={step.title} className="flex gap-4">
          <span
            className={`flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full font-bold ${badgeClass}`}
          >
            {index + 1}
          </span>
          <div>
            <h3 className="text-lg font-bold">{step.title}</h3>
            <p className="text-base text-ink-600">{step.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function HowItWorksScreen() {
  return (
    <SitePage
      title={
        <>
          {copy.heroTitleBefore}
          <span className="text-honey-400">{copy.heroBrand}</span>
          {copy.heroTitleAfter}
        </>
      }
      subtitle={copy.heroSubtitle}
      content={
        <>
          <section className="px-6 pt-24 pb-10 sm:px-10">
            <div className="mx-auto grid max-w-[1200px] gap-8 md:grid-cols-2">
              <div className="rounded-[40px] bg-honey-50 p-8 sm:p-11">
                <span className="rounded-full bg-honey-100 px-3.5 py-1.5 text-[13px] font-semibold text-honey-800">
                  {copy.clientPill}
                </span>
                <h2 className="mt-[18px] mb-7 font-display text-[30px] tracking-[-0.5px]">
                  {copy.clientHeading}
                </h2>
                <StepList steps={copy.clientSteps} badgeClass="bg-honey-500 text-ink-900" />
                <Image
                  src="/brand/images/steps/post-a-job.svg"
                  alt=""
                  width={260}
                  height={195}
                  unoptimized
                  className="mt-7 mb-2 h-auto w-[260px] max-w-full"
                />
                <Link
                  href={siteRoutes.register}
                  className={`mt-3 inline-flex min-h-12 items-center rounded-full bg-honey-500 px-[30px] font-semibold text-ink-900 hover:bg-honey-400 ${focusRing}`}
                >
                  {copy.clientCta}
                </Link>
              </div>

              <div className="rounded-[40px] bg-ink-50 p-8 sm:p-11">
                <span className="rounded-full bg-ink-100 px-3.5 py-1.5 text-[13px] font-semibold text-ink-700">
                  {copy.workerPill}
                </span>
                <h2 className="mt-[18px] mb-7 font-display text-[30px] tracking-[-0.5px]">
                  {copy.workerHeading}
                </h2>
                <StepList steps={copy.workerSteps} badgeClass="bg-ink-900 text-honey-400" />
                <Image
                  src="/brand/images/steps/get-paid.svg"
                  alt=""
                  width={260}
                  height={195}
                  unoptimized
                  className="mt-7 mb-2 h-auto w-[260px] max-w-full"
                />
                <Link
                  href={siteRoutes.register}
                  className={`mt-3 inline-flex min-h-12 items-center rounded-full bg-ink-900 px-[30px] font-semibold text-white hover:bg-ink-700 ${focusRing}`}
                >
                  {copy.workerCta}
                </Link>
              </div>
            </div>
          </section>

          <section className="px-6 pt-10 pb-[88px] sm:px-10">
            <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[48px] bg-ink-900 p-8 text-white sm:px-14 sm:py-16">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[url('/brand/images/patterns/hex-pattern.svg')] bg-[length:104px_120px] opacity-[0.07]"
              />
              <div className="relative mb-10 flex flex-wrap items-center gap-8">
                <div className="flex-[1_1_420px]">
                  <h2 className="mb-3 font-display text-[36px] tracking-[-0.5px]">
                    {copy.protectionHeading}
                  </h2>
                  <p className="text-lg text-ink-300">{copy.protectionIntro}</p>
                </div>
                <Image
                  src="/brand/images/steps/fund.svg"
                  alt=""
                  width={220}
                  height={165}
                  unoptimized
                  className="h-auto w-[220px] max-w-full"
                />
              </div>
              <ol className="relative grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-4">
                {copy.protectionSteps.map((step, index) => (
                  <li
                    key={step.title}
                    className="rounded-3xl border border-white/10 bg-white/[0.06] p-7"
                  >
                    <h3 className="text-sm font-bold text-honey-400">
                      {index + 1}. {step.title}
                    </h3>
                    <p className="mt-2.5 text-[15px] text-ink-200">{step.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="px-6 pb-24 sm:px-10">
            <div className="mx-auto max-w-[820px]">
              <h2 className="mb-7 text-center font-display text-[36px] tracking-[-0.5px]">
                {copy.faqHeading}
              </h2>
              <div className="flex flex-col gap-3">
                {copy.faqs.map((faq) => (
                  <details key={faq.question} className="rounded-[20px] bg-ink-50 px-[26px]">
                    <summary
                      className={`cursor-pointer list-none rounded-xl py-[22px] text-lg font-semibold [&::-webkit-details-marker]:hidden ${focusRing}`}
                    >
                      {faq.question}
                    </summary>
                    <p className="pb-[22px] text-base text-ink-600">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        </>
      }
    />
  );
}
