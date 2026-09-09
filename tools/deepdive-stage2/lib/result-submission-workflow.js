"use strict";

const path = require("path");
const { pageContentHash } = require("../../deepdive/quality/deepdive-audit-contracts");
const { narrativeTemplateBlockers } = require("../../deepdive/quality/deepdive-narrative-audit");
const { figureRepairBaseline } = require("./editorial-figure-repair");
const {evaluateAudit}=require('../../deepdive/quality/audit-evaluation');

function createResultSubmissionWorkflow(dependencies) {
  const {
    defaultRoot,
    toolScripts,
    queueByRole,
    acquireLock,
    appendEvent,
    archiveCurrentTaskDirective,
    atomicWrite,
    auditBlockers,
    auditContract,
    auditGaps,
    authorizeTaskLease,
    candidateRelativePath,
    clone,
    contentGenerationMarkdown,
    contentGenerationResultGaps,
    contentGenerationReviewMaterial,
    currentPage,
    editorialContentPolicyGaps,
    editorialPreservationReport,
    ensureReviewHistory,
    evaluateCandidate,
    expireLease,
    gateDefects,
    loadState,
    pageSourceSignature,
    privateAuditRelativePath,
    publishCandidate,
    readResponsesV2,
    refreshEditorialDraftPublication,
    resultDirectory,
    runGate,
    saveState,
    sha256,
    validatePage,
    visibleRawLatexSections,
    withinRoot,
    writeResponseObject,
    writeJson,
  } = dependencies;

  function evaluateEditorialCandidate(root, record, page) {
    const policyGaps = editorialContentPolicyGaps(page);
    const results = [runGate(root, root, toolScripts.deepDiveValidator)];
    return {
      passed: policyGaps.length === 0 && results.every(result => result.passed),
      results,
      blockers: [
        ...policyGaps.map(message => ({ type: "format-policy", code: "forbidden-section", message })),
        ...results.filter(result => !result.passed).flatMap(result => gateDefects(result, record.id)),
      ],
    };
  }

  function compactBlocker(blocker) {
    return {
      code: String(blocker && (blocker.code || blocker.type || blocker.gate) || "blocker").slice(0, 160),
      section: Number.isInteger(blocker && blocker.section) ? blocker.section : null,
      message: String(blocker && (blocker.message || blocker.evidence) || JSON.stringify(blocker || {})).slice(0, 1000),
    };
  }

  function validateAuditResult(root = defaultRoot, input = {}) {
    const resolvedRoot = path.resolve(root);
    const record = authorizeTaskLease(resolvedRoot, input.taskId, input.leaseToken);
    if (!record.lease || record.lease.role !== "audit") {
      throw new Error("Audit preflight is available only to an active audit lease");
    }
    const page = currentPage(resolvedRoot, record);
    const gaps = auditGaps(record.id, page, input.result, auditContract(record));
    return {
      status: gaps.length ? "invalid" : "valid",
      pageId: record.id,
      gapCount: gaps.length,
      gaps,
    };
  }

  function validatePageResult(root = defaultRoot, input = {}) {
    const resolvedRoot = path.resolve(root);
    const record = authorizeTaskLease(resolvedRoot, input.taskId, input.leaseToken);
    if (!record.lease || record.lease.role === "audit") {
      throw new Error("Page-result preflight is available only to an active write, update, or repair lease");
    }
    const result = input.result || {};
    const page = result.page;
    const originalPage = currentPage(resolvedRoot, record);
    const gaps = validatePage(record.id, page);
    if (record.editorialWorkflow) {
      gaps.push(...editorialContentPolicyGaps(page));
      if (record.lease.role === "repair" && pageSourceSignature(page) !== pageSourceSignature(originalPage)) {
        gaps.push("返修不得添加、删除或替换页面来源");
      }
      if (record.lease.role === "repair") {
        try {
          const permitted = figureRepairBaseline(record, originalPage, page, process.env.STAGE2_REPAIR_FIGURE_AUTHORIZATION);
          const preservation = editorialPreservationReport(permitted.baseline, page, []);
          if (!preservation.passed) gaps.push("返修不得删除或改写未获授权的图表");
        } catch (error) { gaps.push(error.message); }
        const rawLatexSections = visibleRawLatexSections(page);
        if (rawLatexSections.length) {
          gaps.push(`返修后第 ${rawLatexSections.map(item => item.section).join("、")} 节仍显示原始 LaTeX 命令`);
        }
      }
    }
    if (page && typeof page === "object" && !Array.isArray(page)) {
      for (const key of Object.keys(originalPage || {})) {
        if (!Object.hasOwn(page, key)) gaps.push(`result.page.${key} is missing from the complete page object`);
      }
    }
    if (!String(result.summary || "").trim()) gaps.push("result.summary is missing");
    return {
      status: gaps.length ? "invalid" : "valid",
      pageId: record.id,
      role: record.lease.role,
      gapCount: gaps.length,
      gaps,
    };
  }

  function submitResult(root = defaultRoot, input = {}, options = {}) {
    const resolvedRoot = path.resolve(root);
    const release = acquireLock(resolvedRoot);
    try {
      const state = loadState(resolvedRoot);
      expireLease(resolvedRoot, state);
      const record = Object.values(state.pages).find(page =>
        page.lease && page.lease.taskId === input.taskId
      );
      if (!record) throw new Error("任务不存在、租约已过期或已经提交");
      if (record.lease.token !== input.leaseToken) throw new Error("租约令牌无效");
      const role = record.lease.role;
      if(role==='audit')authorizeTaskLease(resolvedRoot,input.taskId,input.leaseToken);
      const result = input.result || {};
      if (role === "content-generation") {
        const material = contentGenerationReviewMaterial(resolvedRoot, record);
        const savedResponses = readResponsesV2(
          resolvedRoot,
          record.id,
          record.contentGeneration,
        ).map(({ sectionNumber, title, response }) => ({ sectionNumber, title, response }));
        const completedResult = result.useSavedResponses === true
          ? { pageId: record.id, responses: savedResponses, summary: result.summary || "" }
          : result;
        const gaps = contentGenerationResultGaps(record, material, completedResult);
        if (JSON.stringify(completedResult.responses || []) !== JSON.stringify(savedResponses)) {
          gaps.push("result.responses 必须与逐章保存的完整回复完全一致");
        }
        if (gaps.length) throw new Error(gaps.join("\n"));
        const outputRelative = record.contentGeneration && record.contentGeneration.outputFile
          ? record.contentGeneration.outputFile
          : `docs/deepdive-reviews/${record.id}-agent-responses.md`;
        const markdown = contentGenerationMarkdown(material, completedResult);
        atomicWrite(withinRoot(resolvedRoot, outputRelative), markdown);
        const now = new Date().toISOString();
        const previousState = record.contentGeneration && record.contentGeneration.previousState
          ? record.contentGeneration.previousState
          : "audit-queued";
        record.contentGeneration = {
          ...(record.contentGeneration || {}),
          status: "complete",
          completedAt: now,
          responseCount: completedResult.responses.length,
          outputFile: outputRelative,
          outputHash: sha256(markdown),
          summary: String(completedResult.summary || "").slice(0, 500),
          savedResponsesRef: writeResponseObject(
            resolvedRoot,
            record.id,
            savedResponses,
          ).reference,
        };
        record.state = previousState;
        record.lease = null;
        record.updatedAt = now;
        saveState(resolvedRoot, state);
        appendEvent(resolvedRoot, "content-generation-completed", {
          id: record.id,
          taskId: input.taskId,
          responseCount: completedResult.responses.length,
          outputFile: outputRelative,
          nextState: record.state,
        });
        return {
          status: "content-generated",
          pageId: record.id,
          nextState: record.state,
          responseCount: completedResult.responses.length,
          outputFile: outputRelative,
          outputHash: record.contentGeneration.outputHash,
          uiCleanup: archiveCurrentTaskDirective("内容生成回复已保存，当前工作任务已终止"),
        };
      }
      if (role !== "audit") {
        const previousPage = currentPage(resolvedRoot, record);
        let figureRepairReceipt = null;
        const pageErrors = validatePage(record.id, result.page);
        if (record.editorialWorkflow) {
          pageErrors.push(...editorialContentPolicyGaps(result.page));
          if (role === "repair" && pageSourceSignature(result.page) !== pageSourceSignature(previousPage)) {
            pageErrors.push("返修不得添加、删除或替换页面来源");
          }
          if (role === "repair") {
            const permitted = figureRepairBaseline(record, previousPage, result.page, process.env.STAGE2_REPAIR_FIGURE_AUTHORIZATION);
            figureRepairReceipt = permitted.receipt;
            const preservation = editorialPreservationReport(permitted.baseline, result.page, []);
            if (!preservation.passed) pageErrors.push("返修不得删除或改写未获授权的图表");
          }
        }
        if (pageErrors.length) throw new Error(pageErrors.join("\n"));
        const narrativeBlockers = narrativeTemplateBlockers(result.page, null);
        if (narrativeBlockers.length) {
          record.blockers = clone(narrativeBlockers);
          record.state = queueByRole[role];
          record.lease = null;
          record.updatedAt = new Date().toISOString();
          saveState(resolvedRoot, state);
          appendEvent(resolvedRoot, "candidate-rejected", {
            id: record.id,
            taskId: input.taskId,
            role,
            reason: "harmful-template-expression",
            blockerCount: narrativeBlockers.length,
          });
          return {
            status: "rejected",
            pageId: record.id,
            nextState: record.state,
            blockerCount: narrativeBlockers.length,
            reason: "harmful-template-expression",
            uiCleanup: archiveCurrentTaskDirective("本次候选已拒绝并重新排队，当前工作任务已终止"),
          };
        }
        const candidate = {
          schemaVersion: 1,
          pageId: record.id,
          role,
          taskId: record.lease.taskId,
          createdAt: new Date().toISOString(),
          summary: String(result.summary || "").slice(0, 500),
          page: clone(result.page),
          pageHash: pageContentHash(result.page),
          ...(figureRepairReceipt ? { figureRepairReceipt } : {}),
        };
        const relative = candidateRelativePath(record.id);
        writeJson(withinRoot(resolvedRoot, relative), candidate);
        record.candidateFile = relative;
        record.contentHash = candidate.pageHash;
        record.auditHash = null;
        record.auditFile = null;
        if(record.auditPolicyVersion===4)record.qualityEvaluation={policyVersion:4,pageHash:candidate.pageHash,status:'pending-independent-review',learnerValidation:'not-tested'};
        record.blockers = [];
        if (role === "repair") {
          record.repairAttempts += 1;
          const history = ensureReviewHistory(record);
          const openRound = [...history].reverse().find(round => !round.improvement);
          if (openRound) {
            openRound.improvement = {
              summary: candidate.summary,
              pageHash: candidate.pageHash,
              submittedAt: candidate.createdAt,
              ...(figureRepairReceipt ? { figureRepairReceipt } : {}),
            };
          }
        }
        record.state = "audit-queued";
        if (record.editorialWorkflow && record.editorialWorkflow.requiresHumanReview) {
          record.editorialWorkflow.status = role === "repair" ? "verification-pending" : "machine-audit-pending";
          if (role === "repair") record.editorialWorkflow.auditMode = "verification";
          record.editorialWorkflow.candidateUpdatedAt = candidate.createdAt;
          refreshEditorialDraftPublication(
            resolvedRoot,
            record,
            result.page,
            role === "repair" ? "verification-pending" : "audit-pending",
            (record.blockers || []).length,
            options,
          );
        }
        record.lease = null;
        record.updatedAt = new Date().toISOString();
        saveState(resolvedRoot, state);
        appendEvent(resolvedRoot, "candidate-submitted", {
          id: record.id,
          taskId: input.taskId,
          role,
          pageHash: candidate.pageHash,
        });
        return {
          status: "accepted",
          pageId: record.id,
          nextState: record.state,
          pageHash: candidate.pageHash,
          uiCleanup: archiveCurrentTaskDirective("本次候选已接收，当前工作任务已终止"),
        };
      }

      const page = currentPage(resolvedRoot, record);
      const auditInput = result.audit || (Number.isInteger(result.schemaVersion) ? result : null);
      const audit = clone(auditInput);
      const activeAuditContract = auditContract(record);
      const gaps = auditGaps(record.id, page, audit, activeAuditContract);
      if (gaps.length) {
        record.auditHash = null;
        record.auditFile = null;
        record.blockers = [];
        record.lease = null;
        record.state = "audit-queued";
        record.finalReview = null;
        if(activeAuditContract.schemaVersion===4)record.qualityEvaluation={policyVersion:4,pageHash:pageContentHash(page),status:'invalid-submission',learnerValidation:'not-tested'};
        record.updatedAt = new Date().toISOString();
        saveState(resolvedRoot, state);
        appendEvent(resolvedRoot, "audit-rejected", {
          id: record.id,
          taskId: input.taskId,
          nextState: record.state,
          reason: "invalid-audit-contract",
          issueCount: gaps.length,
          issues: clone(gaps),
        });
        return {
          status: "rejected",
          reason: "invalid-audit-contract",
          pageId: record.id,
          nextState: record.state,
          issueCount: gaps.length,
          issues: clone(gaps),
          uiCleanup: archiveCurrentTaskDirective("本次审计不符合提交合同，页面已重新排队等待新的独立审计"),
        };
      }
      const privateRelative = audit.schemaVersion===4 ? `.stage2/results/${record.id}/audit-${sha256(audit).slice(7)}.json` : privateAuditRelativePath(record.id);
      writeJson(withinRoot(resolvedRoot, privateRelative), audit || {});
      if(audit.schemaVersion===4) {
        record.auditPolicyVersion=4;
        record.qualityEvaluation=evaluateAudit(record.id,page,audit,activeAuditContract);
        record.auditReceipts=[...(record.auditReceipts||[]),{auditFile:privateRelative,auditHash:sha256(audit),pageHash:pageContentHash(page),
          policyVersion:4,mode:audit.mode,reviewer:record.lease.workerId,taskId:record.lease.taskId,acceptedAt:new Date().toISOString()}];
      }
      const editorial = Boolean(record.editorialWorkflow && record.editorialWorkflow.requiresHumanReview);
      const evaluator = options.evaluateCandidate || (editorial && audit.schemaVersion!==4 ? evaluateEditorialCandidate : evaluateCandidate);
      const explicitBlockers = auditBlockers(audit);
      // v4 relies on the independent, evidenced whole-page judgment shared with CI.
      // Preserve the historical sentence-pattern gate only for historical contracts.
      const automaticNarrativeBlockers = activeAuditContract.schemaVersion === 4 || activeAuditContract.mode === "verification"
        ? []
        : narrativeTemplateBlockers(page, audit);
      const policyBlockers = [
        ...automaticNarrativeBlockers,
        ...explicitBlockers,
      ];
      const gate = policyBlockers.length
        ? { passed: false, results: [], blockers: policyBlockers }
        : evaluator(resolvedRoot, record, page, audit);
      if (!gate.passed) {
        record.auditHash = null;
        record.auditFile = privateRelative;
        record.blockers = clone(gate.blockers || []);
        record.lease = null;
        const isVerification = editorial && activeAuditContract.mode === "verification";
        const maxRepairAttempts = editorial ? 1 : state.policy.maxRepairAttempts;
        if (isVerification || record.repairAttempts >= maxRepairAttempts) {
          record.state = "manual-review";
        } else {
          record.state = "repair-queued";
        }
        ensureReviewHistory(record).push({
          round: ensureReviewHistory(record).length + 1,
          auditedAt: new Date().toISOString(),
          pageHash: pageContentHash(page),
          auditDecision: "fail",
          reportedAuditDecision: audit && audit.decision || "invalid",
          defects: clone(gate.blockers || []).map(compactBlocker),
          improvement: null,
          nextState: record.state,
        });
        record.finalReview = record.state === "manual-review"
          ? {
            status: "manual-review",
            completedAt: new Date().toISOString(),
            blockerCount: record.blockers.length,
          }
          : null;
        if (record.editorialWorkflow && record.editorialWorkflow.requiresHumanReview) {
          if (!isVerification && !Array.isArray(record.editorialWorkflow.initialBlockingFindings)) {
            record.editorialWorkflow.initialBlockingFindings = [];
          }
          if (!isVerification && !record.editorialWorkflow.initialBlockingFindings.length) {
            record.editorialWorkflow.initialBlockingFindings = clone(record.blockers);
            record.editorialWorkflow.verificationSource = "machine";
          }
          record.editorialWorkflow.status = record.state === "manual-review"
            ? "human-review-blocked"
            : "repair-pending";
          record.editorialWorkflow.auditMode = record.state === "manual-review" ? "complete" : "verification";
          record.editorialWorkflow.lastAuditedAt = new Date().toISOString();
          record.editorialWarnings = clone(audit.warnings || []);
          refreshEditorialDraftPublication(
            resolvedRoot,
            record,
            page,
            record.state === "manual-review" ? "human-review-blocked" : "repair-pending",
            record.blockers.length,
            options,
          );
        }
        record.updatedAt = new Date().toISOString();
        saveState(resolvedRoot, state);
        appendEvent(resolvedRoot, "audit-failed", {
          id: record.id,
          taskId: input.taskId,
          nextState: record.state,
          blockerCount: record.blockers.length,
        });
        return {
          status: record.state === "manual-review" ? "awaiting-human-review" : "needs-repair",
          pageId: record.id,
          nextState: record.state,
          blockerCount: record.blockers.length,
          uiCleanup: archiveCurrentTaskDirective("本次审计已接收，后续由新的返修任务处理"),
        };
      }

      if (editorial || audit.schemaVersion===4) {
        record.auditHash = sha256(audit);
        record.auditFile = privateRelative;
        record.contentHash = pageContentHash(page);
        record.blockers = [];
        record.editorialWarnings = clone(gate.editorialWarnings || []);
        record.state = "manual-review";
        record.lease = null;
        if(editorial) {
          record.editorialWorkflow.status = "human-review-pending";
          record.editorialWorkflow.auditMode = "complete";
          record.editorialWorkflow.machineAuditPassedAt = new Date().toISOString();
        }
        record.finalReview = {
          status: "manual-review",
          completedAt: new Date().toISOString(),
          blockerCount: 0,
          machineAuditPassed: true,
        };
        record.editorialWarnings = clone(audit.warnings || []);
        if(editorial) refreshEditorialDraftPublication(
          resolvedRoot,
          record,
          page,
          "human-review-pending",
          0,
          options,
        );
        record.updatedAt = new Date().toISOString();
        saveState(resolvedRoot, state);
        appendEvent(resolvedRoot, "editorial-machine-audit-passed", {
          id: record.id,
          taskId: input.taskId,
          pageHash: record.contentHash,
          auditHash: record.auditHash,
          nextState: record.state,
        });
        return {
          status: "awaiting-human-review",
          pageId: record.id,
          nextState: record.state,
          pageHash: record.contentHash,
          auditHash: record.auditHash,
          publicationState: record.publication && record.publication.status,
          uiCleanup: archiveCurrentTaskDirective("机器审查已通过，页面等待人工复核"),
        };
      }

      const publisher = options.publishCandidate || publishCandidate;
      const approvedPage = clone(page);
      delete approvedPage.publication;
      const receipt = publisher(resolvedRoot, record, approvedPage, audit);
      const completionFile = path.join(resultDirectory(resolvedRoot, record.id), "completion.json");
      writeJson(completionFile, receipt);
      record.auditHash = sha256(audit);
      record.auditFile = `docs/deepdive-audits/${record.id}.json`;
      record.contentHash = pageContentHash(page);
      record.blockers = [];
      record.editorialWarnings = clone(gate.editorialWarnings || []);
      record.state = "l3-auto-passed";
      record.lease = null;
      record.published = true;
      record.publication = {
        schemaVersion: 1,
        status: "published-approved",
        reviewStatus: "l3-auto-passed",
        pageHash: pageContentHash(approvedPage),
        publishedAt: new Date().toISOString(),
      };
      record.provisionalReceipt = null;
      record.finalReview = {
        status: "l3-auto-passed",
        completedAt: new Date().toISOString(),
        blockerCount: 0,
      };
      record.completionReceipt = path.relative(resolvedRoot, completionFile).replace(/\\/g, "/");
      record.updatedAt = new Date().toISOString();
      saveState(resolvedRoot, state);
      appendEvent(resolvedRoot, "page-l3-passed", {
        id: record.id,
        taskId: input.taskId,
        pageHash: record.contentHash,
        auditHash: record.auditHash,
      });
      return {
        status: "l3-auto-passed",
        pageId: record.id,
        pageHash: record.contentHash,
        auditHash: record.auditHash,
        uiCleanup: archiveCurrentTaskDirective("本次审计与发布已完成"),
      };
    } finally {
      release();
    }
  }

  return {
    submitResult,
    validateAuditResult,
    validatePageResult,
  };
}

module.exports = { createResultSubmissionWorkflow };
