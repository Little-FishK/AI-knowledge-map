"use strict";

const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const layoutQuality = require("../../assets/layout-quality.js");
const {
  ROOT,
  loadProjectData,
  sha256
} = require("./core");
const { reviewProposal } = require("./shadow-review");

function deepDiveHash(page) {
  const canonical = JSON.stringify({
    title: page.title || "",
    subtitle: page.subtitle || "",
    thesis: page.thesis || "",
    html: page.html || ""
  });
  return "sha256:" + crypto.createHash("sha256").update(canonical).digest("hex");
}

function positionObject(graph) {
  return Object.fromEntries(Object.entries(graph.positions || {}).map(([id, value]) => [
    id,
    { x: Number(value[0]), y: Number(value[1]) }
  ]));
}

function hashAngle(id) {
  const bytes = crypto.createHash("sha256").update(id).digest();
  return bytes.readUInt32BE(0) / 0xffffffff * Math.PI * 2;
}

function proposePosition(graph, node, edges) {
  const positions = positionObject(graph);
  const neighborIds = edges.map(edge => edge.from === node.id ? edge.to : edge.from)
    .filter(id => positions[id]);
  const anchors = neighborIds.length
    ? neighborIds.map(id => positions[id])
    : Object.values(positions);
  const center = anchors.reduce((sum, item) => ({
    x: sum.x + item.x / anchors.length,
    y: sum.y + item.y / anchors.length
  }), { x: 0, y: 0 });
  const nodes = [...graph.nodes, node];
  const base = hashAngle(node.id);
  for (let ring = 0; ring < 20; ring++) {
    const radius = 90 + ring * 55;
    for (let slot = 0; slot < 24; slot++) {
      const angle = base + slot / 24 * Math.PI * 2;
      const candidate = {
        x: Number((center.x + Math.cos(angle) * radius).toFixed(2)),
        y: Number((center.y + Math.sin(angle) * radius).toFixed(2))
      };
      const attempt = { ...positions, [node.id]: candidate };
      const report = layoutQuality.audit(nodes, attempt);
      if (!report.sameDomainOverlaps.length && !report.occlusionViolations.length) {
        return {
          position: candidate,
          anchors: neighborIds,
          report: {
            sameDomainOverlaps: 0,
            occlusionViolations: 0
          }
        };
      }
    }
  }
  return {
    position: null,
    anchors: neighborIds,
    report: {
      error: "在确定性搜索范围内没有找到满足布局门禁的位置"
    }
  };
}

function packageErrors(pkg, graph) {
  const errors = [];
  const node = pkg.node || {};
  const existingIds = new Set(graph.nodes.map(item => item.id));
  if (!node.id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(node.id)) errors.push("node.id 必须是 kebab-case");
  if (existingIds.has(node.id)) errors.push(`node.id 已存在：${node.id}`);
  ["title", "summary", "domain", "body"].forEach(key => {
    if (!node[key]) errors.push(`node.${key} 缺失`);
  });
  if (!graph.domains[node.domain]) errors.push(`node.domain 非法：${node.domain}`);
  if (!Array.isArray(node.cases) || !node.cases.length) errors.push("node.cases 至少需要一个案例");
  if (!Array.isArray(node.sources) || node.sources.length < 2) errors.push("node.sources 至少需要两个来源");
  (node.sources || []).forEach((source, index) => {
    if (!source || !/^https:\/\//.test(source.ref || source.url || "")) {
      errors.push(`node.sources[${index}] 必须是 HTTPS 来源`);
    }
  });
  const refs = [];
  const refRe = /\[\[([a-z0-9-]+)\]\]/g;
  [node.body, ...(node.cases || []).map(item => item.text)].forEach(text => {
    let match;
    while ((match = refRe.exec(String(text || "")))) refs.push(match[1]);
  });
  refs.forEach(id => {
    if (id !== node.id && !existingIds.has(id)) errors.push(`节点正文引用不存在节点 [[${id}]]`);
  });
  if (!Array.isArray(pkg.edges) || pkg.edges.length < 2) errors.push("edges 至少需要两条");
  const edgeTypes = new Set(Object.keys(graph.edgeTypes || {}));
  (pkg.edges || []).forEach((edge, index) => {
    if (!edgeTypes.has(edge.type)) errors.push(`edges[${index}].type 非法`);
    if (edge.from !== node.id && edge.to !== node.id) errors.push(`edges[${index}] 未连接新节点`);
    const other = edge.from === node.id ? edge.to : edge.from;
    if (!existingIds.has(other)) errors.push(`edges[${index}] 指向不存在节点 ${other}`);
  });
  if (!pkg.learningPath || !/^\d+(?:\.\d+)?$/.test(String(pkg.learningPath.order || ""))) {
    errors.push("learningPath.order 缺失或格式无效");
  }
  const allOrders = new Set((graph.recommendedLearningPath || []).flatMap(phase =>
    (phase.steps || []).map(step => String(step[0]))
  ));
  if (pkg.learningPath && allOrders.has(String(pkg.learningPath.order))) {
    errors.push(`learningPath.order 已存在：${pkg.learningPath.order}`);
  }
  const page = pkg.deepDive;
  if (!page || typeof page !== "object") errors.push("deepDive 缺失");
  else {
    ["title", "subtitle", "thesis", "html"].forEach(key => {
      if (!page[key]) errors.push(`deepDive.${key} 缺失`);
    });
    if (page.title && node.title && page.title !== node.title) errors.push("deepDive.title 必须与 node.title 一致");
  }
  if (!pkg.layout || !pkg.layout.position) errors.push("layout.position 缺失");
  if (pkg.shadowEligibility && pkg.shadowEligibility.formalWrite !== false) {
    errors.push("v0.4 预览包 formalWrite 必须为 false");
  }
  return [...new Set(errors)];
}

function buildNodePackage(proposal, evidence, assessment, content, options = {}) {
  const projectData = options.projectData || loadProjectData();
  const graph = projectData.graph;
  const review = reviewProposal(proposal, evidence, assessment, {
    projectData,
    generatedAt: options.generatedAt
  });
  const term = content && content.candidateTerm;
  const shadowCandidate = review.candidates.find(item => item.term === term);
  const assessmentItem = assessment.candidates.find(item => item.term === term);
  if (!shadowCandidate) throw new Error(`内容草稿候选不在提案中：${term}`);
  if (!shadowCandidate.shadowEligibility.newNode) {
    throw new Error(`候选「${term}」没有通过 v0.3 新节点影子门禁`);
  }
  if (content.proposalHash !== review.proposalHash) throw new Error("content.proposalHash 不匹配");
  if (content.evidenceHash !== evidence.contentHash) throw new Error("content.evidenceHash 不匹配");
  if (content.assessmentHash !== sha256(assessment)) throw new Error("content.assessmentHash 不匹配");

  const proposed = assessmentItem.proposedNode;
  const node = {
    id: proposed.id,
    title: proposed.title,
    aliases: content.node.aliases || [],
    maturity: content.node.maturity || "stable",
    domain: proposed.domain,
    heat: Number.isFinite(content.node.heat) ? content.node.heat : 0.5,
    summary: proposed.summary,
    body: content.node.body,
    cases: content.node.cases,
    sources: content.node.sources,
    createdAt: content.createdAt,
    updatedAt: content.createdAt
  };
  const layout = proposePosition(graph, node, assessmentItem.proposedEdges);
  const pkg = {
    schemaVersion: 1,
    mode: "node-atomic-package-preview",
    status: "draft",
    generatedAt: options.generatedAt || new Date().toISOString(),
    bindings: {
      proposalHash: review.proposalHash,
      evidenceHash: evidence.contentHash,
      assessmentHash: sha256(assessment),
      contentHash: sha256(content),
      graphHash: review.graphHash
    },
    candidateTerm: term,
    node,
    edges: assessmentItem.proposedEdges,
    learningPath: assessmentItem.proposedLearningPath,
    deepDive: content.deepDive,
    layout,
    core: {
      requested: Boolean(shadowCandidate.shadowEligibility.coreNode),
      shadowScore: shadowCandidate.independentScores.coreTotal
    },
    shadowEligibility: {
      newNode: true,
      coreNode: Boolean(shadowCandidate.shadowEligibility.coreNode),
      formalWrite: false
    }
  };
  const errors = packageErrors(pkg, graph);
  pkg.validation = {
    structuralErrors: errors,
    l1: "not-run",
    l2: "not-run",
    l3: "not-run",
    passed: false
  };
  return pkg;
}

function renderDeepDiveRegistration(id, page) {
  return `window.DEEPDIVE = window.DEEPDIVE || {};\nwindow.DEEPDIVE[${JSON.stringify(id)}] = ${JSON.stringify(page, null, 2)};\n`;
}

function runDeepDiveGates(pkg) {
  if (pkg.validation.structuralErrors.length) {
    return {
      l1: "blocked",
      l2: "blocked",
      l3: "blocked",
      passed: false,
      errors: pkg.validation.structuralErrors
    };
  }
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "video-node-package-"));
  try {
    fs.mkdirSync(path.join(fixture, "data", "deepdive"), { recursive: true });
    fs.mkdirSync(path.join(fixture, "docs"), { recursive: true });
    fs.writeFileSync(
      path.join(fixture, "data", "graph.js"),
      `window.GRAPH = { nodes: [${JSON.stringify({ id: pkg.node.id, title: pkg.node.title })}], edges: [] };\n`,
      "utf8"
    );
    fs.writeFileSync(
      path.join(fixture, "data", "deepdive", `${pkg.node.id}.js`),
      renderDeepDiveRegistration(pkg.node.id, pkg.deepDive),
      "utf8"
    );
    fs.writeFileSync(
      path.join(fixture, "index.html"),
      `<script src="data/graph.js"></script><script src="data/deepdive/${pkg.node.id}.js"></script>`,
      "utf8"
    );
    fs.writeFileSync(
      path.join(fixture, "docs", "deepdive-l3-benchmark.json"),
      JSON.stringify({
        schemaVersion: 1,
        reference: { id: pkg.node.id, pageHash: deepDiveHash(pkg.deepDive) },
        minimumScore: 88,
        dimensionFloors: {
          continuity: 16,
          mechanism: 16,
          teaching: 16,
          diagnostics: 12,
          assessment: 12,
          sources: 8
        },
        claimBoundary: "原子包预览只验证自动教学工程；事实准确性仍不等同于 L4。"
      }, null, 2),
      "utf8"
    );
    fs.writeFileSync(
      path.join(fixture, "docs", "deepdive-quality-reviews.json"),
      JSON.stringify({ schemaVersion: 3, certificationLevel: "L4", reviews: {} }, null, 2),
      "utf8"
    );
    const commands = [
      ["validate-deepdives.js", []],
      ["audit-deepdive-gold.js", ["--require-candidate", pkg.node.id]],
      ["audit-deepdive-benchmark.js", ["--require-benchmark", pkg.node.id]]
    ];
    const results = commands.map(([script, args]) => {
      const result = spawnSync(process.execPath, [path.join(ROOT, "tools", script), ...args], {
        cwd: fixture,
        encoding: "utf8",
        env: { ...process.env, DEEPDIVE_ROOT: fixture }
      });
      return {
        script,
        passed: result.status === 0,
        output: `${result.stdout || ""}${result.stderr || ""}`.trim()
      };
    });
    return {
      l1: results[0].passed ? "passed" : "failed",
      l2: results[1].passed ? "passed" : "failed",
      l3: results[2].passed ? "passed" : "failed",
      passed: results.every(item => item.passed),
      results
    };
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
}

function writeNodePackage(directory, pkg) {
  const output = path.resolve(directory);
  fs.mkdirSync(output, { recursive: true });
  fs.mkdirSync(path.join(output, "deepdive"), { recursive: true });
  fs.writeFileSync(path.join(output, "manifest.json"), JSON.stringify(pkg, null, 2) + "\n", "utf8");
  fs.writeFileSync(path.join(output, "node.json"), JSON.stringify(pkg.node, null, 2) + "\n", "utf8");
  fs.writeFileSync(path.join(output, "edges.json"), JSON.stringify(pkg.edges, null, 2) + "\n", "utf8");
  fs.writeFileSync(path.join(output, "learning-path.json"), JSON.stringify(pkg.learningPath, null, 2) + "\n", "utf8");
  fs.writeFileSync(path.join(output, "layout.json"), JSON.stringify(pkg.layout, null, 2) + "\n", "utf8");
  fs.writeFileSync(
    path.join(output, "deepdive", `${pkg.node.id}.js`),
    renderDeepDiveRegistration(pkg.node.id, pkg.deepDive),
    "utf8"
  );
  return output;
}

module.exports = {
  buildNodePackage,
  deepDiveHash,
  packageErrors,
  proposePosition,
  renderDeepDiveRegistration,
  runDeepDiveGates,
  writeNodePackage
};
