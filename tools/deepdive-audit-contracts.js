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
  if (audit.schemaVersion !== 1) gaps.push("audit.unsupported-schema");
  if (audit.pageId !== id) gaps.push("audit.page-id-mismatch");
  if (audit.pageHash !== pageContentHash(page)) gaps.push("audit.page-hash-mismatch");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(audit.reviewedAt || "")) {
    gaps.push("audit.invalid-review-date");
  } else if (audit.reviewedAt > new Date().toISOString().slice(0, 10)) {
    gaps.push("audit.future-review-date");
  }
  if (!Array.isArray(audit.sections)) gaps.push("audit.missing-sections");
  return {
    source: "external",
    sectionContracts: Array.isArray(audit.sections) ? audit.sections : [],
    gaps,
    reviewRequired: [],
  };
}

module.exports = { loadSectionAudit, pageContentHash };
