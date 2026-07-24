# 双轨视频入库提案（草稿）

- 视频：1 Click Human in The Loop | New Human Review n8n Node
- URL：https://www.youtube.com/watch?v=1540pDeGZD0
- 证据：E2 · `sha256:eb5a892c23c424a759e8eb5becfab06e68e083661a9a9fcf23e2c00dd74e2908`
- 状态：draft

## 教程轨

- 目标软件：n8n
- 建议动作：append-resource
- 正式决定：待 AI 分析与人工批准
- 重复 URL：否

## 概念轨

当前受限上下文命中 3 个节点。下列条目只是待分析种子：

- [ ] **agent** → 现有节点 `agent`（待判 new / merge / supplement / reject / uncertain）
- [ ] **human-in-the-loop** → 现有节点 `human-in-the-loop`（待判 new / merge / supplement / reject / uncertain）
- [ ] **streaming** → 现有节点 `streaming`（待判 new / merge / supplement / reject / uncertain）

## AI 填写要求

1. 教程轨和概念轨必须独立判断。
2. 每个关键结论必须引用 evidence.json 中的时间位置；不得仅凭标题推断。
3. 新节点必须列出至少两个相近节点、两条关系边和两个视频之外的权威来源。
4. 核心节点使用独立评分，且必须保留人工批准。
5. 填写完成后把 proposal.status 改为 ready，并运行严格校验。
