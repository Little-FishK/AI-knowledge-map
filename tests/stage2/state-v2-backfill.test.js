"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { isDeepStrictEqual } = require("util");
const {
  createContentGenerationResponseStore,
} = require("../../tools/deepdive-stage2/lib/content-generation-response-store");
const {
  createStateV2Backfill,
  withoutMigrationReferences,
} = require("../../tools/deepdive-stage2/lib/state-v2-backfill");
const { clone, createStateStore, sha256 } = require("../../tools/deepdive-stage2/lib/state-store");

const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "stage2-state-v2-backfill-"));

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
            response: "需要双写但暂不切换读取的回复".repeat(200),
            savedAt: "2026-09-01T00:00:00.000Z",
          }],
        },
        lease: null,
      },
      beta: {
        id: "beta",
        state: "repair-queued",
        contentGeneration: { schemaVersion: 1, status: "queued", savedResponses: [] },
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

  const report = backfillStateV2Objects(fixture, sha256(source));
  const persisted = store.loadState(fixture);
  assert.strictEqual(report.status, "backfilled");
  assert.strictEqual(report.readPathUnchanged, true);
  assert.strictEqual(report.inlineResponsesRetained, true);
  assert.strictEqual(report.referenceCount, 2);
  assert.strictEqual(report.responseObjects, 1);
  assert.strictEqual(report.emptyResponseSets, 1);
  assert.strictEqual(report.objectsWritten, 1);
  assert.strictEqual(persisted.schemaVersion, 1);
  assert.deepStrictEqual(persisted.pages.alpha.contentGeneration.savedResponses, source.pages.alpha.contentGeneration.savedResponses);
  assert.ok(persisted.pages.alpha.contentGeneration.savedResponsesRef);
  assert.strictEqual(persisted.pages.beta.contentGeneration.savedResponsesRef, null);
  const normalized = withoutMigrationReferences(persisted, clone);
  normalized.updatedAt = source.updatedAt;
  assert.ok(isDeepStrictEqual(normalized, source));
  assert.deepStrictEqual(
    responseStore.readResponseObject(
      fixture,
      persisted.pages.alpha.contentGeneration.savedResponsesRef,
      "alpha",
    ).responses,
    source.pages.alpha.contentGeneration.savedResponses,
  );

  const repeated = backfillStateV2Objects(fixture, sha256(persisted));
  assert.strictEqual(repeated.objectsWritten, 0);
  assert.strictEqual(repeated.objectsReused, 1);
  assert.throws(
    () => backfillStateV2Objects(fixture, `sha256:${"0".repeat(64)}`),
    /正式状态摘要已经变化/,
  );
  console.log("✓ Stage 2 Schema v2 backfill dual-writes verified references while retaining v1 reads");
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}
