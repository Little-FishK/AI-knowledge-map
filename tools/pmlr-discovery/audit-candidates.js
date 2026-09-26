"use strict";

const fs = require("node:fs");
const path = require("node:path");

function argumentsFrom(argv) {
  const result = { input: null, output: null };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--input") result.input = path.resolve(argv[++index]);
    else if (argv[index] === "--output") result.output = path.resolve(argv[++index]);
    else throw new Error("Usage: node audit-candidates.js --input candidates.jsonl --output <directory>");
  }
  if (!result.input || !result.output) throw new Error("--input and --output are required");
  return result;
}

function normalizeTitle(value) {
  return value.normalize("NFKC").replace(/[‘’]/g, "'").replace(/&/g, "and").replace(/[^a-z0-9]+/gi, " ").trim().toLowerCase();
}

const AWARD_URLS = {
  2024: "https://icml.cc/virtual/2024/awards_detail",
  2025: "https://icml.cc/virtual/2025/awards_detail",
  2026: "https://icml.cc/virtual/2026/awards_detail"
};
const ICML_2026_BLOG = "https://blog.icml.cc/2026/07/05/announcing-the-icml-2026-awards/";

const enabledWinners = [
  [2024, "Scaling Rectified Flow Transformers for High-Resolution Image Synthesis", "Best Paper"],
  [2024, "Discrete Diffusion Modeling by Estimating the Ratios of the Data Distribution", "Best Paper"],
  [2024, "Debating with More Persuasive LLMs Leads to More Truthful Answers", "Best Paper"],
  [2024, "Stealing part of a production language model", "Best Paper"],
  [2024, "Information Complexity of Stochastic Convex Optimization: Applications to Generalization, Memorization, and Tracing", "Best Paper"],
  [2024, "Probabilistic Inference in Language Models via Twisted Sequential Monte Carlo", "Best Paper"],
  [2024, "Genie: Generative Interactive Environments", "Best Paper"],
  [2024, "VideoPoet: A Large Language Model for Zero-Shot Video Generation", "Best Paper"],
  [2025, "Roll the dice & look before you leap: Going beyond the creative limits of next-token prediction", "Outstanding Paper"],
  [2025, "Conformal Prediction as Bayesian Quadrature", "Outstanding Paper"],
  [2025, "CollabLLM: From Passive Responders to Active Collaborators", "Outstanding Paper"],
  [2025, "The Value of Prediction in Identifying the Worst-Off", "Outstanding Paper"],
  [2025, "Train for the Worst, Plan for the Best: Understanding Token Ordering in Masked Diffusions", "Outstanding Paper"],
  [2025, "Score Matching with Missing Data", "Outstanding Paper"]
].map(([year, title, awardName]) => ({ year, title, awardName, awardUrl: AWARD_URLS[year] }));

const discoveryOnly = [
  [2024, "Position: Measure Dataset Diversity, Don't Just Claim It", "Best Paper listing / position paper", "Position-paper mechanism is not enabled."],
  [2024, "Position: Considerations for Differentially Private Learning with Large-Scale Public Pretraining", "Best Paper listing / position paper", "Position-paper mechanism is not enabled."],
  [2025, "Position: AI Safety should prioritize the Future of Work", "Outstanding Position Paper", "Outstanding Position Paper does not inherit the main research-paper mechanism."],
  [2025, "Position: The AI Conference Peer Review Crisis Demands Author Feedback and Reviewer Rewards", "Outstanding Position Paper", "Outstanding Position Paper does not inherit the main research-paper mechanism."]
].map(([year, title, awardName, reason]) => ({ year, title, awardName, reason, awardUrl: AWARD_URLS[year] }));

const supported = new Map();

const pendingPmlrPublication = {
  volume: 306,
  checkedUrl: "https://proceedings.mlr.press/v306/",
  httpStatus: 404,
  checkedAt: "2026-09-24",
  note: "ICML 2026 awards exist, but the reserved PMLR volume is not on the official PMLR index and its direct URL returns 404, so those papers are not PMLR candidates yet.",
  knownAwardedPapers: [
    "The Flexibility Trap: Rethinking the Value of Arbitrary Order in Diffusion Language Models",
    "High-accuracy sampling for diffusion models and log-concave distributions"
  ]
};

const enabledByTitle = new Map(enabledWinners.map(record => [normalizeTitle(record.title), record]));
const discoveryByTitle = new Map(discoveryOnly.map(record => [normalizeTitle(record.title), record]));

function passed(candidate, award, contribution) {
  return {
    ...candidate,
    disposition: "passed",
    reasonCode: "ALL_SIX_PASSED",
    reviewDepth: "six-steps",
    allSixStepsCompleted: true,
    steps: [1, 2, 3, 4, 5, 6].map(step => ({ step, status: "passed" })),
    evaluation: {
      mechanismId: `icml-${award.year}-main-paper-award`,
      venue: "ICML",
      awardYear: award.year,
      track: "Main research papers",
      awardName: award.awardName,
      recipientStatus: "winner",
      evidenceUrl: award.awardUrl,
      contributionEvidenceUrl: ICML_2026_BLOG,
      identityEvidence: "ICML official award title and authors match the official PMLR paper record."
    },
    aiDevelopmentContribution: {
      status: "supported",
      specificChangeToAi: contribution.change,
      externalAssessment: contribution.assessment,
      limits: contribution.limits
    },
    contentReview: {
      status: "passed-limited-use",
      materialSufficiency: "PMLR final record, ICML award record, committee explanation, and prior reviewed paper material support a bounded description.",
      currentStanding: "No retraction or award-withdrawal notice was found in the checked PMLR, ICML award, and prior review records as of 2026-09-24; this is not an exhaustive global dispute search.",
      duplicateDisposition: "merge-evidence",
      existingLibraryId: contribution.existingLibraryId,
      rightsCheck: "Only bibliographic metadata, links, and original short commentary may be published; no full paper or figures are reproduced."
    },
    linkedNodes: contribution.nodes,
    arxivId: contribution.arxivId,
    checkedAt: "2026-09-24"
  };
}

function needsEvidence(candidate, award) {
  return {
    ...candidate,
    disposition: "needs-evidence",
    reasonCode: "FORMAL_AWARD_VERIFIED_BUT_MAJOR_AI_CONTRIBUTION_EVIDENCE_MISSING",
    reviewDepth: "through-step-5-evidence-gap",
    allSixStepsCompleted: false,
    steps: [
      { step: 1, status: "passed" },
      { step: 2, status: "passed", note: `${award.awardName} exact official match.` },
      { step: 3, status: "passed", note: "Official award identity matches the PMLR final record." },
      { step: 4, status: "passed-limited-check", note: "No withdrawal signal on the checked official pages." },
      { step: 5, status: "needs-evidence", note: "The official award list supplies the result and author abstract, but no committee explanation or independent professional evidence was located that establishes the specific major contribution to AI." },
      { step: 6, status: "not-run" }
    ],
    evaluation: {
      mechanismId: `icml-${award.year}-main-paper-award`,
      venue: "ICML",
      awardYear: award.year,
      track: "Main research papers",
      awardName: award.awardName,
      recipientStatus: "winner",
      evidenceUrl: award.awardUrl
    },
    aiDevelopmentContribution: { status: "needs evidence" },
    checkedAt: "2026-09-24"
  };
}

function deferred(candidate, discovery) {
  return {
    ...candidate,
    disposition: "deferred",
    reasonCode: discovery ? "AWARD_CLASS_OR_TRACK_NOT_ENABLED" : "NO_ENABLED_FORMAL_EVALUATION_MATCH",
    reviewDepth: "identity-and-mechanism-gate",
    allSixStepsCompleted: false,
    steps: [
      { step: 1, status: "passed", note: "Official PMLR final record established." },
      { step: 2, status: "deferred", note: discovery ? discovery.reason : "No exact match to an enabled formal paper-award mechanism in this evidence set." }
    ],
    ...(discovery ? { discoveryAward: { awardName: discovery.awardName, evidenceUrl: discovery.awardUrl } } : {}),
    checkedAt: "2026-09-24"
  };
}

function main() {
  const options = argumentsFrom(process.argv.slice(2));
  fs.mkdirSync(options.output, { recursive: true });
  const candidates = fs.readFileSync(options.input, "utf8").trim().split(/\r?\n/).map(line => JSON.parse(line));
  const results = [];
  const selected = [];
  const evidenceGaps = [];
  const awardMatches = [];
  const counts = { passed: 0, "needs-evidence": 0, deferred: 0 };
  const byYear = {};

  for (const candidate of candidates) {
    const key = normalizeTitle(candidate.title);
    const award = enabledByTitle.get(key);
    const discovery = discoveryByTitle.get(key);
    const contribution = supported.get(key);
    const result = award ? (contribution ? passed(candidate, award, contribution) : needsEvidence(candidate, award)) : deferred(candidate, discovery);
    results.push(result);
    counts[result.disposition] += 1;
    byYear[candidate.publicationYear] ||= { candidates: 0, passed: 0, "needs-evidence": 0, deferred: 0 };
    byYear[candidate.publicationYear].candidates += 1;
    byYear[candidate.publicationYear][result.disposition] += 1;
    if (result.disposition === "passed") selected.push(result);
    if (result.disposition === "needs-evidence") evidenceGaps.push(result);
    if (award || discovery) awardMatches.push(result);
  }

  if (selected.length !== supported.size) throw new Error(`Expected ${supported.size} supported records, found ${selected.length}`);
  if (evidenceGaps.length !== enabledWinners.length - supported.size) throw new Error(`Expected ${enabledWinners.length - supported.size} evidence gaps, found ${evidenceGaps.length}`);
  if (awardMatches.length !== enabledWinners.length + discoveryOnly.length) throw new Error(`Expected ${enabledWinners.length + discoveryOnly.length} award matches, found ${awardMatches.length}`);
  if (Object.values(counts).reduce((sum, value) => sum + value, 0) !== candidates.length) throw new Error("Result total mismatch");

  const summary = {
    schemaVersion: 1,
    checkedAt: "2026-09-24",
    policyVersion: "1.2",
    candidatePolicy: "docs/PMLR_COLLECTION_POLICY.md",
    importancePolicy: "docs/ACADEMIC_IMPORTANCE_POLICY.md",
    candidates: candidates.length,
    ...counts,
    byYear,
    enabledAwardMatches: enabledWinners.length,
    discoveryOnlyAwardMatches: discoveryOnly.length,
    sixStepReviewsCompleted: selected.length,
    eligibleForPublication: selected.length,
    netNewLibraryRecords: 0,
    mergeWithExistingRecords: selected.length,
    pendingPmlrPublication,
    limits: "No in-scope PMLR record completed all six steps. The exact ICML 2024 and 2025 main-paper award winners remain needs-evidence; ordinary PMLR records stopped at gate 2. The two already-reviewed ICML 2026 papers cannot be counted as PMLR records until volume 306 is officially published."
  };

  fs.writeFileSync(path.join(options.output, "review-results.jsonl"), results.map(record => JSON.stringify(record)).join("\n") + "\n");
  fs.writeFileSync(path.join(options.output, "selected.json"), JSON.stringify({ status: "eligible-for-library-inclusion", records: selected }, null, 2) + "\n");
  fs.writeFileSync(path.join(options.output, "needs-evidence.json"), JSON.stringify(evidenceGaps, null, 2) + "\n");
  fs.writeFileSync(path.join(options.output, "award-matches.json"), JSON.stringify(awardMatches, null, 2) + "\n");
  fs.writeFileSync(path.join(options.output, "summary.json"), JSON.stringify(summary, null, 2) + "\n");
  console.log(JSON.stringify(summary, null, 2));
}

main();
