/* Verify that every reviewed Anthropic page resolves to substantive official Markdown. */
"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const batchNumber = String(process.argv[2] || "01").padStart(2, "0");
if (!/^(01|02|03|04)$/.test(batchNumber)) throw new Error(`Unsupported Anthropic batch: ${batchNumber}`);
const auditPath = path.join(PROJECT_ROOT, "proposals", "official-technical", `anthropic-importance-batch-${batchNumber}.json`);
const audit = require(auditPath);
const records = audit.records;
let cursor = 0;

async function worker() {
  while (cursor < records.length) {
    const record = records[cursor++];
    const response = await fetch(record.url, { headers:{ "user-agent":"ai-knowledge-map-anthropic-review/1.0" } });
    const body = await response.text();
    record.contentVerification = {
      verifiedAt:"2026-09-24",
      httpStatus:response.status,
      contentType:response.headers.get("content-type") || "",
      bytes:Buffer.byteLength(body),
      headingCount:(body.match(/^#{1,6}\s+/gm) || []).length,
      sha256:crypto.createHash("sha256").update(body).digest("hex")
    };
    if (!response.ok || body.length < 200) throw new Error(`${record.sequence} ${record.url}: HTTP ${response.status}, ${body.length} chars`);
  }
}

Promise.all(Array.from({ length:8 }, worker)).then(() => {
  audit.contentVerification = {
    status:"complete", verifiedAt:"2026-09-24", verifiedRecords:records.length,
    rule:"官方 Markdown 必须成功响应且正文不少于 200 字符；哈希用于识别后续内容漂移。"
  };
  fs.writeFileSync(auditPath, `${JSON.stringify(audit, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify(audit.contentVerification)}\n`);
}).catch(error => { console.error(error); process.exitCode = 1; });
