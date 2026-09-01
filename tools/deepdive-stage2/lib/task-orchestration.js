"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { loadDeepDivePages } = require("../../deepdive/runtime/deepdive-loader");
const { pageContentHash } = require("../../deepdive/quality/deepdive-audit-contracts");
const { scanNarrativeTemplates } = require("../../deepdive/quality/deepdive-narrative-audit");

function createTaskOrchestration(dependencies) {
  const {
    defaultRoot,
    toolScripts,
    queueByRole,
    activeByRole,
    rolePriority,
    writingNarrativePolicy,
    auditSchemaVersion,
    blockingCriteria,
    nonBlockingSignals,
    archiveTool,
    archiveStatuses,
    contentGenerationPrompt,
    acquireLock,
    appendEvent,
    clone,
    contentGenerationManifest,
    contentGenerationOutputShape,
    contentGenerationReviewMaterial,
    loadState,
    pageSourceSignature,
    readJson,
    saveState,
    stageDirectory,
    withinRoot,
  } = dependencies;

  function archiveCurrentTaskDirective(reason) {
    return {
      required: true,
      tool: archiveTool,
      arguments: { archived: true },
      target: "current-task",
      reason,
      instruction: "调用 Codex 任务归档工具归档当前任务；省略 threadId，使工具作用于调用任务本身。归档后立即结束，不再领取任务。",
    };
  }

  function authorizeTaskLease(root, taskId, leaseToken) {
    const state = loadState(root);
    const record = Object.values(state.pages).find(page =>
      page.lease && page.lease.taskId === taskId
    );
    if (!record) throw new Error("任务包续读对应的活动租约不存在");
    if (record.lease.token !== leaseToken) throw new Error("任务包续读的租约令牌无效");
    if (Date.parse(record.lease.expiresAt) <= Date.now()) throw new Error("任务包续读的租约已经过期");
    return record;
  }

  function roleForRecord(record) {
    return Object.entries(queueByRole).find(([, queue]) => queue === record.state)?.[0] || null;
  }

  function expireLease(root, state) {
    const now = Date.now();
    let expired = null;
    Object.values(state.pages).forEach(record => {
      if (!record.lease || expired) return;
      if (Date.parse(record.lease.expiresAt) > now) return;
      const role = record.lease.role;
      expired = { id: record.id, taskId: record.lease.taskId, role };
      record.state = queueByRole[role] || "blocked";
      record.lease = null;
      record.updatedAt = new Date().toISOString();
    });
    if (expired) {
      saveState(root, state);
      appendEvent(root, "lease-expired", expired);
    }
    return expired;
  }

  function activeRecord(state) {
    return Object.values(state.pages).find(record => record.lease) || null;
  }

  function readCandidate(root, record) {
    if (!record.candidateFile) return null;
    const file = withinRoot(root, record.candidateFile);
    return fs.existsSync(file) ? readJson(file) : null;
  }

  function currentPage(root, record) {
    const candidate = readCandidate(root, record);
    if (candidate && candidate.page) return candidate.page;
    return loadDeepDivePages(root)[record.id] || null;
  }

  function writingPolicy(root) {
    const file = path.join(stageDirectory(root), "policies", "writing-policy.md");
    const base = fs.existsSync(file)
      ? fs.readFileSync(file, "utf8")
      : [
      "一次只处理一个页面。",
      "将解释自然融入原有教学过程，不追加合同答案段，不生成独立常见误解、自测或答案章节。",
      "保留正确且有效的原内容，不为了统一模板而机械改写。",
      "不得声称页面已经通过 L3；质量状态由控制器决定。",
      ].join("\n");
    return `${base.trim()}\n\n${writingNarrativePolicy}`;
  }

  function writingNarrativeGuard(page, blockers = []) {
    const baseline = page ? scanNarrativeTemplates(page) : null;
    return {
      blockingCode: "harmful-template-expression",
      threshold: "同一句式家族覆盖至少 3 节且不少于全部教学章节一半",
      definitionFamilyExamples: ["是在", "是一类", "是一种", "是……", "指的是", "可以理解为"],
      instruction: "保留原文已有句式多样性；提交前逐节检查第一个实质句。命中阈值的候选会被控制器拒绝并重新排队，不会进入审计。",
      baseline: baseline ? {
        pervasive: baseline.pervasive,
        sectionOpenings: baseline.sections.map(section => ({
          section: section.section,
          evidence: section.opening,
          patternFamily: section.patternFamily,
        })),
      } : null,
      previousSubmissionDefects: clone(blockers || []),
    };
  }

  function auditContract(record = null) {
    const verificationFindings = record && record.editorialWorkflow
      && record.editorialWorkflow.auditMode === "verification"
      ? clone(record.editorialWorkflow.initialBlockingFindings || [])
      : [];
    const mode = verificationFindings.length ? "verification" : "full";
    const verificationSource = record && record.editorialWorkflow
      && record.editorialWorkflow.verificationSource === "human"
      ? "human"
      : "machine";
    return {
      schemaVersion: auditSchemaVersion,
      legacyCompatible: Boolean(record && !record.editorialWorkflow),
      mode,
      decisionPolicy: {
        type: "binary",
        severity: ["blocker", "warning"],
        pass: mode === "verification"
          ? "首轮审查指出的全部问题均已解决"
          : "不存在任何高置信 blocker；warning 不阻断",
        fail: mode === "verification"
          ? "首轮审查至少一个问题仍未解决"
          : "至少存在一项有正文证据支持的高置信 blocker",
      },
      blockingCriteria: clone(blockingCriteria),
      nonBlockingSignals: clone(nonBlockingSignals),
      verificationFindings,
      verificationSource,
      sourcePolicy: {
        internetAllowed: true,
        preferredSources: ["原始研究论文", "官方技术文档或标准", "大学与权威机构材料"],
        pageSourceMutation: "forbidden",
        instruction: "可以联网核验事实。若当前页面来源无法支持关键事实，只能提交 source-support-blocked；审查与返修 Agent都不得添加、删除或替换页面来源。",
      },
      instruction: mode === "verification"
        ? (verificationSource === "human"
          ? "这是人工退回修改后的定向验证。只验证 verificationFindings 中人工指出的问题，不发现新问题、不重新生成核心概念清单。逐项输出 resolved；完成后无论结果如何都直接回到人工审查。"
          : "这是唯一一轮机器返修后的定向复核。只验证 verificationFindings 中首次机器审查指出的问题，不发现新问题、不重新生成核心概念清单。逐项输出 resolved；全部 resolved 才能 pass。无论结果如何，控制器都进入人工审查，不再自动返修。")
        : "一个审查 Agent完成整页审查。先自行识别本页核心概念，主要依据标题、核心命题和主要教学内容，不把顺带术语、来源列表、概念依赖与延伸学习中的名称升级为核心概念。逐个核心概念检查：是什么、解决什么问题、适用边界。核心机制暂不作为独立硬性要求。同时审查知识/公式/术语/数值事实、跨章节有害重复、术语一致性和图文关系。只阻断严重模板化、语义残缺和明显影响理解的问题；章节依赖顺序、标题正文匹配、术语是否首次使用前解释不属于本合同。最终区分 blocker 与 warning，只有 blocker 导致 fail。",
      outputShape: {
        schemaVersion: auditSchemaVersion,
        pageId: "<page-id>",
        pageHash: "sha256:...",
        reviewedAt: "YYYY-MM-DD",
        mode,
        decision: "pass",
        blockingFindings: [],
        warnings: [],
        coreConcepts: mode === "full" ? [{
          name: "",
          sections: [1],
          definition: { status: "pass", evidence: "", rationale: "" },
          problem: { status: "pass", evidence: "", rationale: "" },
          boundary: { status: "pass", evidence: "", rationale: "" },
        }] : [],
        verificationResults: mode === "verification"
          ? verificationFindings.map(finding => ({ findingId: finding.findingId, resolved: true, evidence: "", rationale: "" }))
          : [],
      },
    };
  }

  function pageSubmissionShape(page) {
    const requiredKeys = Object.keys(page || {});
    return {
      page: {
        type: "object",
        source: "packet.page",
        requiredKeys,
        fieldTypes: Object.fromEntries(requiredKeys.map(key => {
          const value = page[key];
          const type = Array.isArray(value) ? "array" : (value === null ? "null" : typeof value);
          return [key, type];
        })),
        instruction: "提交以 packet.page 为底稿完成修改后的完整页面对象；保留所有未修改字段及其真实值，不要提交本结构说明。",
      },
      summary: {
        type: "string",
        maxLength: 120,
        instruction: "概括本次实际修改。",
      },
    };
  }

  function readTaskPacketPart(root = defaultRoot, input = {}) {
    const resolvedRoot = path.resolve(root);
    const record = authorizeTaskLease(resolvedRoot, input.taskId, input.leaseToken);
    const page = currentPage(resolvedRoot, record);
    const part = String(input.part || "contract");
    if (part === "contract") {
      const packet = buildPacket(resolvedRoot, record, record.lease.role);
      delete packet.page;
      const pageMetadata = clone(page);
      delete pageMetadata.html;
      return {
        status: "ok",
        pageId: record.id,
        role: record.lease.role,
        packet,
        pageMetadata,
        pageDelivery: {
          tool: "stage2_read_task_packet",
          part: "page-html",
          totalChars: String(page.html || "").length,
          maxCharsPerCall: 12000,
          instruction: "从 offset=0 开始续读，按 nextOffset 顺序拼接 content，直到 done=true；拼接结果就是 result.page.html 的完整底稿。",
        },
      };
    }
    if (part !== "page-html") throw new Error(`不支持的任务包续读部分：${part}`);
    const html = String(page.html || "");
    const offset = Math.max(0, Math.min(html.length, Number(input.offset) || 0));
    const maxChars = Math.max(1000, Math.min(12000, Number(input.maxChars) || 12000));
    const nextOffset = Math.min(html.length, offset + maxChars);
    return {
      status: "ok",
      pageId: record.id,
      role: record.lease.role,
      part,
      offset,
      nextOffset,
      totalChars: html.length,
      done: nextOffset >= html.length,
      content: html.slice(offset, nextOffset),
    };
  }

  function buildPacket(root, record, role) {
    const page = currentPage(root, record);
    const common = {
      schemaVersion: 1,
      taskId: record.lease.taskId,
      pageId: record.id,
      role,
      leaseToken: record.lease.token,
      contentHash: page ? pageContentHash(page) : null,
      submitTool: "stage2_submit_result",
      uiCleanup: {
        ...archiveCurrentTaskDirective("Stage 2 单次工作已终止"),
        afterSubmitStatuses: clone(archiveStatuses),
        onSubmitError: "保留当前任务，不归档，以便用户查看并处理异常。",
      },
      instruction: "只使用本任务包。write、update、repair 的 outputShape 是提交结构合同，不是可直接提交的示例值；result.page 必须是以 packet.page 为底稿完成修改后的完整真实页面对象。完成后调用提交工具一次；若返回 accepted、needs-repair、l3-auto-passed 或 rejected，必须调用 set_thread_archived({ archived: true }) 归档当前 Codex 任务，然后立即结束。提交抛错时不要归档，以便用户处理。",
    };
    if (role === "content-generation") {
      const material = contentGenerationReviewMaterial(root, record);
      const manifest = contentGenerationManifest(material);
      return {
        ...common,
        contentHash: material.sourceHash,
        prompt: contentGenerationPrompt,
        sectionDelivery: {
          tool: "stage2_read_content_section",
          authorization: {
            taskId: record.lease.taskId,
            leaseToken: record.lease.token,
          },
          ...manifest,
          instruction: "严格按 eligibleSections 顺序一次读取一个章节。每章只使用任务包和读取接口返回的完整固定提示词，保存该章完整回复后再读取下一章。不得请求 skippedSections。",
        },
        outputFile: `docs/deepdive-reviews/${record.id}-agent-responses.md`,
        source: {
          order: material.order,
          title: material.title,
          file: material.sourceFile,
          hash: material.sourceHash,
        },
        outputShape: contentGenerationOutputShape(material),
        forbidden: ["读取其他页面", "读取私有审计", "读取常见误解章节", "读取自测章节", "修改正式页面", "处理第二个节点"],
      };
    }
    if (role === "audit") {
      return {
        ...common,
        page: clone(page),
        auditContract: auditContract(record),
        projectReadOnly: {
          tools: ["stage2_search_project", "stage2_read_project_file"],
          authorization: {
            taskId: record.lease.taskId,
            leaseToken: record.lease.token,
          },
          suggestedPaths: [...new Set([
            ...(record.sourcePaths || []),
            "AGENTS.md",
            "docs/DEEPDIVE.md",
            "docs/DEEPDIVE_QUALITY_GATE.md",
            "docs/DEEPDIVE_GATE_ERROR_CATALOG.md",
            toolScripts.deepDiveL3Audit,
            toolScripts.deepDiveL2Audit,
            "tools/deepdive/quality/deepdive-audit-contracts.js",
            toolScripts.deepDiveValidator,
          ])],
          blocked: [
            ".git/",
            ".stage2/",
            "docs/deepdive-audits/",
            "node_modules/",
            "环境变量、密钥与凭据文件",
            "二进制文件和超过 512 KiB 的文件",
          ],
          instruction: "可按需读取项目与门禁信息以准确审计；接口是硬只读。不要复制旧审计答案代替独立判断。",
        },
        forbidden: ["修改正文", "查看作者理由", "替作者补写缺失答案", "复制其他页面或旧合同作为当前页结论"],
      };
    }
    if (role === "write") {
      return {
        ...common,
        material: clone(record.integration && record.integration.material),
        writingPolicy: writingPolicy(root),
        narrativeGuard: writingNarrativeGuard(null, record.blockers),
        outputShape: { page: { title: "", subtitle: "", aliases: "", meta: "", thesis: "", html: "" }, summary: "" },
        forbidden: ["读取其他页面", "读取审计答案", "修改正式文件", "自行授予 L3"],
      };
    }
    if (role === "update") {
      return {
        ...common,
        page: clone(page),
        supplements: clone((record.origin && record.origin.supplements) || []),
        writingPolicy: writingPolicy(root),
        narrativeGuard: writingNarrativeGuard(page, record.blockers),
        outputShape: pageSubmissionShape(page),
        forbidden: ["读取其他页面", "读取审计答案", "只在末尾追加材料", "修改正式文件"],
      };
    }
    return {
      ...common,
      page: clone(page),
      defects: clone(record.blockers || []),
      repairScope: record.editorialWorkflow ? {
        maximumRounds: 1,
        allowed: ["被指出的问题章节", "必要的相邻衔接句", "消除新发现的整页重复所必需的其他章节"],
        sourceMutation: "forbidden",
        sourceSignature: pageSourceSignature(page),
      } : undefined,
      writingPolicy: writingPolicy(root),
      narrativeGuard: writingNarrativeGuard(page, record.blockers),
      outputShape: pageSubmissionShape(page),
      forbidden: ["读取独立审计答案", "读取门禁实现", "新增独立常见误解章节", "新增自测或答案", "修改页面来源", "修改正式文件"],
    };
  }

  function claimTask(root = defaultRoot, workerId = "codex-scheduled", requestedPageId = null) {
    const resolvedRoot = path.resolve(root);
    const release = acquireLock(resolvedRoot);
    try {
      const state = loadState(resolvedRoot);
      expireLease(resolvedRoot, state);
      if (state.paused) {
        return {
          status: "paused",
          task: null,
          uiCleanup: archiveCurrentTaskDirective("Stage 2 已暂停，本次定时任务无需保留"),
        };
      }
      const active = activeRecord(state);
      if (active) {
        return {
          status: "busy",
          task: null,
          active: { id: active.id, role: active.lease.role, expiresAt: active.lease.expiresAt },
          uiCleanup: archiveCurrentTaskDirective("已有活动租约，本次定时任务正常结束"),
        };
      }
      let selected = null;
      let role = null;
      const requestedId = String(requestedPageId || "").trim();
      if (requestedId) {
        if (!/^[a-z0-9][a-z0-9-]*$/.test(requestedId)) {
          throw new Error("指定页面 ID 格式无效");
        }
        selected = state.pages[requestedId];
        if (!selected) throw new Error(`指定页面不在第二阶段队列：${requestedId}`);
        role = roleForRecord(selected);
        if (!role) throw new Error(`指定页面当前不可领取：${requestedId} (${selected.state})`);
      } else {
        for (const candidateRole of rolePriority) {
          selected = Object.values(state.pages)
            .filter(record => roleForRecord(record) === candidateRole)
            .sort((left, right) => left.id.localeCompare(right.id))[0];
          if (selected) {
            role = candidateRole;
            break;
          }
        }
      }
      if (!selected) {
        return {
          status: "idle",
          task: null,
          uiCleanup: archiveCurrentTaskDirective("Stage 2 当前无可领取任务"),
        };
      }
      const now = new Date();
      const token = crypto.randomBytes(24).toString("hex");
      const taskId = `${selected.id}:${role}:${selected.attempt + 1}:${token.slice(0, 8)}`;
      selected.attempt += 1;
      selected.state = activeByRole[role];
      selected.lease = {
        taskId,
        token,
        role,
        workerId: String(workerId || "codex-scheduled").slice(0, 120),
        claimedAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + state.policy.leaseMinutes * 60_000).toISOString(),
      };
      selected.updatedAt = now.toISOString();
      saveState(resolvedRoot, state);
      appendEvent(resolvedRoot, "task-claimed", {
        id: selected.id,
        taskId,
        role,
        workerId: selected.lease.workerId,
        requested: Boolean(requestedId),
      });
      return { status: "claimed", task: buildPacket(resolvedRoot, selected, role) };
    } finally {
      release();
    }
  }

  function releaseLease(root = defaultRoot, id, reason = "manual-recovery", expectedTaskId = null) {
    const resolvedRoot = path.resolve(root);
    const release = acquireLock(resolvedRoot);
    try {
      const state = loadState(resolvedRoot);
      const record = state.pages[id];
      if (!record) throw new Error(`不存在页面状态：${id}`);
      if (!record.lease) throw new Error(`页面 ${id} 当前没有活动租约`);
      const previousLease = clone(record.lease);
      if (expectedTaskId && previousLease.taskId !== expectedTaskId) {
        throw new Error(`页面 ${id} 的活动 taskId 不匹配，拒绝释放租约`);
      }
      record.state = queueByRole[previousLease.role] || "manual-review";
      record.lease = null;
      record.updatedAt = new Date().toISOString();
      saveState(resolvedRoot, state);
      appendEvent(resolvedRoot, "task-released", {
        id,
        taskId: previousLease.taskId,
        role: previousLease.role,
        reason: String(reason || "manual-recovery").slice(0, 500),
      });
      return {
        status: "released",
        pageId: id,
        releasedTaskId: previousLease.taskId,
        nextState: record.state,
      };
    } finally {
      release();
    }
  }

  return {
    activeRecord,
    archiveCurrentTaskDirective,
    auditContract,
    authorizeTaskLease,
    claimTask,
    currentPage,
    expireLease,
    readCandidate,
    readTaskPacketPart,
    releaseLease,
  };
}

module.exports = { createTaskOrchestration };
