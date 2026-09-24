/* 专业资料库机械门禁：校验九类来源、证据字段和站内关联。 */
"use strict";

const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");
const openaiFullReview = require(path.join(PROJECT_ROOT, "proposals", "official-technical", "openai-full-corpus-20260924.json"));
global.window = {};

try {
  require(path.join(PROJECT_ROOT, "data", "graph.js"));
  require(path.join(PROJECT_ROOT, "data", "software.js"));
  require(path.join(PROJECT_ROOT, "data", "library.js"));
  require(path.join(PROJECT_ROOT, "data", "library-official-technical.js"));
  require(path.join(PROJECT_ROOT, "data", "library-official-china.js"));
  require(path.join(PROJECT_ROOT, "data", "library-platform-profiles.js"));
  require(path.join(PROJECT_ROOT, "data", "library-source-meta.js"));
  require(path.join(PROJECT_ROOT, "data", "library-new-sources.js"));
  require(path.join(PROJECT_ROOT, "data", "library-hackathon-kaggle.js"));
  require(path.join(PROJECT_ROOT, "data", "library-arxiv.js"));
  require(path.join(PROJECT_ROOT, "data", "library-neurips-proceedings.js"));
  require(path.join(PROJECT_ROOT, "data", "library-pmlr.js"));
  require(path.join(PROJECT_ROOT, "data", "library-openreview.js"));
  require(path.join(PROJECT_ROOT, "data", "library-acl-anthology.js"));
  require(path.join(PROJECT_ROOT, "data", "library-cvf-open-access.js"));
  require(path.join(PROJECT_ROOT, "data", "library-ieee-xplore.js"));
  require(path.join(PROJECT_ROOT, "data", "library-acm-digital-library.js"));
} catch (error) {
  console.error("✗ 专业资料库存在语法错误：\n  " + error.message);
  process.exit(1);
}

const L = global.window.PRO_LIBRARY;
const profiles = global.window.LIBRARY_PLATFORM_PROFILES || {};
const profileGuidance = global.window.LIBRARY_PROFILE_GUIDANCE || {};
const expectedClasses = [
  "academic", "standards", "official", "knowledge-base", "industry-analysis",
  "public-talks", "hackathon", "creator", "open-source"
];
const intentionallyEmptyClasses = new Set(["knowledge-base"]);
const authorityTiers = new Set(["A1", "A2", "B", "R"]);
const nodeIds = new Set(global.window.GRAPH.nodes.map(node => node.id));
const softwareIds = new Set(global.window.SOFTWARE.items.map(item => item.id));
const sourceMeta = global.window.LIBRARY_SOURCE_META || {};
const problems = [];
const warnings = [];

if (!L || !Array.isArray(L.sourceClasses) || !Array.isArray(L.items)) {
  console.error("✗ window.PRO_LIBRARY 的结构不完整");
  process.exit(1);
}

const actualClasses = L.sourceClasses
  .slice().sort((a, b) => a.order - b.order).map(source => source.id);
if (actualClasses.join("|") !== expectedClasses.join("|")) {
  problems.push("九类来源缺失、重复或顺序不正确");
}

const classIds = new Set(actualClasses);
const subcategoriesByClass = new Map();
const expectedProfileKeys = new Set();
L.sourceClasses.forEach(source => {
  if (!Array.isArray(source.subcategories) || source.subcategories.length < 5) {
    problems.push(`一级来源 ${source.id} 至少需要 5 个二级来源`);
    return;
  }
  const ids = source.subcategories.map(subcategory => subcategory.id);
  if (new Set(ids).size !== ids.length) problems.push(`一级来源 ${source.id} 存在重复的二级来源 id`);
  source.subcategories.forEach(subcategory => {
    expectedProfileKeys.add(`${source.id}/${subcategory.id}`);
    ["id", "label", "short"].forEach(field => {
      if (typeof subcategory[field] !== "string" || !subcategory[field].trim()) {
        problems.push(`一级来源 ${source.id} 的二级来源缺少 ${field}`);
      }
    });
  });
  subcategoriesByClass.set(source.id, new Set(ids));
});
const profileFields = ["positioning", "background", "organization", "foundingTeam", "reviewedAt"];
expectedProfileKeys.forEach(key => {
  const profile = profiles[key];
  if (!profile) {
    problems.push(`二级来源 ${key} 缺少平台档案`);
    return;
  }
  if (!["platform", "collection"].includes(profile.kind)) problems.push(`二级来源 ${key} 的档案 kind 无效`);
  profileFields.forEach(field => {
    if (typeof profile[field] !== "string" || !profile[field].trim()) problems.push(`二级来源 ${key} 的档案缺少 ${field}`);
  });
  if (profile.kind === "platform" && !/^https:\/\//.test(profile.website || "")) {
    problems.push(`平台型二级来源 ${key} 必须提供 HTTPS 官网`);
  }
  if (profile.kind === "collection" && profile.website !== null) {
    problems.push(`集合型二级来源 ${key} 的 website 应为 null，避免伪造统一官网`);
  }
});
Object.keys(profiles).forEach(key => {
  if (!expectedProfileKeys.has(key)) problems.push(`存在未归属的二级来源档案：${key}`);
  const profile = profiles[key];
  ["offers", "howToUse"].forEach(field => {
    if (profile[field] !== undefined && (!Array.isArray(profile[field]) || profile[field].length < 3)) {
      problems.push(`二级来源档案 ${key} 的自定义 ${field} 至少需要 3 项`);
    }
  });
  if (profile.caution !== undefined && (typeof profile.caution !== "string" || !profile.caution.trim())) {
    problems.push(`二级来源档案 ${key} 的自定义 caution 不能为空`);
  }
  if (profile.overview !== undefined && (typeof profile.overview !== "string" || profile.overview.trim().length < 90)) {
    problems.push(`二级来源档案 ${key} 的自定义 overview 少于 90 字`);
  }
  if (profile.strengths !== undefined && (!Array.isArray(profile.strengths) || profile.strengths.length < 3)) {
    problems.push(`二级来源档案 ${key} 的自定义 strengths 至少需要 3 项`);
  }
});
expectedClasses.forEach(classId => {
  const guidance = profileGuidance[classId];
  if (!guidance) {
    problems.push(`一级来源 ${classId} 缺少平台介绍指南`);
    return;
  }
  ["strengths", "offers", "howToUse"].forEach(field => {
    if (!Array.isArray(guidance[field]) || guidance[field].length < 3) {
      problems.push(`一级来源 ${classId} 的平台介绍指南 ${field} 至少需要 3 项`);
    }
  });
  if (typeof guidance.caution !== "string" || !guidance.caution.trim()) {
    problems.push(`一级来源 ${classId} 的平台介绍指南缺少 caution`);
  }
});
expectedProfileKeys.forEach(key => {
  const [classId] = key.split("/");
  const profile = profiles[key];
  const overview = profile.overview ||
    `${profile.positioning}${profile.background}其运营或维护主体为${profile.organization}；关于创始或发起团队：${profile.foundingTeam}`;
  const strengths = profile.strengths || (profileGuidance[classId] && profileGuidance[classId].strengths);
  if (overview.length < 90) problems.push(`二级来源 ${key} 的最终正式介绍少于 90 字`);
  if (!Array.isArray(strengths) || strengths.length < 3) problems.push(`二级来源 ${key} 的最终优势与特征少于 3 项`);
});

/* 来源治理元数据门禁：级别、一手性、归属区、用途、节奏、健康度、在本站的角色与状态复核日期。 */
const tierValues = new Set(["S", "A", "B", "archive"]);
const provenanceValues = new Set(["primary", "secondary"]);
const scopeValues = new Set(["foundations", "building", "coding", "generation", "safety", "frontier", "cross"]);
const purposeValues = new Set(["concept", "fact", "news", "discovery"]);
const cadenceValues = new Set(["daily", "weekly", "monthly", "quarterly", "yearly", "static"]);
const healthValues = new Set(["active", "maintenance", "degraded", "retired"]);
const sourceUseValues = new Set(["evidence", "explainer", "market-forecast", "discovery"]);
const stalenessDays = 180;
const stalenessLimit = Date.now() - stalenessDays * 24 * 60 * 60 * 1000;

expectedProfileKeys.forEach(key => {
  const entry = sourceMeta[key];
  if (!entry) {
    problems.push(`二级来源 ${key} 缺少治理元数据（data/library-source-meta.js）`);
    return;
  }
  if (!tierValues.has(entry.tier)) problems.push(`二级来源 ${key} 的 tier 无效：${entry.tier}`);
  if (!provenanceValues.has(entry.provenance)) problems.push(`二级来源 ${key} 的 provenance 无效：${entry.provenance}`);
  if (!scopeValues.has(entry.originScope)) problems.push(`二级来源 ${key} 的 originScope 无效：${entry.originScope}`);
  if (!cadenceValues.has(entry.cadence)) problems.push(`二级来源 ${key} 的 cadence 无效：${entry.cadence}`);
  if (!healthValues.has(entry.health)) problems.push(`二级来源 ${key} 的 health 无效：${entry.health}`);
  if (!sourceUseValues.has(entry.sourceUse)) problems.push(`二级来源 ${key} 的 sourceUse 无效：${entry.sourceUse}`);
  if (!Array.isArray(entry.purposes) || !entry.purposes.length) {
    problems.push(`二级来源 ${key} 的 purposes 不能为空`);
  } else entry.purposes.forEach(purpose => {
    if (!purposeValues.has(purpose)) problems.push(`二级来源 ${key} 的 purposes 含无效值：${purpose}`);
  });
  if (entry.tier === "S" && entry.provenance !== "primary") problems.push(`二级来源 ${key} 为 S 级但 provenance 不是 primary`);
  if (entry.tier === "S" && entry.health !== "active") problems.push(`二级来源 ${key} 为 S 级但 health 不是 active（冻结或降级来源不得标 S 级）`);
  if (Array.isArray(entry.purposes) && entry.purposes.includes("news") && entry.cadence === "static") {
    problems.push(`二级来源 ${key} 声明服务资讯用途但 cadence 为 static`);
  }
  if (entry.sourceUse === "market-forecast" && entry.provenance !== "secondary") {
    problems.push(`二级来源 ${key} 为市场预测用途但 provenance 不是 secondary`);
  }
  if (entry.sourceUse === "explainer" && entry.provenance !== "secondary") {
    problems.push(`二级来源 ${key} 标注为讲解源但 provenance 不是 secondary（创作者不是事实原产地）`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.lastVerifiedAt || "")) {
    problems.push(`二级来源 ${key} 的 lastVerifiedAt 格式错误`);
  } else if (new Date(entry.lastVerifiedAt).getTime() < stalenessLimit) {
    warnings.push(`二级来源 ${key} 的状态复核日期 ${entry.lastVerifiedAt} 已超过 ${stalenessDays} 天`);
  }
  const profile = profiles[key];
  if (profile && profile.tier !== entry.tier) problems.push(`二级来源 ${key} 的治理元数据未合并进档案`);
});
Object.keys(sourceMeta).forEach(key => {
  if (!expectedProfileKeys.has(key)) problems.push(`存在未归属的治理元数据：${key}`);
});
const itemIds = new Set();
const counts = Object.fromEntries(expectedClasses.map(id => [id, 0]));
const officialSubcategoryIds = new Set(
  L.sourceClasses.find(source => source.id === "official").subcategories.map(entry => entry.id)
);
const officialCounts = Object.fromEntries(Array.from(officialSubcategoryIds, id => [id, 0]));
const officialHosts = {
  openai: ["developers.openai.com", "learn.chatgpt.com", "openai.com"],
  anthropic: ["docs.anthropic.com", "platform.claude.com", "anthropic.com", "www.anthropic.com", "www-cdn.anthropic.com"],
  "google-deepmind": ["ai.google.dev", "deepmind.google"],
  microsoft: ["learn.microsoft.com", "microsoft.github.io", "onnxruntime.ai"],
  "meta-ai": ["llama.com", "www.llama.com", "ai.meta.com", "github.com", "faiss.ai", "docs.pytorch.org"],
  nvidia: ["docs.nvidia.com", "nvidia.github.io", "docs.rapids.ai"],
  "hugging-face-official": ["huggingface.co"],
  aws: ["docs.aws.amazon.com", "awsdocs-neuron.readthedocs-hosted.com"],
  deepseek: ["api-docs.deepseek.com", "www.deepseek.com", "github.com", "huggingface.co"],
  qwen: ["qwen.readthedocs.io", "qwen.ai", "github.com", "huggingface.co", "www.modelscope.cn"],
  "moonshot-ai": ["github.com", "huggingface.co", "www.kimi.com", "platform.kimi.com"],
  "zhipu-ai": ["docs.bigmodel.cn", "www.zhipuai.cn", "github.com", "huggingface.co"]
};
const seenUrls = new Set();
const regulatoryStatuses = new Set(["draft", "consultation", "adopted", "effective", "current", "revised", "superseded", "withdrawn", "historical"]);
const bindingForces = new Set(["binding", "voluntary", "guidance", "case-specific", "unknown"]);
const requiredStrings = [
  "id", "sourceClass", "sourceSubcategory", "title", "publisher", "collection", "contentKind",
  "authorityTier", "reviewStatus", "url", "accessedAt", "summary", "evidenceUse"
];

const materialRecords = L.items.flatMap(item => [item].concat(item.relatedMaterials || []));
const kaggleHackathonRecords = L.items.filter(item => item.sourceClass === "hackathon" && item.sourceSubcategory === "kaggle");
if (kaggleHackathonRecords.length !== 157) problems.push(`Kaggle 黑客马拉松正式资料应为 157 条，当前为 ${kaggleHackathonRecords.length} 条`);
if (new Set(kaggleHackathonRecords.map(item => item.url)).size !== 157) problems.push("Kaggle 黑客马拉松正式资料存在重复 URL");
kaggleHackathonRecords.forEach(item => {
  if (item.reviewPolicy !== "hackathon-content-v1.1" || item.reviewDecision !== "admitted" || item.discoveryOnly !== true) {
    problems.push(`Kaggle 黑客马拉松资料 ${item.id} 的审核或发现型标记不完整`);
  }
  if (!item.award || !item.team || !item.eventSlug || item.reviewBatch !== "kaggle-full-review-20260924") {
    problems.push(`Kaggle 黑客马拉松资料 ${item.id} 缺少奖项、团队、赛事或批次证据`);
  }
});
const seenArxivIds = new Set();
materialRecords.forEach(item => {
  requiredStrings.forEach(field => {
    if (typeof item[field] !== "string" || !item[field].trim()) {
      problems.push(`资料 ${item.id || "?"} 缺少字符串字段 ${field}`);
    }
  });
  if (itemIds.has(item.id)) problems.push(`重复的资料 id：${item.id}`);
  itemIds.add(item.id);
  if (!classIds.has(item.sourceClass)) problems.push(`资料 ${item.id} 使用未知来源类：${item.sourceClass}`);
  else counts[item.sourceClass]++;
  if (item.sourceClass === "official" && officialSubcategoryIds.has(item.sourceSubcategory)) {
    officialCounts[item.sourceSubcategory]++;
    if (item.reviewPolicy !== "official-knowledge-matrix-v1") {
      problems.push(`官方技术资料 ${item.id} 未使用 official-knowledge-matrix-v1`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.reviewedAt || "")) {
      problems.push(`官方技术资料 ${item.id} 缺少有效审核日期`);
    }
    if (typeof item.selectionReason !== "string" || item.selectionReason.trim().length < 20) {
      problems.push(`官方技术资料 ${item.id} 的入选理由少于 20 字`);
    }
    if (typeof item.knowledgeDelta !== "string" || !item.knowledgeDelta.trim()) {
      problems.push(`官方技术资料 ${item.id} 缺少知识增量说明`);
    }
    if (typeof item.brandEvidenceDelta !== "string" || !item.brandEvidenceDelta.trim()) {
      problems.push(`官方技术资料 ${item.id} 缺少品牌证据增量说明`);
    }
    try {
      const host = new URL(item.url).hostname;
      if (!(officialHosts[item.sourceSubcategory] || []).includes(host)) {
        problems.push(`官方技术资料 ${item.id} 的域名 ${host} 不在 ${item.sourceSubcategory} 白名单`);
      }
    } catch (_) {
      problems.push(`官方技术资料 ${item.id} 的网址无法解析`);
    }
  }
  if (item.sourceClass === "standards") {
    if (item.reviewPolicy !== "standards-regulatory-v1.1") problems.push(`标准与监管资料 ${item.id} 未使用 standards-regulatory-v1.1`);
    if (!regulatoryStatuses.has(item.regulatoryStatus)) problems.push(`标准与监管资料 ${item.id} 的规范状态无效：${item.regulatoryStatus}`);
    if (!bindingForces.has(item.bindingForce)) problems.push(`标准与监管资料 ${item.id} 的约束力无效：${item.bindingForce}`);
    if (!["admitted", "merge-update"].includes(item.reviewDecision)) problems.push(`标准与监管资料 ${item.id} 的审核决定无效：${item.reviewDecision}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.reviewedAt || "")) problems.push(`标准与监管资料 ${item.id} 缺少有效审核日期`);
    if (!Array.isArray(item.applicability) || !item.applicability.length) problems.push(`标准与监管资料 ${item.id} 缺少适用边界`);
    if (typeof item.selectionReason !== "string" || item.selectionReason.trim().length < 40) problems.push(`标准与监管资料 ${item.id} 的六项审核理由不足`);
  }
  if (classIds.has(item.sourceClass) && !subcategoriesByClass.get(item.sourceClass).has(item.sourceSubcategory)) {
    problems.push(`资料 ${item.id} 使用无效二级来源：${item.sourceClass}/${item.sourceSubcategory}`);
  }
  if (!authorityTiers.has(item.authorityTier)) problems.push(`资料 ${item.id} 的权威等级无效：${item.authorityTier}`);
  if (item.primarySource !== true && item.primarySource !== false) problems.push(`资料 ${item.id} 的 primarySource 必须是布尔值`);
  if (item.discoveryOnly !== true && item.discoveryOnly !== false) problems.push(`资料 ${item.id} 的 discoveryOnly 必须是布尔值`);
  if (!/^https:\/\//.test(item.url || "")) problems.push(`资料 ${item.id} 必须使用 HTTPS 原始地址`);
  if (seenUrls.has(item.url)) problems.push(`重复的资料网址：${item.url}`);
  seenUrls.add(item.url);
  const canonicalArxivId = (String(item.url).match(/^https:\/\/arxiv\.org\/(?:abs|pdf|html)\/(\d{4}\.\d{4,5})(?:v\d+)?(?:\.pdf)?(?:[?#].*)?$/) || [])[1];
  if (canonicalArxivId) {
    if (seenArxivIds.has(canonicalArxivId)) problems.push(`重复的 arXiv 成果：${canonicalArxivId}`);
    seenArxivIds.add(canonicalArxivId);
    if (item.arxivId !== canonicalArxivId) problems.push(`资料 ${item.id} 的 arXiv 身份不一致`);
    if (!/^v\d+$/.test(item.reviewedVersion || "")) problems.push(`资料 ${item.id} 缺少已审核版本`);
    if (!item.selectionReason || !item.reviewEvidence?.url || !item.reviewEvidence?.sections) problems.push(`资料 ${item.id} 缺少内容审核依据`);
    const expectedEvidencePaths = ["html", "pdf"].map(kind => `https://arxiv.org/${kind}/${canonicalArxivId}${item.reviewedVersion}`);
    if (!expectedEvidencePaths.includes(item.reviewEvidence?.url)) problems.push(`资料 ${item.id} 的证据链接与已核版本不一致`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.accessedAt || "")) problems.push(`资料 ${item.id} 的 accessedAt 格式错误`);
  if (!Array.isArray(item.limitations) || !item.limitations.length) problems.push(`资料 ${item.id} 缺少使用边界`);
  if (!Array.isArray(item.tags) || !item.tags.length) problems.push(`资料 ${item.id} 缺少标签`);
  if (!Array.isArray(item.linkedNodes)) problems.push(`资料 ${item.id} 的 linkedNodes 必须是数组`);
  else item.linkedNodes.forEach(id => {
    if (!nodeIds.has(id)) problems.push(`资料 ${item.id} 关联了不存在的节点：${id}`);
  });
  if (!Array.isArray(item.linkedSoftware)) problems.push(`资料 ${item.id} 的 linkedSoftware 必须是数组`);
  else item.linkedSoftware.forEach(id => {
    if (!softwareIds.has(id)) problems.push(`资料 ${item.id} 关联了不存在的软件：${id}`);
  });
});

expectedClasses.forEach(id => {
  if (!counts[id] && intentionallyEmptyClasses.has(id)) {
    warnings.push(`来源分类 ${id} 已清空，等待按知识矩阵重新检索与审核`);
  } else if (!counts[id]) {
    problems.push(`来源分类 ${id} 还没有任何种子资料`);
  }
});
Object.entries(officialCounts).forEach(([id, count]) => {
  if (count < 1) problems.push(`官方技术资料二级分类 ${id} 还没有任何资料`);
});

/* official/openai 全量审核一致性：只约束该二级来源，不影响其他一级或二级来源。 */
if (openaiFullReview.policy !== "official-knowledge-matrix-v1" || openaiFullReview.policyVersion !== "1.0") {
  problems.push("OpenAI 全量审核未使用 official-knowledge-matrix-v1 v1.0");
}
const inventorySets = Array.isArray(openaiFullReview.inventorySets) ? openaiFullReview.inventorySets : [];
const inventoryTotal = inventorySets.reduce((sum, set) => sum + (set.entries || 0), 0);
const independentTotal = inventorySets.reduce((sum, set) => sum + (set.independentCards || 0), 0);
const admittedIds = Array.isArray(openaiFullReview.admittedObjectIds) ? openaiFullReview.admittedObjectIds : [];
if (inventoryTotal !== openaiFullReview.batch?.inventoryEntryCount || inventoryTotal !== openaiFullReview.summary?.indexedEntriesReviewed) {
  problems.push("OpenAI 全量审核目录项统计不一致");
}
if (independentTotal !== admittedIds.length || admittedIds.length !== openaiFullReview.summary?.independentCards) {
  problems.push("OpenAI 全量审核独立资料数不一致");
}
if (new Set(admittedIds).size !== admittedIds.length) problems.push("OpenAI 全量审核存在重复资料 ID");
const openaiItems = L.items.filter(item => item.sourceClass === "official" && item.sourceSubcategory === "openai");
const admittedSet = new Set(admittedIds);
admittedIds.forEach(id => {
  const item = openaiItems.find(entry => entry.id === id);
  if (!item) problems.push(`OpenAI 全量审核通过项 ${id} 未进入资料库`);
  else if (item.reviewBatch !== openaiFullReview.batch.id || item.reviewDecision !== "admitted-brand-evidence" || !item.topicKey) {
    problems.push(`OpenAI 全量审核通过项 ${id} 的审核元数据不一致`);
  }
});
openaiItems.forEach(item => {
  if (!admittedSet.has(item.id)) problems.push(`OpenAI 资料 ${item.id} 未出现在全量审核通过清单`);
});
if (openaiFullReview.summary?.nonIndependentEntries !== inventoryTotal - admittedIds.length) {
  problems.push("OpenAI 全量审核非独立条目数不一致");
}

/* 覆盖度报告：把「已入册但尚无资料」的二级来源显式列出来，替代逐条报错。 */
const subcategoryCounts = {};
materialRecords.forEach(item => {
  if (!subcategoriesByClass.has(item.sourceClass)) return;
  if (!subcategoriesByClass.get(item.sourceClass).has(item.sourceSubcategory)) return;
  const key = `${item.sourceClass}/${item.sourceSubcategory}`;
  subcategoryCounts[key] = (subcategoryCounts[key] || 0) + 1;
});
const coverageByClass = {};
expectedClasses.forEach(classId => {
  const ids = Array.from(subcategoriesByClass.get(classId));
  const filled = ids.filter(id => (subcategoryCounts[`${classId}/${id}`] || 0) > 0).length;
  /* 一级来源审核机制彼此隔离：official 不设篇数配额；其余来源恢复原有 10 篇覆盖统计。 */
  const active = classId === "official"
    ? filled
    : ids.filter(id => (subcategoryCounts[`${classId}/${id}`] || 0) >= 10).length;
  coverageByClass[classId] = { total: ids.length, filled, active };
  if (filled < ids.length) {
    if (classId === "official") {
      warnings.push(`来源覆盖 ${classId}：${ids.length} 个二级来源中 ${filled} 个已有通过知识矩阵审核的资料`);
    } else {
      warnings.push(`来源覆盖 ${classId}：${ids.length} 个二级来源中 ${filled} 个已登记资料、${active} 个达到 10 篇`);
    }
  }
});
const tierCounts = { S: 0, A: 0, B: 0, archive: 0 };
Object.values(sourceMeta).forEach(entry => { if (tierCounts[entry.tier] !== undefined) tierCounts[entry.tier]++; });

const subcategoryCount = L.sourceClasses.reduce((sum, source) => sum + source.subcategories.length, 0);
console.log(`专业资料库 ${L.items.length} 条 · 一级来源 ${L.sourceClasses.length} 类 · 二级来源 ${subcategoryCount} 个`);
console.log(`平台档案 ${Object.keys(profiles).length} 份`);
console.log(`介绍指南 ${Object.keys(profileGuidance).length} 类`);
console.log(`来源治理元数据 ${Object.keys(sourceMeta).length} 条（S=${tierCounts.S} A=${tierCounts.A} B=${tierCounts.B}）`);
console.log("来源分布：" + expectedClasses.map(id => `${id}=${counts[id]}`).join(" "));
console.log("官方技术资料分布：" + Object.entries(officialCounts).map(([id, count]) => `${id}=${count}`).join(" "));

if (warnings.length) {
  console.warn("\n⚠ 待补事项 " + warnings.length + " 项：");
  warnings.forEach(warning => console.warn("  - " + warning));
}

if (problems.length) {
  console.error("\n✗ 发现 " + problems.length + " 个问题：");
  problems.forEach(problem => console.error("  - " + problem));
  process.exit(1);
}
console.log("\n✓ 专业资料库校验通过");
