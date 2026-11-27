"use client";

import { ForbiddenState } from "@gigshive/ui";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

import { registerUnauthorizedHandler } from "@/lib/api";

import type { ConsoleSession } from "../api/session";
import { staffAuthCopy } from "../copy/staff-auth";
import { guardConsoleRoute } from "../schemas/console-guard";
import { resolveConsoleReturnPath } from "../schemas/return-path";
import { consoleSessionQueryKey, useSessionStatus } from "../state/use-session-status";

/** Paths where a 401 belongs to the credential form, not the global redirect. */
const AUTH_PATHS = new Set<string>(["/login", "/login/otp"]);

const loadingClass = "mx-auto max-w-[1200px] px-6 py-12 text-ink-600";

/**
 * FE-018 app-level staff bootstrap. Seeds `/me`, applies UX route guards and
 * owns the single 401 response: clear the cached session, then sign out with a
 * validated destination. The API remains the authority for permissions.
 */
export function ConsoleSessionBootstrap({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  // Read the query during effects/hydration instead of calling useSearchParams:
  // this component wraps every route in the root provider, and that hook would
  // force a Suspense boundary on every statically rendered console page.
  const searchSuffix = typeof window === "undefined" ? "" : window.location.search;
  const sessionQuery = useSessionStatus();
  const session = sessionQuery.data;
  const redirected = useRef(false);
  const previousSession = useRef<ConsoleSession | null | undefined>(undefined);

  useEffect(() => {
    if (session && !previousSession.current) {
      redirected.current = false;
    }
    previousSession.current = session;
  }, [session]);

  useEffect(
    () =>
      registerUnauthorizedHandler(() => {
        queryClient.setQueryData(consoleSessionQueryKey, null);
        if (redirected.current) {
          return;
        }

        const currentPath = window.location.pathname;
        if (AUTH_PATHS.has(currentPath)) {
          return;
        }

        const deniedPath = `${currentPath}${window.location.search}`;
        redirected.current = true;
        router.replace(`/login?next=${encodeURIComponent(resolveConsoleReturnPath(deniedPath))}`);
      }),
    [queryClient, router],
  );

  const gate = sessionQuery.isPending
    ? { allowed: !AUTH_PATHS.has(pathname), forbidden: false }
    : guardConsoleRoute(session, pathname, searchSuffix);

  useEffect(() => {
    if (sessionQuery.isPending || gate.allowed || gate.forbidden || redirected.current) {
      return;
    }
    if (!gate.redirectTo) {
      return;
    }
    redirected.current = true;
    router.replace(gate.redirectTo);
  }, [gate.allowed, gate.forbidden, gate.redirectTo, router, sessionQuery.isPending]);

  if (gate.forbidden) {
    return (
      <main className="min-h-screen bg-ink-50 px-6 py-16">
        <ForbiddenState
          variant="page"
          title={staffAuthCopy.errors.forbiddenTitle}
          description={staffAuthCopy.errors.forbiddenDescription}
        />
      </main>
    );
  }

  if (!gate.allowed || (sessionQuery.isPending && !AUTH_PATHS.has(pathname))) {
    return (
      <p role="status" aria-live="polite" className={loadingClass}>
        {staffAuthCopy.session.checkingLabel}
      </p>
    );
  }

  return <>{children}</>;
}
