"use strict";

const fs = require("node:fs");
const path = require("node:path");

const CHECKED_AT = "2026-09-24";
const MATCHES = {
  "10610665": {
    mechanismId: "icra-2024-best-conference-paper",
    awardName: "IEEE ICRA Best Conference Paper Award",
    awardUrl: "https://ewh.ieee.org/soc/ras/conf/fullysponsored/icra/icra%202024/awards-and-finalists/index.html",
    identityNote: "Official ICRA 2024 winner title corresponds to the IEEE Xplore record; the official page shortens the displayed title while the authors match Ajay Sridhar, Dhruv Shah, Catherine Glossop, and Sergey Levine.",
    aiContributionReason: "The official award page identifies the winner but gives no committee contribution statement explaining why NoMaD constitutes a major contribution to AI development. The abstract is author self-description and cannot fill this gate."
  },
  "10611477": {
    mechanismId: "icra-2024-best-conference-paper",
    awardName: "IEEE ICRA Best Conference Paper Award",
    awardUrl: "https://ewh.ieee.org/soc/ras/conf/fullysponsored/icra/icra%202024/awards-and-finalists/index.html",
    identityNote: "Official ICRA 2024 winner title and the listed collaboration authors correspond to the IEEE Xplore Open X-Embodiment record.",
    aiContributionReason: "The award page confirms the winner but does not state what the committee judged to be a major change to AI. The paper and affiliated project descriptions are not independent external evidence."
  },
  "11128000": {
    mechanismId: "icra-2025-best-conference-paper",
    awardName: "IEEE ICRA Best Conference Paper Award",
    awardUrl: "https://ewh.ieee.org/soc/ras/conf/fullysponsored/icra/ICRA2025/2025.ieee-icra.org/program/awards-and-finalists/index.html",
    identityNote: "Official ICRA 2025 title and three authors exactly correspond to IEEE Xplore article 11128000.",
    aiContributionReason: "The committee says the paper provides a general way to compute tight uncertainty estimates for constrained optimization in robotics. That supports strong robotics merit, but it does not explicitly establish a major contribution to AI development under the site's gate."
  },
  "11128482": {
    mechanismId: "icra-2025-best-conference-paper",
    awardName: "IEEE ICRA Best Conference Paper Award",
    awardUrl: "https://ewh.ieee.org/soc/ras/conf/fullysponsored/icra/ICRA2025/2025.ieee-icra.org/program/awards-and-finalists/index.html",
    identityNote: "Official ICRA 2025 title and five authors exactly correspond to IEEE Xplore article 11128482.",
    aiContributionReason: "The committee describes a learned metric-aware uncertainty model improving visual-odometry robustness and accuracy. This is an explicit contribution statement, but it describes a bounded robotics advance rather than independently establishing a major change to AI development."
  }
};

function args(argv) {
  const result = { input: null, output: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--input") result.input = path.resolve(argv[++i]);
    else if (argv[i] === "--output") result.output = path.resolve(argv[++i]);
    else throw new Error("Usage: node review-candidate-pool.js --input candidates.jsonl --output <directory>");
  }
  if (!result.input || !result.output) throw new Error("--input and --output are required");
  return result;
}

function main() {
  const options = args(process.argv.slice(2));
  fs.mkdirSync(options.output, { recursive: true });
  const candidates = fs.readFileSync(options.input, "utf8").trim().split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
  const reviewed = [];
  const needsEvidence = [];
  const selected = [];
  const byYear = {};

  for (const candidate of candidates) {
    const match = MATCHES[candidate.articleNumber];
    let review;
    if (match) {
      review = {
        ...candidate,
        relevanceScreening: "relevant",
        candidateStatus: "reviewed-needs-evidence",
        importanceReview: {
          status: "needs-evidence",
          mechanismMatch: "enabled-exact-match",
          mechanismId: match.mechanismId,
          awardName: match.awardName,
          awardUrl: match.awardUrl,
          steps: {
            1: { status: "passed", note: "IEEE Xplore research-paper candidate; AI/robot-learning relevance confirmed." },
            2: { status: "passed", note: `Exact winner match to ${match.mechanismId}.` },
            3: { status: "passed", note: match.identityNote },
            4: { status: "limited-pass", note: `IEEE Xplore record and official award page checked ${CHECKED_AT}; no visible correction, withdrawal, retraction, or award revocation marker was found. This is a dated check, not proof that no future issue can arise.` },
            5: { status: "needs-evidence", note: match.aiContributionReason },
            6: { status: "not-run", note: "Importance gate not passed." }
          },
          aiDevelopmentContribution: {
            status: "needs-evidence",
            changedWhat: candidate.abstract,
            significanceEvidence: match.aiContributionReason,
            evaluator: "IEEE ICRA Awards Committee / official conference award page",
            evaluatorRelationship: "External conference committee; author relationships not asserted beyond the official committee role."
          },
          decisionReason: "Formal award and paper identity are confirmed, but the required external evidence for a major contribution to AI development is not sufficient.",
          checkedAt: CHECKED_AT
        }
      };
      needsEvidence.push(review);
    } else {
      review = {
        ...candidate,
        candidateStatus: "reviewed-deferred",
        importanceReview: {
          status: "deferred",
          mechanismMatch: "no-enabled-exact-match",
          steps: {
            1: { status: "registered", note: "Candidate retained through a configured IEEE Xplore discovery route; semantic relevance is not claimed for every broad core-publication record." },
            2: { status: "deferred", note: "No exact match to an enabled mechanism for the same venue, year, track, award, and winner identity." },
            3: { status: "not-entered" },
            4: { status: "not-entered" },
            5: { status: "not-entered" },
            6: { status: "not-entered" }
          },
          decisionReason: "Stopped at the formal-evaluation gate. IEEE Xplore inclusion, venue, citations, downloads, Early Access, and keyword matches are not importance evidence.",
          checkedAt: CHECKED_AT
        }
      };
    }
    reviewed.push(review);
    const year = String(candidate.publicationYear);
    byYear[year] ||= { candidates: 0, passed: 0, "needs-evidence": 0, deferred: 0 };
    byYear[year].candidates += 1;
    byYear[year][review.importanceReview.status] += 1;
  }

  if (needsEvidence.length !== Object.keys(MATCHES).length) throw new Error(`Expected ${Object.keys(MATCHES).length} award matches, found ${needsEvidence.length}`);
  const summary = {
    schemaVersion: 1,
    checkedAt: CHECKED_AT,
    policyVersion: "1.2",
    candidatePolicy: "docs/IEEE_XPLORE_COLLECTION_POLICY.md",
    importancePolicy: "docs/ACADEMIC_IMPORTANCE_POLICY.md",
    candidates: candidates.length,
    passed: selected.length,
    "needs-evidence": needsEvidence.length,
    deferred: reviewed.length - needsEvidence.length,
    byYear,
    enabledMechanismsInCurrentPublicationScope: ["icra-2024-best-conference-paper", "icra-2025-best-conference-paper"],
    enabledAwardMatches: needsEvidence.length,
    sixStepReviewsCompleted: selected.length,
    eligibleForPublication: selected.length,
    limits: "Only exact ICRA Best Conference Paper winners match enabled IEEE mechanisms. The four winners reach step 5 but lack sufficient external support for the site's AI-major-contribution gate; all other candidates stop at step 2."
  };
  fs.writeFileSync(path.join(options.output, "review-results.jsonl"), reviewed.map(record => JSON.stringify(record)).join("\n") + "\n");
  fs.writeFileSync(path.join(options.output, "award-matches.json"), JSON.stringify(needsEvidence, null, 2) + "\n");
  fs.writeFileSync(path.join(options.output, "needs-evidence.json"), JSON.stringify(needsEvidence, null, 2) + "\n");
  fs.writeFileSync(path.join(options.output, "selected.json"), JSON.stringify(selected, null, 2) + "\n");
  fs.writeFileSync(path.join(options.output, "summary.json"), JSON.stringify(summary, null, 2) + "\n");
  console.log(JSON.stringify(summary, null, 2));
}

main();
