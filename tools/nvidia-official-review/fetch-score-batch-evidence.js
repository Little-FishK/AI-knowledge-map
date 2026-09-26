"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const REVIEWED_AT = "2026-09-25";
const batchNumber = Number(process.argv[2] || 1);
if (!Number.isInteger(batchNumber) || batchNumber < 1 || batchNumber > 7) throw new Error("Batch number must be 1-7");
const suffix = String(batchNumber).padStart(2, "0");
const inventoryPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "nvidia-learning-prefilter-20260924.json");
const outputPath = path.join(PROJECT_ROOT, "proposals", "official-technical", `nvidia-value-score-batch-${suffix}-evidence.json`);

function decode(value = "") {
  return value.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#x27;/g, "'");
}

function plainText(value = "") {
  return decode(value.replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function meta(html, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return decode(html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']*)`, "i"))?.[1]
    || html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${escaped}["']`, "i"))?.[1]
    || "");
}

async function fetchOne(record, sequence) {
  const response = await fetch(record.url, { headers:{ "user-agent":"ai-knowledge-map-nvidia-review/1.0" } });
  const html = await response.text();
  const article = html.match(/<main\b[\s\S]*?<\/main>/i)?.[0]
    || html.match(/<article\b[\s\S]*?<\/article>/i)?.[0]
    || html;
  const articleText = plainText(article);
  const pageTitle = plainText(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1])
    || plainText(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]);
  return {
    sequence,
    ...record,
    pageTitle:pageTitle || record.title,
    pageDescription:meta(html, "description") || meta(html, "og:description"),
    excerpt:articleText.slice(0, 1600),
    contentVerification:{
      verifiedAt:REVIEWED_AT,
      httpStatus:response.status,
      contentType:response.headers.get("content-type"),
      bytes:Buffer.byteLength(html),
      headingCount:(article.match(/<h[1-6]\b/gi) || []).length,
      articleTextChars:articleText.length,
      sha256:crypto.createHash("sha256").update(html).digest("hex")
    }
  };
}

async function main() {
  if (fs.existsSync(outputPath)) {
    const frozen = JSON.parse(fs.readFileSync(outputPath, "utf8"));
    process.stdout.write(`${frozen.records.length} frozen NVIDIA evidence records already exist for batch ${batchNumber}\n`);
    return;
  }
  const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
  const expectedCount = batchNumber === 7 ? 40 : 60;
  const candidates = inventory.records.filter(record => record.status === "pending-importance-review").slice(0, expectedCount);
  if (candidates.length !== expectedCount) throw new Error(`Expected ${expectedCount} NVIDIA candidates, got ${candidates.length}`);
  let cursor = 0;
  const records = new Array(candidates.length);
  async function worker() {
    while (cursor < candidates.length) {
      const index = cursor++;
      records[index] = await fetchOne(candidates[index], index + 1);
    }
  }
  await Promise.all(Array.from({ length:8 }, worker));
  fs.writeFileSync(outputPath, `${JSON.stringify({ reviewedAt:REVIEWED_AT, records }, null, 2)}\n`, "utf8");
  process.stdout.write(`${records.length} NVIDIA evidence records written for batch ${batchNumber}\n`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
