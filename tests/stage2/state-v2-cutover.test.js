"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  createContentGenerationResponseStore,
} = require("../../tools/deepdive-stage2/lib/content-generation-response-store");
const { createStateV2Backfill } = require("../../tools/deepdive-stage2/lib/state-v2-backfill");
const {
  V1_CUTOVER_BACKUP_PATH,
  createStateV2Cutover,
} = require("../../tools/deepdive-stage2/lib/state-v2-cutover");
const {
  SHADOW_STATE_PATH,
  createStateV2Shadow,
} = require("../../tools/deepdive-stage2/lib/state-v2-shadow");
const { clone, createStateStore, sha256 } = require("../../tools/deepdive-stage2/lib/state-store");

function setup() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "stage2-state-v2-cutover-"));
  const v1 = createStateStore({ defaultRoot: root, schemaVersion: 1 });
  const source = {
    schemaVersion: 1,
    mode: "serial",
    paused: false,
    policy: { maxRepairAttempts: 2, leaseMinutes: 45 },
    createdAt: "2026-09-02T00:00:00.000Z",
    updatedAt: "2026-09-02T00:00:00.000Z",
    pages: {
      alpha: {
        id: "alpha",
        state: "audit-queued",
        contentGeneration: {
          schemaVersion: 1,
          status: "complete",
          savedResponses: [{
            sectionNumber: 1,
            title: "机制",
            response: "正式切换必须失败关闭".repeat(100),
            savedAt: "2026-09-01T00:00:00.000Z",
          }],
        },
        lease: null,
      },
      beta: {
        id: "beta",
        state: "repair-queued",
        contentGeneration: {
          schemaVersion: 1,
          status: "queued",
          savedResponses: [],
        },
        lease: null,
      },
    },
  };
  v1.writeJson(v1.stateFile(root), source);
  const responses = createContentGenerationResponseStore({
    atomicWrite: v1.atomicWrite,
    clone,
    readJson: v1.readJson,
    sha256,
    withinRoot: v1.withinRoot,
  });
  const backfill = createStateV2Backfill({
    defaultRoot: root,
    acquireLock: v1.acquireLock,
    appendEvent: v1.appendEvent,
    clone,
    loadState: v1.loadState,
    readResponseObject: responses.readResponseObject,
    saveState: v1.saveState,
    sha256,
    writeResponseObject: responses.writeResponseObject,
  });
  backfill.backfillStateV2Objects(root, sha256(source));
  const backfilled = v1.loadState(root);
  const shadow = createStateV2Shadow({
    defaultRoot: root,
    acquireLock: v1.acquireLock,
    atomicWrite: v1.atomicWrite,
    clone,
    loadState: v1.loadState,
    readResponseObject: responses.readResponseObject,
    readJson: v1.readJson,
    sha256,
    writeResponseObject: responses.writeResponseObject,
    withinRoot: v1.withinRoot,
  });
  shadow.buildStateV2Shadow(root, sha256(backfilled));
  const shadowState = v1.readJson(v1.withinRoot(root, SHADOW_STATE_PATH));
  const dependencies = {
    defaultRoot: root,
    acquireLock: v1.acquireLock,
    appendEvent: v1.appendEvent,
    atomicWrite: v1.atomicWrite,
    clone,
    readJson: v1.readJson,
    readResponseObject: responses.readResponseObject,
    rehydrateShadow: shadow.rehydrateShadow,
    sha256,
    stateFile: v1.stateFile,
    withinRoot: v1.withinRoot,
  };
  return {
    root,
    store: v1,
    responses,
    dependencies,
    sourceDigest: sha256(backfilled),
    shadowDigest: sha256(shadowState),
  };
}

function scenario(run) {
  const fixture = setup();
  try {
    run(fixture);
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true });
  }
}

scenario(({ root, store, dependencies, sourceDigest, shadowDigest }) => {
  const before = fs.readFileSync(store.stateFile(root), "utf8");
  const cutover = createStateV2Cutover(dependencies);
  assert.throws(
    () => cutover.switchStateV2(root, `sha256:${"0".repeat(64)}`, shadowDigest),
    /正式状态摘要已经变化/,
  );
  assert.strictEqual(fs.readFileSync(store.stateFile(root), "utf8"), before);
  assert.strictEqual(fs.existsSync(store.withinRoot(root, V1_CUTOVER_BACKUP_PATH)), false);
});

scenario(({ root, store, dependencies, shadowDigest }) => {
  const state = store.readJson(store.stateFile(root));
  state.pages.alpha.lease = {
    role: "audit",
    taskId: "active",
    token: "token",
    expiresAt: "2099-01-01T00:00:00.000Z",
  };
  store.writeJson(store.stateFile(root), state);
  const cutover = createStateV2Cutover(dependencies);
  assert.throws(() => cutover.switchStateV2(root, sha256(state), shadowDigest), /活动租约/);
});

scenario(({ root, store, dependencies, sourceDigest, shadowDigest }) => {
  fs.unlinkSync(store.withinRoot(root, SHADOW_STATE_PATH));
  const cutover = createStateV2Cutover(dependencies);
  assert.throws(() => cutover.switchStateV2(root, sourceDigest, shadowDigest), /影子状态不存在/);
});

scenario(({ root, store, dependencies, sourceDigest }) => {
  const shadowFile = store.withinRoot(root, SHADOW_STATE_PATH);
  const shadow = store.readJson(shadowFile);
  shadow.sourceState.digest = `sha256:${"f".repeat(64)}`;
  store.writeJson(shadowFile, shadow);
  const cutover = createStateV2Cutover(dependencies);
  assert.throws(() => cutover.switchStateV2(root, sourceDigest, sha256(shadow)), /影子状态已经过期/);
});

scenario(({ root, store, dependencies, responses, sourceDigest, shadowDigest }) => {
  const state = store.readJson(store.stateFile(root));
  fs.unlinkSync(store.withinRoot(root, state.pages.alpha.contentGeneration.savedResponsesRef.path));
  const cutover = createStateV2Cutover(dependencies);
  assert.throws(() => cutover.switchStateV2(root, sourceDigest, shadowDigest), /对象不存在/);
  assert.strictEqual(store.readJson(store.stateFile(root)).schemaVersion, 1);
  assert.ok(responses);
});

scenario(({ root, store, dependencies, sourceDigest, shadowDigest }) => {
  const state = store.readJson(store.stateFile(root));
  const objectFile = store.withinRoot(root, state.pages.alpha.contentGeneration.savedResponsesRef.path);
  const object = store.readJson(objectFile);
  object.responses[0].response += "损坏";
  store.writeJson(objectFile, object);
  const cutover = createStateV2Cutover(dependencies);
  assert.throws(() => cutover.switchStateV2(root, sourceDigest, shadowDigest), /摘要不匹配/);
});

scenario(({ root, store, dependencies, sourceDigest }) => {
  const shadowFile = store.withinRoot(root, SHADOW_STATE_PATH);
  const shadow = store.readJson(shadowFile);
  shadow.pages.alpha.contentGeneration.savedResponsesRef.responseCount += 1;
  store.writeJson(shadowFile, shadow);
  const cutover = createStateV2Cutover(dependencies);
  assert.throws(() => cutover.switchStateV2(root, sourceDigest, sha256(shadow)), /数量不匹配/);
});

scenario(({ root, store, dependencies, sourceDigest }) => {
  const shadowFile = store.withinRoot(root, SHADOW_STATE_PATH);
  const shadow = store.readJson(shadowFile);
  shadow.pages.alpha.contentGeneration.savedResponsesRef.bytes += 1;
  store.writeJson(shadowFile, shadow);
  const cutover = createStateV2Cutover(dependencies);
  assert.throws(() => cutover.switchStateV2(root, sourceDigest, sha256(shadow)), /字节数不匹配/);
});

scenario(({ root, store, dependencies, sourceDigest }) => {
  const shadowFile = store.withinRoot(root, SHADOW_STATE_PATH);
  const shadow = store.readJson(shadowFile);
  shadow.pages.alpha.contentGeneration.savedResponsesRef.path =
    ".stage2/results/content-generation-responses/objects/not-the-digest.json";
  store.writeJson(shadowFile, shadow);
  const cutover = createStateV2Cutover(dependencies);
  assert.throws(() => cutover.switchStateV2(root, sourceDigest, sha256(shadow)), /路径与摘要不匹配/);
});

scenario(({ root, store, dependencies, sourceDigest }) => {
  const shadowFile = store.withinRoot(root, SHADOW_STATE_PATH);
  const shadow = store.readJson(shadowFile);
  const reference = shadow.pages.alpha.contentGeneration.savedResponsesRef;
  const payload = store.readJson(store.withinRoot(root, reference.path));
  payload.pageId = "beta";
  const payloadText = `${JSON.stringify(payload, null, 2)}\n`;
  reference.digest = sha256(payload);
  reference.path = `.stage2/results/content-generation-responses/objects/${reference.digest.slice(7)}.json`;
  reference.bytes = Buffer.byteLength(payloadText, "utf8");
  store.atomicWrite(store.withinRoot(root, reference.path), payloadText);
  store.writeJson(shadowFile, shadow);
  const cutover = createStateV2Cutover(dependencies);
  assert.throws(() => cutover.switchStateV2(root, sourceDigest, sha256(shadow)), /页面绑定不匹配/);
});

scenario(({ root, store, dependencies, sourceDigest }) => {
  const shadowFile = store.withinRoot(root, SHADOW_STATE_PATH);
  const shadow = store.readJson(shadowFile);
  shadow.pages.alpha.contentGeneration.savedResponses = [];
  store.writeJson(shadowFile, shadow);
  const cutover = createStateV2Cutover(dependencies);
  assert.throws(() => cutover.switchStateV2(root, sourceDigest, sha256(shadow)), /仍包含内联/);
});

scenario(({ root, store, dependencies, sourceDigest, shadowDigest }) => {
  const before = fs.readFileSync(store.stateFile(root), "utf8");
  const failing = createStateV2Cutover({
    ...dependencies,
    atomicWrite(file, content) {
      if (path.resolve(file) === path.resolve(store.stateFile(root))) {
        throw new Error("simulated-state-write-failure");
      }
      dependencies.atomicWrite(file, content);
    },
  });
  assert.throws(
    () => failing.switchStateV2(root, sourceDigest, shadowDigest),
    /simulated-state-write-failure/,
  );
  assert.strictEqual(fs.readFileSync(store.stateFile(root), "utf8"), before);
  const backup = store.readJson(store.withinRoot(root, V1_CUTOVER_BACKUP_PATH));
  assert.strictEqual(sha256(backup), sourceDigest);
});

scenario(({ root, store, dependencies, responses, sourceDigest, shadowDigest }) => {
  const cutover = createStateV2Cutover(dependencies);
  const result = cutover.switchStateV2(root, sourceDigest, shadowDigest);
  assert.strictEqual(result.status, "switched");
  assert.strictEqual(result.schemaVersion, 2);
  assert.strictEqual(result.operationalReadSchemaVersion, 2);
  assert.strictEqual(result.inlineResponsesRemoved, true);
  assert.strictEqual(result.backupVerified, true);
  const official = store.readJson(store.stateFile(root));
  assert.strictEqual(official.schemaVersion, 2);
  assert.strictEqual(Object.hasOwn(official.pages.alpha.contentGeneration, "savedResponses"), false);
  assert.strictEqual(
    responses.readResponsesV2(root, "alpha", official.pages.alpha.contentGeneration)[0].title,
    "机制",
  );
  assert.deepStrictEqual(
    responses.readResponsesV2(root, "beta", official.pages.beta.contentGeneration),
    [],
  );
  assert.throws(
    () => responses.readResponsesV2(root, "alpha", {
      ...official.pages.alpha.contentGeneration,
      savedResponses: [],
    }),
    /不得包含内联/,
  );
  assert.strictEqual(
    cutover.switchStateV2(root, sourceDigest, shadowDigest).status,
    "already-switched",
  );
  const objectFile = store.withinRoot(
    root,
    official.pages.alpha.contentGeneration.savedResponsesRef.path,
  );
  fs.unlinkSync(objectFile);
  assert.throws(
    () => responses.readResponsesV2(root, "alpha", official.pages.alpha.contentGeneration),
    /对象不存在/,
  );
});

console.log("✓ Stage 2 Schema v2 cutover fails closed and preserves an atomic v1 rollback backup");
