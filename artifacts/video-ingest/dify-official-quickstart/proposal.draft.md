# 双轨视频入库提案（草稿）

- 视频：Dify Quickstart Guide: Build Your First AI Workflow
- URL：https://www.youtube.com/watch?v=dJ34OU_JY7Y
- 证据：E2 · `sha256:f92429105539630a9977a8affe4a139e771969c9689a724d19afd5fe4f8ed840`
- 状态：draft

## 教程轨

- 目标软件：dify
- 建议动作：create-page
- 正式决定：待 AI 分析与人工批准
- 重复 URL：否

## 概念轨

当前受限上下文命中 4 个节点。下列条目只是待分析种子：

- [ ] **llm** → 现有节点 `llm`（待判 new / merge / supplement / reject / uncertain）
- [ ] **System Prompt** → 现有节点 `system-prompt`（待判 new / merge / supplement / reject / uncertain）
- [ ] **deployment** → 现有节点 `deployment`（待判 new / merge / supplement / reject / uncertain）
- [ ] **agent** → 现有节点 `agent`（待判 new / merge / supplement / reject / uncertain）

## AI 填写要求

1. 教程轨和概念轨必须独立判断。
2. 每个关键结论必须引用 evidence.json 中的时间位置；不得仅凭标题推断。
3. 新节点必须列出至少两个相近节点、两条关系边和两个视频之外的权威来源。
4. 核心节点使用独立评分，且必须保留人工批准。
5. 填写完成后把 proposal.status 改为 ready，并运行严格校验。
