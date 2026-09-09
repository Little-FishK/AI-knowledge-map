"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");
const { loadDeepDivePages: loadDeepDivePagesFromDisk } = require("../../deepdive/runtime/deepdive-loader");
const { transformGraph: transformGraphSource } = require("../../video-ingest/node-application");
const { graphFingerprint: fingerprintGraph } = require("../../video-ingest/shadow-review");
const { standaloneLayoutSource } = require("../../deepdive/runtime/standalone-page-source");
const { pageContentHash } = require("../../deepdive/quality/deepdive-audit-contracts");
const {evaluateAudit}=require('../../deepdive/quality/audit-evaluation');
const {sha256}=require('./state-store');
const {createEditorialCandidateValidation}=require('./editorial-candidate-validation');
const {editorialContentPolicyGaps}=createEditorialCandidateValidation({sha256,isConfiguredRemovedSectionTitle:()=>false});

function previewReferenceBenchmark(benchmark, id, candidateHash) {
  if (benchmark?.reference?.id !== id) throw new Error(`只能预检已登记参照页：${benchmark?.reference?.id || '未登记'}；本次候选为${id}`);
  if (!/^sha256:[a-f0-9]{64}$/.test(candidateHash)) throw new Error('候选摘要无效');
  const copy = JSON.parse(JSON.stringify(benchmark));
  copy.reference.pageHash = candidateHash;
  return copy;
}

function sanitizedGateDiagnostic(r) {
  return {script:r.script,passed:r.passed,
    referenceHashDrift:r.output.includes('L3 参照页哈希漂移'),
    missingReference:r.output.includes('L3 参照页不存在'),
    exceptionType:(r.output.match(/\b(TypeError|ReferenceError|SyntaxError|RangeError):/)||[])[1]||null,
    missingFile:(r.output.match(/ENOENT[^\n]*[\\/]([^\\/'"\r\n]+)['"]?/)||[])[1]||null,
    missingModule:(r.output.match(/Cannot find module ['"]([^'"\r\n]+)['"]/)||[])[1]?.split(/[\\/]/).pop()||null,
    propertyName:(r.output.match(/Cannot read properties of (?:undefined|null) \(reading '([A-Za-z0-9_]+)'\)/)||[])[1]||null};
}

function createCandidateGate(dependencies) {
  const {
    defaultRoot,
    toolScripts,
    acquireLock,
    appendEvent,
    applyCoreMembership,
    clone,
    currentPage,
    graphFingerprint = fingerprintGraph,
    loadDeepDivePages = loadDeepDivePagesFromDisk,
    loadRuntimeIds,
    loadState,
    pageRegistrationSource,
    readJson,
    runtimeManifestSource,
    runtimeSource,
    saveState,
    transformGraph = transformGraphSource,
    withinRoot,
  } = dependencies;

  function stageCandidateInFixture(fixture, record, page, audit) {
    const id = record.id;
    if (record.integration) {
      let graphSource = fs.readFileSync(path.join(fixture, "data", "graph.js"), "utf8");
      const graphContext = { window: {} };
      vm.createContext(graphContext);
      vm.runInContext(graphSource, graphContext);
      if (
        record.integration.bindings
        && record.integration.bindings.graphHash
        && graphFingerprint(graphContext.window.GRAPH) !== record.integration.bindings.graphHash
      ) {
        throw new Error("正式地图已变化；新节点集成包需要重新计算学习路径与布局");
      }
      const manifest = { ...clone(record.integration), deepDive: page };
      graphSource = transformGraph(graphSource, manifest);
      if (manifest.core && manifest.core.requested) graphSource = applyCoreMembership(graphSource, id);
      fs.writeFileSync(path.join(fixture, "data", "graph.js"), graphSource, "utf8");
      fs.writeFileSync(
        path.join(fixture, "data", "deepdive", `${id}.js`),
        pageRegistrationSource(id, page),
        "utf8",
      );
    }
    fs.writeFileSync(
      path.join(fixture, "data", "deepdive", `${id}.js`),
      pageRegistrationSource(id, page),
      "utf8",
    );
    fs.writeFileSync(
      path.join(fixture, "data", "deepdive", ".standalone-pages.json"),
      standaloneLayoutSource(
        fs.readdirSync(path.join(fixture, "data", "deepdive")).filter(file => file.endsWith(".js")).length,
      ),
      "utf8",
    );
    fs.mkdirSync(path.join(fixture, "docs", "deepdive-audits"), { recursive: true });
    fs.writeFileSync(
      path.join(fixture, "docs", "deepdive-audits", `${id}.json`),
      `${JSON.stringify(audit, null, 2)}\n`,
      "utf8",
    );
    const compiled = loadDeepDivePages(fixture)[id];
    const runtimeIds = loadRuntimeIds(fixture);
    fs.writeFileSync(
      path.join(fixture, "data", "deepdive-runtime", `${id}.js`),
      runtimeSource(id, compiled),
      "utf8",
    );
    fs.writeFileSync(
      path.join(fixture, "data", "deepdive-runtime", "manifest.js"),
      runtimeManifestSource([...runtimeIds, id]),
      "utf8",
    );
  }

  function copyFixture(root) {
    const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "deepdive-stage2-"));
    fs.mkdirSync(path.join(fixture, "data"), { recursive: true });
    fs.mkdirSync(path.join(fixture, "docs"), { recursive: true });
    fs.copyFileSync(path.join(root, "index.html"), path.join(fixture, "index.html"));
    fs.copyFileSync(path.join(root, "data", "graph.js"), path.join(fixture, "data", "graph.js"));
    fs.cpSync(path.join(root, "data", "deepdive"), path.join(fixture, "data", "deepdive"), { recursive: true });
    fs.cpSync(path.join(root, "data", "deepdive-runtime"), path.join(fixture, "data", "deepdive-runtime"), { recursive: true });
    const docs = [
      "deepdive-l3-benchmark.json",
      "deepdive-l3-baseline.json",
      "deepdive-quality-baseline.json",
      "deepdive-quality-reviews.json",
    ];
    docs.forEach(name => {
      const source = path.join(root, "docs", name);
      if (fs.existsSync(source)) fs.copyFileSync(source, path.join(fixture, "docs", name));
    });
    const auditSource = path.join(root, "docs", "deepdive-audits");
    if (fs.existsSync(auditSource)) {
      fs.cpSync(auditSource, path.join(fixture, "docs", "deepdive-audits"), { recursive: true });
    }
    return fixture;
  }

  function runGate(root, fixture, script, args = []) {
    const result = spawnSync(process.execPath, [path.join(root, ...script.split("/")), ...args], {
      cwd: fixture,
      encoding: "utf8",
      env: {
        ...process.env,
        GRAPH_ROOT: fixture,
        DEEPDIVE_ROOT: fixture,
      },
    });
    return {
      script,
      passed: result.status === 0,
      output: `${result.stdout || ""}${result.stderr || ""}`.trim(),
    };
  }

  function gateDefects(result, id) {
    // A stale reference is a controller maintenance issue, not a teaching gap.
    // Keep the gate blocked and give repair workers an actionable stop reason.
    if (sanitizedGateDiagnostic(result).referenceHashDrift) {
      return [{
        type: "gate",
        gate: result.script,
        code: "reference-hash-drift",
        message: "L3参照页内容与已登记基准摘要不一致；需要控制器维护流程审查基准版本。保持阻断，不通过正文返修、删除章节或降低评分门槛解决。",
      }];
    }
    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const issuePattern = new RegExp(`^\\s*-\\s+${escapedId}:\\s+([A-Za-z0-9._-]+)\\s*$`, "gm");
    const issues = [...result.output.matchAll(issuePattern)].map(match => match[1]);
    if (!issues.length) {
      return [{
        type: "gate",
        gate: result.script,
        message: `${result.script} 未通过；读者可见缺口必须融入原有教学过程。`,
      }];
    }
    const labels = {
      definition: "定义",
      problem: "解决的问题",
      inputOutput: "输入与输出",
      mechanism: "工作机制",
      interpretation: "结果解释",
      boundary: "适用边界",
    };
    const bySection = new Map();
    issues.forEach(code => {
      const sectionMatch = code.match(/section-(\d+)$/);
      const section = sectionMatch ? Number(sectionMatch[1]) : null;
      const key = section || 0;
      if (!bySection.has(key)) bySection.set(key, { codes: [], missing: new Set() });
      const group = bySection.get(key);
      group.codes.push(code);
      Object.keys(labels).forEach(part => {
        if (code.includes(part)) group.missing.add(part);
      });
    });
    return [...bySection.entries()].map(([section, group]) => {
      const missing = [...group.missing];
      const names = missing.map(part => labels[part]).join("、") || "教学证据";
      return {
        type: "coverage",
        gate: result.script,
        section: section || null,
        missing,
        codes: group.codes,
        message: `${section ? `第 ${section} 节` : "当前页面"}：自动门禁无法从正文中的审计证据验证${names}；请在原有教学过程内澄清，不要追加合同式答案。`,
      };
    });
  }

  function evaluateCandidate(root, record, page, audit, options = {}) {
    const fixture = copyFixture(root);
    try {
      stageCandidateInFixture(fixture, record, page, audit);
      if(audit?.schemaVersion >= 3 || record.auditPolicyVersion === 4) {
        const findings=record.editorialWorkflow?.initialBlockingFindings||[];
        const evaluation=evaluateAudit(record.id,page,audit,{schemaVersion:4,mode:audit?.mode||'full',
          verificationFindings:findings,verificationScopeHash:sha256(findings)});
        const structural=runGate(root,fixture,toolScripts.deepDiveValidator);
        const formatBlockers=record.editorialWorkflow ? editorialContentPolicyGaps(page).map(message=>({type:'format-policy',code:'forbidden-section',message})) : [];
        return {passed:structural.passed&&evaluation.passed&&!formatBlockers.length,results:[structural],evaluation,
          blockers:[...(!structural.passed?gateDefects(structural,record.id):[]),...evaluation.blockers,...formatBlockers]};
      }
      let referenceUpdatePreview = null;
      if (options.referenceUpdatePreview === true) {
        const benchmarkPath = path.join(fixture, 'docs', 'deepdive-l3-benchmark.json');
        const benchmark = JSON.parse(fs.readFileSync(benchmarkPath, 'utf8'));
        const candidateHash = pageContentHash(page);
        const proposed = previewReferenceBenchmark(benchmark, record.id, candidateHash);
        fs.writeFileSync(benchmarkPath, JSON.stringify(proposed));
        referenceUpdatePreview = { pageId: record.id, oldReferenceHash: benchmark.reference.pageHash,
          candidateHash, scope: 'temporary-fixture-only', published: false, standardsChanged: false };
      }
      const results = [
        runGate(root, fixture, toolScripts.deepDiveValidator),
        runGate(root, fixture, toolScripts.deepDiveL2Audit, ["--require-candidate", record.id]),
        runGate(root, fixture, toolScripts.deepDiveL3Audit, ["--require-benchmark", record.id]),
      ];
      return {
        ...(referenceUpdatePreview ? {referenceUpdatePreview} : {}),
        passed: results.every(result => result.passed),
        results,
        blockers: results.filter(result => !result.passed)
          .flatMap(result => gateDefects(result, record.id)),
      };
    } finally {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  }

  function refreshBlockers(root = defaultRoot, id) {
    const resolvedRoot = path.resolve(root);
    const release = acquireLock(resolvedRoot);
    try {
      const state = loadState(resolvedRoot);
      const record = state.pages[id];
      if (!record) throw new Error(`不存在页面状态：${id}`);
      if (record.lease) throw new Error(`页面 ${id} 正在执行，不能刷新缺陷`);
      if (!record.auditFile) throw new Error(`页面 ${id} 没有可复用的独立审计`);
      const auditPath = withinRoot(resolvedRoot, record.auditFile);
      if (!fs.existsSync(auditPath)) throw new Error(`独立审计文件不存在：${record.auditFile}`);
      const audit = readJson(auditPath);
      const page = currentPage(resolvedRoot, record);
      const gate = evaluateCandidate(resolvedRoot, record, page, audit);
      record.blockers = clone(gate.blockers || []);
      if(gate.evaluation)record.qualityEvaluation=clone(gate.evaluation);
      record.updatedAt = new Date().toISOString();
      saveState(resolvedRoot, state);
      appendEvent(resolvedRoot, "blockers-refreshed", {
        id,
        blockerCount: record.blockers.length,
        passed: gate.passed,
      });
      return {
        status: "refreshed",
        pageId: id,
        passed: gate.passed,
        blockers: clone(record.blockers),
      };
    } finally {
      release();
    }
  }

  // Controller-only diagnostics: expose machine failures, never audit text or process output.
  function diagnoseCandidateGate(root = defaultRoot, id, options = {}) {
    const resolvedRoot = path.resolve(root);
    const release = acquireLock(resolvedRoot);
    try {
    const state = loadState(resolvedRoot), record = state.pages[id];
    if (!record) throw new Error(`不存在页面状态：${id}`);
    if (Object.values(state.pages).some(p=>p.lease)) throw new Error('活动租约期间不执行门禁诊断');
    if (!record.auditFile) throw new Error('没有可复用的独立审计');
    const audit = readJson(withinRoot(resolvedRoot, record.auditFile));
    const gate = evaluateCandidate(resolvedRoot, record, currentPage(resolvedRoot, record), audit, options);
    return {pageId:id,passed:gate.passed,
      ...(gate.evaluation?{evaluation:gate.evaluation}:{}),
      ...(gate.referenceUpdatePreview ? {referenceUpdatePreview:gate.referenceUpdatePreview} : {}),
      blockers:clone(gate.blockers),diagnostics:gate.results.map(sanitizedGateDiagnostic)};
    } finally { release(); }
  }

  return {
    evaluateCandidate,
    gateDefects,
    refreshBlockers,
    diagnoseCandidateGate,
    runGate,
    stageCandidateInFixture,
  };
}

module.exports = { createCandidateGate, sanitizedGateDiagnostic, previewReferenceBenchmark };
