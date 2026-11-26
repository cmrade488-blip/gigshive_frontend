/**
 * 360 px responsive regression check (review fix B1).
 *
 * Uses a locally installed Chrome/Edge through the DevTools protocol, so no
 * new dependency is needed. Starts `next dev` on a free port, emulates a
 * 360x800 viewport, and fails if any checked route scrolls horizontally.
 * Run explicitly with `pnpm run check:360`; it is not part of `pnpm run check`
 * because CI runners do not have a browser installed.
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const webRoot = join(repoRoot, "apps", "web");
const nextBin = join(webRoot, "node_modules", "next", "dist", "bin", "next");
const routes = [
  "/",
  "/login",
  "/forgot-password",
  "/reset-password",
  "/register",
  "/verify-email",
  "/jobs",
  "/jobs/sample-clinic-site",
  "/workers",
  "/workers/sample-amaka",
  "/how-it-works",
  "/fees",
  "/server-error",
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function fail(message) {
  throw new Error(`check:360: ${message}`);
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
      server.close(() => resolve(address.port));
    });
  });
}

function chromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].filter(Boolean);
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) {
    fail("no Chrome or Edge found; set CHROME_PATH to a browser executable");
  }
  return found;
}

function killProcessTree(child) {
  if (!child?.pid) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    return;
  }
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    child.kill("SIGTERM");
  }
}

function removeProfileDir() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      rmSync(profileDir, { recursive: true, force: true });
      return;
    } catch {
      // Chrome can briefly hold files in its profile after exit.
    }
  }
  console.warn(`check:360: could not remove temporary profile ${profileDir}`);
}

async function waitForUrl(url, timeoutMs, label) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await delay(500);
  }
  fail(`${label} did not become ready at ${url}`);
}

const devPort = await freePort();
const cdpPort = await freePort();
const profileDir = mkdtempSync(join(tmpdir(), "gh-360-"));
let devServer;
let browser;
let ws;

try {
  spawnSync(process.execPath, [join(repoRoot, "scripts", "copy-brand-assets.mjs"), "web"], {
    cwd: repoRoot,
    stdio: "ignore",
  });
  devServer = spawn(process.execPath, [nextBin, "dev", "-p", String(devPort)], {
    cwd: webRoot,
    stdio: "ignore",
    detached: process.platform !== "win32",
  });
  await waitForUrl(`http://127.0.0.1:${devPort}/jobs`, 90_000, "next dev");

  browser = spawn(
    chromePath(),
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      `--remote-debugging-port=${cdpPort}`,
      `--user-data-dir=${profileDir}`,
      "--window-size=360,800",
      "about:blank",
    ],
    { stdio: "ignore", detached: process.platform !== "win32" },
  );

  let targets;
  for (let i = 0; i < 80; i += 1) {
    try {
      targets = await (await fetch(`http://127.0.0.1:${cdpPort}/json/list`)).json();
      if (targets.some((target) => target.type === "page" && target.webSocketDebuggerUrl)) break;
    } catch {
      // Chrome is still starting.
    }
    await delay(250);
  }
  const page = targets?.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
  if (!page) fail("Chrome DevTools page target did not start");

  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  const pending = new Map();
  let nextId = 1;
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    const resolve = pending.get(message.id);
    if (!resolve) return;
    pending.delete(message.id);
    resolve(message);
  };

  function send(method, params = {}) {
    const id = nextId;
    nextId += 1;
    return new Promise((resolve) => {
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 360,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false,
  });

  const expression = `JSON.stringify({
    innerWidth: window.innerWidth,
    docWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth
  })`;

  let failed = false;
  for (const route of routes) {
    await send("Page.navigate", { url: `http://127.0.0.1:${devPort}${route}` });
    for (let i = 0; i < 40; i += 1) {
      const state = await send("Runtime.evaluate", { expression: "document.readyState" });
      if (state.result?.result?.value === "complete") break;
      await delay(250);
    }
    const response = await send("Runtime.evaluate", { expression, returnByValue: true });
    const measured = JSON.parse(response.result.result.value);
    const ok =
      measured.docWidth <= measured.innerWidth && measured.bodyWidth <= measured.innerWidth;
    if (!ok) failed = true;
    console.log(`${ok ? "ok  " : "FAIL"} ${route} ${JSON.stringify(measured)}`);
  }
  if (failed) fail("horizontal overflow at 360 px");
  console.log(`check:360: ${routes.length} routes have no horizontal overflow at 360 px`);
} finally {
  ws?.close();
  killProcessTree(browser);
  killProcessTree(devServer);
  removeProfileDir();
}
