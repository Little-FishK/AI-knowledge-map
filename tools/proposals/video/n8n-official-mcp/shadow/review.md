# 视频概念轨 v0.3 影子复核

- 模式：只读影子模式（正式写入 0）
- 提案：`sha256:41bb1a40dbec42ad1bc32f9569ec2e84e7350c4ce2d9206bbef53b4544a7c025`
- 证据：`sha256:911693c6292d634e19c9d28249b66668cb471fdd14d391a1b1d150a507a3ad1f`
- 图谱：`sha256:9f9296c93648fc5540324d852a931d1e26a4ad28582e4b7c812561de429ecda2`
- 候选：7；一致：5；冲突：2
- 影子合格新节点：0；影子合格核心节点：0

## Claude

- 提案 / 独立复核：`reject` / `reject`
- 全图去重：existing；最相近：coding-tools(1)、model-families(1)、model-evaluation(0.0237)、post-training(0.0201)、reasoning-models(0.0157)
- 视频证据：2/2 有效
- 外部来源 / 断言：0 / 0
- 关系 / 学习路径：未通过 / 未通过
- 影子结论：新节点 不合格；核心 不合格
- 正式数据：不写入

## mcp

- 提案 / 独立复核：`supplement` / `supplement`
- 全图去重：existing；最相近：mcp(1)、mcp-architecture(1)、workflow-orchestration(0.0265)、agent-frameworks(0.0188)、prompt-engineering(0.0178)
- 视频证据：4/4 有效
- 外部来源 / 断言：0 / 0
- 关系 / 学习路径：未通过 / 未通过
- 影子结论：新节点 不合格；核心 不合格
- 正式数据：不写入

阻断原因：

- 提案与独立复核的核心候选结论不一致

## agent

- 提案 / 独立复核：`reject` / `supplement`
- 全图去重：existing；最相近：agent(1)、agent-frameworks(1)、agent-identity-access(1)、agent-loop(1)、agent-memory(1)
- 视频证据：4/4 有效
- 外部来源 / 断言：0 / 0
- 关系 / 学习路径：未通过 / 未通过
- 影子结论：新节点 不合格；核心 不合格
- 正式数据：不写入

阻断原因：

- 提案与独立复核结论不一致
- 提案与独立复核的核心候选结论不一致

## Claude Code

- 提案 / 独立复核：`reject` / `supplement`
- 全图去重：existing；最相近：coding-tools(1)、model-families(1)、agent-skills(0.0302)、code-generation(0.0271)、mcp-architecture(0.0258)
- 视频证据：3/3 有效
- 外部来源 / 断言：0 / 0
- 关系 / 学习路径：未通过 / 未通过
- 影子结论：新节点 不合格；核心 不合格
- 正式数据：不写入

阻断原因：

- 提案与独立复核结论不一致

## System Prompt

- 提案 / 独立复核：`supplement` / `supplement`
- 全图去重：existing；最相近：system-prompt(1)、agent-identity-access(0.0203)、prompt-caching(0.0187)、data-drift-monitoring(0.0184)、model-evaluation(0.0174)
- 视频证据：1/1 有效
- 外部来源 / 断言：0 / 0
- 关系 / 学习路径：未通过 / 未通过
- 影子结论：新节点 不合格；核心 不合格
- 正式数据：不写入

## planning

- 提案 / 独立复核：`reject` / `reject`
- 全图去重：existing；最相近：neural-network(1)、planning(1)、test-time-compute(0.0319)、workflow-orchestration(0.0198)、data-drift-monitoring(0.0187)
- 视频证据：1/1 有效
- 外部来源 / 断言：0 / 0
- 关系 / 学习路径：未通过 / 未通过
- 影子结论：新节点 不合格；核心 不合格
- 正式数据：不写入

## streaming

- 提案 / 独立复核：`reject` / `reject`
- 全图去重：existing；最相近：streaming(1)、logprobs(0.0194)、state-space-models(0.0161)、data-drift-monitoring(0.0154)、citations(0.0153)
- 视频证据：0/0 有效
- 外部来源 / 断言：0 / 0
- 关系 / 学习路径：未通过 / 未通过
- 影子结论：新节点 不合格；核心 不合格
- 正式数据：不写入
