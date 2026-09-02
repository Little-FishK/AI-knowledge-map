"use strict";

const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { loadDeepDivePages } = require("../runtime/deepdive-loader");
const {
  loadStandalonePageDirectory,
  pageRegistrationSource,
} = require("../runtime/standalone-page-source");
const { pageContentHash } = require("./deepdive-audit-contracts");
const { resolveProjectRoot } = require("../../shared/project-root");

function fullPageHash(page) {
  return `sha256:${crypto.createHash("sha256").update(JSON.stringify(page)).digest("hex")}`;
}

function verifyStandaloneSources(root) {
  const sourcePages = JSON.parse(JSON.stringify(loadDeepDivePages(root)));
  const ids = Object.keys(sourcePages).sort();
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "deepdive-standalone-verify-"));
  try {
    ids.forEach(id => {
      fs.writeFileSync(
        path.join(fixture, `${id}.js`),
        pageRegistrationSource(id, sourcePages[id], "Canonical standalone deep-dive page. Managed by the Stage 2 controller."),
        "utf8",
      );
    });
    const roundTripPages = loadStandalonePageDirectory(fixture, {
      // Reverse enumeration deliberately: filenames must never define content precedence.
      filenames: fs.readdirSync(fixture).reverse(),
    });
    assert.deepStrictEqual(Object.keys(roundTripPages).sort(), ids, "独立源码往返后的页面 ID 集合不一致");
    ids.forEach(id => {
      assert.deepStrictEqual(roundTripPages[id], sourcePages[id], `${id}: 完整页面对象无法无损往返`);
      assert.strictEqual(fullPageHash(roundTripPages[id]), fullPageHash(sourcePages[id]), `${id}: 完整页面哈希不一致`);
      assert.strictEqual(pageContentHash(roundTripPages[id]), pageContentHash(sourcePages[id]), `${id}: 审计内容哈希不一致`);
    });
    return {
      pageCount: ids.length,
      pageIds: ids,
      digest: `sha256:${crypto.createHash("sha256").update(
        ids.map(id => `${id}:${fullPageHash(sourcePages[id])}`).join("\n"),
      ).digest("hex")}`,
    };
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
}

if (require.main === module) {
  const root = resolveProjectRoot("DEEPDIVE_ROOT");
  const report = verifyStandaloneSources(root);
  console.log(`✓ ${report.pageCount} 个独立理解原理页与文件枚举顺序无关且可完整往返`);
  console.log(`  规范源码摘要：${report.digest}`);
}

module.exports = { fullPageHash, verifyStandaloneSources };
