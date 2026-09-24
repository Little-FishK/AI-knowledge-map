/* 中国前沿实验室官方技术资料——只保留知识增量或品牌差异证据。 */
(function () {
  if (!window.PRO_LIBRARY || !Array.isArray(window.PRO_LIBRARY.items)) return;
  const reviewedAt = "2026-09-24";
  const rows = [
    ["deepseek", "DeepSeek", "deepseek-v3-repo", "DeepSeek-V3 官方仓库", "https://github.com/deepseek-ai/DeepSeek-V3", "官方仓库", ["moe", "attention", "pretraining"], "集中披露 MLA、MoE、FP8 训练和多 token 预测等架构与训练细节。", "是 DeepSeek 高效基础模型路线的代表性原件。"],
    ["deepseek", "DeepSeek", "deepseek-r1-repo", "DeepSeek-R1 官方仓库", "https://github.com/deepseek-ai/DeepSeek-R1", "官方仓库", ["reasoning-models", "cot", "rlhf"], "说明通过强化学习形成推理能力及其蒸馏模型谱系。", "是 DeepSeek 推理模型路线的核心一手资料。"],
    ["deepseek", "DeepSeek", "deepseek-ocr-repo", "DeepSeek-OCR 官方仓库", "https://github.com/deepseek-ai/DeepSeek-OCR", "官方仓库", ["multimodal", "context-compaction", "tokenization"], "展示视觉文本压缩、OCR 与上下文压缩相结合的路线。", "代表 DeepSeek 在长文档视觉压缩上的差异化探索。"],
    ["deepseek", "DeepSeek", "deepseek-context-caching-doc", "上下文硬盘缓存（Context Caching）", "https://api-docs.deepseek.com/guides/kv_cache/", "开发者指南", ["prompt-caching", "inference-optimization"], "解释持久化前缀缓存的命中、计费和使用边界。", "用于核对 DeepSeek 缓存机制的品牌特有行为。"],

    ["qwen", "Qwen", "qwen3-repo", "Qwen3 官方仓库", "https://github.com/QwenLM/Qwen3", "官方仓库", ["llm", "moe", "reasoning-models"], "说明混合专家、思考与非思考模式以及模型谱系。", "作为 Qwen 通用语言模型路线的代表性原件。"],
    ["qwen", "Qwen", "qwen3-vl-repo", "Qwen3-VL 官方仓库", "https://github.com/QwenLM/Qwen3-VL", "官方仓库", ["multimodal", "llm", "computer-use"], "覆盖视觉语言理解、长视频与视觉代理能力。", "代表 Qwen 多模态模型的差异化贡献。"],
    ["qwen", "Qwen", "qwen-agent-framework", "Qwen-Agent 框架", "https://github.com/QwenLM/Qwen-Agent", "官方仓库", ["agent-frameworks", "tool-calling", "rag", "mcp"], "提供工具调用、检索增强和 MCP 接入的代理框架实现。", "用于理解 Qwen 模型的官方代理工程栈。"],
    ["qwen", "Qwen", "qwen-code", "Qwen Code", "https://github.com/QwenLM/qwen-code", "官方仓库", ["coding-tools", "agent", "mcp"], "展示终端编码代理、工具审批和 MCP 扩展的完整实现。", "代表 Qwen 在软件工程代理方向的产品化贡献。"],

    ["moonshot-ai", "Moonshot AI", "moonshot-moba", "MoBA：块注意力混合", "https://github.com/MoonshotAI/MoBA", "官方仓库", ["attention", "context-window", "moe"], "提出在长上下文中动态选择注意力块的稀疏机制。", "代表 Moonshot 在长上下文基础研究上的独特贡献。"],
    ["moonshot-ai", "Moonshot AI", "kimi-audio-repo", "Kimi-Audio 官方仓库", "https://github.com/MoonshotAI/Kimi-Audio", "官方仓库", ["speech", "audio-generation", "multimodal"], "披露统一语音理解与生成模型的架构、权重和推理方式。", "代表 Moonshot 在原生音频模型上的差异化贡献。"],
    ["moonshot-ai", "Moonshot AI", "kimi-code-cli", "Kimi Code CLI", "https://github.com/MoonshotAI/kimi-code", "官方仓库", ["coding-tools", "agent", "agent-skills"], "展示终端编码代理的会话、工具与技能机制。", "用于核对 Kimi 编码代理的官方实现边界。"],

    ["zhipu-ai", "Zhipu AI", "open-autoglm", "Open-AutoGLM", "https://github.com/zai-org/Open-AutoGLM", "官方仓库", ["computer-use", "agent", "agent-frameworks"], "提供手机与桌面视觉操作代理的模型和执行框架。", "代表 GLM 系列在计算机使用代理上的差异化贡献。"],
    ["zhipu-ai", "Zhipu AI", "cogvideo-repo", "CogVideo / CogVideoX", "https://github.com/zai-org/CogVideo", "官方仓库", ["video-generation", "diffusion"], "披露文本到视频模型、权重与推理训练工具链。", "代表 Zhipu 在开放视频生成模型上的长期贡献。"],
    ["zhipu-ai", "Zhipu AI", "glm-ocr-repo", "GLM-OCR 官方仓库", "https://github.com/zai-org/GLM-OCR", "官方仓库", ["multimodal", "tokenization"], "提供面向文档理解的 OCR 模型、权重与评测资料。", "代表 GLM 在文档视觉理解方向的当前贡献。"]
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
