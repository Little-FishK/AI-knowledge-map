"use strict";

const { resolveProjectRoot } = require("../shared/project-root");
const { readGraphDual } = require("./dual-read");

function option(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

try {
  const result = readGraphDual(
    resolveProjectRoot("GRAPH_ROOT"),
    option("--expected-source-digest"),
  );
  process.stdout.write(`${JSON.stringify(result.report, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`图数据双读验证失败：${error.message}\n`);
  process.exitCode = 1;
}
