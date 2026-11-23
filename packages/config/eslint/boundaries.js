const DEEP_FEATURE_IMPORT = {
  group: ["@/features/*/*", "@/features/*/*/**"],
  message: "Import a feature only through its index.ts (AGENTS.md section 4).",
};

const ROUTE_IMPORT = {
  group: ["@/app/*", "@/app/*/**", "**/src/app/**"],
  message:
    "Routes are entry points; screens and components must not import them (AGENTS.md section 4).",
};

const API_CLIENT_IMPORT = {
  group: ["@gigshive/api-client", "@gigshive/api-client/*"],
  message: "Only src/features/<name>/api or src/lib may call the API client (AGENTS.md section 4).",
};

const FETCH_GLOBAL = {
  name: "fetch",
  message: "Do not call fetch directly; use the feature api folder (AGENTS.md section 4).",
};

const FETCH_GLOBAL_THIS = {
  object: "globalThis",
  property: "fetch",
  message: FETCH_GLOBAL.message,
};

const FETCH_WINDOW = {
  object: "window",
  property: "fetch",
  message: FETCH_GLOBAL.message,
};

/**
 * @param {"web" | "admin"} app
 * @returns {Array<{ group: string[]; message: string }>}
 */
function crossAppImports(app) {
  if (app === "web") {
    return [
      {
        group: [
          "@gigshive/admin",
          "@gigshive/admin/*",
          "@/features/admin-ops",
          "@/features/admin-ops/*",
          "**/apps/admin/**",
          "**/admin/src/**",
        ],
        message: "apps/web must not import admin code or restricted console types.",
      },
    ];
  }

  if (app === "admin") {
    return [
      {
        group: ["@gigshive/web", "@gigshive/web/*", "**/apps/web/**", "**/web/src/**"],
        message: "apps/admin must not import web code.",
      },
    ];
  }

  throw new Error(`Unknown app "${app}" for import boundaries.`);
}

/**
 * @param {"web" | "admin"} app
 * @returns {Array<{ group: string[]; message: string }>}
 */
function appImportPatterns(app) {
  return [DEEP_FEATURE_IMPORT, ROUTE_IMPORT, ...crossAppImports(app)];
}

/**
 * Flat ESLint config enforcing app import boundaries.
 * Add this after the Next.js preset in each app's eslint.config.js.
 *
 * @param {"web" | "admin"} app
 * @returns {import("eslint").Linter.Config[]}
 */
export function appBoundaries(app) {
  const general = appImportPatterns(app);
  const restricted = [...general, API_CLIENT_IMPORT];

  return [
    {
      files: ["src/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-imports": ["error", { patterns: restricted }],
        "no-restricted-globals": ["error", FETCH_GLOBAL],
        "no-restricted-properties": ["error", FETCH_GLOBAL_THIS, FETCH_WINDOW],
      },
    },
    {
      files: [
        "src/features/*/api/**/*.{ts,tsx}",
        "src/features/*/api/*.{ts,tsx}",
        "src/lib/**/*.{ts,tsx}",
        "src/lib/*.{ts,tsx}",
      ],
      rules: {
        "no-restricted-imports": ["error", { patterns: general }],
        "no-restricted-globals": "off",
        "no-restricted-properties": "off",
      },
    },
  ];
}

/**
 * Flat ESLint config stopping shared packages from importing apps or features.
 * Add this after the base or react-library preset in each package.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const packageBoundaries = [
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features", "@/features/*", "@/features/*/**", "**/features/**"],
              message: "Shared packages must not import feature code (AGENTS.md section 4).",
            },
            {
              group: [
                "@gigshive/web",
                "@gigshive/web/*",
                "@gigshive/admin",
                "@gigshive/admin/*",
                "**/apps/**",
              ],
              message: "Shared packages must not import app code (AGENTS.md section 4).",
            },
          ],
        },
      ],
    },
  },
];
