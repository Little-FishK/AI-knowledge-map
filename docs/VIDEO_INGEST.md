# 视频双轨入库 v0.1–v0.2

> 生效日期：2026-07-24  
> 当前能力：v0.1 生成并严格校验提案；v0.2 只在独立人工批准后预览或确定性应用教程资源与概念补充任务，并支持自动恢复和显式回滚。

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
- `supplement`：只在视频提供了**现有原理页尚未覆盖、且可迁移到其他软件的新机制或新边界**时，给已有节点增加待写作材料。单一产品如何使用既有概念的操作案例、按钮、配置或功能展示必须判为 `reject`。
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

`coreCandidate: true` 必须至少 85/100，并提供 `coreReason`。`requiresHumanCoreApproval` 自 v0.3 起废弃，仅为旧提案兼容保留；未来是否自动授予核心身份取决于独立复核、真实图指标和完整影响门禁，而不是逐项人工批准。视频中的高频出现不能自动证明核心地位。

### 5.1 `coreCandidate` 与 `supplement` 的确定语义

- `coreCandidate: true` 只表示：**本次建议把一个尚非核心的节点晋升为核心节点**。
- 目标节点已经位于 `graph.core` 时必须填写 `false`；它已经是核心，不是“核心候选”。
- 新节点尚未获得核心身份，因此在同时满足新节点门禁和核心门禁时仍可填写 `true`。
- `reject` 候选不得填写 `coreCandidate: true`。
- `supplement` 必须同时证明三件事：
  1. `transferableBeyondProduct`：机制或边界可以迁移到其他软件；
  2. `notCoveredByExistingNode`：现有原理页尚未覆盖这项内容；
  3. `mechanismOrBoundary`：材料解释的是机制或边界，而不只是操作步骤。
- 三项中任意一项不成立，就不能进入现有原理页补充队列。产品教程价值与原理页补充资格分别判断：一条视频可以是优秀教程，同时对概念轨全部 `reject`。

机器可读提案和独立复核都使用：

```json
{
  "decision": "supplement",
  "supplementCriteria": {
    "transferableBeyondProduct": true,
    "notCoveredByExistingNode": true,
    "mechanismOrBoundary": true
  }
}
```

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
- 核心候选低于 85 分，或缺独立复核与真实图指标；
- 提案复用不匹配的证据哈希。

### 6.1 首次真实视频试跑

2026-07-24 使用 n8n 官方视频
[Building AI Agents: Chat Trigger, Memory, and System/User Messages Explained [Part 1]](https://www.youtube.com/watch?v=yzvLfHb0nqE)
完成首轮真实试跑：

- 证据包：20:16，250 段时间戳转录，101 帧抽样、去重后 77 帧 OCR，E2 建议；
- 教程轨：建议为 `n8n` 创建教程页并正式收录，质量 60 / 70；
- 概念轨：新增节点 0；建议补充 `agent`、`system-prompt`、`agent-memory`、`workflow-orchestration`；
- 拒绝把具体模型名、顺带提及的多模态/向量数据库和产品节点 Chat Trigger 误建为知识节点；
- `--ready` 严格校验通过；2026-07-24 经维护者批准后由 v0.2 成功应用。

可审查提案与批准文件位于 `tools/proposals/video/n8n-ai-agent-part1/`。应用结果为 1 个 n8n 教程页和 4 项现有节点补充任务；原始音视频、转录、帧、plan 与回滚凭据仍只保存在被 Git 忽略的 `tools/_raw/`。

## 7. v0.1 明确不做

- 提案生成与门禁本身不调用生成式模型 API；证据采集的 ASR 可按配置使用 Groq 或本地 faster-whisper。
- 不自动把提案写入正式数据。
- 不自动创建节点、关系或教程页。
- 不自动生成理解原理页。
- 不自动授予核心节点身份。
- 不把自动评分描述为事实准确或 L4 人工认证。

## 8. v0.2：批准、预览、应用与回滚

v0.2 把“内容判断”和“写入授权”分开。`proposal.json` 保持不可变；人工决定写在独立的 `approval.json`，并绑定提案与证据哈希。只写名字不代表系统能鉴别人类身份，因此 `approvedBy` 是审计标签，真正的批准动作仍应由仓库维护者本人执行和审阅。

### 8.1 生成待填写批准文件

```powershell
npm run video:approve -- `
  --proposal "tools/proposals/video/n8n-ai-agent-part1/proposal.json" `
  --output "tools/proposals/video/n8n-ai-agent-part1/proposal.approval.json"
```

默认状态为 `draft`，教程和每个概念都是 `pending`。也可在明确审阅后用命令生成完整批准：

```powershell
npm run video:approve -- `
  --proposal "<proposal.json>" `
  --output "<approval.json>" `
  --tutorial approve `
  --approve-concepts "AI Agent,System Prompt" `
  --reject-remaining `
  --approved-by "维护者名字"
```

批准文件必须逐项覆盖全部候选。提案已判为 `reject` 或 `uncertain` 的概念不能被直接批准应用；应先回到提案阶段修正。

### 8.2 dry-run 变更计划

```powershell
npm run video:apply -- `
  --proposal "<proposal.json>" `
  --evidence "<evidence.json>" `
  --approval "<approval.json>" `
  --plan "<plan.json>"
```

默认只预览，不写文件。计划包含操作、阻断原因、警告、每个目标的前后哈希和完整目标内容。教程进入统一生成层 `data/tutorials-video-generated.js`；`supplement` / `merge` 进入 `data/video-concept-supplements.json` 待写作队列。

### 8.3 确定性应用

审阅 plan 后才加入 `--write`：

```powershell
npm run video:apply -- `
  --proposal "<proposal.json>" `
  --evidence "<evidence.json>" `
  --approval "<approval.json>" `
  --plan "<plan.json>" `
  --write `
  --receipt "<receipt.json>"
```

`--write` 强制读取已经存在的 plan，绝不会覆盖它；工具会把当前重新计算的计划与已审阅计划做内容指纹比较。提案、批准、目标文件或操作集合有任何变化，都必须重新 dry-run 和审阅。

应用器会：

1. 重新计算提案、证据、批准与 plan 哈希；
2. 检查目标文件自预览后是否变化；
3. 用临时文件 + rename 写入固定白名单目标；
4. 运行教程和视频应用数据门禁；
5. 任一步失败都恢复所有已写目标；
6. 成功后生成含前后内容和哈希的回滚凭据。

相同提案重复应用会变成 no-op，不会重复添加资源或补充任务。

### 8.4 显式回滚

```powershell
npm run video:rollback -- --receipt "<receipt.json>" --write
```

只有目标仍与 receipt 的应用后哈希一致时才允许回滚；如果应用后又有人修改文件，工具会拒绝覆盖。回滚完成后再次运行门禁；回滚门禁失败则恢复回滚前状态。

### 8.5 新节点的硬边界

v0.2 当前不会把 `proposedNode` 的几行摘要冒充完整节点。批准 `new` 时，如果缺少以下原子包，plan 必须为 `blocked`：

- 完整节点数据与合法关系；
- 官方推荐学习路径位置；
- 通过 L1–L3 的完整理解原理页；
- 浏览器入口注册与布局结果。

因此 v0.2 已能安全应用教程并建立现有节点补充任务，但新节点、核心身份和关系仍不会半自动落库。下一小版本将为完整新节点原子包定义数据合同，而不是绕过现有质量门禁。

## 9. v0.3：独立影子复核

v0.3 先建立“自动裁判”，不开放新节点或核心身份的正式写入。它遵守两条固定政策：

1. 单条新视频对现有节点的 `supplement` / `merge` 只进入待写作队列，绝不自动改动现有理解原理页。
2. 新节点和核心节点未来可以免逐项人工批准，但必须先由提案与独立复核得出一致结论，并通过可机器验证的完整门禁。

### 9.1 为什么复核文件必须独立

提案中的分数是发现阶段的主张，不是证明。独立复核文件单独绑定提案哈希与证据哈希，模板不复制提案分数。复核者应先读取原始证据和受限图谱上下文，再独立填写决定与分数；提案与复核不一致时只能进入异常队列。

生成空白独立复核模板：

```powershell
npm run video:shadow-template -- `
  --proposal "<proposal.json>" `
  --evidence "<evidence.json>" `
  --output "<assessment.json>" `
  --reviewer "<独立复核器 id>"
```

为了避免复核者被原提案锚定，实际交叉复核优先生成盲审任务包。任务包只公开候选术语，不公开提案决定、理由、目标节点和分数；它同时包含完整视频证据、全图节点摘要、关系、学习路径、评分量规和空白输出模板：

```powershell
npm run video:shadow-packet -- `
  --proposal "<proposal.json>" `
  --evidence "<evidence.json>" `
  --output "<packet.json>" `
  --reviewer "independent-reviewer-a"
```

`reviewer` 是审计标识，不绑定厂商或模型。它可以对应 Claude、Codex、其他模型、规则引擎或人工复核者；系统只依赖统一数据合同，不依赖特定服务。

命令同时生成 `<packet>.prompt.md`，可直接交给隔离上下文中的独立复核器。复核器必须只返回 JSON。回复保存后，先导入并校验哈希、字段、证据定位和完整性：

```powershell
npm run video:shadow-import -- `
  --input "<model-output.txt>" `
  --packet "<packet.json>" `
  --proposal "<proposal.json>" `
  --evidence "<evidence.json>" `
  --output "<assessment.json>"
```

运行影子复核：

```powershell
npm run video:shadow-review -- `
  --proposal "<proposal.json>" `
  --evidence "<evidence.json>" `
  --assessment "<assessment.json>" `
  --output "<shadow-report.json>"
```

也可以暂不提供 `--assessment`。报告会明确标记“缺独立复核文件”，所有候选均不得自动合格。

批量试跑使用 manifest；缺独立复核的任务记为 `blocked`，不会阻断其他任务，任何批次的正式写入仍为 0：

```powershell
npm run video:shadow-batch -- `
  --manifest "tools/proposals/video/shadow-batch.example.json" `
  --output "tools/_raw/video/shadow-batch.summary.json" `
  --write-reports
```

### 9.2 影子审计内容

每个候选分别记录：

- 全图标题、别名与正文文本去重，并列出最相近的 5 个节点；
- 视频时间/画面证据是否合法；
- 新节点是否有至少两个独立 HTTPS 来源、至少两条关键断言，以及断言到来源的显式映射；
- 候选关系是否使用合法端点和类型、连接新节点且没有重复或自环；
- `proposedLearningPath` 是否位于前置节点之后、后续节点之前；
- 从当前真实图谱计算的度数、介数中心性、跨区连接和中心性等级；
- 提案与独立复核是否一致；
- 新节点与核心节点的影子资格，以及逐项阻断原因。

新节点要进入“影子合格”，必须同时满足：两阶段一致、独立评分至少 80、全图去重明确通过、来源—断言通过、关系通过、学习路径通过、视频证据通过且没有排除项。

核心节点使用独立复核分数，但其中 `graphCentrality` 会被真实图指标覆盖，不能手填。影子核心总分仍须至少 85。高频出现、流行度或提案自报中心性都不会自动加分。

### 9.3 当前边界

- 影子报告的 `formalWrites` 固定为 `0`。
- v0.3 不修改 `data/graph.js`、官方学习路径、核心列表或任何理解原理页。
- v0.3 不把关键词相似度冒充完整语义证明；模糊匹配会进入 `uncertain`。
- v0.3 只校验“登记来源是否与断言建立映射”，尚未联网读取来源正文并判断蕴含关系。
- 下一阶段才会生成完整新节点原子包，并继续在预览目录中接受 L1–L3、浏览器、布局和回滚测试。

实现与测试：

- `tools/video-ingest/shadow-review.js`
- `tools/video-ingest/create-shadow-assessment.js`
- `tools/video-ingest/create-shadow-packet.js`
- `tools/video-ingest/import-shadow-assessment.js`
- `tools/video-ingest/review-proposal-shadow.js`
- `tools/video-ingest/review-shadow-batch.js`
- `tools/video-ingest/schemas/shadow-assessment.schema.json`
- `tools/test-video-shadow-review.js`

## 10. v0.4：新节点完整原子包预览

v0.4 只接受同时满足以下条件的候选：

- 提案决定与独立复核决定一致；
- 独立新节点评分至少 80；
- 去重、来源—断言、视频证据、关系和学习路径审计全部通过；
- v0.3 报告中的 `shadowEligibility.newNode` 为 `true`。

现有节点的 `supplement` / `merge` 不进入本流程，继续只保留在待写作队列。

### 10.1 模型中立的内容写作包

通过影子门禁后，先生成写作任务包。它不指定模型，可由任意隔离模型或人工写作者完成：

```powershell
npm run video:node-content-packet -- `
  --proposal "<proposal.json>" `
  --evidence "<evidence.json>" `
  --assessment "<assessment.json>" `
  --term "<候选术语>" `
  --output "<content-packet.json>"
```

任务包固定要求：详情正文四段骨架、机制闭环、至少 9 节、4 个学习目标、可复现贯穿示例、原创教学制品、误区与诊断、至少 5 道迁移型自测及答案、至少 3 个优先级清楚的来源。

### 10.2 组装原子包

写作者只返回 `outputTemplate` JSON。填好的内容文件与提案、证据、独立复核哈希绑定，然后生成预览：

```powershell
npm run video:node-package -- `
  --proposal "<proposal.json>" `
  --evidence "<evidence.json>" `
  --assessment "<assessment.json>" `
  --content "<content.json>" `
  --output "<preview-directory>"
```

预览目录同时包含：

- `manifest.json`：完整绑定、资格和门禁结果；
- `node.json`：节点详情正文、案例与来源；
- `edges.json`：至少两条合法关系；
- `learning-path.json`：官方推荐学习路径位置；
- `layout.json`：基于邻居重心和确定性搜索得到的坐标及遮挡报告；
- `deepdive/<node-id>.js`：完整理解原理页。

### 10.3 原子门禁

一个包必须整体通过：

1. 提案、证据、独立复核、内容和当前图谱五类哈希一致；
2. 节点 ID、标题、大区、正文、案例和至少两个来源有效；
3. 正文内联引用全部指向真实节点；
4. 至少两条关系连接新节点且端点、方向类型合法；
5. 学习路径序号不重复，位置满足前置/后续约束；
6. 新坐标不造成同区视觉框重叠，也不遮挡任一节点超过 3/4；
7. 理解原理页严格通过现有 L1、L2、L3 工具。

任一项失败，包保持 `draft`，不得进入后续应用阶段。v0.4 的 `formalWrite` 在 Schema 中固定为 `false`，工具没有修改 `data/graph.js`、核心列表、学习路径、入口文件或深读页的代码路径。

当前 n8n 真实提案没有新节点候选，因此正确结果是“不生成原子包”，而不是为了测试流程虚构正式节点。自动测试另用明确标记的虚构夹具验证完整成功和失败路径。

实现与合同：

- `tools/video-ingest/create-node-content-packet.js`
- `tools/video-ingest/create-node-package.js`
- `tools/video-ingest/node-package.js`
- `tools/video-ingest/schemas/node-package-content.schema.json`
- `tools/video-ingest/schemas/node-package.schema.json`
- `tools/test-video-node-package.js`

## 11. v0.5：批量影子校准与开放门禁

v0.5 不生成或应用节点。它把批量影子预测与版本化的标准答案逐候选比较，回答一个更严格的问题：当前自动裁判是否已经积累了足够多、足够多样的证据，可以开始开发正式自动应用。

标准答案保存在 `tools/proposals/video/calibration-labels-v05.json`。每个样本按候选术语记录期望决定与核心身份；标签属于项目编辑基线，不从提案自报分数自动复制。

运行：

```powershell
npm run video:calibrate -- `
  --batch "tools/_raw/video/shadow-batch.summary.json" `
  --labels "tools/proposals/video/calibration-labels-v05.json" `
  --output "tools/_raw/video/calibration-v05.json"
```

默认开放条件全部不可互相补偿：

| 指标 | 最低要求 |
|---|---:|
| 视频任务数 | 10 |
| 标注候选数 | 30 |
| 真实新节点样本 | 5 |
| 已有节点合并/补充样本 | 10 |
| 应拒绝样本 | 5 |
| 真实核心节点样本 | 3 |
| 独立复核解析覆盖率 | 95% |
| 已解析候选决策准确率 | 90% |
| 新节点精确率 | 100% |
| 新节点召回率 | 80% |
| 已有节点逃逸成新节点 | 0% |
| 拒绝项误收成新节点 | 0% |
| 核心节点精确率 | 100% |
| 核心节点召回率 | 80% |

这里优先保护精确率：漏掉一个新节点可以以后补，误建重复节点或误授予核心身份会直接污染地图和新人导航，因此不能用总体准确率抵消。

首个真实基线只有 n8n 一个任务、8 个候选，且没有独立复核结果。校准器正确给出：

- 已解析覆盖率 0；
- 真实新节点与核心节点样本均为 0；
- `readyForAutomaticApplicationDevelopment: false`；
- `formalWrites: 0`。

这不是失败，而是防止系统在样本不足时宣称成熟。下一步需要扩充 10–20 个来自不同类型官方视频的标注影子集，尤其补足真正的新节点、已有节点、产品按钮/配置和核心候选四类边界样本。

实现与合同：

- `tools/video-ingest/calibration.js`
- `tools/video-ingest/calibrate-shadow.js`
- `tools/video-ingest/schemas/calibration-labels.schema.json`
- `tools/proposals/video/calibration-labels-v05.json`
- `tools/test-video-calibration.js`
