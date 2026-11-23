import type { Metadata } from "next";

import { SafetyScreen, safetyCopy } from "@/features/site";

export const metadata: Metadata = {
  title: safetyCopy.metaTitle,
  description: safetyCopy.metaDescription,
};

export default function SafetyPage() {
  return <SafetyScreen />;
}
