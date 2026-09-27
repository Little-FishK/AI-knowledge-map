"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { verify } = require("./verify-website");

const requiredFiles = Object.freeze([
  "library/index.html",
  "software/index.html",
  ...["building", "coding", "foundations", "frontier", "generation", "safety"]
    .map(name => `assets/node-art/${name}.png`),
]);

function verifyPublishTarget(directory, expectedSiteUrl) {
  if (!expectedSiteUrl || new URL(expectedSiteUrl).protocol !== "https:") {
    throw new Error("An HTTPS production site URL is required");
  }
  const result = verify(directory, true);
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, "release-manifest.json"), "utf8"));
  if (manifest.siteUrl !== expectedSiteUrl) throw new Error("Production site URL does not match the requested domain");
  for (const file of requiredFiles) {
    if (!Object.hasOwn(manifest.files, file)) throw new Error(`Required public file missing: ${file}`);
  }
  for (const route of ["library/", "software/"]) {
    if (!manifest.seoPages?.some(page => page.path === route && page.indexable)) {
      throw new Error(`Required public route is not indexable: ${route}`);
    }
  }
  return { ...result, requiredFiles: requiredFiles.length };
}

if (require.main === module) {
  try {
    const siteUrlAt = process.argv.indexOf("--site-url");
    const result = verifyPublishTarget(process.argv[2], siteUrlAt < 0 ? "" : process.argv[siteUrlAt + 1]);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { requiredFiles, verifyPublishTarget };
