/* OpenReview 候选池的正式收录包。
 * 仅发布已通过学术重要性六步审核的论文；原文使用 ICLR 最终论文集入口，
 * 奖项与逐篇审核依据见 docs/OPENREVIEW_ICLR_2024_2026_REVIEW_RESULT_20260924.md。 */
(function () {
  "use strict";
  const library = window.PRO_LIBRARY;
  if (!library || !Array.isArray(library.items)) throw new Error("OpenReview 资料包需要先加载资料库");

  const entries = [
    {
      id: "openreview-iclr-2024-07cf32cf61224da628157b7ed0ce994a",
      sourceClass: "academic",
      sourceSubcategory: "openreview",
      title: "Never Train from Scratch: Fair Comparison of Long-Sequence Models Requires Data-Driven Priors",
      publisher: "Ido Amos、Jonathan Berant、Ankit Gupta",
      collection: "OpenReview · ICLR 2024 Outstanding Paper",
      contentKind: "研究论文",
      authorityTier: "R",
      reviewStatus: "六步审核通过；ICLR 2024 Outstanding Paper；未独立复现",
      primarySource: true,
      discoveryOnly: false,
      url: "https://proceedings.iclr.cc/paper_files/paper/2024/hash/07cf32cf61224da628157b7ed0ce994a-Abstract-Conference.html",
      accessedAt: "2026-09-24",
      summary: "比较从头训练与数据驱动预训练后的长序列模型，指出随机初始化会夸大 Transformer 与状态空间模型之间的架构差异。",
      selectionReason: "获 ICLR 2024 Outstanding Paper。奖项委员会认为，预训练和微调带来的显著增益说明从头训练会系统性低估长序列架构，改变了公平比较架构所需的方法条件。",
      evidenceUse: "可用于核对长序列架构比较中的训练先验、预训练设置及其限定实验结果；重要性依据来自 ICLR 2024 Outstanding Paper 委员会评语。",
      limitations: [
        "结论受所比较模型、数据先验和训练设置约束，不能推出所有长序列任务中的架构差异都可忽略。",
        "本站链接到 ICLR 最终论文记录并概述获奖依据；未独立复现实验。"
      ],
      tags: ["前沿研究", "长序列建模", "状态空间模型", "模型评测"],
      linkedNodes: ["transformer", "state-space-models", "model-evaluation"],
      linkedSoftware: [],
      reviewEvidence: {
        url: "https://blog.iclr.cc/2024/05/06/iclr-2024-outstanding-paper-awards/",
        sections: "对应论文的 Outstanding Paper 委员会评语与 ICLR 最终论文摘要",
        checkedAt: "2026-09-24"
      }
    },
    {
      id: "openreview-iclr-2024-0b408293619f725fd30162af057e531a",
      sourceClass: "academic",
      sourceSubcategory: "openreview",
      title: "Vision Transformers Need Registers",
      publisher: "Timothée Darcet、Maxime Oquab、Julien Mairal、Piotr Bojanowski",
      collection: "OpenReview · ICLR 2024 Outstanding Paper",
      contentKind: "研究论文",
      authorityTier: "R",
      reviewStatus: "六步审核通过；ICLR 2024 Outstanding Paper；未独立复现",
      primarySource: true,
      discoveryOnly: false,
      url: "https://proceedings.iclr.cc/paper_files/paper/2024/hash/0b408293619f725fd30162af057e531a-Abstract-Conference.html",
      accessedAt: "2026-09-24",
      summary: "识别视觉 Transformer 特征图中的高范数伪影，并加入 register token 承接内部计算，以改善特征图和注意力图。",
      selectionReason: "获 ICLR 2024 Outstanding Paper。奖项委员会确认论文揭示了具体的 ViT 特征图问题，提出可解释假设与简洁的 register token 修正，并指出其影响超出单一评测任务。",
      evidenceUse: "可用于核对视觉 Transformer 中高范数 token 的诊断、register token 方案和论文报告的下游结果；重要性依据来自 ICLR 2024 Outstanding Paper 委员会评语。",
      limitations: [
        "证据支持视觉 Transformer 中的诊断与修正，不代表 register token 会改善所有 Transformer 架构。",
        "本站链接到 ICLR 最终论文记录并概述获奖依据；未独立复现实验。"
      ],
      tags: ["前沿研究", "视觉 Transformer", "注意力机制", "特征表示"],
      linkedNodes: ["transformer", "attention", "cnn"],
      linkedSoftware: [],
      reviewEvidence: {
        url: "https://blog.iclr.cc/2024/05/06/iclr-2024-outstanding-paper-awards/",
        sections: "对应论文的 Outstanding Paper 委员会评语与 ICLR 最终论文摘要",
        checkedAt: "2026-09-24"
      }
    },
    {
      id: "openreview-iclr-2024-c4d66eae503694424123b93ac0fbaf17",
      sourceClass: "academic",
      sourceSubcategory: "openreview",
      title: "Learning Interactive Real-World Simulators",
      publisher: "Sherry Yang、Yilun Du、Seyed Ghasemipour、Jonathan Tompson、Leslie Kaelbling、Dale Schuurmans、Pieter Abbeel",
      collection: "OpenReview · ICLR 2024 Outstanding Paper",
      contentKind: "研究论文",
      authorityTier: "R",
      reviewStatus: "六步审核通过；ICLR 2024 Outstanding Paper；未独立复现",
      primarySource: true,
      discoveryOnly: false,
      url: "https://proceedings.iclr.cc/paper_files/paper/2024/hash/c4d66eae503694424123b93ac0fbaf17-Abstract-Conference.html",
      accessedAt: "2026-09-24",
      summary: "通过整合图像、机器人与导航等异构数据训练 UniSim，以视觉结果响应自然语言指令或低层控制，并用于训练规划器和策略。",
      selectionReason: "获 ICLR 2024 Outstanding Paper。奖项委员会将 UniSim 评价为把异构机器人数据通过统一视觉与语言控制接口汇入基础模型训练的重要一步。",
      evidenceUse: "可用于核对 UniSim 的异构数据编排、交互式生成接口及论文报告的模拟训练迁移结果；重要性依据来自 ICLR 2024 Outstanding Paper 委员会评语。",
      limitations: [
        "论文展示的是特定数据与任务下的模拟和迁移结果，不能描述为已实现普适、准确的现实世界模拟。",
        "本站链接到 ICLR 最终论文记录并概述获奖依据；未独立复现实验。"
      ],
      tags: ["前沿研究", "世界模型", "具身智能", "强化学习"],
      linkedNodes: ["world-models", "multimodal", "reinforcement-learning"],
      linkedSoftware: [],
      reviewEvidence: {
        url: "https://blog.iclr.cc/2024/05/06/iclr-2024-outstanding-paper-awards/",
        sections: "对应论文的 Outstanding Paper 委员会评语与 ICLR 最终论文摘要",
        checkedAt: "2026-09-24"
      }
    },
    {
      id: "openreview-iclr-2024-cbaf319a4712385b5ba8a414808b5713",
      sourceClass: "academic",
      sourceSubcategory: "openreview",
      title: "Generalization in diffusion models arises from geometry-adaptive harmonic representations",
      publisher: "Zahra Kadkhodaie、Florentin Guth、Eero Simoncelli、Stéphane Mallat",
      collection: "OpenReview · ICLR 2024 Outstanding Paper",
      contentKind: "研究论文",
      authorityTier: "R",
      reviewStatus: "六步审核通过；ICLR 2024 Outstanding Paper；未独立复现",
      primarySource: true,
      discoveryOnly: false,
      url: "https://proceedings.iclr.cc/paper_files/paper/2024/hash/cbaf319a4712385b5ba8a414808b5713-Abstract-Conference.html",
      accessedAt: "2026-09-24",
      summary: "从得分函数与去噪器表征分析图像扩散模型为何能超出训练样本泛化，并把归纳偏置联系到几何自适应谐波基。",
      selectionReason: "获 ICLR 2024 Outstanding Paper。奖项委员会认为论文补足了扩散模型何时泛化而非记忆的关键理解，并将结果联系到架构归纳偏置和谐波表征。",
      evidenceUse: "可用于核对所研究图像扩散设置中的泛化现象、得分函数比较和几何自适应谐波表征分析；重要性依据来自 ICLR 2024 Outstanding Paper 委员会评语。",
      limitations: [
        "证据限定于论文研究的图像扩散和去噪设置，不能推广为所有扩散模型都不会记忆训练数据。",
        "本站链接到 ICLR 最终论文记录并概述获奖依据；未独立复现实验。"
      ],
      tags: ["前沿研究", "扩散模型", "泛化", "归纳偏置"],
      linkedNodes: ["diffusion", "image-generation", "overfitting"],
      linkedSoftware: [],
      reviewEvidence: {
        url: "https://blog.iclr.cc/2024/05/06/iclr-2024-outstanding-paper-awards/",
        sections: "对应论文的 Outstanding Paper 委员会评语与 ICLR 最终论文摘要",
        checkedAt: "2026-09-24"
      }
    },
    {
      id: "openreview-iclr-2026-59f6421e64707225fdf5b28840679a07",
      sourceClass: "academic",
      sourceSubcategory: "openreview",
      title: "LLMs Get Lost In Multi-Turn Conversation",
      publisher: "Philippe Laban、Hiroaki Hayashi、Yingbo Zhou、Jennifer Neville",
      collection: "OpenReview · ICLR 2026 Outstanding Paper",
      contentKind: "研究论文",
      authorityTier: "R",
      reviewStatus: "六步审核通过；ICLR 2026 Outstanding Paper；未独立复现",
      primarySource: true,
      discoveryOnly: false,
      url: "https://proceedings.iclr.cc/paper_files/paper/2026/hash/59f6421e64707225fdf5b28840679a07-Abstract-Conference.html",
      accessedAt: "2026-09-24",
      summary: "用大规模模拟对比单轮与多轮任务，报告所测 LLM 在多轮欠明确指令下性能下降，并将主要问题归因于可靠性而非能力本身。",
      selectionReason: "获 ICLR 2026 Outstanding Paper。委员会确认训练数据与多轮部署之间存在重要错位，并肯定其可扩展评测方法及在欠明确交互中测得的明显可靠性下降。",
      evidenceUse: "可用于核对单轮与多轮评测设计、性能下降分解和错误恢复现象；重要性依据来自 ICLR 2026 Outstanding Paper 委员会评语。",
      limitations: [
        "结果受所测模型、生成任务和交互模拟设计约束；委员会同时记录了模型版本偏旧的问题。",
        "本站链接到 ICLR 最终论文记录并概述获奖依据；未独立复现实验。"
      ],
      tags: ["前沿研究", "大语言模型 LLM", "多轮对话", "模型评测"],
      linkedNodes: ["llm", "model-evaluation", "context-window"],
      linkedSoftware: [],
      reviewEvidence: {
        url: "https://blog.iclr.cc/2026/04/23/announcing-the-iclr-2026-outstanding-papers/",
        sections: "对应论文的 Outstanding Paper 委员会评语与 ICLR 最终论文摘要",
        checkedAt: "2026-09-24"
      }
    }
  ];

  const existingIds = new Set(library.items.flatMap(item => [item, ...(item.relatedMaterials || [])]).map(item => item.id));
  const existingTitles = new Set(library.items.flatMap(item => [item, ...(item.relatedMaterials || [])]).map(item => item.title.toLocaleLowerCase()));
  entries.forEach(entry => {
    if (existingIds.has(entry.id)) throw new Error(`OpenReview 资料 id 重复：${entry.id}`);
    if (existingTitles.has(entry.title.toLocaleLowerCase())) throw new Error(`OpenReview 论文重复：${entry.title}`);
  });
  library.items.push(...entries);
})();
