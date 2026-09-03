"use strict";

const fs = require("fs");
const path = require("path");
const { isDeepStrictEqual } = require("util");
const {
  GRAPH_RELATIVE_PATH,
  loadGraphSource,
  semanticFingerprint,
} = require("./diagnostics");
const { renderGraphSource, verifyGraphShadow } = require("./shadow");

function validDigest(value) {
  return /^sha256:[a-f0-9]{64}$/.test(String(value || ""));
}

function sectionDigests(graph) {
  return Object.fromEntries(
    Object.entries(graph).map(([section, value]) => [section, semanticFingerprint(value)]),
  );
}

function readGraphDual(root, expectedSourceDigest = null) {
  if (expectedSourceDigest != null && !validDigest(expectedSourceDigest)) {
    throw new Error("expectedSourceDigest 必须是完整 SHA-256 语义指纹");
  }
  const resolvedRoot = path.resolve(root);
  const sourceFile = path.join(resolvedRoot, GRAPH_RELATIVE_PATH);
  const sourceBefore = fs.readFileSync(sourceFile, "utf8");
  const official = loadGraphSource(resolvedRoot).graph;
  const officialDigest = semanticFingerprint(official);
  if (expectedSourceDigest && officialDigest !== expectedSourceDigest) {
    throw new Error("正式 graph.js 语义指纹已经变化；请重新运行只读诊断");
  }

  const firstShadowRead = verifyGraphShadow(resolvedRoot, officialDigest);
  const shardsAreAuthoritative = firstShadowRead.report.writeAuthority === "shards";
  if (!isDeepStrictEqual(firstShadowRead.graph, official)) {
    throw new Error("正式 graph.js 与分片影子深度不等价");
  }
  const officialSections = sectionDigests(official);
  const shadowSections = sectionDigests(firstShadowRead.graph);
  if (!isDeepStrictEqual(officialSections, shadowSections)) {
    throw new Error("正式 graph.js 与分片影子的区块语义指纹不一致");
  }
  if (shardsAreAuthoritative && sourceBefore !== renderGraphSource(firstShadowRead.graph)) {
    throw new Error("生成的 graph.js 与权威图分片的确定性产物不一致");
  }

  const secondShadowRead = verifyGraphShadow(resolvedRoot, officialDigest);
  if (!isDeepStrictEqual(secondShadowRead.graph, firstShadowRead.graph)
    || !isDeepStrictEqual(secondShadowRead.manifest, firstShadowRead.manifest)) {
    throw new Error("图分片影子在双读验证期间发生变化");
  }
  const sourceAfter = fs.readFileSync(sourceFile, "utf8");
  if (sourceAfter !== sourceBefore) throw new Error("正式 graph.js 在双读验证期间发生变化");

  return {
    graph: official,
    report: {
      schemaVersion: 1,
      status: "valid",
      readOnly: true,
      operationalReadPath: GRAPH_RELATIVE_PATH,
      returnedGraphSource: shardsAreAuthoritative ? "generated-artifact" : "official",
      writeAuthority: shardsAreAuthoritative ? "shards" : "official-graph",
      source: {
        digest: officialDigest,
        bytes: Buffer.byteLength(sourceBefore, "utf8"),
        nodes: Array.isArray(official.nodes) ? official.nodes.length : 0,
        edges: Array.isArray(official.edges) ? official.edges.length : 0,
      },
      shadow: {
        digest: firstShadowRead.report.semanticDigest,
        verifiedReads: 2,
        fileCount: firstShadowRead.report.fileCount,
        nodeFileCount: firstShadowRead.report.nodeFileCount,
        integrityIssueCount: firstShadowRead.report.integrityIssueCount,
      },
      comparison: {
        deepEqual: true,
        semanticDigestMatches: officialDigest === firstShadowRead.report.semanticDigest,
        sectionDigestsMatch: true,
        topLevelSectionsMatch: isDeepStrictEqual(
          Object.keys(official).sort(),
          Object.keys(firstShadowRead.graph).sort(),
        ),
        nodeOrderMatches: isDeepStrictEqual(
          (official.nodes || []).map(node => node.id),
          (firstShadowRead.graph.nodes || []).map(node => node.id),
        ),
        edgeOrderMatches: isDeepStrictEqual(official.edges || [], firstShadowRead.graph.edges || []),
        generatedArtifactExact: !shardsAreAuthoritative
          || sourceBefore === renderGraphSource(firstShadowRead.graph),
      },
      safeguards: {
        officialGraphReturned: !shardsAreAuthoritative,
        generatedArtifactReturned: shardsAreAuthoritative,
        sourceWritten: false,
        shadowWritten: false,
        frontendReadPathChanged: false,
        graphValuesIncludedInReport: false,
      },
    },
  };
}

module.exports = { readGraphDual, sectionDigests };
