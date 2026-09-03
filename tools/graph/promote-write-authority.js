"use strict";

const { resolveProjectRoot } = require("../shared/project-root");
const { promoteGraphWriteAuthority } = require("./shadow");

function option(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

try {
  const report = promoteGraphWriteAuthority(
    resolveProjectRoot("GRAPH_ROOT"),
    option("--expected-source-digest"),
  );
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`图分片写入权威切换失败：${error.message}\n`);
  process.exitCode = 1;
}
