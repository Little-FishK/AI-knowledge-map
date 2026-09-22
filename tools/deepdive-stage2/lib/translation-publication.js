"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const hash = value => `sha256:${crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
const check = (ok, message) => { if (!ok) throw new Error(message); };
const HEADER = ["title", "subtitle", "aliases", "meta", "thesis"];
const BROWSER_CHECKS = ["english", "chinese", "fallback", "rapid-switch", "navigation", "resources", "desktop", "mobile", "console"];
function plainTranslatedThesis(source, translation) {
  const sourceTags = source.match(/<\/?[A-Za-z][^<>]*>/g) || [];
  if (!sourceTags.length) return translation;
  const translatedTags = translation.match(/<\/?[A-Za-z][^<>]*>/g) || [];
  check(JSON.stringify(translatedTags) === JSON.stringify(sourceTags), "Thesis source markup mismatch");
  let plain = translation;
  for (const tag of sourceTags) plain = plain.replace(tag, "");
  check(!/<\/?[A-Za-z][^<>]*>/.test(plain), "Unsafe thesis translation markup");
  return plain;
}
function safeDirectory(directory) {
  let current = path.parse(directory).root;
  for (const part of directory.slice(current.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    if (!fs.existsSync(current)) fs.mkdirSync(current);
    const stat = fs.lstatSync(current); check(stat.isDirectory() && !stat.isSymbolicLink(), "Unsafe publication directory");
  }
}

function assemble({ material, snapshot, report }) {
  check(report.state !== "stale" && !report.defects.length, "Stale or defective translation");
  return assembleMaterial({material,snapshot,report});
}
// Read-only layout diagnostics may render a defective draft. Publication still
// uses assemble() above and the independent semantic gates below.
function layoutPreview(value) {
  check(value.report.state !== 'stale', 'Stale translation');
  return {...assembleMaterial(value), publicationAllowed:false};
}
function assembleMaterial({material,snapshot,report}) {
  const source = snapshot.capture.page, page = JSON.parse(JSON.stringify(source));
  const header = material.chapters.find(item => item.chapterId === "page-header");
  check(header, "Missing page header");
  for (const key of HEADER) {
    if (source[key] === undefined) continue;
    const translate = (value, index) => {
      if (!value.trim()) return value;
      const unit = header.units.find(item => item.id === `${key}:${index}`);
      check(unit && unit.source === value && typeof header.output.translations[unit.id] === "string", "Header coverage mismatch");
      const translation = header.output.translations[unit.id];
      return key === "thesis" ? plainTranslatedThesis(value, translation) : translation;
    };
    page[key] = Array.isArray(source[key]) ? source[key].map(translate) : translate(source[key], 0);
  }
  const replacements = material.chapters.filter(item => item.chapterId !== "page-header").flatMap(chapter => chapter.units.map(unit => ({ ...unit, translation: chapter.output.translations[unit.id] })));
  const expected = snapshot.capture.manifest.units;
  check(replacements.length === expected.length, "HTML unit coverage mismatch");
  let end = source.html.length;
  for (const unit of replacements.sort((a, b) => b.start - a.start)) {
    check(expected.some(item => JSON.stringify(item) === JSON.stringify(Object.fromEntries(Object.entries(unit).filter(([key]) => key !== "translation")))), "Unexpected source unit");
    check(Number.isInteger(unit.start) && Number.isInteger(unit.end) && unit.start >= 0 && unit.end <= end && unit.start < unit.end
      && source.html.slice(unit.start, unit.end) === unit.source, "Invalid or overlapping source span");
    check(typeof unit.translation === "string" && unit.translation.trim() && !/[<>]/.test(unit.translation)
      && (unit.kind !== "attribute" || !/["']/.test(unit.translation)), "Unsafe translation markup");
    page.html = page.html.slice(0, unit.start) + unit.translation + page.html.slice(unit.end);
    end = unit.start;
  }
  const payload = { pageId: material.pageId, sourceContentHash: snapshot.capture.sourceContentHash,
    snapshotId: material.snapshotId, reviewId: report.reviewId, revision: report.revision,
    resources: snapshot.capture.manifest.resources, dependencies: snapshot.capture.manifest.dependencies, page };
  return { schemaVersion: 1, artifactHash: hash(payload), payload };
}

function createTranslationPublication({ withTranslationQualityMaterial, withCurrentTranslationSnapshot,
  storageDirectory = root => path.join(path.resolve(root), ".translation"), authorization = () => process.env.STAGE2_TRANSLATION_PUBLISH_HASH,
  automaticVerifier, campaignAuthorization = () => process.env.STAGE2_DEEPSEEK_CAMPAIGN,
  replacementAuthorization = () => JSON.parse(process.env.STAGE2_ENGLISH_REPLACEMENTS || '{}') }) {
  function previewTranslation(root, pageId, reviewId) {
    return withTranslationQualityMaterial(root, pageId, reviewId, value => ({
      candidate: assemble(value), gates: value.report.gates, publicationAllowed: false,
      requiredBrowserChecks: BROWSER_CHECKS,
      resourceKeys: value.snapshot.capture.manifest.resources.map((_, index) => `resource:${index}`),
    }));
  }
  function publishTranslation(root, pageId, reviewId, artifactHash, acceptance) {
    check(authorization() === artifactHash && /^sha256:[a-f0-9]{64}$/.test(artifactHash), "Explicit human authorization for this exact artifact required");
    return commitTranslation(root, pageId, reviewId, artifactHash, acceptance, 'human-approved');
  }
  async function autoPublishTranslation(root, pageId, reviewId, campaignId) {
    check(/^sha256:[a-f0-9]{64}$/.test(campaignId) && campaignAuthorization() === campaignId, 'Exact automatic publication campaign required');
    check(typeof automaticVerifier === 'function', 'Automatic resource/browser verifier unavailable');
    const preview = previewTranslation(root, pageId, reviewId);
    check(preview.gates.filter(g => ![6,9].includes(g.number)).every(g => g.status === 'pass'), 'Source/semantic gates not passed');
    const source = withTranslationQualityMaterial(root, pageId, reviewId, value => value.snapshot.capture.page);
    const acceptance = await automaticVerifier(root, preview.candidate, source);
    check(acceptance.kind === 'automated-browser-resource-v1' && acceptance.artifactHash === preview.candidate.artifactHash, 'Automatic verification binding mismatch');
    return commitTranslation(root, pageId, reviewId, preview.candidate.artifactHash, acceptance, 'machine-reviewed');
  }
  function commitTranslation(root, pageId, reviewId, artifactHash, acceptance, status) {
    return withTranslationQualityMaterial(root, pageId, reviewId, value => {
      const candidate = assemble(value);
      check(candidate.artifactHash === artifactHash, "Candidate changed; repeat acceptance");
      check(value.report.gates.filter(item => ![6, 9].includes(item.number)).every(item => item.status === "pass"), "Source/semantic gates not passed");
      // Human attestation, not machine-invented semantic/browser proof. Trusted launcher pins the hash.
      check(acceptance?.artifactHash === artifactHash && acceptance.approved === true
        && typeof acceptance.reviewer === "string" && acceptance.reviewer.trim().length >= 3, "Missing human acceptance");
      check(Array.isArray(acceptance.browserChecks) && acceptance.browserChecks.length === BROWSER_CHECKS.length
        && BROWSER_CHECKS.every(name => acceptance.browserChecks.filter(item => item.name === name && item.passed === true && typeof item.notes === "string" && item.notes.trim().length >= 20).length === 1), "Incomplete browser acceptance");
      const resources = value.snapshot.capture.manifest.resources;
      check(Array.isArray(acceptance.resources) && acceptance.resources.length === resources.length
        && resources.every((_, index) => acceptance.resources.filter(item => item.key === `resource:${index}` && item.passed === true && typeof item.notes === "string" && item.notes.trim().length >= 20).length === 1), "Incomplete resource acceptance");
      check(typeof acceptance.resourceSummary === "string" && acceptance.resourceSummary.trim().length >= 40, "Resource/formula/dependency review required");
      return withCurrentTranslationSnapshot(root, pageId, value.material.snapshotId, () => {
        check(/^[a-z0-9][a-z0-9-]*$/.test(pageId), "Invalid pageId");
        const directory = path.join(path.resolve(root), "data", "content-locales", "en", "deepdive");
        // Refuse symlink/junction traversal, including existing ancestors.
        safeDirectory(directory);
        const file = path.join(directory, `${pageId}.json`);
        const acceptanceHash = hash(acceptance);
        const envelope = { ...candidate, status, acceptanceHash };
        if (fs.existsSync(file)) {
          check(!fs.lstatSync(file).isSymbolicLink(), "Unsafe publication file");
          const old = JSON.parse(fs.readFileSync(file, "utf8"));
          if (old.artifactHash === artifactHash && old.status === status && hash(old.payload) === artifactHash) return { state: "already-published", artifactHash };
          const grant = replacementAuthorization()[pageId];
          check(grant && Object.keys(grant).sort().join() === 'before,snapshotId'
            && /^sha256:[a-f0-9]{64}$/.test(grant.before) && /^sha256:[a-f0-9]{64}$/.test(grant.snapshotId)
            && grant.before === old.artifactHash && grant.snapshotId === value.material.snapshotId,
            "Existing English release; explicit replacement authorization for the old artifact and new source required");
          check(['human-approved', 'machine-reviewed'].includes(old.status) && old.payload?.pageId === pageId
            && hash(old.payload) === old.artifactHash && old.payload.sourceContentHash !== candidate.payload.sourceContentHash,
            'Replacement requires an intact previous release and a changed source');
          // Preserve the complete old envelope and its existing acceptance receipt.
          // All checks run under the same source/review locks as the atomic replacement.
          const archiveDirectory = path.resolve(storageDirectory(root), 'publication-history', pageId);
          safeDirectory(archiveDirectory);
          const archive = path.join(archiveDirectory, old.artifactHash.slice(7) + '.json');
          if (fs.existsSync(archive)) {
            check(!fs.lstatSync(archive).isSymbolicLink() && hash(JSON.parse(fs.readFileSync(archive, 'utf8'))) === hash(old),
              'Unsafe or conflicting previous release archive');
          } else fs.writeFileSync(archive, JSON.stringify(old), { flag: 'wx' });
        }
        // Human notes and reviewer identity belong in private controller storage, not the public site.
        const receiptDirectory = path.resolve(storageDirectory(root), "publication-acceptance", pageId, artifactHash.slice(7));
        safeDirectory(receiptDirectory);
        const receiptFile = path.join(receiptDirectory, `${acceptanceHash.slice(7)}.json`);
        if (fs.existsSync(receiptFile)) {
          check(!fs.lstatSync(receiptFile).isSymbolicLink() && hash(JSON.parse(fs.readFileSync(receiptFile, "utf8"))) === acceptanceHash, "Unsafe acceptance receipt");
        } else fs.writeFileSync(receiptFile, JSON.stringify(acceptance), { flag: "wx" });
        const temp = `${file}.${crypto.randomUUID()}.tmp`;
        try { fs.writeFileSync(temp, JSON.stringify(envelope), { flag: "wx" }); fs.renameSync(temp, file); }
        finally { if (fs.existsSync(temp)) fs.unlinkSync(temp); }
        check(hash(JSON.parse(fs.readFileSync(file, "utf8")).payload) === artifactHash, "Publication verification failed");
        return { state: "published-English", artifactHash, chineseStateChanged: false };
      });
    });
  }
  function buildStaticTranslation(root, pageId, reviewId, artifactHash, siteUrl) {
    const { writeStaticOutputs, validId } = require("./static-output");
    check(validId(pageId), "Invalid static page ID");
    return withTranslationQualityMaterial(root, pageId, reviewId, value => {
      const candidate = assemble(value);
      check(candidate.payload.pageId === pageId, "Static page binding mismatch");
      check(candidate.artifactHash === artifactHash, "Static candidate changed");
      check(value.report.gates.filter(item => ![6, 9].includes(item.number)).every(item => item.status === "pass"), "Source/semantic gates not passed");
      return withCurrentTranslationSnapshot(root, pageId, value.material.snapshotId, () => {
        const published = path.join(root, "data/content-locales/en/deepdive", `${pageId}.json`);
        safeDirectory(path.dirname(published));
        check(fs.existsSync(published) && !fs.lstatSync(published).isSymbolicLink(), "Approved English publication required");
        const envelope = JSON.parse(fs.readFileSync(published, "utf8"));
        check(envelope.status === "human-approved" && envelope.artifactHash === artifactHash && hash(envelope.payload) === artifactHash, "Approved English publication mismatch");
        check(/^sha256:[a-f0-9]{64}$/.test(envelope.acceptanceHash || ""), "Invalid acceptance hash");
        const receipt = path.join(storageDirectory(root), "publication-acceptance", pageId, artifactHash.slice(7), `${envelope.acceptanceHash.slice(7)}.json`);
        check(fs.existsSync(receipt) && !fs.lstatSync(receipt).isSymbolicLink(), "Missing acceptance receipt");
        const accepted = JSON.parse(fs.readFileSync(receipt, "utf8"));
        check(hash(accepted) === envelope.acceptanceHash && accepted.approved && accepted.artifactHash === artifactHash, "Invalid acceptance receipt");
        const renderer = require("../../readiness/render-static-concept");
        renderer.configuration(siteUrl);
        const outputs = {
          [`zh/concepts/${pageId}/index.html`]: renderer.render(pageId, value.snapshot.capture.page, "zh", siteUrl),
          [`en/concepts/${pageId}/index.html`]: renderer.render(pageId, candidate.payload.page, "en", siteUrl),
        };
        const result = writeStaticOutputs(root, storageDirectory(root), { pageId, artifactHash, sourceContentHash: candidate.payload.sourceContentHash }, outputs, renderer, siteUrl);
        return { state: "built-static-bilingual", pageId, artifactHash, siteUrl, ...result, chineseStateChanged: false, deployed: false };
      });
    });
  }
  function publishedTranslation(root, pageId) {
    check(/^[a-z0-9][a-z0-9-]*$/.test(pageId), 'Invalid page ID');
    const file = path.join(root, 'data/content-locales/en/deepdive', pageId + '.json');
    if (!fs.existsSync(file)) return null;
    safeDirectory(path.dirname(file)); check(!fs.lstatSync(file).isSymbolicLink(), 'Unsafe English file');
    const envelope = JSON.parse(fs.readFileSync(file, 'utf8'));
    check(['human-approved','machine-reviewed'].includes(envelope.status) && hash(envelope.payload) === envelope.artifactHash, 'Invalid English release');
    const preview = previewTranslation(root, pageId, envelope.payload.reviewId);
    check(preview.candidate.artifactHash === envelope.artifactHash && preview.gates.filter(g=>![6,9].includes(g.number)).every(g=>g.status==='pass'), 'English release stale or failed');
    check(/^sha256:[a-f0-9]{64}$/.test(envelope.acceptanceHash), 'Invalid English receipt hash');
    const receipt = path.join(storageDirectory(root), 'publication-acceptance', pageId, envelope.artifactHash.slice(7), envelope.acceptanceHash.slice(7)+'.json');
    safeDirectory(path.dirname(receipt)); check(!fs.lstatSync(receipt).isSymbolicLink(), 'Unsafe English receipt');
    const accepted = JSON.parse(fs.readFileSync(receipt, 'utf8'));
    check(hash(accepted) === envelope.acceptanceHash && accepted.artifactHash === envelope.artifactHash && accepted.approved === true, 'Missing current acceptance');
    check(envelope.status !== 'machine-reviewed' || accepted.kind === 'automated-browser-resource-v1', 'Invalid machine acceptance');
    return envelope;
  }
  function inspectPublishedTranslation(root,pageId) {
    check(/^[a-z0-9][a-z0-9-]*$/.test(pageId),'Invalid page ID');
    const file=path.join(root,'data/content-locales/en/deepdive',pageId+'.json');
    if(!fs.existsSync(file))return {pageId,exists:false,eligible:false};
    safeDirectory(path.dirname(file));check(!fs.lstatSync(file).isSymbolicLink(),'Unsafe English file');
    const envelope=JSON.parse(fs.readFileSync(file,'utf8'));
    const result={pageId,exists:true,status:envelope.status,artifactHash:envelope.artifactHash,reviewId:envelope.payload?.reviewId,sourceContentHash:envelope.payload?.sourceContentHash};
    try{publishedTranslation(root,pageId);return {...result,eligible:true};}
    catch(error){return {...result,eligible:false,reason:error.message};}
  }
  return { previewTranslation, publishTranslation, buildStaticTranslation, autoPublishTranslation, publishedTranslation, inspectPublishedTranslation };
}
module.exports = { createTranslationPublication, assemble, layoutPreview, BROWSER_CHECKS };
