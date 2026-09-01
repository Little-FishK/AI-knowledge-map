"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { createAuditProjectAccess } = require("../../tools/deepdive-stage2/lib/audit-project-access");
const { createAuditRules } = require("../../tools/deepdive-stage2/lib/audit-rules");
const { createContentGeneration } = require("../../tools/deepdive-stage2/lib/content-generation");
const { createEditorialCandidateImport } = require("../../tools/deepdive-stage2/lib/editorial-candidate-import");
const { createEditorialCandidateValidation } = require("../../tools/deepdive-stage2/lib/editorial-candidate-validation");
const { createManualReviewWorkflow } = require("../../tools/deepdive-stage2/lib/manual-review-workflow");
const { renderEditorialMarkdown } = require("../../tools/deepdive-stage2/lib/editorial-markdown");
const { createPublication } = require("../../tools/deepdive-stage2/lib/publication");
const { createResultSubmissionWorkflow } = require("../../tools/deepdive-stage2/lib/result-submission-workflow");
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

  const candidateValidation = createEditorialCandidateValidation({
    isConfiguredRemovedSectionTitle: (title, configured = ["自测"]) => configured.includes(title),
    sha256,
  });
  assert.deepStrictEqual(candidateValidation.validatePage("page", null), ["result.page 必须是对象"]);
  assert.deepStrictEqual(candidateValidation.validatePage("page", {
    id: "page",
    title: "标题",
    subtitle: "副标题",
    thesis: "命题",
    html: "<section><h2>机制</h2><p>正文</p></section>",
  }), []);
  const retainedSection = [
    "<section><h2>机制</h2>",
    '<figure class="dd-fig"><span>图</span></figure>',
    '<table class="dd-table"><tr><td>数据</td></tr></table>',
    "</section>",
  ].join("");
  const removedSection = [
    "<section><h2>自测</h2>",
    '<table class="dd-table"><tr><td>题目</td></tr></table>',
    "</section>",
  ].join("");
  const preservation = candidateValidation.editorialPreservationReport(
    { html: retainedSection + removedSection },
    { html: retainedSection },
    ["自测"],
  );
  assert.strictEqual(preservation.passed, true);
  assert.strictEqual(preservation.allowedRemovedTables, 1);
  assert.strictEqual(preservation.missingFigureCount, 0);
  const policyGaps = candidateValidation.editorialContentPolicyGaps({
    html: '<section><h2>自测</h2><div class="dd-quiz">题目</div><p>√(x)</p></section>',
  });
  assert(policyGaps.some(gap => gap.includes("独立“自测”章节")));
  assert(policyGaps.includes("不得生成自测题"));
  assert(policyGaps.some(gap => gap.includes("根式")));
  assert.deepStrictEqual(
    candidateValidation.visibleRawLatexSections({
      html: "<section><h2>公式</h2><p>\\frac a b</p></section>",
    }).map(section => section.section),
    [1],
  );

  const responseDirectory = path.join(root, "docs", "deepdive-reviews");
  fs.mkdirSync(responseDirectory, { recursive: true });
  const responseMarkdown = "# Review Agent Responses\n\n## 1. 机制\n\n生成后的完整机制说明。\n";
  fs.writeFileSync(path.join(responseDirectory, "review-agent-responses.md"), responseMarkdown, "utf8");
  const candidateImport = createEditorialCandidateImport({
    defaultRoot: root,
    clone: value => JSON.parse(JSON.stringify(value)),
    contentGenerationResponseEncodingError: contentGeneration.contentGenerationResponseEncodingError,
    exactHtmlBlocks: candidateValidation.exactHtmlBlocks,
    htmlBlockWithClass: candidateValidation.htmlBlockWithClass,
    isConfiguredRemovedSectionTitle: title => ["常见误解", "自测"].includes(title),
    sectionRecordsForPreservation: candidateValidation.sectionRecordsForPreservation,
    sha256,
    withinRoot: store.withinRoot,
  });
  const preservedFigure = '<figure class="dd-fig"><span>原图</span></figure>';
  const builtCandidate = candidateImport.buildEditorialPageFromContentGeneration(root, {
    id: "review",
    contentGeneration: {
      status: "complete",
      outputFile: "docs/deepdive-reviews/review-agent-responses.md",
      outputHash: sha256(responseMarkdown),
    },
  }, {
    id: "review",
    title: "标题",
    subtitle: "副标题",
    thesis: "命题",
    html: [
      '<div class="dd-goals">学习目标</div>',
      '<div class="dd-chain">因果链</div>',
      `<section class="dd-sec"><h2><span class="dd-n">1</span>机制</h2><p>旧正文</p>${preservedFigure}</section>`,
      '<div class="dd-src">资料来源</div>',
    ].join("\n"),
  });
  assert(builtCandidate.page.html.includes("生成后的完整机制说明"));
  assert(builtCandidate.page.html.includes(preservedFigure));
  assert.strictEqual(builtCandidate.source.sectionCount, 1);
  assert.throws(() => candidateImport.buildEditorialPageFromContentGeneration(root, {
    id: "review",
  }, {}), /没有已完成且可验证/);

  let activeSubmissionRole = "audit";
  const submissionWorkflow = createResultSubmissionWorkflow({
    defaultRoot: root,
    authorizeTaskLease: () => ({
      id: "review",
      lease: { role: activeSubmissionRole },
      editorialWorkflow: activeSubmissionRole === "repair" ? {} : null,
    }),
    currentPage: () => ({
      id: "review",
      title: "标题",
      subtitle: "副标题",
      thesis: "命题",
      html: '<section><h2>机制</h2><p>正文</p></section>',
    }),
    auditContract: () => ({ schemaVersion: 3, mode: "full" }),
    auditGaps: () => [],
    validatePage: candidateValidation.validatePage,
    editorialContentPolicyGaps: candidateValidation.editorialContentPolicyGaps,
    editorialPreservationReport: candidateValidation.editorialPreservationReport,
    pageSourceSignature: candidateValidation.pageSourceSignature,
    visibleRawLatexSections: candidateValidation.visibleRawLatexSections,
  });
  assert.strictEqual(submissionWorkflow.validateAuditResult(root, {
    taskId: "audit-task",
    leaseToken: "lease-token",
    result: {},
  }).status, "valid");
  activeSubmissionRole = "repair";
  const invalidPageResult = submissionWorkflow.validatePageResult(root, {
    taskId: "repair-task",
    leaseToken: "lease-token",
    result: { page: { id: "review" } },
  });
  assert.strictEqual(invalidPageResult.status, "invalid");
  assert(invalidPageResult.gaps.includes("result.summary is missing"));

  const reviewState = {
    pages: {
      review: {
        id: "review",
        state: "manual-review",
        lease: null,
        blockers: [],
        finalReview: { status: "pending" },
        editorialWorkflow: {
          status: "human-review-pending",
          auditMode: "full",
          verificationSource: "machine",
          initialBlockingFindings: [],
        },
      },
    },
  };
  const workflowEvents = [];
  const manualReview = createManualReviewWorkflow({
    defaultRoot: root,
    acquireLock: () => () => {},
    appendEvent: (_root, type, details) => workflowEvents.push({ type, details }),
    loadState: () => reviewState,
    saveState: (_root, state) => state,
    clone: value => JSON.parse(JSON.stringify(value)),
    sha256,
    currentPage: () => ({ html: "<section><h2>机制</h2><p>正文</p></section>" }),
    refreshEditorialDraftPublication: () => ({ status: "published-editorial-draft" }),
  });
  const returned = manualReview.returnEditorialForRevision(root, "review", {
    reason: "人工发现机制说明不完整",
    issues: [{
      claim: "机制说明不完整",
      acceptanceCriteria: "补充完整因果链",
      sections: [1],
    }],
  });
  assert.strictEqual(returned.status, "repair-queued");
  assert.strictEqual(reviewState.pages.review.state, "repair-queued");
  assert.strictEqual(reviewState.pages.review.editorialWorkflow.auditMode, "verification");
  assert.strictEqual(workflowEvents[0].type, "editorial-returned-for-human-revision");

  console.log("✓ Stage 2 内部模块：存储、访问、内容生成、候选构建、候选校验、结果提交、人工审查、审计规则、发布事务和编辑稿渲染测试通过");
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
