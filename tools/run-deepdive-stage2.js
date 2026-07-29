"use strict";

const fs = require("fs");
const path = require("path");
const {
  ROOT,
  claimTask,
  enqueueNewNode,
  initialize,
  retry,
  setPaused,
  status,
  submitResult,
} = require("./deepdive-stage2/core");

function parseArgs(argv) {
  const command = argv[0] || "status";
  const options = {};
  const positionals = [];
  for (let index = 1; index < argv.length; index++) {
    const item = argv[index];
    if (!item.startsWith("--")) {
      positionals.push(item);
      continue;
    }
    const key = item.slice(2);
    const next = argv[index + 1];
    if (next == null || next.startsWith("--")) options[key] = true;
    else {
      options[key] = next;
      index++;
    }
  }
  return { command, options, positionals };
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

function print(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function main() {
  const { command, options, positionals } = parseArgs(process.argv.slice(2));
  const root = path.resolve(options.root || process.env.DEEPDIVE_STAGE2_ROOT || ROOT);
  if (command === "init") {
    const initialized = initialize(root, { force: Boolean(options.force) });
    return print({
      pageCount: initialized.pageCount,
      supplementsImported: initialized.supplementsImported,
      status: status(root),
    });
  }
  if (command === "status") return print(status(root));
  if (command === "pause") return print(setPaused(root, true));
  if (command === "resume") return print(setPaused(root, false));
  if (command === "retry") return print(retry(root, positionals[0] || options.id));
  if (command === "claim") return print(claimTask(root, options.worker || "manual-cli"));
  if (command === "submit") {
    if (!options.input) throw new Error("submit 需要 --input <result.json>");
    return print(submitResult(root, readJson(options.input)));
  }
  if (command === "enqueue-new") {
    if (!options.integration || !options.material) {
      throw new Error("enqueue-new 需要 --integration <json> --material <json>");
    }
    return print(enqueueNewNode(root, readJson(options.integration), readJson(options.material)));
  }
  throw new Error(`未知命令：${command}`);
}

try {
  main();
} catch (error) {
  console.error(`✗ ${error.message}`);
  process.exitCode = 1;
}
