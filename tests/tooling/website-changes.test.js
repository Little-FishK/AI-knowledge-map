'use strict';
const assert=require('node:assert/strict');const {changes}=require('../../tools/website-changes');
const base={mode:'production',siteUrl:'https://example.org/',pages:[],files:{'index.html':{sha256:'old'},'search/index.html':{sha256:'same'}},createdAt:'yesterday'};
assert.deepEqual(changes(base,{...base,createdAt:'today'}),{added:[],updated:[],removed:[]});
const next={...base,seoPages:[{indexable:true,canonical:'https://example.org/',file:'index.html'},{indexable:true,canonical:'https://example.org/new/',file:'new/index.html'},{indexable:false,canonical:'https://example.org/404.html',file:'404.html'}],files:{'index.html':{sha256:'changed'},'new/index.html':{sha256:'new'},'404.html':{sha256:'excluded'}}};
assert.deepEqual(changes(base,next),{added:['https://example.org/new/'],updated:['https://example.org/'],removed:['https://example.org/search/']});
assert.throws(()=>changes(base,{...next,mode:'preview'}),/production/);
assert.throws(()=>changes(base,{...next,siteUrl:'https://other.org/'}),/migration/);
assert.throws(()=>changes(base,{...next,seoPages:[{indexable:true,canonical:'https://evil.org/',file:'index.html'}]}),/Invalid/);
console.log('PASS: meaningful release changes, additions/removals, no build-time-only notifications, preview and domain guards');
// A previous version can have the very SEO defect being fixed, but its bytes
// must still match the historical manifest before it is used as a diff baseline.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {digest}=require('../../tools/readiness/site-artifact');
const {verifyPrevious}=require('../../tools/website-changes');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'website-changes-'));
try{
  const html='<title data-legacy="true">Old</title><title>Duplicate</title>';
  fs.writeFileSync(path.join(temp,'index.html'),html);
  fs.writeFileSync(path.join(temp,'release-manifest.json'),JSON.stringify({mode:'production',siteUrl:base.siteUrl,pages:[],seoPages:[{indexable:true,canonical:base.siteUrl,file:'index.html'}],files:{'index.html':{sha256:digest(html),bytes:Buffer.byteLength(html)}}}));
  verifyPrevious(temp);
  fs.appendFileSync(path.join(temp,'index.html'),'tampered');assert.throws(()=>verifyPrevious(temp),/Previous release changed/);
}finally{if(path.dirname(temp)!==path.resolve(os.tmpdir())||!path.basename(temp).startsWith('website-changes-'))throw Error('Unsafe test cleanup');fs.rmSync(temp,{recursive:true,force:true});}
