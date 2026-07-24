# n8n 官方 YouTube 五视频试跑

本批次已生成取证包、受限上下文、5 份 `ready` 双轨提案和 5 份盲化独立复核，不自动写入教程目录、节点、节点关系或理解原理页。

## 结论

- 5 条视频全部取得 E2 证据包。
- 3 条达到“正式教程候选”：Quick Start、Official MCP、Human Review。
- 2 条只适合作为候选资料：OpenTelemetry 缺准确配置项，n8n Assistant 是预览功能概览而不是完整任务教程。
- 没有新节点，也没有核心节点候选。
- 3 个现有节点补充进入队列：`system-prompt`、`human-in-the-loop`、`observability`；产品特定的 Agent、工作流和 n8n MCP 使用案例不再计作通用原理补充。
- 按既定规则，本批次不会直接改写任何现有理解原理页。

## Ready 与独立复核结果

- 5 份提案全部通过 `--ready` 严格门禁。
- 教程分依次为：Quick Start 68.75、Official MCP 66.25、Human Review 66.25、OpenTelemetry 48.75、n8n Assistant 33.75（满分 70）。
- 独立复核覆盖 18 个概念候选；在统一 `supplement` 与 `coreCandidate` 语义并重新盲审后，18 个判断全部一致。
- 一致结论仍为：0 个新节点、0 个自动合格核心节点、0 次正式写入。
- `coreCandidate` 现在只表示“本批次提议把一个尚非核心的节点晋升为核心”；已有核心节点必须为 `false`。
- `supplement` 只允许可跨产品迁移、现有节点尚未覆盖、且属于机制或边界的内容；具体按钮、配置和单一产品案例必须拒绝。

## 五条视频

| 视频 | 教程轨 | 节点轨 |
|---|---|---|
| Quick Start 2026 | 正式候选；完整搭建问答 Agent | 无通用概念补充 |
| Official MCP | 正式候选；连接与授权闭环完整 | 补充 System Prompt |
| Human Review | 正式候选；三种审批模式 | 补充人在回路 |
| OpenTelemetry | 候选；缺精确环境变量与完整安装 | 补充可观测性 |
| n8n Assistant | 候选；预览功能概览 | 不新增、不补充通用概念 |

结构化判定见 `pilot.json`，批量复核汇总见 `shadow-batch-report.json`。每条视频自己的 `context.json`、`proposal.json`、`proposal.md`、`shadow/assessment.json` 和 `shadow/review.json` 位于同级的对应 slug 目录；原始音视频、转录、关键帧与 OCR 位于 Git 忽略的 `tools/_raw/video/`。

## 这次真实发现的问题

1. 旧取证器把 ASR 语言固定成中文，英文视频会被错误识别。本批次已增加 `--language` 并用 `en` 重跑。
2. RapidOCR 多任务并行会造成严重 CPU 争用。本批次采用顺序 OCR；以后应在调度层限制 OCR 并发。
3. 上下文召回器没有把节点 ID 当作匹配词，导致视频中的 “MCP” 没命中 `mcp` 节点。本批次已修复并增加测试。
4. 长视频的 Whisper 转录仍会有少量跨语言误识别。E2 代表有完整可核对证据，不代表 ASR 可以不经编辑直接发布。
