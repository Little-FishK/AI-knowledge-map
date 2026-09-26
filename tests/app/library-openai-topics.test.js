"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../../tools/shared/project-root");

global.window = {};
require(path.join(PROJECT_ROOT, "data", "library.js"));
for (let index = 1; index <= 5; index++) {
  require(path.join(PROJECT_ROOT, "data", `library-official-openai-importance-0${index}.js`));
}

const expected = {
  "security-governance":53,
  "responses-agents-tools":49,
  "codex-engineering":30,
  "mcp-plugins-skills":28,
  "production-observability":24,
  "multimodal-realtime":22,
  "evals-finetuning":18,
  "models-prompting-output":17,
  "migration-lifecycle":11,
  "agentic-commerce":6
};
const library = global.window.PRO_LIBRARY;
const items = library.items.filter(item => item.sourceClass === "official" && item.sourceSubcategory === "openai");
assert.deepStrictEqual(library.topicTaxonomies.openai, Object.keys(expected));
assert.strictEqual(items.length, 258);
Object.entries(expected).forEach(([id, count]) => {
  assert.strictEqual(items.filter(item => item.primaryCategory === id).length, count, id);
});
items.forEach(item => assert.deepStrictEqual(item.topicTags, [item.primaryCategory]));

const ui = fs.readFileSync(path.join(PROJECT_ROOT, "assets", "app", "library-view.js"), "utf8");
assert(ui.includes("data-library-topic"));
assert(ui.includes("selectedTopicCategory"));
assert(ui.includes("library.topicCategories"));
console.log("✓ OpenAI 258 条资料已完整分入固定 10 类，前台筛选入口已接入");
