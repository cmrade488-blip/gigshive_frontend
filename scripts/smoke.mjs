/**
 * Production route smoke test (review fix A1).
 *
 * Requires a completed web build (the root `smoke` script builds first). Starts
 * `next start` on a free localhost port, checks every siteRoute that has a
 * page, the two public detail pages and an unknown path, then stops the
 * server. No extra dependencies: Node's net, fetch and child_process are enough.
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const webRoot = join(repoRoot, "apps", "web");
const routesSourcePath = join(repoRoot, "packages", "shared", "src", "routes.ts");
const nextBin = join(webRoot, "node_modules", "next", "dist", "bin", "next");

function fail(message) {
  throw new Error(`smoke: ${message}`);
}

function siteRouteValues() {
  const source = readFileSync(routesSourcePath, "utf8");
  const block = /export const siteRoutes = \{([\s\S]*?)\n\} as const;/.exec(source);
  if (!block?.[1]) {
    fail("could not read siteRoutes from packages/shared/src/routes.ts");
  }

  const values = [...block[1].matchAll(/:\s*"([^"]+)"/g)].map((match) => match[1]);
  if (values.length === 0) {
    fail("siteRoutes contains no route values");
  }
  return values;
}

function pageExists(route) {
  const routePath = route === "/" ? "" : route.replace(/\/+$/, "");
  const appDir = join(webRoot, "src", "app", routePath);
  return existsSync(join(appDir, "page.tsx")) || existsSync(join(appDir, "page.js"));
}

async function freePort() {
  return await new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close(() => reject(new Error("could not allocate a port")));
        return;
      }
      const { port } = address;
      server.close(() => resolve(port));
    });
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function startServer(port) {
  if (!existsSync(nextBin)) {
    fail("Next.js is not installed; run pnpm install first");
  }
  if (!existsSync(join(webRoot, ".next", "BUILD_ID"))) {
    fail("no web build found; run pnpm --filter @gigshive/web build first");
  }

  const child = spawn(process.execPath, [nextBin, "start", "-H", "127.0.0.1", "-p", String(port)], {
    cwd: webRoot,
    env: { ...process.env, NODE_ENV: "production" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let output = "";
  child.stdout?.on("data", (chunk) => {
    output += String(chunk);
  });
  child.stderr?.on("data", (chunk) => {
    output += String(chunk);
  });

  return { child, output: () => output };
}

async function waitUntilReady(baseUrl, child, output) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (child.exitCode !== null) {
      fail(`next start exited before serving routes:\n${output()}`);
    }
    try {
      const response = await fetch(baseUrl, { signal: AbortSignal.timeout(2000) });
      await response.arrayBuffer();
      if (response.ok) {
        return;
      }
    } catch {
      // Server is not listening yet.
    }
    await delay(500);
  }
  fail(`next start did not become ready:\n${output()}`);
}

async function checkRoute(baseUrl, route, expectedStatus, requiredText) {
  let status = 0;
  let body = "";
  try {
    const response = await fetch(`${baseUrl}${route}`, {
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
    });
    status = response.status;
    body = await response.text();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    fail(`${route}: request failed (${message})`);
  }

  if (status !== expectedStatus) {
    fail(`${route}: expected HTTP ${expectedStatus}, got HTTP ${status}`);
  }

  if (requiredText && !body.includes(requiredText)) {
    fail(`${route}: expected the gated sample route to render the not-found screen`);
  }

  // Next streams its error boundary when a page throws. The flight payload
  // carries a real digest then; `$undefined` is the normal successful value and
  // NEXT_HTTP_ERROR_FALLBACK is a deliberate not-found screen (including A4's
  // gated sample routes), so neither counts as a thrown page.
  const realErrorDigest = /E\{\\"digest\\":\\"(?!\$undefined|NEXT_HTTP_ERROR_FALLBACK;)[^"]+\\"/;
  if (realErrorDigest.test(body)) {
    fail(`${route}: rendered a server error (Next error digest found)`);
  }

  console.log(`ok  ${route} -> ${status}`);
}

async function stopServer(child) {
  if (!child || child.exitCode !== null) {
    return;
  }

  const exited = new Promise((resolve) => child.once("exit", resolve));
  child.kill("SIGTERM");
  const killTimer = setTimeout(() => child.kill("SIGKILL"), 5000);
  await exited;
  clearTimeout(killTimer);
}

async function main() {
  const routes = [
    ...siteRouteValues().filter(pageExists),
    "/jobs/sample-clinic-site",
    "/workers/sample-amaka",
  ];
  const sampleDataEnabled = process.env.NEXT_PUBLIC_SHOW_SAMPLE_DATA === "true";
  // A4: these list routes are sample data until the public APIs exist. With
  // the default production config they call notFound() and return 404.
  // The detail routes also call notFound(), but Next streams their not-found
  // screen with HTTP 200; the digest check below still rejects a real throw.
  const sampleRoutes = new Set(["/jobs", "/workers"]);
  const sampleDetailRoutes = new Set(["/jobs/sample-clinic-site", "/workers/sample-amaka"]);
  const port = await freePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const { child, output } = startServer(port);

  try {
    await waitUntilReady(baseUrl, child, output);
    for (const route of routes) {
      const gated = !sampleDataEnabled;
      const expectedStatus = gated && sampleRoutes.has(route) ? 404 : 200;
      // Next streams notFound() on detail routes with 200, so assert the
      // deliberate not-found payload rather than only the status code.
      const requiredText =
        gated && sampleDetailRoutes.has(route) ? "NEXT_HTTP_ERROR_FALLBACK;404" : undefined;
      await checkRoute(baseUrl, route, expectedStatus, requiredText);
    }
    await checkRoute(baseUrl, "/__smoke_unknown__", 404);
    console.log(`smoke: checked ${routes.length} pages plus one 404 route`);
  } finally {
    await stopServer(child);
  }
}

await main();
