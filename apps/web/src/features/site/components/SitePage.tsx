import type { ReactNode } from "react";

import { siteCopy } from "../copy/site";
import { HeroBand, type HeroBandProps } from "./HeroBand";
import { SiteFooter } from "./SiteFooter";

export interface SitePageProps extends HeroBandProps {
  /** Page content below the hero band. */
  content?: ReactNode;
}

/** Standard public page: skip link, hero band with header, main content, footer. */
export function SitePage({ eyebrow, title, subtitle, children, content }: SitePageProps) {
  return (
    <div className="min-h-screen bg-white font-sans text-ink-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-honey-500 focus:px-4 focus:py-2 focus:font-semibold focus:text-ink-900"
      >
        {siteCopy.skipToContent}
      </a>
      <HeroBand eyebrow={eyebrow} title={title} subtitle={subtitle}>
        {children}
      </HeroBand>
      <main id="main-content">{content}</main>
      <SiteFooter />
    </div>
  );
}
