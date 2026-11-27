"use client";

import { siteRoutes } from "@gigshive/shared/routes";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { authCopy } from "../copy/auth";
import { sessionStatus } from "../schemas/session";
import { useSessionStatus } from "../state/use-session-status";

/** The verification screen already explains the requirement; auth pages do not need a banner. */
const PROMPT_EXEMPT = new Set<string>([
  siteRoutes.verifyEmail,
  siteRoutes.login,
  siteRoutes.register,
  siteRoutes.forgotPassword,
  siteRoutes.resetPassword,
]);

/** FE-017 persistent prompt. Phone verification is optional and never gated here. */
export function VerifyEmailPrompt() {
  const pathname = usePathname();
  const { data: session } = useSessionStatus();

  if (!session || sessionStatus(session) !== "UNVERIFIED" || PROMPT_EXEMPT.has(pathname)) {
    return null;
  }

  return (
    <div
      role="status"
      className="border-b border-gh-border bg-gh-warning-bg px-4 py-3 text-ink-900 sm:px-6"
    >
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold">{authCopy.prompt.title}</p>
          <p className="mt-0.5 text-sm text-ink-700">{authCopy.prompt.text}</p>
        </div>
        <Link
          href={siteRoutes.verifyEmail}
          className="rounded font-semibold text-gh-primary underline focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:outline-none"
        >
          {authCopy.prompt.actionLabel}
        </Link>
      </div>
    </div>
  );
}
