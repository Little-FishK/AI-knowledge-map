"use strict";

const path = require("path");

function createReviewRecovery(dependencies) {
  const {
    defaultRoot,
    acquireLock,
    appendEvent,
    loadState,
    saveState,
  } = dependencies;

  function resetManualReview(root = defaultRoot, id, reason) {
    const resolvedRoot = path.resolve(root);
    const release = acquireLock(resolvedRoot);
    try {
      const state = loadState(resolvedRoot);
      const record = state.pages[id];
      if (!record) throw new Error(`不存在页面状态：${id}`);
      if (record.lease) throw new Error(`页面 ${id} 正在执行，不能重置`);
      if (record.state !== "manual-review") {
        throw new Error(`页面 ${id} 当前状态为 ${record.state}，只有 manual-review 可以重置`);
      }
      const resetReason = String(reason || "").trim();
      if (resetReason.length < 3) throw new Error("重置原因至少需要 3 个字符");
      const previousState = record.state;
      record.repairAttempts = 0;
      record.state = "audit-queued";
      record.blockers = [];
      record.reviewHistory = [];
      record.finalReview = null;
      record.updatedAt = new Date().toISOString();
      saveState(resolvedRoot, state);
      appendEvent(resolvedRoot, "manual-review-reset", {
        id,
        previousState,
        nextState: record.state,
        reason: resetReason.slice(0, 500),
      });
      return {
        status: "reset",
        pageId: id,
        previousState,
        nextState: record.state,
        repairAttempts: record.repairAttempts,
        blockerCount: record.blockers.length,
      };
    } finally {
      release();
    }
  }

  function resetPassedPage(root = defaultRoot, id, reason) {
    const resolvedRoot = path.resolve(root);
    const release = acquireLock(resolvedRoot);
    try {
      const state = loadState(resolvedRoot);
      const record = state.pages[id];
      if (!record) throw new Error(`不存在页面状态：${id}`);
      if (record.lease) throw new Error(`页面 ${id} 正在执行，不能重置`);
      if (record.state !== "l3-auto-passed") {
        throw new Error(`页面 ${id} 当前状态为 ${record.state}，只有 l3-auto-passed 可以重置复审`);
      }
      const resetReason = String(reason || "").trim();
      if (resetReason.length < 3) throw new Error("重置原因至少需要 3 个字符");
      const previousState = record.state;
      const previousAuditHash = record.auditHash || null;
      const previousAuditFile = record.auditFile || null;
      const previousCompletionReceipt = record.completionReceipt || null;
      record.repairAttempts = 0;
      record.state = "audit-queued";
      record.auditHash = null;
      record.auditFile = null;
      record.blockers = [];
      record.editorialWarnings = [];
      record.reviewHistory = [];
      record.finalReview = null;
      record.completionReceipt = null;
      record.updatedAt = new Date().toISOString();
      saveState(resolvedRoot, state);
      appendEvent(resolvedRoot, "passed-page-reset", {
        id,
        previousState,
        nextState: record.state,
        reason: resetReason.slice(0, 500),
        previousAuditHash,
        previousAuditFile,
        previousCompletionReceipt,
      });
      return {
        status: "reset",
        pageId: id,
        previousState,
        nextState: record.state,
        repairAttempts: record.repairAttempts,
        blockerCount: record.blockers.length,
        published: record.published,
      };
    } finally {
      release();
    }
  }

  return {
    resetManualReview,
    resetPassedPage,
  };
}

module.exports = { createReviewRecovery };
