"use strict";

const fs = require("fs");
const path = require("path");
const { parseArgs, readJson, writeJson } = require("./core");
const { calibrate, renderCalibration } = require("./calibration");

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.batch || !args.labels || !args.output) {
    console.error("用法：node tools/video-ingest/calibrate-shadow.js --batch <shadow-batch.json> --labels <labels.json> --output <calibration.json>");
    process.exit(2);
  }
  const batch = readJson(path.resolve(args.batch));
  const labels = readJson(path.resolve(args.labels));
  const report = calibrate(batch, labels);
  const output = path.resolve(args.output);
  writeJson(output, report);
  fs.writeFileSync(output.replace(/\.json$/i, "") + ".md", renderCalibration(report), "utf8");
  console.log(`✓ v0.5 影子校准报告已生成：${output}`);
  console.log(`  自动应用开发就绪=${report.readyForAutomaticApplicationDevelopment}`);
  console.log(`  正式写入=${report.formalWrites}`);
  if (report.errors.length) process.exitCode = 1;
}

if (require.main === module) main();
