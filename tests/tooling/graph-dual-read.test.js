"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { semanticFingerprint } = require("../../tools/graph/diagnostics");
const { readGraphDual } = require("../../tools/graph/dual-read");
const { GRAPH_SHADOW_RELATIVE_PATH, buildGraphShadow } = require("../../tools/graph/shadow");

function graphFixture() {
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
        body: "Alpha 正文 [[beta]]",
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

function createFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "graph-dual-read-"));
  fs.mkdirSync(path.join(root, "data"), { recursive: true });
  return root;
}

function writeGraph(root, graph, pretty = true) {
  fs.writeFileSync(
    path.join(root, "data", "graph.js"),
    `window.GRAPH = ${JSON.stringify(graph, null, pretty ? 2 : 0)};\n`,
    "utf8",
  );
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

{
  const root = createFixture();
  try {
    const graph = graphFixture();
    writeGraph(root, graph);
    const digest = semanticFingerprint(graph);
    buildGraphShadow(root, digest);
    const graphFile = path.join(root, "data", "graph.js");
    const shadowDirectory = path.join(root, GRAPH_SHADOW_RELATIVE_PATH);
    const graphBefore = fs.readFileSync(graphFile, "utf8");
    const shadowBefore = snapshot(shadowDirectory);
    const result = readGraphDual(root, digest);

    assert.deepStrictEqual(result.graph, graph);
    assert.strictEqual(result.report.status, "valid");
    assert.strictEqual(result.report.readOnly, true);
    assert.strictEqual(result.report.returnedGraphSource, "official");
    assert.strictEqual(result.report.shadow.verifiedReads, 2);
    assert.strictEqual(result.report.comparison.deepEqual, true);
    assert.strictEqual(result.report.comparison.semanticDigestMatches, true);
    assert.strictEqual(result.report.comparison.sectionDigestsMatch, true);
    assert.strictEqual(result.report.comparison.nodeOrderMatches, true);
    assert.strictEqual(result.report.comparison.edgeOrderMatches, true);
    assert.strictEqual(JSON.stringify(result.report).includes("Alpha 正文"), false);
    assert.strictEqual(fs.readFileSync(graphFile, "utf8"), graphBefore);
    assert.deepStrictEqual(snapshot(shadowDirectory), shadowBefore);

    const reformatted = {
      edges: graph.edges,
      nodes: graph.nodes.map(node => ({
        sources: node.sources,
        cases: node.cases,
        body: node.body,
        summary: node.summary,
        domain: node.domain,
        aliases: node.aliases,
        title: node.title,
        id: node.id,
      })),
      edgeTypes: graph.edgeTypes,
      domains: graph.domains,
      positions: graph.positions,
      recommendedLearningPath: graph.recommendedLearningPath,
      core: graph.core,
      meta: graph.meta,
    };
    writeGraph(root, reformatted, false);
    assert.strictEqual(readGraphDual(root, digest).report.status, "valid");

    const changed = JSON.parse(JSON.stringify(graph));
    changed.nodes[0].body += "语义变化";
    writeGraph(root, changed);
    assert.throws(() => readGraphDual(root, digest), /正式 graph\.js 语义指纹已经变化/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

{
  const root = createFixture();
  try {
    const graph = graphFixture();
    writeGraph(root, graph);
    const digest = semanticFingerprint(graph);
    assert.throws(() => readGraphDual(root, digest), /影子清单不存在/);
    buildGraphShadow(root, digest);
    const nodeFile = path.join(
      root,
      GRAPH_SHADOW_RELATIVE_PATH,
      "nodes",
      "foundations",
      "alpha.json",
    );
    const source = fs.readFileSync(nodeFile, "utf8");
    fs.writeFileSync(nodeFile, source.replace("Alpha 正文", "损坏正文"), "utf8");
    assert.throws(() => readGraphDual(root, digest), /分片摘要不匹配/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

console.log("✓ graph dual-read returns the official graph and fails closed on any shadow divergence");
