"use strict";

const { resolveProjectRoot } = require("../shared/project-root");
const { diagnoseGraph } = require("./diagnostics");

try {
  const report = diagnoseGraph(resolveProjectRoot("GRAPH_ROOT"));
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`图数据只读诊断失败：${error.message}\n`);
  process.exitCode = 1;
}
