# 视频双轨入库 v0.1

> 生效日期：2026-07-24  
> 当前能力：**生成和严格校验提案，不修改正式地图、软件目录或教程数据。**

## 1. 目标与边界

一次视频取证同时产生两条互不替代的判断：

1. **教程轨**：视频是否足以成为某软件教程页的一条正式资源，或是否需要新建教程页。
2. **概念轨**：视频是否提供了新节点、已有节点补充或别名，并单独判断是否值得成为核心节点候选。

同一视频可以只通过其中一轨，也可以两轨都不通过。v0.1 永远先写入 `tools/proposals/video/` 供审核；没有“批准后自动应用”能力，不能直接改 `data/graph.js` 或 `data/tutorials*.js`。

## 2. 流程

```text
视频 URL
  ↓ tools/video-evidence.py
evidence.md + evidence.json + 关键帧
  ↓ video:proposal
受限上下文 + 双轨 proposal.json + 人类可读报告
  ↓ AI 填写
video:validate-proposal --ready
  ↓
等待人工逐项批准（v0.2 才实现应用）
```

原始音视频、帧和证据包应放在 `tools/_raw/video/`，该目录不进入 Git。提案和报告可以进入 `tools/proposals/video/`，以便审查与追溯。

## 3. 运行方式

### 3.1 生成证据

```powershell
py -3.11 tools/video-evidence.py `
  "https://www.youtube.com/watch?v=..." `
  "tools/_raw/video/codex-001/evidence" `
  --asr auto `
  --prompt "Codex AGENTS.md MCP context compaction"
```

产物：

- `evidence.evidence.md`：供人核对的字幕、章节与 OCR。
- `evidence.evidence.json`：供程序读取的结构化证据。
- `evidence_frames/`：关键帧。

JSON 包含逐段时间、帧时间、OCR、取证限制和 `contentHash`。提案必须绑定该哈希；证据改变后旧提案自动失效。

工具可以给出 E1/E2 建议，但 `requiresEditorialReview` 永远为 `true`。自动转录成功不等于内容已经被编辑确认。

### 3.2 生成受限上下文和提案草稿

```powershell
npm run video:proposal -- `
  --evidence "tools/_raw/video/codex-001/evidence.evidence.json" `
  --software codex `
  --output "tools/proposals/video/codex-001/proposal.json"
```

同时生成：

- `proposal.json`
- `proposal.md`
- `proposal.context.json`

受限上下文只包含：

- 标题或别名在证据中真实命中的最多 20 个节点；
- 这些节点的摘要、核心状态和局部关系；
- 指定或检测到的软件；
- 现有教程资源摘要和重复 URL；
- 允许的关系类型及节点排除规则。

它不会把 129 个节点的完整正文全部交给 AI。命中结果只是检索线索，不是 `supplement` 结论；AI可以删除种子，也可以加入地图中不存在的新概念候选。

也可以单独生成上下文：

```powershell
npm run video:context -- `
  --evidence "tools/_raw/video/codex-001/evidence.evidence.json" `
  --software codex `
  --output "tools/proposals/video/codex-001/context.json"
```

### 3.3 校验

草稿结构校验：

```powershell
npm run video:validate-proposal -- `
  --evidence "tools/_raw/video/codex-001/evidence.evidence.json" `
  --proposal "tools/proposals/video/codex-001/proposal.json"
```

AI填写完全部判断后，把 `proposal.status` 改为 `ready`，再运行严格校验：

```powershell
npm run video:validate-proposal -- `
  --evidence "tools/_raw/video/codex-001/evidence.evidence.json" `
  --proposal "tools/proposals/video/codex-001/proposal.json" `
  --ready
```

严格校验通过只表示“提案具备人工审核条件”，不表示已经批准或已经写入网站。

## 4. 教程轨

允许的决定：

- `formal`：满足正式教程全部门禁。
- `candidate`：证据或教学闭环仍需补强。
- `reject`：宣传、资讯、重复、风险或不可复现。
- `undecided`：仅允许出现在草稿。

允许的动作：

- `append-resource`：给现有教程页增加资源。
- `create-page`：软件存在，但尚无教程页。
- `software-candidate`：软件尚未进入目录，先提软件候选。
- `none`：不进入教程。

正式教程仍执行 [TUTORIALS.md](TUTORIALS.md) 的三层门禁：

- 证据至少 E2。
- 准确性、对齐、可复现性、可追溯性、安全性全部为 2。
- 质量总分至少 53/70。
- `resourceDraft` 具有完整摘要、操作、完成标志、独门技巧和风险提醒。
- 关键教学结论具有有效的视频时间/帧证据。
- 资源 URL 与取证 URL 一致。

## 5. 概念轨

允许的决定：

- `new`：新节点候选。
- `merge`：与已有节点相同，只建议增加别名。
- `supplement`：给已有节点补充案例、来源或侧面。
- `reject`：不够格、重复或属于排除项。
- `uncertain`：证据足够讨论，但需要人工判断。
- `undecided`：仅允许出现在草稿。

### 5.1 统一评分锚点

节点与核心节点各维度都先评 `0–4` 级，再按权重换算：

| 等级 | 含义 |
|---:|---|
| 0 | 没有证据，或明确不符合 |
| 1 | 只出现名称/观点，没有形成机制或用途 |
| 2 | 有部分解释，但边界、证据或关系不完整 |
| 3 | 解释完整，有明确证据和可用关系 |
| 4 | 完整且有消歧、边界、跨来源印证或显著地图价值 |

### 5.2 新节点资格（100 分）

| 维度 | 权重 |
|---|---:|
| 独立身份 `identity` | 20 |
| 独立机制 `mechanism` | 20 |
| 与现有节点非重复 `nonDuplication` | 20 |
| 实际理解/使用价值 `practicalValue` | 15 |
| 关系潜力 `relationshipPotential` | 15 |
| 外部来源质量 `sourceQuality` | 10 |

`new` 必须至少 80/100，并同时满足：

- 提供 kebab-case id、标题、大区和摘要草稿。
- 列出至少两个真实存在的相近节点。
- 提出至少两条连接候选新节点的合法关系边。
- 提供至少两个互不重复、视频之外的 HTTPS 来源。
- 至少一个有效视频证据定位。
- 不命中产品、按钮、配置、参数、指标、职业/流程或语义重复等排除项。

65–79 分通常应判为 `uncertain`；分数不是替代人工判断的通行证。

### 5.3 核心节点资格（100 分）

| 维度 | 权重 |
|---|---:|
| 学习路径入口价值 `learningGateway` | 25 |
| 图结构中心性 `graphCentrality` | 25 |
| 多路线复用 `crossRouteReuse` | 20 |
| 新人导航价值 `beginnerNavigation` | 20 |
| 稳定性 `stability` | 10 |

`coreCandidate: true` 必须至少 85/100，提供 `coreReason`，并显式设置 `requiresHumanCoreApproval: true`。视频中的高频出现不能自动证明核心地位。

## 6. 机器可执行门禁

实现位置：

- `tools/video-ingest/core.js`：评分、证据与提案校验。
- `tools/video-ingest/build-context.js`：受限上下文。
- `tools/video-ingest/create-proposal.js`：草稿和报告。
- `tools/video-ingest/validate-proposal.js`：命令行校验。
- `tools/video-ingest/schemas/`：v1 数据合同。
- `tools/test-video-ingest.js`：正常与失败夹具。

运行回归：

```powershell
npm run test:video-ingest
```

夹具必须阻止：

- E1 资源冒充正式教程；
- 五项标准或质量总分不足；
- 正式教程缺少完整操作与证据定位；
- 新节点低于 80 分；
- 新节点缺相近节点、关系、外部来源或节点草稿；
- 命中节点排除项却判为 `new`；
- 核心候选低于 85 分或绕过人工批准；
- 提案复用不匹配的证据哈希。

## 7. v0.1 明确不做

- 不调用模型 API。
- 不自动把提案写入正式数据。
- 不自动创建节点、关系或教程页。
- 不自动生成理解原理页。
- 不自动授予核心节点身份。
- 不把自动评分描述为事实准确或 L4 人工认证。

下一阶段 v0.2 才处理“批准后的确定性应用”，并要求新节点、关系、理解原理页、入口注册和布局作为一个原子事务通过全部门禁。
