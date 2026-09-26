"use strict";
// The release must be readable to a crawler that does not execute JavaScript.
//
// Two layers are covered here:
//   1. the rule itself (verifyCrawlable), including the crawlableVia contract;
//   2. the build path, proving writeArtifact publishes the library and software
//      records as plain HTML and that the resulting release passes the rule.
const assert = require("node:assert/strict"), fs = require("node:fs"), os = require("node:os"), path = require("node:path");
const {writeArtifact} = require("../../tools/readiness/site-artifact");
const {verify} = require("../../tools/verify-website");
const {verifyCrawlable} = require("../../tools/readiness/verify-site-seo");
const {readableLength, MIN_INDEXABLE_TEXT} = require("../../tools/readiness/crawlable-text");

const page = text => `<!doctype html><html lang="zh-Hans"><head><title>t</title></head><body><main id="main-content"><p>${text}</p></main></body></html>`;
const filler = (label, length) => label + "：" + "内容占位".repeat(Math.ceil(length / 4));

// ── 1. The rule ────────────────────────────────────────────────────────────────
const rule = fs.mkdtempSync(path.join(os.tmpdir(), "crawlable-rule-"));
try {
  const write = (file, html) => {
    fs.mkdirSync(path.dirname(path.join(rule, file)), {recursive: true});
    fs.writeFileSync(path.join(rule, file), html);
  };
  write("shell/index.html", page(filler("shell", 200)));
  write("rich/index.html", page(filler("rich", 1200)));
  write("excluded/index.html", page(filler("excluded", 100)));
  const manifest = {seoPages: [
    {file: "shell/index.html", indexable: true},
    {file: "rich/index.html", indexable: true},
    {file: "excluded/index.html", indexable: false},
  ]};
  assert(readableLength(fs.readFileSync(path.join(rule, "shell/index.html"), "utf8")) < MIN_INDEXABLE_TEXT);
  assert(readableLength(fs.readFileSync(path.join(rule, "rich/index.html"), "utf8")) > MIN_INDEXABLE_TEXT);
  assert.throws(() => verifyCrawlable(rule, manifest), /shell\/index\.html.*未声明 crawlableVia/, "a thin page with no declared companion must fail");
  // A noindex page is not expected to be crawlable at all.
  assert.equal(verifyCrawlable(rule, {seoPages: [manifest.seoPages[2]]}).indexable, 0);
  manifest.seoPages[0].crawlableVia = ["rich/"];
  assert.equal(verifyCrawlable(rule, manifest).minimum, MIN_INDEXABLE_TEXT, "a verified companion satisfies the rule");
  manifest.seoPages[0].crawlableVia = ["missing/"];
  assert.throws(() => verifyCrawlable(rule, manifest), /附属页不合格/, "a missing companion must fail");
  manifest.seoPages[0].crawlableVia = ["shell/"];
  assert.throws(() => verifyCrawlable(rule, manifest), /附属页不合格/, "a thin companion must not satisfy the rule");
  manifest.seoPages[0].crawlableVia = ["excluded/"];
  assert.throws(() => verifyCrawlable(rule, manifest), /附属页不合格/, "a noindex companion must not satisfy the rule");
  manifest.seoPages[0].crawlableVia = ["rich/"];
  assert.throws(() => verifyCrawlable(rule, manifest, {minimum: 5000}), /rich\/index\.html|shell\/index\.html/, "the threshold is honoured");
  delete manifest.seoPages[0].crawlableVia;
  assert.equal(fs.existsSync(path.join(rule, "release-manifest.json")), false);
  assert.throws(() => verifyCrawlable(rule), /ENOENT|release-manifest/, "the manifest is required when it is not supplied");
} finally { fs.rmSync(rule, {recursive: true, force: true}); }

// ── 2. The build path ──────────────────────────────────────────────────────────
const root = fs.mkdtempSync(path.join(os.tmpdir(), "crawlable-build-"));
const siteUrl = "https://example.org/map/";
try {
  fs.mkdirSync(path.join(root, "data"), {recursive: true});
  fs.mkdirSync(path.join(root, "assets", "vendor"), {recursive: true});
  fs.mkdirSync(path.join(root, "assets", "social"), {recursive: true});
  fs.copyFileSync(path.resolve(__dirname, "../../assets/social/site-card.png"), path.join(root, "assets", "social", "site-card.png"));
  for (const name of ["style.css", "concept-preview.css", "reading.css", "progress.css", "reading.js", "progress-model.js", "progress-supabase.js", "progress-runtime.js", "progress-ui.js", "site-search.js", "release-navigation.js"]) fs.writeFileSync(path.join(root, "assets", name), "");
  fs.writeFileSync(path.join(root, "assets", "vendor", "supabase-2.115.0.min.js"), "");
  // Every page head links the site icons; the release verifier requires them.
  fs.mkdirSync(path.join(root, "assets", "brand"), {recursive: true});
  fs.writeFileSync(path.join(root, "favicon.ico"), "");
  fs.writeFileSync(path.join(root, "assets", "brand", "icon.svg"), "<svg xmlns=\"http://www.w3.org/2000/svg\"/>");
  fs.writeFileSync(path.join(root, "assets", "brand", "apple-touch-icon.png"), "");
  fs.writeFileSync(path.join(root, "index.html"), '<html><head><title>旧标题</title></head><body><header><span class="brand-name" id="brand-name">AI 知识地图</span></header><main id="stage"></main></body></html>');

  const item = (id, title, subcategory, nodes) => ({
    id, sourceClass: "official", sourceSubcategory: subcategory, title,
    publisher: "Anthropic", collection: "官方文档", contentKind: "文档", authorityTier: "A1",
    reviewStatus: "官方技术资料六道判断通过", reviewPolicy: "official-technical-importance-v2",
    url: "https://example.com/" + id, accessedAt: "2026-09-25", summary: filler(title, 200),
    evidenceUse: filler("证据用途", 120), limitations: [filler("边界一", 60), filler("边界二", 60)],
    linkedNodes: nodes, discoveredOnly: undefined, discoveryOnly: false,
    selectionReason: filler("入选理由 " + title, 40), tags: ["官方文档", "示例标签"],
  });
  fs.writeFileSync(path.join(root, "data", "library.js"), "window.PRO_LIBRARY=" + JSON.stringify({
    meta: {version: "fixture", updatedAt: "2026-09-25"},
    sourceClasses: [
      {id: "official", order: 3, label: "官方技术资料", short: "官方文档、模型卡、公告与仓库", color: "#68a889", authority: "A1–A2",
        subcategories: [{id: "anthropic", label: "Anthropic", short: "文档、模型卡、研究与安全资料"}, {id: "openai", label: "OpenAI", short: "文档、系统卡与研究"}, {id: "meta-ai", label: "Meta AI", short: "模型卡、研究与官方项目资料"}]},
      {id: "academic", order: 1, label: "学术投稿", short: "论文、正式出版与预印本", color: "#7797c7", authority: "A2–R",
        subcategories: [{id: "arxiv", label: "arXiv", short: "AI 预印本"}, {id: "openreview", label: "OpenReview", short: "开放评审"}]},
    ],
    items: [
      item("anthropic-doc-a", "Claude 文档 A", "anthropic", ["transformer", "computer-vision"]),
      item("anthropic-doc-b", "Claude 文档 B", "anthropic", ["attention"]),
      item("openai-doc-a", "OpenAI 文档 A", "openai", ["computer-vision"]),
      {id: "arxiv-a", sourceClass: "academic", sourceSubcategory: "arxiv", title: "一篇预印本", publisher: "arXiv",
        collection: "arXiv 预印本", contentKind: "论文", authorityTier: "R", reviewStatus: "preprint", url: "https://example.com/arxiv-a",
        accessedAt: "2026-09-25", summary: filler("摘要", 200), evidenceUse: filler("证据用途", 120), limitations: [filler("边界", 60)], linkedNodes: ["transformer"]},
    ],
  }) + ";\n");
  fs.writeFileSync(path.join(root, "data", "software.js"), "window.SOFTWARE=" + JSON.stringify({
    meta: {version: "fixture", updatedAt: "2026-09-25"},
    categories: [{id: "chat", label: "对话助手", emoji: "💬", color: "#6b8cbe"}],
    items: [{id: "chatgpt", name: "ChatGPT", cat: "chat", by: "OpenAI", concept: "transformer", summary: filler("ChatGPT", 120), body: filler("说明", 300)}],
  }) + ";\n");

  const entryFor = id => ({id, locale: "zh", sourceHash: "fixture", eligible: true,
    page: {title: "测试页面 " + id, subtitle: filler("副标题 " + id, 300), html: `<section><h2>核心</h2><p>${filler("正文 " + id, 1400)}</p></section>`}});
  const concept = entryFor("sample");
  const nodes = [
    ["sample", "示例"], ["transformer", "Transformer"], ["attention", "注意力"], ["embedding", "嵌入"],
    ["fine-tuning", "微调"], ["rag", "检索增强生成"], ["diffusion", "扩散模型"], ["tokenization", "分词"],
  ].map(([id, title]) => ({id, title, summary: filler(title + "摘要", 150)}));
  const output = path.join(root, "release");
  writeArtifact({root, output, entries: [concept, entryFor("second"), entryFor("third")], inventory: [], siteUrl, mode: "production", graph: {nodes, edges: []}});

  assert.equal(verify(output, true).status, "pass");
  const read = file => fs.readFileSync(path.join(output, file), "utf8");
  // Every class has a hub page; a secondary source with at least two records gets
  // its own page, and a smaller one is listed in full on the hub.
  for (const file of ["library/official/index.html", "library/official/anthropic/index.html", "library/academic/index.html", "software/catalog/index.html"]) {
    assert(fs.existsSync(path.join(output, file)), "expected directory page " + file);
    assert(readableLength(read(file)) > MIN_INDEXABLE_TEXT, file + " must be readable without JavaScript");
  }
  assert(!fs.existsSync(path.join(output, "library/official/openai/index.html")), "a one-record source stays on the class hub");
  assert(!fs.existsSync(path.join(output, "library/official/meta-ai/index.html")), "an empty source does not get a page");
  const sitemap = read("sitemap.xml");
  assert(sitemap.includes("<loc>https://example.org/map/library/official/</loc>"));
  assert(sitemap.includes("<loc>https://example.org/map/library/official/anthropic/</loc>"));
  assert(sitemap.includes("<loc>https://example.org/map/software/catalog/</loc>"));

  // A declared secondary source with no accepted record must still be listed, so
  // "not collected yet" is never confused with "does not exist".
  const official = read("library/official/index.html");
  assert(official.includes("Meta AI"));
  assert(official.includes("暂无收录条目"));
  assert(official.includes("二级来源登记"));
  assert(official.includes('href="/map/library/official/anthropic/"'), "the hub links a source page from the site root");
  assert(official.includes('href="#sub-openai"') && official.includes('id="sub-openai"'), "a source listed on the hub is linked by anchor");
  assert(official.includes("OpenAI 文档 A"), "the hub carries the records of a source too small for its own page");
  assert(official.includes("Claude 文档 A"), "the hub previews the records of each source page");

  // Ghost concept ids must never become dead links; the graph decides what exists.
  const anthropic = read("library/official/anthropic/index.html");
  assert(anthropic.includes('node=transformer"'), "an unpublished concept keeps the map fallback");
  assert(!anthropic.includes("computer-vision") && !official.includes("computer-vision"), "a concept absent from the graph must be dropped");
  assert(anthropic.includes('<link rel="canonical" href="https://example.org/map/library/official/anthropic/">'));

  // Structured data: one primary type plus the item list, in the single block.
  const schemasOf = html => {
    const head = html.split("</head>")[0];
    assert.equal((head.match(/application\/ld\+json/g) || []).length, 1);
    return JSON.parse(head.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  };
  assert(schemasOf(official).some(schema => schema["@type"] === "CollectionPage"));
  assert(schemasOf(official).some(schema => schema["@type"] === "ItemList" && schema.numberOfItems === 2), "the hub lists its sources");
  assert(schemasOf(anthropic).some(schema => schema["@type"] === "ItemList" && schema.numberOfItems === 2), "a source page lists its records");
  assert(official.includes('class="site-breadcrumbs"'));

  // Pagination is exercised directly: page 1 lives at the source URL, later
  // pages at page/N/, each with its own slice, numbering and pager.
  const manifest = JSON.parse(read("release-manifest.json"));
  const published = manifest.pages.filter(entry => entry.locale === "zh").map(entry => entry.id);
  const directory = require("../../tools/readiness/library-directory");
  assert.equal(directory.PAGE_SIZE, 15);
  const paged = directory.libraryPages(root, {siteUrl, base: "/map/", nodes, publishedConcepts: published, pageSize: 1, minOwnPage: 1});
  const byPath = new Map(paged.pages.map(entry => [entry.path, entry]));
  for (const expected of ["library/official/", "library/official/anthropic/", "library/official/anthropic/page/2/", "library/official/openai/", "library/academic/arxiv/"]) assert(byPath.has(expected), "expected " + expected);
  assert(!byPath.has("library/official/meta-ai/"), "an empty secondary source does not get an empty page");
  assert(!byPath.has("library/official/anthropic/page/1/"), "page 1 is the source URL itself");
  const first = byPath.get("library/official/anthropic/"), second = byPath.get("library/official/anthropic/page/2/");
  assert(first.body.includes("Claude 文档 A") && !first.body.includes("Claude 文档 B"));
  assert(second.body.includes("Claude 文档 B") && !second.body.includes("Claude 文档 A"));
  assert(first.body.includes('rel="next" href="/map/library/official/anthropic/page/2/"'));
  assert(second.body.includes('rel="prev" href="/map/library/official/anthropic/"'));
  assert.notEqual(first.title, second.title, "each page has its own title");
  assert.notEqual(first.description, second.description, "each page has its own description");
  assert.equal(first.listed, true);
  assert.equal(second.listed, false, "continuation pages are not listed in text directories");
  assert.equal(second.extraSchemas[0].itemListElement[0].position, 2, "item positions continue across pages");
  assert(paged.pages.every(entry => (entry.body.match(/class="rd-item"/g) || []).length <= 1), "no page exceeds the page size");
  const rendered = paged.pages.filter(entry => entry.path.split("/").length > 3).reduce((sum, entry) => sum + (entry.body.match(/class="rd-item"/g) || []).length, 0);
  assert.equal(rendered, 4, "every record appears on exactly one source page");
  assert.throws(() => directory.libraryPages(root, {siteUrl, base: "/map/", pageSize: 0}), /分页大小无效/);

  // The crawlable text directory carries the links to the new pages.
  assert(read("search/index.html").includes('aria-label="文字目录"'));
  assert(read("search/index.html").includes('href="/map/library/official/"'));
  assert(read("search/index.html").includes('href="/map/library/official/anthropic/"'));
  assert(!read("search/index.html").includes("/page/"), "continuation pages stay out of the text directory");

  // Plain-text indexes for AI systems.
  const llms = read("llms.txt"), llmsFull = read("llms-full.txt");
  assert(llms.startsWith("# AI 知识地图"));
  assert(llms.includes("https://example.org/map/library/official/"));
  assert(Buffer.byteLength(llms, "utf8") < 10240, "llms.txt stays a small map");
  assert(llmsFull.includes("Claude 文档 A"));
  assert(llmsFull.includes("https://example.com/arxiv-a"));
  assert(!/排名/.test(llmsFull.split("\n").slice(0, 4).join(" ")), "no ranking claim in the index preamble");

  // The release passes the crawlability rule: shells name the pages that carry
  // their records, and index.html names the text directory.
  const result = verifyCrawlable(output);
  assert(result.minimum === MIN_INDEXABLE_TEXT);
  const shells = Object.fromEntries(manifest.seoPages.filter(meta => ["index.html", "library/index.html", "software/index.html"].includes(meta.file)).map(meta => [meta.file, meta.crawlableVia]));
  assert.deepEqual(shells["index.html"], ["search/"]);
  assert(shells["library/index.html"].length >= 3);
  assert(shells["library/index.html"].every(entry => !entry.includes("/page/")), "shells name each source once");
  assert.deepEqual(shells["software/index.html"], ["software/catalog/"]);
  // Dropping the records a shell points at must break the release.
  fs.rmSync(path.join(output, "library/official/index.html"));
  assert.throws(() => verifyCrawlable(output), /library\/official\/index\.html/, "removing a companion must fail the gate");

  // ── 3. The English library ──────────────────────────────────────────────────
  // With a translation table present the build mirrors the directory under
  // en/library/, pairs every page with its Chinese counterpart, and refuses to
  // publish a page with an untranslated string.
  const {loadLibrary, localizeLibrary} = require("../../tools/readiness/library-directory");
  const untranslated = localizeLibrary(loadLibrary(root), {}).missing;
  assert(untranslated.length > 5, "the fixture carries Chinese record text");
  const {untranslatedViewStrings} = require("../../tools/readiness/library-directory");
  const viewOnly = untranslatedViewStrings(loadLibrary(root), Object.fromEntries(untranslated.map(text => [text, "x"])));
  assert(viewOnly.some(text => text.startsWith("入选理由")) && viewOnly.includes("示例标签"), "the view shows fields the directory does not");
  const table = Object.fromEntries(untranslated.map((text, index) => [text, `English text ${index + 1}`]));
  fs.mkdirSync(path.join(root, "data", "content-locales", "en"), {recursive: true});
  const tableFile = path.join(root, "data", "content-locales", "en", "library.json");
  const [dropped, ...kept] = Object.keys(table);
  fs.writeFileSync(tableFile, JSON.stringify(Object.fromEntries(kept.map(key => [key, table[key]]))));
  const build = name => writeArtifact({root, output: path.join(root, name), entries: [concept, entryFor("second"), entryFor("third")], inventory: [], siteUrl, mode: "production", graph: {nodes, edges: []}});
  assert.throws(() => build("release-missing"), /English library translation missing/, "an untranslated string must stop the build");
  fs.writeFileSync(tableFile, JSON.stringify(table));
  assert.throws(() => build("release-view-missing"), /English library view translation missing/, "a string only the interactive view shows must be translated too");
  viewOnly.forEach((text, index) => { table[text] = `View text ${index + 1}`; });
  fs.writeFileSync(tableFile, JSON.stringify(table));
  build("release-en");
  const bilingual = path.join(root, "release-en");
  assert.equal(verify(bilingual, true).status, "pass");
  verifyCrawlable(bilingual);
  const readEn = file => fs.readFileSync(path.join(bilingual, file), "utf8");
  for (const file of ["en/library/index.html", "en/library/official/index.html", "en/library/official/anthropic/index.html", "en/library/academic/index.html"]) {
    assert(fs.existsSync(path.join(bilingual, file)), "expected English page " + file);
    assert(readEn(file).includes('<html lang="en">'), file + " must declare English");
    assert(!/[\u4e00-\u9fff]/.test(readEn(file).split("<main")[1].replace(/<p class="rd-lang">[\s\S]*?<\/p>/g, "").replace(/<nav class="site-breadcrumbs"[\s\S]*?<\/nav>/, "")), file + " must not show Chinese record text");
  }
  const enHub = readEn("en/library/official/index.html"), zhHub = readEn("library/official/index.html");
  assert(enHub.includes(table[dropped]) || Object.values(table).some(text => enHub.includes(text)), "English pages carry the translated text");
  assert(enHub.includes('hreflang="zh-Hans" href="https://example.org/map/library/official/"') && enHub.includes('hreflang="en" href="https://example.org/map/en/library/official/"'));
  assert(zhHub.includes('hreflang="en" href="https://example.org/map/en/library/official/"'), "the Chinese page points at its English pair");
  assert(zhHub.includes('href="/map/en/library/official/" hreflang="en"'), "a visible link leads to the English version");
  assert(enHub.includes('href="/map/library/official/" hreflang="zh-Hans"'), "a visible link leads back to Chinese");
  const bilingualSitemap = readEn("sitemap.xml");
  assert(bilingualSitemap.includes("<loc>https://example.org/map/en/library/</loc>") && bilingualSitemap.includes("<loc>https://example.org/map/en/library/official/anthropic/</loc>"));
  assert(readEn("search/index.html").includes('href="/map/en/library/"'), "the text directory links the English library");
  assert(!readEn("search/index.html").includes('href="/map/en/library/official/"'), "the text directory links only the English index");
  // The interactive view's runtime table: every string it can show, loaded only in English.
  const runtime = {};
  new (require("node:vm").Script)(readEn("data/content-locales/en/library.js")).runInNewContext({window: runtime});
  assert.equal(runtime.AI_LIBRARY_LOCALES.en.strings["示例标签"], table["示例标签"]);
  assert.equal(Object.keys(runtime.AI_LIBRARY_LOCALES.en.strings).length, Object.keys(table).length);
  const bilingualManifest = JSON.parse(readEn("release-manifest.json"));
  assert(!bilingualManifest.seoPages.find(meta => meta.path === "library/").crawlableVia.some(entry => entry.startsWith("en/")), "the Chinese shell names Chinese companions only");
  console.log("PASS: crawlable coverage rule, companion contract, library hubs and paginated source pages, English library pairs, software directories, ghost-node filtering, llms.txt indexes");
} finally { fs.rmSync(root, {recursive: true, force: true}); }
