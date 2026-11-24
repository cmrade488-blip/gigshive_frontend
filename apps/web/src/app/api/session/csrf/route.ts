import { createCsrfResponse } from "@gigshive/session";

import { sessionConfig } from "@/lib/session";

export const runtime = "nodejs";

export function GET(): Response {
  return createCsrfResponse(sessionConfig());
}
