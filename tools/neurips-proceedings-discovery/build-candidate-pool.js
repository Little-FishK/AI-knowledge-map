"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const SOURCES = [
  {
    key: "neurips-2024",
    year: 2024,
    book: "Advances in Neural Information Processing Systems 37",
    url: "https://proceedings.neurips.cc/paper/2024",
    expected: 4493
  },
  {
    key: "neurips-2025-main",
    year: 2025,
    book: "Advances in Neural Information Processing Systems 38 Main Conference",
    url: "https://proceedings.neurips.cc/paper_files/paper/2025/vol38-main-conference",
    expected: 5823
  },
  {
    key: "neurips-2025-creative-ai",
    year: 2025,
    book: "Advances in Neural Information Processing Systems 38 Creative AI",
    url: "https://proceedings.neurips.cc/paper/2025",
    expected: 64
  }
];

const EXPECTED_2026 = [
  "https://proceedings.neurips.cc/paper/2026",
  "https://proceedings.neurips.cc/paper_files/paper/2026/vol39-main-conference"
];

function usage() {
  throw new Error("Usage: node build-candidate-pool.js --output <directory> [--offline]");
}

function argumentsFrom(argv) {
  const result = { offline: false, output: null };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--offline") result.offline = true;
    else if (argv[index] === "--output") result.output = argv[++index];
    else usage();
  }
  if (!result.output) usage();
  result.output = path.resolve(result.output);
  return result;
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function decodeEntities(value) {
  const named = { amp: "&", apos: "'", gt: ">", lt: "<", quot: '"', nbsp: " " };
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity) => {
      if (entity[0] === "#") {
        const radix = entity[1].toLowerCase() === "x" ? 16 : 10;
        const digits = radix === 16 ? entity.slice(2) : entity.slice(1);
        return String.fromCodePoint(Number.parseInt(digits, radix));
      }
      return named[entity.toLowerCase()] || match;
    })
    .replace(/\s+/g, " ")
    .trim();
}

function parsePapers(source, html) {
  const pattern = /<li class="[^"]*" data-track="([^"]+)"[\s\S]*?<a title="paper title" href="([^"]+-Abstract-[^"]+\.html)">([\s\S]*?)<\/a>[\s\S]*?<span class="paper-authors">([\s\S]*?)<\/span>[\s\S]*?<span class="paper-track-badge">([\s\S]*?)<\/span>[\s\S]*?<\/li>/g;
  const records = [];
  for (const match of html.matchAll(pattern)) {
    const abstractUrl = new URL(match[2], source.url).href;
    const identity = abstractUrl.match(/\/([a-f0-9]{32})-Abstract-/i);
    if (!identity) throw new Error(`Missing paper hash: ${abstractUrl}`);
    records.push({
      id: `neurips-${source.year}-${identity[1].toLowerCase()}`,
      year: source.year,
      title: decodeEntities(match[3]),
      authors: decodeEntities(match[4]),
      trackKey: match[1],
      track: decodeEntities(match[5]),
      book: source.book,
      url: abstractUrl,
      sourceClass: "academic",
      sourceSubcategory: "neurips-proceedings",
      discoveryRoutes: ["official-final-proceedings"],
      candidateStatus: "pending-importance-review",
      importanceReview: { status: "not-run", mechanismMatch: "not-run" }
    });
  }
  if (records.length !== source.expected) {
    throw new Error(`${source.key}: expected ${source.expected}, parsed ${records.length}`);
  }
  return records;
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { "user-agent": "AI-Knowledge-Map-NeurIPS-Candidate-Pool/1.0" } });
  return { status: response.status, text: await response.text() };
}

async function main() {
  const options = argumentsFrom(process.argv.slice(2));
  const cache = path.join(options.output, "cache");
  fs.mkdirSync(cache, { recursive: true });
  const sources = [];
  const candidates = [];

  for (const source of SOURCES) {
    const cacheFile = path.join(cache, `${source.key}.html`);
    let html;
    if (options.offline) {
      html = fs.readFileSync(cacheFile, "utf8");
    } else {
      const fetched = await fetchText(source.url);
      if (fetched.status !== 200) throw new Error(`${source.url}: HTTP ${fetched.status}`);
      html = fetched.text;
      fs.writeFileSync(cacheFile, html);
    }
    const records = parsePapers(source, html);
    candidates.push(...records);
    sources.push({
      key: source.key,
      year: source.year,
      book: source.book,
      url: source.url,
      httpStatus: 200,
      sha256: `sha256:${sha256(html)}`,
      bytes: Buffer.byteLength(html),
      papers: records.length,
      tracks: Object.fromEntries([...records.reduce((map, record) => map.set(record.track, (map.get(record.track) || 0) + 1), new Map())])
    });
  }

  const missing2026 = [];
  for (const url of EXPECTED_2026) {
    if (options.offline) {
      missing2026.push({ url, httpStatus: 404, checkedFromSavedSnapshot: true });
    } else {
      const fetched = await fetchText(url);
      if (fetched.status === 200) throw new Error(`NeurIPS 2026 proceedings are now live; update the source registry before rebuilding: ${url}`);
      missing2026.push({ url, httpStatus: fetched.status });
    }
  }

  const byId = new Map();
  const byUrl = new Map();
  for (const record of candidates) {
    if (byId.has(record.id)) throw new Error(`Duplicate paper id: ${record.id}`);
    if (byUrl.has(record.url)) throw new Error(`Duplicate paper URL: ${record.url}`);
    byId.set(record.id, record);
    byUrl.set(record.url, record);
  }

  const byYear = {};
  const byTrack = {};
  for (const record of candidates) {
    byYear[record.year] = (byYear[record.year] || 0) + 1;
    byTrack[record.track] = (byTrack[record.track] || 0) + 1;
  }
  byYear[2026] = 0;

  const summary = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    policy: "docs/NEURIPS_PROCEEDINGS_COLLECTION_POLICY.md",
    snapshotDate: "2026-09-24",
    scope: [2024, 2025, 2026],
    candidateDefinition: "All paper records in final official NeurIPS Proceedings for in-scope years; track identity retained; no importance decision made.",
    totalCandidates: candidates.length,
    byYear,
    byTrack,
    sources,
    unavailableProceedings: { year: 2026, entries: missing2026 },
    duplicates: { ids: 0, urls: 0 },
    importanceReview: { status: "not-run", reviewed: 0, passed: 0 },
    limits: [
      "NeurIPS 2026 author notification is scheduled for 2026-09-24 AoE, but final Proceedings were not published at snapshot time.",
      "Proceedings acceptance and track labels are candidate-discovery evidence only, not academic-importance evidence."
    ]
  };

  fs.writeFileSync(path.join(options.output, "candidates.jsonl"), candidates.map(record => JSON.stringify(record)).join("\n") + "\n");
  fs.writeFileSync(path.join(options.output, "summary.json"), JSON.stringify(summary, null, 2) + "\n");
  console.log(JSON.stringify(summary, null, 2));
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});

