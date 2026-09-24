/* IEEE Xplore 正式奖项论文的公开待补证目录。
 * 四篇论文已核实 IEEE Xplore 正式记录与 ICRA Best Conference Paper 正奖，
 * 但缺乏 AI 重大贡献外部说明；上线不代表六步重要性审核通过。 */
(function () {
  "use strict";
  const library = window.PRO_LIBRARY;
  if (!library || !Array.isArray(library.items)) throw new Error("IEEE Xplore 资料包需要先加载资料库");

  const shared = {
    sourceClass: "academic",
    sourceSubcategory: "ieee-xplore",
    contentKind: "研究论文（待补证目录）",
    authorityTier: "R",
    reviewStatus: "重要性审核待补：缺乏 AI 重大贡献外部说明；上线不代表通过",
    primarySource: true,
    discoveryOnly: true,
    accessedAt: "2026-09-24",
    linkedSoftware: []
  };
  const award2024 = "https://ewh.ieee.org/soc/ras/conf/fullysponsored/icra/icra%202024/awards-and-finalists/index.html";
  const award2025 = "https://ewh.ieee.org/soc/ras/conf/fullysponsored/icra/ICRA2025/2025.ieee-icra.org/program/awards-and-finalists/index.html";
  const entries = [
    {
      ...shared,
      id: "ieee-10610665",
      title: "NoMaD: Goal Masked Diffusion Policies for Navigation and Exploration",
      publisher: "Ajay Sridhar、Dhruv Shah、Catherine Glossop、Sergey Levine",
      collection: "ICRA 2024 · Best Conference Paper",
      url: "https://ieeexplore.ieee.org/document/10610665/",
      publishedAt: "2024",
      summary: "该论文以目标掩码扩散策略统一面向目标的导航与未知环境探索。已核实其获得 ICRA 2024 Best Conference Paper，但官方奖项页未说明它为何构成 AI 发展的重大贡献，因此只作为公开待补证入口。",
      selectionReason: "因精确匹配 icra-2024-best-conference-paper 而公开登记。IEEE Xplore 论文身份、四位作者和 ICRA 正奖已经核实；作者摘要不能代替本站要求的外部重大贡献说明。",
      evidenceUse: "可用于核对论文身份、DOI、ICRA 2024 Best Conference Paper 结果及原文内容；当前不能作为本站已确认的 AI 重大贡献证据。",
      limitations: [
        "缺乏 AI 重大贡献外部说明；上线表示公开记录审核缺口，不表示六步重要性审核通过。",
        "正式奖项证明该评价机制下的认可，但奖项页没有提供委员会对 AI 重大影响的说明。",
        "论文中的能力与性能主张来自作者报告，本站未独立复现实验。"
      ],
      tags: ["待补证", "ICRA 2024", "Best Conference Paper", "缺乏 AI 重大贡献外部说明", "机器人导航"],
      linkedNodes: ["diffusion", "reinforcement-learning", "planning"],
      citation: "2024 IEEE International Conference on Robotics and Automation (ICRA), DOI: 10.1109/ICRA57147.2024.10610665",
      reviewEvidence: { url: award2024, sections: "Best Conference Paper / NoMaD；IEEE Xplore article 10610665 及重要性证据缺口", checkedAt: "2026-09-24" },
      importanceReview: { status: "needs-evidence", mechanismId: "icra-2024-best-conference-paper", awardYear: 2024, officialResultUrl: award2024, evidenceGap: "External professional explanation explicitly supporting a major AI contribution." }
    },
    {
      ...shared,
      id: "ieee-10611477",
      title: "Open X-Embodiment: Robotic Learning Datasets and RT-X Models",
      publisher: "Open X-Embodiment Collaboration",
      collection: "ICRA 2024 · Best Conference Paper",
      url: "https://ieeexplore.ieee.org/document/10611477/",
      publishedAt: "2024",
      summary: "该论文汇集跨机构机器人数据集，并研究在多种机器人形态上训练 RT-X 模型。已核实其获得 ICRA 2024 Best Conference Paper，但现有官方奖项材料未建立其对 AI 发展的重大贡献，因此只作为公开待补证入口。",
      selectionReason: "因精确匹配 icra-2024-best-conference-paper 而公开登记。IEEE Xplore 记录与 ICRA 正奖已经核实；论文及所属项目的自述不属于独立外部重大贡献证据。",
      evidenceUse: "可用于核对论文身份、DOI、协作团队、ICRA 2024 Best Conference Paper 结果及原文内容；当前不能作为本站已确认的 AI 重大贡献证据。",
      limitations: [
        "缺乏 AI 重大贡献外部说明；上线表示公开记录审核缺口，不表示六步重要性审核通过。",
        "正式奖项证明该评价机制下的认可，但奖项页没有解释其是否实质改变了 AI 或机器人学习。",
        "论文中的规模、迁移能力与性能主张来自作者报告，本站未独立复现实验。"
      ],
      tags: ["待补证", "ICRA 2024", "Best Conference Paper", "缺乏 AI 重大贡献外部说明", "机器人学习"],
      linkedNodes: ["multimodal", "reinforcement-learning", "world-models"],
      citation: "2024 IEEE International Conference on Robotics and Automation (ICRA), DOI: 10.1109/ICRA57147.2024.10611477",
      reviewEvidence: { url: award2024, sections: "Best Conference Paper / Open X-Embodiment；IEEE Xplore article 10611477 及重要性证据缺口", checkedAt: "2026-09-24" },
      importanceReview: { status: "needs-evidence", mechanismId: "icra-2024-best-conference-paper", awardYear: 2024, officialResultUrl: award2024, evidenceGap: "External professional explanation explicitly supporting a major AI contribution." }
    },
    {
      ...shared,
      id: "ieee-11128000",
      title: "Marginalizing and Conditioning Gaussians onto Linear Approximations of Smooth Manifolds with Applications in Robotics",
      publisher: "Zi Cong Guo、James R. Forbes、Timothy D. Barfoot",
      collection: "ICRA 2025 · Best Conference Paper",
      url: "https://ieeexplore.ieee.org/document/11128000/",
      publishedAt: "2025",
      summary: "该论文给出把高斯分布边缘化和条件化到流形线性近似上的闭式表达，并用于机器人约束优化中的不确定性估计。ICRA 2025 委员会说明了其机器人学贡献，但未明确建立其对 AI 发展的重大改变，因此只作为公开待补证入口。",
      selectionReason: "因精确匹配 icra-2025-best-conference-paper 而公开登记。IEEE Xplore 论文身份、三位作者和 ICRA 正奖已经核实；现有外部说明支持机器人学价值，但未达到本站的 AI 重大贡献门槛。",
      evidenceUse: "可用于核对论文身份、DOI、ICRA 2025 Best Conference Paper 结果及委员会给出的机器人学贡献说明；当前不能作为本站已确认的 AI 重大贡献证据。",
      limitations: [
        "缺乏 AI 重大贡献外部说明；上线表示公开记录审核缺口，不表示六步重要性审核通过。",
        "委员会说明支持其在机器人约束优化中的突出贡献，但没有明确认定其重大改变 AI 发展。",
        "论文中的数学性质与实验结果来自作者报告，本站未独立复现。"
      ],
      tags: ["待补证", "ICRA 2025", "Best Conference Paper", "缺乏 AI 重大贡献外部说明", "不确定性估计"],
      linkedNodes: ["uncertainty-calibration", "planning"],
      citation: "2025 IEEE International Conference on Robotics and Automation (ICRA), DOI: 10.1109/ICRA55743.2025.11128000",
      reviewEvidence: { url: award2025, sections: "Best Conference Paper / Marginalizing and Conditioning Gaussians；IEEE Xplore article 11128000 及重要性证据缺口", checkedAt: "2026-09-24" },
      importanceReview: { status: "needs-evidence", mechanismId: "icra-2025-best-conference-paper", awardYear: 2025, officialResultUrl: award2025, evidenceGap: "External professional explanation explicitly supporting a major AI contribution." }
    },
    {
      ...shared,
      id: "ieee-11128482",
      title: "MAC-VO: Metrics-Aware Covariance for Learning-Based Stereo Visual Odometry",
      publisher: "Yuheng Qiu、Yutian Chen、Zihao Zhang、Wenshan Wang、Sebastian Scherer",
      collection: "ICRA 2025 · Best Conference Paper",
      url: "https://ieeexplore.ieee.org/document/11128482/",
      publishedAt: "2025",
      summary: "该论文提出学习式度量感知协方差模型，用于立体视觉里程计中的关键点选择和残差加权。ICRA 2025 委员会说明了其鲁棒性与准确性贡献，但现有外部材料未证明它构成 AI 发展的重大贡献，因此只作为公开待补证入口。",
      selectionReason: "因精确匹配 icra-2025-best-conference-paper 而公开登记。IEEE Xplore 论文身份、五位作者和 ICRA 正奖已经核实；委员会说明仍指向边界明确的机器人视觉改进。",
      evidenceUse: "可用于核对论文身份、DOI、ICRA 2025 Best Conference Paper 结果及委员会给出的贡献说明；当前不能作为本站已确认的 AI 重大贡献证据。",
      limitations: [
        "缺乏 AI 重大贡献外部说明；上线表示公开记录审核缺口，不表示六步重要性审核通过。",
        "委员会确认其改善视觉里程计的鲁棒性与准确性，但没有明确认定其重大改变 AI 发展。",
        "论文中的性能与适用范围来自作者报告，本站未独立复现实验。"
      ],
      tags: ["待补证", "ICRA 2025", "Best Conference Paper", "缺乏 AI 重大贡献外部说明", "视觉里程计"],
      linkedNodes: ["uncertainty-calibration", "self-supervised-learning"],
      citation: "2025 IEEE International Conference on Robotics and Automation (ICRA), DOI: 10.1109/ICRA55743.2025.11128482",
      reviewEvidence: { url: award2025, sections: "Best Conference Paper / MAC-VO；IEEE Xplore article 11128482 及重要性证据缺口", checkedAt: "2026-09-24" },
      importanceReview: { status: "needs-evidence", mechanismId: "icra-2025-best-conference-paper", awardYear: 2025, officialResultUrl: award2025, evidenceGap: "External professional explanation explicitly supporting a major AI contribution." }
    }
  ];

  const allRecords = library.items.flatMap(item => [item, ...(item.relatedMaterials || [])]);
  const normalize = value => value.normalize("NFKC").replace(/[‘’]/g, "'").toLocaleLowerCase();
  for (const entry of entries) {
    if (allRecords.some(item => item.id === entry.id)) throw new Error(`IEEE Xplore 资料 id 重复：${entry.id}`);
    if (allRecords.some(item => item.url === entry.url)) throw new Error(`IEEE Xplore 论文网址重复：${entry.url}`);
    if (allRecords.some(item => normalize(item.title) === normalize(entry.title))) throw new Error(`IEEE Xplore 论文题名重复：${entry.title}`);
    allRecords.push(entry);
    library.items.push(entry);
  }
})();
