/* 专业资料库机械门禁：校验九类来源、证据字段和站内关联。 */
"use strict";

const path = require("path");
global.window = {};

try {
  require(path.join(__dirname, "..", "data", "graph.js"));
  require(path.join(__dirname, "..", "data", "software.js"));
  require(path.join(__dirname, "..", "data", "library.js"));
} catch (error) {
  console.error("✗ 专业资料库存在语法错误：\n  " + error.message);
  process.exit(1);
}

const L = global.window.PRO_LIBRARY;
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
const itemIds = new Set();
const counts = Object.fromEntries(expectedClasses.map(id => [id, 0]));
const requiredStrings = [
  "id", "sourceClass", "title", "publisher", "collection", "contentKind",
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

console.log(`专业资料库 ${L.items.length} 条 · 来源分类 ${L.sourceClasses.length} 类`);
console.log("来源分布：" + expectedClasses.map(id => `${id}=${counts[id]}`).join(" "));

if (problems.length) {
  console.error("\n✗ 发现 " + problems.length + " 个问题：");
  problems.forEach(problem => console.error("  - " + problem));
  process.exit(1);
}
console.log("\n✓ 专业资料库校验通过");
