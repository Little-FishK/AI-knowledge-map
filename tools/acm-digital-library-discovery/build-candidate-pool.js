"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const API = "https://api.crossref.org/prefixes/10.1145/works";
const SNAPSHOT_DATE = "2026-09-24";
const YEARS = [2024, 2025, 2026];
const TYPES = ["proceedings-article", "journal-article"];
const ROWS = 1000;

const CORE_VENUE_PATTERNS = [
  /\bSIGIR\b/i,
  /\bKDD\b|Knowledge Discovery and Data Mining/i,
  /\bCIKM\b|Information and Knowledge Management/i,
  /\bWSDM\b|Web Search and Data Mining/i,
  /\bRecSys\b|Recommender Systems/i,
  /\bThe Web Conference\b|\bWWW\b/i,
  /\bACM Multimedia\b|\bMM ['’]?\d{2}\b/i,
  /\bFAccT\b|Fairness, Accountability, and Transparency/i,
  /\bAIES\b|Artificial Intelligence, Ethics, and Society/i,
  /\bIUI\b|Intelligent User Interfaces/i,
  /\bHRI\b|Human-Robot Interaction/i,
  /\bSIGGRAPH\b|Transactions on Graphics/i,
  /Transactions on Intelligent Systems and Technology/i,
  /Transactions on Knowledge Discovery from Data/i,
  /Transactions on Information Systems/i,
  /Transactions on Recommender Systems/i,
  /Transactions on Multimedia Computing, Communications, and Applications/i,
  /Transactions on Artificial Intelligence/i,
  /Journal on Responsible Computing/i
];

const PRECISE_TITLE_PATTERNS = [
  /foundation models?/i,
  /large language models?|\bLLMs?\b/i,
  /vision[- ]language models?/i,
  /multimodal large language models?/i,
  /diffusion models?/i,
  /generative (?:AI|artificial intelligence)/i,
  /retrieval[- ]augmented generation/i,
  /reinforcement learning/i,
  /self[- ]supervised learning/i,
  /federated learning/i,
  /machine unlearning/i,
  /mixture[- ]of[- ]experts?/i,
  /in[- ]context learning/i,
  /test[- ]time (?:scaling|compute)/i,
  /AI alignment|artificial intelligence alignment/i,
  /AI safety|artificial intelligence safety/i,
  /adversarial robustness/i,
  /neural architecture search/i,
  /model compression/i,
  /(?:AI|machine learning) accelerator/i,
  /(?:large language model|LLM) inference/i
];

const AWARD_TITLES = [
  "WARP: An Efficient Engine for Multi-Vector Retrieval",
  "A Framework for Auditing Chatbots for Dialect-Based Quality of Service Harms",
  "External Evaluation of Discrimination Mitigation Efforts in Meta's Ad Delivery",
  "“You Cannot Sound Like GPT\": Signs of language discrimination and resistance in computer science publishing",
  "Shape Space Spectra",
  "CAST: Component-Aligned 3D Scene Reconstruction From an RGB Image",
  "TokenVerse: Versatile Multi-Concept Personalization in Token Modulation Space",
  "Vector-Valued Monte Carlo Integration Using Ratio Control Variates",
  "Transformer IMU Calibrator: Dynamic On-Body IMU Calibration for Inertial Motion Capture"
];

function parseArgs(argv) {
  const result = { output: null, offline: false, delayMs: 75 };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--output") result.output = path.resolve(argv[++i]);
    else if (argv[i] === "--offline") result.offline = true;
    else if (argv[i] === "--delay-ms") result.delayMs = Number(argv[++i]);
    else throw new Error("Usage: node build-candidate-pool.js --output <directory> [--offline] [--delay-ms N]");
  }
  if (!result.output) throw new Error("--output is required");
  return result;
}

function sha256(value) { return crypto.createHash("sha256").update(value).digest("hex"); }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function text(value) { return Array.isArray(value) ? value[0] || "" : value || ""; }
function normalize(value) {
  return String(value || "").normalize("NFKC").replace(/[“”]/g, '"').replace(/[‘’]/g, "'")
    .replace(/[^\p{L}\p{N}]+/gu, " ").trim().toLowerCase();
}
function yearOf(record) {
  for (const field of ["published", "published-online", "published-print", "issued"]) {
    const year = record[field]?.["date-parts"]?.[0]?.[0];
    if (YEARS.includes(Number(year))) return Number(year);
  }
  return null;
}
function matchesAny(value, patterns) { return patterns.some(pattern => pattern.test(value)); }

function cleanRecord(record, publicationYear, discoveryRoutes) {
  const doi = String(record.DOI || "").toLowerCase();
  return {
    id: `acm-${doi.replace("10.1145/", "").replace(/[^a-z0-9]+/g, "-")}`,
    doi,
    publicationYear,
    title: text(record.title),
    authors: (record.author || []).map(author => [author.given, author.family].filter(Boolean).join(" ")).filter(Boolean),
    publicationTitle: text(record["container-title"]),
    contentType: record.type,
    publisher: record.publisher || "Association for Computing Machinery (ACM)",
    url: `https://dl.acm.org/doi/${doi}`,
    abstract: record.abstract || "",
    discoveryRoutes,
    sourceClass: "academic",
    sourceSubcategory: "acm-digital-library",
    relevanceScreening: "pending",
    candidateStatus: "pending-importance-review",
    importanceReview: { status: "not-run", mechanismMatch: "not-run" }
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const cacheDir = path.join(options.output, "cache");
  fs.mkdirSync(cacheDir, { recursive: true });
  const awardTitleSet = new Set(AWARD_TITLES.map(normalize));
  const merged = new Map();
  const sourceSnapshots = [];

  for (const type of TYPES) {
    let cursor = "*";
    let page = 0;
    let totalResults = null;
    let scanned = 0;
    while (cursor) {
      page += 1;
      const cacheFile = path.join(cacheDir, `${type}-${String(page).padStart(4, "0")}.json`);
      let payload;
      let raw;
      if (fs.existsSync(cacheFile)) {
        raw = fs.readFileSync(cacheFile, "utf8");
        payload = JSON.parse(raw);
      } else {
        if (options.offline) throw new Error(`Missing offline cache ${cacheFile}`);
        const params = new URLSearchParams({
          filter: `from-pub-date:2024-01-01,until-pub-date:${SNAPSHOT_DATE},type:${type}`,
          rows: String(ROWS),
          cursor,
          select: "DOI,title,author,container-title,published,published-online,published-print,issued,type,URL,publisher,abstract"
        });
        const response = await fetch(`${API}?${params}`, {
          headers: { "user-agent": "AI-Knowledge-Map-ACM-DL-Review/1.0 (https://ai-knowledge-map.com/)" }
        });
        if (!response.ok) throw new Error(`${type} page ${page}: HTTP ${response.status}`);
        raw = await response.text();
        fs.writeFileSync(cacheFile, raw);
        payload = JSON.parse(raw);
        await sleep(options.delayMs);
      }
      const message = payload.message || {};
      totalResults ??= Number(message["total-results"] || 0);
      const items = message.items || [];
      scanned += items.length;
      for (const record of items) {
        const publicationYear = yearOf(record);
        const doi = String(record.DOI || "").toLowerCase();
        if (!publicationYear || !doi.startsWith("10.1145/")) continue;
        const title = text(record.title);
        const venue = text(record["container-title"]);
        const discoveryRoutes = [];
        if (matchesAny(venue, CORE_VENUE_PATTERNS)) discoveryRoutes.push("core-ai-publication");
        if (matchesAny(title, PRECISE_TITLE_PATTERNS)) discoveryRoutes.push("precise-ai-title-keyword");
        if (awardTitleSet.has(normalize(title))) discoveryRoutes.push("mature-evaluation-clue");
        if (!discoveryRoutes.length) continue;
        const candidate = cleanRecord(record, publicationYear, discoveryRoutes);
        const prior = merged.get(doi);
        if (!prior) merged.set(doi, candidate);
        else prior.discoveryRoutes = [...new Set([...prior.discoveryRoutes, ...discoveryRoutes])];
      }
      sourceSnapshots.push({ type, page, itemCount: items.length, sha256: `sha256:${sha256(raw)}` });
      process.stderr.write(`[${type}] page ${page}: ${scanned}/${totalResults}\n`);
      if (!items.length || scanned >= totalResults) cursor = null;
      else cursor = message["next-cursor"];
    }
  }

  const candidates = [...merged.values()].sort((a, b) => a.publicationYear - b.publicationYear || a.title.localeCompare(b.title));
  const byYear = Object.fromEntries(YEARS.map(year => [year, candidates.filter(record => record.publicationYear === year).length]));
  const byContentType = {};
  const byRoute = {};
  for (const record of candidates) {
    byContentType[record.contentType] = (byContentType[record.contentType] || 0) + 1;
    for (const route of record.discoveryRoutes) byRoute[route] = (byRoute[route] || 0) + 1;
  }
  const summary = {
    schemaVersion: 1,
    generatedAt: SNAPSHOT_DATE,
    source: "ACM Digital Library",
    metadataTransport: "Crossref prefix 10.1145 works API",
    range: { from: "2024-01-01", through: SNAPSHOT_DATE },
    acceptedTypes: TYPES,
    scannedRecords: Object.fromEntries(TYPES.map(type => [type, sourceSnapshots.filter(page => page.type === type).reduce((sum, page) => sum + page.itemCount, 0)])),
    candidates: candidates.length,
    byYear,
    byContentType,
    byRoute,
    awardTitlesConfigured: AWARD_TITLES.length,
    cachePages: sourceSnapshots.length
  };
  fs.writeFileSync(path.join(options.output, "candidates.jsonl"), candidates.map(record => JSON.stringify(record)).join("\n") + "\n");
  fs.writeFileSync(path.join(options.output, "candidate-summary.json"), JSON.stringify(summary, null, 2) + "\n");
  fs.writeFileSync(path.join(options.output, "source-snapshots.json"), JSON.stringify(sourceSnapshots, null, 2) + "\n");
  console.log(JSON.stringify(summary, null, 2));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
