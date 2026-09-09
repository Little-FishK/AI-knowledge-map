"use strict";
const fs=require('node:fs'),path=require('node:path');
const {safeFile,digest}=require('./readiness/site-artifact');
function verify(directory,production=false) {
  const root=path.resolve(directory),manifest=JSON.parse(fs.readFileSync(safeFile(root,'release-manifest.json'),'utf8'));
  if(manifest.schemaVersion!==1 || !['preview','production'].includes(manifest.mode))throw Error('Invalid release manifest');
  if(production && (manifest.mode!=='production'||!manifest.pages.length||manifest.pages.some(p=>!p.eligible)))throw Error('Only a qualified production artifact can deploy');
  const actual=[];
  function walk(relative='') {for(const name of fs.readdirSync(relative?safeFile(root,relative):root)){const rel=relative?relative+'/'+name:name,file=safeFile(root,rel);if(fs.statSync(file).isDirectory())walk(rel);else actual.push(rel);}}
  walk();
  if(JSON.stringify(actual.filter(p=>p!=='release-manifest.json').sort())!==JSON.stringify(Object.keys(manifest.files).sort()))throw Error('Artifact file set changed');
  for(const [relative,record]of Object.entries(manifest.files)) {
    if(/(^|\/)(?:\.git|\.stage2|\.translation|docs|tools|tests|node_modules)(\/|$)|\.env|audit|acceptance|snapshot/i.test(relative))throw Error('Private or development file refused: '+relative);
    const bytes=fs.readFileSync(safeFile(root,relative));if(digest(bytes)!==record.sha256||bytes.length!==record.bytes)throw Error('Artifact changed: '+relative);
  }
  const base=new URL(manifest.siteUrl).pathname;
  const missing=[];
  for(const relative of actual.filter(p=>p.endsWith('.html'))) {
    const html=fs.readFileSync(safeFile(root,relative),'utf8');
    for(const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const value=match[1];if(!value.startsWith(base))continue;
      const url=new URL(value,manifest.siteUrl);let target=url.pathname.slice(base.length);
      if(!target||target.endsWith('/'))target+='index.html';
      if(!Object.hasOwn(manifest.files,target))missing.push(relative+' -> '+target);
    }
  }
  if(missing.length)throw Error('Broken local links: '+missing.slice(0,12).join('; '));
  if(manifest.seoVersion===1)require('./readiness/verify-site-seo').verifySeo(root,manifest);
  for(const page of manifest.pages) {
    const html=fs.readFileSync(safeFile(root,page.path),'utf8');
    if(!html.includes('source-body:start')||!/<h1\b/.test(html))throw Error('Missing full HTML body');
    if(manifest.mode==='preview'&&!html.includes('noindex'))throw Error('Preview indexing guard missing');
  }
  const sizes=Object.entries(manifest.files).sort((a,b)=>b[1].bytes-a[1].bytes).slice(0,5).map(([file,r])=>({file,bytes:r.bytes}));
  return {status:'pass',mode:manifest.mode,pages:manifest.pages.length,files:actual.length,bytes:Object.values(manifest.files).reduce((n,r)=>n+r.bytes,0),largestFiles:sizes};
}
if(require.main===module)try{console.log(JSON.stringify(verify(process.argv[2],process.argv.includes('--production')),null,2));}catch(e){console.error(e.message);process.exitCode=1;}
module.exports={verify};
