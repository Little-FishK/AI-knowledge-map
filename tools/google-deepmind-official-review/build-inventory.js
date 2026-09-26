/* Build the Google / Google DeepMind official-material inventory. */
"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const reviewedAt = "2026-09-24";
const outputPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "google-deepmind-rereview-inventory-20260924.json");
const sets = [
  ["gemini-api", "Google Gemini API", "https://ai.google.dev/gemini-api/docs/llms.txt", 210],
  ["deepmind-portfolio", "Google DeepMind", "https://deepmind.google/llms-full.txt", 47]
];

function canonicalize(rawUrl) {
  const url = new URL(rawUrl);
  url.hash = ""; url.search = "";
  url.pathname = url.pathname.replace(/\.md\.txt$/, "").replace(/\.md$/, "").replace(/\/$/, "") || "/";
  return url.toString().replace(/\/$/, "");
}

function parse(markdown, setId, setTitle, indexUrl) {
  const records = [];
  let section = "";
  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) section = heading[1].trim();
    const match = line.match(/^- \[([^\]]+)\]\((https?:\/\/[^)]+)\)(?:(?::| -)\s*(.*))?$/);
    if (!match) continue;
    const [, title, url, description = ""] = match;
    records.push({ setId, setTitle, indexUrl, section, title:title.trim(), url,
      canonicalUrl:canonicalize(url), description:description.trim(),
      reviewStatus:"pending-importance-review",
      reviewReason:"等待按知识对应、重要性、边际增量和时效性逐份审核。" });
  }
  return records;
}

async function main() {
  const all = [];
  const fetchedSets = [];
  for (const [id, title, indexUrl, expected] of sets) {
    const response = await fetch(indexUrl, { headers:{ "user-agent":"ai-knowledge-map-google-review/1.0" } });
    if (!response.ok) throw new Error(`${indexUrl}: HTTP ${response.status}`);
    const records = parse(await response.text(), id, title, indexUrl);
    if (records.length !== expected) throw new Error(`${indexUrl}: expected ${expected}, got ${records.length}`);
    fetchedSets.push({ id, title, indexUrl, indexedEntries:records.length });
    all.push(...records);
  }
  const firstByUrl = new Map();
  for (const record of all) {
    const first = firstByUrl.get(record.canonicalUrl);
    if (!first) firstByUrl.set(record.canonicalUrl, record);
    else {
      record.reviewStatus = "ineligible-duplicate-route";
      record.reviewReason = `与 ${first.setId} 的同一官方 URL 重复；保留首次出现项。`;
      record.duplicateOf = first.canonicalUrl;
    }
  }
  const eligible = all.filter(record => !record.duplicateOf);
  const payload = {
    policy:"official-technical-importance-v2", policyVersion:"2.0",
    batch:{ id:"google-deepmind-rereview-20260924", source:"official/google-deepmind", reviewedAt, status:"in-progress",
      rule:"只有对理解、实现、选型、可靠性、安全或必要迁移具有实质用途的资料才建卡；页面独立不是收录理由。" },
    sets:fetchedSets, records:all,
    summary:{ rawIndexEntries:all.length, uniqueContentCandidates:eligible.length,
      duplicateRoutes:all.length - eligible.length, admitted:0, rejectedAfterContentReview:0,
      pendingContentReview:eligible.length }
  };
  fs.mkdirSync(path.dirname(outputPath), { recursive:true });
  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify(payload.summary)}\n${outputPath}\n`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
