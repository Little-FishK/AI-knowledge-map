/* 视频双轨入库 v0.2 应用数据门禁 */
"use strict";

const fs = require("fs");
const path = require("path");
const {
  loadProject,
  SUPPLEMENT_TARGET
} = require("./video-ingest/application");

const root = process.env.VIDEO_APPLICATION_ROOT
  ? path.resolve(process.env.VIDEO_APPLICATION_ROOT)
  : path.join(__dirname, "..");
const problems = [];
let project;
try {
  project = loadProject(root);
} catch (error) {
  console.error("✗ 无法加载视频应用数据：\n  " + error.message);
  process.exit(1);
}

const generated = project.generatedTutorials;
if (!generated || generated.schemaVersion !== 1 || !generated.pages || typeof generated.pages !== "object") {
  problems.push("VIDEO_TUTORIAL_GENERATED 必须是 schemaVersion=1 且包含 pages");
} else {
  Object.entries(generated.pages).forEach(([softwareId, entry]) => {
    if (!["create-page", "append-resource"].includes(entry && entry.mode)) {
      problems.push(`生成教程 ${softwareId} 的 mode 非法`);
    }
    if (!Array.isArray(entry && entry.resources)) {
      problems.push(`生成教程 ${softwareId} 缺 resources`);
    }
    if (entry && entry.mode === "create-page" && (!entry.page || typeof entry.page !== "object")) {
      problems.push(`生成教程 ${softwareId} 缺 page`);
    }
  });
}

let queue;
try {
  queue = JSON.parse(fs.readFileSync(path.join(root, ...SUPPLEMENT_TARGET.split("/")), "utf8"));
} catch (error) {
  problems.push("无法读取概念补充队列：" + error.message);
  queue = { items: [] };
}
if (queue.schemaVersion !== 1 || !Array.isArray(queue.items)) {
  problems.push("概念补充队列必须是 schemaVersion=1 且包含 items");
}
const nodeIds = new Set((project.graph.nodes || []).map((node) => node.id));
const queueIds = new Set();
(queue.items || []).forEach((item, index) => {
  const label = `概念补充 #${index + 1}`;
  if (!item.id || queueIds.has(item.id)) problems.push(`${label} id 为空或重复`);
  queueIds.add(item.id);
  if (!["pending", "applied", "rejected"].includes(item.status)) problems.push(`${label} status 非法`);
  if (!["supplement", "merge"].includes(item.decision)) problems.push(`${label} decision 非法`);
  if (!item.term || !item.rationale) problems.push(`${label} 缺 term 或 rationale`);
  if (!nodeIds.has(item.targetNode)) problems.push(`${label} 指向不存在节点 ${item.targetNode}`);
  if (!/^sha256:[a-f0-9]{64}$/.test(item.proposalHash || "")) problems.push(`${label} proposalHash 非法`);
  if (!/^sha256:[a-f0-9]{64}$/.test(item.evidenceHash || "")) problems.push(`${label} evidenceHash 非法`);
  if (!Array.isArray(item.evidenceRefs) || !item.evidenceRefs.length) problems.push(`${label} 缺 evidenceRefs`);
  if (!item.approvedBy || !/^\d{4}-\d{2}-\d{2}$/.test(item.approvedAt || "")) {
    problems.push(`${label} 缺人工批准者或日期`);
  }
});

console.log(`视频应用数据 · 生成教程页 ${Object.keys(generated.pages || {}).length} · 概念补充任务 ${(queue.items || []).length}`);
if (problems.length) {
  console.error(`\n✗ 发现 ${problems.length} 个问题：`);
  problems.forEach((problem) => console.error("  - " + problem));
  process.exit(1);
}
console.log("✓ 视频 v0.2 应用数据校验通过");
