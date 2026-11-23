import type { Metadata } from "next";

import { HelpScreen, helpCopy } from "@/features/site";

export const metadata: Metadata = {
  title: helpCopy.metaTitle,
  description: helpCopy.metaDescription,
};

export default function HelpPage() {
  return <HelpScreen />;
}
