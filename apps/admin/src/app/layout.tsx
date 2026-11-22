import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Providers } from "@/lib/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "GigsHive Console",
    template: "%s · GigsHive Console",
  },
  description: "Staff console for verification, moderation, support and finance.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
