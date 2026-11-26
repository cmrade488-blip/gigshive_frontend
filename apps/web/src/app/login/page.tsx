import type { Metadata } from "next";
import { Suspense } from "react";

import { authCopy, LoginScreen } from "@/features/auth";

export const metadata: Metadata = {
  title: authCopy.meta.login.title,
  description: authCopy.meta.login.description,
};

export default function LoginPage() {
  // useSearchParams needs a boundary above it when this route is pre-rendered.
  return (
    <Suspense fallback={<p className="p-10 text-ink-600">{authCopy.login.loading}</p>}>
      <LoginScreen />
    </Suspense>
  );
}
