"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  auditGaps,
  claimTask,
  enqueueNewNode,
  gateDefects,
  initialize,
  loadState,
  readAuditProjectFile,
  releaseLease,
  searchAuditProject,
  setPaused,
  status,
  submitResult,
} = require("./deepdive-stage2/core");

function copyFixture(options = {}) {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "stage2-test-"));
  fs.mkdirSync(path.join(fixture, "data", "deepdive"), { recursive: true });
  fs.mkdirSync(path.join(fixture, "data", "deepdive-runtime"), { recursive: true });
  fs.writeFileSync(
    path.join(fixture, "data", "graph.js"),
    "window.GRAPH={nodes:[{id:'alpha',title:'Alpha'}],edges:[],core:[],domains:{x:{title:'X'}},edgeTypes:{requires:{title:'requires'}},positions:{alpha:[0,0]},recommendedLearningPath:[]};\n",
    "utf8",
  );
  const page = {
    title: "Alpha",
    subtitle: "A subtitle",
    thesis: "A thesis",
    html: "<section class=\"dd-sec\"><h2>One</h2><p>body</p></section>",
  };
  fs.writeFileSync(
    path.join(fixture, "data", "deepdive", "alpha.js"),
    `window.DEEPDIVE=window.DEEPDIVE||{};window.DEEPDIVE.alpha=${JSON.stringify(page)};\n`,
    "utf8",
  );
  fs.writeFileSync(
    path.join(fixture, "data", "deepdive-runtime", "alpha.js"),
    `window.DEEPDIVE=window.DEEPDIVE||{};window.DEEPDIVE.alpha=${JSON.stringify(page)};\n`,
    "utf8",
  );
  fs.writeFileSync(
    path.join(fixture, "data", "deepdive-runtime", "manifest.js"),
    'window.DEEPDIVE_RUNTIME={base:"data/deepdive-runtime",ids:["alpha"]};\n',
    "utf8",
  );
  const supplementItems = options.supplement ? [{
    id: "video-alpha-supplement",
    status: "pending",
    decision: "supplement",
    term: "Alpha",
    targetNode: "alpha",
    rationale: "补充一个可迁移机制",
    evidenceRefs: [{ start: 1, end: 2 }],
    proposalHash: `sha256:${"1".repeat(64)}`,
    evidenceHash: `sha256:${"2".repeat(64)}`,
    approvedAt: "2026-07-28",
    approvedBy: "fixture",
  }] : [];
  fs.writeFileSync(
    path.join(fixture, "data", "video-concept-supplements.json"),
    `${JSON.stringify({ schemaVersion: 1, items: supplementItems }, null, 2)}\n`,
    "utf8",
  );
  fs.writeFileSync(path.join(fixture, "index.html"), '<script src="data/deepdive-runtime/manifest.js"></script>', "utf8");
  return { fixture, page };
}

function completeAudit(pageId, pageHash) {
  const part = { answer: "正文给出了答案", evidence: "body" };
  return {
    schemaVersion: 1,
    pageId,
    pageHash,
    reviewedAt: "2026-07-28",
    sections: [{
      section: 1,
      definition: part,
      problem: part,
      inputOutput: part,
      mechanism: part,
      interpretation: part,
      boundary: part,
    }],
  };
}

const parsedDefects = gateDefects({
  script: "audit-deepdive-benchmark.js",
  output: [
    "  - image-generation: section.missing-inputOutput.section-2",
    "  - image-generation: section.insufficient-inputOutput-boundary.section-2",
    "  - other-page: section.missing-definition.section-1",
  ].join("\n"),
}, "image-generation");
assert.strictEqual(parsedDefects.length, 1);
assert.strictEqual(parsedDefects[0].section, 2);
assert.deepStrictEqual(parsedDefects[0].missing, ["inputOutput", "boundary"]);

const { fixture } = copyFixture();
try {
  const initialized = initialize(fixture);
  assert.strictEqual(initialized.pageCount, 1);
  assert.strictEqual(status(fixture).counts["audit-queued"], 1);
  const first = claimTask(fixture, "test-auditor");
  assert.strictEqual(first.status, "claimed");
  assert.strictEqual(first.task.role, "audit");
  assert.deepStrictEqual(first.task.projectReadOnly.tools, [
    "stage2_search_project",
    "stage2_read_project_file",
  ]);
  const readPage = readAuditProjectFile(fixture, {
    taskId: first.task.taskId,
    leaseToken: first.task.leaseToken,
    path: "data/deepdive/alpha.js",
  });
  assert(readPage.content.includes("window.DEEPDIVE.alpha"));
  const searched = searchAuditProject(fixture, {
    taskId: first.task.taskId,
    leaseToken: first.task.leaseToken,
    query: "A subtitle",
    pathPrefix: "data",
  });
  assert.strictEqual(searched.matches[0].path, "data/deepdive/alpha.js");
  assert.throws(
    () => readAuditProjectFile(fixture, {
      taskId: first.task.taskId,
      leaseToken: first.task.leaseToken,
      path: ".stage2/state.json",
    }),
    /禁止访问/,
  );
  assert.strictEqual(claimTask(fixture, "other").status, "busy");

  const badAudit = completeAudit("alpha", first.task.contentHash);
  badAudit.sections[0].mechanism = { answer: "", evidence: "" };
  assert(auditGaps("alpha", first.task.page, badAudit).some(item => /mechanism/.test(item)));
  const failed = submitResult(fixture, {
    taskId: first.task.taskId,
    leaseToken: first.task.leaseToken,
    result: badAudit,
  }, {
    evaluateCandidate: () => ({ passed: true, blockers: [] }),
  });
  assert.strictEqual(failed.nextState, "repair-queued");

  const repair = claimTask(fixture, "test-writer");
  assert.strictEqual(repair.task.role, "repair");
  assert(!Object.prototype.hasOwnProperty.call(repair.task, "auditContract"));
  const repairedPage = {
    ...repair.task.page,
    html: '<section class="dd-sec"><h2>One</h2><p>body with mechanism</p></section>',
  };
  const accepted = submitResult(fixture, {
    taskId: repair.task.taskId,
    leaseToken: repair.task.leaseToken,
    result: { page: repairedPage, summary: "补充机制解释" },
  });
  assert.strictEqual(accepted.nextState, "audit-queued");

  const secondAudit = claimTask(fixture, "test-auditor-2");
  let published = false;
  const passed = submitResult(fixture, {
    taskId: secondAudit.task.taskId,
    leaseToken: secondAudit.task.leaseToken,
    result: { audit: completeAudit("alpha", secondAudit.task.contentHash) },
  }, {
    evaluateCandidate: () => ({ passed: true, blockers: [] }),
    publishCandidate: (_root, record, page, audit) => {
      published = true;
      return {
        schemaVersion: 1,
        status: "published",
        pageId: record.id,
        pageHash: secondAudit.task.contentHash,
        auditHash: "sha256:test",
        audit,
      };
    },
  });
  assert(published);
  assert.strictEqual(passed.status, "l3-auto-passed");
  assert.strictEqual(loadState(fixture).pages.alpha.repairAttempts, 1);

  setPaused(fixture, true);
  assert.strictEqual(claimTask(fixture).status, "paused");
  console.log("✓ 第二阶段状态机：串行租约、材料隔离、返修、审计和发布状态测试通过");
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}

const supplementFixture = copyFixture({ supplement: true }).fixture;
try {
  const initialized = initialize(supplementFixture);
  assert.strictEqual(initialized.supplementsImported, 1);
  const update = claimTask(supplementFixture, "supplement-writer");
  assert.strictEqual(update.task.role, "update");
  assert.strictEqual(update.task.supplements[0].id, "video-alpha-supplement");
  assert.throws(
    () => readAuditProjectFile(supplementFixture, {
      taskId: update.task.taskId,
      leaseToken: update.task.leaseToken,
      path: "data/deepdive/alpha.js",
    }),
    /只有 audit 角色/,
  );
} finally {
  fs.rmSync(supplementFixture, { recursive: true, force: true });
}

const newNodeFixture = copyFixture().fixture;
try {
  initialize(newNodeFixture);
  enqueueNewNode(newNodeFixture, {
    node: { id: "beta", title: "Beta" },
    edges: [],
    learningPath: {},
    layout: {},
    core: { requested: false },
    bindings: {},
  }, {
    proposedNode: { id: "beta", title: "Beta" },
    evidence: { source: { title: "fixture" } },
  });
  const targetedAudit = claimTask(newNodeFixture, "pilot-auditor", "alpha");
  assert.strictEqual(targetedAudit.task.pageId, "alpha");
  assert.strictEqual(targetedAudit.task.role, "audit");
  const released = releaseLease(newNodeFixture, "alpha", "fixture-recovery");
  assert.strictEqual(released.nextState, "audit-queued");
  const write = claimTask(newNodeFixture, "new-node-writer");
  assert.strictEqual(write.task.role, "write");
  assert.strictEqual(write.task.material.proposedNode.id, "beta");
} finally {
  fs.rmSync(newNodeFixture, { recursive: true, force: true });
}

console.log("✓ 第二阶段入口：视频补充优先更新、新节点进入独立 write 队列");
