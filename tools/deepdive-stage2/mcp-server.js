"use strict";

const path = require("path");
const {
  ROOT,
  claimTask,
  createManualReviewPreview,
  finalizeManualReview,
  inspectPublicationCandidate,
  nextRecommendedPage,
  readAuditProjectFile,
  readTaskPacketPart,
  releaseLease,
  resetManualReview,
  resetPassedPage,
  rollbackProvisionalPage,
  searchAuditProject,
  status,
  submitResult,
  publishProvisionalPage,
  validateAuditResult,
  validatePageResult,
} = require("./core");

const root = path.resolve(process.env.DEEPDIVE_STAGE2_ROOT || ROOT);
const capabilityProfile = String(process.env.STAGE2_MCP_PROFILE || "full").trim().toLowerCase();
const lockedPageId = String(process.env.STAGE2_MCP_PAGE_ID || "").trim();
const lockedWorkerId = String(process.env.STAGE2_MCP_WORKER_ID || "codex-stage2-restricted").trim();
const provisionalPublishAuthorized = /^(?:1|true|yes)$/i.test(
  String(process.env.STAGE2_MCP_ALLOW_PROVISIONAL_PUBLISH || "").trim(),
);
const restrictedWorkerProfile = capabilityProfile === "audit" || capabilityProfile === "repair";
const pageLockedProfile = restrictedWorkerProfile || capabilityProfile === "controller";
let buffer = "";
let claimAttempted = false;
let submitAttempted = false;
let claimedLease = null;

const allTools = [
  {
    name: "stage2_status",
    description: "查看串行理解原理页队列的汇总状态；不返回页面正文。",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "stage2_next_recommended_page",
    description: "按地图官方推荐学习路径查找下一张尚未终止的理解原理页。只返回页面 ID、顺序与状态，不返回正文；manual-review 与 l3-auto-passed 视为本轮自动流程终态。",
    inputSchema: {
      type: "object",
      properties: {
        startOrder: { type: "string", pattern: "^\\d+(?:\\.\\d+)*$" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "stage2_claim_task",
    description: "领取唯一一个单页任务。返回值就是本次允许使用的完整材料包；一次运行只能调用一次。人工试点可用 pageId 指定已入队页面。paused、busy 或 idle 是正常终态，必须按 uiCleanup 调用 Codex 任务归档工具。",
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
    name: "stage2_reset_manual_review",
    description: "受控地把指定页面从 manual-review 重置为 audit-queued。仅用于人工授权的复审；拒绝其他状态和活动租约，并记录重置原因。",
    inputSchema: {
      type: "object",
      required: ["pageId", "reason"],
      properties: {
        pageId: { type: "string", pattern: "^[a-z0-9][a-z0-9-]*$" },
        reason: { type: "string", minLength: 3, maxLength: 500 },
      },
      additionalProperties: false,
    },
  },
  {
    name: "stage2_reset_passed_page",
    description: "受控地把指定页面从 l3-auto-passed 重置为 audit-queued，以执行人工授权的独立复审。拒绝其他状态和活动租约；保留当前发布页，清除本轮审计结论，并记录重置原因。",
    inputSchema: {
      type: "object",
      required: ["pageId", "reason"],
      properties: {
        pageId: { type: "string", pattern: "^[a-z0-9][a-z0-9-]*$" },
        reason: { type: "string", minLength: 3, maxLength: 500 },
      },
      additionalProperties: false,
    },
  },
  {
    name: "stage2_create_manual_review_preview",
    description: "为 manual-review 页面生成控制器托管的未发布候选预览，包含最终候选、当前阻断项及与正式页的字段/章节差异；不发布页面且不修改状态。",
    inputSchema: {
      type: "object",
      required: ["pageId"],
      properties: {
        pageId: { type: "string", pattern: "^[a-z0-9][a-z0-9-]*$" },
        rounds: {
          type: "array",
          maxItems: 2,
          items: {
            type: "object",
            required: ["defects", "improvements"],
            properties: {
              defects: {
                type: "array",
                maxItems: 20,
                items: { type: "string", maxLength: 1000 },
              },
              improvements: {
                type: "array",
                maxItems: 20,
                items: { type: "string", maxLength: 1000 },
              },
            },
            additionalProperties: false,
          },
        },
        finalStatus: { type: "string", maxLength: 200 },
      },
      additionalProperties: false,
    },
  },
  {
    name: "stage2_finalize_manual_review",
    description: "复用 manual-review 页面已经完成且与当前候选哈希一致的最终独立审计，重新计算当前门禁；只有零阻断时才由控制器发布，不启动新审计，也不允许绕过门禁。",
    inputSchema: {
      type: "object",
      required: ["pageId", "reason"],
      properties: {
        pageId: { type: "string", pattern: "^[a-z0-9][a-z0-9-]*$" },
        reason: { type: "string", minLength: 3, maxLength: 500 },
      },
      additionalProperties: false,
    },
  },
  {
    name: "stage2_inspect_publication_candidate",
    description: "只读检查指定页面的工作流状态、候选/正式页哈希、阻断项与暂行发布资格；不返回正文且不修改状态。",
    inputSchema: {
      type: "object",
      required: ["pageId"],
      properties: {
        pageId: { type: "string", pattern: "^[a-z0-9][a-z0-9-]*$" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "stage2_publish_provisional_page",
    description: "在用户明确授权后，由控制器把 manual-review 最终候选或被人工否决的已通过页作为不合格暂行版本覆盖正式理解页；保持 manual-review、写入红色标题所需标记、保存回滚快照，不集成新概念节点，也不伪造 L3 通过。",
    inputSchema: {
      type: "object",
      required: ["pageId", "expectedCandidateHash", "reason"],
      properties: {
        pageId: { type: "string", pattern: "^[a-z0-9][a-z0-9-]*$" },
        expectedCandidateHash: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
        reason: { type: "string", minLength: 3, maxLength: 500 },
      },
      additionalProperties: false,
    },
  },
  {
    name: "stage2_rollback_provisional_page",
    description: "由控制器回滚一次暂行发布；要求候选哈希一致、无活动租约且正式目标自发布后未被修改。",
    inputSchema: {
      type: "object",
      required: ["pageId", "expectedCandidateHash", "reason"],
      properties: {
        pageId: { type: "string", pattern: "^[a-z0-9][a-z0-9-]*$" },
        expectedCandidateHash: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
        reason: { type: "string", minLength: 3, maxLength: 500 },
      },
      additionalProperties: false,
    },
  },
  {
    name: "stage2_release_lease",
    description: "受控释放一次失败或中断任务留下的活动租约，并按原角色放回队列。必须同时匹配 pageId 和 taskId，并记录恢复原因。",
    inputSchema: {
      type: "object",
      required: ["pageId", "taskId", "reason"],
      properties: {
        pageId: { type: "string", pattern: "^[a-z0-9][a-z0-9-]*$" },
        taskId: { type: "string", minLength: 3, maxLength: 240 },
        reason: { type: "string", minLength: 3, maxLength: 500 },
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
    name: "stage2_read_task_packet",
    description: "仅供当前活动租约续读被分段交付的任务包。contract 返回除正文 HTML 外的完整合同和页面元数据；page-html 按字符偏移返回正文片段。不得用于读取其他页面或私有审计。",
    inputSchema: {
      type: "object",
      required: ["taskId", "leaseToken", "part"],
      properties: {
        taskId: { type: "string" },
        leaseToken: { type: "string" },
        part: { type: "string", enum: ["contract", "page-html"] },
        offset: { type: "integer", minimum: 0 },
        maxChars: { type: "integer", minimum: 1000, maximum: 12000 },
      },
      additionalProperties: false,
    },
  },
  {
    name: "stage2_validate_audit_result",
    description: "Preflight the current audit worker's own result against the lease-bound audit contract without writing state or consuming the single submission.",
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
  {
    name: "stage2_validate_page_result",
    description: "Preflight the current write, update, or repair worker's complete page result without writing state or consuming the single submission.",
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
  {
    name: "stage2_submit_result",
    description: "提交当前租约对应的结果。audit 角色按 auditContract.outputShape 提交审计对象；其他角色按任务包 outputShape 的结构合同提交实际完整 page 与 summary，不得提交结构说明本身。控制器验证后决定下一状态和是否发布；收到 accepted、needs-repair、l3-auto-passed 或 rejected 后，必须按 uiCleanup 归档当前 Codex 任务。",
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

const controllerTools = new Set([
  "stage2_status",
  "stage2_next_recommended_page",
  "stage2_inspect_publication_candidate",
]);
if (provisionalPublishAuthorized) {
  controllerTools.add("stage2_publish_provisional_page");
}

const capabilityTools = {
  full: new Set(allTools.map(tool => tool.name)),
  controller: controllerTools,
  audit: new Set([
    "stage2_claim_task",
    "stage2_search_project",
    "stage2_read_project_file",
    "stage2_read_task_packet",
    "stage2_validate_audit_result",
    "stage2_submit_result",
  ]),
  repair: new Set([
    "stage2_claim_task",
    "stage2_read_task_packet",
    "stage2_validate_page_result",
    "stage2_submit_result",
  ]),
};

if (!Object.hasOwn(capabilityTools, capabilityProfile)) {
  throw new Error(`Unsupported STAGE2_MCP_PROFILE: ${capabilityProfile}`);
}
if (pageLockedProfile && !/^[a-z0-9][a-z0-9-]*$/.test(lockedPageId)) {
  throw new Error(`STAGE2_MCP_PAGE_ID is required for the ${capabilityProfile} capability profile`);
}

const allowedToolNames = capabilityTools[capabilityProfile];
const tools = allTools.filter(tool => allowedToolNames.has(tool.name));

function restrictedError(message) {
  return toolResult({
    error: message,
    capabilityProfile,
  }, true);
}

function requireBoundLease(args) {
  if (!claimedLease) {
    throw new Error("No lease was claimed by this restricted MCP process");
  }
  if (args.taskId !== claimedLease.taskId || args.leaseToken !== claimedLease.leaseToken) {
    throw new Error("Task credentials do not match this restricted MCP process lease");
  }
}

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
    isError,
  };
}

function compactClaimResult(value) {
  if (!value || value.status !== "claimed" || !value.task || !value.task.page) return value;
  const html = String(value.task.page.html || "");
  if (html.length <= 12000) return value;
  const compact = JSON.parse(JSON.stringify(value));
  compact.task.page.html = "";
  compact.task.pageDelivery = {
    tool: "stage2_read_task_packet",
    part: "page-html",
    totalChars: html.length,
    maxCharsPerCall: 12000,
    authorization: {
      taskId: compact.task.taskId,
      leaseToken: compact.task.leaseToken,
    },
    instruction: "正文 HTML 已从领取响应中分离。必须从 offset=0 开始调用续读工具，按 nextOffset 顺序拼接 content，直到 done=true，再以完整结果作为 packet.page.html 底稿。不得只使用片段提交。",
  };
  return compact;
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
    if (!allowedToolNames.has(name)) {
      return response(id, restrictedError(`Tool ${name} is not available in the ${capabilityProfile} capability profile`));
    }
    if (capabilityProfile === "controller" && args.pageId && args.pageId !== lockedPageId) {
      return response(id, restrictedError(`This controller process is locked to page ${lockedPageId}`));
    }
    try {
      if (name === "stage2_status") return response(id, toolResult(status(root)));
      if (name === "stage2_next_recommended_page") {
        return response(id, toolResult(nextRecommendedPage(root, args.startOrder || "1.3")));
      }
      if (name === "stage2_claim_task") {
        if (restrictedWorkerProfile && claimAttempted) {
          return response(id, restrictedError(`This ${capabilityProfile} process has already attempted its single claim`));
        }
        if (restrictedWorkerProfile) claimAttempted = true;
        const claimPageId = restrictedWorkerProfile ? lockedPageId : (args.pageId || null);
        const claimWorkerId = restrictedWorkerProfile ? lockedWorkerId : (args.workerId || "codex-scheduled");
        if (restrictedWorkerProfile && args.pageId && args.pageId !== lockedPageId) {
          return response(id, restrictedError(`This ${capabilityProfile} process is locked to page ${lockedPageId}`));
        }
        const claim = claimTask(
          root,
          claimWorkerId,
          claimPageId,
        );
        if (restrictedWorkerProfile && claim.status === "claimed") {
          if (!claim.task || claim.task.role !== capabilityProfile || claim.task.pageId !== lockedPageId) {
            throw new Error(`Restricted ${capabilityProfile} process received an unexpected task for ${claim.task && claim.task.pageId}`);
          }
          claimedLease = {
            taskId: claim.task.taskId,
            leaseToken: claim.task.leaseToken,
          };
        }
        return response(id, toolResult(compactClaimResult(claim)));
      }
      if (name === "stage2_reset_manual_review") {
        return response(id, toolResult(resetManualReview(root, args.pageId, args.reason)));
      }
      if (name === "stage2_reset_passed_page") {
        return response(id, toolResult(resetPassedPage(root, args.pageId, args.reason)));
      }
      if (name === "stage2_create_manual_review_preview") {
        return response(id, toolResult(createManualReviewPreview(root, args.pageId, args)));
      }
      if (name === "stage2_finalize_manual_review") {
        return response(id, toolResult(finalizeManualReview(
          root,
          args.pageId,
          args.reason,
        )));
      }
      if (name === "stage2_inspect_publication_candidate") {
        return response(id, toolResult(inspectPublicationCandidate(root, args.pageId)));
      }
      if (name === "stage2_publish_provisional_page") {
        return response(id, toolResult(publishProvisionalPage(
          root,
          args.pageId,
          args.expectedCandidateHash,
          args.reason,
        )));
      }
      if (name === "stage2_rollback_provisional_page") {
        return response(id, toolResult(rollbackProvisionalPage(
          root,
          args.pageId,
          args.expectedCandidateHash,
          args.reason,
        )));
      }
      if (name === "stage2_release_lease") {
        return response(id, toolResult(releaseLease(
          root,
          args.pageId,
          args.reason,
          args.taskId,
        )));
      }
      if (name === "stage2_search_project") {
        if (capabilityProfile === "audit") requireBoundLease(args);
        return response(id, toolResult(searchAuditProject(root, args)));
      }
      if (name === "stage2_read_project_file") {
        if (capabilityProfile === "audit") requireBoundLease(args);
        return response(id, toolResult(readAuditProjectFile(root, args)));
      }
      if (name === "stage2_read_task_packet") {
        if (restrictedWorkerProfile) requireBoundLease(args);
        return response(id, toolResult(readTaskPacketPart(root, args)));
      }
      if (name === "stage2_validate_audit_result") {
        if (capabilityProfile === "audit") requireBoundLease(args);
        return response(id, toolResult(validateAuditResult(root, args)));
      }
      if (name === "stage2_validate_page_result") {
        if (restrictedWorkerProfile) requireBoundLease(args);
        return response(id, toolResult(validatePageResult(root, args)));
      }
      if (name === "stage2_submit_result") {
        if (restrictedWorkerProfile) {
          requireBoundLease(args);
          if (submitAttempted) {
            return response(id, restrictedError(`This ${capabilityProfile} process has already attempted its single submission`));
          }
          submitAttempted = true;
        }
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
