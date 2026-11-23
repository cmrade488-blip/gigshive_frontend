#!/usr/bin/env node
// Copies the brand assets that must be served as static files from packages/brand into an app's
// public/brand folder. The copies are generated and git-ignored, so packages/brand stays the single
// source. Run automatically by the app's dev and build scripts.
//
// Usage: node scripts/copy-brand-assets.mjs <app-name>      (for example: web)
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Folders inside packages/brand to publish. Add more here when a screen needs them.
const ASSET_DIRS = [
  "logo",
  "favicon",
  "social",
  "images/patterns",
  "images/steps",
  "images/empty",
  "images/categories",
  "images/avatars",
  "images/illustrations",
];

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const app = process.argv[2];

if (!app) {
  console.error("usage: node scripts/copy-brand-assets.mjs <app-name>");
  process.exit(1);
}
if (!existsSync(join(root, "apps", app))) {
  console.error(`error: apps/${app} does not exist`);
  process.exit(1);
}

const source = join(root, "packages", "brand");
const target = join(root, "apps", app, "public", "brand");

for (const dir of ASSET_DIRS) {
  const from = join(source, dir);
  if (!existsSync(from)) {
    console.warn(`skip ${dir}: not found in packages/brand`);
    continue;
  }
  const to = join(target, dir);
  rmSync(to, { recursive: true, force: true });
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true });
}

console.log(`Copied brand assets to apps/${app}/public/brand`);
