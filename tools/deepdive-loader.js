"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");

function loadDeepDivePages(root) {
  const context = { window: {} };
  vm.createContext(context);
  const directory = path.join(root, "data", "deepdive");
  fs.readdirSync(directory)
    .filter(file => file.endsWith(".js"))
    .sort()
    .forEach(file => {
      const fullPath = path.join(directory, file);
      vm.runInContext(fs.readFileSync(fullPath, "utf8"), context, { filename: fullPath });
    });
  return context.window.DEEPDIVE || {};
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

  const files = listed.stdout
    .split(/\r?\n/)
    .map((file) => file.trim().replace(/\\/g, "/"))
    .filter((file) => file.startsWith("data/deepdive/") && file.endsWith(".js"))
    .sort();
  const context = { window: {} };
  vm.createContext(context);
  const blobs = readGitBlobs(root, files.map((file) => `${reference}:${file}`));
  if (!blobs) return {};
  for (let index = 0; index < files.length; index += 1) {
    vm.runInContext(blobs[index], context, { filename: `${reference}:${files[index]}` });
  }
  return context.window.DEEPDIVE || {};
}

module.exports = {
  loadDeepDivePages,
  loadDeepDivePagesFromGit,
  resolveGitBaseRef,
};
