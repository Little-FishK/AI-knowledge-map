'use strict';
// Only public build artifacts and deployment receipts are accessed here.
// Every Stage 2 content operation remains inside the MCP build launcher.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {spawn}=require('node:child_process');
const {verify}=require('../verify-website');
const {safeFile}=require('./site-artifact');
const root=path.resolve(__dirname,'../..');
const normalize=s=>s.replace(/\r\n/g,'\n');
function run(command,args,cwd=root,trim=true){return new Promise((resolve,reject)=>{
  const child=spawn(command,args,{cwd,windowsHide:true,shell:false});let out='',err='';
  child.stdout.on('data',c=>out+=c);child.stderr.on('data',c=>err+=c);
  child.on('error',reject);child.on('close',code=>code===0?resolve(trim?out.trim():out):reject(Error(`${path.basename(command)} ${args[0]} failed (${code}): ${(err.trim()||out.trim()||'No diagnostic output').slice(-1800)}`)));
});}
const git=(cwd,...args)=>run('git',['-c','safe.directory='+cwd.replace(/\\/g,'/'),...args],cwd);
async function receiptHtml(receipt, repository=root){
  if(!/^[a-z0-9-]+$/.test(receipt.pageId||''))throw Error('Invalid receipt page ID');
  const relative='en/concepts/'+receipt.pageId+'/index.html';
  if(receipt.output&&fs.existsSync(safeFile(receipt.output,relative)))return fs.readFileSync(safeFile(receipt.output,relative),'utf8');
  // Old full-site copies may be pruned. Their exact publication remains in Git.
  if(!/^[a-f0-9]{40}$/.test(receipt.commit||''))throw Error('Missing exact receipt commit');
  return run('git',['-c','safe.directory='+repository.replace(/\\/g,'/'),'show',receipt.commit+':'+relative],repository,false);
}
async function receiptExpectation(receipt){
  if(receipt.pageContentSha256!==undefined){
    if(!/^sha256:[a-f0-9]{64}$/.test(receipt.pageContentSha256))throw Error('Invalid receipt content hash');
    return {sha256:receipt.pageContentSha256};
  }
  return receiptHtml(receipt);
}
function matchesExpected(text,expected){
  if(typeof expected==='string')return normalize(text)===normalize(expected);
  return expected?.sha256==='sha256:'+crypto.createHash('sha256').update(normalize(text)).digest('hex');
}
function sameBaseline(artifact,checkout){
  const m=JSON.parse(fs.readFileSync(safeFile(artifact,'release-manifest.json'),'utf8'));
  const deployed=JSON.parse(fs.readFileSync(safeFile(checkout,'release-manifest.json'),'utf8'));
  if(JSON.stringify(m)!==JSON.stringify(deployed))throw Error('Deployment baseline manifest changed; reconcile before publishing');
  for(const f of Object.keys(m.files)){
    const a=fs.readFileSync(safeFile(artifact,f)),b=fs.readFileSync(safeFile(checkout,f));
    if(!a.equals(b)&&normalize(a.toString('utf8'))!==normalize(b.toString('utf8')))throw Error('Deployment baseline changed: '+f);
  }
}
async function confirmLive(url,expected,timeout){
  const until=Date.now()+timeout;let last='not checked';
  do {try{const response=await fetch(url+'?deploymentCheck='+Date.now(),{signal:AbortSignal.timeout(20000),redirect:'error'});
    const text=await response.text();if(response.status===200&&matchesExpected(text,expected))return;
    last='HTTP '+response.status+' or content mismatch';
  }catch(e){last=e.name;}
  await new Promise(r=>setTimeout(r,5000));}while(Date.now()<until);
  throw Error('Production verification timed out: '+last);
}
async function deploy(page,campaignId){
  if(!/^[a-z0-9-]+$/.test(page.pageId)||!/^sha256:[a-f0-9]{64}$/.test(page.artifactHash||''))throw Error('Exact published page receipt required');
  const config=JSON.parse(fs.readFileSync(path.join(root,'config/translation-deployment.json'),'utf8'));
  const directory=path.join(root,'.tmp','translation-deployments');fs.mkdirSync(directory,{recursive:true});
  const lock=path.join(directory,'deployment.lock');fs.closeSync(fs.openSync(lock,'wx'));
  try {
    const key=crypto.createHash('sha256').update(page.pageId+page.artifactHash).digest('hex');
    const receiptFile=path.join(directory,key+'.json');
    let receipt=fs.existsSync(receiptFile)?JSON.parse(fs.readFileSync(receiptFile,'utf8')):null;
    const save=()=>fs.writeFileSync(receiptFile,JSON.stringify(receipt,null,2));
    const url=new URL('en/concepts/'+page.pageId+'/',config.siteUrl).href;
    if(receipt?.state==='live'){await confirmLive(url,await receiptExpectation(receipt),config.verificationTimeoutMs);return {url,commit:receipt.commit,reused:true,alreadyLive:true};}
    await git(root,'fetch','origin',config.branch);
    if(await git(root,'remote','get-url','origin')!==config.remote)throw Error('Unexpected deployment remote');
    const head=await git(root,'rev-parse','origin/'+config.branch);
    // Resume an interrupted push/verification without creating a duplicate commit.
    if(receipt?.commit&&head===receipt.commit){
      await confirmLive(url,await receiptExpectation(receipt),config.verificationTimeoutMs);
      receipt.state='live';save();fs.writeFileSync(path.join(directory,'baseline.json'),JSON.stringify({output:receipt.output,commit:head}));return {url,commit:head,reused:true};
    }
    const id=Date.now()+'-'+crypto.randomUUID().slice(0,8),checkout=path.join(directory,'checkout-'+id);
    await git(root,'worktree','add','-b','codex/translation-deploy-'+id,checkout,'origin/'+config.branch);
    if(fs.readFileSync(safeFile(checkout,'CNAME'),'utf8').trim()!==new URL(config.siteUrl).hostname)throw Error('Production domain mismatch');
    const baselineFile=path.join(directory,'baseline.json');
    const base=fs.existsSync(baselineFile)?JSON.parse(fs.readFileSync(baselineFile,'utf8')).output:path.resolve(root,config.baselineArtifact);
    sameBaseline(base,checkout);
    const build=JSON.parse(await require('./retry-website-build').buildWithRetry(
      ()=>run(process.execPath,[path.join(root,'tools/build-website.js'),'production',config.siteUrl,page.pageId,page.artifactHash])));
    if(build.state!=='built')throw Error('Production artifact unavailable');
    const pagePath='en/concepts/'+page.pageId+'/index.html';
    const generated=fs.readFileSync(safeFile(build.output,pagePath),'utf8');
    if(fs.existsSync(safeFile(base,pagePath))&&normalize(generated)===normalize(fs.readFileSync(safeFile(base,pagePath),'utf8'))){
      await confirmLive(url,generated,config.verificationTimeoutMs);
      receipt={campaignId,pageId:page.pageId,artifactHash:page.artifactHash,state:'live',commit:head,rollback:head,output:base,url};save();return {url,commit:head,reused:true,alreadyLive:true};
    }
    const output=path.join(directory,'release-'+id);
    const merged=JSON.parse(await run(process.execPath,[path.join(root,'tools/prepare-scoped-english-release.js'),base,build.output,output,page.pageId]));
    verify(output,true);
    for(const f of [...merged.changed,'release-manifest.json']){const target=safeFile(checkout,f);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(safeFile(output,f),target);}
    await git(checkout,'add','--',...merged.changed,'release-manifest.json');
    await git(checkout,'commit','-m','Publish verified English page: '+page.pageId);
    const commit=await git(checkout,'rev-parse','HEAD');
    receipt={campaignId,pageId:page.pageId,artifactHash:page.artifactHash,state:'prepared',commit,rollback:head,output,checkout,url};save();
    await git(checkout,'push','origin','HEAD:'+config.branch);receipt.state='pushed';save();
    fs.writeFileSync(path.join(directory,'baseline.json'),JSON.stringify({output,commit}));
    await confirmLive(url,fs.readFileSync(safeFile(output,'en/concepts/'+page.pageId+'/index.html'),'utf8'),config.verificationTimeoutMs);
    receipt.state='live';save();return {url,commit,rollback:head};
  }finally{fs.unlinkSync(lock);}
}
module.exports={deploy,sameBaseline,confirmLive,receiptHtml,receiptExpectation,matchesExpected};
