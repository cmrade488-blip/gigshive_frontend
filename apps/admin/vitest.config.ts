import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/** FE-018 gives the console the same Vitest/Testing Library setup as the web app. */
export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
