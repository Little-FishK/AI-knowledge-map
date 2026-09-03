"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  diagnoseGraph,
  semanticFingerprint,
} = require("../../tools/graph/diagnostics");

function writeGraph(root, graph, pretty = true) {
  const directory = path.join(root, "data");
  fs.mkdirSync(directory, { recursive: true });
  const json = JSON.stringify(graph, null, pretty ? 2 : 0);
  fs.writeFileSync(path.join(directory, "graph.js"), `window.GRAPH = ${json};\n`, "utf8");
}

const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "graph-diagnostics-"));
try {
  const graph = {
    meta: { version: "1.0", updatedAt: "2026-09-02" },
    core: ["alpha"],
    recommendedLearningPath: [{ phase: "基础", steps: [["1", "alpha"], ["1.1", "beta"]] }],
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
  writeGraph(fixture, graph);
  const graphFile = path.join(fixture, "data", "graph.js");
  const before = fs.readFileSync(graphFile, "utf8");
  const report = diagnoseGraph(fixture);
  const after = fs.readFileSync(graphFile, "utf8");

  assert.strictEqual(after, before);
  assert.strictEqual(report.readOnly, true);
  assert.strictEqual(report.integrity.status, "valid");
  assert.strictEqual(report.integrity.inlineReferences, 1);
  assert.strictEqual(report.structure.nodes, 2);
  assert.strictEqual(report.structure.edges, 1);
  assert.strictEqual(report.semanticFingerprint.objectKeyOrderIgnored, true);
  assert.strictEqual(report.semanticFingerprint.arrayOrderPreserved, true);
  assert.match(report.semanticFingerprint.digest, /^sha256:[a-f0-9]{64}$/);
  assert.strictEqual(report.safeguards.nodeBodiesIncluded, false);
  assert.strictEqual(JSON.stringify(report).includes("Alpha 正文"), false);
  assert.strictEqual(JSON.stringify(report).includes("Alpha 案例"), false);

  const reordered = {
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
    meta: { updatedAt: graph.meta.updatedAt, version: graph.meta.version },
  };
  writeGraph(fixture, reordered, false);
  const reformatted = diagnoseGraph(fixture);
  assert.strictEqual(reformatted.semanticFingerprint.digest, report.semanticFingerprint.digest);
  assert.deepStrictEqual(
    reformatted.semanticFingerprint.sectionDigests,
    report.semanticFingerprint.sectionDigests,
  );

  const changed = JSON.parse(JSON.stringify(reordered));
  changed.nodes[0].body += "，语义已变化";
  writeGraph(fixture, changed);
  assert.notStrictEqual(
    diagnoseGraph(fixture).semanticFingerprint.digest,
    report.semanticFingerprint.digest,
  );

  assert.notStrictEqual(
    semanticFingerprint({ nodes: [...graph.nodes].reverse() }),
    semanticFingerprint({ nodes: graph.nodes }),
  );

  const invalid = JSON.parse(JSON.stringify(graph));
  invalid.edges.push({ from: "alpha", to: "missing", type: "unknown" });
  invalid.nodes[0].body += " [[missing]]";
  writeGraph(fixture, invalid);
  const invalidReport = diagnoseGraph(fixture);
  assert.strictEqual(invalidReport.integrity.status, "invalid");
  assert.ok(invalidReport.integrity.codes.includes("dangling-edges"));
  assert.ok(invalidReport.integrity.codes.includes("unknown-edge-types"));
  assert.ok(invalidReport.integrity.codes.includes("broken-inline-references"));

  console.log("✓ graph diagnostics are read-only and semantic fingerprints ignore formatting only");
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}
