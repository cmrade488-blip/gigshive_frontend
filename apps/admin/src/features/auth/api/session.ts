import { type schema } from "@gigshive/api-client";

import { sessionClient } from "@/lib/api";

export type ConsoleSession = NonNullable<
  schema.paths["/me"]["get"]["responses"][200]["content"]["application/json"]["data"]
>;

/**
 * The console is staff-only. Ability names are intentionally not checked:
 * BR-41 says permissions, not role labels, drive access, and `account_type`
 * is the documented field that selects this surface (FOI-03).
 */
export function canAccessConsole(session: ConsoleSession | null | undefined): boolean {
  return session?.account_type === "STAFF" && session.status === "ACTIVE";
}

/** Session bootstrap read. A 401 is handled by the app-level handler, not here. */
export async function getConsoleSession(): Promise<ConsoleSession | null> {
  try {
    const response = await sessionClient.get<ConsoleSession>("/me", {
      skipUnauthorizedHandler: true,
    });
    return response.data;
  } catch {
    return null;
  }
}
