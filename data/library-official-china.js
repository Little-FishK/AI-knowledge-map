/* 中国前沿实验室官方技术资料——只保留知识增量或品牌差异证据。 */
(function () {
  if (!window.PRO_LIBRARY || !Array.isArray(window.PRO_LIBRARY.items)) return;
  const reviewedAt = "2026-09-24";
  const rows = [
    ["deepseek", "DeepSeek", "deepseek-v3-repo", "DeepSeek-V3 官方仓库", "https://github.com/deepseek-ai/DeepSeek-V3", "官方仓库", ["moe", "attention", "pretraining"], "集中披露 MLA、MoE、FP8 训练和多 token 预测等架构与训练细节。", "是 DeepSeek 高效基础模型路线的代表性原件。"],
    ["deepseek", "DeepSeek", "deepseek-r1-repo", "DeepSeek-R1 官方仓库", "https://github.com/deepseek-ai/DeepSeek-R1", "官方仓库", ["reasoning-models", "cot", "rlhf"], "说明通过强化学习形成推理能力及其蒸馏模型谱系。", "是 DeepSeek 推理模型路线的核心一手资料。"],
    ["deepseek", "DeepSeek", "deepseek-ocr-repo", "DeepSeek-OCR 官方仓库", "https://github.com/deepseek-ai/DeepSeek-OCR", "官方仓库", ["multimodal", "context-compaction", "tokenization"], "展示视觉文本压缩、OCR 与上下文压缩相结合的路线。", "代表 DeepSeek 在长文档视觉压缩上的差异化探索。"],
    ["deepseek", "DeepSeek", "deepseek-context-caching-doc", "上下文硬盘缓存（Context Caching）", "https://api-docs.deepseek.com/guides/kv_cache/", "开发者指南", ["prompt-caching", "inference-optimization"], "解释持久化前缀缓存的命中、计费和使用边界。", "用于核对 DeepSeek 缓存机制的品牌特有行为。"]
  ];
  window.PRO_LIBRARY.items.push(...rows.map(([sourceSubcategory, publisher, id, title, url, contentKind, linkedNodes, knowledgeDelta, brandEvidenceDelta]) => ({
    id, sourceClass: "official", sourceSubcategory, title, publisher,
    collection: `${publisher} 官方技术资料`, contentKind, authorityTier: "A1",
    reviewStatus: "知识矩阵审核通过", reviewPolicy: "official-knowledge-matrix-v1", reviewedAt,
    primarySource: true, discoveryOnly: false, url, accessedAt: reviewedAt,
    summary: `${knowledgeDelta}${brandEvidenceDelta}`,
    selectionReason: `知识增量：${knowledgeDelta} 品牌证据增量：${brandEvidenceDelta}`,
    knowledgeDelta, brandEvidenceDelta,
    evidenceUse: "可支持该发布者当前技术、模型或项目事实；跨品牌结论仍需独立对照资料。",
    limitations: ["官方资料只直接证明本发布者的实现与声明", "仓库、模型和接口会迭代，使用前应复核版本"],
    tags: [sourceSubcategory, contentKind, "官方技术资料"], linkedNodes, linkedSoftware: []
  })));
})();
