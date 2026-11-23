"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { mainNavLinks, siteCopy } from "../copy/site";
import { siteRoutes } from "../routes";

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:ring-offset-2 focus-visible:outline-none";

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navLinkClass(active: boolean): string {
  return [
    "inline-flex min-h-11 items-center rounded-full px-4 text-[15px] font-medium",
    active ? "bg-honey-100 text-ink-900" : "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
    focusRing,
  ].join(" ");
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);

  // Close the mobile menu when the route changes.
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="w-full px-4 pt-5 sm:px-6">
      <div className="relative mx-auto max-w-[1200px]">
        <div className="flex items-center justify-between gap-2 rounded-[36px] border border-white/70 bg-white/90 py-2.5 pr-2.5 pl-5 shadow-[0_12px_40px_rgba(9,14,26,0.28)] backdrop-blur-lg sm:pl-7 md:gap-6">
          <div className="flex items-center gap-7">
            <Link
              href={siteRoutes.home}
              aria-label={siteCopy.homeLabel}
              className={`flex items-center rounded-md ${focusRing}`}
            >
              <Image
                src="/brand/logo/gigshive-logo.svg"
                alt={siteCopy.brandName}
                width={156}
                height={34}
                priority
                unoptimized
                className="h-[34px] w-auto"
              />
            </Link>
            <nav aria-label={siteCopy.mainNavLabel} className="hidden gap-1 md:flex">
              {mainNavLinks.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  aria-current={
                    link.highlightWhenActive && isActive(pathname, link.href) ? "page" : undefined
                  }
                  className={navLinkClass(
                    link.highlightWhenActive && isActive(pathname, link.href),
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href={siteRoutes.login}
              className={`hidden min-h-11 items-center rounded-full px-[18px] text-[15px] font-semibold text-ink-900 hover:bg-ink-50 md:inline-flex ${focusRing}`}
            >
              {siteCopy.signIn}
            </Link>
            <Link
              href={siteRoutes.register}
              className={`inline-flex min-h-11 items-center rounded-full bg-honey-500 px-6 text-[15px] font-semibold text-ink-900 hover:bg-honey-400 ${focusRing}`}
            >
              {siteCopy.joinFree}
            </Link>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="site-mobile-menu"
              aria-label={open ? siteCopy.closeMenu : siteCopy.openMenu}
              onClick={() => setOpen((value) => !value)}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-900 hover:bg-ink-50 md:hidden ${focusRing}`}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>

        {open ? (
          <div
            id="site-mobile-menu"
            className="absolute inset-x-0 top-full z-20 mt-2 rounded-3xl border border-white/70 bg-white p-2 shadow-[0_12px_40px_rgba(9,14,26,0.28)] md:hidden"
          >
            <nav aria-label={siteCopy.mobileNavLabel} className="flex flex-col">
              {mainNavLinks.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`${navLinkClass(
                    link.highlightWhenActive && isActive(pathname, link.href),
                  )} min-h-12`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={siteRoutes.login}
                onClick={() => setOpen(false)}
                className={`${navLinkClass(false)} min-h-12 font-semibold`}
              >
                {siteCopy.signIn}
              </Link>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
