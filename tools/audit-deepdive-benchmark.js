/*
 * L3 神经网络级自动基准。
 *
 * 报告：node tools/audit-deepdive-benchmark.js
 * 严格：node tools/audit-deepdive-benchmark.js --require-benchmark neural-network
 * 增量：node tools/audit-deepdive-benchmark.js --changed --baseline docs/deepdive-l3-baseline.json
 * 基线模板：node tools/audit-deepdive-benchmark.js --write-baseline docs/deepdive-l3-baseline.json
 *
 * L3 只认证可自动验证的教学工程，不替代 L4 人工事实与教学效果审校。
 */
"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");

const root = process.env.DEEPDIVE_ROOT
  ? path.resolve(process.env.DEEPDIVE_ROOT)
  : path.join(__dirname, "..");
const benchmarkFile = path.join(root, "docs", "deepdive-l3-benchmark.json");
const benchmark = JSON.parse(fs.readFileSync(benchmarkFile, "utf8"));
const context = { window: {} };
vm.createContext(context);

const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const scripts = [...indexHtml.matchAll(/<script src="([^"]+\.js)"><\/script>/g)]
  .map((match) => match[1])
  .filter((src) => src.startsWith("data/deepdive/"));
scripts.forEach((src) => {
  const file = path.join(root, ...src.split("/"));
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
});
const pages = context.window.DEEPDIVE || {};

function count(source, pattern) {
  return (String(source || "").match(pattern) || []).length;
}

function text(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
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
    .map((match) => text(match[1]))
    .filter(Boolean);
}

function goalCount(html) {
  const block = blockWithClass(html, "dd-goals");
  const items = listItems(block);
  if (items.length) return items.length;
  const content = text(block).replace(/^.*?读完[^：:]*[：:]/, "");
  return content.split(/[；;]/).map((item) => item.trim()).filter(Boolean).length;
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

function sectionsOf(html) {
  return [...html.matchAll(/<section\b[^>]*class="[^"]*\bdd-sec\b[^"]*"[^>]*>([\s\S]*?)<\/section>/gi)]
    .map((match) => match[1]);
}

function domains(urls) {
  return new Set(urls.map((url) => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch (_) {
      return "";
    }
  }).filter(Boolean));
}

function inspect(id, page) {
  const html = page.html || "";
  const plain = text(html);
  const sections = sectionsOf(html);
  const goals = goalCount(html);
  const leads = count(html, /class="dd-lead"/g);
  const chainItems = listItems(blockWithClass(html, "dd-chain")).length
    || count(blockWithClass(html, "dd-chain"), /(?:→|⇒|->)/g) + 1;
  const figures = [...html.matchAll(/<figure\b[^>]*>([\s\S]*?)<\/figure>/gi)].map((match) => match[1]);
  const validFigures = figures.filter((figure) => (
    /<figcaption\b/i.test(figure)
    && /<svg\b[^>]*role="img"/i.test(figure)
    && (/<svg\b[^>]*aria-label="[^"]+"/i.test(figure) || /<title\b/i.test(figure))
  )).length;
  const validTables = [...html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)]
    .filter((match) => /<th\b/i.test(match[1]) && text(match[1]).length >= 40).length;
  const formulas = count(html, /class="dd-formula/g);
  const codeBlocks = count(html, /<pre\b/g);
  const artifactTypes = [
    validFigures > 0,
    validTables > 0,
    formulas > 0,
    codeBlocks > 0,
  ].filter(Boolean).length;
  const artifactCount = validFigures + validTables + formulas + (codeBlocks > 0 ? 1 : 0);

  const examplePattern = /手算|运行示例|完整示例|数值例子|案例推演|端到端示例|逐步演算|故障推演/;
  const exampleSection = sections.find((section) => (
    examplePattern.test(text(section))
    && text(section).length >= 180
    && (/<(?:figure|table|pre)\b/i.test(section) || /class="dd-formula|class="dd-steps"/i.test(section))
  ));

  const mechanismPatterns = {
    input: /输入|给定|接收|从.+出发|查询|样本|请求/,
    transformation: /变换|计算|更新|映射|训练|优化|处理|传播|检索|执行|去噪|加权|路由/,
    output: /输出|结果|得到|返回|产生|预测|生成|响应/,
    feedback: /反馈|验证|评测|损失|奖励|梯度|回归|监控|复测|更新/,
    boundary: /边界|限制|不适用|不能|失败|代价|风险|权衡|陷阱/,
  };
  const mechanismAspects = Object.fromEntries(
    Object.entries(mechanismPatterns).map(([key, pattern]) => [key, pattern.test(plain)]),
  );

  const quiz = blockWithClass(html, "dd-quiz");
  const answersBlock = blockWithClass(html, "dd-answers");
  const questions = listItems(quiz);
  const answers = listItems(answersBlock);
  const higherOrder = questions.filter((question) => /为什么|如何|怎样|解释|比较|计算|推导|设计|判断|诊断|定位/.test(question));
  const scenario = questions.filter((question) => /如果|假设|场景|发现|当.+时|给定|上线后|实验中/.test(question));
  const uniqueQuestions = new Set(questions.map((question) => question.replace(/\s+/g, ""))).size;

  const sourceBlock = blockWithClass(html, "dd-src");
  const sourceUrls = [...sourceBlock.matchAll(/<a href="(https:\/\/[^"]+)"/gi)].map((match) => match[1]);
  const annotatedSources = listItems(sourceBlock).filter((item) => item.length >= 20).length;
  const dateMatch = sourceBlock.match(/访问日期：(\d{4}-\d{2}-\d{2})/);

  const paragraphs = [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => text(match[1]))
    .filter((item) => item.length >= 40);
  const uniqueParagraphRatio = paragraphs.length
    ? new Set(paragraphs.map((item) => item.replace(/\s+/g, ""))).size / paragraphs.length
    : 0;

  const checks = {
    continuity: [
      ["continuity.length", plain.length >= 3200, 4],
      ["continuity.sections", sections.length >= 10, 4],
      ["continuity.goals", goals >= 4, 4],
      ["continuity.leads", sections.length > 0 && leads / sections.length >= 0.75, 4],
      ["continuity.chain", chainItems >= 4, 4],
    ],
    mechanism: [
      ...Object.entries(mechanismAspects).map(([key, ok]) => [`mechanism.${key}`, ok, 3]),
      ["mechanism.formal-types", artifactTypes >= 2, 5],
    ],
    teaching: [
      ["teaching.figure", validFigures >= 1, 5],
      ["teaching.artifacts", artifactCount >= 5, 5],
      ["teaching.worked-example", Boolean(exampleSection), 6],
      ["teaching.misconceptions", /常见误解|常见误区|误区与自测/.test(plain), 4],
    ],
    diagnostics: [
      ["diagnostics.verification", /验收|验证|评测|指标|如何知道|先检查|诊断|复测/.test(plain), 4],
      ["diagnostics.warning", count(html, /class="dd-note warn/g) >= 1, 3],
      ["diagnostics.sequence", /先.{0,40}(再|随后|然后|最后)|区分.{0,30}(再|与)|逐层|分开统计|切片/.test(plain), 4],
      ["diagnostics.boundary", mechanismAspects.boundary && /权衡|代价|限制|不能|风险/.test(plain), 4],
    ],
    assessment: [
      ["assessment.count", questions.length >= 5, 3],
      ["assessment.answers", questions.length > 0 && answers.length >= questions.length, 3],
      ["assessment.higher-order", higherOrder.length >= 3, 3],
      ["assessment.scenario", scenario.length >= 1 || higherOrder.length >= 5, 3],
      ["assessment.unique", questions.length > 0 && uniqueQuestions === questions.length, 3],
    ],
    sources: [
      ["sources.count", new Set(sourceUrls).size >= 3, 3],
      ["sources.domains", domains(sourceUrls).size >= 2 || new Set(sourceUrls).size >= 4, 2],
      ["sources.date", Boolean(dateMatch), 1],
      ["sources.route", /概念依赖|延伸学习|学习路线|下一步/.test(plain), 2],
      ["sources.annotation", annotatedSources >= 2, 2],
    ],
  };

  const floors = benchmark.dimensionFloors;
  const dimensions = {};
  const missingChecks = [];
  const gaps = [];
  const hardChecks = new Set([
    "continuity.goals",
    "continuity.leads",
    "continuity.chain",
    "mechanism.input",
    "mechanism.transformation",
    "mechanism.output",
    "mechanism.feedback",
    "mechanism.boundary",
    "teaching.worked-example",
    "teaching.misconceptions",
    "diagnostics.warning",
    "assessment.count",
    "assessment.answers",
    "assessment.higher-order",
    "assessment.scenario",
    "assessment.unique",
    "sources.count",
    "sources.date",
    "sources.route",
  ]);
  let total = 0;
  for (const [dimension, items] of Object.entries(checks)) {
    const score = items.reduce((sum, [, ok, points]) => sum + (ok ? points : 0), 0);
    dimensions[dimension] = score;
    total += score;
    items.filter(([, ok]) => !ok).forEach(([code]) => {
      missingChecks.push(code);
      if (hardChecks.has(code)) gaps.push(code);
    });
    if (score < floors[dimension]) gaps.push(`floor.${dimension}`);
  }
  if (total < benchmark.minimumScore) gaps.push("floor.total");
  if (uniqueParagraphRatio < 0.85) gaps.push("integrity.repeated-paragraphs");

  return {
    id,
    title: page.title || id,
    score: total,
    dimensions,
    gaps: [...new Set(gaps)],
    missingChecks,
    metrics: {
      length: plain.length,
      sections: sections.length,
      goals,
      leads,
      artifactCount,
      artifactTypes,
      questions: questions.length,
      higherOrder: higherOrder.length,
      scenario: scenario.length,
      sources: new Set(sourceUrls).size,
      uniqueParagraphRatio: Number(uniqueParagraphRatio.toFixed(3)),
    },
  };
}

function idsFromSource(source) {
  return [
    ...source.matchAll(/window\.DEEPDIVE\s*\[\s*["']([^"']+)["']\s*\]\s*=/g),
    ...source.matchAll(/register\s*\(\s*["']([^"']+)["']/g),
  ].map((match) => match[1]);
}

function changedIds() {
  const all = new Set(Object.keys(pages));
  const baseRef = process.env.DEEPDIVE_BASE_REF || process.env.GITHUB_BASE_REF || "";
  if (!baseRef && process.env.CI) return all;
  const resolvedBase = baseRef.startsWith("origin/") || /^[0-9a-f]{7,40}$/i.test(baseRef)
    ? baseRef
    : `origin/${baseRef}`;
  const args = baseRef
    ? ["-c", `safe.directory=${root.replace(/\\/g, "/")}`, "diff", "--name-only", "--diff-filter=ACMR", `${resolvedBase}...HEAD`]
    : ["-c", `safe.directory=${root.replace(/\\/g, "/")}`, "status", "--porcelain"];
  const git = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  if (git.status !== 0) return all;
  const changed = new Set();
  const globalFiles = new Set([
    "data/graph.js",
    "index.html",
    "data/deepdive/00-deepdive-factory.js",
    "data/deepdive/zz-deepdive-quality-completion.js",
    "tools/audit-deepdive-benchmark.js",
    "docs/deepdive-l3-benchmark.json",
  ]);
  for (const line of git.stdout.split(/\r?\n/).filter(Boolean)) {
    const rawPath = (baseRef ? line : line.slice(3).split(" -> ").pop()).replace(/\\/g, "/");
    if (globalFiles.has(rawPath)) return all;
    if (!rawPath.startsWith("data/deepdive/") || !rawPath.endsWith(".js")) continue;
    const file = path.join(root, ...rawPath.split("/"));
    if (fs.existsSync(file)) idsFromSource(fs.readFileSync(file, "utf8")).forEach((id) => changed.add(id));
  }
  return changed;
}

function loadBaseline(filename) {
  if (!filename) return {};
  const data = JSON.parse(fs.readFileSync(path.resolve(root, filename), "utf8"));
  if (data.referencePageHash !== benchmark.reference.pageHash) {
    throw new Error("L3 债务基线绑定的参照页哈希已过期");
  }
  return data.allowedGaps || {};
}

const reference = pages[benchmark.reference.id];
if (!reference) {
  console.error(`✗ L3 参照页不存在：${benchmark.reference.id}`);
  process.exit(1);
}
const actualReferenceHash = pageHash(reference);
if (actualReferenceHash !== benchmark.reference.pageHash) {
  console.error(`✗ L3 参照页哈希漂移：期望 ${benchmark.reference.pageHash}，当前 ${actualReferenceHash}`);
  console.error("  必须先审查参照页变化，再显式更新 docs/deepdive-l3-benchmark.json。");
  process.exit(1);
}

const results = Object.entries(pages).map(([id, page]) => inspect(id, page))
  .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
const passed = results.filter((item) => item.gaps.length === 0);
const failed = results.filter((item) => item.gaps.length > 0);
const writeBaselineAt = process.argv.indexOf("--write-baseline");
if (writeBaselineAt >= 0) {
  const requested = process.argv[writeBaselineAt + 1];
  if (!requested) throw new Error("--write-baseline 需要仓库内相对路径");
  const output = path.resolve(root, requested);
  const relative = path.relative(root, output);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("--write-baseline 只能写入仓库内部");
  }
  const allowedGaps = Object.fromEntries(
    failed.sort((a, b) => a.id.localeCompare(b.id)).map((item) => [item.id, item.gaps]),
  );
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify({
    schemaVersion: 1,
    description: "L3 启用时的历史自动质量债务；新页面必须零缺口，已有页面不得新增缺口。",
    referencePageHash: benchmark.reference.pageHash,
    allowedGaps,
  }, null, 2));
  console.log(`✓ 已写入 L3 历史债务基线 ${relative.replace(/\\/g, "/")}（${failed.length} 页）`);
  process.exit(0);
}
const requireAt = process.argv.indexOf("--require-benchmark");
const requireId = requireAt >= 0 ? process.argv[requireAt + 1] : "";
const changedOnly = process.argv.includes("--changed");
const baselineAt = process.argv.indexOf("--baseline");
const baselineFile = baselineAt >= 0 ? process.argv[baselineAt + 1] : "";
const summaryOnly = process.argv.includes("--summary");
const explainAt = process.argv.indexOf("--explain");
const explainId = explainAt >= 0 ? process.argv[explainAt + 1] : "";
const enforcementFailures = [];

if (requireId) {
  const item = results.find((result) => result.id === requireId);
  if (!item) enforcementFailures.push(`${requireId}: 页面不存在`);
  else item.gaps.forEach((gap) => enforcementFailures.push(`${requireId}: ${gap}`));
} else if (changedOnly) {
  const changed = changedIds();
  const allowed = loadBaseline(baselineFile);
  results.filter((item) => changed.has(item.id)).forEach((item) => {
    const old = new Set(allowed[item.id] || []);
    item.gaps.filter((gap) => !old.has(gap))
      .forEach((gap) => enforcementFailures.push(`${item.id}: 新增 L3 缺口：${gap}`));
  });
}

console.log(`L3 神经网络级自动基准 · 页面 ${results.length} · 通过 ${passed.length} · 待提升 ${failed.length}`);
console.log(`参照 ${benchmark.reference.id} · 最低总分 ${benchmark.minimumScore} · 分维度不可补偿`);
if (explainId) {
  const item = results.find((result) => result.id === explainId);
  if (!item) {
    console.error(`\n✗ 找不到页面：${explainId}`);
    process.exit(1);
  }
  console.log(`\n单页解释：${item.id} · ${item.score}/100`);
  console.log(`  维度：${Object.entries(item.dimensions).map(([key, value]) => `${key}=${value}`).join("；")}`);
  console.log(`  指标：${Object.entries(item.metrics).map(([key, value]) => `${key}=${value}`).join("；")}`);
  console.log(`  未得分项：${item.missingChecks.length ? item.missingChecks.join("；") : "无"}`);
  console.log(`  阻断项：${item.gaps.length ? item.gaps.join("；") : "无"}`);
  process.exit(0);
}
if (!summaryOnly) {
  console.log("\nL3 通过：");
  passed.forEach((item) => console.log(`  ✓ ${item.id} · ${item.score}/100`));
}
if (failed.length && !summaryOnly) {
  console.log("\nL3 待提升：");
  failed.forEach((item) => console.log(`  - ${item.id} · ${item.score}/100 · ${item.gaps.join("；")}`));
} else if (failed.length) {
  const frequencies = new Map();
  failed.forEach((item) => item.gaps.forEach((gap) => frequencies.set(gap, (frequencies.get(gap) || 0) + 1)));
  const common = [...frequencies.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  console.log(`主要历史缺口：${common.map(([gap, total]) => `${gap}(${total})`).join("；")}`);
}
if (enforcementFailures.length) {
  console.error(`\n✗ L3 合并阻断发现 ${enforcementFailures.length} 个问题：`);
  enforcementFailures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}
if (requireId) console.log(`\n✓ ${requireId} 达到 L3 神经网络级自动基准`);
if (changedOnly) console.log("\n✓ 变更页面没有超出 L3 已知基线的新缺口");
