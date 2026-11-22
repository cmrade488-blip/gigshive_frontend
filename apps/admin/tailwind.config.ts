import type { Config } from "tailwindcss";
import brandPreset from "@gigshive/brand/tokens/tailwind.preset";

// The brand preset's Config type comes from the @gigshive/brand package and does not
// match the app's copy of the type, so cast it here.
const config: Config = {
  presets: [brandPreset as unknown as Partial<Config>],
  content: ["./src/app/**/*.{ts,tsx}", "./src/features/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
};

export default config;
