"use strict";

const { resolveProjectRoot } = require("../shared/project-root");
const { buildGraphShadow } = require("./shadow");

function option(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

try {
  const expectedSourceDigest = option("--expected-source-digest");
  const report = buildGraphShadow(
    resolveProjectRoot("GRAPH_ROOT"),
    expectedSourceDigest,
  );
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`图分片影子生成失败：${error.message}\n`);
  process.exitCode = 1;
}
