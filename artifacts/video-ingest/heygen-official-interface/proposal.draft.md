# 双轨视频入库提案（草稿）

- 视频：Starting with HeyGen: Complete Interface Walkthrough (Episode 1)
- URL：https://www.youtube.com/watch?v=AXmXHn1-62A
- 证据：E2 · `sha256:1df5950da8a6cd9ea62febfbebf66c27e26083a215f75a5069226752c71e3731`
- 状态：draft

## 教程轨

- 目标软件：heygen
- 建议动作：create-page
- 正式决定：待 AI 分析与人工批准
- 重复 URL：否

## 概念轨

当前受限上下文命中 4 个节点。下列条目只是待分析种子：

- [ ] **speech** → 现有节点 `speech`（待判 new / merge / supplement / reject / uncertain）
- [ ] **clip** → 现有节点 `clip`（待判 new / merge / supplement / reject / uncertain）
- [ ] **agent** → 现有节点 `agent`（待判 new / merge / supplement / reject / uncertain）
- [ ] **Adam** → 现有节点 `optimizer-schedule`（待判 new / merge / supplement / reject / uncertain）

## AI 填写要求

1. 教程轨和概念轨必须独立判断。
2. 每个关键结论必须引用 evidence.json 中的时间位置；不得仅凭标题推断。
3. 新节点必须列出至少两个相近节点、两条关系边和两个视频之外的权威来源。
4. 核心节点使用独立评分，且必须保留人工批准。
5. 填写完成后把 proposal.status 改为 ready，并运行严格校验。
