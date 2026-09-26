/* Build the Anthropic official-material inventory from first-party llms.txt indexes. */
"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const reviewedAt = "2026-09-24";
const outputPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "anthropic-rereview-inventory-20260924.json");
const sets = [
  ["claude-platform", "Claude Developer Platform", "https://platform.claude.com/llms.txt", ".tmp/anthropic-platform-llms.txt", 637],
  ["claude-code", "Claude Code", "https://code.claude.com/docs/llms.txt", ".tmp/anthropic-code-llms.txt", 208]
];

function canonicalize(rawUrl) {
  const url = new URL(rawUrl);
  url.hash = "";
  url.search = "";
  url.pathname = url.pathname.replace(/\.md$/, "").replace(/\/$/, "") || "/";
  return url.toString().replace(/\/$/, "");
}

function parseEntries(markdown, setId, setTitle, indexUrl) {
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
      setId, setTitle, indexUrl, section,
      title:title.trim(), url, canonicalUrl:canonicalize(url), description:description.trim(),
      reviewStatus:container ? "ineligible-container-or-combined-export" : "pending-importance-review",
      reviewReason:container
        ? "目录或整集合导出不是独立资料内容；其下页面分别审核。"
        : "等待按知识对应、重要性、边际增量和时效性逐份审核。"
    });
  }
  return records;
}

async function main() {
  const fetchedSets = [];
  const all = [];
  for (const [id, title, indexUrl, snapshotFile, expectedEntries] of sets) {
    const snapshotPath = path.join(PROJECT_ROOT, snapshotFile);
    if (!fs.existsSync(snapshotPath)) throw new Error(`Missing frozen source snapshot: ${snapshotPath}`);
    const markdown = fs.readFileSync(snapshotPath, "utf8");
    const records = parseEntries(markdown, id, title, indexUrl);
    if (records.length !== expectedEntries) throw new Error(`${snapshotFile}: expected ${expectedEntries} entries, got ${records.length}`);
    fetchedSets.push({ id, title, indexUrl, snapshotFile, indexedEntries:records.length });
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
    batch:{ id:"anthropic-rereview-20260924", source:"official/anthropic", reviewedAt, status:"in-progress",
      rule:"只有对理解、实现、选型、可靠性、安全或必要迁移具有实质用途的资料才建卡；页面独立不是收录理由。" },
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
