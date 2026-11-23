import type { Metadata } from "next";

import { AccessDeniedScreen, accessDeniedCopy } from "@/features/site";

export const metadata: Metadata = {
  title: accessDeniedCopy.metaTitle,
  description: accessDeniedCopy.metaDescription,
};

export default function AccessDeniedPage() {
  return <AccessDeniedScreen />;
}
