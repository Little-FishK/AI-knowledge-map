"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT_URL = "https://proceedings.mlr.press/";
const YEARS = new Set([2024, 2025, 2026]);

function argumentsFrom(argv) {
  const result = { output: null, offline: false };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--output") result.output = path.resolve(argv[++index]);
    else if (argv[index] === "--offline") result.offline = true;
    else throw new Error("Usage: node build-candidate-pool.js --output <directory> [--offline]");
  }
  if (!result.output) throw new Error("--output is required");
  return result;
}

function decode(value) {
  const named = { amp: "&", apos: "'", gt: ">", lt: "<", quot: '"', nbsp: " " };
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity) => {
      if (entity[0] === "#") {
        const radix = entity[1].toLowerCase() === "x" ? 16 : 10;
        return String.fromCodePoint(Number.parseInt(entity.slice(radix === 16 ? 2 : 1), radix));
      }
      return named[entity.toLowerCase()] || match;
    })
    .replace(/\s+/g, " ")
    .trim();
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function parseVolumeIndex(html) {
  const volumes = [];
  const pattern = /<li>\s*<a href="(v\d+)\/?"><b>Volume\s+(\d+)<\/b><\/a>\s*([\s\S]*?)<\/li>/gi;
  for (const match of html.matchAll(pattern)) {
    volumes.push({ key: match[1].toLowerCase(), number: Number(match[2]), indexTitle: decode(match[3]) });
  }
  if (volumes.length < 200) throw new Error(`PMLR index parser returned only ${volumes.length} volumes`);
  return volumes;
}

function parseVolume(volume, html) {
  const descriptionMatch = html.match(/<meta name="description" content="([^"]+)"\s*\/>/i);
  if (!descriptionMatch) throw new Error(`${volume.key}: missing description metadata`);
  const description = decode(descriptionMatch[1]);
  const published = description.match(/Published as Volume\s+\d+\s+by the Proceedings of Machine Learning Research on\s+(\d{1,2}\s+[A-Za-z]+\s+(\d{4}))/i);
  if (!published) throw new Error(`${volume.key}: missing official publication date`);
  const publicationYear = Number(published[2]);
  const event = description.match(/^Proceedings of\s+(.+?)\s+Held in\s+/i);
  const paperBlocks = [...html.matchAll(/<div class="paper">([\s\S]*?)(?=<div class="paper">|<footer|$)/gi)].map(match => match[1]);
  const papers = [];
  for (const block of paperBlocks) {
    const title = block.match(/<p class="title">([\s\S]*?)<\/p>/i);
    const authors = block.match(/<span class="authors">([\s\S]*?)<\/span>/i);
    const info = block.match(/<span class="info">([\s\S]*?)<\/span>/i);
    const link = block.match(/<a[^>]+href="([^"]+\.html)"[^>]*>\s*abs\s*<\/a>/i);
    if (!title || !authors || !info || !link) throw new Error(`${volume.key}: incomplete paper block near ${decode(block).slice(0, 120)}`);
    const url = new URL(link[1], `${ROOT_URL}${volume.key}/`).href;
    const slug = new URL(url).pathname.split("/").pop().replace(/\.html$/i, "");
    papers.push({
      id: `pmlr-${volume.key}-${slug}`,
      publicationYear,
      title: decode(title[1]),
      authors: decode(authors[1]),
      citation: decode(info[1]),
      volume: volume.number,
      volumeKey: volume.key,
      volumeTitle: volume.indexTitle,
      eventTitle: event ? event[1] : volume.indexTitle,
      publishedOn: published[1],
      url,
      sourceClass: "academic",
      sourceSubcategory: "pmlr",
      discoveryRoutes: ["official-final-volume"],
      relevanceScreening: "potentially-relevant-machine-learning-source",
      candidateStatus: "pending-importance-review",
      importanceReview: { status: "not-run", mechanismMatch: "not-run" }
    });
  }
  return { description, publicationYear, publishedOn: published[1], papers };
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { "user-agent": "AI-Knowledge-Map-PMLR-Candidate-Pool/1.0" } });
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

async function main() {
  const options = argumentsFrom(process.argv.slice(2));
  const cache = path.join(options.output, "cache");
  fs.mkdirSync(cache, { recursive: true });
  const indexFile = path.join(cache, "index.html");
  const indexHtml = options.offline ? fs.readFileSync(indexFile, "utf8") : await fetchText(ROOT_URL);
  if (!options.offline) fs.writeFileSync(indexFile, indexHtml);
  const allVolumeRefs = parseVolumeIndex(indexHtml);
  // v225 is the last volume published in 2023. Older archival pages use several
  // legacy templates without the modern publication-date metadata needed here.
  const volumeRefs = allVolumeRefs.filter(volume => volume.number >= 226);

  const parsed = await mapConcurrent(volumeRefs, 8, async volume => {
    const cacheFile = path.join(cache, `${volume.key}.html`);
    const html = options.offline ? fs.readFileSync(cacheFile, "utf8") : await fetchText(`${ROOT_URL}${volume.key}/`);
    if (!options.offline) fs.writeFileSync(cacheFile, html);
    const record = parseVolume(volume, html);
    return { volume, html, ...record };
  });

  const inScope = parsed.filter(record => YEARS.has(record.publicationYear));
  const candidates = inScope.flatMap(record => record.papers);
  const byId = new Map();
  const byUrl = new Map();
  for (const paper of candidates) {
    if (byId.has(paper.id)) throw new Error(`Duplicate ID: ${paper.id}`);
    if (byUrl.has(paper.url)) throw new Error(`Duplicate URL: ${paper.url}`);
    byId.set(paper.id, paper);
    byUrl.set(paper.url, paper);
  }

  const byYear = {};
  const byVolume = {};
  for (const paper of candidates) {
    byYear[paper.publicationYear] = (byYear[paper.publicationYear] || 0) + 1;
    byVolume[paper.volumeKey] = (byVolume[paper.volumeKey] || 0) + 1;
  }
  for (const year of YEARS) byYear[year] ||= 0;

  const sources = inScope.map(record => ({
    volume: record.volume.number,
    volumeKey: record.volume.key,
    volumeTitle: record.volume.indexTitle,
    publicationYear: record.publicationYear,
    publishedOn: record.publishedOn,
    url: `${ROOT_URL}${record.volume.key}/`,
    sha256: `sha256:${sha256(record.html)}`,
    bytes: Buffer.byteLength(record.html),
    papers: record.papers.length
  }));
  const summary = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    snapshotDate: "2026-09-24",
    scope: [2024, 2025, 2026],
    policy: "docs/PMLR_COLLECTION_POLICY.md",
    candidateDefinition: "Every paper record in every PMLR volume whose official PMLR publication year is 2024, 2025, or 2026; ordinary publication is not importance evidence.",
    index: { url: ROOT_URL, sha256: `sha256:${sha256(indexHtml)}`, discoveredVolumes: allVolumeRefs.length, inspectedModernVolumes: volumeRefs.length },
    inScopeVolumes: sources.length,
    totalCandidates: candidates.length,
    byYear,
    byVolume,
    sources,
    duplicates: { ids: 0, urls: 0 },
    importanceReview: { status: "not-run", reviewed: 0, passed: 0 },
    limits: [
      "The official PMLR publication date, not only the conference name or event year, defines this snapshot.",
      "PMLR volume inclusion, conference acceptance, workshop inclusion, and presentation form are discovery evidence only."
    ]
  };
  fs.writeFileSync(path.join(options.output, "candidates.jsonl"), candidates.map(record => JSON.stringify(record)).join("\n") + "\n");
  fs.writeFileSync(path.join(options.output, "summary.json"), JSON.stringify(summary, null, 2) + "\n");
  console.log(JSON.stringify({ inScopeVolumes: sources.length, totalCandidates: candidates.length, byYear }, null, 2));
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
