# 「理解原理」分层质量门禁

版本：2.0
生效日期：2026-07-25

## 1. 目标与边界

这套门禁将“技术上可发布”“具备精审结构”“自动可证的教学一致性”和“内容已获人工标杆认证”拆成四个状态。四页人工阅读已经证明：字数、表格、公式、问题数量和关键词只能作为结构线索，不能构成教学质量结论。完整错误目录见 [DEEPDIVE_GATE_ERROR_CATALOG.md](DEEPDIVE_GATE_ERROR_CATALOG.md)。

外部框架只作为原则来源，不机械照搬：

- [Quality Matters Higher Education Rubric](https://www.qualitymatters.org/qa-resources/rubric-standards/higher-ed-rubric)：采用学习目标、材料、活动与评测的 Alignment 思想。
- [Learning Object Review Instrument（LORI）](https://eric.ed.gov/?id=EJ814034)：采用单个数字学习资源的内容质量、目标对齐、反馈、呈现与可用性评审维度。
- [CAST UDL Guidelines 3.0](https://udlguidelines.cast.org/)：采用词汇与符号澄清、数学记号解码、连接前置知识和渐退支架。
- [What Works Clearinghouse 教学组织指南](https://ies.ed.gov/ncee/wwc/practiceguide/1)：采用完整例题、图文结合、抽象—具体连接、主动提取和深层解释题。
- [SUNY OSCQR](https://oscqr.suny.edu/)：采用开放、形成性、持续刷新的课程复审流程（CC BY 4.0）。
- [Diátaxis](https://diataxis.fr/)：将本项目页面定位为 explanation，并允许用可复现场景承担 tutorial 功能。
- [ISO 24495-1:2023](https://www.iso.org/standard/78907.html)：采用清晰、可理解、可使用的简明语言原则。
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)：采用可感知、可操作、可理解和稳健的 Web 内容要求。
- [Vale](https://docs.vale.sh/) 与 [SonarQube Quality Gates](https://docs.sonarsource.com/sonarqube-server/quality-standards-administration/managing-quality-gates/introduction-to-quality-gates)：采用文档即代码、关键项阻断和增量质量思想。

自动化只能证明可客观观察且有稳定失败夹具的条件。L3 的结构代理分只作诊断，不再单独产生质量称号；通过 L3 还必须不存在已知的确定性教学完整性问题。公式正确、事实准确、解释是否充分、类比是否恰当和示例是否真正解释机制，仍由 L4 人工审校负责。

## 2. 四层状态

| 层级 | 状态名称 | 回答的问题 | 自动化 | 是否可称“标杆” |
|---|---|---|---|---|
| L1 | Release / 可发布 | 页面是否完整注册、结构有效且具备最低学习闭环 | 全自动、失败阻断 | 否 |
| L2 | Candidate / 结构候选 | 是否具备进入自动深度基准的教学部件 | 自动线索审计、不授予质量分 | 否 |
| L3 | Coherent / 教学一致 | 页面是否不存在自动可证的依赖、完整性、作者污染、映射和记号问题 | 全自动、关键项不可补偿 | 只能称“L3 自动一致性通过” |
| L4 | Certified / 人工标杆认证 | 当前内容是否准确、连贯、深入且经证据审校 | 人工评分 + 自动校验审校记录 | 是 |

禁止把 L1、L2 或 L3 输出写成“人工认证标杆页”。L3 只能说明已实现的确定性规则没有发现问题，不能替代 L4，也不能证明真实学习效果。

## 3. L1 发布门禁

命令：

```powershell
node tools/validate-deepdives.js
```

全部条件都是阻断项：

1. `data/graph.js` 的每个节点都有最终页面；不能只覆盖核心节点。每个页面 ID 必须只有一个注册来源，任何重复注册都直接阻断。
2. 页面在 `index.html` 的真实脚本顺序中成功注册，且没有被后加载脚本覆盖。
3. `title`、`subtitle`、`thesis`、学习目标、因果链、自测、答案与来源区存在。
4. 至少 7 个正文小节、3 个学习目标、3 道自测；答案数量不得少于题目。
5. 来源区至少有 2 个互不重复的 HTTPS 链接。
6. 访问日期可解析，且不得晚于当前日期。

L1 不判断来源是否一手、题目是否高质量或内容是否正确。

## 4. L2 结构候选审计

命令：

```powershell
node tools/audit-deepdive-gold.js
```

候选页至少应具备：

- 9 个正文小节和覆盖主要章节的问题引导；
- 3000 字正文与至少 4 个学习目标；
- 至少 3 个概念适配的教学部件；
- 图示、可复现场景、困惑消歧、独立误区和学习路线；
- 实践验证或失败诊断信号；
- 至少 4 道自测及对应答案；
- 至少 3 个互不重复的 HTTPS 来源。

这些条件只产生“结构候选”，不产生分数。关键词命中只能说明存在进入 L3 自动深度审计的线索。

严格要求单页达到 L2：

```powershell
node tools/audit-deepdive-gold.js --require-candidate reasoning-models
```

合并时只阻断变更集新增的结构缺口：

```powershell
node tools/audit-deepdive-gold.js --changed --baseline docs/deepdive-quality-baseline.json
```

`deepdive-quality-baseline.json` 只用于显式记录既有债务，不允许把新页面或新缺口加入基线来绕过审校。减少的缺口应及时从基线删除。

## 5. L3 教学一致性自动门禁

L3 回答的问题是：**在自动化能够稳定举证的范围内，这一页是否存在已知教学完整性缺陷？**

原有 100 分模型继续保留为“结构代理分”，用于发现页面是否缺少目标、章节、引导语、机制词、教学制品、诊断、自测和来源。代理分不是质量分，不能证明认知连续、目标对齐、示例有效或问题具有迁移价值。

### 5.1 不可补偿的确定性阻断

以下问题一经检出直接产生 L3 缺口，不能由正文长度、图表、公式或其他维度分数补偿：

1. 最终 HTML 中 `.dd-lead` 异常超长、占据章节主体，或吞入标题、表格、图、列表、代码等块级内容。
2. 页面含有全局质量补全器生成的通用自测、答案、诊断、案例或机制段落。渲染器和补全器不得代替作者撰写实质教学内容。
3. 同页存在异常重复段落，或后续实现的跨页高相似语义块达到污染阈值。
4. 页面声明的概念、符号、公式、学习目标或题目元数据不完整或自相矛盾。
5. 官方学习路径中，未标为“预告”的依赖指向当前节点之后。
6. 可执行手算或案例的声明值与复算结果不一致。
7. 题目中的结构化显式约束与答案映射不一致。
8. 已声明的对数底数、信息单位或变量单位在同页和相邻官方节点中冲突。

第 1–3 项已经进入自动门禁。采用 `quality.contractVersion: 1` 的页面必须至少声明一个具备题干、规则、步骤和结果解释的完整案例，并对第 4 项中的公式符号合同和案例局部题干合同执行硬阻断；未迁移页面会进入“强制人工复核”队列，不能因为 L3 没有阻断项就声称这些内容已经验证。第 5–8 项在相应元数据迁移完成后逐项转为阻断。

符号首次定义、教材式公式排版、MathML、公式教学链和可执行表达式分层的完整规范见 [DEEPDIVE_MATH_NOTATION.md](DEEPDIVE_MATH_NOTATION.md)。

### 5.2 结构化教学证据

新页面和大改页面应逐步提供以下机器可读信息：

```js
quality: {
  contractVersion: 1,
  prerequisites: ["supervised-learning"],
  previews: ["gradient-descent"],
  concepts: [
    { id: "parameter-w", introducedIn: "section-3" }
  ],
  formulas: [
    {
      id: "gd-update",
      section: 3,
      symbols: [
        {
          name: "w",
          meaning: "当前参数",
          evidence: "w 表示模型当前需要更新的参数"
        },
        {
          name: "η",
          meaning: "学习率",
          evidence: "η 控制每一步沿梯度方向移动多远"
        }
      ],
      unitConvention: "更新前后 w 的单位一致"
    }
  ],
  examples: [
    {
      section: 4,
      evidence: {
        setup: "给定初始参数 w=2 和目标值",
        rule: "先使用平方损失计算当前误差",
        steps: "把 w=2 代入后",
        interpretation: "更新后损失下降，表示这一步方向正确"
      }
    }
  ],
  objectiveMappings: [
    { objectiveId: "goal-1", sections: ["section-2"], questions: ["q1"] }
  ],
  questions: [
    { id: "q5", taughtConcepts: ["batch-size"], requiredParts: 3 }
  ]
}
```

元数据不能替代正文。它只把作者声称的定义、依赖和映射变成可校验合同；L4仍要检查这些声明是否真实、充分。

#### 公式符号合同

采用合同版本 1 后，页面中的每个 `.dd-formula` 必须具有唯一合同 ID，且该 ID 必须在 `quality.formulas` 中登记。新内容直接使用 `data-formula-id`；历史页面迁移期间允许用 `section + formulaIndex` 定位现有公式，但公式顺序变化时合同会失效，后续大改应转成显式 ID。每个核心符号都要同时提供：

1. `name`：公式中真实出现的符号；
2. `meaning`：符号承担的自然语言角色；
3. `evidence`：同一章节正文中真实存在的解释片段。

审计器会验证公式存在、章节编号一致、符号确实出现在公式中，以及证据片段位于当前公式之前的同一章节或更早的定义章节。定义不能反向依赖后续章节。缺少任何一项产生 `notation.formula-missing-*`、`notation.symbol-not-in-formula` 或 `notation.undefined-symbol` 阻断。只在元数据中编造解释、正文没有对应证据，不能通过。

#### 案例局部题干合同

采用合同版本 1 后，凡标题或内容表明属于“手算、逐步演算、数值例子、案例推演、运行示例”等章节，必须在当前章节建立四类证据：

1. `setup`：任务、对象、输入和必要单位；
2. `rule`：使用的定义、判据或计算规则；
3. `steps`：代入和关键中间步骤；
4. `interpretation`：结果怎样回答原问题及其边界。

证据可以使用 `data-example-part="setup|rule|steps|interpretation"` 标记非空正文，也可以在 `quality.examples[].evidence` 中绑定当前章节的真实文本片段。跨章节曾经出现过同一人物或数值，不能代替当前案例入口。缺少证据产生 `example.missing-local-*` 阻断。

#### 历史页面迁移

合同版本 1 只在已迁移页面上执行硬合同，避免用未经审查的批量标签伪造完成状态。仍使用旧格式且包含公式或案例的页面统一进入“强制人工复核”，报告必须单列数量；它们可以表示“未命中既有自动 blocker”，但不能表示公式符号与案例连续性已经通过。

未迁移页继续使用高术语密度提示。采用合同版本 1 的页面还要检查关键概念的首次出现，即使当前章节只出现一个关键新概念也不能绕过复核。记录使用 `quality.termReviews[]`，至少包含章节号、审查日期，以及该节每个关键概念的：

- `name`：概念名称；
- `meaning`：审校者确认的概念含义；
- `purpose`：它在当前任务中解决什么问题；
- `definitionEvidence`：正文中真实存在的“是什么”证据；
- `purposeEvidence`：正文中真实存在且不同于定义证据的“有什么用”证据。

任一关键概念缺记录、证据不存在、定义与用途复用同一占位句，都会产生 `terminology.missing-first-use-contract` 并使该页退出新门禁完整通过集合。自动检查只能证明证据存在，不能代替 L4 判断解释是否足以让目标读者理解。

### 5.3 章节六问合同（合同版本 2）

合同版本 2 把质量单位从“整页具备哪些部件”下沉到每个核心章节。页面生成器用 `data-section-role` 区分：

- `core`：讲授概念、任务、机制、案例、评测或工作流的作者正文；
- `synthesis`：全页因果链总结；
- `assessment`：误区、自测与答案；
- `reference`：依赖、路线和查阅表。

每个 `core` 章节必须在 `quality.sectionContracts[]` 中逐节回答六个不可跨节补偿的问题：

1. `definition`：它是什么？
2. `problem`：它解决什么问题？
3. `inputOutput`：输入和输出是什么？
4. `mechanism`：它怎样工作？
5. `interpretation`：结果怎样解释？
6. `boundary`：适用边界是什么？

每项同时包含不少于 8 字的 `answer` 和当前章节真实存在的 `evidence`。六项证据不得复用同一个占位片段；证据不能从别的章节借用。缺少章节合同产生 `section.missing-contract`，缺少任一问题产生 `section.missing-*`，复用证据产生 `section.reused-evidence`，均为不可补偿阻断。

“输入和输出”按章节对象解释：算法章节是数据到结果，评测章节是候选结果到评估证据，概念章节是已知条件到可作出的判断。该规则不要求每节都有公式或代码。`synthesis`、`assessment` 和 `reference` 使用各自门禁，不机械套用六问。

### 5.4 自动提示而非阻断

以下内容短期内只生成 `review-required` 或 `advisory`，不能由正则或不稳定模型直接阻断：

- 尚未进入关键概念词表的新术语、跨页前置知识和解释充分性；
- 类比没有说明对应关系和失效边界；
- “必须、总是、等于正确答案”等绝对化表述；
- 总体量、经验估计量和因果结论可能混淆；
- 工程代价没有落到时间、吞吐、显存、通信或错误成本；
- 诊断没有形成“观察—含义—下一步”；
- 案例虽可复算，但是否真正解释了目标机制；
- 自测难度是否适合当前读者。

这些提示必须进入 L4审校，不得转化成关键词加分。

### 5.5 结构代理分

为兼容历史报告，保留下列诊断维度及最低分，但必须始终显示为“结构代理分”：

| 代理维度 | 满分 | 最低分 | 只能证明 |
|---|---:|---:|---|
| 页面骨架 | 20 | 16 | 规模、章节、目标、引导和因果链线索存在 |
| 机制词线索 | 20 | 16 | 输入、变换、输出、反馈、边界相关词出现 |
| 教学制品 | 20 | 16 | 图、表、公式、代码、案例和误区组件存在 |
| 验证诊断 | 15 | 12 | 验证、提示、顺序和边界词出现 |
| 练习结构 | 15 | 12 | 题数、答案数、疑似高阶题和场景题存在 |
| 来源维护 | 10 | 8 | 链接、日期、路线和注释存在 |

代理分及维度下限只生成编辑提示，不再决定 L3 通过状态。只有确定性完整性检查决定“L3 自动一致性通过”；解释充分性和真实教学质量仍必须由 L4 决定。这样可以防止作者为了命中“如果、如何、诊断”等词而机械改写本来合理的题目。

神经网络参照页及其内容哈希固定在 `docs/deepdive-l3-benchmark.json`，仅用于锚定结构代理算法。参照页变化必须先审查再更新哈希，但参照页自身也不能定义全部教学真理。

全量报告：

```powershell
node tools/audit-deepdive-benchmark.js
```

严格要求单页通过 L3 教学一致性门禁：

```powershell
node tools/audit-deepdive-benchmark.js --require-benchmark reasoning-models
```

PR 增量阻断：

```powershell
node tools/audit-deepdive-benchmark.js --changed --baseline docs/deepdive-l3-baseline.json
```

`deepdive-l3-baseline.json` 显式记录启用 L3 v2 时的历史债务。新页面没有基线，必须零缺口；既有页面不得新增缺口。基线不是“通过”，每条债务必须能追溯到规则 ID，减少后及时删除。禁止把新页面、新缺陷或无期限豁免写入基线绕过审校。

## 6. L4 人工标杆认证

### 6.1 关键阻断项

以下任一项失败，即使总分超过 88 也不能认证：

1. 当前页面没有严格通过 L3 教学一致性自动门禁。
2. 没有已知关键事实错误。
3. 关键断言、公式和快速变化内容有适当来源或验证证据。
4. 学习目标确实被正文与自测覆盖。
5. 贯穿示例已经独立复算、执行或推演。
6. 桌面端、移动端与基本无障碍验收通过。
7. 没有未解决的 blocker。

### 6.2 评分量规

| 维度 | 满分 | 维度最低分 | 审校证据 |
|---|---:|---:|---|
| 准确性与内容质量 | 25 | 22 | LORI内容质量：关键断言、公式、限定条件、反例、遗漏与复核结果 |
| 目标对齐与认知连续 | 20 | 17 | LORI/QM Alignment + UDL：目标→章节→案例→自测映射，术语、符号和前置概念顺序 |
| 原理深度 | 20 | 17 | 输入、状态/变换、输出、反馈、边界和权衡 |
| 示例、表示与消歧 | 15 | 12 | WWC/UDL：抽象—具体连接、可复现例题、观察结果、误区和失败归因 |
| 评测与反馈 | 10 | 8 | LORI/QM/WWC：非背诵题、完整答案、目标对齐、指标陷阱和诊断任务 |
| 来源与可维护性 | 10 | 8 | 一手/权威来源、断言对齐、日期、版本边界和领域记号约定 |

认证要求：所有关键项通过、各维度达到最低分、总分至少 88。

### 6.3 可追溯审校记录

审校记录保存在 `docs/deepdive-quality-reviews.json`，当前格式为 `schemaVersion: 3` 且 `certificationLevel: "L4"`。每条认证必须包含：

- 当前页面内容的 SHA-256；
- 审校日期和失效日期；
- 对应 Git 提交；
- 至少两名不同审校者，其中至少一名标记为独立审校者；
- 六个维度的分数和至少 30 字的具体审校摘要；
- 关键断言到页面原文、页面内来源、来源定位和复核方法的映射；
- 学习目标到章节和自测题的映射；
- 输入、变换、输出和边界四类机制检查；
- 示例复现记录、误区与纠正原文、题目与答案映射；
- 页面内来源的权威类型、支持范围、定位和复核日期；
- 仓库内证据 artifact 的路径、类型、说明和 SHA-256；
- 关键项状态、blocker 和最终决定。

以下写法不能认证：

- 把 `evidence.accuracy` 等字段填写成“已检查”“确认无误”；
- 引用页面来源区之外的 URL；
- 填写页面中不存在的目标、章节、题目、答案或原文片段；
- 只放一个未绑定页面哈希的截图或文本文件；
- artifact 文件发生变化后继续复用旧哈希；
- 只有作者自审，没有独立审校者。

生成当前页面模板：

```powershell
node tools/review-deepdive-quality.js --template reasoning-models
```

验证某页是否具有当前有效认证：

```powershell
node tools/review-deepdive-quality.js --require-current reasoning-models
```

页面内容一旦变化，哈希失配，原认证自动失效。快速变化主题建议有效期不超过 90 天；稳定基础主题不超过 365 天。

生成与当前页面哈希绑定的真实浏览器证据：

```powershell
node tools/audit-deepdive-browser.js --id reasoning-models --report docs/evidence/reasoning-models-browser.json
```

`browser-report` 必须由该工具生成、通过桌面和移动视口、包含当前页面哈希，并由审校记录再次校验文件 SHA-256。复现日志仍需人工判断其结论是否可信；自动门禁只负责确保记录存在、未被篡改且交叉引用真实页面内容。

## 7. 统一入口与合并策略

常规回归：

```powershell
node tools/check-deepdive-quality.js
```

门禁工具自身的回归测试：

```powershell
node tools/test-deepdive-quality.js
```

要求某页具有 L4 人工认证：

```powershell
node tools/check-deepdive-quality.js --l4-certified reasoning-models
```

合并规则：

- 所有深读页改动必须通过 L1。
- 新页面或大改页面必须达到 L2。
- 新页面必须严格达到 L3；既有页面改动不得新增 L3 缺口。触及已有缺陷所在章节时应同步清除对应债务。
- 全局生成器、渲染器和质量工具的变化视为影响全部页面，必须执行全量 L3。
- 被标为“已审查”“标杆”、核心发布或高风险主题的页面必须具有当前 L4 人工认证；没有L4只能显示“已发布/待独立认证”。
- 普通小改采用增量审查；每季度执行一次全量 L1/L2 和认证有效期盘点。

### 7.1 规则变更流程

1. 从真实错误记录建立规则提案。
2. 标明成熟规范依据和项目领域补充。
3. 先加入报告模式，收集误报。
4. 提供通过与失败夹具。
5. 只有确定性规则才能升级为 CI blocker。
6. 为历史问题建立显式、有限的债务基线。
7. 修复页面后删除基线项，禁止维持虚假全通过数字。

自动门禁输出必须分别报告“结构代理分”“确定性缺口”和“L4认证状态”，不得合成一个总质量分。

## 8. 浏览器与无障碍验收

自动和人工组合检查：

- 默认桌面视口与 390×844 移动视口无页面级横向溢出；
- 表格需要时在自身容器滚动，不把整页撑宽；
- 公式、代码和 SVG 在缩放后仍可阅读；
- SVG 有可理解的可访问名称和图注；
- 标题层级、键盘返回/关闭、焦点可见性与颜色对比符合 WCAG 2.2 AA 的适用条款；
- 控制台没有页面自身产生的错误；
- W3C HTML/链接检查和自动无障碍工具只作为线索，不能替代人工键盘和语义检查。

自动审计命令：

```powershell
npm install
node tools/audit-deepdive-browser.js --changed
```

工具使用真实 Chromium，在 1280×900 与 390×844 两个视口检查渲染、页面/表格重排、标题层级、图像替代文本、SVG 名称、表头、链接与按钮名称、键盘焦点、Escape 关闭、文本对比度和控制台错误。它只覆盖可自动判断的 WCAG 子集，不能据此声明完整 WCAG 2.2 AA 合规。

标题跳级作为非阻断结构建议报告：标题层级连续是重要最佳实践，但不能冒充 WCAG 2.2 的独立失败判据。其余可确定的失败会返回非零退出码。

## 9. CI 合并阻断与故障夹具

`.github/workflows/deepdive-quality.yml` 在 Pull Request 中安装 Chromium，先运行故障夹具，再执行统一门禁。故障夹具必须覆盖真实错误目录，而不只覆盖缺字段和缺组件。CI 通过 `GITHUB_BASE_REF` 比较 `origin/<目标分支>...HEAD`，不能用干净工作区的 `git status` 代替 PR 差异。仓库管理员还需把检查 `L1 + L2 + L3 + browser/WCAG` 配置为目标分支的 Required status check，才能在平台层真正禁止合并。

故障夹具命令：

```bash
npm run test:quality-gates
```

夹具明确要求以下坏样例失败：重复页面注册、非核心节点漏页、重复来源、未来访问日期、题答不配、L2 缺少验证/诊断信号、L2 结构齐全但缺少 L3 高阶练习/机制链、L3 参照页哈希漂移、把 L3 记录冒充 L4、使用“已检查”敷衍 L4 摘要、篡改证据 artifact，以及正文变化后继续复用旧 L4 哈希认证。

历史上被最终版本覆盖的 `guardrails`、`system-prompt` 页面及两个恢复垫片保存在 `docs/history/deepdive-registrations/`，不再参与运行时加载。当前规范文件分别是 `batch-28-agent-systems.js` 和 `batch-31a-control-boundaries.js`。

## 10. 规范维护

- 修改门禁时必须附一个“过去会误判、现在能识别”的回归样例。
- 自动指标不得使用“标杆”“认证”“准确”等超出其测量能力的名称。
- 阈值变化应记录原因，并先以报告模式评估全站影响。
- 人工审校记录不得批量伪造；没有证据时状态应保持未认证。
