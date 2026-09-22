'use strict';
// Changes only landing-page presentation on an already verified public artifact.
const fs=require('node:fs'),path=require('node:path');
const seo=require('./readiness/site-seo');
const {digest,documentPage}=require('./readiness/site-artifact');
const {verify}=require('./verify-website');
const positioning=require('./readiness/learning-positioning');
const [sourceArg,outArg]=process.argv.slice(2);
if(!sourceArg||!outArg)throw Error('Usage: node tools/seo-positioning-release.js PUBLIC_RELEASE NEW_DIRECTORY');
const source=path.resolve(sourceArg),out=path.resolve(outArg);
verify(source,true);
if(fs.existsSync(out))throw Error('Destination already exists');
fs.cpSync(source,out,{recursive:true});
const manifest=JSON.parse(fs.readFileSync(path.join(out,'release-manifest.json')));
const original=JSON.parse(fs.readFileSync(path.join(source,'release-manifest.json')));
function put(file,value){fs.writeFileSync(path.join(out,file),value);const bytes=fs.readFileSync(path.join(out,file));manifest.files[file]={sha256:digest(bytes),bytes:bytes.length};}
const entries=manifest.pages.map(p=>{const m=manifest.seoPages.find(m=>m.file===p.path);return {id:p.id,locale:p.locale,page:{title:m.title,subtitle:m.description}};});
for(const locale of ['zh','en']){
  const file=locale+'/index.html',meta=manifest.seoPages.find(m=>m.file===file);
  const page=require('./readiness/learning-directory').directory(entries,locale,new URL(manifest.siteUrl).pathname);
  Object.assign(meta,{title:page.title,description:page.description});
  meta.breadcrumbs[meta.breadcrumbs.length-1].name=page.title;
  let html=seo.apply(documentPage(page.title,page.body,new URL(manifest.siteUrl).pathname,false,meta.locale),meta,manifest.siteUrl);
  html=html.replace(/<main id="main-content"[^>]*>/,m=>m+seo.breadcrumbHtml(meta.breadcrumbs,meta.locale));
  html=require('./readiness/initial-canvas').apply(html);
  if(locale==='en')html=html.replace('跳到正文 / Skip to content','Skip to content').replace('>AI 知识地图</a>','>AI Knowledge Map</a>').replace('>搜索与文字目录 / Search</a>','>Search concepts</a>');
  put(file,html);meta.contentHash=seo.fingerprint(html);
}
let app=fs.readFileSync(path.join(source,'assets/app.js'),'utf8');
const before='document.title = label ? `${label}｜${siteTitle}` : siteTitle;';
const after="document.title = label ? `${label}｜${siteTitle}` : (language.getLocale() === 'en'\n      ? 'Learn AI from Scratch: Free Guide for Beginners | AI Knowledge Map'\n      : '零基础免费学 AI：概念与入门学习指南 | AI 知识地图');";
if(!app.includes(before))throw Error('Unexpected public title implementation');
put('assets/app.js',app.replace(before,after));
let onboarding=fs.readFileSync(path.join(source,'assets/onboarding.js'),'utf8');
const oldOnboarding="document.title = `${isMap ? '新手地图' : lesson.title}｜新手导览 · AI 知识地图`;";
if(!onboarding.includes(oldOnboarding))throw Error('Unexpected onboarding title implementation');
put('assets/onboarding.js',onboarding.replace(oldOnboarding,"document.title = isMap ? (english() ? 'Learn AI from Scratch: Free Guide for Beginners | AI Knowledge Map' : '零基础免费学 AI：概念与入门学习指南 | AI 知识地图') : `${lesson.title}｜新手导览 · AI 知识地图`;"));
let html=fs.readFileSync(path.join(source,'index.html'),'utf8');
if(html.includes('id="learning-intro"'))throw Error('Positioning already present');
const meta=manifest.seoPages.find(m=>m.file==='index.html');
Object.assign(meta,{title:positioning.homeTitle,description:positioning.homeDescription});
html=seo.apply(html,meta,manifest.siteUrl);
html=html.replace(/src="assets\/app\.js(?:\?v=[^"]*)?"/,`src="assets/app.js?v=${manifest.files['assets/app.js'].sha256.slice(7,23)}"`);
html=html.replace(/src="assets\/onboarding\.js(?:\?v=[^"]*)?"/,`src="assets/onboarding.js?v=${manifest.files['assets/onboarding.js'].sha256.slice(7,23)}"`);
put('index.html',html);meta.contentHash=seo.fingerprint(html);
const allowed=new Set(['index.html','en/index.html','zh/index.html','assets/app.js','assets/onboarding.js']);
for(const [file,record]of Object.entries(original.files)){
  if(!allowed.has(file)&&manifest.files[file]?.sha256!==record.sha256)throw Error('Out-of-scope change: '+file);
}
if(JSON.stringify(original.pages)!==JSON.stringify(manifest.pages))throw Error('Publication identity changed');
manifest.createdAt=new Date().toISOString();
fs.writeFileSync(path.join(out,'release-manifest.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify({verification:verify(out,true),changedFiles:[...allowed]},null,2));
