import { posix } from "node:path";

import * as ts from "typescript";

function stripComments(source: string): string {
  const chars = source.split("");
  let quote: "'" | '"' | null = null;
  let index = 0;

  while (index < chars.length) {
    const current = chars[index];
    const next = chars[index + 1];

    if (quote !== null) {
      if (current === "\\") {
        index += 2;
        continue;
      }
      if (current === quote) {
        quote = null;
      }
      index += 1;
      continue;
    }

    if (current === "'" || current === '"') {
      quote = current;
      index += 1;
      continue;
    }

    if (current === "/" && next === "/") {
      while (index < chars.length && chars[index] !== "\n") {
        chars[index] = " ";
        index += 1;
      }
      continue;
    }

    if (current === "/" && next === "*") {
      chars[index] = " ";
      chars[index + 1] = " ";
      index += 2;
      while (index < chars.length && !(chars[index] === "*" && chars[index + 1] === "/")) {
        if (chars[index] !== "\n") {
          chars[index] = " ";
        }
        index += 1;
      }
      if (index < chars.length) {
        chars[index] = " ";
        chars[index + 1] = " ";
        index += 2;
      }
      continue;
    }

    index += 1;
  }

  return chars.join("");
}

function stripStrings(source: string): string {
  const chars = source.split("");
  let quote: "'" | '"' | "`" | null = null;
  let index = 0;

  while (index < chars.length) {
    const current = chars[index];

    if (quote === null) {
      if (current === "'" || current === '"' || current === "`") {
        quote = current;
        chars[index] = " ";
      }
      index += 1;
      continue;
    }

    if (current === "\\") {
      chars[index] = " ";
      if (index + 1 < chars.length) {
        chars[index + 1] = " ";
      }
      index += 2;
      continue;
    }

    if (current === quote) {
      quote = null;
      chars[index] = " ";
      index += 1;
      continue;
    }

    if (current !== "\n") {
      chars[index] = " ";
    }
    index += 1;
  }

  return chars.join("");
}

function normaliseFilePath(filePath: string): string {
  return filePath
    .replace(/\\/g, "/")
    .replace(/^(?:\.\.\/)+/, "")
    .replace(/^\.\//, "");
}

function appForFile(filePath: string): "web" | "admin" | null {
  const match = /^apps\/(web|admin)\/src\//.exec(filePath);
  const app = match?.[1];
  return app === "web" || app === "admin" ? app : null;
}

function isAppRouteFile(filePath: string): boolean {
  return /^apps\/[^/]+\/src\/app\//.test(filePath);
}

function isApiAllowedFile(filePath: string): boolean {
  return (
    // Shared packages (notably @gigshive/testing) build on the generated types.
    filePath.startsWith("packages/") ||
    /^apps\/[^/]+\/src\/features\/[^/]+\/api\//.test(filePath) ||
    /^apps\/[^/]+\/src\/lib\//.test(filePath)
  );
}

function isApiClientSpecifier(specifier: string): boolean {
  return specifier === "@gigshive/api-client" || specifier.startsWith("@gigshive/api-client/");
}

function isDeepFeatureImport(specifier: string): boolean {
  return specifier.startsWith("@/features/") && specifier.split("/").length > 3;
}

function isRouteImport(specifier: string): boolean {
  return specifier.startsWith("@/app/") || /(?:^|\/)src\/app\//.test(specifier);
}

function crossAppViolation(app: "web" | "admin" | null, specifier: string): string | null {
  if (app === "web") {
    const forbidden =
      specifier === "@gigshive/admin" ||
      specifier.startsWith("@gigshive/admin/") ||
      specifier.includes("apps/admin/") ||
      specifier.includes("/admin/src/") ||
      specifier === "@/features/admin-ops" ||
      specifier.startsWith("@/features/admin-ops/");
    return forbidden ? "apps/web must not import admin code or restricted console types." : null;
  }

  if (app === "admin") {
    const forbidden =
      specifier === "@gigshive/web" ||
      specifier.startsWith("@gigshive/web/") ||
      specifier.includes("apps/web/") ||
      specifier.includes("/web/src/");
    return forbidden ? "apps/admin must not import web code." : null;
  }

  return null;
}

function packageViolation(filePath: string, specifier: string): string | null {
  if (!filePath.startsWith("packages/")) {
    return null;
  }

  const forbiddenFeature =
    specifier === "@/features" ||
    specifier.startsWith("@/features/") ||
    /(?:^|\/)features\//.test(specifier);
  if (forbiddenFeature) {
    return "Shared packages must not import feature code.";
  }

  const forbiddenApp =
    specifier === "@gigshive/web" ||
    specifier.startsWith("@gigshive/web/") ||
    specifier === "@gigshive/admin" ||
    specifier.startsWith("@gigshive/admin/") ||
    /(?:^|\/)apps\//.test(specifier);
  return forbiddenApp ? "Shared packages must not import app code." : null;
}

/** Extract static, bare, re-exported and dynamic module specifiers from source text. */
export function parseImports(source: string): string[] {
  const sourceFile = ts.createSourceFile(
    "source.tsx",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const specifiers = new Set<string>();

  function visit(node: ts.Node): void {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier;
      if (moduleSpecifier && ts.isStringLiteral(moduleSpecifier)) {
        specifiers.add(moduleSpecifier.text);
      }
    }

    if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      ts.isStringLiteral(node.moduleReference.expression)
    ) {
      specifiers.add(node.moduleReference.expression.text);
    }

    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      const isDynamicImport = callee.kind === ts.SyntaxKind.ImportKeyword;
      const isRequire = ts.isIdentifier(callee) && callee.text === "require";
      const argument = node.arguments[0];
      if ((isDynamicImport || isRequire) && argument && ts.isStringLiteral(argument)) {
        specifiers.add(argument.text);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return [...specifiers].sort();
}

function featureForPath(filePath: string): string | null {
  const match = /^apps\/([^/]+)\/src\/features\/([^/]+)(?:\/|$)/.exec(normaliseFilePath(filePath));
  if (!match?.[1] || !match[2]) {
    return null;
  }
  return `${match[1]}:${match[2]}`;
}

function featureForSpecifier(fromPath: string, specifier: string): string | null {
  const file = normaliseFilePath(fromPath);
  const app = /^apps\/([^/]+)\//.exec(file)?.[1];
  if (!app) {
    return null;
  }

  if (specifier.startsWith("@/features/")) {
    const feature = specifier.slice("@/features/".length).split("/")[0];
    return feature ? `${app}:${feature}` : null;
  }

  if (specifier.startsWith(".")) {
    const target = posix.normalize(posix.join(posix.dirname(file), specifier));
    return featureForPath(target);
  }

  return null;
}

/**
 * Find cycles between feature barrels. Edges are aggregated per app/feature so
 * a deep import back into another feature's index is caught too (the PR #30
 * site <-> profiles failure). Returns canonical node cycles, e.g.
 * ["web:profiles", "web:site"] for profiles -> site -> profiles.
 */
export function findFeatureBarrelCycles(sources: Record<string, string>): string[][] {
  const nodes = new Set<string>();
  const edges = new Map<string, Set<string>>();

  for (const path of Object.keys(sources).sort()) {
    const from = featureForPath(path);
    if (from) {
      nodes.add(from);
    }
  }

  for (const path of Object.keys(sources).sort()) {
    const from = featureForPath(path);
    if (!from) {
      continue;
    }
    const targets = edges.get(from) ?? new Set<string>();
    for (const specifier of parseImports(sources[path] ?? "")) {
      const to = featureForSpecifier(path, specifier);
      if (to && to !== from && nodes.has(to)) {
        targets.add(to);
      }
    }
    edges.set(from, targets);
  }

  const cycles = new Map<string, string[]>();
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const stack: string[] = [];

  function recordCycle(startIndex: number): void {
    const cycle = stack.slice(startIndex);
    const smallest = [...cycle].sort()[0];
    if (!smallest) {
      return;
    }
    const pivot = cycle.indexOf(smallest);
    const canonical = [...cycle.slice(pivot), ...cycle.slice(0, pivot)];
    cycles.set(canonical.join(" -> "), canonical);
  }

  function visit(node: string): void {
    visiting.add(node);
    stack.push(node);

    for (const next of [...(edges.get(node) ?? [])].sort()) {
      if (visiting.has(next)) {
        recordCycle(stack.indexOf(next));
        continue;
      }
      if (!visited.has(next)) {
        visit(next);
      }
    }

    stack.pop();
    visiting.delete(node);
    visited.add(node);
  }

  for (const node of [...nodes].sort()) {
    if (!visited.has(node)) {
      visit(node);
    }
  }

  return [...cycles.values()].sort((a, b) => a.join(" -> ").localeCompare(b.join(" -> ")));
}

/** Return the boundary rule message for one import, or null when the import is allowed. */
export function violationFor(filePath: string, specifier: string): string | null {
  const file = normaliseFilePath(filePath);

  if (isDeepFeatureImport(specifier)) {
    return "Import a feature only through its index.ts.";
  }

  if (isRouteImport(specifier) && !isAppRouteFile(file)) {
    return "Routes are entry points; screens and components must not import them.";
  }

  const crossApp = crossAppViolation(appForFile(file), specifier);
  if (crossApp) {
    return crossApp;
  }

  const packageRule = packageViolation(file, specifier);
  if (packageRule) {
    return packageRule;
  }

  if (isApiClientSpecifier(specifier) && !isApiAllowedFile(file)) {
    return "Only a feature api folder or src/lib may call the API client.";
  }

  return null;
}

/** Return the boundary rule message for a direct fetch call, or null when allowed. */
export function globalViolationFor(filePath: string, source: string): string | null {
  const file = normaliseFilePath(filePath);
  if (!file.startsWith("apps/") || isApiAllowedFile(file)) {
    return null;
  }

  const code = stripStrings(stripComments(source));
  return /\bfetch\s*\(/.test(code)
    ? "Do not call fetch directly; use the feature api folder."
    : null;
}
