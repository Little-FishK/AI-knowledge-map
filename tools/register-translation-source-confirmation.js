'use strict';
// Trusted launcher for an exact, user-confirmed current source version.
const {spawnSync}=require('node:child_process'),path=require('node:path');
const [pageId,expectedSourceHash,expectedContentHash,...words]=process.argv.slice(2);
const statement=words.join(' ').trim();
if(!/^[a-z0-9][a-z0-9-]*$/.test(pageId||'')||!/^sha256:[a-f0-9]{64}$/.test(expectedSourceHash||'')
  ||!/^sha256:[a-f0-9]{64}$/.test(expectedContentHash||'')||!statement)throw Error('Exact page, source/content hashes and confirmation statement required');
const root=path.resolve(__dirname,'..');
const child=spawnSync(process.execPath,[path.join(__dirname,'deepdive-stage2/mcp-server.js')],{
  cwd:root,windowsHide:true,encoding:'utf8',timeout:30000,
  env:{...process.env,DEEPDIVE_STAGE2_ROOT:root,STAGE2_MCP_PROFILE:'human-confirmation',STAGE2_MCP_PAGE_ID:pageId,
    STAGE2_HUMAN_CONFIRMATION_HASH:expectedContentHash,STAGE2_MCP_MANUAL_REVIEW_ACTION:'hold'},
  input:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'stage2_register_source_human_confirmation',arguments:{
    pageId,expectedSourceHash,expectedContentHash,humanConfirmed:true,statement}}})+'\n'
});
if(child.status!==0)throw Error('Source confirmation controller failed');
const response=JSON.parse(child.stdout.trim());
if(response.error||response.result?.isError)throw Error('Source confirmation rejected');
const result=JSON.parse(response.result.content.find(c=>c.type==='text').text);
console.log(JSON.stringify({pageId,result},null,2));
