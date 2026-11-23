import type { Metadata } from "next";

import { JobDetailScreen, jobDetailCopy } from "@/features/jobs";

export const metadata: Metadata = {
  title: jobDetailCopy.metaTitle,
  description: jobDetailCopy.metaDescription,
};

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <JobDetailScreen id={id} />;
}
