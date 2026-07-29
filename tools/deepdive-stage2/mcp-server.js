"use strict";

const path = require("path");
const {
  ROOT,
  claimTask,
  readAuditProjectFile,
  searchAuditProject,
  status,
  submitResult,
} = require("./core");

const root = path.resolve(process.env.DEEPDIVE_STAGE2_ROOT || ROOT);
let buffer = "";

const tools = [
  {
    name: "stage2_status",
    description: "查看串行理解原理页队列的汇总状态；不返回页面正文。",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "stage2_claim_task",
    description: "领取唯一一个单页任务。返回值就是本次允许使用的完整材料包；一次运行只能调用一次。人工试点可用 pageId 指定已入队页面。",
    inputSchema: {
      type: "object",
      properties: {
        workerId: { type: "string", maxLength: 120 },
        pageId: { type: "string", pattern: "^[a-z0-9][a-z0-9-]*$" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "stage2_search_project",
    description: "仅供活动 audit 租约在项目文本中只读搜索。硬性屏蔽私有审计、状态、Git、依赖、敏感文件和二进制文件。",
    inputSchema: {
      type: "object",
      required: ["taskId", "leaseToken", "query"],
      properties: {
        taskId: { type: "string" },
        leaseToken: { type: "string" },
        query: { type: "string", minLength: 2, maxLength: 160 },
        pathPrefix: { type: "string", maxLength: 300 },
        maxResults: { type: "integer", minimum: 1, maximum: 50 },
      },
      additionalProperties: false,
    },
  },
  {
    name: "stage2_read_project_file",
    description: "仅供活动 audit 租约分段读取项目文本文件。一次最多返回 400 行，接口不具备任何写入能力。",
    inputSchema: {
      type: "object",
      required: ["taskId", "leaseToken", "path"],
      properties: {
        taskId: { type: "string" },
        leaseToken: { type: "string" },
        path: { type: "string", maxLength: 300 },
        startLine: { type: "integer", minimum: 1 },
        endLine: { type: "integer", minimum: 1 },
      },
      additionalProperties: false,
    },
  },
  {
    name: "stage2_submit_result",
    description: "提交当前租约对应的结果。audit 角色把 auditContract.outputShape 直接作为 result；其他角色把任务包 outputShape 直接作为 result。控制器验证后决定下一状态和是否发布。",
    inputSchema: {
      type: "object",
      required: ["taskId", "leaseToken", "result"],
      properties: {
        taskId: { type: "string" },
        leaseToken: { type: "string" },
        result: { type: "object" },
      },
      additionalProperties: false,
    },
  },
];

function response(id, result) {
  process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, result })}\n`);
}

function failure(id, code, message) {
  process.stdout.write(`${JSON.stringify({
    jsonrpc: "2.0",
    id,
    error: { code, message },
  })}\n`);
}

function toolResult(value, isError = false) {
  return {
    content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
    structuredContent: value,
    isError,
  };
}

function handle(message) {
  const { id, method, params } = message;
  if (method === "notifications/initialized") return;
  if (method === "initialize") {
    return response(id, {
      protocolVersion: "2025-06-18",
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: "ai-knowledge-map-stage2", version: "1.0.0" },
    });
  }
  if (method === "ping") return response(id, {});
  if (method === "tools/list") return response(id, { tools });
  if (method === "tools/call") {
    const name = params && params.name;
    const args = (params && params.arguments) || {};
    try {
      if (name === "stage2_status") return response(id, toolResult(status(root)));
      if (name === "stage2_claim_task") {
        return response(id, toolResult(claimTask(
          root,
          args.workerId || "codex-scheduled",
          args.pageId || null,
        )));
      }
      if (name === "stage2_search_project") {
        return response(id, toolResult(searchAuditProject(root, args)));
      }
      if (name === "stage2_read_project_file") {
        return response(id, toolResult(readAuditProjectFile(root, args)));
      }
      if (name === "stage2_submit_result") {
        return response(id, toolResult(submitResult(root, args)));
      }
      return failure(id, -32601, `未知工具：${name}`);
    } catch (error) {
      return response(id, toolResult({ error: error.message }, true));
    }
  }
  if (id != null) return failure(id, -32601, `未知方法：${method}`);
}

process.stdin.setEncoding("utf8");
process.stdin.on("data", chunk => {
  buffer += chunk;
  let newline;
  while ((newline = buffer.indexOf("\n")) !== -1) {
    const line = buffer.slice(0, newline).trim();
    buffer = buffer.slice(newline + 1);
    if (!line) continue;
    try {
      handle(JSON.parse(line));
    } catch (error) {
      failure(null, -32700, `JSON 解析失败：${error.message}`);
    }
  }
});
