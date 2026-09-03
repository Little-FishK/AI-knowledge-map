"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { createStateDiagnostics } = require("../../tools/deepdive-stage2/lib/state-diagnostics");
const { createStateStore } = require("../../tools/deepdive-stage2/lib/state-store");

const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "stage2-state-report-"));
const privateText = "PRIVATE_AUDIT_VALUE_MUST_NOT_LEAK";

try {
  const store = createStateStore({
    defaultRoot: fixture,
    schemaVersion: 1,
  });
  fs.mkdirSync(path.join(fixture, ".stage2", "results", "alpha"), { recursive: true });
  fs.writeFileSync(
    path.join(fixture, ".stage2", "results", "alpha", "audit.json"),
    JSON.stringify({ privateText }),
    "utf8",
  );
  store.writeJson(store.stateFile(fixture), {
    schemaVersion: 1,
    mode: "serial",
    paused: false,
    pages: {
      alpha: {
        id: "alpha",
        state: "repair-queued",
        candidate: {
          html: `<p>${privateText}</p>`.repeat(4000),
        },
        auditFile: ".stage2/results/alpha/audit.json",
        missingFile: ".stage2/results/alpha/missing.json",
        blockers: [{ message: privateText }],
        lease: null,
      },
      beta: {
        id: "beta",
        state: "audit-queued",
        blockers: [],
        lease: null,
      },
    },
  });

  const before = fs.readFileSync(store.stateFile(fixture), "utf8");
  const { stateStorageReport } = createStateDiagnostics({
    defaultRoot: fixture,
    loadState: store.loadState,
    stateFile: store.stateFile,
    withinRoot: store.withinRoot,
  });
  const report = stateStorageReport(fixture);
  const after = fs.readFileSync(store.stateFile(fixture), "utf8");
  const serializedReport = JSON.stringify(report);

  assert.strictEqual(after, before);
  assert.strictEqual(report.readOnly, true);
  assert.strictEqual(report.pages.count, 2);
  assert.strictEqual(report.safeguards.valuesIncluded, false);
  assert.strictEqual(report.safeguards.pageIdsIncluded, false);
  assert.strictEqual(serializedReport.includes(privateText), false);
  assert.strictEqual(serializedReport.includes("alpha/audit.json"), false);
  assert.strictEqual(serializedReport.includes('"alpha"'), false);
  assert.strictEqual(report.runtimeReferences.uniqueReferences, 2);
  assert.strictEqual(report.runtimeReferences.existingUniqueReferences, 1);
  assert.strictEqual(report.runtimeReferences.missingUniqueReferences, 1);
  assert.ok(report.warningCodes.includes("large-page-field-value"));
  assert.ok(report.warningCodes.includes("large-leaf-value"));
  assert.ok(report.warningCodes.includes("missing-runtime-reference"));
  assert.ok(report.pages.fields.some(item => item.field === "candidate" && item.totalBytes > 64 * 1024));
  assert.ok(report.pages.largestLeafPaths.some(item => item.path === "pages.*.candidate.html"));
  assert.match(report.state.digest, /^sha256:[a-f0-9]{64}$/);
  console.log("✓ Stage 2 state storage report is read-only, size-aware, and value-redacted");
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}
