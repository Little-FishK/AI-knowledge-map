"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const {
  loadGraphSource,
  semanticFingerprint,
} = require("../../tools/graph/diagnostics");
const {
  buildGraphShadow,
  promoteGraphWriteAuthority,
} = require("../../tools/graph/shadow");
const { readGraphDual } = require("../../tools/graph/dual-read");

const projectRoot = path.resolve(__dirname, "../..");
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "graph-layout-double-write-"));

try {
  fs.mkdirSync(path.join(fixture, "data"), { recursive: true });
  fs.mkdirSync(path.join(fixture, "assets"), { recursive: true });
  const sourceGraphFile = path.join(projectRoot, "data", "graph.js");
  const firstNodeId = loadGraphSource(projectRoot).graph.nodes[0].id;
  const source = fs.readFileSync(sourceGraphFile, "utf8");
  const changedSource = source.replace(
    new RegExp(`(${JSON.stringify(firstNodeId)}:\\s*)\\[[^\\]]+\\]`),
    "$1[9999, 9999]",
  );
  assert.notStrictEqual(changedSource, source);
  fs.writeFileSync(path.join(fixture, "data", "graph.js"), changedSource, "utf8");
  const graph = JSON.parse(JSON.stringify(loadGraphSource(fixture).graph));
  fs.copyFileSync(
    path.join(projectRoot, "assets", "layout-quality.js"),
    path.join(fixture, "assets", "layout-quality.js"),
  );
  const beforeDigest = semanticFingerprint(graph);
  buildGraphShadow(fixture, beforeDigest);
  promoteGraphWriteAuthority(fixture, beforeDigest);

  const result = spawnSync(process.execPath, [path.join(projectRoot, "tools", "graph", "gen-disc-layout.js")], {
    cwd: fixture,
    encoding: "utf8",
    env: { ...process.env, GRAPH_ROOT: fixture },
  });
  assert.strictEqual(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /已通过权威分片写入 130 个节点坐标/);
  assert.match(result.stdout, /written/);

  const dualRead = readGraphDual(fixture);
  assert.strictEqual(dualRead.report.comparison.deepEqual, true);
  assert.notStrictEqual(dualRead.report.source.digest, beforeDigest);
  assert.notDeepStrictEqual(dualRead.graph.positions[firstNodeId], [9999, 9999]);
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}

console.log("✓ 圆盘布局写入会同步更新图分片影子并保持双读等价");
