"use strict";
// Presentation and packaging only. Production content is supplied by the Stage 2 controller.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const {LIBRARY_DATA_FILES} = require('../shared/library-data-files');
const renderer = require('./render-static-concept');
const seo = require('./site-seo');
const positioning = require('./learning-positioning');
const {policy:validatePolicy,canPublish} = require('./publication-policy');
const publicationNotice = require('../../assets/publication-notice');
const {conceptSearchTitle} = require('./concept-search-title');
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
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)} · AI 知识地图</title>${description}${canonical}${preview || options.noindex ? '<meta name="robots" content="noindex, nofollow">' : ''}<link rel="stylesheet" href="${base}assets/style.css"><link rel="stylesheet" href="${base}assets/concept-preview.css"><link rel="stylesheet" href="${base}assets/reading.css"></head><body class="concept-preview"><a class="preview-skip" href="#main-content">跳到正文 / Skip to content</a><header class="preview-header"><a href="${base}">AI 知识地图</a><a href="${base}search/">搜索与文字目录 / Search</a></header><main id="main-content" class="site-directory" tabindex="-1"><h1>${esc(title)}</h1>${preview ? '<p class="release-notice">本地预览：包含尚未完成审核的已展示内容，不代表正式发布或审核通过。</p>' : ''}${body}</main></body></html>`;
}
function renderConcept(entry, entries, siteUrl, preview) {
  const {base} = renderer.configuration(siteUrl), {id, locale, page} = entry;
  const available = entries.filter(e => e.id === id).map(e => e.locale);
  let html = renderer.render(id, page, locale, siteUrl);
  html = html.replace('</h1>', '</h1>' + publicationNotice.render(entry.reviewStatus, locale));
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
    const mapLanguage = locale === 'zh' ? 'zh-Hans' : 'en';
    // Injected straight into final HTML, so the ampersand is escaped here.
    return `<a${attrs} href="${same ? base + route(target, locale) : `${base}?lang=${mapLanguage}&amp;node=${encodeURIComponent(target)}`}">${label}</a>`;
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
function writeArtifact({root, output, entries, inventory, siteUrl, mode, graph, publicationPolicy = 'approved-only'}) {
  const preview = mode === 'preview', {base} = renderer.configuration(siteUrl);
  if (!['preview','production'].includes(mode)) throw Error('Invalid build mode');
  if (fs.existsSync(output)) throw Error('Artifact destination already exists');
  validatePolicy(publicationPolicy);
  if (!preview && (!entries.length || entries.some(e => !canPublish(e,publicationPolicy)))) throw Error('Production requires eligible or explicitly public reading pages');
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
  // Browsers and search engines request /favicon.ico directly; serve it from the site root.
  if (fs.existsSync(safeFile(root, 'favicon.ico'))) put('favicon.ico', fs.readFileSync(safeFile(root, 'favicon.ico')));
  // The directory listing is provided by controller-approved packaging policy, not a recursive data copy.
  for (const name of ['data/graph.js','data/locales','data/content-locales/en/graph.js','data/software.js',...LIBRARY_DATA_FILES,'data/tutorials.js','data/tutorials-codex-youtube.js','data/tutorials-claude-code.js','data/tutorials-video-generated.js']) copyTree(name, p => /\.(?:js|json)$/.test(p));
  let home = fs.readFileSync(safeFile(root, 'index.html'), 'utf8');
  const homeSchema = {"@context":"https://schema.org","@type":"WebSite",name:"AI 知识地图",url:siteUrl,inLanguage:["zh-Hans","en"],description:"面向 AI 初学者和非技术读者的 AI 全貌、基础概念与底层逻辑知识地图。"};
  home = home.replace('</head>', `<meta name="description" content="面向 AI 初学者和非技术读者的 AI 全貌、基础概念与底层逻辑知识地图。"><link rel="canonical" href="${esc(siteUrl)}"><script type="application/ld+json">${JSON.stringify(homeSchema).replace(/</g,'\\u003c')}</script>${preview ? '<meta name="robots" content="noindex, nofollow">' : ''}</head>`);
  home = home.replace('<body>', `<body><a class="preview-skip" href="#stage">跳到地图 / Skip to map</a>`);
  home = home.replace('id="stage"', 'id="stage" tabindex="-1"');
  home = home.replace(/<span\b([^>]*\bid="brand-name"[^>]*)>([\s\S]*?)<\/span>/, '<h1$1>$2</h1>');
  home = home.replace('</body>', '<script defer src="assets/release-navigation.js"></script></body>');
  home = home.replace('</head>', '<script defer src="assets/publication-notice.js"></script></head>');
  put('index.html', home);
  // The interactive views get real directories so GitHub Pages serves them
  // without a 404 rewrite. <base href="../"> keeps every relative asset at the
  // site root, on a custom domain and on a /<repo>/ subpath alike.
  const viewShell = html => {
    const next = html.replace(/<head(\s[^>]*)?>/i, match => `${match}<base href="../">`);
    if (next === html) throw Error('View shell base injection failed');
    return next;
  };
  put('library/index.html', viewShell(home));
  put('software/index.html', viewShell(home));
  const navigation = {};
  for (const entry of entries) {
    route(entry.id, entry.locale);
    (navigation[entry.id] ||= {})[entry.locale === 'zh' ? 'zh-Hans' : 'en'] = route(entry.id, entry.locale);
    put(route(entry.id, entry.locale) + 'index.html', renderConcept(entry, entries, siteUrl, preview));
    if(entry.locale==='en' && entry.englishVerified && entry.translationEnvelope)
      put(`data/content-locales/en/deepdive/${entry.id}.json`,JSON.stringify(entry.translationEnvelope));
  }
  put('assets/concept-pages.js', 'window.AI_STATIC_CONCEPTS=' + JSON.stringify(navigation) + ';\n');
  const chinese = entries.filter(e => e.locale === 'zh');
  put('data/deepdive-runtime/manifest.js', 'window.DEEPDIVE_RUNTIME=' + JSON.stringify({base:'data/deepdive-runtime', ids:chinese.map(e=>e.id), revision:digest(JSON.stringify(entries.map(e=>e.sourceHash))).slice(7,23)}) + ';');
  for (const e of chinese) {
    const page={...e.page,websitePublication:{publicAccess:canPublish(e,publicationPolicy),reviewStatus:e.reviewStatus||(e.eligible?'reviewed':'pending-review')}};
    put(`data/deepdive-runtime/${e.id}.js`, '(window.DEEPDIVE=window.DEEPDIVE||{})['+JSON.stringify(e.id)+']='+JSON.stringify(page)+';');
  }
  const nodes = graph?.nodes || [];
  const graphTitles = new Map(nodes.map(node => [node.id, node.title]));
  // Link only to pages present in this artifact; unpublished concepts retain map navigation.
  const publishedChinese = new Set(chinese.map(entry => entry.id));
  const conceptHref = id => publishedChinese.has(id) ? base + route(id, 'zh') : `${base}?lang=zh-Hans&node=${encodeURIComponent(id)}`;
  const edges = (graph?.edges || []).map(e=>({source:e.from ?? e.source,target:e.to ?? e.target,directed:graph?.edgeTypes?.[e.type]?.directed!==false,label:e.label || graph?.edgeTypes?.[e.type]?.label || e.type || '关联'}));
  const results = nodes.map(n => ({id:n.id, title:n.title, aliases:n.aliases || [], summary:n.summary || '', href:conceptHref(n.id), kind:'概念 / Concept', relations:edges.filter(e=>e.source===n.id || e.target===n.id)}));
  for (const e of entries) results.push({id:e.id, title:e.page.title, aliases:e.page.aliases || [], summary:plain(e.page.subtitle), text:plain(e.page.html), href:base + route(e.id,e.locale), kind:e.locale === 'en' ? 'English reading' : '中文理解页', locale:e.locale});
  const cards = results.map(r=>`<li class="directory-item" data-search="${esc([r.title,...(Array.isArray(r.aliases) ? r.aliases : [r.aliases]),r.summary].join(' '))}"><a href="${esc(r.href)}">${esc(r.title)}</a><small>${esc(r.kind)}</small><p>${esc(r.summary)}</p>${r.relations?.length ? `<details><summary>概念关系（→ 有向，— 无向）</summary><ul>${r.relations.map(e=>`<li><a href="${esc(conceptHref(e.source))}">${esc(nodes.find(n=>n.id===e.source)?.title || e.source)}</a> ${e.directed ? '→' : '—'} <a href="${esc(conceptHref(e.target))}">${esc(nodes.find(n=>n.id===e.target)?.title || e.target)}</a> · ${esc(e.label)}</li>`).join('')}</ul></details>` : ''}</li>`).join('');
  put('search/index.html', documentPage('搜索与文字目录 / Search', `<form role="search"><label for="site-query">搜索概念、别名和理解页正文 / Search concepts and reading pages</label><input id="site-query" name="q" type="search" autocomplete="off"><button type="submit">搜索 / Search</button></form><p id="search-status" role="status" aria-live="polite">${results.length} 项；无需 JavaScript 也可浏览完整目录。</p><ul id="directory-results">${cards}</ul><script defer src="${base}assets/site-search.js"></script>`, base, preview, 'zh-Hans', {canonical:new URL('search/',siteUrl).href,description:'按概念名称、别名和已发布理解页正文搜索 AI 知识地图，并以文字形式浏览概念关系。'}));
  put('assets/site-search-index.json', JSON.stringify(results));
  // The interactive views are app shells: they render from window.* data scripts,
  // so a crawler that does not execute JavaScript sees navigation chrome only.
  // These plain pages publish the same records, and each shell names them through
  // crawlableVia — verified by verifyCrawlable, so a shell cannot lose its
  // crawlable counterpart silently.
  const publishedConceptIds = chinese.map(entry => entry.id);
  const libraryModule = require('./library-directory');
  const libraryDirectory = libraryModule.libraryPages(root, {siteUrl, base, nodes, publishedConcepts: publishedConceptIds});
  const softwareDirectory = require('./software-directory').softwarePages(root, {siteUrl, base, nodes, publishedConcepts: publishedConceptIds});
  // The English library mirrors the Chinese tree under en/library/ when a
  // translation table is present; every page pairs with its Chinese counterpart.
  const libraryTranslationsFile = path.join(root, 'data/content-locales/en/library.json');
  let englishLibrary = [];
  if (libraryDirectory.pages.length && fs.existsSync(libraryTranslationsFile)) {
    const englishGraphFile = path.join(root, 'data/content-locales/en/graph.js');
    const conceptTitles = new Map();
    if (fs.existsSync(englishGraphFile)) {
      const previous = global.window;
      global.window = {};
      try {
        delete require.cache[require.resolve(englishGraphFile)];
        require(englishGraphFile);
        for (const [id, record] of Object.entries(global.window.AI_CONTENT_LOCALES.en.graph.collections['graph.nodes'])) if (record.fields && record.fields.title) conceptTitles.set(id, record.fields.title);
      } finally { global.window = previous; }
    }
    const translations = JSON.parse(fs.readFileSync(libraryTranslationsFile, 'utf8'));
    const english = libraryModule.libraryPages(root, {siteUrl, base, nodes, locale: 'en', translations, conceptTitles, publishedConcepts: entries.filter(e => e.locale === 'en').map(e => e.id)});
    // The interactive library view shows more fields than the directory pages
    // (selection reasons, tags, platform profiles); the English view reads the
    // same table at runtime, so every string it can show must be translated.
    const viewMissing = libraryModule.untranslatedViewStrings(libraryModule.loadLibrary(root), translations);
    if (viewMissing.length) throw Error(`English library view translation missing for ${viewMissing.length} strings, e.g. ${viewMissing.slice(0, 3).join(' | ')}`);
    put('data/content-locales/en/library.js', libraryModule.englishLibraryScript(translations));
    englishLibrary = [...english.pages, libraryModule.englishLibraryIndex(english, {base})];
  }
  const englishPaths = new Set(englishLibrary.map(page => page.path));
  const directoryPages = [...libraryDirectory.pages, ...softwareDirectory.pages, ...englishLibrary];
  const directoryMeta = [];
  for (const page of directoryPages) {
    const english = page.locale === 'en';
    const lang = english ? 'en' : 'zh-Hans';
    const paired = page.pairPath && (english || englishPaths.has(page.pairPath));
    const self = new URL(page.path, siteUrl).href;
    const alternates = paired ? [{locale: 'zh-Hans', url: english ? new URL(page.pairPath, siteUrl).href : self}, {locale: 'en', url: english ? self : new URL(page.pairPath, siteUrl).href}] : [];
    const breadcrumbs = page.section
      ? [{name: english ? 'AI Knowledge Map' : 'AI 知识地图', url: siteUrl}, {name: page.section.name, url: new URL(page.section.path, siteUrl).href}, ...(page.breadcrumbs || [])]
      : [{name: english ? 'AI Knowledge Map' : 'AI 知识地图', url: siteUrl}, {name: page.title, url: self}];
    const body = (paired ? libraryModule.languageLink(page, base) : '') + page.body;
    put(page.path + 'index.html', documentPage(page.title, body, base, preview, lang, {canonical: self, description: page.description}));
    directoryMeta.push(seo.metadata({
      siteUrl, path: page.path, title: page.title, description: page.description, locale: lang, kind: 'CollectionPage', alternates, breadcrumbs,
      extraSchemas: page.extraSchemas || [],
    }));
  }
  // Paginated continuation pages (listed:false) are reachable from page 1 and the
  // sitemap; directories and shells name each source once. The English tree is
  // reached through its own index, linked from the text directory.
  const listedDirectoryPages = directoryPages.filter(page => page.listed !== false && page.locale !== 'en');
  const companionsFor = prefix => listedDirectoryPages.filter(page => page.path.startsWith(prefix)).map(page => page.path);
  const directoryLocales = ['zh', 'en'].filter(locale => entries.some(e => e.locale === locale));
  const directoryMetadata = directoryLocales.map(locale => {
    const lang = locale === 'en' ? 'en' : 'zh-Hans';
    const page = require('./learning-directory').directory(entries, locale, base);
    put(`${locale}/index.html`, documentPage(page.title, page.body, base, preview, lang));
    return seo.metadata({siteUrl, path: `${locale}/`, title: page.title, description: page.description, locale: lang, kind: 'CollectionPage',
      alternates: directoryLocales.length > 1 ? directoryLocales.map(l => ({locale:l === 'zh' ? 'zh-Hans' : 'en',url:new URL(`${l}/`,siteUrl).href})) : [],
      breadcrumbs: [{name:lang === 'en' ? 'AI Knowledge Map' : 'AI 知识地图',url:siteUrl},{name:page.title,url:new URL(`${locale}/`,siteUrl).href}]});
  });
  put('404.html', documentPage('找不到页面 / Page not found', `<p>地址可能已改变，请返回地图或搜索概念。The address may have changed.</p><p><a href="${base}">返回地图 / Map</a> · <a href="${base}search/">搜索 / Search</a></p>`,base,preview,'zh-Hans',{noindex:true}));
  if(brand){
    put('about/index.html',documentPage('关于 AI 知识地图',require('./brand-page').body(brand,base),base,preview));
    put('licenses/MIT.txt',fs.readFileSync(safeFile(root,'LICENSE')));
  }
  const seoPages=[
    seo.metadata({siteUrl,path:'',title:positioning.homeTitle,description:positioning.homeDescription,crawlableVia:['search/']}),
    seo.metadata({siteUrl,path:'search/',title:'搜索与文字目录',description:'按概念名称、别名和已发布理解页正文搜索 AI 知识地图，并以文字形式浏览概念关系。',kind:'CollectionPage'}),
    seo.metadata({siteUrl,path:'library/',title:'专业资料库与来源治理',description:'按一级来源与机构浏览 AI 官方技术资料、学术投稿、标准与监管、黑客马拉松、评测基准与专业知识库，并查看每个来源的档案、审核机制与复核状态。',kind:'CollectionPage',crawlableVia:companionsFor('library/')}),
    seo.metadata({siteUrl,path:'software/',title:'AI 软件目录与使用教程',description:'按用途浏览常用 AI 软件与工具，查看每个软件的定位、适用场景、关联概念和配套使用教程。',kind:'CollectionPage',crawlableVia:companionsFor('software/')}),
    ...directoryMeta,
    ...directoryMetadata,
    ...(brand?[seo.metadata({siteUrl,path:'about/',title:'关于 AI 知识地图',description:'AI 知识地图 / AI Knowledge Map 是由 LittleFishK 维护的免费 AI 入门知识项目。了解项目目的、维护方式、使用许可和纠错入口。',kind:'AboutPage',breadcrumbs:[{name:'AI 知识地图',url:siteUrl},{name:'关于项目',url:new URL('about/',siteUrl).href}]})]:[]),
    ...entries.map(entry=>{
      const locale=entry.locale==='zh'?'zh-Hans':'en',path=route(entry.id,entry.locale);
      const peers=entries.filter(e=>e.id===entry.id);
      return seo.metadata({siteUrl,path,title:publishing?.pageTitles?.[path]||conceptSearchTitle(entry,entry.locale==='zh'?graphTitles.get(entry.id):null),description:entry.page.subtitle||entry.page.title,locale,kind:'LearningResource',
        alternates:peers.length>1?peers.map(e=>({locale:e.locale==='zh'?'zh-Hans':'en',url:new URL(route(e.id,e.locale),siteUrl).href})):[],
        breadcrumbs:[{name:locale==='en'?'AI Knowledge Map':'AI 知识地图',url:siteUrl},{name:locale==='en'?'AI learning guide':'AI 学习指南',url:new URL(`${entry.locale}/`,siteUrl).href},{name:entry.page.title,url:new URL(path,siteUrl).href}]});
    }),
    seo.metadata({siteUrl,path:'404.html',title:'找不到页面 / Page not found',description:'此地址不存在，请返回 AI 知识地图或搜索概念。',indexable:false})
  ];
  for(const meta of seoPages){
    const file=meta.path.endsWith('.html')?meta.path:meta.path+'index.html';
    let html=seo.apply(files[file].toString('utf8'),meta,siteUrl,preview);
    if (file === 'index.html') {
      const directoryLink = `<a class="release-directory-link" data-release-search href="${base}search/">文字目录 / Search</a>`;
      html = html.replace('</header>', directoryLink + '</header>');
    }
    if (meta.path === 'search/') {
      const guides = directoryLocales.map(l => `<a class="release-directory-link" lang="${l === 'en' ? 'en' : 'zh-Hans'}" href="${base}${l}/">${l === 'en' ? 'Learn AI' : 'AI 学习指南'}</a>`).join('');
      // The text directory is the natural place to advertise the static
      // directories: it is itself crawlable, so the library and software
      // records are one hop from every entry point.
      const browse = listedDirectoryPages.map(page => `<a class="release-directory-link" href="${base}${page.path}">${esc(page.navLabel || page.title)}</a>`).join('');
      const englishLibraryLink = englishPaths.size ? `<nav aria-label="Professional library"><a class="release-directory-link" lang="en" href="${base}en/library/">Professional Library (English)</a></nav>` : '';
      html = html.replace('</h1>', '</h1><nav aria-label="Learning guides">' + guides + '</nav><nav aria-label="文字目录">' + browse + '</nav>' + englishLibraryLink);
    }
    if (meta.path === 'en/' && englishPaths.size) html = html.replace('</h1>', `</h1><p class="rd-lang"><a href="${base}en/library/">Browse the Professional Library: reviewed AI sources →</a></p>`);
    if(brand){
      const aboutLink=`<a class="release-directory-link" href="${base}about/">${meta.locale==='en'?'About / Corrections':'关于与纠错'}</a>`;
      html=html.includes('</header>')?html.replace('</header>',aboutLink+'</header>'):html.replace('</body>',aboutLink+'</body>');
    }
    if(meta.breadcrumbs.length)html=html.replace(/<main id="main-content"[^>]*>/,match=>match+seo.breadcrumbHtml(meta.breadcrumbs,meta.locale));
    if (file !== 'index.html' && !directoryMetadata.includes(meta) && !directoryMeta.includes(meta)) html = require('./reading-shell').apply(html, home, base, graph.meta);
    if ((directoryMetadata.includes(meta) || directoryMeta.includes(meta)) && meta.locale === 'en') html = html.replace('跳到正文 / Skip to content','Skip to content').replace('>AI 知识地图</a>','>AI Knowledge Map</a>').replace('>搜索与文字目录 / Search</a>','>Search concepts</a>');
    // A cached router paired with fresh HTML can restore the retired map hash.
    // Bind navigation scripts to their exact content across deployments.
    html = html.replace(/src="([^"]*\/)?(assets\/(?:router|app|onboarding|reading-shell|release-navigation)\.js)"/g, (match, prefix, asset) => {
      const bytes = files[asset];
      return bytes ? `src="${prefix || ''}${asset}?v=${digest(bytes).slice(7, 23)}"` : match;
    });
    html = require('./initial-canvas').apply(html);
    files[file]=Buffer.from(html);meta.file=file;meta.contentHash=seo.fingerprint(html);
  }
  put('sitemap.xml',seo.sitemap(seoPages,preview));
  put('robots.txt',seo.robots(siteUrl,preview,crawlPolicy));
  // Plain-text indexes for AI systems. Ranking is explicitly not claimed; see
  // docs/seo/2026-09-25-LLMS-TXT.md.
  const llms = require('./llms-txt');
  const readingEntries = entries.map(entry => ({id: entry.id, locale: entry.locale, page: {title: entry.page.title, subtitle: entry.page.subtitle}}));
  put('llms.txt', llms.llmsTxt(root, {siteUrl, entries: readingEntries}));
  put('llms-full.txt', llms.llmsFullTxt(root, {siteUrl, entries: readingEntries}));
  const verificationFiles = [];
  const verificationRoot = safeFile(root, 'config/site-verification');
  if (!preview && fs.existsSync(verificationRoot)) for (const name of fs.readdirSync(verificationRoot).sort()) {
    const bytes = fs.readFileSync(safeFile(root, 'config/site-verification/' + name));
    require('./site-verification').validate(name, bytes);
    put(name, bytes); verificationFiles.push(name);
  }
  if(!preview&&publishing?.indexNowKey){
    if(!/^[a-f0-9]{32}$/.test(publishing.indexNowKey))throw Error('Invalid IndexNow verification key');
    put(publishing.indexNowKey+'.txt',publishing.indexNowKey+'\n');
  }
  put('.nojekyll','');
  const deploymentUrl=new URL(siteUrl);
  if(!preview && deploymentUrl.pathname==='/' && !deploymentUrl.hostname.endsWith('.github.io') && deploymentUrl.hostname!=='localhost' && deploymentUrl.hostname!=='127.0.0.1')put('CNAME',deploymentUrl.hostname+'\n');
  const manifest = {schemaVersion:1,mode,siteUrl,publicationPolicy,createdAt:new Date().toISOString(),translationsGenerated:false,seoVersion:1,seoPages,crawlPolicy,verificationFiles,
    pages:entries.map(e=>({id:e.id,locale:e.locale,path:route(e.id,e.locale)+'index.html',sourceHash:e.sourceHash,eligible:e.eligible,...(e.locale==='en'?{englishVerified:e.englishVerified===true}:{}),publicAccess:canPublish(e,publicationPolicy),reviewStatus:e.reviewStatus||(e.eligible?'reviewed':'pending-review')})),
    excluded:inventory.filter(i=>!entries.some(e=>e.id===i.id)).map(i=>({id:i.id,reason:i.reason})),
    files:Object.fromEntries(Object.entries(files).map(([name,data])=>[name,{sha256:digest(data),bytes:data.length}]))};
  fs.mkdirSync(output,{recursive:true});
  for (const [name,data] of Object.entries(files)) {const target=safeFile(output,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,data,{flag:'wx'});}
  fs.writeFileSync(path.join(output,'release-manifest.json'),JSON.stringify(manifest,null,2),{flag:'wx'});
  return {output,mode,publicationPolicy,pages:entries.length,eligible:inventory.filter(i=>i.eligible).length,underReview:entries.filter(e=>!e.eligible).length,excluded:manifest.excluded.length,manifestHash:digest(JSON.stringify(manifest)),deployed:false};
}
module.exports={writeArtifact,renderConcept,route,safeFile,digest,documentPage};
