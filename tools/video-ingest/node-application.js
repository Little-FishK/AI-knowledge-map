"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");
const {
  ROOT,
  readJson,
  sha256
} = require("./core");
const { graphFingerprint } = require("./shadow-review");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function withinRoot(root, relativePath) {
  const absolute = path.resolve(root, relativePath);
  const relative = path.relative(path.resolve(root), absolute);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`目标路径越出项目根目录：${relativePath}`);
  }
  return absolute;
}

function readTextIfExists(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function atomicWrite(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(temp, content, "utf8");
  fs.renameSync(temp, file);
}

function loadGraph(root) {
  const context = { window: {} };
  vm.createContext(context);
  const file = withinRoot(root, "data/graph.js");
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
  return context.window.GRAPH;
}

function loadDeepDive(file, nodeId) {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
  return context.window.DEEPDIVE && context.window.DEEPDIVE[nodeId];
}

function packageSeal(manifest) {
  const copy = clone(manifest);
  delete copy.packageHash;
  return sha256(copy);
}

function equal(left, right) {
  return sha256(left) === sha256(right);
}

function inspectPackage(packageDir) {
  const directory = path.resolve(packageDir);
  const manifestFile = path.join(directory, "manifest.json");
  if (!fs.existsSync(manifestFile)) throw new Error("原子包缺少 manifest.json");
  const manifest = readJson(manifestFile);
  const errors = [];
  if (!manifest.packageHash || packageSeal(manifest) !== manifest.packageHash) {
    errors.push("原子包封包哈希不匹配");
  }
  if (manifest.mode !== "node-atomic-package-preview") errors.push("原子包 mode 无效");
  if (!manifest.validation || !manifest.validation.passed) errors.push("原子包未通过完整门禁");
  ["l1", "l2", "l3"].forEach(level => {
    if (!manifest.validation || manifest.validation[level] !== "passed") {
      errors.push(`原子包 ${level.toUpperCase()} 未通过`);
    }
  });
  if (!manifest.shadowEligibility || manifest.shadowEligibility.newNode !== true) {
    errors.push("原子包没有新节点资格");
  }
  if (manifest.shadowEligibility && manifest.shadowEligibility.formalWrite !== false) {
    errors.push("输入必须是零写入预览包");
  }
  const parts = {
    node: readJson(path.join(directory, "node.json")),
    edges: readJson(path.join(directory, "edges.json")),
    learningPath: readJson(path.join(directory, "learning-path.json")),
    layout: readJson(path.join(directory, "layout.json"))
  };
  Object.entries(parts).forEach(([key, value]) => {
    if (!equal(value, manifest[key])) errors.push(`${key}.json 与 manifest 不一致`);
  });
  const deepDiveFile = path.join(directory, "deepdive", `${manifest.node && manifest.node.id}.js`);
  if (!fs.existsSync(deepDiveFile)) errors.push("原子包缺少原理页文件");
  else {
    const page = loadDeepDive(deepDiveFile, manifest.node.id);
    if (!page || !equal(page, manifest.deepDive)) errors.push("原理页文件与 manifest 不一致");
  }
  return {
    directory,
    manifest,
    deepDiveFile,
    errors: [...new Set(errors)]
  };
}

function propertyContainer(source, property, opener, closer) {
  const marker = new RegExp(`(?:^|\\s)(?:["']${escapeRegex(property)}["']|${escapeRegex(property)})\\s*:\\s*\\${opener}`);
  const match = marker.exec(source);
  if (!match) throw new Error(`data/graph.js 缺少 ${property}`);
  const markerIndex = match.index;
  const start = source.indexOf(opener, markerIndex);
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let index = start; index < source.length; index++) {
    const char = source[index];
    const next = source[index + 1];
    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        index++;
      }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "/" && next === "/") {
      lineComment = true;
      index++;
      continue;
    }
    if (char === "/" && next === "*") {
      blockComment = true;
      index++;
      continue;
    }
    if (char === opener) depth++;
    if (char === closer) {
      depth--;
      if (depth === 0) return { start, end: index };
    }
  }
  throw new Error(`data/graph.js 的 ${property} 容器未闭合`);
}

function indentJson(value, spaces) {
  const prefix = " ".repeat(spaces);
  return JSON.stringify(value, null, 2).split("\n").map(line => prefix + line).join("\n");
}

function insertArrayItem(source, property, value) {
  const range = propertyContainer(source, property, "[", "]");
  const before = source.slice(0, range.end).replace(/\s+$/, "");
  const whitespace = source.slice(before.length, range.end);
  return `${before},\n${indentJson(value, 4)}${whitespace}${source.slice(range.end)}`;
}

function insertObjectEntry(source, property, key, value) {
  const range = propertyContainer(source, property, "{", "}");
  const before = source.slice(0, range.end).replace(/\s+$/, "");
  const whitespace = source.slice(before.length, range.end);
  const entry = `${JSON.stringify(key)}: ${JSON.stringify(value)}`;
  return `${before},\n    ${entry}${whitespace}${source.slice(range.end)}`;
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceLearningStep(source, from, nodeId, to) {
  const pattern = new RegExp(
    `\\[\\s*["']${escapeRegex(from)}["']\\s*,\\s*["']${escapeRegex(nodeId)}["']\\s*\\]`
  );
  if (!pattern.test(source)) throw new Error(`找不到待顺延学习步骤：${from} ${nodeId}`);
  return source.replace(pattern, `[${JSON.stringify(to)}, ${JSON.stringify(nodeId)}]`);
}

function applyLearningPath(source, learningPath, nodeId) {
  let result = source;
  const shifts = [...(learningPath.reindex || [])].reverse();
  shifts.forEach(item => {
    result = replaceLearningStep(result, item.from, item.nodeId, item.to);
  });
  const successor = (learningPath.reindex || [])[0];
  if (!successor) throw new Error("学习路径插入缺少机械顺延计划");
  const target = `[${JSON.stringify(successor.to)}, ${JSON.stringify(successor.nodeId)}]`;
  const index = result.indexOf(target);
  if (index === -1) throw new Error("顺延后找不到学习路径插入锚点");
  return result.slice(0, index)
    + `[${JSON.stringify(learningPath.order)}, ${JSON.stringify(nodeId)}], `
    + result.slice(index);
}

function transformGraph(source, manifest) {
  let result = source;
  result = applyLearningPath(result, manifest.learningPath, manifest.node.id);
  result = insertObjectEntry(
    result,
    "positions",
    manifest.node.id,
    [manifest.layout.position.x, manifest.layout.position.y]
  );
  result = insertArrayItem(result, "nodes", manifest.node);
  (manifest.edges || []).forEach(edge => {
    result = insertArrayItem(result, "edges", edge);
  });
  return result;
}

function transformIndex(source, nodeId) {
  const registration = `<script src="data/deepdive/${nodeId}.js"></script>`;
  if (source.includes(registration)) return source;
  const anchor = '<script src="data/deepdive/zz-deepdive-quality-completion.js"></script>';
  const index = source.indexOf(anchor);
  if (index === -1) throw new Error("index.html 缺少深读页注册锚点");
  return source.slice(0, index) + registration + "\n" + source.slice(index);
}

function targetRecord(root, relativePath, afterContent) {
  const file = withinRoot(root, relativePath);
  const beforeExists = fs.existsSync(file);
  const beforeContent = readTextIfExists(file);
  return {
    relativePath,
    beforeExists,
    beforeHash: sha256(beforeContent),
    afterHash: sha256(afterContent),
    beforeContent,
    afterContent
  };
}

function isInstalled(graph, manifest, root) {
  const node = (graph.nodes || []).find(item => item.id === manifest.node.id);
  if (!node) return false;
  const pageFile = withinRoot(root, `data/deepdive/${manifest.node.id}.js`);
  if (!fs.existsSync(pageFile)) return false;
  const page = loadDeepDive(pageFile, manifest.node.id);
  const edges = manifest.edges || [];
  const installedEdges = graph.edges || [];
  const edgePresent = edge => installedEdges.some(item => equal(item, edge));
  const pathPresent = (graph.recommendedLearningPath || []).some(phase =>
    (phase.steps || []).some(step =>
      String(step[0]) === String(manifest.learningPath.order) && step[1] === manifest.node.id
    )
  );
  return equal(node, manifest.node)
    && equal(page, manifest.deepDive)
    && edges.every(edgePresent)
    && pathPresent;
}

function buildNodeApplyPlan(packageDir, options = {}) {
  const root = path.resolve(options.root || ROOT);
  const inspected = inspectPackage(packageDir);
  const manifest = inspected.manifest;
  const blockers = [...inspected.errors];
  const graph = loadGraph(root);
  if ((graph.nodes || []).some(node => node.id === manifest.node.id)) {
    if (isInstalled(graph, manifest, root)) {
      const plan = {
        schemaVersion: 1,
        mode: "node-atomic-application",
        status: "ready",
        idempotent: true,
        packageHash: manifest.packageHash,
        graphHash: graphFingerprint(graph),
        generatedAt: new Date().toISOString(),
        root,
        operations: [{ type: "no-op", nodeId: manifest.node.id }],
        blockers: [],
        targets: []
      };
      const copy = clone(plan);
      plan.planHash = sha256(copy);
      return plan;
    }
    blockers.push(`节点 ID 已被不同内容占用：${manifest.node.id}`);
  }
  const currentGraphHash = graphFingerprint(graph);
  if (currentGraphHash !== manifest.bindings.graphHash) {
    blockers.push("正式地图自原子包生成后已经变化；需要重新生成集成计划，不重新进行知识复核");
  }
  if (!manifest.layout || !manifest.layout.position) blockers.push("原子包缺少布局坐标");
  if (!manifest.learningPath || !(manifest.learningPath.reindex || []).length) {
    blockers.push("原子包缺少学习路径机械顺延计划");
  }
  let targets = [];
  let operations = [];
  if (!blockers.length) {
    const graphContent = readTextIfExists(withinRoot(root, "data/graph.js"));
    const indexContent = readTextIfExists(withinRoot(root, "index.html"));
    const deepDiveContent = fs.readFileSync(inspected.deepDiveFile, "utf8");
    targets = [
      targetRecord(root, "data/graph.js", transformGraph(graphContent, manifest)),
      targetRecord(root, "index.html", transformIndex(indexContent, manifest.node.id)),
      targetRecord(root, `data/deepdive/${manifest.node.id}.js`, deepDiveContent)
    ];
    operations = [
      { type: "add-node", nodeId: manifest.node.id },
      { type: "add-edges", count: manifest.edges.length },
      { type: "insert-learning-path", order: manifest.learningPath.order },
      { type: "apply-layout", position: manifest.layout.position },
      { type: "register-deepdive", nodeId: manifest.node.id }
    ];
  }
  const plan = {
    schemaVersion: 1,
    mode: "node-atomic-application",
    status: blockers.length ? "blocked" : "ready",
    idempotent: false,
    packageHash: manifest.packageHash,
    graphHash: currentGraphHash,
    generatedAt: new Date().toISOString(),
    root,
    operations,
    blockers,
    targets
  };
  const copy = clone(plan);
  plan.planHash = sha256(copy);
  return plan;
}

function planFingerprint(plan) {
  const copy = clone(plan);
  delete copy.generatedAt;
  delete copy.planHash;
  return sha256(copy);
}

function runIntegrationValidators(root) {
  const scripts = ["validate.js", "validate-deepdives.js"];
  const outputs = [];
  scripts.forEach(script => {
    const result = spawnSync(process.execPath, [path.join(ROOT, "tools", script)], {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, GRAPH_ROOT: root, DEEPDIVE_ROOT: root }
    });
    outputs.push(`${result.stdout || ""}${result.stderr || ""}`.trim());
    if (result.status !== 0) {
      const error = new Error(`写入后集成检查失败：${script}`);
      error.validatorOutput = outputs.join("\n");
      throw error;
    }
  });
  return outputs.join("\n");
}

function restoreTarget(root, target) {
  const file = withinRoot(root, target.relativePath);
  if (target.beforeExists) atomicWrite(file, target.beforeContent);
  else if (fs.existsSync(file)) fs.unlinkSync(file);
}

function applyNodePlan(plan, options = {}) {
  if (plan.status !== "ready" || plan.blockers.length) {
    throw new Error("节点应用计划被阻断：\n- " + plan.blockers.join("\n- "));
  }
  const copy = clone(plan);
  const expectedHash = copy.planHash;
  delete copy.planHash;
  if (sha256(copy) !== expectedHash) throw new Error("节点应用计划哈希不匹配");
  if (plan.idempotent) {
    const receipt = {
      schemaVersion: 1,
      status: "no-op",
      planHash: plan.planHash,
      packageHash: plan.packageHash,
      appliedAt: new Date().toISOString(),
      operations: clone(plan.operations),
      targets: []
    };
    receipt.receiptHash = sha256(receipt);
    return receipt;
  }
  const root = path.resolve(options.root || plan.root || ROOT);
  const written = [];
  try {
    plan.targets.forEach(target => {
      const file = withinRoot(root, target.relativePath);
      if (sha256(readTextIfExists(file)) !== target.beforeHash) {
        throw new Error(`目标自预览后已变化：${target.relativePath}`);
      }
      atomicWrite(file, target.afterContent);
      written.push(target);
    });
    const validatorOutput = runIntegrationValidators(root);
    const receipt = {
      schemaVersion: 1,
      status: "applied",
      planHash: plan.planHash,
      packageHash: plan.packageHash,
      appliedAt: new Date().toISOString(),
      root,
      operations: clone(plan.operations),
      targets: clone(plan.targets),
      validatorOutput
    };
    receipt.receiptHash = sha256(receipt);
    return receipt;
  } catch (error) {
    written.reverse().forEach(target => restoreTarget(root, target));
    error.message += "\n已自动恢复所有已写目标。";
    throw error;
  }
}

function rollbackNodeReceipt(receipt, options = {}) {
  if (!receipt || receipt.status !== "applied" || !Array.isArray(receipt.targets)) {
    throw new Error("节点回滚凭据无效");
  }
  const copy = clone(receipt);
  const expectedHash = copy.receiptHash;
  delete copy.receiptHash;
  if (sha256(copy) !== expectedHash) throw new Error("节点回滚凭据哈希不匹配");
  const root = path.resolve(options.root || receipt.root || ROOT);
  const restored = [];
  try {
    receipt.targets.forEach(target => {
      const file = withinRoot(root, target.relativePath);
      if (sha256(readTextIfExists(file)) !== target.afterHash) {
        throw new Error(`目标在应用后又被修改，拒绝覆盖：${target.relativePath}`);
      }
      restoreTarget(root, target);
      restored.push(target);
    });
    const validatorOutput = runIntegrationValidators(root);
    return {
      schemaVersion: 1,
      status: "rolled-back",
      receiptHash: expectedHash,
      rolledBackAt: new Date().toISOString(),
      validatorOutput
    };
  } catch (error) {
    restored.reverse().forEach(target => {
      atomicWrite(withinRoot(root, target.relativePath), target.afterContent);
    });
    error.message += "\n回滚失败，已恢复回滚前状态。";
    throw error;
  }
}

module.exports = {
  applyNodePlan,
  buildNodeApplyPlan,
  inspectPackage,
  packageSeal,
  planFingerprint,
  rollbackNodeReceipt,
  runIntegrationValidators,
  transformGraph,
  transformIndex
};
