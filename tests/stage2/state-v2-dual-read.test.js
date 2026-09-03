"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  createContentGenerationResponseStore,
} = require("../../tools/deepdive-stage2/lib/content-generation-response-store");
const { createStateV2Backfill } = require("../../tools/deepdive-stage2/lib/state-v2-backfill");
const { createStateV2DualRead } = require("../../tools/deepdive-stage2/lib/state-v2-dual-read");
const { createStateV2Shadow } = require("../../tools/deepdive-stage2/lib/state-v2-shadow");
const { clone, createStateStore, sha256 } = require("../../tools/deepdive-stage2/lib/state-store");

const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "stage2-state-v2-dual-read-"));

try {
  const store = createStateStore({ defaultRoot: fixture, schemaVersion: 1 });
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
            response: "双读必须确认两份内容逐条一致".repeat(200),
            savedAt: "2026-09-01T00:00:00.000Z",
          }],
        },
        lease: null,
      },
    },
  };
  store.writeJson(store.stateFile(fixture), source);
  const responseStore = createContentGenerationResponseStore({
    atomicWrite: store.atomicWrite,
    clone,
    readJson: store.readJson,
    sha256,
    withinRoot: store.withinRoot,
  });
  const { backfillStateV2Objects } = createStateV2Backfill({
    defaultRoot: fixture,
    acquireLock: store.acquireLock,
    appendEvent: store.appendEvent,
    clone,
    loadState: store.loadState,
    readResponseObject: responseStore.readResponseObject,
    saveState: store.saveState,
    sha256,
    writeResponseObject: responseStore.writeResponseObject,
  });
  backfillStateV2Objects(fixture, sha256(source));
  const backfilled = store.loadState(fixture);
  const shadowServices = createStateV2Shadow({
    defaultRoot: fixture,
    acquireLock: store.acquireLock,
    atomicWrite: store.atomicWrite,
    clone,
    loadState: store.loadState,
    readResponseObject: responseStore.readResponseObject,
    readJson: store.readJson,
    sha256,
    writeResponseObject: responseStore.writeResponseObject,
    withinRoot: store.withinRoot,
  });
  shadowServices.buildStateV2Shadow(fixture, sha256(backfilled));
  const { validateStateV2DualRead } = createStateV2DualRead({
    defaultRoot: fixture,
    clone,
    loadState: store.loadState,
    readJson: store.readJson,
    readResponsesDual: responseStore.readResponsesDual,
    rehydrateShadow: shadowServices.rehydrateShadow,
    sha256,
    withinRoot: store.withinRoot,
  });

  const before = fs.readFileSync(store.stateFile(fixture), "utf8");
  const report = validateStateV2DualRead(fixture, sha256(backfilled));
  const after = fs.readFileSync(store.stateFile(fixture), "utf8");
  assert.strictEqual(after, before);
  assert.strictEqual(report.status, "valid");
  assert.strictEqual(report.readOnly, true);
  assert.strictEqual(report.operationalReadSchemaVersion, 1);
  assert.strictEqual(report.dualRead.contentGenerationRecords, 1);
  assert.strictEqual(report.dualRead.referenceFields, 1);
  assert.strictEqual(report.dualRead.verifiedObjects, 1);
  assert.strictEqual(report.dualRead.inlineResponseCount, 1);
  assert.strictEqual(report.dualRead.externalResponseCount, 1);
  assert.strictEqual(report.shadow.sourceDigestMatches, true);
  assert.strictEqual(report.shadow.equivalentAfterRehydrate, true);
  assert.strictEqual(report.issues.count, 0);

  const reference = backfilled.pages.alpha.contentGeneration.savedResponsesRef;
  const objectFile = store.withinRoot(fixture, reference.path);
  const corrupted = store.readJson(objectFile);
  corrupted.responses[0].response += "损坏";
  store.writeJson(objectFile, corrupted);
  const invalid = validateStateV2DualRead(fixture, sha256(backfilled));
  assert.strictEqual(invalid.status, "invalid");
  assert.ok(invalid.issues.byCode["response-object-digest-mismatch"] >= 1);
  assert.strictEqual(JSON.stringify(invalid).includes("alpha"), false);
  assert.strictEqual(JSON.stringify(invalid).includes("双读必须"), false);
  console.log("✓ Stage 2 Schema v2 dual-read validates inline, objects, and shadow without leaking values");
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}
