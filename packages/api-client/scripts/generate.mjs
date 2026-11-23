#!/usr/bin/env node
// Regenerates src/generated/schema.ts from spec/openapi.yaml (Blueprint 7.2).
// The output is committed and never edited by hand.
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pkgDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const cli = path.join(pkgDir, "node_modules", "openapi-typescript", "bin", "cli.js");
const result = spawnSync(
  process.execPath,
  [cli, "spec/openapi.yaml", "-o", "src/generated/schema.ts"],
  {
    cwd: pkgDir,
    stdio: "inherit",
  },
);

if (result.error) {
  console.error(`generate -> could not run openapi-typescript: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
