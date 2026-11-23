import type { Metadata } from "next";

import { SitePage, siteCopy } from "@/features/site";

export const metadata: Metadata = {
  title: siteCopy.homeMetaTitle,
  description: siteCopy.homeMetaDescription,
};

export default function HomePage() {
  return (
    <SitePage
      title={
        <>
          Welcome to <span className="text-honey-400">GigsHive</span>
        </>
      }
      subtitle={siteCopy.footerTagline}
      content={
        <section className="mx-auto max-w-[820px] px-6 py-24 text-center text-ink-600 sm:px-10">
          <p>{siteCopy.homePlaceholder}</p>
        </section>
      }
    />
  );
}
