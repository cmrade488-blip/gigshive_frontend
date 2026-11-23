import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import globals from "globals";

/**
 * Shared base ESLint flat config for the monorepo.
 * Apps and packages extend this (or the nextjs / react-library variants).
 * Boundary rules (feature isolation) land in FE-010.
 */
export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/*.tsbuildinfo",
      "**/pnpm-lock.yaml",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      import: importPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
    rules: {
      // TypeScript strictness
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Prefer named exports (Next.js pages/layouts are the exception)
      "import/no-default-export": "error",
      "import/first": "error",
      "import/no-duplicates": "error",

      // General quality
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
    },
  },
  // Allow default exports where frameworks require them
  {
    files: [
      "**/app/**/{page,layout,loading,error,global-error,not-found,template,default,route,manifest,robots,sitemap}.{ts,tsx}",
      "**/app/**/opengraph-image.{ts,tsx}",
      "**/app/**/icon.{ts,tsx}",
      "**/*.config.{js,mjs,cjs,ts}",
      "**/eslint.config.{js,mjs,cjs}",
    ],
    rules: {
      "import/no-default-export": "off",
    },
  },
  eslintConfigPrettier,
);
