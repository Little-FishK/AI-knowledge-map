"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const digest = text => crypto.createHash("sha256").update(text).digest("hex");
const validId = id => typeof id === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) && !["constructor", "prototype", "__proto__"].includes(id);
const check = (ok, message) => { if (!ok) throw Error(message); };
const MANIFEST = "assets/static-concepts-manifest.json";
function safeFile(root, relative) {
  const file = path.resolve(root, relative);
  check(file.startsWith(path.resolve(root) + path.sep), "Static path outside project");
  let current = path.parse(file).root;
  for (const segment of file.slice(current.length).split(path.sep)) {
    current = path.join(current, segment);
    if (fs.existsSync(current)) check(!fs.lstatSync(current).isSymbolicLink(), "Unsafe static path");
  }
  return file;
}
function navigation(ids) {
  return `window.AI_STATIC_CONCEPTS=${JSON.stringify(Object.fromEntries(ids.map(id => [id, { en: `en/concepts/${id}/`, "zh-Hans": `zh/concepts/${id}/` }]))) };\n`;
}
// Called only by the controller after approval and current-source checks.
function writeStaticOutputs(root, storage, entry, pages, renderer, siteUrl) {
  const lock = safeFile(storage, "static-build.lock");
  fs.mkdirSync(storage, { recursive: true });
  let fd;
  try { fd = fs.openSync(lock, "wx"); } catch (error) { if (error.code === "EEXIST") throw Error("Static build busy; retry after current build finishes"); throw error; }
  try {
    const manifestFile = safeFile(root, MANIFEST);
    const previous = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, "utf8")) : null;
    let entries = [];
    if (previous) {
      check(previous.schemaVersion === 1 && previous.siteUrl === siteUrl && Array.isArray(previous.pages), "Static manifest/site URL mismatch; coordinated migration required");
      const seen = new Set();
      for (const item of previous.pages) {
        check(validId(item.pageId) && !seen.has(item.pageId) && Array.isArray(item.files) && item.files.length === 2, "Invalid static manifest entry"); seen.add(item.pageId);
        for (const locale of ["zh", "en"]) {
          const relative = `${locale}/concepts/${item.pageId}/index.html`, recorded = item.files.find(f => f.file === relative);
          const file = safeFile(root, relative);
          check(recorded && fs.existsSync(file) && digest(fs.readFileSync(file)) === recorded.sha256, "Existing static page changed outside build; refusing overwrite");
        }
      }
      entries = previous.pages.filter(item => item.pageId !== entry.pageId);
      check(fs.readFileSync(safeFile(root, "assets/concept-pages.js"), "utf8") === navigation(previous.pages.map(p => p.pageId)), "Static navigation drift");
      check(fs.readFileSync(safeFile(root, "sitemap-concepts.xml"), "utf8") === renderer.sitemap(previous.pages.map(p => p.pageId), siteUrl), "Static sitemap drift");
    } else {
      // Adopt only the exact legacy single-page aggregate; never erase an unknown index.
      for (const [relative, expected] of Object.entries({ "assets/concept-pages.js": navigation([entry.pageId]), "sitemap-concepts.xml": renderer.sitemap([entry.pageId], siteUrl) })) {
        const file = safeFile(root, relative);
        check(!fs.existsSync(file) || fs.readFileSync(file, "utf8") === expected, "Unmanaged static aggregate; explicit migration required");
      }
    }
    if (!previous?.pages.some(item => item.pageId === entry.pageId)) {
      for (const [relative, text] of Object.entries(pages)) {
        const file = safeFile(root, relative);
        check(!fs.existsSync(file) || fs.readFileSync(file, "utf8") === text, "Unmanaged static page; refusing overwrite");
      }
    }
    entries.push({ ...entry, files: Object.entries(pages).map(([file, text]) => ({ file, sha256: digest(text) })) });
    entries.sort((a, b) => a.pageId.localeCompare(b.pageId, "en"));
    const manifest = { schemaVersion: 1, siteUrl, pages: entries };
    const outputs = { ...pages, "assets/concept-pages.js": navigation(entries.map(p => p.pageId)), "sitemap-concepts.xml": renderer.sitemap(entries.map(p => p.pageId), siteUrl), [MANIFEST]: JSON.stringify(manifest, null, 2) + "\n" };
    const staged = [], replaced = [];
    try {
      for (const [relative, text] of Object.entries(outputs)) {
        const file = safeFile(root, relative);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        const before = fs.existsSync(file) ? fs.readFileSync(file) : null;
        const temp = file + "." + crypto.randomUUID() + ".tmp";
        staged.push({ file, temp, before }); fs.writeFileSync(temp, text, { flag: "wx" });
      }
      for (const item of staged) { fs.renameSync(item.temp, item.file); replaced.push(item); }
    } catch (error) {
      // Restore the preceding complete build when an ordinary filesystem write fails.
      for (const item of replaced.reverse()) { if (item.before === null) fs.unlinkSync(item.file); else fs.writeFileSync(item.file, item.before); }
      throw error;
    } finally { for (const item of staged) if (fs.existsSync(item.temp)) fs.unlinkSync(item.temp); }
    return { pageCount: entries.length, files: Object.entries(outputs).map(([file, text]) => ({ file, sha256: digest(text) })) };
  } finally { fs.closeSync(fd); fs.unlinkSync(lock); }
}
module.exports = { writeStaticOutputs, validId };
