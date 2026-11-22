import type { Config } from "tailwindcss";
import brandPreset from "@gigshive/brand/tokens/tailwind.preset";

export default {
  presets: [brandPreset],
  content: ["./src/app/**/*.{ts,tsx}", "./src/features/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
} satisfies Config;
