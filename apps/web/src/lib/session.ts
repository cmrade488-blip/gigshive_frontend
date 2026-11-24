import { createSessionConfig } from "@gigshive/session";

/** Built per request so environment values are read at runtime, not at build time. */
export function sessionConfig() {
  return createSessionConfig({ surface: "web", env: process.env });
}
