"use strict";
// Add the site icon to an already verified public release, without rebuilding
// content or touching the Stage 2 publication contract.
//
//   node tools/brand-icon-release.js <verified-release-dir> <new-output-dir>
//
// Copies the release, adds favicon.ico at the site root plus assets/brand/*,
// inserts the same icon links the full build emits (site-seo.icons) into every
// registered HTML page, swaps the top-bar ◈ glyph for the icon via style.css,
// refreshes the manifest hashes and verifies the result as a production artifact.
// A full build produces the same icon links and files directly.
const fs = require("node:fs"), path = require("node:path");
const {verify} = require("./verify-website");
const {digest} = require("./readiness/site-artifact");
const seo = require("./readiness/site-seo");

const root = path.resolve(__dirname, "..");
const BRAND_FILES = ["favicon.ico", "assets/brand/icon.svg", "assets/brand/icon-192.png", "assets/brand/icon-512.png", "assets/brand/apple-touch-icon.png"];
const CSS_MARKER = "/* Brand icon (assets/brand/icon.svg)";

function brandIconRelease(sourceArg, outputArg) {
  const source = path.resolve(sourceArg), output = path.resolve(outputArg);
  verify(source, true);
  if (fs.existsSync(output)) throw Error("Destination must not exist");
  const repoCss = fs.readFileSync(path.join(root, "assets/style.css"), "utf8");
  const cssStart = repoCss.indexOf(CSS_MARKER);
  if (cssStart < 0) throw Error("assets/style.css has no brand icon rule");
  const cssRule = repoCss.slice(cssStart).replace(/\r\n/g, "\n").trimEnd() + "\n";

  fs.cpSync(source, output, {recursive: true, errorOnExist: true, force: false});
  const manifest = JSON.parse(fs.readFileSync(path.join(output, "release-manifest.json"), "utf8"));
  if (manifest.files["favicon.ico"]) throw Error("This release already carries the site icon");
  const put = (file, bytes) => {
    const target = path.join(output, file);
    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.writeFileSync(target, bytes);
    manifest.files[file] = {sha256: digest(bytes), bytes: bytes.length};
  };
  for (const file of BRAND_FILES) put(file, fs.readFileSync(path.join(root, file)));

  const css = fs.readFileSync(path.join(output, "assets/style.css"), "utf8");
  if (css.includes(CSS_MARKER)) throw Error("Release style.css already has the brand icon rule");
  put("assets/style.css", Buffer.from(css.replace(/\s*$/, "\n") + "\n" + cssRule));

  const links = seo.icons(manifest.siteUrl);
  let pages = 0;
  for (const meta of manifest.seoPages) {
    const file = path.join(output, meta.file);
    const html = fs.readFileSync(file, "utf8");
    const next = html.replace(/<head>([\s\S]*?)<\/head>/i, (_, head) => {
      const cleaned = head.replace(/<link\b[^>]*rel="(?:icon|apple-touch-icon)"[^>]*>\n?/gi, "");
      if (!/<title\b/i.test(cleaned)) throw Error("Page head has no title: " + meta.file);
      return "<head>" + cleaned.replace(/<title\b/i, links + "<title") + "</head>";
    });
    if (next === html) throw Error("Icon insertion failed: " + meta.file);
    put(meta.file, Buffer.from(next));
    meta.contentHash = seo.fingerprint(next);
    pages++;
  }
  fs.writeFileSync(path.join(output, "release-manifest.json"), JSON.stringify(manifest, null, 2));
  const verification = verify(output, true);
  return {state: "branded", source, output, pages, files: BRAND_FILES, verification};
}

if (require.main === module) {
  const [sourceArg, outputArg] = process.argv.slice(2);
  if (!sourceArg || !outputArg) { console.error("Usage: node tools/brand-icon-release.js <release-dir> <output-dir>"); process.exit(1); }
  try { console.log(JSON.stringify(brandIconRelease(sourceArg, outputArg), null, 2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = {brandIconRelease};
