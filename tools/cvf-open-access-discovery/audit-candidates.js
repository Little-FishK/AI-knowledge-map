"use strict";

const fs = require("node:fs");
const path = require("node:path");

const CHECKED_AT = "2026-09-24";
const AWARD = {
  mechanismId: "cvpr-2025-best",
  venue: "CVPR",
  awardYear: 2025,
  track: "Technical papers",
  awardName: "Best Paper",
  title: "VGGT: Visual Geometry Grounded Transformer",
  authors: ["Jianyuan Wang", "Minghao Chen", "Nikita Karaev", "Andrea Vedaldi", "Christian Rupprecht", "David Novotny"],
  evidenceUrl: "https://cvpr.thecvf.com/Conferences/2025/BestPapersDemos"
};

function args(argv) {
  const result = { input: null, output: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--input") result.input = path.resolve(argv[++i]);
    else if (argv[i] === "--output") result.output = path.resolve(argv[++i]);
    else throw new Error("Usage: node audit-candidates.js --input candidates.jsonl --output <directory>");
  }
  if (!result.input || !result.output) throw new Error("--input and --output are required");
  return result;
}

function normalize(value) { return value.normalize("NFKC").replace(/[‘’]/g, "'").replace(/&/g, "and").replace(/[^a-z0-9]+/gi, " ").trim().toLowerCase(); }

function needsEvidence(candidate) {
  const identityMatches = candidate.venue === AWARD.venue && candidate.publicationYear === AWARD.awardYear && candidate.track === "main" && normalize(candidate.title) === normalize(AWARD.title) && candidate.authors.map(normalize).join("|") === AWARD.authors.map(normalize).join("|");
  if (!identityMatches) throw new Error(`Award identity mismatch for ${candidate.url}`);
  return {
    ...candidate,
    disposition: "needs-evidence",
    reasonCode: "FORMAL_AWARD_VERIFIED_BUT_MAJOR_AI_CONTRIBUTION_EVIDENCE_MISSING",
    reviewDepth: "through-step-5-evidence-gap",
    allSixStepsCompleted: false,
    steps: [
      { step: 1, status: "passed", note: "Official CVF Open Access final-paper identity established." },
      { step: 2, status: "passed", note: "Exact enabled CVPR 2025 Best Paper winner match; Honorable Mention and student/demo awards are excluded." },
      { step: 3, status: "passed", note: "Official award title and six authors match the CVF paper record." },
      { step: 4, status: "passed-limited-check", note: "No withdrawal signal is present in the checked official records." },
      { step: 5, status: "needs-evidence", note: "The award verifies distinction, but the checked record set still lacks an independent professional explanation of the paper's specific major contribution to AI development." },
      { step: 6, status: "not-run" }
    ],
    evaluation: { ...AWARD, recipientStatus: "winner" },
    aiDevelopmentContribution: { status: "needs evidence" },
    duplicateDisposition: { action: "merge-if-eventually-passed", existingSource: "arXiv:2503.11651" },
    checkedAt: CHECKED_AT
  };
}

function deferred(candidate) {
  return {
    ...candidate,
    disposition: "deferred",
    reasonCode: "NO_ENABLED_EXACT_FORMAL_EVALUATION_MATCH",
    reviewDepth: "identity-and-mechanism-gate",
    allSixStepsCompleted: false,
    steps: [
      { step: 1, status: "passed", note: `Official CVF Open Access ${candidate.track} paper identity established.` },
      { step: 2, status: "deferred", note: "No exact match to an enabled mechanism for this venue, publication year, track, full award name, and winner status. Acceptance and presentation labels do not substitute." }
    ],
    checkedAt: CHECKED_AT
  };
}

function main() {
  const options = args(process.argv.slice(2));
  fs.mkdirSync(options.output, { recursive: true });
  const candidates = fs.readFileSync(options.input, "utf8").trim().split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
  const awardCandidates = candidates.filter(record => normalize(record.title) === normalize(AWARD.title));
  if (awardCandidates.length !== 1) throw new Error(`Expected exactly one VGGT candidate, found ${awardCandidates.length}`);

  const results = candidates.map(candidate => candidate === awardCandidates[0] ? needsEvidence(candidate) : deferred(candidate));
  const selected = results.filter(record => record.disposition === "passed");
  const evidenceGaps = results.filter(record => record.disposition === "needs-evidence");
  const deferredRecords = results.filter(record => record.disposition === "deferred");
  const byYear = {};
  for (const result of results) {
    byYear[result.publicationYear] ||= { candidates: 0, passed: 0, "needs-evidence": 0, deferred: 0 };
    byYear[result.publicationYear].candidates += 1;
    byYear[result.publicationYear][result.disposition] += 1;
  }
  const summary = {
    schemaVersion: 1,
    checkedAt: CHECKED_AT,
    policyVersion: "1.2",
    candidatePolicy: "docs/CVF_OPEN_ACCESS_COLLECTION_POLICY.md",
    importancePolicy: "docs/ACADEMIC_IMPORTANCE_POLICY.md",
    candidates: candidates.length,
    passed: selected.length,
    "needs-evidence": evidenceGaps.length,
    deferred: deferredRecords.length,
    byYear,
    enabledMechanismsInCurrentPublicationScope: ["cvpr-2025-best"],
    enabledAwardMatches: evidenceGaps.length,
    sixStepReviewsCompleted: selected.length,
    eligibleForPublication: selected.length,
    netNewLibraryRecords: 0,
    mergeWithExistingRecords: 0,
    historicalSupplement: {
      mechanismId: "cvpr-2026-longuet-higgins",
      note: "This mechanism evaluates CVPR 2016 papers and is therefore a historical supplemental route, not part of the 2024-2026 publication candidate base."
    },
    limits: "Only the exact CVPR 2025 Best Paper mechanism is enabled for a paper published in this 2024-2026 CVF pool. VGGT reaches step 5 but remains needs-evidence; every other record stops at the formal-evaluation gate."
  };
  if (summary.candidates !== summary.passed + summary["needs-evidence"] + summary.deferred) throw new Error("Result conservation failed");
  fs.writeFileSync(path.join(options.output, "review-results.jsonl"), results.map(record => JSON.stringify(record)).join("\n") + "\n");
  fs.writeFileSync(path.join(options.output, "selected.json"), JSON.stringify({ status: "eligible-for-library-inclusion", records: selected }, null, 2) + "\n");
  fs.writeFileSync(path.join(options.output, "needs-evidence.json"), JSON.stringify(evidenceGaps, null, 2) + "\n");
  fs.writeFileSync(path.join(options.output, "award-matches.json"), JSON.stringify(evidenceGaps, null, 2) + "\n");
  fs.writeFileSync(path.join(options.output, "summary.json"), JSON.stringify(summary, null, 2) + "\n");
  console.log(JSON.stringify(summary, null, 2));
}

main();
