import { handleSessionStart } from "@gigshive/session";

import { sessionConfig } from "@/lib/session";

export const runtime = "nodejs";

/** Staff step one: password only, no token until OTP verification. */
export function POST(request: Request): Promise<Response> {
  return handleSessionStart(request, sessionConfig(), "/admin/auth/login");
}
