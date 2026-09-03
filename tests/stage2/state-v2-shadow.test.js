"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  SHADOW_REPORT_PATH,
  SHADOW_STATE_PATH,
  createStateV2Shadow,
} = require("../../tools/deepdive-stage2/lib/state-v2-shadow");
const {
  createContentGenerationResponseStore,
} = require("../../tools/deepdive-stage2/lib/content-generation-response-store");
const { clone, createStateStore, sha256 } = require("../../tools/deepdive-stage2/lib/state-store");

const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "stage2-state-v2-shadow-"));

try {
  const store = createStateStore({
    defaultRoot: fixture,
    schemaVersion: 1,
  });
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
          outputFile: "docs/deepdive-reviews/alpha-agent-responses.md",
          outputHash: `sha256:${"a".repeat(64)}`,
          savedResponses: [
            {
              sectionNumber: 1,
              title: "机制",
              response: "只允许保存在仓库外对象中的完整回复".repeat(300),
              savedAt: "2026-09-01T00:00:00.000Z",
            },
          ],
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
  store.writeJson(store.stateFile(fixture), source);
  const before = fs.readFileSync(store.stateFile(fixture), "utf8");
  const responseStore = createContentGenerationResponseStore({
    atomicWrite: store.atomicWrite,
    clone,
    readJson: store.readJson,
    sha256,
    withinRoot: store.withinRoot,
  });
  const services = createStateV2Shadow({
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

  const report = services.buildStateV2Shadow(fixture, sha256(source));
  const after = fs.readFileSync(store.stateFile(fixture), "utf8");
  assert.strictEqual(after, before);
  assert.strictEqual(report.status, "built");
  assert.strictEqual(report.readPathUnchanged, true);
  assert.strictEqual(report.comparison.equivalentAfterRehydrate, true);
  assert.strictEqual(report.comparison.stateCountsMatch, true);
  assert.strictEqual(report.externalized.responseObjects, 1);
  assert.strictEqual(report.externalized.objectsWritten, 1);
  assert.strictEqual(report.externalized.responseCount, 1);
  assert.ok(report.reduction.bytes > 0);

  const shadow = store.readJson(store.withinRoot(fixture, SHADOW_STATE_PATH));
  assert.strictEqual(shadow.schemaVersion, 2);
  assert.strictEqual(Object.hasOwn(shadow.pages.alpha.contentGeneration, "savedResponses"), false);
  assert.strictEqual(shadow.pages.alpha.contentGeneration.savedResponsesRef.responseCount, 1);
  assert.strictEqual(shadow.pages.beta.contentGeneration.savedResponsesRef, null);
  assert.deepStrictEqual(services.rehydrateShadow(fixture, shadow), source);
  assert.ok(fs.existsSync(store.withinRoot(fixture, SHADOW_REPORT_PATH)));

  const repeated = services.buildStateV2Shadow(fixture, sha256(source));
  assert.strictEqual(repeated.externalized.objectsWritten, 0);
  assert.strictEqual(repeated.externalized.objectsReused, 1);
  assert.strictEqual(repeated.shadow.digest, report.shadow.digest);

  assert.throws(
    () => services.buildStateV2Shadow(fixture, `sha256:${"0".repeat(64)}`),
    /正式状态摘要已经变化/,
  );
  const leased = clone(source);
  leased.pages.beta.lease = {
    role: "repair",
    taskId: "fixture-task",
    token: "fixture-token",
    expiresAt: "2099-01-01T00:00:00.000Z",
  };
  store.writeJson(store.stateFile(fixture), leased);
  assert.throws(
    () => services.buildStateV2Shadow(fixture, sha256(leased)),
    /存在活动租约/,
  );
  console.log("✓ Stage 2 Schema v2 shadow externalizes responses and round-trips without switching reads");
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}
