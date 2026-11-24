import { handleProxy } from "@gigshive/session";

import { sessionConfig } from "@/lib/session";

export const runtime = "nodejs";

function forward(request: Request): Promise<Response> {
  return handleProxy(request, sessionConfig());
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const PUT = forward;
export const DELETE = forward;
