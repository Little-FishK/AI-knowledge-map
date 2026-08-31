"use strict";

const assert = require("assert");
const router = require("../assets/router.js");

const cases = [
  ["", { name: "map" }],
  ["#/map", { name: "map" }],
  ["#/map/neural-network", { name: "node", id: "neural-network" }],
  ["#/concept/neural-network", { name: "concept", id: "neural-network" }],
  ["#/software", { name: "software" }],
  ["#/software/codex", { name: "software-item", id: "codex" }],
  ["#/tutorial/codex", { name: "tutorial", id: "codex" }],
  ["#/library", { name: "library" }],
  ["#/library/openai-api", { name: "library-item", id: "openai-api" }],
];

cases.forEach(([hash, expected]) => assert.deepStrictEqual(router.parse(hash), expected));
assert.deepStrictEqual(router.parse("#/unknown/place"), { name: "not-found", path: "/unknown/place" });
assert.deepStrictEqual(router.parse("#/concept"), { name: "not-found", path: "/concept" });

const routes = cases.slice(1).map(([, route]) => route);
routes.forEach(route => assert.deepStrictEqual(router.parse(router.format(route)), route));
assert.strictEqual(router.format({ name: "node", id: "含 空格" }), "#/map/%E5%90%AB%20%E7%A9%BA%E6%A0%BC");
assert.strictEqual(router.format({ name: "not-found" }), "#/map");

console.log(`✓ URL 路由解析与生成测试通过（${cases.length} 个有效路径）`);
