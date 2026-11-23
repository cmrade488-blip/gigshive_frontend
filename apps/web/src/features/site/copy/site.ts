import { siteRoutes } from "../routes";

export const siteCopy = {
  brandName: "GigsHive",
  homeLabel: "GigsHive home",
  skipToContent: "Skip to main content",
  mainNavLabel: "Main",
  mobileNavLabel: "Mobile",
  footerNavLabel: "Footer",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  signIn: "Sign in",
  joinFree: "Join free",
  footerTagline:
    "Hire skilled people and get paid for good work. Payments are held until the work is approved.",
  copyright: "© GigsHive. All rights reserved.",
  siteMetaDescription:
    "Nigerian marketplace connecting clients with verified digital creators and skilled physical artisans.",
  homeMetaTitle: "Hire skilled people. Pay when the work is done.",
  homeMetaDescription:
    "Post a job, compare proposals and fund the contract. Your payment is held until you approve the work.",
} as const;

export interface NavLink {
  label: string;
  href: string;
  /** Highlight the link when the current page is under this route. */
  highlightWhenActive: boolean;
}

export const mainNavLinks: readonly NavLink[] = [
  { label: "Find work", href: siteRoutes.jobs, highlightWhenActive: true },
  { label: "How it works", href: siteRoutes.howItWorks, highlightWhenActive: true },
  { label: "Post a job", href: siteRoutes.register, highlightWhenActive: false },
];

export interface FooterColumn {
  heading: string;
  links: readonly { label: string; href: string }[];
}

export const footerColumns: readonly FooterColumn[] = [
  {
    heading: "For clients",
    links: [
      { label: "Post a job", href: siteRoutes.register },
      { label: "How hiring works", href: siteRoutes.howItWorks },
    ],
  },
  {
    heading: "For workers",
    links: [
      { label: "Find work", href: siteRoutes.jobs },
      { label: "Create a profile", href: siteRoutes.register },
    ],
  },
  {
    heading: "GigsHive",
    links: [
      { label: "How it works", href: siteRoutes.howItWorks },
      { label: "Sign in", href: siteRoutes.login },
      { label: "Terms", href: siteRoutes.terms },
      { label: "Privacy", href: siteRoutes.privacy },
    ],
  },
];
