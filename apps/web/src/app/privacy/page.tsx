import type { Metadata } from "next";

import { LegalScreen, legalCopy } from "@/features/site";

export const metadata: Metadata = {
  title: legalCopy.documents.privacy.metaTitle,
  description: legalCopy.documents.privacy.metaDescription,
};

export default function PrivacyPage() {
  return <LegalScreen kind="privacy" />;
}
