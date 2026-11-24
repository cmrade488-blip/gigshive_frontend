import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/**
 * B1 extends A2's pure unit-test setup with jsdom, Testing Library and axe.
 * All app tests share the React 19 automatic JSX transform.
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
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
