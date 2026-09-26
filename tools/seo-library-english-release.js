"use strict";
// Add the English professional-library directory to an already published release.
//
// The release already carries the Chinese static directory (/library/<class>/…,
// see seo-crawlable-release.js). This publishes the same tree in English under
// /en/library/, from a translated copy of the records the release's own library
// view loads, and pairs every Chinese page with its English counterpart through
// reciprocal hreflang alternates. Chinese pages are re-rendered only to gain the
// alternates, a language link and lang="en" marks on English record text.
//
//   node tools/seo-library-english-release.js PUBLIC_RELEASE NEW_DIRECTORY [TRANSLATIONS_JSON]
//
// TRANSLATIONS_JSON defaults to data/content-locales/en/library.json: a flat map
// from each Chinese string shown on the directory pages to its English text. A
// Chinese string without a translation stops the build.
const fs = require("node:fs"), path = require("node:path");
const {verify} = require("./verify-website");
const {documentPage, digest} = require("./readiness/site-artifact");
const seo = require("./readiness/site-seo");
const {libraryPages, englishLibraryIndex, languageLink} = require("./readiness/library-directory");
const {verifyCrawlable} = require("./readiness/verify-site-seo");
const {releaseLibraryFiles} = require("./seo-crawlable-release");

const WORKSPACE = path.resolve(__dirname, "..");

function loadScript(file, pick) {
  const previous = global.window;
  global.window = {};
  try {
    delete require.cache[require.resolve(file)];
    require(file);
    return pick(global.window);
  } finally {
    global.window = previous;
  }
}

// Chinese pages keep the Chinese chrome; English pages swap it for English.
function englishChrome(html, base) {
  return html
    .replace("跳到正文 / Skip to content", "Skip to content")
    .replace(`<a href="${base}">AI 知识地图</a>`, `<a href="${base}?lang=en">AI Knowledge Map</a>`)
    .replace(">搜索与文字目录 / Search</a>", ">Search concepts</a>");
}

function englishLibraryRelease(sourceArg, outputArg, translationsArg) {
  const source = path.resolve(sourceArg), output = path.resolve(outputArg);
  const translationsFile = path.resolve(translationsArg || path.join(WORKSPACE, "data/content-locales/en/library.json"));
  const translations = JSON.parse(fs.readFileSync(translationsFile, "utf8"));
  verify(source, true);
  if (fs.existsSync(output)) throw Error("Destination must not exist");
  const sourceManifest = JSON.parse(fs.readFileSync(path.join(source, "release-manifest.json"), "utf8"));
  if (!sourceManifest.seoPages.some(page => /^library\/[a-z-]+\/$/.test(page.path))) {
    throw Error("产物缺少中文专业资料库目录层；请先运行 seo-crawlable-release.js");
  }
  if (sourceManifest.seoPages.some(page => page.path.startsWith("en/library/"))) {
    throw Error("This release already carries the English library directory");
  }

  fs.cpSync(source, output, {recursive: true, errorOnExist: true, force: false});
  const manifest = JSON.parse(fs.readFileSync(path.join(output, "release-manifest.json"), "utf8"));
  const siteUrl = manifest.siteUrl, base = new URL(siteUrl).pathname;
  const put = (file, value) => {
    const target = path.join(output, file);
    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.writeFileSync(target, value);
    const bytes = fs.readFileSync(target);
    manifest.files[file] = {sha256: digest(bytes), bytes: bytes.length};
  };

  const graph = loadScript(path.join(output, "data", "graph.js"), w => w.GRAPH || {nodes: []});
  const englishGraph = fs.existsSync(path.join(output, "data/content-locales/en/graph.js"))
    ? loadScript(path.join(output, "data/content-locales/en/graph.js"), w => w.AI_CONTENT_LOCALES.en.graph.collections["graph.nodes"])
    : {};
  const englishTitles = new Map(Object.entries(englishGraph).map(([id, record]) => [id, record.fields && record.fields.title]).filter(([, title]) => title));
  const nodes = graph.nodes || [];
  const conceptsIn = locale => manifest.pages.filter(page => page.locale === locale).map(page => page.id);
  const dataFiles = releaseLibraryFiles(output);
  const libraryDataErrors = [];
  const common = {siteUrl, base, nodes, dataFiles, browserErrors: libraryDataErrors};
  const zh = libraryPages(output, {...common, publishedConcepts: conceptsIn("zh")});
  const en = libraryPages(output, {...common, browserErrors: [], publishedConcepts: conceptsIn("en"), locale: "en", translations, conceptTitles: englishTitles});
  if (!zh.pages.length || zh.pages.length !== en.pages.length) throw Error(`Chinese and English directories differ in size: ${zh.pages.length} vs ${en.pages.length}`);
  const enByPath = new Map(en.pages.map(page => [page.path, page]));
  for (const page of zh.pages) if (!enByPath.has(page.pairPath)) throw Error("English counterpart missing for " + page.path);

  const indexPage = englishLibraryIndex(en, {base});
  const indexPath = indexPage.path;

  const render = (page, alternates) => {
    const english = page.locale === "en";
    const lang = english ? "en" : "zh-Hans";
    const breadcrumbs = page.section
      ? [{name: english ? "AI Knowledge Map" : "AI 知识地图", url: siteUrl}, {name: page.section.name, url: new URL(page.section.path, siteUrl).href}, ...(page.breadcrumbs || [])]
      : [{name: "AI Knowledge Map", url: siteUrl}, {name: page.title, url: new URL(page.path, siteUrl).href}];
    const meta = seo.metadata({siteUrl, path: page.path, title: page.title, description: page.description, locale: lang, kind: "CollectionPage", alternates, breadcrumbs, extraSchemas: page.extraSchemas || []});
    meta.file = page.path + "index.html";
    let html = documentPage(page.title, languageLink(page, base) + page.body, base, false, lang, {canonical: meta.canonical, description: page.description});
    if (english) html = englishChrome(html, base);
    html = seo.apply(html, meta, siteUrl, false);
    html = html.replace(/<main id="main-content"[^>]*>/, match => match + seo.breadcrumbHtml(meta.breadcrumbs, meta.locale));
    html = require("./readiness/initial-canvas").apply(html);
    put(meta.file, html);
    meta.contentHash = seo.fingerprint(html);
    return meta;
  };

  const zhUrl = relative => new URL(relative, siteUrl).href;
  const replaced = new Map();
  for (const page of zh.pages) {
    const alternates = [{locale: "zh-Hans", url: zhUrl(page.path)}, {locale: "en", url: zhUrl(page.pairPath)}];
    replaced.set(page.path, render(page, alternates));
    const english = enByPath.get(page.pairPath);
    replaced.set(english.path, render(english, alternates));
  }
  replaced.set(indexPath, render(indexPage, []));

  // Replace the Chinese directory entries in place and append the English ones.
  const stale = new Set(zh.pages.map(page => page.path));
  const kept = manifest.seoPages.filter(meta => !stale.has(meta.path));
  const shell = kept.find(meta => meta.path === "library/");
  manifest.seoPages = [...kept, ...zh.pages.map(page => replaced.get(page.path)), ...en.pages.map(page => replaced.get(page.path)), replaced.get(indexPath)];
  if (shell) shell.crawlableVia = zh.pages.filter(page => page.listed !== false).map(page => page.path);

  // Entry points: the text directory and the English learning guide link the
  // English library, so it is reachable without JavaScript.
  const link = (file, marker, html) => {
    const meta = manifest.seoPages.find(entry => entry.file === file);
    if (!meta) return false;
    const before = fs.readFileSync(path.join(output, file), "utf8");
    if (!before.includes(marker)) throw Error(`Cannot place the English library link in ${file}`);
    const after = before.replace(marker, marker + html);
    put(file, after);
    meta.contentHash = seo.fingerprint(after);
    return true;
  };
  const englishLink = `<nav aria-label="Professional library"><a class="release-directory-link" lang="en" href="${base}en/library/">Professional Library (English)</a></nav>`;
  link("search/index.html", "</h1>", englishLink);
  link("en/index.html", "</h1>", `<p class="rd-lang"><a href="${base}en/library/">Browse the Professional Library: ${en.items} reviewed AI sources →</a></p>`);

  put("sitemap.xml", seo.sitemap(manifest.seoPages));
  manifest.createdAt = new Date().toISOString();
  fs.writeFileSync(path.join(output, "release-manifest.json"), JSON.stringify(manifest, null, 2));

  // Nothing Chinese may remain in English record text. Personal names written in
  // CJK scripts are the only exception and are reported.
  const leftovers = [];
  for (const page of en.pages) {
    const text = page.body.replace(/<[^>]*>/g, " ");
    const han = text.match(/[一-鿿][^<]{0,20}/g) || [];
    if (han.length) leftovers.push({page: page.path, sample: han.slice(0, 2)});
  }

  return {
    state: "english-library-release",
    output,
    chinesePages: zh.pages.length,
    englishPages: en.pages.length + 1,
    records: en.items,
    libraryDataErrors,
    translations: Object.keys(translations).length,
    cjkNamesOnEnglishPages: leftovers,
    verification: verify(output, true),
    crawlable: verifyCrawlable(output),
  };
}

if (require.main === module) {
  const [sourceArg, outputArg, translationsArg] = process.argv.slice(2);
  if (!sourceArg || !outputArg) throw Error("Usage: node tools/seo-library-english-release.js PUBLIC_RELEASE NEW_DIRECTORY [TRANSLATIONS_JSON]");
  const result = englishLibraryRelease(sourceArg, outputArg, translationsArg);
  console.log(JSON.stringify({...result, verification: result.verification.status}, null, 2));
}

module.exports = {englishLibraryRelease};
