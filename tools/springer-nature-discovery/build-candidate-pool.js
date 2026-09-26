"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const MEMBER_API = "https://api.crossref.org/members/297/works";
const SNAPSHOT_DATE = "2026-09-24";
const YEARS = [2024, 2025, 2026];
const ACCEPTED_TYPES = new Set(["journal-article", "book-chapter"]);
const ROWS = 1000;

// Springer Nature is a multidisciplinary publisher.  Exact journal feeds give
// the source-native equivalent of arXiv categories without treating every
// Springer/Nature title as an AI venue.
const CORE_AI_JOURNALS = [
  { issn: "2522-5839", title: "Nature Machine Intelligence" },
  { issn: "0885-6125", title: "Machine Learning" },
  { issn: "1573-7462", title: "Artificial Intelligence Review" },
  { issn: "0941-0643", title: "Neural Computing and Applications" },
  { issn: "0920-5691", title: "International Journal of Computer Vision" },
  { issn: "0929-5593", title: "Autonomous Robots" },
  { issn: "1384-5810", title: "Data Mining and Knowledge Discovery" },
  { issn: "1866-9956", title: "Cognitive Computation" },
  { issn: "0932-8092", title: "Machine Vision and Applications" },
  { issn: "0951-5666", title: "AI & Society" }
];

const TITLE_QUERIES = [
  { query: "foundation model", pattern: /foundation models?/i },
  { query: "large language model", pattern: /large language models?|\bLLMs?\b/i },
  { query: "vision language model", pattern: /vision[- ]language models?|multimodal large language models?/i },
  { query: "diffusion model", pattern: /diffusion models?/i },
  { query: "generative artificial intelligence", pattern: /generative (?:AI|artificial intelligence)/i },
  { query: "retrieval augmented generation", pattern: /retrieval[- ]augmented generation/i },
  { query: "reinforcement learning", pattern: /reinforcement learning/i },
  { query: "self supervised learning", pattern: /self[- ]supervised learning/i },
  { query: "federated learning", pattern: /federated learning/i },
  { query: "machine unlearning", pattern: /machine unlearning/i },
  { query: "mixture of experts", pattern: /mixture[- ]of[- ]experts?/i },
  { query: "in context learning", pattern: /in[- ]context learning/i },
  { query: "test time compute", pattern: /test[- ]time (?:scaling|compute|adaptation)/i },
  { query: "AI alignment", pattern: /(?:AI|artificial intelligence) alignment/i },
  { query: "AI safety", pattern: /(?:AI|artificial intelligence) safety/i },
  { query: "adversarial robustness", pattern: /adversarial robustness/i },
  { query: "neural architecture search", pattern: /neural architecture search/i },
  { query: "model compression", pattern: /model compression/i },
  { query: "language model inference", pattern: /(?:large language model|LLM) inference/i }
];

const AWARD_TITLES = ["Minimalist Vision with Freeform Pixels"];

function parseArgs(argv) {
  const result = { output: null, offline: false, delayMs: 80 };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--output") result.output = path.resolve(argv[++i]);
    else if (argv[i] === "--offline") result.offline = true;
    else if (argv[i] === "--delay-ms") result.delayMs = Number(argv[++i]);
    else throw new Error("Usage: node build-candidate-pool.js --output <directory> [--offline] [--delay-ms N]");
  }
  if (!result.output) throw new Error("--output is required");
  return result;
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const sha256 = value => crypto.createHash("sha256").update(value).digest("hex");
const first = value => Array.isArray(value) ? value[0] || "" : value || "";
const normalize = value => String(value || "").normalize("NFKC").replace(/[“”]/g, '"').replace(/[‘’]/g, "'")
  .replace(/[^\p{L}\p{N}]+/gu, " ").trim().toLowerCase();

function publicationYear(record) {
  for (const field of ["published-online", "published-print", "published", "issued"]) {
    const year = Number(record[field]?.["date-parts"]?.[0]?.[0]);
    if (YEARS.includes(year)) return year;
  }
  return null;
}

function springerUrl(record) {
  const doi = String(record.DOI || "").toLowerCase();
  if (record.type === "book-chapter") return `https://link.springer.com/chapter/${doi}`;
  if (doi.startsWith("10.1038/")) return `https://www.nature.com/articles/${doi.slice(8)}`;
  return `https://link.springer.com/article/${doi}`;
}

function cleanRecord(record, routes) {
  const doi = String(record.DOI || "").toLowerCase();
  return {
    id: `springer-nature-${doi.replace(/^10\./, "").replace(/[^a-z0-9]+/g, "-")}`,
    doi,
    publicationYear: publicationYear(record),
    title: first(record.title),
    authors: (record.author || []).map(author => [author.given, author.family].filter(Boolean).join(" ")).filter(Boolean),
    publicationTitle: first(record["container-title"]),
    contentType: record.type,
    publisher: record.publisher || "Springer Nature",
    url: springerUrl(record),
    abstract: record.abstract || "",
    discoveryRoutes: routes,
    sourceClass: "academic",
    sourceSubcategory: "springer-nature",
    relevanceScreening: "pending",
    candidateStatus: "pending-importance-review",
    importanceReview: { status: "not-run", mechanismMatch: "not-run" }
  };
}

async function cachedFetch(url, cacheFile, options) {
  if (fs.existsSync(cacheFile)) return fs.readFileSync(cacheFile, "utf8");
  if (options.offline) throw new Error(`Missing offline cache ${cacheFile}`);
  const response = await fetch(url, { headers: { "user-agent": "AI-Knowledge-Map-Springer-Nature-Review/1.0 (https://ai-knowledge-map.com/)" } });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  const raw = await response.text();
  fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
  fs.writeFileSync(cacheFile, raw);
  await sleep(options.delayMs);
  return raw;
}

function addCandidate(merged, record, route) {
  const year = publicationYear(record);
  const doi = String(record.DOI || "").toLowerCase();
  if (!year || !doi || !ACCEPTED_TYPES.has(record.type)) return;
  const prior = merged.get(doi);
  if (!prior) merged.set(doi, cleanRecord(record, [route]));
  else prior.discoveryRoutes = [...new Set([...prior.discoveryRoutes, route])];
}

async function collectJournal(journal, merged, snapshots, cacheDir, options) {
  let cursor = "*";
  let page = 0;
  do {
    page += 1;
    const params = new URLSearchParams({
      filter: `from-pub-date:2024-01-01,until-pub-date:${SNAPSHOT_DATE}`,
      rows: String(ROWS), cursor,
      select: "DOI,title,author,container-title,published,published-online,published-print,issued,type,URL,publisher,abstract"
    });
    const url = `https://api.crossref.org/journals/${journal.issn}/works?${params}`;
    const cacheFile = path.join(cacheDir, `journal-${journal.issn}-${String(page).padStart(3, "0")}.json`);
    const raw = await cachedFetch(url, cacheFile, options);
    const message = JSON.parse(raw).message || {};
    const items = message.items || [];
    for (const record of items) addCandidate(merged, record, "core-ai-journal");
    snapshots.push({ route: "core-ai-journal", key: journal.issn, page, itemCount: items.length, sha256: `sha256:${sha256(raw)}` });
    process.stderr.write(`[journal ${journal.issn}] page ${page}: ${items.length}\n`);
    cursor = items.length === ROWS ? message["next-cursor"] : null;
  } while (cursor);
}

async function collectTitleQuery(entry, index, merged, snapshots, cacheDir, options) {
  const params = new URLSearchParams({
    "query.title": entry.query,
    filter: `from-pub-date:2024-01-01,until-pub-date:${SNAPSHOT_DATE}`,
    rows: String(ROWS),
    select: "DOI,title,author,container-title,published,published-online,published-print,issued,type,URL,publisher,abstract"
  });
  const url = `${MEMBER_API}?${params}`;
  const cacheFile = path.join(cacheDir, `title-query-${String(index + 1).padStart(2, "0")}.json`);
  const raw = await cachedFetch(url, cacheFile, options);
  const items = JSON.parse(raw).message?.items || [];
  let matched = 0;
  for (const record of items) {
    if (!entry.pattern.test(first(record.title))) continue;
    matched += 1;
    addCandidate(merged, record, "precise-ai-title-keyword");
  }
  snapshots.push({ route: "precise-ai-title-keyword", key: entry.query, retrieved: items.length, strictMatches: matched, retrievalCap: ROWS, sha256: `sha256:${sha256(raw)}` });
  process.stderr.write(`[title ${entry.query}] ${matched}/${items.length}\n`);
}

async function collectAwardTitle(title, index, merged, snapshots, cacheDir, options) {
  const params = new URLSearchParams({
    "query.title": title,
    filter: `from-pub-date:2024-01-01,until-pub-date:${SNAPSHOT_DATE}`,
    rows: "20",
    select: "DOI,title,author,container-title,published,published-online,published-print,issued,type,URL,publisher,abstract"
  });
  const raw = await cachedFetch(`${MEMBER_API}?${params}`, path.join(cacheDir, `award-title-${index + 1}.json`), options);
  const items = JSON.parse(raw).message?.items || [];
  const key = normalize(title);
  const exact = items.filter(record => normalize(first(record.title)) === key);
  for (const record of exact) addCandidate(merged, record, "mature-evaluation-clue");
  snapshots.push({ route: "mature-evaluation-clue", key: title, retrieved: items.length, exactMatches: exact.length, sha256: `sha256:${sha256(raw)}` });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const cacheDir = path.join(options.output, "cache");
  fs.mkdirSync(cacheDir, { recursive: true });
  const merged = new Map();
  const snapshots = [];

  for (const journal of CORE_AI_JOURNALS) await collectJournal(journal, merged, snapshots, cacheDir, options);
  for (let i = 0; i < TITLE_QUERIES.length; i += 1) await collectTitleQuery(TITLE_QUERIES[i], i, merged, snapshots, cacheDir, options);
  for (let i = 0; i < AWARD_TITLES.length; i += 1) await collectAwardTitle(AWARD_TITLES[i], i, merged, snapshots, cacheDir, options);

  const candidates = [...merged.values()].sort((a, b) => a.publicationYear - b.publicationYear || a.title.localeCompare(b.title));
  const count = key => Object.fromEntries(YEARS.map(year => [year, candidates.filter(record => record.publicationYear === year && (!key || record.discoveryRoutes.includes(key))).length]));
  const summary = {
    schemaVersion: 1,
    generatedAt: SNAPSHOT_DATE,
    source: "Springer Nature",
    metadataTransport: "Crossref member 297 and exact journal ISSN feeds",
    range: { from: "2024-01-01", through: SNAPSHOT_DATE },
    acceptedTypes: [...ACCEPTED_TYPES],
    sourceDesign: {
      reason: "Springer Nature mixes more than 3,000 journals, books and over 2,000 proceedings titles per year; the pool therefore combines exact AI-journal feeds, strict title terminology across the publisher, and verified award-title clues.",
      coreJournalCount: CORE_AI_JOURNALS.length,
      titleQueryCount: TITLE_QUERIES.length,
      keywordRetrievalCapPerQuery: ROWS,
      limitation: "Crossref title search is relevance-ranked. The first 1,000 results per term are strictly re-filtered locally; this is a reproducible high-recall candidate pool, not a claim to exhaust every AI-related Springer Nature publication."
    },
    candidates: candidates.length,
    byYear: count(),
    byRoute: {
      "core-ai-journal": candidates.filter(record => record.discoveryRoutes.includes("core-ai-journal")).length,
      "precise-ai-title-keyword": candidates.filter(record => record.discoveryRoutes.includes("precise-ai-title-keyword")).length,
      "mature-evaluation-clue": candidates.filter(record => record.discoveryRoutes.includes("mature-evaluation-clue")).length
    },
    cacheSnapshots: snapshots.length
  };
  fs.writeFileSync(path.join(options.output, "candidates.jsonl"), candidates.map(record => JSON.stringify(record)).join("\n") + "\n");
  fs.writeFileSync(path.join(options.output, "candidate-summary.json"), JSON.stringify(summary, null, 2) + "\n");
  fs.writeFileSync(path.join(options.output, "source-snapshots.json"), JSON.stringify(snapshots, null, 2) + "\n");
  console.log(JSON.stringify(summary, null, 2));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
