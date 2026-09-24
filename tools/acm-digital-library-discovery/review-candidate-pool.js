"use strict";

const fs = require("node:fs");
const path = require("node:path");

const CHECKED_AT = "2026-09-24";

function normalize(value) {
  return String(value || "").normalize("NFKC").replace(/[“”]/g, '"').replace(/[‘’]/g, "'")
    .replace(/[^\p{L}\p{N}]+/gu, " ").trim().toLowerCase();
}

const MATCH_LIST = [
  {
    title: "WARP: An Efficient Engine for Multi-Vector Retrieval",
    mechanismId: "sigir-2025-best",
    awardName: "Best Paper Award",
    awardUrl: "https://sigir.org/awards/best-paper-awards/",
    note: "The SIGIR awards page confirms the Best Paper winner and authors but does not provide an independent explanation that the engine represents a major contribution to AI development."
  },
  {
    title: "A Framework for Auditing Chatbots for Dialect-Based Quality of Service Harms",
    mechanismId: "facct-2025-best",
    awardName: "Best Paper Award",
    awardUrl: "https://facctconference.org/2025/awards.html",
    note: "The FAccT committee praises an extensible external-audit framework for dialect performance. This establishes FAccT merit, but does not establish a major change to AI theory, methods, architecture, capability, infrastructure, or foundations."
  },
  {
    title: "External Evaluation of Discrimination Mitigation Efforts in Meta's Ad Delivery",
    mechanismId: "facct-2025-best",
    awardName: "Best Paper Award",
    awardUrl: "https://facctconference.org/2025/awards.html",
    note: "The FAccT committee highlights an independent evaluation of ad-delivery interventions. It is an important accountability result, but the cited statement does not identify a major contribution to AI development."
  },
  {
    title: "“You Cannot Sound Like GPT\": Signs of language discrimination and resistance in computer science publishing",
    mechanismId: "facct-2025-best",
    awardName: "Best Paper Award",
    awardUrl: "https://facctconference.org/2025/awards.html",
    note: "The FAccT committee highlights how generative-language technology mediates language ideologies in peer review. That supports sociotechnical importance, not a demonstrated major contribution to the development of AI itself."
  },
  {
    title: "Shape Space Spectra",
    mechanismId: "siggraph-2025-best",
    awardName: "Best Paper",
    awardUrl: "https://blog.siggraph.org/2025/06/siggraph-2025-technical-papers-awards-best-papers-honorable-mentions-and-test-of-time.html/",
    note: "The official SIGGRAPH page confirms the Best Paper selection and summarizes a geometry-processing contribution; it does not identify a major contribution to AI development."
  },
  {
    title: "CAST: Component-Aligned 3D Scene Reconstruction From an RGB Image",
    mechanismId: "siggraph-2025-best",
    awardName: "Best Paper",
    awardUrl: "https://blog.siggraph.org/2025/06/siggraph-2025-technical-papers-awards-best-papers-honorable-mentions-and-test-of-time.html/",
    note: "The official page describes single-image 3D scene reconstruction, but does not independently establish that CAST materially changed AI development rather than advancing a bounded graphics task."
  },
  {
    title: "TokenVerse: Versatile Multi-Concept Personalization in Token Modulation Space",
    mechanismId: "siggraph-2025-best",
    awardName: "Best Paper",
    awardUrl: "https://blog.siggraph.org/2025/06/siggraph-2025-technical-papers-awards-best-papers-honorable-mentions-and-test-of-time.html/",
    note: "The official page describes multi-concept personalization for generative models. It does not supply independent committee reasoning that this is a major contribution to AI development."
  },
  {
    title: "Vector-Valued Monte Carlo Integration Using Ratio Control Variates",
    mechanismId: "siggraph-2025-best",
    awardName: "Best Paper",
    awardUrl: "https://blog.siggraph.org/2025/06/siggraph-2025-technical-papers-awards-best-papers-honorable-mentions-and-test-of-time.html/",
    note: "The official page confirms a rendering and Monte Carlo contribution, but does not connect it to a major contribution to AI development."
  },
  {
    title: "Transformer IMU Calibrator: Dynamic On-Body IMU Calibration for Inertial Motion Capture",
    mechanismId: "siggraph-2025-best",
    awardName: "Best Paper",
    awardUrl: "https://blog.siggraph.org/2025/06/siggraph-2025-technical-papers-awards-best-papers-honorable-mentions-and-test-of-time.html/",
    note: "The official page describes a transformer-based inertial motion-capture calibrator. It does not establish that this application-specific advance is a major contribution to AI development."
  }
];
const MATCHES = new Map(MATCH_LIST.map(match => [normalize(match.title), match]));

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
  const matchedTitles = new Set();
  const byYear = {};

  for (const candidate of candidates) {
    const titleKey = normalize(candidate.title);
    const match = MATCHES.get(titleKey);
    let review;
    if (match) {
      matchedTitles.add(titleKey);
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
            1: { status: "passed", note: "ACM-published research-paper candidate with direct AI, computing, or sociotechnical-AI relevance." },
            2: { status: "passed", note: `Exact winner match to ${match.mechanismId}.` },
            3: { status: "passed", note: "Official award title and authors correspond to the ACM DOI record." },
            4: { status: "limited-pass", note: `ACM DOI record and official award source checked ${CHECKED_AT}; no visible correction, retraction, or award-revocation marker was found. This is a dated check.` },
            5: { status: "needs-evidence", note: match.note },
            6: { status: "not-run", note: "Importance gate not passed." }
          },
          aiDevelopmentContribution: {
            status: "needs-evidence",
            changedWhat: candidate.abstract || "The official source describes the paper's domain contribution; Crossref supplied no abstract for this record.",
            significanceEvidence: match.note,
            evaluator: "Official ACM conference award committee or conference award page",
            evaluatorRelationship: "External conference evaluation; no independence beyond the official committee role is asserted."
          },
          decisionReason: "The formal award and paper identity are confirmed, but external evidence for a major contribution to AI development is insufficient.",
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
            1: { status: "registered", note: "Candidate retained through a configured ACM Digital Library discovery route; broad venue inclusion is not a claim of importance." },
            2: { status: "deferred", note: "No exact match to an enabled mechanism for the same venue, year, track, award, and winner identity." },
            3: { status: "not-entered" }, 4: { status: "not-entered" }, 5: { status: "not-entered" }, 6: { status: "not-entered" }
          },
          decisionReason: "Stopped at the formal-evaluation gate. ACM publication, venue reputation, citations, downloads, and keyword matches are not importance evidence.",
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

  const missing = MATCH_LIST.filter(match => !matchedTitles.has(normalize(match.title))).map(match => match.title);
  if (missing.length) throw new Error(`Configured award winners missing from candidate pool: ${missing.join(" | ")}`);
  const summary = {
    schemaVersion: 1,
    checkedAt: CHECKED_AT,
    policyVersion: "1.2",
    candidatePolicy: "docs/ACM_DIGITAL_LIBRARY_COLLECTION_POLICY.md",
    importancePolicy: "docs/ACADEMIC_IMPORTANCE_POLICY.md",
    candidates: candidates.length,
    passed: selected.length,
    "needs-evidence": needsEvidence.length,
    deferred: reviewed.length - needsEvidence.length,
    byYear,
    enabledMechanismsInCurrentPublicationScope: ["sigir-2025-best", "facct-2025-best", "siggraph-2025-best"],
    excludedEnabledMechanisms: ["siggraph-2025-tot (winning papers were published in 2013–2015, outside the 2024–2026 publication window)"],
    enabledAwardMatches: needsEvidence.length,
    sixStepReviewsCompleted: selected.length,
    eligibleForPublication: selected.length,
    limits: "Nine 2025 papers exactly match enabled ACM mechanisms and reach step 5; none has sufficient external support for the site's AI-major-contribution gate. All remaining candidates stop at step 2."
  };
  fs.writeFileSync(path.join(options.output, "review-results.jsonl"), reviewed.map(record => JSON.stringify(record)).join("\n") + "\n");
  fs.writeFileSync(path.join(options.output, "award-matches.json"), JSON.stringify(needsEvidence, null, 2) + "\n");
  fs.writeFileSync(path.join(options.output, "needs-evidence.json"), JSON.stringify(needsEvidence, null, 2) + "\n");
  fs.writeFileSync(path.join(options.output, "selected.json"), JSON.stringify(selected, null, 2) + "\n");
  fs.writeFileSync(path.join(options.output, "summary.json"), JSON.stringify(summary, null, 2) + "\n");
  console.log(JSON.stringify(summary, null, 2));
}

main();
