# n8n 官方 YouTube 五视频试跑

本批次只生成取证包、受限上下文和双轨提案，不自动写入教程目录、节点、节点关系或理解原理页。

## 结论

- 5 条视频全部取得 E2 证据包。
- 3 条达到“正式教程候选”：Quick Start、Official MCP、Human Review。
- 2 条只适合作为候选资料：OpenTelemetry 缺准确配置项，n8n Assistant 是预览功能概览而不是完整任务教程。
- 没有新节点，也没有核心节点候选。
- 6 个现有节点补充进入队列：`workflow-orchestration`、`agent`、`mcp`、`system-prompt`、`human-in-the-loop`、`observability`；其中 n8n Assistant 不产生概念补充。
- 按既定规则，本批次不会直接改写任何现有理解原理页。

## 五条视频

| 视频 | 教程轨 | 节点轨 |
|---|---|---|
| Quick Start 2026 | 正式候选；完整搭建问答 Agent | 补充工作流编排、AI Agent |
| Official MCP | 正式候选；连接与授权闭环完整 | 补充 MCP、System Prompt |
| Human Review | 正式候选；三种审批模式 | 补充人在回路 |
| OpenTelemetry | 候选；缺精确环境变量与完整安装 | 补充可观测性 |
| n8n Assistant | 候选；预览功能概览 | 不新增、不补充通用概念 |

结构化判定见 `pilot.json`。每条视频自己的 `context.json`、`proposal.json` 和 `proposal.md` 位于同级的对应 slug 目录；原始音视频、转录、关键帧与 OCR 位于 Git 忽略的 `tools/_raw/video/`。

## 这次真实发现的问题

1. 旧取证器把 ASR 语言固定成中文，英文视频会被错误识别。本批次已增加 `--language` 并用 `en` 重跑。
2. RapidOCR 多任务并行会造成严重 CPU 争用。本批次采用顺序 OCR；以后应在调度层限制 OCR 并发。
3. 上下文召回器没有把节点 ID 当作匹配词，导致视频中的 “MCP” 没命中 `mcp` 节点。本批次已修复并增加测试。
4. 长视频的 Whisper 转录仍会有少量跨语言误识别。E2 代表有完整可核对证据，不代表 ASR 可以不经编辑直接发布。
