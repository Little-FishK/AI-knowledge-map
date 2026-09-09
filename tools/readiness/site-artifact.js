"use strict";
// Presentation and packaging only. Production content is supplied by the Stage 2 controller.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const renderer = require('./render-static-concept');
const seo = require('./site-seo');
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const digest = v => 'sha256:' + crypto.createHash('sha256').update(v).digest('hex');
const plain = v => String(v || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
function route(id, locale) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || !['zh','en'].includes(locale)) throw Error('Invalid page route');
  return `${locale}/concepts/${id}/`;
}
function documentPage(title, body, base, preview, lang = 'zh-Hans', options = {}) {
  const canonical = options.canonical ? `<link rel="canonical" href="${esc(options.canonical)}">` : '';
  const description = options.description ? `<meta name="description" content="${esc(options.description)}">` : '';
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)} · AI 知识地图</title>${description}${canonical}${preview || options.noindex ? '<meta name="robots" content="noindex, nofollow">' : ''}<link rel="stylesheet" href="${base}assets/style.css"><link rel="stylesheet" href="${base}assets/concept-preview.css"><link rel="stylesheet" href="${base}assets/reading.css"></head><body class="concept-preview"><a class="preview-skip" href="#main-content">跳到正文 / Skip to content</a><header class="preview-header"><a href="${base}#/map">AI 知识地图</a><a href="${base}search/">搜索与文字目录 / Search</a></header><main id="main-content" class="site-directory" tabindex="-1"><h1>${esc(title)}</h1>${preview ? '<p class="release-notice">本地预览：包含尚未完成审核的已展示内容，不代表正式发布或审核通过。</p>' : ''}${body}</main></body></html>`;
}
function renderConcept(entry, entries, siteUrl, preview) {
  const {base} = renderer.configuration(siteUrl), {id, locale, page} = entry;
  const available = entries.filter(e => e.id === id).map(e => e.locale);
  let html = renderer.render(id, page, locale, siteUrl);
  // Only advertise counterparts which are in this exact artifact.
  const other = locale === 'zh' ? 'en' : 'zh';
  if (!available.includes(other)) {
    html = html.replace(new RegExp(`<link rel="alternate" hreflang="${other === 'zh' ? 'zh-Hans' : 'en'}"[^>]*>\\s*`, 'g'), '');
    html = html.replace(/<a\b[^>]*>[\s\S]*?<\/a>/g, a => a.includes(`href="${base}${route(id, other)}"`) ? '' : a);
  }
  html = html.replace('<article id="dd-article"', `<article id="dd-article" data-concept-id="${esc(id)}"`);
  html = html.replace('</head>', `<link rel="stylesheet" href="${base}assets/reading.css"><link rel="stylesheet" href="${base}assets/progress.css"><script defer src="${base}assets/vendor/supabase-2.115.0.min.js"></script><script defer src="${base}assets/progress-model.js"></script><script defer src="${base}assets/progress-supabase.js"></script><script defer src="${base}assets/progress-runtime.js"></script><script defer src="${base}assets/progress-ui.js"></script><script defer src="${base}assets/reading.js"></script>${preview ? '<meta name="robots" content="noindex, nofollow">' : ''}</head>`);
  html = html.replace('</header>\n<main', `<a href="${base}search/">${locale === 'en' ? 'Search / Text directory' : '搜索与文字目录'}</a></header>\n<main`);
  if (preview) html = html.replace(`<article id="dd-article" data-concept-id="${esc(id)}">`, `<article id="dd-article" data-concept-id="${esc(id)}"><p class="release-notice">${locale === 'en' ? 'Local preview. Publication eligibility is not established.' : '本地构建预览：本页正式发布资格尚未确认，请勿视为审核通过。'}</p>`);
  // Convert existing concept references into real links, without changing the canonical page.
  html = html.replace(/<span\b([^>]*\bdata-goto=["']([a-z0-9-]+)["'][^>]*)>([\s\S]*?)<\/span>/g, (_, attrs, target, label) => {
    const same = entries.some(e => e.id === target && e.locale === locale);
    return `<a${attrs} href="${same ? base + route(target, locale) : `${base}?lang=${locale === 'zh' ? 'zh-Hans' : 'en'}#/map/${target}`}">${label}</a>`;
  });
  return html;
}
function safeFile(root, relative) {
  if (!relative || relative.includes('\\') || relative.split('/').some(s => !s || s === '.' || s === '..')) throw Error('Unsafe artifact path');
  const target = path.resolve(root, relative);
  let current = path.resolve(root);
  if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw Error('Symlink refused');
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw Error('Symlink refused');
  }
  return target;
}
function writeArtifact({root, output, entries, inventory, siteUrl, mode, graph}) {
  const preview = mode === 'preview', {base} = renderer.configuration(siteUrl);
  if (!['preview','production'].includes(mode)) throw Error('Invalid build mode');
  if (fs.existsSync(output)) throw Error('Artifact destination already exists');
  if (!preview && (!entries.length || entries.some(e => !e.eligible))) throw Error('Production requires eligible pages');
  const files = {};
  const publishingPath=safeFile(root,'config/site-publishing.json');
  const publishing=fs.existsSync(publishingPath)?JSON.parse(fs.readFileSync(publishingPath,'utf8')):null;
  const brandPath=safeFile(root,'config/brand.json');
  const brand=fs.existsSync(brandPath)?JSON.parse(fs.readFileSync(brandPath,'utf8')):null;
  const crawlPolicy={searchCrawl:publishing?.searchCrawl||'allow',trainingCrawl:publishing?.trainingCrawl||'allow'};
  if(!preview&&publishing&&publishing.siteUrl!==siteUrl)throw Error('Publishing domain does not match configuration');
  const put = (name, value) => { if (Object.hasOwn(files, name)) throw Error('Duplicate artifact path'); files[name] = Buffer.isBuffer(value) ? value : Buffer.from(value); };
  // Explicit public inputs only. Never copy the repository, audit folders or original page registries.
  const copyTree = (relative, filter = () => true) => {
    const source = safeFile(root, relative);
    if (!fs.existsSync(source)) return;
    if (fs.statSync(source).isDirectory()) for (const name of fs.readdirSync(source).sort()) copyTree(`${relative}/${name}`, filter);
    else if (filter(relative)) put(relative, fs.readFileSync(source));
  };
  copyTree('assets', p => /\.(?:js|css|svg|png|jpg|jpeg|webp|woff2?)$/.test(p) && p !== 'assets/concept-pages.js');
  // The directory listing is provided by controller-approved packaging policy, not a recursive data copy.
  for (const name of ['data/graph.js','data/locales','data/content-locales/en/graph.js','data/software.js','data/library.js','data/library-official-technical.js','data/library-platform-profiles.js','data/tutorials.js','data/tutorials-codex-youtube.js','data/tutorials-claude-code.js','data/tutorials-video-generated.js']) copyTree(name, p => /\.(?:js|json)$/.test(p));
  let home = fs.readFileSync(safeFile(root, 'index.html'), 'utf8');
  const homeSchema = {"@context":"https://schema.org","@type":"WebSite",name:"AI 知识地图",url:siteUrl,inLanguage:["zh-Hans","en"],description:"面向 AI 初学者和非技术读者的 AI 全貌、基础概念与底层逻辑知识地图。"};
  home = home.replace('</head>', `<meta name="description" content="面向 AI 初学者和非技术读者的 AI 全貌、基础概念与底层逻辑知识地图。"><link rel="canonical" href="${esc(siteUrl)}"><script type="application/ld+json">${JSON.stringify(homeSchema).replace(/</g,'\\u003c')}</script>${preview ? '<meta name="robots" content="noindex, nofollow">' : ''}</head>`);
  home = home.replace('<body>', `<body><a class="preview-skip" href="#stage">跳到地图 / Skip to map</a>`);
  home = home.replace('id="stage"', 'id="stage" tabindex="-1"');
  home = home.replace(/<span\b([^>]*\bid="brand-name"[^>]*)>([\s\S]*?)<\/span>/, '<h1$1>$2</h1>');
  home = home.replace('</body>', '<script defer src="assets/release-navigation.js"></script></body>');
  put('index.html', home);
  const navigation = {};
  for (const entry of entries) {
    route(entry.id, entry.locale);
    (navigation[entry.id] ||= {})[entry.locale === 'zh' ? 'zh-Hans' : 'en'] = route(entry.id, entry.locale);
    put(route(entry.id, entry.locale) + 'index.html', renderConcept(entry, entries, siteUrl, preview));
  }
  put('assets/concept-pages.js', 'window.AI_STATIC_CONCEPTS=' + JSON.stringify(navigation) + ';\n');
  const chinese = entries.filter(e => e.locale === 'zh');
  put('data/deepdive-runtime/manifest.js', 'window.DEEPDIVE_RUNTIME=' + JSON.stringify({base:'data/deepdive-runtime', ids:chinese.map(e=>e.id), revision:digest(JSON.stringify(entries.map(e=>e.sourceHash))).slice(7,23)}) + ';');
  for (const e of chinese) put(`data/deepdive-runtime/${e.id}.js`, '(window.DEEPDIVE=window.DEEPDIVE||{})['+JSON.stringify(e.id)+']='+JSON.stringify(e.page)+';');
  const nodes = graph?.nodes || [];
  const edges = (graph?.edges || []).map(e=>({source:e.from ?? e.source,target:e.to ?? e.target,directed:graph?.edgeTypes?.[e.type]?.directed!==false,label:e.label || graph?.edgeTypes?.[e.type]?.label || e.type || '关联'}));
  const results = nodes.map(n => ({id:n.id, title:n.title, aliases:n.aliases || [], summary:n.summary || '', href:`${base}?lang=zh-Hans#/map/${encodeURIComponent(n.id)}`, kind:'概念 / Concept', relations:edges.filter(e=>e.source===n.id || e.target===n.id)}));
  for (const e of entries) results.push({id:e.id, title:e.page.title, aliases:e.page.aliases || [], summary:plain(e.page.subtitle), text:plain(e.page.html), href:base + route(e.id,e.locale), kind:e.locale === 'en' ? 'English reading' : '中文理解页', locale:e.locale});
  const cards = results.map(r=>`<li class="directory-item" data-search="${esc([r.title,...(Array.isArray(r.aliases) ? r.aliases : [r.aliases]),r.summary].join(' '))}"><a href="${esc(r.href)}">${esc(r.title)}</a><small>${esc(r.kind)}</small><p>${esc(r.summary)}</p>${r.relations?.length ? `<details><summary>概念关系（→ 有向，— 无向）</summary><ul>${r.relations.map(e=>`<li><a href="${base}#/map/${encodeURIComponent(e.source)}">${esc(nodes.find(n=>n.id===e.source)?.title || e.source)}</a> ${e.directed ? '→' : '—'} <a href="${base}#/map/${encodeURIComponent(e.target)}">${esc(nodes.find(n=>n.id===e.target)?.title || e.target)}</a> · ${esc(e.label)}</li>`).join('')}</ul></details>` : ''}</li>`).join('');
  put('search/index.html', documentPage('搜索与文字目录 / Search', `<form role="search"><label for="site-query">搜索概念、别名和理解页正文 / Search concepts and reading pages</label><input id="site-query" name="q" type="search" autocomplete="off"><button type="submit">搜索 / Search</button></form><p id="search-status" role="status" aria-live="polite">${results.length} 项；无需 JavaScript 也可浏览完整目录。</p><ul id="directory-results">${cards}</ul><script defer src="${base}assets/site-search.js"></script>`, base, preview, 'zh-Hans', {canonical:new URL('search/',siteUrl).href,description:'按概念名称、别名和已发布理解页正文搜索 AI 知识地图，并以文字形式浏览概念关系。'}));
  put('assets/site-search-index.json', JSON.stringify(results));
  put('404.html', documentPage('找不到页面 / Page not found', `<p>地址可能已改变，请返回地图或搜索概念。The address may have changed.</p><p><a href="${base}#/map">返回地图 / Map</a> · <a href="${base}search/">搜索 / Search</a></p>`,base,preview,'zh-Hans',{noindex:true}));
  if(brand){
    put('about/index.html',documentPage('关于 AI 知识地图',require('./brand-page').body(brand,base),base,preview));
    put('licenses/MIT.txt',fs.readFileSync(safeFile(root,'LICENSE')));
  }
  const seoPages=[
    seo.metadata({siteUrl,path:'',title:'AI 全貌与基础原理',description:'面向 AI 初学者和非技术读者的免费知识项目，通过知识地图、概念解释和学习进度记录，认识 AI 世界的全貌与基础逻辑。'}),
    seo.metadata({siteUrl,path:'search/',title:'搜索与文字目录',description:'按概念名称、别名和已发布理解页正文搜索 AI 知识地图，并以文字形式浏览概念关系。',kind:'CollectionPage'}),
    ...(brand?[seo.metadata({siteUrl,path:'about/',title:'关于 AI 知识地图',description:'AI 知识地图 / AI Knowledge Map 是由 LittleFishK 维护的免费 AI 入门知识项目。了解项目目的、维护方式、使用许可和纠错入口。',kind:'AboutPage',breadcrumbs:[{name:'AI 知识地图',url:siteUrl},{name:'关于项目',url:new URL('about/',siteUrl).href}]})]:[]),
    ...entries.map(entry=>{
      const locale=entry.locale==='zh'?'zh-Hans':'en',path=route(entry.id,entry.locale);
      const peers=entries.filter(e=>e.id===entry.id);
      return seo.metadata({siteUrl,path,title:publishing?.pageTitles?.[path]||entry.page.title,description:entry.page.subtitle||entry.page.title,locale,kind:'LearningResource',
        alternates:peers.length>1?peers.map(e=>({locale:e.locale==='zh'?'zh-Hans':'en',url:new URL(route(e.id,e.locale),siteUrl).href})):[],
        breadcrumbs:[{name:locale==='en'?'AI Knowledge Map':'AI 知识地图',url:siteUrl},{name:locale==='en'?'Search / Text directory':'搜索与文字目录',url:new URL('search/',siteUrl).href},{name:entry.page.title,url:new URL(path,siteUrl).href}]});
    }),
    seo.metadata({siteUrl,path:'404.html',title:'找不到页面 / Page not found',description:'此地址不存在，请返回 AI 知识地图或搜索概念。',indexable:false})
  ];
  for(const meta of seoPages){
    const file=meta.path.endsWith('.html')?meta.path:meta.path+'index.html';
    let html=seo.apply(files[file].toString('utf8'),meta,siteUrl,preview);
    if(brand){
      const aboutLink=`<a class="release-directory-link" href="${base}about/">${meta.locale==='en'?'About / Corrections':'关于与纠错'}</a>`;
      html=html.includes('</header>')?html.replace('</header>',aboutLink+'</header>'):html.replace('</body>',aboutLink+'</body>');
    }
    if(meta.breadcrumbs.length)html=html.replace(/<main id="main-content"[^>]*>/,match=>match+seo.breadcrumbHtml(meta.breadcrumbs,meta.locale));
    files[file]=Buffer.from(html);meta.file=file;meta.contentHash=seo.fingerprint(html);
  }
  put('sitemap.xml',seo.sitemap(seoPages,preview));
  put('robots.txt',seo.robots(siteUrl,preview,crawlPolicy));
  if(!preview&&publishing?.indexNowKey){
    if(!/^[a-f0-9]{32}$/.test(publishing.indexNowKey))throw Error('Invalid IndexNow verification key');
    put(publishing.indexNowKey+'.txt',publishing.indexNowKey+'\n');
  }
  put('.nojekyll','');
  const deploymentUrl=new URL(siteUrl);
  if(!preview && deploymentUrl.pathname==='/' && !deploymentUrl.hostname.endsWith('.github.io') && deploymentUrl.hostname!=='localhost' && deploymentUrl.hostname!=='127.0.0.1')put('CNAME',deploymentUrl.hostname+'\n');
  const manifest = {schemaVersion:1,mode,siteUrl,createdAt:new Date().toISOString(),translationsGenerated:false,seoVersion:1,seoPages,crawlPolicy,
    pages:entries.map(e=>({id:e.id,locale:e.locale,path:route(e.id,e.locale)+'index.html',sourceHash:e.sourceHash,eligible:e.eligible})),
    excluded:inventory.filter(i=>!i.eligible).map(i=>({id:i.id,reason:i.reason})),
    files:Object.fromEntries(Object.entries(files).map(([name,data])=>[name,{sha256:digest(data),bytes:data.length}]))};
  fs.mkdirSync(output,{recursive:true});
  for (const [name,data] of Object.entries(files)) {const target=safeFile(output,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,data,{flag:'wx'});}
  fs.writeFileSync(path.join(output,'release-manifest.json'),JSON.stringify(manifest,null,2),{flag:'wx'});
  return {output,mode,pages:entries.length,eligible:inventory.filter(i=>i.eligible).length,excluded:manifest.excluded.length,manifestHash:digest(JSON.stringify(manifest)),deployed:false};
}
module.exports={writeArtifact,renderConcept,route,safeFile,digest};
