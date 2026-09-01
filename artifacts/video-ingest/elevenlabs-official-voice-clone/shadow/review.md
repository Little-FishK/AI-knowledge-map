# 视频概念轨 v0.3 影子复核

- 模式：只读影子模式（正式写入 0）
- 提案：`sha256:9685216228988afbcba2d89d9af847e2b1fe4d2d89958699431ab5c1831340fb`
- 证据：`sha256:ecfd1fd17bf74c351ad9eb117674be563f5d506fa40954a698a2511b4b6f5b96`
- 图谱：`sha256:1b6dc3bc50e91a03ad65a7315647678643a0e0169ea9ce33723bc67bbc180efc`
- 候选：6；一致：5；冲突：1
- 影子合格新节点：1；影子合格核心节点：0

## speech

- 提案 / 独立复核：`reject` / `reject`
- 全图去重：existing；最相近：speech(1)、audio-generation(0.0296)、model-evaluation(0.0203)、llm(0.0166)、in-context-learning(0.0159)
- 视频证据：3/3 有效
- 外部来源 / 断言：0 / 0
- 关系 / 学习路径：未通过 / 未通过
- 影子结论：新节点 不合格；核心 不合格
- 正式数据：不写入

## agent

- 提案 / 独立复核：`reject` / `reject`
- 全图去重：existing；最相近：agent(1)、agent-frameworks(1)、agent-identity-access(1)、agent-loop(1)、agent-memory(1)
- 视频证据：1/1 有效
- 外部来源 / 断言：0 / 0
- 关系 / 学习路径：未通过 / 未通过
- 影子结论：新节点 不合格；核心 不合格
- 正式数据：不写入

## clip

- 提案 / 独立复核：`reject` / `reject`
- 全图去重：existing；最相近：clip(1)、contrastive-learning(0.0512)、multimodal(0.0178)、audio-generation(0.0175)、flow-matching(0.0131)
- 视频证据：0/0 有效
- 外部来源 / 断言：0 / 0
- 关系 / 学习路径：未通过 / 未通过
- 影子结论：新节点 不合格；核心 不合格
- 正式数据：不写入

## privacy

- 提案 / 独立复核：`reject` / `supplement`
- 全图去重：existing；最相近：privacy(1)、contrastive-learning(0.0219)、agent(0.0211)、guardrails(0.0187)、agent-identity-access(0.0185)
- 视频证据：2/2 有效
- 外部来源 / 断言：0 / 0
- 关系 / 学习路径：未通过 / 未通过
- 影子结论：新节点 不合格；核心 不合格
- 正式数据：不写入

阻断原因：

- 提案与独立复核结论不一致

## Prompt Engineering

- 提案 / 独立复核：`reject` / `reject`
- 全图去重：existing；最相近：prompt-engineering(1)、in-context-learning(0.0221)、controllable-generation(0.0205)、model-selection(0.0192)、model-merging(0.0169)
- 视频证据：0/0 有效
- 外部来源 / 断言：0 / 0
- 关系 / 学习路径：未通过 / 未通过
- 影子结论：新节点 不合格；核心 不合格
- 正式数据：不写入

## Voice Cloning

- 提案 / 独立复核：`new` / `new`
- 全图去重：clear；最相近：speech(0.0343)、in-context-learning(0.031)、audio-generation(0.0308)、agent-identity-access(0.0287)、post-training(0.0282)
- 视频证据：4/4 有效
- 外部来源 / 断言：5 / 4
- 关系 / 学习路径：通过 / 通过
- 影子结论：新节点 合格；核心 不合格
- 正式数据：不写入
