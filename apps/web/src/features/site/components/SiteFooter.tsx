import Image from "next/image";
import Link from "next/link";

import { footerColumns, siteCopy } from "../copy/site";

export function SiteFooter() {
  return (
    <footer className="relative w-full overflow-hidden rounded-t-[48px] bg-ink-900 px-6 pt-[72px] pb-8 text-sm leading-relaxed text-ink-300 sm:px-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[url('/brand/images/patterns/hex-pattern.svg')] bg-[length:104px_120px] opacity-[0.06]"
      />
      <div className="relative mx-auto flex max-w-[1200px] flex-wrap justify-between gap-x-16 gap-y-10">
        <div className="max-w-[360px] flex-[1_1_280px]">
          <Image
            src="/brand/logo/gigshive-logo-reversed.svg"
            alt={siteCopy.brandName}
            width={165}
            height={36}
            unoptimized
            className="mb-4 h-9 w-auto"
          />
          <p>{siteCopy.footerTagline}</p>
        </div>
        <nav aria-label={siteCopy.footerNavLabel} className="flex flex-wrap gap-x-[72px] gap-y-8">
          {footerColumns.map((column) => (
            <div key={column.heading} className="flex flex-col gap-2.5">
              <h2 className="text-sm font-semibold text-white">{column.heading}</h2>
              {column.links.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="rounded-sm hover:text-honey-400 focus-visible:ring-2 focus-visible:ring-honey-400 focus-visible:outline-none"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>
      <div className="relative mx-auto mt-12 max-w-[1200px] border-t border-ink-700 pt-6 text-[13px] text-ink-400">
        {siteCopy.copyright}
      </div>
    </footer>
  );
}
