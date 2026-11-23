import type { Metadata } from "next";

import { WorkerProfileScreen, workerProfileCopy } from "@/features/profiles";

export const metadata: Metadata = {
  title: workerProfileCopy.metaTitle,
  description: workerProfileCopy.metaDescription,
};

export default async function WorkerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WorkerProfileScreen id={id} />;
}
