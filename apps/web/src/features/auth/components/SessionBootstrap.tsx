"use client";

import { siteRoutes } from "@gigshive/shared/routes";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

import { registerUnauthorizedHandler } from "@/lib/api";

import type { SessionData } from "../api/session";
import { authCopy } from "../copy/auth";
import { resolveReturnPath } from "../schemas/return-path";
import { guardWebRoute, isPrivateRoute } from "../schemas/session";
import { sessionQueryKey, useSessionStatus } from "../state/use-session-status";

/** Paths where a 401 is already being handled by a credential check or screen. */
const REDIRECT_EXEMPT = new Set<string>([
  siteRoutes.login,
  siteRoutes.register,
  siteRoutes.verifyEmail,
  siteRoutes.forgotPassword,
  siteRoutes.resetPassword,
]);

const loadingClass = "mx-auto max-w-[1200px] px-4 py-10 text-ink-600 sm:px-6";

/**
 * FE-017 app-level session bootstrap. Seeds the `/me` query for every page,
 * applies client route guards and owns the single global 401 response: clear
 * the cached session, then return to sign-in with a validated destination.
 *
 * The API remains the authority; guards only prevent obvious wrong-screen
 * renders. Server-side `/me` seeding is not attempted because the current app
 * has no private route group; the shared query is seeded on first client
 * render instead (see the FE-017 assumption in the PR).
 */
export function SessionBootstrap({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const sessionQuery = useSessionStatus();
  const session = sessionQuery.data;
  const redirected = useRef(false);
  const previousSession = useRef<SessionData | null | undefined>(undefined);

  // A new authenticated session re-arms the one-shot 401 redirect.
  useEffect(() => {
    if (session && !previousSession.current) {
      redirected.current = false;
    }
    previousSession.current = session;
  }, [session]);

  useEffect(
    () =>
      registerUnauthorizedHandler(() => {
        queryClient.setQueryData(sessionQueryKey, null);
        if (redirected.current) {
          return;
        }

        const currentPath = window.location.pathname;
        if (REDIRECT_EXEMPT.has(currentPath)) {
          return;
        }

        const { pathname: deniedPath, search } = window.location;
        const gate = guardWebRoute(null, deniedPath, search);
        const destination =
          !gate.allowed && gate.redirectTo
            ? gate.redirectTo
            : `${siteRoutes.login}?next=${encodeURIComponent(resolveReturnPath(`${deniedPath}${search}`))}`;

        redirected.current = true;
        router.replace(destination);
      }),
    [queryClient, router],
  );

  const gate = sessionQuery.isPending
    ? { allowed: !isPrivateRoute(pathname) }
    : guardWebRoute(session, pathname);

  useEffect(() => {
    if (sessionQuery.isPending || gate.allowed || redirected.current) {
      return;
    }

    // The mocked/real router pathname omits the query string; read the current
    // URL here so the remembered destination includes it.
    const redirectGate = guardWebRoute(session, pathname, window.location.search);
    if (!redirectGate.redirectTo) {
      return;
    }

    redirected.current = true;
    router.replace(redirectGate.redirectTo);
  }, [gate.allowed, pathname, router, session, sessionQuery.isPending]);

  if (!gate.allowed || (sessionQuery.isPending && isPrivateRoute(pathname))) {
    return (
      <p role="status" aria-live="polite" className={loadingClass}>
        {authCopy.session.checkingLabel}
      </p>
    );
  }

  return <>{children}</>;
}
