/* 专业资料库机械门禁：校验九类来源、证据字段和站内关联。 */
"use strict";

const path = require("path");
const fs = require("fs");
const { PROJECT_ROOT } = require("../shared/project-root");
const { LIBRARY_DATA_FILES, assertBrowserLibraryBundle } = require("../shared/library-data-files");
const openaiRereviewInventory = require(path.join(PROJECT_ROOT, "proposals", "official-technical", "openai-rereview-inventory-20260924.json"));
const openaiImportanceBatch1 = require(path.join(PROJECT_ROOT, "proposals", "official-technical", "openai-importance-batch-01.json"));
const openaiImportanceBatch2 = require(path.join(PROJECT_ROOT, "proposals", "official-technical", "openai-importance-batch-02.json"));
const openaiImportanceBatch3 = require(path.join(PROJECT_ROOT, "proposals", "official-technical", "openai-importance-batch-03.json"));
const openaiImportanceBatch4 = require(path.join(PROJECT_ROOT, "proposals", "official-technical", "openai-importance-batch-04.json"));
const openaiImportanceBatch5 = require(path.join(PROJECT_ROOT, "proposals", "official-technical", "openai-importance-batch-05.json"));
const openaiValueScoreBatch1 = require(path.join(PROJECT_ROOT, "proposals", "official-technical", "openai-value-score-batch-01.json"));
const openaiValueScoreBatch2 = require(path.join(PROJECT_ROOT, "proposals", "official-technical", "openai-value-score-batch-02.json"));
const openaiValueScoreBatch3 = require(path.join(PROJECT_ROOT, "proposals", "official-technical", "openai-value-score-batch-03.json"));
const openaiValueScoreBatch4 = require(path.join(PROJECT_ROOT, "proposals", "official-technical", "openai-value-score-batch-04.json"));
const anthropicRereviewInventory = require(path.join(PROJECT_ROOT, "proposals", "official-technical", "anthropic-rereview-inventory-20260924.json"));
const anthropicImportanceBatch1 = require(path.join(PROJECT_ROOT, "proposals", "official-technical", "anthropic-importance-batch-01.json"));
const anthropicImportanceBatch2 = require(path.join(PROJECT_ROOT, "proposals", "official-technical", "anthropic-importance-batch-02.json"));
const anthropicImportanceBatch3 = require(path.join(PROJECT_ROOT, "proposals", "official-technical", "anthropic-importance-batch-03.json"));
const anthropicImportanceBatch4 = require(path.join(PROJECT_ROOT, "proposals", "official-technical", "anthropic-importance-batch-04.json"));
const anthropicValueScoreBatch1 = require(path.join(PROJECT_ROOT, "proposals", "official-technical", "anthropic-value-score-batch-01.json"));
const anthropicValueScoreBatch2 = require(path.join(PROJECT_ROOT, "proposals", "official-technical", "anthropic-value-score-batch-02.json"));
const anthropicValueScoreBatch3 = require(path.join(PROJECT_ROOT, "proposals", "official-technical", "anthropic-value-score-batch-03.json"));
const anthropicValueScoreBatch4 = require(path.join(PROJECT_ROOT, "proposals", "official-technical", "anthropic-value-score-batch-04.json"));
const anthropicValueScoreBatch5 = require(path.join(PROJECT_ROOT, "proposals", "official-technical", "anthropic-value-score-batch-05.json"));
const anthropicValueScoreBatch6 = require(path.join(PROJECT_ROOT, "proposals", "official-technical", "anthropic-value-score-batch-06.json"));
const googleDeepmindRereviewInventory = require(path.join(PROJECT_ROOT, "proposals", "official-technical", "google-deepmind-rereview-inventory-20260924.json"));
const googleDeepmindImportanceBatch1 = require(path.join(PROJECT_ROOT, "proposals", "official-technical", "google-deepmind-importance-batch-01.json"));
const googleDeepmindImportanceBatch2 = require(path.join(PROJECT_ROOT, "proposals", "official-technical", "google-deepmind-importance-batch-02.json"));
global.window = {};

try {
  require(path.join(PROJECT_ROOT, "data", "graph.js"));
  require(path.join(PROJECT_ROOT, "data", "software.js"));
  assertBrowserLibraryBundle(PROJECT_ROOT);
  LIBRARY_DATA_FILES.forEach(file => require(path.join(PROJECT_ROOT, file)));
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
  /* v1 曾以「S 级必须 provenance=primary 且 health=active」把来源等级与一手性、健康度绑死。
     v2 已取消 S/A/B 的准入功能，并明确 health、回访频率与链接存活只是维护状态、不是可信度排名，
     因此不再由 tier 驱动 provenance 与 health 约束。此处只保留 tier 的值域校验；
     tier 本身已冻结为 v1 遗留分层，待四道闸门覆盖全部二级来源后连同字段一并删除。 */
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
  openai: ["developers.openai.com", "learn.chatgpt.com", "openai.com", "github.com"],
  anthropic: ["docs.anthropic.com", "platform.claude.com", "code.claude.com", "anthropic.com", "www.anthropic.com", "www-cdn.anthropic.com"],
  "google-deepmind": ["ai.google.dev", "deepmind.google", "ai.google", "blog.google"],
  microsoft: ["learn.microsoft.com", "microsoft.github.io", "onnxruntime.ai", "github.com"],
  "meta-ai": ["llama.com", "www.llama.com", "ai.meta.com", "dev.meta.ai", "github.com", "faiss.ai", "docs.pytorch.org"],
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
    const acceptedOfficialPolicies = ["openai", "anthropic", "google-deepmind", "meta-ai", "nvidia"].includes(item.sourceSubcategory)
      ? new Set(["official-technical-importance-v2", `${item.sourceSubcategory}-official-value-score-v1`])
      : item.sourceSubcategory === "microsoft"
        ? new Set(["official-knowledge-matrix-v1", "microsoft-official-value-score-v1"])
        : new Set(["official-knowledge-matrix-v1"]);
    if (!acceptedOfficialPolicies.has(item.reviewPolicy)) {
      problems.push(`官方技术资料 ${item.id} 的审核机制无效`);
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
      const officialUrl = new URL(item.url);
      const host = officialUrl.hostname;
      if (!(officialHosts[item.sourceSubcategory] || []).includes(host)) {
        problems.push(`官方技术资料 ${item.id} 的域名 ${host} 不在 ${item.sourceSubcategory} 白名单`);
      } else if (item.sourceSubcategory === "openai" && host === "github.com" && !officialUrl.pathname.toLowerCase().startsWith("/openai/")) {
        problems.push(`官方技术资料 ${item.id} 的 GitHub 路径不属于 OpenAI 官方组织`);
      } else if (item.sourceSubcategory === "microsoft" && host === "github.com" && !officialUrl.pathname.toLowerCase().startsWith("/microsoft/")) {
        problems.push(`官方技术资料 ${item.id} 的 GitHub 路径不属于 Microsoft 官方组织`);
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

/* official/openai v2：重要性是建卡前的硬门槛，只约束该二级来源。 */
const importanceBatches = [openaiImportanceBatch1, openaiImportanceBatch2, openaiImportanceBatch3, openaiImportanceBatch4, openaiImportanceBatch5];
const openaiItems = L.items.filter(item => item.sourceClass === "official" && item.sourceSubcategory === "openai");
const openaiItemIds = new Set(openaiItems.map(item => item.id));
const importanceAdmittedSet = new Set();
const reviewedUrls = new Set();
const editorialSupportingSets = new Set(["cookbook", "developer-blog", "learning-resources"]);
importanceBatches.forEach((batch, batchIndex) => {
  const label = `第 ${batchIndex + 1} 批`;
  if (batch.policy !== "official-technical-importance-v2" || batch.policyVersion !== "2.0") {
    problems.push(`OpenAI 重要性审核${label}未使用机制 v2`);
  }
  const records = Array.isArray(batch.records) ? batch.records : [];
  const admittedIds = Array.isArray(batch.admittedObjectIds) ? batch.admittedObjectIds : [];
  const expectedCount = batchIndex === importanceBatches.length - 1 ? 129 : 200;
  if (records.length !== expectedCount || records.length !== batch.batch?.candidateCount || records.length !== batch.summary?.reviewed) {
    problems.push(`OpenAI 重要性审核${label}必须恰好包含 ${expectedCount} 份候选`);
  }
  if (admittedIds.length !== batch.summary?.admitted || records.filter(record => record.decision.startsWith("admitted-")).length !== admittedIds.length) {
    problems.push(`OpenAI 重要性审核${label}通过数量不一致`);
  }
  records.forEach(decision => {
    if (reviewedUrls.has(decision.canonicalUrl)) problems.push(`OpenAI 重要性审核重复处理 URL：${decision.canonicalUrl}`);
    reviewedUrls.add(decision.canonicalUrl);
    const item = openaiItems.find(entry => entry.id === decision.id);
    if (decision.decision.startsWith("admitted-")) {
      importanceAdmittedSet.add(decision.id);
      if (decision.decision === "admitted-core") {
        if (!Array.isArray(decision.comparedWith) || !decision.comparedWith.length) {
          problems.push(`OpenAI 核心资料 ${decision.id} 缺少 comparedWith`);
        }
        if (typeof decision.uniqueDelta !== "string" || decision.uniqueDelta.trim().length < 40) {
          problems.push(`OpenAI 核心资料 ${decision.id} 缺少具体 uniqueDelta`);
        }
      }
      if (decision.decision === "admitted-transition") {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(decision.recheckAt || "")) {
          problems.push(`OpenAI 迁移资料 ${decision.id} 缺少具体 recheckAt`);
        }
        if (!Array.isArray(decision.recheckTriggers) || !decision.recheckTriggers.length) {
          problems.push(`OpenAI 迁移资料 ${decision.id} 缺少复核触发条件`);
        }
      }
      if (editorialSupportingSets.has(decision.setId) && decision.decision === "admitted-core") {
        problems.push(`OpenAI ${decision.setId} 资料 ${decision.id} 不得处于默认核心层`);
      }
      if (!item) problems.push(`OpenAI 重要性审核通过项 ${decision.id} 未进入资料库`);
      else if (item.reviewPolicy !== batch.policy || item.reviewBatch !== batch.batch.id || item.reviewDecision !== decision.decision || !item.knowledgeDelta || item.contentTier !== decision.decision.replace("admitted-", "")) {
        problems.push(`OpenAI 重要性审核通过项 ${decision.id} 的审核元数据不一致`);
      }
    } else if (item) {
      problems.push(`OpenAI 重要性审核淘汰项 ${decision.id} 仍在资料库中`);
    }
    if (decision.mergedInto && !openaiItemIds.has(decision.mergedInto)) {
      problems.push(`OpenAI 合并项 ${decision.id} 指向不存在的主卡 ${decision.mergedInto}`);
    }
  });
});
openaiItems.forEach(item => {
  if (!importanceAdmittedSet.has(item.id)) problems.push(`OpenAI 资料 ${item.id} 未通过当前重要性审核`);
  if (item.sourceSet === "ads" || /\/ads\//.test(item.url)) problems.push(`OpenAI Ads 资料 ${item.id} 仍在默认资料库`);
});
if (openaiItems.filter(item => item.reviewDecision === "admitted-transition").length !== 9) {
  problems.push("OpenAI 迁移资料应为 9 条并全部设置具体复核日期");
}

/* OpenAI 价值评分：10 分制，至少 6 分且知识重要性至少 2 分。 */
const valueScoreBatches = [openaiValueScoreBatch1, openaiValueScoreBatch2, openaiValueScoreBatch3, openaiValueScoreBatch4];
const valueScoreResults = valueScoreBatches.flatMap((batch, index) => {
  const results = Array.isArray(batch.results) ? batch.results : [];
  if (batch.policy !== "openai-official-value-score-v1" || results.length !== 60) {
    problems.push(`OpenAI 第 ${index + 1} 批价值评分必须使用 v1 机制并恰好包含 60 份资料`);
  }
  return results.map(result => ({ ...result, expectedScoreBatch:batch.batch?.id }));
});
if (new Set(valueScoreResults.map(result => result.id)).size !== valueScoreResults.length) {
  problems.push("OpenAI 各批价值评分不得重复包含同一份资料");
}
valueScoreResults.forEach(result => {
  const score = result.scores || {};
  const dimensions = [score.knowledgeImportance, score.irreplaceability, score.durability, score.applicability];
  if (!dimensions.every(value => Number.isInteger(value)) || score.knowledgeImportance < 0 || score.knowledgeImportance > 3 ||
      score.irreplaceability < 0 || score.irreplaceability > 3 || score.durability < 0 || score.durability > 2 ||
      score.applicability < 0 || score.applicability > 2) {
    problems.push(`OpenAI 价值评分 ${result.id} 的维度分数无效`);
    return;
  }
  const expectedTotal = dimensions.reduce((sum, value) => sum + value, 0);
  const expectedPass = expectedTotal >= 6 && score.knowledgeImportance >= 2;
  if (score.total !== expectedTotal || score.passed !== expectedPass) {
    problems.push(`OpenAI 价值评分 ${result.id} 的总分或门槛结论不一致`);
  }
  const audited = importanceBatches.flatMap(batch => batch.records).find(record => record.id === result.id);
  if (!audited || audited.scoreBatch !== result.expectedScoreBatch || audited.valueScore?.total !== expectedTotal) {
    problems.push(`OpenAI 价值评分 ${result.id} 未完整写回审核记录`);
  }
  const published = openaiItemIds.has(result.id);
  if (expectedPass !== published) {
    problems.push(`OpenAI 价值评分 ${result.id} 的前台发布状态与 6 分门槛不一致`);
  }
  if (published) {
    const item = openaiItems.find(entry => entry.id === result.id);
    if (item?.scoreBatch !== result.expectedScoreBatch || item?.valueScore?.total !== expectedTotal) {
      problems.push(`OpenAI 价值评分 ${result.id} 未写入前台资料对象`);
    }
  }
});
const inventoryRecords = Array.isArray(openaiRereviewInventory.records) ? openaiRereviewInventory.records : [];
if (inventoryRecords.length !== openaiRereviewInventory.summary?.rawIndexEntries) problems.push("OpenAI 审核母集条目数不一致");
const eligibleInventoryRecords = inventoryRecords.filter(record => !["ineligible-container-or-combined-export", "ineligible-duplicate-route"].includes(record.reviewStatus));
if (eligibleInventoryRecords.length !== openaiRereviewInventory.summary?.uniqueContentCandidates) problems.push("OpenAI 独立候选数不一致");
if (eligibleInventoryRecords.filter(record => record.reviewStatus === "pending-importance-review").length !== openaiRereviewInventory.summary?.pendingContentReview) problems.push("OpenAI 待重要性审核数量不一致");
if (eligibleInventoryRecords.filter(record => record.reviewStatus.startsWith("admitted-")).length !== openaiRereviewInventory.summary?.admitted) problems.push("OpenAI 已通过重要性审核数量不一致");

/* official/anthropic v2：每批 220 份，旧卡在第一批开始时全部失效。 */
const anthropicItems = L.items.filter(item => item.sourceClass === "official" && item.sourceSubcategory === "anthropic");
const anthropicBatches = [anthropicImportanceBatch1, anthropicImportanceBatch2, anthropicImportanceBatch3, anthropicImportanceBatch4];
const anthropicAdmittedSet = new Set();
anthropicBatches.forEach((batch, batchIndex) => {
  const label = `第 ${batchIndex + 1} 批`;
  const records = Array.isArray(batch.records) ? batch.records : [];
  const admittedIds = Array.isArray(batch.admittedObjectIds) ? batch.admittedObjectIds : [];
  const expectedCount = batchIndex === anthropicBatches.length - 1 ? 185 : 220;
  if (batch.policy !== "official-technical-importance-v2" || batch.policyVersion !== "2.0") {
    problems.push(`Anthropic 重要性审核${label}未使用机制 v2`);
  }
  if (records.length !== expectedCount || records.length !== batch.batch?.candidateCount || records.length !== batch.summary?.reviewed) {
    problems.push(`Anthropic 重要性审核${label}必须恰好包含 ${expectedCount} 份候选`);
  }
  if (admittedIds.length !== batch.summary?.admitted || records.filter(record => record.decision.startsWith("admitted-")).length !== admittedIds.length) {
    problems.push(`Anthropic 重要性审核${label}通过数量不一致`);
  }
  if (batch.contentVerification?.status !== "complete" || batch.contentVerification?.verifiedRecords !== expectedCount) {
    problems.push(`Anthropic 重要性审核${label}未完成 ${expectedCount} 份官方正文核验`);
  }
  records.forEach((decision, index) => {
    const inventoryIndex = batchIndex * 220 + index;
    if (decision.canonicalUrl !== anthropicRereviewInventory.records[inventoryIndex]?.canonicalUrl || decision.sequence !== inventoryIndex + 1) {
      problems.push(`Anthropic ${label}第 ${index + 1} 项与冻结母集顺序不一致`);
    }
    if (decision.contentVerification?.httpStatus !== 200 || decision.contentVerification?.bytes < 200 || !/^[a-f0-9]{64}$/.test(decision.contentVerification?.sha256 || "")) {
      problems.push(`Anthropic ${label}第 ${index + 1} 项缺少有效正文核验`);
    }
    const item = anthropicItems.find(entry => entry.id === decision.id);
    if (decision.decision.startsWith("admitted-")) {
      anthropicAdmittedSet.add(decision.id);
      if (!item) problems.push(`Anthropic 重要性审核通过项 ${decision.id} 未进入资料库`);
      else if (item.reviewPolicy !== batch.policy || item.reviewBatch !== batch.batch.id || item.reviewDecision !== decision.decision || !item.knowledgeDelta) {
        problems.push(`Anthropic 重要性审核通过项 ${decision.id} 的审核元数据不一致`);
      }
    } else if (item) {
      problems.push(`Anthropic 重要性审核淘汰项 ${decision.id} 仍在资料库中`);
    }
  });
});
anthropicItems.forEach(item => {
  if (!anthropicAdmittedSet.has(item.id)) problems.push(`Anthropic 资料 ${item.id} 未通过当前重要性审核`);
});
/* Anthropic 价值评分：与 OpenAI 共用 10 分制和双门槛。 */
const anthropicScoreBatches = [anthropicValueScoreBatch1, anthropicValueScoreBatch2, anthropicValueScoreBatch3, anthropicValueScoreBatch4, anthropicValueScoreBatch5, anthropicValueScoreBatch6];
const anthropicScoreResults = anthropicScoreBatches.flatMap((batch, index) => {
  const results = Array.isArray(batch.results) ? batch.results : [];
  const expectedCount = index === anthropicScoreBatches.length - 1 ? 6 : 60;
  if (batch.policy !== "anthropic-official-value-score-v1" || results.length !== expectedCount) {
    problems.push(`Anthropic 第 ${index + 1} 批价值评分必须使用 v1 机制并恰好包含 ${expectedCount} 份资料`);
  }
  return results.map(result => ({ ...result, expectedScoreBatch:batch.batch?.id }));
});
if (new Set(anthropicScoreResults.map(result => result.id)).size !== anthropicScoreResults.length) {
  problems.push("Anthropic 各批价值评分不得重复包含同一份资料");
}
anthropicScoreResults.forEach(result => {
  const score = result.scores || {};
  const dimensions = [score.knowledgeImportance, score.irreplaceability, score.durability, score.applicability];
  if (!dimensions.every(Number.isInteger) || score.knowledgeImportance < 0 || score.knowledgeImportance > 3 ||
      score.irreplaceability < 0 || score.irreplaceability > 3 || score.durability < 0 || score.durability > 2 ||
      score.applicability < 0 || score.applicability > 2) {
    problems.push(`Anthropic 价值评分 ${result.id} 的维度分数无效`);
    return;
  }
  const total = dimensions.reduce((sum, value) => sum + value, 0);
  const passed = total >= 6 && score.knowledgeImportance >= 2;
  if (score.total !== total || score.passed !== passed) problems.push(`Anthropic 价值评分 ${result.id} 的总分或门槛结论不一致`);
  const audited = anthropicBatches.flatMap(batch => batch.records).find(record => record.id === result.id);
  if (!audited || audited.scoreBatch !== result.expectedScoreBatch || audited.valueScore?.total !== total) {
    problems.push(`Anthropic 价值评分 ${result.id} 未完整写回审核记录`);
  }
  const published = anthropicItems.find(item => item.id === result.id);
  if (passed && (!published || published.scoreBatch !== result.expectedScoreBatch || published.valueScore?.total !== total)) {
    problems.push(`Anthropic 价值评分通过项 ${result.id} 未正确进入前台`);
  }
  if (!passed && published) problems.push(`Anthropic 价值评分淘汰项 ${result.id} 仍在前台`);
});
if (anthropicValueScoreBatch1.summary?.retained !== 53 || anthropicValueScoreBatch1.summary?.removed !== 7) {
  problems.push("Anthropic 第一批价值评分汇总应为保留 53、淘汰 7");
}
if (anthropicValueScoreBatch2.summary?.retained !== 51 || anthropicValueScoreBatch2.summary?.removed !== 9) {
  problems.push("Anthropic 第二批价值评分汇总应为保留 51、淘汰 9");
}
if (anthropicValueScoreBatch3.summary?.retained !== 54 || anthropicValueScoreBatch3.summary?.removed !== 6) {
  problems.push("Anthropic 第三批价值评分汇总应为保留 54、淘汰 6");
}
if (anthropicValueScoreBatch4.summary?.retained !== 49 || anthropicValueScoreBatch4.summary?.removed !== 11) {
  problems.push("Anthropic 第四批价值评分汇总应为保留 49、淘汰 11");
}
if (anthropicValueScoreBatch5.summary?.retained !== 57 || anthropicValueScoreBatch5.summary?.removed !== 3) {
  problems.push("Anthropic 第五批价值评分汇总应为保留 57、淘汰 3");
}
if (anthropicValueScoreBatch6.summary?.retained !== 5 || anthropicValueScoreBatch6.summary?.removed !== 1) {
  problems.push("Anthropic 第六批价值评分汇总应为保留 5、淘汰 1");
}
if (anthropicScoreResults.length !== 306 || anthropicItems.length !== 269 || anthropicItems.some(item => !item.valueScore || !item.scoreBatch)) {
  problems.push("Anthropic 306 份原通过资料必须全部完成价值评分，并只保留 269 份通过项");
}
const anthropicTopicCounts = {
  "security-governance":56,
  "responses-agents-tools":91,
  "codex-engineering":12,
  "mcp-plugins-skills":19,
  "production-observability":21,
  "multimodal-realtime":9,
  "evals-finetuning":6,
  "models-prompting-output":42,
  "migration-lifecycle":13,
  "agentic-commerce":0
};
if (JSON.stringify(L.topicTaxonomies?.anthropic) !== JSON.stringify(Object.keys(anthropicTopicCounts))) {
  problems.push("Anthropic 知识分类必须保持固定 10 类及其顺序");
}
Object.entries(anthropicTopicCounts).forEach(([category, expected]) => {
  if (anthropicItems.filter(item => item.primaryCategory === category).length !== expected) {
    problems.push(`Anthropic 分类 ${category} 数量必须为 ${expected}`);
  }
});
anthropicItems.forEach(item => {
  if (!Object.hasOwn(anthropicTopicCounts, item.primaryCategory) || JSON.stringify(item.topicTags) !== JSON.stringify([item.primaryCategory])) {
    problems.push(`Anthropic 资料 ${item.id} 的知识分类字段无效`);
  }
});
const anthropicInventoryRecords = Array.isArray(anthropicRereviewInventory.records) ? anthropicRereviewInventory.records : [];
if (anthropicInventoryRecords.length !== 845 || anthropicInventoryRecords.length !== anthropicRereviewInventory.summary?.rawIndexEntries) problems.push("Anthropic 冻结审核母集必须包含 845 份资料");
if (anthropicInventoryRecords.filter(record => record.reviewStatus === "pending-importance-review").length !== anthropicRereviewInventory.summary?.pendingContentReview) problems.push("Anthropic 待重要性审核数量不一致");
if (anthropicInventoryRecords.filter(record => record.reviewStatus.startsWith("admitted-")).length !== anthropicRereviewInventory.summary?.admitted) problems.push("Anthropic 已通过重要性审核数量不一致");
if (anthropicInventoryRecords.filter(record => record.reviewStatus.startsWith("rejected-")).length !== anthropicRereviewInventory.summary?.rejectedAfterContentReview) problems.push("Anthropic 已淘汰数量不一致");
if (anthropicRereviewInventory.batch?.status !== "complete" || anthropicRereviewInventory.summary?.pendingContentReview !== 0 || anthropicRereviewInventory.summary?.admitted + anthropicRereviewInventory.summary?.rejectedAfterContentReview !== 845) {
  problems.push("Anthropic 845 份母集尚未形成完整闭环");
}

/* official/google-deepmind v2：两轮覆盖固定审核母集全部 257 份。 */
const googleDeepmindItems = L.items.filter(item => item.sourceClass === "official" && item.sourceSubcategory === "google-deepmind");
const googleBatches = [googleDeepmindImportanceBatch1, googleDeepmindImportanceBatch2];
const googleRecords = googleBatches.flatMap(batch => Array.isArray(batch.records) ? batch.records : []);
const googleAdmittedIds = googleBatches.flatMap(batch => Array.isArray(batch.admittedObjectIds) ? batch.admittedObjectIds : []);
if (googleBatches.some(batch => batch.policy !== "official-technical-importance-v2" || batch.policyVersion !== "2.0")) {
  problems.push("Google / DeepMind 重要性审核未统一使用机制 v2");
}
if (googleDeepmindImportanceBatch1.records?.length !== 130 || googleDeepmindImportanceBatch2.records?.length !== 127 || googleRecords.length !== 257) {
  problems.push("Google / DeepMind 两轮重要性审核必须按 130 + 127 覆盖 257 份候选");
}
if (googleAdmittedIds.length !== googleBatches.reduce((sum, batch) => sum + batch.summary.admitted, 0) || googleRecords.filter(record => record.decision.startsWith("admitted-")).length !== googleAdmittedIds.length) {
  problems.push("Google / DeepMind 两轮重要性审核通过数量不一致");
}
if (googleBatches.some(batch => batch.contentVerification?.status !== "complete" || batch.contentVerification?.verifiedRecords !== batch.records.length)) {
  problems.push("Google / DeepMind 两轮审核未完成全部 257 份官方正文核验");
}
const googleAdmittedSet = new Set(googleAdmittedIds);
googleRecords.forEach((decision, index) => {
  if (decision.canonicalUrl !== googleDeepmindRereviewInventory.records[index]?.canonicalUrl || decision.sequence !== index + 1) {
    problems.push(`Google / DeepMind 第 ${index + 1} 项与冻结母集顺序不一致`);
  }
  if (decision.contentVerification?.httpStatus !== 200 || (decision.contentVerification?.bytes < 200 && !decision.contentVerification?.movedStub) || !/^[a-f0-9]{64}$/.test(decision.contentVerification?.sha256 || "")) {
    problems.push(`Google / DeepMind 第 ${index + 1} 项缺少有效正文核验`);
  }
  const item = googleDeepmindItems.find(entry => entry.id === decision.id);
  const expectedBatch = index < 130 ? googleDeepmindImportanceBatch1 : googleDeepmindImportanceBatch2;
  if (decision.decision.startsWith("admitted-")) {
    if (!item) problems.push(`Google / DeepMind 重要性审核通过项 ${decision.id} 未进入资料库`);
    else if (![expectedBatch.policy, "google-deepmind-official-value-score-v1"].includes(item.reviewPolicy)
      || item.reviewBatch !== (decision.scoreBatch || expectedBatch.batch.id)
      || item.reviewDecision !== decision.decision || !item.knowledgeDelta) {
      problems.push(`Google / DeepMind 重要性审核通过项 ${decision.id} 的审核元数据不一致`);
    }
  } else if (item) {
    problems.push(`Google / DeepMind 重要性审核淘汰项 ${decision.id} 仍在资料库中`);
  }
});
googleDeepmindItems.forEach(item => {
  if (!googleAdmittedSet.has(item.id)) problems.push(`Google / DeepMind 资料 ${item.id} 未通过当前重要性审核`);
});
const googleInventoryRecords = Array.isArray(googleDeepmindRereviewInventory.records) ? googleDeepmindRereviewInventory.records : [];
if (googleInventoryRecords.length !== 257 || googleInventoryRecords.length !== googleDeepmindRereviewInventory.summary?.rawIndexEntries) problems.push("Google / DeepMind 冻结审核母集必须包含 257 份资料");
if (googleInventoryRecords.filter(record => record.reviewStatus === "pending-importance-review").length !== googleDeepmindRereviewInventory.summary?.pendingContentReview) problems.push("Google / DeepMind 待重要性审核数量不一致");
if (googleInventoryRecords.filter(record => record.reviewStatus.startsWith("admitted-")).length !== googleDeepmindRereviewInventory.summary?.admitted) problems.push("Google / DeepMind 已通过重要性审核数量不一致");
if (googleInventoryRecords.filter(record => record.reviewStatus.startsWith("rejected-")).length !== googleDeepmindRereviewInventory.summary?.rejectedAfterContentReview) problems.push("Google / DeepMind 已淘汰数量不一致");
if (googleDeepmindRereviewInventory.batch?.status !== "complete" || googleDeepmindRereviewInventory.summary?.pendingContentReview !== 0 || googleDeepmindRereviewInventory.summary?.admitted + googleDeepmindRereviewInventory.summary?.rejectedAfterContentReview !== 257) {
  problems.push("Google / DeepMind 257 份母集尚未形成完整闭环");
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

/* 对外规模声明门禁：文档里声明的资料库规模必须与本次实际统计一致，防止数字再次漂移。
   docs/STATUS.md 是冻结的进度快照，docs/archive/ 是历史记录，二者不代表当前版本，明确不纳入比对。
   若某份文档改写了句式导致数字无法机器核对，本门禁同样失败——规模声明必须保持可核对。 */
const actualScale = {
  primarySources: L.sourceClasses.length,
  secondarySources: subcategoryCount,
  profiles: Object.keys(profiles).length,
  items: L.items.length,
  officialSources: Object.keys(officialCounts).length,
  officialItems: Object.values(officialCounts).reduce((sum, count) => sum + count, 0)
};
const scaleClaims = [
  {
    file: "README.md",
    pattern: /9 类一级来源、(\d+) 个二级来源与\s*(\d+)\s*份平台档案、(\d+) 条专业资料（其中官方技术资料 (\d+) 条）/,
    fields: ["secondarySources", "profiles", "items", "officialItems"]
  },
  {
    file: "docs/SOURCE_POLICY.md",
    pattern: /二级来源 (\d+) 个，其中官方技术资料 (\d+) 个二级来源共 (\d+) 条/,
    fields: ["secondarySources", "officialSources", "officialItems"]
  },
  {
    file: "docs/I18N.md",
    pattern: /- (\d+) 个一级来源；\s*- (\d+) 个二级来源；\s*- (\d+) 份来源档案；\s*- (\d+) 份分类说明；\s*- (\d+) 条资料，其中官方技术资料 (\d+) 条/,
    fields: ["primarySources", "secondarySources", "profiles", "officialSources", "items", "officialItems"]
  }
];
scaleClaims.forEach(({ file, pattern, fields }) => {
  const match = fs.readFileSync(path.join(PROJECT_ROOT, file), "utf8").match(pattern);
  if (!match) {
    problems.push(`${file} 的资料库规模声明句式已变更，数字无法机器核对`);
    return;
  }
  fields.forEach((field, index) => {
    if (Number(match[index + 1]) !== actualScale[field]) {
      problems.push(`${file} 声明 ${field} 为 ${match[index + 1]}，实际为 ${actualScale[field]}`);
    }
  });
});

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
