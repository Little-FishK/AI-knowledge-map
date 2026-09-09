"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const {
  createContentI18n,
  resolveRecord,
  validateGraphNodeTranslation,
  validatePublishedRecord,
} = require("../../assets/app/content-i18n.js");

const sourceDomain = { label: "基础 / 共享", color: "#6b8cbe", emoji: "🧱" };
const graphRevision = { version: "0.18", updatedAt: "2026-07-30" };
const publishedPack = {
  source: { graph: graphRevision },
  collections: {
    "graph.domains": {
      foundations: { status: "published", fields: { label: "Foundations / Shared" } },
    },
  },
};

function resolve(overrides) {
  return resolveRecord(Object.assign({
    collection: "graph.domains",
    id: "foundations",
    source: sourceDomain,
    requiredFields: ["label"],
    locale: "en",
    sourceLocale: "zh-Hans",
    pack: publishedPack,
    sourceName: "graph",
    sourceRevision: graphRevision,
  }, overrides));
}

async function main() {
  const translated = resolve();
  assert.strictEqual(translated.record.label, "Foundations / Shared");
  assert.strictEqual(translated.record.color, sourceDomain.color);
  assert.strictEqual(translated.effectiveLocale, "en");
  assert.strictEqual(translated.fallbackUsed, false);
  assert.notStrictEqual(translated.record, sourceDomain);

  const source = resolve({ locale: "zh-Hans" });
  assert.strictEqual(source.record, sourceDomain);
  assert.strictEqual(source.fallbackUsed, false);
  assert.strictEqual(source.reason, "source");

  [
    resolve({ pack: null }),
    resolve({ id: "missing" }),
    resolve({ pack: { source: { graph: graphRevision }, collections: {
      "graph.domains": { foundations: { status: "draft", fields: { label: "Draft" } } },
    } } }),
    resolve({ pack: { source: { graph: graphRevision }, collections: {
      "graph.domains": { foundations: { status: "published", fields: {} } },
    } } }),
    resolve({ pack: { source: { graph: { version: "0.17", updatedAt: "2026-07-01" } }, collections: publishedPack.collections } }),
  ].forEach(result => {
    assert.strictEqual(result.record, sourceDomain);
    assert.strictEqual(result.effectiveLocale, "zh-Hans");
    assert.strictEqual(result.fallbackUsed, true);
  });

  assert.strictEqual(validatePublishedRecord(
    { status: "published", fields: { title: "Attention", aliases: ["Self-Attention"] } },
    { title: "注意力机制", aliases: ["Attention"] },
    ["title", "aliases"]
  ), true);
  assert.strictEqual(validatePublishedRecord(
    { status: "published", fields: { aliases: ["Cross-Entropy", "KL Divergence"] } },
    { aliases: ["Information Theory", "Entropy", "Cross-Entropy", "KL Divergence"] },
    ["aliases"]
  ), true);
  assert.strictEqual(validatePublishedRecord(
    { status: "published", fields: { title: "Attention", aliases: "Self-Attention" } },
    { title: "注意力机制", aliases: ["Attention"] },
    ["title", "aliases"]
  ), false);
  assert.strictEqual(validatePublishedRecord(
    { status: "published", fields: { cases: [{ title: "Only one", text: "Text" }] } },
    { cases: [{ title: "One", text: "Text" }, { title: "Two", text: "Text" }] },
    ["cases"]
  ), false);

  const linkedSource = { title: "源", aliases: [], summary: "[[attention]]", body: "[[transformer]]", cases: [], sources: [] };
  const linkedCandidate = { status: "published", fields: {
    title: "Source", aliases: [], summary: "[[attention|attention]]", body: "[[transformer]]", cases: [], sources: [],
  } };
  assert.strictEqual(validateGraphNodeTranslation(linkedCandidate, linkedSource, "en"), true);
  assert.strictEqual(validateGraphNodeTranslation({ ...linkedCandidate, fields: {
    ...linkedCandidate.fields, body: "No reference",
  } }, linkedSource, "en"), false);
  assert.strictEqual(validateGraphNodeTranslation({ ...linkedCandidate, fields: {
    ...linkedCandidate.fields, aliases: ["Source", "Source"],
  } }, linkedSource, "en"), false);

  const manifest = {
    sourceLocale: "zh-Hans",
    defaultLocale: "zh-Hans",
    locales: {
      "zh-Hans": { content: {} },
      en: { content: { graph: "en-graph.js" } },
    },
  };
  const registry = {};
  const calls = [];
  const runtime = createContentI18n({
    manifest,
    registry,
    getLocale: () => "en",
    loadAsset: async (locale, assetName, path) => {
      calls.push([locale, assetName, path]);
      registry.en = { graph: publishedPack };
    },
  });
  await Promise.all([runtime.ensureLocale("en"), runtime.ensureLocale("en")]);
  assert.deepStrictEqual(calls, [["en", "graph", "en-graph.js"]]);
  assert.strictEqual(runtime.resolveGraphDomain("foundations", sourceDomain, graphRevision).record.label,
    "Foundations / Shared");
  assert.strictEqual(runtime.resolveGraphDomain("building", { label: "应用搭建" }, graphRevision).fallbackUsed, true);
  assert.strictEqual(await runtime.ensureLocale("zh-Hans"), null);

  const uiOnly = createContentI18n({
    manifest: { ...manifest, locales: { ...manifest.locales, fr: { content: {} } } },
    registry: {},
  });
  assert.strictEqual(await uiOnly.ensureLocale("fr"), null);

  const failing = createContentI18n({
    manifest,
    registry: {},
    loadAsset: async () => { throw new Error("network failed"); },
  });
  await assert.rejects(failing.ensureLocale("en"), /network failed/);

  const sharedContext = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../../assets/app/shared.js"), "utf8"), sharedContext);
  const markdown = sharedContext.window.AIMap.shared.createMarkdownRenderer(
    { attention: { title: "注意力机制" } },
    key => key,
    () => ({ title: "Attention" })
  );
  assert.ok(markdown("Read [[attention]].").includes(">注意力机制</span>"));
  assert.ok(markdown("Read [[attention]] and [[attention|this concept]].", { localizeLinks: true }).includes(">Attention</span>"));
  assert.ok(markdown("Read [[attention]] and [[attention|this concept]].", { localizeLinks: true }).includes(">this concept</span>"));

  const productContext = { window: {} };
  vm.createContext(productContext);
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../../data/graph.js"), "utf8"), productContext);
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../../data/content-locales/en/graph.js"), "utf8"), productContext);
  const productGraph = productContext.window.GRAPH;
  const productRuntime = createContentI18n({
    manifest: {
      sourceLocale: "zh-Hans",
      defaultLocale: "zh-Hans",
      locales: { "zh-Hans": { content: {} }, en: { content: { graph: "graph.js" } } },
    },
    registry: productContext.window.AI_CONTENT_LOCALES,
    getLocale: () => "en",
  });
  const publishedNodeIds = [
    "llm", "transformer", "attention", "embedding", "context-window",
    "neural-network", "backprop", "vanishing-gradient", "batch-norm",
    "optimizer-schedule", "residual-connection", "cnn", "rnn", "tokenization",
    "positional-encoding", "normalization", "state-space-models",
    "self-supervised-learning", "contrastive-learning", "clip",
    "pretraining", "post-training", "fine-tuning", "peft-lora", "distillation",
    "distributed-training", "synthetic-data", "quantization", "moe",
    "model-merging", "scaling-law", "model-families",
    "lost-in-middle", "in-context-learning", "sampling-params", "logprobs",
    "system-prompt", "context-engineering", "constrained-decoding", "structured-output",
    "streaming", "prefilling", "prompt-caching", "context-compaction", "inference-optimization",
    "model-selection", "model-routing", "vector-db", "chunking", "reranking",
    "advanced-rag", "knowledge-graph", "citations", "evaluation", "observability",
    "deployment", "data-drift-monitoring", "uncertainty-calibration", "privacy", "guardrails",
    "self-consistency", "tree-of-thoughts", "reflection", "planning",
    "agent-loop", "react", "code-execution", "mcp-architecture",
    "agent-frameworks", "agent-memory", "agent-skills", "workflow-orchestration",
    "multi-agent", "human-in-the-loop", "computer-use", "coding-tools",
    "vae", "gan", "flow-matching", "controllable-generation", "image-editing",
    "super-resolution", "video-generation",
    "alignment", "training-data-governance",
    "retrieval", "rag", "prompt-engineering", "cot", "model-evaluation", "hallucination",
    "agent", "tool-calling", "mcp", "code-generation", "agent-identity-access",
    "multimodal", "diffusion", "image-generation", "prompt-injection",
    "reasoning-models", "test-time-compute",
    "supervised-learning", "information-theory", "loss-function",
    "gradient-descent", "unsupervised-learning", "reinforcement-learning",
    "overfitting", "regularization", "dimensionality-reduction",
    "curse-of-dimensionality", "decision-tree", "clustering", "kernel-methods",
    "speech", "voice-cloning", "audio-generation", "world-models", "content-detection",
    "interpretability", "jailbreak", "red-teaming", "data-poisoning", "adversarial-robustness",
    "bias-fairness", "reward-hacking", "rlhf", "constitutional-ai", "governance",
  ];
  const packNodeIds = Object.keys(
    productContext.window.AI_CONTENT_LOCALES.en.graph.collections["graph.nodes"]
  );
  const packNodes = productContext.window.AI_CONTENT_LOCALES.en.graph.collections["graph.nodes"];
  const productById = Object.fromEntries(productGraph.nodes.map(node => [node.id, node]));
  assert.strictEqual(
    JSON.stringify([...publishedNodeIds].sort()),
    JSON.stringify([...packNodeIds].sort()),
    "published English regression set should match the content pack"
  );
  productGraph.core.forEach(id => {
    assert.ok(publishedNodeIds.includes(id), `${id} should remain covered as a core node`);
  });
  productGraph.recommendedLearningPath[0].steps.forEach(([, id]) => {
    assert.ok(publishedNodeIds.includes(id), `${id} should cover the complete first learning phase`);
  });
  productGraph.recommendedLearningPath[1].steps.forEach(([, id]) => {
    assert.ok(publishedNodeIds.includes(id), `${id} should cover the complete architecture phase`);
  });
  productGraph.recommendedLearningPath[2].steps.forEach(([, id]) => {
    assert.ok(publishedNodeIds.includes(id), `${id} should cover the complete model-training phase`);
  });
  productGraph.recommendedLearningPath[3].steps.forEach(([, id]) => {
    assert.ok(publishedNodeIds.includes(id), `${id} should cover the complete context-and-inference phase`);
  });
  productGraph.recommendedLearningPath[4].steps.forEach(([, id]) => {
    assert.ok(publishedNodeIds.includes(id), `${id} should cover the complete retrieval-and-production phase`);
  });
  productGraph.recommendedLearningPath[5].steps.forEach(([, id]) => {
    assert.ok(publishedNodeIds.includes(id), `${id} should cover the complete reasoning-strategies phase`);
  });
  productGraph.recommendedLearningPath[6].steps.forEach(([, id]) => {
    assert.ok(publishedNodeIds.includes(id), `${id} should cover the complete agent-and-tooling phase`);
  });
  productGraph.recommendedLearningPath[7].steps.forEach(([, id]) => {
    assert.ok(publishedNodeIds.includes(id), `${id} should cover the complete generative-media phase`);
  });
  productGraph.recommendedLearningPath[8].steps.forEach(([, id]) => {
    assert.ok(publishedNodeIds.includes(id), `${id} should cover the complete safety-and-governance phase`);
  });
  publishedNodeIds.forEach(id => {
    const result = productRuntime.resolveGraphNode(id, productById[id], productGraph.meta);
    assert.strictEqual(result.fallbackUsed, false, `${id} should be published in English`);
    assert.strictEqual(result.effectiveLocale, "en");
  });
  assert.strictEqual(publishedNodeIds.length, productGraph.nodes.length,
    "every graph node should be published in English");

  const finalBatchIds = [
    "speech", "voice-cloning", "audio-generation", "world-models", "content-detection",
    "interpretability", "jailbreak", "red-teaming", "data-poisoning", "adversarial-robustness",
    "bias-fairness", "reward-hacking", "rlhf", "constitutional-ai", "governance",
  ];
  const wikiTargets = value => {
    const targets = [];
    String(value || "").replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, (_match, id) => {
      targets.push(id);
      return _match;
    });
    return targets.sort();
  };
  const recordLinks = record => wikiTargets([
    record.summary,
    record.body,
    ...(record.cases || []).flatMap(item => [item.title, item.text]),
  ].join("\n"));
  const tableShape = body => String(body || "").split("\n")
    .filter(line => line.trim().startsWith("|")).map(line => line.split("|").length);

  finalBatchIds.forEach(id => {
    const sourceNode = productById[id];
    const candidate = packNodes[id];
    assert.strictEqual(candidate.status, "published", `${id} must be published`);
    assert.ok(!/[\u3400-\u9fff]/u.test(JSON.stringify(candidate.fields)), `${id} must not contain Han text`);
    assert.strictEqual(candidate.fields.cases.length, sourceNode.cases.length, `${id} case count must match`);
    assert.strictEqual(candidate.fields.sources.length, sourceNode.sources.length, `${id} source count must match`);
    candidate.fields.sources.forEach((source, index) => {
      assert.strictEqual(source.type, sourceNode.sources[index].type, `${id} source type ${index} must match`);
      assert.strictEqual(source.ref, sourceNode.sources[index].ref, `${id} source ref ${index} must match`);
    });
    assert.deepStrictEqual(recordLinks(candidate.fields), recordLinks(sourceNode), `${id} internal links must match`);
    assert.deepStrictEqual(tableShape(candidate.fields.body), tableShape(sourceNode.body), `${id} table shape must match`);
    String(candidate.fields.body).split("\n").filter(line => line.trim().startsWith("|")).forEach(line => {
      assert.ok(!/\[\[[^\]]+\|[^\]]+\]\]/.test(line), `${id} table rows must not contain labeled wiki links`);
    });
  });

  console.log("content i18n tests passed");
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
