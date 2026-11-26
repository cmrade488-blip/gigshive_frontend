import type { Metadata } from "next";

import { authCopy, ForgotPasswordScreen } from "@/features/auth";

export const metadata: Metadata = {
  title: authCopy.meta.forgotPassword.title,
  description: authCopy.meta.forgotPassword.description,
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordScreen />;
}
