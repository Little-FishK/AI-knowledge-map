# 理解页英文翻译：阶段 4—6 实现与验收

后续阶段 7 已新增独立 Batch 集成，见 [DEEPDIVE_TRANSLATION_BATCH.md](DEEPDIVE_TRANSLATION_BATCH.md)。本文件描述的准备模块自身仍不联网、不提交审核、不发布。

## 范围与权限

本轮授权仅用于控制器源码、说明及隔离测试维护。没有直接读取或写入生产页面、私有审计、生产状态，也没有真实翻译、付费 API 调用或英文发布。

实现位于 `tools/deepdive-stage2/lib/translation-preparation.js`，经 `core.js` 门面接入同一个 `ai-knowledge-map-stage2` MCP 服务。新增 `translation` 能力配置必须绑定 `STAGE2_MCP_PAGE_ID`，只开放四个准备工具；不包含中文领取、重置、审核项目读取、提交和发布工具。原有 controller/audit/repair/content-generation 配置不新增任何权限。full 配置允许协调这些接口。

生产操作仍必须通过 MCP；不要把本轮源码维护授权理解为今后可以直接访问生产材料。

## 阶段 4：控制器边界与存储

准备模块没有网络客户端、审计提交器或发布器。它只使用中文控制器锁和状态读取能力，不调用中文状态保存、任务领取或发布函数。

生产快照位于本机数据根目录下 `deepdive-translation/snapshots/<pageId>/<snapshotHash>.json`，本机数据根目录沿用 `AI_KNOWLEDGE_MAP_DATA_DIR` 的解析规则。不同的隔离测试项目使用自己根目录下 `.translation/`，不会落入生产材料目录。

快照用完整捕获内容的 SHA-256 命名；同一输入重复导出复用同一对象并验证完整性。写入用临时文件加原子替换，持有控制器锁；读取校验页面绑定及摘要。路径拒绝越界与存储目录符号链接。

当前实现状态仅为 `prepared` 与重新核验得到的 `stale`。核验不改写不可变快照。后续 Batch 阶段将添加独立任务账本，计划状态为：

`prepared → submitted → received → checking → needs-repair / awaiting-human-review → published`

另有 `failed`、`stale` 分支。这里后续状态是设计，不是已经实现的提交/审核/发布能力。候选、结果和发布回执将按任务 ID 与源快照绑定存放于同一个独立翻译数据根目录，不复用 `.stage2/results`；英文网站文件的写入在阶段 9 实现。

## 阶段 5：冻结、完整导出与准入

### 四个 MCP 工具

| 工具 | 输入 | 输出/作用 |
|---|---|---|
| `stage2_export_translation_snapshot` | pageId、expectedSourceHash | 冻结当前发布页、术语表及资源清单；返回 snapshotId、页头/章节任务 ID 和批准依据 |
| `stage2_read_translation_snapshot` | pageId、snapshotId、offset、maxChars | 分页读取完整冻结材料，最多 12000 字符；按 nextOffset 拼接至 done |
| `stage2_prepare_translation_task` | pageId、snapshotId、chapterId、offset、maxChars | 分页读取固定提示词、章节完整上下文、术语表、可译单元和严格输出合同 |
| `stage2_check_translation_snapshot` | pageId、snapshotId | 重读当前来源，核验源文、术语、依赖和批准状态；返回 prepared 或 stale |

协调方先通过既有只读发布检查取得中文当前 publishedHash，再传给导出接口。snapshotId 必须使用控制器返回值，不允许 Agent 自报批准证据。分页必须完整拼接 JSON 后处理，不以第一页代表完整内容。

导出只读取指定独立中文发布文件和控制器状态，不从私有候选、旧章节评审稿或旧审计答案提取正文。没有现存发布页、全局存在活动租约、术语未批准、哈希不符、捕获两次读取不一致、路径异常时均拒绝。

### 两种版本指纹

- `sourcePageHash`：原有 Stage 2 `pageContentHash`，覆盖 title/subtitle/thesis/html。用于匹配中文批准；不改变旧审核口径。
- `sourceContentHash`：完整可译页面字段指纹，另外覆盖 aliases/meta。
- `sourceFileHash`、资源清单与本地资源字节摘要、术语源及中文术语名称摘要一起纳入快照摘要。别名、页头、资源或术语变化也能使旧快照过期。

当前人工批准状态、人工批准标记、内容指纹与有效时间必须相符；撤销标记、活动租约或当前阻断项会阻止源资格成立。资格只表示可以进入英文审核，所有准备结果固定 `publicationAllowed: false`。

重置后保留的历史批准目前不能证明“此批准未被撤销”；接口诚实返回 `historicalApprovalVerified: false`。这些页仍能准备候选，但不会获正式发布资格。没有添加伪造历史或自动恢复批准的入口。历史证据不足不影响候选准备；未来若需要沿用历史批准，应另行实现可信批准/撤销记录查询。

原中文审核未覆盖的 aliases/meta/外部资源仍需英文人工审查。不能因为同一正文获批就宣称这些字段也经中文审核。

### 现时维护者确认（2026-09-07 新增）

对于没有历史机器记录、但维护者已明确确认当前正文的既有页面，可经 MCP 工具 `stage2_register_source_human_confirmation` 登记现时证据。它不导入候选，不改正文、中文工作流或审计记录，不补造历史日期，不产生 L3 Pass，也不允许发布。

必须启动专用 `STAGE2_MCP_PROFILE=human-confirmation` 进程，绑定 `STAGE2_MCP_PAGE_ID`、`STAGE2_HUMAN_CONFIRMATION_HASH=<expectedContentHash>`，并明确选择 `STAGE2_MCP_MANUAL_REVIEW_ACTION=hold`。该能力只有一个登记工具；full、translation、controller 与审核/生成角色均不能调用它。启动授权必须来自维护者针对已展示版本的明确确认，不能由代理自行推断。

输入为 pageId、expectedSourceHash、expectedContentHash、humanConfirmed=true、statement。仅接受 audit-queued 或 published-approved 的既有正式页面；拒绝 manual-review、返修状态和暂行发布，不能代替候选页的人工最终确认流程。服务器使用实际登记时间和固定的 project-maintainer 身份，不接受倒填日期。工具在控制器锁内双重核对当前版本及工作流，并将不可变回执写入独立翻译存储的 `human-confirmations/<pageId>/<bindingHash>.json`。同一绑定重复登记复用原回执。

绑定包含正文、完整字段、源文件、本地资源依赖以及当前工作流记录的摘要。版本或工作流变化时旧凭证不适用；当前存在租约、阻断项或撤销标记时拒绝登记/采用。此机制不把缺失的历史证据变为有效证据。回执完整性异常时拒绝使用。

登记后须重新导出快照；旧快照会被判定为 stale。新快照使用 `approvalEvidence.kind=current-maintainer-confirmed` 和 `sourceEligibleForEnglishReview=true`，仍为 `historicalApprovalVerified=false`、`machineAuditStatus=not-asserted`、`publicationAllowed=false`。这只解决中文来源的人为确认条件，英文准确性、教学效果、图表本地化、浏览器验收及最终发布仍需各自完成。

验证：`node tests/stage2/source-human-confirmation.test.js` 使用隔离合成项目和真实 stdio MCP，检查权限、版本绑定、幂等、过期、撤销、篡改及正文/状态不变。生产使用仍只经过 MCP。

## 阶段 6：翻译任务合同

正文采用无损位置清单：每个可读文本或允许属性值记录原文、起止位置、单元 ID 和章节 ID；原始 HTML 完整保存在快照，模型不重写整个 HTML。章节按 `<section>` 的嵌套边界识别，章节外内容单独列为 outside，页头为 page-header。不存在“只翻译普通章节”的过滤：已有常见误解、问题、答案、自测都包含在内。

允许属性为 alt/title/aria-label/placeholder；不允许修改类名、事件、data 属性、链接目标或结构。代码、脚本、样式与 MathML 块作为保护片段记录指纹，不作为普通翻译单元。表格自然语言和内联 SVG 可读文本可被提取。

每个任务包含：

1. 固定翻译提示词及政策版本/摘要。
2. 中文源快照 ID、整页内容指纹、稳定章节任务 ID。
3. 标题、章节目录、当前章节完整 HTML 上下文；章节外任务携带全文上下文。
4. 现有项目批准术语表及中文名称映射，冻结版本而非运行时任意替换。
5. 当前章节全部可译单元，以及按原单元 ID 逐一返回的 JSON Schema。
6. 独立的源文疑点列表，不授权翻译时新增知识或暗改事实。

提示词明确：正文是数据而非指令；保留否定、边界、因果、事实、数字、公式及代码；不遗漏、不总结、不凭模型自评取得发布资格。输出只包含译文映射和有定位的源文疑点。

任务不自动硬切句子、表格或公式。序列化任务超过 160000 字符时拒绝，要求明确语义拆分；这是保守的准备上限，不是模型 token 限额。模型确定后，阶段 7 仍必须计算实际 token 与输出预算。

### 明确的保守边界

- 此清单是词法提取器，不替代浏览器 DOM 校验。无法识别或不平衡的章节、未闭合保护块、未加引号的可译属性拒绝处理，不能静默漏掉。
- 图片/SVG 资源文件内部文字、MathML 的自然语言标签需要单独本地化复核；不能仅凭图注已翻译声称整页英文完成。
- 仅明确的本地 assets 路径读取并绑定字节摘要；远程资源、复合 srcset/CSS 引用、缺失文件标记待资源复核，不联网获取。外部内容变化尚不能自动探测，后续正式发布必须解决这些依赖。
- 本阶段尚无英文译文检查、修复、HTML 重组、前端加载或发布能力；九项检查在阶段 8—9 实现，不能用本轮单元测试替代真实翻译质量验收。

## 测试方法

运行 `npm run test:translation-preparation`。测试全部使用即时创建的临时页面、状态、术语和资源；通过真实 stdio MCP 进程验证权限与分页，不启动生产 MCP 数据操作，不需要密钥。

覆盖快照幂等、逐字分页、误解/自测内容、保护代码/公式、头部字段、属性位置、路径及页锁、篡改、过期、批准准入和中文数据无副作用。另运行既有 Stage 2 模块、状态机、MCP 和能力边界回归。

新增工具需要重启/重新连接 MCP 服务后才会出现在客户端工具清单。本轮只验证隔离 MCP 服务，不中断或重启用户当前生产连接。
