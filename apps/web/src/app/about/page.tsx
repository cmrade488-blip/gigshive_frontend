import type { Metadata } from "next";

import { AboutScreen, aboutCopy } from "@/features/site";

export const metadata: Metadata = {
  title: aboutCopy.metaTitle,
  description: aboutCopy.metaDescription,
};

export default function AboutPage() {
  return <AboutScreen />;
}
