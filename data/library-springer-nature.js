/* Springer Nature 正式收录论文。
 * 本批论文已经通过评价机制、论文身份、当前状态、AI 重大贡献外部证据与内容价值六步审核。 */
(function () {
  "use strict";
  const library = window.PRO_LIBRARY;
  if (!library || !Array.isArray(library.items)) throw new Error("Springer Nature 资料包需要先加载资料库");

  const entry = {
    id: "springer-nature-1007-978-3-031-73039-9-19",
    sourceClass: "academic",
    sourceSubcategory: "springer-nature",
    title: "Minimalist Vision with Freeform Pixels",
    publisher: "Jeremy Klotz、Shree K. Nayar",
    collection: "Springer Nature · ECCV 2024 · Best Paper",
    contentKind: "研究论文",
    authorityTier: "R",
    reviewStatus: "重要性审核通过 · ECCV 2024 Best Paper",
    primarySource: true,
    discoveryOnly: false,
    url: "https://link.springer.com/chapter/10.1007/978-3-031-73039-9_19",
    publishedAt: "2024-10-31",
    accessedAt: "2026-09-24",
    summary: "该论文提出极简视觉系统：把相机硬件建模为神经网络第一层，由任务训练共同确定少量自由形状物理像素与后续推理网络，在极低传感规模下完成视觉任务，并兼顾隐私与自供能。",
    selectionReason: "论文是 ECCV 2024 主会唯一 Best Paper。ECCV 官方颁奖材料明确将其评价为一种新的视觉框架：用少量自由形状像素取代传统像素网格，支持多类视觉任务并改善隐私与可持续性；该外部评语同时说明了具体贡献及其在计算机视觉中的重要性。",
    evidenceUse: "用于理解学习式传感、计算成像、隐私保护视觉与边缘推理如何在硬件和模型之间联合设计。",
    limitations: [
      "Best Paper 证明 ECCV 2024 评价机制下的突出贡献，不表示论文全部结论永久正确或适用于所有视觉任务。",
      "本站核验了官方奖项、颁奖评语、Springer DOI 与公开论文材料；未独立复现实验。",
      "Springer 页面可能只提供摘要预览；本站仅展示元数据、审核结论与原始入口，不复制受限全文。"
    ],
    tags: ["ECCV 2024", "Best Paper", "计算机视觉", "学习式传感", "自由形状像素"],
    linkedNodes: ["neural-network", "cnn"],
    linkedSoftware: [],
    citation: "Klotz, J.; Nayar, S. K. Minimalist Vision with Freeform Pixels. ECCV 2024, LNCS 15122, 329–346. DOI: 10.1007/978-3-031-73039-9_19",
    reviewEvidence: {
      url: "https://eccv.ecva.net/media/eccv-2024/Slides/2822.pdf",
      sections: "ECCV 2024 official awards slides, Best Paper Award citation, PDF page 48（文件页码索引 47）",
      checkedAt: "2026-09-24"
    },
    importanceReview: {
      status: "passed",
      mechanismId: "eccv-2024-best",
      awardYear: 2024,
      officialResultUrl: "https://eccv.ecva.net/Conferences/2024/Awards",
      aiDevelopmentContribution: "supported",
      standingCheckedAt: "2026-09-24"
    },
    reproductionStatus: "未独立复现"
  };

  const records = library.items.flatMap(item => [item, ...(item.relatedMaterials || [])]);
  const normalize = value => value.normalize("NFKC").replace(/[‘’]/g, "'").toLocaleLowerCase();
  if (records.some(item => item.id === entry.id)) throw new Error(`Springer Nature 资料 id 重复：${entry.id}`);
  if (records.some(item => item.url === entry.url)) throw new Error(`Springer Nature 论文网址重复：${entry.url}`);
  if (records.some(item => normalize(item.title) === normalize(entry.title))) throw new Error(`Springer Nature 论文题名重复：${entry.title}`);
  library.items.push(entry);
})();
