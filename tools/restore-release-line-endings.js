"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { safeFile, digest } = require("./readiness/site-artifact");

function restore(directory) {
  const root = path.resolve(directory);
  const manifest = JSON.parse(fs.readFileSync(safeFile(root, "release-manifest.json"), "utf8"));
  if (manifest.schemaVersion !== 1 || !manifest.files || typeof manifest.files !== "object") {
    throw new Error("Invalid release manifest");
  }
  let restored = 0;
  for (const [name, record] of Object.entries(manifest.files)) {
    const file = safeFile(root, name);
    const actual = fs.readFileSync(file);
    if (actual.length === record.bytes && digest(actual) === record.sha256) continue;
    // Git has historically stored some release text with CRLF while the
    // production manifest records the original LF bytes. Restore only when
    // that one conversion reproduces the exact declared length and digest.
    const normalized = Buffer.from(actual.toString("latin1").replace(/\r\n/g, "\n"), "latin1");
    if (normalized.length !== record.bytes || digest(normalized) !== record.sha256) {
      throw new Error(`Unrestorable release file: ${name}`);
    }
    fs.writeFileSync(file, normalized);
    restored++;
  }
  return { checked: Object.keys(manifest.files).length, restored };
}

if (require.main === module) {
  try { console.log(JSON.stringify(restore(process.argv[2]), null, 2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}

module.exports = { restore };
