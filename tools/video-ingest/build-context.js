"use strict";

const path = require("path");
const {
  parseArgs,
  readJson,
  writeJson,
  loadProjectData,
  normalizeText,
  evidenceText,
  validateEvidence,
  sha256
} = require("./core");

function occurrenceCount(haystack, rawNeedle) {
  const needle = normalizeText(rawNeedle);
  if (!needle || needle.length < 2) return 0;
  if (/^[a-z0-9+.#/_ -]+$/i.test(needle)) {
    const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
    const matches = haystack.match(new RegExp(`(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`, "gi"));
    return matches ? matches.length : 0;
  }
  let count = 0;
  let position = 0;
  while ((position = haystack.indexOf(needle, position)) !== -1) {
    count++;
    position += needle.length;
  }
  return count;
}

function nodeTerms(node) {
  const values = [node.id, node.title, ...(node.aliases || [])];
  const titleParts = String(node.title || "").split(/[·/（）()]/).map(item => item.trim()).filter(Boolean);
  return [...new Set([...values, ...titleParts].filter(value => String(value).trim().length >= 2))];
}

function buildContext(evidence, options = {}) {
  const evidenceErrors = validateEvidence(evidence);
  if (evidenceErrors.length) throw new Error("证据无效：\n- " + evidenceErrors.join("\n- "));
  const data = loadProjectData();
  const text = evidenceText(evidence);
  const limit = Math.max(5, Math.min(40, Number(options.limit || 20)));

  const edgeMap = new Map();
  (data.graph.edges || []).forEach(edge => {
    if (!edgeMap.has(edge.from)) edgeMap.set(edge.from, []);
    if (!edgeMap.has(edge.to)) edgeMap.set(edge.to, []);
    edgeMap.get(edge.from).push({ direction: "out", node: edge.to, type: edge.type });
    edgeMap.get(edge.to).push({ direction: "in", node: edge.from, type: edge.type });
  });

  const matches = data.graph.nodes.map(node => {
    const termMatches = nodeTerms(node)
      .map(term => ({ term, count: occurrenceCount(text, term) }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count);
    const total = termMatches.reduce((sum, item) => sum + item.count, 0);
    const score = total * 10 + Number(node.heat || 0);
    return { node, termMatches, total, score };
  }).filter(item => item.total > 0)
    .sort((a, b) => b.score - a.score || a.node.id.localeCompare(b.node.id))
    .slice(0, limit);

  const nodeById = new Map(data.graph.nodes.map(node => [node.id, node]));
  const relevantNodes = matches.map(item => ({
    id: item.node.id,
    title: item.node.title,
    aliases: item.node.aliases || [],
    domain: item.node.domain,
    maturity: item.node.maturity || "stable",
    summary: item.node.summary,
    isCore: (data.graph.core || []).includes(item.node.id),
    matchedTerms: item.termMatches,
    relations: (edgeMap.get(item.node.id) || []).slice(0, 12).map(relation => ({
      ...relation,
      title: nodeById.get(relation.node) ? nodeById.get(relation.node).title : relation.node
    }))
  }));

  const softwareMatches = (data.software.items || []).map(item => {
    const terms = [item.name, item.id].filter(Boolean);
    const counts = terms.map(term => ({ term, count: occurrenceCount(text, term) })).filter(entry => entry.count);
    return { item, counts, total: counts.reduce((sum, entry) => sum + entry.count, 0) };
  }).filter(item => item.total > 0).sort((a, b) => b.total - a.total);

  let selectedSoftware = null;
  if (options.softwareId) {
    selectedSoftware = (data.software.items || []).find(item => item.id === options.softwareId);
    if (!selectedSoftware) throw new Error(`软件目录中不存在 ${options.softwareId}`);
  } else if (softwareMatches.length) selectedSoftware = softwareMatches[0].item;

  const existingTutorial = selectedSoftware && data.tutorials.items
    ? data.tutorials.items[selectedSoftware.id]
    : null;
  const existingUrls = [];
  Object.entries((data.tutorials && data.tutorials.items) || {}).forEach(([softwareId, tutorial]) => {
    (tutorial.resources || []).forEach(resource => {
      if (resource.url === evidence.source.url) existingUrls.push({ softwareId, resourceId: resource.id });
    });
  });

  const context = {
    schemaVersion: 1,
    evidenceHash: evidence.contentHash,
    generatedAt: new Date().toISOString(),
    limits: {
      relevantNodeLimit: limit,
      relationLimitPerNode: 12,
      includesFullNodeBodies: false,
      note: "上下文只包含标题、别名、摘要和局部关系；AI 不得据此假定未提供的正文内容。"
    },
    source: {
      url: evidence.source.url,
      title: evidence.source.title,
      creator: evidence.source.creator || null,
      durationSeconds: evidence.source.durationSeconds || null,
      transcriptSegments: evidence.transcript.length,
      frames: evidence.frames.length,
      acquisitionLimitations: evidence.acquisition.limitations || []
    },
    tutorialContext: {
      selectedSoftware: selectedSoftware ? {
        id: selectedSoftware.id,
        name: selectedSoftware.name,
        category: selectedSoftware.cat,
        concept: selectedSoftware.concept || null,
        summary: selectedSoftware.summary
      } : null,
      detectedSoftware: softwareMatches.slice(0, 8).map(match => ({
        id: match.item.id,
        name: match.item.name,
        occurrences: match.total,
        matchedTerms: match.counts
      })),
      existingTutorial: existingTutorial ? {
        title: existingTutorial.title,
        resourceCount: (existingTutorial.resources || []).length,
        resourceSummaries: (existingTutorial.resources || []).map(resource => ({
          id: resource.id,
          platform: resource.platform,
          title: resource.title,
          url: resource.url,
          audience: resource.audience
        }))
      } : null,
      duplicateUrlMatches: existingUrls
    },
    conceptContext: {
      totalExistingNodes: data.graph.nodes.length,
      relevantNodes,
      allowedEdgeTypes: Array.isArray(data.graph.edgeTypes)
        ? data.graph.edgeTypes.map(item => item.id)
        : Object.keys(data.graph.edgeTypes || {}),
      nodeExclusions: [
        "产品、厂商或具体模型名",
        "API 对象、命令、按钮、配置和实现细节",
        "评价指标和参数细项",
        "通用软件工程常识",
        "职业、流程和学习资源",
        "与已有节点语义重复的别名"
      ]
    }
  };
  context.contextHash = sha256(context);
  return context;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.evidence || !args.output) {
    console.error("用法：node tools/video-ingest/build-context.js --evidence <evidence.json> --output <context.json> [--software codex] [--limit 20]");
    process.exit(2);
  }
  const evidenceFile = path.resolve(args.evidence);
  const outputFile = path.resolve(args.output);
  const context = buildContext(readJson(evidenceFile), {
    softwareId: args.software || null,
    limit: args.limit || 20
  });
  writeJson(outputFile, context);
  console.log(`✓ 受限上下文已生成：${outputFile}`);
  console.log(`  相关节点 ${context.conceptContext.relevantNodes.length} · 软件候选 ${context.tutorialContext.detectedSoftware.length}`);
}

if (require.main === module) main();

module.exports = { buildContext, occurrenceCount, nodeTerms };
