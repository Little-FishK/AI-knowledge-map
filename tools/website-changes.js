'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {verify}=require('./verify-website');
const {safeFile,digest}=require('./readiness/site-artifact');
function verifyPrevious(directory){
  // Historical input may contain the SEO defect being fixed. Check its exact
  // recorded bytes and URL eligibility, without treating it as deployable now.
  const root=path.resolve(directory),manifest=JSON.parse(fs.readFileSync(safeFile(root,'release-manifest.json'),'utf8'));
  indexed(manifest);
  for(const [file,record]of Object.entries(manifest.files)){
    const bytes=fs.readFileSync(safeFile(root,file));
    if(digest(bytes)!==record.sha256||bytes.length!==record.bytes)throw Error('Previous release changed: '+file);
  }
}
function indexed(manifest){
  if(manifest.mode!=='production')throw Error('Changes require production releases');
  return new Map((manifest.seoPages?manifest.seoPages.filter(p=>p.indexable).map(p=>({url:p.canonical,file:p.file})):['index.html','search/index.html',...manifest.pages.map(p=>p.path)].map(file=>({file,url:new URL(file.replace(/index\.html$/,''),manifest.siteUrl).href}))).map(p=>{
    const url=new URL(p.url);if(url.origin!==new URL(manifest.siteUrl).origin||url.hash||url.search||!manifest.files[p.file])throw Error('Invalid indexable page');
    return [p.url,manifest.files[p.file].sha256];
  }));
}
function changes(before,after){
  if(before.siteUrl!==after.siteUrl)throw Error('Domain changes require a separate migration plan');
  const old=indexed(before),next=indexed(after),result={added:[],updated:[],removed:[]};
  for(const [url,hash]of next)if(!old.has(url))result.added.push(url);else if(old.get(url)!==hash)result.updated.push(url);
  for(const url of old.keys())if(!next.has(url))result.removed.push(url);
  for(const items of Object.values(result))items.sort();return result;
}
async function main(){
  const [beforeDir,afterDir,...flags]=process.argv.slice(2);if(!beforeDir||!afterDir)throw Error('Usage: node tools/website-changes.js OLD_RELEASE NEW_RELEASE [--submit]');
  if(flags.some(flag=>flag!=='--submit'))throw Error('Unsupported option');
  verifyPrevious(beforeDir);verify(afterDir,true);
  const read=dir=>JSON.parse(fs.readFileSync(path.join(dir,'release-manifest.json'),'utf8'));
  const before=read(beforeDir),after=read(afterDir),diff=changes(before,after),urls=[...diff.added,...diff.updated,...diff.removed];
  const report={diff,submitted:false};
  if(flags.includes('--submit')&&urls.length){
    const config=JSON.parse(fs.readFileSync(path.join(__dirname,'../config/site-publishing.json'),'utf8'));
    if(after.siteUrl!==config.siteUrl||!/^https:\/\//.test(after.siteUrl)||!/^[a-f0-9]{32}$/.test(config.indexNowKey))throw Error('Publishing configuration mismatch');
    const live=await fetch(new URL('release-manifest.json',after.siteUrl),{signal:AbortSignal.timeout(20000),redirect:'error'});
    if(!live.ok)throw Error('Cannot confirm deployed release');
    const remote=JSON.parse(await live.text());
    const hash=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
    if(hash(remote)!==hash(after))throw Error('Refusing to notify before the exact release is live');
    const keyLocation=new URL(config.indexNowKey+'.txt',after.siteUrl).href;
    const proof=await fetch(keyLocation,{signal:AbortSignal.timeout(20000),redirect:'error'});
    if(!proof.ok||(await proof.text()).trim()!==config.indexNowKey)throw Error('IndexNow proof is not publicly available');
    const response=await fetch('https://api.indexnow.org/indexnow',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({host:new URL(after.siteUrl).hostname,key:config.indexNowKey,keyLocation,urlList:urls}),signal:AbortSignal.timeout(30000),redirect:'error'});
    report.httpStatus=response.status;report.submitted=response.status===200||response.status===202;
    report.indexingConfirmed=false;if(!report.submitted)throw Error('IndexNow rejected request: HTTP '+response.status);
  }
  console.log(JSON.stringify(report,null,2));
}
if(require.main===module)main().catch(error=>{console.error(error.message);process.exitCode=1;});
module.exports={changes,indexed,verifyPrevious};
