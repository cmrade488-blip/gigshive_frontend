import type { Metadata } from "next";

import { ContactScreen, contactCopy } from "@/features/site";

export const metadata: Metadata = {
  title: contactCopy.metaTitle,
  description: contactCopy.metaDescription,
};

export default function ContactPage() {
  return <ContactScreen />;
}
