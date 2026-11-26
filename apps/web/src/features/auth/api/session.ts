import { type schema } from "@gigshive/api-client";

import { sessionClient } from "@/lib/api";

export type SessionData = NonNullable<
  schema.paths["/me"]["get"]["responses"][200]["content"]["application/json"]["data"]
>;

/**
 * Header-only session check for FE-014. FE-017 will own the full bootstrap,
 * route guards and 401 behaviour; a missing or failed session is simply
 * "signed out" here.
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
