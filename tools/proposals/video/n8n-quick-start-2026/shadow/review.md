# 视频概念轨 v0.3 影子复核

- 模式：只读影子模式（正式写入 0）
- 提案：`sha256:7cc4aee430853fd25c4075c8e7c24a3e1f56dcc7c75f1867b7d68eec68938e58`
- 证据：`sha256:09288223a0f05272c15bedff1859ca966eeba68d58680f3a12f8035413783f59`
- 图谱：`sha256:9f9296c93648fc5540324d852a931d1e26a4ad28582e4b7c812561de429ecda2`
- 候选：4；一致：3；冲突：1
- 影子合格新节点：0；影子合格核心节点：0

## agent

- 提案 / 独立复核：`supplement` / `supplement`
- 全图去重：existing；最相近：agent(1)、agent-frameworks(1)、agent-identity-access(1)、agent-loop(1)、agent-memory(1)
- 视频证据：4/4 有效
- 外部来源 / 断言：0 / 0
- 关系 / 学习路径：未通过 / 未通过
- 影子结论：新节点 不合格；核心 不合格
- 正式数据：不写入

阻断原因：

- 提案与独立复核的核心候选结论不一致

## 工作流

- 提案 / 独立复核：`supplement` / `supplement`
- 全图去重：existing；最相近：workflow-orchestration(1)、agent(0.0197)、agent-frameworks(0.0194)、agent-identity-access(0.0161)、human-in-the-loop(0.0161)
- 视频证据：4/4 有效
- 外部来源 / 断言：0 / 0
- 关系 / 学习路径：未通过 / 未通过
- 影子结论：新节点 不合格；核心 不合格
- 正式数据：不写入

## llm

- 提案 / 独立复核：`reject` / `supplement`
- 全图去重：existing；最相近：llm(1)、evaluation(1)、model-routing(1)、human-in-the-loop(0.0285)、reinforcement-learning(0.0244)
- 视频证据：2/2 有效
- 外部来源 / 断言：0 / 0
- 关系 / 学习路径：未通过 / 未通过
- 影子结论：新节点 不合格；核心 不合格
- 正式数据：不写入

阻断原因：

- 提案与独立复核结论不一致
- 提案与独立复核的核心候选结论不一致

## mcp

- 提案 / 独立复核：`reject` / `reject`
- 全图去重：existing；最相近：mcp(1)、mcp-architecture(1)、post-training(0.0151)、model-evaluation(0.0143)、test-time-compute(0.0142)
- 视频证据：1/1 有效
- 外部来源 / 断言：0 / 0
- 关系 / 学习路径：未通过 / 未通过
- 影子结论：新节点 不合格；核心 不合格
- 正式数据：不写入
