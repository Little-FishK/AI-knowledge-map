# 双轨视频入库提案（草稿）

- 视频：Runway AI - Tutorial for Beginners in 13 MINUTES !  [ FULL GUIDE ]
- URL：https://www.youtube.com/watch?v=c38vtLw1nSk
- 证据：E2 · `sha256:a131c93748a6783670d797aa103a9096de003d7052b2de233caac2b634ceb16c`
- 状态：draft

## 教程轨

- 目标软件：runway
- 建议动作：create-page
- 正式决定：待 AI 分析与人工批准
- 重复 URL：否

## 概念轨

当前受限上下文命中 6 个节点。下列条目只是待分析种子：

- [ ] **Video Generation** → 现有节点 `video-generation`（待判 new / merge / supplement / reject / uncertain）
- [ ] **Skills** → 现有节点 `agent-skills`（待判 new / merge / supplement / reject / uncertain）
- [ ] **multimodal** → 现有节点 `multimodal`（待判 new / merge / supplement / reject / uncertain）
- [ ] **speech** → 现有节点 `speech`（待判 new / merge / supplement / reject / uncertain）
- [ ] **Text-to-Image** → 现有节点 `image-generation`（待判 new / merge / supplement / reject / uncertain）
- [ ] **Inpainting** → 现有节点 `image-editing`（待判 new / merge / supplement / reject / uncertain）

## AI 填写要求

1. 教程轨和概念轨必须独立判断。
2. 每个关键结论必须引用 evidence.json 中的时间位置；不得仅凭标题推断。
3. 新节点必须列出至少两个相近节点、两条关系边和两个视频之外的权威来源。
4. 核心节点使用独立评分，且必须保留人工批准。
5. 填写完成后把 proposal.status 改为 ready，并运行严格校验。
