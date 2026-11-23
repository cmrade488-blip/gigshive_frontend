import base from "./base.js";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

/**
 * ESLint config for Next.js apps (apps/web, apps/admin).
 * Extends the shared base with React and React Hooks rules.
 */
export default [
  ...base,
  { ignores: ["next-env.d.ts", ".next/**"] },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs["jsx-runtime"].rules,
      ...reactHooksPlugin.configs.recommended.rules,

      // React 19 + modern JSX transform: no need to import React
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",

      // Prefer function components
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "function-declaration",
          unnamedComponents: "arrow-function",
        },
      ],
    },
  },
];
