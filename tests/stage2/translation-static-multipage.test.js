"use strict";
const assert = require("assert/strict"), fs = require("fs"), os = require("os"), path = require("path");
const { fixture } = require("./translation-publication-fixture");
const { createTranslationPublication, BROWSER_CHECKS } = require("../../tools/deepdive-stage2/lib/translation-publication");
const { run, validatePlan } = require("../../tools/build-static-concepts");
const renderer = require("../../tools/readiness/render-static-concept");
const root = fs.mkdtempSync(path.join(os.tmpdir(), "static-multipage-"));
const site = "https://example.com/AI-knowledge-map/", records = new Map();
let authorization, stalePage;
const c = createTranslationPublication({ authorization: () => authorization,
  withTranslationQualityMaterial: (_r, id, _v, cb) => cb(records.get(id)),
  withCurrentTranslationSnapshot: (_r, id, _s, cb) => { if (id === stalePage) throw Error("Stale source"); return cb(); } });
function prepare(id, approve = true) {
  const value = fixture(); value.material.pageId = id; records.set(id, value);
  const p = c.previewTranslation(root, id, "fixture-review"); authorization = p.candidate.artifactHash;
  if (approve) c.publishTranslation(root, id, "fixture-review", authorization, { artifactHash: authorization, approved: true, reviewer: "synthetic-human",
    browserChecks: BROWSER_CHECKS.map(name => ({ name, passed: true, notes: "Synthetic acceptance; not real page evidence." })),
    resources: p.resourceKeys.map(key => ({ key, passed: true, notes: "Synthetic resource acceptance only." })), resourceSummary: "Synthetic formulas and resources for isolated controller tests only." });
  return () => c.buildStaticTranslation(root, id, "fixture-review", p.candidate.artifactHash, site);
}
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
async function main() {
  try {
    const alpha = prepare("alpha"), beta = prepare("beta"), gamma = prepare("gamma", false);
    alpha(); const alphaHtml = read("en/concepts/alpha/index.html"); beta();
    assert.equal(read("en/concepts/alpha/index.html"), alphaHtml);
    const nav = read("assets/concept-pages.js"), sitemap = read("sitemap-concepts.xml"), manifest = read("assets/static-concepts-manifest.json");
    assert(nav.includes('"alpha"') && nav.includes('"beta"')); assert.equal((sitemap.match(/<url>/g) || []).length, 4);
    assert.deepEqual(JSON.parse(manifest).pages.map(p => p.pageId), ["alpha", "beta"]);
    alpha(); assert.equal(read("assets/static-concepts-manifest.json"), manifest); assert.equal(read("sitemap-concepts.xml"), sitemap);
    assert.throws(gamma, /Approved English/); assert.equal(read("assets/concept-pages.js"), nav);
    stalePage = "beta"; assert.throws(beta, /Stale/); stalePage = null;
    const acceptedBeta = JSON.parse(read("data/content-locales/en/deepdive/beta.json"));
    assert.throws(() => c.buildStaticTranslation(root, "beta", "fixture-review", acceptedBeta.artifactHash, "https://different.example/"), /migration/);
    // Fail during commit, after two page replacements, and verify complete restoration.
    const originalRename = fs.renameSync; let renames = 0;
    try { fs.renameSync = (...args) => { if (++renames === 3) throw Error("Injected write failure"); return originalRename(...args); }; assert.throws(beta, /Injected/); }
    finally { fs.renameSync = originalRename; }
    assert.equal(read("assets/static-concepts-manifest.json"), manifest); assert.equal(read("assets/concept-pages.js"), nav); assert.equal(read("sitemap-concepts.xml"), sitemap); beta();
    const lock = path.join(root, ".translation/static-build.lock"); fs.writeFileSync(lock, "busy"); assert.throws(alpha, /busy/); fs.unlinkSync(lock);
    fs.appendFileSync(path.join(root, "en/concepts/alpha/index.html"), "tampered"); assert.throws(beta, /changed outside/); fs.writeFileSync(path.join(root, "en/concepts/alpha/index.html"), alphaHtml);
    assert.throws(() => c.buildStaticTranslation(root, "../escape", "x", "y", site), /Invalid/);
    // The supervised-learning-specific diagram adapter must not reinterpret other pages.
    assert(renderer.render("beta", { title: "Beta", html: '<svg viewBox="0 0 560 96"><text>Only one label</text></svg>' }, "en", site).includes("Only one label"));
    const ref = "sha256:" + "a".repeat(64), plan = { schemaVersion: 1, siteUrl: site, pages: ["alpha", "beta", "gamma"].map(pageId => ({ pageId, reviewId: ref, artifactHash: ref })) };
    const calls = [];
    const result = await run(plan, async (id, action) => { calls.push(id); return action(async (_name, args) => { assert.equal(args.pageId, id); if (id === "beta") throw Error("not approved"); return { state: "built-static-bilingual" }; }); });
    assert.deepEqual(calls, ["alpha", "beta", "gamma"]); assert.equal(result.state, "partial-or-failed"); assert.deepEqual(result.results.map(r => r.status), ["built", "failed", "built"]);
    assert.throws(() => validatePlan({ ...plan, pages: [plan.pages[0], plan.pages[0]] }), /duplicate/);
    console.log("PASS two-page merge, stable rebuild, unapproved/stale rejection, shared-index preservation, rollback, busy lock, tamper/path guards, generic rendering and batch failure reporting.");
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
