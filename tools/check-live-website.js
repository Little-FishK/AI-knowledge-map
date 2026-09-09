'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {verify}=require('./verify-website');
async function main(){
  const root=path.resolve(process.argv[2]||'site-release');verify(root,true);
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'release-manifest.json'),'utf8'));
  const hash=value=>'sha256:'+crypto.createHash('sha256').update(value).digest('hex');
  const remote=await fetch(new URL('release-manifest.json',manifest.siteUrl),{signal:AbortSignal.timeout(20000),redirect:'error'});
  if(!remote.ok||hash(JSON.stringify(await remote.json()))!==hash(JSON.stringify(manifest)))throw Error('Exact release is not live yet');
  const names=[...manifest.seoPages.map(p=>p.file),'sitemap.xml','robots.txt','assets/social/site-card.png',...Object.keys(manifest.files).filter(f=>/^[a-f0-9]{32}\.txt$/.test(f))];
  const responses=[];
  for(const name of names){
    const url=new URL(name.replace(/index\.html$/,''),manifest.siteUrl).href;
    const response=await fetch(url,{signal:AbortSignal.timeout(20000),redirect:'error'});
    const bytes=Buffer.from(await response.arrayBuffer());
    if(response.status!==200||hash(bytes)!==manifest.files[name].sha256)throw Error('Live file differs: '+name);
    const robotHeader=response.headers.get('x-robots-tag');
    if(manifest.seoPages.some(p=>p.file===name&&p.indexable)&&/noindex|none/i.test(robotHeader||''))throw Error('CDN blocks indexing: '+name);
    if(name.endsWith('.png')&&!/image\/png/.test(response.headers.get('content-type')||''))throw Error('Incorrect share image MIME');
    responses.push({url,status:response.status,bytes:bytes.length,xRobotsTag:robotHeader});
  }
  const missing=await fetch(new URL('phase8-nonexistent-url-check/',manifest.siteUrl),{signal:AbortSignal.timeout(20000)});
  if(missing.status!==404||!((await missing.text()).includes('noindex, nofollow')))throw Error('404 indexing protection failed');
  const agents=[];
  for(const agent of ['Googlebot','bingbot','OAI-SearchBot','GPTBot']){
    const response=await fetch(new URL('zh/concepts/supervised-learning/',manifest.siteUrl),{headers:{'User-Agent':agent},signal:AbortSignal.timeout(20000),redirect:'error'});
    if(!response.ok)throw Error('User-agent request blocked: '+agent);
    agents.push({userAgent:agent,status:response.status});
  }
  console.log(JSON.stringify({checkedAt:new Date().toISOString(),manifestHash:hash(JSON.stringify(manifest)),responses,simulatedUserAgents:agents,limits:'Requests originate from this machine, not real crawler networks; engine URL inspections are separate.',missingStatus:missing.status},null,2));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
