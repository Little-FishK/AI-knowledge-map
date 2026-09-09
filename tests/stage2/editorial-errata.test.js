"use strict";
const assert = require("assert/strict");
const { applyEditorialErrata, errataDigest } = require("../../tools/deepdive-stage2/lib/editorial-errata");
const { pageContentHash } = require("../../tools/deepdive/quality/deepdive-audit-contracts");
const source = { title: "Fixture", subtitle: "Fixture", thesis: "Fixture", html: '<section><figure class="dd-fig">bad diagram</figure><table class="dd-table"><tr><td>bad condition</td></tr></table><p>untouched</p></section>' };
const changes = ["bad diagram", "bad condition"].map((before, i) => ({ issueId: "S" + i, start: source.html.indexOf(before), end: source.html.indexOf(before) + before.length, before, after: "correct " + i }));
const packet = { schemaVersion: 1, pageId: "fixture", sourceHash: pageContentHash(source), changes };
const grant = errataDigest(packet);
const result = applyEditorialErrata("fixture", source, packet, grant);
assert.equal(result.page.html, source.html.replace("bad diagram", "correct 0").replace("bad condition", "correct 1"));
assert.match(result.page.html, /untouched/);
assert.match(source.html, /bad diagram/);
assert.throws(() => applyEditorialErrata("fixture", source, packet, ""), /authorization/);
assert.throws(() => applyEditorialErrata("other", source, packet, grant), /binding/);
assert.throws(() => applyEditorialErrata("fixture", { ...source, html: source.html + "changed" }, packet, grant), /source changed/);
assert.throws(() => applyEditorialErrata("fixture", source, packet, grant, [result.receipt]), /consumed/);
for (const mutation of [
  p => { p.changes[0].after += "unauthorized"; },
  p => { p.extra = true; },
]) {
  const p = structuredClone(packet); mutation(p);
  assert.throws(() => applyEditorialErrata("fixture", source, p, grant));
}
for (const mutation of [
  p => { p.changes[1].start = 0; },
  p => { p.changes[0].before = "wrong source"; },
  p => { p.changes[0].after = p.changes[0].before; },
  p => { p.changes[0].after = '<svg onload="alert(1)"></svg>'; },
  p => { p.changes[1].issueId = p.changes[0].issueId; },
  p => { p.changes = []; },
]) {
  const p = structuredClone(packet); mutation(p);
  assert.throws(() => applyEditorialErrata("fixture", source, p, errataDigest(p)));
}
console.log("PASS errata exact authorization, page/source/span binding, isolation, replay and unsafe markup guards");
