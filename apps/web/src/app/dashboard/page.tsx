import type { Metadata } from "next";

import { dashboardCopy, DashboardScreen } from "@/features/auth";

export const metadata: Metadata = {
  title: dashboardCopy.meta.title,
  description: dashboardCopy.meta.description,
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <DashboardScreen />;
}
