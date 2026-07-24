"use strict";

const fs = require("fs");
const path = require("path");
const {
  loadProjectData,
  parseArgs,
  readJson,
  writeJson
} = require("./core");
const {
  renderShadowReport,
  reviewProposal
} = require("./shadow-review");

function resolveFrom(base, value) {
  return path.isAbsolute(value) ? value : path.resolve(base, value);
}

function reviewBatch(manifest, options = {}) {
  if (!manifest || manifest.schemaVersion !== 1 || !Array.isArray(manifest.jobs)) {
    throw new Error("批处理 manifest 必须是 schemaVersion=1 且包含 jobs");
  }
  const base = options.base || process.cwd();
  const projectData = options.projectData || loadProjectData();
  const results = manifest.jobs.map((job, index) => {
      const id = job.id || `job-${index + 1}`;
    try {
      const proposal = readJson(resolveFrom(base, job.proposal));
      const evidence = readJson(resolveFrom(base, job.evidence));
      const assessmentFile = job.assessment ? resolveFrom(base, job.assessment) : null;
      const assessment = assessmentFile && fs.existsSync(assessmentFile)
        ? readJson(assessmentFile)
        : null;
      const report = reviewProposal(proposal, evidence, assessment, {
        projectData,
        generatedAt: options.generatedAt
      });
      if (options.writeReports && job.output) {
        const output = resolveFrom(base, job.output);
        writeJson(output, report);
        fs.writeFileSync(output.replace(/\.json$/i, "") + ".md", renderShadowReport(report), "utf8");
      }
      return {
        id,
        status: !assessment || report.validation.proposalErrors.length || report.validation.assessmentErrors.length
          ? "blocked"
          : "reviewed",
        summary: report.summary,
        candidates: report.candidates.map(candidate => ({
          term: candidate.term,
          proposalDecision: candidate.proposalDecision,
          independentDecision: candidate.independentDecision,
          decisionsAgree: candidate.decisionsAgree,
          predictedDecision: candidate.decisionsAgree ? candidate.independentDecision : null,
          predictedCore: candidate.shadowEligibility.coreNode,
          eligibleNew: candidate.shadowEligibility.newNode,
          blockers: candidate.blockers
        })),
        proposalErrors: report.validation.proposalErrors,
        assessmentErrors: report.validation.assessmentErrors
      };
    } catch (error) {
      return {
        id,
        status: "error",
        error: error.message,
        candidates: [],
        summary: {
          candidateCount: 0,
          agreementCount: 0,
          conflictCount: 0,
          autoEligibleNewCount: 0,
          autoEligibleCoreCount: 0,
          formalWrites: 0
        }
      };
    }
  });
  const totals = results.reduce((sum, result) => {
    sum.jobs++;
    sum[result.status] = (sum[result.status] || 0) + 1;
    Object.keys(result.summary).forEach(key => {
      sum[key] = (sum[key] || 0) + result.summary[key];
    });
    return sum;
  }, {
    jobs: 0,
    reviewed: 0,
    blocked: 0,
    error: 0,
    candidateCount: 0,
    agreementCount: 0,
    conflictCount: 0,
    autoEligibleNewCount: 0,
    autoEligibleCoreCount: 0,
    formalWrites: 0
  });
  return {
    schemaVersion: 1,
    mode: "shadow-batch",
    generatedAt: options.generatedAt || new Date().toISOString(),
    totals,
    results
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.manifest || !args.output) {
    console.error("用法：node tools/video-ingest/review-shadow-batch.js --manifest <batch.json> --output <summary.json> [--write-reports]");
    process.exit(2);
  }
  const manifestFile = path.resolve(args.manifest);
  const manifest = readJson(manifestFile);
  const result = reviewBatch(manifest, {
    base: path.dirname(manifestFile),
    writeReports: Boolean(args["write-reports"])
  });
  const output = path.resolve(args.output);
  writeJson(output, result);
  console.log(`✓ v0.3 批量影子复核完成：${result.totals.jobs} 个任务`);
  console.log(`  reviewed=${result.totals.reviewed} blocked=${result.totals.blocked} error=${result.totals.error}`);
  console.log(`  新节点影子合格=${result.totals.autoEligibleNewCount} 核心影子合格=${result.totals.autoEligibleCoreCount} 正式写入=${result.totals.formalWrites}`);
  if (result.totals.error) process.exitCode = 1;
}

if (require.main === module) main();

module.exports = { reviewBatch };
