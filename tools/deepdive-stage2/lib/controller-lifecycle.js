"use strict";

const fs = require("fs");
const path = require("path");
const { loadDeepDivePages } = require("../../deepdive/runtime/deepdive-loader");
const { pageContentHash } = require("../../deepdive/quality/deepdive-audit-contracts");

function createControllerLifecycle(dependencies) {
  const {
    defaultRoot,
    schemaVersion,
    queueByRole,
    acquireLock,
    activeRecord,
    appendEvent,
    clone,
    expireLease,
    loadState,
    readJson,
    saveState,
    stateFile,
  } = dependencies;

  function sourceRegistrationMap(root) {
    const directory = path.join(root, "data", "deepdive");
    const map = new Map();
    if (!fs.existsSync(directory)) return map;
    fs.readdirSync(directory).filter(file => file.endsWith(".js")).sort().forEach(file => {
      const source = fs.readFileSync(path.join(directory, file), "utf8");
      const ids = [
        ...source.matchAll(/window\.DEEPDIVE\s*\[\s*["']([^"']+)["']\s*\]\s*=/g),
        ...source.matchAll(/register\s*\(\s*["']([^"']+)["']/g),
      ].map(match => match[1]);
      ids.forEach(id => {
        if (!map.has(id)) map.set(id, []);
        map.get(id).push(`data/deepdive/${file}`);
      });
    });
    return map;
  }

  function loadSupplementQueue(root) {
    const file = path.join(root, "data", "video-concept-supplements.json");
    if (!fs.existsSync(file)) return { schemaVersion: 1, items: [] };
    return readJson(file);
  }

  function pendingSupplements(root) {
    return (loadSupplementQueue(root).items || [])
      .filter(item => item.status === "pending" && item.decision === "supplement");
  }

  function basePageRecord(id, page, registrations) {
    return {
      id,
      origin: { type: "baseline", ids: [] },
      sourcePaths: registrations.get(id) || [],
      state: "audit-queued",
      attempt: 0,
      repairAttempts: 0,
      contentHash: pageContentHash(page),
      auditHash: null,
      blockers: [],
      editorialWarnings: [],
      candidateFile: null,
      auditFile: null,
      integration: null,
      lease: null,
      published: true,
      updatedAt: new Date().toISOString(),
    };
  }

  function mergePendingSupplements(root, state) {
    const grouped = new Map();
    pendingSupplements(root).forEach(item => {
      if (!grouped.has(item.targetNode)) grouped.set(item.targetNode, []);
      grouped.get(item.targetNode).push(item);
    });
    let imported = 0;
    grouped.forEach((items, id) => {
      const record = state.pages[id];
      if (!record) return;
      const known = new Set(record.origin.ids || []);
      const additions = items.filter(item => !known.has(item.id));
      if (!additions.length) return;
      record.origin = {
        type: "video-supplement",
        ids: [...known, ...additions.map(item => item.id)],
        supplements: [
          ...((record.origin && record.origin.supplements) || []),
          ...clone(additions),
        ],
      };
      if (!record.lease && !["l3-auto-passed", "manual-review"].includes(record.state)) {
        record.state = "update-queued";
      } else if (record.state === "l3-auto-passed") {
        record.state = "update-queued";
        record.auditHash = null;
      }
      record.updatedAt = new Date().toISOString();
      imported += additions.length;
    });
    return imported;
  }

  function initialize(root = defaultRoot, options = {}) {
    const resolvedRoot = path.resolve(root);
    const release = acquireLock(resolvedRoot);
    try {
      const file = stateFile(resolvedRoot);
      const existing = fs.existsSync(file) && !options.force ? loadState(resolvedRoot) : null;
      const pages = loadDeepDivePages(resolvedRoot);
      const registrations = sourceRegistrationMap(resolvedRoot);
      const state = existing || {
        schemaVersion: schemaVersion,
        ...(schemaVersion === 2 ? {
          storage: {
            schemaVersion: 1,
            contentGenerationSavedResponses: "external-content-addressed",
          },
        } : {}),
        mode: "serial",
        paused: false,
        policy: {
          maxRepairAttempts: 2,
          leaseMinutes: 45,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pages: {},
      };
      Object.entries(pages).forEach(([id, page]) => {
        if (!state.pages[id]) state.pages[id] = basePageRecord(id, page, registrations);
      });
      const imported = mergePendingSupplements(resolvedRoot, state);
      saveState(resolvedRoot, state);
      appendEvent(resolvedRoot, existing ? "state-refreshed" : "state-initialized", {
        pageCount: Object.keys(state.pages).length,
        supplementsImported: imported,
      });
      return {
        pageCount: Object.keys(state.pages).length,
        supplementsImported: imported,
        state,
      };
    } finally {
      release();
    }
  }

  function status(root = defaultRoot) {
    const resolvedRoot = path.resolve(root);
    const state = loadState(resolvedRoot);
    expireLease(resolvedRoot, state);
    const counts = {};
    Object.values(state.pages).forEach(record => {
      counts[record.state] = (counts[record.state] || 0) + 1;
    });
    const active = activeRecord(state);
    return {
      schemaVersion: state.schemaVersion,
      mode: state.mode,
      paused: state.paused,
      total: Object.keys(state.pages).length,
      counts,
      active: active ? {
        id: active.id,
        role: active.lease.role,
        taskId: active.lease.taskId,
        expiresAt: active.lease.expiresAt,
      } : null,
      updatedAt: state.updatedAt,
    };
  }

  function setPaused(root = defaultRoot, paused) {
    const resolvedRoot = path.resolve(root);
    const release = acquireLock(resolvedRoot);
    try {
      const state = loadState(resolvedRoot);
      state.paused = Boolean(paused);
      saveState(resolvedRoot, state);
      appendEvent(resolvedRoot, state.paused ? "queue-paused" : "queue-resumed");
      return status(resolvedRoot);
    } finally {
      release();
    }
  }

  function retry(root = defaultRoot, id) {
    const resolvedRoot = path.resolve(root);
    const release = acquireLock(resolvedRoot);
    try {
      const state = loadState(resolvedRoot);
      const record = state.pages[id];
      if (!record) throw new Error(`不存在页面状态：${id}`);
      if (record.lease) throw new Error(`页面 ${id} 正在执行，不能重试`);
      record.repairAttempts = 0;
      record.state = "audit-queued";
      record.blockers = [];
      record.reviewHistory = [];
      record.finalReview = null;
      record.updatedAt = new Date().toISOString();
      saveState(resolvedRoot, state);
      appendEvent(resolvedRoot, "page-retried", { id });
      return clone(record);
    } finally {
      release();
    }
  }

  return {
    initialize,
    loadSupplementQueue,
    mergePendingSupplements,
    retry,
    setPaused,
    status,
  };
}

module.exports = { createControllerLifecycle };
