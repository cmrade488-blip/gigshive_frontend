import { StaffLoginProvider } from "@/features/auth";
import type { ReactNode } from "react";

export default function StaffLoginLayout({ children }: { children: ReactNode }) {
  return <StaffLoginProvider>{children}</StaffLoginProvider>;
}
