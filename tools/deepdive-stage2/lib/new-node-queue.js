"use strict";

const path = require("path");
const { loadDeepDivePages: loadDeepDivePagesFromDisk } = require("../../deepdive/runtime/deepdive-loader");

function createNewNodeQueue(dependencies) {
  const {
    defaultRoot,
    acquireLock,
    appendEvent,
    clone,
    loadDeepDivePages = loadDeepDivePagesFromDisk,
    loadState,
    saveState,
  } = dependencies;

  function enqueueNewNode(root = defaultRoot, integration, material) {
    const resolvedRoot = path.resolve(root);
    const release = acquireLock(resolvedRoot);
    try {
      const state = loadState(resolvedRoot);
      const id = integration && integration.node && integration.node.id;
      if (!id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
        throw new Error("新节点 integration.node.id 缺失或格式无效");
      }
      if (state.pages[id]) throw new Error(`页面任务已存在：${id}`);
      if (loadDeepDivePages(resolvedRoot)[id]) throw new Error(`理解原理页已经存在：${id}`);
      state.pages[id] = {
        id,
        origin: { type: "video-new-node", ids: clone((material && material.originIds) || []) },
        sourcePaths: [],
        state: "write-queued",
        attempt: 0,
        repairAttempts: 0,
        contentHash: null,
        auditHash: null,
        blockers: [],
        editorialWarnings: [],
        candidateFile: null,
        auditFile: null,
        integration: clone({ ...integration, material }),
        lease: null,
        published: false,
        updatedAt: new Date().toISOString(),
      };
      saveState(resolvedRoot, state);
      appendEvent(resolvedRoot, "new-node-enqueued", { id });
      return clone(state.pages[id]);
    } finally {
      release();
    }
  }

  return { enqueueNewNode };
}

module.exports = { createNewNodeQueue };
