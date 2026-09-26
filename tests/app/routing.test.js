"use strict";

const assert = require("assert");
const router = require("../../assets/router.js");

const cases = [
  ["", { name: "map" }],
  ["#/map", { name: "map" }],
  ["#/map/supervised-learning", { name: "map", id: "supervised-learning" }],
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
assert.deepStrictEqual(router.parse("#/map/neural-network"), { name: "map", id: "neural-network" });
assert.deepStrictEqual(router.parse("#/map/neural-network/extra"), { name: "not-found", path: "/map/neural-network/extra" });

const routes = cases.slice(1).map(([, route]) => route);
routes.forEach(route => assert.deepStrictEqual(router.parse(router.format(route)), route));
assert.strictEqual(router.format({ name: "concept", id: "含 空格" }), "#/concept/%E5%90%AB%20%E7%A9%BA%E6%A0%BC");
assert.strictEqual(router.format({ name: "map", id: "含 空格" }), "#/map/%E5%90%AB%20%E7%A9%BA%E6%A0%BC");
assert.strictEqual(router.format({ name: "not-found" }), "");
assert.strictEqual(router.format({ name: "map" }), "");

console.log(`✓ URL 路由解析与生成测试通过（${cases.length} 个有效路径）`);

/* ── 干净路径契约：线上用路径 + 查询参数，file:// 回退 Hash ── */

const site = "https://example.com/";
const subpath = "https://example.com/AI-knowledge-map/";
const at = (href, baseURI) => router.parseLocation({ href, hash: new URL(href).hash }, baseURI);

assert.deepStrictEqual(at("https://example.com/", site), { name: "map" });
assert.deepStrictEqual(at("https://example.com/?node=agent", site), { name: "map", id: "agent" });
assert.deepStrictEqual(at("https://example.com/?concept=agent", site), { name: "concept", id: "agent" });
assert.deepStrictEqual(at("https://example.com/library/", site), { name: "library" });
assert.deepStrictEqual(at("https://example.com/library/?item=openai-api", site), { name: "library-item", id: "openai-api" });
assert.deepStrictEqual(at("https://example.com/software/", site), { name: "software" });
assert.deepStrictEqual(at("https://example.com/software/?item=codex", site), { name: "software-item", id: "codex" });
assert.deepStrictEqual(at("https://example.com/software/?tutorial=codex", site), { name: "tutorial", id: "codex" });
assert.deepStrictEqual(at("https://example.com/?lang=en&node=agent", site), { name: "map", id: "agent" });
assert.deepStrictEqual(at("https://example.com/unknown/", site), { name: "not-found", path: "/unknown/" });

// View shells live one directory down; <base href="../"> keeps the site root.
assert.deepStrictEqual(at("https://example.com/library/index.html", site), { name: "library" });
assert.deepStrictEqual(at("https://example.com/software/index.html", site), { name: "software" });
// Subpath deployments (GitHub Pages project sites) resolve the same way.
assert.deepStrictEqual(at("https://example.com/AI-knowledge-map/library/", subpath), { name: "library" });
assert.deepStrictEqual(at("https://example.com/AI-knowledge-map/?node=agent", subpath), { name: "map", id: "agent" });

// Legacy fragments still win so old bookmarks keep working.
assert.deepStrictEqual(router.parseLocation({ href: "https://example.com/library/", hash: "#/map/agent" }), { name: "map", id: "agent" });
assert.deepStrictEqual(router.parseLocation({ href: "https://example.com/", hash: "#/library/openai-api" }), { name: "library-item", id: "openai-api" });

// A document opened from disk still parses, but cannot navigate: see below.
assert.deepStrictEqual(at("file:///C:/proj/index.html", "file:///C:/proj/"), { name: "map" });
assert.deepStrictEqual(at("file:///C:/proj/library/index.html", "file:///C:/proj/"), { name: "library" });

assert.strictEqual(router.formatPath({ name: "map" }, site, ""), "https://example.com/");
assert.strictEqual(router.formatPath({ name: "map", id: "agent" }, site, ""), "https://example.com/?node=agent");
assert.strictEqual(router.formatPath({ name: "concept", id: "agent" }, site, ""), "https://example.com/?concept=agent");
assert.strictEqual(router.formatPath({ name: "library" }, site, ""), "https://example.com/library/");
assert.strictEqual(router.formatPath({ name: "library-item", id: "openai-api" }, site, ""), "https://example.com/library/?item=openai-api");
assert.strictEqual(router.formatPath({ name: "software" }, site, ""), "https://example.com/software/");
assert.strictEqual(router.formatPath({ name: "software-item", id: "codex" }, site, ""), "https://example.com/software/?item=codex");
assert.strictEqual(router.formatPath({ name: "tutorial", id: "codex" }, site, ""), "https://example.com/software/?tutorial=codex");
assert.strictEqual(router.formatPath({ name: "library" }, subpath, ""), "https://example.com/AI-knowledge-map/library/");
// The active language survives view navigation.
assert.strictEqual(router.formatPath({ name: "library" }, site, "?lang=en"), "https://example.com/library/?lang=en");
assert.strictEqual(router.formatPath({ name: "library-item", id: "x" }, site, "?lang=en"), "https://example.com/library/?lang=en&item=x");
// file:// cannot host path navigation; navigate() then reports "no change" and
// the view renders with the address bar untouched. No fragment is ever produced.
assert.strictEqual(router.formatPath({ name: "library" }, "file:///C:/proj/", ""), null);
assert.strictEqual(router.formatPath({ name: "not-found" }, site, ""), null);
assert.strictEqual(router.formatPath({ name: "library-item" }, site, ""), null);

const roundTrips = [
  { name: "map" }, { name: "map", id: "agent" }, { name: "concept", id: "agent" },
  { name: "software" }, { name: "software-item", id: "codex" }, { name: "tutorial", id: "codex" },
  { name: "library" }, { name: "library-item", id: "openai-api" },
];
for (const route of roundTrips) {
  const href = router.formatPath(route, site, "");
  assert.deepStrictEqual(at(href, site), route, `round trip failed: ${JSON.stringify(route)}`);
  assert.ok(!href.includes("#"), `生成地址不得含片段：${JSON.stringify(route)}`);
}
console.log(`✓ 干净路径解析与生成测试通过（${roundTrips.length} 个往返路径、子目录、无片段生成）`);

/* ── navigate() 只走 pushState：不再有 Hash 回退 ── */

global.HashChangeEvent = class { constructor(type, init) { this.type = type; Object.assign(this, init); } };
global.Event = class { constructor(type) { this.type = type; } };

const calls = [];
const fakeWindow = {
  location: { href: site, search: "", hash: "" },
  history: {
    pushState(state, title, url) { calls.push(["push", url]); },
    replaceState(state, title, url) { calls.push(["replace", url]); },
  },
  events: [],
  dispatchEvent(event) { this.events.push(event); },
};
global.window = fakeWindow;
delete require.cache[require.resolve("../../assets/router.js")];
const routed = require("../../assets/router.js");

const last = () => calls[calls.length - 1];
const options = extra => ({ baseURI: site, ...extra });

assert.strictEqual(routed.navigate({ name: "library" }, options()), true);
assert.deepStrictEqual(last(), ["push", "https://example.com/library/"]);
// A legacy fragment resolves to a clean address, never back to a fragment.
assert.deepStrictEqual(routed.parseLocation({ href: site, hash: "#/map/supervised-learning" }), { name: "map", id: "supervised-learning" });
assert.strictEqual(routed.navigate(routed.parseLocation({ href: site, hash: "#/map/supervised-learning" }), options()), true);
assert.deepStrictEqual(last(), ["push", "https://example.com/?node=supervised-learning"]);
assert.strictEqual(routed.navigate({ name: "library-item", id: "openai-api" }, options({ replace: true })), true);
assert.deepStrictEqual(last(), ["replace", "https://example.com/library/?item=openai-api"]);
assert.strictEqual(routed.navigate({ name: "tutorial", id: "codex" }, options()), true);
assert.deepStrictEqual(last(), ["push", "https://example.com/software/?tutorial=codex"]);
assert.strictEqual(fakeWindow.location.hash, "", "navigate() 不得回退到 Hash");
assert.ok(calls.every(([, url]) => !url.includes("#")), "navigate() 产生的地址不得含片段");

// replaceState/pushState emit no event, so the application still needs a signal.
assert.ok(fakeWindow.events.length > 0, "navigate() 必须通知应用重新渲染");
fakeWindow.events.length = 0;
routed.navigate({ name: "library" }, options({ silent: true }));
assert.strictEqual(fakeWindow.events.length, 0, "silent 导航不得发出事件");

// A document that cannot host pushState degrades instead of falling back to a fragment.
assert.strictEqual(routed.navigate({ name: "library" }, options({ baseURI: "file:///C:/proj/" })), false);
fakeWindow.history.pushState = () => { throw new Error("SecurityError"); };
assert.strictEqual(routed.navigate({ name: "software" }, options()), false, "pushState 被拒时不得抛错");
assert.strictEqual(fakeWindow.location.hash, "", "被拒后仍不得写入 Hash");

console.log(`✓ 导航契约测试通过（${calls.length} 次 history 调用，零片段）`);
