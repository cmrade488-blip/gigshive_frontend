import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/**
 * A2 adds pure unit tests for the site feature. B1 extends this config with
 * jsdom, Testing Library and axe for component and accessibility tests.
 */
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
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
