import type { Metadata } from "next";

import { LegalScreen, legalCopy } from "@/features/site";

export const metadata: Metadata = {
  title: legalCopy.documents.terms.metaTitle,
  description: legalCopy.documents.terms.metaDescription,
};

export default function TermsPage() {
  return <LegalScreen kind="terms" />;
}
