import { handleSessionStart } from "@gigshive/session";

import { sessionConfig } from "@/lib/session";

export const runtime = "nodejs";

export function POST(request: Request): Promise<Response> {
  return handleSessionStart(request, sessionConfig(), "/auth/login");
}
