"use strict";
// Add the crawlable directory layer to an already verified public release.
//
// The interactive views (/ , /library/ , /software/) render from window.* data
// scripts, so a crawler that does not execute JavaScript sees navigation chrome
// only: 2457 reviewed library sources, the software catalogue and the tutorials
// were invisible to generative engines. This adds the plain-HTML counterpart and
// the plain-text indexes, then verifies the result, without rebuilding content or
// touching the Stage 2 publication contract.
//
// The same modules run inside writeArtifact, so a full build produces these pages
// directly; this script exists so an already published release can be upgraded in
// place instead of waiting for a full controller rebuild.
const fs = require("node:fs"), path = require("node:path");
const {verify} = require("./verify-website");
const {documentPage, digest} = require("./readiness/site-artifact");
const seo = require("./readiness/site-seo");
const {libraryPages} = require("./readiness/library-directory");
const {softwarePages} = require("./readiness/software-directory");
const {llmsTxt, llmsFullTxt} = require("./readiness/llms-txt");
const {verifyCrawlable} = require("./readiness/verify-site-seo");
const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));

const [sourceArg, outputArg] = process.argv.slice(2);

function loadGraph(root) {
  const file = path.join(root, "data", "graph.js");
  if (!fs.existsSync(file)) return {nodes: []};
  const previous = global.window;
  global.window = {};
  try {
    require(file);
    return global.window.GRAPH || {nodes: []};
  } finally {
    global.window = previous;
  }
}

// The data scripts the release's interactive library view loads, in load order.
function releaseLibraryFiles(root) {
  const view = path.join(root, "assets", "app", "library-view.js");
  if (!fs.existsSync(view)) throw Error("Release has no library view; cannot tell which library data it publishes");
  const files = [...new Set([...fs.readFileSync(view, "utf8").matchAll(/["'](data\/library[a-z0-9-]*\.js)(?:\?[^"']*)?["']/g)].map(match => match[1]))];
  if (!files.length || files[0] !== "data/library.js") throw Error("Release library view does not load data/library.js first");
  const missing = files.filter(file => !fs.existsSync(path.join(root, file)));
  if (missing.length) throw Error("Release library view loads missing data: " + missing.join(", "));
  return files;
}

function crawlableRelease(sourceArg, outputArg) {
  const source = path.resolve(sourceArg), output = path.resolve(outputArg);
  verify(source, true);
  if (fs.existsSync(output)) throw Error("Destination must not exist");
  const sourceManifest = JSON.parse(fs.readFileSync(path.join(source, "release-manifest.json"), "utf8"));
  // The directory pages link up to their section, so the interactive shells must
  // already exist. A release built before the shells did cannot be upgraded here.
  for (const shell of ["library/", "software/"]) {
    if (!sourceManifest.seoPages.some(page => page.path === shell)) {
      throw Error(`产物缺少 ${shell} 视图外壳，无法附加目录层；请先用完整构建生成包含交互视图的产物`);
    }
  }

  fs.cpSync(source, output, {recursive: true, errorOnExist: true, force: false});
  const manifest = JSON.parse(fs.readFileSync(path.join(output, "release-manifest.json"), "utf8"));
  const base = new URL(manifest.siteUrl).pathname;
  if (manifest.seoPages.some(page => /^library\/[a-z-]+\/$/.test(page.path) && page.path !== "library/")) {
    throw Error("This release already carries the library directory layer");
  }

  function put(file, value) {
    const target = path.join(output, file);
    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.writeFileSync(target, value);
    const bytes = fs.readFileSync(target);
    manifest.files[file] = {sha256: digest(bytes), bytes: bytes.length};
  }

  const nodes = loadGraph(output).nodes || [];
  const publishedConcepts = manifest.pages.filter(page => page.locale === "zh").map(page => page.id);
  // Publish exactly the records the release's own library view loads, which may
  // differ from the current workspace list.
  // A data script that throws in the browser is skipped here too, and reported.
  const dataFiles = releaseLibraryFiles(output), libraryDataErrors = [];
  const library = libraryPages(output, {siteUrl: manifest.siteUrl, base, nodes, publishedConcepts, dataFiles, browserErrors: libraryDataErrors});
  const software = softwarePages(output, {siteUrl: manifest.siteUrl, base, nodes, publishedConcepts});
  const pages = [...library.pages, ...software.pages];
  // Paginated continuation pages (listed:false) are reachable from page 1 and the
  // sitemap; the text directory and the shells name each source once.
  const listed = pages.filter(page => page.listed !== false);
  if (!pages.length) throw Error("No library or software records found in this release; nothing to publish");

  const readingEntries = manifest.pages.map(page => {
    const meta = manifest.seoPages.find(entry => entry.file === page.path);
    if (!meta) throw Error("Missing published metadata for " + page.path);
    return {id: page.id, locale: page.locale, page: {title: meta.title, subtitle: meta.description}};
  });

  for (const page of pages) {
    const meta = seo.metadata({
      siteUrl: manifest.siteUrl, path: page.path, title: page.title, description: page.description, kind: "CollectionPage",
      breadcrumbs: [{name: "AI 知识地图", url: manifest.siteUrl}, {name: page.section.name, url: new URL(page.section.path, manifest.siteUrl).href}, ...(page.breadcrumbs || [])],
      extraSchemas: page.extraSchemas || [],
    });
    meta.file = page.path + "index.html";
    let html = seo.apply(documentPage(page.title, page.body, base, false, "zh-Hans", {canonical: new URL(page.path, manifest.siteUrl).href, description: page.description}), meta, manifest.siteUrl, false);
    html = html.replace(/<main id="main-content"[^>]*>/, match => match + seo.breadcrumbHtml(meta.breadcrumbs, meta.locale));
    html = require("./readiness/initial-canvas").apply(html);
    put(meta.file, html);
    meta.contentHash = seo.fingerprint(html);
    manifest.seoPages.push(meta);
  }

  // The text directory is crawlable, so it carries the links that make the new
  // pages discoverable without relying on JavaScript navigation.
  const searchPage = manifest.seoPages.find(page => page.path === "search/");
  if (searchPage) {
    const before = fs.readFileSync(path.join(output, searchPage.file), "utf8");
    const browse = listed.map(page => `<a class="release-directory-link" href="${base}${page.path}">${esc(page.navLabel || page.title)}</a>`).join("");
    const after = before.replace("</h1>", `</h1><nav aria-label="文字目录">${browse}</nav>`);
    if (after !== before) {
      put(searchPage.file, after);
      searchPage.contentHash = seo.fingerprint(after);
    }
  }

  // A shell does not need to carry the records itself, but it must name the pages
  // that do. verifyCrawlable rejects a shell whose companions are missing or thin.
  for (const shell of ["", "library/", "software/"]) {
    const meta = manifest.seoPages.find(page => page.path === shell);
    if (!meta) continue;
    const companions = shell === "" ? ["search/"] : listed.filter(page => page.path.startsWith(shell)).map(page => page.path);
    if (companions.length) meta.crawlableVia = companions;
  }

  put("llms.txt", llmsTxt(output, {siteUrl: manifest.siteUrl, entries: readingEntries, library: library.library}));
  put("llms-full.txt", llmsFullTxt(output, {siteUrl: manifest.siteUrl, entries: readingEntries, library: library.library}));
  put("sitemap.xml", seo.sitemap(manifest.seoPages));
  manifest.createdAt = new Date().toISOString();
  fs.writeFileSync(path.join(output, "release-manifest.json"), JSON.stringify(manifest, null, 2));

  const crawlable = verifyCrawlable(output);
  return {
    state: "crawlable-release",
    output,
    libraryPages: library.pages.length,
    softwarePages: software.pages.length,
    libraryRecords: library.items,
    libraryDataErrors,
    ghostNodeReferencesDropped: [...library.dropped.entries()],
    llmsTxtBytes: fs.statSync(path.join(output, "llms.txt")).size,
    llmsFullTxtBytes: fs.statSync(path.join(output, "llms-full.txt")).size,
    verification: verify(output, true),
    crawlable,
  };
}

if (require.main === module) {
  if (!sourceArg || !outputArg) throw Error("Usage: node tools/seo-crawlable-release.js PUBLIC_RELEASE NEW_DIRECTORY");
  console.log(JSON.stringify(crawlableRelease(sourceArg, outputArg), null, 2));
}

module.exports = {crawlableRelease, releaseLibraryFiles};

