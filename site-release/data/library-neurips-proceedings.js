/* NeurIPS Proceedings 正式收录包。
 * 五篇均通过学术重要性六步审核；四篇与既有 arXiv 卡片合并，避免重复展示。
 * 逐篇依据见 docs/NEURIPS_PROCEEDINGS_2024_2026_REVIEW_RESULT_20260924.md。 */
(function () {
  "use strict";
  const library = window.PRO_LIBRARY;
  if (!library || !Array.isArray(library.items)) throw new Error("NeurIPS Proceedings 资料包需要先加载资料库");

  const entries = [
    {
      id: "neurips-2024-9a24e284b187f662681440ba15c416fb",
      sourceClass: "academic",
      sourceSubcategory: "neurips-proceedings",
      title: "Visual Autoregressive Modeling: Scalable Image Generation via Next-Scale Prediction",
      publisher: "Keyu Tian、Yi Jiang、Zehuan Yuan、Bingyue Peng、Liwei Wang",
      collection: "NeurIPS 2024 · Main Conference · Best Paper",
      contentKind: "研究论文",
      authorityTier: "R",
      reviewStatus: "六步审核通过；NeurIPS 2024 主赛道 Best Paper；未独立复现",
      primarySource: true,
      discoveryOnly: false,
      url: "https://proceedings.neurips.cc/paper_files/paper/2024/hash/9a24e284b187f662681440ba15c416fb-Abstract-Conference.html",
      publishedAt: "2024-12-10",
      accessedAt: "2026-09-24",
      summary: "把图像自回归生成从栅格顺序的下一 token 预测改写为由粗到细的下一尺度预测，并给出效率、生成质量与缩放实验。",
      selectionReason: "NeurIPS 2024 主赛道 Best Paper。委员会突出其新视觉自回归范式、多尺度 VQ-VAE、生成效率和缩放证据。",
      evidenceUse: "可用于核对下一尺度视觉自回归方法、实验范围和 NeurIPS 正奖评价；与既有 arXiv 卡片合并展示。",
      limitations: [
        "证据限于论文所评估的图像生成设置，不能外推为对所有扩散模型或视觉任务普遍占优。",
        "本站仅提供书目信息、原文入口与原创短评，未独立复现实验。"
      ],
      tags: ["前沿研究", "NeurIPS Best Paper", "视觉自回归", "图像生成"],
      linkedNodes: ["image-generation", "model-families", "scaling-law"],
      linkedSoftware: [],
      reviewEvidence: {
        url: "https://blog.neurips.cc/2024/12/10/announcing-the-neurips-2024-best-paper-awards/",
        sections: "Best papers for the main track；对应论文委员会评语与 Proceedings 摘要",
        checkedAt: "2026-09-24"
      },
      existingLibraryId: "arxiv-2404-02905"
    },
    {
      id: "neurips-2024-dd2eb5250696753ea37141bbd89bb569",
      sourceClass: "academic",
      sourceSubcategory: "neurips-proceedings",
      title: "Stochastic Taylor Derivative Estimator: Efficient amortization for arbitrary differential operators",
      publisher: "Zekun Shi、Zheyuan Hu、Min Lin、Kenji Kawaguchi",
      collection: "NeurIPS 2024 · Main Conference · Best Paper",
      contentKind: "研究论文",
      authorityTier: "R",
      reviewStatus: "六步审核通过；NeurIPS 2024 主赛道 Best Paper；未独立复现",
      primarySource: true,
      discoveryOnly: false,
      url: "https://proceedings.neurips.cc/paper_files/paper/2024/hash/dd2eb5250696753ea37141bbd89bb569-Abstract-Conference.html",
      publishedAt: "2024-12-10",
      accessedAt: "2026-09-24",
      summary: "以随机 Taylor 导数估计器高效处理多变量函数的任意高阶导数张量收缩，使高维、高阶微分算子监督更可行。",
      selectionReason: "NeurIPS 2024 主赛道 Best Paper。委员会认为该方法同时缓解维数与导数阶数造成的计算困难，为高阶导数监督学习开辟新路径。",
      evidenceUse: "可用于核对 STDE、PINN 中高阶微分算子监督的计算方法，以及论文和委员会限定的效率结论。",
      limitations: [
        "最强证据来自 PINN 和微分算子监督，不能表述为所有神经网络训练或反向传播的通用加速。",
        "论文报告的速度与内存收益依赖具体算子、实现、硬件和比较基线；本站未独立复现。"
      ],
      tags: ["前沿研究", "NeurIPS Best Paper", "高阶自动微分", "PINN"],
      linkedNodes: ["backprop", "supervised-learning", "inference-optimization"],
      linkedSoftware: [],
      reviewEvidence: {
        url: "https://blog.neurips.cc/2024/12/10/announcing-the-neurips-2024-best-paper-awards/",
        sections: "Best papers for the main track；对应论文委员会评语、Proceedings 摘要与 arXiv v2",
        checkedAt: "2026-09-24"
      },
      existingLibraryId: null
    },
    {
      id: "neurips-2025-e74ee34cc0f2d0780f34ee77d8fba25b",
      sourceClass: "academic",
      sourceSubcategory: "neurips-proceedings",
      title: "1000 Layer Networks for Self-Supervised RL: Scaling Depth Can Enable New Goal-Reaching Capabilities",
      publisher: "Kevin Wang、Ishaan Javali、Michał Bortkiewicz、Tomasz Trzcinski、Benjamin Eysenbach",
      collection: "NeurIPS 2025 · Main Conference · Best Paper",
      contentKind: "研究论文",
      authorityTier: "R",
      reviewStatus: "六步审核通过；NeurIPS 2025 主赛道 Best Paper；未独立复现",
      primarySource: true,
      discoveryOnly: false,
      url: "https://proceedings.neurips.cc/paper_files/paper/2025/hash/e74ee34cc0f2d0780f34ee77d8fba25b-Abstract-Conference.html",
      publishedAt: "2025-11-26",
      accessedAt: "2026-09-24",
      summary: "研究自监督对比强化学习的深度扩展，报告网络加深至千层时性能提高并出现新的目标到达行为。",
      selectionReason: "NeurIPS 2025 主赛道 Best Paper。委员会认为论文挑战了强化学习无法有效训练超深网络的常见认识。",
      evidenceUse: "可用于核对自监督对比 RL 的深度扩展设置、能力变化和官方奖项评价；与既有 arXiv 卡片合并。",
      limitations: [
        "结果依赖对比式自监督 RL、批量缩放和所测模拟环境，不能外推到所有 RL 算法。",
        "本站未复现实验，不把网络深度本身描述为普遍充分条件。"
      ],
      tags: ["前沿研究", "NeurIPS Best Paper", "强化学习", "深度扩展"],
      linkedNodes: ["reinforcement-learning", "self-supervised-learning"],
      linkedSoftware: [],
      reviewEvidence: {
        url: "https://blog.neurips.cc/2025/11/26/announcing-the-neurips-2025-best-paper-awards/",
        sections: "对应论文 Reflections from the Selection Committee 与 Proceedings 摘要",
        checkedAt: "2026-09-24"
      },
      existingLibraryId: "arxiv-2503-14858"
    },
    {
      id: "neurips-2025-904e89bb4e632e75fb47f093b620b257",
      sourceClass: "academic",
      sourceSubcategory: "neurips-proceedings",
      title: "Gated Attention for Large Language Models: Non-linearity, Sparsity, and Attention-Sink-Free",
      publisher: "Zihan Qiu、Zekun Wang、Bo Zheng 等",
      collection: "NeurIPS 2025 · Main Conference · Best Paper",
      contentKind: "研究论文",
      authorityTier: "R",
      reviewStatus: "六步审核通过；NeurIPS 2025 主赛道 Best Paper；未独立复现",
      primarySource: true,
      discoveryOnly: false,
      url: "https://proceedings.neurips.cc/paper_files/paper/2025/hash/904e89bb4e632e75fb47f093b620b257-Abstract-Conference.html",
      publishedAt: "2025-11-26",
      accessedAt: "2026-09-24",
      summary: "系统比较门控软最大注意力变体，发现 SDPA 输出后的逐头 sigmoid 门控可改善训练稳定性、注意力汇聚和长上下文扩展。",
      selectionReason: "NeurIPS 2025 主赛道 Best Paper。委员会确认其大规模实验、易实现性和对注意力架构研究的推进价值。",
      evidenceUse: "可用于核对 SDPA 输出门控、注意力汇聚与长上下文实验，以及官方委员会的贡献定位；与既有 arXiv 卡片合并。",
      limitations: [
        "不能保证所有模型、数据与注意力变体均获得相同收益，也不能替代完整机制解释。",
        "本站未独立复现大规模训练实验。"
      ],
      tags: ["前沿研究", "NeurIPS Best Paper", "注意力机制", "长上下文"],
      linkedNodes: ["attention", "context-window", "llm"],
      linkedSoftware: [],
      reviewEvidence: {
        url: "https://blog.neurips.cc/2025/11/26/announcing-the-neurips-2025-best-paper-awards/",
        sections: "对应论文 Reflections from the Selection Committee 与 Proceedings 摘要",
        checkedAt: "2026-09-24"
      },
      existingLibraryId: "arxiv-2505-06708"
    },
    {
      id: "neurips-2025-ceb7f3cc876a6dcb15130a645b5a4507",
      sourceClass: "academic",
      sourceSubcategory: "neurips-proceedings",
      title: "Why Diffusion Models Don’t Memorize: The Role of Implicit Dynamical Regularization in Training",
      publisher: "Tony Bonnaire、Raphaël Urfin、Giulio Biroli、Marc Mezard",
      collection: "NeurIPS 2025 · Main Conference · Best Paper",
      contentKind: "研究论文",
      authorityTier: "R",
      reviewStatus: "六步审核通过；NeurIPS 2025 主赛道 Best Paper；未独立复现",
      primarySource: true,
      discoveryOnly: false,
      url: "https://proceedings.neurips.cc/paper_files/paper/2025/hash/ceb7f3cc876a6dcb15130a645b5a4507-Abstract-Conference.html",
      publishedAt: "2025-11-26",
      accessedAt: "2026-09-24",
      summary: "用泛化与记忆两个训练时间尺度解释扩散模型的隐式动力学正则化，并将经验观察连接到随机特征模型理论。",
      selectionReason: "NeurIPS 2025 主赛道 Best Paper。委员会将其定位为扩散模型隐式正则化动力学的基础性研究。",
      evidenceUse: "可用于核对扩散模型泛化—记忆时间尺度、理论适用条件和官方贡献评价；与既有 arXiv 卡片合并。",
      limitations: [
        "理论依赖可处理的随机特征模型，实验集中于所测 U-Net 与数据，不能理解为扩散模型永不记忆。",
        "本站未独立复现实验或逐项验证理论证明。"
      ],
      tags: ["前沿研究", "NeurIPS Best Paper", "扩散模型", "泛化与记忆"],
      linkedNodes: ["diffusion", "overfitting"],
      linkedSoftware: [],
      reviewEvidence: {
        url: "https://blog.neurips.cc/2025/11/26/announcing-the-neurips-2025-best-paper-awards/",
        sections: "对应论文 Reflections from the Selection Committee 与 Proceedings 摘要",
        checkedAt: "2026-09-24"
      },
      existingLibraryId: "arxiv-2505-17638"
    }
  ];

  const normalize = value => value.normalize("NFKC").replace(/[‘’]/g, "'").toLocaleLowerCase();
  const ids = new Set(library.items.flatMap(item => [item, ...(item.relatedMaterials || [])]).map(item => item.id));
  const urls = new Set(library.items.flatMap(item => [item, ...(item.relatedMaterials || [])]).map(item => item.url));
  entries.forEach(entry => {
    if (ids.has(entry.id)) throw new Error(`NeurIPS 资料 id 重复：${entry.id}`);
    if (urls.has(entry.url)) throw new Error(`NeurIPS 论文网址重复：${entry.url}`);
    if (entry.existingLibraryId) {
      const canonical = library.items.find(item => item.id === entry.existingLibraryId);
      if (!canonical || normalize(canonical.title) !== normalize(entry.title)) throw new Error(`NeurIPS 合并目标不一致：${entry.id}`);
      canonical.relatedMaterials = canonical.relatedMaterials || [];
      canonical.relatedMaterials.push(entry);
    } else {
      delete entry.existingLibraryId;
      library.items.push(entry);
    }
    ids.add(entry.id);
    urls.add(entry.url);
  });

  const corrected = library.items.find(item => item.id === "arxiv-2406-02507");
  if (!corrected) throw new Error("缺少需要纠错的 arXiv 记录：arxiv-2406-02507");
  corrected.discoveryOnly = true;
  corrected.reviewStatus = "重要性审核暂缓：NeurIPS 2024 Best Paper Runner-up；当前机制未启用 Runner-up；上线不代表通过";
  corrected.selectionReason = "官方公告将该论文列为 NeurIPS 2024 主赛道 Best Paper Runner-up，而非 Best Paper 正奖。旧审核的奖项分类有误，本条保留为发现材料，不再视为重要性通过。";
})();
