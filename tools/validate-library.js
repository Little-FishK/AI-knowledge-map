/* 专业资料库机械门禁：校验九类来源、证据字段和站内关联。 */
"use strict";

const path = require("path");
global.window = {};

try {
  require(path.join(__dirname, "..", "data", "graph.js"));
  require(path.join(__dirname, "..", "data", "software.js"));
  require(path.join(__dirname, "..", "data", "library.js"));
  require(path.join(__dirname, "..", "data", "library-official-technical.js"));
  require(path.join(__dirname, "..", "data", "library-platform-profiles.js"));
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
const authorityTiers = new Set(["A1", "A2", "B", "R"]);
const nodeIds = new Set(global.window.GRAPH.nodes.map(node => node.id));
const softwareIds = new Set(global.window.SOFTWARE.items.map(item => item.id));
const problems = [];

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
const itemIds = new Set();
const counts = Object.fromEntries(expectedClasses.map(id => [id, 0]));
const officialSubcategoryIds = new Set(
  L.sourceClasses.find(source => source.id === "official").subcategories.map(entry => entry.id)
);
const officialCounts = Object.fromEntries(Array.from(officialSubcategoryIds, id => [id, 0]));
const officialHosts = {
  openai: ["developers.openai.com", "openai.com"],
  anthropic: ["docs.anthropic.com", "anthropic.com", "www-cdn.anthropic.com"],
  "google-deepmind": ["ai.google.dev", "deepmind.google"],
  microsoft: ["learn.microsoft.com", "microsoft.github.io", "onnxruntime.ai"],
  "meta-ai": ["llama.com", "www.llama.com", "ai.meta.com", "github.com", "faiss.ai", "docs.pytorch.org", "llama-stack.readthedocs.io"],
  nvidia: ["docs.nvidia.com", "nvidia.github.io", "docs.rapids.ai"],
  "hugging-face-official": ["huggingface.co"],
  aws: ["docs.aws.amazon.com", "awsdocs-neuron.readthedocs-hosted.com"],
  "vendor-docs-other": ["elevenlabs.io", "docs.mistral.ai", "docs.cohere.com", "platform.stability.ai", "docs.dev.runwayml.com", "docs.x.ai", "console.groq.com", "docs.perplexity.ai", "developer.adobe.com", "docs.databricks.com"]
};
const seenUrls = new Set();
const requiredStrings = [
  "id", "sourceClass", "sourceSubcategory", "title", "publisher", "collection", "contentKind",
  "authorityTier", "reviewStatus", "url", "accessedAt", "summary", "evidenceUse"
];

L.items.forEach(item => {
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
    if (typeof item.selectionReason !== "string" || item.selectionReason.trim().length < 20) {
      problems.push(`官方技术资料 ${item.id} 的入选理由少于 20 字`);
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
  if (classIds.has(item.sourceClass) && !subcategoriesByClass.get(item.sourceClass).has(item.sourceSubcategory)) {
    problems.push(`资料 ${item.id} 使用无效二级来源：${item.sourceClass}/${item.sourceSubcategory}`);
  }
  if (!authorityTiers.has(item.authorityTier)) problems.push(`资料 ${item.id} 的权威等级无效：${item.authorityTier}`);
  if (item.primarySource !== true && item.primarySource !== false) problems.push(`资料 ${item.id} 的 primarySource 必须是布尔值`);
  if (item.discoveryOnly !== true && item.discoveryOnly !== false) problems.push(`资料 ${item.id} 的 discoveryOnly 必须是布尔值`);
  if (!/^https:\/\//.test(item.url || "")) problems.push(`资料 ${item.id} 必须使用 HTTPS 原始地址`);
  if (seenUrls.has(item.url)) problems.push(`重复的资料网址：${item.url}`);
  seenUrls.add(item.url);
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
  if (!counts[id]) problems.push(`来源分类 ${id} 还没有任何种子资料`);
});
Object.entries(officialCounts).forEach(([id, count]) => {
  if (count < 10) problems.push(`官方技术资料二级分类 ${id} 只有 ${count} 篇，至少需要 10 篇`);
});

const subcategoryCount = L.sourceClasses.reduce((sum, source) => sum + source.subcategories.length, 0);
console.log(`专业资料库 ${L.items.length} 条 · 一级来源 ${L.sourceClasses.length} 类 · 二级来源 ${subcategoryCount} 个`);
console.log(`平台档案 ${Object.keys(profiles).length} 份`);
console.log(`介绍指南 ${Object.keys(profileGuidance).length} 类`);
console.log("来源分布：" + expectedClasses.map(id => `${id}=${counts[id]}`).join(" "));
console.log("官方技术资料分布：" + Object.entries(officialCounts).map(([id, count]) => `${id}=${count}`).join(" "));

if (problems.length) {
  console.error("\n✗ 发现 " + problems.length + " 个问题：");
  problems.forEach(problem => console.error("  - " + problem));
  process.exit(1);
}
console.log("\n✓ 专业资料库校验通过");
