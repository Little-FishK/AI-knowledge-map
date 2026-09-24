"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(process.argv[2] || "site-release");
const manifestPath = path.join(root, "release-manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const files = {};

function walk(directory = root) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(file);
      continue;
    }
    const relative = path.relative(root, file).replaceAll(path.sep, "/");
    if (relative === "release-manifest.json") continue;
    const bytes = fs.readFileSync(file);
    files[relative] = {
      sha256: `sha256:${crypto.createHash("sha256").update(bytes).digest("hex")}`,
      bytes: bytes.length
    };
  }
}

walk();
manifest.createdAt = new Date().toISOString();
const orderedFiles = {};
for (const relative of Object.keys(manifest.files || {})) {
  if (files[relative]) orderedFiles[relative] = files[relative];
}
for (const relative of Object.keys(files).filter(relative => !Object.hasOwn(orderedFiles, relative)).sort()) {
  orderedFiles[relative] = files[relative];
}
manifest.files = orderedFiles;
for (const page of manifest.seoPages || []) {
  const html = fs.readFileSync(path.join(root, page.file));
  page.contentHash = `sha256:${crypto.createHash("sha256").update(html).digest("hex")}`;
}
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ state: "rebuilt", files: Object.keys(files).length }, null, 2));
