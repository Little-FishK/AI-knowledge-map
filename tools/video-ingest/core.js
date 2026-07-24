"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..", "..");
const EVIDENCE_LEVELS = ["E0", "E1", "E2", "E3"];
const TUTORIAL_STANDARDS = ["accuracy", "alignment", "reproducibility", "traceability", "safety"];
const TUTORIAL_WEIGHTS = {
  closure: 20,
  transfer: 15,
  completeness: 15,
  structure: 10,
  freshness: 5,
  accessibility: 5
};
const NODE_WEIGHTS = {
  identity: 20,
  mechanism: 20,
  nonDuplication: 20,
  practicalValue: 15,
  relationshipPotential: 15,
  sourceQuality: 10
};
const CORE_WEIGHTS = {
  learningGateway: 25,
  graphCentrality: 25,
  crossRouteReuse: 20,
  beginnerNavigation: 20,
  stability: 10
};

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.keys(value).sort().reduce((result, key) => {
      result[key] = canonicalize(value[key]);
      return result;
    }, {});
  }
  return value;
}

function sha256(value) {
  const text = typeof value === "string" ? value : JSON.stringify(canonicalize(value));
  return "sha256:" + crypto.createHash("sha256").update(text).digest("hex");
}

function parseArgs(argv) {
  const result = { _: [] };
  for (let index = 0; index < argv.length; index++) {
    const item = argv[index];
    if (!item.startsWith("--")) {
      result._.push(item);
      continue;
    }
    const key = item.slice(2);
    const next = argv[index + 1];
    if (next == null || next.startsWith("--")) result[key] = true;
    else {
      result[key] = next;
      index++;
    }
  }
  return result;
}

function loadProjectData() {
  const previousWindow = global.window;
  global.window = {};
  const files = [
    "data/graph.js",
    "data/software.js",
    "data/tutorials.js",
    "data/tutorials-codex-youtube.js",
    "data/tutorials-claude-code.js"
  ];
  try {
    files.forEach(relative => {
      const absolute = path.join(ROOT, relative);
      if (fs.existsSync(absolute)) {
        delete require.cache[require.resolve(absolute)];
        require(absolute);
      }
    });
    return {
      graph: global.window.GRAPH,
      software: global.window.SOFTWARE,
      tutorials: global.window.TUTORIALS
    };
  } finally {
    global.window = previousWindow;
  }
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLocaleLowerCase("zh-CN")
    .replace(/\s+/g, " ")
    .trim();
}

function evidenceText(evidence) {
  return normalizeText([
    evidence.source && evidence.source.title,
    ...(evidence.chapters || []).map(item => item.title),
    ...(evidence.transcript || []).map(item => item.text),
    ...(evidence.frames || []).map(item => item.ocr)
  ].join("\n"));
}

function validateEvidence(evidence) {
  const errors = [];
  if (!evidence || typeof evidence !== "object") return ["证据必须是对象"];
  if (evidence.schemaVersion !== 1) errors.push("evidence.schemaVersion 必须为 1");
  if (!evidence.source || typeof evidence.source !== "object") errors.push("evidence.source 缺失");
  else {
    if (!/^https?:\/\//.test(evidence.source.url || "")) errors.push("evidence.source.url 必须是 HTTP(S) URL");
    if (!evidence.source.title) errors.push("evidence.source.title 缺失");
  }
  if (!Array.isArray(evidence.transcript)) errors.push("evidence.transcript 必须是数组");
  if (!Array.isArray(evidence.frames)) errors.push("evidence.frames 必须是数组");
  (evidence.transcript || []).forEach((item, index) => {
    if (!Number.isFinite(item.start) || !Number.isFinite(item.end) || item.end < item.start || !item.text) {
      errors.push(`evidence.transcript[${index}] 的时间或文本无效`);
    }
  });
  (evidence.frames || []).forEach((item, index) => {
    if (!Number.isFinite(item.time) || !item.file) errors.push(`evidence.frames[${index}] 的时间或文件无效`);
  });
  if (!evidence.acquisition || typeof evidence.acquisition !== "object") errors.push("evidence.acquisition 缺失");
  if (!/^sha256:[a-f0-9]{64}$/.test(evidence.contentHash || "")) errors.push("evidence.contentHash 格式无效");
  else {
    const withoutHash = { ...evidence };
    delete withoutHash.contentHash;
    if (sha256(withoutHash) !== evidence.contentHash) errors.push("evidence.contentHash 与证据内容不匹配");
  }
  return errors;
}

function weightedLevelTotal(values, weights, label, errors) {
  if (!values || typeof values !== "object") {
    errors.push(`${label} 缺失`);
    return null;
  }
  let total = 0;
  Object.entries(weights).forEach(([key, weight]) => {
    const value = values[key];
    if (!Number.isInteger(value) || value < 0 || value > 4) {
      errors.push(`${label}.${key} 必须是 0-4 的等级`);
    } else total += weight * value / 4;
  });
  return total;
}

function tutorialTotal(quality, errors = []) {
  if (!quality || typeof quality !== "object") {
    errors.push("tutorialTrack.quality 缺失");
    return null;
  }
  let total = 0;
  Object.entries(TUTORIAL_WEIGHTS).forEach(([key, weight]) => {
    const level = quality[key];
    if (!Number.isInteger(level) || level < 0 || level > 4) {
      errors.push(`tutorialTrack.quality.${key} 必须是 0-4 的整数`);
    } else total += weight * level / 4;
  });
  return total;
}

function nodeTotal(scores, errors = []) {
  return weightedLevelTotal(scores, NODE_WEIGHTS, "conceptTrack.nodeScores", errors);
}

function coreTotal(scores, errors = []) {
  return weightedLevelTotal(scores, CORE_WEIGHTS, "conceptTrack.coreScores", errors);
}

function evidenceReferenceValid(ref, evidence) {
  if (!ref || !Number.isFinite(ref.start)) return false;
  const duration = Number(evidence.source && evidence.source.durationSeconds);
  if (ref.start < 0 || (Number.isFinite(duration) && ref.start > duration + 2)) return false;
  if (ref.end != null && (!Number.isFinite(ref.end) || ref.end < ref.start)) return false;
  if (ref.frame && !(evidence.frames || []).some(item => item.file === ref.frame)) return false;
  return true;
}

function validateProposal(proposal, evidence, options = {}) {
  const ready = Boolean(options.ready);
  const errors = [];
  const warnings = [];
  let projectData = null;
  try {
    projectData = loadProjectData();
  } catch (error) {
    errors.push("无法加载项目数据：" + error.message);
  }
  const existingNodeIds = new Set(projectData ? projectData.graph.nodes.map(node => node.id) : []);
  const domains = new Set(projectData ? Object.keys(projectData.graph.domains || {}) : []);
  const allowedEdgeTypes = new Set(projectData
    ? (Array.isArray(projectData.graph.edgeTypes)
      ? projectData.graph.edgeTypes.map(item => item.id)
      : Object.keys(projectData.graph.edgeTypes || {}))
    : []);
  errors.push(...validateEvidence(evidence));
  if (!proposal || typeof proposal !== "object") return { errors: ["提案必须是对象"], warnings, scores: {} };
  if (proposal.schemaVersion !== 1) errors.push("proposal.schemaVersion 必须为 1");
  if (!["draft", "ready"].includes(proposal.status)) errors.push("proposal.status 必须为 draft 或 ready");
  if (proposal.evidenceHash !== evidence.contentHash) errors.push("proposal.evidenceHash 与证据不匹配");
  if (!proposal.source || proposal.source.url !== evidence.source.url) errors.push("proposal.source.url 与证据不匹配");

  const tutorial = proposal.tutorialTrack;
  let computedTutorialTotal = null;
  if (!tutorial || typeof tutorial !== "object") errors.push("tutorialTrack 缺失");
  else {
    const decisions = ready ? ["formal", "candidate", "reject"] : ["undecided", "formal", "candidate", "reject"];
    if (!decisions.includes(tutorial.decision)) errors.push(`tutorialTrack.decision 非法：${tutorial.decision}`);
    if (tutorial.decision !== "undecided") {
      if (!EVIDENCE_LEVELS.includes(tutorial.evidenceLevel)) errors.push("tutorialTrack.evidenceLevel 非法");
      if (!["append-resource", "create-page", "software-candidate", "none"].includes(tutorial.action)) {
        errors.push("tutorialTrack.action 非法");
      }
      if (tutorial.standards != null) {
        TUTORIAL_STANDARDS.forEach(key => {
          if (![0, 1, 2].includes(tutorial.standards[key])) {
            errors.push(`tutorialTrack.standards.${key} 必须是 0/1/2`);
          }
        });
      }
      if (tutorial.quality != null) computedTutorialTotal = tutorialTotal(tutorial.quality, errors);
      if (tutorial.decision === "formal") {
        if (!["E2", "E3"].includes(tutorial.evidenceLevel)) errors.push("正式教程的证据必须达到 E2/E3");
        if (!(evidence.transcript || []).length) errors.push("正式教程不能在缺少逐段转录时宣称 E2/E3");
        if (!tutorial.standards || !TUTORIAL_STANDARDS.every(key => tutorial.standards[key] === 2)) {
          errors.push("正式教程的五项标准必须全部为 2");
        }
        if (computedTutorialTotal == null || computedTutorialTotal < 53) {
          errors.push("正式教程质量总分必须至少为 53/70");
        }
        if (!tutorial.softwareId && tutorial.action !== "software-candidate") errors.push("正式教程缺 softwareId");
        if (!tutorial.resourceDraft || typeof tutorial.resourceDraft !== "object") errors.push("正式教程缺 resourceDraft");
        else {
          ["title", "creator", "url", "publishedAt", "duration", "audience", "summary", "caution"].forEach(key => {
            if (!tutorial.resourceDraft[key]) errors.push(`正式教程 resourceDraft.${key} 缺失`);
          });
          if (tutorial.resourceDraft.url && tutorial.resourceDraft.url !== evidence.source.url) {
            errors.push("正式教程 resourceDraft.url 与证据来源不一致");
          }
          if (!Array.isArray(tutorial.resourceDraft.coverage) || !tutorial.resourceDraft.coverage.length) {
            errors.push("正式教程 resourceDraft.coverage 缺失");
          } else tutorial.resourceDraft.coverage.forEach((section, index) => {
            if (!section.title || !Array.isArray(section.steps) || !section.steps.length || !section.done) {
              errors.push(`正式教程 coverage[${index}] 必须包含 title、steps 和 done`);
            }
          });
          if (!Array.isArray(tutorial.resourceDraft.uniqueTechniques) || !tutorial.resourceDraft.uniqueTechniques.length) {
            errors.push("正式教程 resourceDraft.uniqueTechniques 缺失");
          }
        }
        if (!Array.isArray(tutorial.evidenceRefs) || !tutorial.evidenceRefs.length) {
          errors.push("正式教程缺 evidenceRefs");
        } else tutorial.evidenceRefs.forEach((ref, index) => {
          if (!evidenceReferenceValid(ref, evidence)) errors.push(`tutorialTrack.evidenceRefs[${index}] 无效`);
        });
      }
    }
  }

  const concepts = proposal.conceptTrack && proposal.conceptTrack.candidates;
  const computedConcepts = [];
  if (!Array.isArray(concepts)) errors.push("conceptTrack.candidates 必须是数组");
  else concepts.forEach((candidate, index) => {
    const prefix = `conceptTrack.candidates[${index}]`;
    if (!candidate.term) errors.push(`${prefix}.term 缺失`);
    const decisions = ready
      ? ["new", "merge", "supplement", "reject", "uncertain"]
      : ["undecided", "new", "merge", "supplement", "reject", "uncertain"];
    if (!decisions.includes(candidate.decision)) errors.push(`${prefix}.decision 非法`);
    const localErrors = [];
    const total = candidate.nodeScores == null ? null : nodeTotal(candidate.nodeScores, localErrors);
    localErrors.forEach(message => errors.push(`${prefix}: ${message.replace("conceptTrack.", "")}`));
    let computedCore = null;
    if (candidate.coreCandidate) {
      const coreErrors = [];
      computedCore = coreTotal(candidate.coreScores, coreErrors);
      coreErrors.forEach(message => errors.push(`${prefix}: ${message.replace("conceptTrack.", "")}`));
      if (computedCore != null && computedCore < 85) errors.push(`${prefix} 核心候选总分必须至少为 85/100`);
      if (!candidate.coreReason) errors.push(`${prefix}.coreReason 缺失`);
      if (candidate.requiresHumanCoreApproval !== true) errors.push(`${prefix} 必须标记 requiresHumanCoreApproval=true`);
    }
    if (["new", "uncertain"].includes(candidate.decision) && total == null) {
      errors.push(`${prefix}.nodeScores 缺失`);
    }
    if (candidate.decision === "new") {
      if (total != null && total < 80) errors.push(`${prefix} 新节点总分必须至少为 80/100`);
      if (!Array.isArray(candidate.nearestNodes) || candidate.nearestNodes.length < 2) {
        errors.push(`${prefix} 新节点必须列出至少两个相近节点`);
      } else if (new Set(candidate.nearestNodes).size < 2) {
        errors.push(`${prefix}.nearestNodes 必须是至少两个不同节点`);
      }
      if (!Array.isArray(candidate.proposedEdges) || candidate.proposedEdges.length < 2) {
        errors.push(`${prefix} 新节点必须提出至少两条关系边`);
      } else {
        const edgeKeys = candidate.proposedEdges.map(edge => `${edge.from}|${edge.to}|${edge.type}`);
        if (new Set(edgeKeys).size < 2) errors.push(`${prefix}.proposedEdges 必须是至少两条不同关系`);
      }
      if (!Array.isArray(candidate.externalSources) || candidate.externalSources.length < 2) {
        errors.push(`${prefix} 新节点必须有至少两个视频之外的来源`);
      } else {
        const urls = new Set();
        candidate.externalSources.forEach((source, sourceIndex) => {
          if (!source || !/^https:\/\//.test(source.url || "")) {
            errors.push(`${prefix}.externalSources[${sourceIndex}] 必须是 HTTPS 来源`);
          } else if (source.url === evidence.source.url) {
            errors.push(`${prefix}.externalSources[${sourceIndex}] 不能重复使用本视频`);
          } else if (urls.has(source.url)) {
            errors.push(`${prefix}.externalSources 存在重复 URL`);
          } else urls.add(source.url);
        });
      }
      if (Array.isArray(candidate.disqualifiers) && candidate.disqualifiers.length) {
        errors.push(`${prefix} 命中节点排除项，不能判为 new`);
      }
      const draft = candidate.proposedNode;
      if (!draft || typeof draft !== "object") errors.push(`${prefix}.proposedNode 缺失`);
      else {
        ["id", "title", "domain", "summary"].forEach(key => {
          if (!draft[key]) errors.push(`${prefix}.proposedNode.${key} 缺失`);
        });
        if (draft.id && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.id)) errors.push(`${prefix}.proposedNode.id 必须是 kebab-case`);
        if (draft.id && existingNodeIds.has(draft.id)) errors.push(`${prefix}.proposedNode.id 已存在`);
        if (draft.domain && !domains.has(draft.domain)) errors.push(`${prefix}.proposedNode.domain 非法`);
      }
      (candidate.nearestNodes || []).forEach(nodeId => {
        if (!existingNodeIds.has(nodeId)) errors.push(`${prefix}.nearestNodes 包含不存在节点 ${nodeId}`);
      });
      (candidate.proposedEdges || []).forEach((edge, edgeIndex) => {
        if (!edge || !edge.from || !edge.to || !allowedEdgeTypes.has(edge.type)) {
          errors.push(`${prefix}.proposedEdges[${edgeIndex}] 的端点或关系类型无效`);
          return;
        }
        const proposedId = draft && draft.id;
        if (edge.from !== proposedId && edge.to !== proposedId) {
          errors.push(`${prefix}.proposedEdges[${edgeIndex}] 必须连接候选新节点`);
        }
        const other = edge.from === proposedId ? edge.to : edge.from;
        if (!existingNodeIds.has(other)) errors.push(`${prefix}.proposedEdges[${edgeIndex}] 指向不存在节点 ${other}`);
      });
    }
    if (["merge", "supplement"].includes(candidate.decision) && !candidate.targetNode) {
      errors.push(`${prefix}.${candidate.decision} 缺 targetNode`);
    } else if (["merge", "supplement"].includes(candidate.decision) && !existingNodeIds.has(candidate.targetNode)) {
      errors.push(`${prefix}.targetNode 不存在：${candidate.targetNode}`);
    }
    if (["new", "merge", "supplement", "uncertain"].includes(candidate.decision)) {
      if (!Array.isArray(candidate.evidenceRefs) || !candidate.evidenceRefs.length) {
        errors.push(`${prefix} 缺视频证据定位`);
      } else candidate.evidenceRefs.forEach((ref, refIndex) => {
        if (!evidenceReferenceValid(ref, evidence)) errors.push(`${prefix}.evidenceRefs[${refIndex}] 无效`);
      });
    }
    if (total != null && total >= 80 && candidate.decision === "reject") {
      warnings.push(`${prefix} 节点分数达到 ${total}，但决定为 reject，应检查理由`);
    }
    computedConcepts.push({ term: candidate.term, nodeTotal: total, coreTotal: computedCore });
  });

  if (ready && proposal.status !== "ready") errors.push("使用 --ready 时 proposal.status 必须为 ready");
  return {
    errors,
    warnings,
    scores: {
      tutorialTotal: computedTutorialTotal,
      concepts: computedConcepts
    }
  };
}

module.exports = {
  ROOT,
  EVIDENCE_LEVELS,
  TUTORIAL_STANDARDS,
  TUTORIAL_WEIGHTS,
  NODE_WEIGHTS,
  CORE_WEIGHTS,
  readJson,
  writeJson,
  sha256,
  canonicalize,
  parseArgs,
  loadProjectData,
  normalizeText,
  evidenceText,
  validateEvidence,
  tutorialTotal,
  nodeTotal,
  coreTotal,
  validateProposal
};
