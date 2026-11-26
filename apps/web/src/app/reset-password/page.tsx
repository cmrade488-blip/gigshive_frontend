import type { Metadata } from "next";
import { Suspense } from "react";

import { authCopy, ResetPasswordScreen } from "@/features/auth";

export const metadata: Metadata = {
  title: authCopy.meta.resetPassword.title,
  description: authCopy.meta.resetPassword.description,
};

export default function ResetPasswordPage() {
  // useSearchParams needs a boundary above it when this route is pre-rendered.
  return (
    <Suspense fallback={<p className="p-10 text-ink-600">{authCopy.resetPassword.loading}</p>}>
      <ResetPasswordScreen />
    </Suspense>
  );
}
