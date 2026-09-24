"use strict";

const assert = require("node:assert");
const path = require("node:path");
const root = path.resolve(__dirname, "../..");
global.window = {};
[
  "data/graph.js", "data/software.js", "data/library.js",
  "data/library-official-technical.js", "data/library-official-china.js",
  "data/library-platform-profiles.js", "data/library-source-meta.js",
  "data/library-new-sources.js", "data/library-arxiv.js",
  "data/library-neurips-proceedings.js", "data/library-openreview.js",
  "data/library-acl-anthology.js"
].forEach(file => require(path.join(root, file)));

const items = window.PRO_LIBRARY.items;
const records = items.flatMap(item => [item, ...(item.relatedMaterials || [])]);
const nist = records.filter(item => item.sourceClass === "standards" && item.sourceSubcategory === "nist");
const cards = items.filter(item => item.sourceClass === "standards" && item.sourceSubcategory === "nist");
const isoIec = records.filter(item => item.sourceClass === "standards" && item.sourceSubcategory === "iso-iec");
const isoIecCards = items.filter(item => item.sourceClass === "standards" && item.sourceSubcategory === "iso-iec");

assert.equal(cards.length, 5, "NIST should publish five independent cards including the existing GAI profile");
assert.equal(nist.length, 8, "NIST should retain three merged version/translation records");
assert.ok(nist.every(item => item.reviewPolicy === "standards-regulatory-v1.1"));
assert.ok(nist.every(item => item.regulatoryStatus && item.bindingForce && item.reviewedAt === "2026-09-24"));
assert.equal(items.find(item => item.id === "nist-ai-600-1").reviewDecision, "merge-update");
assert.equal(items.find(item => item.id === "nist-ai-documentation-zero-draft-2026").regulatoryStatus, "draft");
assert.equal(records.find(item => item.id === "nist-ai-100-2e2023-ipd").regulatoryStatus, "withdrawn");
assert.equal(new Set(nist.map(item => item.url)).size, nist.length, "NIST records must not duplicate URLs");

assert.equal(isoIecCards.length, 7, "ISO/IEC should publish seven independent cards");
assert.equal(isoIec.length, 9, "ISO/IEC should retain two merged amendment/version records");
assert.ok(isoIec.every(item => item.reviewPolicy === "standards-regulatory-v1.1"));
assert.ok(isoIec.every(item => item.regulatoryStatus && item.bindingForce && item.reviewedAt === "2026-09-24"));
assert.equal(items.find(item => item.id === "iso-iec-dis-42007").regulatoryStatus, "consultation");
assert.equal(records.find(item => item.id === "iso-iec-tr-24030-2021").regulatoryStatus, "withdrawn");
assert.equal(records.find(item => item.id === "iso-iec-22989-2022-cd-amd-2").reviewDecision, "merge-update");
assert.equal(new Set(isoIec.map(item => item.url)).size, isoIec.length, "ISO/IEC records must not duplicate URLs");

const expectedRemainingCounts = {
  "ieee-standards": 6,
  "eu-institutions": 5,
  "uk-aisi": 5,
  "intl-ai-safety-report": 1,
  "us-ftc": 4,
  "us-caisi": 3,
  "china-cac": 5,
  "china-tc260": 6,
  "china-caict": 3,
  "oecd": 4,
  "un-agencies": 4
};

for (const [subcategory, expected] of Object.entries(expectedRemainingCounts)) {
  const sourceCards = items.filter(item => item.sourceClass === "standards" && item.sourceSubcategory === subcategory);
  assert.equal(sourceCards.length, expected, `${subcategory} should publish ${expected} independent cards`);
  assert.ok(sourceCards.every(item => item.reviewPolicy === "standards-regulatory-v1.1"));
  assert.ok(sourceCards.every(item => item.reviewDecision === "admitted"));
  assert.ok(sourceCards.every(item => item.regulatoryStatus && item.bindingForce && item.reviewedAt === "2026-09-24"));
}

const standardsCards = items.filter(item => item.sourceClass === "standards");
const standardsRecords = records.filter(item => item.sourceClass === "standards");
assert.equal(standardsCards.length, 58, "all thirteen standards/regulatory sources should publish 58 independent cards");
assert.equal(standardsRecords.length, 66, "standards records should include eight merged version or translation records");
assert.equal(new Set(standardsRecords.map(item => item.url)).size, standardsRecords.length, "standards records must not duplicate URLs");
assert.equal(items.find(item => item.id === "eu-ai-act-2024").bindingForce, "binding");
assert.equal(items.find(item => item.id === "caisi-nist-ai-800-2-ipd").regulatoryStatus, "draft");
assert.equal(items.find(item => item.id === "ftc-rite-aid-facial-recognition-order").bindingForce, "case-specific");
assert.equal(items.find(item => item.id === "tc260-gb-45438-2025").bindingForce, "binding");
assert.equal(items.find(item => item.id === "international-ai-safety-report-2026").relatedMaterials.length, 3);

console.log("PASS standards/regulatory review records for all thirteen secondary sources");
