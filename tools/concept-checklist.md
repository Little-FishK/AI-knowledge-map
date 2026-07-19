# 节点清单 —— 我们自己的结构（M0-3 施工图）

> **这份文件是我们的原创编排**：概念取自对 340 个 roadmap.sh 节点 + aiknowledgemap 688 个节点的通读与筛选，
> 但**分区、分层、合并、取舍、命名全部由我们决定**，且**所有定义文字将由我们自己撰写**。
> roadmap.sh 的原始清单只作工作草稿，存放于 `tools/_raw/`（已 gitignore，不入库、不发布）。
> 相关调研：[source-survey.md](source-survey.md) · [import-notes.md](import-notes.md)

**P0** = M0 必填 | **P1** = M1 之后补 | **详情页** = 不建节点，收进某概念的详情页

---

## 筛选原则（先定标准再动手）

1. **产品/厂商名不建基础层节点。** Pinecone、LangChain、Cursor、Claude Code、Ollama 等是"某概念的代表实现"，
   要么进详情页的「代表实现」一节，要么作 `emerging` 层节点（它们变化快，本就属于活跃层）。
2. **参数细项合并。** temperature / top-k / top-p / 各种 penalty / max-tokens / stop-sequences
   → 合并为**一个**「采样与解码参数」节点，细项列在详情页。否则图里会多出十几个信息量极低的节点。
3. **通用网络安全全部丢弃。** 认证、授权、RCE、反序列化、基础设施安全——是 Web 安全常识，不是 AI 知识。
4. **职业/学习资源类丢弃。** "什么是 AI 工程师"、会议、论坛、证书、CTF 平台——不是概念。
5. **同一概念跨图重复的，合并成一个节点。**（temperature 出现 3 次、prompt-injection 4 次、MCP 相关 12 个条目）

---

## 🧱 foundations 基础/共享（layer: base）

| 优先级 | 节点 | 说明 |
|---|---|---|
| **P0** | Transformer | 已有 aiknowledgemap 的定义可作初稿，但要**大幅扩写**（它只当叶子处理） |
| **P0** | 注意力机制 | ⚠️ 两个源都缺，纯自写。Transformer 的核心，跨边枢纽 |
| **P0** | 大语言模型 LLM | 自写 |
| **P0** | Token 与分词 tokenization | 自写 |
| **P0** | 嵌入 Embedding | aiknowledgemap 有传统版，需按现代语义重写 |
| **P0** | 上下文窗口 | 自写 |
| **P0** | 预训练 | — |
| **P0** | 微调 Fine-tuning | — |
| **P0** | 采样与解码参数 | 合并 temperature/top-k/top-p/penalties/max-tokens/stop（细项进详情页） |
| **P0** | 推理 Inference | — |
| P1 | 模型权重与参数量 | — |
| P1 | 开放权重 vs 封闭模型 | — |
| P1 | 推理模型 vs 标准模型 | — |
| P1 | 多模态 | — |
| P1 | 缩放定律 | ⚠️ 三个源全缺，自写 |
| P1 | 量化 Quantization | 来自 llm-course；两个源都无 |
| P1 | 提示缓存 | — |
| **P0** | *（来自 aiknowledgemap）* 神经网络、CNN、RNN、梯度下降、过拟合、监督/无监督/强化学习 | ~10 个经典节点，定义可复用其 `short_definition` |
| P1 | *（来自 aiknowledgemap）* 决策树、集成方法、PCA/降维、聚类、SVM | ~8 个 |

## 🔧 building 应用搭建（layer: base）

| 优先级 | 节点 | 说明 |
|---|---|---|
| **P0** | 提示工程 | — |
| **P0** | RAG | — |
| **P0** | 向量数据库 | 具体产品（Pinecone/Qdrant/Weaviate/Chroma/FAISS/LanceDB）进详情页 |
| **P0** | 文档切分 Chunking | — |
| **P0** | 检索与语义搜索 | 合并 retrieval-process / semantic-search / 相似度搜索 |
| **P0** | 结构化输出 | 合并 structured-output / 输入输出约束 / 输出控制 |
| **P0** | 思维链 CoT | — |
| P1 | 少样本/零样本提示 | 合并 zero-shot / one-shot / few-shot |
| P1 | 系统提示与角色提示 | 合并 system-prompting / role-prompting |
| P1 | 上下文工程 | 合并 context-engineering / 压缩 / 隔离 |
| P1 | 思维树 ToT | — |
| P1 | 自洽性 / 退一步提示 / 自动提示工程 | 合并为「进阶提示技巧」 |
| P1 | 高级 RAG | 查询构造、重排、后处理（主要来自 llm-course） |
| P1 | LLM 应用评测 | 指标、人工评测、LLM-as-judge；工具（Ragas/DeepEval/Langfuse）进详情页 |
| P1 | 可观测性与追踪 | — |
| P1 | 模型选型与成本 | 合并 choosing-the-right-model / token 计价 |
| P1 | 部署形态 | 本地 / 自托管 / 云端 |
| P1 | 推理优化 | Flash Attention / KV 缓存 / 投机解码（来自 llm-course，roadmap.sh 无） |

## 💻 coding 编程与 Agent（layer: base）

| 优先级 | 节点 | 说明 |
|---|---|---|
| **P0** | AI Agent | — |
| **P0** | Agent 循环 | 感知→推理规划→工具调用→观察反思，四阶段进详情页 |
| **P0** | 工具调用 / 函数调用 | 各厂商实现差异（Anthropic/OpenAI/Gemini）进详情页 |
| **P0** | MCP 模型上下文协议 | — |
| **P0** | Agent 记忆 | 合并 短期/长期/情景vs语义/外部记忆/遗忘策略 |
| P1 | MCP 架构 | Host / Client / Server / 传输层，合并为 1~2 个节点 |
| P1 | ReAct | 推理+行动范式；prompt-engineering 图里也有，归此 |
| P1 | 多 Agent 编排 | 合并 multi-agents / DAG / planner-executor / 自我批判 |
| P1 | Agent 的工具类型 | 代码执行、文件访问、终端、网页搜索、爬取、数据库、API |
| **emerging** | Agent 框架 | LangChain / LangGraph / LlamaIndex / CrewAI / AutoGen / Agno / Google ADK / OpenAI AgentKit / Claude Agent SDK |
| **emerging** | AI 编程工具 | Cursor / Claude Code / Codex / Windsurf / Replit |

## 🎨 generation 内容生成（layer: base）

> ⚠️ **三个源覆盖都薄**，roadmap.sh 这块基本是 API 名录。这个大区**主要靠自写**。

| 优先级 | 节点 | 说明 |
|---|---|---|
| **P0** | 扩散模型 | aiknowledgemap 有，可复用 |
| **P0** | 图像生成 | — |
| P1 | GAN | aiknowledgemap 有 |
| P1 | 语音识别与合成 | 合并 STT / TTS |
| P1 | 视频理解与生成 | — |
| P1 | 图像理解 | — |
| P1 | 可控生成 | ⚠️ 全缺，自写 |

## ⚖️ safety 安全与对齐（layer: base）

| 优先级 | 节点 | 说明 |
|---|---|---|
| **P0** | 提示注入 | 直接注入 / 间接注入进详情页 |
| **P0** | 越狱 Jailbreak | 合并 jailbreak-techniques / 安全过滤绕过 |
| **P0** | 幻觉 Hallucination | — |
| **P0** | 对齐 Alignment | ⚠️ 三个源全缺（llm-course 有偏好对齐）。自写 |
| P1 | RLHF / DPO 偏好对齐 | 来自 llm-course |
| P1 | 红队测试 | 合并 威胁建模 / 黑白灰盒 / 自动vs人工 / 漏洞评估 / 负责任披露 |
| P1 | 数据投毒 | — |
| P1 | 对抗样本与鲁棒性 | 合并 adversarial-examples / adversarial-training / 鲁棒设计 |
| P1 | 偏见与公平性 | — |
| P1 | 护栏 Guardrails | 合并 内容审核 / 毒性护栏 |
| P1 | 隐私与 PII | 合并 数据分类 / PII 脱敏 |
| P1 | Agent 安全 | 工具沙箱与权限；agentic-ai-security |
| P1 | 可解释性 | 来自 llm-course，两个源都缺 |
| P1 | AI 治理与法规 | 来自 aiknowledgemap（欧盟 AI 法案、NIST AI RMF、ISO） |

## 📰 frontier 追前沿（layer: emerging / news）

不预先手填，由 M1 入库流程长出来。M0 先手放 5~8 个占位验证叠层视觉：
主流模型家族（Claude / GPT / Gemini / Llama / Mistral / DeepSeek / Qwen）、测试时计算扩展、模型融合。
三个 AI 事故库（AIID / MIT / OECD）作为 news 层的素材源。

---

## 明确丢弃

| 类别 | 例子 | 理由 |
|---|---|---|
| 通用网络安全 | 认证、授权、API 保护、代码注入、不安全反序列化、RCE、越权访问、基础设施安全、CIA 三性 | Web 安全常识，不是 AI 知识 |
| 职业/流程 | 什么是 AI 工程师、AI工程师vs ML工程师、职责、对产品开发的影响、了解你的客户 | 不是概念 |
| 学习资源 | 会议、论坛、CTF、证书、专项课程、实验环境、测试平台 | 可作 `sources`，不建节点 |
| 前置技能 | 后端开发基础、REST API 知识 | 超出 AI 范畴 |
| 评价指标 | Accuracy / F1 / AUC / BLEU / ROUGE / Perplexity | 已定：进详情页「评价方式」 |
| 数据管线细节 | aiknowledgemap 的 Data 分支 464 个节点 | MLOps 工程细节，压缩成 3~5 个 |

---

## 统计

| | P0（M0 必填） | P1（后续） |
|---|---|---|
| foundations | ~20（含 10 个经典 ML） | ~14 |
| building | 7 | 11 |
| coding | 5 | 4（+2 emerging 组） |
| generation | 2 | 5 |
| safety | 4 | 11 |
| frontier | 5~8（emerging/news 占位） | — |
| **合计** | **~43** | **~45** |

P0 已略超 plan.md 的「30~40 节点」目标，符合预期。**跨边 100% 自建，目标 ≥20 条。**

### 天然的跨边种子（这三个源一条都没有，全是我们的增量）

- RAG **contrast** 微调 ｜ 提示工程 **contrast** 微调（源里的 `rag-vs-fine-tuning`、`fine-tuning-vs-prompt-engineering` 恰好提示了这两对）
- 注意力 **part-of** Transformer ｜ Transformer **enables** LLM
- 嵌入 **uses-by** RAG ｜ 向量数据库 **uses** 嵌入 ｜ 语义搜索 **uses** 嵌入
- 上下文窗口 **constrains** Agent 记忆 ｜ 上下文窗口 **constrains** RAG（为何需要 chunking）
- 工具调用 **enables** Agent ｜ MCP **variant-of/standardizes** 工具调用
- 提示注入 **threatens** Agent ｜ 工具沙箱 **mitigates** 提示注入
- 幻觉 **mitigated-by** RAG ← 这条尤其能体现地图价值
- 采样参数 **affects** 幻觉 ｜ CoT **variant-of** 提示工程 ｜ ReAct **combines** CoT + 工具调用

> 注：`constrains` / `mitigates` / `threatens` 不在 SPEC §3.3 已定的 8 种边里。
> M0 先用 `related` 兜底并记录，攒够实例后再决定要不要扩边类型（会动 D1，需你拍板）。
