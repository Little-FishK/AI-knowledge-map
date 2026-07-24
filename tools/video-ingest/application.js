"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");
const {
  ROOT,
  readJson,
  sha256,
  validateProposal
} = require("./core");

const TUTORIAL_TARGET = "data/tutorials-video-generated.js";
const SUPPLEMENT_TARGET = "data/video-concept-supplements.json";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function withinRoot(root, relativePath) {
  const absolute = path.resolve(root, relativePath);
  const relative = path.relative(path.resolve(root), absolute);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`目标路径越出项目根目录：${relativePath}`);
  }
  return absolute;
}

function readTextIfExists(file, fallback = "") {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : fallback;
}

function loadProject(root = ROOT) {
  const context = { window: {} };
  vm.createContext(context);
  const load = (relativePath) => {
    const file = withinRoot(root, relativePath);
    vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
  };
  load("data/graph.js");
  load("data/software.js");
  const index = readTextIfExists(withinRoot(root, "index.html"));
  const tutorialScripts = [...index.matchAll(/<script src="(data\/tutorials[^"]*\.js)"><\/script>/g)]
    .map((match) => match[1]);
  tutorialScripts.forEach(load);
  return {
    graph: context.window.GRAPH,
    software: context.window.SOFTWARE,
    tutorials: context.window.TUTORIALS,
    generatedTutorials: context.window.VIDEO_TUTORIAL_GENERATED || { schemaVersion: 1, pages: {} }
  };
}

function proposalHash(proposal) {
  return sha256(proposal);
}

function createApprovalDraft(proposal) {
  return {
    schemaVersion: 1,
    status: "draft",
    proposalHash: proposalHash(proposal),
    evidenceHash: proposal.evidenceHash,
    approvedAt: null,
    approvedBy: null,
    tutorial: {
      decision: "pending"
    },
    concepts: (proposal.conceptTrack.candidates || []).map((candidate) => ({
      term: candidate.term,
      decision: "pending"
    })),
    notes: ""
  };
}

function validateApproval(approval, proposal, options = {}) {
  const requireApproved = Boolean(options.requireApproved);
  const errors = [];
  if (!approval || typeof approval !== "object") return ["approval 必须是对象"];
  if (approval.schemaVersion !== 1) errors.push("approval.schemaVersion 必须为 1");
  if (!["draft", "approved"].includes(approval.status)) errors.push("approval.status 必须为 draft 或 approved");
  if (approval.proposalHash !== proposalHash(proposal)) errors.push("approval.proposalHash 与提案内容不匹配");
  if (approval.evidenceHash !== proposal.evidenceHash) errors.push("approval.evidenceHash 与提案不匹配");
  if (!approval.tutorial || !["pending", "approve", "reject"].includes(approval.tutorial.decision)) {
    errors.push("approval.tutorial.decision 必须为 pending / approve / reject");
  }

  const candidates = proposal.conceptTrack && Array.isArray(proposal.conceptTrack.candidates)
    ? proposal.conceptTrack.candidates
    : [];
  const candidateByTerm = new Map(candidates.map((candidate) => [candidate.term, candidate]));
  const decisions = Array.isArray(approval.concepts) ? approval.concepts : [];
  if (!Array.isArray(approval.concepts)) errors.push("approval.concepts 必须是数组");
  const seen = new Set();
  decisions.forEach((item, index) => {
    if (!item || !candidateByTerm.has(item.term)) errors.push(`approval.concepts[${index}] 不是提案中的候选`);
    if (seen.has(item && item.term)) errors.push(`approval.concepts 存在重复 term：${item.term}`);
    seen.add(item && item.term);
    if (!["pending", "approve", "reject"].includes(item && item.decision)) {
      errors.push(`approval.concepts[${index}].decision 非法`);
    }
    const candidate = candidateByTerm.get(item && item.term);
    if (candidate && item.decision === "approve" && !["new", "merge", "supplement"].includes(candidate.decision)) {
      errors.push(`候选「${candidate.term}」的提案决定为 ${candidate.decision}，不能批准应用`);
    }
  });
  candidates.forEach((candidate) => {
    if (!seen.has(candidate.term)) errors.push(`approval 缺候选决定：${candidate.term}`);
  });

  if (approval.tutorial && approval.tutorial.decision === "approve") {
    const tutorial = proposal.tutorialTrack || {};
    if (!["formal", "candidate"].includes(tutorial.decision) || tutorial.action === "none") {
      errors.push(`教程轨决定为 ${tutorial.decision || "缺失"} / ${tutorial.action || "缺失"}，不能批准应用`);
    }
  }
  if (approval.status === "approved" || requireApproved) {
    if (approval.status !== "approved") errors.push("应用要求 approval.status=approved");
    if (!approval.approvedBy) errors.push("已批准文件缺 approvedBy");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(approval.approvedAt || "")) errors.push("已批准文件缺合法 approvedAt");
    if (!approval.tutorial || approval.tutorial.decision === "pending") errors.push("已批准文件仍有 pending 教程决定");
    decisions.forEach((item) => {
      if (item.decision === "pending") errors.push(`已批准文件仍有 pending 概念决定：${item.term}`);
    });
  }
  return errors;
}

function normalizePlatform(value) {
  const text = String(value || "").toLowerCase();
  if (text.includes("youtube")) return "youtube";
  if (text.includes("bilibili")) return "bilibili";
  return text || "articles";
}

function generatedResource(proposal, evidence) {
  const tutorial = proposal.tutorialTrack;
  const draft = clone(tutorial.resourceDraft);
  const shortHash = sha256(draft.url).slice(7, 19);
  draft.id = draft.id || `video-${tutorial.softwareId}-${shortHash}`;
  draft.platform = normalizePlatform(draft.platform || evidence.source.platform);
  draft.review = {
    evidence: tutorial.evidenceLevel,
    status: tutorial.decision === "formal" ? "formal" : "candidate",
    reviewedAt: evidence.source.accessedAt,
    standards: clone(tutorial.standards),
    quality: clone(tutorial.quality),
    notes: tutorial.rationale
  };
  return draft;
}

function generatedPage(software, resource, evidence, proposal) {
  return {
    title: `${software.name} 使用教程`,
    subtitle: `从第一条经审核的视频资源建立可复现的上手路径`,
    meta: `1 条${resource.platform === "youtube" ? " YouTube" : ""}教程 · 视频双轨入库 v0.2`,
    overview: resource.summary,
    sourceNote: `本页由视频双轨提案确定性生成；资源绑定证据 ${proposal.evidenceHash.slice(0, 19)}…。完整哈希保留在提案与批准记录中。界面、模型和服务配置可能变化，操作前请复核当前官方文档。`,
    accessDate: evidence.source.accessedAt,
    officialSources: [],
    learningPath: (resource.coverage || []).map((section) =>
      `${section.title}：${section.done}`
    ),
    resources: []
  };
}

function renderGeneratedTutorials(state) {
  return `/* 视频双轨入库 v0.2 的确定性输出。
 *
 * 本文件由 tools/video-ingest/apply-proposal.js 重建。不要手工在执行逻辑中
 * 添加资源；批准后的规范数据只写入 VIDEO_TUTORIAL_GENERATED。
 */
(function () {
  "use strict";

  const generated = ${JSON.stringify(state, null, 2)};
  window.VIDEO_TUTORIAL_GENERATED = generated;

  const root = window.TUTORIALS;
  if (!root || !root.items) throw new Error("视频教程扩展加载前必须先加载 data/tutorials.js");

  Object.entries(generated.pages).forEach(([softwareId, entry]) => {
    if (!root.items[softwareId]) {
      if (entry.mode !== "create-page" || !entry.page) {
        throw new Error(\`视频教程 \${softwareId} 要追加资源，但教程页不存在\`);
      }
      root.items[softwareId] = entry.page;
    }

    const tutorial = root.items[softwareId];
    tutorial.resources = Array.isArray(tutorial.resources) ? tutorial.resources : [];
    (entry.resources || []).forEach((resource) => {
      const duplicate = tutorial.resources.some((item) =>
        item.id === resource.id || item.url === resource.url
      );
      if (!duplicate) tutorial.resources.push(resource);
    });
  });
})();
`;
}

function targetRecord(root, relativePath, afterContent) {
  const file = withinRoot(root, relativePath);
  const beforeContent = readTextIfExists(file);
  return {
    relativePath,
    beforeHash: sha256(beforeContent),
    afterHash: sha256(afterContent),
    beforeContent,
    afterContent
  };
}

function buildApplyPlan(proposal, evidence, approval, options = {}) {
  const root = path.resolve(options.root || ROOT);
  const proposalResult = validateProposal(proposal, evidence, { ready: true });
  const approvalErrors = validateApproval(approval, proposal, { requireApproved: true });
  const blockers = [...proposalResult.errors, ...approvalErrors];
  const warnings = [...proposalResult.warnings];
  const operations = [];
  const targets = [];
  let project = null;
  try {
    project = loadProject(root);
  } catch (error) {
    blockers.push("无法加载应用目标项目：" + error.message);
  }

  if (project && !blockers.length && approval.tutorial.decision === "approve") {
    const tutorial = proposal.tutorialTrack;
    const software = (project.software.items || []).find((item) => item.id === tutorial.softwareId);
    if (!software) blockers.push(`教程目标软件不存在：${tutorial.softwareId}`);
    else {
      const state = clone(project.generatedTutorials);
      state.schemaVersion = 1;
      state.pages = state.pages || {};
      const existingTutorial = project.tutorials.items[tutorial.softwareId];
      const generatedEntry = state.pages[tutorial.softwareId];
      if (tutorial.action === "create-page" && existingTutorial && !generatedEntry) {
        blockers.push(`提案要求创建教程页，但 ${tutorial.softwareId} 已由其他来源创建；请重新生成提案`);
      } else if (tutorial.action === "append-resource" && !existingTutorial) {
        blockers.push(`提案要求追加教程资源，但 ${tutorial.softwareId} 教程页不存在`);
      } else {
        const resource = generatedResource(proposal, evidence);
        const duplicate = (existingTutorial && existingTutorial.resources || []).find((item) =>
          item.id === resource.id || item.url === resource.url
        );
        if (duplicate) {
          if (duplicate.url === resource.url && duplicate.id === resource.id) {
            warnings.push(`教程资源已存在，教程操作降为 no-op：${resource.id}`);
          } else {
            blockers.push(`教程资源 id 或 URL 与现有资源冲突：${resource.id}`);
          }
        } else {
          const entry = generatedEntry || {
            mode: tutorial.action,
            page: tutorial.action === "create-page"
              ? generatedPage(software, resource, evidence, proposal)
              : null,
            resources: []
          };
          entry.resources = entry.resources || [];
          entry.resources.push(resource);
          state.pages[tutorial.softwareId] = entry;
          const afterContent = renderGeneratedTutorials(state);
          targets.push(targetRecord(root, TUTORIAL_TARGET, afterContent));
          operations.push({
            type: tutorial.action,
            softwareId: tutorial.softwareId,
            resourceId: resource.id,
            target: TUTORIAL_TARGET
          });
        }
      }
    }
  }

  if (project && !blockers.length) {
    const approvedTerms = new Set(
      approval.concepts.filter((item) => item.decision === "approve").map((item) => item.term)
    );
    const approvedCandidates = proposal.conceptTrack.candidates.filter((candidate) =>
      approvedTerms.has(candidate.term)
    );
    const queueFile = withinRoot(root, SUPPLEMENT_TARGET);
    let queue;
    try {
      queue = fs.existsSync(queueFile)
        ? readJson(queueFile)
        : { schemaVersion: 1, items: [] };
    } catch (error) {
      blockers.push("无法读取概念补充队列：" + error.message);
      queue = { schemaVersion: 1, items: [] };
    }
    let queueChanged = false;
    approvedCandidates.forEach((candidate) => {
      if (["supplement", "merge"].includes(candidate.decision)) {
        const id = "video-" + sha256({
          proposalHash: proposalHash(proposal),
          term: candidate.term,
          targetNode: candidate.targetNode
        }).slice(7, 23);
        if ((queue.items || []).some((item) => item.id === id)) {
          warnings.push(`概念补充任务已存在，降为 no-op：${candidate.term}`);
          return;
        }
        queue.items.push({
          id,
          status: "pending",
          decision: candidate.decision,
          term: candidate.term,
          targetNode: candidate.targetNode,
          rationale: candidate.rationale || "",
          nodeScores: candidate.nodeScores || null,
          evidenceRefs: clone(candidate.evidenceRefs || []),
          source: clone(proposal.source),
          proposalHash: proposalHash(proposal),
          evidenceHash: proposal.evidenceHash,
          approvedAt: approval.approvedAt,
          approvedBy: approval.approvedBy
        });
        queueChanged = true;
        operations.push({
          type: "queue-concept-" + candidate.decision,
          term: candidate.term,
          targetNode: candidate.targetNode,
          target: SUPPLEMENT_TARGET
        });
      } else if (candidate.decision === "new") {
        blockers.push(
          `新节点「${candidate.term}」尚不能应用：缺少通过 L1-L3 的完整原理页、推荐学习路径位置与原子应用包`
        );
      }
    });
    if (queueChanged) {
      targets.push(targetRecord(root, SUPPLEMENT_TARGET, JSON.stringify(queue, null, 2) + "\n"));
    }
  }

  const plan = {
    schemaVersion: 1,
    status: blockers.length ? "blocked" : "ready",
    proposalHash: proposalHash(proposal),
    evidenceHash: proposal.evidenceHash,
    approvalHash: sha256(approval),
    generatedAt: new Date().toISOString(),
    root,
    operations,
    blockers,
    warnings,
    targets
  };
  const withoutHash = clone(plan);
  plan.planHash = sha256(withoutHash);
  return plan;
}

function planFingerprint(plan) {
  const copy = clone(plan);
  delete copy.generatedAt;
  delete copy.planHash;
  return sha256(copy);
}

function atomicWrite(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(temp, content, "utf8");
  fs.renameSync(temp, file);
}

function runApplicationValidators(root) {
  const validators = [
    {
      script: path.join(ROOT, "tools", "validate-tutorials.js"),
      env: { TUTORIAL_ROOT: root }
    },
    {
      script: path.join(ROOT, "tools", "validate-video-applications.js"),
      env: { VIDEO_APPLICATION_ROOT: root }
    }
  ];
  const outputs = [];
  for (const validator of validators) {
    const result = spawnSync(process.execPath, [validator.script], {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, ...validator.env }
    });
    outputs.push((result.stdout || "") + (result.stderr || ""));
    if (result.status !== 0) {
      const error = new Error(`应用后门禁失败：${path.basename(validator.script)}`);
      error.validatorOutput = outputs.join("\n");
      throw error;
    }
  }
  return outputs.join("\n");
}

function applyPlan(plan, options = {}) {
  if (plan.status !== "ready" || plan.blockers.length) {
    throw new Error("应用计划被阻断：\n- " + plan.blockers.join("\n- "));
  }
  const expectedPlanHash = plan.planHash;
  const planCopy = clone(plan);
  delete planCopy.planHash;
  if (expectedPlanHash !== sha256(planCopy)) {
    throw new Error("应用计划哈希不匹配，拒绝执行");
  }
  const root = path.resolve(options.root || plan.root || ROOT);
  const written = [];
  try {
    plan.targets.forEach((target) => {
      const file = withinRoot(root, target.relativePath);
      const current = readTextIfExists(file);
      if (sha256(current) !== target.beforeHash) {
        throw new Error(`目标自预览后已变化，拒绝覆盖：${target.relativePath}`);
      }
      atomicWrite(file, target.afterContent);
      written.push(target);
    });
    const validatorOutput = runApplicationValidators(root);
    const receipt = {
      schemaVersion: 1,
      status: "applied",
      planHash: plan.planHash,
      proposalHash: plan.proposalHash,
      evidenceHash: plan.evidenceHash,
      approvalHash: plan.approvalHash,
      appliedAt: new Date().toISOString(),
      root,
      operations: clone(plan.operations),
      targets: plan.targets.map((target) => ({
        relativePath: target.relativePath,
        beforeHash: target.beforeHash,
        afterHash: target.afterHash,
        beforeContent: target.beforeContent,
        afterContent: target.afterContent
      })),
      validatorOutput
    };
    receipt.receiptHash = sha256(receipt);
    return receipt;
  } catch (error) {
    for (const target of written.reverse()) {
      atomicWrite(withinRoot(root, target.relativePath), target.beforeContent);
    }
    error.message += "\n已自动恢复所有已写目标。";
    throw error;
  }
}

function rollbackReceipt(receipt, options = {}) {
  if (!receipt || receipt.status !== "applied" || !Array.isArray(receipt.targets)) {
    throw new Error("回滚凭据无效");
  }
  const expectedHash = receipt.receiptHash;
  const copy = clone(receipt);
  delete copy.receiptHash;
  if (expectedHash !== sha256(copy)) throw new Error("回滚凭据哈希不匹配");
  const root = path.resolve(options.root || receipt.root || ROOT);
  const restored = [];
  try {
    receipt.targets.forEach((target) => {
      const file = withinRoot(root, target.relativePath);
      const current = readTextIfExists(file);
      if (sha256(current) !== target.afterHash) {
        throw new Error(`目标在应用后又被修改，拒绝回滚覆盖：${target.relativePath}`);
      }
      atomicWrite(file, target.beforeContent);
      restored.push(target);
    });
    const validatorOutput = runApplicationValidators(root);
    return {
      schemaVersion: 1,
      status: "rolled-back",
      receiptHash: expectedHash,
      rolledBackAt: new Date().toISOString(),
      validatorOutput
    };
  } catch (error) {
    for (const target of restored.reverse()) {
      atomicWrite(withinRoot(root, target.relativePath), target.afterContent);
    }
    error.message += "\n回滚失败，已恢复回滚前状态。";
    throw error;
  }
}

module.exports = {
  TUTORIAL_TARGET,
  SUPPLEMENT_TARGET,
  createApprovalDraft,
  validateApproval,
  proposalHash,
  loadProject,
  generatedResource,
  generatedPage,
  renderGeneratedTutorials,
  buildApplyPlan,
  planFingerprint,
  applyPlan,
  rollbackReceipt,
  runApplicationValidators,
  atomicWrite
};
