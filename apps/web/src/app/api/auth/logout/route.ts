import { handleLogout } from "@gigshive/session";

import { sessionConfig } from "@/lib/session";

export const runtime = "nodejs";

export function POST(request: Request): Promise<Response> {
  return handleLogout(request, sessionConfig());
}
