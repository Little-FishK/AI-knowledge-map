/* 官方技术资料（全球来源）——按知识矩阵重建，不按品牌凑数。 */
(function () {
  if (!window.PRO_LIBRARY || !Array.isArray(window.PRO_LIBRARY.items)) return;
  const reviewedAt = "2026-09-24";
  const rows = [
    ["openai","OpenAI","openai-agents-overview","Agents","https://developers.openai.com/api/docs/guides/agents","开发者指南",["agent","agent-loop","tool-calling"],"建立 OpenAI 智能体运行时的总入口。","比较 Agents API、Agents SDK 与 Responses API 的责任边界。"],
    ["openai","OpenAI","openai-agents-api","Agents API","https://developers.openai.com/api/docs/guides/agents-api/overview","开发者指南",["agent","agent-loop"],"补足托管式长任务、环境和会话的运行模型。","说明 OpenAI 托管 Codex harness 的独有边界。"],
    ["openai","OpenAI","openai-agents-sdk","Agents SDK","https://developers.openai.com/api/docs/guides/agents/sdk","框架文档",["agent","agent-frameworks","tool-calling"],"补足代码内智能体、handoff 与运行循环。","说明 OpenAI Agents SDK 的当前组成。"],
    ["openai","OpenAI","openai-multi-agent","Multi-agent","https://developers.openai.com/api/docs/guides/responses-multi-agent","开发者指南",["agent","multi-agent","tool-calling"],"补足 Responses 多智能体的委派与结果协议。","影响 OpenAI 多智能体编排选型。"],
    ["openai","OpenAI","openai-agent-guardrails","Guardrails and human review","https://developers.openai.com/api/docs/guides/agents/guardrails-approvals","安全指南",["agent","guardrails","prompt-injection"],"补足智能体护栏、审批和人工复核闭环。","说明 Agents SDK 的执行控制点。"],
    ["openai","OpenAI","openai-tools-guide","Using tools","https://developers.openai.com/api/docs/guides/tools","开发者指南",["tool-calling","agent"],"建立 OpenAI 工具能力总入口。","汇总托管工具、函数、MCP 与工具搜索。"],
    ["openai","OpenAI","openai-function-calling","Function calling","https://developers.openai.com/api/docs/guides/function-calling","开发者指南",["tool-calling","agent"],"补足工具模式、调用循环和结果回传契约。","核对 OpenAI 函数调用的当前协议。"],
    ["openai","OpenAI","openai-web-search","Web search","https://developers.openai.com/api/docs/guides/tools-web-search","工具指南",["retrieval","tool-calling","agent"],"补足联网检索、引用和结果控制。","说明 OpenAI 托管搜索工具的当前行为。"],
    ["openai","OpenAI","openai-file-search","File search","https://developers.openai.com/api/docs/guides/tools-file-search","工具指南",["rag","retrieval","tool-calling"],"补足托管向量库和文件检索流程。","说明 OpenAI File Search 的配置与限制。"],
    ["openai","OpenAI","openai-mcp-tools","MCP servers","https://developers.openai.com/api/docs/guides/tools-connectors-mcp","工具指南",["mcp","tool-calling","agent"],"补足远程 MCP 与连接器的信任边界。","说明 OpenAI API 的 MCP 接入方式。"],
    ["openai","OpenAI","openai-computer-use","Computer use","https://developers.openai.com/api/docs/guides/tools-computer-use","工具指南",["agent","tool-calling"],"补足屏幕观察、动作循环和执行安全。","影响 OpenAI 计算机操作集成设计。"],
    ["openai","OpenAI","openai-code-interpreter","Code Interpreter","https://developers.openai.com/api/docs/guides/tools-code-interpreter","工具指南",["code-generation","tool-calling","agent"],"补足托管 Python 执行和文件产物流程。","说明 OpenAI 托管代码执行边界。"],
    ["openai","OpenAI","openai-shell","Shell","https://developers.openai.com/api/docs/guides/tools-shell","工具指南",["code-generation","tool-calling","agent"],"补足托管与本地 shell 的命令执行模型。","说明 OpenAI shell 工具的运行责任。"],
    ["openai","OpenAI","openai-skills","Skills","https://developers.openai.com/api/docs/guides/tools-skills","工具指南",["agent","tool-calling","prompt-engineering"],"补足可复用程序化工作流的封装方法。","说明 Responses 与 Agents 环境中的技能机制。"],
    ["openai","OpenAI","openai-structured-outputs","Structured outputs","https://developers.openai.com/api/docs/guides/structured-outputs","开发者指南",["structured-output","constrained-decoding"],"解释模式约束与结构化响应。","核对 Structured Outputs 的当前行为。"],
    ["openai","OpenAI","openai-prompt-caching","Prompt caching","https://developers.openai.com/api/docs/guides/prompt-caching","开发者指南",["prompt-caching","inference-optimization"],"补足前缀缓存对延迟、成本和提示组织的影响。","提供 OpenAI 自动缓存规则的一手说明。"],
    ["openai","OpenAI","openai-text-generation","Text generation","https://developers.openai.com/api/docs/guides/text","开发者指南",["llm","prompt-engineering"],"补足 Responses 文本输入输出与消息角色。","作为 OpenAI 文本生成的当前主入口。"],
    ["openai","OpenAI","openai-conversation-state","Conversation state","https://developers.openai.com/api/docs/guides/conversation-state","开发者指南",["context-window","agent"],"补足有状态交互、响应串联与上下文管理。","说明 OpenAI 会话状态的持久化选择。"],
    ["openai","OpenAI","openai-background-mode","Background mode","https://developers.openai.com/api/docs/guides/background","开发者指南",["agent","deployment"],"补足长任务的异步执行和轮询模式。","影响 OpenAI 长时任务架构。"],
    ["openai","OpenAI","openai-streaming-responses","Streaming API responses","https://developers.openai.com/api/docs/guides/streaming-responses","开发者指南",["streaming","deployment"],"补足 SSE 增量事件和流式消费。","说明 Responses 流式事件边界。"],
    ["openai","OpenAI","openai-websocket-mode","WebSocket Mode","https://developers.openai.com/api/docs/guides/websocket-mode","开发者指南",["streaming","agent"],"补足持久连接、续写与多路复用。","影响低延迟 Responses 集成。"],
    ["openai","OpenAI","openai-compaction","Compaction","https://developers.openai.com/api/docs/guides/compaction","开发者指南",["context-window","agent"],"补足长会话压缩与状态续接。","说明 OpenAI 服务端和独立压缩机制。"],
    ["openai","OpenAI","openai-token-counting","Counting tokens","https://developers.openai.com/api/docs/guides/token-counting","开发者指南",["tokenization","context-window"],"补足多模态、文件和工具输入的精确计数。","说明 OpenAI 服务端 token 计数能力。"],
    ["openai","OpenAI","openai-reasoning","Reasoning models","https://developers.openai.com/api/docs/guides/reasoning","开发者指南",["reasoning-models","test-time-compute","cot"],"补足推理强度、推理 token 和跨轮状态。","核对 OpenAI 推理模型使用方式。"],
    ["openai","OpenAI","openai-evals","Evaluation best practices","https://developers.openai.com/api/docs/guides/evaluation-best-practices","评测指南",["model-evaluation"],"补足评测集、指标和持续评估方法。","提供 OpenAI 推荐的生产评测流程。"],
    ["openai","OpenAI","openai-agent-evals","Evaluate agent workflows","https://developers.openai.com/api/docs/guides/agent-evals","评测指南",["model-evaluation","agent","observability"],"补足任务、轨迹和工具使用评测。","说明 OpenAI 代理评测的当前平台路径。"],
    ["openai","OpenAI","openai-graders","Graders","https://developers.openai.com/api/docs/guides/graders","评测指南",["model-evaluation"],"补足评分器类型、组合和校准。","说明 OpenAI graders 的配置边界。"],
    ["openai","OpenAI","openai-realtime-api","Getting started with the Realtime API","https://developers.openai.com/api/docs/guides/realtime","开发者指南",["streaming","speech","agent"],"补足实时语音代理、会话和传输层。","WebRTC、WebSocket 和插话机制影响架构选型。"],
    ["openai","OpenAI","openai-audio-voice","Audio and voice","https://developers.openai.com/api/docs/guides/audio","开发者指南",["speech","multimodal"],"建立语音输入、输出、转写与实时交互的选型入口。","区分 OpenAI 音频 API 路径。"],
    ["openai","OpenAI","openai-image-generation","Image generation","https://developers.openai.com/api/docs/guides/image-generation","开发者指南",["image-generation","image-editing","multimodal"],"补足生成与编辑图像的接口选择。","区分 Image API 与 Responses 图像工具。"],
    ["openai","OpenAI","openai-embeddings","Vector embeddings","https://developers.openai.com/api/docs/guides/embeddings","开发者指南",["embedding","retrieval","rag"],"补足向量表示、相似度和检索用法。","核对 OpenAI embeddings 的当前建议。"],
    ["openai","OpenAI","openai-deep-research","Deep research","https://developers.openai.com/api/docs/guides/deep-research","开发者指南",["agent","retrieval","tool-calling"],"补足多步研究任务的模型、工具和输出要求。","说明 OpenAI 深度研究模型的专用约束。"],
    ["openai","OpenAI","openai-prompt-engineering","Prompt engineering","https://developers.openai.com/api/docs/guides/prompt-engineering","开发者指南",["prompt-engineering","llm"],"补足可复用的提示设计与验证策略。","提供 OpenAI 当前模型交互建议。"],
    ["openai","OpenAI","openai-responses-migration","Migrate to the Responses API","https://developers.openai.com/api/docs/guides/migrate-to-responses","迁移指南",["agent","tool-calling","streaming"],"说明对象、状态、工具结果和流式事件迁移。","当前迁移差异影响旧系统改造。"],
    ["openai","OpenAI","openai-model-guidance","Using GPT-6","https://developers.openai.com/api/docs/guides/latest-model/gpt-6-astra","选型指南",["model-selection","model-families","reasoning-models"],"补足当前模型族能力、限制与迁移参数。","模型差异直接影响 OpenAI 选型。"],
    ["openai","OpenAI","openai-production-practices","Production best practices","https://developers.openai.com/api/docs/guides/production-best-practices","生产指南",["deployment","model-evaluation"],"补足扩展、安全、成本和上线治理。","提供 OpenAI 生产部署基线。"],
    ["openai","OpenAI","openai-data-controls","Data controls in the OpenAI platform","https://developers.openai.com/api/docs/guides/your-data","数据治理",["training-data-governance","privacy"],"补足数据使用、保留和零保留边界。","影响 OpenAI API 合规与架构选择。"],
    ["openai","OpenAI","openai-safety-practices","Safety best practices","https://developers.openai.com/api/docs/guides/safety-best-practices","安全指南",["alignment","guardrails","red-teaming"],"补足安全测试、监督和风险缓解。","提供 OpenAI 部署安全建议。"],
    ["openai","OpenAI","openai-moderation","Moderation","https://developers.openai.com/api/docs/guides/moderation","安全指南",["content-detection","guardrails","multimodal"],"补足文本与图像内容审核流程。","说明 OpenAI moderation 模型的使用边界。"],
    ["openai","OpenAI","openai-cost-optimization","Cost optimization","https://developers.openai.com/api/docs/guides/cost-optimization","生产指南",["inference-optimization","deployment"],"补足模型、token、缓存和异步处理的成本权衡。","提供 OpenAI 成本优化路径。"],
    ["openai","OpenAI","openai-batch-api","Batch API","https://developers.openai.com/api/docs/guides/batch","开发者指南",["inference-optimization","deployment"],"补足异步批处理、吞吐和成本模式。","影响离线任务的 OpenAI 接口选择。"],
    ["openai","OpenAI","openai-webhooks","Webhooks","https://developers.openai.com/api/docs/guides/webhooks","开发者指南",["agent","deployment"],"补足异步事件签名、投递和重试。","说明 OpenAI 事件驱动集成边界。"],
    ["openai","OpenAI","openai-codex-manual","Codex manual","https://learn.chatgpt.com/docs/codex-manual","产品技术手册",["agent","code-generation","tool-calling"],"建立 Codex 当前能力与操作模型的总入口。","保留 OpenAI 编码代理的官方主手册。"],
    ["openai","OpenAI","openai-agent-security","Agent approvals & security","https://learn.chatgpt.com/docs/agent-approvals-security","安全指南",["agent","agent-identity-access","prompt-injection"],"补足沙箱、审批、网络和最小权限。","说明 Codex 本地执行的安全边界。"],
    ["openai","OpenAI","openai-codex-sdk","Codex SDK","https://learn.chatgpt.com/docs/codex-sdk","SDK 文档",["agent","code-generation"],"补足程序化控制本地编码代理。","说明 Codex SDK 的当前控制面。"],
    ["openai","OpenAI","openai-codex-environments","Codex environments","https://learn.chatgpt.com/docs/environments/modes","产品技术文档",["agent","code-generation","deployment"],"补足本地、云端和 worktree 隔离模型。","影响 Codex 执行环境选型。"],
    ["openai","OpenAI","openai-plugin-architecture","Plugin architecture","https://developers.openai.com/plugins/concepts/plugins","架构文档",["mcp","agent","tool-calling"],"补足技能、MCP 服务器和可选 UI 的组合架构。","说明 OpenAI 插件封装模型。"],
    ["openai","OpenAI","openai-plugin-mcp-server","Build an MCP server","https://developers.openai.com/plugins/build/mcp-server","开发者指南",["mcp","tool-calling"],"补足插件 MCP 的数据、动作和权限实现。","提供插件服务端的官方构建路径。"],
    ["openai","OpenAI","openai-workspace-agents-api","Workspace Agents API","https://developers.openai.com/workspace-agents/llms.txt","API 指南",["agent","deployment"],"补足已发布工作区代理的触发和运行结果读取。","说明 Workspace Agents 的后端自动化边界。"],
    ["openai","OpenAI","openai-deprecations","Deprecations","https://developers.openai.com/api/docs/deprecations","状态文档",["deployment","model-selection"],"提供模型与 API 淘汰时间和替代路径。","作为 OpenAI 资料时效审核的权威入口。"],
    ["anthropic","Anthropic","anthropic-tool-use","Tool use with Claude","https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview","开发者指南",["tool-calling","agent"],"解释工具定义、选择、调用和结果回传的完整协议。","核对 Claude 工具使用特有的消息结构与约束。"],
    ["anthropic","Anthropic","anthropic-tool-context","Manage tool context","https://platform.claude.com/docs/en/agents-and-tools/tool-use/manage-tool-context","开发者指南",["context-engineering","tool-calling","prompt-caching"],"覆盖工具搜索、程序化调用与上下文压缩的组合策略。","体现 Anthropic 在大规模工具集上下文管理上的实现。"],
    ["anthropic","Anthropic","anthropic-citations","Citations","https://platform.claude.com/docs/en/build-with-claude/citations","开发者指南",["citations","rag"],"说明可追溯引用的输入组织和输出结构。","核对 Claude Citations 的当前支持范围。"],
    ["anthropic","Anthropic","anthropic-opus-48-system-card","Claude Opus 4.8 System Card","https://www.anthropic.com/claude-opus-4-8-system-card","系统卡",["model-evaluation","red-teaming","alignment"],"提供前沿模型能力、安全评测和缓解措施的原始披露。","保留 Anthropic 最新主力模型的代表性系统证据。"],
    ["google-deepmind","Google / DeepMind","google-gemini-function-calling","Function calling with the Gemini API","https://ai.google.dev/gemini-api/docs/function-calling","开发者指南",["tool-calling","agent"],"说明函数声明、调用模式与组合调用机制。","用于对比 Gemini 与其他模型的工具调用差异。"],
    ["google-deepmind","Google / DeepMind","google-gemini-long-context","Long context","https://ai.google.dev/gemini-api/docs/long-context","开发者指南",["context-window","lost-in-middle"],"说明长上下文的能力、成本和使用注意事项。","提供 Gemini 长上下文实现边界的一手说明。"],
    ["google-deepmind","Google / DeepMind","google-gemini-live-api","Live API","https://ai.google.dev/gemini-api/docs/live","开发者指南",["streaming","multimodal","speech"],"补足实时双向、多模态交互的协议与会话机制。","体现 Gemini Live API 的品牌特有能力。"],
    ["google-deepmind","Google DeepMind","deepmind-model-cards","Model cards","https://deepmind.google/models/model-cards/","模型卡索引",["model-evaluation","model-families","red-teaming"],"集中提供模型能力、限制与安全评测的原件。","作为模型事实主入口，避免重复收录营销页。"],
    ["microsoft","Microsoft","microsoft-agent-framework","Microsoft Agent Framework","https://learn.microsoft.com/en-us/agent-framework/overview/","框架文档",["agent-frameworks","workflow-orchestration","multi-agent"],"说明代理、工作流、工具和中间件的统一框架。","取代 AutoGen 与 Semantic Kernel 重复总览，反映当前整合方向。"],
    ["microsoft","Microsoft","microsoft-agent-concepts","Agent concepts","https://learn.microsoft.com/en-us/agent-framework/concepts/agents/","概念文档",["agent","agent-memory","agent-loop"],"给出运行、会话、内存、中间件和安全的统一概念模型。","核对 Microsoft Agent Framework 的架构语义。"],
    ["microsoft","Microsoft","microsoft-agent-evaluation","Evaluate your AI agents","https://learn.microsoft.com/en-us/azure/foundry/observability/how-to/evaluate-agent","评测指南",["model-evaluation","agent","observability"],"把智能体质量、安全和任务完成度落实为评测流程。","体现 Microsoft Foundry 当前代理评测方案。"],
    ["microsoft","Microsoft","microsoft-onnx-runtime","ONNX Runtime documentation","https://onnxruntime.ai/docs/","运行时文档",["deployment","inference-optimization"],"补足跨硬件推理运行时、执行提供程序与部署接口。","保留微软在模型运行时层面的代表性贡献。"],
    ["meta-ai","Meta AI","meta-sam2","Segment Anything 2","https://ai.meta.com/sam2/","项目资料",["multimodal","image-generation"],"提供图像与视频可提示分割模型的原始资料。","代表 Meta 在视觉基础模型上的独特贡献。"],
    ["meta-ai","Meta AI","meta-imagebind","ImageBind","https://github.com/facebookresearch/ImageBind","官方仓库",["multimodal","embedding","contrastive-learning"],"展示六类模态映射到共同嵌入空间的方法与代码。","代表 Meta 在跨模态表征上的独特贡献。"],
    ["meta-ai","Meta AI","meta-faiss","Faiss documentation","https://faiss.ai/","项目文档",["vector-db","retrieval","inference-optimization"],"补足高维向量相似性搜索的索引与工程实现。","代表 Meta 在检索基础设施上的长期贡献。"],
    ["meta-ai","Meta AI","meta-executorch","ExecuTorch architecture","https://docs.pytorch.org/executorch/stable/intro-overview.html","项目文档",["deployment","inference-optimization","quantization"],"解释端侧模型导出、运行时和后端委派架构。","代表 Meta/PyTorch 在边缘推理上的贡献。"],
    ["meta-ai","Meta AI","meta-purplellama","Purple Llama","https://github.com/meta-llama/PurpleLlama","官方仓库",["red-teaming","guardrails","prompt-injection"],"提供生成式 AI 安全评测与输入输出防护工具。","保留 Meta 在开放安全工具链上的代表性证据。"],
    ["nvidia","NVIDIA","nvidia-cuda-guide","CUDA C++ Programming Guide","https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html","编程指南",["deployment","distributed-training"],"提供 GPU 并行执行、内存和编程模型的基础原件。","是理解 NVIDIA 计算栈不可替代的底层资料。"],
    ["nvidia","NVIDIA","nvidia-tensorrt-llm","TensorRT-LLM documentation","https://nvidia.github.io/TensorRT-LLM/","项目文档",["inference-optimization","quantization","deployment"],"覆盖大模型编译、量化、并行与服务优化。","代表 NVIDIA 对 LLM 推理栈的具体实现。"],
    ["nvidia","NVIDIA","nvidia-triton-server","Triton Inference Server","https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/","部署文档",["deployment","inference-optimization","observability"],"补足多框架模型服务、调度、批处理和监控机制。","代表 NVIDIA 生产推理服务层的方案。"],
    ["nvidia","NVIDIA","nvidia-nemo-framework","NeMo Framework user guide","https://docs.nvidia.com/nemo-framework/user-guide/latest/overview.html","训练框架文档",["distributed-training","pretraining","fine-tuning"],"覆盖大模型分布式预训练与微调的工程路径。","代表 NVIDIA 在训练基础设施上的贡献。"],
    ["hugging-face-official","Hugging Face","hf-transformers","Transformers documentation","https://huggingface.co/docs/transformers/index","项目文档",["model-families","fine-tuning","deployment"],"统一多类 Transformer 模型的加载、训练和推理接口。","是开源模型工程生态的核心官方资料。"],
    ["hugging-face-official","Hugging Face","hf-tokenizers","Tokenizers documentation","https://huggingface.co/docs/tokenizers/index","项目文档",["tokenization","pretraining"],"解释高性能分词管线、训练与对齐机制。","补足模型前处理层的可复用工程知识。"],
    ["hugging-face-official","Hugging Face","hf-peft","PEFT documentation","https://huggingface.co/docs/peft/index","项目文档",["peft-lora","fine-tuning"],"覆盖 LoRA 等参数高效适配方法的实现与组合。","代表 Hugging Face 在低成本适配上的贡献。"],
    ["hugging-face-official","Hugging Face","hf-trl","TRL documentation","https://huggingface.co/docs/trl/index","项目文档",["post-training","rlhf","fine-tuning"],"覆盖监督微调、偏好优化与强化学习后训练工具链。","补足 Hugging Face 后训练生态的代表性资料。"],
    ["hugging-face-official","Hugging Face","hf-diffusers","Diffusers documentation","https://huggingface.co/docs/diffusers/index","项目文档",["diffusion","image-generation","video-generation"],"统一扩散模型的训练、管线和推理优化方式。","代表 Hugging Face 在生成式多媒体工程上的贡献。"],
    ["aws","AWS","aws-bedrock-agentic-retrieval","Use agentic retrieval to query a knowledge base","https://docs.aws.amazon.com/bedrock/latest/userguide/kb-test-agentic-retrieve.html","开发者指南",["advanced-rag","retrieval","agent"],"说明查询分解、迭代检索和充分性判断的托管实现。","体现 Bedrock 当前的代理式检索机制。"],
    ["aws","AWS","aws-bedrock-guardrails-how","How Amazon Bedrock Guardrails works","https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails-how.html","安全文档",["guardrails","content-detection","privacy"],"解释输入输出过滤、策略组合和干预流程。","核对 Bedrock Guardrails 的实际执行边界。"],
    ["aws","AWS","aws-bedrock-model-evaluation","Evaluate model performance in Amazon Bedrock","https://docs.aws.amazon.com/bedrock/latest/userguide/model-evaluation.html","评测指南",["model-evaluation","model-selection"],"说明自动与人工模型评测的任务、数据和指标组织方式。","保留 AWS 托管模型评测的代表性资料。"]
  ];
  const openaiTopics = {
    "openai-agents-overview":"agent-runtime-selection", "openai-tools-guide":"openai-tool-surface",
    "openai-structured-outputs":"openai-structured-output", "openai-prompt-caching":"openai-prompt-caching",
    "openai-agent-evals":"openai-agent-evaluation", "openai-realtime-api":"openai-realtime-voice",
    "openai-image-generation":"openai-image-api-choice", "openai-responses-migration":"openai-responses-migration",
    "openai-model-guidance":"openai-model-selection"
  };
  window.PRO_LIBRARY.items.push(...rows.map(([sourceSubcategory,publisher,id,title,url,contentKind,linkedNodes,knowledgeDelta,brandEvidenceDelta]) => {
    const item = {
      id, sourceClass:"official", sourceSubcategory, title, publisher, collection:`${publisher} 官方技术资料`, contentKind,
      authorityTier:"A1", reviewStatus:"知识矩阵审核通过", reviewPolicy:"official-knowledge-matrix-v1", reviewedAt,
      primarySource:true, discoveryOnly:false, url, accessedAt:reviewedAt, summary:`${knowledgeDelta}${brandEvidenceDelta}`,
      selectionReason:`知识增量：${knowledgeDelta} 品牌证据增量：${brandEvidenceDelta}`, knowledgeDelta, brandEvidenceDelta,
      evidenceUse:"可支持该发布者当前技术、接口或项目事实；跨品牌结论仍需独立对照资料。",
      limitations:["官方资料只直接证明本发布者的实现与声明","接口、模型和产品状态会变化，使用前应复核版本"],
      tags:[sourceSubcategory,contentKind,"官方技术资料"], linkedNodes, linkedSoftware:[]
    };
    if (sourceSubcategory === "openai") Object.assign(item, {
      reviewBatch:"openai-full-corpus-20260924", reviewDecision:"admitted-brand-evidence",
      contributionType:"brand-evidence", topicKey:openaiTopics[id] || id.replace(/^openai-/, "openai-"), currentStatus:"current"
    });
    if (id === "openai-agent-evals") item.recheckTriggers = ["官方评测入口发生变化", "Agent evals 页面被替换或归档"];
    if (id === "openai-model-guidance") item.recheckTriggers = ["默认模型族变化", "模型弃用或替代公告"];
    return item;
  }));
})();
