'use strict';
// Read-only public HTTP checks. Index eligibility is not evidence of engine indexing.
const fs = require('node:fs');
const path = require('node:path');
const decode = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g)].map(m => [m[1].toLowerCase(), decode(m[3])]));
}
async function main() {
  const site = new URL(process.argv[2] || 'https://ai-knowledge-map.com/');
  const output = process.argv[3];
  if (site.protocol !== 'https:' || site.hash || site.search) throw Error('Use an HTTPS site root without query or fragment');
  const get = async url => {
    const response = await fetch(url, {signal: AbortSignal.timeout(30000)});
    return {status: response.status, finalUrl: response.url, headers: Object.fromEntries(response.headers), body: await response.text()};
  };
  const [robots, sitemap] = await Promise.all([get(new URL('robots.txt', site)), get(new URL('sitemap.xml', site))]);
  if (sitemap.status !== 200) throw Error('Sitemap unavailable: ' + sitemap.status);
  const urls = [...sitemap.body.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => decode(m[1]));
  if (!urls.length || urls.length > 1000) throw Error('Expected 1–1000 sitemap URLs');
  for (const url of urls) {
    const parsed = new URL(url);
    if (parsed.origin !== site.origin || parsed.hash || parsed.search) throw Error('Unexpected sitemap URL: ' + url);
  }
  let cursor = 0;
  const pages = new Array(urls.length);
  await Promise.all(Array.from({length: 6}, async () => {
    while (cursor < urls.length) {
      const index = cursor++, url = urls[index];
      try {
        const result = await get(url), html = result.body;
        const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || '';
        const links = [...head.matchAll(/<link\b[^>]*>/gi)].map(m => attributes(m[0]));
        const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map(m => attributes(m[0]));
        const titles = [...head.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map(m => decode(m[1]));
        const canonicals = links.filter(m => m.rel === 'canonical').map(m => m.href);
        const descriptions = metas.filter(m => m.name === 'description').map(m => m.content);
        const language = attributes(html.match(/<html\b[^>]*>/i)?.[0] || '').lang;
        const alternates = links.filter(m => m.rel === 'alternate' && m.hreflang).map(m => ({locale:m.hreflang,url:m.href}));
        const directives = metas.filter(m => /^(robots|googlebot|bingbot)$/i.test(m.name || '')).map(m => m.content || '').join(',') + ',' + (result.headers['x-robots-tag'] || '');
        const anchors = [...html.matchAll(/<a\b[^>]*>/gi)].map(m => attributes(m[0]).href).filter(Boolean);
        const internalLinks = [...new Set(anchors.flatMap(href => {
          try { const target = new URL(href, url); return target.origin === site.origin && !target.hash && !target.search ? [target.href] : []; } catch { return []; }
        }))];
        const issues = [];
        if (result.status !== 200) issues.push('http-' + result.status);
        if (result.finalUrl !== url) issues.push('redirected-sitemap-url');
        if (titles.length !== 1 || !titles[0].trim()) issues.push('title');
        if (canonicals.length !== 1 || canonicals[0] !== url) issues.push('canonical');
        if (descriptions.length !== 1 || !descriptions[0]?.trim()) issues.push('description');
        if ((html.match(/<h1\b/gi) || []).length !== 1) issues.push('h1');
        if (/\b(noindex|none)\b/i.test(directives)) issues.push('noindex');
        const expectedLanguage = new URL(url).pathname.includes('/en/') ? 'en' : 'zh-Hans';
        if (language !== expectedLanguage) issues.push('document-language');
        let schemas = [];
        try {
          schemas = [...head.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].flatMap(m => {
            const value = JSON.parse(m[1]); return Array.isArray(value) ? value : value['@graph'] || [value];
          });
          if (!schemas.some(s => s.url === url && s.inLanguage === language)) issues.push('structured-page-identity');
        } catch { issues.push('invalid-jsonld'); }
        pages[index] = {url, status: result.status, title: titles[0], description: descriptions[0], canonical: canonicals[0], language, alternates, schemaTypes:schemas.map(s => s['@type']), internalLinks, issues};
      } catch (error) { pages[index] = {url, issues: ['fetch-error'], error: error.message, internalLinks: []}; }
    }
  }));
  const byUrl = new Map(pages.map(p => [p.url, p]));
  for (const page of pages) {
    const alternates = page.alternates || [];
    if (alternates.length && !alternates.some(a => a.url === page.url && a.locale === page.language)) page.issues.push('hreflang-missing-self');
    if (new Set(alternates.map(a => a.locale)).size !== alternates.length) page.issues.push('hreflang-duplicate-language');
    for (const alternate of alternates) {
      const peer = byUrl.get(alternate.url);
      if (!peer || peer.language !== alternate.locale || !peer.alternates?.some(a => a.url === page.url && a.locale === page.language)) page.issues.push('hreflang-not-reciprocal');
    }
    const counterpart = page.url.replace(/\/(zh|en)\/concepts\//, (_, language) => `/${language === 'zh' ? 'en' : 'zh'}/concepts/`);
    if (counterpart !== page.url && byUrl.has(counterpart) && !alternates.some(a => a.url === counterpart)) page.issues.push('hreflang-missing-counterpart');
  }
  const reachable = new Set(), queue = [site.href];
  while (queue.length) {
    const url = queue.shift();
    if (reachable.has(url) || !byUrl.has(url)) continue;
    reachable.add(url); queue.push(...byUrl.get(url).internalLinks);
  }
  const duplicates = field => [...new Set(pages.map(p => p[field]).filter(Boolean))].flatMap(value => {
    const matches = pages.filter(p => p[field] === value).map(p => p.url);
    return matches.length > 1 ? [{value, urls: matches}] : [];
  });
  const report = {
    checkedAt: new Date().toISOString(), siteUrl: site.href,
    scope: 'Public HTTP and initial HTML only; no JavaScript rendering, engine index status, ranking, robots parser or field performance measurement.',
    robots: {status: robots.status, content: robots.body},
    summary: {sitemapUrls: urls.length, chineseConcepts: urls.filter(u => u.includes('/zh/concepts/')).length, englishConcepts: urls.filter(u => u.includes('/en/concepts/')).length, pagesWithIssues: pages.filter(p => p.issues.length).length, reachableFromHome: reachable.size},
    unreachableFromHome: urls.filter(url => !reachable.has(url)),
    duplicateTitles: duplicates('title'), duplicateDescriptions: duplicates('description'), pages
  };
  if (output) { fs.mkdirSync(path.dirname(path.resolve(output)), {recursive: true}); fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n'); }
  console.log(JSON.stringify({...report.summary, duplicateTitles: report.duplicateTitles.length, duplicateDescriptions: report.duplicateDescriptions.length, output: output || null}, null, 2));
  if (report.summary.pagesWithIssues || report.unreachableFromHome.length || report.duplicateTitles.length || report.duplicateDescriptions.length) process.exitCode = 1;
}
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
