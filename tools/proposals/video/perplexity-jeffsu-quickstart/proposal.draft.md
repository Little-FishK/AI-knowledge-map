# 双轨视频入库提案（草稿）

- 视频：Learn 80% of Perplexity in under 10 minutes!
- URL：https://www.youtube.com/watch?v=YoWdogtZRw8
- 证据：E2 · `sha256:d19cfd39e4e5d4e57a5e091f960ede035cf21f200eb87020a26c241b0c4663f9`
- 状态：draft

## 教程轨

- 目标软件：perplexity
- 建议动作：create-page
- 正式决定：待 AI 分析与人工批准
- 重复 URL：否

## 概念轨

当前受限上下文命中 9 个节点。下列条目只是待分析种子：

- [ ] **Perplexity** → 现有节点 `information-theory`（待判 new / merge / supplement / reject / uncertain）
- [ ] **Gemini** → 现有节点 `model-families`（待判 new / merge / supplement / reject / uncertain）
- [ ] **fine-tuning** → 现有节点 `fine-tuning`（待判 new / merge / supplement / reject / uncertain）
- [ ] **agent** → 现有节点 `agent`（待判 new / merge / supplement / reject / uncertain）
- [ ] **planning** → 现有节点 `planning`（待判 new / merge / supplement / reject / uncertain）
- [ ] **Image Generation** → 现有节点 `image-generation`（待判 new / merge / supplement / reject / uncertain）
- [ ] **privacy** → 现有节点 `privacy`（待判 new / merge / supplement / reject / uncertain）
- [ ] **Sandbox** → 现有节点 `code-execution`（待判 new / merge / supplement / reject / uncertain）
- [ ] **confidence** → 现有节点 `logprobs`（待判 new / merge / supplement / reject / uncertain）

## AI 填写要求

1. 教程轨和概念轨必须独立判断。
2. 每个关键结论必须引用 evidence.json 中的时间位置；不得仅凭标题推断。
3. 新节点必须列出至少两个相近节点、两条关系边和两个视频之外的权威来源。
4. 核心节点使用独立评分，且必须保留人工批准。
5. 填写完成后把 proposal.status 改为 ready，并运行严格校验。
