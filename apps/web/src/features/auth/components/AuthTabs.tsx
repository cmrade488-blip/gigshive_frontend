import { siteRoutes } from "@gigshive/shared/routes";
import Link from "next/link";

import { authCopy } from "../copy/auth";

export type AuthTab = "signin" | "join";

export interface AuthTabsProps {
  active: AuthTab;
}

const TABS: ReadonlyArray<{ id: AuthTab; label: string; href: string }> = [
  { id: "signin", label: authCopy.tabs.signIn, href: siteRoutes.login },
  { id: "join", label: authCopy.tabs.join, href: siteRoutes.register },
];

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:ring-offset-2 focus-visible:outline-none";

/** Design-style account switcher implemented as navigation, not fake tabs. */
export function AuthTabs({ active }: AuthTabsProps) {
  return (
    <nav aria-label={authCopy.tabs.label} className="mt-2">
      <div className="flex gap-1 rounded-full bg-ink-50 p-1">
        {TABS.map((tab) => {
          const current = tab.id === active;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={current ? "page" : undefined}
              className={[
                "inline-flex min-h-11 flex-1 items-center justify-center rounded-full px-4 text-sm font-semibold",
                current ? "bg-white text-ink-900 shadow-sm" : "text-ink-600 hover:text-ink-900",
                focusRing,
              ].join(" ")}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
