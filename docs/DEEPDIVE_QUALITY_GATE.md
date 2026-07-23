# 「理解原理」分层质量门禁

版本：1.1  
生效日期：2026-07-23

## 1. 目标与边界

这套门禁将“技术上可发布”“具备精审结构”“达到神经网络页的自动基准”和“内容已获人工标杆认证”拆成四个状态，避免用字数、表格或关键词替代教学质量。

外部框架只作为原则来源，不机械照搬：

- [Quality Matters Higher Education Rubric](https://www.qualitymatters.org/qa-resources/rubric-standards/higher-ed-rubric)：采用学习目标、材料、活动与评测的 Alignment 思想。
- [SUNY OSCQR](https://oscqr.suny.edu/)：采用开放、形成性、持续刷新的课程复审流程（CC BY 4.0）。
- [Diátaxis](https://diataxis.fr/)：将本项目页面定位为 explanation，并允许用可复现场景承担 tutorial 功能。
- [ISO 24495-1:2023](https://www.iso.org/standard/78907.html)：采用清晰、可理解、可使用的简明语言原则。
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)：采用可感知、可操作、可理解和稳健的 Web 内容要求。
- [Vale](https://docs.vale.sh/) 与 [SonarQube Quality Gates](https://docs.sonarsource.com/sonarqube-server/quality-standards-administration/managing-quality-gates/introduction-to-quality-gates)：采用文档即代码、关键项阻断和增量质量思想。

自动化只能证明可客观观察的条件。L3 用于证明页面在可测教学工程维度达到“神经网络级”；公式正确、事实准确、示例是否真正解释机制、问题链是否符合认知顺序，仍由 L4 人工审校负责。

## 2. 四层状态

| 层级 | 状态名称 | 回答的问题 | 自动化 | 是否可称“标杆” |
|---|---|---|---|---|
| L1 | Release / 可发布 | 页面是否完整注册、结构有效且具备最低学习闭环 | 全自动、失败阻断 | 否 |
| L2 | Candidate / 结构候选 | 是否具备进入自动深度基准的教学部件 | 自动线索审计、不授予质量分 | 否 |
| L3 | Benchmark / 神经网络级 | 可自动验证的教学工程是否达到神经网络页基准 | 全自动、分维度阻断 | 只能称“L3 基准通过” |
| L4 | Certified / 人工标杆认证 | 当前内容是否准确、连贯、深入且经证据审校 | 人工评分 + 自动校验审校记录 | 是 |

禁止把 L1、L2 或 L3 输出写成“人工认证标杆页”。L3 只能说明可自动检查的维度达到基准，不能替代 L4。

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

## 5. L3 神经网络级自动基准

L3 的目标是判断页面在可自动验证的教学工程维度上，是否达到 `neural-network` 页所代表的层次，而不是机械复制其字数、公式数量或插图数量。每个维度必须独立达标，不能用超长正文补偿缺失的示例，也不能用大量表格补偿薄弱的问题链。

L3 总分 100，最低总分 88，并设置不可互相补偿的维度最低分：

| 自动维度 | 满分 | 最低分 | 核心要求 |
|---|---:|---:|---|
| 认知连续 | 20 | 16 | 正文规模、章节、目标、问题引导、因果链 |
| 机制闭环 | 20 | 16 | 输入、变换、输出、反馈、边界及形式化表达 |
| 教学制品 | 20 | 16 | 可访问图示、有效表格/公式/代码、贯穿示例、误区 |
| 验证诊断 | 15 | 12 | 验证指标、困惑提示、诊断顺序、失败边界 |
| 迁移练习 | 15 | 12 | 至少 5 题、答案配对、高阶问题、场景迁移、无重复 |
| 来源维护 | 10 | 8 | 独立来源、日期、延伸路线和来源说明 |

阻断能力包括：

1. 问题链与学习目标能够映射到正文和练习。
2. 输入、变换、输出、反馈与边界形成完整机制闭环。
3. 至少一个可复现的贯穿示例，并有可观察的中间结果。
4. 具有与主题适配的形式化表达和原创教学制品。
5. 包含误区、反例、失败模式、验证指标和诊断顺序。
6. 练习包含解释、迁移和故障诊断，而非只做术语回忆。
7. 来源、浏览器、响应式和基础无障碍门禁通过。

神经网络参照页及其内容哈希固定在 `docs/deepdive-l3-benchmark.json`。参照页一旦变化，门禁先停止，必须审查变化后显式更新哈希，不能悄悄移动标准。

全量报告：

```powershell
node tools/audit-deepdive-benchmark.js
```

严格要求单页通过：

```powershell
node tools/audit-deepdive-benchmark.js --require-benchmark reasoning-models
```

PR 增量阻断：

```powershell
node tools/audit-deepdive-benchmark.js --changed --baseline docs/deepdive-l3-baseline.json
```

`deepdive-l3-baseline.json` 显式记录启用 L3 时的历史债务。新页面没有基线，必须零缺口；既有页面不得新增缺口。减少的缺口应从基线删除，禁止用扩张基线绕过门禁。

## 6. L4 人工标杆认证

### 6.1 关键阻断项

以下任一项失败，即使总分超过 88 也不能认证：

1. 当前页面没有严格通过 L3 神经网络级自动基准。
2. 没有已知关键事实错误。
3. 关键断言、公式和快速变化内容有适当来源或验证证据。
4. 学习目标确实被正文与自测覆盖。
5. 贯穿示例已经独立复算、执行或推演。
6. 桌面端、移动端与基本无障碍验收通过。
7. 没有未解决的 blocker。

### 6.2 评分量规

| 维度 | 满分 | 维度最低分 | 审校证据 |
|---|---:|---:|---|
| 准确性 | 25 | 22 | 关键断言、公式、限定条件、反例与复核结果 |
| 目标对齐与认知连续 | 20 | 17 | 目标→章节→案例→自测映射，前置概念顺序 |
| 原理深度 | 20 | 17 | 输入、状态/变换、输出、反馈、边界和权衡 |
| 示例与消歧 | 15 | 12 | 可复现示例、观察结果、常见误区和失败归因 |
| 评测与练习 | 10 | 8 | 非背诵题、完整答案、指标陷阱和诊断任务 |
| 来源与可维护性 | 10 | 8 | 一手/权威来源、断言对齐、日期和版本边界 |

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

建议合并规则：

- 所有深读页改动必须通过 L1。
- 新页面或大改页面必须达到 L2。
- 新页面必须严格达到 L3；既有页面改动不得新增 L3 缺口，并应逐步清债。
- 被产品标为“标杆”、核心发布或高风险主题的页面必须具有当前 L4 人工认证。
- 普通小改采用增量审查；每季度执行一次全量 L1/L2 和认证有效期盘点。

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

`.github/workflows/deepdive-quality.yml` 在 Pull Request 中安装 Chromium，先运行故障夹具，再执行统一门禁。CI 通过 `GITHUB_BASE_REF` 比较 `origin/<目标分支>...HEAD`，不能用干净工作区的 `git status` 代替 PR 差异。仓库管理员还需把检查 `L1 + L2 + L3 + browser/WCAG` 配置为目标分支的 Required status check，才能在平台层真正禁止合并。

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
