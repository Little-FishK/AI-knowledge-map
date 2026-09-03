"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { semanticFingerprint } = require("../../tools/graph/diagnostics");
const { readGraphDual } = require("../../tools/graph/dual-read");
const {
  GRAPH_SHADOW_RELATIVE_PATH,
  buildGraphShadow,
  materializeGraphArtifact,
  prepareGraphAuthorityWrite,
  promoteGraphWriteAuthority,
  renderGraphSource,
  syncGraphShadow,
  verifyGraphAuthority,
  writeGraphAuthority,
} = require("../../tools/graph/shadow");

function sampleGraph() {
  return {
    meta: { version: "1.0" },
    core: ["alpha"],
    recommendedLearningPath: [{ phase: "基础", steps: [["1", "alpha"], ["1.1", "beta"]] }],
    positions: { alpha: [0, 0], beta: [100, 100] },
    domains: { foundations: { title: "基础" } },
    edgeTypes: { requires: { directed: true } },
    nodes: [
      { id: "alpha", domain: "foundations", body: "Alpha [[beta]]" },
      { id: "beta", domain: "foundations", body: "Beta" },
    ],
    edges: [{ from: "alpha", to: "beta", type: "requires" }],
  };
}

function snapshot(directory) {
  const files = new Map();
  const visit = current => {
    fs.readdirSync(current, { withFileTypes: true }).forEach(entry => {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else files.set(path.relative(directory, absolute), fs.readFileSync(absolute, "utf8"));
    });
  };
  visit(directory);
  return files;
}

const root = fs.mkdtempSync(path.join(os.tmpdir(), "graph-write-authority-"));
try {
  fs.mkdirSync(path.join(root, "data"), { recursive: true });
  const graphFile = path.join(root, "data", "graph.js");
  const graph = sampleGraph();
  fs.writeFileSync(graphFile, `window.GRAPH=${JSON.stringify(graph)};\n`, "utf8");
  const digest = semanticFingerprint(graph);
  buildGraphShadow(root, digest);
  const storeDirectory = path.join(root, GRAPH_SHADOW_RELATIVE_PATH);
  const legacyBefore = snapshot(storeDirectory);
  const sourceBefore = fs.readFileSync(graphFile, "utf8");
  assert.throws(
    () => promoteGraphWriteAuthority(root, `sha256:${"0".repeat(64)}`),
    /已经变化/,
  );
  assert.deepStrictEqual(snapshot(storeDirectory), legacyBefore);
  assert.strictEqual(fs.readFileSync(graphFile, "utf8"), sourceBefore);

  const promoted = promoteGraphWriteAuthority(root, digest);
  assert.strictEqual(promoted.status, "promoted");
  assert.strictEqual(promoted.writeAuthority, "shards");
  assert.strictEqual(promoted.runtimeArtifactGenerated, true);
  assert.strictEqual(fs.readFileSync(graphFile, "utf8"), renderGraphSource(graph));
  assert.strictEqual(verifyGraphAuthority(root, digest).manifest.schemaVersion, 2);
  assert.strictEqual(prepareGraphAuthorityWrite(root).sourceDigest, digest);
  assert.strictEqual(promoteGraphWriteAuthority(root, digest).status, "reused");
  const promotedRead = readGraphDual(root, digest);
  assert.strictEqual(promotedRead.report.returnedGraphSource, "generated-artifact");
  assert.strictEqual(promotedRead.report.writeAuthority, "shards");
  assert.strictEqual(promotedRead.report.comparison.generatedArtifactExact, true);

  const lockFile = path.join(root, "data", ".graph-authority-write.lock");
  fs.writeFileSync(lockFile, "occupied\n", "utf8");
  assert.throws(
    () => writeGraphAuthority(root, graph, { expectedPreviousDigest: digest }),
    /另一个图分片权威写入事务/,
  );
  fs.unlinkSync(lockFile);

  const beforeUpdate = snapshot(storeDirectory);
  const updated = JSON.parse(JSON.stringify(graph));
  updated.nodes[0].body = "Alpha updated [[beta]]";
  const written = writeGraphAuthority(root, updated, { expectedPreviousDigest: digest });
  const updatedDigest = semanticFingerprint(updated);
  assert.strictEqual(written.status, "written");
  assert.strictEqual(written.sourceDigest, updatedDigest);
  assert.strictEqual(fs.readFileSync(graphFile, "utf8"), renderGraphSource(updated));
  const afterUpdate = snapshot(storeDirectory);
  const changedStoreFiles = [...afterUpdate.keys()].filter(file => afterUpdate.get(file) !== beforeUpdate.get(file));
  assert.deepStrictEqual(changedStoreFiles.sort(), [
    "manifest.json",
    path.join("nodes", "foundations", "alpha.json"),
  ].sort());

  const stableSource = fs.readFileSync(graphFile, "utf8");
  const stableStore = snapshot(storeDirectory);
  const next = JSON.parse(JSON.stringify(updated));
  next.nodes[1].body = "Beta next";
  assert.throws(
    () => writeGraphAuthority(root, next, {
      expectedPreviousDigest: updatedDigest,
      failpoint: "after-shards",
    }),
    /模拟故障/,
  );
  assert.strictEqual(fs.readFileSync(graphFile, "utf8"), stableSource);
  assert.deepStrictEqual(snapshot(storeDirectory), stableStore);
  assert.strictEqual(fs.existsSync(lockFile), false);
  assert.throws(
    () => writeGraphAuthority(root, next, {
      expectedPreviousDigest: updatedDigest,
      failpoint: "after-artifact",
    }),
    /模拟故障/,
  );
  assert.strictEqual(fs.readFileSync(graphFile, "utf8"), stableSource);
  assert.deepStrictEqual(snapshot(storeDirectory), stableStore);
  assert.strictEqual(fs.existsSync(lockFile), false);

  const invalid = JSON.parse(JSON.stringify(updated));
  invalid.edges.push({ from: "alpha", to: "missing", type: "requires" });
  assert.throws(
    () => writeGraphAuthority(root, invalid, { expectedPreviousDigest: updatedDigest }),
    /引用完整性检查/,
  );
  assert.strictEqual(fs.readFileSync(graphFile, "utf8"), stableSource);
  assert.deepStrictEqual(snapshot(storeDirectory), stableStore);

  fs.writeFileSync(graphFile, `window.GRAPH=${JSON.stringify(updated)};\n`, "utf8");
  assert.throws(() => readGraphDual(root, updatedDigest), /确定性产物不一致/);
  assert.throws(() => prepareGraphAuthorityWrite(root), /直接修改/);
  const materialized = materializeGraphArtifact(root, updatedDigest);
  assert.strictEqual(materialized.status, "materialized");
  assert.strictEqual(readGraphDual(root, updatedDigest).report.status, "valid");

  const rogueArtifact = JSON.parse(JSON.stringify(updated));
  rogueArtifact.nodes[0].body = "direct artifact edit";
  fs.writeFileSync(graphFile, renderGraphSource(rogueArtifact), "utf8");
  assert.throws(
    () => syncGraphShadow(root, { expectedPreviousDigest: updatedDigest }),
    /禁止从 graph\.js 反向覆盖/,
  );
  assert.deepStrictEqual(snapshot(storeDirectory), stableStore);
  materializeGraphArtifact(root, updatedDigest);
  assert.strictEqual(readGraphDual(root, updatedDigest).report.status, "valid");
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

console.log("✓ graph shards are the write authority and generated graph.js fails closed with rollback");
