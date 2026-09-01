# n8n 官方视频双轨入库提案

- 视频：[Building AI Agents: Chat Trigger, Memory, and System/User Messages Explained [Part 1]](https://www.youtube.com/watch?v=yzvLfHb0nqE)
- 发布者：n8n
- 时长：20:16
- 证据：E2，250 段时间戳转录、77 个去重关键帧 OCR
- 提案状态：`ready`，等待人工批准
- v0.2 批准文件：`proposal.approval.json`，当前为 `approved`；已成功应用

## 教程轨

**建议：正式收录，并为 `n8n` 创建教程页。**

质量评分为 60 / 70。视频完成了“空白画布 → Chat Trigger → AI Agent → Chat Model → System Message → Window Buffer Memory → 激活 → Executions 检查”的入门闭环。它的边界也很明确：这是 2024 年发布的系列 Part 1，只适合作为“第一个聊天型 Agent”教程，不能代表 n8n 全功能或生产级 Agent 工程。

拟收录内容已经在 `proposal.json` 中整理为四段可复现流程、完成标志、两项独特技巧和安全提醒。当前没有写入正式教程数据。

## 概念轨

**建议新增节点：0。**

建议补充现有节点：

- `agent`：补入 LLM 与 Agent 的机制对比，以及简单规则不该滥用 Agent 的边界。
- `system-prompt`：补入角色、风格、行为边界和动态上下文的实操案例。
- `agent-memory`：补入 session ID、窗口记忆和前后对照验证。
- `workflow-orchestration`：补入确定性步骤与 Agent 混合编排的案例。

明确拒绝：

- GPT / 具体聊天模型：只是模型下拉框示例。
- Multimodal：只有一句带过。
- Vector Database：只出现在示例提示画面。
- Chat Trigger：是教程所需的产品节点，不是知识地图概念节点。

没有核心节点候选，也没有自动变更任何节点关系。

v0.2 已按正式批准文件完成 dry-run 和原子应用：n8n 教程页已创建，上述四项补充已进入待处理队列。没有新增节点、关系或核心身份。

## 人工批准项

- [x] 同意把该视频作为 n8n 教程页的第一条正式资源
- [x] 同意把四项补充送入相应理解原理页的后续写作队列
- [x] 确认不新增节点、不调整核心节点
