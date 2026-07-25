/* 专业资料库机械门禁：校验九类来源、证据字段和站内关联。 */
"use strict";

const path = require("path");
global.window = {};

try {
  require(path.join(__dirname, "..", "data", "graph.js"));
  require(path.join(__dirname, "..", "data", "software.js"));
  require(path.join(__dirname, "..", "data", "library.js"));
  require(path.join(__dirname, "..", "data", "library-platform-profiles.js"));
} catch (error) {
  console.error("✗ 专业资料库存在语法错误：\n  " + error.message);
  process.exit(1);
}

const L = global.window.PRO_LIBRARY;
const profiles = global.window.LIBRARY_PLATFORM_PROFILES || {};
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
});
const itemIds = new Set();
const counts = Object.fromEntries(expectedClasses.map(id => [id, 0]));
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
  if (classIds.has(item.sourceClass) && !subcategoriesByClass.get(item.sourceClass).has(item.sourceSubcategory)) {
    problems.push(`资料 ${item.id} 使用无效二级来源：${item.sourceClass}/${item.sourceSubcategory}`);
  }
  if (!authorityTiers.has(item.authorityTier)) problems.push(`资料 ${item.id} 的权威等级无效：${item.authorityTier}`);
  if (item.primarySource !== true && item.primarySource !== false) problems.push(`资料 ${item.id} 的 primarySource 必须是布尔值`);
  if (item.discoveryOnly !== true && item.discoveryOnly !== false) problems.push(`资料 ${item.id} 的 discoveryOnly 必须是布尔值`);
  if (!/^https:\/\//.test(item.url || "")) problems.push(`资料 ${item.id} 必须使用 HTTPS 原始地址`);
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

const subcategoryCount = L.sourceClasses.reduce((sum, source) => sum + source.subcategories.length, 0);
console.log(`专业资料库 ${L.items.length} 条 · 一级来源 ${L.sourceClasses.length} 类 · 二级来源 ${subcategoryCount} 个`);
console.log(`平台档案 ${Object.keys(profiles).length} 份`);
console.log("来源分布：" + expectedClasses.map(id => `${id}=${counts[id]}`).join(" "));

if (problems.length) {
  console.error("\n✗ 发现 " + problems.length + " 个问题：");
  problems.forEach(problem => console.error("  - " + problem));
  process.exit(1);
}
console.log("\n✓ 专业资料库校验通过");
