/*
 * 应用级浏览器回归测试。
 *
 * 同时覆盖本地 HTTP 与直接打开 index.html 两种运行方式，确保前端拆分不会
 * 破坏项目最重要的离线兼容目标。
 */
"use strict";

const fs = require("fs");
const http = require("http");
const Module = require("module");
const os = require("os");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.join(__dirname, "..");

function loadPlaywright() {
  try {
    return require("playwright");
  } catch (_) {
    const bundled = path.join(
      os.homedir(),
      ".cache",
      "codex-runtimes",
      "codex-primary-runtime",
      "dependencies",
      "node",
      "node_modules"
    );
    process.env.NODE_PATH = [process.env.NODE_PATH, bundled, path.join(bundled, ".pnpm", "node_modules")]
      .filter(Boolean)
      .join(path.delimiter);
    Module._initPaths();
    return require("playwright");
  }
}

function contentType(file) {
  return {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".woff2": "font/woff2",
  }[path.extname(file).toLowerCase()] || "application/octet-stream";
}

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((request, response) => {
      const pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
      if (pathname === "/favicon.ico") {
        response.writeHead(204).end();
        return;
      }
      const requested = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
      const file = path.resolve(root, requested);
      const relative = path.relative(root, file);
      if (relative.startsWith("..") || path.isAbsolute(relative)) {
        response.writeHead(403).end("Forbidden");
        return;
      }
      fs.readFile(file, (error, data) => {
        if (error) {
          response.writeHead(error.code === "ENOENT" ? 404 : 500).end("Not found");
          return;
        }
        response.writeHead(200, {
          "Content-Type": contentType(file),
          "Cache-Control": "no-store",
        });
        response.end(data);
      });
    });
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

function browserExecutable(chromium) {
  const candidates = [
    process.env.DEEP_DIVE_BROWSER_PATH,
    chromium.executablePath(),
    process.platform === "win32" ? "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" : "",
    process.platform === "win32" ? "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe" : "",
    process.platform === "win32" ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" : "",
  ].filter(Boolean);
  return candidates.find(candidate => fs.existsSync(candidate)) || "";
}

async function exerciseApp(browser, baseUrl, label) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", error => errors.push(error.message));
  const waitForHash = hash => page.waitForFunction(expected => window.location.hash === expected, hash);

  try {
    await page.goto(`${baseUrl}#/map`, { waitUntil: "load" });
    const firstDomainToggle = page.locator("[data-domain-toggle]").first();
    await firstDomainToggle.click();
    if (await firstDomainToggle.getAttribute("aria-expanded") !== "true") {
      throw new Error(`${label}：大区节点列表无法展开`);
    }
    const zoomBefore = await page.locator("#map-zoom-level").textContent();
    await page.locator("#map-zoom-in").click();
    const zoomAfter = await page.locator("#map-zoom-level").textContent();
    if (zoomBefore === zoomAfter) throw new Error(`${label}：地图缩放控件没有生效`);
    await page.keyboard.press("Shift+Comma");
    const zoomAfterKeyboard = await page.locator("#map-zoom-level").textContent();
    if (zoomAfterKeyboard === zoomAfter) throw new Error(`${label}：地图键盘缩放没有生效`);

    await page.locator("#search").fill("神经网络");
    await page.locator('#search-results [data-id="neural-network"]').click();
    if (!page.url().endsWith("#/map")) throw new Error(`${label}：普通节点选择改变了 URL`);
    await page.locator("#detail h2").filter({ hasText: "神经网络" }).waitFor();

    await page.locator('[data-dd="neural-network"]').click();
    await waitForHash("#/concept/neural-network");
    await page.locator("#deepdive h1").filter({ hasText: "神经网络" }).waitFor();
    await page.locator('[data-learn-node="neural-network"]').click();
    if (await page.locator('[data-learn-node="neural-network"]').getAttribute("aria-pressed") !== "true") {
      throw new Error(`${label}：学习进度按钮没有更新`);
    }
    await page.goBack();
    await waitForHash("#/map");
    await page.locator("#detail h2").filter({ hasText: "神经网络" }).waitFor();

    await page.goto(`${baseUrl}#/software`, { waitUntil: "load" });
    await page.locator('[data-sw="chatgpt"]').first().click();
    await waitForHash("#/software/chatgpt");
    await page.locator("#detail h2").filter({ hasText: "ChatGPT" }).waitFor();

    await page.goto(`${baseUrl}#/library`, { waitUntil: "load" });
    await page.locator("#library-view .lib-grid [data-library-item]").first().click();
    if (!/#\/library\/[^/]+$/.test(page.url())) throw new Error(`${label}：资料详情没有独立 URL`);
    await page.locator("#detail:not(.closed)").waitFor();

    if (errors.length) throw new Error(`${label}：浏览器错误：${errors.join(" | ")}`);
  } finally {
    await page.close();
  }
}

async function main() {
  const { chromium } = loadPlaywright();
  const server = await startServer();
  const executablePath = browserExecutable(chromium);
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  });
  try {
    const address = server.address();
    await exerciseApp(browser, `http://127.0.0.1:${address.port}/`, "HTTP");
    await exerciseApp(browser, pathToFileURL(path.join(root, "index.html")).href, "file://");
    console.log("✓ 应用浏览器回归测试通过（HTTP + file://）");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => {
  console.error(`✗ ${error.message}`);
  process.exitCode = 1;
});
