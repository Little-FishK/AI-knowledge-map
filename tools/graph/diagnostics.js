"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const zlib = require("zlib");

const GRAPH_RELATIVE_PATH = "data/graph.js";
const SEMANTIC_FINGERPRINT_ALGORITHM = "sha256-canonical-json-v1";
const DETAIL_FIELDS = new Set(["body", "cases", "sources"]);

function jsonBytes(value) {
  const serialized = JSON.stringify(value);
  return Buffer.byteLength(serialized === undefined ? "null" : serialized, "utf8");
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value).sort().map(key => [key, canonicalize(value[key])]),
  );
}

function semanticFingerprint(value) {
  const normalized = JSON.parse(JSON.stringify(value));
  const canonical = JSON.stringify(canonicalize(normalized));
  return `sha256:${crypto.createHash("sha256").update(canonical).digest("hex")}`;
}

function lineCount(source) {
  if (!source) return 0;
  const lines = source.split(/\r\n|\r|\n/).length;
  return /(?:\r\n|\r|\n)$/.test(source) ? lines - 1 : lines;
}

function parseGraphSource(source, filename = GRAPH_RELATIVE_PATH) {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(source, context, { filename, timeout: 1000 });
  const graph = context.window.GRAPH;
  if (!graph || typeof graph !== "object" || Array.isArray(graph)) {
    throw new Error("data/graph.js 未注册有效的 window.GRAPH 对象");
  }
  return JSON.parse(JSON.stringify(graph));
}

function loadGraphSource(root) {
  const file = path.join(path.resolve(root), GRAPH_RELATIVE_PATH);
  const source = fs.readFileSync(file, "utf8");
  return {
    file,
    graph: parseGraphSource(source, file),
    source,
  };
}

function compactGraph(graph) {
  return {
    ...graph,
    nodes: (graph.nodes || []).map(node => Object.fromEntries(
      Object.entries(node).filter(([field]) => !DETAIL_FIELDS.has(field)),
    )),
  };
}

function integrityReport(graph) {
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  const edges = Array.isArray(graph.edges) ? graph.edges : [];
  const nodeIds = nodes.map(node => node && node.id).filter(Boolean);
  const ids = new Set(nodeIds);
  const duplicateNodeIds = nodeIds.filter((id, index) => nodeIds.indexOf(id) !== index);
  const danglingEdges = edges.filter(edge => !edge || !ids.has(edge.from) || !ids.has(edge.to));
  const unknownEdgeTypes = edges.filter(edge => edge && !(graph.edgeTypes || {})[edge.type]);
  const unknownDomains = nodes.filter(node => node && !(graph.domains || {})[node.domain]);
  const missingPositions = nodes.filter(node => node && !(graph.positions || {})[node.id]);
  const extraPositions = Object.keys(graph.positions || {}).filter(id => !ids.has(id));
  const steps = (graph.recommendedLearningPath || []).flatMap(phase => phase.steps || []);
  const pathIds = steps.map(step => step && step[1]).filter(Boolean);
  const pathOrders = steps.map(step => String(step && step[0]));
  const duplicatePathIds = pathIds.filter((id, index) => pathIds.indexOf(id) !== index);
  const duplicatePathOrders = pathOrders.filter((order, index) => pathOrders.indexOf(order) !== index);
  const danglingPathSteps = pathIds.filter(id => !ids.has(id));
  const missingPathNodes = nodeIds.filter(id => !pathIds.includes(id));
  let inlineReferences = 0;
  let brokenInlineReferences = 0;
  let selfReferences = 0;
  nodes.forEach(node => {
    const texts = [node && node.body || ""].concat(
      Array.isArray(node && node.cases) ? node.cases.map(item => item && item.text || "") : [],
    );
    texts.forEach(text => {
      for (const match of String(text).matchAll(/\[\[([a-z0-9-]+)\]\]/g)) {
        inlineReferences += 1;
        if (!ids.has(match[1])) brokenInlineReferences += 1;
        if (match[1] === node.id) selfReferences += 1;
      }
    });
  });

  const counts = {
    duplicateNodeIds: new Set(duplicateNodeIds).size,
    danglingEdges: danglingEdges.length,
    unknownEdgeTypes: unknownEdgeTypes.length,
    unknownDomains: unknownDomains.length,
    missingPositions: missingPositions.length,
    extraPositions: extraPositions.length,
    duplicatePathIds: new Set(duplicatePathIds).size,
    duplicatePathOrders: new Set(duplicatePathOrders).size,
    danglingPathSteps: danglingPathSteps.length,
    missingPathNodes: missingPathNodes.length,
    brokenInlineReferences,
    selfReferences,
  };
  const codes = Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([name]) => name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`));
  return {
    status: codes.length ? "invalid" : "valid",
    issueCount: Object.values(counts).reduce((sum, count) => sum + count, 0),
    codes,
    counts,
    inlineReferences,
  };
}

function diagnoseGraph(root) {
  const { file, graph, source } = loadGraphSource(root);
  const sourceBuffer = Buffer.from(source, "utf8");
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  const edges = Array.isArray(graph.edges) ? graph.edges : [];
  const compact = compactGraph(graph);
  const graphBytes = jsonBytes(graph);
  const compactBytes = jsonBytes(compact);
  const extractableDetailBytes = Math.max(0, graphBytes - compactBytes);
  const sectionBytes = Object.fromEntries(
    Object.entries(graph).map(([section, value]) => [section, jsonBytes(value)]),
  );
  const sectionDigests = Object.fromEntries(
    Object.entries(graph).map(([section, value]) => [section, semanticFingerprint(value)]),
  );
  const domainStats = new Map();
  const largestNodes = [];
  let summaryBytes = 0;
  let bodyBytes = 0;
  let caseBytes = 0;
  let sourceReferenceBytes = 0;
  nodes.forEach(node => {
    summaryBytes += jsonBytes(node.summary);
    bodyBytes += jsonBytes(node.body);
    caseBytes += jsonBytes(node.cases);
    sourceReferenceBytes += jsonBytes(node.sources);
    const nodeBytes = jsonBytes(node);
    const detailBytes = jsonBytes({
      body: node.body,
      cases: node.cases,
      sources: node.sources,
    });
    const domain = String(node.domain || "[missing]");
    const current = domainStats.get(domain) || { domain, nodes: 0, bytes: 0, detailBytes: 0 };
    current.nodes += 1;
    current.bytes += nodeBytes;
    current.detailBytes += detailBytes;
    domainStats.set(domain, current);
    largestNodes.push({ id: String(node.id || "[missing]"), bytes: nodeBytes, detailBytes });
  });

  const riskCodes = [];
  if (sourceBuffer.length >= 256 * 1024) riskCodes.push("source-file-over-256kb");
  if (lineCount(source) >= 2000) riskCodes.push("source-file-over-2000-lines");
  if ((sectionBytes.nodes || 0) / Math.max(1, graphBytes) >= 0.7) {
    riskCodes.push("nodes-over-70-percent-of-graph");
  }
  if (extractableDetailBytes / Math.max(1, graphBytes) >= 0.5) {
    riskCodes.push("lazy-detail-opportunity-over-50-percent");
  }
  riskCodes.push("single-edit-boundary", "executable-data-source");

  return {
    schemaVersion: 1,
    status: "diagnosed",
    readOnly: true,
    source: {
      logicalPath: GRAPH_RELATIVE_PATH,
      bytes: sourceBuffer.length,
      lines: lineCount(source),
      gzipBytes: zlib.gzipSync(sourceBuffer).length,
      brotliBytes: zlib.brotliCompressSync(sourceBuffer).length,
    },
    structure: {
      topLevelSections: Object.keys(graph),
      nodes: nodes.length,
      edges: edges.length,
      coreNodes: Array.isArray(graph.core) ? graph.core.length : 0,
      positions: Object.keys(graph.positions || {}).length,
      domains: Object.keys(graph.domains || {}).length,
      edgeTypes: Object.keys(graph.edgeTypes || {}).length,
      learningPathPhases: Array.isArray(graph.recommendedLearningPath)
        ? graph.recommendedLearningPath.length
        : 0,
      learningPathSteps: (graph.recommendedLearningPath || [])
        .reduce((count, phase) => count + (phase.steps || []).length, 0),
    },
    storage: {
      serializedGraphBytes: graphBytes,
      sectionBytes,
      nodeContentBytes: {
        summary: summaryBytes,
        body: bodyBytes,
        cases: caseBytes,
        sources: sourceReferenceBytes,
      },
      compactRuntimeBytes: compactBytes,
      extractableDetailBytes,
      potentialInitialDataReductionPercent: graphBytes
        ? Number(((extractableDetailBytes / graphBytes) * 100).toFixed(2))
        : 0,
      domains: [...domainStats.values()].sort((left, right) =>
        right.bytes - left.bytes || left.domain.localeCompare(right.domain)),
      largestNodes: largestNodes
        .sort((left, right) => right.bytes - left.bytes || left.id.localeCompare(right.id))
        .slice(0, 10),
    },
    semanticFingerprint: {
      algorithm: SEMANTIC_FINGERPRINT_ALGORITHM,
      digest: semanticFingerprint(graph),
      sectionDigests,
      objectKeyOrderIgnored: true,
      arrayOrderPreserved: true,
    },
    integrity: integrityReport(graph),
    riskCodes,
    safeguards: {
      sourceWritten: false,
      generatedFilesWritten: false,
      nodeBodiesIncluded: false,
      caseTextIncluded: false,
      sourceReferencesIncluded: false,
    },
    sourceFile: file,
  };
}

module.exports = {
  GRAPH_RELATIVE_PATH,
  SEMANTIC_FINGERPRINT_ALGORITHM,
  canonicalize,
  compactGraph,
  diagnoseGraph,
  integrityReport,
  loadGraphSource,
  parseGraphSource,
  semanticFingerprint,
};
