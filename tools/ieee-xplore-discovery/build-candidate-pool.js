"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = "https://ieeexplore.ieee.org";
const SNAPSHOT_DATE = "2026-09-24";
const YEARS = [2024, 2025, 2026];
const ALLOWED_TYPES = new Set(["Conferences", "Journals", "Early Access Articles"]);

const CORE_PUBLICATIONS = [
  "IEEE Transactions on Artificial Intelligence",
  "IEEE Transactions on Neural Networks and Learning Systems",
  "IEEE Transactions on Pattern Analysis and Machine Intelligence",
  "IEEE Transactions on Emerging Topics in Computational Intelligence",
  "IEEE Transactions on Fuzzy Systems",
  "IEEE Transactions on Evolutionary Computation",
  "IEEE Transactions on Games",
  "IEEE Computational Intelligence Magazine",
  "IEEE Intelligent Systems",
  "IEEE Transactions on Cognitive and Developmental Systems",
  "IEEE Transactions on Affective Computing",
  "International Joint Conference on Neural Networks",
  "IEEE International Conference on Artificial Intelligence",
  "IEEE Conference on Artificial Intelligence",
  "IEEE International Conference on Data Mining",
  "IEEE International Conference on Robotics and Automation",
  "IEEE/RSJ International Conference on Intelligent Robots and Systems",
  "IEEE International Conference on Machine Learning and Applications",
  "IEEE Symposium Series on Computational Intelligence",
  "IEEE International Conference on Fuzzy Systems",
  "IEEE Congress on Evolutionary Computation"
];

const PRECISE_TITLE_TERMS = [
  "foundation model",
  "large language model",
  "vision-language model",
  "vision language model",
  "multimodal large language model",
  "diffusion model",
  "generative AI",
  "generative artificial intelligence",
  "self-supervised learning",
  "reinforcement learning",
  "federated learning",
  "machine unlearning",
  "retrieval-augmented generation",
  "mixture of experts",
  "in-context learning",
  "test-time scaling",
  "AI alignment",
  "artificial intelligence safety",
  "adversarial robustness",
  "model compression",
  "neural architecture search",
  "AI accelerator",
  "machine learning accelerator",
  "large language model inference"
];

const AWARD_TITLES = [
  "Goal Masked Diffusion Policies for Unified Navigation and Exploration",
  "NoMaD: Goal Masked Diffusion Policies for Navigation and Exploration",
  "Open X-Embodiment: Robotic Learning Datasets and RT-X Models",
  "Marginalizing and Conditioning Gaussians Onto Linear Approximations of Smooth Manifolds with Applications in Robotics",
  "MAC-VO: Metrics-Aware Covariance for Learning-Based Stereo Visual Odometry"
];

function parseArgs(argv) {
  const result = { output: null, offline: false, delayMs: 175 };
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
async function mapConcurrent(items, limit, task) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await task(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
function query(field, value) { return `\"${field}\":\"${value.replaceAll('"', '\\\"')}\"`; }
function searchUrl(queryText, range = "2024_2026_Year") {
  const params = new URLSearchParams({
    action: "search", matchBoolean: "true", queryText, highlight: "true",
    returnFacets: "ALL", returnType: "SEARCH", matchPubs: "true",
    rowsPerPage: "100", pageNumber: "1", ranges: range
  });
  return `${ROOT}/search/searchresult.jsp?${params}`;
}

function cookieHeader(response) {
  const values = typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [];
  return values.map(value => value.split(";", 1)[0]).join("; ");
}

function normalizeType(record) {
  if (record.isEarlyAccess) return "Early Access Articles";
  if (record.isConference) return "Conferences";
  if (record.isMagazine) return "Magazines";
  if (record.isJournalAndMagazine || record.isJournal) return "Journals";
  return record.articleContentType || record.displayContentType || "Other";
}
function stripHighlight(value) { return typeof value === "string" ? value.replaceAll("[::", "").replaceAll("::]", "") : value; }

function cleanRecord(record, route, queryId) {
  const contentType = normalizeType(record);
  return {
    id: `ieee-${record.articleNumber}`,
    articleNumber: String(record.articleNumber),
    publicationYear: Number(record.publicationYear),
    title: stripHighlight(record.articleTitle),
    authors: (record.authors || []).map(author => author.preferredName).filter(Boolean),
    publicationTitle: stripHighlight(record.publicationTitle || record.displayPublicationTitle),
    contentType,
    publisher: record.publisher,
    doi: record.doi || null,
    url: `${ROOT}/document/${record.articleNumber}/`,
    abstract: record.abstract || "",
    discoveryRoutes: [route],
    discoveryQueries: [queryId],
    sourceClass: "academic",
    sourceSubcategory: "ieee-xplore",
    relevanceScreening: "pending",
    candidateStatus: "pending-importance-review",
    importanceReview: { status: "not-run", mechanismMatch: "not-run" }
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const cacheDir = path.join(options.output, "cache");
  fs.mkdirSync(cacheDir, { recursive: true });

  const definitions = [
    ...CORE_PUBLICATIONS.map((value, index) => ({ id: `core-${String(index + 1).padStart(2, "0")}`, route: "core-ai-publication", queryText: query("Publication Title", value), label: value })),
    ...PRECISE_TITLE_TERMS.flatMap((value, index) => value === "reinforcement learning"
      ? YEARS.map(year => ({ id: `keyword-${String(index + 1).padStart(2, "0")}-${year}`, route: "precise-ai-title-keyword", queryText: query("Document Title", value), label: value, range: `${year}_${year}_Year` }))
      : [{ id: `keyword-${String(index + 1).padStart(2, "0")}`, route: "precise-ai-title-keyword", queryText: query("Document Title", value), label: value }]),
    ...AWARD_TITLES.map((value, index) => ({ id: `award-${String(index + 1).padStart(2, "0")}`, route: "mature-evaluation-clue", queryText: query("Document Title", value), label: value }))
  ];

  let cookie = "";
  if (!options.offline) {
    const initial = await fetch(searchUrl(definitions[0].queryText, definitions[0].range), { headers: { "user-agent": "Mozilla/5.0 AI-Knowledge-Map-IEEE-Xplore-Review/1.0" } });
    if (!initial.ok) throw new Error(`Initial IEEE Xplore session failed: HTTP ${initial.status}`);
    cookie = cookieHeader(initial);
    await initial.text();
  }

  async function fetchPage(definition, pageNumber) {
    const cacheFile = path.join(cacheDir, `${definition.id}-${String(pageNumber).padStart(4, "0")}.json`);
    if (options.offline || fs.existsSync(cacheFile)) return JSON.parse(fs.readFileSync(cacheFile, "utf8"));
    const body = {
      queryText: definition.queryText,
      highlight: true,
      returnFacets: ["ALL"],
      returnType: "SEARCH",
      matchPubs: true,
      rowsPerPage: 100,
      pageNumber,
      ranges: [definition.range || "2024_2026_Year"]
    };
    const response = await fetch(`${ROOT}/rest/search`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "origin": ROOT,
        "referer": searchUrl(definition.queryText, definition.range),
        "x-requested-with": "XMLHttpRequest",
        "cookie": cookie,
        "user-agent": "Mozilla/5.0 AI-Knowledge-Map-IEEE-Xplore-Review/1.0"
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`${definition.id} page ${pageNumber}: HTTP ${response.status}`);
    const text = await response.text();
    if (!text) throw new Error(`${definition.id} page ${pageNumber}: empty response`);
    fs.writeFileSync(cacheFile, text);
    await sleep(options.delayMs);
    return JSON.parse(text);
  }

  const merged = new Map();
  const queries = [];
  for (let index = 0; index < definitions.length; index += 1) {
    const definition = definitions[index];
    const first = await fetchPage(definition, 1);
    const totalPages = first.totalPages || 0;
    const totalRecords = first.totalRecords || 0;
    const acceptedIds = new Set();
    let rejectedType = 0;
    const remainingPageNumbers = Array.from({ length: Math.max(0, totalPages - 1) }, (_, page) => page + 2);
    const pages = [first, ...await mapConcurrent(remainingPageNumbers, 6, page => fetchPage(definition, page))];
    for (const result of pages) {
      for (const record of result.records || []) {
        const contentType = normalizeType(record);
        if (!ALLOWED_TYPES.has(contentType)) { rejectedType += 1; continue; }
        if (!YEARS.includes(Number(record.publicationYear))) continue;
        const normalized = cleanRecord(record, definition.route, definition.id);
        const prior = merged.get(normalized.articleNumber);
        if (!prior) merged.set(normalized.articleNumber, normalized);
        else {
          prior.discoveryRoutes = [...new Set([...prior.discoveryRoutes, ...normalized.discoveryRoutes])];
          prior.discoveryQueries = [...new Set([...prior.discoveryQueries, ...normalized.discoveryQueries])];
        }
        acceptedIds.add(normalized.articleNumber);
      }
    }
    queries.push({
      id: definition.id, route: definition.route, label: definition.label,
      queryText: definition.queryText, searchUrl: searchUrl(definition.queryText, definition.range),
      totalRecords, totalPages, acceptedResearchRecords: acceptedIds.size, rejectedNonPaperContent: rejectedType,
      cacheFiles: pages.length,
      responseHashes: pages.map((page, pageIndex) => ({ page: pageIndex + 1, sha256: `sha256:${sha256(JSON.stringify(page))}` }))
    });
    process.stderr.write(`[${index + 1}/${definitions.length}] ${definition.id}: ${totalRecords} raw, ${acceptedIds.size} unique research\n`);
  }

  const candidates = [...merged.values()].sort((a, b) => a.publicationYear - b.publicationYear || a.title.localeCompare(b.title));
  const byYear = Object.fromEntries(YEARS.map(year => [year, candidates.filter(record => record.publicationYear === year).length]));
  const byContentType = {};
  const byRoute = {};
  for (const record of candidates) {
    byContentType[record.contentType] = (byContentType[record.contentType] || 0) + 1;
    for (const route of record.discoveryRoutes) byRoute[route] = (byRoute[route] || 0) + 1;
  }
  const rawAccepted = queries.reduce((sum, item) => sum + item.acceptedResearchRecords, 0);
  const summary = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    snapshotDate: SNAPSHOT_DATE,
    source: "IEEE Xplore",
    scope: YEARS,
    policy: "docs/IEEE_XPLORE_COLLECTION_POLICY.md",
    candidateDefinition: "Union of 2024-2026 IEEE Xplore journal/conference/Early Access research records found through core AI publications, precise AI technical title phrases, and mature paper-award clues; deduplicated by IEEE article number.",
    totalCandidates: candidates.length,
    rawAcceptedOccurrences: rawAccepted,
    duplicatesMerged: rawAccepted - candidates.length,
    byYear,
    byContentType,
    byRoute,
    queries,
    exclusions: [
      "Books, courses, standards, magazine/editorial-only material and other non-paper content are excluded.",
      "Generic title queries for machine learning, deep learning, neural network and transformer are not used as stand-alone routes because they return tens of thousands of mostly application papers; core publications and precise technical phrases preserve a reviewable high-recall pool.",
      "Ordinary IEEE Xplore inclusion, citation counts, downloads and Early Access status are discovery metadata only."
    ],
    importanceReview: { status: "not-run", reviewed: 0, passed: 0 }
  };
  fs.writeFileSync(path.join(options.output, "candidates.jsonl"), candidates.map(record => JSON.stringify(record)).join("\n") + "\n");
  fs.writeFileSync(path.join(options.output, "summary.json"), JSON.stringify(summary, null, 2) + "\n");
  console.log(JSON.stringify({ totalCandidates: candidates.length, byYear, byContentType, byRoute, duplicatesMerged: summary.duplicatesMerged }, null, 2));
}

main().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
