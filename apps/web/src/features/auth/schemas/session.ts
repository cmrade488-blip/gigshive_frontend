import type { SessionData } from "../api/session";

export type SessionStatus = "ANONYMOUS" | "AUTHENTICATED" | "UNVERIFIED" | "SUSPENDED";

/**
 * FE-017's single source of truth for client route decisions. The API remains
 * the authority; these helpers only decide which client screen a user sees.
 */
export function sessionStatus(session: SessionData | null | undefined): SessionStatus {
  if (!session) {
    return "ANONYMOUS";
  }
  if (session.status === "SUSPENDED" || session.status === "DELETED") {
    return "SUSPENDED";
  }
  if (!session.email_verified_at) {
    return "UNVERIFIED";
  }
  return "AUTHENTICATED";
}

/** Suspension is per profile; the account area stays available. */
export function hasSuspendedProfile(session: SessionData | null | undefined): boolean {
  return session?.profiles.some((profile) => profile.status === "SUSPENDED") ?? false;
}

export interface SessionGate {
  allowed: boolean;
  /** Set when a client route should redirect instead of rendering gated UI. */
  redirectTo?: string;
}

const AUTH_PATHS = new Set<string>([
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
]);

/**
 * Private prefixes from the Data and State Design's web route map. Unknown
 * paths are left to the not-found page, not treated as private.
 */
const PRIVATE_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/profile",
  "/settings",
  "/my",
  "/contracts",
  "/wallet",
  "/notifications",
  "/messages",
  "/disputes",
  "/support",
  "/subscription",
  "/reviews",
] as const;

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isPrivateRoute(pathname: string): boolean {
  if (PRIVATE_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix))) {
    return true;
  }
  // The proposal form is the only public-prefix route that needs a session.
  return pathname.startsWith("/jobs/") && pathname.endsWith("/propose");
}

/**
 * Guards are a UX convenience. The API independently enforces verification,
 * profile status, abilities and permissions on every protected request.
 */
export function guardWebRoute(
  session: SessionData | null | undefined,
  pathname: string,
  search = "",
): SessionGate {
  const status = sessionStatus(session);

  if (status === "ANONYMOUS") {
    if (!isPrivateRoute(pathname)) {
      return { allowed: true };
    }
    const destination = `${pathname}${search}`;
    return {
      allowed: false,
      redirectTo: `/login?next=${encodeURIComponent(destination)}`,
    };
  }

  if (AUTH_PATHS.has(pathname)) {
    // An unverified user must be able to reach the prompt's destination.
    if (pathname === "/verify-email" && status === "UNVERIFIED") {
      return { allowed: true };
    }
    return { allowed: false, redirectTo: "/dashboard" };
  }

  return { allowed: true };
}
