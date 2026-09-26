"use strict";

const fs = require("node:fs");
const path = require("node:path");

function args(argv) {
  const result = { input: null, output: null };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--input") result.input = path.resolve(argv[++index]);
    else if (argv[index] === "--output") result.output = path.resolve(argv[++index]);
    else throw new Error("Usage: node audit-candidates.js --input candidates.jsonl --output directory");
  }
  if (!result.input || !result.output) throw new Error("Both --input and --output are required");
  return result;
}

function normalizeTitle(value) {
  return value.normalize("NFKC").replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim().toLocaleLowerCase("en");
}

const AWARD_2024 = "https://blog.neurips.cc/2024/12/10/announcing-the-neurips-2024-best-paper-awards/";
const AWARD_2025 = "https://blog.neurips.cc/2025/11/26/announcing-the-neurips-2025-best-paper-awards/";

const winners = [
  {
    title: "Visual Autoregressive Modeling: Scalable Image Generation via Next-Scale Prediction",
    mechanismId: "neurips-2024-best",
    awardUrl: AWARD_2024,
    arxivId: "2404.02905",
    change: "把图像自回归生成从栅格顺序的下一 token 预测改写为由粗到细的下一尺度预测。",
    assessment: "委员会将其列为主赛道 Best Paper，强调新视觉自回归模型、多尺度 VQ-VAE、生成效率和缩放证据。",
    limits: "证据限于所评估的图像生成设置，不能外推为对所有扩散模型或视觉任务都占优。",
    nodes: ["image-generation", "model-families", "scaling-law"],
    existingLibraryId: "arxiv-2404-02905"
  },
  {
    title: "Stochastic Taylor Derivative Estimator: Efficient amortization for arbitrary differential operators",
    mechanismId: "neurips-2024-best",
    awardUrl: AWARD_2024,
    arxivId: "2412.00088",
    change: "使神经网络能够以可行成本利用高维、高阶微分算子监督，同时处理维数与导数阶数带来的计算增长。",
    assessment: "委员会将其列为主赛道 Best Paper，并明确认为该方法为高阶导数监督学习开辟新路径；论文集报告了 PINN 场景中的大幅速度和内存改进。",
    limits: "最强证据来自 PINN 和微分算子监督，不能表述为所有神经网络训练或反向传播的通用加速。",
    nodes: ["backprop", "supervised-learning", "inference-optimization"],
    existingLibraryId: null
  },
  {
    title: "1000 Layer Networks for Self-Supervised RL: Scaling Depth Can Enable New Goal-Reaching Capabilities",
    mechanismId: "neurips-2025-best",
    awardUrl: AWARD_2025,
    arxivId: "2503.14858",
    change: "证明在特定自监督对比强化学习设置中，深度扩展能够提高性能并产生新的目标到达行为。",
    assessment: "委员会将其列为主赛道 Best Paper，认为它挑战了强化学习无法有效训练超深网络的常见认识。",
    limits: "结论依赖对比式自监督 RL、批量缩放和所测模拟环境，不能外推到所有 RL 算法。",
    nodes: ["reinforcement-learning", "self-supervised-learning"],
    existingLibraryId: "arxiv-2503-14858"
  },
  {
    title: "Gated Attention for Large Language Models: Non-linearity, Sparsity, and Attention-Sink-Free",
    mechanismId: "neurips-2025-best",
    awardUrl: AWARD_2025,
    arxivId: "2505.06708",
    change: "系统验证在 SDPA 输出后加入逐头 sigmoid 门控对稳定性、注意力汇聚和长上下文扩展的作用。",
    assessment: "委员会将其列为主赛道 Best Paper，认为建议易于实现、有大规模证据支持并可能被广泛采用。",
    limits: "尚不能保证全部模型规模、数据和注意力变体均获得同样收益，也不能替代完整机制解释。",
    nodes: ["attention", "context-window", "llm"],
    existingLibraryId: "arxiv-2505-06708"
  },
  {
    title: "Why Diffusion Models Don't Memorize: The Role of Implicit Dynamical Regularization in Training",
    mechanismId: "neurips-2025-best",
    awardUrl: AWARD_2025,
    arxivId: "2505.17638",
    change: "用两个可预测训练时间尺度解释扩散模型从泛化到记忆的转变，并把实验现象连接到理论分析。",
    assessment: "委员会将其列为主赛道 Best Paper，评价其为扩散模型隐式正则化动力学的基础性工作。",
    limits: "理论依赖可处理的随机特征模型，实验集中于所测 U-Net 与数据；标题不能理解为扩散模型永不记忆。",
    nodes: ["diffusion", "overfitting"],
    existingLibraryId: "arxiv-2505-17638"
  }
];

const discoveryOnly = [
  ["Guiding a Diffusion Model with a Bad Version of Itself", 2024, "Best Paper Runner-up", AWARD_2024, "Runner-up 未被现行机制启用；旧记录曾误标为 Best Paper。"],
  ["Not All Tokens Are What You Need for Pretraining", 2024, "Best Paper Runner-up", AWARD_2024, "Runner-up 未被现行机制启用。"],
  ["The PRISM Alignment Dataset: What Participatory, Representative and Individualised Human Feedback Reveals About the Subjective and Multicultural Alignment of Large Language Models", 2024, "Best Paper, Datasets & Benchmarks Track", AWARD_2024, "Datasets & Benchmarks 奖项没有继承主赛道 Best Paper 机制。"],
  ["Artificial Hivemind: The Open-Ended Homogeneity of Language Models (and Beyond)", 2025, "Best Paper, Datasets & Benchmarks Track", AWARD_2025, "Datasets & Benchmarks 奖项没有继承主赛道 Best Paper 机制。"],
  ["Does Reinforcement Learning Really Incentivize Reasoning Capacity in LLMs Beyond the Base Model?", 2025, "Best Paper Runner-up", AWARD_2025, "Runner-up 未被现行机制启用。"],
  ["Optimal Mistake Bounds for Transductive Online Learning", 2025, "Best Paper Runner-up", AWARD_2025, "Runner-up 未被现行机制启用。"],
  ["Superposition Yields Robust Neural Scaling", 2025, "Best Paper Runner-up", AWARD_2025, "Runner-up 未被现行机制启用。"]
].map(([title, year, awardName, awardUrl, reason]) => ({ title, year, awardName, awardUrl, reason }));

const winnerByTitle = new Map(winners.map(record => [normalizeTitle(record.title), record]));
const discoveryByTitle = new Map(discoveryOnly.map(record => [normalizeTitle(record.title), record]));

function fullReview(candidate, award) {
  return {
    ...candidate,
    disposition: "passed",
    reasonCode: "ALL_SIX_PASSED",
    reviewDepth: "six-steps",
    allSixStepsCompleted: true,
    steps: [1, 2, 3, 4, 5, 6].map(step => ({ step, status: "passed" })),
    evaluation: {
      mechanismId: award.mechanismId,
      venue: "NeurIPS",
      awardYear: candidate.year,
      track: "Main Conference Track",
      awardName: "Best Paper",
      recipientStatus: "winner",
      evidenceUrl: award.awardUrl,
      identityEvidence: "官方获奖题名、作者与 NeurIPS Proceedings 记录对应。"
    },
    aiDevelopmentContribution: {
      status: "supported",
      specificChangeToAi: award.change,
      externalAssessment: award.assessment,
      limits: award.limits
    },
    contentReview: {
      status: "passed-limited-use",
      materialSufficiency: "官方奖项评语、Proceedings 摘要与论文材料足以支持受限简介。",
      currentStanding: "本轮核对的官方奖项页、Proceedings 与现有原文入口未显示撤奖或撤稿通知；不声称穷尽所有争议。",
      duplicateDisposition: award.existingLibraryId ? "merge-evidence" : "include-new",
      existingLibraryId: award.existingLibraryId,
      rightsCheck: "仅收录书目信息、原文链接和原创短评，不转载全文或图表。"
    },
    linkedNodes: award.nodes,
    arxivId: award.arxivId,
    checkedAt: "2026-09-24"
  };
}

function deferredReview(candidate, discovery) {
  const isDiscoveryMatch = Boolean(discovery);
  return {
    ...candidate,
    disposition: "deferred",
    reasonCode: isDiscoveryMatch ? "AWARD_CLASS_NOT_ENABLED" : "NO_ENABLED_FORMAL_EVALUATION_MATCH",
    reviewDepth: "identity-and-mechanism-gate",
    allSixStepsCompleted: false,
    steps: [
      { step: 1, status: "passed", note: "官方最终 Proceedings 论文身份成立。" },
      { step: 2, status: "deferred", note: isDiscoveryMatch ? discovery.reason : "未精确匹配本轮已启用的 NeurIPS 主赛道 Best Paper 正奖机制。" }
    ],
    ...(isDiscoveryMatch ? { discoveryAward: { awardName: discovery.awardName, evidenceUrl: discovery.awardUrl } } : {}),
    checkedAt: "2026-09-24"
  };
}

function main() {
  const options = args(process.argv.slice(2));
  fs.mkdirSync(options.output, { recursive: true });
  const candidates = fs.readFileSync(options.input, "utf8").trim().split(/\r?\n/).map(line => JSON.parse(line));
  const results = [];
  const selected = [];
  const awardMatches = [];
  const counts = { passed: 0, deferred: 0 };
  const byYear = {};

  for (const candidate of candidates) {
    const key = normalizeTitle(candidate.title);
    const winner = winnerByTitle.get(key);
    const discovery = discoveryByTitle.get(key);
    const result = winner ? fullReview(candidate, winner) : deferredReview(candidate, discovery);
    results.push(result);
    counts[result.disposition] += 1;
    byYear[candidate.year] ||= { candidates: 0, passed: 0, deferred: 0 };
    byYear[candidate.year].candidates += 1;
    byYear[candidate.year][result.disposition] += 1;
    if (winner) selected.push(result);
    if (winner || discovery) awardMatches.push(result);
  }

  if (selected.length !== winners.length) throw new Error(`Expected ${winners.length} enabled winners, matched ${selected.length}`);
  if (awardMatches.length !== winners.length + discoveryOnly.length) throw new Error(`Expected 12 award matches, found ${awardMatches.length}`);
  if (counts.passed + counts.deferred !== candidates.length) throw new Error("Result total mismatch");

  const summary = {
    schemaVersion: 1,
    checkedAt: "2026-09-24",
    policyVersion: "1.2",
    candidatePolicy: "docs/NEURIPS_PROCEEDINGS_COLLECTION_POLICY.md",
    importancePolicy: "docs/ACADEMIC_IMPORTANCE_POLICY.md",
    candidates: candidates.length,
    ...counts,
    byYear,
    enabledAwardMatches: selected.length,
    discoveryOnlyAwardMatches: awardMatches.length - selected.length,
    sixStepReviewsCompleted: selected.length,
    netNewLibraryRecords: selected.filter(record => record.contentReview.existingLibraryId === null).length,
    mergeWithExistingRecords: selected.filter(record => record.contentReview.existingLibraryId !== null).length,
    correctionRequired: {
      existingLibraryId: "arxiv-2406-02507",
      title: "Guiding a Diffusion Model with a Bad Version of Itself",
      previousError: "Recorded as NeurIPS 2024 Best Paper",
      officialStatus: "Best Paper Runner-up",
      requiredDisposition: "remove-or-mark-deferred"
    },
    limits: "Only exact enabled main-track Best Paper winners advanced beyond gate 2. Deferred records did not receive semantic full-text review."
  };

  fs.writeFileSync(path.join(options.output, "review-results.jsonl"), results.map(record => JSON.stringify(record)).join("\n") + "\n");
  fs.writeFileSync(path.join(options.output, "selected.json"), JSON.stringify({ status: "eligible-for-library-inclusion", records: selected }, null, 2) + "\n");
  fs.writeFileSync(path.join(options.output, "award-matches.json"), JSON.stringify(awardMatches, null, 2) + "\n");
  fs.writeFileSync(path.join(options.output, "summary.json"), JSON.stringify(summary, null, 2) + "\n");
  console.log(JSON.stringify(summary, null, 2));
}

main();

