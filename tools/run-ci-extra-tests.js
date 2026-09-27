"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const packageScripts = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).scripts;
const workflow = fs.readFileSync(path.join(root, ".github/workflows/deepdive-quality.yml"), "utf8");
const manual = JSON.parse(fs.readFileSync(path.join(root, "tests/ci-manual-tests.json"), "utf8"));
const directories = ["tests/app", "tests/tooling", "tests/stage2", "tests/video-ingest", "tests/deepdive"];

function selectedTests() {
  const all = directories.flatMap(directory => fs.readdirSync(path.join(root, directory))
    .filter(name => name.endsWith(".test.js")).map(name => `${directory}/${name}`)).sort();
  const coveredCommands = [workflow];
  const visited = new Set();
  function addScript(name) {
    if (visited.has(name)) return;
    if (!Object.hasOwn(packageScripts, name)) throw new Error(`CI refers to missing npm script: ${name}`);
    visited.add(name);
    const command = packageScripts[name];
    coveredCommands.push(command);
    for (const match of command.matchAll(/npm run ([\w:-]+)/g)) addScript(match[1]);
  }
  for (const match of workflow.matchAll(/npm run ([\w:-]+)/g)) addScript(match[1]);
  const coveredText = coveredCommands.join("\n");
  for (const file of Object.keys(manual)) {
    if (!all.includes(file)) throw new Error(`Manual test entry does not exist: ${file}`);
    if (!manual[file] || typeof manual[file] !== "string") throw new Error(`Manual test needs a reason: ${file}`);
    if (coveredText.includes(file)) throw new Error(`Manual test is already covered by CI: ${file}`);
  }
  return { all, covered: all.filter(file => coveredText.includes(file)), manual: Object.keys(manual),
    extra: all.filter(file => !coveredText.includes(file) && !Object.hasOwn(manual, file)) };
}

function run() {
  const selection = selectedTests();
  console.log(`CI test inventory: ${selection.all.length} total, ${selection.covered.length} in named suites, ${selection.extra.length} extra, ${selection.manual.length} manual`);
  if (process.argv.includes("--list")) { console.log(selection.extra.join("\n")); return; }
  for (const file of selection.extra) {
    const result = spawnSync(process.execPath, [file], { cwd: root, encoding: "utf8", timeout: 90000 });
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.error || result.status !== 0) throw new Error(`CI extra test failed: ${file}${result.error ? ` (${result.error.message})` : ""}`);
  }
  console.log(`PASS ${selection.extra.length} additional tests`);
}

if (require.main === module) {
  try { run(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}

module.exports = { selectedTests };
