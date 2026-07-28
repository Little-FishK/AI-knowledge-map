/*
 * L3 教学一致性自动门禁。
 *
 * 报告：node tools/audit-deepdive-benchmark.js
 * 严格：node tools/audit-deepdive-benchmark.js --require-benchmark neural-network
 * 增量：node tools/audit-deepdive-benchmark.js --changed --baseline docs/deepdive-l3-baseline.json
 * 基线模板：node tools/audit-deepdive-benchmark.js --write-baseline docs/deepdive-l3-baseline.json
 *
 * 结构代理分只作诊断；已知教学完整性缺陷是不可补偿的阻断项。
 * L3 不替代 L4 人工事实、推导与真实教学效果审校。
 */
"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");
const { loadDeepDivePages } = require("./deepdive-loader");

const root = process.env.DEEPDIVE_ROOT
  ? path.resolve(process.env.DEEPDIVE_ROOT)
  : path.join(__dirname, "..");
const benchmarkFile = path.join(root, "docs", "deepdive-l3-benchmark.json");
const benchmark = JSON.parse(fs.readFileSync(benchmarkFile, "utf8"));
const pages = loadDeepDivePages(root);

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

function sectionRecordsOf(html) {
  return [...html.matchAll(/<section\b([^>]*)class="([^"]*\bdd-sec\b[^"]*)"([^>]*)>([\s\S]*?)<\/section>/gi)]
    .map((match, index) => ({
      index: index + 1,
      attributes: `${match[1]} class="${match[2]}" ${match[3]}`,
      html: match[4],
    }));
}

function attribute(source, name) {
  const match = String(source || "").match(new RegExp(`\\b${name}="([^"]*)"`, "i"));
  return match ? match[1].trim() : "";
}

function evidenceContext(sectionHtml, evidence) {
  const needle = text(evidence);
  if (!needle) return "";
  const blocks = [
    ...String(sectionHtml || "").matchAll(
      /<(p|li|td|th|figcaption|summary|h[2-4]|div)\b[^>]*>([\s\S]*?)<\/\1>/gi,
    ),
  ]
    .map((match) => text(match[2]))
    .filter((block) => block.includes(needle))
    .sort((left, right) => left.length - right.length);
  if (blocks.length) return blocks[0];

  const sectionText = text(sectionHtml);
  const sentences = sectionText
    .split(/(?<=[。！？；])/)
    .map((item) => item.trim())
    .filter(Boolean);
  return sentences.find((sentence) => sentence.includes(needle)) || "";
}

function semanticSectionPart(part, answer, context) {
  const answerText = text(answer);
  const contextText = text(context);
  if (answerText.length < 16 || contextText.length < 10) return false;

  const rules = {
    definition: {
      answer: /是|指|表示|定义|描述|展示|记录|比较|衡量|过程|方法|机制|关系|任务|指标|模型/,
      context: /是一种|是一个|是指|是由|是把|是用来|是用于|指的是|表示|称为|定义为|可以理解为|描述|展示|记录|衡量|比较的是/,
    },
    problem: {
      answer: /解决|识别|判断|发现|避免|防止|区分|诊断|选择|回答|目标|问题|需要|用于|帮助/,
      context: /解决|用于|用来|为了|帮助|避免|防止|识别|判断|检测|诊断|区分|目标是|需要|使.{0,20}能够/,
    },
    inputOutput: {
      answer: /输入|给定|接收|读取|观察|训练集|样本|数据/,
      context: /输入.{0,100}输出|输出.{0,100}输入|(?:给定|接收|读取|观察).{2,100}(?:得到|产生|返回|输出|选出)/,
      answerAlso: /输出|得到|产生|返回|选出|结果|停止点|模型|预测|分数/,
    },
    mechanism: {
      answer: /通过|根据|先|再|然后|计算|比较|更新|转换|重复|逐步|当|因为|从而|所以/,
      context: /先.{1,100}(?:再|然后)|通过.{1,100}(?:从而|使|得到)|根据.{1,80}(?:计算|比较|选择|更新|判断)|当.{1,80}(?:时|就|则)|因为.{1,80}(?:所以|因此)|重复|逐步|依次|流程|步骤/,
    },
    interpretation: {
      answer: /表示|说明|意味着|解释|判断|应看作|不能理解为|越|高|低|接近|差异/,
      context: /表示|说明|意味着|应解释为|可以判断|若.{1,80}则|如果.{1,80}(?:说明|表示|意味着)|越.{1,50}越|接近.{1,50}表示|才是|更像|先怀疑|不能.{0,20}(?:解读|理解|说明|证明)/,
    },
    boundary: {
      answer: /但|仅|只有|前提|边界|限制|不适用|不能|不是|未必|可能|风险|失败|噪声|随机|依赖|代表|独立|泄漏/,
      context: /但|仅|只有|前提|边界|限制|不适用|不能|不是|未必|可能|风险|失败|失效|噪声|随机|依赖|除非|代表性|独立|泄漏/,
    },
  };
  const rule = rules[part];
  if (!rule || !rule.answer.test(answerText) || !rule.context.test(contextText)) return false;
  if (rule.answerAlso && !rule.answerAlso.test(answerText)) return false;
  return true;
}

function contractTokens(value) {
  return [...new Set(String(value || "").split(/[\s,，;；]+/).map((item) => item.trim()).filter(Boolean))];
}

// 定义句式（“开头模板”）。用于文风去重：相邻核心章节不得连续套用同一种定义句式，
// 免得每节都写“XXX 可以理解为 YYY”这类千篇一律的开头（见 docs/DEEPDIVE.md §4.1）。
// 顺序按“更具体的先匹配”，避免 “是” 抢在 “是一种” 前面。
const DEFINITION_TEMPLATES = [
  "可以理解为", "比较的是", "是一种", "是一个", "是用来", "是用于",
  "指的是", "定义为", "称为", "是指", "是由", "是把",
  "描述", "衡量", "记录", "展示", "表示",
];
function definitionTemplateKey(evidence) {
  const value = String(evidence || "");
  return DEFINITION_TEMPLATES.find((marker) => value.includes(marker)) || "";
}

function normalizeMathText(value) {
  const subscripts = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9", "ᵢ": "i", "ⱼ": "j", "ₜ": "t", "ₙ": "n" };
  return String(value || "").replace(/[₀-₉ᵢⱼₜₙ]/g, (character) => subscripts[character] || character);
}

function hasNonEmptyDataPart(section, part) {
  const pattern = new RegExp(
    `<([a-z][\\w-]*)\\b[^>]*data-example-part="${part}"[^>]*>([\\s\\S]*?)<\\/\\1>`,
    "i",
  );
  const match = section.match(pattern);
  return Boolean(match && text(match[2]).length >= 8);
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
  const sectionRecords = sectionRecordsOf(html);
  const sections = sectionRecords.map((section) => section.html);
  const contractVersion = Number(page.quality?.contractVersion || 0);
  const formulaContracts = Array.isArray(page.quality?.formulas) ? page.quality.formulas : [];
  const formulaContractById = new Map(formulaContracts.map((formula) => [formula.id, formula]));
  const exampleContracts = Array.isArray(page.quality?.examples) ? page.quality.examples : [];
  const exampleContractBySection = new Map(exampleContracts.map((example) => [Number(example.section), example]));
  const termReviews = Array.isArray(page.quality?.termReviews) ? page.quality.termReviews : [];
  const termReviewBySection = new Map(termReviews.map((review) => [Number(review.section), review]));
  const sectionContracts = Array.isArray(page.quality?.sectionContracts) ? page.quality.sectionContracts : [];
  const sectionContractBySection = new Map(sectionContracts.map((contract) => [Number(contract.section), contract]));
  const goals = goalCount(html);
  const leads = count(html, /class="dd-lead"/g);
  const leadBlocks = [...html.matchAll(/<p\b[^>]*class="[^"]*\bdd-lead\b[^"]*"[^>]*>([\s\S]*?)<\/p>/gi)];
  const leadAnomalies = [];
  sections.forEach((section, index) => {
    const sectionText = text(section);
    const sectionLeads = [...section.matchAll(/<p\b[^>]*class="[^"]*\bdd-lead\b[^"]*"[^>]*>([\s\S]*?)<\/p>/gi)];
    sectionLeads.forEach((match) => {
      const leadText = text(match[1]);
      if (leadText.length > 240 || (sectionText.length >= 300 && leadText.length / sectionText.length > 0.45)) {
        leadAnomalies.push(index + 1);
      }
    });
  });
  const leadContainsBlock = leadBlocks.some((match) => /<(?:section|table|figure|h[1-6]|ol|ul|pre)\b/i.test(match[1]));
  const explicitChainItems = listItems(blockWithClass(html, "dd-chain")).length
    || count(blockWithClass(html, "dd-chain"), /(?:→|⇒|->)/g) + 1;
  const figures = [...html.matchAll(/<figure\b[^>]*>([\s\S]*?)<\/figure>/gi)].map((match) => match[1]);
  const validFigures = figures.filter((figure) => (
    /<figcaption\b/i.test(figure)
    && /<svg\b[^>]*role="img"/i.test(figure)
    && (/<svg\b[^>]*aria-label="[^"]+"/i.test(figure) || /<title\b/i.test(figure))
  )).length;
  const figureChainItems = validFigures > 0
    && /输入|参考录音/.test(plain)
    && /变换|计算|条件化|生成/.test(plain)
    && /输出|波形|结果/.test(plain)
    && /反馈|评测|验收/.test(plain)
    ? 5
    : 0;
  const chainItems = Math.max(explicitChainItems, figureChainItems);
  const validTables = [...html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)]
    .filter((match) => /<th\b/i.test(match[1]) && text(match[1]).length >= 40).length;
  const formulas = count(html, /class="dd-formula/g);
  const formulaBlocks = [...html.matchAll(/<div\b[^>]*class="[^"]*\bdd-formula\b[^"]*"[^>]*>([\s\S]*?)<\/div>/gi)];
  const formulaUsesCodeWrapper = formulaBlocks.some((match) => /<code\b/i.test(match[1]));
  const programmingFormulaPattern = /\b(?:theta|lambda)\b|sum_|sqrt\s*\(|Math\.|np\.|==|!=|<=|>=|->|\*\*/i;
  const formulaUsesProgrammingNotation = formulaBlocks.some((match) => programmingFormulaPattern.test(text(match[1])));
  const usesPlainTextRadical = /√/.test(html);
  const invalidMathMl = [...html.matchAll(/<div\b[^>]*class="[^"]*\bdd-formula\b[^"]*"[^>]*(?:data-display|data-math)="mathml"[^>]*>([\s\S]*?)<\/div>/gi)]
    .some((match) => !/<math\b/i.test(match[1]) || !/<math\b[^>]*aria-label="[^"]+"/i.test(match[1]));
  const formulaContractGaps = [];
  const formulaIds = new Set();
  const formulaIdsSeen = new Set();
  let uncontractedFormulaCount = 0;
  sectionRecords.forEach((section) => {
    const sectionText = text(section.html);
    const defined = new Set(
      [...section.html.matchAll(/\bdata-defines="([^"]+)"/gi)]
        .flatMap((match) => contractTokens(match[1])),
    );
    const records = [...section.html.matchAll(/<div\b([^>]*)class="([^"]*\bdd-formula\b[^"]*)"([^>]*)>([\s\S]*?)<\/div>/gi)]
      .map((match) => ({
        attributes: `${match[1]} class="${match[2]}" ${match[3]}`,
        body: match[4],
      }));
    records.forEach((formula, formulaIndex) => {
      const declaredFormulaId = attribute(formula.attributes, "data-formula-id");
      const positionalMetadata = formulaContracts.find((item) => (
        Number(item?.section) === section.index
        && Number(item?.formulaIndex) === formulaIndex + 1
      ));
      const formulaId = declaredFormulaId || positionalMetadata?.id || "";
      const metadata = formulaContractById.get(formulaId) || positionalMetadata;
      const metadataSymbols = Array.isArray(metadata?.symbols) ? metadata.symbols : [];
      const symbols = contractTokens(attribute(formula.attributes, "data-symbols"));
      const contractedSymbols = symbols.length ? symbols : metadataSymbols.map((item) => item.name).filter(Boolean);
      if (!formulaId || contractedSymbols.length === 0) uncontractedFormulaCount += 1;
      if (contractVersion < 1) return;
      if (!formulaId) {
        formulaContractGaps.push(`notation.formula-missing-id.section-${section.index}.${formulaIndex + 1}`);
        return;
      }
      formulaIdsSeen.add(formulaId);
      if (formulaIds.has(formulaId)) {
        formulaContractGaps.push(`notation.duplicate-formula-id.${formulaId}`);
      }
      formulaIds.add(formulaId);
      if (contractedSymbols.length === 0) {
        formulaContractGaps.push(`notation.formula-missing-symbol-contract.${formulaId}`);
        return;
      }
      if (metadata && Number(metadata.section) !== section.index) {
        formulaContractGaps.push(`notation.formula-section-mismatch.${formulaId}`);
      }
      const formulaText = normalizeMathText(text(formula.body));
      const absentFromFormula = contractedSymbols.filter((symbol) => !formulaText.includes(normalizeMathText(symbol)));
      if (absentFromFormula.length) {
        formulaContractGaps.push(`notation.symbol-not-in-formula.${formulaId}.${absentFromFormula.join(",")}`);
      }
      const missing = contractedSymbols.filter((symbol) => {
        if (defined.has(symbol)) return false;
        const declaration = metadataSymbols.find((item) => item.name === symbol);
        const definitionSection = Number(declaration?.section || section.index);
        const definitionRecord = sectionRecords.find((item) => item.index === definitionSection);
        const definitionText = definitionRecord ? text(definitionRecord.html) : "";
        return !declaration
          || typeof declaration.meaning !== "string"
          || declaration.meaning.trim().length < 4
          || typeof declaration.evidence !== "string"
          || declaration.evidence.trim().length < 4
          || definitionSection > section.index
          || !definitionText.includes(declaration.evidence.trim());
      });
      if (missing.length) {
        formulaContractGaps.push(`notation.undefined-symbol.${formulaId}.${missing.join(",")}`);
      }
    });
  });
  if (contractVersion >= 1) {
    formulaContracts
      .filter((formula) => formula?.id && !formulaIdsSeen.has(formula.id))
      .forEach((formula) => formulaContractGaps.push(`notation.formula-contract-without-formula.${formula.id}`));
  }
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
  const dateMatch = sourceBlock.match(/(?:访问日期：|访问于\s*)(\d{4}-\d{2}-\d{2})/);

  const paragraphs = [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => text(match[1]))
    .filter((item) => item.length >= 40);
  const uniqueParagraphRatio = paragraphs.length
    ? new Set(paragraphs.map((item) => item.replace(/\s+/g, ""))).size / paragraphs.length
    : 0;
  const definitionTemplateGaps = [];
  const exampleContractGaps = [];
  const terminologyContractGaps = [];
  const sectionContractGaps = [];
  let requiredSectionCount = 0;
  let passedSectionCount = 0;
  let passedSectionIndexes = [];
  const reviewRequired = [];
  const exampleParts = ["setup", "rule", "steps", "interpretation"];
  const criticalTerminology = [
    "线性子空间", "重建误差", "局部邻域", "高维", "协方差矩阵", "特征向量",
    "正交", "单位矩阵", "似然", "典型集合", "密度比", "归纳偏置", "投影方差",
    "降维", "PCA", "t-SNE", "UMAP", "密度估计", "概率密度", "对数似然",
    "内部指标", "轮廓系数", "稳定性检查",
  ];
  const firstTerminologySection = new Map();
  sectionRecords.forEach((section) => {
    const sectionText = text(section.html);
    criticalTerminology.forEach((term) => {
      if (sectionText.includes(term) && !firstTerminologySection.has(term)) {
        firstTerminologySection.set(term, section.index);
      }
    });
  });
  let declaredExampleCount = 0;
  sectionRecords.forEach((section) => {
    const sectionText = text(section.html);
    const exampleHeadings = [...section.html.matchAll(/<h[2-4]\b[^>]*>([\s\S]*?)<\/h[2-4]>/gi)]
      .map((match) => text(match[1]))
      .join(" ");
    const looksLikeWorkedExample = examplePattern.test(exampleHeadings)
      && (/\d/.test(sectionText) || /class="dd-formula|class="dd-steps"|<table\b/i.test(section.html));
    if (looksLikeWorkedExample) {
      const metadata = exampleContractBySection.get(section.index);
      const declared = /data-worked-example="true"/i.test(section.attributes) || Boolean(metadata);
      if (declared) declaredExampleCount += 1;
      if (contractVersion >= 1 && !declared) {
        exampleContractGaps.push(`example.uncontracted.section-${section.index}`);
      } else if (contractVersion < 1 && !declared) {
        reviewRequired.push(`example.uncontracted.section-${section.index}`);
      }
      if (declared) {
        const missing = exampleParts.filter((part) => {
          if (hasNonEmptyDataPart(section.html, part)) return false;
          const evidence = metadata?.evidence?.[part];
          return typeof evidence !== "string" || evidence.trim().length < 4 || !sectionText.includes(evidence.trim());
        });
        if (missing.length) {
          exampleContractGaps.push(`example.missing-local-${missing.join("-")}.section-${section.index}`);
        }
      }
    }

    const terminology = criticalTerminology
      .filter((term) => firstTerminologySection.get(term) === section.index);
    const termReview = termReviewBySection.get(section.index);
    const reviewedTerms = Array.isArray(termReview?.terms) ? termReview.terms : [];
    const validTermReview = termReview
      && /^\d{4}-\d{2}-\d{2}$/.test(termReview.reviewedAt || "")
      && terminology.every((term) => {
        const review = reviewedTerms.find((item) => item?.name === term);
        return review
          && typeof review.meaning === "string"
          && review.meaning.trim().length >= 4
          && typeof review.purpose === "string"
          && review.purpose.trim().length >= 4
          && typeof review.definitionEvidence === "string"
          && review.definitionEvidence.trim().length >= 4
          && typeof review.purposeEvidence === "string"
          && review.purposeEvidence.trim().length >= 4
          && review.definitionEvidence.trim() !== review.purposeEvidence.trim()
          && sectionText.includes(review.definitionEvidence.trim())
          && sectionText.includes(review.purposeEvidence.trim());
      });
    const reviewThreshold = contractVersion >= 1 ? 1 : 4;
    const inlineTermsReviewed = /data-terms-reviewed="true"/i.test(section.attributes);
    const terminologyReviewSatisfied = contractVersion >= 1
      ? validTermReview
      : inlineTermsReviewed || validTermReview;
    if (new Set(terminology).size >= reviewThreshold
      && !terminologyReviewSatisfied) {
      const gap = contractVersion >= 1
        ? `terminology.missing-first-use-contract.section-${section.index}.${terminology.join(",")}`
        : `terminology.high-density.section-${section.index}`;
      if (contractVersion >= 1) terminologyContractGaps.push(gap);
      else reviewRequired.push(gap);
    }
  });
  if (contractVersion >= 1 && declaredExampleCount === 0) {
    exampleContractGaps.push("example.page-missing-contract");
  }
  if (contractVersion >= 2) {
    const requiredParts = ["definition", "problem", "inputOutput", "mechanism", "interpretation", "boundary"];
    const coreSections = sectionRecords.filter((section) => {
      const role = attribute(section.attributes, "data-section-role");
      if (role) return role === "core";
      const headingHtml = (section.html.match(/<h[2-4]\b[^>]*>([\s\S]*?)<\/h[2-4]>/i) || [])[1] || "";
      const heading = text(headingHtml.replace(/<span\b[^>]*class="[^"]*\bdd-badge\b[^"]*"[^>]*>[\s\S]*?<\/span>/gi, ""));
      return !/因果链|误区|误解|消歧|检查.*理解|自测|概念依赖|延伸学习|学习路线/.test(heading);
    });
    coreSections.forEach((section) => {
      const contract = sectionContractBySection.get(section.index);
      if (!contract) {
        sectionContractGaps.push(`section.missing-contract.section-${section.index}`);
        return;
      }
      const sectionText = text(section.html);
      const missing = requiredParts.filter((part) => {
        const item = contract[part];
        return !item
          || typeof item.answer !== "string"
          || item.answer.trim().length < 8
          || typeof item.evidence !== "string"
          || item.evidence.trim().length < 6
          || !sectionText.includes(item.evidence.trim());
      });
      if (missing.length) {
        sectionContractGaps.push(`section.missing-${missing.join("-")}.section-${section.index}`);
      }
      const insufficient = requiredParts.filter((part) => {
        const item = contract[part];
        if (!item || typeof item.answer !== "string" || typeof item.evidence !== "string") return false;
        const localContext = evidenceContext(section.html, item.evidence);
        const semanticContext = ["definition", "mechanism"].includes(part)
          ? localContext
          : sectionText;
        return !localContext || !semanticSectionPart(part, item.answer, semanticContext);
      });
      if (insufficient.length) {
        sectionContractGaps.push(`section.insufficient-${insufficient.join("-")}.section-${section.index}`);
      }
      const evidence = requiredParts
        .map((part) => contract[part]?.evidence?.trim())
        .filter(Boolean);
      if (new Set(evidence).size !== evidence.length) {
        sectionContractGaps.push(`section.reused-evidence.section-${section.index}`);
      }
      const evidenceParts = requiredParts
        .map((part) => contract[part]?.evidence?.trim())
        .filter((s) => typeof s === "string" && s.length >= 6);
      if (evidenceParts.length >= 5) {
        const positions = evidenceParts.map((s) => section.html.indexOf(s)).filter((p) => p >= 0);
        if (positions.length >= 5) {
          const paraBreaks = [];
          const re = /<\/p>/gi;
          let m;
          while ((m = re.exec(section.html)) !== null) paraBreaks.push(m.index + 4);
          const paraOf = {};
          evidenceParts.forEach((s) => {
            const pos = section.html.indexOf(s);
            if (pos < 0) return;
            let para = 0;
            for (const br of paraBreaks) {
              if (pos > br) para++;
              else break;
            }
            paraOf[s] = para;
          });
          const paraCounts = {};
          Object.values(paraOf).forEach((p) => { paraCounts[p] = (paraCounts[p] || 0) + 1; });
          if (Object.values(paraCounts).some((c) => c >= 5)) {
            sectionContractGaps.push(`authorship.appendage-paragraph.section-${section.index}`);
          }
        }
      }
    });
    const coreIndexes = new Set(coreSections.map((section) => section.index));
    sectionContracts
      .filter((contract) => !coreIndexes.has(Number(contract?.section)))
      .forEach((contract) => sectionContractGaps.push(`section.contract-outside-core.section-${contract?.section}`));
    // 文风去重：相邻核心章节的定义句不得用同一种开头模板（可以理解为 / 是一种 / 描述…）。
    const definitionTemplates = coreSections.map((section) => {
      const contract = sectionContractBySection.get(section.index);
      return definitionTemplateKey(text(contract?.definition?.evidence || ""));
    });
    for (let i = 1; i < definitionTemplates.length; i += 1) {
      if (definitionTemplates[i] && definitionTemplates[i] === definitionTemplates[i - 1]) {
        definitionTemplateGaps.push(
          `authorship.repeated-definition-template.section-${coreSections[i].index}.${definitionTemplates[i]}`,
        );
      }
    }
    requiredSectionCount = coreSections.length;
    const failedSectionIndexes = new Set(sectionContractGaps
      .map((gap) => Number((gap.match(/section-(\d+)/) || [])[1]))
      .filter(Number.isFinite));
    passedSectionIndexes = coreSections
      .filter((section) => !failedSectionIndexes.has(section.index))
      .map((section) => section.index);
    passedSectionCount = passedSectionIndexes.length;
  }
  if (contractVersion < 1 && uncontractedFormulaCount > 0) {
    reviewRequired.push(`notation.uncontracted-formulas.${uncontractedFormulaCount}`);
  }

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
  const proxyGaps = [];
  const gaps = [];
  let total = 0;
  for (const [dimension, items] of Object.entries(checks)) {
    const score = items.reduce((sum, [, ok, points]) => sum + (ok ? points : 0), 0);
    dimensions[dimension] = score;
    total += score;
    items.filter(([, ok]) => !ok).forEach(([code]) => {
      missingChecks.push(code);
      proxyGaps.push(code);
    });
    if (score < floors[dimension]) proxyGaps.push(`floor.${dimension}`);
  }
  if (total < benchmark.minimumScore) proxyGaps.push("floor.total");
  if (uniqueParagraphRatio < 0.85) gaps.push("integrity.repeated-paragraphs");
  if (leadAnomalies.length) gaps.push("integrity.overlong-lead");
  if (leadContainsBlock) gaps.push("integrity.lead-contains-block");
  if (formulaUsesCodeWrapper) gaps.push("notation.formula-code-wrapper");
  if (formulaUsesProgrammingNotation) gaps.push("notation.programming-display");
  if (usesPlainTextRadical) gaps.push("notation.plain-text-radical");
  if (invalidMathMl) gaps.push("notation.invalid-mathml");
  formulaContractGaps.forEach((gap) => gaps.push(gap));
  exampleContractGaps.forEach((gap) => gaps.push(gap));
  terminologyContractGaps.forEach((gap) => gaps.push(gap));
  sectionContractGaps.forEach((gap) => gaps.push(gap));
  definitionTemplateGaps.forEach((gap) => gaps.push(gap));

  return {
    id,
    title: page.title || id,
    score: total,
    dimensions,
    gaps: [...new Set(gaps)],
    proxyGaps: [...new Set(proxyGaps)],
    reviewRequired: [...new Set(reviewRequired)],
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
      leadAnomalies: leadAnomalies.length,
      authorshipGaps: definitionTemplateGaps.length,
      notationGaps: [formulaUsesCodeWrapper, formulaUsesProgrammingNotation, invalidMathMl].filter(Boolean).length,
      contractVersion,
      formulaContractGaps: formulaContractGaps.length,
      exampleContractGaps: exampleContractGaps.length,
      terminologyContractGaps: terminologyContractGaps.length,
      sectionContractGaps: sectionContractGaps.length,
      requiredSectionCount,
      passedSectionCount,
      passedSectionIndexes,
      reviewRequired: new Set(reviewRequired).size,
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
  if (data.schemaVersion !== 2) {
    throw new Error("L3 债务基线 schemaVersion 必须为 2");
  }
  if (data.referencePageHash !== benchmark.reference.pageHash) {
    throw new Error("L3 债务基线绑定的参照页哈希已过期");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.reviewBy || "")) {
    throw new Error("L3 债务基线缺 reviewBy 日期");
  }
  const today = new Date().toISOString().slice(0, 10);
  if (data.reviewBy < today) {
    throw new Error(`L3 债务基线已于 ${data.reviewBy} 到期，必须复审而不是继续静默豁免`);
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
const proxyDebt = results.filter((item) => item.proxyGaps.length > 0);
const manualReviewDebt = results.filter((item) => item.reviewRequired.length > 0);
const contractedResults = results.filter((item) => item.metrics.contractVersion >= 1);
const newGatePassed = contractedResults.filter((item) => item.gaps.length === 0 && item.reviewRequired.length === 0);
const sectionContractedResults = results.filter((item) => item.metrics.contractVersion >= 2);
const sectionGatePassed = sectionContractedResults.filter((item) => item.gaps.length === 0 && item.reviewRequired.length === 0);
const requiredSectionTotal = sectionContractedResults
  .reduce((sum, item) => sum + item.metrics.requiredSectionCount, 0);
const passedSectionTotal = sectionContractedResults
  .reduce((sum, item) => sum + item.metrics.passedSectionCount, 0);
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
  const createdAt = new Date().toISOString().slice(0, 10);
  const reviewBy = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
  fs.writeFileSync(output, JSON.stringify({
    schemaVersion: 2,
    description: "L3 v2 启用时的历史教学一致性债务；新页面必须零缺口，已有页面不得新增缺口。",
    createdAt,
    reviewBy,
    owner: "deepdive-editorial",
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
const listMigrationCandidates = process.argv.includes("--list-migration-candidates");
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

console.log(`L3 教学一致性自动门禁 · 页面 ${results.length} · 自动检查未发现可验证缺口 ${passed.length}（不代表通过，工具无法检测收束段和内容正确性）`);
console.log(`参照 ${benchmark.reference.id} · 结构代理分最低 ${benchmark.minimumScore} · 完整性阻断项不可由分数补偿`);
console.log(`结构代理提示 · ${proxyDebt.length} 页存在部件或关键词线索缺口（只供编辑审查，不作为L3阻断）`);
console.log(`强制人工复核 · ${manualReviewDebt.length} 页存在未迁移公式合同、案例合同或高术语密度提示（不冒充自动通过）`);
console.log(`新合同门禁 · 已迁移 ${contractedResults.length}/${results.length} · 零缺口 ${newGatePassed.length}/${results.length}`);
console.log(`章节六问门禁 · 已迁移 ${sectionContractedResults.length}/${results.length} · 零缺口 ${sectionGatePassed.length}/${results.length}`);
console.log(`章节六问实质证据 · 通过 ${passedSectionTotal}/${requiredSectionTotal} 个 core 章节`);
console.log("注意：自动门禁无法检测收束段、内容正确性、推导逻辑和教学有效性。零缺口不代表页面教学达标，仅代表可自动验证的结构性条件满足。");
if (process.argv.includes("--list-passed-sections")) {
  console.log("通过六问实质证据的章节：");
  results
    .filter((item) => item.metrics.passedSectionIndexes.length)
    .sort((left, right) => left.id.localeCompare(right.id))
    .forEach((item) => {
      item.metrics.passedSectionIndexes.forEach((section) => {
        console.log(`  ✓ ${item.id} · section-${section}`);
      });
    });
}
if (listMigrationCandidates) {
  const noReviewCandidates = results
    .filter((item) => item.metrics.contractVersion < 1 && item.reviewRequired.length === 0)
    .sort((a, b) => a.id.localeCompare(b.id));
  console.log(`迁移候选 · ${noReviewCandidates.length} 页未触发当前公式、案例或术语密度复核：`);
  noReviewCandidates.forEach((item) => console.log(`  ? ${item.id} · ${item.score}/100`));
  const structurallyReady = results
    .filter((item) => (
      item.metrics.contractVersion < 1
      && item.score >= benchmark.minimumScore
      && item.proxyGaps.length === 0
    ))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  console.log(`结构完整待合同复核 · ${structurallyReady.length} 页达到代理分且无结构提示：`);
  structurallyReady.forEach((item) => {
    console.log(`  ? ${item.id} · ${item.score}/100 · ${item.reviewRequired.join("；") || "无合同提示"}`);
  });
}
if (explainId) {
  const item = results.find((result) => result.id === explainId);
  if (!item) {
    console.error(`\n✗ 找不到页面：${explainId}`);
    process.exit(1);
  }
    console.log(`\n单页解释：${item.id} · 结构代理分 ${item.score}/100`);
  console.log(`  维度：${Object.entries(item.dimensions).map(([key, value]) => `${key}=${value}`).join("；")}`);
  console.log(`  指标：${Object.entries(item.metrics).map(([key, value]) => `${key}=${value}`).join("；")}`);
    console.log(`  未得分项：${item.missingChecks.length ? item.missingChecks.join("；") : "无"}`);
    console.log(`  代理提示：${item.proxyGaps.length ? item.proxyGaps.join("；") : "无"}`);
    console.log(`  人工复核：${item.reviewRequired.length ? item.reviewRequired.join("；") : "无"}`);
    console.log(`  阻断项：${item.gaps.length ? item.gaps.join("；") : "无"}`);
  process.exit(0);
}
if (!summaryOnly) {
  const allGaps = results.filter((item) => item.gaps.length > 0);
  if (allGaps.length) {
    console.log(`\nL3 可验证缺口（${allGaps.length} 页有自动侦测到的问题；无缺口的页面不代表教学达标）：`);
    results.forEach((item) => {
      if (item.gaps.length > 0) {
        console.log(`  - ${item.id} · ${item.score}/100 · ${item.gaps.join("；")}`);
      } else {
        console.log(`  ? ${item.id} · ${item.score}/100 · 未侦测到自动可验证缺口（不代表教学达标）`);
      }
    });
  }
} else {
  const frequencies = new Map();
  results.filter((item) => item.gaps.length > 0).forEach((item) => item.gaps.forEach((gap) => frequencies.set(gap, (frequencies.get(gap) || 0) + 1)));
  const common = [...frequencies.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (common.length) console.log(`主要缺口：${common.map(([gap, total]) => `${gap}(${total})`).join("；")}`);
}
if (enforcementFailures.length) {
  console.error(`\n✗ L3 教学一致性门禁发现 ${enforcementFailures.length} 个问题：`);
  enforcementFailures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}
if (requireId) console.log(`\n? ${requireId} 未侦测到自动可验证缺口（不代表教学达标）`);
if (changedOnly) console.log("\n✓ 变更页面没有超出 L3 已知基线的新缺口");
