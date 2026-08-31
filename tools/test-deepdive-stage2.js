"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  CONTENT_GENERATION_PROMPT,
  L3_BLOCKING_CRITERIA,
  L3_NON_BLOCKING_SIGNALS,
  auditBlockers,
  auditGaps,
  claimTask,
  contentGenerationSections,
  createManualReviewPreview,
  enqueueContentGeneration,
  enqueueNewNode,
  editorialContentPolicyGaps,
  finalizeManualReview,
  gateDefects,
  initialize,
  importEditorialCandidate,
  inspectPublicationCandidate,
  loadState,
  readAuditProjectFile,
  readContentGenerationSection,
  readTaskPacketPart,
  releaseLease,
  renderEditorialMarkdown,
  nextRecommendedPage,
  resolveRecommendedPage,
  resetManualReview,
  resetPassedPage,
  returnEditorialForRevision,
  publishProvisionalPage,
  rollbackProvisionalPage,
  searchAuditProject,
  saveContentGenerationResponse,
  setPaused,
  status,
  submitResult,
  validatePageResult,
} = require("./deepdive-stage2/core");
const { pageContentHash } = require("./deepdive-audit-contracts");
const { scanNarrativeTemplates } = require("./deepdive-narrative-audit");

const renderedEditorialMarkdown = renderEditorialMarkdown([
  "y = γ(x − μ) / √(σ² + ε) + β",
  "z = (x − μ) / √((x − μ)² + ε)",
  "",
  "| 输入类型 | 典型形状 | 每个特征参与统计的元素数 |",
  "|---|:---:|---:|",
  "| 全连接 | [N,C] | N |",
].join("\n"));
assert.match(renderedEditorialMarkdown, /<math class="dd-inline-root"[^>]*><msqrt><mtext>σ² \+ ε<\/mtext><\/msqrt><\/math>/);
assert.doesNotMatch(renderedEditorialMarkdown, /√\(σ² \+ ε\)/);
assert.match(renderedEditorialMarkdown, /<msqrt><mtext>\(x − μ\)² \+ ε<\/mtext><\/msqrt>/);
assert.doesNotMatch(renderedEditorialMarkdown, /√\(\(x − μ\)² \+ ε\)/);
assert.match(renderedEditorialMarkdown, /<div class="dd-table-wrap"><table class="dd-table">/);
assert.match(renderedEditorialMarkdown, /<th class="dd-align-center">典型形状<\/th>/);
assert.match(renderedEditorialMarkdown, /<td class="dd-align-right">N<\/td>/);
assert.doesNotMatch(renderedEditorialMarkdown, /<p>\| 输入类型/);
assert.deepStrictEqual(editorialContentPolicyGaps({ html: renderedEditorialMarkdown }), []);
assert.deepStrictEqual(
  editorialContentPolicyGaps({ html: "<p>y = 1 / √(σ² + ε)</p><p>| A | B | |---|---| | 1 | 2 |</p>" }),
  ["可见正文不得保留未排版的 √(…) 根式", "可见正文不得保留 Markdown 管道表格分隔行"],
);

function copyFixture(options = {}) {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "stage2-test-"));
  fs.mkdirSync(path.join(fixture, "data", "deepdive"), { recursive: true });
  fs.mkdirSync(path.join(fixture, "data", "deepdive-runtime"), { recursive: true });
  fs.writeFileSync(
    path.join(fixture, "data", "graph.js"),
    "window.GRAPH={nodes:[{id:'alpha',title:'Alpha'}],edges:[],core:[],domains:{x:{title:'X'}},edgeTypes:{requires:{title:'requires'}},positions:{alpha:[0,0]},recommendedLearningPath:[{phase:'基础',steps:[['1.3','alpha']]}]};\n",
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
  const part = { answer: "正文中的对应段落已经完整回答当前问题并提供了本节证据", evidence: "body" };
  return {
    schemaVersion: 2,
    pageId,
    pageHash,
    reviewedAt: "2026-07-28",
    decision: "pass",
    blockingFindings: [],
    narrativeAudit: {
      reviewedSections: [1],
      sectionOpenings: [{
        section: 1,
        evidence: "body",
        patternFamily: "other",
      }],
      pervasiveTemplateExpression: false,
      rationale: "唯一章节没有形成跨章节重复模板。",
    },
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

function failingAudit(pageId, pageHash, claim = "正文把关键事实说反了") {
  const audit = completeAudit(pageId, pageHash);
  audit.decision = "fail";
  audit.blockingFindings = [{
    code: "critical-factual-error",
    section: 1,
    claim,
    evidence: "body",
    rationale: "该表述会直接改变读者对机制的理解。",
  }];
  return audit;
}

function completeEditorialAudit(pageId, pageHash, evidence = "body improved") {
  const check = { status: "pass", evidence, rationale: "正文已明确覆盖该项。" };
  return {
    schemaVersion: 3,
    pageId,
    pageHash,
    reviewedAt: "2026-07-28",
    mode: "full",
    decision: "pass",
    blockingFindings: [],
    warnings: [],
    coreConcepts: [{
      name: "Alpha",
      sections: [1],
      definition: check,
      problem: check,
      boundary: check,
    }],
    verificationResults: [],
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
  assert.deepStrictEqual(nextRecommendedPage(fixture), {
    status: "next",
    startOrder: "1.3",
    order: "1.3",
    pageId: "alpha",
    phase: "基础",
    pageState: "audit-queued",
    active: false,
    activeRole: null,
  });
  assert.deepStrictEqual(resolveRecommendedPage(fixture, "1.3"), {
    status: "resolved",
    order: "1.3",
    pageId: "alpha",
    phase: "基础",
    tracked: true,
    pageState: "audit-queued",
    active: false,
    activeRole: null,
    contentGeneration: null,
  });
  assert.throws(
    () => resolveRecommendedPage(fixture, "9.9"),
    /不存在节点/,
  );
  const first = claimTask(fixture, "test-auditor");
  assert.strictEqual(first.status, "claimed");
  assert.strictEqual(first.task.role, "audit");
  assert.strictEqual(first.task.uiCleanup.tool, "set_thread_archived");
  assert.deepStrictEqual(first.task.uiCleanup.arguments, { archived: true });
  assert.deepStrictEqual(first.task.uiCleanup.afterSubmitStatuses, [
    "accepted",
    "content-generated",
    "needs-repair",
    "l3-auto-passed",
    "awaiting-human-review",
    "rejected",
  ]);
  assert.strictEqual(first.task.auditContract.schemaVersion, 3);
  assert.strictEqual(first.task.auditContract.decisionPolicy.type, "binary");
  assert.deepStrictEqual(
    first.task.auditContract.blockingCriteria.map(item => item.code),
    L3_BLOCKING_CRITERIA.map(item => item.code),
  );
  assert(first.task.auditContract.blockingCriteria.some(item => item.code === "core-concept-definition-missing"));
  assert(first.task.auditContract.blockingCriteria.some(item => item.code === "core-concept-problem-missing"));
  assert(first.task.auditContract.blockingCriteria.some(item => item.code === "core-concept-boundary-missing"));
  assert.deepStrictEqual(
    first.task.auditContract.nonBlockingSignals.map(item => item.code),
    L3_NON_BLOCKING_SIGNALS.map(item => item.code),
  );
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
  const shallowPass = completeAudit("alpha", first.task.contentHash);
  shallowPass.sections[0].definition.answer = "只有术语名称";
  assert(
    auditGaps("alpha", first.task.page, shallowPass)
      .some(item => /definition.*少于 16 字/.test(item)),
  );
  const borrowedEvidencePass = completeAudit("alpha", first.task.contentHash);
  borrowedEvidencePass.sections[0].mechanism.evidence = "另一个章节里的证据";
  assert(
    auditGaps("alpha", first.task.page, borrowedEvidencePass)
      .some(item => /mechanism.*不是本节正文/.test(item)),
  );
  const duplicateSectionPass = completeAudit("alpha", first.task.contentHash);
  duplicateSectionPass.sections.push({ ...duplicateSectionPass.sections[0] });
  assert(
    auditGaps("alpha", first.task.page, duplicateSectionPass)
      .some(item => /恰好覆盖全部核心教学章节且不得重复/.test(item)),
  );
  assert.throws(
    () => readAuditProjectFile(fixture, {
      taskId: first.task.taskId,
      leaseToken: first.task.leaseToken,
      path: ".stage2/state.json",
    }),
    /禁止访问/,
  );
  const busy = claimTask(fixture, "other");
  assert.strictEqual(busy.status, "busy");
  assert.strictEqual(busy.uiCleanup.tool, "set_thread_archived");

  const badAudit = failingAudit("alpha", first.task.contentHash);
  badAudit.blockingFindings[0].evidence = "这段证据并不存在于当前正文";
  assert(auditGaps("alpha", first.task.page, badAudit).some(item => /evidence/.test(item)));
  const failed = submitResult(fixture, {
    taskId: first.task.taskId,
    leaseToken: first.task.leaseToken,
    result: badAudit,
  }, {
    evaluateCandidate: () => ({ passed: true, blockers: [] }),
  });
  assert.strictEqual(failed.status, "rejected");
  assert.strictEqual(failed.reason, "invalid-audit-contract");
  assert.strictEqual(failed.nextState, "audit-queued");
  assert(failed.issues.some(item => /evidence/.test(item)));
  assert.strictEqual(failed.uiCleanup.tool, "set_thread_archived");
  const rejectedAuditState = loadState(fixture).pages.alpha;
  assert.strictEqual(rejectedAuditState.lease, null);
  assert.strictEqual(rejectedAuditState.auditFile, null);
  assert.strictEqual(rejectedAuditState.blockers.length, 0);
  assert.strictEqual((rejectedAuditState.reviewHistory || []).length, 0);
  assert.strictEqual(rejectedAuditState.repairAttempts, 0);

  const retryAudit = claimTask(fixture, "test-auditor-retry");
  assert.strictEqual(retryAudit.task.role, "audit");
  const validFailure = submitResult(fixture, {
    taskId: retryAudit.task.taskId,
    leaseToken: retryAudit.task.leaseToken,
    result: { audit: failingAudit("alpha", retryAudit.task.contentHash) },
  }, {
    evaluateCandidate: () => {
      throw new Error("有效的显式正文阻断项存在时不应继续执行自动门禁");
    },
  });
  assert.strictEqual(validFailure.status, "needs-repair");
  assert.strictEqual(validFailure.nextState, "repair-queued");

  const repair = claimTask(fixture, "test-writer");
  assert.strictEqual(repair.task.role, "repair");
  assert(!Object.prototype.hasOwnProperty.call(repair.task, "auditContract"));
  assert.strictEqual(repair.task.outputShape.page.type, "object");
  assert.strictEqual(repair.task.outputShape.page.source, "packet.page");
  assert.deepStrictEqual(
    [...repair.task.outputShape.page.requiredKeys].sort(),
    Object.keys(repair.task.page).sort(),
  );
  assert.strictEqual(
    Object.prototype.hasOwnProperty.call(repair.task.outputShape.page, "html"),
    false,
  );
  assert.strictEqual(
    JSON.stringify(repair.task).split(JSON.stringify(repair.task.page)).length - 1,
    1,
  );
  const repairContract = readTaskPacketPart(fixture, {
    taskId: repair.task.taskId,
    leaseToken: repair.task.leaseToken,
    part: "contract",
  });
  assert.deepStrictEqual(repairContract.packet.defects, repair.task.defects);
  assert.strictEqual(Object.hasOwn(repairContract.packet, "page"), false);
  assert.strictEqual(Object.hasOwn(repairContract.pageMetadata, "html"), false);
  const repairHtml = readTaskPacketPart(fixture, {
    taskId: repair.task.taskId,
    leaseToken: repair.task.leaseToken,
    part: "page-html",
    offset: 0,
    maxChars: 1000,
  });
  assert.strictEqual(repairHtml.content, repair.task.page.html);
  assert.strictEqual(repairHtml.done, true);
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
  assert.strictEqual(accepted.uiCleanup.tool, "set_thread_archived");

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
  assert.strictEqual(passed.uiCleanup.tool, "set_thread_archived");
  assert.strictEqual(loadState(fixture).pages.alpha.repairAttempts, 1);

  const idle = claimTask(fixture);
  assert.strictEqual(idle.status, "idle");
  assert.strictEqual(idle.uiCleanup.tool, "set_thread_archived");

  setPaused(fixture, true);
  const paused = claimTask(fixture);
  assert.strictEqual(paused.status, "paused");
  assert.strictEqual(paused.uiCleanup.tool, "set_thread_archived");
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
  assert.throws(
    () => releaseLease(newNodeFixture, "alpha", "fixture-recovery", "wrong-task-id"),
    /taskId 不匹配/,
  );
  const released = releaseLease(
    newNodeFixture,
    "alpha",
    "fixture-recovery",
    targetedAudit.task.taskId,
  );
  assert.strictEqual(released.nextState, "audit-queued");
  const write = claimTask(newNodeFixture, "new-node-writer");
  assert.strictEqual(write.task.role, "write");
  assert.strictEqual(write.task.material.proposedNode.id, "beta");
} finally {
  fs.rmSync(newNodeFixture, { recursive: true, force: true });
}

console.log("✓ 第二阶段入口：视频补充优先更新、新节点进入独立 write 队列");

const blockerFixture = copyFixture().fixture;
try {
  initialize(blockerFixture);
  const auditTask = claimTask(blockerFixture, "blocking-auditor");
  const failedAudit = completeAudit("alpha", auditTask.task.contentHash);
  failedAudit.decision = "fail";
  failedAudit.blockingFindings = [{
    code: "critical-factual-error",
    section: 1,
    claim: "正文把关键事实说反了",
    evidence: "body",
    rationale: "该表述会直接改变读者对机制的理解",
  }];
  assert.deepStrictEqual(auditGaps("alpha", auditTask.task.page, failedAudit), []);
  assert.strictEqual(auditBlockers(failedAudit)[0].code, "critical-factual-error");
  const blocked = submitResult(blockerFixture, {
    taskId: auditTask.task.taskId,
    leaseToken: auditTask.task.leaseToken,
    result: { audit: failedAudit },
  }, {
    evaluateCandidate: () => {
      throw new Error("显式高置信阻断项存在时不应继续执行自动门禁");
    },
  });
  assert.strictEqual(blocked.status, "needs-repair");
  assert.strictEqual(loadState(blockerFixture).pages.alpha.blockers[0].code, "critical-factual-error");
} finally {
  fs.rmSync(blockerFixture, { recursive: true, force: true });
}

const nonBlockingFixture = copyFixture().fixture;
try {
  initialize(nonBlockingFixture);
  const auditTask = claimTask(nonBlockingFixture, "non-blocking-auditor");
  const invalidAudit = completeAudit("alpha", auditTask.task.contentHash);
  invalidAudit.decision = "fail";
  invalidAudit.blockingFindings = [{
    code: "missing-real-run-log",
    section: 1,
    claim: "没有真实运行日志",
    evidence: "body",
    rationale: "仅以缺少日志为由阻断",
  }];
  assert(
    auditGaps("alpha", auditTask.task.page, invalidAudit)
      .some(item => /非阻断代码/.test(item)),
  );
} finally {
  fs.rmSync(nonBlockingFixture, { recursive: true, force: true });
}

const templatedNarrativePage = {
  title: "模板化叙事测试",
  subtitle: "验证跨章节定义式开场",
  thesis: "控制器必须独立复核审计代理的模板判断。",
  html: [
    '<section class="dd-sec"><h2>一</h2><p>图像生成是在条件约束下合成像素内容的任务。</p></section>',
    '<section class="dd-sec"><h2>二</h2><p>条件理解是一类把文字映射为内部表示的过程。</p></section>',
    '<section class="dd-sec"><h2>三</h2><p>扩散模型是一种逐步去除噪声的生成机制。</p></section>',
    '<section class="dd-sec"><h2>四</h2><p>生成评估是比较结果与目标约束是否一致的方法。</p></section>',
  ].join(""),
};
const templateScan = scanNarrativeTemplates(templatedNarrativePage);
assert.strictEqual(templateScan.pervasive, true);
assert.deepStrictEqual(templateScan.pervasiveFamilies, ["definition-copula"]);
assert.deepStrictEqual(templateScan.affectedSections, [1, 2, 3, 4]);

const coreScopedNarrativePage = {
  title: "核心章节范围测试",
  subtitle: "补充章节不扩大 schema v2 证据合同",
  thesis: "审计证据覆盖核心教学章节即可。",
  html: [
    '<section class="dd-sec" data-section-role="core"><h2>一</h2><p>核心正文第一节从问题出发。</p></section>',
    '<section class="dd-sec" data-section-role="core"><h2>二</h2><p>核心正文第二节沿机制展开。</p></section>',
    '<section class="dd-sec" data-section-role="reference"><h2>参考资料</h2><p>补充章节只提供延伸阅读。</p></section>',
  ].join(""),
};
const coreScopedScan = scanNarrativeTemplates(coreScopedNarrativePage);
assert.strictEqual(coreScopedScan.sectionCount, 2);
assert.strictEqual(coreScopedScan.totalSectionCount, 3);
assert.deepStrictEqual(coreScopedScan.sections.map(section => section.section), [1, 2]);
const coreScopedPart = {
  answer: "正文中的对应段落已经完整回答当前问题并提供了本节证据",
  evidence: "核心正文",
};
assert.deepStrictEqual(auditGaps("core-scope", coreScopedNarrativePage, {
  schemaVersion: 2,
  pageId: "core-scope",
  pageHash: pageContentHash(coreScopedNarrativePage),
  reviewedAt: "2026-07-29",
  decision: "pass",
  blockingFindings: [],
  narrativeAudit: {
    reviewedSections: [1, 2],
    sectionOpenings: coreScopedScan.sections.map(section => ({
      section: section.section,
      evidence: section.opening,
      patternFamily: section.patternFamily,
    })),
    pervasiveTemplateExpression: false,
    rationale: "两个核心章节的开场各自服务于不同教学动作。",
  },
  sections: [1, 2].map(section => ({
    section,
    definition: coreScopedPart,
    problem: coreScopedPart,
    inputOutput: coreScopedPart,
    mechanism: coreScopedPart,
    interpretation: coreScopedPart,
    boundary: coreScopedPart,
  })),
}), []);

const templateFixture = copyFixture().fixture;
try {
  fs.writeFileSync(
    path.join(templateFixture, "data", "deepdive", "alpha.js"),
    `window.DEEPDIVE=window.DEEPDIVE||{};window.DEEPDIVE.alpha=${JSON.stringify(templatedNarrativePage)};\n`,
    "utf8",
  );
  initialize(templateFixture);
  const auditTask = claimTask(templateFixture, "template-miss-auditor");
  const openings = templateScan.sections.map(section => section.opening);
  const falsePassAudit = {
    schemaVersion: 2,
    pageId: "alpha",
    pageHash: auditTask.task.contentHash,
    reviewedAt: "2026-07-29",
    decision: "pass",
    blockingFindings: [],
    narrativeAudit: {
      reviewedSections: [1, 2, 3, 4],
      sectionOpenings: openings.map((evidence, index) => ({
        section: index + 1,
        evidence,
        patternFamily: "other",
      })),
      pervasiveTemplateExpression: false,
      rationale: "审计代理错误地认为这些开场互不重复。",
    },
    sections: openings.map((evidence, index) => {
      const part = {
        answer: "正文中的对应段落已经完整回答当前问题并提供了本节证据",
        evidence,
      };
      return {
        section: index + 1,
        definition: part,
        problem: part,
        inputOutput: part,
        mechanism: part,
        interpretation: part,
        boundary: part,
      };
    }),
  };
  assert.deepStrictEqual(auditGaps("alpha", auditTask.task.page, falsePassAudit), []);
  const blocked = submitResult(templateFixture, {
    taskId: auditTask.task.taskId,
    leaseToken: auditTask.task.leaseToken,
    result: { audit: falsePassAudit },
  }, {
    evaluateCandidate: () => {
      throw new Error("模板强制扫描命中时不得继续执行后续门禁");
    },
  });
  assert.strictEqual(blocked.status, "needs-repair");
  assert.strictEqual(
    loadState(templateFixture).pages.alpha.blockers[0].code,
    "harmful-template-expression",
  );
  assert.strictEqual(
    loadState(templateFixture).pages.alpha.reviewHistory[0].reportedAuditDecision,
    "pass",
  );
  assert.strictEqual(loadState(templateFixture).pages.alpha.reviewHistory[0].auditDecision, "fail");
} finally {
  fs.rmSync(templateFixture, { recursive: true, force: true });
}

const writerGuardFixture = copyFixture().fixture;
try {
  initialize(writerGuardFixture);
  const auditTask = claimTask(writerGuardFixture, "writer-guard-auditor");
  const queuedRepair = submitResult(writerGuardFixture, {
    taskId: auditTask.task.taskId,
    leaseToken: auditTask.task.leaseToken,
    result: { audit: failingAudit("alpha", auditTask.task.contentHash) },
  }, {
    evaluateCandidate: () => {
      throw new Error("有效的显式正文阻断项存在时不应继续执行自动门禁");
    },
  });
  assert.strictEqual(queuedRepair.nextState, "repair-queued");

  const repairTask = claimTask(writerGuardFixture, "writer-guard-repairer");
  assert.strictEqual(repairTask.task.role, "repair");
  assert.match(repairTask.task.writingPolicy, /大量模板化表达硬约束/);
  assert.strictEqual(repairTask.task.narrativeGuard.blockingCode, "harmful-template-expression");
  assert.strictEqual(repairTask.task.narrativeGuard.baseline.pervasive, false);

  const rejected = submitResult(writerGuardFixture, {
    taskId: repairTask.task.taskId,
    leaseToken: repairTask.task.leaseToken,
    result: {
      page: {
        ...repairTask.task.page,
        html: templatedNarrativePage.html,
      },
      summary: "错误地把各节统一改成定义句。",
    },
  });
  assert.strictEqual(rejected.status, "rejected");
  assert.strictEqual(rejected.reason, "harmful-template-expression");
  assert.strictEqual(rejected.nextState, "repair-queued");
  assert.strictEqual(rejected.uiCleanup.tool, "set_thread_archived");
  const rejectedState = loadState(writerGuardFixture).pages.alpha;
  assert.strictEqual(rejectedState.lease, null);
  assert.strictEqual(rejectedState.repairAttempts, 0);
  assert.strictEqual(rejectedState.candidateFile, null);
  assert.strictEqual(rejectedState.blockers[0].code, "harmful-template-expression");

  const retryTask = claimTask(writerGuardFixture, "writer-guard-retry");
  assert.strictEqual(retryTask.task.role, "repair");
  assert.strictEqual(
    retryTask.task.narrativeGuard.previousSubmissionDefects[0].code,
    "harmful-template-expression",
  );
} finally {
  fs.rmSync(writerGuardFixture, { recursive: true, force: true });
}

console.log("✓ Stage 2 L3 审计：二元结论、十二类阻断白名单与六类非阻断项测试通过");
console.log("✓ Stage 2 模板叙事：审计代理漏报 pass 时由正文强制扫描改判 fail");
console.log("✓ Stage 2 写作代理：模板化候选在进入审计前被拒绝并重新排队");

const resetFixture = copyFixture().fixture;
try {
  initialize(resetFixture);
  const statePath = path.join(resetFixture, ".stage2", "state.json");
  const resetState = JSON.parse(fs.readFileSync(statePath, "utf8"));
  resetState.policy.maxRepairAttempts = 0;
  fs.writeFileSync(statePath, `${JSON.stringify(resetState, null, 2)}\n`, "utf8");

  const auditTask = claimTask(resetFixture, "manual-review-auditor");
  const failedAudit = failingAudit("alpha", auditTask.task.contentHash);
  const failed = submitResult(resetFixture, {
    taskId: auditTask.task.taskId,
    leaseToken: auditTask.task.leaseToken,
    result: failedAudit,
  });
  assert.strictEqual(failed.nextState, "manual-review");

  const reset = resetManualReview(resetFixture, "alpha", "按新 L3 标准重新独立审查");
  assert.strictEqual(reset.previousState, "manual-review");
  assert.strictEqual(reset.nextState, "audit-queued");
  assert.strictEqual(reset.repairAttempts, 0);
  assert.strictEqual(reset.blockerCount, 0);
  assert.throws(
    () => resetManualReview(resetFixture, "alpha", "重复重置"),
    /只有 manual-review 可以重置/,
  );
} finally {
  fs.rmSync(resetFixture, { recursive: true, force: true });
}

console.log("✓ Stage 2 人工复核重置：状态限制、原因审计与重新排队测试通过");

const passedResetFixture = copyFixture().fixture;
try {
  initialize(passedResetFixture);
  const statePath = path.join(passedResetFixture, ".stage2", "state.json");
  const passedState = JSON.parse(fs.readFileSync(statePath, "utf8"));
  passedState.pages.alpha.state = "l3-auto-passed";
  passedState.pages.alpha.auditHash = "previous-audit-hash";
  passedState.pages.alpha.auditFile = "docs/deepdive-audits/alpha.json";
  passedState.pages.alpha.editorialWarnings = [{ code: "fixture-warning" }];
  passedState.pages.alpha.reviewHistory = [{ round: 1 }];
  passedState.pages.alpha.finalReview = { status: "l3-auto-passed" };
  passedState.pages.alpha.completionReceipt = ".stage2/results/alpha/completion.json";
  fs.writeFileSync(statePath, `${JSON.stringify(passedState, null, 2)}\n`, "utf8");

  assert.deepStrictEqual(nextRecommendedPage(passedResetFixture, "1.3"), {
    status: "complete",
    startOrder: "1.3",
    remaining: 0,
  });
  assert.deepStrictEqual(resolveRecommendedPage(passedResetFixture, "1.3"), {
    status: "resolved",
    order: "1.3",
    pageId: "alpha",
    phase: "基础",
    tracked: true,
    pageState: "l3-auto-passed",
    active: false,
    activeRole: null,
    contentGeneration: null,
  });

  const reset = resetPassedPage(passedResetFixture, "alpha", "人工抽检发现正文质量不足，重新独立审查");
  assert.strictEqual(reset.previousState, "l3-auto-passed");
  assert.strictEqual(reset.nextState, "audit-queued");
  assert.strictEqual(reset.published, true);
  const requeued = loadState(passedResetFixture).pages.alpha;
  assert.strictEqual(requeued.auditHash, null);
  assert.strictEqual(requeued.auditFile, null);
  assert.strictEqual(requeued.finalReview, null);
  assert.strictEqual(requeued.completionReceipt, null);
  assert.deepStrictEqual(requeued.editorialWarnings, []);
  assert.deepStrictEqual(requeued.reviewHistory, []);
  assert.throws(
    () => resetPassedPage(passedResetFixture, "alpha", "重复重置"),
    /只有 l3-auto-passed 可以重置复审/,
  );
} finally {
  fs.rmSync(passedResetFixture, { recursive: true, force: true });
}

console.log("✓ Stage 2 已通过页复审重置：状态限制、旧结论清理与发布页保留测试通过");

const previewFixture = copyFixture().fixture;
try {
  initialize(previewFixture);
  const firstAudit = claimTask(previewFixture, "preview-auditor-1");
  const incompleteAudit = failingAudit("alpha", firstAudit.task.contentHash);
  assert.strictEqual(submitResult(previewFixture, {
    taskId: firstAudit.task.taskId,
    leaseToken: firstAudit.task.leaseToken,
    result: incompleteAudit,
  }).nextState, "repair-queued");

  const repair = claimTask(previewFixture, "preview-repair");
  const candidatePage = {
    ...repair.task.page,
    thesis: "A repaired thesis",
    html: '<section class="dd-sec"><h2>One repaired</h2><p>body candidate</p></section>',
  };
  assert.strictEqual(submitResult(previewFixture, {
    taskId: repair.task.taskId,
    leaseToken: repair.task.leaseToken,
    result: { page: candidatePage, summary: "preview candidate" },
  }).nextState, "audit-queued");

  const previewStatePath = path.join(previewFixture, ".stage2", "state.json");
  const previewState = JSON.parse(fs.readFileSync(previewStatePath, "utf8"));
  previewState.policy.maxRepairAttempts = 0;
  fs.writeFileSync(previewStatePath, `${JSON.stringify(previewState, null, 2)}\n`, "utf8");

  const secondAudit = claimTask(previewFixture, "preview-auditor-2");
  const secondIncompleteAudit = failingAudit("alpha", secondAudit.task.contentHash);
  assert.strictEqual(submitResult(previewFixture, {
    taskId: secondAudit.task.taskId,
    leaseToken: secondAudit.task.leaseToken,
    result: secondIncompleteAudit,
  }).nextState, "manual-review");

  const preview = createManualReviewPreview(previewFixture, "alpha");
  assert.strictEqual(preview.status, "ready");
  assert.strictEqual(preview.state, "manual-review");
  assert.deepStrictEqual(preview.changedFields, ["thesis"]);
  assert.strictEqual(preview.changedSections[0].section, 1);
  assert(preview.blockers.length > 0);
  assert.strictEqual(preview.processRounds.length, 2);
  assert(preview.processRounds[0].defects.length > 0);
  assert.deepStrictEqual(preview.processRounds[0].improvements, ["preview candidate"]);
  assert(preview.processRounds[1].defects.length > 0);
  assert.strictEqual(preview.finalStatus, "manual-review");
  const previewHtml = fs.readFileSync(path.join(previewFixture, preview.previewPath), "utf8");
  assert.match(previewHtml, /未发布候选/);
  assert.match(previewHtml, /两轮审查与改进/);
  assert.match(previewHtml, /第 1 轮/);
  assert.match(previewHtml, /第 2 轮/);
  assert.match(previewHtml, /最终状态/);
  assert.match(previewHtml, /body candidate/);
  assert.match(previewHtml, /One repaired/);

  const stillBlocked = finalizeManualReview(
    previewFixture,
    "alpha",
    "复用现有审计重新计算门禁",
    {
      evaluateCandidate: () => {
        throw new Error("有效的显式正文阻断项存在时不应执行自动门禁");
      },
    },
  );
  assert.strictEqual(stillBlocked.status, "still-blocked");
  assert.strictEqual(stillBlocked.state, "manual-review");

  const blockedState = loadState(previewFixture);
  const reusableAudit = completeAudit("alpha", blockedState.pages.alpha.contentHash);
  fs.writeFileSync(
    path.join(previewFixture, blockedState.pages.alpha.auditFile),
    `${JSON.stringify(reusableAudit, null, 2)}\n`,
    "utf8",
  );
  let finalizedPublished = false;
  const finalized = finalizeManualReview(
    previewFixture,
    "alpha",
    "schema v2 与正文六问门禁修复后复用最终审计",
    {
      evaluateCandidate: () => ({ passed: true, blockers: [] }),
      publishCandidate: (_root, record, page, audit) => {
        finalizedPublished = true;
        return {
          schemaVersion: 1,
          status: "published",
          pageId: record.id,
          pageHash: blockedState.pages.alpha.contentHash,
          auditHash: "sha256:reused-audit",
          audit,
        };
      },
    },
  );
  assert.strictEqual(finalized.status, "l3-auto-passed");
  assert.strictEqual(finalized.reusedAudit, true);
  assert.strictEqual(finalizedPublished, true);
  assert.strictEqual(loadState(previewFixture).pages.alpha.state, "l3-auto-passed");
} finally {
  fs.rmSync(previewFixture, { recursive: true, force: true });
}

console.log("✓ Stage 2 人工复核预览：候选、阻断项及字段/章节差异测试通过");

const provisionalFixture = copyFixture().fixture;
try {
  initialize(provisionalFixture);
  const firstAudit = claimTask(provisionalFixture, "provisional-auditor-1");
  assert.strictEqual(submitResult(provisionalFixture, {
    taskId: firstAudit.task.taskId,
    leaseToken: firstAudit.task.leaseToken,
    result: failingAudit("alpha", firstAudit.task.contentHash),
  }).nextState, "repair-queued");
  const repair = claimTask(provisionalFixture, "provisional-repair");
  const repairedPage = {
    ...repair.task.page,
    thesis: "A better but still blocked provisional thesis",
  };
  assert.strictEqual(submitResult(provisionalFixture, {
    taskId: repair.task.taskId,
    leaseToken: repair.task.leaseToken,
    result: { page: repairedPage, summary: "improved provisional candidate" },
  }).nextState, "audit-queued");
  const statePath = path.join(provisionalFixture, ".stage2", "state.json");
  const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
  state.policy.maxRepairAttempts = 0;
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  const finalAudit = claimTask(provisionalFixture, "provisional-auditor-2");
  assert.strictEqual(submitResult(provisionalFixture, {
    taskId: finalAudit.task.taskId,
    leaseToken: finalAudit.task.leaseToken,
    result: failingAudit("alpha", finalAudit.task.contentHash),
  }).nextState, "manual-review");

  const inspection = inspectPublicationCandidate(provisionalFixture, "alpha");
  assert.strictEqual(inspection.workflowState, "manual-review");
  assert.strictEqual(inspection.canPublishProvisional, true);
  assert.throws(
    () => publishProvisionalPage(
      provisionalFixture,
      "alpha",
      `sha256:${"0".repeat(64)}`,
      "人工确认候选优于旧正式页",
      { publishCandidate: () => ({ targets: [], validators: [] }) },
    ),
    /候选哈希不匹配/,
  );
  const provisional = publishProvisionalPage(
    provisionalFixture,
    "alpha",
    inspection.candidateHash,
    "人工确认候选优于旧正式页",
    { validators: () => [{ script: "fixture", passed: true }] },
  );
  assert.strictEqual(provisional.status, "published-provisional");
  assert.strictEqual(provisional.workflowState, "manual-review");
  const overridePath = path.join(provisionalFixture, "data", "deepdive", "zzzzz-stage2-alpha.js");
  const overrideSource = fs.readFileSync(overridePath, "utf8");
  assert.match(overrideSource, /published-provisional/);
  assert.match(overrideSource, /manual-review/);
  const publishedState = loadState(provisionalFixture).pages.alpha;
  assert.strictEqual(publishedState.state, "manual-review");
  assert.strictEqual(publishedState.publication.status, "published-provisional");
  assert.strictEqual(inspectPublicationCandidate(provisionalFixture, "alpha").canPublishProvisional, false);

  const rolledBack = rollbackProvisionalPage(
    provisionalFixture,
    "alpha",
    inspection.candidateHash,
    "人工要求恢复被覆盖版本",
  );
  assert.strictEqual(rolledBack.status, "rolled-back");
  assert.strictEqual(loadState(provisionalFixture).pages.alpha.publication, null);
  assert.strictEqual(fs.existsSync(overridePath), false);
} finally {
  fs.rmSync(provisionalFixture, { recursive: true, force: true });
}

const rejectedPassedFixture = copyFixture().fixture;
try {
  initialize(rejectedPassedFixture);
  const statePath = path.join(rejectedPassedFixture, ".stage2", "state.json");
  const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
  state.pages.alpha.state = "l3-auto-passed";
  state.pages.alpha.published = true;
  state.pages.alpha.blockers = [];
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  const inspection = inspectPublicationCandidate(rejectedPassedFixture, "alpha");
  const result = publishProvisionalPage(
    rejectedPassedFixture,
    "alpha",
    inspection.candidateHash,
    "人工审查否决自动通过结果",
    { publishCandidate: () => ({ targets: [], validators: [] }) },
  );
  assert.strictEqual(result.workflowState, "manual-review");
  const rejected = loadState(rejectedPassedFixture).pages.alpha;
  assert.strictEqual(rejected.blockers[0].code, "human-review-rejected");
  assert.strictEqual(rejected.publication.status, "published-provisional");
} finally {
  fs.rmSync(rejectedPassedFixture, { recursive: true, force: true });
}

const appSource = fs.readFileSync(path.join(__dirname, "..", "assets", "app.js"), "utf8");
const styleSource = fs.readFileSync(path.join(__dirname, "..", "assets", "style.css"), "utf8");
assert.match(appSource, /published-provisional/);
assert.match(appSource, /未通过审计/);
assert.match(styleSource, /dd-h1-provisional/);
console.log("✓ Stage 2 暂行发布：人工否决、红色标题标记、哈希绑定与回滚测试通过");

const editorialFixture = copyFixture().fixture;
try {
  const originalPage = {
    title: "Alpha",
    subtitle: "A subtitle",
    thesis: "A thesis",
    html: '<section class="dd-sec"><h2><span class="dd-n">1</span>正文<span class="dd-badge">直觉</span></h2><p>body original</p><figure class="dd-fig"><svg></svg><figcaption>图</figcaption></figure><table class="dd-table"><tbody><tr><td>保留表</td></tr></tbody></table></section><section class="dd-sec"><h2><span class="dd-n">2</span>因果链、常见误解与自测<span class="dd-badge">直觉</span></h2><table class="dd-table"><tbody><tr><td>删除表</td></tr></tbody></table></section><section class="dd-sec"><h2><span class="dd-n">3</span>检查你是否真的理解<span class="dd-badge">自测</span></h2><p>quiz</p></section>',
  };
  fs.writeFileSync(
    path.join(editorialFixture, "data", "deepdive", "alpha.js"),
    `window.DEEPDIVE=window.DEEPDIVE||{};window.DEEPDIVE.alpha=${JSON.stringify(originalPage)};\n`,
    "utf8",
  );
  fs.writeFileSync(
    path.join(editorialFixture, "data", "deepdive-runtime", "alpha.js"),
    `window.DEEPDIVE=window.DEEPDIVE||{};window.DEEPDIVE.alpha=${JSON.stringify(originalPage)};\n`,
    "utf8",
  );
  initialize(editorialFixture);
  const statePath = path.join(editorialFixture, ".stage2", "state.json");
  const initializedState = JSON.parse(fs.readFileSync(statePath, "utf8"));
  initializedState.pages.alpha.state = "l3-auto-passed";
  fs.writeFileSync(statePath, `${JSON.stringify(initializedState, null, 2)}\n`, "utf8");

  const candidatePage = {
    ...originalPage,
    html: '<section class="dd-sec"><h2><span class="dd-n">1</span>正文<span class="dd-badge">直觉</span></h2><p>body improved with a clearer mechanism and boundary</p><figure class="dd-fig"><svg></svg><figcaption>图</figcaption></figure><table class="dd-table"><tbody><tr><td>保留表</td></tr></tbody></table></section>',
  };
  const imported = importEditorialCandidate(editorialFixture, "alpha", {
    page: candidatePage,
    reason: "人工完成逐章重写与去重",
    summary: "删除误解和自测，保留图表并改善正文",
    removedSectionTitles: ["常见误解", "自测", "检查你是否真的理解"],
  }, {
    validators: () => [{ script: "fixture", passed: true }],
  });
  assert.strictEqual(imported.status, "published-editorial-draft");
  assert.strictEqual(imported.workflowState, "audit-queued");
  assert.strictEqual(imported.preservation.originalFigures, 1);
  assert.strictEqual(imported.preservation.originalRetainedTables, 1);
  assert.strictEqual(imported.preservation.allowedRemovedTables, 1);
  assert.strictEqual(loadState(editorialFixture).pages.alpha.editorialWorkflow.status, "machine-audit-pending");

  const auditTask = claimTask(editorialFixture, "editorial-auditor");
  const machinePassed = submitResult(editorialFixture, {
    taskId: auditTask.task.taskId,
    leaseToken: auditTask.task.leaseToken,
    result: completeEditorialAudit("alpha", auditTask.task.contentHash),
  }, {
    evaluateCandidate: () => ({ passed: true, blockers: [], editorialWarnings: [] }),
    publishEditorialDraft: (_root, _record, targets) => ({ targets, validators: [] }),
    publishCandidate: () => {
      throw new Error("人工整理流程机器通过后不得自动正式发布");
    },
  });
  assert.strictEqual(machinePassed.status, "awaiting-human-review");
  assert.strictEqual(machinePassed.nextState, "manual-review");
  assert.strictEqual(loadState(editorialFixture).pages.alpha.editorialWorkflow.status, "human-review-pending");

  const finalized = finalizeManualReview(editorialFixture, "alpha", "人工检查通过", {
    evaluateCandidate: () => ({ passed: true, blockers: [] }),
    publishCandidate: (_root, record, page, audit) => ({
      schemaVersion: 1,
      status: "published",
      pageId: record.id,
      pageHash: pageContentHash(page),
      auditHash: pageContentHash({ ...page, html: JSON.stringify(audit) }),
      targets: [],
      validators: [],
    }),
  });
  assert.strictEqual(finalized.status, "published-approved");
  assert.strictEqual(loadState(editorialFixture).pages.alpha.publication.status, "published-approved");
} finally {
  fs.rmSync(editorialFixture, { recursive: true, force: true });
}

console.log("✓ Stage 2 人工候选：图表保留、待审覆盖、机器审查与人工放行顺序测试通过");

const editorialRepairFixture = copyFixture().fixture;
try {
  initialize(editorialRepairFixture);
  const statePath = path.join(editorialRepairFixture, ".stage2", "state.json");
  const readyState = JSON.parse(fs.readFileSync(statePath, "utf8"));
  readyState.pages.alpha.state = "l3-auto-passed";
  fs.writeFileSync(statePath, `${JSON.stringify(readyState, null, 2)}\n`, "utf8");
  const candidatePage = {
    title: "Alpha",
    subtitle: "A subtitle",
    thesis: "A thesis",
    html: '<section class="dd-sec"><h2>One</h2><p>body explains Alpha but omits its boundary</p></section><div class="dd-src"><a href="https://example.com/source">source</a></div>',
  };
  importEditorialCandidate(editorialRepairFixture, "alpha", {
    page: candidatePage,
    reason: "测试单轮返修与定向复核",
  }, { validators: () => [{ script: "fixture", passed: true }] });
  const draftWriter = (_root, _record, targets) => ({ targets, validators: [] });
  const firstAuditTask = claimTask(editorialRepairFixture, "first-editorial-auditor");
  const firstAudit = completeEditorialAudit("alpha", firstAuditTask.task.contentHash, "body explains Alpha");
  firstAudit.decision = "fail";
  firstAudit.coreConcepts[0].boundary = {
    status: "fail",
    evidence: "omits its boundary",
    rationale: "没有说明适用边界。",
  };
  firstAudit.blockingFindings = [{
    code: "core-concept-boundary-missing",
    concept: "Alpha",
    sections: [1],
    claim: "Alpha 的适用边界缺失",
    evidence: "omits its boundary",
    rationale: "读者无法判断何时不适用。",
    acceptanceCriteria: "在第一节补充明确的适用与不适用条件。",
  }];
  const failed = submitResult(editorialRepairFixture, {
    taskId: firstAuditTask.task.taskId,
    leaseToken: firstAuditTask.task.leaseToken,
    result: firstAudit,
  }, {
    evaluateCandidate: () => ({ passed: true, blockers: [] }),
    publishEditorialDraft: draftWriter,
  });
  assert.strictEqual(failed.status, "needs-repair");
  assert.strictEqual(failed.nextState, "repair-queued");
  let repairState = loadState(editorialRepairFixture).pages.alpha;
  assert.strictEqual(repairState.editorialWorkflow.initialBlockingFindings.length, 1);
  assert.strictEqual(repairState.publication.reviewStatus, "repair-pending");

  const repairTask = claimTask(editorialRepairFixture, "editorial-repairer");
  assert.strictEqual(repairTask.task.role, "repair");
  assert.strictEqual(repairTask.task.repairScope.maximumRounds, 1);
  const repairedPage = {
    ...candidatePage,
    html: candidatePage.html.replace("omits its boundary", "applies only when its stated assumptions hold"),
  };
  const changedSourcePreflight = validatePageResult(editorialRepairFixture, {
    taskId: repairTask.task.taskId,
    leaseToken: repairTask.task.leaseToken,
    result: {
      page: { ...repairedPage, html: repairedPage.html.replace("example.com/source", "example.com/replacement") },
      summary: "错误地替换来源",
    },
  });
  assert.strictEqual(changedSourcePreflight.status, "invalid");
  assert(changedSourcePreflight.gaps.some(item => /不得添加、删除或替换页面来源/.test(item)));
  const repaired = submitResult(editorialRepairFixture, {
    taskId: repairTask.task.taskId,
    leaseToken: repairTask.task.leaseToken,
    result: { page: repairedPage, summary: "补充适用边界" },
  }, { publishEditorialDraft: draftWriter });
  assert.strictEqual(repaired.status, "accepted");
  const verifyTask = claimTask(editorialRepairFixture, "verification-auditor");
  assert.strictEqual(verifyTask.task.auditContract.mode, "verification");
  assert.strictEqual(verifyTask.task.auditContract.verificationFindings.length, 1);
  const originalFinding = verifyTask.task.auditContract.verificationFindings[0];
  const verification = {
    schemaVersion: 3,
    pageId: "alpha",
    pageHash: verifyTask.task.contentHash,
    reviewedAt: "2026-07-28",
    mode: "verification",
    decision: "fail",
    coreConcepts: [],
    warnings: [],
    verificationResults: [{
      findingId: originalFinding.findingId,
      resolved: false,
      evidence: "applies only when its stated assumptions hold",
      rationale: "仍未列出具体假设。",
    }],
    blockingFindings: [{
      findingId: originalFinding.findingId,
      code: originalFinding.code,
      concept: originalFinding.concept,
      sections: originalFinding.sections,
      claim: "Alpha 的适用边界仍不具体",
      evidence: "applies only when its stated assumptions hold",
      rationale: "仍未列出具体假设。",
      acceptanceCriteria: originalFinding.acceptanceCriteria,
    }],
  };
  const verificationFailed = submitResult(editorialRepairFixture, {
    taskId: verifyTask.task.taskId,
    leaseToken: verifyTask.task.leaseToken,
    result: verification,
  }, {
    evaluateCandidate: () => ({ passed: true, blockers: [] }),
    publishEditorialDraft: draftWriter,
  });
  assert.strictEqual(verificationFailed.status, "awaiting-human-review");
  assert.strictEqual(verificationFailed.nextState, "manual-review");
  repairState = loadState(editorialRepairFixture).pages.alpha;
  assert.strictEqual(repairState.repairAttempts, 1);
  assert.strictEqual(repairState.publication.reviewStatus, "human-review-blocked");

  const approved = finalizeManualReview(editorialRepairFixture, "alpha", "人工确认可正式发布", {
    publishCandidate: (_root, record, page) => ({
      schemaVersion: 1,
      status: "published-human-approved",
      pageId: record.id,
      pageHash: pageContentHash(page),
      targets: [],
      validators: [],
    }),
  });
  assert.strictEqual(approved.status, "published-approved");
  assert.strictEqual(approved.overriddenMachineBlockerCount, 1);
  const approvedState = loadState(editorialRepairFixture).pages.alpha;
  assert.strictEqual(approvedState.finalReview.humanApproved, true);
  assert.strictEqual(approvedState.finalReview.blockerCountAtApproval, 1);
} finally {
  fs.rmSync(editorialRepairFixture, { recursive: true, force: true });
}

console.log("✓ Stage 2 新版审查：单轮返修、首次问题定向复核、红色阻断与人工覆盖测试通过");

const humanReturnFixture = copyFixture().fixture;
try {
  initialize(humanReturnFixture);
  const statePath = path.join(humanReturnFixture, ".stage2", "state.json");
  const readyState = JSON.parse(fs.readFileSync(statePath, "utf8"));
  readyState.pages.alpha.state = "l3-auto-passed";
  fs.writeFileSync(statePath, `${JSON.stringify(readyState, null, 2)}\n`, "utf8");
  const page = {
    title: "Alpha",
    subtitle: "A subtitle",
    thesis: "A thesis",
    html: '<section class="dd-sec"><h2>One</h2><p>body explains Alpha clearly</p></section>',
  };
  importEditorialCandidate(humanReturnFixture, "alpha", {
    page,
    reason: "测试人工退回定向修改",
  }, { validators: () => [{ script: "fixture", passed: true }] });
  const draftWriter = (_root, _record, targets) => ({ targets, validators: [] });
  const auditTask = claimTask(humanReturnFixture, "human-return-initial-audit");
  const passed = submitResult(humanReturnFixture, {
    taskId: auditTask.task.taskId,
    leaseToken: auditTask.task.leaseToken,
    result: completeEditorialAudit("alpha", auditTask.task.contentHash, "body explains Alpha"),
  }, {
    evaluateCandidate: () => ({ passed: true, blockers: [] }),
    publishEditorialDraft: draftWriter,
  });
  assert.strictEqual(passed.nextState, "manual-review");
  const returned = returnEditorialForRevision(humanReturnFixture, "alpha", {
    reason: "人工要求补充一个具体边界",
    issues: [{
      claim: "第一节边界仍然太抽象",
      sections: [1],
      evidence: "body explains Alpha clearly",
      acceptanceCriteria: "增加一个明确的不适用条件",
    }],
  }, { publishEditorialDraft: draftWriter });
  assert.strictEqual(returned.nextState, "repair-queued");
  assert.strictEqual(returned.verificationSource, "human");
  const repairTask = claimTask(humanReturnFixture, "human-return-repair");
  const changedPage = { ...page, html: page.html.replace("clearly", "clearly and not outside the stated range") };
  submitResult(humanReturnFixture, {
    taskId: repairTask.task.taskId,
    leaseToken: repairTask.task.leaseToken,
    result: { page: changedPage, summary: "按人工意见补充边界" },
  }, { publishEditorialDraft: draftWriter });
  const verificationTask = claimTask(humanReturnFixture, "human-return-verifier");
  assert.strictEqual(verificationTask.task.auditContract.mode, "verification");
  assert.strictEqual(verificationTask.task.auditContract.verificationSource, "human");
  const finding = verificationTask.task.auditContract.verificationFindings[0];
  const verified = submitResult(humanReturnFixture, {
    taskId: verificationTask.task.taskId,
    leaseToken: verificationTask.task.leaseToken,
    result: {
      schemaVersion: 3,
      pageId: "alpha",
      pageHash: verificationTask.task.contentHash,
      reviewedAt: "2026-07-28",
      mode: "verification",
      decision: "pass",
      blockingFindings: [],
      warnings: [],
      coreConcepts: [],
      verificationResults: [{
        findingId: finding.findingId,
        resolved: true,
        evidence: "not outside the stated range",
        rationale: "人工指出的边界问题已补充。",
      }],
    },
  }, {
    evaluateCandidate: () => ({ passed: true, blockers: [] }),
    publishEditorialDraft: draftWriter,
  });
  assert.strictEqual(verified.status, "awaiting-human-review");
  assert.strictEqual(verified.nextState, "manual-review");
} finally {
  fs.rmSync(humanReturnFixture, { recursive: true, force: true });
}

console.log("✓ Stage 2 人工退回：仅修改并验证人工指出的问题，然后直接回到人工审查");

const { fixture: contentFixture } = copyFixture();
try {
  initialize(contentFixture);
  const sourcePath = path.join(contentFixture, "data", "deepdive", "alpha.js");
  const contentPage = {
    title: "Alpha",
    subtitle: "A subtitle",
    thesis: "A thesis",
    html: [
      '<section class="dd-sec"><h2><span class="dd-n">1</span>第一章</h2><p>第一章正文。</p></section>',
      '<section class="dd-sec"><h2><span class="dd-n">2</span>常见误区与学习路线</h2><p>不应发送。</p></section>',
      '<section class="dd-sec"><h2><span class="dd-n">3</span>第二章</h2><p>第二章正文。</p></section>',
      '<section class="dd-sec"><h2><span class="dd-n">4</span>检查你是否真的理解</h2><p>不应发送。</p></section>',
    ].join(""),
  };
  fs.writeFileSync(
    sourcePath,
    `window.DEEPDIVE=window.DEEPDIVE||{};window.DEEPDIVE.alpha=${JSON.stringify(contentPage)};\n`,
    "utf8",
  );
  fs.writeFileSync(
    path.join(contentFixture, "data", "deepdive-runtime", "alpha.js"),
    `window.DEEPDIVE=window.DEEPDIVE||{};window.DEEPDIVE.alpha=${JSON.stringify(contentPage)};\n`,
    "utf8",
  );
  fs.mkdirSync(path.join(contentFixture, "docs", "deepdive-reviews"), { recursive: true });
  fs.writeFileSync(
    path.join(contentFixture, "docs", "deepdive-reviews", "1x-section-text-review.md"),
    [
      "# 1.x 节点理解原理页：分章节纯文本审阅稿",
      "",
      "## 1.3 Alpha（alpha）",
      "",
      "### 1.3.1 第一章",
      "",
      "第一章正文。",
      "",
      "### 1.3.2 常见误区与学习路线",
      "",
      "不应发送。",
      "",
      "### 1.3.3 第二章",
      "",
      "第二章正文。",
      "",
      "### 1.3.4 检查你是否真的理解",
      "",
      "不应发送。",
      "",
    ].join("\n"),
    "utf8",
  );
  const extracted = contentGenerationSections(contentPage);
  assert.deepStrictEqual(extracted.map(section => section.skipped), [false, true, false, true]);
  const queued = enqueueContentGeneration(contentFixture, "alpha", "为新版流程生成逐章知识解析素材");
  assert.strictEqual(queued.nextState, "content-generation-queued");
  assert.deepStrictEqual(queued.eligibleSections.map(section => section.sectionNumber), [1, 3]);
  assert.deepStrictEqual(queued.skippedSections.map(section => section.sectionNumber), [2, 4]);
  const task = claimTask(contentFixture, "content-generator", "alpha");
  assert.strictEqual(task.task.role, "content-generation");
  assert.strictEqual(task.task.prompt, CONTENT_GENERATION_PROMPT);
  assert.match(task.task.prompt, /完整教学正文/);
  assert.match(task.task.prompt, /不得输出带反斜杠的 LaTeX 命令/);
  assert.strictEqual(Object.hasOwn(task.task, "page"), false);
  assert.deepStrictEqual(
    task.task.sectionDelivery.eligibleSections.map(section => section.sectionNumber),
    [1, 3],
  );
  const firstSection = readContentGenerationSection(contentFixture, {
    taskId: task.task.taskId,
    leaseToken: task.task.leaseToken,
    sectionNumber: 1,
  });
  assert.strictEqual(firstSection.prompt, CONTENT_GENERATION_PROMPT);
  assert.strictEqual(firstSection.section.text, "第一章正文。");
  assert.strictEqual(firstSection.nextSectionNumber, 3);
  assert.throws(() => readContentGenerationSection(contentFixture, {
    taskId: task.task.taskId,
    leaseToken: task.task.leaseToken,
    sectionNumber: 3,
  }), /必须按顺序读取/);
  assert.throws(() => readContentGenerationSection(contentFixture, {
    taskId: task.task.taskId,
    leaseToken: task.task.leaseToken,
    sectionNumber: 2,
  }), /禁止发送/);
  assert.throws(() => saveContentGenerationResponse(contentFixture, {
    taskId: task.task.taskId,
    leaseToken: task.task.leaseToken,
    sectionNumber: 1,
    title: "第一章",
    response: "????????????????",
  }), /连续问号/);
  assert.throws(() => saveContentGenerationResponse(contentFixture, {
    taskId: task.task.taskId,
    leaseToken: task.task.leaseToken,
    sectionNumber: 1,
    title: "第一章",
    response: "公式里出现\u000b非法转义",
  }), /非法控制字符/);
  const firstSaved = saveContentGenerationResponse(contentFixture, {
    taskId: task.task.taskId,
    leaseToken: task.task.leaseToken,
    sectionNumber: 1,
    title: "第一章",
    response: "第一章的原始解析回复。",
  });
  assert.strictEqual(firstSaved.status, "saved");
  assert.strictEqual(firstSaved.nextSectionNumber, 3);
  const secondSection = readContentGenerationSection(contentFixture, {
    taskId: task.task.taskId,
    leaseToken: task.task.leaseToken,
    sectionNumber: 3,
  });
  assert.strictEqual(secondSection.done, true);
  const secondSaved = saveContentGenerationResponse(contentFixture, {
    taskId: task.task.taskId,
    leaseToken: task.task.leaseToken,
    sectionNumber: 3,
    title: "第二章",
    response: "第二章的原始解析回复。",
  });
  assert.strictEqual(secondSaved.done, true);
  const completed = submitResult(contentFixture, {
    taskId: task.task.taskId,
    leaseToken: task.task.leaseToken,
    result: {
      pageId: "alpha",
      responses: [
        { sectionNumber: 1, title: "第一章", response: "第一章的原始解析回复。" },
        { sectionNumber: 3, title: "第二章", response: "第二章的原始解析回复。" },
      ],
      summary: "完成两章解析",
    },
  });
  assert.strictEqual(completed.status, "content-generated");
  assert.strictEqual(completed.nextState, "audit-queued");
  const responseDocument = fs.readFileSync(
    path.join(contentFixture, "docs", "deepdive-reviews", "alpha-agent-responses.md"),
    "utf8",
  );
  assert.match(responseDocument, /第一章的原始解析回复/);
  assert.match(responseDocument, /第二章的原始解析回复/);
  assert.doesNotMatch(responseDocument, /不应发送/);
  assert.strictEqual(loadState(contentFixture).pages.alpha.contentGeneration.status, "complete");
} finally {
  fs.rmSync(contentFixture, { recursive: true, force: true });
}

console.log("✓ Stage 2 content-generation：单页租约逐章读取，跳过误解/自测并原样保存回复");
