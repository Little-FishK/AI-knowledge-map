/* Verify every reviewed Google / Google DeepMind source page. */
"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const batchNumber = String(process.argv[2] || "01").padStart(2, "0");
if (!["01", "02"].includes(batchNumber)) throw new Error(`Unsupported Google batch: ${batchNumber}`);
const auditPath = path.join(PROJECT_ROOT, "proposals", "official-technical", `google-deepmind-importance-batch-${batchNumber}.json`);
const audit = require(auditPath);
let cursor = 0;

async function worker() {
  while (cursor < audit.records.length) {
    const record = audit.records[cursor++];
    const response = await fetch(record.url, { headers:{ "user-agent":"ai-knowledge-map-google-review/1.0" } });
    const body = await response.text();
    record.contentVerification = {
      verifiedAt:"2026-09-24", httpStatus:response.status,
      contentType:response.headers.get("content-type") || "",
      bytes:Buffer.byteLength(body), headingCount:(body.match(/^#{1,6}\s+/gm) || []).length,
      sha256:crypto.createHash("sha256").update(body).digest("hex")
    };
    const movedStub = body.length < 200 && /this page has moved/i.test(body) && record.decision.startsWith("rejected-");
    record.contentVerification.movedStub = movedStub;
    if (!response.ok || (body.length < 200 && !movedStub)) throw new Error(`${record.sequence} ${record.url}: HTTP ${response.status}, ${body.length} chars`);
  }
}

Promise.all(Array.from({ length:10 }, worker)).then(() => {
  audit.contentVerification = { status:"complete", verifiedAt:"2026-09-24", verifiedRecords:audit.records.length,
    rule:"官方页面必须成功响应且正文不少于 200 字符；明确标示已迁移且已淘汰的短占位页例外。哈希用于识别后续内容漂移。" };
  fs.writeFileSync(auditPath, `${JSON.stringify(audit, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify(audit.contentVerification)}\n`);
}).catch(error => { console.error(error); process.exitCode = 1; });
