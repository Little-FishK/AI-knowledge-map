/* ACM Digital Library 正式奖项论文的公开待补证目录。
 * 九篇论文已核实 ACM DOI 与 SIGIR、FAccT 或 SIGGRAPH 2025 正奖，
 * 但没有 AI 重大贡献外部说明；上线不代表六步重要性审核通过。 */
(function () {
  "use strict";
  const library = window.PRO_LIBRARY;
  if (!library || !Array.isArray(library.items)) throw new Error("ACM Digital Library 资料包需要先加载资料库");

  const awardUrls = {
    "sigir-2025-best": "https://sigir.org/awards/best-paper-awards/",
    "facct-2025-best": "https://facctconference.org/2025/awards.html",
    "siggraph-2025-best": "https://blog.siggraph.org/2025/06/siggraph-2025-technical-papers-awards-best-papers-honorable-mentions-and-test-of-time.html/"
  };
  const raw = [
    ["acm-3726302-3729904", "WARP: An Efficient Engine for Multi-Vector Retrieval", "Jan Luca Scheerer、Matei Zaharia、Christopher Potts、Gustavo Alonso、Omar Khattab", "10.1145/3726302.3729904", "SIGIR 2025 · Best Paper Award", "sigir-2025-best", "高效多向量检索引擎", ["retrieval", "reranking"]],
    ["acm-3715275-3732137", "A Framework for Auditing Chatbots for Dialect-Based Quality-of-Service Harms", "Emma Harvey、Rene F. Kizilcec、Allison Koenecke", "10.1145/3715275.3732137", "FAccT 2025 · Best Paper Award", "facct-2025-best", "审计聊天机器人对不同方言的服务质量差异", ["model-evaluation", "bias-fairness"]],
    ["acm-3715275-3732170", "External Evaluation of Discrimination Mitigation Efforts in Meta's Ad Delivery", "Basileal Imana、Zeyu Shen、John Heidemann、Aleksandra Korolova", "10.1145/3715275.3732170", "FAccT 2025 · Best Paper Award", "facct-2025-best", "外部评估广告投放中的歧视缓解措施", ["bias-fairness", "governance"]],
    ["acm-3715275-3732202", "“You Cannot Sound Like GPT\": Signs of language discrimination and resistance in computer science publishing", "Haley Lepp、Daniel Scott Smith", "10.1145/3715275.3732202", "FAccT 2025 · Best Paper Award", "facct-2025-best", "生成式语言技术与计算机科学出版中的语言歧视", ["llm", "bias-fairness", "governance"]],
    ["acm-3731148", "Shape Space Spectra", "Yue Chang、Otman Benchekroun、Maurizio M. Chiaramonte、Peter Yichen Chen、Eitan Grinspun", "10.1145/3731148", "SIGGRAPH 2025 · Technical Papers · Best Paper", "siggraph-2025-best", "连续参数化形状族的形状空间谱分析", ["dimensionality-reduction"]],
    ["acm-3730841", "CAST: Component-Aligned 3D Scene Reconstruction from an RGB Image", "Kaixin Yao、Longwen Zhang、Xinhao Yan、Yan Zeng、Qixuan Zhang、Lan Xu、Wei Yang、Jiayuan Gu、Jingyi Yu", "10.1145/3730841", "SIGGRAPH 2025 · Technical Papers · Best Paper", "siggraph-2025-best", "由单张 RGB 图像进行组件对齐的三维场景重建", ["multimodal", "world-models"]],
    ["acm-3730843", "TokenVerse: Versatile Multi-concept Personalization in Token Modulation Space", "Daniel Garibi、Shahar Yadin、Roni Paiss、Omer Tov、Shiran Zada、Ariel Ephrat、Tomer Michaeli、Inbar Mosseri、Tali Dekel", "10.1145/3730843", "SIGGRAPH 2025 · Technical Papers · Best Paper", "siggraph-2025-best", "生成模型 token 调制空间中的多概念个性化", ["image-generation", "transformer"]],
    ["acm-3731175", "Vector-Valued Monte Carlo Integration Using Ratio Control Variates", "Haolin Lu、Delio Vicini、Wesley Chang、Tzu-Mao Li", "10.1145/3731175", "SIGGRAPH 2025 · Technical Papers · Best Paper", "siggraph-2025-best", "利用比率控制变量进行向量值蒙特卡洛积分", ["uncertainty-calibration"]],
    ["acm-3730937", "Transformer IMU Calibrator: Dynamic On-body IMU Calibration for Inertial Motion Capture", "Chengxu Zuo、Jiawei Huang、Xiao Jiang、Yuan Yao、Xiangren Shi、Rui Cao、Xinyu Yi、Feng Xu、Shihui Guo、Yipeng Qin", "10.1145/3730937", "SIGGRAPH 2025 · Technical Papers · Best Paper", "siggraph-2025-best", "面向惯性动作捕捉的动态在身 IMU 校准", ["transformer"]]
  ];

  const entries = raw.map(([id, title, authors, doi, award, mechanismId, topic, linkedNodes]) => ({
    id,
    sourceClass: "academic",
    sourceSubcategory: "acm-dl",
    title,
    publisher: authors,
    collection: `ACM Digital Library · ${award}`,
    contentKind: "研究论文（待补证目录）",
    authorityTier: "R",
    reviewStatus: "重要性审核待补：没有 AI 重大贡献外部说明；上线不代表通过",
    primarySource: true,
    discoveryOnly: true,
    url: `https://dl.acm.org/doi/${doi}`,
    publishedAt: "2025",
    accessedAt: "2026-09-24",
    summary: `该论文研究${topic}。已核实 ACM DOI 与 ${award} 正奖身份，但当前没有外部专业说明证明其对 AI 发展构成重大贡献，因此只作为公开待补证入口。`,
    selectionReason: `因精确匹配 ${mechanismId} 而公开登记。正式奖项与 ACM 论文身份已经核实；现有官方材料不足以满足本站的 AI 重大贡献外部证据门槛。`,
    evidenceUse: "可用于核对 ACM 论文身份、作者、正式奖项与原文；当前不能作为本站已确认的 AI 重大贡献证据。",
    limitations: [
      "没有 AI 重大贡献外部说明；上线表示公开记录审核缺口，不表示六步重要性审核通过。",
      "正式奖项证明该评价机制下的认可；补齐外部专业说明前，不能据此宣称论文已经重大改变 AI。",
      "论文中的技术能力、性能和适用范围来自作者报告，本站未独立复现。"
    ],
    tags: ["待补证", "ACM 2025", award.split(" · ").at(-1), "没有 AI 重大贡献外部说明"],
    linkedNodes,
    linkedSoftware: [],
    citation: `Association for Computing Machinery, 2025, DOI: ${doi}`,
    reviewEvidence: {
      url: awardUrls[mechanismId],
      sections: `${award} 正式名单、ACM DOI 记录及重要性证据缺口`,
      checkedAt: "2026-09-24"
    },
    importanceReview: {
      status: "needs-evidence",
      mechanismId,
      awardYear: 2025,
      officialResultUrl: awardUrls[mechanismId],
      evidenceGap: "External professional explanation explicitly supporting a major AI contribution."
    }
  }));

  const records = library.items.flatMap(item => [item, ...(item.relatedMaterials || [])]);
  const ids = new Set(records.map(item => item.id));
  const urls = new Set(records.map(item => item.url));
  const normalize = value => value.normalize("NFKC").replace(/[‘’]/g, "'").toLocaleLowerCase();
  const titles = new Set(records.map(item => normalize(item.title)));
  for (const entry of entries) {
    if (ids.has(entry.id)) throw new Error(`ACM Digital Library 资料 id 重复：${entry.id}`);
    if (urls.has(entry.url)) throw new Error(`ACM Digital Library 论文网址重复：${entry.url}`);
    if (titles.has(normalize(entry.title))) throw new Error(`ACM Digital Library 论文题名重复：${entry.title}`);
    ids.add(entry.id); urls.add(entry.url); titles.add(normalize(entry.title));
  }
  library.items.push(...entries);
})();

