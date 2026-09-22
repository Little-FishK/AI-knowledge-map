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
const { PROJECT_ROOT } = require("../../tools/shared/project-root");

const root = PROJECT_ROOT;

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
    await page.locator('#onboarding [data-skip]').click();
    // Verify the textured node renderer actually starts in both modes; a
    // removed/failed decorative canvas must not pass as a working map.
    await page.waitForFunction(() => {
      const canvas = document.getElementById('node-ring-motion');
      const cy = document.getElementById('cy')?._cyreg?.cy;
      return canvas && canvas.width > 300 && cy && cy.nodes().length === 130
        && cy.nodes().every(node => !node.backgrounding());
    });
    if (!/图谱数据|Graph data/.test(await page.locator('#meta-ver').textContent())) {
      throw new Error(`${label}：图谱数据版本缺少明确标注`);
    }
    await page.locator("#controls-toggle").click();
    if (await page.locator("#controls-toggle").getAttribute("aria-expanded") !== "false") {
      throw new Error(`${label}：左侧栏无法收起`);
    }
    if (!await page.locator("#app").evaluate(element => element.classList.contains("controls-collapsed"))) {
      throw new Error(`${label}：左侧栏收起状态没有写入页面`);
    }
    await page.locator("#controls-toggle").click();
    if (await page.locator("#controls-toggle").getAttribute("aria-expanded") !== "true") {
      throw new Error(`${label}：左侧栏无法重新展开`);
    }

    await page.locator("#btn-settings").click();
    await page.locator("#settings-dialog").waitFor();
    if (await page.locator("#btn-settings").getAttribute("aria-expanded") !== "true") {
      throw new Error(`${label}：设置面板没有正确打开`);
    }
    if (await page.locator("html").getAttribute("lang") !== "zh-Hans") {
      throw new Error(`${label}：页面语言代码没有初始化为 zh-Hans`);
    }
    const languageSelect = page.locator("#settings-language-select");
    if (await languageSelect.inputValue() !== "zh-Hans") {
      throw new Error(`${label}：设置面板没有显示当前语言`);
    }
    if (await languageSelect.locator("option").count() !== 2
        || await languageSelect.locator('option[value="en"]').isDisabled()) {
      throw new Error(`${label}：可用语言没有被正确列出`);
    }
    await languageSelect.selectOption("en");
    await page.waitForFunction(() => document.documentElement.lang === "en");
    if (await page.locator('[data-mode="graph"]').textContent() !== "Node Map") {
      throw new Error(`${label}：切换英文后界面没有原地更新`);
    }
    if (await page.locator("#domain-list .domain-label").first().textContent() !== "Foundations / Shared") {
      throw new Error(`${label}：英文图谱大区内容没有加载`);
    }
    if (!String(await page.locator("#edge-list .chk").first().textContent()).includes("Is a")) {
      throw new Error(`${label}：英文关系类型内容没有加载`);
    }
    if (String(await page.locator('[data-learning-goto="llm"]').textContent()).trim() !== "Large Language Model (LLM)") {
      throw new Error(`${label}：已发布的英文核心节点没有进入学习列表`);
    }
    if (String(await page.locator('[data-learning-goto="fine-tuning"]').textContent()).trim() !== "Fine-tuning") {
      throw new Error(`${label}：阶段 7 的英文核心节点没有进入学习列表`);
    }
    if (String(await page.locator('[data-learning-goto="rag"]').textContent()).trim() !== "Retrieval-Augmented Generation (RAG)") {
      throw new Error(`${label}：阶段 8 的英文核心节点没有进入学习列表`);
    }
    if (String(await page.locator('[data-learning-goto="tool-calling"]').textContent()).trim() !== "Tool Calling") {
      throw new Error(`${label}：阶段 9 的英文核心节点没有进入学习列表`);
    }
    if (String(await page.locator('[data-learning-goto="diffusion"]').textContent()).trim() !== "Diffusion Models") {
      throw new Error(`${label}：阶段 10 的英文核心节点没有进入学习列表`);
    }
    if (String(await page.locator('[data-learning-goto="supervised-learning"]').textContent()).trim() !== "Supervised Learning") {
      throw new Error(`${label}：阶段 11 的英文非核心节点没有进入学习列表`);
    }
    if (String(await page.locator('[data-learning-goto="kernel-methods"]').textContent()).trim() !== "Kernel Methods and SVMs") {
      throw new Error(`${label}：阶段 12 的英文基础节点没有进入学习列表`);
    }
    if (String(await page.locator('[data-learning-goto="clip"]').textContent()).trim() !== "CLIP (Contrastive Language–Image Pre-training)") {
      throw new Error(`${label}：完整架构阶段的英文节点没有进入学习列表`);
    }
    if (String(await page.locator('[data-learning-goto="distillation"]').textContent()).trim() !== "Knowledge Distillation") {
      throw new Error(`${label}：模型训练阶段的英文节点没有进入学习列表`);
    }
    if (String(await page.locator('[data-learning-goto="model-families"]').textContent()).trim() !== "Major Model Families") {
      throw new Error(`${label}：基础模型训练阶段没有完成英文覆盖`);
    }
    if (String(await page.locator('[data-learning-goto="sampling-params"]').textContent()).trim() !== "Sampling and Decoding Parameters") {
      throw new Error(`${label}：推理与上下文阶段的新英文节点没有进入学习列表`);
    }
    if (String(await page.locator('[data-learning-goto="inference-optimization"]').textContent()).trim() !== "LLM Inference Optimization") {
      throw new Error(`${label}：推理与上下文阶段的连续英文覆盖没有扩展到第 15 个节点`);
    }
    if (String(await page.locator('[data-learning-goto="model-selection"]').textContent()).trim() !== "Model Selection and Cost") {
      throw new Error(`${label}：推理与上下文阶段没有完成英文覆盖`);
    }
    if (String(await page.locator('[data-learning-goto="observability"]').textContent()).trim() !== "LLM Observability and Tracing") {
      throw new Error(`${label}：检索与生产阶段的连续英文覆盖没有扩展到第 11 个节点`);
    }
    if (String(await page.locator('[data-learning-goto="guardrails"]').textContent()).trim() !== "AI Guardrails") {
      throw new Error(`${label}：检索与应用工程阶段没有完成英文覆盖`);
    }
    if (String(await page.locator('[data-learning-goto="planning"]').textContent()).trim() !== "Planning and Task Decomposition") {
      throw new Error(`${label}：推理策略与规划阶段没有完成英文覆盖`);
    }
    if (String(await page.locator('[data-learning-goto="mcp-architecture"]').textContent()).trim() !== "MCP Architecture") {
      throw new Error(`${label}：Agent 与工具阶段的英文覆盖没有扩展到第 7 个节点`);
    }
    if (String(await page.locator('[data-learning-goto="coding-tools"]').textContent()).trim() !== "AI Coding Tools") {
      throw new Error(`${label}：Agent 与工具阶段没有完成英文覆盖`);
    }
    if (String(await page.locator('[data-learning-goto="video-generation"]').textContent()).trim() !== "Video Generation") {
      throw new Error(`${label}：生成媒体阶段的连续英文覆盖没有扩展到第 9 个节点`);
    }
    if (String(await page.locator('[data-learning-goto="speech"]').textContent()).trim() !== "Speech Recognition and Synthesis") {
      throw new Error(`${label}：语音节点没有显示英文`);
    }
    if (await page.evaluate(() => localStorage.getItem("ai-knowledge-map.locale.v1")) !== "en") {
      throw new Error(`${label}：英文选择没有保存`);
    }
    if (await page.locator("#locale-fallback-banner").count()) {
      throw new Error(`${label}：过时的全局翻译进度提示仍然存在`);
    }
    await languageSelect.selectOption("zh-Hans");
    await page.waitForFunction(() => document.documentElement.lang === "zh-Hans");
    await page.keyboard.press("Escape");
    if (!await page.locator("#settings-overlay").evaluate(element => element.classList.contains("hidden"))) {
      throw new Error(`${label}：设置面板无法通过 Escape 关闭`);
    }

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
    if (new URL(page.url()).hash !== "") throw new Error(`${label}：普通节点选择改变了 URL`);
    await page.locator("#detail h2").filter({ hasText: "神经网络" }).waitFor();

    await page.locator('[data-dd="neural-network"]').click();
    await waitForHash("#/concept/neural-network");
    await page.locator("#deepdive h1").filter({ hasText: "神经网络" }).waitFor();
    await page.locator('[data-learn-node="neural-network"]').click();
    if (await page.locator('[data-learn-node="neural-network"]').getAttribute("aria-pressed") !== "true") {
      throw new Error(`${label}：学习进度按钮没有更新`);
    }
    await page.goBack();
    await waitForHash("");
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
