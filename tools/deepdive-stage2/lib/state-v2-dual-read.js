"use strict";

const fs = require("fs");
const { isDeepStrictEqual } = require("util");
const { SHADOW_STATE_PATH } = require("./state-v2-shadow");
const { withoutMigrationReferences } = require("./state-v2-backfill");

function issueCode(error) {
  const message = String(error && error.message || error || "");
  if (message.includes("缺少 Schema v2 双读引用")) return "missing-dual-read-reference-field";
  if (message.includes("缺少外置对象引用")) return "missing-response-object-reference";
  if (message.includes("对象不存在")) return "missing-response-object";
  if (message.includes("摘要不匹配")) return "response-object-digest-mismatch";
  if (message.includes("页面绑定不匹配")) return "response-object-page-mismatch";
  if (message.includes("数量不匹配")) return "response-object-count-mismatch";
  if (message.includes("字节数不匹配") || message.includes("字节数无效")) {
    return "response-object-byte-count-mismatch";
  }
  if (message.includes("不等价")) return "inline-object-content-mismatch";
  if (message.includes("不是数组")) return "invalid-inline-response-shape";
  if (message.includes("空内容生成回复")) return "invalid-empty-response-reference";
  return "dual-read-validation-error";
}

function increment(map, code) {
  map[code] = (map[code] || 0) + 1;
}

function createStateV2DualRead(options) {
  const {
    defaultRoot,
    clone,
    loadState,
    readJson,
    readResponsesDual,
    rehydrateShadow,
    sha256,
    withinRoot,
  } = options;

  function validateStateV2DualRead(root = defaultRoot, expectedSourceDigest) {
    if (!/^sha256:[a-f0-9]{64}$/.test(String(expectedSourceDigest || ""))) {
      throw new Error("expectedSourceDigest 必须是完整 SHA-256 摘要");
    }
    const source = loadState(root);
    const sourceDigest = sha256(source);
    if (sourceDigest !== expectedSourceDigest) {
      throw new Error("正式状态摘要已经变化；请重新运行只读存储诊断后再执行双读验证");
    }

    const issues = {};
    let contentGenerationRecords = 0;
    let referenceFields = 0;
    let verifiedObjects = 0;
    let inlineResponseCount = 0;
    let externalResponseCount = 0;
    let verifiedObjectBytes = 0;
    Object.entries(source.pages || {}).forEach(([pageId, record]) => {
      const generation = record && record.contentGeneration;
      if (!generation || !Object.hasOwn(generation, "savedResponses")) return;
      contentGenerationRecords += 1;
      if (Object.hasOwn(generation, "savedResponsesRef")) referenceFields += 1;
      if (Array.isArray(generation.savedResponses)) {
        inlineResponseCount += generation.savedResponses.length;
      }
      try {
        const responses = readResponsesDual(root, pageId, generation);
        if (generation.savedResponsesRef) {
          verifiedObjects += 1;
          externalResponseCount += responses.length;
          verifiedObjectBytes += Number(generation.savedResponsesRef.bytes || 0);
        }
      } catch (error) {
        increment(issues, issueCode(error));
      }
    });

    const shadowFile = withinRoot(root, SHADOW_STATE_PATH);
    const shadow = {
      exists: fs.existsSync(shadowFile),
      schemaVersion: null,
      digest: null,
      sourceDigestMatches: false,
      equivalentAfterRehydrate: false,
    };
    if (!shadow.exists) {
      increment(issues, "missing-v2-shadow");
    } else {
      try {
        const shadowState = readJson(shadowFile);
        shadow.schemaVersion = shadowState.schemaVersion;
        shadow.digest = sha256(shadowState);
        shadow.sourceDigestMatches = Boolean(
          shadowState.sourceState && shadowState.sourceState.digest === sourceDigest,
        );
        if (shadowState.schemaVersion !== 2) increment(issues, "invalid-v2-shadow-schema");
        if (!shadow.sourceDigestMatches) increment(issues, "stale-v2-shadow");
        const restored = rehydrateShadow(root, shadowState);
        shadow.equivalentAfterRehydrate = isDeepStrictEqual(
          restored,
          withoutMigrationReferences(source, clone),
        );
        if (!shadow.equivalentAfterRehydrate) increment(issues, "v2-shadow-semantic-mismatch");
      } catch (error) {
        increment(issues, issueCode(error));
      }
    }

    const issueCount = Object.values(issues).reduce((sum, count) => sum + count, 0);
    return {
      schemaVersion: 1,
      status: issueCount ? "invalid" : "valid",
      readOnly: true,
      operationalReadSchemaVersion: 1,
      source: {
        schemaVersion: source.schemaVersion,
        digest: sourceDigest,
        pageCount: Object.keys(source.pages || {}).length,
        activeLease: Boolean(Object.values(source.pages || {}).find(record => record && record.lease)),
      },
      dualRead: {
        contentGenerationRecords,
        referenceFields,
        verifiedObjects,
        inlineResponseCount,
        externalResponseCount,
        verifiedObjectBytes,
      },
      shadow,
      issues: {
        count: issueCount,
        byCode: issues,
      },
      safeguards: {
        valuesIncluded: false,
        pageIdsIncluded: false,
        stateWritten: false,
        externalObjectsWritten: false,
      },
    };
  }

  return { validateStateV2DualRead };
}

module.exports = { createStateV2DualRead, issueCode };
