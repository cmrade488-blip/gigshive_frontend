import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JobDetailScreen, jobDetailCopy } from "@/features/jobs";
import { isSampleDataEnabled } from "@/lib/flags";

export const metadata: Metadata = {
  title: jobDetailCopy.metaTitle,
  description: jobDetailCopy.metaDescription,
};

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  // A4: sample detail pages must not be reachable in a production build.
  if (!isSampleDataEnabled()) {
    notFound();
  }

  const { id } = await params;
  return <JobDetailScreen id={id} />;
}
