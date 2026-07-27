/*
 * L4 人工内容审校记录校验。
 *
 * 报告：node tools/review-deepdive-quality.js
 * 模板：node tools/review-deepdive-quality.js --template reasoning-models
 * 阻断：node tools/review-deepdive-quality.js --require-current reasoning-models
 */
"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { loadDeepDivePages } = require("./deepdive-loader");

const root = process.env.DEEPDIVE_ROOT
  ? path.resolve(process.env.DEEPDIVE_ROOT)
  : path.join(__dirname, "..");
const reviewFile = path.join(root, "docs", "deepdive-quality-reviews.json");
const pages = loadDeepDivePages(root);
const reviewData = JSON.parse(fs.readFileSync(reviewFile, "utf8"));
const reviews = reviewData.reviews || {};
const dimensions = {
  accuracy: 25,
  alignment: 20,
  depth: 20,
  examples: 15,
  assessment: 10,
  sources: 10,
};
const minimums = {
  accuracy: 22,
  alignment: 17,
  depth: 17,
  examples: 12,
  assessment: 8,
  sources: 8,
};
const artifactTypes = new Set(["reproduction-log", "browser-report", "calculation", "review-notes"]);
const sourceAuthorities = new Set(["primary", "official", "standard", "peer-reviewed"]);
const reproductionMethods = new Set(["calculation", "execution", "walkthrough", "browser"]);
const mechanismAspects = new Set(["input", "transformation", "output", "feedback", "boundary"]);

function canonicalText(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function blockWithClass(html, className) {
  const classAt = html.indexOf(`class="${className}"`);
  if (classAt < 0) return "";
  const openAt = html.lastIndexOf("<", classAt);
  const tag = (html.slice(openAt).match(/^<([\w-]+)/) || [])[1];
  if (!tag) return "";
  const pattern = new RegExp(`<\\/?${tag}\\b[^>]*>`, "gi");
  pattern.lastIndex = openAt;
  let depth = 0;
  let token;
  while ((token = pattern.exec(html))) {
    if (token[0].startsWith("</")) depth -= 1;
    else if (!token[0].endsWith("/>")) depth += 1;
    if (depth === 0) return html.slice(openAt, pattern.lastIndex);
  }
  return "";
}

function listItems(html) {
  return [...String(html || "").matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((match) => canonicalText(match[1]))
    .filter(Boolean);
}

function pageFacts(page) {
  const html = page.html || "";
  const goalBlock = blockWithClass(html, "dd-goals");
  const goalItems = listItems(goalBlock);
  const goalText = canonicalText(goalBlock).replace(/^.*?读完[^：:]*[：:]/, "");
  const goals = goalItems.length
    ? goalItems
    : goalText.split(/[；;]/).map((item) => item.trim()).filter(Boolean);
  return {
    text: canonicalText(`${page.title || ""} ${page.subtitle || ""} ${page.thesis || ""} ${html}`),
    goals,
    headings: [...html.matchAll(/<h[2-6]\b[^>]*>([\s\S]*?)<\/h[2-6]>/gi)]
      .map((match) => canonicalText(match[1])),
    questions: listItems(blockWithClass(html, "dd-quiz")),
    answers: listItems(blockWithClass(html, "dd-answers")),
    sources: [...blockWithClass(html, "dd-src").matchAll(/<a href="(https:\/\/[^"]+)"/gi)]
      .map((match) => match[1]),
  };
}

function pageHash(page) {
  const canonical = JSON.stringify({
    title: page.title || "",
    subtitle: page.subtitle || "",
    thesis: page.thesis || "",
    html: page.html || "",
  });
  return `sha256:${crypto.createHash("sha256").update(canonical).digest("hex")}`;
}

function template(id) {
  if (!pages[id]) throw new Error(`未知页面：${id}`);
  return {
    pageHash: pageHash(pages[id]),
    reviewedAt: new Date().toISOString().slice(0, 10),
    validUntil: "",
    commit: "",
    reviewers: [
      { name: "", role: "content-reviewer", independent: false },
      { name: "", role: "independent-reviewer", independent: true },
    ],
    decision: "needs-work",
    scores: Object.fromEntries(Object.keys(dimensions).map((key) => [key, 0])),
    evidence: {
      accuracy: { summary: "", claims: [] },
      alignment: { summary: "", objectiveMappings: [] },
      depth: { summary: "", mechanismChecks: [] },
      examples: { summary: "", reproductions: [], misconceptionChecks: [] },
      assessment: { summary: "", questionMappings: [] },
      sources: { summary: "", sourceReviews: [], maintenanceBoundary: "" },
    },
    artifacts: [],
    essentialChecks: {
      noCriticalFactualError: false,
      criticalClaimsSupported: false,
      objectivesAssessed: false,
      workedExampleReproduced: false,
      responsiveAndAccessible: false,
    },
    blockers: [],
    notes: "",
  };
}

function specific(value, minimum = 20) {
  const text = canonicalText(value);
  if (text.length < minimum) return false;
  return !/^(已|已经)?(检查|核对|确认|验证|完成|通过)(无误|正确|完成|通过)?[。.!！]?$/.test(text);
}

function actualExcerpt(excerpt, facts, minimum = 8) {
  const text = canonicalText(excerpt);
  return text.length >= minimum && facts.text.includes(text);
}

function actualItem(excerpt, items, minimum = 4) {
  const text = canonicalText(excerpt);
  return text.length >= minimum && items.some((item) => item.includes(text) || text.includes(item));
}

function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))
    && !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime());
}

function validateArtifacts(pageId, review, issues) {
  const artifacts = Array.isArray(review.artifacts) ? review.artifacts : [];
  const byId = new Map();
  for (const artifact of artifacts) {
    const artifactId = canonicalText(artifact && artifact.id);
    if (!artifactId || byId.has(artifactId)) {
      issues.push("artifact id 缺失或重复");
      continue;
    }
    byId.set(artifactId, artifact);
    if (!artifactTypes.has(artifact.type)) issues.push(`artifact ${artifactId} 类型无效`);
    const relativePath = String(artifact.path || "").replace(/\\/g, "/");
    if (!relativePath || path.isAbsolute(relativePath)) {
      issues.push(`artifact ${artifactId} 必须使用仓库内相对路径`);
      continue;
    }
    const resolved = path.resolve(root, relativePath);
    const relative = path.relative(root, resolved);
    if (relative.startsWith("..") || path.isAbsolute(relative) || !fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
      issues.push(`artifact ${artifactId} 文件不存在或越出仓库：${relativePath}`);
      continue;
    }
    const actual = `sha256:${crypto.createHash("sha256").update(fs.readFileSync(resolved)).digest("hex")}`;
    if (artifact.sha256 !== actual) issues.push(`artifact ${artifactId} 哈希不匹配`);
    if (!specific(artifact.description, 16)) issues.push(`artifact ${artifactId} 缺具体说明`);
    if (artifact.type === "browser-report") {
      try {
        const report = JSON.parse(fs.readFileSync(resolved, "utf8"));
        if (report.schemaVersion !== 1 || report.tool !== "audit-deepdive-browser" || report.passed !== true) {
          issues.push(`artifact ${artifactId} 不是通过的浏览器审计报告`);
        } else if (!report.pages || !report.pages[pageId]
          || report.pages[pageId].pageHash !== pageHash(pages[pageId])) {
          issues.push(`artifact ${artifactId} 未绑定当前页面哈希`);
        }
        const viewportNames = new Set((report.viewports || []).map((viewport) => viewport && viewport.name));
        if (!viewportNames.has("desktop") || !viewportNames.has("mobile")) {
          issues.push(`artifact ${artifactId} 未覆盖 desktop 和 mobile`);
        }
      } catch (_) {
        issues.push(`artifact ${artifactId} 不是合法 JSON 浏览器报告`);
      }
    }
  }
  return byId;
}

function validateEvidence(id, review, issues) {
  const facts = pageFacts(pages[id]);
  const evidence = review.evidence;
  if (!evidence || typeof evidence !== "object" || Array.isArray(evidence)) {
    issues.push("evidence 必须使用 L4 v2 结构化对象");
    return;
  }
  for (const key of Object.keys(dimensions)) {
    if (!evidence[key] || typeof evidence[key] !== "object" || !specific(evidence[key].summary, 30)) {
      issues.push(`${key} 缺至少 30 字的具体审校摘要`);
    }
  }

  const artifacts = validateArtifacts(id, review, issues);

  const claims = Array.isArray(evidence.accuracy && evidence.accuracy.claims)
    ? evidence.accuracy.claims : [];
  if (claims.length < 2) issues.push("accuracy 至少需要 2 条关键断言证据");
  const claimSources = new Set();
  claims.forEach((claim, index) => {
    const label = `accuracy.claims[${index}]`;
    if (!actualExcerpt(claim.pageExcerpt, facts, 10)) issues.push(`${label}.pageExcerpt 未在当前页面出现`);
    if (!facts.sources.includes(claim.sourceUrl)) issues.push(`${label}.sourceUrl 不在当前页面来源中`);
    else claimSources.add(claim.sourceUrl);
    if (!specific(claim.locator, 8)) issues.push(`${label}.locator 不具体`);
    if (!specific(claim.verification, 20)) issues.push(`${label}.verification 不具体`);
  });
  if (claimSources.size < 2) issues.push("accuracy 关键断言必须使用至少 2 个页面内独立来源");

  const objectiveMappings = Array.isArray(evidence.alignment && evidence.alignment.objectiveMappings)
    ? evidence.alignment.objectiveMappings : [];
  if (objectiveMappings.length < Math.min(3, facts.goals.length)) issues.push("alignment 未覆盖至少 3 个学习目标");
  objectiveMappings.forEach((mapping, index) => {
    const label = `alignment.objectiveMappings[${index}]`;
    if (!actualItem(mapping.objectiveExcerpt, facts.goals)) issues.push(`${label}.objectiveExcerpt 不属于页面学习目标`);
    if (!actualItem(mapping.sectionHeading, facts.headings)) issues.push(`${label}.sectionHeading 不属于页面标题`);
    if (!actualItem(mapping.questionExcerpt, facts.questions)) issues.push(`${label}.questionExcerpt 不属于页面自测`);
    if (!specific(mapping.rationale, 16)) issues.push(`${label}.rationale 不具体`);
  });

  const mechanismChecks = Array.isArray(evidence.depth && evidence.depth.mechanismChecks)
    ? evidence.depth.mechanismChecks : [];
  const aspects = new Set();
  mechanismChecks.forEach((check, index) => {
    const label = `depth.mechanismChecks[${index}]`;
    if (!mechanismAspects.has(check.aspect)) issues.push(`${label}.aspect 无效`);
    else aspects.add(check.aspect);
    if (!actualExcerpt(check.pageExcerpt, facts, 10)) issues.push(`${label}.pageExcerpt 未在当前页面出现`);
    if (!specific(check.assessment, 20)) issues.push(`${label}.assessment 不具体`);
  });
  ["input", "transformation", "output", "boundary"].forEach((aspect) => {
    if (!aspects.has(aspect)) issues.push(`depth 缺 ${aspect} 机制检查`);
  });

  const reproductions = Array.isArray(evidence.examples && evidence.examples.reproductions)
    ? evidence.examples.reproductions : [];
  if (!reproductions.length) issues.push("examples 至少需要 1 个独立复现记录");
  reproductions.forEach((item, index) => {
    const label = `examples.reproductions[${index}]`;
    if (!actualExcerpt(item.pageExcerpt, facts, 10)) issues.push(`${label}.pageExcerpt 未在当前页面出现`);
    if (!reproductionMethods.has(item.method)) issues.push(`${label}.method 无效`);
    ["input", "expected", "observed"].forEach((key) => {
      if (!specific(item[key], 12)) issues.push(`${label}.${key} 不具体`);
    });
    const artifact = artifacts.get(item.artifactId);
    if (!artifact || !["reproduction-log", "calculation"].includes(artifact.type)) {
      issues.push(`${label}.artifactId 未引用复现类 artifact`);
    }
  });
  const misconceptionChecks = Array.isArray(evidence.examples && evidence.examples.misconceptionChecks)
    ? evidence.examples.misconceptionChecks : [];
  if (!misconceptionChecks.length) issues.push("examples 至少需要 1 条误区消歧证据");
  misconceptionChecks.forEach((item, index) => {
    const label = `examples.misconceptionChecks[${index}]`;
    if (!actualExcerpt(item.misconceptionExcerpt, facts, 6)) issues.push(`${label}.misconceptionExcerpt 未在页面出现`);
    if (!actualExcerpt(item.correctionExcerpt, facts, 6)) issues.push(`${label}.correctionExcerpt 未在页面出现`);
    if (!specific(item.rationale, 16)) issues.push(`${label}.rationale 不具体`);
  });

  const questionMappings = Array.isArray(evidence.assessment && evidence.assessment.questionMappings)
    ? evidence.assessment.questionMappings : [];
  if (questionMappings.length < Math.min(3, facts.questions.length)) issues.push("assessment 未复核至少 3 道自测题");
  questionMappings.forEach((mapping, index) => {
    const label = `assessment.questionMappings[${index}]`;
    if (!actualItem(mapping.questionExcerpt, facts.questions)) issues.push(`${label}.questionExcerpt 不属于页面自测`);
    if (!actualItem(mapping.answerExcerpt, facts.answers)) issues.push(`${label}.answerExcerpt 不属于页面答案`);
    if (!actualItem(mapping.objectiveExcerpt, facts.goals)) issues.push(`${label}.objectiveExcerpt 不属于页面目标`);
    if (!specific(mapping.diagnosticValue, 16)) issues.push(`${label}.diagnosticValue 不具体`);
  });

  const sourceReviews = Array.isArray(evidence.sources && evidence.sources.sourceReviews)
    ? evidence.sources.sourceReviews : [];
  const reviewedSources = new Set();
  sourceReviews.forEach((item, index) => {
    const label = `sources.sourceReviews[${index}]`;
    if (!facts.sources.includes(item.url)) issues.push(`${label}.url 不在页面来源中`);
    else reviewedSources.add(item.url);
    if (!sourceAuthorities.has(item.authority)) issues.push(`${label}.authority 无效`);
    if (!actualExcerpt(item.supportsExcerpt, facts, 10)) issues.push(`${label}.supportsExcerpt 未在页面出现`);
    if (!specific(item.locator, 8)) issues.push(`${label}.locator 不具体`);
    if (!validDate(item.checkedAt)) issues.push(`${label}.checkedAt 无效`);
    else {
      const today = new Date();
      today.setUTCHours(23, 59, 59, 999);
      if (new Date(`${item.checkedAt}T00:00:00Z`) > today) issues.push(`${label}.checkedAt 晚于当前日期`);
    }
  });
  if (reviewedSources.size < 2) issues.push("sources 至少需要复核 2 个页面内独立来源");
  if (!specific(evidence.sources && evidence.sources.maintenanceBoundary, 20)) {
    issues.push("sources.maintenanceBoundary 不具体");
  }

  const browserArtifacts = [...artifacts.values()].filter((artifact) => artifact.type === "browser-report");
  if (!browserArtifacts.length) issues.push("缺 browser-report artifact");
}

function validateReview(id, review) {
  const issues = [];
  if (!pages[id]) return ["页面不存在"];
  if (!review) return ["没有审校记录"];
  if (reviewData.schemaVersion !== 3) issues.push("L4 审校文件 schemaVersion 必须为 3");
  if (reviewData.certificationLevel !== "L4") issues.push('审校文件 certificationLevel 必须为 "L4"');
  if (review.pageHash !== pageHash(pages[id])) issues.push("内容哈希已过期");
  if (!validDate(review.reviewedAt)) issues.push("缺合法 reviewedAt");
  if (!validDate(review.validUntil)) {
    issues.push("缺合法 validUntil");
  } else if (new Date(`${review.validUntil}T23:59:59Z`) < new Date()) {
    issues.push(`认证已于 ${review.validUntil} 过期`);
  }
  if (validDate(review.reviewedAt) && validDate(review.validUntil)) {
    const reviewedAt = new Date(`${review.reviewedAt}T00:00:00Z`);
    const validUntil = new Date(`${review.validUntil}T00:00:00Z`);
    const today = new Date();
    today.setUTCHours(23, 59, 59, 999);
    if (reviewedAt > today) issues.push("reviewedAt 晚于当前日期");
    if (validUntil < reviewedAt) issues.push("validUntil 早于 reviewedAt");
    if ((validUntil - reviewedAt) / 86400000 > 365) issues.push("认证有效期不得超过 365 天");
  }
  if (!review.commit || !/^[0-9a-f]{7,40}$/i.test(review.commit)) issues.push("缺合法对应提交哈希");

  const reviewers = Array.isArray(review.reviewers) ? review.reviewers : [];
  const reviewerNames = new Set();
  if (reviewers.length < 2) issues.push("L4 认证至少需要 2 名审校人");
  reviewers.forEach((reviewer, index) => {
    if (!reviewer || !specific(reviewer.name, 2) || !specific(reviewer.role, 4)
      || typeof reviewer.independent !== "boolean") {
      issues.push(`reviewers[${index}] 信息不完整`);
    } else {
      reviewerNames.add(canonicalText(reviewer.name));
    }
  });
  if (reviewerNames.size !== reviewers.length) issues.push("审校人姓名不得重复");
  if (!reviewers.some((reviewer) => reviewer && reviewer.independent === true)) {
    issues.push("至少需要 1 名独立审校人");
  }
  if (review.decision !== "certified") issues.push("decision 不是 certified");

  let total = 0;
  for (const [key, max] of Object.entries(dimensions)) {
    const value = review.scores && review.scores[key];
    if (!Number.isFinite(value) || value < 0 || value > max) {
      issues.push(`${key} 分数无效`);
    } else {
      total += value;
      if (value < minimums[key]) issues.push(`${key} 未达维度最低分 ${minimums[key]}`);
    }
  }
  if (total < 88) issues.push(`总分不足 88（当前 ${total}）`);

  validateEvidence(id, review, issues);

  const checks = review.essentialChecks || {};
  Object.keys(template(id).essentialChecks).forEach((key) => {
    if (checks[key] !== true) issues.push(`关键项未通过：${key}`);
  });
  const openBlockers = Array.isArray(review.blockers)
    ? review.blockers.filter((item) => item && item.status !== "resolved")
    : [];
  if (openBlockers.length) issues.push(`仍有 ${openBlockers.length} 个未解决 blocker`);
  return issues;
}

const templateAt = process.argv.indexOf("--template");
if (templateAt >= 0) {
  const id = process.argv[templateAt + 1];
  console.log(JSON.stringify({
    schemaVersion: 3,
    certificationLevel: "L4",
    reviews: { [id]: template(id) },
  }, null, 2));
  process.exit(0);
}

const requireAt = process.argv.indexOf("--require-current");
if (requireAt >= 0) {
  const id = process.argv[requireAt + 1];
  const issues = validateReview(id, reviews[id]);
  if (issues.length) {
    console.error(`✗ ${id} 未获得当前 L4 人工标杆认证：`);
    issues.forEach((issue) => console.error(`  - ${issue}`));
    process.exit(1);
  }
  console.log(`✓ ${id} 的 L4 人工标杆认证、结构化证据与当前内容哈希一致`);
  process.exit(0);
}

let current = 0;
let stale = 0;
let missing = 0;
for (const id of Object.keys(pages)) {
  const issues = validateReview(id, reviews[id]);
  if (!reviews[id]) missing += 1;
  else if (issues.length) stale += 1;
  else current += 1;
}
console.log(`L4 人工认证状态 · 当前有效 ${current} · 过期/不完整 ${stale} · 尚未记录 ${missing}`);
console.log("提示：认证必须包含页面内交叉引用、可复现 artifact、来源复核和至少一名独立审校人。");
