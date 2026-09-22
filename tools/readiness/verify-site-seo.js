'use strict';
const fs=require('node:fs'),path=require('node:path');
const {fingerprint,robots:expectedRobots}=require('./site-seo');
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function verifySeo(root,manifest) {
  const fail=message=>{throw Error('SEO: '+message);};
  const pages=manifest.seoPages;
  if(!Array.isArray(pages)||!pages.length)fail('missing page registry');
  const byUrl=new Map(pages.map(p=>[p.canonical,p]));
  if(byUrl.size!==pages.length||new Set(pages.map(p=>p.file)).size!==pages.length)fail('duplicate URL or file');
  const verificationFiles=manifest.verificationFiles || [];
  if(!Array.isArray(verificationFiles)||new Set(verificationFiles).size!==verificationFiles.length)fail('invalid verification file registry');
  for(const file of verificationFiles){
    if(!Object.hasOwn(manifest.files,file))fail('missing verification file');
    require('./site-verification').validate(file,fs.readFileSync(path.join(root,file)));
  }
  const htmlFiles=Object.keys(manifest.files).filter(file=>file.endsWith('.html')&&!verificationFiles.includes(file)).sort();
  if(JSON.stringify(htmlFiles)!==JSON.stringify(pages.map(p=>p.file).sort()))fail('metadata must cover every HTML page');
  const share=fs.readFileSync(path.join(root,'assets/social/site-card.png'));
  if(share.length<24||share.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||share.readUInt32BE(16)!==1200||share.readUInt32BE(20)!==630)fail('share image dimensions differ from metadata');
  for(const meta of pages){
    const expected=new URL(meta.file.replace(/index\.html$/,''),manifest.siteUrl).href;
    if(meta.canonical!==expected)fail('canonical does not match path: '+meta.file);
    const html=fs.readFileSync(path.join(root,meta.file),'utf8'),head=html.match(/<head>([\s\S]*?)<\/head>/i)?.[1]||'';
    if(meta.contentHash!==fingerprint(html))fail('page fingerprint mismatch');
    if(!html.includes(`<html lang="${meta.locale}">`))fail('incorrect document language');
    if((head.match(/<title\b[^>]*>/gi)||[]).length!==1||!head.includes('<title>'+esc(meta.title)))fail('title missing or duplicated');
    if((html.match(/<h1\b[^>]*>/gi)||[]).length!==1)fail('page must have one primary heading');
    if((head.match(/name="description"/g)||[]).length!==1||!head.includes(`name="description" content="${esc(meta.description)}"`))fail('description mismatch');
    if((head.match(/name="robots"/g)||[]).length!==1)fail('duplicate robots directive');
    const noindex=manifest.mode==='preview'||!meta.indexable;
    if(!head.includes(`name="robots" content="${noindex?'noindex, nofollow':'index, follow'}"`))fail('indexing directive mismatch');
    if(!meta.indexable){if(/rel="canonical"/.test(head))fail('excluded page advertises canonical');continue;}
    if((head.match(/rel="canonical"/g)||[]).length!==1||!head.includes(`rel="canonical" href="${esc(meta.canonical)}"`))fail('canonical mismatch');
    if(!head.includes(`property="og:url" content="${esc(meta.canonical)}"`)||!head.includes('name="twitter:card" content="summary_large_image"'))fail('sharing metadata missing');
    const image=new URL('assets/social/site-card.png',manifest.siteUrl).href;
    if(!head.includes(`property="og:image" content="${esc(image)}"`)||!manifest.files['assets/social/site-card.png'])fail('share image missing');
    if((head.match(/hreflang=/g)||[]).length!==meta.alternates.length)fail('unregistered language alternate');
    for(const alt of meta.alternates){
      const peer=byUrl.get(alt.url);
      if(!peer?.indexable||peer.locale!==alt.locale||!peer.alternates.some(a=>a.url===meta.canonical&&a.locale===meta.locale))fail('language relation is not reciprocal');
      if(!head.includes(`hreflang="${alt.locale}" href="${esc(alt.url)}"`))fail('language link missing');
    }
    if(meta.alternates.length&&!meta.alternates.some(a=>a.url===meta.canonical))fail('language relation omits itself');
    const blocks=[...head.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    if(blocks.length!==1)fail('structured data missing or duplicated');
    const schemas=JSON.parse(blocks[0][1]),primary=schemas.find(s=>s['@type']===meta.kind);
    if(primary?.name!==meta.title||primary?.url!==meta.canonical||primary?.inLanguage!==meta.locale)fail('structured data differs from page');
    if(meta.breadcrumbs.length){
      const crumbs=schemas.find(s=>s['@type']==='BreadcrumbList');
      if(crumbs?.itemListElement.length!==meta.breadcrumbs.length||!html.includes('class="site-breadcrumbs"'))fail('visible breadcrumbs missing');
      for(const [i,c] of meta.breadcrumbs.entries())if(crumbs.itemListElement[i].name!==c.name||crumbs.itemListElement[i].item!==c.url)fail('breadcrumb mismatch');
    }
  }
  const published=pages.filter(p=>p.kind==='LearningResource').map(p=>p.file).sort();
  if(JSON.stringify(published)!==JSON.stringify(manifest.pages.map(p=>p.path).sort()))fail('understanding page not authorized by release');
  const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
  const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]).sort();
  const expectedUrls=(manifest.mode==='preview'?[]:pages.filter(p=>p.indexable).map(p=>esc(p.canonical))).sort();
  if(JSON.stringify(urls)!==JSON.stringify(expectedUrls))fail('Sitemap and publication eligibility disagree');
  const robots=fs.readFileSync(path.join(root,'robots.txt'),'utf8');
  if(robots!==expectedRobots(manifest.siteUrl,manifest.mode==='preview',manifest.crawlPolicy))fail('robots differs from release mode or crawl policy');
  return {pages:pages.length,indexable:expectedUrls.length};
}
module.exports={verifySeo};
