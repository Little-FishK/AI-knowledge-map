"use strict";

const path = require("path");
const { parseArgs, readJson, writeJson } = require("./core");
const { rollbackNodeReceipt } = require("./node-application");

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.receipt || !args.write) {
    console.error("用法：node tools/video-ingest/rollback-node-application.js --receipt <receipt.json> --write [--root path] [--output rollback.json]");
    process.exit(2);
  }
  const receipt = readJson(path.resolve(args.receipt));
  const result = rollbackNodeReceipt(receipt, {
    root: args.root ? path.resolve(args.root) : undefined
  });
  if (args.output) writeJson(path.resolve(args.output), result);
  console.log(`✓ 已回滚新节点应用：${receipt.planHash}`);
}

if (require.main === module) main();
