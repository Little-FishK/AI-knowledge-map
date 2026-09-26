/* Build the Meta AI official-material inventory from first-party machine-readable indexes. */
"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const reviewedAt = "2026-09-24";
const outputPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "meta-ai-rereview-inventory-20260924.json");
const sets = [
  ["meta-model-api", "Meta Model API and Llama documentation", "https://dev.meta.ai/llms.txt"],
  ["meta-developer-site", "Meta AI developer site", "https://dev.meta.ai/sitemap.xml"]
];

function canonicalize(rawUrl) {
  const url = new URL(rawUrl);
  url.hash = "";
  url.search = "";
  url.pathname = url.pathname.replace(/\.md$/, "").replace(/\/$/, "") || "/";
  return url.toString().replace(/\/$/, "");
}

function slugTitle(rawUrl) {
  const parts = new URL(rawUrl).pathname.split("/").filter(Boolean);
  const slug = parts.at(-1) || "Meta AI";
  return slug.replace(/[-_]+/g, " ").replace(/\b\w/g, letter => letter.toUpperCase());
}

function parseLlms(markdown, setId, setTitle, indexUrl) {
  const records = [];
  let section = "";
  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^#{2,3}\s+(.+)$/);
    if (heading) section = heading[1].trim();
    const match = line.match(/^- \[([^\]]+)\]\((https:\/\/[^)]+)\)(?:(?::| -)\s*(.*))?$/);
    if (!match) continue;
    const [, title, url, description = ""] = match;
    const container = /\/llms(?:-full)?\.txt(?:$|[?#])/i.test(url);
    records.push({
      setId, setTitle, indexUrl, section, title:title.trim(), url,
      canonicalUrl:canonicalize(url), description:description.trim(),
      reviewStatus:container ? "ineligible-container-or-combined-export" : "pending-importance-review",
      reviewReason:container
        ? "目录或整集合导出不是独立资料内容；其下页面分别审核。"
        : "等待按知识对应、重要性、边际增量和时效性逐份审核。"
    });
  }
  return records;
}

function parseSitemap(xml, setId, setTitle, indexUrl) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => {
    const url = match[1].replace(/&amp;/g, "&");
    const pathname = new URL(url).pathname;
    const section = pathname.split("/").filter(Boolean)[0] || "Site navigation";
    return {
      setId, setTitle, indexUrl, section, title:slugTitle(url), url,
      canonicalUrl:canonicalize(url), description:"",
      reviewStatus:"pending-importance-review",
      reviewReason:"等待按知识对应、重要性、边际增量和时效性逐份审核。"
    };
  });
}

async function main() {
  const fetchedSets = [];
  const all = [];
  for (const [id, title, indexUrl] of sets) {
    const response = await fetch(indexUrl, { headers:{ "user-agent":"ai-knowledge-map-meta-review/1.0" } });
    if (!response.ok) throw new Error(`${indexUrl}: HTTP ${response.status}`);
    const body = await response.text();
    const records = indexUrl.endsWith("llms.txt")
      ? parseLlms(body, id, title, indexUrl)
      : parseSitemap(body, id, title, indexUrl);
    fetchedSets.push({ id, title, indexUrl, indexedEntries:records.length });
    all.push(...records);
  }

  const firstByCanonicalUrl = new Map();
  for (const record of all) {
    if (record.reviewStatus !== "pending-importance-review") continue;
    const first = firstByCanonicalUrl.get(record.canonicalUrl);
    if (!first) firstByCanonicalUrl.set(record.canonicalUrl, record);
    else {
      record.reviewStatus = "ineligible-duplicate-route";
      record.reviewReason = `与 ${first.setId} 中的同一官方资料重复；保留首次出现的 canonical URL。`;
      record.duplicateOf = first.canonicalUrl;
    }
  }

  const counts = all.reduce((acc, record) => {
    acc[record.reviewStatus] = (acc[record.reviewStatus] || 0) + 1;
    return acc;
  }, {});
  const payload = {
    policy:"official-technical-importance-v2", policyVersion:"2.0",
    batch:{
      id:"meta-ai-rereview-20260924", source:"official/meta-ai", reviewedAt, status:"not-started",
      rule:"候选池阶段只排除目录导出与 canonical URL 精确重复；重要性、时效性和学习价值在后续内容审核判断。"
    },
    scope:{
      included:"Meta 当前第一方 AI 开发者技术目录：Meta Model API、Llama 文档、API 参考、Cookbook、Muse Code、Muse Glimmer、模型页、安全与帮助资料。",
      excluded:"Meta Research 论文由学术一级来源独立审核；Horizon/Quest 空间计算文档不属于 Meta AI 候选池；GitHub 仓库由开源项目一级来源独立审核。"
    },
    sets:fetchedSets, records:all,
    summary:{
      rawIndexEntries:all.length,
      uniqueContentCandidates:counts["pending-importance-review"] || 0,
      containerOrCombinedExports:counts["ineligible-container-or-combined-export"] || 0,
      duplicateRoutes:counts["ineligible-duplicate-route"] || 0,
      admitted:0, rejectedAfterContentReview:0,
      pendingContentReview:counts["pending-importance-review"] || 0
    }
  };
  fs.mkdirSync(path.dirname(outputPath), { recursive:true });
  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify(payload.summary)}\n${outputPath}\n`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
