"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const vm = require("vm");
const {
  applyNodePlan,
  buildNodeApplyPlan,
  inspectPackage,
  rollbackNodeReceipt
} = require("./video-ingest/node-application");

const ROOT = path.resolve(__dirname, "..");
const packageDir = path.join(
  ROOT,
  "tools/proposals/video/elevenlabs-official-voice-clone/node-package-preview"
);

function graphAt(root) {
  const context = { window: {} };
  vm.createContext(context);
  const file = path.join(root, "data/graph.js");
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
  return context.window.GRAPH;
}

const inspected = inspectPackage(packageDir);
assert.deepStrictEqual(inspected.errors, []);

const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "video-node-apply-"));
try {
  fs.cpSync(path.join(ROOT, "data"), path.join(fixture, "data"), { recursive: true });
  fs.copyFileSync(path.join(ROOT, "index.html"), path.join(fixture, "index.html"));
  const installed = graphAt(fixture);
  const reindex = new Map(inspected.manifest.learningPath.reindex
    .map(item => [item.to, item.from]));
  installed.nodes = installed.nodes.filter(node => node.id !== "voice-cloning");
  installed.edges = installed.edges.filter(edge =>
    edge.from !== "voice-cloning" && edge.to !== "voice-cloning");
  delete installed.positions["voice-cloning"];
  installed.recommendedLearningPath.forEach(phase => {
    phase.steps = phase.steps
      .filter(step => step[1] !== "voice-cloning")
      .map(step => [reindex.get(step[0]) || step[0], step[1]]);
  });
  fs.writeFileSync(
    path.join(fixture, "data/graph.js"),
    `window.GRAPH = ${JSON.stringify(installed, null, 2)};\n`,
    "utf8"
  );
  fs.writeFileSync(
    path.join(fixture, "index.html"),
    fs.readFileSync(path.join(fixture, "index.html"), "utf8")
      .replace(/\s*<script src="data\/deepdive\/voice-cloning\.js"><\/script>/, ""),
    "utf8"
  );
  fs.rmSync(path.join(fixture, "data/deepdive/voice-cloning.js"), { force: true });
  fs.rmSync(path.join(fixture, "data/deepdive-runtime/voice-cloning.js"), { force: true });
  const runtimeManifestFile = path.join(fixture, "data/deepdive-runtime/manifest.js");
  fs.writeFileSync(
    runtimeManifestFile,
    fs.readFileSync(runtimeManifestFile, "utf8")
      .replace(/"voice-cloning",?/, "")
      .replace(/,\]/, "]"),
    "utf8"
  );

  const before = graphAt(fixture);
  assert.strictEqual(before.nodes.length, 129);

  const plan = buildNodeApplyPlan(packageDir, { root: fixture });
  assert.strictEqual(plan.status, "ready", JSON.stringify(plan.blockers));
  assert.strictEqual(plan.idempotent, false);
  assert.strictEqual(plan.targets.length, 4);

  const receipt = applyNodePlan(plan, { root: fixture });
  assert.strictEqual(receipt.status, "applied");
  const after = graphAt(fixture);
  assert.strictEqual(after.nodes.length, 130);
  assert(after.nodes.some(node => node.id === "voice-cloning"));
  assert.strictEqual(after.edges.length, before.edges.length + 5);
  assert.deepStrictEqual(Array.from(after.positions["voice-cloning"]), [134.68, 77.21]);
  const pathSteps = after.recommendedLearningPath.flatMap(phase => phase.steps);
  assert(pathSteps.some(step => step[0] === "8.10" && step[1] === "voice-cloning"));
  assert(pathSteps.some(step => step[0] === "8.11" && step[1] === "audio-generation"));
  assert(pathSteps.some(step => step[0] === "8.13" && step[1] === "content-detection"));
  assert(fs.existsSync(path.join(fixture, "data/deepdive/voice-cloning.js")));
  assert(fs.existsSync(path.join(fixture, "data/deepdive-runtime/voice-cloning.js")));
  assert(fs.readFileSync(runtimeManifestFile, "utf8").includes('"voice-cloning"'));
  assert(!fs.readFileSync(path.join(fixture, "index.html"), "utf8")
    .includes('data/deepdive/voice-cloning.js'));

  const noOpPlan = buildNodeApplyPlan(packageDir, { root: fixture });
  assert.strictEqual(noOpPlan.status, "ready");
  assert.strictEqual(noOpPlan.idempotent, true);
  assert.strictEqual(applyNodePlan(noOpPlan, { root: fixture }).status, "no-op");

  const rollback = rollbackNodeReceipt(receipt, { root: fixture });
  assert.strictEqual(rollback.status, "rolled-back");
  assert.strictEqual(graphAt(fixture).nodes.length, 129);
  assert(!fs.existsSync(path.join(fixture, "data/deepdive/voice-cloning.js")));
  assert(!fs.existsSync(path.join(fixture, "data/deepdive-runtime/voice-cloning.js")));

  const tampered = path.join(fixture, "tampered-package");
  fs.cpSync(packageDir, tampered, { recursive: true });
  const nodeFile = path.join(tampered, "node.json");
  const node = JSON.parse(fs.readFileSync(nodeFile, "utf8"));
  node.title = "被篡改";
  fs.writeFileSync(nodeFile, JSON.stringify(node, null, 2) + "\n", "utf8");
  assert(inspectPackage(tampered).errors.some(error => error.includes("node.json")));
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}

console.log("✓ 新节点正式应用：封包完整性、集成写入、幂等与自动回滚测试通过");
