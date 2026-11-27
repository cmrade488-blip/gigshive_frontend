import { type schema } from "@gigshive/api-client";

import { sessionClient } from "@/lib/api";

export type SessionData = NonNullable<
  schema.paths["/me"]["get"]["responses"][200]["content"]["application/json"]["data"]
>;

/**
 * Reads the session with 401 handling opted out. Route guards and credential
 * checks interpret a failed or absent session themselves; the app-level 401
 * handler is reserved for authenticated API calls.
 */
export async function getSession(): Promise<SessionData | null> {
  try {
    const response = await sessionClient.get<SessionData>("/me", {
      skipUnauthorizedHandler: true,
    });
    return response.data ?? null;
  } catch {
    return null;
  }
}
