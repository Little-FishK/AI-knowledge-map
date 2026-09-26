/* Build and prefilter DeepSeek official AI learning-material candidates. */
"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const reviewedAt = "2026-09-24";
const outputPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "deepseek-learning-prefilter-20260924.json");
const apiSitemap = "https://api-docs.deepseek.com/sitemap.xml";
const mainSitemap = "https://www.deepseek.com/sitemap.xml";
const harnessStart = "https://deepseek-harness.github.io/deepseek-harness/en/";

async function fetchText(url) {
  const response = await fetch(url, { headers:{ "user-agent":"ai-knowledge-map-deepseek-review/1.0" } });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/\s+/g, " ").trim();
}

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map(match => decodeHtml(match[1]));
}

function extractTitle(html, fallback) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return decodeHtml(match ? match[1].replace(/<[^>]+>/g, "") : fallback);
}

function extractLinks(html, baseUrl) {
  const links = [];
  for (const match of html.matchAll(/\bhref\s*=\s*["']([^"']+)["']/gi)) {
    try { links.push(new URL(decodeHtml(match[1]), baseUrl).href); } catch {}
  }
  return links;
}

function normalizeHarnessUrl(input) {
  const url = new URL(input);
  url.hash = "";
  url.search = "";
  if (url.pathname.endsWith("/index.html")) url.pathname = url.pathname.slice(0, -"index.html".length);
  return url.href;
}

async function crawlHarness() {
  const indexHtml = await fetchText(harnessStart);
  const keys = [...indexHtml.matchAll(/\\"(en_[^"\\]+\.md)\\"/g)].map(match => match[1]);
  const urls = [...new Set(keys.map(key => {
    const isIndex = /(?:^|_)index\.md$/.test(key);
    let route = key.replace(/^en_/, "").replace(/\.md$/, "").replace(/_/g, "/");
    route = route === "index" ? "" : route.replace(/(?:^|\/)index$/, "");
    if (isIndex && route && !route.endsWith("/")) route += "/";
    return normalizeHarnessUrl(new URL(`en/${route}`, "https://deepseek-harness.github.io/deepseek-harness/").href);
  }))];
  const records = [];
  while (urls.length) {
    const batch = urls.splice(0, 12);
    const pages = await Promise.all(batch.map(async url => {
      try { return [url, await fetchText(url)]; }
      catch (error) { return [url, "", String(error)]; }
    }));
    for (const [url, html, error] of pages) {
      if (error) {
        records.push({ family:"harness", title:new URL(url).pathname, url, fetchError:error });
        continue;
      }
      records.push({ family:"harness", title:extractTitle(html, new URL(url).pathname).replace(/\s*\|\s*DeepSeek Harness\s*$/i, ""), url });
    }
  }
  return records;
}

async function discoverTransparencyAssets() {
  const transparencyUrl = "https://www.deepseek.com/en/transparency/";
  const transparencyHtml = await fetchText(transparencyUrl);
  const firstParty = extractLinks(transparencyHtml, transparencyUrl).filter(url => {
    const parsed = new URL(url);
    return ["cdn.deepseek.com", "fe-static.deepseek.com"].includes(parsed.hostname) &&
      /(?:model-algorithm-disclosure|model-card|training-data-summary)/i.test(parsed.pathname);
  });
  const methodUrl = firstParty.find(url => /model-algorithm-disclosure/i.test(url));
  if (methodUrl) {
    const methodHtml = await fetchText(methodUrl);
    firstParty.push(...extractLinks(methodHtml, methodUrl).filter(url => {
      const parsed = new URL(url);
      return ["cdn.deepseek.com", "fe-static.deepseek.com"].includes(parsed.hostname) &&
        /training-data-summary/i.test(parsed.pathname);
    }));
  }
  firstParty.push(
    "https://cdn.deepseek.com/policies/DeepSeek-V3.1-public-summary-of-training-content.pdf",
    "https://cdn.deepseek.com/policies/DeepSeek-V3.2-public-summary-of-training-content.pdf",
    "https://cdn.deepseek.com/policies/DeepSeek_Template_for_the_Public_Summary_of_Training_Content_for_GeneralPurpose_AI_model.pdf"
  );
  return [...new Set(firstParty)].map(url => ({
    family:"transparency",
    title:path.posix.basename(new URL(url).pathname),
    url
  }));
}

function classify(record) {
  const parsed = new URL(record.url);
  const pathname = parsed.pathname.toLowerCase();
  const title = record.title.toLowerCase();
  const value = `${title} ${pathname}`;

  if (record.fetchError) return ["prefilter-rejected-fetch-error", "官方页面抓取失败，暂不进入候选池。"];
  if (record.family === "main" && /(?:privacy|terms-of-use|data-processing)/.test(pathname)) return ["prefilter-rejected-legal", "隐私、协议和数据处理条款不是技术学习资料。"];
  if (record.family === "main" && /\/(?:en\/)?(?:news|transparency)?\/?$/.test(pathname)) return ["prefilter-rejected-index", "首页、新闻索引或透明度索引不作为独立学习资料。"];
  if (record.family === "main" && /(?:\/en\/harness|\/harness\/en)\/?$/.test(pathname)) return ["prefilter-rejected-product-page", "产品落地页不作为独立学习资料。"];
  if (record.family === "main" && /\/news\//.test(pathname)) return ["prefilter-rejected-model-release", "型号发布公告、版本更新与跑分属于品牌事实，不形成通用学习资料。"];

  if (record.family === "api-docs" && /\/api\//.test(pathname)) return ["prefilter-rejected-api-reference", "API 请求与响应参考颗粒度过细。"];
  if (record.family === "api-docs" && /\/quick_start\//.test(pathname)) return ["prefilter-rejected-quick-start-or-operation", "快速开始、集成、错误码、限流、计价或用量说明以产品操作为主。"];
  if (record.family === "api-docs" && /\/news\//.test(pathname)) return ["prefilter-rejected-model-release", "型号发布公告、版本更新与跑分属于品牌事实，不形成通用学习资料。"];
  if (record.family === "api-docs" && /\/(?:updates)?\/?$/.test(pathname)) return ["prefilter-rejected-index", "文档首页或更新日志不作为独立学习资料。"];
  if (record.family === "api-docs" && /\/guides\/(?:anthropic_api|files_api|responses_api|vision)$/.test(pathname)) return ["prefilter-rejected-product-operation", "兼容协议、文件、视觉或 Responses API 页面主要解释 DeepSeek 接口调用。"];
  if (record.family === "api-docs" && /\/guides\/(?:chat_prefix_completion|fim_completion|json_mode|multi_round_chat)$/.test(pathname)) return ["prefilter-rejected-feature-guide", "单一 API 功能指南缺少足够的跨模型知识增量。"];

  if (record.family === "transparency" && /model-card/i.test(pathname)) return ["prefilter-rejected-model-specific", "模型卡只描述具体 DeepSeek 型号。"];
  if (record.family === "transparency" && /(?:training-data-summary|summary-of-training-content|summary_of_training_content)/i.test(pathname)) return ["prefilter-rejected-model-specific", "训练数据摘要只描述具体 DeepSeek 型号。"];

  if (record.family === "harness") {
    const transferableHarnessPaths = new Set([
      "/deepseek-harness/en/reference/",
      "/deepseek-harness/en/reference/agent-lifecycle",
      "/deepseek-harness/en/reference/capability-seams",
      "/deepseek-harness/en/reference/tool-execution-pipeline",
      "/deepseek-harness/en/reference/subsystems/approval",
      "/deepseek-harness/en/reference/subsystems/compaction",
      "/deepseek-harness/en/reference/subsystems/conversation",
      "/deepseek-harness/en/reference/subsystems/core",
      "/deepseek-harness/en/reference/subsystems/goal",
      "/deepseek-harness/en/reference/subsystems/invariants",
      "/deepseek-harness/en/reference/subsystems/jobs",
      "/deepseek-harness/en/reference/subsystems/llm-streaming",
      "/deepseek-harness/en/reference/subsystems/permission-presets",
      "/deepseek-harness/en/reference/subsystems/persistence",
      "/deepseek-harness/en/reference/subsystems/plan",
      "/deepseek-harness/en/reference/subsystems/sandbox",
      "/deepseek-harness/en/reference/subsystems/session",
      "/deepseek-harness/en/reference/subsystems/session-projection",
      "/deepseek-harness/en/reference/subsystems/skills",
      "/deepseek-harness/en/reference/subsystems/subagent",
      "/deepseek-harness/en/reference/subsystems/system-prompt",
      "/deepseek-harness/en/reference/subsystems/token-meter",
      "/deepseek-harness/en/reference/subsystems/tools",
      "/deepseek-harness/en/reference/subsystems/user-questions",
      "/deepseek-harness/en/reference/subsystems/workflow"
    ]);
    if (transferableHarnessPaths.has(pathname.replace(/\/$/, pathname.endsWith("/reference/") ? "/" : ""))) {
      return ["pending-importance-review", "Harness 页面解释可迁移的 Agent 架构或运行机制，等待逐份重要性审核。"];
    }
    if (/\/(?:guide|develop)\//.test(pathname)) return ["prefilter-rejected-harness-tutorial", "安装、配置、SDK、插件和开发教程主要服务 DeepSeek Harness。"];
    if (/(?:generated|catalog|configuration|config-reference|cli-reference|api-gateway|web-client|ui-|settings|providers|plugin|package|cordis-api)/.test(value)) return ["prefilter-rejected-harness-reference", "生成式 API、配置、界面或插件参考依赖 Harness 实现。"];
    return ["prefilter-rejected-no-general-learning-topic", "内容依赖 Harness 的具体子系统或界面实现，未达到跨 Agent 框架的候选门槛。"];
  }

  return ["pending-importance-review", "具有跨模型、跨平台或跨 Agent 框架的学习价值，等待逐份重要性审核。"];
}

async function main() {
  const [apiXml, mainXml, harnessRecords, transparencyRecords] = await Promise.all([
    fetchText(apiSitemap), fetchText(mainSitemap), crawlHarness(), discoverTransparencyAssets()
  ]);
  const apiRecords = extractLocs(apiXml).map(url => ({ family:"api-docs", title:path.posix.basename(new URL(url).pathname) || "API documentation home", url }));
  const mainRecords = extractLocs(mainXml)
    .filter(url => {
      const pathname = new URL(url).pathname;
      return pathname === "/en/" || pathname.startsWith("/en/") || pathname === "/harness/en/" || pathname.startsWith("/harness/en/");
    })
    .map(url => ({ family:"main", title:path.posix.basename(new URL(url).pathname.replace(/\/$/, "")) || "DeepSeek home", url }));
  const raw = [...apiRecords, ...mainRecords, ...harnessRecords, ...transparencyRecords];
  const byUrl = new Map();
  for (const record of raw) if (!byUrl.has(record.url)) byUrl.set(record.url, record);
  const records = [...byUrl.values()].sort((a, b) => a.family.localeCompare(b.family) || a.url.localeCompare(b.url));
  records.forEach((record, index) => {
    record.sequence = index + 1;
    [record.status, record.reason] = classify(record);
  });
  const summarize = key => Object.fromEntries([...records.reduce((map, record) => {
    map.set(record[key], (map.get(record[key]) || 0) + 1);
    return map;
  }, new Map()).entries()].sort());
  const pending = records.filter(record => record.status === "pending-importance-review").length;
  const payload = {
    policy:"official-technical-importance-v2",
    prefilterVersion:"1.0",
    reviewedAt,
    scope:{
      included:"DeepSeek API 官方文档、DeepSeek 主站技术/研究动态、透明度技术材料，以及主站链接的 DeepSeek Harness 官方开发者文档。",
      excluded:"技术论文归学术一级来源；GitHub/Hugging Face 仓库与模型权重归开源项目；法律政策、版本公告、API 参考和产品操作不进入通用学习候选。",
      rule:"先完整盘点并按语言与 URL 去重，再只保留能够迁移到其他模型、平台或 Agent 框架的学习资料；候选项仍须逐份审核。"
    },
    sources:{ apiSitemap, mainSitemap, harnessStart },
    records,
    summary:{
      rawIndexEntries:raw.length,
      canonicalDuplicates:raw.length - records.length,
      uniqueOfficialMaterials:records.length,
      pendingImportanceReview:pending,
      prefilterRejected:records.length - pending,
      byFamily:summarize("family"),
      byStatus:summarize("status")
    }
  };
  fs.mkdirSync(path.dirname(outputPath), { recursive:true });
  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify(payload.summary, null, 2)}\n`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
