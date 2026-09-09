"use strict";

// Read-only product inventory. Stage 2 bodies, translations, state and audit
// evidence are deliberately outside this tool; inspect them through MCP only.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const { PROJECT_ROOT } = require("../shared/project-root");

const DATA_FILES = Object.freeze([
  "data/graph.js", "data/software.js", "data/tutorials.js",
  "data/tutorials-codex-youtube.js", "data/tutorials-claude-code.js",
  "data/tutorials-video-generated.js", "data/library.js",
  "data/library-official-technical.js", "data/library-platform-profiles.js",
  "data/locales/manifest.js", "data/locales/zh-Hans/ui.js",
  "data/locales/en/ui.js", "data/content-locales/en/graph.js",
]);

function summarize(data) {
  const graph = data.GRAPH;
  if (!Array.isArray(graph?.nodes) || !Array.isArray(graph?.edges)) {
    throw new Error("Graph inventory requires nodes and edges; missing data is not zero coverage.");
  }
  const english = data.AI_CONTENT_LOCALES?.en?.graph;
  const records = english?.collections?.["graph.nodes"];
  const published = records ? graph.nodes.filter(node => records[node.id]?.status === "published").length : null;
  const revisionMatches = english ? english.source?.graph?.version === graph.meta?.version
    && english.source?.graph?.updatedAt === graph.meta?.updatedAt : null;
  const phases = graph.recommendedLearningPath || [];
  const names = new Map(graph.nodes.map(node => [node.id, node.title]));
  const tutorialPages = data.TUTORIALS?.items ? Object.values(data.TUTORIALS.items) : null;
  return {
    graph: {
      nodes: graph.nodes.length, edges: graph.edges.length,
      domains: Object.keys(graph.domains || {}).length,
      edgeTypes: Object.keys(graph.edgeTypes || {}).length,
      coreNodes: (graph.core || []).length, learningPhases: phases.length,
      learningOrder: phases.flatMap(phase => phase.steps.map(([order, id]) => ({ order, id, title: names.get(id) || null, phase: phase.phase }))),
    },
    software: { items: data.SOFTWARE?.items?.length ?? null, categories: data.SOFTWARE?.categories?.length ?? null },
    tutorials: { pages: tutorialPages?.length ?? null, resources: tutorialPages ? tutorialPages.reduce((sum, page) => sum + (page.resources || []).length, 0) : null },
    library: {
      items: data.PRO_LIBRARY?.items?.length ?? null,
      sourceClasses: data.PRO_LIBRARY?.sourceClasses?.length ?? null,
      subcategories: data.PRO_LIBRARY?.sourceClasses ? data.PRO_LIBRARY.sourceClasses.reduce((sum, group) => sum + (group.subcategories || []).length, 0) : null,
      platformProfiles: data.LIBRARY_PLATFORM_PROFILES ? Object.keys(data.LIBRARY_PLATFORM_PROFILES).length : null,
    },
    languages: {
      configured: Object.keys(data.I18N_MANIFEST?.locales || {}),
      englishGraphRecordsMarkedPublished: published,
      englishGraphSourceRevisionMatches: revisionMatches,
      note: "Published record flags are inventory, not semantic or teaching-quality validation. Understanding-page translation coverage is not inspected.",
    },
  };
}

function collect(root = PROJECT_ROOT) {
  const hashes = {};
  const read = relative => {
    const text = fs.readFileSync(path.join(root, relative), "utf8");
    hashes[relative] = crypto.createHash("sha256").update(text).digest("hex");
    return text;
  };
  const context = vm.createContext({ window: {} });
  for (const file of DATA_FILES) vm.runInContext(read(file), context, { filename: file, timeout: 2000 });
  const html = read("index.html");
  const router = read("assets/router.js");
  const learning = read("assets/app/learning-view.js");
  return {
    schemaVersion: 1,
    scope: "Local product inventory only; no network, writes, Stage 2 access, or audit conclusions.",
    ...summarize(context.window),
    entrypointSignals: {
      scope: "Signals in index.html and the named application files only; not a full HTML parser, website crawl or SEO verdict.",
      hashConceptRoute: router.includes("#/concept/"),
      descriptionMention: /<meta\b[^>]*\bname\s*=\s*["']description["']/i.test(html),
      canonicalMention: /<link\b[^>]*\brel\s*=\s*["']canonical["']/i.test(html),
      structuredDataMention: /application\/ld\+json/i.test(html),
      hreflangMention: /\bhreflang\s*=/i.test(html),
      localProgressStorage: learning.includes("localStorage"),
      robotsFileAtProjectRoot: fs.existsSync(path.join(root, "robots.txt")),
      sitemapFileAtProjectRoot: fs.existsSync(path.join(root, "sitemap.xml")),
    },
    unknown: ["liveDeployment", "searchIndexing", "traffic", "learningEffectiveness", "contentAccuracy", "understandingPageTranslationCoverage", "crossDeviceSyncVerification"],
    sourceHashes: hashes,
  };
}

if (require.main === module) process.stdout.write(JSON.stringify(collect(), null, 2) + "\n");
module.exports = { collect, summarize, DATA_FILES };
