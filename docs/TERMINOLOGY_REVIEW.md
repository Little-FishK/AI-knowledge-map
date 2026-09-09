# 术语表第一轮外部来源复核

复核日期：2026-09-04

产品确认日期：2026-09-04（6 项全部按建议）

后续进度：表示与模型架构阶段已经完整覆盖，并继续发布训练与模型改造阶段的 PEFT/LoRA 与知识蒸馏；全表当前为 57 个项目批准条目、73 个草稿条目、41 个外部来源复核条目。

## 结论

现有 41 个已发布英文节点中，20 个名称已能由 Google Machine Learning Glossary、Model Context Protocol 官方规范或 OpenAI 官方文档直接支持，已在术语表中标为 `standardsReview: reviewed`。

产品负责人已经确认下面 6 项，相关命名与数据结构均已落实。当前共有 25 个名称完成外部来源复核；其余 16 个仍保持 `pending`，后续只需继续查证来源或补充语境。

## 已确认的 6 项

### 1. 术语与页面标题是否分层

- 现状：`Decision Trees and Ensemble Methods`、`Information Theory and Entropy` 等复合页面标题，同时被当作“规范术语”。
- 风险：标准资料通常分别定义 `Decision Tree`、`Ensemble`、`Information Theory`、`Entropy`，不会把整句页面标题定义成一个术语。
- 建议：保留现有英文页面标题；术语表新增独立的 `canonicalTerms`，一个页面可以对应多个规范术语。
- 影响范围：Decision Trees and Ensemble Methods、Retrieval and Semantic Search、Code Generation / AI Coding、Information Theory and Entropy、Kernel Methods and SVMs、Model Evaluation and Benchmarks、Agent Identity, Authorization, and Secrets、Test-time Compute and Verifiers。

### 2. 预训练的英文拼写

- 当前：`Pretraining`，并允许 `Pre-training`。
- 来源情况：Google 的机器学习术语表采用 `pre-training`；业界也广泛使用闭合写法 `pretraining`。
- 建议：页面标题改为 `Pre-training`，`Pretraining` 保留为可接受别名，以便与当前首选外部术语源一致。

### 3. Agent 的主名称

- 当前：`AI Agent`。
- 来源情况：Google 的主词条是 `agent`，并明确区分生成式 AI agent 与强化学习 agent；`AI agent` 更适合作为面向普通读者的页面标题。
- 建议：页面标题保留 `AI Agent`；规范术语记作 `Agent`，语境字段必须标明 `LLM application` 或 `reinforcement learning`。

### 4. Tool Calling 与 Function Calling

- 当前：`Tool Calling / Function Calling`。
- 来源情况：OpenAI 文档说明二者可作同义表达，但同时说明 function 是 tool 的一种；在跨厂商语境中，`Tool Calling` 更宽泛。
- 建议：页面标题改为 `Tool Calling`；`Function Calling` 作为可接受别名，并注明它在部分平台上是具体工具类型。

### 5. Chain of Thought 的连字符规则

- 当前：`Chain of Thought (CoT)`，并全局禁止 `Chain-of-Thought`。
- 来源情况：Google 的词条是 `chain-of-thought prompting`。连字符形式在作前置修饰语时是正确写法，不应全局禁止。
- 建议：页面标题保留 `Chain of Thought (CoT)`；删除对 `Chain-of-Thought` 的全局禁用，仅在 `chain-of-thought prompting` 等修饰语结构中使用连字符。

### 6. 多模态节点的英文标题

- 当前：`Multimodal AI`。
- 来源情况：Google 术语表定义的是 `multimodal model`；`Multimodal AI` 是更宽的领域名称。
- 建议：如果页面主体讲模型结构与输入输出，改为 `Multimodal Models`；只有页面覆盖整个技术领域时才保留 `Multimodal AI`。当前页面建议采用 `Multimodal Models`。

## 已完成外部复核的 20 项

Attention、Transformer、Large Language Model (LLM)、Embedding、Context Window、Fine-tuning、Neural Network、Gradient Descent、Overfitting、Supervised Learning、Unsupervised Learning、Reinforcement Learning、Regularization、Clustering、Retrieval-Augmented Generation (RAG)、Prompt Engineering、Model Context Protocol (MCP)、Hallucination、Reasoning Models、Loss Function。

## 采用的来源

- GB/T 41867-2022 与 ISO/IEC 22989:2022 用于概念边界和中英文正式术语的优先核对；公开页面不能验证具体词条时，不据此标记完成。
- Google Machine Learning Glossary 用于常见机器学习与生成式 AI 术语。
- Model Context Protocol 官方规范用于 MCP 名称与概念。
- OpenAI 官方文档用于 Tool/Function Calling、Reasoning Models 与 Test-time Compute 等快速演进术语。
