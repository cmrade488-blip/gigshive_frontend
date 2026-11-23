import Link from "next/link";

import { SitePage } from "../components/SitePage";
import { legalCopy, type LegalDocument } from "../copy/legal";
import { siteRoutes } from "../routes";

export interface LegalScreenProps {
  kind: LegalDocument;
}

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:ring-offset-2 focus-visible:outline-none";

export function LegalScreen({ kind }: LegalScreenProps) {
  const doc = legalCopy.documents[kind];
  const links = [
    { key: "terms" as const, href: siteRoutes.terms, label: legalCopy.documents.terms.tabLabel },
    {
      key: "privacy" as const,
      href: siteRoutes.privacy,
      label: legalCopy.documents.privacy.tabLabel,
    },
  ];

  return (
    <SitePage
      eyebrow={legalCopy.eyebrow}
      title={legalCopy.heroTitle}
      subtitle={legalCopy.heroSubtitle}
      content={
        <>
          <section className="px-6 pt-24 pb-10 sm:px-10">
            <div className="mx-auto max-w-[820px]">
              <nav aria-label={legalCopy.tabsLabel} className="flex gap-2">
                {links.map((link) => (
                  <Link
                    key={link.key}
                    href={link.href}
                    aria-current={link.key === kind ? "page" : undefined}
                    className={`min-h-11 rounded-full px-6 font-semibold ${
                      link.key === kind
                        ? "bg-ink-900 text-white"
                        : "bg-ink-50 text-ink-600 hover:bg-ink-100"
                    } ${focusRing}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-10 rounded-[36px] border border-gh-border bg-white p-8 shadow-sm sm:p-11">
                <h2 className="font-display text-[32px] font-bold tracking-[-0.5px]">
                  {doc.title}
                </h2>
                <p className="mt-2 text-sm text-ink-500">{legalCopy.lastUpdated}</p>
                <p className="mt-6 rounded-2xl bg-honey-50 p-4 text-sm text-ink-700">
                  {legalCopy.placeholderNote}
                </p>

                <div className="mt-8 flex flex-col gap-8">
                  {doc.sections.map((section) => (
                    <section key={section.heading}>
                      <h3 className="mb-2 text-xl font-bold">{section.heading}</h3>
                      <p className="text-base text-ink-600">{section.body}</p>
                    </section>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      }
    />
  );
}
