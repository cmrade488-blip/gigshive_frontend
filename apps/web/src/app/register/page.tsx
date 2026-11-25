import type { Metadata } from "next";

import { authCopy, RegisterScreen } from "@/features/auth";

export const metadata: Metadata = {
  title: authCopy.meta.register.title,
  description: authCopy.meta.register.description,
};

export default function RegisterPage() {
  return <RegisterScreen />;
}
