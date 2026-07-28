/* 分层门禁回归与故障夹具 —— node tools/test-deepdive-quality.js */
"use strict";

const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.join(__dirname, "..");
const today = new Date().toISOString().slice(0, 10);
const validUntil = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

function run(script, args = [], fixtureRoot = root) {
  return spawnSync(process.execPath, [path.join(root, "tools", script), ...args], {
    cwd: fixtureRoot,
    encoding: "utf8",
    env: { ...process.env, DEEPDIVE_ROOT: fixtureRoot },
  });
}

function output(result) {
  return `${result.stdout || ""}\n${result.stderr || ""}`;
}

function basePage(overrides = {}) {
  const questions = overrides.questions || 3;
  const answers = overrides.answers === undefined ? questions : overrides.answers;
  const sources = overrides.sources || [
    "https://example.com/source-a",
    "https://example.org/source-b",
  ];
  const accessDate = overrides.accessDate || today;
  const sectionHtml = Array.from({ length: 7 }, (_, index) => (
    `<section class="dd-sec"><h2>${index + 1}. 小节</h2>`
    + (index === 0 ? '<ol class="dd-chain"><li>输入</li><li>处理</li><li>输出</li></ol>' : "")
    + `<p>用于验证发布门禁的完整正文 ${index + 1}。</p>`
    + (index === 5 ? "<p>常见误解：章节越多质量一定越高。正确理解：结构只能作为人工审校入口。</p>" : "")
    + "</section>"
  )).join("");
  return {
    title: overrides.title || "故障夹具页",
    subtitle: "用于门禁回归测试",
    thesis: "这个页面只用于验证门禁是否能拒绝已知坏样例。",
    html: `
      <div class="dd-goals"><b>读完你应该能：</b><span>解释输入；检查过程；判断输出</span></div>
      ${sectionHtml}
      <ol class="dd-quiz">${Array.from({ length: questions }, (_, i) => `<li>问题 ${i + 1}</li>`).join("")}</ol>
      <details class="dd-answers"><summary>参考答案</summary><ol>${Array.from({ length: answers }, (_, i) => `<li>答案 ${i + 1}</li>`).join("")}</ol></details>
      <div class="dd-src"><b>资料来源</b><ul>${sources.map((url, i) => `<li><a href="${url}">来源 ${i + 1}</a></li>`).join("")}</ul><div>访问日期：${accessDate}</div></div>
    `,
  };
}

function l2Page(withVerification = true) {
  const longText = "候选页必须用清晰因果关系解释机制、边界和失败模式，并给出读者可以复现的具体步骤。".repeat(90);
  const sections = Array.from({ length: 9 }, (_, index) => `
    <section class="dd-sec">
      <h2>${index + 1}. 候选小节</h2>
      <p class="dd-lead">这一节要回答什么关键问题？</p>
      ${index === 0 ? '<ol class="dd-chain"><li>输入</li><li>变换</li><li>输出</li></ol><figure><svg role="img" aria-label="流程图"></svg><figcaption>流程</figcaption></figure><div class="dd-table-wrap"><table><thead><tr><th>项</th></tr></thead><tbody><tr><td>值</td></tr></tbody></table></div><div class="dd-formula">y=f(x)</div>' : ""}
      ${index === 1 ? '<div class="dd-note warn">困惑消歧：不要混淆输入和输出。</div>' : ""}
      ${index === 2 ? '<p>运行示例：按步骤代入一个数值例子。</p>' : ""}
      ${index === 3 && withVerification ? '<p>实践验证：使用独立评测指标诊断失败。</p>' : ""}
      ${index === 7 ? '<h3>常见误解</h3><p>形式相同不代表语义正确。</p>' : ""}
      ${index === 8 ? '<h3>概念依赖与延伸学习路线</h3><p>先修概念，再进入工程实践。</p>' : ""}
      <p>${longText}</p>
    </section>
  `).join("");
  return {
    title: "L2 候选夹具",
    subtitle: "结构候选",
    thesis: "具备进入人工审校所需的全部可观察教学部件。",
    html: `
      <div class="dd-goals"><b>读完你应该能：</b>解释机制；复现示例；识别边界；规划延伸</div>
      ${sections}
      <ol class="dd-quiz"><li>问题 1</li><li>问题 2</li><li>问题 3</li><li>问题 4</li></ol>
      <details class="dd-answers"><summary>答案</summary><ol><li>答案 1</li><li>答案 2</li><li>答案 3</li><li>答案 4</li></ol></details>
      <div class="dd-src"><ul>
        <li><a href="https://example.com/a">A</a></li>
        <li><a href="https://example.org/b">B</a></li>
        <li><a href="https://example.net/c">C</a></li>
      </ul><div>访问日期：${today}</div></div>
    `,
  };
}

function weakSixQuestionPage() {
  const page = l2Page(true);
  let sectionIndex = 0;
  page.html = page.html.replace(
    /<section class="dd-sec">([\s\S]*?)<\/section>/g,
    (whole, body) => {
      sectionIndex += 1;
      if (sectionIndex === 1) {
        return `<section class="dd-sec" data-section-role="core">
          <h2>1. 训练与验证曲线怎样暴露停止点</h2>
          <p class="dd-lead">为什么过拟合通常是一个逐渐扩大的过程？</p>
          <figure><svg role="img" aria-label="训练损失和验证损失曲线"></svg><figcaption>早停选择验证最优附近的检查点，而不是训练损失最低的最后一步。</figcaption></figure>
          <p>如果训练与验证一起高且不降，更像欠拟合；验证先改善再持续恶化，才是经典的训练时过拟合轨迹。</p>
          <p>实际曲线有噪声，应使用耐心窗口和多个随机种子验证。</p>
        </section>`;
      }
      if (sectionIndex === 2) {
        return `<section class="dd-sec" data-section-role="reference" data-worked-example="true">
          <h2>2. 运行示例：回归夹具</h2>
          <p data-example-part="setup">任务设置给定同一训练集和独立验证集，并固定随机种子与训练预算。</p>
          <p data-example-part="rule">比较规则只改变停止步数，其余模型、数据和评测方式保持一致。</p>
          <p data-example-part="steps">执行步骤依次训练、记录两条损失曲线，再选择验证损失最低附近的检查点。</p>
          <p data-example-part="interpretation">结果解释要求把验证恶化视为诊断信号，而不是把训练损失最低当成成功。</p>
        </section>`;
      }
      return `<section class="dd-sec" data-section-role="reference">${body}</section>`;
    },
  );
  page.quality = {
    contractVersion: 2,
    examples: [{
      section: 2,
      evidence: {
        setup: "任务设置给定同一训练集和独立验证集",
        rule: "比较规则只改变停止步数",
        steps: "执行步骤依次训练",
        interpretation: "结果解释要求把验证恶化视为诊断信号",
      },
    }],
    formulas: [],
    sectionContracts: [{
      section: 1,
      definition: {
        answer: "训练与验证曲线展示拟合进程，并用验证最优附近作为候选停止点。",
        evidence: "早停选择验证最优附近的检查点",
      },
      problem: {
        answer: "它识别过拟合从验证改善转为持续恶化的渐进过程。",
        evidence: "一个逐渐扩大的过程",
      },
      inputOutput: {
        answer: "输入各训练步的训练与验证损失，输出停止点和故障模式线索。",
        evidence: "训练损失和验证损失曲线",
      },
      mechanism: {
        answer: "持续训练降低训练损失，同时监视独立验证何时不再改善。",
        evidence: "选择验证最优附近的检查点",
      },
      interpretation: {
        answer: "验证先改善再恶化是经典过拟合轨迹，两边都高则应检查欠拟合。",
        evidence: "验证先改善再持续恶化",
      },
      boundary: {
        answer: "曲线有随机噪声，早停应使用耐心窗口并通过多个随机种子复核。",
        evidence: "实际曲线有噪声",
      },
    }],
  };
  return page;
}

function strongSixQuestionPage() {
  const page = weakSixQuestionPage();
  let longParagraphIndex = 0;
  page.html = page.html.replace(
    /<p>([^<]{500,})<\/p>/g,
    (_, body) => `<p>${body}本段验证编号 ${++longParagraphIndex}。</p>`,
  );
  page.html = page.html.replace(
    /<section class="dd-sec" data-section-role="core">[\s\S]*?<\/section>/,
    `<section class="dd-sec" data-section-role="core">
      <h2>1. 训练与验证曲线怎样暴露停止点</h2>
      <p class="dd-lead">本章说明两条损失曲线怎样帮助选择停止训练的时间。</p>
      <p>训练—验证曲线是按训练步数同时记录训练集损失与独立验证集损失的诊断图。</p>
      <p>它用于识别模型何时开始只改善已见样本，却不再改善未知样本上的表现。</p>
      <p>输入是每个训练步对应的训练损失和验证损失；输出是候选停止点以及欠拟合、过拟合或数据问题的诊断线索。</p>
      <p>工作时先在每个训练步保存两类损失，再比较验证损失是否继续下降，然后在验证最优附近保留候选检查点。</p>
      <p>如果训练损失继续下降而验证损失持续上升，说明泛化正在恶化；如果两者都高，则更像欠拟合或优化问题。</p>
      <p>但曲线只有在验证集保持独立且代表部署数据时才可靠；随机噪声会移动最低点，不能把单次最低值当成精确答案。</p>
    </section>`,
  );
  page.quality.sectionContracts[0] = {
    section: 1,
    definition: {
      answer: "训练—验证曲线是按训练步数记录训练集损失和独立验证集损失的诊断图。",
      evidence: "训练—验证曲线是按训练步数同时记录训练集损失与独立验证集损失的诊断图",
    },
    problem: {
      answer: "它用于识别模型何时只改善已见样本而不再改善未知样本表现。",
      evidence: "它用于识别模型何时开始只改善已见样本",
    },
    inputOutput: {
      answer: "输入是逐步记录的两类损失，输出是停止点及相关故障诊断线索。",
      evidence: "输入是每个训练步对应的训练损失和验证损失；输出是候选停止点",
    },
    mechanism: {
      answer: "它先记录两类损失，再比较验证趋势，然后保存验证最优附近的检查点。",
      evidence: "工作时先在每个训练步保存两类损失，再比较验证损失是否继续下降，然后",
    },
    interpretation: {
      answer: "训练下降而验证上升说明泛化恶化，两者都高则更像欠拟合或优化问题。",
      evidence: "如果训练损失继续下降而验证损失持续上升，说明泛化正在恶化",
    },
    boundary: {
      answer: "它依赖独立且有代表性的验证集，并受到随机噪声和单次最低值波动限制。",
      evidence: "但曲线只有在验证集保持独立且代表部署数据时才可靠",
    },
  };
  return page;
}

function qualityPageHash(page) {
  const canonical = JSON.stringify({
    title: page.title || "",
    subtitle: page.subtitle || "",
    thesis: page.thesis || "",
    html: page.html || "",
  });
  return `sha256:${crypto.createHash("sha256").update(canonical).digest("hex")}`;
}

function writeFixture(directory, page, graphIds = ["fixture"]) {
  fs.rmSync(path.join(directory, "data", "deepdive"), { recursive: true, force: true });
  fs.rmSync(path.join(directory, "data", "deepdive-runtime"), { recursive: true, force: true });
  fs.mkdirSync(path.join(directory, "data", "deepdive"), { recursive: true });
  fs.mkdirSync(path.join(directory, "data", "deepdive-runtime"), { recursive: true });
  fs.mkdirSync(path.join(directory, "docs"), { recursive: true });
  const nodes = graphIds.map((id) => ({ id, label: id, layer: "base" }));
  fs.writeFileSync(
    path.join(directory, "data", "graph.js"),
    `window.GRAPH = { nodes: ${JSON.stringify(nodes)}, edges: [] };`,
  );
  fs.writeFileSync(
    path.join(directory, "data", "deepdive", "fixture.js"),
    `window.DEEPDIVE = window.DEEPDIVE || {}; window.DEEPDIVE["fixture"] = ${JSON.stringify(page)};`,
  );
  fs.writeFileSync(
    path.join(directory, "data", "deepdive-runtime", "fixture.js"),
    `window.DEEPDIVE = window.DEEPDIVE || {}; window.DEEPDIVE["fixture"] = ${JSON.stringify(page)};`,
  );
  fs.writeFileSync(
    path.join(directory, "data", "deepdive-runtime", "manifest.js"),
    `window.DEEPDIVE_RUNTIME = ${JSON.stringify({
      base: "data/deepdive-runtime",
      ids: ["fixture"]
    })};`,
  );
  fs.writeFileSync(
    path.join(directory, "index.html"),
    '<script src="data/graph.js"></script><script src="data/deepdive-runtime/manifest.js"></script>',
  );
  fs.writeFileSync(
    path.join(directory, "docs", "deepdive-quality-reviews.json"),
    JSON.stringify({ schemaVersion: 3, certificationLevel: "L4", reviews: {} }, null, 2),
  );
  fs.writeFileSync(
    path.join(directory, "docs", "deepdive-l3-benchmark.json"),
    JSON.stringify({
      schemaVersion: 2,
      reference: { id: "fixture", pageHash: qualityPageHash(page) },
      minimumScore: 88,
      dimensionFloors: {
        continuity: 16,
        mechanism: 16,
        teaching: 16,
        diagnostics: 12,
        assessment: 12,
        sources: 8,
      },
    }, null, 2),
  );
}

function expectPass(script, args, fixture, pattern) {
  const result = run(script, args, fixture);
  assert.strictEqual(result.status, 0, output(result));
  if (pattern) assert.match(output(result), pattern);
  return result;
}

function expectFail(script, args, fixture, pattern) {
  const result = run(script, args, fixture);
  assert.notStrictEqual(result.status, 0, `故障夹具意外通过：${script} ${args.join(" ")}`);
  assert.match(output(result), pattern);
  return result;
}

// 先确认真实项目仍通过基础发布门禁。
expectPass("validate-deepdives.js", [], root, /全部页面通过/);
expectPass("audit-deepdive-gold.js", ["--summary"], root, /L2 结构候选审计/);

const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "deepdive-gate-"));
try {
  // L1：合法嵌套目标可通过，以下每个故障必须被拒绝。
  writeFixture(fixture, basePage());
  expectPass("validate-deepdives.js", [], fixture, /全部页面通过/);

  fs.writeFileSync(
    path.join(fixture, "data", "deepdive", "duplicate.js"),
    'window.DEEPDIVE = window.DEEPDIVE || {}; window.DEEPDIVE["fixture"] = { title: "重复注册" };',
  );
  expectFail("validate-deepdives.js", [], fixture, /fixture: 存在多个注册来源/);

  writeFixture(fixture, basePage(), ["fixture", "missing-noncore"]);
  expectFail("validate-deepdives.js", [], fixture, /missing-noncore: 缺理解原理页/);

  writeFixture(fixture, basePage({ sources: ["https://example.com/dup", "https://example.com/dup"] }));
  expectFail("validate-deepdives.js", [], fixture, /来源列表存在重复链接/);

  writeFixture(fixture, basePage({ accessDate: "2999-01-01" }));
  expectFail("validate-deepdives.js", [], fixture, /来源访问日期晚于当前日期/);

  writeFixture(fixture, basePage({ questions: 4, answers: 3 }));
  expectFail("validate-deepdives.js", [], fixture, /参考答案少于自测题/);

  // L2：完整候选通过；L3仍会拒绝夹具中故意重复的大段正文。
  writeFixture(fixture, l2Page(true));
  expectPass("audit-deepdive-gold.js", ["--require-candidate", "fixture"], fixture, /达到 L2 结构候选要求/);
  expectFail("audit-deepdive-benchmark.js", ["--require-benchmark", "fixture"], fixture, /integrity\.repeated-paragraphs/);
  writeFixture(fixture, l2Page(false));
  expectFail("audit-deepdive-gold.js", ["--require-candidate", "fixture"], fixture, /缺实践验证或失败诊断信号/);

  // L3：结构高分不能补偿最终渲染污染或通用工厂生成的语义内容。
  const overlongLeadPage = basePage();
  overlongLeadPage.html = overlongLeadPage.html.replace(
    "<p>用于验证发布门禁的完整正文 1。</p>",
    `<p class="dd-lead">${"这段异常引导语跨越了本应独立的正文内容。".repeat(30)}</p><p>用于验证发布门禁的完整正文 1。</p>`,
  );
  writeFixture(fixture, overlongLeadPage);
  expectFail("audit-deepdive-benchmark.js", ["--require-benchmark", "fixture"], fixture, /integrity\.overlong-lead/);

  // 文风去重：相邻核心章节不得连续套用同一种定义开头模板（可以理解为 / 是一种 / 描述…）。
  const repeatedDefinitionPage = basePage();
  repeatedDefinitionPage.quality = {
    contractVersion: 2,
    examples: [],
    formulas: [],
    sectionContracts: [
      { section: 1, definition: { answer: "甲是一段用于测试的概念定义。", evidence: "甲可以理解为一段测试内容" } },
      { section: 2, definition: { answer: "乙是另一段用于测试的概念定义。", evidence: "乙可以理解为另一段测试内容" } },
    ],
  };
  writeFixture(fixture, repeatedDefinitionPage);
  expectFail("audit-deepdive-benchmark.js", ["--require-benchmark", "fixture"], fixture, /authorship\.repeated-definition-template/);

  const programmingFormulaPage = basePage();
  programmingFormulaPage.html = programmingFormulaPage.html.replace(
    "</section>",
    '<div class="dd-formula"><code>theta = sum_i x[i] ** 2</code></div></section>',
  );
  writeFixture(fixture, programmingFormulaPage);
  expectFail(
    "audit-deepdive-benchmark.js",
    ["--require-benchmark", "fixture"],
    fixture,
    /notation\.formula-code-wrapper|notation\.programming-display/,
  );

  const invalidMathMlPage = basePage();
  invalidMathMlPage.html = invalidMathMlPage.html.replace(
    "</section>",
    '<div class="dd-formula" data-display="mathml"><math display="block"><mi>x</mi></math></div></section>',
  );
  writeFixture(fixture, invalidMathMlPage);
  expectFail("audit-deepdive-benchmark.js", ["--require-benchmark", "fixture"], fixture, /notation\.invalid-mathml/);

  // L3 教学合同：逐步演算必须在本节重新建立题干，不能从答案开始。
  const missingPageExampleContract = basePage();
  missingPageExampleContract.quality = { contractVersion: 1, examples: [], formulas: [] };
  writeFixture(fixture, missingPageExampleContract);
  expectFail(
    "audit-deepdive-benchmark.js",
    ["--require-benchmark", "fixture"],
    fixture,
    /example\.page-missing-contract/,
  );

  const completeExamplePage = basePage();
  completeExamplePage.html = completeExamplePage.html.replace(
    '<section class="dd-sec"><h2>1. 小节</h2>',
    '<section class="dd-sec" data-worked-example="true"><h2>1. 逐步演算</h2>',
  ).replace(
    "<p>用于验证发布门禁的完整正文 1。</p>",
    '<p data-example-part="setup">任务场景：给定用户 A 与 B 的两个特征，比较谁更相似，并明确两个输入对象和各特征单位。</p>'
      + '<p data-example-part="rule">计算规则：分别求两个特征之差，再代入距离公式；距离越小暂时表示行为越相近。</p>'
      + '<p data-example-part="steps">代入步骤：第一项相差 1，第二项相差 10，分别平方后相加并完成最后的开方计算。</p>'
      + '<p data-example-part="interpretation">结果解释：金额项主导距离，说明原始单位隐含了权重，不能直接把数值主导误读成业务重要性。</p>',
  );
  completeExamplePage.quality = { contractVersion: 1, examples: [], formulas: [] };
  writeFixture(fixture, completeExamplePage);
  expectPass("audit-deepdive-benchmark.js", ["--require-benchmark", "fixture"], fixture);

  const missingSectionContractPage = JSON.parse(JSON.stringify(completeExamplePage));
  missingSectionContractPage.quality.contractVersion = 2;
  missingSectionContractPage.quality.sectionContracts = [];
  writeFixture(fixture, missingSectionContractPage);
  expectFail(
    "audit-deepdive-benchmark.js",
    ["--require-benchmark", "fixture"],
    fixture,
    /section\.missing-contract\.section-1/,
  );

  writeFixture(fixture, weakSixQuestionPage());
  expectFail(
    "audit-deepdive-benchmark.js",
    ["--require-benchmark", "fixture"],
    fixture,
    /section\.insufficient-(?:definition|problem|inputOutput|mechanism)/,
  );

  const strongContractPage = strongSixQuestionPage();
  writeFixture(fixture, strongContractPage);
  fs.writeFileSync(
    path.join(fixture, "docs", "deepdive-l3-benchmark.json"),
    JSON.stringify({
      schemaVersion: 2,
      reference: { id: "fixture", pageHash: qualityPageHash(strongContractPage) },
      minimumScore: 88,
      dimensionFloors: {
        continuity: 16,
        mechanism: 16,
        teaching: 16,
        diagnostics: 12,
        assessment: 12,
        sources: 8,
      },
    }, null, 2),
  );
  expectPass(
    "audit-deepdive-benchmark.js",
    ["--require-benchmark", "fixture"],
    fixture,
    /通过 L3 教学一致性自动门禁/,
  );

  const unexplainedSingleConceptPage = JSON.parse(JSON.stringify(completeExamplePage));
  unexplainedSingleConceptPage.html = unexplainedSingleConceptPage.html.replace(
    '<p data-example-part="interpretation">结果解释：金额项主导距离，说明原始单位隐含了权重，不能直接把数值主导误读成业务重要性。</p>',
    '<p data-example-part="interpretation">结果解释：轮廓系数较高，所以先接受这个分组，稍后再讨论它具体比较什么。</p>',
  );
  writeFixture(fixture, unexplainedSingleConceptPage);
  expectFail(
    "audit-deepdive-benchmark.js",
    ["--require-benchmark", "fixture"],
    fixture,
    /terminology\.missing-first-use-contract\.section-1\.轮廓系数/,
  );

  const missingSetupPage = JSON.parse(JSON.stringify(completeExamplePage));
  missingSetupPage.html = missingSetupPage.html.replace(
    '<p data-example-part="setup">任务场景：给定用户 A 与 B 的两个特征，比较谁更相似，并明确两个输入对象和各特征单位。</p>',
    "<p>直接开始：A 到 B 的距离等于 10.05。</p>",
  );
  writeFixture(fixture, missingSetupPage);
  expectFail(
    "audit-deepdive-benchmark.js",
    ["--require-benchmark", "fixture"],
    fixture,
    /example\.missing-local-setup\.section-1/,
  );

  // L3 公式合同：符号必须绑定同节正文中的真实解释证据。
  const definedSymbolPage = basePage();
  definedSymbolPage.html = definedSymbolPage.html.replace(
    '<section class="dd-sec"><h2>1. 小节</h2>',
    '<section class="dd-sec" data-worked-example="true"><h2>1. 逐步演算</h2>',
  );
  definedSymbolPage.html = definedSymbolPage.html.replace(
    "<p>用于验证发布门禁的完整正文 1。</p>",
    '<p data-example-part="setup">任务场景：给定一组二维样本，需要寻找一个投影方向并比较投影前后的信息保留程度。</p>'
      + '<p data-example-part="rule">计算规则：先说明待求投影方向，再根据同一目标比较各候选方向，不能把未知量当成输入。</p>'
      + '<p data-example-part="steps">代入步骤：逐个检查候选方向，计算每个样本的投影，并记录相应的目标值。</p>'
      + '<p data-example-part="interpretation">结果解释：目标值更好的方向才是本例输出，符号代表待求对象而不是已知数据。</p>'
      + '<p>符号说明：W 表示需要寻找的投影方向集合，每一列对应一条候选方向，不能把它当成已经给定的数据。</p>'
      + '<div class="dd-formula" data-formula-id="fixture-pca" data-display="mathml">'
      + '<math display="block" aria-label="选择投影方向 W"><mrow><mi>W</mi><mo>=</mo><mi>W</mi></mrow></math></div>',
  );
  definedSymbolPage.quality = {
    contractVersion: 1,
    examples: [],
    formulas: [{
      id: "fixture-pca",
      section: 1,
      symbols: [{ name: "W", meaning: "需要寻找的投影方向集合", evidence: "W 表示需要寻找的投影方向集合" }],
    }],
  };
  writeFixture(fixture, definedSymbolPage);
  expectPass("audit-deepdive-benchmark.js", ["--require-benchmark", "fixture"], fixture);

  const undefinedSymbolPage = JSON.parse(JSON.stringify(definedSymbolPage));
  undefinedSymbolPage.html = undefinedSymbolPage.html.replace(
    "W 表示需要寻找的投影方向集合",
    "这里直接给出 PCA 的正式写法",
  );
  writeFixture(fixture, undefinedSymbolPage);
  expectFail(
    "audit-deepdive-benchmark.js",
    ["--require-benchmark", "fixture"],
    fixture,
    /notation\.undefined-symbol\.fixture-pca\.W/,
  );

  const anchoredPage = basePage();
  writeFixture(fixture, anchoredPage);
  const anchoredBenchmark = fs.readFileSync(path.join(fixture, "docs", "deepdive-l3-benchmark.json"), "utf8");
  writeFixture(fixture, basePage({ title: "参照页未经审查发生变化" }));
  fs.writeFileSync(path.join(fixture, "docs", "deepdive-l3-benchmark.json"), anchoredBenchmark);
  expectFail("audit-deepdive-benchmark.js", ["--summary"], fixture, /L3 参照页哈希漂移/);

  writeFixture(fixture, anchoredPage);
  fs.writeFileSync(
    path.join(fixture, "docs", "expired-l3-baseline.json"),
    JSON.stringify({
      schemaVersion: 2,
      description: "故意过期的历史债务夹具",
      createdAt: "2000-01-01",
      reviewBy: "2000-01-02",
      owner: "quality-fixture",
      referencePageHash: qualityPageHash(anchoredPage),
      allowedGaps: {},
    }, null, 2),
  );
  expectFail(
    "audit-deepdive-benchmark.js",
    ["--changed", "--baseline", "docs/expired-l3-baseline.json"],
    fixture,
    /L3 债务基线已于 2000-01-02 到期/,
  );

  // L4：人工认证与内容哈希绑定；正文一改，旧证据必须失效。
  writeFixture(fixture, basePage());
  const template = expectPass("review-deepdive-quality.js", ["--template", "fixture"], fixture);
  const reviewData = JSON.parse(template.stdout);
  assert.strictEqual(reviewData.schemaVersion, 3);
  assert.strictEqual(reviewData.certificationLevel, "L4");
  const review = reviewData.reviews.fixture;
  review.reviewedAt = today;
  review.validUntil = validUntil;
  review.commit = "abcdef1";
  review.reviewers = [
    { name: "内容审校甲", role: "content-reviewer", independent: false },
    { name: "独立审校乙", role: "independent-reviewer", independent: true },
  ];
  review.decision = "certified";
  review.scores = { accuracy: 25, alignment: 20, depth: 20, examples: 15, assessment: 10, sources: 10 };
  const evidenceDirectory = path.join(fixture, "docs", "evidence");
  fs.mkdirSync(evidenceDirectory, { recursive: true });
  fs.writeFileSync(path.join(evidenceDirectory, "reproduction.txt"), "输入：夹具页面。预期：结构完整。观察：门禁通过。");
  fs.writeFileSync(path.join(evidenceDirectory, "browser.json"), JSON.stringify({
    schemaVersion: 1,
    tool: "audit-deepdive-browser",
    generatedAt: new Date().toISOString(),
    passed: true,
    viewports: [{ name: "desktop" }, { name: "mobile" }],
    pages: { fixture: { pageHash: review.pageHash } },
  }, null, 2));
  const artifact = (id, type, filename, description) => ({
    id,
    type,
    path: `docs/evidence/${filename}`,
    sha256: `sha256:${crypto.createHash("sha256").update(fs.readFileSync(path.join(evidenceDirectory, filename))).digest("hex")}`,
    description,
  });
  review.artifacts = [
    artifact("repro-1", "reproduction-log", "reproduction.txt", "记录夹具示例的输入、预期结果与实际观察结果。"),
    artifact("browser-1", "browser-report", "browser.json", "记录桌面端和移动端浏览器基础验收结果。"),
  ];
  review.evidence = {
    accuracy: {
      summary: "逐条核对页面关于结构门禁作用与限制的关键陈述，并用两个独立来源记录复核定位。",
      claims: [
        {
          pageExcerpt: "用于验证发布门禁的完整正文 1。",
          sourceUrl: "https://example.com/source-a",
          locator: "来源 A 的规范说明第一个章节",
          verification: "对照来源的门禁定义，确认页面没有把结构检查描述成内容正确性证明。",
        },
        {
          pageExcerpt: "用于验证发布门禁的完整正文 2。",
          sourceUrl: "https://example.org/source-b",
          locator: "来源 B 的质量审校第二个章节",
          verification: "独立检查第二处表述与来源边界，确认结论只覆盖发布结构而不扩张范围。",
        },
      ],
    },
    alignment: {
      summary: "把三个学习目标分别映射到正文标题和对应自测题，检查读者是否能从讲解走到可观察回答。",
      objectiveMappings: [
        { objectiveExcerpt: "解释输入", sectionHeading: "1. 小节", questionExcerpt: "问题 1", rationale: "第一节给出输入概念，第一题要求读者重新解释该输入。" },
        { objectiveExcerpt: "检查过程", sectionHeading: "2. 小节", questionExcerpt: "问题 2", rationale: "第二节描述过程检查，第二题直接检验过程判断是否建立。" },
        { objectiveExcerpt: "判断输出", sectionHeading: "3. 小节", questionExcerpt: "问题 3", rationale: "第三节覆盖输出判断，第三题要求根据正文判断最终结果。" },
      ],
    },
    depth: {
      summary: "分别检查输入、变换、输出和边界四个机制环节，避免只凭章节数量判断原理深度。",
      mechanismChecks: [
        { aspect: "input", pageExcerpt: "用于验证发布门禁的完整正文 1。", assessment: "该段明确承接输入位置，能够作为后续处理过程的起点说明。" },
        { aspect: "transformation", pageExcerpt: "用于验证发布门禁的完整正文 2。", assessment: "该段位于因果链之后，说明检查动作如何连接输入与门禁结果。" },
        { aspect: "output", pageExcerpt: "用于验证发布门禁的完整正文 3。", assessment: "该段提供可以被门禁观察的输出位置，而不是只描述抽象目标。" },
        { aspect: "boundary", pageExcerpt: "结构只能作为人工审校入口。", assessment: "该边界明确否认结构数量能够自动证明内容质量，限制结论外推。" },
      ],
    },
    examples: {
      summary: "独立复现夹具页面的门禁结果，并检查章节数量与真实质量之间的常见误解是否被纠正。",
      reproductions: [
        {
          pageExcerpt: "用于验证发布门禁的完整正文 4。",
          method: "execution",
          input: "以包含七个章节、三道题和两个来源的夹具页面作为输入。",
          expected: "发布门禁应接受完整夹具，并拒绝随后构造的缺陷版本。",
          observed: "执行结果与预期一致，完整夹具通过且各类缺陷夹具失败。",
          artifactId: "repro-1",
        },
      ],
      misconceptionChecks: [
        {
          misconceptionExcerpt: "章节越多质量一定越高。",
          correctionExcerpt: "结构只能作为人工审校入口。",
          rationale: "纠正内容明确区分自动候选资格和人工内容认证，避免把 L2/L3 当成 L4。",
        },
      ],
    },
    assessment: {
      summary: "逐题检查问题、答案和目标的对应关系，并确认题目能够暴露输入、过程和输出判断上的误解。",
      questionMappings: [
        { questionExcerpt: "问题 1", answerExcerpt: "答案 1", objectiveExcerpt: "解释输入", diagnosticValue: "检查读者是否能够识别门禁接收的输入结构，而非背诵名称。" },
        { questionExcerpt: "问题 2", answerExcerpt: "答案 2", objectiveExcerpt: "检查过程", diagnosticValue: "检查读者能否解释检查过程，并发现遗漏步骤造成的错误。" },
        { questionExcerpt: "问题 3", answerExcerpt: "答案 3", objectiveExcerpt: "判断输出", diagnosticValue: "检查读者能否根据失败输出定位具体门禁条件，而非只看总分。" },
      ],
    },
    sources: {
      summary: "复核两个页面内来源的权威类型、定位和支持范围，并记录需要随规范变化重新检查的边界。",
      sourceReviews: [
        { url: "https://example.com/source-a", authority: "official", supportsExcerpt: "用于验证发布门禁的完整正文 1。", locator: "官方说明第一章节的门禁定义", checkedAt: today },
        { url: "https://example.org/source-b", authority: "standard", supportsExcerpt: "用于验证发布门禁的完整正文 2。", locator: "标准文档第二章节的审校边界", checkedAt: today },
      ],
      maintenanceBoundary: "当发布结构、页面模板或来源规范发生变化时，必须重新核对断言定位并更新认证哈希。",
    },
  };
  Object.keys(review.essentialChecks).forEach((key) => { review.essentialChecks[key] = true; });
  fs.writeFileSync(
    path.join(fixture, "docs", "deepdive-quality-reviews.json"),
    JSON.stringify(reviewData, null, 2),
  );
  expectPass("review-deepdive-quality.js", ["--require-current", "fixture"], fixture, /内容哈希一致/);

  const wrongLevelReview = JSON.parse(JSON.stringify(reviewData));
  wrongLevelReview.certificationLevel = "L3";
  fs.writeFileSync(
    path.join(fixture, "docs", "deepdive-quality-reviews.json"),
    JSON.stringify(wrongLevelReview, null, 2),
  );
  expectFail("review-deepdive-quality.js", ["--require-current", "fixture"], fixture, /certificationLevel 必须为 "L4"/);

  const genericReview = JSON.parse(JSON.stringify(reviewData));
  genericReview.reviews.fixture.evidence.accuracy.summary = "已检查";
  fs.writeFileSync(
    path.join(fixture, "docs", "deepdive-quality-reviews.json"),
    JSON.stringify(genericReview, null, 2),
  );
  expectFail("review-deepdive-quality.js", ["--require-current", "fixture"], fixture, /accuracy 缺至少 30 字的具体审校摘要/);

  fs.writeFileSync(path.join(evidenceDirectory, "reproduction.txt"), "证据已经被篡改");
  fs.writeFileSync(
    path.join(fixture, "docs", "deepdive-quality-reviews.json"),
    JSON.stringify(reviewData, null, 2),
  );
  expectFail("review-deepdive-quality.js", ["--require-current", "fixture"], fixture, /artifact repro-1 哈希不匹配/);
  fs.writeFileSync(path.join(evidenceDirectory, "reproduction.txt"), "输入：夹具页面。预期：结构完整。观察：门禁通过。");

  writeFixture(fixture, basePage({ title: "正文已经改变" }));
  fs.mkdirSync(evidenceDirectory, { recursive: true });
  fs.writeFileSync(path.join(evidenceDirectory, "reproduction.txt"), "输入：夹具页面。预期：结构完整。观察：门禁通过。");
  fs.writeFileSync(path.join(evidenceDirectory, "browser.json"), JSON.stringify({
    schemaVersion: 1,
    tool: "audit-deepdive-browser",
    generatedAt: new Date().toISOString(),
    passed: true,
    viewports: [{ name: "desktop" }, { name: "mobile" }],
    pages: { fixture: { pageHash: review.pageHash } },
  }, null, 2));
  fs.writeFileSync(
    path.join(fixture, "docs", "deepdive-quality-reviews.json"),
    JSON.stringify(reviewData, null, 2),
  );
  expectFail("review-deepdive-quality.js", ["--require-current", "fixture"], fixture, /内容哈希已过期/);
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}

// 真实项目中未认证页面仍不得伪装成 L4 当前认证。
const uncertified = run("review-deepdive-quality.js", ["--require-current", "reasoning-models"]);
assert.strictEqual(uncertified.status, 1);
assert.match(output(uncertified), /没有审校记录/);

console.log("✓ 深读页分层门禁与故障夹具全部通过");
