'use strict';
// Upgrade presentation on an exact public release without republishing local Stage 2 candidates.
const fs = require('node:fs'), path = require('node:path');
const {verify} = require('./verify-website');
const {documentPage,digest} = require('./readiness/site-artifact');
const seo = require('./readiness/site-seo');
const {directory} = require('./readiness/learning-directory');
const [sourceArg,outputArg] = process.argv.slice(2);
if (!sourceArg || !outputArg) throw Error('Usage: node tools/seo-directory-release.js PUBLIC_RELEASE NEW_DIRECTORY');
const source=path.resolve(sourceArg), output=path.resolve(outputArg);
verify(source,true);
if(fs.existsSync(output))throw Error('Destination must not exist');
const original=JSON.parse(fs.readFileSync(path.join(source,'release-manifest.json'),'utf8'));
const manifest=structuredClone(original), base=new URL(manifest.siteUrl).pathname;
const entries=manifest.pages.map(page=>{
  const meta=manifest.seoPages.find(m=>m.file===page.path);
  if(!meta)throw Error('Missing published metadata');
  return {id:page.id,locale:page.locale,page:{title:meta.title,subtitle:meta.description}};
});
const locales=['zh','en'].filter(l=>entries.some(e=>e.locale===l));
fs.cpSync(source,output,{recursive:true,errorOnExist:true,force:false});
function put(file,html){
  const target=path.join(output,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,html);
  const bytes=fs.readFileSync(target);manifest.files[file]={sha256:digest(bytes),bytes:bytes.length};
}
const home=fs.readFileSync(path.join(source,'index.html'),'utf8');
for(const locale of locales){
  const lang=locale==='en'?'en':'zh-Hans', page=directory(entries,locale,base), file=`${locale}/index.html`;
  const meta=seo.metadata({siteUrl:manifest.siteUrl,path:`${locale}/`,title:page.title,description:page.description,locale:lang,kind:'CollectionPage',
    alternates:locales.length>1?locales.map(l=>({locale:l==='en'?'en':'zh-Hans',url:new URL(`${l}/`,manifest.siteUrl).href})):[],
    breadcrumbs:[{name:locale==='en'?'AI Knowledge Map':'AI 知识地图',url:manifest.siteUrl},{name:page.title,url:new URL(`${locale}/`,manifest.siteUrl).href}]});
  let html=seo.apply(documentPage(page.title,page.body,base,false,lang),meta,manifest.siteUrl);
  html=html.replace(/<main id="main-content"[^>]*>/,m=>m+seo.breadcrumbHtml(meta.breadcrumbs,lang));
  html=require('./readiness/initial-canvas').apply(html);
  if(locale==='en')html=html.replace('跳到正文 / Skip to content','Skip to content').replace('>AI 知识地图</a>','>AI Knowledge Map</a>').replace('>搜索与文字目录 / Search</a>','>Search concepts</a>');
  put(file,html);Object.assign(meta,{file,contentHash:seo.fingerprint(html)});
  manifest.seoPages=manifest.seoPages.filter(m=>m.file!==file);manifest.seoPages.push(meta);
}
for(const meta of manifest.seoPages.filter(m=>original.files[m.file])){
  let html=fs.readFileSync(path.join(source,meta.file),'utf8');const before=html;
  if(meta.path==='search/'){
    const guides=locales.map(l=>`<a class="release-directory-link" lang="${l==='en'?'en':'zh-Hans'}" href="${base}${l}/">${l==='en'?'Learn AI':'AI 学习指南'}</a>`).join('');
    html=html.replace('</h1>','</h1><nav aria-label="Learning guides">'+guides+'</nav>');
  }
  if(meta.kind==='LearningResource'){
    const locale=meta.locale==='en'?'en':'zh';
    meta.breadcrumbs[1]={name:locale==='en'?'AI learning guide':'AI 学习指南',url:new URL(`${locale}/`,manifest.siteUrl).href};
    html=html.replace(/<nav class="site-breadcrumbs"[\s\S]*?<\/nav>/,seo.breadcrumbHtml(meta.breadcrumbs,meta.locale));
    html=seo.apply(html,meta,manifest.siteUrl);
    const body=value=>value.match(/<!-- source-body:start -->[\s\S]*?<!-- source-body:end -->/)?.[0];
    if(!body(before)||body(before)!==body(html))throw Error('Article body changed');
  }
  if(html!==before){put(meta.file,html);meta.contentHash=seo.fingerprint(html);}
}
put('sitemap.xml',seo.sitemap(manifest.seoPages));
manifest.createdAt=new Date().toISOString();
if(JSON.stringify(original.pages)!==JSON.stringify(manifest.pages))throw Error('Publication identity changed');
fs.writeFileSync(path.join(output,'release-manifest.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify({output,verification:verify(output,true),preservedArticleIdentities:manifest.pages.length},null,2));
