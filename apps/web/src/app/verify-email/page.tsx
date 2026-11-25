import type { Metadata } from "next";

import { authCopy, VerifyEmailScreen } from "@/features/auth";

export const metadata: Metadata = {
  title: authCopy.meta.verifyEmail.title,
  description: authCopy.meta.verifyEmail.description,
};

export default function VerifyEmailPage() {
  return <VerifyEmailScreen />;
}
