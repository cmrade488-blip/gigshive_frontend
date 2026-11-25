import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  findFeatureBarrelCycles,
  globalViolationFor,
  parseImports,
  violationFor,
} from "./architecture-rules";

const SKIP_DIRS = new Set(["node_modules", ".next", "dist", "build", "coverage"]);

function findRepoRoot(start: string): string {
  let current = start;

  while (true) {
    if (existsSync(join(current, "pnpm-workspace.yaml"))) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) {
      throw new Error("Could not find the repository root from the current directory.");
    }
    current = parent;
  }
}

function collectSourceFiles(directory: string, files: string[]): void {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        collectSourceFiles(fullPath, files);
      }
      continue;
    }

    if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
}

function collectRepositorySources(root: string): Record<string, string> {
  const files: string[] = [];

  for (const area of ["apps", "packages"]) {
    const areaPath = join(root, area);
    if (!existsSync(areaPath)) {
      continue;
    }

    for (const entry of readdirSync(areaPath, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }
      const srcPath = join(areaPath, entry.name, "src");
      if (existsSync(srcPath)) {
        collectSourceFiles(srcPath, files);
      }
    }
  }

  return files.reduce<Record<string, string>>((collected, file) => {
    const relativePath = file.slice(root.length + 1).replace(/\\/g, "/");
    collected[relativePath] = readFileSync(file, "utf8");
    return collected;
  }, {});
}

const sources = collectRepositorySources(findRepoRoot(process.cwd()));

describe("parseImports", () => {
  it("reads named, bare, re-exported and dynamic specifiers", () => {
    const source = `
      import { A } from "@/features/site";
      import "@/features/site/styles.css";
      export * from "@/features/site";
      const loaded = import("@/features/jobs");
      const required = require("./local");
    `;

    expect(parseImports(source)).toEqual([
      "./local",
      "@/features/jobs",
      "@/features/site",
      "@/features/site/styles.css",
    ]);
  });

  it("ignores import-like text in comments and strings", () => {
    const source = `
      // import { A } from "@/features/jobs/components/Thing";
      /* export { B } from "@/features/jobs/components/Other"; */
      const text = 'import { C } from "@/features/jobs/components/String";';
    `;

    expect(parseImports(source)).toEqual([]);
  });
});

describe("violationFor", () => {
  it("allows a feature index import from a route", () => {
    expect(violationFor("apps/web/src/app/page.tsx", "@/features/site")).toBeNull();
  });

  it("rejects deep imports into another feature", () => {
    expect(violationFor("apps/web/src/app/page.tsx", "@/features/jobs/api/jobs")).toContain(
      "index.ts",
    );
  });

  it("allows only the documented narrow system entry from a route", () => {
    expect(violationFor("apps/web/src/app/layout.tsx", "@/features/site/system")).toBeNull();
    expect(
      violationFor("apps/web/src/features/site/screens/HomeScreen.tsx", "@/features/site/system"),
    ).toContain("index.ts");
    expect(violationFor("apps/web/src/app/layout.tsx", "@/features/site/system/extra")).toContain(
      "index.ts",
    );
    expect(violationFor("apps/web/src/app/page.tsx", "@/features/jobs/system")).toContain(
      "index.ts",
    );
  });

  it("rejects route imports outside the app folder", () => {
    expect(violationFor("apps/web/src/features/site/screens/Home.tsx", "@/app/page")).toContain(
      "entry points",
    );
  });

  it("allows route imports inside the app folder", () => {
    expect(violationFor("apps/web/src/app/error.tsx", "@/app/not-found")).toBeNull();
  });

  it("restricts the API client to api folders and lib", () => {
    expect(
      violationFor("apps/web/src/features/site/screens/Home.tsx", "@gigshive/api-client"),
    ).toContain("API client");
    expect(
      violationFor("apps/web/src/features/jobs/api/use-jobs.ts", "@gigshive/api-client"),
    ).toBeNull();
    expect(violationFor("apps/web/src/lib/providers.tsx", "@gigshive/api-client")).toBeNull();
    // Shared test infrastructure is keyed to the generated contract too.
    expect(violationFor("packages/testing/src/fixtures.ts", "@gigshive/api-client")).toBeNull();
  });

  it("keeps web and admin code separate", () => {
    expect(violationFor("apps/web/src/app/page.tsx", "@gigshive/admin")).toContain("apps/web");
    expect(violationFor("apps/web/src/app/page.tsx", "@/features/admin-ops")).toContain("apps/web");
    expect(violationFor("apps/admin/src/app/page.tsx", "@gigshive/web")).toContain("apps/admin");
  });

  it("stops packages importing apps or features", () => {
    expect(violationFor("packages/ui/src/components/Card.tsx", "@/features/site")).toContain(
      "feature code",
    );
    expect(violationFor("packages/ui/src/components/Card.tsx", "@gigshive/web")).toContain(
      "app code",
    );
    expect(
      violationFor("packages/ui/src/components/MoneyDisplay.tsx", "@gigshive/shared/money"),
    ).toBeNull();
  });

  it("normalises test-runner relative paths", () => {
    expect(violationFor("../../apps/web/src/app/page.tsx", "@/features/jobs/api/jobs")).toContain(
      "index.ts",
    );
  });
});

describe("globalViolationFor", () => {
  it("rejects direct fetch calls in app code", () => {
    expect(
      globalViolationFor("apps/web/src/features/site/state/use-jobs.ts", "fetch('/api');"),
    ).toContain("fetch");
    expect(
      globalViolationFor(
        "apps/web/src/features/site/state/use-jobs.ts",
        "globalThis.fetch('/api');",
      ),
    ).toContain("fetch");
  });

  it("allows fetch in api folders, lib and packages", () => {
    expect(
      globalViolationFor("apps/web/src/features/jobs/api/client.ts", "fetch('/api');"),
    ).toBeNull();
    expect(globalViolationFor("apps/web/src/lib/session.ts", "fetch('/api');")).toBeNull();
    expect(globalViolationFor("packages/api-client/src/client.ts", "fetch('/api');")).toBeNull();
  });

  it("ignores fetch in comments and strings", () => {
    const source = "// fetch('/api');\nconst text = 'fetch(';";
    expect(globalViolationFor("apps/web/src/features/site/screens/Home.tsx", source)).toBeNull();
  });
});

describe("repository import graph", () => {
  it("scans app and package sources", () => {
    expect(Object.keys(sources).length).toBeGreaterThan(0);
  });

  for (const [path, source] of Object.entries(sources)) {
    it(`${path} respects import boundaries`, () => {
      const violations: string[] = [];

      for (const specifier of parseImports(source)) {
        const violation = violationFor(path, specifier);
        if (violation) {
          violations.push(`${specifier}: ${violation}`);
        }
      }

      const globalViolation = globalViolationFor(path, source);
      if (globalViolation) {
        violations.push(globalViolation);
      }

      expect(violations).toEqual([]);
    });
  }
});

describe("feature barrel cycle guard", () => {
  it("detects the deliberate site <-> profiles barrel cycle pattern", () => {
    const cycles = findFeatureBarrelCycles({
      "apps/web/src/features/site/index.ts": `export * from "./components/HomeWorkers";`,
      "apps/web/src/features/site/components/HomeWorkers.tsx": `import { WorkersCard } from "@/features/profiles";`,
      "apps/web/src/features/profiles/index.ts": `export * from "./components/WorkersCard";`,
      "apps/web/src/features/profiles/components/WorkersCard.tsx": `import { siteRoutes } from "../../site";`,
    });

    expect(cycles).toEqual([["web:profiles", "web:site"]]);
  });

  it("detects a simple two-barrel cycle", () => {
    const cycles = findFeatureBarrelCycles({
      "apps/admin/src/features/alpha/index.ts": `export * from "@/features/beta";`,
      "apps/admin/src/features/beta/index.ts": `export * from "@/features/alpha";`,
    });

    expect(cycles).toEqual([["admin:alpha", "admin:beta"]]);
  });

  it("finds no cycles in the repository sources", () => {
    expect(findFeatureBarrelCycles(sources)).toEqual([]);
  });
});
