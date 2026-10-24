'use strict';
// A technical head-only patch of the exact existing release, without rebuilding content.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const analytics = require('./readiness/analytics');
const {verifyPublishTarget} = require('./verify-publish-target');
const root = path.resolve(__dirname, '..');
const checkout = path.resolve(process.argv[2] || '');
const output = path.resolve(process.argv[3] || '');
if (!process.argv[2] || !process.argv[3] || checkout === root || output === root || fs.existsSync(output)) throw Error('Provide an isolated release checkout and a new artifact directory');
const config = analytics.read(root);
const manifestPath = path.join(checkout, 'release-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const baseline = JSON.parse(JSON.stringify(manifest));
const hash = data => 'sha256:' + crypto.createHash('sha256').update(data).digest('hex');
const resolve = (base, name) => {
  if (!name || name.includes('\\') || name.split('/').some(p => !p || p === '.' || p === '..')) throw Error('Unsafe release path');
  return path.join(base, name);
};
for (const [name, meta] of Object.entries(manifest.files)) {
  const bytes = fs.readFileSync(resolve(checkout, name));
  if (hash(bytes) !== meta.sha256 || bytes.length !== meta.bytes) throw Error('Baseline hash mismatch: ' + name);
}
let changed = 0;
for (const meta of manifest.seoPages) {
  const name = meta.file || (meta.path.endsWith('.html') ? meta.path : meta.path + 'index.html');
  const target = resolve(checkout, name), old = fs.readFileSync(target, 'utf8');
  const updated = analytics.apply(old, config, manifest.siteUrl);
  // Analytics injection must leave the entire published body byte-for-byte unchanged.
  if (old.slice(old.indexOf('</head>')) !== updated.slice(updated.indexOf('</head>'))) throw Error('Body mutation refused: ' + name);
  if ((updated.match(/data-measurement-id="G-RTDE80YXPH"/g) || []).length !== 1) throw Error('Analytics tag count: ' + name);
  fs.writeFileSync(target, updated);
  meta.contentHash = hash(updated);
  manifest.files[name] = {sha256: hash(updated), bytes: Buffer.byteLength(updated)};
  changed++;
}
for (const name of ['assets/site-analytics.js', 'assets/site-analytics.css']) {
  const data = fs.readFileSync(path.join(root, name));
  fs.writeFileSync(resolve(checkout, name), data);
  manifest.files[name] = {sha256: hash(data), bytes: data.length};
}
if (JSON.stringify(baseline.pages) !== JSON.stringify(manifest.pages)) throw Error('Publication records changed');
manifest.createdAt = new Date().toISOString();
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
fs.mkdirSync(output, {recursive: true});
for (const name of [...Object.keys(manifest.files), 'release-manifest.json']) {
  const target = resolve(output, name); fs.mkdirSync(path.dirname(target), {recursive: true}); fs.copyFileSync(resolve(checkout, name), target);
}
console.log(JSON.stringify({changedHtml: changed, preservedPublicationRecords: manifest.pages.length, verification: verifyPublishTarget(output, manifest.siteUrl)}, null, 2));
