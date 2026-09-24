"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { PROJECT_ROOT } = require("../shared/project-root");
const { validateGraphNodeTranslation } = require("../../assets/app/content-i18n.js");

const SOURCE_LOCALE = "zh-Hans";
const INITIAL_TARGET_LOCALE = "en";

const UI_SOURCE_FILES = [
  "index.html",
  "assets/app.js",
  "assets/app/deepdive-view.js",
  "assets/app/graph-view.js",
  "assets/app/learning-view.js",
  "assets/app/library-view.js",
  "assets/app/runtime-loader.js",
  "assets/app/shared.js",
  "assets/app/software-view.js",
];

const DATA_SCRIPTS = [
  "data/graph.js",
  "data/software.js",
  "data/tutorials.js",
  "data/tutorials-codex-youtube.js",
  "data/tutorials-claude-code.js",
  "data/tutorials-video-generated.js",
  "data/library.js",
  "data/library-official-technical.js",
  "data/library-official-china.js",
  "data/library-platform-profiles.js",
  "data/library-source-meta.js",
  "data/library-new-sources.js",
  "data/library-arxiv.js",
  "data/library-neurips-proceedings.js",
  "data/library-pmlr.js",
  "data/library-openreview.js",
  "data/library-acl-anthology.js",
  "data/library-cvf-open-access.js",
  "data/library-ieee-xplore.js",
  "data/library-acm-digital-library.js",
];

function read(relativePath) {
  return fs.readFileSync(path.join(PROJECT_ROOT, relativePath), "utf8");
}

function countHanLines(text) {
  return text.split(/\r?\n/).filter(line => /[\u3400-\u9fff]/u.test(line)).length;
}

function listJavaScriptIds(relativeDirectory, excluded = new Set()) {
  return fs.readdirSync(path.join(PROJECT_ROOT, relativeDirectory))
    .filter(file => file.endsWith(".js") && !excluded.has(file))
    .map(file => file.slice(0, -3))
    .sort();
}

function loadData() {
  const context = { window: {} };
  vm.createContext(context);
  DATA_SCRIPTS.forEach(file => vm.runInContext(read(file), context, { filename: file }));
  return context.window;
}

function loadLocaleData() {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read("data/locales/manifest.js"), context, { filename: "data/locales/manifest.js" });
  const manifest = context.window.I18N_MANIFEST;
  vm.runInContext(read(manifest.terminology), context, { filename: manifest.terminology });
  Object.values(manifest.locales).forEach(entry => {
    vm.runInContext(read(entry.ui), context, { filename: entry.ui });
    Object.values(entry.content || {}).forEach(file => {
      vm.runInContext(read(file), context, { filename: file });
    });
  });
  return {
    manifest,
    packs: context.window.AI_LOCALES || {},
    contentPacks: context.window.AI_CONTENT_LOCALES || {},
    terminology: context.window.AI_TERMINOLOGY,
  };
}

function buildTerminologyInventory(graph, terminology, contentPacks) {
  const entries = terminology.createNodeEntries(graph);
  const sourceIds = new Set(graph.nodes.map(node => node.id));
  const entryIds = Object.keys(entries);
  const decisionIds = Object.keys(terminology.nodeTerms || {});
  const referenceIds = new Set(Object.keys(terminology.references || {}));
  const publishedNodes = contentPacks.en?.graph?.collections?.["graph.nodes"] || {};
  const issues = [];

  entryIds.filter(id => !sourceIds.has(id)).forEach(id => issues.push(`${id}:unknown-node`));
  decisionIds.filter(id => !sourceIds.has(id)).forEach(id => issues.push(`${id}:unknown-decision`));
  graph.nodes.filter(node => !entries[node.id]).forEach(node => issues.push(`${node.id}:missing-entry`));
  Object.values(entries).forEach(entry => {
    if (!entry.zhHans || entry.status === "approved" && !entry.displayTitle) issues.push(`${entry.id}:missing-title`);
    if (!Array.isArray(entry.canonicalTerms)) issues.push(`${entry.id}:invalid-canonical-terms`);
    else {
      if (entry.status === "approved" && !entry.canonicalTerms.length) issues.push(`${entry.id}:missing-canonical-term`);
      if (new Set(entry.canonicalTerms).size !== entry.canonicalTerms.length) issues.push(`${entry.id}:duplicate-canonical-term`);
      if (entry.canonicalTerms.some(term => typeof term !== "string" || !term.trim())) issues.push(`${entry.id}:invalid-canonical-term`);
    }
    if (new Set(entry.acceptedAliases).size !== entry.acceptedAliases.length) issues.push(`${entry.id}:duplicate-alias`);
    if (new Set(entry.avoid).size !== entry.avoid.length) issues.push(`${entry.id}:duplicate-avoid`);
    entry.references.filter(reference => !referenceIds.has(reference))
      .forEach(reference => issues.push(`${entry.id}:unknown-reference:${reference}`));
  });
  Object.entries(publishedNodes).forEach(([id, record]) => {
    if (record.status !== "published") return;
    if (entries[id]?.status !== "approved") issues.push(`${id}:published-without-approved-term`);
    if (entries[id]?.displayTitle !== record.fields?.title) issues.push(`${id}:display-title-mismatch`);
  });

  return {
    total: entryIds.length,
    approved: Object.values(entries).filter(entry => entry.status === "approved").length,
    reviewed: Object.values(entries).filter(entry => entry.status === "reviewed").length,
    draft: Object.values(entries).filter(entry => entry.status === "draft").length,
    standardsReviewed: Object.values(entries).filter(entry => entry.standardsReview === "reviewed").length,
    references: referenceIds.size,
    issues,
    valid: entryIds.length === graph.nodes.length && issues.length === 0,
  };
}

function messagePlaceholders(message) {
  return [...String(message).matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)]
    .map(match => match[1])
    .filter((name, index, names) => names.indexOf(name) === index)
    .sort();
}

function collectUsedMessageKeys() {
  const keys = new Set();
  UI_SOURCE_FILES.forEach(file => {
    const source = read(file);
    for (const match of source.matchAll(/data-i18n(?:-title|-aria-label|-placeholder)?="([a-z][A-Za-z0-9.-]+)"/g)) {
      keys.add(match[1]);
    }
    for (const match of source.matchAll(/(?<![A-Za-z0-9_$])(?:t|tr)\(\s*"([a-z][A-Za-z0-9.-]+)"/g)) {
      keys.add(match[1]);
    }
  });
  return [...keys].sort();
}

function sameFieldShape(source, translated) {
  if (Array.isArray(source)) {
    return Array.isArray(translated) && source.length === translated.length
      && source.every((value, index) => sameFieldShape(value, translated[index]));
  }
  if (source === null) return translated === null;
  if (typeof source === "object") {
    return Boolean(translated && typeof translated === "object" && !Array.isArray(translated)
      && Object.keys(source).every(key => Object.prototype.hasOwnProperty.call(translated, key)
        && sameFieldShape(source[key], translated[key])));
  }
  return typeof source === typeof translated;
}

function publishedComplete(collection, id, fields, source) {
  const record = collection && collection[id];
  return Boolean(record && record.status === "published" && record.fields
    && fields.every(field => Object.prototype.hasOwnProperty.call(record.fields, field)
      && (!source || field === "aliases"
        ? Array.isArray(record.fields[field]) && record.fields[field].every(value => typeof value === "string")
        : sameFieldShape(source[field], record.fields[field]))));
}

function graphContentInventory(locale, manifest, contentPacks, graph) {
  const source = locale === manifest.sourceLocale;
  if (source) {
    return {
      revisionMatches: true,
      valid: true,
      domains: { published: Object.keys(graph.domains || {}).length, total: Object.keys(graph.domains || {}).length },
      edgeTypes: { published: Object.keys(graph.edgeTypes || {}).length, total: Object.keys(graph.edgeTypes || {}).length },
      nodes: { published: graph.nodes.length, total: graph.nodes.length },
      coreNodes: { published: (graph.core || []).length, total: (graph.core || []).length },
      invalidIds: [],
      incompletePublished: [],
      semanticIssues: [],
    };
  }
  const pack = contentPacks[locale] && contentPacks[locale].graph;
  const revision = pack && pack.source && pack.source.graph;
  const revisionMatches = Boolean(revision
    && String(revision.version) === String(graph.meta.version)
    && String(revision.updatedAt) === String(graph.meta.updatedAt));
  const collections = pack && pack.collections || {};
  const domains = collections["graph.domains"] || {};
  const edgeTypes = collections["graph.edgeTypes"] || {};
  const nodes = collections["graph.nodes"] || {};
  const sourceNodeById = Object.fromEntries(graph.nodes.map(node => [node.id, node]));
  const invalidIds = [
    ...Object.keys(domains).filter(id => !graph.domains[id]).map(id => `graph.domains:${id}`),
    ...Object.keys(edgeTypes).filter(id => !graph.edgeTypes[id]).map(id => `graph.edgeTypes:${id}`),
    ...Object.keys(nodes).filter(id => !sourceNodeById[id]).map(id => `graph.nodes:${id}`),
  ];
  const nodeFields = node => ["title", "aliases", "summary", "body", "cases", "activity", "sources"]
    .filter(field => Object.prototype.hasOwnProperty.call(node, field));
  const incompletePublished = [
    ...Object.keys(domains).filter(id => domains[id].status === "published"
      && !publishedComplete(domains, id, ["label"], graph.domains[id])).map(id => `graph.domains:${id}`),
    ...Object.keys(edgeTypes).filter(id => edgeTypes[id].status === "published"
      && !publishedComplete(edgeTypes, id, ["label"], graph.edgeTypes[id])).map(id => `graph.edgeTypes:${id}`),
    ...Object.keys(nodes).filter(id => sourceNodeById[id] && nodes[id].status === "published"
      && !publishedComplete(nodes, id, nodeFields(sourceNodeById[id]), sourceNodeById[id])).map(id => `graph.nodes:${id}`),
  ];
  const semanticIssues = [
    ...Object.keys(domains).filter(id => domains[id].status === "published"
      && publishedComplete(domains, id, ["label"], graph.domains[id])
      && /[\u3400-\u9fff]/u.test(domains[id].fields.label)).map(id => `graph.domains:${id}:contains-han`),
    ...Object.keys(edgeTypes).filter(id => edgeTypes[id].status === "published"
      && publishedComplete(edgeTypes, id, ["label"], graph.edgeTypes[id])
      && /[\u3400-\u9fff]/u.test(edgeTypes[id].fields.label)).map(id => `graph.edgeTypes:${id}:contains-han`),
    ...Object.keys(nodes).filter(id => sourceNodeById[id] && nodes[id].status === "published"
      && publishedComplete(nodes, id, nodeFields(sourceNodeById[id]), sourceNodeById[id])
      && !validateGraphNodeTranslation(nodes[id], sourceNodeById[id], locale))
      .map(id => `graph.nodes:${id}:semantic-structure`),
  ];
  return {
    revisionMatches,
    valid: Boolean(pack) && revisionMatches && invalidIds.length === 0
      && incompletePublished.length === 0 && semanticIssues.length === 0,
    domains: {
      published: Object.keys(graph.domains).filter(id => publishedComplete(domains, id, ["label"], graph.domains[id])).length,
      total: Object.keys(graph.domains).length,
    },
    edgeTypes: {
      published: Object.keys(graph.edgeTypes).filter(id => publishedComplete(edgeTypes, id, ["label"], graph.edgeTypes[id])).length,
      total: Object.keys(graph.edgeTypes).length,
    },
    nodes: {
      published: graph.nodes.filter(node => publishedComplete(nodes, node.id, nodeFields(node), node)).length,
      total: graph.nodes.length,
    },
    coreNodes: {
      published: (graph.core || []).filter(id => sourceNodeById[id]
        && publishedComplete(nodes, id, nodeFields(sourceNodeById[id]), sourceNodeById[id])).length,
      total: (graph.core || []).length,
    },
    invalidIds,
    incompletePublished,
    semanticIssues,
  };
}

function buildLocaleInventory(graph) {
  const { manifest, packs, contentPacks, terminology } = loadLocaleData();
  const sourceMessages = packs[manifest.sourceLocale]?.messages || {};
  const sourceKeys = Object.keys(sourceMessages).sort();
  const usedKeys = collectUsedMessageKeys();
  // A literal ending in "." can never be a message key: it is a dynamic-key prefix
  // such as t("library.health." + health). It counts as resolved only when at least
  // one defined key extends it, so a mistyped prefix still fails this gate.
  const missingUsedKeys = usedKeys.filter(key => !Object.prototype.hasOwnProperty.call(sourceMessages, key)
    && !(key.endsWith(".") && sourceKeys.some(candidate => candidate.startsWith(key))));
  const locales = Object.keys(manifest.locales).map(locale => {
    const messages = packs[locale]?.messages || {};
    const keys = Object.keys(messages).sort();
    const missingKeys = sourceKeys.filter(key => !Object.prototype.hasOwnProperty.call(messages, key));
    const extraKeys = keys.filter(key => !Object.prototype.hasOwnProperty.call(sourceMessages, key));
    const placeholderMismatches = sourceKeys.filter(key => {
      if (typeof messages[key] !== "string") return false;
      return JSON.stringify(messagePlaceholders(sourceMessages[key])) !== JSON.stringify(messagePlaceholders(messages[key]));
    });
    return {
      locale,
      selectable: manifest.locales[locale].selectable === true,
      status: manifest.locales[locale].status || "unspecified",
      messageKeys: keys.length,
      keyParity: missingKeys.length === 0 && extraKeys.length === 0,
      placeholderParity: placeholderMismatches.length === 0,
      missingKeys,
      extraKeys,
      placeholderMismatches,
      content: graphContentInventory(locale, manifest, contentPacks, graph),
    };
  });
  const terminologyInventory = buildTerminologyInventory(graph, terminology, contentPacks);
  return {
    registeredLocales: locales.length,
    sourceMessageKeys: sourceKeys.length,
    parity: missingUsedKeys.length === 0 && locales.every(locale =>
      locale.keyParity && locale.placeholderParity && locale.content.valid) && terminologyInventory.valid,
    usage: {
      detectedKeys: usedKeys.length,
      missingKeys: missingUsedKeys,
    },
    locales,
    terminology: terminologyInventory,
  };
}

function buildInventory() {
  const data = loadData();
  const graph = data.GRAPH;
  const localeInventory = buildLocaleInventory(graph);
  const software = data.SOFTWARE;
  const tutorials = data.TUTORIALS;
  const library = data.PRO_LIBRARY;
  const tutorialPages = Object.values(tutorials.items || {});
  const deepDiveSources = listJavaScriptIds("data/deepdive");
  const deepDiveRuntime = listJavaScriptIds("data/deepdive-runtime", new Set(["manifest.js"]));
  const sourceOnly = deepDiveSources.filter(id => !deepDiveRuntime.includes(id));
  const runtimeOnly = deepDiveRuntime.filter(id => !deepDiveSources.includes(id));

  const uiFiles = UI_SOURCE_FILES.map(file => ({
    file,
    hanBearingLines: countHanLines(read(file)),
  }));

  return {
    schemaVersion: 1,
    sourceLocale: SOURCE_LOCALE,
    initialTargetLocale: INITIAL_TARGET_LOCALE,
    locales: localeInventory,
    ui: {
      sourceFiles: uiFiles,
      sourceFileCount: uiFiles.length,
      hanBearingLineCount: uiFiles.reduce((total, entry) => total + entry.hanBearingLines, 0),
      note: "Han-bearing lines include comments and are an inventory signal, not a translation-unit count.",
    },
    graph: {
      domains: Object.keys(graph.domains || {}).length,
      edgeTypes: Object.keys(graph.edgeTypes || {}).length,
      nodes: graph.nodes.length,
      edges: graph.edges.length,
      coreNodes: (graph.core || []).length,
      learningPhases: (graph.recommendedLearningPath || []).length,
    },
    software: {
      categories: software.categories.length,
      items: software.items.length,
    },
    tutorials: {
      platforms: tutorials.platforms.length,
      pages: tutorialPages.length,
      resources: tutorialPages.reduce((total, page) => total + (page.resources || []).length, 0),
    },
    library: {
      sourceClasses: library.sourceClasses.length,
      subcategories: library.sourceClasses.reduce((total, item) => total + (item.subcategories || []).length, 0),
      items: library.items.length,
      platformProfiles: Object.keys(data.LIBRARY_PLATFORM_PROFILES || {}).length,
      profileGuides: Object.keys(data.LIBRARY_PROFILE_GUIDANCE || {}).length,
    },
    deepDive: {
      sourcePages: deepDiveSources.length,
      generatedRuntimePages: deepDiveRuntime.length,
      sourceRuntimeParity: sourceOnly.length === 0 && runtimeOnly.length === 0,
      sourceOnly,
      runtimeOnly,
      translationSource: "data/deepdive/*.js",
      generatedOutput: "data/deepdive-runtime/*.js",
    },
  };
}

function printHumanReadable(inventory) {
  console.log(`国际化源清单 · ${inventory.sourceLocale} → ${inventory.initialTargetLocale}`);
  console.log(`语言包：${inventory.locales.registeredLocales} 种 · 源键 ${inventory.locales.sourceMessageKeys} 个 · 一致=${inventory.locales.parity}`);
  console.log(`术语表：${inventory.locales.terminology.total} 条 · 已批准 ${inventory.locales.terminology.approved} · 待审 ${inventory.locales.terminology.draft} · 标准复核 ${inventory.locales.terminology.standardsReviewed} · 有效=${inventory.locales.terminology.valid}`);
  console.log(`界面消息引用：检测到 ${inventory.locales.usage.detectedKeys} 个 · 缺失=${inventory.locales.usage.missingKeys.length}`);
  inventory.locales.locales.forEach(locale => {
    console.log(`  ${locale.locale}: ${locale.messageKeys} 键 · selectable=${locale.selectable} · status=${locale.status}`);
    console.log(`    图谱内容：大区 ${locale.content.domains.published}/${locale.content.domains.total} · 关系 ${locale.content.edgeTypes.published}/${locale.content.edgeTypes.total} · 节点 ${locale.content.nodes.published}/${locale.content.nodes.total} · 核心 ${locale.content.coreNodes.published}/${locale.content.coreNodes.total} · 有效=${locale.content.valid}`);
  });
  console.log(`界面源：${inventory.ui.sourceFileCount} 个文件 · ${inventory.ui.hanBearingLineCount} 行含中文字符`);
  inventory.ui.sourceFiles.forEach(entry => console.log(`  ${entry.file}: ${entry.hanBearingLines}`));
  console.log(`图谱：${inventory.graph.nodes} 节点 · ${inventory.graph.edges} 边 · ${inventory.graph.domains} 大区 · ${inventory.graph.edgeTypes} 关系类型`);
  console.log(`软件：${inventory.software.items} 条 · ${inventory.software.categories} 门类`);
  console.log(`教程：${inventory.tutorials.pages} 页 · ${inventory.tutorials.resources} 条资源 · ${inventory.tutorials.platforms} 个平台`);
  console.log(`资料库：${inventory.library.items} 条资料 · ${inventory.library.sourceClasses} 个一级来源 · ${inventory.library.subcategories} 个二级来源 · ${inventory.library.platformProfiles} 份档案`);
  console.log(`原理页：${inventory.deepDive.sourcePages} 个翻译源 · ${inventory.deepDive.generatedRuntimePages} 个生成运行时 · 一致=${inventory.deepDive.sourceRuntimeParity}`);
  if (!inventory.deepDive.sourceRuntimeParity) {
    console.error(`原理页源与运行时不一致：sourceOnly=${inventory.deepDive.sourceOnly.join(",")} runtimeOnly=${inventory.deepDive.runtimeOnly.join(",")}`);
    process.exitCode = 1;
  }
  if (!inventory.locales.parity) {
    if (inventory.locales.terminology.issues.length) {
      console.error(`术语表问题：${inventory.locales.terminology.issues.join(",")}`);
    }
    if (inventory.locales.usage.missingKeys.length) {
      console.error(`界面引用了未定义消息键：${inventory.locales.usage.missingKeys.join(",")}`);
    }
    inventory.locales.locales.filter(locale => !locale.keyParity || !locale.placeholderParity).forEach(locale => {
      console.error(`语言包不一致 ${locale.locale}: missing=${locale.missingKeys.join(",")} extra=${locale.extraKeys.join(",")} placeholders=${locale.placeholderMismatches.join(",")}`);
    });
    inventory.locales.locales.filter(locale => !locale.content.valid).forEach(locale => {
      console.error(`内容语言包无效 ${locale.locale}: revision=${locale.content.revisionMatches} invalid=${locale.content.invalidIds.join(",")} incomplete=${locale.content.incompletePublished.join(",")} semantic=${locale.content.semanticIssues.join(",")}`);
    });
    process.exitCode = 1;
  }
}

const inventory = buildInventory();
if (process.argv.includes("--json")) console.log(JSON.stringify(inventory, null, 2));
else printHumanReadable(inventory);
