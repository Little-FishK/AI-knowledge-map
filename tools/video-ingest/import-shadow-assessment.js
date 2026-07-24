"use strict";

const fs = require("fs");
const path = require("path");
const {
  parseArgs,
  readJson,
  writeJson
} = require("./core");
const { validateAssessment } = require("./shadow-review");

function parseModelJson(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) throw new Error("模型输出为空");
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const payload = fenced ? fenced[1] : trimmed;
  try {
    return JSON.parse(payload);
  } catch (error) {
    throw new Error("模型输出不是单一 JSON 对象：" + error.message);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input || !args.packet || !args.proposal || !args.evidence || !args.output) {
    console.error("用法：node tools/video-ingest/import-shadow-assessment.js --input <model-output.txt> --packet <packet.json> --proposal <proposal.json> --evidence <evidence.json> --output <assessment.json>");
    process.exit(2);
  }
  const packet = readJson(path.resolve(args.packet));
  const proposal = readJson(path.resolve(args.proposal));
  const evidence = readJson(path.resolve(args.evidence));
  const assessment = parseModelJson(fs.readFileSync(path.resolve(args.input), "utf8"));
  const errors = validateAssessment(assessment, proposal, evidence);
  if (assessment.proposalHash !== packet.proposalHash) errors.push("复核结果与任务包 proposalHash 不一致");
  if (assessment.evidenceHash !== packet.evidenceHash) errors.push("复核结果与任务包 evidenceHash 不一致");
  if (errors.length) {
    console.error(`✗ 独立复核结果发现 ${errors.length} 个问题：`);
    errors.forEach(error => console.error("  - " + error));
    process.exit(1);
  }
  const output = path.resolve(args.output);
  writeJson(output, assessment);
  console.log(`✓ 独立复核结果已验证并导入：${output}`);
}

if (require.main === module) main();

module.exports = { parseModelJson };
