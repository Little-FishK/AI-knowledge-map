"use strict";

const fs = require("fs");
const path = require("path");
const { loadDeepDivePages } = require("../../deepdive/runtime/deepdive-loader");
const { pageContentHash } = require("../../deepdive/quality/deepdive-audit-contracts");
const { narrativeTemplateBlockers } = require("../../deepdive/quality/deepdive-narrative-audit");
const {evaluateAudit}=require('../../deepdive/quality/audit-evaluation');

function createManualReviewWorkflow(options) {
  const {
    defaultRoot,
    acquireLock,
    appendEvent,
    loadState,
    readJson,
    resultDirectory,
    saveState,
    withinRoot,
    writeJson,
    clone,
    sha256,
    currentPage,
    auditContract,
    auditGaps,
    auditBlockers,
    evaluateCandidate,
    editorialContentPolicyGaps,
    publishCandidate,
    publishEditorialHumanApprovedCandidate,
    refreshEditorialDraftPublication,
    provisionalPageMetadata,
    provisionalPublishedTargets,
    writePublicationTargets,
    provisionalPublicationRelativePath,
    editorialPublicationRelativePath,
    restoreTarget,
  } = options;

  function finalizeManualReview(root = defaultRoot, id, reason, workflowOptions = {}) {
    const resolvedRoot = path.resolve(root);
    const release = acquireLock(resolvedRoot);
    try {
      const state = loadState(resolvedRoot);
      const record = state.pages[id];
      if (!record) throw new Error(`不存在页面状态：${id}`);
      if (record.state !== "manual-review") {
        throw new Error(`页面 ${id} 当前不是 manual-review：${record.state}`);
      }
      if (record.lease) throw new Error(`页面 ${id} 正在执行，不能复核发布`);
      if (String(reason || "").trim().length < 3) throw new Error("复核发布原因至少需要 3 个字符");
      if (!record.auditFile) throw new Error(`页面 ${id} 没有可复用的最终独立审计`);
      const auditPath = withinRoot(resolvedRoot, record.auditFile);
      if (!fs.existsSync(auditPath)) throw new Error(`独立审计文件不存在：${record.auditFile}`);
      const audit = readJson(auditPath);
      const page = currentPage(resolvedRoot, record);
      if(audit.schemaVersion===4) {
        const findings=record.editorialWorkflow?.initialBlockingFindings||[];
        const evaluation=evaluateAudit(record.id,page,audit,{schemaVersion:4,mode:audit.mode,verificationFindings:findings,verificationScopeHash:sha256(findings)});
        if(evaluation.records.status!=='complete')throw Error('当前版本审核记录不完整或规则摘要失效；不能将其作为人工终审依据');
        record.qualityEvaluation=evaluation;
      }
      if (record.editorialWorkflow && record.editorialWorkflow.requiresHumanReview) {
        const approvedPage = clone(page);
        delete approvedPage.publication;
        const machineBlockers = clone(record.blockers || []);
        const publisher = workflowOptions.publishCandidate || publishEditorialHumanApprovedCandidate;
        const receipt = publisher(resolvedRoot, record, approvedPage, audit, workflowOptions);
        const completionFile = path.join(resultDirectory(resolvedRoot, record.id), "completion.json");
        writeJson(completionFile, receipt);
        record.auditHash = sha256(audit);
        record.auditFile = `docs/deepdive-audits/${record.id}.json`;
        record.contentHash = pageContentHash(approvedPage);
        record.blockers = [];
        record.state = "published-approved";
        delete record.auditUpgradePublicationHold;
        record.published = true;
        record.publication = {
          schemaVersion: 1,
          status: "published-approved",
          reviewStatus: "human-approved",
          pageHash: record.contentHash,
          publishedAt: new Date().toISOString(),
          machineBlockerCountAtApproval: machineBlockers.length,
        };
        record.editorialWorkflow.status = "human-approved";
        record.editorialWorkflow.auditMode = "complete";
        record.provisionalReceipt = null;
        record.finalReview = {
          status: "published-approved",
          completedAt: new Date().toISOString(),
          blockerCountAtApproval: machineBlockers.length,
          machineBlockers,
          humanApproved: true,
          reason: String(reason).slice(0, 500),
        };
        record.completionReceipt = path.relative(resolvedRoot, completionFile).replace(/\\/g, "/");
        record.updatedAt = new Date().toISOString();
        saveState(resolvedRoot, state);
        appendEvent(resolvedRoot, "editorial-human-approved", {
          id,
          reason: String(reason).slice(0, 500),
          pageHash: record.contentHash,
          auditHash: record.auditHash,
          machineBlockerCountAtApproval: machineBlockers.length,
        });
        return {
          status: "published-approved",
          pageId: record.id,
          pageHash: record.contentHash,
          auditHash: record.auditHash,
          overriddenMachineBlockerCount: machineBlockers.length,
        };
      }
      const gaps = auditGaps(record.id, page, audit, auditContract(record));
      const explicitBlockers = gaps.length ? [] : auditBlockers(audit);
      const automaticNarrativeBlockers = audit.schemaVersion === 4 ? [] : narrativeTemplateBlockers(page, audit);
      const policyBlockers = [
        ...automaticNarrativeBlockers,
        ...gaps.map(message => ({ type: "coverage", message })),
        ...explicitBlockers,
      ];
      const evaluator = workflowOptions.evaluateCandidate || evaluateCandidate;
      const gate = policyBlockers.length
        ? { passed: false, results: [], blockers: policyBlockers }
        : evaluator(resolvedRoot, record, page, audit);
      record.blockers = clone(gate.blockers || []);
      record.updatedAt = new Date().toISOString();
      if (!gate.passed) {
        saveState(resolvedRoot, state);
        appendEvent(resolvedRoot, "manual-review-recheck-blocked", {
          id,
          reason: String(reason).slice(0, 500),
          blockerCount: record.blockers.length,
        });
        return {
          status: "still-blocked",
          pageId: id,
          state: record.state,
          blockerCount: record.blockers.length,
          blockers: clone(record.blockers),
        };
      }

      const publisher = workflowOptions.publishCandidate || publishCandidate;
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
      record.state = audit.schemaVersion===4 ? "published-approved" : "l3-auto-passed";
      delete record.auditUpgradePublicationHold;
      record.published = true;
      record.publication = {
        schemaVersion: 1,
        status: "published-approved",
        reviewStatus: audit.schemaVersion===4 ? "human-approved" : "l3-auto-passed",
        pageHash: pageContentHash(approvedPage),
        publishedAt: new Date().toISOString(),
      };
      record.provisionalReceipt = null;
      record.finalReview = {
        status: record.state,
        completedAt: new Date().toISOString(),
        blockerCount: 0,
        reusedAudit: true,
        reason: String(reason).slice(0, 500),
      };
      record.completionReceipt = path.relative(resolvedRoot, completionFile).replace(/\\/g, "/");
      record.updatedAt = new Date().toISOString();
      saveState(resolvedRoot, state);
      appendEvent(resolvedRoot, "manual-review-finalized", {
        id,
        reason: String(reason).slice(0, 500),
        pageHash: record.contentHash,
        auditHash: record.auditHash,
      });
      return {
        status: record.state,
        pageId: record.id,
        pageHash: record.contentHash,
        auditHash: record.auditHash,
        reusedAudit: true,
      };
    } finally {
      release();
    }
  }

  function returnEditorialForRevision(root = defaultRoot, id, input = {}, workflowOptions = {}) {
    const resolvedRoot = path.resolve(root);
    const release = acquireLock(resolvedRoot);
    try {
      const state = loadState(resolvedRoot);
      const record = state.pages[id];
      if (!record) throw new Error(`不存在页面状态：${id}`);
      if (!record.editorialWorkflow) throw new Error("只有新版正文流程可以使用人工定向退回");
      if (record.lease) throw new Error(`页面 ${id} 正在执行，不能人工退回`);
      if (record.state !== "manual-review") throw new Error(`页面 ${id} 当前不是 manual-review`);
      const reason = String(input.reason || "").trim();
      if (reason.length < 3) throw new Error("人工退回原因至少需要 3 个字符");
      const page = currentPage(resolvedRoot, record);
      const sectionCount = (String(page && page.html || "").match(/<section\b/gi) || []).length;
      const issues = Array.isArray(input.issues) ? input.issues : [];
      if (!issues.length) throw new Error("人工退回必须至少指出一个具体问题");
      const findings = issues.map((issue, index) => {
        const claim = String(issue && issue.claim || "").trim();
        const acceptanceCriteria = String(issue && issue.acceptanceCriteria || "").trim();
        const sections = Array.isArray(issue && issue.sections) ? issue.sections : [];
        if (!claim || !acceptanceCriteria) throw new Error(`人工问题 ${index + 1} 缺少问题说明或验收标准`);
        if (!sections.length || sections.some(section => !Number.isInteger(section) || section < 1 || section > sectionCount)) {
          throw new Error(`人工问题 ${index + 1} 必须指定有效章节序号`);
        }
        return {
          type: "human-review",
          code: "human-review-issue",
          findingId: sha256(`human:${id}:${index}:${claim}:${JSON.stringify(sections)}`).slice(0, 24),
          section: sections[0],
          sections: clone(sections),
          concept: issue.concept || null,
          message: claim,
          evidence: String(issue.evidence || "").trim(),
          acceptanceCriteria,
          sourceUrls: [],
        };
      });
      record.blockers = findings;
      record.state = "repair-queued";
      record.finalReview = null;
      record.editorialWorkflow.status = "human-revision-pending";
      record.editorialWorkflow.auditMode = "verification";
      record.editorialWorkflow.verificationSource = "human";
      record.editorialWorkflow.initialBlockingFindings = clone(findings);
      record.editorialWorkflow.humanRevisionCount = Number(record.editorialWorkflow.humanRevisionCount || 0) + 1;
      refreshEditorialDraftPublication(resolvedRoot, record, page, "human-revision-pending", findings.length, workflowOptions);
      record.updatedAt = new Date().toISOString();
      saveState(resolvedRoot, state);
      appendEvent(resolvedRoot, "editorial-returned-for-human-revision", {
        id,
        reason: reason.slice(0, 500),
        issueCount: findings.length,
        humanRevisionCount: record.editorialWorkflow.humanRevisionCount,
      });
      return {
        status: "repair-queued",
        pageId: id,
        nextState: record.state,
        issueCount: findings.length,
        verificationSource: "human",
      };
    } finally {
      release();
    }
  }

  function inspectPublicationCandidate(root = defaultRoot, id) {
    const resolvedRoot = path.resolve(root);
    const state = loadState(resolvedRoot);
    const record = state.pages[id];
    if (!record) throw new Error(`不存在页面状态：${id}`);
    const candidate = currentPage(resolvedRoot, record);
    const published = loadDeepDivePages(resolvedRoot)[id] || null;
    const detectedFormatGaps = candidate ? editorialContentPolicyGaps(candidate) : [];
    // The removal contract belongs to the new editorial/content-generation workflow.
    // Existing human-authored pages may intentionally retain misconceptions and self-tests.
    const formatPolicyApplies = Boolean(record.editorialWorkflow);
    const formatGaps = formatPolicyApplies ? detectedFormatGaps : [];
    return {
      status: "ready",
      pageId: id,
      workflowState: record.state,
      publicationState: record.publication && record.publication.status
        ? record.publication.status
        : (record.published ? "published-current" : "unpublished"),
      active: Boolean(record.lease),
      candidateHash: candidate ? pageContentHash(candidate) : null,
      publishedHash: published ? pageContentHash(published) : null,
      blockerCount: (record.blockers || []).length,
      blockers: clone(record.blockers || []),
      formatPolicyApplies,
      formatGaps,
      legacyFormatObservations: formatPolicyApplies ? [] : detectedFormatGaps,
      canPublishProvisional: Boolean(
        candidate
        && !record.lease
        && !record.integration
        && ["manual-review", "l3-auto-passed"].includes(record.state)
        && !(record.publication && record.publication.status === "published-provisional")
      ),
      publication: clone(record.publication || null),
    };
  }

  function publishProvisionalPage(root = defaultRoot, id, expectedCandidateHash, reason, workflowOptions = {}) {
    const resolvedRoot = path.resolve(root);
    const release = acquireLock(resolvedRoot);
    try {
      const state = loadState(resolvedRoot);
      const record = state.pages[id];
      if (!record) throw new Error(`不存在页面状态：${id}`);
      if (record.lease) throw new Error(`页面 ${id} 正在执行，不能暂行发布`);
      if (!["manual-review", "l3-auto-passed"].includes(record.state)) {
        throw new Error(`页面 ${id} 当前状态为 ${record.state}，不能暂行发布`);
      }
      if (record.integration) throw new Error("新概念节点不能以不合格暂行版本发布；必须先通过正式门禁");
      if (record.publication && record.publication.status === "published-provisional") {
        throw new Error(`页面 ${id} 已是暂行版本；请先回滚或完成新的审计流程`);
      }
      const publishReason = String(reason || "").trim();
      if (publishReason.length < 3) throw new Error("暂行发布原因至少需要 3 个字符");
      const candidate = currentPage(resolvedRoot, record);
      if (!candidate) throw new Error(`页面 ${id} 没有可发布正文`);
      const formatGaps = record.editorialWorkflow ? editorialContentPolicyGaps(candidate) : [];
      if (formatGaps.length) throw new Error(`候选页仍有格式缺陷：${formatGaps.join("；")}`);
      const candidateHash = pageContentHash(candidate);
      if (expectedCandidateHash !== candidateHash) {
        throw new Error(`候选哈希不匹配：期望 ${expectedCandidateHash || "（缺失）"}，当前 ${candidateHash}`);
      }
      let audit = null;
      if (record.auditFile) {
        const auditPath = withinRoot(resolvedRoot, record.auditFile);
        if (fs.existsSync(auditPath)) audit = readJson(auditPath);
      }
      const effectiveBlockers = (record.blockers || []).length
        ? clone(record.blockers)
        : [{ type: "human-review-rejected", code: "human-review-rejected", message: publishReason.slice(0, 1000) }];
      const publishedAt = new Date().toISOString();
      const publication = provisionalPageMetadata(record, candidate, effectiveBlockers, publishReason, publishedAt);
      const page = { ...clone(candidate), publication };
      const previousRecord = {
        state: record.state,
        contentHash: record.contentHash,
        blockers: clone(record.blockers || []),
        editorialWarnings: clone(record.editorialWarnings || []),
        finalReview: clone(record.finalReview || null),
        published: Boolean(record.published),
        publication: clone(record.publication || null),
        provisionalReceipt: record.provisionalReceipt || null,
      };
      const publisher = workflowOptions.publishCandidate || ((targetRoot, targetRecordValue, targetPage, targetAudit) => {
        const targets = provisionalPublishedTargets(targetRoot, targetRecordValue, targetPage, targetAudit);
        return writePublicationTargets(targetRoot, targetRecordValue, targets, workflowOptions);
      });
      const publicationResult = publisher(resolvedRoot, record, page, audit);
      const receipt = {
        schemaVersion: 1,
        status: "published-provisional",
        pageId: id,
        pageHash: candidateHash,
        previousState: previousRecord.state,
        workflowState: "manual-review",
        blockerCount: effectiveBlockers.length,
        reason: publishReason.slice(0, 500),
        publishedAt,
        targets: (publicationResult.targets || []).map(target => ({
          relativePath: target.relativePath,
          beforeExists: target.beforeExists,
          beforeContent: target.beforeContent,
          beforeHash: target.beforeHash,
          afterContent: target.afterContent,
          afterHash: target.afterHash,
        })),
        validators: (publicationResult.validators || []).map(result => ({ script: result.script, passed: result.passed })),
        previousRecord,
      };
      receipt.receiptHash = sha256(receipt);
      const receiptRelative = provisionalPublicationRelativePath(id);
      const receiptPath = withinRoot(resolvedRoot, receiptRelative);
      try {
        writeJson(receiptPath, receipt);
        record.state = "manual-review";
        record.contentHash = candidateHash;
        record.blockers = effectiveBlockers;
        record.published = true;
        record.publication = publication;
        record.provisionalReceipt = receiptRelative;
        record.finalReview = {
          status: "manual-review",
          completedAt: publishedAt,
          blockerCount: effectiveBlockers.length,
          provisionalPublished: true,
          reason: publishReason.slice(0, 500),
        };
        record.updatedAt = publishedAt;
        saveState(resolvedRoot, state);
      } catch (error) {
        const targets = publicationResult.targets || [];
        try {
          targets.forEach(target => {
            const file = withinRoot(resolvedRoot, target.relativePath);
            const current = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
            if (sha256(current) !== target.afterHash) {
              throw new Error(`正式目标在状态提交失败后变化：${target.relativePath}`);
            }
          });
          [...targets].reverse().forEach(target => restoreTarget(resolvedRoot, target));
          if (fs.existsSync(receiptPath)) fs.unlinkSync(receiptPath);
          error.message += "\n已恢复暂行发布目标与私有回执。";
        } catch (rollbackError) {
          error.message += `\n暂行发布自动回滚失败：${rollbackError.message}`;
        }
        throw error;
      }
      appendEvent(resolvedRoot, "manual-candidate-published-provisional", {
        id,
        previousState: previousRecord.state,
        pageHash: candidateHash,
        blockerCount: effectiveBlockers.length,
        reason: publishReason.slice(0, 500),
        receiptHash: receipt.receiptHash,
      });
      return {
        status: "published-provisional",
        pageId: id,
        workflowState: record.state,
        publicationState: record.publication.status,
        pageHash: candidateHash,
        blockerCount: effectiveBlockers.length,
        receiptPath: receiptRelative,
        receiptHash: receipt.receiptHash,
      };
    } finally {
      release();
    }
  }

  function rollbackProvisionalPage(root = defaultRoot, id, expectedCandidateHash, reason, workflowOptions = {}) {
    const resolvedRoot = path.resolve(root);
    const release = acquireLock(resolvedRoot);
    try {
      const state = loadState(resolvedRoot);
      const record = state.pages[id];
      if (!record) throw new Error(`不存在页面状态：${id}`);
      if (record.lease) throw new Error(`页面 ${id} 正在执行，不能回滚暂行版本`);
      if (!record.publication || record.publication.status !== "published-provisional") {
        throw new Error(`页面 ${id} 当前不是暂行发布版本`);
      }
      if (record.publication.candidateHash !== expectedCandidateHash) {
        throw new Error("暂行版本候选哈希不匹配，拒绝回滚");
      }
      const rollbackReason = String(reason || "").trim();
      if (rollbackReason.length < 3) throw new Error("回滚原因至少需要 3 个字符");
      const receiptRelative = record.provisionalReceipt || provisionalPublicationRelativePath(id);
      const receiptPath = withinRoot(resolvedRoot, receiptRelative);
      if (!fs.existsSync(receiptPath)) throw new Error(`暂行发布回执不存在：${receiptRelative}`);
      const receipt = readJson(receiptPath);
      if (receipt.pageId !== id || receipt.pageHash !== expectedCandidateHash) {
        throw new Error("暂行发布回执与当前页面不匹配");
      }
      const restore = workflowOptions.restorePublication || ((targetRoot, targets) => {
        targets.forEach(target => {
          const file = withinRoot(targetRoot, target.relativePath);
          const current = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
          if (sha256(current) !== target.afterHash) {
            throw new Error(`正式目标在暂行发布后变化，拒绝覆盖：${target.relativePath}`);
          }
        });
        [...targets].reverse().forEach(target => restoreTarget(targetRoot, target));
      });
      restore(resolvedRoot, receipt.targets || []);
      const previous = receipt.previousRecord || {};
      record.state = previous.state || "manual-review";
      record.contentHash = previous.contentHash || record.contentHash;
      record.blockers = clone(previous.blockers || []);
      record.editorialWarnings = clone(previous.editorialWarnings || []);
      record.finalReview = clone(previous.finalReview || null);
      record.published = Boolean(previous.published);
      record.publication = clone(previous.publication || null);
      record.provisionalReceipt = previous.provisionalReceipt || null;
      record.updatedAt = new Date().toISOString();
      saveState(resolvedRoot, state);
      appendEvent(resolvedRoot, "manual-candidate-provisional-rolled-back", {
        id,
        pageHash: expectedCandidateHash,
        restoredState: record.state,
        reason: rollbackReason.slice(0, 500),
        receiptHash: receipt.receiptHash || null,
      });
      return {
        status: "rolled-back",
        pageId: id,
        workflowState: record.state,
        publicationState: record.publication && record.publication.status
          ? record.publication.status
          : (record.published ? "published-current" : "unpublished"),
        restoredTargetCount: (receipt.targets || []).length,
      };
    } finally {
      release();
    }
  }

  function rollbackEditorialCandidate(root = defaultRoot, id, expectedCandidateHash, reason, workflowOptions = {}) {
    const resolvedRoot = path.resolve(root);
    const release = acquireLock(resolvedRoot);
    try {
      const state = loadState(resolvedRoot);
      const record = state.pages[id];
      if (!record) throw new Error(`不存在页面状态：${id}`);
      if (record.lease) throw new Error(`页面 ${id} 正在执行，不能撤销待审候选`);
      const hasRecoverableEditorialCandidate = Boolean(record.candidateFile && record.editorialReceipt && record.contentHash);
      if ((!record.publication || record.publication.status !== "published-editorial-draft")
        && !hasRecoverableEditorialCandidate) {
        throw new Error(`页面 ${id} 当前不是待审候选`);
      }
      const candidate = currentPage(resolvedRoot, record);
      const candidateHash = pageContentHash(candidate);
      if (candidateHash !== expectedCandidateHash || record.contentHash !== expectedCandidateHash) {
        throw new Error("待审候选哈希不匹配，拒绝撤销");
      }
      const rollbackReason = String(reason || "").trim();
      if (rollbackReason.length < 3) throw new Error("撤销原因至少需要 3 个字符");
      const receiptRelative = record.editorialReceipt || editorialPublicationRelativePath(id);
      const receiptPath = withinRoot(resolvedRoot, receiptRelative);
      if (!fs.existsSync(receiptPath)) throw new Error(`待审候选回执不存在：${receiptRelative}`);
      const receipt = readJson(receiptPath);
      if (receipt.pageId !== id) throw new Error("待审候选回执与当前页面不匹配");
      const candidateRelative = record.candidateFile;
      const publicationTargets = (receipt.targets || []).filter(target => target.relativePath !== candidateRelative);
      const restore = workflowOptions.restorePublication || ((targetRoot, targets) => {
        targets.forEach(target => {
          const file = withinRoot(targetRoot, target.relativePath);
          const current = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
          if (sha256(current) !== target.afterHash) {
            throw new Error(`正式目标在待审发布后变化，拒绝覆盖：${target.relativePath}`);
          }
        });
        [...targets].reverse().forEach(target => restoreTarget(targetRoot, target));
      });
      restore(resolvedRoot, publicationTargets);
      const candidateTarget = (receipt.targets || []).find(target => target.relativePath === candidateRelative);
      if (candidateTarget) restoreTarget(resolvedRoot, candidateTarget);
      if (record.auditFile && record.auditFile.startsWith(".stage2/results/")
        && fs.existsSync(withinRoot(resolvedRoot, record.auditFile))) {
        fs.unlinkSync(withinRoot(resolvedRoot, record.auditFile));
      }
      const previous = receipt.previousRecord || {};
      record.state = previous.state || "manual-review";
      record.contentHash = previous.contentHash || null;
      record.auditHash = previous.auditHash || null;
      record.auditFile = previous.auditFile || null;
      record.candidateFile = previous.candidateFile || null;
      record.blockers = clone(previous.blockers || []);
      record.editorialWarnings = clone(previous.editorialWarnings || []);
      record.finalReview = clone(previous.finalReview || null);
      record.published = Boolean(previous.published);
      record.publication = clone(previous.publication || null);
      record.editorialWorkflow = clone(previous.editorialWorkflow || null);
      record.editorialReceipt = previous.editorialReceipt || null;
      record.provisionalReceipt = previous.provisionalReceipt || null;
      record.repairAttempts = 0;
      record.lease = null;
      record.updatedAt = new Date().toISOString();
      saveState(resolvedRoot, state);
      appendEvent(resolvedRoot, "editorial-candidate-rolled-back", {
        id,
        pageHash: expectedCandidateHash,
        restoredState: record.state,
        reason: rollbackReason.slice(0, 500),
        receiptHash: receipt.receiptHash || null,
      });
      return {
        status: "rolled-back",
        pageId: id,
        workflowState: record.state,
        publicationState: record.publication && record.publication.status
          ? record.publication.status
          : (record.published ? "published-current" : "unpublished"),
        restoredTargetCount: publicationTargets.length + (candidateTarget ? 1 : 0),
      };
    } finally {
      release();
    }
  }

  return {
    finalizeManualReview,
    inspectPublicationCandidate,
    publishProvisionalPage,
    returnEditorialForRevision,
    rollbackEditorialCandidate,
    rollbackProvisionalPage,
  };
}

module.exports = { createManualReviewWorkflow };
