"use strict";
// Availability probe only: HTTP success is not evidence of accuracy or usefulness.
const fs=require('node:fs');
async function main() {
  const [input,output]=process.argv.slice(2); if(!input||!output)throw Error('Usage: node check-asset-links.js inventory.json report.json');
  const inventory=JSON.parse(fs.readFileSync(input,'utf8').replace(/^\uFEFF/,''));
  const urls=inventory.urls, results=[]; let cursor=0;
  async function worker(){ while(cursor<urls.length){ const url=urls[cursor++]; let row={url,checkedAt:new Date().toISOString()}; try{
    const parsed=new URL(url); if(!['http:','https:'].includes(parsed.protocol)||parsed.username||parsed.password||/^(localhost|127\.|10\.|192\.168\.|\[)/i.test(parsed.hostname))throw Error('Unsupported target');
    const r=await fetch(url,{method:'GET',redirect:'follow',signal:AbortSignal.timeout(12000),headers:{'User-Agent':'AI-Knowledge-Map-Link-Check/1.0'}});
    row={...row,status:r.status,finalUrl:r.url,classification:r.ok?'reachable':r.status===404||r.status===410?'missing-at-check':r.status===401||r.status===403||r.status===429?'access-limited':'needs-review'};
    await r.body?.cancel();
  }catch(e){row={...row,classification:'unverified-network',error:e.message};} results.push(row); }}
  await Promise.all(Array.from({length:6},worker));
  const counts=results.reduce((a,r)=>(a[r.classification]=(a[r.classification]||0)+1,a),{});
  fs.writeFileSync(output,JSON.stringify({scope:'HTTP availability only; redirects and anti-bot responses require human interpretation. No semantic or teaching acceptance.',counts,results},null,2));
  console.log(JSON.stringify({total:results.length,counts}));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
