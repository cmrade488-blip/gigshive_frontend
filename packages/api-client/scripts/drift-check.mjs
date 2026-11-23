#!/usr/bin/env node
// Regenerates types into a temporary file and fails if they differ from the
// committed src/generated/schema.ts. The spec is the arbiter (Blueprint 7.2).
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pkgDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const committedPath = path.join(pkgDir, "src", "generated", "schema.ts");
const tmpDir = await mkdtemp(path.join(os.tmpdir(), "gh-spec-"));
const tmpOut = path.join(tmpDir, "schema.ts");
const cli = path.join(pkgDir, "node_modules", "openapi-typescript", "bin", "cli.js");

const generated = spawnSync(process.execPath, [cli, "spec/openapi.yaml", "-o", tmpOut], {
  cwd: pkgDir,
  stdio: "inherit",
});

if (generated.error !== undefined || generated.status !== 0) {
  await rm(tmpDir, { recursive: true, force: true });
  console.error("generate:check -> type generation failed.");
  process.exit(generated.status ?? 1);
}

const [committed, fresh] = await Promise.all([
  readFile(committedPath, "utf8").catch(() => null),
  readFile(tmpOut, "utf8"),
]);

await rm(tmpDir, { recursive: true, force: true });

if (committed === null) {
  console.error(
    "generate:check -> no committed types found. Run `pnpm --filter @gigshive/api-client generate` and commit the result.",
  );
  process.exit(1);
}

if (committed !== fresh) {
  console.error(
    "generate:check -> src/generated/schema.ts is out of date with spec/openapi.yaml.\n" +
      "Run `pnpm --filter @gigshive/api-client generate` and commit the result.",
  );
  process.exit(1);
}

process.stdout.write("generate:check -> generated types match the OpenAPI specification.\n");
