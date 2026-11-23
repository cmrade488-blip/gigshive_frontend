import type { Metadata } from "next";

import { HowItWorksScreen, howItWorksCopy } from "@/features/site";

export const metadata: Metadata = {
  title: howItWorksCopy.metaTitle,
  description: howItWorksCopy.metaDescription,
};

export default function HowItWorksPage() {
  return <HowItWorksScreen />;
}
