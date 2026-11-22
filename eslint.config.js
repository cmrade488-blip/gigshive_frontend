import base from "./packages/config/eslint/base.js";

/**
 * Root ESLint config.
 * Individual apps and packages should also ship their own eslint.config.js
 * that extends the appropriate preset from @gigshive/config.
 */
export default [
  ...base,
  {
    // Root-level config and tooling files only
    files: ["*.js", "*.mjs", "*.cjs", "*.ts"],
  },
];
