# 视频概念轨 v0.3 影子复核

- 模式：只读影子模式（正式写入 0）
- 提案：`sha256:6fe9d62c324ea689f57ce5811f8ff806ad1fabdd57dcff9066750971d602969b`
- 证据：`sha256:b88ebcddfcafea2dc93859fbbe6a25c33c642aa18ce165dfced8668893985b68`
- 图谱：`sha256:9f9296c93648fc5540324d852a931d1e26a4ad28582e4b7c812561de429ecda2`
- 候选：3；一致：2；冲突：1
- 影子合格新节点：0；影子合格核心节点：0

## agent

- 提案 / 独立复核：`reject` / `supplement`
- 全图去重：existing；最相近：agent(1)、agent-frameworks(1)、agent-identity-access(1)、agent-loop(1)、agent-memory(1)
- 视频证据：3/3 有效
- 外部来源 / 断言：0 / 0
- 关系 / 学习路径：未通过 / 未通过
- 影子结论：新节点 不合格；核心 不合格
- 正式数据：不写入

阻断原因：

- 提案与独立复核结论不一致
- 提案与独立复核的核心候选结论不一致

## mcp

- 提案 / 独立复核：`reject` / `reject`
- 全图去重：existing；最相近：mcp(1)、mcp-architecture(1)、agent-frameworks(0.0302)、coding-tools(0.0233)、reflection(0.0197)
- 视频证据：1/1 有效
- 外部来源 / 断言：0 / 0
- 关系 / 学习路径：未通过 / 未通过
- 影子结论：新节点 不合格；核心 不合格
- 正式数据：不写入

## Skills

- 提案 / 独立复核：`reject` / `reject`
- 全图去重：existing；最相近：agent-skills(1)、test-time-compute(0.0246)、advanced-rag(0.0213)、mcp(0.015)、post-training(0.0149)
- 视频证据：1/1 有效
- 外部来源 / 断言：0 / 0
- 关系 / 学习路径：未通过 / 未通过
- 影子结论：新节点 不合格；核心 不合格
- 正式数据：不写入
