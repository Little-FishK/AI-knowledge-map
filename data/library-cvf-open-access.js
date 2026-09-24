/* CVF Open Access 正式奖项论文的公开待补证目录。
 * VGGT 已核实 CVF 终版身份与 CVPR 2025 Best Paper 正奖，
 * 但缺乏 AI 重大贡献外部说明；上线不代表六步重要性审核通过。 */
(function () {
  "use strict";
  const library = window.PRO_LIBRARY;
  if (!library || !Array.isArray(library.items)) throw new Error("CVF Open Access 资料包需要先加载资料库");

  const entry = {
    id: "cvf-2025-f69edf17a8c65f9bd269675d",
    sourceClass: "academic",
    sourceSubcategory: "cvf-open-access",
    title: "VGGT: Visual Geometry Grounded Transformer",
    publisher: "Jianyuan Wang、Minghao Chen、Nikita Karaev、Andrea Vedaldi、Christian Rupprecht、David Novotny",
    collection: "CVPR 2025 · Technical Papers · Best Paper",
    contentKind: "研究论文（待补证目录）",
    authorityTier: "R",
    reviewStatus: "重要性审核待补：缺乏 AI 重大贡献外部说明；上线不代表通过",
    primarySource: true,
    discoveryOnly: true,
    url: "https://openaccess.thecvf.com/content/CVPR2025/html/Wang_VGGT_Visual_Geometry_Grounded_Transformer_CVPR_2025_paper.html",
    publishedAt: "2025",
    accessedAt: "2026-09-24",
    summary: "该论文提出一个前馈网络，从一张、数张或大量场景图像直接预测相机参数、深度、点图和三维点轨迹。已核实其获得 CVPR 2025 Best Paper，但当前缺乏外部专业说明来证明其对 AI 发展构成重大贡献，因此只作为公开待补证入口。",
    selectionReason: "因精确匹配 cvpr-2025-best 而公开登记。CVPR Best Paper 正奖与 CVF 终版的题名、六位作者已经核实；现有官方获奖页没有提供足以满足本站门槛的重大 AI 贡献说明，作者摘要不能替代外部评价。",
    evidenceUse: "可用于核对论文身份、作者、CVPR 2025 Best Paper 结果及原文内容；当前不能作为本站已确认的 AI 重大贡献证据。",
    limitations: [
      "缺乏 AI 重大贡献外部说明；上线表示公开记录审核缺口，不表示六步重要性审核通过。",
      "正式奖项证明该评价机制下的认可；补齐外部专业说明前，不能据此宣称论文已经重大改变 AI。",
      "论文中的性能、速度与适用范围来自作者报告，本站未独立复现实验。"
    ],
    tags: ["待补证", "CVPR 2025", "Best Paper", "缺乏 AI 重大贡献外部说明", "三维视觉"],
    linkedNodes: ["world-models", "multimodal", "transformer"],
    linkedSoftware: [],
    citation: "Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 2025",
    reviewEvidence: {
      url: "https://cvpr.thecvf.com/Conferences/2025/BestPapersDemos",
      sections: "Best Paper / VGGT；CVF Open Access 终版记录及重要性证据缺口",
      checkedAt: "2026-09-24"
    },
    importanceReview: {
      status: "needs-evidence",
      mechanismId: "cvpr-2025-best",
      awardYear: 2025,
      officialResultUrl: "https://cvpr.thecvf.com/Conferences/2025/BestPapersDemos",
      evidenceGap: "External professional explanation explicitly supporting a major AI contribution."
    }
  };

  const allRecords = library.items.flatMap(item => [item, ...(item.relatedMaterials || [])]);
  if (allRecords.some(item => item.id === entry.id)) throw new Error(`CVF Open Access 资料 id 重复：${entry.id}`);
  if (allRecords.some(item => item.url === entry.url)) throw new Error(`CVF Open Access 论文网址重复：${entry.url}`);
  const normalize = value => value.normalize("NFKC").replace(/[‘’]/g, "'").toLocaleLowerCase();
  if (allRecords.some(item => normalize(item.title) === normalize(entry.title))) throw new Error(`CVF Open Access 论文题名重复：${entry.title}`);
  library.items.push(entry);
})();
