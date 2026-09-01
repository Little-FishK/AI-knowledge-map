# 双轨视频入库提案（草稿）

- 视频：快速上手CherryStudio，详细实用的设置教程
- URL：https://www.bilibili.com/video/BV1F1snz6EiK/
- 证据：E2 · `sha256:e9e9571becbe6bceee3b3c8eefcddf52fad5d27b485369d16304c3f2c523a91e`
- 状态：draft

## 教程轨

- 目标软件：deepseek
- 建议动作：create-page
- 正式决定：待 AI 分析与人工批准
- 重复 URL：否

## 概念轨

当前受限上下文命中 6 个节点。下列条目只是待分析种子：

- [ ] **mcp** → 现有节点 `mcp`（待判 new / merge / supplement / reject / uncertain）
- [ ] **大模型** → 现有节点 `llm`（待判 new / merge / supplement / reject / uncertain）
- [ ] **Claude** → 现有节点 `model-families`（待判 new / merge / supplement / reject / uncertain）
- [ ] **智能体** → 现有节点 `agent`（待判 new / merge / supplement / reject / uncertain）
- [ ] **MCP Server** → 现有节点 `mcp-architecture`（待判 new / merge / supplement / reject / uncertain）
- [ ] **工作流** → 现有节点 `workflow-orchestration`（待判 new / merge / supplement / reject / uncertain）

## AI 填写要求

1. 教程轨和概念轨必须独立判断。
2. 每个关键结论必须引用 evidence.json 中的时间位置；不得仅凭标题推断。
3. 新节点必须列出至少两个相近节点、两条关系边和两个视频之外的权威来源。
4. 核心节点使用独立评分，且必须保留人工批准。
5. 填写完成后把 proposal.status 改为 ready，并运行严格校验。
