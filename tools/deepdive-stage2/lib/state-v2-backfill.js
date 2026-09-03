"use strict";

const { isDeepStrictEqual } = require("util");

function stateCounts(state) {
  const counts = {};
  Object.values(state.pages || {}).forEach(record => {
    const status = record && record.state || "[missing]";
    counts[status] = (counts[status] || 0) + 1;
  });
  return counts;
}

function withoutMigrationReferences(value, clone) {
  const normalized = clone(value);
  Object.values(normalized.pages || {}).forEach(record => {
    if (record && record.contentGeneration) delete record.contentGeneration.savedResponsesRef;
  });
  return normalized;
}

function createStateV2Backfill(options) {
  const {
    defaultRoot,
    acquireLock,
    appendEvent,
    clone,
    loadState,
    readResponseObject,
    saveState,
    sha256,
    writeResponseObject,
  } = options;

  function backfillStateV2Objects(root = defaultRoot, expectedSourceDigest) {
    if (!/^sha256:[a-f0-9]{64}$/.test(String(expectedSourceDigest || ""))) {
      throw new Error("expectedSourceDigest 必须是完整 SHA-256 摘要");
    }
    const release = acquireLock(root);
    try {
      const source = loadState(root);
      const sourceDigest = sha256(source);
      if (sourceDigest !== expectedSourceDigest) {
        throw new Error("正式状态摘要已经变化；请重新运行只读存储诊断后再回填大对象引用");
      }
      const active = Object.values(source.pages || {}).find(record => record && record.lease);
      if (active) throw new Error("存在活动租约，拒绝回填 Schema v2 大对象引用");

      const migrated = clone(source);
      let referenceCount = 0;
      let responseObjects = 0;
      let objectsWritten = 0;
      let objectsReused = 0;
      let emptyResponseSets = 0;
      let responseCount = 0;
      Object.entries(migrated.pages || {}).forEach(([pageId, record]) => {
        const generation = record && record.contentGeneration;
        if (!generation || !Object.hasOwn(generation, "savedResponses")) return;
        const responses = Array.isArray(generation.savedResponses) ? generation.savedResponses : [];
        const stored = writeResponseObject(root, pageId, responses);
        generation.savedResponsesRef = stored.reference;
        referenceCount += 1;
        if (!stored.reference) {
          emptyResponseSets += 1;
          return;
        }
        const payload = readResponseObject(root, stored.reference, pageId);
        if (!isDeepStrictEqual(payload.responses, responses)) {
          throw new Error("内容生成回复对象与 Schema v1 内联回复不等价");
        }
        responseObjects += 1;
        responseCount += responses.length;
        if (stored.disposition === "written") objectsWritten += 1;
        else objectsReused += 1;
      });

      if (!isDeepStrictEqual(
        withoutMigrationReferences(migrated, clone),
        withoutMigrationReferences(source, clone),
      )) {
        throw new Error("回填候选修改了大对象引用之外的 Schema v1 状态，拒绝保存");
      }
      const countsBefore = stateCounts(source);
      const pageCountBefore = Object.keys(source.pages || {}).length;
      saveState(root, migrated);

      const persisted = loadState(root);
      Object.entries(persisted.pages || {}).forEach(([pageId, record]) => {
        const generation = record && record.contentGeneration;
        if (!generation || !Object.hasOwn(generation, "savedResponses")) return;
        const inlineResponses = Array.isArray(generation.savedResponses)
          ? generation.savedResponses
          : [];
        if (!inlineResponses.length) {
          if (generation.savedResponsesRef !== null) {
            throw new Error("空内容生成回复集合不得持有外置对象引用");
          }
          return;
        }
        if (!isDeepStrictEqual(
          readResponseObject(root, generation.savedResponsesRef, pageId).responses,
          inlineResponses,
        )) {
          throw new Error("回填写后校验发现外置对象与内联回复不等价");
        }
      });
      if (persisted.schemaVersion !== 1) throw new Error("回填意外改变了正式 Schema 版本");
      if (Object.keys(persisted.pages || {}).length !== pageCountBefore) {
        throw new Error("回填意外改变了页面数量");
      }
      if (!isDeepStrictEqual(stateCounts(persisted), countsBefore)) {
        throw new Error("回填意外改变了页面状态分布");
      }

      const persistedDigest = sha256(persisted);
      appendEvent(root, "state-v2-objects-backfilled", {
        sourceDigest,
        persistedDigest,
        referenceCount,
        responseObjects,
        responseCount,
        objectsWritten,
        objectsReused,
        emptyResponseSets,
      });
      return {
        schemaVersion: 1,
        status: "backfilled",
        readPathUnchanged: true,
        inlineResponsesRetained: true,
        activeLease: false,
        sourceDigest,
        persistedDigest,
        pageCount: pageCountBefore,
        counts: countsBefore,
        referenceCount,
        responseObjects,
        responseCount,
        objectsWritten,
        objectsReused,
        emptyResponseSets,
      };
    } finally {
      release();
    }
  }

  return { backfillStateV2Objects };
}

module.exports = { createStateV2Backfill, withoutMigrationReferences };
