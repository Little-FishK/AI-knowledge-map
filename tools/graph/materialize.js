"use strict";

const { resolveProjectRoot } = require("../shared/project-root");
const { materializeGraphArtifact } = require("./shadow");

function option(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

try {
  const report = materializeGraphArtifact(
    resolveProjectRoot("GRAPH_ROOT"),
    option("--expected-source-digest"),
  );
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`graph.js 生成失败：${error.message}\n`);
  process.exitCode = 1;
}
