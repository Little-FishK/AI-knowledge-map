"use strict";

const fs = require("fs");
const { isDeepStrictEqual } = require("util");
const { SHADOW_STATE_PATH } = require("./state-v2-shadow");
const { withoutMigrationReferences } = require("./state-v2-backfill");

const V1_CUTOVER_BACKUP_PATH = ".stage2/previews/state-v1-cutover-backup.json";

function prettyJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function validDigest(value) {
  return /^sha256:[a-f0-9]{64}$/.test(String(value || ""));
}

function createStateV2Cutover(options) {
  const {
    defaultRoot,
    acquireLock,
    appendEvent,
    atomicWrite,
    clone,
    readJson,
    readResponseObject,
    rehydrateShadow,
    sha256,
    stateFile,
    withinRoot,
  } = options;

  function verifyV2State(root, state) {
    if (!state || state.schemaVersion !== 2 || !state.pages) {
      throw new Error("Schema v2 正式状态结构无效");
    }
    if (!state.storage
      || state.storage.contentGenerationSavedResponses !== "external-content-addressed") {
      throw new Error("Schema v2 正式状态缺少外置存储声明");
    }
    let responseObjects = 0;
    let responseCount = 0;
    Object.entries(state.pages).forEach(([pageId, record]) => {
      const generation = record && record.contentGeneration;
      if (!generation) return;
      if (Object.hasOwn(generation, "savedResponses")) {
        throw new Error("Schema v2 正式状态仍包含内联内容生成回复");
      }
      if (!Object.hasOwn(generation, "savedResponsesRef")) {
        throw new Error("Schema v2 内容生成状态缺少外置对象引用字段");
      }
      if (generation.savedResponsesRef === null) return;
      const payload = readResponseObject(root, generation.savedResponsesRef, pageId);
      responseObjects += 1;
      responseCount += payload.responses.length;
    });
    return { responseObjects, responseCount };
  }

  function switchStateV2(root = defaultRoot, expectedSourceDigest, expectedShadowDigest) {
    if (!validDigest(expectedSourceDigest)) {
      throw new Error("expectedSourceDigest 必须是完整 SHA-256 摘要");
    }
    if (!validDigest(expectedShadowDigest)) {
      throw new Error("expectedShadowDigest 必须是完整 SHA-256 摘要");
    }
    const release = acquireLock(root);
    try {
      const officialFile = stateFile(root);
      const source = readJson(officialFile);
      const currentDigest = sha256(source);
      if (source.schemaVersion === 2) {
        if (currentDigest !== expectedShadowDigest) {
          throw new Error("正式 Schema v2 状态已经变化，拒绝重复切换");
        }
        const verified = verifyV2State(root, source);
        return {
          schemaVersion: 2,
          status: "already-switched",
          operationalReadSchemaVersion: 2,
          officialDigest: currentDigest,
          ...verified,
        };
      }
      if (source.schemaVersion !== 1 || !source.pages) {
        throw new Error("正式状态不是可切换的 Schema v1");
      }
      if (currentDigest !== expectedSourceDigest) {
        throw new Error("正式状态摘要已经变化；请重新执行双读验证后再切换");
      }
      if (Object.values(source.pages).some(record => record && record.lease)) {
        throw new Error("存在活动租约，拒绝切换 Schema v2 正式读取");
      }

      const shadowFile = withinRoot(root, SHADOW_STATE_PATH);
      if (!fs.existsSync(shadowFile)) throw new Error("Schema v2 影子状态不存在");
      const shadow = readJson(shadowFile);
      const shadowDigest = sha256(shadow);
      if (shadowDigest !== expectedShadowDigest) {
        throw new Error("Schema v2 影子状态摘要不匹配");
      }
      if (!shadow.sourceState || shadow.sourceState.digest !== currentDigest) {
        throw new Error("Schema v2 影子状态已经过期");
      }
      const verified = verifyV2State(root, shadow);
      const restored = rehydrateShadow(root, shadow);
      if (!isDeepStrictEqual(restored, withoutMigrationReferences(source, clone))) {
        throw new Error("Schema v2 影子状态无法无损还原当前正式状态");
      }

      const backupFile = withinRoot(root, V1_CUTOVER_BACKUP_PATH);
      if (fs.existsSync(backupFile)) {
        if (sha256(readJson(backupFile)) !== currentDigest) {
          throw new Error("现有 Schema v1 切换备份与当前正式状态不一致");
        }
      } else {
        atomicWrite(backupFile, prettyJson(source));
      }
      if (sha256(readJson(backupFile)) !== currentDigest) {
        throw new Error("Schema v1 切换备份写后校验失败");
      }

      atomicWrite(officialFile, prettyJson(shadow));
      const persisted = readJson(officialFile);
      if (sha256(persisted) !== shadowDigest) {
        throw new Error("Schema v2 正式状态写后摘要校验失败");
      }
      verifyV2State(root, persisted);
      appendEvent(root, "state-v2-cutover-completed", {
        sourceDigest: currentDigest,
        officialDigest: shadowDigest,
        responseObjects: verified.responseObjects,
        responseCount: verified.responseCount,
        backupPath: V1_CUTOVER_BACKUP_PATH,
      });
      return {
        schemaVersion: 2,
        status: "switched",
        operationalReadSchemaVersion: 2,
        sourceDigest: currentDigest,
        officialDigest: shadowDigest,
        backupLogicalPath: V1_CUTOVER_BACKUP_PATH,
        backupVerified: true,
        atomicStateReplacement: true,
        inlineResponsesRemoved: true,
        ...verified,
      };
    } finally {
      release();
    }
  }

  return { switchStateV2, verifyV2State };
}

module.exports = {
  V1_CUTOVER_BACKUP_PATH,
  createStateV2Cutover,
};
