import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import type { ReactNode } from "react";

import { MaintenanceScreen, siteCopy } from "@/features/site";
import { Providers } from "@/lib/providers";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

// Inter is a variable font on Google Fonts, so one file covers 400-600.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: siteCopy.brandName,
    template: `%s · ${siteCopy.brandName}`,
  },
  description: siteCopy.siteMetaDescription,
  applicationName: siteCopy.brandName,
  icons: {
    icon: [
      { url: "/brand/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon/favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
    shortcut: "/brand/favicon/favicon.ico",
    apple: "/brand/favicon/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: siteCopy.brandName,
    description: siteCopy.siteMetaDescription,
    images: [
      { url: "/brand/social/og-image.png", width: 1200, height: 630, alt: siteCopy.brandName },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/brand/social/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // Build-time flag. Statically generated pages bake this in at build, so a
  // runtime toggle needs a rebuild; a true 503 status needs a host/middleware
  // decision. See the site README.
  if (process.env.GIGSHIVE_MAINTENANCE_MODE === "true") {
    return (
      <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
        <body>
          <MaintenanceScreen />
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
