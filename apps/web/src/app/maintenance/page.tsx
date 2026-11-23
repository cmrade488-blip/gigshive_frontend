import type { Metadata } from "next";

import { MaintenanceScreen, maintenanceCopy } from "@/features/site";

export const metadata: Metadata = {
  title: maintenanceCopy.metaTitle,
  description: maintenanceCopy.metaDescription,
};

export default function MaintenancePage() {
  return <MaintenanceScreen />;
}
