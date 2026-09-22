"use strict";

const path = require("path");
const { inventoryPageAssets } = require('./lib/page-asset-inventory');
const {
  ROOT,
  buildWebsite,
  inspectAuditUpgrade,
  queueAuditUpgrade,
  applyInformationTheoryAuthorizedRepair,
  applyTransformerAuthorizedSources,
  diagnoseCandidateGate,
  createReadinessCheckpoint,
  loadState,
  inspectTranslationSourceBinding,
  registerSourceHumanConfirmation,
  translationPublication,
  translationQuality,
  translationBatch,
  translationDeepSeek,
  translationCampaign,
  exportTranslationSnapshot,
  readTranslationSnapshot,
  prepareTranslationTask,
  checkTranslationSnapshot,
  backfillStateV2Objects,
  buildStateV2Shadow,
  claimTask,
  createManualReviewPreview,
  finalizeManualReview,
  inspectPublicationCandidate,
  localDataStatus,
  migrateLocalData,
  importEditorialCandidate,
  enqueueContentGeneration,
  nextRecommendedPage,
  resolveRecommendedPage,
  readAuditProjectFile,
  readContentGenerationSection,
  readTaskPacketPart,
  releaseLease,
  resetManualReview,
  resetPassedPage,
  rollbackEditorialCandidate,
  returnEditorialForRevision,
  rollbackProvisionalPage,
  saveContentGenerationResponse,
  searchAuditProject,
  stateStorageReport,
  status,
  submitResult,
  switchStateV2,
  publishProvisionalPage,
  validateAuditResult,
  validatePageResult,
  validateStateV2DualRead,
} = require("./core");

const root = path.resolve(process.env.DEEPDIVE_STAGE2_ROOT || ROOT);
const capabilityProfile = String(process.env.STAGE2_MCP_PROFILE || "full").trim().toLowerCase();
const lockedPageId = String(process.env.STAGE2_MCP_PAGE_ID || "").trim();
const lockedWorkerId = String(process.env.STAGE2_MCP_WORKER_ID || "codex-stage2-restricted").trim();
const provisionalPublishAuthorized = /^(?:1|true|yes)$/i.test(
  String(process.env.STAGE2_MCP_ALLOW_PROVISIONAL_PUBLISH || "").trim(),
);
const restrictedWorkerProfile = capabilityProfile === "audit"
  || capabilityProfile === "repair"
  || capabilityProfile === "content-generation";
const qualityProfiles = ["translation-quality", "translation-review", "translation-repair", "translation-publication", "translation-static", "translation-deepseek", "human-confirmation"];
const pageLockedProfile = restrictedWorkerProfile || capabilityProfile === "controller" || capabilityProfile === "translation" || capabilityProfile === "translation-batch" || qualityProfiles.includes(capabilityProfile);
let buffer = "";
let claimAttempted = false;
let submitAttempted = false;
let claimedLease = null;
let qualityDelivery = null;
let qualitySubmitted = false;

const allTools = [
  {name:'stage2_build_website',description:'控制器按网站发布配置构建独立产物；可绑定单页英文摘要供后续限定范围合并；不部署、不改变审核状态。',inputSchema:{type:'object',required:['siteUrl','mode'],properties:{siteUrl:{type:'string'},mode:{type:'string',enum:['preview','production']},englishPageId:{type:'string',pattern:'^[a-z0-9][a-z0-9-]*$'},expectedEnglishArtifactHash:{type:'string',pattern:'^sha256:[a-f0-9]{64}$'}},additionalProperties:false}},
  ...[
    ["stage2_build_deepseek_translation", "离线生成独立 DeepSeek 单页计划；必须明确模型、账号标签、峰时价格、预算和推理强度，不上传。", { snapshotId: { type: "string" }, config: { type: "object", additionalProperties: false,
      required: ["model", "accountId", "contextWindow", "maxOutputTokens", "reasoningEffort", "inputUsdPerMillion", "outputUsdPerMillion", "priceBasis", "budgetUsd", "maxAttempts", "requestTimeoutMs"],
      properties: { model: { type: "string", enum: ["deepseek-v4-pro"] }, accountId: { type: "string", pattern: "^[A-Za-z0-9_-]{3,80}$" },
        contextWindow: { type: "integer", minimum: 1, maximum: 1000000 }, maxOutputTokens: { type: "integer", minimum: 1, maximum: 384000 },
        reasoningEffort: { type: "string", enum: ["none", "low", "high", "max"] }, inputUsdPerMillion: { type: "number", exclusiveMinimum: 0 },
        outputUsdPerMillion: { type: "number", exclusiveMinimum: 0 }, priceBasis: { type: "string", enum: ["peak-cache-miss"] },
        budgetUsd: { type: "number", exclusiveMinimum: 0 }, maxAttempts: { type: "integer", minimum: 1, maximum: 3 },
        requestTimeoutMs: { type: "integer", minimum: 1000, maximum: 600000 } } } }, ["snapshotId", "config"]],
    ["stage2_inspect_deepseek_translation", "只读 DeepSeek 章节进度和费用预留，不返回正文。", { planId: { type: "string" } }, ["planId"]],
    ["stage2_run_deepseek_translation", "精确计划和独立凭据获授权后只调用下一章；逐章保存，失败重试须明确要求，不明确结果禁止重发。", { planId: { type: "string" }, retry: { type: "boolean" } }, ["planId"]],
    ["stage2_preview_translation", "重组冻结译文并返回版本绑定的候选及待验收项，不发布。", { reviewId: { type: "string" }, offset: { type: "integer", minimum: 0 }, maxChars: { type: "integer", minimum: 1, maximum: 12000 } }, ["reviewId"]],
    ["stage2_build_static_translation", "从当前已批准中英版本构建双语静态样板，不部署；页锁定并核对接受回执。", { reviewId: { type: "string" }, artifactHash: { type: "string" }, siteUrl: { type: "string" } }, ["reviewId", "artifactHash", "siteUrl"]],
    ["stage2_publish_translation", "仅发布全部门禁及人工验收通过的精确英文候选；启动环境必须授权该摘要。", { reviewId: { type: "string" }, artifactHash: { type: "string" }, acceptance: { type: "object" } }, ["reviewId", "artifactHash", "acceptance"]],
    ["stage2_begin_translation_quality", "从指定提供方已收齐的译文建立独立检查记录，不发布；默认 openai。", { planId: { type: "string" }, provider: { type: "string", enum: ["openai", "deepseek"] } }, ["planId"]],
    ["stage2_inspect_translation_quality", "检查九项门禁的真实状态；浏览器和资源未验证时保持待完成。", { reviewId: { type: "string" } }, ["reviewId"]],
    ["stage2_read_translation_quality_packet", "按调度策略和顺序分页读取当前角色材料；首审 medium、返修 high、返修后复验 low。", { reviewId: { type: "string" }, reasoningEffort: { type: "string", enum: ["low", "medium", "high"] }, offset: { type: "integer", minimum: 0 }, maxChars: { type: "integer", minimum: 1, maximum: 12000 } }, ["reviewId", "reasoningEffort"]],
    ["stage2_submit_translation_review", "独立审查角色提交逐单元证据与整页结论，不允许修改译文。", { reviewId: { type: "string" }, revision: { type: "string" }, evidence: { type: "object" } }, ["reviewId", "revision", "evidence"]],
    ["stage2_repair_translation_units", "返修角色仅修改已定位缺陷的英文单元；最多两轮，之后重新审查。", { reviewId: { type: "string" }, revision: { type: "string" }, replacements: { type: "object", additionalProperties: { type: "string" } } }, ["reviewId", "revision", "replacements"]],
  ].map(([name, description, properties, required]) => ({ name, description, inputSchema: { type: "object", additionalProperties: false,
    required: ["pageId", ...required], properties: { pageId: { type: "string", pattern: "^[a-z0-9][a-z0-9-]*$" }, ...properties } } })),
  ...[
    ["stage2_build_translation_batch", "仅本地构建整页 Batch 计划与费用估算，不上传。模型、价格和预算必须明确提供。", { snapshotId: { type: "string" }, config: { type: "object", additionalProperties: false,
      required: ["model", "projectId", "contextWindow", "maxOutputTokens", "reasoningEffort", "inputUsdPerMillion", "outputUsdPerMillion", "budgetUsd", "maxAttempts"], properties: {
        model: { type: "string" }, projectId: { type: "string" }, contextWindow: { type: "integer", minimum: 1 }, maxOutputTokens: { type: "integer", minimum: 1 },
        reasoningEffort: { type: "string", enum: ["high"] },
        inputUsdPerMillion: { type: "number", exclusiveMinimum: 0 }, outputUsdPerMillion: { type: "number", exclusiveMinimum: 0 }, budgetUsd: { type: "number", exclusiveMinimum: 0 }, maxAttempts: { type: "integer", minimum: 1, maximum: 3 },
      } } }, ["snapshotId", "config"]],
    ["stage2_inspect_translation_batch", "只读本地 Batch 进度、失败章节和费用记录，不返回正文。", { planId: { type: "string" } }, ["planId"]],
    ["stage2_submit_translation_batch", "仅在环境授权精确计划后，计数、上传并提交 Batch；不明确的提交禁止重发。", { planId: { type: "string" }, retry: { type: "boolean" } }, ["planId"]],
    ["stage2_reconcile_translation_batch", "核对不明确的远端批次；找不到唯一匹配时继续阻止重复付费。", { planId: { type: "string" } }, ["planId"]],
    ["stage2_collect_translation_batch", "查询远端状态并保存输出/错误，按请求编号接收未审译文；不发布。", { planId: { type: "string" } }, ["planId"]],
  ].map(([name, description, properties, required]) => ({ name, description, inputSchema: { type: "object", additionalProperties: false,
    required: ["pageId", ...required], properties: { pageId: { type: "string", pattern: "^[a-z0-9][a-z0-9-]*$" }, ...properties } } })),
  ...[
    ["stage2_inspect_translation_source_binding", "只读返回当前中文页用于人工确认的精确页面与内容摘要；不返回正文，不登记确认，不改变审核或发布状态。", {}, []],
    ["stage2_register_source_human_confirmation", "登记维护者对当前中文版本的明确确认；仅写独立凭证，不改变正文、机器审计或发布状态。必须使用绑定页面及完整内容摘要的专用授权进程。", {
      expectedSourceHash: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
      expectedContentHash: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
      humanConfirmed: { type: "boolean", const: true }, statement: { type: "string", minLength: 1, maxLength: 4000 }
    }, ["expectedSourceHash", "expectedContentHash", "humanConfirmed", "statement"]],
    ["stage2_export_translation_snapshot", "冻结当前发布中文页及术语表，仅写独立翻译快照，不改中文审核状态。", { expectedSourceHash: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" } }, ["expectedSourceHash"]],
    ["stage2_read_translation_snapshot", "分页读取本页完整翻译快照，包含既有自测；不读取私有审计。", { snapshotId: { type: "string" }, offset: { type: "integer", minimum: 0 }, maxChars: { type: "integer", minimum: 1, maximum: 12000 } }, ["snapshotId"]],
    ["stage2_prepare_translation_task", "分页返回冻结章节的翻译提示词、术语与精确输出合同；无 API 调用和发布。", { snapshotId: { type: "string" }, chapterId: { type: "string" }, offset: { type: "integer", minimum: 0 }, maxChars: { type: "integer", minimum: 1, maximum: 12000 } }, ["snapshotId", "chapterId"]],
    ["stage2_check_translation_snapshot", "核对原文、术语、资源和批准标记是否变化；不会自动发布。", { snapshotId: { type: "string" } }, ["snapshotId"]],
  ].map(([name, description, properties, required]) => ({ name, description,
    inputSchema: { type: "object", additionalProperties: false,
      required: ["pageId", ...required], properties: { pageId: { type: "string", pattern: "^[a-z0-9][a-z0-9-]*$" }, ...properties } } })),
  {
    name: "stage2_inventory_pages",
    description: "只读列出理解页工作流及发布状态元数据，不返回正文、私有审核结论或租约令牌；状态不代表已核验构建资格。",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {name:'stage2_inspect_audit_upgrade',description:'只读检查当前候选的合同版本与三维评价，不返回正文或私有审查答案。',
    inputSchema:{type:'object',required:['pageId'],properties:{pageId:{type:'string',pattern:'^[a-z0-9-]+$'}},additionalProperties:false}},
  {name:'stage2_queue_audit_upgrade',description:'完整控制器保存旧页、审核与状态快照，将哈希匹配页面排入v4独立补审；不重置返修预算、不改现有发布状态。',
    inputSchema:{type:'object',required:['pageId','expectedCandidateHash','reason'],properties:{pageId:{type:'string',pattern:'^[a-z0-9-]+$'},expectedCandidateHash:{type:'string',pattern:'^sha256:[a-f0-9]{64}$'},reason:{type:'string',minLength:3,maxLength:500}},additionalProperties:false}},
  {
    name: "stage2_diagnose_candidate_gate",
    description: "仅供完整控制器重跑候选机械门禁，返回净化类别；可在临时夹具预检参照摘要更新，不改正式基准、正文、状态或发布资格。",
    inputSchema: { type: "object", required: ["pageId"], properties: { pageId: { type: "string", pattern: "^[a-z0-9][a-z0-9-]*$" }, referenceUpdatePreview: {type: "boolean"} }, additionalProperties: false },
  },
  {
    name: "stage2_apply_information_theory_authorized_repair",
    description: "执行用户已确认的信息论限定修复：当前锁定候选第8节SVG下标及第7节Hugging Face来源。只写候选并排入独立审核，不发布。",
    inputSchema: {type:"object",required:["expectedCandidateHash"],properties:{expectedCandidateHash:{type:"string",pattern:"^sha256:[a-f0-9]{64}$"}},additionalProperties:false},
  },
  {
    name: "stage2_apply_transformer_authorized_sources",
    description: "按用户明确授权为精确 Transformer 候选追加 ROME 与 T5 两项来源；保持独立复核待完成，不发布。",
    inputSchema: {type:"object",required:["expectedCandidateHash"],properties:{expectedCandidateHash:{type:"string",pattern:"^sha256:[a-f0-9]{64}$"}},additionalProperties:false},
  },
  {
    name: "stage2_create_readiness_checkpoint",
    description: "完整控制器创建本机项目与受控运行材料的隔离备份，逐文件验证独立恢复；不返回正文或私有文件名，不改正式状态，活动租约期间拒绝。",
    inputSchema: {type:"object",properties:{prunePrevious:{type:"boolean",description:"仅在用户明确要求清理旧备份时启用；新备份恢复校验通过后删除旧控制器检查点。"}},additionalProperties:false},
  },
  {
    name: "stage2_inventory_page_assets",
    description: "完整控制器只读列出当前网页各页来源摘要、图表编号摘要、外链与英文文件存在性，不返回正文或审核答案，不验证质量或发布资格。",
    inputSchema: {type:"object",properties:{},additionalProperties:false},
  },
  {
    name: "stage2_inspect_published_translation",
    description: "只读核对本地英文发布产物的精确身份和当前发布资格，返回阻断原因，不返回正文或更改状态。",
    inputSchema: {type:"object",required:["pageId"],properties:{pageId:{type:"string",pattern:"^[a-z0-9][a-z0-9-]*$"}},additionalProperties:false},
  },
  {
    name: "stage2_status",
    description: "查看串行理解原理页队列的汇总状态；不返回页面正文。",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "stage2_state_storage_report",
    description: "只读统计正式状态文件、页面字段和外置逻辑引用的体积与完整性；只返回字段名、字节数、计数、摘要哈希和告警代码，不返回页面 ID、正文、审计结论或任何字段值。",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "stage2_build_state_v2_shadow",
    description: "根据精确的 Schema v1 状态摘要，在仓库外生成并回读验证 Schema v2 影子状态和内容寻址回复对象；拒绝活动租约，不修改正式状态，现有控制器仍只读取 Schema v1。",
    inputSchema: {
      type: "object",
      required: ["expectedSourceDigest"],
      properties: {
        expectedSourceDigest: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "stage2_backfill_state_v2_objects",
    description: "在精确摘要匹配且无活动租约时，把 Schema v1 内联内容生成回复写入仓库外内容寻址对象，并将已验证引用双写回正式 v1；保留全部内联回复且不切换读取路径。",
    inputSchema: {
      type: "object",
      required: ["expectedSourceDigest"],
      properties: {
        expectedSourceDigest: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "stage2_validate_state_v2_dual_read",
    description: "只读比较正式 Schema v1 内联回复、双写的内容寻址对象和当前 Schema v2 影子；验证摘要、页面绑定、数量与深度等价，不返回页面 ID、正文、审计结论或字段值。",
    inputSchema: {
      type: "object",
      required: ["expectedSourceDigest"],
      properties: {
        expectedSourceDigest: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "stage2_switch_state_v2",
    description: "在正式 v1 与已验证 v2 影子的精确摘要均匹配、且没有活动租约时，将正式状态原子切换到 Schema v2 外置对象读取；先保存并校验完整 v1 回滚备份，切换后不再保留内联大对象。",
    inputSchema: {
      type: "object",
      required: ["expectedSourceDigest", "expectedShadowDigest"],
      properties: {
        expectedSourceDigest: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
        expectedShadowDigest: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "stage2_local_data_status",
    description: "查看 Stage 2 本机运行材料的新旧位置与完整性摘要；不读取页面正文且不修改任何文件。",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "stage2_migrate_local_data",
    description: "在无活动租约时，把 results、previews、events 和状态备份完整校验后迁到仓库外本机数据目录；保留正式状态文件和页面正文。",
    inputSchema: {
      type: "object",
      required: ["reason"],
      properties: {
        reason: { type: "string", minLength: 3, maxLength: 500 },
      },
      additionalProperties: false,
    },
  },
  {
    name: "stage2_next_recommended_page",
    description: "按地图官方推荐学习路径查找下一张尚未终止的理解原理页。只返回页面 ID、顺序与状态，不返回正文；manual-review、l3-auto-passed 与 published-approved 视为本轮自动流程终态。",
    inputSchema: {
      type: "object",
      properties: {
        startOrder: { type: "string", pattern: "^\\d+(?:\\.\\d+)*$" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "stage2_resolve_recommended_page",
    description: "按官方推荐顺序精确解析一个节点，即使该页已处于 manual-review、l3-auto-passed 或 published-approved 等终态也返回其 pageId、阶段、当前状态与内容生成状态；只读且不会跳到后续节点。",
    inputSchema: {
      type: "object",
      required: ["order"],
      properties: {
        order: { type: "string", pattern: "^\\d+(?:\\.\\d+)*$" },
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
    name: "stage2_enqueue_content_generation",
    description: "由页锁定控制器将一个未获人工批准的既有理解页排入独立 content-generation 队列。控制器记录原状态，任务完成后恢复原状态；不会修改正式页或审计结论。",
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
    name: "stage2_import_editorial_candidate",
    description: "由页锁定控制器导入人工整理完成的完整候选页，或导入该页哈希匹配的 content-generation 输出；逐块验证原页图表保留，写入可回滚的待审网站版本，并将页面置为 audit-queued。机器审查通过后仍停在 manual-review，必须人工确认才转为正式版本。",
    inputSchema: {
      type: "object",
      required: ["pageId", "reason"],
      properties: {
        pageId: { type: "string", pattern: "^[a-z0-9][a-z0-9-]*$" },
        page: { type: "object" },
        useContentGenerationOutput: { type: "boolean" },
        errata: { type: "object", description: "Exact source-bound change packet; requires trusted launcher STAGE2_EDITORIAL_ERRATA_HASH authorization." },
        reason: { type: "string", minLength: 3, maxLength: 500 },
        summary: { type: "string", maxLength: 500 },
        removedSectionTitles: {
          type: "array",
          maxItems: 20,
          items: { type: "string", minLength: 1, maxLength: 120 },
        },
      },
      anyOf: [
        { required: ["page"] },
        { properties: { useContentGenerationOutput: { const: true } }, required: ["useContentGenerationOutput"] },
        { required: ["errata"] },
      ],
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
        localBrowserPreview: {type:"boolean",description:"把同一人工复核预览写入本地预览服务器允许目录；不改正式页面。"},
      },
      additionalProperties: false,
    },
  },
  {
    name: "stage2_finalize_manual_review",
    description: "完成 manual-review：新版正文可由人工明确批准为正式版本，即使仍有机器 blocker；控制器保留被人工覆盖的机器问题记录。旧流程页面仍要求零阻断。不会启动新审查。",
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
    name: "stage2_return_editorial_for_revision",
    description: "人工审查退回新版正文并列出具体问题。控制器只把这些问题交给修改 Agent；修改后仅定向验证这些人工问题，然后直接回到人工审查。",
    inputSchema: {
      type: "object",
      required: ["pageId", "reason", "issues"],
      properties: {
        pageId: { type: "string", pattern: "^[a-z0-9][a-z0-9-]*$" },
        reason: { type: "string", minLength: 3, maxLength: 500 },
        issues: {
          type: "array",
          minItems: 1,
          maxItems: 30,
          items: {
            type: "object",
            required: ["claim", "sections", "acceptanceCriteria"],
            properties: {
              claim: { type: "string", minLength: 1, maxLength: 1000 },
              sections: { type: "array", minItems: 1, items: { type: "integer", minimum: 1 } },
              acceptanceCriteria: { type: "string", minLength: 1, maxLength: 1000 },
              evidence: { type: "string", maxLength: 1000 },
              concept: { type: "string", maxLength: 200 },
            },
            additionalProperties: false,
          },
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "stage2_rollback_editorial_candidate",
    description: "撤销哈希匹配且无活动租约的整份待审候选，按控制器回执恢复导入前页面和工作流状态。用于候选构建流程本身有误、必须重新导入的情况。",
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
    name: "stage2_read_content_section",
    description: "仅供活动 content-generation 租约按章节读取当前锁定页面。返回单章标题、纯文本、原始 HTML 与固定提示词；常见误解和自测章节由控制器硬性拒绝。",
    inputSchema: {
      type: "object",
      required: ["taskId", "leaseToken", "sectionNumber"],
      properties: {
        taskId: { type: "string" },
        leaseToken: { type: "string" },
        sectionNumber: { type: "integer", minimum: 1 },
      },
      additionalProperties: false,
    },
  },
  {
    name: "stage2_save_content_response",
    description: "仅供活动 content-generation 租约按顺序保存当前章节的完整 Agent 回复。控制器原子更新 pageId-agent-responses.md；保存成功后才允许读取下一章。",
    inputSchema: {
      type: "object",
      required: ["taskId", "leaseToken", "sectionNumber", "response"],
      properties: {
        taskId: { type: "string" },
        leaseToken: { type: "string" },
        sectionNumber: { type: "integer", minimum: 1 },
        title: { type: "string", minLength: 1, maxLength: 200 },
        response: { type: "string", minLength: 1, maxLength: 100000 },
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

allTools.push(
  {name:'stage2_amend_translation_units',description:'精确授权绑定当前版本，仅修正已定位英文缺陷单元；保存修改记录并撤销当前审核，必须独立复审，不发布。',inputSchema:{type:'object',additionalProperties:false,required:['pageId','reviewId','revision','replacements','reason'],properties:{pageId:{type:'string'},reviewId:{type:'string'},revision:{type:'string'},replacements:{type:'object',additionalProperties:{type:'string'}},reason:{type:'string'}}}},
  {name:'stage2_amend_duplicate_formula',description:'精确人工授权后仅移除已定位英文单元重复的2P，保留原审核并进入独立复审。',inputSchema:{type:'object',additionalProperties:false,required:['pageId','reviewId','revision','unitKey','replacement'],properties:{pageId:{type:'string'},reviewId:{type:'string'},revision:{type:'string'},unitKey:{type:'string'},replacement:{type:'string'}}}},
  {name:'stage2_adjudicate_translation_findings',description:'精确授权并绑定当前版本后记录误报裁定或明确标注的源文矛盾注释授权；保留原审核，不修改译文或伪造机器审核。',inputSchema:{type:'object',additionalProperties:false,required:['pageId','reviewId','revision','decisions'],properties:{pageId:{type:'string'},reviewId:{type:'string'},revision:{type:'string'},decisions:{type:'array',minItems:1,items:{type:'object',additionalProperties:false,required:['findingHash','reason'],properties:{findingHash:{type:'string'},reason:{type:'string'},disposition:{type:'string',enum:['authorized-source-note']}}}}}}},
  {name:'stage2_handover_translation_campaign',description:'精确授权后等待当前请求完成，在请求之间独占队列供旧运行器退出，并设置最多5页并行；不发送API请求。',inputSchema:{type:'object',additionalProperties:false,required:['campaignId'],properties:{campaignId:{type:'string',pattern:'^sha256:[a-f0-9]{64}$'}}}},
  {name:'stage2_diagnose_translation_campaign',description:'只读定位已有翻译任务的合同缺陷和本地浏览器失败；不调用模型、不提交审核、不发布。',inputSchema:{type:'object',additionalProperties:false,required:['campaignId'],properties:{campaignId:{type:'string',pattern:'^sha256:[a-f0-9]{64}$'},pageIds:{type:'array',minItems:1,uniqueItems:true,items:{type:'string',pattern:'^[a-z0-9-]+$'}}}}},
  {name:'stage2_build_translation_campaign',description:'离线冻结多页 DeepSeek 队列和统一预算；不调用 API。',inputSchema:{type:'object',additionalProperties:false,required:['pages','config'],properties:{pages:{type:'array',minItems:1,maxItems:130,items:{type:'object',additionalProperties:false,required:['pageId','snapshotId'],properties:{pageId:{type:'string'},snapshotId:{type:'string'}}}},config:allTools.find(t=>t.name==='stage2_build_deepseek_translation').inputSchema.properties.config}}},
  ...['inspect','step'].map(action=>({name:`stage2_${action}_translation_campaign`,description:action==='inspect'?'查看多页翻译状态与共享费用，不返回正文。':'仅在精确队列获授权后推进一个阶段；自动独立审核、最多两轮返修及实际浏览器检查后发布英文产物，不部署。',inputSchema:{type:'object',additionalProperties:false,required:['campaignId'],properties:{campaignId:{type:'string',pattern:'^sha256:[a-f0-9]{64}$'}}}}))
);
const controllerTools = new Set([
  "stage2_status",
  "stage2_next_recommended_page",
  "stage2_resolve_recommended_page",
  "stage2_enqueue_content_generation",
  "stage2_import_editorial_candidate",
  "stage2_finalize_manual_review",
  "stage2_return_editorial_for_revision",
  "stage2_rollback_editorial_candidate",
  "stage2_inspect_publication_candidate",
]);
if (provisionalPublishAuthorized) {
  controllerTools.add("stage2_publish_provisional_page");
  controllerTools.add("stage2_rollback_provisional_page");
}

const capabilityTools = {
  'translation-campaign':new Set(['stage2_build_translation_campaign','stage2_inspect_translation_campaign','stage2_step_translation_campaign']),
  'website-build': new Set(['stage2_build_website']),
  "human-confirmation": new Set(["stage2_register_source_human_confirmation"]),
  "translation-deepseek": new Set(["stage2_build_deepseek_translation", "stage2_inspect_deepseek_translation", "stage2_run_deepseek_translation"]),
  "translation-static": new Set(["stage2_build_static_translation"]),
  "translation-publication": new Set(["stage2_preview_translation", "stage2_publish_translation"]),
  "translation-quality": new Set(["stage2_begin_translation_quality", "stage2_inspect_translation_quality"]),
  "translation-review": new Set(["stage2_read_translation_quality_packet", "stage2_submit_translation_review"]),
  "translation-repair": new Set(["stage2_read_translation_quality_packet", "stage2_repair_translation_units"]),
  "translation-batch": new Set(["stage2_build_translation_batch", "stage2_inspect_translation_batch", "stage2_submit_translation_batch", "stage2_reconcile_translation_batch", "stage2_collect_translation_batch"]),
  translation: new Set(["stage2_export_translation_snapshot", "stage2_read_translation_snapshot", "stage2_prepare_translation_task", "stage2_check_translation_snapshot"]),
  full: new Set(allTools.map(tool => tool.name).filter(name => !["stage2_register_source_human_confirmation", "stage2_submit_translation_review", "stage2_repair_translation_units", "stage2_publish_translation", "stage2_build_static_translation"].includes(name))),
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
  "content-generation": new Set([
    "stage2_claim_task",
    "stage2_read_task_packet",
    "stage2_read_content_section",
    "stage2_save_content_response",
    "stage2_submit_result",
  ]),
};

if (!Object.hasOwn(capabilityTools, capabilityProfile)) {
  throw new Error(`Unsupported STAGE2_MCP_PROFILE: ${capabilityProfile}`);
}
if (pageLockedProfile && !/^[a-z0-9][a-z0-9-]*$/.test(lockedPageId)) {
  throw new Error(`STAGE2_MCP_PAGE_ID is required for the ${capabilityProfile} capability profile`);
}
if (capabilityProfile === "human-confirmation" && process.env.STAGE2_MCP_MANUAL_REVIEW_ACTION !== "hold") {
  throw new Error("Human confirmation requires explicit manual-review action hold; publication is outside this capability");
}
if (capabilityProfile === 'translation-campaign' && process.env.STAGE2_MCP_MANUAL_REVIEW_ACTION !== 'hold') {
  throw new Error('Translation campaign requires explicit Chinese manual-review action hold');
}
if (["translation-review", "translation-repair"].includes(capabilityProfile) && !String(process.env.STAGE2_MCP_WORKER_ID || "").trim()) {
  throw new Error("Translation review/repair requires an explicit independent STAGE2_MCP_WORKER_ID");
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

async function handle(message) {
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
    if (["controller", "translation", "translation-batch", ...qualityProfiles].includes(capabilityProfile) && args.pageId && args.pageId !== lockedPageId) {
      return response(id, restrictedError(`This controller process is locked to page ${lockedPageId}`));
    }
    try {
      if(name==='stage2_build_translation_campaign')return response(id,toolResult(translationCampaign.build(root,args.pages,args.config)));
      if(name==='stage2_inspect_translation_campaign')return response(id,toolResult(translationCampaign.inspect(root,args.campaignId)));
      if(name==='stage2_diagnose_translation_campaign')return response(id,toolResult(await translationCampaign.diagnose(root,args.campaignId,args.pageIds)));
      if(name==='stage2_handover_translation_campaign')return response(id,toolResult(await translationCampaign.handover(root,args.campaignId)));
      if(name==='stage2_step_translation_campaign')return response(id,toolResult(await translationCampaign.step(root,args.campaignId)));
      if (name === "stage2_inspect_translation_source_binding") return response(id, toolResult(inspectTranslationSourceBinding(root, args.pageId)));
      if (name === "stage2_inspect_published_translation") return response(id,toolResult(translationPublication.inspectPublishedTranslation(root,args.pageId)));
      if (name === "stage2_register_source_human_confirmation") {
        if (args.pageId !== lockedPageId || !/^sha256:[a-f0-9]{64}$/.test(String(process.env.STAGE2_HUMAN_CONFIRMATION_HASH || ""))
          || process.env.STAGE2_HUMAN_CONFIRMATION_HASH !== args.expectedContentHash) throw new Error("Exact source human confirmation authorization required");
        if (submitAttempted) throw new Error("One human confirmation attempt per process");
        submitAttempted = true;
        return response(id, toolResult(registerSourceHumanConfirmation(root, args.pageId, args)));
      }
      if (name === "stage2_build_deepseek_translation") return response(id, toolResult(translationDeepSeek.buildDeepSeekTranslation(root, args.pageId, args.snapshotId, args.config)));
      if (name === "stage2_inspect_deepseek_translation") return response(id, toolResult(translationDeepSeek.inspectDeepSeekTranslation(root, args.pageId, args.planId)));
      if (name === "stage2_run_deepseek_translation") return response(id, toolResult(await translationDeepSeek.runDeepSeekTranslation(root, args.pageId, args.planId, args.retry)));
      if (name === "stage2_preview_translation") {
        const text = JSON.stringify(translationPublication.previewTranslation(root, args.pageId, args.reviewId));
        const offset = args.offset ?? 0, maxChars = args.maxChars ?? 12000;
        if (!Number.isInteger(offset) || offset < 0 || offset > text.length || !Number.isInteger(maxChars) || maxChars < 1 || maxChars > 12000) throw new Error("Invalid pagination");
        const content = text.slice(offset, offset + maxChars), nextOffset = offset + content.length;
        return response(id, toolResult({ content, nextOffset, done: nextOffset === text.length, totalChars: text.length }));
      }
      if (name === "stage2_build_static_translation") {
        if (submitAttempted) throw new Error("One static build per process");
        if (process.env.STAGE2_MCP_MANUAL_REVIEW_ACTION !== "hold") throw new Error("Static build requires manual-review hold");
        submitAttempted = true;
        return response(id, toolResult(translationPublication.buildStaticTranslation(root, args.pageId, args.reviewId, args.artifactHash, args.siteUrl)));
      }
      if (name === "stage2_publish_translation") {
        if (submitAttempted) throw new Error("One publication attempt per process");
        submitAttempted = true;
        return response(id, toolResult(translationPublication.publishTranslation(root, args.pageId, args.reviewId, args.artifactHash, args.acceptance)));
      }
      if (name === "stage2_begin_translation_quality") return response(id, toolResult(translationQuality.beginTranslationQuality(root, args.pageId, args.planId, args.provider)));
      if (name === "stage2_amend_duplicate_formula") {if(submitAttempted)throw Error('One amendment per process');submitAttempted=true;return response(id,toolResult(translationQuality.amendDuplicateFormula(root,args.pageId,args.reviewId,args.revision,args.unitKey,args.replacement)));}
      if (name === "stage2_amend_translation_units") {if(submitAttempted)throw Error('One amendment per process');submitAttempted=true;return response(id,toolResult(translationQuality.amendTranslationUnits(root,args.pageId,args.reviewId,args.revision,args.replacements,args.reason)));}
      if (name === "stage2_adjudicate_translation_findings") return response(id,toolResult(translationQuality.adjudicate(root,args.pageId,args.reviewId,args.revision,args.decisions)));
      if (name === "stage2_inspect_translation_quality") return response(id, toolResult(translationQuality.inspectTranslationQuality(root, args.pageId, args.reviewId)));
      if (name === "stage2_read_translation_quality_packet") {
        const role = capabilityProfile === "translation-repair" ? "repair" : "review";
        const packet = translationQuality.translationQualityPacket(root, args.pageId, args.reviewId, role);
        if (args.reasoningEffort !== packet.schedule.reasoningEffort) throw new Error(`Scheduled reasoning effort is ${packet.schedule.reasoningEffort}`);
        const text = JSON.stringify(packet), offset = args.offset ?? 0, maxChars = args.maxChars ?? 12000;
        if (!Number.isInteger(offset) || offset < 0 || offset > text.length || !Number.isInteger(maxChars) || maxChars < 1 || maxChars > 12000) throw new Error("Invalid pagination");
        if (!qualityDelivery) {
          if (offset !== 0) throw new Error("Read packet from offset zero");
          qualityDelivery = { reviewId: args.reviewId, revision: packet.revision, reasoningEffort: args.reasoningEffort, nextOffset: 0, done: false };
        }
        if (qualityDelivery.reviewId !== args.reviewId || qualityDelivery.revision !== packet.revision || qualityDelivery.reasoningEffort !== args.reasoningEffort || qualityDelivery.nextOffset !== offset) throw new Error("Packet revision, schedule or read order changed; start a fresh role process");
        const content = text.slice(offset, offset + maxChars), nextOffset = offset + content.length;
        Object.assign(qualityDelivery, { nextOffset, done: nextOffset === text.length });
        return response(id, toolResult({ reviewId: args.reviewId, revision: packet.revision, content, nextOffset, totalChars: text.length, done: qualityDelivery.done }));
      }
      if (["stage2_submit_translation_review", "stage2_repair_translation_units"].includes(name)) {
        if (!qualityDelivery?.done || qualityDelivery.reviewId !== args.reviewId || qualityDelivery.revision !== args.revision || qualitySubmitted) throw new Error("Complete current packet first; only one submission per role process");
        qualitySubmitted = true;
        const result = name === "stage2_submit_translation_review"
          ? translationQuality.submitTranslationReview(root, args.pageId, args.reviewId, args.revision, args.evidence, lockedWorkerId)
          : translationQuality.repairTranslationUnits(root, args.pageId, args.reviewId, args.revision, args.replacements, lockedWorkerId);
        return response(id, toolResult(result));
      }
      if (name === "stage2_build_translation_batch") return response(id, toolResult(translationBatch.buildTranslationBatch(root, args.pageId, args.snapshotId, args.config)));
      if (name === "stage2_inspect_translation_batch") return response(id, toolResult(translationBatch.inspectTranslationBatch(root, args.pageId, args.planId)));
      if (name === "stage2_submit_translation_batch") return response(id, toolResult(await translationBatch.submitTranslationBatch(root, args.pageId, args.planId, args.retry)));
      if (name === "stage2_reconcile_translation_batch") return response(id, toolResult(await translationBatch.reconcileTranslationBatch(root, args.pageId, args.planId)));
      if (name === "stage2_collect_translation_batch") return response(id, toolResult(await translationBatch.collectTranslationBatch(root, args.pageId, args.planId)));
      if (name === "stage2_export_translation_snapshot") {
        return response(id, toolResult(exportTranslationSnapshot(root, args.pageId, args.expectedSourceHash)));
      }
      if (name === "stage2_read_translation_snapshot") {
        return response(id, toolResult(readTranslationSnapshot(root, args.pageId, args.snapshotId, args.offset, args.maxChars)));
      }
      if (name === "stage2_check_translation_snapshot") {
        return response(id, toolResult(checkTranslationSnapshot(root, args.pageId, args.snapshotId)));
      }
      if (name === "stage2_prepare_translation_task") {
        const task = prepareTranslationTask(root, args.pageId, args.snapshotId, args.chapterId);
        const offset = args.offset ?? 0, maxChars = args.maxChars ?? 12000;
        const text = JSON.stringify(task);
        if (!Number.isInteger(offset) || offset < 0 || offset > text.length || !Number.isInteger(maxChars) || maxChars < 1 || maxChars > 12000) throw new Error("Invalid pagination");
        const content = text.slice(offset, offset + maxChars), nextOffset = offset + content.length;
        return response(id, toolResult({ taskId: task.taskId, snapshotId: args.snapshotId, content, nextOffset, totalChars: text.length, done: nextOffset === text.length }));
      }
      if (name === "stage2_status") return response(id, toolResult(status(root)));
      if (name === "stage2_diagnose_candidate_gate") return response(id, toolResult(diagnoseCandidateGate(root,args.pageId,{referenceUpdatePreview:args.referenceUpdatePreview === true})));
      if(name==='stage2_inspect_audit_upgrade')return response(id,toolResult(inspectAuditUpgrade(root,args.pageId)));
      if(name==='stage2_queue_audit_upgrade'){
        if(process.env.STAGE2_MCP_MANUAL_REVIEW_ACTION!=='hold')throw Error('Audit migration requires hold');
        return response(id,toolResult(queueAuditUpgrade(root,args.pageId,args.expectedCandidateHash,args.reason)));
      }
      if (name === "stage2_apply_information_theory_authorized_repair") {
        if(process.env.STAGE2_MCP_MANUAL_REVIEW_ACTION !== 'hold')throw Error('Authorized repair requires hold');
        return response(id,toolResult(applyInformationTheoryAuthorizedRepair(root,args.expectedCandidateHash)));
      }
      if (name === "stage2_apply_transformer_authorized_sources") {
        if(process.env.STAGE2_MCP_MANUAL_REVIEW_ACTION!=='hold'||process.env.STAGE2_AUTHORIZED_TRANSFORMER_SOURCES!==args.expectedCandidateHash)throw Error('Exact source amendment authorization required');
        return response(id,toolResult(applyTransformerAuthorizedSources(root,args.expectedCandidateHash)));
      }
      if (name === "stage2_create_readiness_checkpoint") return response(id, toolResult(createReadinessCheckpoint(root,args)));
      if (name === 'stage2_build_website') {
        if (process.env.STAGE2_MCP_MANUAL_REVIEW_ACTION !== 'hold') throw Error('Website builds require manual-review hold');
        if (submitAttempted) throw Error('One website build per controller process');
        submitAttempted=true;
        return response(id,toolResult(buildWebsite(root,args)));
      }
      if (name === "stage2_inventory_page_assets") return response(id, toolResult(inventoryPageAssets(root)));
      if (name === "stage2_inventory_pages") {
        const state = loadState(root);
        const pages = Object.entries(state.pages).map(([pageId, record]) => ({ pageId,
          workflowState: record.state, publicationStatus: record.publication?.status || null,
          reviewStatus: record.publication?.reviewStatus || null, active: Boolean(record.lease) }));
        return response(id, toolResult({ total: pages.length, pages, eligibilityVerified: false }));
      }
      if (name === "stage2_state_storage_report") {
        return response(id, toolResult(stateStorageReport(root)));
      }
      if (name === "stage2_build_state_v2_shadow") {
        return response(id, toolResult(buildStateV2Shadow(root, args.expectedSourceDigest)));
      }
      if (name === "stage2_backfill_state_v2_objects") {
        return response(id, toolResult(backfillStateV2Objects(root, args.expectedSourceDigest)));
      }
      if (name === "stage2_validate_state_v2_dual_read") {
        return response(id, toolResult(validateStateV2DualRead(root, args.expectedSourceDigest)));
      }
      if (name === "stage2_switch_state_v2") {
        return response(id, toolResult(switchStateV2(
          root,
          args.expectedSourceDigest,
          args.expectedShadowDigest,
        )));
      }
      if (name === "stage2_local_data_status") return response(id, toolResult(localDataStatus(root)));
      if (name === "stage2_migrate_local_data") {
        return response(id, toolResult(migrateLocalData(root, args.reason)));
      }
      if (name === "stage2_next_recommended_page") {
        return response(id, toolResult(nextRecommendedPage(root, args.startOrder || "1.3")));
      }
      if (name === "stage2_resolve_recommended_page") {
        const resolved = resolveRecommendedPage(root, args.order);
        if (capabilityProfile === "controller" && resolved.pageId !== lockedPageId) {
          return response(id, restrictedError(`This controller process is locked to page ${lockedPageId}`));
        }
        return response(id, toolResult(resolved));
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
      if (name === "stage2_enqueue_content_generation") {
        return response(id, toolResult(enqueueContentGeneration(root, args.pageId, args.reason)));
      }
      if (name === "stage2_reset_manual_review") {
        return response(id, toolResult(resetManualReview(root, args.pageId, args.reason)));
      }
      if (name === "stage2_import_editorial_candidate") {
        return response(id, toolResult(importEditorialCandidate(root, args.pageId, args)));
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
      if (name === "stage2_return_editorial_for_revision") {
        return response(id, toolResult(returnEditorialForRevision(root, args.pageId, args)));
      }
      if (name === "stage2_rollback_editorial_candidate") {
        return response(id, toolResult(rollbackEditorialCandidate(
          root,
          args.pageId,
          args.expectedCandidateHash,
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
      if (name === "stage2_read_content_section") {
        if (capabilityProfile === "content-generation") requireBoundLease(args);
        return response(id, toolResult(readContentGenerationSection(root, args)));
      }
      if (name === "stage2_save_content_response") {
        if (capabilityProfile === "content-generation") requireBoundLease(args);
        return response(id, toolResult(saveContentGenerationResponse(root, args)));
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
      handle(JSON.parse(line)).catch(error => failure(null, -32603, error.message));
    } catch (error) {
      failure(null, -32700, `JSON 解析失败：${error.message}`);
    }
  }
});

