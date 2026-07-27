/*
 * 真实 Chromium 渲染与基础 WCAG 自动审计。
 *
 * node tools/audit-deepdive-browser.js
 * node tools/audit-deepdive-browser.js --id reasoning-models
 * node tools/audit-deepdive-browser.js --changed
 *
 * 需要 playwright。常规 CI 执行 `npm install`；Codex 工作区会自动尝试其
 * 随附依赖。此工具只覆盖可自动判定的 WCAG 子集，不宣称完整 WCAG 认证。
 */
"use strict";

const fs = require("fs");
const http = require("http");
const Module = require("module");
const os = require("os");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");

const root = process.env.DEEPDIVE_ROOT
  ? path.resolve(process.env.DEEPDIVE_ROOT)
  : path.join(__dirname, "..");

function loadPlaywright() {
  try {
    return require("playwright");
  } catch (_) {
    const bundled = process.env.DEEPDIVE_NODE_MODULES
      || path.join(os.homedir(), ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies", "node", "node_modules");
    const extra = [bundled, path.join(bundled, ".pnpm", "node_modules")];
    process.env.NODE_PATH = [process.env.NODE_PATH, ...extra].filter(Boolean).join(path.delimiter);
    Module._initPaths();
    try {
      return require("playwright");
    } catch (error) {
      throw new Error(`缺少 playwright。请先运行 npm install。原始错误：${error.message}`);
    }
  }
}

function loadPages() {
  const context = { window: {} };
  vm.createContext(context);
  const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const scripts = [...index.matchAll(/<script src="([^"]+\.js)"><\/script>/g)]
    .map((match) => match[1])
    .filter((src) => src.startsWith("data/deepdive/"));
  scripts.forEach((src) => {
    const file = path.join(root, ...src.split("/"));
    vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
  });
  return context.window.DEEPDIVE || {};
}

function pageHash(page) {
  const canonical = JSON.stringify({
    title: page.title || "",
    subtitle: page.subtitle || "",
    thesis: page.thesis || "",
    html: page.html || "",
  });
  const crypto = require("crypto");
  return `sha256:${crypto.createHash("sha256").update(canonical).digest("hex")}`;
}

function idsFromSource(source) {
  return [
    ...source.matchAll(/window\.DEEPDIVE\s*\[\s*["']([^"']+)["']\s*\]\s*=/g),
    ...source.matchAll(/register\s*\(\s*["']([^"']+)["']/g),
  ].map((match) => match[1]);
}

function changedIds(allIds) {
  const baseRef = process.env.DEEPDIVE_BASE_REF || process.env.GITHUB_BASE_REF || "";
  if (!baseRef && process.env.CI) return allIds;
  const resolvedBase = baseRef.startsWith("origin/") || /^[0-9a-f]{7,40}$/i.test(baseRef)
    ? baseRef
    : `origin/${baseRef}`;
  const gitArgs = baseRef
    ? ["-c", `safe.directory=${root.replace(/\\/g, "/")}`, "diff", "--name-only", "--diff-filter=ACMR", `${resolvedBase}...HEAD`]
    : ["-c", `safe.directory=${root.replace(/\\/g, "/")}`, "status", "--porcelain"];
  const git = spawnSync("git", gitArgs, {
    cwd: root,
    encoding: "utf8",
  });
  if (git.status !== 0) return allIds;
  const ids = new Set();
  const globalFiles = new Set([
    "data/graph.js",
    "index.html",
    "assets/app.js",
    "assets/style.css",
    "data/deepdive/00-deepdive-factory.js",
  ]);
  for (const line of git.stdout.split(/\r?\n/).filter(Boolean)) {
    const rawPath = (baseRef ? line : line.slice(3).split(" -> ").pop()).replace(/\\/g, "/");
    if (globalFiles.has(rawPath)) return allIds;
    if (!rawPath.startsWith("data/deepdive/") || !rawPath.endsWith(".js")) continue;
    const file = path.join(root, ...rawPath.split("/"));
    if (fs.existsSync(file)) idsFromSource(fs.readFileSync(file, "utf8")).forEach((id) => ids.add(id));
  }
  return [...ids];
}

function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  return {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".woff2": "font/woff2",
  }[ext] || "application/octet-stream";
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
        response.writeHead(200, { "Content-Type": contentType(file), "Cache-Control": "no-store" });
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
  return candidates.find((candidate) => fs.existsSync(candidate)) || "";
}

function selectIds(allIds) {
  const idAt = process.argv.indexOf("--id");
  if (idAt >= 0) {
    const id = process.argv[idAt + 1];
    if (!allIds.includes(id)) throw new Error(`未知页面：${id}`);
    return [id];
  }
  if (process.argv.includes("--changed")) return changedIds(allIds);
  return allIds;
}

async function audit() {
  const { chromium } = loadPlaywright();
  const pages = loadPages();
  const allIds = Object.keys(pages);
  const ids = selectIds(allIds);
  const server = await startServer();
  const address = server.address();
  const url = `http://127.0.0.1:${address.port}/?quality-audit=1`;
  const preferredExecutable = browserExecutable(chromium);
  const browser = await chromium.launch({
    headless: true,
    ...(preferredExecutable && fs.existsSync(preferredExecutable)
      ? { executablePath: preferredExecutable }
      : {}),
  });
  const failures = [];
  const warnings = [];
  const viewports = [
    { name: "desktop", width: 1280, height: 900 },
    { name: "mobile", width: 390, height: 844 },
  ];

  try {
    for (const viewport of viewports) {
      const page = await browser.newPage({ viewport });
      const consoleErrors = [];
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });
      page.on("pageerror", (error) => consoleErrors.push(error.message));
      await page.goto(url, { waitUntil: "load" });
      const hook = await page.evaluate(() => Boolean(window.__DEEPDIVE_QUALITY_AUDIT__));
      if (!hook) throw new Error("页面没有暴露 quality-audit 测试入口");

      for (const id of ids) {
        const result = await page.evaluate((pageId) => {
          window.__DEEPDIVE_QUALITY_AUDIT__.open(pageId);
          const article = document.querySelector("#dd-article");
          const deepdive = document.querySelector("#deepdive");
          const violations = [];
          const advisories = [];
          const add = (rule, detail) => violations.push(`${rule} ${detail}`);
          const advise = (rule, detail) => advisories.push(`${rule} ${detail}`);
          if (!article || deepdive.classList.contains("hidden")) add("render", "原理页未显示");
          if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1) {
            add("WCAG-1.4.10", "页面出现横向溢出");
          }
          if (article && article.scrollWidth > article.clientWidth + 1) {
            add("WCAG-1.4.10", "文章容器出现横向溢出");
          }

          const idsSeen = new Set();
          article.querySelectorAll("[id]").forEach((element) => {
            if (idsSeen.has(element.id)) add("WCAG-4.1.1", `重复 id=${element.id}`);
            idsSeen.add(element.id);
          });

          const headings = [...article.querySelectorAll("h1,h2,h3,h4,h5,h6")];
          if (headings.filter((heading) => heading.tagName === "H1").length !== 1) {
            add("WCAG-1.3.1", "每页应有且仅有一个 h1");
          }
          let previousLevel = 0;
          headings.forEach((heading) => {
            const level = Number(heading.tagName.slice(1));
            if (previousLevel && level > previousLevel + 1) {
              advise("heading-order", `${heading.tagName} 跳过标题层级`);
            }
            previousLevel = level;
          });

          article.querySelectorAll("figure").forEach((figure, index) => {
            if (!figure.querySelector("figcaption")) add("WCAG-1.1.1", `figure ${index + 1} 缺 figcaption`);
            figure.querySelectorAll("svg").forEach((svg) => {
              const name = svg.getAttribute("aria-label") || svg.querySelector("title")?.textContent?.trim();
              if (svg.getAttribute("role") !== "img" || !name) {
                add("WCAG-1.1.1", `figure ${index + 1} 的 SVG 缺 role=img 或可访问名称`);
              }
            });
          });
          article.querySelectorAll("img").forEach((image) => {
            if (!image.hasAttribute("alt")) add("WCAG-1.1.1", "图片缺 alt");
          });
          article.querySelectorAll("table").forEach((table, index) => {
            if (!table.querySelector("th")) add("WCAG-1.3.1", `table ${index + 1} 缺表头`);
            const wrapper = table.closest(".dd-table-wrap");
            if (wrapper && wrapper.scrollWidth > wrapper.clientWidth + 1) {
              const overflow = getComputedStyle(wrapper).overflowX;
              if (!["auto", "scroll"].includes(overflow)) add("WCAG-1.4.10", `table ${index + 1} 无自身横向滚动`);
            }
          });
          article.querySelectorAll("a").forEach((link) => {
            const name = (link.getAttribute("aria-label") || link.textContent || "").trim();
            if (!name) add("WCAG-2.4.4", "存在无可访问名称的链接");
            if (link.target === "_blank" && !/\bnoopener\b/.test(link.rel)) {
              add("security", `新窗口链接缺 rel=noopener：${name}`);
            }
          });
          deepdive.querySelectorAll("button").forEach((button) => {
            const name = (button.getAttribute("aria-label") || button.title || button.textContent || "").trim();
            if (!name) add("WCAG-4.1.2", "存在无可访问名称的按钮");
            if (button.tabIndex < 0) add("WCAG-2.1.1", `按钮不可键盘聚焦：${name}`);
          });
          const recommended = (window.GRAPH.recommendedLearningPath || [])
            .flatMap((phase) => (phase.steps || []).map((step) => ({
              order: String(step[0]),
              id: step[1],
            })));
          const pathIndex = recommended.findIndex((step) => step.id === pageId);
          const expectedNext = pathIndex >= 0 ? recommended[pathIndex + 1] : null;
          const learnButton = article.querySelector("[data-learn-node]");
          const nextButton = article.querySelector("[data-next-node]");
          if (!learnButton) add("learning-navigation", "缺少标记为已学习按钮");
          if (expectedNext) {
            const nextNode = window.GRAPH.nodes.find((node) => node.id === expectedNext.id);
            if (!nextButton) {
              add("learning-navigation", `缺少下一节 ${expectedNext.order} 跳转按钮`);
            } else {
              if (nextButton.getAttribute("data-next-node") !== expectedNext.id) {
                add("learning-navigation", `下一节目标错误，应为 ${expectedNext.id}`);
              }
              const accessibleName = nextButton.getAttribute("aria-label") || "";
              if (!accessibleName.includes(expectedNext.order) || !accessibleName.includes(nextNode?.title || "")) {
                add("learning-navigation", "下一节按钮没有完整说明序号与标题");
              }
              if (learnButton) {
                const learnRect = learnButton.getBoundingClientRect();
                const nextRect = nextButton.getBoundingClientRect();
                if (nextRect.left + 1 < learnRect.right) {
                  add("learning-navigation", "下一节按钮没有显示在学习按钮右侧");
                }
              }
            }
          } else if (nextButton) {
            add("learning-navigation", "推荐路径最后一页不应显示下一节按钮");
          }
          article.querySelectorAll("details").forEach((details, index) => {
            if (!details.querySelector(":scope > summary")) add("WCAG-4.1.2", `details ${index + 1} 缺 summary`);
          });
          if (article.textContent.includes("√")) {
            add("math-radical", "仍存在没有声明被开方范围的裸文本根号");
          }
          article.querySelectorAll(".dd-radical").forEach((radical, index) => {
            const radicand = radical.querySelector(":scope > .dd-radicand");
            const name = (radical.getAttribute("aria-label") || "").trim();
            if (!radicand || !radicand.textContent.trim()) {
              add("math-radical", `根式 ${index + 1} 缺少被开方内容`);
              return;
            }
            if (radical.getAttribute("role") !== "math" || !name) {
              add("WCAG-1.3.1", `根式 ${index + 1} 缺 role=math 或可访问名称`);
            }
            const style = getComputedStyle(radicand);
            if (style.borderTopStyle === "none" || parseFloat(style.borderTopWidth) < 1) {
              add("math-radical", `根式 ${index + 1} 的横线没有覆盖被开方容器`);
            }
            if (radicand.getBoundingClientRect().width + 0.5 < radicand.scrollWidth) {
              add("math-radical", `根式 ${index + 1} 的被开方内容溢出横线`);
            }
          });

          function parseRgb(value) {
            const match = value.match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\)/);
            return match ? [Number(match[1]), Number(match[2]), Number(match[3]), match[4] === undefined ? 1 : Number(match[4])] : null;
          }
          function backgroundFor(element) {
            let current = element;
            while (current) {
              const color = parseRgb(getComputedStyle(current).backgroundColor);
              if (color && color[3] >= 0.99) return color;
              current = current.parentElement;
            }
            return [255, 255, 255, 1];
          }
          function luminance(color) {
            const channels = color.slice(0, 3).map((value) => {
              const channel = value / 255;
              return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
            });
            return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
          }
          const contrastElements = article.querySelectorAll("p,li,td,th,h1,h2,h3,h4,a,summary,.dd-sub,.dd-thesis");
          const contrastSeen = new Set();
          contrastElements.forEach((element) => {
            if (!element.getClientRects().length || !element.textContent.trim()) return;
            const style = getComputedStyle(element);
            const foreground = parseRgb(style.color);
            const background = backgroundFor(element);
            if (!foreground || foreground[3] < 0.99) return;
            const light = Math.max(luminance(foreground), luminance(background));
            const dark = Math.min(luminance(foreground), luminance(background));
            const ratio = (light + 0.05) / (dark + 0.05);
            const fontSize = parseFloat(style.fontSize);
            const bold = Number(style.fontWeight) >= 700;
            const large = fontSize >= 24 || (fontSize >= 18.66 && bold);
            const threshold = large ? 3 : 4.5;
            if (ratio + 0.01 < threshold) {
              const key = `${element.tagName}.${element.className}:${ratio.toFixed(2)}`;
              if (!contrastSeen.has(key)) {
                contrastSeen.add(key);
                const sample = element.textContent.trim().replace(/\s+/g, " ").slice(0, 32);
                add("WCAG-1.4.3", `${element.tagName}“${sample}” 对比度 ${ratio.toFixed(2)} < ${threshold}（${style.color} / ${getComputedStyle(element).backgroundColor}）`);
              }
            }
          });

          return {
            title: article.querySelector("h1")?.textContent?.trim() || pageId,
            violations: [...new Set(violations)].slice(0, 30),
            advisories: [...new Set(advisories)].slice(0, 30),
          };
        }, id);
        result.violations.forEach((violation) => failures.push(`${id} [${viewport.name}] ${violation}`));
        result.advisories.forEach((warning) => warnings.push(`${id} [${viewport.name}] ${warning}`));
      }

      if (ids.length) {
        const navigationProbe = await page.evaluate(() => {
          const steps = (window.GRAPH.recommendedLearningPath || []).flatMap((phase) => phase.steps || []);
          const first = steps[0];
          const second = steps[1];
          window.__DEEPDIVE_QUALITY_AUDIT__.open(first[1]);
          return { expectedId: second[1], expectedTitle: window.DEEPDIVE[second[1]]?.title || "" };
        });
        await page.locator("[data-next-node]").click();
        const navigationResult = await page.evaluate(() => ({
          activeTitle: document.querySelector("#dd-article h1")?.textContent?.trim() || "",
          activeTarget: document.querySelector("[data-learn-node]")?.getAttribute("data-learn-node") || "",
        }));
        if (navigationResult.activeTarget !== navigationProbe.expectedId
          || navigationResult.activeTitle !== navigationProbe.expectedTitle) {
          failures.push(`${ids[0]} [${viewport.name}] learning-navigation 点击下一节按钮没有打开官方顺序中的下一页`);
        }
        await page.evaluate((id) => window.__DEEPDIVE_QUALITY_AUDIT__.open(id), ids[0]);
        await page.locator("#dd-back").focus();
        if (!(await page.locator("#dd-back").evaluate((button) => button === document.activeElement))) {
          failures.push(`${ids[0]} [${viewport.name}] WCAG-2.1.1 返回按钮无法获得焦点`);
        }
        await page.keyboard.press("Escape");
        if (!(await page.locator("#deepdive").evaluate((element) => element.classList.contains("hidden")))) {
          failures.push(`${ids[0]} [${viewport.name}] WCAG-2.1.1 Escape 无法关闭原理页`);
        }
      }
      consoleErrors.forEach((error) => failures.push(`[${viewport.name}] console ${error}`));
      await page.close();
    }
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }

  console.log(`浏览器/WCAG 自动审计 · 页面 ${ids.length} · 视口 desktop+mobile`);
  if (warnings.length) {
    console.warn(`\n⚠ ${warnings.length} 个非阻断结构建议（不冒充 WCAG 失败）：`);
    warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }
  if (failures.length) {
    console.error(`\n✗ 发现 ${failures.length} 个渲染或基础 WCAG 问题：`);
    failures.forEach((failure) => console.error(`  - ${failure}`));
    process.exit(1);
  }
  const reportAt = process.argv.indexOf("--report");
  if (reportAt >= 0) {
    const requested = process.argv[reportAt + 1];
    if (!requested) throw new Error("--report 需要仓库内相对路径");
    const reportFile = path.resolve(root, requested);
    const relative = path.relative(root, reportFile);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error("--report 只能写入仓库内部");
    }
    fs.mkdirSync(path.dirname(reportFile), { recursive: true });
    fs.writeFileSync(reportFile, JSON.stringify({
      schemaVersion: 1,
      tool: "audit-deepdive-browser",
      generatedAt: new Date().toISOString(),
      passed: true,
      viewports,
      pages: Object.fromEntries(ids.map((id) => [id, { pageHash: pageHash(pages[id]) }])),
    }, null, 2));
    console.log(`✓ 已写入浏览器证据报告 ${relative.replace(/\\/g, "/")}`);
  }
  console.log("✓ 真实渲染、响应式、键盘与基础 WCAG 自动检查通过");
}

audit().catch((error) => {
  console.error(`✗ 浏览器审计无法运行：${error.message}`);
  process.exit(1);
});
