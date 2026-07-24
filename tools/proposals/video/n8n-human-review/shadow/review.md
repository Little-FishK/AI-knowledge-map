# 视频概念轨 v0.3 影子复核

- 模式：只读影子模式（正式写入 0）
- 提案：`sha256:bcf8fd70c45be806a0ffdf4b79924bb42e22a215813b0dcf36e6b9c9aed8901a`
- 证据：`sha256:eb5a892c23c424a759e8eb5becfab06e68e083661a9a9fcf23e2c00dd74e2908`
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

## human-in-the-loop

- 提案 / 独立复核：`supplement` / `supplement`
- 全图去重：existing；最相近：human-in-the-loop(1)、coding-tools(0.0383)、agent-identity-access(0.0344)、agent-frameworks(0.0296)、test-time-compute(0.0285)
- 视频证据：5/5 有效
- 外部来源 / 断言：0 / 0
- 关系 / 学习路径：未通过 / 未通过
- 影子结论：新节点 不合格；核心 不合格
- 正式数据：不写入

## streaming

- 提案 / 独立复核：`reject` / `reject`
- 全图去重：existing；最相近：streaming(1)、prefilling(0.013)、flow-matching(0.0122)、mcp-architecture(0.012)、structured-output(0.0118)
- 视频证据：0/0 有效
- 外部来源 / 断言：0 / 0
- 关系 / 学习路径：未通过 / 未通过
- 影子结论：新节点 不合格；核心 不合格
- 正式数据：不写入
