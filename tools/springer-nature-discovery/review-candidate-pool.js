"use strict";

const fs = require("node:fs");
const path = require("node:path");

const CHECKED_AT = "2026-09-24";
const normalize = value => String(value || "").normalize("NFKC").replace(/[“”]/g, '"').replace(/[‘’]/g, "'")
  .replace(/[^\p{L}\p{N}]+/gu, " ").trim().toLowerCase();

const MATCHES = new Map([
  ["Minimalist Vision with Freeform Pixels", {
    mechanismId: "eccv-2024-best",
    awardName: "Best Paper",
    awardUrl: "https://eccv.ecva.net/Conferences/2024/Awards",
    contributionUrl: "https://eccv.ecva.net/media/eccv-2024/Slides/2822.pdf",
    contributionLocator: "ECCV 2024 opening ceremony awards slides, Best Paper citation",
    contributionNote: "The official ECCV award materials describe the work as a new framework for vision that replaces the conventional pixel grid with a very small set of learned freeform pixels. Together with the sole Best Paper designation, this directly identifies the contribution and its significance within computer vision.",
    siteUse: "Links sensing hardware design to learned visual inference and gives readers a concrete example of task-optimized, privacy-preserving, self-powered machine vision.",
    linkedNodes: ["computer-vision", "neural-network", "edge-ai"]
  }]
].map(([title, value]) => [normalize(title), value]));

function parseArgs(argv) {
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
  const options = parseArgs(process.argv.slice(2));
  fs.mkdirSync(options.output, { recursive: true });
  const candidates = fs.readFileSync(options.input, "utf8").trim().split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
  const reviewed = [];
  const selected = [];
  const byYear = {};
  const matched = new Set();

  for (const candidate of candidates) {
    const match = MATCHES.get(normalize(candidate.title));
    let review;
    if (match) {
      matched.add(normalize(candidate.title));
      review = {
        ...candidate,
        relevanceScreening: "relevant",
        candidateStatus: "reviewed-passed",
        importanceReview: {
          status: "passed",
          mechanismMatch: "enabled-exact-match",
          mechanismId: match.mechanismId,
          awardName: match.awardName,
          awardUrl: match.awardUrl,
          steps: {
            1: { status: "passed", note: "The paper entered through the mature-evaluation clue and is directly about learned visual sensing and inference." },
            2: { status: "passed", note: "Exact match to the ECCV 2024 main-conference Best Paper winner; honorable mentions and award candidates are excluded." },
            3: { status: "passed", note: "Official ECCV title and authors match the Springer Nature DOI record." },
            4: { status: "limited-pass", note: `Official award and publication pages checked ${CHECKED_AT}; no visible correction, retraction or award-revocation marker was found. This is a dated check.` },
            5: { status: "passed", note: match.contributionNote },
            6: { status: "passed", note: "Original paper and stable DOI are available; the topic has a distinct reader use and no exact library-title duplicate was found." }
          },
          aiDevelopmentContribution: {
            status: "supported",
            changedWhat: "Introduces a learned vision-system design in which task training determines a small number of freeform physical pixels jointly with the downstream inference network.",
            whyMajorRatherThanRelated: match.contributionNote,
            externalAssessments: [{
              url: match.contributionUrl,
              locator: match.contributionLocator,
              assessor: "ECCV 2024 program and award committee",
              relationshipToPaperAuthors: "External conference evaluation; no further independence is asserted.",
              supportedClaim: "A new framework for vision recognized as ECCV 2024 Best Paper.",
              checkedAt: CHECKED_AT
            }]
          },
          contentReview: {
            siteUse: match.siteUse,
            linkedNodes: match.linkedNodes,
            relevance: "passed",
            materialSufficiency: "passed",
            duplicateCheck: "passed",
            rightsCheck: "link-only-metadata",
            finalDisposition: "publish"
          },
          decisionReason: "All six steps close: exact official Best Paper match, Springer Nature publication identity, dated standing check, explicit official contribution citation, and a distinct library use.",
          checkedAt: CHECKED_AT
        }
      };
      selected.push(review);
    } else {
      review = {
        ...candidate,
        candidateStatus: "reviewed-deferred",
        importanceReview: {
          status: "deferred",
          mechanismMatch: "no-enabled-exact-match",
          steps: {
            1: { status: "registered", note: "Candidate retained through an exact AI-journal feed or strict AI-title route; source inclusion is not an importance claim." },
            2: { status: "deferred", note: "No exact match to an enabled mechanism for the same venue, year, track, award and winner identity in this evidence snapshot." },
            3: { status: "not-entered" }, 4: { status: "not-entered" }, 5: { status: "not-entered" }, 6: { status: "not-entered" }
          },
          decisionReason: "Stopped at the formal-evaluation gate. Springer Nature publication, journal reputation, citations, downloads and keyword matches do not establish importance under policy 1.2.",
          checkedAt: CHECKED_AT
        }
      };
    }
    reviewed.push(review);
    const year = String(candidate.publicationYear);
    byYear[year] ||= { candidates: 0, passed: 0, deferred: 0 };
    byYear[year].candidates += 1;
    byYear[year][review.importanceReview.status] += 1;
  }

  const missing = [...MATCHES.keys()].filter(title => !matched.has(title));
  if (missing.length) throw new Error(`Configured award winner missing from candidate pool: ${missing.join(" | ")}`);
  const summary = {
    schemaVersion: 1,
    checkedAt: CHECKED_AT,
    policyVersion: "1.2",
    candidatePolicy: "docs/SPRINGER_NATURE_COLLECTION_POLICY.md",
    importancePolicy: "docs/ACADEMIC_IMPORTANCE_POLICY.md",
    candidates: candidates.length,
    passed: selected.length,
    deferred: reviewed.length - selected.length,
    byYear,
    enabledMechanismsInCurrentPublicationScope: ["eccv-2024-best"],
    enabledAwardMatches: selected.length,
    sixStepReviewsCompleted: selected.length,
    eligibleForPublication: selected.length,
    limits: "Only the exact ECCV 2024 Best Paper match reached all six steps. Every other candidate stops at step 2; this does not mean that it has never won an award or is unimportant."
  };
  fs.writeFileSync(path.join(options.output, "review-results.jsonl"), reviewed.map(record => JSON.stringify(record)).join("\n") + "\n");
  fs.writeFileSync(path.join(options.output, "selected.json"), JSON.stringify(selected, null, 2) + "\n");
  fs.writeFileSync(path.join(options.output, "summary.json"), JSON.stringify(summary, null, 2) + "\n");
  fs.writeFileSync(path.join(options.output, "mechanism-reviews.json"), JSON.stringify([{ id: "eccv-2024-best", status: "enabled", venue: "ECCV", awardYear: 2024, track: "Main conference papers", awardName: "Best Paper", recipientStatus: "winner", officialResultUrl: "https://eccv.ecva.net/Conferences/2024/Awards", limits: "Only the single Best Paper winner; excludes Honorable Mention, Award Candidate, Koenderink Prize and individual awards." }], null, 2) + "\n");
  console.log(JSON.stringify(summary, null, 2));
}

main();
