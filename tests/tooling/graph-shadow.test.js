"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { semanticFingerprint } = require("../../tools/graph/diagnostics");
const {
  GRAPH_SHADOW_RELATIVE_PATH,
  buildGraphShadow,
  contentDigest,
  prepareGraphShadowWrite,
  syncGraphShadow,
  verifyGraphShadow,
} = require("../../tools/graph/shadow");

function sampleGraph() {
  return {
    meta: { version: "1.0", updatedAt: "2026-09-02" },
    core: ["alpha"],
    recommendedLearningPath: [{
      phase: "基础",
      steps: [["1", "alpha"], ["1.1", "beta"]],
    }],
    positions: { alpha: [0, 0], beta: [100, 100] },
    domains: { foundations: { title: "基础" } },
    edgeTypes: { requires: { label: "依赖", directed: true } },
    nodes: [
      {
        id: "alpha",
        title: "Alpha",
        aliases: [],
        domain: "foundations",
        summary: "Alpha 摘要",
        body: "Alpha 正文引用 [[beta]]",
        cases: [{ title: "案例", text: "Alpha 案例" }],
        sources: [],
      },
      {
        id: "beta",
        title: "Beta",
        aliases: [],
        domain: "foundations",
        summary: "Beta 摘要",
        body: "Beta 正文",
        cases: [{ title: "案例", text: "Beta 案例" }],
        sources: [],
      },
    ],
    edges: [{ from: "alpha", to: "beta", type: "requires" }],
  };
}

function createFixture(graph = sampleGraph()) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "graph-shadow-"));
  fs.mkdirSync(path.join(root, "data"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "data", "graph.js"),
    `window.GRAPH = ${JSON.stringify(graph, null, 2)};\n`,
    "utf8",
  );
  return { graph, root };
}

function cleanup(root) {
  fs.rmSync(root, { recursive: true, force: true });
}

{
  const { graph, root } = createFixture();
  try {
    const graphFile = path.join(root, "data", "graph.js");
    const before = fs.readFileSync(graphFile, "utf8");
    assert.throws(
      () => buildGraphShadow(root, `sha256:${"0".repeat(64)}`),
      /语义指纹已经变化/,
    );
    assert.strictEqual(fs.existsSync(path.join(root, GRAPH_SHADOW_RELATIVE_PATH)), false);
    assert.throws(() => prepareGraphShadowWrite(root), /图分片影子不存在/);

    const digest = semanticFingerprint(graph);
    const built = buildGraphShadow(root, digest);
    assert.strictEqual(built.status, "built");
    assert.strictEqual(built.readPathUnchanged, true);
    assert.strictEqual(built.deepEqualAfterReload, true);
    assert.strictEqual(built.sectionDigestsMatch, true);
    assert.strictEqual(built.nodeFileCount, 2);
    assert.strictEqual(built.fileCount, 9);
    assert.strictEqual(built.integrityIssueCount, 0);
    assert.strictEqual(fs.readFileSync(graphFile, "utf8"), before);

    const verified = verifyGraphShadow(root, digest);
    assert.deepStrictEqual(verified.graph, graph);
    assert.strictEqual(verified.report.sectionDigestsMatch, true);
    assert.strictEqual(buildGraphShadow(root, digest).status, "reused");
    assert.strictEqual(prepareGraphShadowWrite(root).sourceDigest, digest);

    const updatedGraph = JSON.parse(JSON.stringify(graph));
    updatedGraph.nodes[0].body += "，并完成双写";
    const updatedDigest = semanticFingerprint(updatedGraph);
    fs.writeFileSync(
      graphFile,
      `window.GRAPH = ${JSON.stringify(updatedGraph, null, 2)};\n`,
      "utf8",
    );
    const synced = syncGraphShadow(root, {
      expectedPreviousDigest: digest,
      expectedSourceDigest: updatedDigest,
    });
    assert.strictEqual(synced.status, "synced");
    assert.strictEqual(synced.previousSourceDigest, digest);
    assert.strictEqual(synced.sourceDigest, updatedDigest);
    assert.deepStrictEqual(verifyGraphShadow(root, updatedDigest).graph, updatedGraph);

    const manifestFile = path.join(root, GRAPH_SHADOW_RELATIVE_PATH, "manifest.json");
    const manifestBeforeRefusal = fs.readFileSync(manifestFile, "utf8");
    assert.throws(
      () => syncGraphShadow(root, { expectedPreviousDigest: `sha256:${"0".repeat(64)}` }),
      /来源指纹不匹配/,
    );
    assert.strictEqual(fs.readFileSync(manifestFile, "utf8"), manifestBeforeRefusal);

    const invalidOfficial = JSON.parse(JSON.stringify(updatedGraph));
    invalidOfficial.edges.push({ from: "alpha", to: "missing", type: "requires" });
    fs.writeFileSync(
      graphFile,
      `window.GRAPH = ${JSON.stringify(invalidOfficial, null, 2)};\n`,
      "utf8",
    );
    assert.throws(
      () => syncGraphShadow(root, { expectedPreviousDigest: updatedDigest }),
      /引用完整性检查/,
    );
    assert.strictEqual(fs.readFileSync(manifestFile, "utf8"), manifestBeforeRefusal);
    assert.deepStrictEqual(verifyGraphShadow(root, updatedDigest).graph, updatedGraph);
    fs.writeFileSync(
      graphFile,
      `window.GRAPH = ${JSON.stringify(updatedGraph, null, 2)};\n`,
      "utf8",
    );

    const shadowRoot = path.join(root, GRAPH_SHADOW_RELATIVE_PATH);
    const nodeFile = path.join(shadowRoot, "nodes", "foundations", "alpha.json");
    const originalNode = fs.readFileSync(nodeFile, "utf8");
    fs.writeFileSync(nodeFile, originalNode.replace("Alpha 正文", "损坏正文"), "utf8");
    assert.throws(() => verifyGraphShadow(root, updatedDigest), /摘要不匹配/);
    fs.writeFileSync(nodeFile, originalNode, "utf8");

    fs.unlinkSync(nodeFile);
    assert.throws(() => verifyGraphShadow(root, updatedDigest), /分片不存在/);
    fs.writeFileSync(nodeFile, originalNode, "utf8");

    fs.writeFileSync(path.join(shadowRoot, "unregistered.json"), "{}\n", "utf8");
    assert.throws(() => verifyGraphShadow(root, updatedDigest), /未登记文件/);
    fs.unlinkSync(path.join(shadowRoot, "unregistered.json"));

    const changedNode = JSON.parse(originalNode);
    changedNode.body += "语义变化";
    const changedContent = `${JSON.stringify(changedNode, null, 2)}\n`;
    fs.writeFileSync(nodeFile, changedContent, "utf8");
    const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
    const record = manifest.files.find(item => item.path === "nodes/foundations/alpha.json");
    record.bytes = Buffer.byteLength(changedContent, "utf8");
    record.digest = contentDigest(changedContent);
    fs.writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    assert.throws(() => verifyGraphShadow(root, updatedDigest), /整体语义指纹不匹配/);
  } finally {
    cleanup(root);
  }
}

{
  const invalid = sampleGraph();
  invalid.edges.push({ from: "alpha", to: "missing", type: "requires" });
  const { root } = createFixture(invalid);
  try {
    assert.throws(
      () => buildGraphShadow(root, semanticFingerprint(invalid)),
      /引用完整性检查/,
    );
    assert.strictEqual(fs.existsSync(path.join(root, GRAPH_SHADOW_RELATIVE_PATH)), false);
  } finally {
    cleanup(root);
  }
}

{
  const unsafe = sampleGraph();
  unsafe.nodes[0].id = "../alpha";
  unsafe.core[0] = "../alpha";
  unsafe.recommendedLearningPath[0].steps[0][1] = "../alpha";
  unsafe.positions["../alpha"] = unsafe.positions.alpha;
  delete unsafe.positions.alpha;
  unsafe.edges[0].from = "../alpha";
  const { root } = createFixture(unsafe);
  try {
    assert.throws(
      () => buildGraphShadow(root, semanticFingerprint(unsafe)),
      /不能安全映射为分片路径/,
    );
    assert.strictEqual(fs.existsSync(path.join(root, GRAPH_SHADOW_RELATIVE_PATH)), false);
  } finally {
    cleanup(root);
  }
}

console.log("✓ graph shard shadow round-trips exactly and fails closed on corrupt or unsafe shards");
