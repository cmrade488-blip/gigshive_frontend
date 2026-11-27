import { canAccessConsole, type ConsoleSession } from "../api/session";
import { resolveConsoleReturnPath } from "./return-path";

export interface ConsoleGate {
  allowed: boolean;
  redirectTo?: string;
  forbidden?: boolean;
}

const AUTH_PATHS = new Set<string>(["/login", "/login/otp"]);

function signedInDestination(search: string): string {
  const next = new URLSearchParams(search).get("next");
  return resolveConsoleReturnPath(next);
}

/**
 * Client-side console guard. The API remains the authority: this only keeps a
 * signed-out or non-staff browser out of obvious wrong screens.
 */
export function guardConsoleRoute(
  session: ConsoleSession | null | undefined,
  pathname: string,
  search = "",
): ConsoleGate {
  const eligible = canAccessConsole(session);

  if (AUTH_PATHS.has(pathname)) {
    return eligible
      ? { allowed: false, redirectTo: signedInDestination(search) }
      : { allowed: true };
  }

  if (!session) {
    const destination = `${pathname}${search}`;
    return {
      allowed: false,
      redirectTo: `/login?next=${encodeURIComponent(destination)}`,
    };
  }

  if (!eligible) {
    return { allowed: false, forbidden: true };
  }

  return { allowed: true };
}
