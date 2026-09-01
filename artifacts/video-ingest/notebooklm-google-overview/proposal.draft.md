# 双轨视频入库提案（草稿）

- 视频：Meet NotebookLM: Research, Reimagined
- URL：https://www.youtube.com/watch?v=AmKZCo5Dtn0
- 证据：E2 · `sha256:85a329ec39c7a75717fab6e8453f8f4d82ecd61c51a68e86ac48e039b49252da`
- 状态：draft

## 教程轨

- 目标软件：notebooklm
- 建议动作：create-page
- 正式决定：待 AI 分析与人工批准
- 重复 URL：否

## 概念轨

当前受限上下文命中 2 个节点。下列条目只是待分析种子：

- [ ] **citations** → 现有节点 `citations`（待判 new / merge / supplement / reject / uncertain）
- [ ] **Skills** → 现有节点 `agent-skills`（待判 new / merge / supplement / reject / uncertain）

## AI 填写要求

1. 教程轨和概念轨必须独立判断。
2. 每个关键结论必须引用 evidence.json 中的时间位置；不得仅凭标题推断。
3. 新节点必须列出至少两个相近节点、两条关系边和两个视频之外的权威来源。
4. 核心节点使用独立评分，且必须保留人工批准。
5. 填写完成后把 proposal.status 改为 ready，并运行严格校验。
