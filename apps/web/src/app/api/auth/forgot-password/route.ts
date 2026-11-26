import { forwardPublicAuth } from "@/lib/public-auth";

export const runtime = "nodejs";

export function POST(request: Request): Promise<Response> {
  return forwardPublicAuth(request, "/auth/forgot-password");
}
