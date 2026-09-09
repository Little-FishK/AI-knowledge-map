"use strict";
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {loadDeepDivePages}=require('../../deepdive/runtime/deepdive-loader');
const {pageContentHash}=require('../../deepdive/quality/deepdive-audit-contracts');
const digest=s=>'sha256:'+crypto.createHash('sha256').update(s).digest('hex');
function summarizePageAssets(id,page,root) {
  const html=String(page.html||'');
  const fragments=tag=>[...html.matchAll(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`,'gi'))].map((m,i)=>({assetId:`${id}:${tag}:${i+1}`,sha256:digest(m[0])}));
  return {pageId:id,source:`data/deepdive/${id}.js`,sourceHash:pageContentHash(page),figures:fragments('figure'),tables:fragments('table'),
    sectionCount:(html.match(/<section\b/gi)||[]).length,
    externalLinks:[...new Set([...html.matchAll(/href\s*=\s*["'](https?:\/\/[^"']+)["']/gi)].map(m=>m[1]))],
    englishArtifactExists:fs.existsSync(path.join(root,'data','content-locales','en','deepdive',id+'.json')),
    englishEligibility:'not-verified',teachingEffectiveness:'not-tested'};
}
function inventoryPageAssets(root){const pages=loadDeepDivePages(root);return {scope:'Current website source metadata only; excludes candidate body, private audit evidence and translation eligibility. Fragment hashes identify assets, not quality.',pages:Object.entries(pages).map(([id,page])=>summarizePageAssets(id,page,root))};}
module.exports={inventoryPageAssets,summarizePageAssets};
