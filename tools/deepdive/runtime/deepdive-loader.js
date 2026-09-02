"use strict";

// Canonical loader shared by deep-dive quality, export, and Stage 2 workflows.

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");
const {
  loadStandalonePageDirectory,
  loadStandalonePageSource,
} = require("./standalone-page-source");

const SOURCE_LAYOUT_FILE = ".standalone-pages.json";

function evaluateLegacyDeepDiveSources(sources) {
  const context = { window: {} };
  vm.createContext(context);
  [...sources]
    .sort((left, right) => left.filename.localeCompare(right.filename))
    .forEach(({ filename, source }) => {
      vm.runInContext(source, context, { filename });
    });
  return context.window.DEEPDIVE || {};
}

function loadDeepDivePages(root) {
  const directory = path.join(root, "data", "deepdive");
  const layoutFile = path.join(directory, SOURCE_LAYOUT_FILE);
  if (!fs.existsSync(layoutFile)) {
    throw new Error(`data/deepdive 缺少 ${SOURCE_LAYOUT_FILE}；不再支持排序覆盖式源码`);
  }
  const layout = JSON.parse(fs.readFileSync(layoutFile, "utf8"));
  if (layout.schemaVersion !== 1 || layout.mode !== "standalone-page") {
    throw new Error(`data/deepdive/${SOURCE_LAYOUT_FILE} 布局声明无效`);
  }
  const pages = loadStandalonePageDirectory(directory);
  if (layout.pageCount !== Object.keys(pages).length) {
    throw new Error(`data/deepdive/${SOURCE_LAYOUT_FILE} 页面数量与独立源码不一致`);
  }
  return pages;
}

function resolveGitBaseRef(root) {
  const configured = process.env.DEEPDIVE_BASE_REF || process.env.GITHUB_BASE_REF || "";
  if (!configured) return "HEAD";
  if (configured.startsWith("origin/") || /^[0-9a-f]{7,40}$/i.test(configured)) return configured;
  return `origin/${configured}`;
}

function runGit(root, args) {
  return spawnSync(
    "git",
    ["-c", `safe.directory=${root.replace(/\\/g, "/")}`, ...args],
    { cwd: root, encoding: "utf8" },
  );
}

function readGitBlobs(root, specifications) {
  const result = spawnSync(
    "git",
    ["-c", `safe.directory=${root.replace(/\\/g, "/")}`, "cat-file", "--batch"],
    {
      cwd: root,
      input: `${specifications.join("\n")}\n`,
      maxBuffer: 64 * 1024 * 1024,
    },
  );
  if (result.status !== 0 || !Buffer.isBuffer(result.stdout)) return null;
  const blobs = [];
  let offset = 0;
  for (const specification of specifications) {
    const lineEnd = result.stdout.indexOf(0x0a, offset);
    if (lineEnd < 0) return null;
    const header = result.stdout.subarray(offset, lineEnd).toString("utf8");
    if (header.endsWith(" missing")) return null;
    const size = Number(header.split(" ").pop());
    if (!Number.isFinite(size)) return null;
    const start = lineEnd + 1;
    blobs.push(result.stdout.subarray(start, start + size).toString("utf8"));
    offset = start + size + 1;
  }
  return blobs;
}

function loadDeepDivePagesFromGit(root, reference = resolveGitBaseRef(root)) {
  const listed = runGit(root, [
    "ls-tree",
    "-r",
    "--name-only",
    reference,
    "--",
    "data/deepdive",
  ]);
  if (listed.status !== 0) return {};

  const listedFiles = listed.stdout
    .split(/\r?\n/)
    .map((file) => file.trim().replace(/\\/g, "/"))
    .filter((file) => file.startsWith("data/deepdive/"));
  const files = listedFiles.filter(file => file.endsWith(".js")).sort();
  const blobs = readGitBlobs(root, files.map((file) => `${reference}:${file}`));
  if (!blobs) return {};
  if (listedFiles.includes(`data/deepdive/${SOURCE_LAYOUT_FILE}`)) {
    const pages = Object.create(null);
    files.forEach((file, index) => {
      const id = path.posix.basename(file, ".js");
      pages[id] = loadStandalonePageSource(blobs[index], `${reference}:${file}`, id);
    });
    return pages;
  }
  const sources = files.map((file, index) => ({
    filename: file,
    source: blobs[index],
  }));
  return evaluateLegacyDeepDiveSources(sources);
}

module.exports = {
  SOURCE_LAYOUT_FILE,
  loadDeepDivePages,
  loadDeepDivePagesFromGit,
  resolveGitBaseRef,
};
