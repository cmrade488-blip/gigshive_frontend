import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { WorkerProfileScreen, workerProfileCopy } from "@/features/profiles";
import { isSampleDataEnabled } from "@/lib/flags";

export const metadata: Metadata = {
  title: workerProfileCopy.metaTitle,
  description: workerProfileCopy.metaDescription,
};

export default async function WorkerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  // A4: sample detail pages must not be reachable in a production build.
  if (!isSampleDataEnabled()) {
    notFound();
  }

  const { id } = await params;
  return <WorkerProfileScreen id={id} />;
}
