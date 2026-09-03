"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { isDeepStrictEqual } = require("util");
const {
  SEMANTIC_FINGERPRINT_ALGORITHM,
  integrityReport,
  loadGraphSource,
  semanticFingerprint,
} = require("./diagnostics");

const GRAPH_SHADOW_RELATIVE_PATH = "data/graph-shadow";
const GRAPH_ARTIFACT_RELATIVE_PATH = "data/graph.js";
const MANIFEST_FILE = "manifest.json";
const SAFE_SEGMENT = /^[a-z0-9][a-z0-9-]*$/;
const TOP_LEVEL_FILES = Object.freeze({
  meta: "meta.json",
  core: "core.json",
  recommendedLearningPath: "learning-path.json",
  positions: "positions.json",
  domains: "taxonomy.json",
  edgeTypes: "taxonomy.json",
  edges: "edges.json",
});

function prettyJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function renderGraphSource(graph) {
  return `window.GRAPH = ${JSON.stringify(graph, null, 2)};\n`;
}

function atomicWrite(file, content) {
  const temporary = `${file}.tmp-${process.pid}-${Date.now()}`;
  try {
    fs.writeFileSync(temporary, content, "utf8");
    fs.renameSync(temporary, file);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}

function contentDigest(content) {
  return `sha256:${crypto.createHash("sha256").update(content).digest("hex")}`;
}

function validDigest(value) {
  return /^sha256:[a-f0-9]{64}$/.test(String(value || ""));
}

function safeFile(root, relativePath) {
  const normalized = String(relativePath || "").replace(/\\/g, "/");
  if (!normalized || path.posix.isAbsolute(normalized)) {
    throw new Error(`图分片路径无效：${relativePath}`);
  }
  const clean = path.posix.normalize(normalized);
  if (clean === ".." || clean.startsWith("../")) {
    throw new Error(`图分片路径越界：${relativePath}`);
  }
  const absolute = path.resolve(root, clean);
  const relative = path.relative(path.resolve(root), absolute);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`图分片路径越界：${relativePath}`);
  }
  return absolute;
}

function writeShard(directory, relativePath, value, fileRecords) {
  const file = safeFile(directory, relativePath);
  const content = prettyJson(value);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, "utf8");
  fileRecords.push({
    path: relativePath.replace(/\\/g, "/"),
    bytes: Buffer.byteLength(content, "utf8"),
    digest: contentDigest(content),
  });
}

function readVerifiedJson(directory, record) {
  if (!record || typeof record.path !== "string" || !validDigest(record.digest)) {
    throw new Error("图分片清单记录无效");
  }
  const file = safeFile(directory, record.path);
  if (!fs.existsSync(file)) throw new Error(`图分片不存在：${record.path}`);
  const content = fs.readFileSync(file, "utf8");
  if (Buffer.byteLength(content, "utf8") !== record.bytes) {
    throw new Error(`图分片字节数不匹配：${record.path}`);
  }
  if (contentDigest(content) !== record.digest) {
    throw new Error(`图分片摘要不匹配：${record.path}`);
  }
  return JSON.parse(content);
}

function createManifest(graph, fileRecords, nodeFiles, options = {}) {
  const writeAuthority = options.writeAuthority || "official-graph";
  const authoritative = writeAuthority === "shards";
  const sectionDigests = Object.fromEntries(
    Object.entries(graph).map(([section, value]) => [section, semanticFingerprint(value)]),
  );
  return {
    schemaVersion: authoritative ? 2 : 1,
    kind: authoritative ? "graph-shard-store" : "graph-shard-shadow",
    readPath: GRAPH_ARTIFACT_RELATIVE_PATH,
    ...(authoritative ? {
      authority: {
        writes: "shards",
        runtimeArtifact: GRAPH_ARTIFACT_RELATIVE_PATH,
        runtimeArtifactGenerated: true,
      },
      generatedArtifact: {
        logicalPath: GRAPH_ARTIFACT_RELATIVE_PATH,
        digest: contentDigest(renderGraphSource(graph)),
      },
    } : {}),
    source: {
      logicalPath: authoritative ? GRAPH_SHADOW_RELATIVE_PATH : GRAPH_ARTIFACT_RELATIVE_PATH,
      algorithm: SEMANTIC_FINGERPRINT_ALGORITHM,
      digest: semanticFingerprint(graph),
      sectionDigests,
    },
    assembly: {
      topLevelOrder: Object.keys(graph),
      sectionFiles: {
        meta: TOP_LEVEL_FILES.meta,
        core: TOP_LEVEL_FILES.core,
        recommendedLearningPath: TOP_LEVEL_FILES.recommendedLearningPath,
        positions: TOP_LEVEL_FILES.positions,
        domains: TOP_LEVEL_FILES.domains,
        edgeTypes: TOP_LEVEL_FILES.edgeTypes,
        nodes: null,
        edges: TOP_LEVEL_FILES.edges,
      },
      nodeFiles,
    },
    counts: {
      nodes: Array.isArray(graph.nodes) ? graph.nodes.length : 0,
      edges: Array.isArray(graph.edges) ? graph.edges.length : 0,
      files: fileRecords.length + 1,
    },
    files: fileRecords,
  };
}

function verifyShadowDirectory(shadowDirectory, expectedSourceDigest = null) {
  const manifestPath = path.join(shadowDirectory, MANIFEST_FILE);
  if (!fs.existsSync(manifestPath)) throw new Error("图分片影子清单不存在");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const legacyShadow = manifest.schemaVersion === 1 && manifest.kind === "graph-shard-shadow";
  const authoritativeStore = manifest.schemaVersion === 2 && manifest.kind === "graph-shard-store";
  if (!legacyShadow && !authoritativeStore) {
    throw new Error("图分片影子清单版本或类型无效");
  }
  if (authoritativeStore && (
    !manifest.authority
    || manifest.authority.writes !== "shards"
    || manifest.authority.runtimeArtifact !== GRAPH_ARTIFACT_RELATIVE_PATH
    || manifest.authority.runtimeArtifactGenerated !== true
  )) {
    throw new Error("图分片权威声明无效");
  }
  if (expectedSourceDigest && manifest.source.digest !== expectedSourceDigest) {
    throw new Error("图分片影子来源指纹不匹配");
  }
  if (manifest.source.algorithm !== SEMANTIC_FINGERPRINT_ALGORITHM) {
    throw new Error("图分片影子指纹算法不匹配");
  }
  const records = new Map();
  (manifest.files || []).forEach(record => {
    if (records.has(record.path)) throw new Error(`图分片清单存在重复路径：${record.path}`);
    records.set(record.path, record);
  });
  const readPath = relativePath => {
    const record = records.get(relativePath);
    if (!record) throw new Error(`图分片未登记：${relativePath}`);
    return readVerifiedJson(shadowDirectory, record);
  };
  const taxonomy = readPath(TOP_LEVEL_FILES.domains);
  const values = {
    meta: readPath(TOP_LEVEL_FILES.meta),
    core: readPath(TOP_LEVEL_FILES.core),
    recommendedLearningPath: readPath(TOP_LEVEL_FILES.recommendedLearningPath),
    positions: readPath(TOP_LEVEL_FILES.positions),
    domains: taxonomy.domains,
    edgeTypes: taxonomy.edgeTypes,
    nodes: (manifest.assembly.nodeFiles || []).map(relativePath => readPath(relativePath)),
    edges: readPath(TOP_LEVEL_FILES.edges),
  };
  const graph = {};
  (manifest.assembly.topLevelOrder || []).forEach(section => {
    if (!Object.hasOwn(values, section)) throw new Error(`图分片包含未知顶层区块：${section}`);
    graph[section] = values[section];
  });
  const digest = semanticFingerprint(graph);
  if (digest !== manifest.source.digest) throw new Error("图分片重组后的整体语义指纹不匹配");
  if (authoritativeStore && (
    !manifest.generatedArtifact
    || manifest.generatedArtifact.logicalPath !== GRAPH_ARTIFACT_RELATIVE_PATH
    || manifest.generatedArtifact.digest !== contentDigest(renderGraphSource(graph))
  )) {
    throw new Error("图分片生成物声明与权威数据不匹配");
  }
  const sectionDigests = Object.fromEntries(
    Object.entries(graph).map(([section, value]) => [section, semanticFingerprint(value)]),
  );
  if (!isDeepStrictEqual(sectionDigests, manifest.source.sectionDigests)) {
    throw new Error("图分片重组后的区块语义指纹不匹配");
  }
  const integrity = integrityReport(graph);
  if (integrity.status !== "valid") throw new Error("图分片重组后未通过引用完整性检查");
  const registeredPaths = new Set([...(manifest.files || []).map(record => record.path), MANIFEST_FILE]);
  const actualPaths = [];
  const visit = directory => {
    fs.readdirSync(directory, { withFileTypes: true }).forEach(entry => {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else actualPaths.push(path.relative(shadowDirectory, absolute).replace(/\\/g, "/"));
    });
  };
  visit(shadowDirectory);
  const unexpectedFiles = actualPaths.filter(relativePath => !registeredPaths.has(relativePath));
  if (unexpectedFiles.length) throw new Error("图分片影子目录包含未登记文件");
  if (actualPaths.length !== registeredPaths.size) throw new Error("图分片影子文件数量不匹配");
  return {
    graph,
    integrity,
    manifest,
    report: {
      status: "valid",
      semanticDigest: digest,
      sectionDigestsMatch: true,
      fileCount: actualPaths.length,
      nodeFileCount: manifest.assembly.nodeFiles.length,
      integrityIssueCount: integrity.issueCount,
      writeAuthority: authoritativeStore ? "shards" : "official-graph",
    },
  };
}

function verifyGraphShadow(root, expectedSourceDigest = null) {
  return verifyShadowDirectory(
    path.join(path.resolve(root), GRAPH_SHADOW_RELATIVE_PATH),
    expectedSourceDigest,
  );
}

function createShadowStaging(
  resolvedRoot,
  graph,
  expectedSourceDigest,
  label = "staging",
  options = {},
) {
  const staging = path.join(
    resolvedRoot,
    "data",
    `.graph-shadow-${label}-${process.pid}-${Date.now()}`,
  );
  const fileRecords = [];
  fs.mkdirSync(staging, { recursive: false });
  try {
    writeShard(staging, TOP_LEVEL_FILES.meta, graph.meta, fileRecords);
    writeShard(staging, TOP_LEVEL_FILES.core, graph.core, fileRecords);
    writeShard(
      staging,
      TOP_LEVEL_FILES.recommendedLearningPath,
      graph.recommendedLearningPath,
      fileRecords,
    );
    writeShard(staging, TOP_LEVEL_FILES.positions, graph.positions, fileRecords);
    writeShard(staging, TOP_LEVEL_FILES.domains, {
      domains: graph.domains,
      edgeTypes: graph.edgeTypes,
    }, fileRecords);
    writeShard(staging, TOP_LEVEL_FILES.edges, graph.edges, fileRecords);
    const nodeFiles = [];
    (graph.nodes || []).forEach(node => {
      const domain = String(node && node.domain || "");
      const id = String(node && node.id || "");
      if (!SAFE_SEGMENT.test(domain) || !SAFE_SEGMENT.test(id)) {
        throw new Error(`节点 ${id || "[missing]"} 的 ID 或领域不能安全映射为分片路径`);
      }
      const relativePath = `nodes/${domain}/${id}.json`;
      nodeFiles.push(relativePath);
      writeShard(staging, relativePath, node, fileRecords);
    });
    const manifest = createManifest(graph, fileRecords, nodeFiles, options);
    fs.writeFileSync(path.join(staging, MANIFEST_FILE), prettyJson(manifest), "utf8");
    const staged = verifyShadowDirectory(staging, expectedSourceDigest);
    if (!isDeepStrictEqual(staged.graph, graph)) {
      throw new Error("图分片影子在发布前无法无损重组正式 graph.js");
    }
    return { staging, staged };
  } catch (error) {
    if (fs.existsSync(staging)) fs.rmSync(staging, { recursive: true, force: true });
    throw error;
  }
}

function shadowReport(status, sourceDigest, verified, extra = {}) {
  const sizes = verified.manifest.files.map(record => record.bytes);
  return {
    schemaVersion: verified.manifest.schemaVersion,
    status,
    readPathUnchanged: true,
    sourceDigest,
    shadowLogicalPath: GRAPH_SHADOW_RELATIVE_PATH,
    deepEqualAfterReload: true,
    sectionDigestsMatch: true,
    fileCount: verified.report.fileCount,
    nodeFileCount: verified.report.nodeFileCount,
    totalShardBytes: sizes.reduce((sum, bytes) => sum + bytes, 0),
    largestShardBytes: sizes.length ? Math.max(...sizes) : 0,
    integrityIssueCount: verified.integrity.issueCount,
    safeguards: {
      sourceWritten: false,
      frontendReadPathChanged: false,
      validatorsReadPathChanged: false,
      shadowIsAuthoritative: verified.report.writeAuthority === "shards",
    },
    ...extra,
  };
}

function prepareGraphShadowWrite(root) {
  const resolvedRoot = path.resolve(root);
  const { graph } = loadGraphSource(resolvedRoot);
  const sourceDigest = semanticFingerprint(graph);
  const sourceIntegrity = integrityReport(graph);
  if (sourceIntegrity.status !== "valid") {
    throw new Error("正式 graph.js 未通过引用完整性检查，拒绝进入图数据双写");
  }
  const shadowDirectory = path.join(resolvedRoot, GRAPH_SHADOW_RELATIVE_PATH);
  if (!fs.existsSync(shadowDirectory)) {
    throw new Error("图分片影子不存在，拒绝进入图数据双写");
  }
  const verified = verifyGraphShadow(resolvedRoot, sourceDigest);
  if (!isDeepStrictEqual(verified.graph, graph)) {
    throw new Error("正式 graph.js 与分片影子不等价，拒绝进入图数据双写");
  }
  return {
    sourceDigest,
    status: "ready",
  };
}

function verifyGraphAuthority(root, expectedSourceDigest = null) {
  const verified = verifyGraphShadow(root, expectedSourceDigest);
  if (
    verified.manifest.schemaVersion !== 2
    || verified.manifest.kind !== "graph-shard-store"
    || verified.report.writeAuthority !== "shards"
  ) {
    throw new Error("图分片尚未成为写入权威");
  }
  return verified;
}

function prepareGraphAuthorityWrite(root) {
  const resolvedRoot = path.resolve(root);
  const sourceFile = path.join(resolvedRoot, GRAPH_ARTIFACT_RELATIVE_PATH);
  const source = fs.readFileSync(sourceFile, "utf8");
  const official = loadGraphSource(resolvedRoot).graph;
  const sourceDigest = semanticFingerprint(official);
  const authoritative = verifyGraphAuthority(resolvedRoot, sourceDigest);
  if (!isDeepStrictEqual(authoritative.graph, official)) {
    throw new Error("生成的 graph.js 与权威图分片不等价，拒绝写入");
  }
  if (source !== renderGraphSource(authoritative.graph)) {
    throw new Error("生成的 graph.js 已被直接修改；请从权威图分片重新生成");
  }
  return {
    sourceDigest,
    status: "ready",
    writeAuthority: "shards",
  };
}

function authorityReport(status, sourceDigest, verified, extra = {}) {
  const base = shadowReport(status, sourceDigest, verified);
  const shardStoreWritten = extra.synchronized === true
    && (status === "written" || status === "promoted");
  const sourceWritten = shardStoreWritten || status === "materialized";
  return {
    ...base,
    writeAuthority: "shards",
    runtimeArtifact: GRAPH_ARTIFACT_RELATIVE_PATH,
    runtimeArtifactGenerated: true,
    ...extra,
    safeguards: {
      ...base.safeguards,
      sourceWritten,
      shardStoreWrittenFirst: shardStoreWritten,
      shadowIsAuthoritative: true,
    },
  };
}

function acquireGraphAuthorityLock(root) {
  const lockFile = path.join(path.resolve(root), "data", ".graph-authority-write.lock");
  let descriptor;
  try {
    descriptor = fs.openSync(lockFile, "wx");
    fs.writeFileSync(descriptor, `${JSON.stringify({
      pid: process.pid,
      createdAt: new Date().toISOString(),
    })}\n`, "utf8");
  } catch (error) {
    if (descriptor != null) {
      fs.closeSync(descriptor);
      if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
    }
    if (error.code === "EEXIST") {
      throw new Error("另一个图分片权威写入事务正在执行");
    }
    throw error;
  }
  return () => {
    fs.closeSync(descriptor);
    if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
  };
}

function commitGraphAuthorityUnlocked(root, candidateGraph, options = {}) {
  const {
    allowLegacyCurrent = false,
    expectedPreviousDigest = null,
    failpoint = null,
    status = "written",
  } = options;
  if (!validDigest(expectedPreviousDigest)) {
    throw new Error("expectedPreviousDigest 必须是完整 SHA-256 语义指纹");
  }
  const resolvedRoot = path.resolve(root);
  const sourceFile = path.join(resolvedRoot, GRAPH_ARTIFACT_RELATIVE_PATH);
  const sourceBefore = fs.readFileSync(sourceFile, "utf8");
  const officialBefore = loadGraphSource(resolvedRoot).graph;
  if (semanticFingerprint(officialBefore) !== expectedPreviousDigest) {
    throw new Error("生成的 graph.js 自写入计划形成后已经变化");
  }
  const current = verifyGraphShadow(resolvedRoot, expectedPreviousDigest);
  const currentIsAuthority = current.report.writeAuthority === "shards";
  if (!currentIsAuthority && !allowLegacyCurrent) {
    throw new Error("图分片尚未成为写入权威");
  }
  if (!isDeepStrictEqual(current.graph, officialBefore)) {
    throw new Error("写入前 graph.js 与图分片不等价");
  }
  if (currentIsAuthority && sourceBefore !== renderGraphSource(current.graph)) {
    throw new Error("生成的 graph.js 已被直接修改；请从权威图分片重新生成");
  }

  const graph = JSON.parse(JSON.stringify(candidateGraph));
  const sourceDigest = semanticFingerprint(graph);
  const sourceIntegrity = integrityReport(graph);
  if (sourceIntegrity.status !== "valid") {
    throw new Error("候选图未通过引用完整性检查，拒绝写入权威分片");
  }
  const generatedSource = renderGraphSource(graph);
  if (currentIsAuthority && sourceDigest === expectedPreviousDigest) {
    if (!isDeepStrictEqual(current.graph, graph)) {
      throw new Error("候选图指纹相同但内容与权威分片不等价");
    }
    return authorityReport("reused", sourceDigest, current, {
      previousSourceDigest: expectedPreviousDigest,
      synchronized: false,
    });
  }

  const { staging } = createShadowStaging(
    resolvedRoot,
    graph,
    sourceDigest,
    "authority-staging",
    { writeAuthority: "shards" },
  );
  const storeDirectory = path.join(resolvedRoot, GRAPH_SHADOW_RELATIVE_PATH);
  const backupDirectory = path.join(
    resolvedRoot,
    "data",
    `.graph-authority-backup-${process.pid}-${Date.now()}`,
  );
  let currentMoved = false;
  let stagedPublished = false;
  let artifactWritten = false;
  try {
    fs.renameSync(storeDirectory, backupDirectory);
    currentMoved = true;
    fs.renameSync(staging, storeDirectory);
    stagedPublished = true;
    if (failpoint === "after-shards") throw new Error("模拟故障：权威分片发布后");
    atomicWrite(sourceFile, generatedSource);
    artifactWritten = true;
    if (failpoint === "after-artifact") throw new Error("模拟故障：兼容生成物写入后");

    const verified = verifyGraphAuthority(resolvedRoot, sourceDigest);
    const officialAfter = loadGraphSource(resolvedRoot).graph;
    if (!isDeepStrictEqual(verified.graph, graph) || !isDeepStrictEqual(officialAfter, graph)) {
      throw new Error("权威分片或生成的 graph.js 写入后与候选图不等价");
    }
    if (fs.readFileSync(sourceFile, "utf8") !== generatedSource) {
      throw new Error("生成的 graph.js 不符合确定性序列化格式");
    }
    let backupCleanupPending = false;
    try {
      fs.rmSync(backupDirectory, { recursive: true, force: true });
    } catch (_cleanupError) {
      backupCleanupPending = fs.existsSync(backupDirectory);
    }
    currentMoved = false;
    return authorityReport(status, sourceDigest, verified, {
      previousSourceDigest: expectedPreviousDigest,
      synchronized: true,
      backupCleanupPending,
    });
  } catch (error) {
    if (artifactWritten || fs.readFileSync(sourceFile, "utf8") !== sourceBefore) {
      atomicWrite(sourceFile, sourceBefore);
    }
    if (stagedPublished && fs.existsSync(storeDirectory)) {
      fs.rmSync(storeDirectory, { recursive: true, force: true });
    }
    if (currentMoved && fs.existsSync(backupDirectory)) {
      fs.renameSync(backupDirectory, storeDirectory);
    }
    if (fs.existsSync(staging)) fs.rmSync(staging, { recursive: true, force: true });
    throw error;
  }
}

function commitGraphAuthority(root, candidateGraph, options = {}) {
  const release = acquireGraphAuthorityLock(root);
  try {
    return commitGraphAuthorityUnlocked(root, candidateGraph, options);
  } finally {
    release();
  }
}

function promoteGraphWriteAuthority(root, expectedSourceDigest) {
  return commitGraphAuthority(root, loadGraphSource(root).graph, {
    allowLegacyCurrent: true,
    expectedPreviousDigest: expectedSourceDigest,
    status: "promoted",
  });
}

function writeGraphAuthority(root, candidateGraph, options = {}) {
  return commitGraphAuthority(root, candidateGraph, {
    expectedPreviousDigest: options.expectedPreviousDigest,
    failpoint: options.failpoint,
    status: "written",
  });
}

function materializeGraphArtifact(root, expectedSourceDigest) {
  if (!validDigest(expectedSourceDigest)) {
    throw new Error("expectedSourceDigest 必须是完整 SHA-256 语义指纹");
  }
  const resolvedRoot = path.resolve(root);
  const verified = verifyGraphAuthority(resolvedRoot, expectedSourceDigest);
  const sourceFile = path.join(resolvedRoot, GRAPH_ARTIFACT_RELATIVE_PATH);
  const generatedSource = renderGraphSource(verified.graph);
  const current = fs.readFileSync(sourceFile, "utf8");
  if (current === generatedSource) {
    return authorityReport("reused", expectedSourceDigest, verified, {
      synchronized: false,
    });
  }
  atomicWrite(sourceFile, generatedSource);
  const reloaded = loadGraphSource(resolvedRoot).graph;
  if (!isDeepStrictEqual(reloaded, verified.graph)) {
    atomicWrite(sourceFile, current);
    throw new Error("从权威分片生成 graph.js 后内容不等价");
  }
  return authorityReport("materialized", expectedSourceDigest, verified, {
    synchronized: true,
  });
}

function syncGraphShadow(root, options = {}) {
  const { expectedPreviousDigest = null, expectedSourceDigest = null } = options;
  if (!validDigest(expectedPreviousDigest)) {
    throw new Error("expectedPreviousDigest 必须是完整 SHA-256 语义指纹");
  }
  if (expectedSourceDigest != null && !validDigest(expectedSourceDigest)) {
    throw new Error("expectedSourceDigest 必须是完整 SHA-256 语义指纹");
  }
  const resolvedRoot = path.resolve(root);
  const sourceFile = path.join(resolvedRoot, "data", "graph.js");
  const sourceBefore = fs.readFileSync(sourceFile, "utf8");
  const { graph } = loadGraphSource(resolvedRoot);
  const sourceDigest = semanticFingerprint(graph);
  if (expectedSourceDigest && sourceDigest !== expectedSourceDigest) {
    throw new Error("正式 graph.js 与本次双写预期的新语义指纹不一致");
  }
  const sourceIntegrity = integrityReport(graph);
  if (sourceIntegrity.status !== "valid") {
    throw new Error("正式 graph.js 未通过引用完整性检查，拒绝更新分片影子");
  }

  const shadowDirectory = path.join(resolvedRoot, GRAPH_SHADOW_RELATIVE_PATH);
  if (!fs.existsSync(shadowDirectory)) {
    throw new Error("图分片影子不存在；请先建立并验证双写基线");
  }
  const previous = verifyGraphShadow(resolvedRoot, expectedPreviousDigest);
  if (previous.manifest.source.digest === sourceDigest) {
    if (!isDeepStrictEqual(previous.graph, graph)) {
      throw new Error("图分片影子指纹相同但内容与正式 graph.js 不等价");
    }
    return shadowReport("reused", sourceDigest, previous, {
      previousSourceDigest: expectedPreviousDigest,
      synchronized: false,
    });
  }
  if (previous.report.writeAuthority === "shards") {
    throw new Error("图分片已经是写入权威；禁止从 graph.js 反向覆盖权威数据");
  }

  const { staging } = createShadowStaging(resolvedRoot, graph, sourceDigest, "sync-staging");
  const backupDirectory = path.join(
    resolvedRoot,
    "data",
    `.graph-shadow-sync-backup-${process.pid}-${Date.now()}`,
  );
  let previousMoved = false;
  let stagedPublished = false;
  try {
    fs.renameSync(shadowDirectory, backupDirectory);
    previousMoved = true;
    fs.renameSync(staging, shadowDirectory);
    stagedPublished = true;
    const verified = verifyGraphShadow(resolvedRoot, sourceDigest);
    if (!isDeepStrictEqual(verified.graph, graph)) {
      throw new Error("双写后的图分片影子与正式 graph.js 不深度等价");
    }
    if (fs.readFileSync(sourceFile, "utf8") !== sourceBefore) {
      throw new Error("分片同步期间正式 graph.js 再次发生变化");
    }
    let backupCleanupPending = false;
    try {
      fs.rmSync(backupDirectory, { recursive: true, force: true });
    } catch (_cleanupError) {
      backupCleanupPending = fs.existsSync(backupDirectory);
    }
    previousMoved = false;
    return shadowReport("synced", sourceDigest, verified, {
      previousSourceDigest: expectedPreviousDigest,
      synchronized: true,
      backupCleanupPending,
    });
  } catch (error) {
    if (stagedPublished && fs.existsSync(shadowDirectory)) {
      fs.rmSync(shadowDirectory, { recursive: true, force: true });
    }
    if (previousMoved && fs.existsSync(backupDirectory)) {
      fs.renameSync(backupDirectory, shadowDirectory);
    }
    if (fs.existsSync(staging)) fs.rmSync(staging, { recursive: true, force: true });
    throw error;
  }
}

function buildGraphShadow(root, expectedSourceDigest) {
  if (!validDigest(expectedSourceDigest)) {
    throw new Error("expectedSourceDigest 必须是完整 SHA-256 语义指纹");
  }
  const resolvedRoot = path.resolve(root);
  const sourceFile = path.join(resolvedRoot, "data", "graph.js");
  const sourceBefore = fs.readFileSync(sourceFile, "utf8");
  const { graph } = loadGraphSource(resolvedRoot);
  const sourceDigest = semanticFingerprint(graph);
  if (sourceDigest !== expectedSourceDigest) {
    throw new Error("正式 graph.js 语义指纹已经变化；请重新运行只读诊断");
  }
  const sourceIntegrity = integrityReport(graph);
  if (sourceIntegrity.status !== "valid") {
    throw new Error("正式 graph.js 未通过引用完整性检查，拒绝生成影子");
  }
  const shadowDirectory = path.join(resolvedRoot, GRAPH_SHADOW_RELATIVE_PATH);
  if (fs.existsSync(shadowDirectory)) {
    const existing = verifyGraphShadow(resolvedRoot, expectedSourceDigest);
    if (!isDeepStrictEqual(existing.graph, graph)) {
      throw new Error("现有图分片影子与正式 graph.js 不等价");
    }
    return {
      ...existing.report,
      schemaVersion: existing.manifest.schemaVersion,
      status: "reused",
      readPathUnchanged: true,
      sourceDigest,
      shadowLogicalPath: GRAPH_SHADOW_RELATIVE_PATH,
      deepEqualAfterReload: true,
      writeAuthority: existing.report.writeAuthority,
    };
  }

  let staging = null;
  try {
    const created = createShadowStaging(resolvedRoot, graph, expectedSourceDigest);
    staging = created.staging;
    fs.renameSync(staging, shadowDirectory);
    staging = null;
    const verified = verifyGraphShadow(resolvedRoot, expectedSourceDigest);
    if (!isDeepStrictEqual(verified.graph, graph)) {
      throw new Error("图分片影子从磁盘重组后与正式 graph.js 不深度等价");
    }
    const sourceAfter = fs.readFileSync(sourceFile, "utf8");
    if (sourceAfter !== sourceBefore) throw new Error("影子生成过程意外修改了正式 graph.js");
    return shadowReport("built", sourceDigest, verified);
  } catch (error) {
    if (staging && fs.existsSync(staging)) fs.rmSync(staging, { recursive: true, force: true });
    throw error;
  }
}

module.exports = {
  GRAPH_ARTIFACT_RELATIVE_PATH,
  GRAPH_SHADOW_RELATIVE_PATH,
  MANIFEST_FILE,
  TOP_LEVEL_FILES,
  buildGraphShadow,
  contentDigest,
  materializeGraphArtifact,
  prepareGraphAuthorityWrite,
  prepareGraphShadowWrite,
  promoteGraphWriteAuthority,
  renderGraphSource,
  syncGraphShadow,
  verifyGraphAuthority,
  verifyGraphShadow,
  writeGraphAuthority,
};
