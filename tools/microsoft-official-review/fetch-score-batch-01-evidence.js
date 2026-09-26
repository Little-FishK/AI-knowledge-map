/* Fetch Microsoft Learn evidence for one 60-record frozen review batch. */
"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const batchNumber = Number(process.argv[2] || 1);
if (!Number.isInteger(batchNumber) || batchNumber < 1 || batchNumber > 9) throw new Error("Batch number must be 1-9");
const candidateCount = Number(process.argv[3] || 60);
if (!Number.isInteger(candidateCount) || candidateCount < 1 || candidateCount > 60) throw new Error("Candidate count must be 1-60");
const inventoryPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "microsoft-prefilter-inventory-20260924.json");
const outputPath = path.join(PROJECT_ROOT, "proposals", "official-technical", `microsoft-value-score-batch-0${batchNumber}-evidence.json`);

function decode(value = "") {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function text(value = "") {
  return decode(value.replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim());
}

function meta(html, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return decode(
    html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']*)`, "i"))?.[1]
    || html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${escaped}["']`, "i"))?.[1]
    || ""
  );
}

async function fetchOne(record) {
  const response = await fetch(record.url, { headers:{ "user-agent":"ai-knowledge-map-microsoft-review/1.0" } });
  const html = await response.text();
  const article = html.match(/<main\b[\s\S]*?<\/main>/i)?.[0]
    || html.match(/<article\b[\s\S]*?<\/article>/i)?.[0]
    || html;
  const title = text(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1])
    || text(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]).replace(/\s*[-|]\s*Microsoft Learn\s*$/i, "");
  const description = meta(html, "description") || meta(html, "og:description");
  return {
    ...record,
    title,
    description,
    contentVerification:{
      verifiedAt:"2026-09-24",
      httpStatus:response.status,
      contentType:response.headers.get("content-type"),
      bytes:Buffer.byteLength(html),
      headingCount:(article.match(/<h[1-6]\b/gi) || []).length,
      articleTextChars:text(article).length,
      sha256:crypto.createHash("sha256").update(html).digest("hex")
    }
  };
}

async function main() {
  if (fs.existsSync(outputPath)) {
    const frozen = JSON.parse(fs.readFileSync(outputPath, "utf8"));
    process.stdout.write(`${frozen.records.length} frozen evidence records already exist for batch ${batchNumber}\n`);
    return;
  }
  const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
  const candidates = inventory.records.filter(record => record.status === "pending-importance-review").slice(0, candidateCount);
  if (candidates.length !== candidateCount) throw new Error(`Expected ${candidateCount} candidates, got ${candidates.length}`);
  let cursor = 0;
  const results = new Array(candidates.length);
  async function worker() {
    while (cursor < candidates.length) {
      const index = cursor++;
      results[index] = await fetchOne(candidates[index]);
    }
  }
  await Promise.all(Array.from({ length:8 }, worker));
  fs.writeFileSync(outputPath, `${JSON.stringify({ reviewedAt:"2026-09-24", records:results }, null, 2)}\n`, "utf8");
  process.stdout.write(`${results.length} evidence records written for batch ${batchNumber}\n`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
