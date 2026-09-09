"use strict";
// Production callers use the controller. This CLI also supports isolated fixtures.
const fs=require('fs'),path=require('path');
const {loadDeepDivePages,loadDeepDivePagesFromGit,resolveGitBaseRef}=require('../runtime/deepdive-loader');
const {spawnSync}=require('child_process');
const {pageContentHash}=require('./deepdive-audit-contracts');
const {resolveProjectRoot}=require('../../shared/project-root');
const {evaluateAudit}=require('./audit-evaluation');
const root=resolveProjectRoot('DEEPDIVE_ROOT');
const single=process.argv.includes('--page'),changed=process.argv.includes('--changed'),all=process.argv.includes('--all');
const id=single?process.argv[process.argv.indexOf('--page')+1]:null;
if(!(single||changed||all)||(single&&!/^[a-z0-9-]+$/.test(id||'')))throw Error('Expected --page <id>, --changed or --all');
const pages=loadDeepDivePages(root);
if(single&&!pages[id])throw Error('Page missing');
// Compare committed PR/push changes against the configured base, not current HEAD.
// CI without a base checks every page. A missing configured base fails explicitly.
const compareBase=changed&&!(process.env.CI&&!process.env.DEEPDIVE_BASE_REF&&!process.env.GITHUB_BASE_REF);
let previous=null;
if(compareBase) {
  const base=resolveGitBaseRef(root);
  const verified=spawnSync('git',['-c',`safe.directory=${root.replace(/\\/g,'/')}`,'rev-parse','--verify',`${base}^{commit}`],{cwd:root,encoding:'utf8'});
  if(verified.status!==0)throw Error(`Cannot resolve audit comparison base: ${base}`);
  previous=loadDeepDivePagesFromGit(root,base);
}
const results=[];
for(const [pageId,page] of Object.entries(pages)) {
  if(single&&pageId!==id)continue;
  const file=path.join(root,'docs','deepdive-audits',pageId+'.json');
  const audit=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):null;
  if(compareBase&&audit?.schemaVersion!==4&&previous[pageId]&&pageContentHash(previous[pageId])===pageContentHash(page))continue;
  results.push(evaluateAudit(pageId,page,audit));
}
console.log(JSON.stringify(single?results[0]:{policyVersion:4,checked:results.length,passed:results.filter(r=>r.passed).length,results}));
process.exitCode=results.every(r=>r.passed)?0:1;
