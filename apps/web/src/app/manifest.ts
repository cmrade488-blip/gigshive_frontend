import brandColors from "@gigshive/brand/tokens/colors.json";
import type { MetadataRoute } from "next";

import { siteCopy } from "@/features/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteCopy.brandName,
    short_name: siteCopy.brandName,
    description: siteCopy.siteMetaDescription,
    start_url: "/",
    display: "standalone",
    background_color: brandColors.brand.ink,
    theme_color: brandColors.brand.honey,
    icons: [
      {
        src: "/brand/favicon/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/favicon/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/favicon/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
