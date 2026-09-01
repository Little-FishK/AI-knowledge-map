"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { createAuditProjectAccess } = require("../../tools/deepdive-stage2/lib/audit-project-access");
const { createAuditRules } = require("../../tools/deepdive-stage2/lib/audit-rules");
const { createContentGeneration } = require("../../tools/deepdive-stage2/lib/content-generation");
const { renderEditorialMarkdown } = require("../../tools/deepdive-stage2/lib/editorial-markdown");
const { createPublication } = require("../../tools/deepdive-stage2/lib/publication");
const { createStateStore, sha256 } = require("../../tools/deepdive-stage2/lib/state-store");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "stage2-modules-"));
try {
  const store = createStateStore({ defaultRoot: root, schemaVersion: 7 });
  const expiresAt = new Date(Date.now() + 60_000).toISOString();
  store.saveState(root, {
    schemaVersion: 7,
    pages: {
      example: {
        id: "example",
        lease: {
          taskId: "audit-task",
          token: "lease-token",
          role: "audit",
          expiresAt,
        },
      },
    },
  });
  assert.strictEqual(store.loadState(root).pages.example.id, "example");
  assert.strictEqual(sha256("same"), sha256("same"));
  assert.throws(() => store.withinRoot(root, "../outside.txt"), /越出项目根目录/);

  const release = store.acquireLock(root);
  assert.throws(() => store.acquireLock(root), /另一个进程/);
  release();
  const releaseAgain = store.acquireLock(root);
  releaseAgain();

  fs.writeFileSync(path.join(root, "guide.md"), "Stage 2 模块化测试\n第二行\n", "utf8");
  const access = createAuditProjectAccess({
    defaultRoot: root,
    loadState: store.loadState,
    withinRoot: store.withinRoot,
  });
  const read = access.readAuditProjectFile(root, {
    taskId: "audit-task",
    leaseToken: "lease-token",
    path: "guide.md",
  });
  assert.strictEqual(read.pageId, "example");
  assert.strictEqual(read.content, "Stage 2 模块化测试\n第二行\n");
  const search = access.searchAuditProject(root, {
    taskId: "audit-task",
    leaseToken: "lease-token",
    query: "模块化",
  });
  assert.deepStrictEqual(search.matches.map(match => match.path), ["guide.md"]);
  assert.throws(() => access.readAuditProjectFile(root, {
    taskId: "audit-task",
    leaseToken: "lease-token",
    path: ".stage2/state.json",
  }), /禁止访问/);

  const rendered = renderEditorialMarkdown([
    "**核心**与 √(x + 1)",
    "",
    "| 左 | 右 |",
    "| --- | ---: |",
    "| A | B |",
  ].join("\n"));
  assert(rendered.includes("<strong>核心</strong>"));
  assert(rendered.includes("<math class=\"dd-inline-root\""));
  assert(rendered.includes("<div class=\"dd-table-wrap\">"));
  assert(rendered.includes("dd-align-right"));

  const contentGeneration = createContentGeneration({
    defaultRoot: root,
    prompt: "完整固定提示词",
    skippedTitles: ["常见误解", "自测"],
    removedSectionTitles: ["常见误解", "自测"],
    maxResponseChars: 100,
    authorizeTaskLease: () => { throw new Error("not used"); },
    sha256,
    acquireLock: store.acquireLock,
    appendEvent: store.appendEvent,
    atomicWrite: store.atomicWrite,
    loadState: store.loadState,
    saveState: store.saveState,
    withinRoot: store.withinRoot,
  });
  const sections = contentGeneration.contentGenerationSections({
    html: [
      '<section class="dd-sec"><h2><span class="dd-n">1</span>机制</h2><p>正文</p></section>',
      '<section class="dd-sec"><h2>自测</h2><p>问题</p></section>',
    ].join(""),
  });
  assert.deepStrictEqual(sections.map(section => section.title), ["机制", "自测"]);
  assert.deepStrictEqual(
    contentGeneration.contentGenerationManifest({ sections }).eligibleSections.map(section => section.sectionNumber),
    [1],
  );
  assert(contentGeneration.contentGenerationResponseEncodingError("????????") !== null);

  const auditRules = createAuditRules({
    schemaVersion: 3,
    sixQuestions: [],
    blockerCodes: new Set(["formula-error"]),
    warningCodes: new Set(),
    legacyBlockerCodes: new Set(["formula-error"]),
    visibleRawLatexSections: () => [],
    auditContract: () => ({ schemaVersion: 3, mode: "full" }),
    clone: value => JSON.parse(JSON.stringify(value)),
    sha256,
  });
  const blockers = auditRules.auditBlockers({
    decision: "fail",
    blockingFindings: [{
      code: "formula-error",
      claim: "公式错误",
      rationale: "符号关系相反",
      evidence: "a = b",
      sections: [1],
    }],
  });
  assert.strictEqual(blockers.length, 1);
  assert.strictEqual(blockers[0].code, "formula-error");
  assert.deepStrictEqual(blockers[0].sections, [1]);

  const publication = createPublication({
    toolScripts: {},
    clone: value => JSON.parse(JSON.stringify(value)),
    sha256,
    atomicWrite: store.atomicWrite,
    readJson: store.readJson,
    withinRoot: store.withinRoot,
    writeJson: store.writeJson,
    loadSupplementQueue: () => ({ items: [] }),
    runGate: () => ({ script: "unused", passed: true }),
  });
  fs.writeFileSync(path.join(root, "published.txt"), "before", "utf8");
  const target = publication.targetRecord(root, "published.txt", "after");
  assert.throws(() => publication.writePublicationTargets(root, {}, [target], {
    validators: () => [{ script: "forced-failure", passed: false, output: "failed" }],
  }), /已恢复本次暂行发布写入/);
  assert.strictEqual(fs.readFileSync(path.join(root, "published.txt"), "utf8"), "before");
  publication.writePublicationTargets(root, {}, [target], {
    validators: () => [{ script: "success", passed: true }],
  });
  assert.strictEqual(fs.readFileSync(path.join(root, "published.txt"), "utf8"), "after");
  publication.restoreTarget(root, target);
  assert.strictEqual(fs.readFileSync(path.join(root, "published.txt"), "utf8"), "before");
  assert(publication.applyCoreMembership("window.GRAPH={core: [\"a\"]};", "b").includes('"b"'));

  console.log("✓ Stage 2 内部模块：存储、访问、内容生成、审计规则、发布事务和编辑稿渲染测试通过");
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
