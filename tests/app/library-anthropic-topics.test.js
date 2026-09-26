"use strict";

const assert = require("assert");
const path = require("path");
const { PROJECT_ROOT } = require("../../tools/shared/project-root");

global.window = {};
require(path.join(PROJECT_ROOT, "data", "library.js"));
for (let index = 1; index <= 4; index++) {
  require(path.join(PROJECT_ROOT, "data", `library-official-anthropic-importance-0${index}.js`));
}

const expected = {
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
const library = global.window.PRO_LIBRARY;
const items = library.items.filter(item => item.sourceClass === "official" && item.sourceSubcategory === "anthropic");
assert.deepStrictEqual(library.topicTaxonomies.anthropic, Object.keys(expected));
assert.strictEqual(items.length, 269);
Object.entries(expected).forEach(([id, count]) => {
  assert.strictEqual(items.filter(item => item.primaryCategory === id).length, count, id);
});
items.forEach(item => assert.deepStrictEqual(item.topicTags, [item.primaryCategory]));
console.log("✓ Anthropic 269 条资料已完整分入固定 10 类");
