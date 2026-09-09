"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "../..");

function run(relativePath, context) {
  vm.runInContext(fs.readFileSync(path.join(root, relativePath), "utf8"), context, {
    filename: relativePath,
  });
}

function main() {
  const context = vm.createContext({ window: {} });
  run("data/graph.js", context);
  run("data/content-locales/en/graph.js", context);
  run("data/locales/terminology.js", context);

  const graph = context.window.GRAPH;
  const glossary = context.window.AI_TERMINOLOGY;
  const entries = glossary.createNodeEntries(graph);
  const sourceIds = graph.nodes.map(node => node.id).sort();
  const entryIds = Object.keys(entries).sort();
  const decisionIds = Object.keys(glossary.nodeTerms);
  const sourceIdSet = new Set(sourceIds);
  const validReferences = new Set(Object.keys(glossary.references));
  const publishedNodes = context.window.AI_CONTENT_LOCALES.en.graph.collections["graph.nodes"];

  assert.strictEqual(glossary.schemaVersion, 2);
  assert.strictEqual(glossary.sourceLocale, "zh-Hans");
  assert.strictEqual(glossary.targetLocale, "en");
  assert.strictEqual(
    JSON.stringify(entryIds),
    JSON.stringify(sourceIds),
    "terminology inventory must cover every graph node"
  );
  assert.deepStrictEqual(
    decisionIds.filter(id => !sourceIdSet.has(id)),
    [],
    "terminology decisions must use real graph node IDs"
  );

  const approved = Object.values(entries).filter(entry => entry.status === "approved");
  const draft = Object.values(entries).filter(entry => entry.status === "draft");
  const standardsReviewed = Object.values(entries).filter(entry => entry.standardsReview === "reviewed");
  assert.strictEqual(approved.length, 130);
  assert.strictEqual(draft.length, 0);
  assert.strictEqual(standardsReviewed.length, 113);

  graph.nodes.forEach(node => {
    const entry = entries[node.id];
    assert.strictEqual(entry.zhHans, node.title, `${node.id} must inherit the authoritative Chinese name`);
    assert.ok(["draft", "reviewed", "approved"].includes(entry.status), `${node.id} has an invalid status`);
    assert.ok(["pending", "reviewed"].includes(entry.standardsReview), `${node.id} has an invalid standards-review status`);
    assert.strictEqual(new Set(entry.acceptedAliases).size, entry.acceptedAliases.length,
      `${node.id} contains duplicate accepted aliases`);
    assert.strictEqual(new Set(entry.avoid).size, entry.avoid.length,
      `${node.id} contains duplicate avoided forms`);
    assert.ok(Array.isArray(entry.canonicalTerms), `${node.id} canonical terms must be an array`);
    assert.strictEqual(new Set(entry.canonicalTerms).size, entry.canonicalTerms.length,
      `${node.id} contains duplicate canonical terms`);
    entry.canonicalTerms.forEach(term => {
      assert.ok(typeof term === "string" && term.trim(), `${node.id} contains an invalid canonical term`);
    });
    entry.references.forEach(reference => {
      assert.ok(validReferences.has(reference), `${node.id} uses unknown reference ${reference}`);
    });
    if (entry.standardsReview === "reviewed") {
      assert.ok(entry.references.some(reference => reference !== "project-published"),
        `${node.id} external review requires an external reference`);
    }
    if (entry.status === "approved") {
      assert.ok(entry.displayTitle.trim(), `${node.id} approved entry requires an English display title`);
      assert.ok(entry.canonicalTerms.length, `${node.id} approved entry requires at least one canonical term`);
      assert.ok(!entry.avoid.includes(entry.displayTitle), `${node.id} display title cannot be an avoided form`);
    } else {
      assert.strictEqual(entry.displayTitle, "", `${node.id} draft entry must not expose an unapproved English title`);
      assert.strictEqual(entry.canonicalTerms.length, 0, `${node.id} draft entry must not expose unapproved canonical terms`);
    }
  });

  Object.entries(publishedNodes).forEach(([id, record]) => {
    if (record.status !== "published") return;
    assert.strictEqual(entries[id].status, "approved", `${id} must be approved before content publication`);
    assert.strictEqual(record.fields.title, entries[id].displayTitle,
      `${id} published title must match the approved display title`);
    assert.strictEqual(new Set(record.fields.aliases).size, record.fields.aliases.length,
      `${id} published content contains duplicate English aliases`);
    entries[id].avoid.forEach(avoided => {
      assert.ok(!record.fields.aliases.includes(avoided), `${id} published aliases use avoided form ${avoided}`);
    });
  });

  assert.ok(glossary.nodeTerms.agent.avoid.includes("Intelligent Agent"));
  assert.ok(glossary.nodeTerms.agent.note.includes("RL agent"));
  assert.ok(glossary.nodeTerms.alignment.avoid.includes("Alignment Training"));
  assert.deepStrictEqual([...glossary.nodeTerms.agent.canonicalTerms], ["Agent"]);
  assert.deepStrictEqual([...glossary.nodeTerms["tool-calling"].canonicalTerms], ["Tool Calling"]);
  assert.deepStrictEqual([...glossary.nodeTerms["decision-tree"].canonicalTerms], ["Decision Tree", "Ensemble Method"]);
  assert.strictEqual(glossary.nodeTerms.pretraining.displayTitle, "Pre-training");
  assert.strictEqual(glossary.nodeTerms["tool-calling"].displayTitle, "Tool Calling");
  assert.strictEqual(glossary.nodeTerms.multimodal.displayTitle, "Multimodal Models");
  assert.ok(!glossary.nodeTerms.cot.avoid.includes("Chain-of-Thought"));
  assert.ok(glossary.nodeTerms["batch-norm"].avoid.includes("LayerNorm"));
  assert.deepStrictEqual([...glossary.nodeTerms["vanishing-gradient"].canonicalTerms],
    ["Vanishing Gradient Problem", "Exploding Gradient Problem"]);
  assert.deepStrictEqual([...glossary.nodeTerms.tokenization.canonicalTerms], ["Token", "Tokenization"]);
  assert.ok(glossary.nodeTerms.normalization.avoid.includes("BatchNorm"));
  assert.ok(glossary.nodeTerms["contrastive-learning"].avoid.includes("Contrastive Loss"));
  assert.ok(glossary.nodeTerms.clip.avoid.includes("Contrastive Learning"));
  assert.ok(glossary.nodeTerms["peft-lora"].note.includes("methods within the PEFT family"));
  assert.deepStrictEqual([...glossary.nodeTerms.distillation.canonicalTerms], ["Knowledge Distillation"]);

  console.log(`terminology tests passed · ${approved.length} approved · ${draft.length} draft · ${standardsReviewed.length} externally reviewed`);
}

main();
