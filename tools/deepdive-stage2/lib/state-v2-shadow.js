"use strict";

const { isDeepStrictEqual } = require("util");
const { withoutMigrationReferences } = require("./state-v2-backfill");

const SHADOW_STATE_PATH = ".stage2/previews/state-v2-shadow.json";
const SHADOW_REPORT_PATH = ".stage2/previews/state-v2-shadow-report.json";

function prettyJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function stateCounts(state) {
  const counts = {};
  Object.values(state.pages || {}).forEach(record => {
    const status = record && record.state || "[missing]";
    counts[status] = (counts[status] || 0) + 1;
  });
  return counts;
}

function createStateV2Shadow(options) {
  const {
    defaultRoot,
    acquireLock,
    atomicWrite,
    clone,
    loadState,
    readResponseObject,
    readJson,
    sha256,
    writeResponseObject,
    withinRoot,
  } = options;

  function rehydrateShadow(root, shadow) {
    const restored = clone(shadow);
    const sourceSchemaVersion = restored.sourceState && restored.sourceState.schemaVersion;
    delete restored.storage;
    delete restored.sourceState;
    restored.schemaVersion = sourceSchemaVersion;
    Object.entries(restored.pages || {}).forEach(([pageId, record]) => {
      const generation = record && record.contentGeneration;
      if (!generation || !Object.hasOwn(generation, "savedResponsesRef")) return;
      const reference = generation.savedResponsesRef;
      generation.savedResponses = reference
        ? clone(readResponseObject(root, reference, pageId).responses)
        : [];
      delete generation.savedResponsesRef;
    });
    return restored;
  }

  function buildStateV2Shadow(root = defaultRoot, expectedSourceDigest) {
    if (!/^sha256:[a-f0-9]{64}$/.test(String(expectedSourceDigest || ""))) {
      throw new Error("expectedSourceDigest 必须是完整 SHA-256 摘要");
    }
    const release = acquireLock(root);
    try {
      const source = loadState(root);
      const sourceDigest = sha256(source);
      if (sourceDigest !== expectedSourceDigest) {
        throw new Error("正式状态摘要已经变化；请重新运行只读存储诊断后再生成影子状态");
      }
      const active = Object.values(source.pages || {}).find(record => record && record.lease);
      if (active) throw new Error("存在活动租约，拒绝生成 Schema v2 影子状态");

      const shadow = clone(source);
      shadow.schemaVersion = 2;
      shadow.storage = {
        schemaVersion: 1,
        contentGenerationSavedResponses: "external-content-addressed",
      };
      shadow.sourceState = {
        schemaVersion: source.schemaVersion,
        digest: sourceDigest,
      };

      let responseObjects = 0;
      let objectsWritten = 0;
      let objectsReused = 0;
      let responseCount = 0;
      let externalObjectBytes = 0;
      Object.entries(shadow.pages || {}).forEach(([pageId, record]) => {
        const generation = record && record.contentGeneration;
        if (!generation || !Object.hasOwn(generation, "savedResponses")) return;
        const responses = Array.isArray(generation.savedResponses)
          ? generation.savedResponses
          : [];
        if (responses.length) {
          let stored;
          if (generation.savedResponsesRef) {
            const payload = readResponseObject(root, generation.savedResponsesRef, pageId);
            if (!isDeepStrictEqual(payload.responses, responses)) {
              throw new Error("Schema v1 双写引用与内联回复不等价");
            }
            stored = { reference: clone(generation.savedResponsesRef), disposition: "reused" };
          } else {
            stored = writeResponseObject(root, pageId, responses);
          }
          generation.savedResponsesRef = stored.reference;
          responseObjects += 1;
          responseCount += responses.length;
          externalObjectBytes += stored.reference.bytes;
          if (stored.disposition === "written") objectsWritten += 1;
          else objectsReused += 1;
        } else {
          generation.savedResponsesRef = null;
        }
        delete generation.savedResponses;
      });

      const restored = rehydrateShadow(root, shadow);
      const normalizedSource = withoutMigrationReferences(source, clone);
      if (!isDeepStrictEqual(restored, normalizedSource)) {
        throw new Error("Schema v2 影子状态无法无损还原 Schema v1，拒绝写入影子清单");
      }

      const shadowText = prettyJson(shadow);
      const shadowDigest = sha256(shadow);
      const shadowFile = withinRoot(root, SHADOW_STATE_PATH);
      atomicWrite(shadowFile, shadowText);
      const persistedShadow = readJson(shadowFile);
      if (sha256(persistedShadow) !== shadowDigest) {
        throw new Error("Schema v2 影子状态写后摘要校验失败");
      }
      if (!isDeepStrictEqual(rehydrateShadow(root, persistedShadow), normalizedSource)) {
        throw new Error("Schema v2 影子状态写后语义校验失败");
      }

      const sourceBytes = Buffer.byteLength(prettyJson(source), "utf8");
      const shadowBytes = Buffer.byteLength(shadowText, "utf8");
      const savedBytes = Math.max(0, sourceBytes - shadowBytes);
      const report = {
        schemaVersion: 1,
        status: "built",
        readPathUnchanged: true,
        activeLease: false,
        source: {
          schemaVersion: source.schemaVersion,
          digest: sourceDigest,
          bytes: sourceBytes,
          pageCount: Object.keys(source.pages || {}).length,
          counts: stateCounts(source),
        },
        shadow: {
          schemaVersion: shadow.schemaVersion,
          digest: shadowDigest,
          bytes: shadowBytes,
          logicalPath: SHADOW_STATE_PATH,
          reportLogicalPath: SHADOW_REPORT_PATH,
        },
        externalized: {
          responseObjects,
          objectsWritten,
          objectsReused,
          responseCount,
          objectBytes: externalObjectBytes,
        },
        reduction: {
          bytes: savedBytes,
          percent: sourceBytes ? Number(((savedBytes / sourceBytes) * 100).toFixed(2)) : 0,
        },
        comparison: {
          equivalentAfterRehydrate: true,
          pageCountMatches: Object.keys(source.pages || {}).length === Object.keys(shadow.pages || {}).length,
          stateCountsMatch: isDeepStrictEqual(stateCounts(source), stateCounts(shadow)),
          sourceUpdatedAtPreserved: source.updatedAt === shadow.updatedAt,
        },
      };
      atomicWrite(withinRoot(root, SHADOW_REPORT_PATH), prettyJson(report));
      return report;
    } finally {
      release();
    }
  }

  return {
    buildStateV2Shadow,
    rehydrateShadow,
  };
}

module.exports = {
  SHADOW_REPORT_PATH,
  SHADOW_STATE_PATH,
  createStateV2Shadow,
};
