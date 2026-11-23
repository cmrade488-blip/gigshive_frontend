import type { Metadata } from "next";

import { HomeScreen, siteCopy } from "@/features/site";

export const metadata: Metadata = {
  title: siteCopy.homeMetaTitle,
  description: siteCopy.homeMetaDescription,
};

export default function HomePage() {
  return <HomeScreen />;
}
