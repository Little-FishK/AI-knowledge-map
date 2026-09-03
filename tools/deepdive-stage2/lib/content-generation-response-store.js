"use strict";

const fs = require("fs");
const { isDeepStrictEqual } = require("util");

const RESPONSE_OBJECT_DIRECTORY = ".stage2/results/content-generation-responses/objects";

function prettyJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function createContentGenerationResponseStore(options) {
  const { atomicWrite, clone, readJson, sha256, withinRoot } = options;

  function readResponseObject(root, reference, expectedPageId = null) {
    if (!reference || reference.kind !== "content-generation-saved-responses") {
      throw new Error("内容生成回复引用无效");
    }
    if (reference.schemaVersion !== 1 || !reference.path || !reference.digest) {
      throw new Error("内容生成回复引用缺少版本、路径或摘要");
    }
    if (!Number.isInteger(reference.responseCount) || reference.responseCount < 0) {
      throw new Error("内容生成回复引用数量无效");
    }
    if (!Number.isInteger(reference.bytes) || reference.bytes <= 0) {
      throw new Error("内容生成回复引用字节数无效");
    }
    const digestHex = String(reference.digest).replace(/^sha256:/, "");
    const expectedPath = `${RESPONSE_OBJECT_DIRECTORY}/${digestHex}.json`;
    if (String(reference.path).replace(/\\/g, "/") !== expectedPath) {
      throw new Error("内容生成回复对象路径与摘要不匹配");
    }
    const absolute = withinRoot(root, reference.path);
    if (!fs.existsSync(absolute)) throw new Error("内容生成回复对象不存在");
    const payload = readJson(absolute);
    if (sha256(payload) !== reference.digest) throw new Error("内容生成回复对象摘要不匹配");
    if (fs.statSync(absolute).size !== reference.bytes) {
      throw new Error("内容生成回复对象字节数不匹配");
    }
    if (payload.schemaVersion !== 1 || payload.kind !== reference.kind) {
      throw new Error("内容生成回复对象版本或类型无效");
    }
    if (expectedPageId != null && payload.pageId !== expectedPageId) {
      throw new Error("内容生成回复对象页面绑定不匹配");
    }
    if (!Array.isArray(payload.responses) || payload.responses.length !== reference.responseCount) {
      throw new Error("内容生成回复对象数量不匹配");
    }
    return payload;
  }

  function writeResponseObject(root, pageId, responses) {
    if (!Array.isArray(responses)) throw new Error("内容生成回复必须是数组");
    if (!responses.length) return { reference: null, disposition: "empty" };
    const payload = {
      schemaVersion: 1,
      kind: "content-generation-saved-responses",
      pageId,
      responses: clone(responses),
    };
    const digest = sha256(payload);
    const digestHex = digest.slice("sha256:".length);
    const logicalPath = `${RESPONSE_OBJECT_DIRECTORY}/${digestHex}.json`;
    const absolute = withinRoot(root, logicalPath);
    const content = prettyJson(payload);
    let disposition = "written";
    if (fs.existsSync(absolute)) {
      const existing = readJson(absolute);
      if (sha256(existing) !== digest) {
        throw new Error("已存在的内容生成回复对象摘要不匹配，拒绝覆盖");
      }
      disposition = "reused";
    } else {
      atomicWrite(absolute, content);
    }
    const reference = {
      kind: payload.kind,
      schemaVersion: payload.schemaVersion,
      path: logicalPath,
      digest,
      responseCount: responses.length,
      bytes: Buffer.byteLength(content, "utf8"),
    };
    readResponseObject(root, reference, pageId);
    return { reference, disposition };
  }

  function readResponsesDual(root, pageId, generation) {
    if (!generation || !Object.hasOwn(generation, "savedResponses")) return [];
    if (!Array.isArray(generation.savedResponses)) {
      throw new Error("Schema v1 内联内容生成回复不是数组");
    }
    if (!Object.hasOwn(generation, "savedResponsesRef")) {
      throw new Error("内容生成回复缺少 Schema v2 双读引用");
    }
    if (!generation.savedResponses.length) {
      if (generation.savedResponsesRef !== null) {
        throw new Error("空内容生成回复集合不得持有外置对象引用");
      }
      return generation.savedResponses;
    }
    if (!generation.savedResponsesRef) {
      throw new Error("非空内容生成回复缺少外置对象引用");
    }
    const payload = readResponseObject(root, generation.savedResponsesRef, pageId);
    if (!isDeepStrictEqual(payload.responses, generation.savedResponses)) {
      throw new Error("Schema v1 内联回复与 Schema v2 外置对象不等价");
    }
    return generation.savedResponses;
  }

  function readResponsesV2(root, pageId, generation) {
    if (!generation) return [];
    if (Object.hasOwn(generation, "savedResponses")) {
      throw new Error("Schema v2 正式状态不得包含内联内容生成回复");
    }
    if (!Object.hasOwn(generation, "savedResponsesRef")) {
      throw new Error("Schema v2 内容生成回复缺少外置对象引用字段");
    }
    if (generation.savedResponsesRef === null) return [];
    return clone(readResponseObject(root, generation.savedResponsesRef, pageId).responses);
  }

  return {
    readResponseObject,
    readResponsesDual,
    readResponsesV2,
    writeResponseObject,
  };
}

module.exports = {
  RESPONSE_OBJECT_DIRECTORY,
  createContentGenerationResponseStore,
};
