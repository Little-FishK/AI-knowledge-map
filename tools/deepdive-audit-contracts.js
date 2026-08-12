"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

function pageContentHash(page) {
  const canonical = JSON.stringify({
    title: page.title || "",
    subtitle: page.subtitle || "",
    thesis: page.thesis || "",
    html: page.html || "",
  });
  return `sha256:${crypto.createHash("sha256").update(canonical).digest("hex")}`;
}

function loadSectionAudit(root, id, page) {
  const file = path.join(root, "docs", "deepdive-audits", `${id}.json`);
  const inline = Array.isArray(page.quality?.sectionContracts)
    ? page.quality.sectionContracts
    : [];
  if (!fs.existsSync(file)) {
    return {
      source: "inline",
      sectionContracts: inline,
      gaps: [],
      reviewRequired: inline.length ? ["audit.inline-section-contracts"] : [],
    };
  }

  let audit;
  try {
    audit = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    return {
      source: "external",
      sectionContracts: [],
      gaps: [`audit.invalid-json.${id}`],
      reviewRequired: [],
    };
  }
  const gaps = [];
  if (![1, 2].includes(audit.schemaVersion)) gaps.push("audit.unsupported-schema");
  if (audit.pageId !== id) gaps.push("audit.page-id-mismatch");
  if (audit.pageHash !== pageContentHash(page)) gaps.push("audit.page-hash-mismatch");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(audit.reviewedAt || "")) {
    gaps.push("audit.invalid-review-date");
  } else if (audit.reviewedAt > new Date().toISOString().slice(0, 10)) {
    gaps.push("audit.future-review-date");
  }
  if (!Array.isArray(audit.sections)) gaps.push("audit.missing-sections");
  const schemaV2 = audit.schemaVersion === 2;
  return {
    // schema v2 审计与当前候选哈希绑定，优先使用它对“新正文”的逐节定位；
    // 页面内合同可能因返修重写而陈旧。schema v1 保持旧兼容路径。
    source: schemaV2
      ? "external-v2"
      : (inline.length ? "external+inline" : "external"),
    sectionContracts: schemaV2
      ? (Array.isArray(audit.sections) ? audit.sections : [])
      : (inline.length ? inline : (Array.isArray(audit.sections) ? audit.sections : [])),
    gaps,
    reviewRequired: [],
  };
}

module.exports = { loadSectionAudit, pageContentHash };
