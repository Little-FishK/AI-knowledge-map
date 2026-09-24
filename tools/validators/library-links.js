/* 专业资料库链接存活校验（补充门禁）。
   tools/validators/library.js 只能校验网址格式与非空，无法发现「域名已停运、页面已跳转」。
   本脚本逐个访问二级来源官网与资料原始地址，把结果分成四档：
     ok        2xx 且未换主机，链接可用
     moved     2xx 但换到了别的主机，链接可用但档案应改成新域名
     blocked   400 / 403 / 406 / 412 / 429 / 重定向环路，站点拒绝自动化访问，需人工确认（不算失败）
     unreached 超时或网络层错误，本地网络无法判定（不算失败）
     failed    404 / 410 / 5xx / 域名无法解析，需要处理
   用法：node tools/validators/library-links.js [--concurrency 8] [--timeout 15000] [--only <子串>]
     --only 只探测网址或来源标识包含该子串的目标，用于定向复核某批新增来源；
            启用时会连同 ok 结果一起打印，便于逐条确认。 */
"use strict";

const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");
global.window = {};

try {
  require(path.join(PROJECT_ROOT, "data", "graph.js"));
  require(path.join(PROJECT_ROOT, "data", "software.js"));
  require(path.join(PROJECT_ROOT, "data", "library.js"));
  require(path.join(PROJECT_ROOT, "data", "library-official-technical.js"));
  require(path.join(PROJECT_ROOT, "data", "library-official-china.js"));
  require(path.join(PROJECT_ROOT, "data", "library-platform-profiles.js"));
  require(path.join(PROJECT_ROOT, "data", "library-source-meta.js"));
  require(path.join(PROJECT_ROOT, "data", "library-new-sources.js"));
  require(path.join(PROJECT_ROOT, "data", "library-hackathon-kaggle.js"));
  require(path.join(PROJECT_ROOT, "data", "library-arxiv.js"));
  require(path.join(PROJECT_ROOT, "data", "library-neurips-proceedings.js"));
  require(path.join(PROJECT_ROOT, "data", "library-pmlr.js"));
  require(path.join(PROJECT_ROOT, "data", "library-openreview.js"));
  require(path.join(PROJECT_ROOT, "data", "library-acl-anthology.js"));
  require(path.join(PROJECT_ROOT, "data", "library-cvf-open-access.js"));
  require(path.join(PROJECT_ROOT, "data", "library-ieee-xplore.js"));
  require(path.join(PROJECT_ROOT, "data", "library-acm-digital-library.js"));
} catch (error) {
  console.error("✗ 专业资料库存在语法错误：\n  " + error.message);
  process.exit(1);
}

const args = process.argv.slice(2);
const readArg = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? Number(args[index + 1]) : fallback;
};
const readTextArg = (name) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith("--") ? args[index + 1] : null;
};
const concurrency = readArg("--concurrency", 8);
const timeout = readArg("--timeout", 15000);
const only = readTextArg("--only");
const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

const library = global.window.PRO_LIBRARY;
const profiles = global.window.LIBRARY_PLATFORM_PROFILES || {};

const targets = new Map();
const addTarget = (url, source) => {
  if (!url) return;
  if (!targets.has(url)) targets.set(url, new Set());
  targets.get(url).add(source);
};

Object.keys(profiles).forEach(key => {
  const website = profiles[key] && profiles[key].website;
  if (website) addTarget(website, `官网 ${key}`);
});
(library.items || []).flatMap(item => [item].concat(item.relatedMaterials || []))
  .forEach(item => addTarget(item.url, `资料 ${item.id}`));

/* --only 同时匹配网址与来源标识（如 official/deepseek），便于按批次定向复核。 */
const matchesOnly = url => !only || url.includes(only)
  || Array.from(targets.get(url) || []).some(source => source.includes(only));
const urls = Array.from(targets.keys()).filter(matchesOnly);

async function probe(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "user-agent": userAgent, accept: "text/html,application/xhtml+xml,application/pdf,*/*" },
      signal: controller.signal
    });
    const finalUrl = response.url || url;
    const finalHost = (() => { try { return new URL(finalUrl).hostname; } catch (_) { return ""; } })();
    const originHost = (() => { try { return new URL(url).hostname; } catch (_) { return ""; } })();
    const movedHost = finalHost && originHost && finalHost !== originHost &&
      !finalHost.endsWith("." + originHost) && !originHost.endsWith("." + finalHost);
    if (response.status >= 200 && response.status < 300) {
      if (movedHost) return { url, status: response.status, verdict: "moved", note: `已迁移到 ${finalHost}` };
      return { url, status: response.status, verdict: "ok", note: "" };
    }
    /* 400 / 406 与 403 / 412 / 429 一样，通常是站点防火墙拒绝自动化访问，不等于页面失效。 */
    if ([400, 403, 406, 412, 429].includes(response.status) || (response.status >= 300 && response.status < 400)) {
      return { url, status: response.status, verdict: "blocked", note: "站点拒绝自动化访问或重定向未落地，需人工确认" };
    }
    return { url, status: response.status, verdict: "failed", note: "" };
  } catch (error) {
    const code = (error && error.cause && error.cause.code) || error.code || "";
    if (code === "ENOTFOUND" || code === "EAI_AGAIN") {
      return { url, status: 0, verdict: "failed", note: "域名无法解析" };
    }
    if (code === "UND_ERR_TOO_MANY_REDIRECTS") {
      return { url, status: 0, verdict: "blocked", note: "重定向环路（通常是登录门槛），需人工确认" };
    }
    if (error.name === "AbortError") {
      return { url, status: 0, verdict: "unreached", note: "超时" };
    }
    return { url, status: 0, verdict: "unreached", note: code || error.message };
  } finally {
    clearTimeout(timer);
  }
}

async function runPool(items, worker, size) {
  const results = [];
  let cursor = 0;
  const runners = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index]);
    }
  });
  await Promise.all(runners);
  return results;
}

(async () => {
  console.log(`链接存活校验：${urls.length} 个地址（并发 ${concurrency}，超时 ${timeout}ms）`);
  const results = await runPool(urls, probe, concurrency);
  const failed = results.filter(result => result.verdict === "failed");
  const blocked = results.filter(result => result.verdict === "blocked");
  const moved = results.filter(result => result.verdict === "moved");
  const unreached = results.filter(result => result.verdict === "unreached");
  const ok = results.filter(result => result.verdict === "ok");

  if (only) {
    if (!urls.length) console.log(`\n（没有网址或来源标识匹配 --only "${only}"）`);
    else {
      console.log(`\n· 定向复核 --only "${only}"：命中 ${urls.length} 个地址，其中直接可用 ${ok.length} 个：`);
      ok.forEach(result => console.log(`  ${result.status} ${result.url}  [${Array.from(targets.get(result.url)).join(" / ")}]`));
    }
  }
  if (moved.length) {
    console.log(`\n· 域名已迁移 ${moved.length} 个（链接仍可用，建议把官网改到新域名）：`);
    moved.forEach(result => console.log(`  ${result.status} ${result.url} → ${result.note}  [${Array.from(targets.get(result.url)).join(" / ")}]`));
  }
  if (blocked.length) {
    console.log(`\n· 拒绝自动化访问 ${blocked.length} 个（需人工确认页面仍存在）：`);
    blocked.forEach(result => console.log(`  ${result.status} ${result.url}  ${result.note}  [${Array.from(targets.get(result.url)).join(" / ")}]`));
  }
  if (unreached.length) {
    console.log(`\n· 网络层无法判定 ${unreached.length} 个（本地网络或站点限制，需人工或换网络复核）：`);
    unreached.forEach(result => console.log(`  ${result.note} ${result.url}  [${Array.from(targets.get(result.url)).join(" / ")}]`));
  }
  if (failed.length) {
    console.error(`\n✗ 需要处理 ${failed.length} 个：`);
    failed.forEach(result => console.error(`  ${result.status || "ERR"} ${result.url}${result.note ? "  " + result.note : ""}  [${Array.from(targets.get(result.url)).join(" / ")}]`));
    process.exit(1);
  }
  console.log(`\n✓ 全部 ${urls.length} 个地址可用（${moved.length} 个域名迁移待改档、${blocked.length} 个站点拒绝自动化访问、${unreached.length} 个网络层无法判定，已列出待人工确认）`);
})();
