"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = "https://openaccess.thecvf.com";
const SNAPSHOT_DATE = "2026-09-24";
const COLLECTIONS = [
  { key: "WACV2024", venue: "WACV", year: 2024, track: "main" },
  { key: "CVPR2024", venue: "CVPR", year: 2024, track: "main" },
  { key: "WACV2025", venue: "WACV", year: 2025, track: "main" },
  { key: "CVPR2025", venue: "CVPR", year: 2025, track: "main" },
  { key: "ICCV2025", venue: "ICCV", year: 2025, track: "main" },
  { key: "WACV2026", venue: "WACV", year: 2026, track: "main" },
  { key: "CVPR2026", venue: "CVPR", year: 2026, track: "main" },
  { key: "CVPR2026_findings", venue: "CVPR", year: 2026, track: "findings" }
];
const WORKSHOP_SERIES = ["WACV2024", "CVPR2024", "WACV2025", "CVPR2025", "ICCV2025", "WACV2026", "CVPR2026"];
const KNOWN_UNAVAILABLE = new Map([
  [`${ROOT}/ICCV2025_workshops/CVAUI%20&%20AAMVEM`, "Official menu route returned HTTP 403 on 2026-09-24."],
  [`${ROOT}/ICCV2025_workshops/MRR%202025`, "Official menu route returned HTTP 403 on 2026-09-24."]
]);

function args(argv) {
  const result = { output: null, offline: false };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--output") result.output = path.resolve(argv[++i]);
    else if (argv[i] === "--offline") result.offline = true;
    else throw new Error("Usage: node build-candidate-pool.js --output <directory> [--offline]");
  }
  if (!result.output) throw new Error("--output is required");
  return result;
}

function decode(value) {
  const named = { amp: "&", apos: "'", gt: ">", lt: "<", quot: '"', nbsp: " " };
  return value.replace(/<[^>]*>/g, " ").replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, entity) => {
    if (entity[0] === "#") {
      const hex = entity[1].toLowerCase() === "x";
      return String.fromCodePoint(Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10));
    }
    return named[entity.toLowerCase()] || whole;
  }).replace(/\s+/g, " ").trim();
}

function sha256(value) { return crypto.createHash("sha256").update(value).digest("hex"); }
function cacheName(url) { return `${sha256(url).slice(0, 24)}.html`; }

async function fetchText(url) {
  const response = await fetch(url, { headers: { "user-agent": "AI-Knowledge-Map-CVF-Open-Access-Candidate-Pool/1.0" } });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}

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

function parseWorkshopMenu(series, html) {
  const prefix = `/${series}_workshops/`;
  const found = [];
  for (const match of html.matchAll(/<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = match[1];
    if (!href.startsWith(prefix) || href === `${prefix}menu`) continue;
    found.push({ url: new URL(href, ROOT).href, workshop: decode(match[2]), series });
  }
  const unique = [...new Map(found.map(record => [record.url, record])).values()];
  if (!unique.length) throw new Error(`${series}: workshop menu yielded no workshop pages`);
  return unique;
}

function parsePapers(source, html) {
  const blocks = [...html.matchAll(/<dt class="ptitle">([\s\S]*?)(?=<dt class="ptitle">|<\/dl>|$)/gi)];
  const papers = [];
  for (const match of blocks) {
    const block = match[1];
    // A small number of corrected CVF entries use `_paperOriginal.html`.
    const link = block.match(/<a\s+href="([^"]+_paper(?:Original)?\.html)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!link) throw new Error(`${source.url}: incomplete paper block near ${decode(block).slice(0, 100)}`);
    const url = new URL(link[1], ROOT).href;
    const authors = [...block.matchAll(/<input\s+type="hidden"\s+name="query_author"\s+value="([^"]*)"/gi)].map(author => decode(author[1]));
    if (!authors.length) throw new Error(`${source.url}: missing authors for ${decode(link[2])}`);
    papers.push({
      id: `cvf-${source.year}-${sha256(url).slice(0, 24)}`,
      publicationYear: source.year,
      title: decode(link[2]),
      authors,
      venue: source.venue,
      track: source.track,
      ...(source.workshop ? { workshop: source.workshop } : {}),
      url,
      sourcePageUrl: source.url,
      sourceClass: "academic",
      sourceSubcategory: "cvf-open-access",
      discoveryRoutes: [`official-${source.track}-final-record`],
      relevanceScreening: "potentially-relevant-computer-vision-source",
      candidateStatus: "pending-importance-review",
      importanceReview: { status: "not-run", mechanismMatch: "not-run" }
    });
  }
  return papers;
}

async function main() {
  const options = args(process.argv.slice(2));
  const cache = path.join(options.output, "cache");
  fs.mkdirSync(cache, { recursive: true });

  async function cached(url) {
    const file = path.join(cache, cacheName(url));
    const html = (options.offline || fs.existsSync(file)) ? fs.readFileSync(file, "utf8") : await fetchText(url);
    if (!options.offline && !fs.existsSync(file)) fs.writeFileSync(file, html);
    return html;
  }

  const menuSources = await mapConcurrent(WORKSHOP_SERIES, 5, async series => {
    const url = `${ROOT}/${series}_workshops/menu`;
    const html = await cached(url);
    return { series, url, html, pages: parseWorkshopMenu(series, html) };
  });

  const paperSources = COLLECTIONS.map(collection => ({
    ...collection,
    url: `${ROOT}/${collection.key}?day=all`
  }));
  for (const menu of menuSources) {
    const base = COLLECTIONS.find(record => menu.series.startsWith(record.venue) && menu.series.endsWith(String(record.year)) && record.track === "main");
    if (!base) throw new Error(`No base collection for ${menu.series}`);
    paperSources.push(...menu.pages.map(page => ({ ...base, key: `${menu.series}_workshops`, track: "workshop", workshop: page.workshop, url: page.url })));
  }

  const parsedSources = await mapConcurrent(paperSources, 8, async (source, index) => {
    if (KNOWN_UNAVAILABLE.has(source.url)) return { ...source, html: null, papers: [], fetchError: KNOWN_UNAVAILABLE.get(source.url) };
    let html;
    try {
      html = await cached(source.url);
    } catch (error) {
      if (options.offline) throw error;
      return { ...source, html: null, papers: [], fetchError: error.message };
    }
    const papers = parsePapers(source, html);
    if ((source.track === "main" || source.track === "findings") && !papers.length) throw new Error(`${source.url}: no papers parsed`);
    if (!options.offline && (index + 1) % 50 === 0) process.stderr.write(`Fetched ${index + 1}/${paperSources.length} paper pages\n`);
    return { ...source, html, papers };
  });

  const merged = new Map();
  for (const source of parsedSources) {
    for (const paper of source.papers) {
      const prior = merged.get(paper.url);
      if (!prior) merged.set(paper.url, paper);
      else {
        if (prior.title !== paper.title || prior.authors.join("|") !== paper.authors.join("|")) throw new Error(`Conflicting duplicate paper: ${paper.url}`);
        prior.discoveryRoutes = [...new Set([...prior.discoveryRoutes, ...paper.discoveryRoutes])];
        prior.sourcePageUrls = [...new Set([...(prior.sourcePageUrls || [prior.sourcePageUrl]), paper.sourcePageUrl])];
      }
    }
  }
  const candidates = [...merged.values()].sort((a, b) => a.publicationYear - b.publicationYear || a.venue.localeCompare(b.venue) || a.track.localeCompare(b.track) || a.title.localeCompare(b.title));
  const ids = new Set();
  for (const paper of candidates) {
    if (ids.has(paper.id)) throw new Error(`Duplicate ID: ${paper.id}`);
    ids.add(paper.id);
  }

  const byYear = {}, byVenue = {}, byTrack = {};
  for (const paper of candidates) {
    byYear[paper.publicationYear] = (byYear[paper.publicationYear] || 0) + 1;
    byVenue[paper.venue] = (byVenue[paper.venue] || 0) + 1;
    byTrack[paper.track] = (byTrack[paper.track] || 0) + 1;
  }
  for (const year of [2024, 2025, 2026]) byYear[year] ||= 0;

  const sources = parsedSources.map(source => ({
    venue: source.venue, year: source.year, track: source.track, ...(source.workshop ? { workshop: source.workshop } : {}),
    url: source.url,
    ...(source.html ? { fetchStatus: "ok", sha256: `sha256:${sha256(source.html)}`, bytes: Buffer.byteLength(source.html) } : { fetchStatus: "error", fetchError: source.fetchError }),
    parsedPapers: source.papers.length
  }));
  const summary = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    snapshotDate: SNAPSHOT_DATE,
    scope: [2024, 2025, 2026],
    policy: "docs/CVF_OPEN_ACCESS_COLLECTION_POLICY.md",
    candidateDefinition: "Every official final-paper record in the 2024-2026 CVF Open Access main, Findings, and separately indexed workshop pages; section identity is retained and inclusion is not importance evidence.",
    officialPaperPages: sources.length,
    workshopMenus: menuSources.length,
    totalCandidates: candidates.length,
    rawPaperOccurrences: parsedSources.reduce((sum, source) => sum + source.papers.length, 0),
    byYear, byVenue, byTrack,
    sources,
    menuSources: menuSources.map(menu => ({ series: menu.series, url: menu.url, sha256: `sha256:${sha256(menu.html)}`, workshopPages: menu.pages.length })),
    duplicatesMerged: parsedSources.reduce((sum, source) => sum + source.papers.length, 0) - candidates.length,
    unavailablePaperPages: sources.filter(source => source.fetchStatus === "error"),
    importanceReview: { status: "not-run", reviewed: 0, passed: 0 },
    limits: [
      "CVF Open Access hosts author-provided open versions; the publisher version remains the authoritative version of record where the site says so.",
      "Main-conference acceptance, Findings, Oral, Highlight, and workshop inclusion are discovery evidence only.",
      "A workshop paper cannot inherit a main-conference award mechanism."
    ]
  };
  fs.writeFileSync(path.join(options.output, "candidates.jsonl"), candidates.map(record => JSON.stringify(record)).join("\n") + "\n");
  fs.writeFileSync(path.join(options.output, "summary.json"), JSON.stringify(summary, null, 2) + "\n");
  console.log(JSON.stringify({ paperPages: sources.length, totalCandidates: candidates.length, byYear, byVenue, byTrack, duplicatesMerged: summary.duplicatesMerged }, null, 2));
}

main().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
