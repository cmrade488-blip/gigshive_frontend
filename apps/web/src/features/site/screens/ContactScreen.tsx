import Link from "next/link";

import { isContactSubmissionAvailable } from "../api/contact";
import { ContactForm } from "../components/ContactForm";
import { SitePage } from "../components/SitePage";
import { contactCopy as copy } from "../copy/contact";
import { siteRoutes } from "../routes";

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:ring-offset-2 focus-visible:outline-none";

export function ContactScreen() {
  return (
    <SitePage
      title={copy.heroTitle}
      subtitle={copy.heroSubtitle}
      content={
        <section className="px-6 pt-24 pb-24 sm:px-10">
          <div className="mx-auto grid max-w-[1200px] items-start gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <ContactForm />

            <aside className="flex flex-col gap-5">
              {isContactSubmissionAvailable() ? (
                <div className="rounded-[32px] bg-ink-50 p-8">
                  <h2 className="mb-2 text-xl font-bold">{copy.emailHeading}</h2>
                  <p className="text-base text-ink-700">{copy.emailAddress}</p>
                </div>
              ) : null}

              <div className="rounded-[32px] border border-gh-border p-8">
                <h2 className="mb-2 text-xl font-bold">{copy.beforeHeading}</h2>
                <p className="text-base text-ink-600">
                  {copy.beforeText}{" "}
                  <Link
                    href={siteRoutes.help}
                    className={`font-semibold text-honey-700 hover:underline ${focusRing}`}
                  >
                    {copy.beforeLinkLabel}
                  </Link>
                  {copy.beforeTextTail}
                </p>
              </div>

              <div className="rounded-[32px] bg-honey-50 p-8">
                <p className="text-base font-semibold text-ink-900">{copy.safetyNote}</p>
              </div>
            </aside>
          </div>
        </section>
      }
    />
  );
}
