import type { Metadata } from "next";

import { FeesScreen, feesCopy } from "@/features/site";

export const metadata: Metadata = {
  title: feesCopy.metaTitle,
  description: feesCopy.metaDescription,
};

export default function FeesPage() {
  return <FeesScreen />;
}
