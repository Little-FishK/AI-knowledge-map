"use strict";

const {
  canonicalize,
  coreTotal,
  loadProjectData,
  nodeTotal,
  normalizeText,
  sha256,
  validateProposal
} = require("./core");

const DECISIONS = new Set(["new", "merge", "supplement", "reject", "uncertain"]);

function graphFingerprint(graph) {
  return sha256({
    core: graph.core,
    recommendedLearningPath: graph.recommendedLearningPath,
    nodes: graph.nodes,
    edges: graph.edges
  });
}

function textFeatures(value) {
  const text = normalizeText(value)
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  const features = new Set();
  (text.match(/[a-z0-9]+/g) || []).forEach(token => features.add("w:" + token));
  const compactHan = (text.match(/[\p{Script=Han}]+/gu) || []).join("");
  for (let index = 0; index < compactHan.length - 1; index++) {
    features.add("h:" + compactHan.slice(index, index + 2));
  }
  if (compactHan.length === 1) features.add("h:" + compactHan);
  return features;
}

function jaccard(left, right) {
  if (!left.size || !right.size) return 0;
  let intersection = 0;
  left.forEach(item => {
    if (right.has(item)) intersection++;
  });
  return intersection / (left.size + right.size - intersection);
}

function nodeSearchText(node) {
  return [
    node.id,
    node.title,
    ...(node.aliases || []),
    node.summary,
    String(node.body || "").replace(/\[\[|\]\]/g, " ")
  ].join(" ");
}

function duplicateAudit(candidate, graph) {
  const term = normalizeText(candidate.term);
  const exactMatches = [];
  const rankedMatches = graph.nodes.map(node => {
    const names = [node.id, node.title, ...(node.aliases || [])].map(normalizeText);
    const exact = names.some(name =>
      name === term ||
      (name.length >= 3 && term.includes(name)) ||
      (term.length >= 3 && name.includes(term))
    );
    if (exact) exactMatches.push(node.id);
    const score = exact
      ? 1
      : jaccard(textFeatures([candidate.term, candidate.rationale].join(" ")), textFeatures(nodeSearchText(node)));
    return {
      nodeId: node.id,
      title: node.title,
      score: Number(score.toFixed(4)),
      exact
    };
  }).sort((a, b) =>
    b.score - a.score ||
    Number(b.nodeId === candidate.targetNode) - Number(a.nodeId === candidate.targetNode) ||
    a.nodeId.localeCompare(b.nodeId)
  );

  const top = rankedMatches.slice(0, 5);
  const targetMatched = candidate.targetNode && exactMatches.includes(candidate.targetNode);
  let verdict = "clear";
  if (exactMatches.length || targetMatched) verdict = "existing";
  else if (top[0] && top[0].score >= 0.32) verdict = "uncertain";
  return { verdict, exactMatches, targetMatched: Boolean(targetMatched), rankedMatches: top };
}

function evidenceRefValid(ref, evidence) {
  if (!ref || !Number.isFinite(ref.start)) return false;
  const duration = Number(evidence.source && evidence.source.durationSeconds);
  if (ref.start < 0 || (Number.isFinite(duration) && ref.start > duration + 2)) return false;
  if (ref.end != null && (!Number.isFinite(ref.end) || ref.end < ref.start)) return false;
  if (ref.frame && !(evidence.frames || []).some(frame => frame.file === ref.frame)) return false;
  return true;
}

function evidenceAudit(candidate, evidence) {
  const refs = Array.isArray(candidate.evidenceRefs) ? candidate.evidenceRefs : [];
  const validCount = refs.filter(ref => evidenceRefValid(ref, evidence)).length;
  return {
    referenceCount: refs.length,
    validReferenceCount: validCount,
    pass: refs.length > 0 && refs.length === validCount
  };
}

function claimAudit(candidate, evidence) {
  const externalSources = Array.isArray(candidate.externalSources) ? candidate.externalSources : [];
  const externalUrls = new Set();
  const sourceErrors = [];
  externalSources.forEach((source, index) => {
    if (!source || !/^https:\/\//.test(source.url || "")) {
      sourceErrors.push(`externalSources[${index}] 不是 HTTPS 来源`);
      return;
    }
    if (source.url === evidence.source.url) sourceErrors.push(`externalSources[${index}] 重复使用视频来源`);
    if (externalUrls.has(source.url)) sourceErrors.push(`externalSources[${index}] URL 重复`);
    externalUrls.add(source.url);
  });

  const claims = Array.isArray(candidate.claims) ? candidate.claims : [];
  const allowedUrls = new Set([evidence.source.url, ...externalUrls]);
  const claimErrors = [];
  let externallySupported = 0;
  claims.forEach((claim, index) => {
    if (!claim || !String(claim.text || "").trim()) claimErrors.push(`claims[${index}].text 缺失`);
    const urls = Array.isArray(claim && claim.sourceUrls) ? claim.sourceUrls : [];
    if (!urls.length) claimErrors.push(`claims[${index}] 没有来源映射`);
    urls.forEach(url => {
      if (!allowedUrls.has(url)) claimErrors.push(`claims[${index}] 引用了未登记来源 ${url}`);
    });
    if (urls.some(url => externalUrls.has(url))) externallySupported++;
    const refs = Array.isArray(claim && claim.evidenceRefs) ? claim.evidenceRefs : [];
    refs.forEach((ref, refIndex) => {
      if (!evidenceRefValid(ref, evidence)) claimErrors.push(`claims[${index}].evidenceRefs[${refIndex}] 无效`);
    });
  });

  return {
    externalSourceCount: externalUrls.size,
    claimCount: claims.length,
    externallySupportedClaimCount: externallySupported,
    errors: [...sourceErrors, ...claimErrors],
    passForNew: externalUrls.size >= 2 && claims.length >= 2 &&
      externallySupported >= 2 && sourceErrors.length === 0 && claimErrors.length === 0
  };
}

function relationAudit(candidate, graph) {
  const errors = [];
  const edges = Array.isArray(candidate.proposedEdges) ? candidate.proposedEdges : [];
  const nodeIds = new Set(graph.nodes.map(node => node.id));
  const allowedTypes = new Set(Array.isArray(graph.edgeTypes)
    ? graph.edgeTypes.map(type => type.id)
    : Object.keys(graph.edgeTypes || {}));
  const newId = candidate.proposedNode && candidate.proposedNode.id;
  const keys = new Set();
  edges.forEach((edge, index) => {
    if (!edge || !edge.from || !edge.to || !allowedTypes.has(edge.type)) {
      errors.push(`proposedEdges[${index}] 端点或关系类型无效`);
      return;
    }
    if (edge.from === edge.to) errors.push(`proposedEdges[${index}] 是自环`);
    if (edge.from !== newId && edge.to !== newId) errors.push(`proposedEdges[${index}] 未连接候选节点`);
    const other = edge.from === newId ? edge.to : edge.from;
    if (!nodeIds.has(other)) errors.push(`proposedEdges[${index}] 指向不存在节点 ${other}`);
    const key = `${edge.from}|${edge.to}|${edge.type}`;
    if (keys.has(key)) errors.push(`proposedEdges[${index}] 重复`);
    keys.add(key);
  });
  if (edges.length < 2) errors.push("新节点至少需要两条关系");
  return { edgeCount: edges.length, errors, pass: errors.length === 0 };
}

function learningOrders(graph) {
  const orders = new Map();
  (graph.recommendedLearningPath || []).forEach((phase, phaseIndex) => {
    (phase.steps || []).forEach(step => {
      orders.set(step[1], { order: String(step[0]), phaseIndex, phase: phase.phase });
    });
  });
  return orders;
}

function numericOrder(value) {
  const parts = String(value || "").split(".");
  if (!/^\d+(?:\.\d+)?$/.test(String(value || ""))) return null;
  return Number(parts[0]) * 10000 + Number(parts[1] || 0);
}

function learningPathAudit(candidate, graph) {
  const placement = candidate.proposedLearningPath;
  const errors = [];
  if (!placement || typeof placement !== "object") {
    return { pass: false, errors: ["缺 proposedLearningPath"], placement: null };
  }
  const value = numericOrder(placement.order);
  if (value == null) errors.push("proposedLearningPath.order 格式无效");
  const orders = learningOrders(graph);
  const afterNodes = Array.isArray(placement.afterNodes) ? placement.afterNodes : [];
  const beforeNodes = Array.isArray(placement.beforeNodes) ? placement.beforeNodes : [];
  if (!afterNodes.length) errors.push("proposedLearningPath.afterNodes 不能为空");
  afterNodes.forEach(nodeId => {
    if (!orders.has(nodeId)) errors.push(`afterNodes 包含不存在节点 ${nodeId}`);
    else if (value != null && numericOrder(orders.get(nodeId).order) > value) {
      errors.push(`候选顺序早于前置节点 ${nodeId}`);
    }
  });
  beforeNodes.forEach(nodeId => {
    if (!orders.has(nodeId)) errors.push(`beforeNodes 包含不存在节点 ${nodeId}`);
    else if (value != null && numericOrder(orders.get(nodeId).order) < value) {
      errors.push(`候选顺序晚于后续节点 ${nodeId}`);
    }
  });
  return { pass: errors.length === 0, errors, placement: canonicalize(placement) };
}

function adjacency(graph, extraEdges = []) {
  const map = new Map(graph.nodes.map(node => [node.id, new Set()]));
  [...graph.edges, ...extraEdges].forEach(edge => {
    if (!map.has(edge.from)) map.set(edge.from, new Set());
    if (!map.has(edge.to)) map.set(edge.to, new Set());
    map.get(edge.from).add(edge.to);
    map.get(edge.to).add(edge.from);
  });
  return map;
}

function betweenness(graph) {
  const nodes = graph.nodes.map(node => node.id);
  const adj = adjacency(graph);
  const scores = Object.fromEntries(nodes.map(id => [id, 0]));
  nodes.forEach(source => {
    const stack = [];
    const predecessors = Object.fromEntries(nodes.map(id => [id, []]));
    const paths = Object.fromEntries(nodes.map(id => [id, 0]));
    const distance = Object.fromEntries(nodes.map(id => [id, -1]));
    paths[source] = 1;
    distance[source] = 0;
    const queue = [source];
    for (let cursor = 0; cursor < queue.length; cursor++) {
      const vertex = queue[cursor];
      stack.push(vertex);
      (adj.get(vertex) || []).forEach(neighbor => {
        if (distance[neighbor] < 0) {
          queue.push(neighbor);
          distance[neighbor] = distance[vertex] + 1;
        }
        if (distance[neighbor] === distance[vertex] + 1) {
          paths[neighbor] += paths[vertex];
          predecessors[neighbor].push(vertex);
        }
      });
    }
    const dependency = Object.fromEntries(nodes.map(id => [id, 0]));
    while (stack.length) {
      const vertex = stack.pop();
      predecessors[vertex].forEach(previous => {
        if (paths[vertex]) {
          dependency[previous] += paths[previous] / paths[vertex] * (1 + dependency[vertex]);
        }
      });
      if (vertex !== source) scores[vertex] += dependency[vertex];
    }
  });
  Object.keys(scores).forEach(id => {
    scores[id] /= 2;
  });
  return scores;
}

function percentile(values, value) {
  if (!values.length) return 0;
  const belowOrEqual = values.filter(item => item <= value).length;
  return belowOrEqual / values.length;
}

function graphMetrics(graph) {
  const adj = adjacency(graph);
  const between = betweenness(graph);
  const degrees = graph.nodes.map(node => (adj.get(node.id) || new Set()).size);
  const betweenValues = graph.nodes.map(node => between[node.id] || 0);
  const domainById = new Map(graph.nodes.map(node => [node.id, node.domain]));
  const result = {};
  graph.nodes.forEach(node => {
    const neighbors = [...(adj.get(node.id) || [])];
    const crossDomains = new Set(neighbors.map(id => domainById.get(id)).filter(domain => domain && domain !== node.domain));
    const degree = neighbors.length;
    const centralityPercentile = (
      percentile(degrees, degree) * 0.55 +
      percentile(betweenValues, between[node.id] || 0) * 0.45
    );
    const level = centralityPercentile >= 0.9 ? 4
      : centralityPercentile >= 0.75 ? 3
        : centralityPercentile >= 0.5 ? 2
          : degree > 0 ? 1 : 0;
    result[node.id] = {
      degree,
      degreePercentile: Number(percentile(degrees, degree).toFixed(4)),
      betweenness: Number((between[node.id] || 0).toFixed(4)),
      betweennessPercentile: Number(percentile(betweenValues, between[node.id] || 0).toFixed(4)),
      crossDomainCount: crossDomains.size,
      graphCentralityLevel: level
    };
  });
  return result;
}

function validateAssessment(assessment, proposal, evidence) {
  const errors = [];
  const projectData = loadProjectData();
  const coreNodeIds = new Set(projectData.graph.core || []);
  if (!assessment || typeof assessment !== "object") return ["独立复核必须是对象"];
  if (assessment.schemaVersion !== 1) errors.push("assessment.schemaVersion 必须为 1");
  if (assessment.mode !== "independent") errors.push("assessment.mode 必须为 independent");
  if (assessment.proposalHash !== sha256(proposal)) errors.push("assessment.proposalHash 不匹配");
  if (assessment.evidenceHash !== evidence.contentHash) errors.push("assessment.evidenceHash 不匹配");
  if (!assessment.reviewer || !assessment.reviewer.id) errors.push("assessment.reviewer.id 缺失");
  const items = Array.isArray(assessment.candidates) ? assessment.candidates : [];
  const proposalTerms = new Set(proposal.conceptTrack.candidates.map(item => item.term));
  const seen = new Set();
  items.forEach((item, index) => {
    if (!proposalTerms.has(item.term)) errors.push(`assessment.candidates[${index}] term 不在提案中`);
    if (seen.has(item.term)) errors.push(`assessment.candidates[${index}] term 重复`);
    seen.add(item.term);
    if (!DECISIONS.has(item.decision)) errors.push(`assessment.candidates[${index}].decision 非法`);
    if (item.decision === "supplement") {
      const criteria = item.supplementCriteria;
      if (!criteria || typeof criteria !== "object") {
        errors.push(`assessment.candidates[${index}].supplementCriteria 缺失`);
      } else {
        ["transferableBeyondProduct", "notCoveredByExistingNode", "mechanismOrBoundary"].forEach(key => {
          if (criteria[key] !== true) {
            errors.push(`assessment.candidates[${index}].supplementCriteria.${key} 必须为 true`);
          }
        });
      }
    }
    if (["merge", "supplement"].includes(item.decision) && !item.targetNode) {
      errors.push(`assessment.candidates[${index}].targetNode 缺失`);
    }
    if (["new", "merge", "supplement", "uncertain"].includes(item.decision)) {
      if (!Array.isArray(item.evidenceRefs) || !item.evidenceRefs.length) {
        errors.push(`assessment.candidates[${index}].evidenceRefs 缺失`);
      } else item.evidenceRefs.forEach((ref, refIndex) => {
        if (!evidenceRefValid(ref, evidence)) {
          errors.push(`assessment.candidates[${index}].evidenceRefs[${refIndex}] 无效`);
        }
      });
    }
    if (["new", "uncertain"].includes(item.decision)) {
      const scoreErrors = [];
      nodeTotal(item.nodeScores, scoreErrors);
      scoreErrors.forEach(error => errors.push(`assessment.candidates[${index}]: ${error}`));
    }
    if (item.coreCandidate) {
      if (item.decision === "reject") {
        errors.push(`assessment.candidates[${index}] reject 候选不能晋升核心`);
      }
      if (item.targetNode && coreNodeIds.has(item.targetNode)) {
        errors.push(`assessment.candidates[${index}].coreCandidate 只能表示晋升尚非核心的节点；${item.targetNode} 已是核心节点`);
      }
      const scoreErrors = [];
      coreTotal(item.coreScores, scoreErrors);
      scoreErrors.forEach(error => errors.push(`assessment.candidates[${index}]: ${error}`));
    }
    if (item.decision === "new") {
      if (!item.proposedNode || !item.proposedNode.id) errors.push(`assessment.candidates[${index}].proposedNode 缺失`);
      if (!Array.isArray(item.proposedEdges) || item.proposedEdges.length < 2) {
        errors.push(`assessment.candidates[${index}].proposedEdges 至少需要两条`);
      }
      if (!Array.isArray(item.externalSources) || item.externalSources.length < 2) {
        errors.push(`assessment.candidates[${index}].externalSources 至少需要两个`);
      }
      if (!Array.isArray(item.claims) || item.claims.length < 2) {
        errors.push(`assessment.candidates[${index}].claims 至少需要两条`);
      }
      if (!item.proposedLearningPath) errors.push(`assessment.candidates[${index}].proposedLearningPath 缺失`);
    }
  });
  proposalTerms.forEach(term => {
    if (!seen.has(term)) errors.push(`assessment 缺候选 ${term}`);
  });
  return errors;
}

function independentScores(item, metrics) {
  let auditedCoreScores = null;
  let auditedCoreTotal = null;
  if (item && item.coreCandidate && item.coreScores) {
    auditedCoreScores = {
      ...item.coreScores,
      graphCentrality: metrics ? metrics.graphCentralityLevel : 0
    };
    auditedCoreTotal = coreTotal(auditedCoreScores, []);
  }
  return {
    nodeTotal: item && item.nodeScores ? nodeTotal(item.nodeScores, []) : null,
    coreScores: auditedCoreScores,
    coreTotal: auditedCoreTotal
  };
}

function reviewProposal(proposal, evidence, assessment = null, options = {}) {
  const projectData = options.projectData || loadProjectData();
  const graph = projectData.graph;
  const proposalValidation = validateProposal(proposal, evidence, { ready: true });
  const assessmentErrors = assessment ? validateAssessment(assessment, proposal, evidence) : [];
  const assessmentByTerm = new Map(
    assessmentErrors.length || !assessment ? [] : assessment.candidates.map(item => [item.term, item])
  );
  const metricsByNode = graphMetrics(graph);
  const candidates = proposal.conceptTrack.candidates.map(candidate => {
    const independent = assessmentByTerm.get(candidate.term) || null;
    const auditCandidate = independent
      ? { ...independent, term: candidate.term }
      : { term: candidate.term };
    const duplicate = duplicateAudit(auditCandidate, graph);
    const evidenceResult = evidenceAudit(auditCandidate, evidence);
    const claims = claimAudit(auditCandidate, evidence);
    const relations = relationAudit(auditCandidate, graph);
    const learningPath = learningPathAudit(auditCandidate, graph);
    const targetMetrics = independent && independent.targetNode
      ? metricsByNode[independent.targetNode] || null
      : null;
    const scores = independentScores(independent, targetMetrics);
    const decisionsAgree = Boolean(independent && independent.decision === candidate.decision);
    const coreDecisionsAgree = Boolean(
      independent && independent.coreCandidate === candidate.coreCandidate
    );
    const newGate = Boolean(
      decisionsAgree &&
      candidate.decision === "new" &&
      scores.nodeTotal != null && scores.nodeTotal >= 80 &&
      duplicate.verdict === "clear" &&
      evidenceResult.pass &&
      claims.passForNew &&
      relations.pass &&
      learningPath.pass &&
      !(independent.disqualifiers || []).length
    );
    const coreGate = Boolean(
      decisionsAgree &&
      evidenceResult.pass &&
      (candidate.decision !== "new" || newGate) &&
      candidate.coreCandidate === true &&
      independent && independent.coreCandidate === true &&
      scores.coreTotal != null && scores.coreTotal >= 85
    );
    const blockers = [];
    if (!assessment) blockers.push("缺独立复核文件");
    else if (assessmentErrors.length) blockers.push("独立复核文件无效");
    else if (!decisionsAgree) blockers.push("提案与独立复核结论不一致");
    if (independent && !coreDecisionsAgree) {
      blockers.push("提案与独立复核的核心候选结论不一致");
    }
    if (candidate.decision === "new") {
      if (duplicate.verdict !== "clear") blockers.push("全图去重未明确通过");
      if (!claims.passForNew) blockers.push("来源—断言映射未通过");
      if (!relations.pass) blockers.push("关系审计未通过");
      if (!learningPath.pass) blockers.push("学习路径影响审计未通过");
      if (!evidenceResult.pass) blockers.push("视频证据定位无效");
      if (scores.nodeTotal == null || scores.nodeTotal < 80) blockers.push("独立新节点评分不足 80");
    }
    if (candidate.coreCandidate && !coreGate) blockers.push("核心节点独立评分或真实图中心性未通过");
    return {
      term: candidate.term,
      proposalDecision: candidate.decision,
      independentDecision: independent ? independent.decision : null,
      decisionsAgree,
      proposalCoreCandidate: candidate.coreCandidate,
      independentCoreCandidate: independent ? independent.coreCandidate : null,
      coreDecisionsAgree,
      duplicateAudit: duplicate,
      evidenceAudit: evidenceResult,
      claimAudit: claims,
      relationAudit: relations,
      learningPathAudit: learningPath,
      graphMetrics: targetMetrics,
      independentScores: scores,
      shadowEligibility: {
        newNode: newGate,
        coreNode: coreGate,
        formalWrite: false
      },
      blockers: [...new Set(blockers)]
    };
  });
  const summary = {
    candidateCount: candidates.length,
    agreementCount: candidates.filter(item => item.decisionsAgree).length,
    conflictCount: candidates.filter(item => assessment && !item.decisionsAgree).length,
    coreConflictCount: candidates.filter(item => assessment && !item.coreDecisionsAgree).length,
    autoEligibleNewCount: candidates.filter(item => item.shadowEligibility.newNode).length,
    autoEligibleCoreCount: candidates.filter(item => item.shadowEligibility.coreNode).length,
    formalWrites: 0
  };
  return {
    schemaVersion: 1,
    mode: "shadow",
    generatedAt: options.generatedAt || new Date().toISOString(),
    proposalHash: sha256(proposal),
    evidenceHash: evidence.contentHash,
    graphHash: graphFingerprint(graph),
    policy: {
      mutateExistingDeepdives: false,
      mutateGraph: false,
      independentAssessmentRequired: true,
      agreementRequired: true
    },
    validation: {
      proposalErrors: proposalValidation.errors,
      proposalWarnings: proposalValidation.warnings,
      assessmentErrors
    },
    summary,
    candidates
  };
}

function renderShadowReport(report) {
  const lines = [
    "# 视频概念轨 v0.3 影子复核",
    "",
    `- 模式：只读影子模式（正式写入 ${report.summary.formalWrites}）`,
    `- 提案：\`${report.proposalHash}\``,
    `- 证据：\`${report.evidenceHash}\``,
    `- 图谱：\`${report.graphHash}\``,
    `- 候选：${report.summary.candidateCount}；一致：${report.summary.agreementCount}；冲突：${report.summary.conflictCount}`,
    `- 影子合格新节点：${report.summary.autoEligibleNewCount}；影子合格核心节点：${report.summary.autoEligibleCoreCount}`,
    ""
  ];
  if (report.validation.proposalErrors.length || report.validation.assessmentErrors.length) {
    lines.push("## 输入阻断", "");
    [...report.validation.proposalErrors, ...report.validation.assessmentErrors].forEach(error => lines.push(`- ${error}`));
    lines.push("");
  }
  report.candidates.forEach(candidate => {
    lines.push(
      `## ${candidate.term}`,
      "",
      `- 提案 / 独立复核：\`${candidate.proposalDecision}\` / \`${candidate.independentDecision || "缺失"}\``,
      `- 全图去重：${candidate.duplicateAudit.verdict}；最相近：${candidate.duplicateAudit.rankedMatches.map(item => `${item.nodeId}(${item.score})`).join("、") || "无"}`,
      `- 视频证据：${candidate.evidenceAudit.validReferenceCount}/${candidate.evidenceAudit.referenceCount} 有效`,
      `- 外部来源 / 断言：${candidate.claimAudit.externalSourceCount} / ${candidate.claimAudit.claimCount}`,
      `- 关系 / 学习路径：${candidate.relationAudit.pass ? "通过" : "未通过"} / ${candidate.learningPathAudit.pass ? "通过" : "未通过"}`,
      `- 影子结论：新节点 ${candidate.shadowEligibility.newNode ? "合格" : "不合格"}；核心 ${candidate.shadowEligibility.coreNode ? "合格" : "不合格"}`,
      `- 正式数据：不写入`,
      ""
    );
    if (candidate.blockers.length) {
      lines.push("阻断原因：", "");
      candidate.blockers.forEach(blocker => lines.push(`- ${blocker}`));
      lines.push("");
    }
  });
  return lines.join("\n");
}

function createAssessmentTemplate(proposal, evidence, reviewerId = "") {
  return {
    schemaVersion: 1,
    mode: "independent",
    proposalHash: sha256(proposal),
    evidenceHash: evidence.contentHash,
    reviewer: {
      id: reviewerId,
      note: "复核者应先读原始证据和受限图谱上下文，再独立填写；不要复制提案分数。"
    },
    candidates: proposal.conceptTrack.candidates.map(candidate => ({
      term: candidate.term,
      decision: "uncertain",
      rationale: "",
      targetNode: null,
      nodeScores: null,
      supplementCriteria: null,
      coreCandidate: false,
      coreScores: null,
      evidenceRefs: [],
      nearestNodes: [],
      proposedEdges: [],
      externalSources: [],
      claims: [],
      proposedLearningPath: null,
      disqualifiers: [],
      proposedNode: null
    }))
  };
}

module.exports = {
  claimAudit,
  createAssessmentTemplate,
  duplicateAudit,
  graphFingerprint,
  graphMetrics,
  learningPathAudit,
  relationAudit,
  renderShadowReport,
  reviewProposal,
  textFeatures,
  validateAssessment
};
