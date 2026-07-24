# 双轨视频入库提案（草稿）

- 视频：10 min Walkthrough of Langfuse – Open Source LLM Observability, Evaluation, and Prompt Management
- URL：https://www.youtube.com/watch?v=2E8iTvGo9Hs
- 证据：E2 · `sha256:5c55e8df5bb869b4f1578ae71d677f83e048811ff5b06123e657fb616e119de4`
- 状态：draft

## 教程轨

- 目标软件：langchain
- 建议动作：create-page
- 正式决定：待 AI 分析与人工批准
- 重复 URL：否

## 概念轨

当前受限上下文命中 13 个节点。下列条目只是待分析种子：

- [ ] **evaluation** → 现有节点 `evaluation`（待判 new / merge / supplement / reject / uncertain）
- [ ] **llm** → 现有节点 `llm`（待判 new / merge / supplement / reject / uncertain）
- [ ] **Tracing** → 现有节点 `observability`（待判 new / merge / supplement / reject / uncertain）
- [ ] **retrieval** → 现有节点 `retrieval`（待判 new / merge / supplement / reject / uncertain）
- [ ] **hallucination** → 现有节点 `hallucination`（待判 new / merge / supplement / reject / uncertain）
- [ ] **embedding** → 现有节点 `embedding`（待判 new / merge / supplement / reject / uncertain）
- [ ] **Evals** → 现有节点 `model-evaluation`（待判 new / merge / supplement / reject / uncertain）
- [ ] **guardrails** → 现有节点 `guardrails`（待判 new / merge / supplement / reject / uncertain）
- [ ] **fine-tuning** → 现有节点 `fine-tuning`（待判 new / merge / supplement / reject / uncertain）
- [ ] **GPT** → 现有节点 `model-families`（待判 new / merge / supplement / reject / uncertain）
- [ ] **deployment** → 现有节点 `deployment`（待判 new / merge / supplement / reject / uncertain）
- [ ] **Prompt Engineering** → 现有节点 `prompt-engineering`（待判 new / merge / supplement / reject / uncertain）

## AI 填写要求

1. 教程轨和概念轨必须独立判断。
2. 每个关键结论必须引用 evidence.json 中的时间位置；不得仅凭标题推断。
3. 新节点必须列出至少两个相近节点、两条关系边和两个视频之外的权威来源。
4. 核心节点使用独立评分，且必须保留人工批准。
5. 填写完成后把 proposal.status 改为 ready，并运行严格校验。
