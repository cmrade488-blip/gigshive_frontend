import type { Metadata } from "next";
import type { ReactNode } from "react";

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
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
