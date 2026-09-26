"use strict";

const fs = require("fs");
const path = require("path");

const LIBRARY_DATA_FILES = Object.freeze([
  "data/library.js",
  "data/library-official-technical.js",
  ...Array.from({ length: 5 }, (_, index) => `data/library-official-openai-importance-0${index + 1}.js`),
  ...Array.from({ length: 4 }, (_, index) => `data/library-official-anthropic-importance-0${index + 1}.js`),
  ...Array.from({ length: 2 }, (_, index) => `data/library-official-google-deepmind-importance-0${index + 1}.js`),
  ...Array.from({ length: 7 }, (_, index) => `data/library-official-microsoft-importance-0${index + 1}.js`),
  ...Array.from({ length: 7 }, (_, index) => `data/library-official-meta-ai-importance-0${index + 1}.js`),
  ...Array.from({ length: 7 }, (_, index) => `data/library-official-nvidia-importance-0${index + 1}.js`),
  "data/library-official-china.js",
  "data/library-platform-profiles.js",
  "data/library-source-meta.js",
  "data/library-new-sources.js",
  "data/library-knowledge-base-core.js",
  "data/library-knowledge-base-expanded.js",
  "data/library-hackathon-kaggle.js",
  "data/library-arxiv.js",
  "data/library-neurips-proceedings.js",
  "data/library-pmlr.js",
  "data/library-openreview.js",
  "data/library-acl-anthology.js",
  "data/library-cvf-open-access.js",
  "data/library-ieee-xplore.js",
  "data/library-acm-digital-library.js",
  "data/library-springer-nature.js",
]);

function assertBrowserLibraryBundle(projectRoot) {
  const source = fs.readFileSync(path.join(projectRoot, "assets", "app", "library-view.js"), "utf8");
  const bundleMatch = source.match(/const bundle = \[([\s\S]*?)\n\s*\];/);
  if (!bundleMatch) throw new Error("无法读取浏览器专业资料库加载清单");
  const browserFiles = Array.from(
    bundleMatch[1].matchAll(/["'](data\/library[^"'?]*\.js)(?:\?[^"']*)?["']/g),
    match => match[1]
  );
  if (browserFiles.join("\n") !== LIBRARY_DATA_FILES.join("\n")) {
    const missingFromBrowser = LIBRARY_DATA_FILES.filter(file => !browserFiles.includes(file));
    const missingFromTools = browserFiles.filter(file => !LIBRARY_DATA_FILES.includes(file));
    throw new Error([
      "浏览器与工具链的专业资料库加载清单不一致",
      missingFromBrowser.length ? `浏览器缺失：${missingFromBrowser.join(", ")}` : "",
      missingFromTools.length ? `工具链缺失：${missingFromTools.join(", ")}` : "",
    ].filter(Boolean).join("；"));
  }
}

module.exports = { LIBRARY_DATA_FILES, assertBrowserLibraryBundle };
