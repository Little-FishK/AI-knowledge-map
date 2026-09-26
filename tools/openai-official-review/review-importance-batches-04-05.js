/* Audit the remaining OpenAI candidates with the official-technical importance gate. */
"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const reviewedAt = "2026-09-24";
const inventoryPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "openai-rereview-inventory-20260924.json");

const batches = [
  {
    number: 4,
    start: 600,
    end: 800,
    core: [602,603,604,608,610,615,622,625,627,628,632,633,634,649,657,662,665,667,672,680,681,682,691,695,700,701,709,713,724,727],
    supporting: [613,618,620,621,629,630,641,643,645,650,652,663,670,671,673,684,687,690,692,693,698,702,704,710,711,712,715,720,722,728,729,737,742,744,746,747,749,750,751,756,758,761,765,767],
    transition: [716,717,719],
    obsolete: [636,637,754,755,762],
    navigation: [606,614,616,617,624,626,631,654,660,661,730,768,769,770],
    duplicate: [601,609,611,612,635,638,640,642,653,675,697,726,763,764,771,772,773,774,775,776,777,778,779,780,781,782,783,784,785,786,787,788,789,790,791,792,793,794,795,796,797,798,799,800],
    selection: "冻结母集中第 601-800 份独立候选"
  },
  {
    number: 5,
    start: 800,
    end: 929,
    core: [901,907,912,915,917,918,926,927,928],
    supporting: [900,902,913,914,916,919,920,925,929],
    transition: [],
    obsolete: [],
    navigation: [819,820,821,822,823,824,825,826],
    duplicate: [801,802,803,804,805,806,807,808,809,810,811,812,813,814,815,816,817,818,909,921,922,923,924],
    selection: "冻结母集中第 801-929 份独立候选"
  }
];

function canonicalize(rawUrl) {
  const url = new URL(rawUrl);
  url.hash = "";
  url.search = "";
  url.pathname = url.pathname.replace(/\.md$/, "").replace(/\/$/, "") || "/";
  return url.toString().replace(/\/$/, "");
}

function contribution(record) {
  const value = `${record.title} ${record.description} ${record.canonicalUrl}`.toLowerCase();
  if (/migrat|moving from/.test(value)) return "当前技术路径的必要迁移与替代关系";
  if (/security|privacy|auth|safeguard|guardrail|human review|payment authority/.test(value)) return "身份、安全、隐私或人类审批边界";
  if (/eval|grader|correctness|verification|improvement loop/.test(value)) return "可复用评测、验证与持续改进方法";
  if (/memory|compaction|context engineering|long horizon|goals/.test(value)) return "长任务的上下文、记忆与持续执行机制";
  if (/plugin|mcp|skill|tool surface|tool orchestration/.test(value)) return "插件、MCP、技能与工具编排机制";
  if (/commerce|checkout|payment|product feed/.test(value)) return "Agent 商业交易、支付与商品数据协议";
  if (/realtime|voice|speech|audio|diarization|transcri/.test(value)) return "实时语音系统的实现与评测方法";
  if (/ads|advertis|campaign|bidding|targeting|conversion|reporting/.test(value)) return "OpenAI 广告系统的投放、归因与度量机制";
  if (/responses|harmony|spending|usage|cost/.test(value)) return "Responses 运行协议、成本与资源控制";
  if (/codex|code review|repair|sandbox|codebase/.test(value)) return "编码 Agent 的工程、评审与隔离工作流";
  if (/fine-tun|distill|prompt|model/.test(value)) return "模型优化、提示与能力适配方法";
  return "可复用的官方实现或生产方法";
}

function inferNodes(record) {
  const value = `${record.title} ${record.description} ${record.canonicalUrl}`.toLowerCase();
  if (/security|privacy|auth|safeguard|guardrail|human review/.test(value)) return ["guardrails", "agent-identity-access"];
  if (/eval|grader|verification|correctness|improvement/.test(value)) return ["model-evaluation", "evaluation"];
  if (/memory|compaction|context engineering|long horizon|goals/.test(value)) return ["agent-memory", "context-compaction"];
  if (/plugin|mcp|skill|tool/.test(value)) return ["mcp", "tool-calling"];
  if (/realtime|voice|speech|audio|transcri|diarization/.test(value)) return ["speech", "streaming"];
  if (/commerce|checkout|payment|ads|campaign|conversion|product feed/.test(value)) return ["agent", "deployment"];
  if (/codex|code|sandbox|repair/.test(value)) return ["coding-tools", "code-generation"];
  if (/fine-tun|distill/.test(value)) return ["fine-tuning", "model-evaluation"];
  if (/responses|harmony/.test(value)) return ["agent-loop", "structured-output"];
  return ["workflow-orchestration", "deployment"];
}

function makeId(record) {
  const prefix = record.setId.replace(/[^a-z0-9]+/g, "-");
  const slug = new URL(record.canonicalUrl).pathname.split("/").filter(Boolean).slice(-6).join("-")
    .replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  return `openai-importance-${prefix}-${slug}`;
}

function rejection(config, sequence, record) {
  if (config.obsoleteSet.has(sequence)) {
    return { decision:"rejected-obsolete-or-sunset", currentStatus:"obsolete", reason:"资料对应旧模型、旧接口、遗留上传方式或已经合并到当前主路径，且不承担必要迁移作用。" };
  }
  if (config.navigationSet.has(sequence)) {
    return { decision:"rejected-navigation-or-feed", currentStatus:"current", reason:"这是快速开始、目录、安装入口、错误索引、活动汇总或概览视频，适合发现资料但不形成独立知识卡。" };
  }
  if (config.duplicateSet.has(sequence)) {
    return { decision:"rejected-duplicate-knowledge", currentStatus:"current", reason:"关键知识已由前批当前主指南、正式协议或本批更完整资料覆盖，不因路由、媒介或示例不同重复建卡。" };
  }
  if (record.setId === "developer-showcase") {
    return { decision:"rejected-low-importance", currentStatus:"current", reason:"展示案例能证明产品可做什么，但没有稳定、可迁移的实现说明或决策知识，不单独建卡。" };
  }
  if (record.setId === "ads" && /api-reference/.test(record.canonicalUrl)) {
    return { decision:"rejected-low-importance", currentStatus:"current", reason:"这是单资源 CRUD 或窄参数参考；保留官方查表价值，但不具备独立知识卡的重要性。" };
  }
  if (record.setId === "cookbook" || record.setId === "learning-resources") {
    return { decision:"rejected-low-importance", currentStatus:"current", reason:"示例主要绑定单一行业、伙伴、模型或操作任务，未形成相对主指南不可替代的通用工程贡献。" };
  }
  return { decision:"rejected-low-importance", currentStatus:"current", reason:"页面当前可用，但内容主要是局部操作、特定集成或品牌功能事实，未达到独立建卡的重要性门槛。" };
}

function runBatch(rawConfig) {
  delete require.cache[require.resolve(inventoryPath)];
  const inventory = require(inventoryPath);
  const config = {
    ...rawConfig,
    coreSet:new Set(rawConfig.core),
    supportingSet:new Set(rawConfig.supporting),
    transitionSet:new Set(rawConfig.transition),
    obsoleteSet:new Set(rawConfig.obsolete),
    navigationSet:new Set(rawConfig.navigation),
    duplicateSet:new Set(rawConfig.duplicate)
  };
  const allDecisionNumbers = [...config.core, ...config.supporting, ...config.transition, ...config.obsolete, ...config.navigation, ...config.duplicate];
  if (new Set(allDecisionNumbers).size !== allDecisionNumbers.length) throw new Error(`Batch ${config.number} decision sets overlap`);

  const eligible = inventory.records.filter(record =>
    !record.duplicateOf && !["ineligible-container-or-combined-export", "ineligible-duplicate-route"].includes(record.reviewStatus)
  );
  const selected = eligible.slice(config.start, config.end);
  const expectedCount = config.end - config.start;
  if (selected.length !== expectedCount) throw new Error(`Importance batch ${config.number} must contain ${expectedCount} candidates, got ${selected.length}`);

  global.window = { PRO_LIBRARY: { items: [] } };
  require(path.join(PROJECT_ROOT, "data", "library-official-technical.js"));
  for (let number = 1; number < config.number; number += 1) {
    require(path.join(PROJECT_ROOT, "data", `library-official-openai-importance-0${number}.js`));
  }
  const existingByUrl = new Map(window.PRO_LIBRARY.items
    .filter(item => item.sourceClass === "official" && item.sourceSubcategory === "openai")
    .map(item => [canonicalize(item.url), item]));

  const records = selected.map((record, offset) => {
    const sequence = config.start + offset + 1;
    const accepted = config.coreSet.has(sequence) || config.supportingSet.has(sequence) || config.transitionSet.has(sequence);
    const result = accepted ? {
      decision:config.coreSet.has(sequence) ? "admitted-core" : config.transitionSet.has(sequence) ? "admitted-transition" : "admitted-supporting",
      currentStatus:config.transitionSet.has(sequence) ? "transition" : "current",
      reason:config.coreSet.has(sequence)
        ? "直接承担关键架构、协议、安全边界或技术决策作用，具有持续复用价值。"
        : config.transitionSet.has(sequence)
          ? "替代关系仍直接影响现有系统迁移，按过渡资料收录并设置复核触发点。"
          : "提供主指南未完整覆盖的生产约束、验证方法或可复用实现模式，缺失会影响正确实践。"
    } : rejection(config, sequence, record);
    return {
      sequence,
      id:existingByUrl.get(record.canonicalUrl)?.id || makeId(record),
      title:record.title,
      url:record.url,
      canonicalUrl:record.canonicalUrl,
      setId:record.setId,
      section:record.section,
      description:record.description,
      matrixContribution:accepted ? contribution(record) : "无足够的独立重要贡献",
      replacementCheck:accepted ? "未被现有主资料完整替代；承担独立协议、边界、方法或决策作用" : "不满足重要性门槛或已有更合适的主资料",
      ...result
    };
  });
  if (new Set(records.map(record => record.canonicalUrl)).size !== expectedCount) throw new Error(`Batch ${config.number} contains duplicate canonical URLs`);

  const admitted = records.filter(record => record.decision.startsWith("admitted-"));
  const summary = records.reduce((acc, record) => {
    acc[record.decision] = (acc[record.decision] || 0) + 1;
    return acc;
  }, { reviewed:records.length, admitted:admitted.length, rejected:records.length - admitted.length });
  const batchId = `openai-importance-batch-0${config.number}`;
  const audit = {
    policy:"official-technical-importance-v2",
    policyVersion:"2.0",
    batch:{
      id:batchId,
      source:"official/openai",
      reviewedAt,
      candidateCount:expectedCount,
      selection:config.selection,
      hardGate:"只有对理解、实现、选型、可靠性、安全或必要迁移具有实质用途的资料才建卡"
    },
    records,
    admittedObjectIds:admitted.map(record => record.id),
    summary
  };
  const auditPath = path.join(PROJECT_ROOT, "proposals", "official-technical", `${batchId}.json`);
  fs.writeFileSync(auditPath, `${JSON.stringify(audit, null, 2)}\n`, "utf8");

  const rows = admitted.map(record => ({ ...record, linkedNodes:inferNodes(record) }));
  const dataName = `library-official-openai-importance-0${config.number}.js`;
  const dataPath = path.join(PROJECT_ROOT, "data", dataName);
  const js = `/* Generated from ${batchId}.json. */\n(function(){\n  if(!window.PRO_LIBRARY||!Array.isArray(window.PRO_LIBRARY.items))return;\n  const rows=${JSON.stringify(rows)};\n  rows.forEach(row=>window.PRO_LIBRARY.items.push({id:row.id,sourceClass:"official",sourceSubcategory:"openai",title:row.title,publisher:"OpenAI",collection:"OpenAI 官方技术资料",contentKind:row.setId==="cookbook"?"官方工程案例":row.setId==="developer-blog"?"官方技术文章":row.setId==="ads"?"广告技术文档":row.setId==="commerce"?"商业协议文档":row.setId==="plugins"?"插件开发文档":"开发者资料",authorityTier:"A1",primarySource:true,discoveryOnly:false,url:row.canonicalUrl,accessedAt:"${reviewedAt}",summary:row.description||row.reason,knowledgeDelta:row.matrixContribution,brandEvidenceDelta:row.reason,evidenceUse:"用于理解、实现、选型、可靠性、安全或迁移判断。",limitations:["只直接证明 OpenAI 的实现与声明","使用前应复核页面状态和版本"],tags:["openai","官方技术资料",row.matrixContribution],linkedNodes:row.linkedNodes,linkedSoftware:[],reviewStatus:"重要性审核通过",reviewPolicy:"official-technical-importance-v2",reviewedAt:"${reviewedAt}",reviewBatch:"${batchId}",reviewDecision:row.decision,contributionType:row.decision.replace("admitted-",""),topicKey:row.id,currentStatus:row.currentStatus,selectionReason:row.reason,recheckTriggers:row.currentStatus==="transition"?["迁移窗口结束","替代路径变化"]:[]}));\n})();\n`;
  fs.writeFileSync(dataPath, js, "utf8");

  const decisionByUrl = new Map(records.map(record => [record.canonicalUrl, record]));
  for (const record of inventory.records) {
    if (record.duplicateOf || record.reviewStatus === "ineligible-container-or-combined-export") continue;
    const decision = decisionByUrl.get(record.canonicalUrl);
    if (!decision) continue;
    record.reviewStatus = decision.decision;
    record.reviewReason = decision.reason;
    record.reviewBatch = batchId;
    if (decision.decision.startsWith("admitted-")) record.cardId = decision.id;
    else delete record.cardId;
  }
  const structurallyEligible = inventory.records.filter(record =>
    !record.duplicateOf && !["ineligible-container-or-combined-export", "ineligible-duplicate-route"].includes(record.reviewStatus)
  );
  inventory.summary.uniqueContentCandidates = structurallyEligible.length;
  inventory.summary.admitted = structurallyEligible.filter(record => record.reviewStatus.startsWith("admitted-")).length;
  inventory.summary.rejectedAfterContentReview = structurallyEligible.filter(record => record.reviewStatus.startsWith("rejected-")).length;
  inventory.summary.pendingContentReview = structurallyEligible.filter(record => record.reviewStatus === "pending-importance-review").length;
  inventory.batch.status = inventory.summary.pendingContentReview === 0 ? "complete" : "in-progress";
  fs.writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify({ batch:batchId, summary, inventory:inventory.summary })}\n`);
}

for (const batch of batches) runBatch(batch);
