"use strict";
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(process.argv[2] || "");
if (!root || !fs.existsSync(path.join(root, "release-manifest.json"))) {
  throw new Error("Usage: node tools/rebuild-release-manifest-files.js <release-directory>");
}
const manifestPath = path.join(root, "release-manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const digest = bytes => `sha256:${crypto.createHash("sha256").update(bytes).digest("hex")}`;
const overlayIndex = process.argv.indexOf("--overlay");
const overlayFiles = overlayIndex === -1 ? [] : process.argv.slice(overlayIndex + 1);
const files = overlayFiles.length ? { ...manifest.files } : {};

function walk(directory) {
  for (const name of fs.readdirSync(directory).sort()) {
    if (name === ".git") continue;
    const absolute = path.join(directory, name);
    const stat = fs.lstatSync(absolute);
    if (stat.isSymbolicLink()) throw new Error(`Symlink refused: ${absolute}`);
    if (stat.isDirectory()) walk(absolute);
    else {
      const relative = path.relative(root, absolute).replace(/\\/g, "/");
      if (relative === "release-manifest.json") continue;
      const bytes = fs.readFileSync(absolute);
      files[relative] = { sha256: digest(bytes), bytes: bytes.length };
    }
  }
}

if (overlayFiles.length) {
  for (const relative of overlayFiles) {
    const normalized = relative.replace(/\\/g, "/");
    const absolute = path.join(root, normalized);
    if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) throw new Error(`Overlay file missing: ${normalized}`);
    let bytes = fs.readFileSync(absolute);
    if (!bytes.includes(0)) bytes = Buffer.from(bytes.toString("utf8").replace(/\r\n/g, "\n"));
    files[normalized] = { sha256: digest(bytes), bytes: bytes.length };
  }
} else {
  walk(root);
}
manifest.createdAt = new Date().toISOString();
manifest.files = files;
for (const page of manifest.seoPages || []) {
  const relative = page.file || (page.path ? `${page.path}index.html` : "index.html");
  if (files[relative]) page.contentHash = files[relative].sha256;
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(JSON.stringify({ root, files: Object.keys(files).length, createdAt: manifest.createdAt }, null, 2));
