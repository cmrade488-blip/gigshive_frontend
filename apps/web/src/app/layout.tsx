import type { Metadata } from "next";
import type { ReactNode } from "react";

import { MaintenanceScreen } from "@/features/site";
import { Providers } from "@/lib/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "GigsHive",
    template: "%s · GigsHive",
  },
  description:
    "Nigerian marketplace connecting clients with verified digital creators and skilled physical artisans.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // Build-time flag. Statically generated pages bake this in at build, so a
  // runtime toggle needs a rebuild; a true 503 status needs a host/middleware
  // decision. See the site README.
  if (process.env.GIGSHIVE_MAINTENANCE_MODE === "true") {
    return (
      <html lang="en">
        <body>
          <MaintenanceScreen />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
