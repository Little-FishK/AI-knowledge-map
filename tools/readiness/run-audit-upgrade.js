"use strict";
// Call the full MCP controller; never read candidates, audits or state here.
const path=require('node:path');
const {spawn}=require('node:child_process');
const [mode,pageId,expectedCandidateHash]=process.argv.slice(2);
if(!['inspect','queue'].includes(mode)||!/^[a-z0-9-]+$/.test(pageId||''))throw Error('Expected inspect|queue pageId [hash]');
const root=path.resolve(__dirname,'../..');
const server=spawn(process.execPath,[path.join(root,'tools/deepdive-stage2/mcp-server.js')],{
  cwd:root,env:{...process.env,DEEPDIVE_STAGE2_ROOT:root,STAGE2_MCP_PROFILE:'full',STAGE2_MCP_MANUAL_REVIEW_ACTION:'hold'},
  stdio:['pipe','pipe','pipe'],windowsHide:true
});
let buffer='',done=false;
const timer=setTimeout(()=>finish(1),60000);
function finish(code){if(done)return;done=true;clearTimeout(timer);server.kill();process.exitCode=code;}
function send(id,method,params){server.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');}
server.on('error',()=>finish(1));
server.on('exit',()=>{if(!done)finish(1);});
server.stderr.on('data',()=>{});
server.stdout.setEncoding('utf8');
server.stdout.on('data',chunk=>{
  buffer+=chunk;
  let end;
  while((end=buffer.indexOf('\n'))>=0){
    const line=buffer.slice(0,end);buffer=buffer.slice(end+1);
    if(!line.trim())continue;
    const message=JSON.parse(line);
    if(message.id===1){
      if(message.error){console.log(JSON.stringify(message.error));finish(1);return;}
      send(2,'tools/call',{name:mode==='inspect'?'stage2_inspect_audit_upgrade':'stage2_queue_audit_upgrade',arguments:mode==='inspect'?{pageId}:{pageId,expectedCandidateHash,reason:'用户授权统一审核机制，按v4独立补审；保留旧发布、记录和返修预算'}});
    }
    if(message.id===2){console.log(JSON.stringify(message.result||message.error,null,2));finish(message.error||message.result?.isError?1:0);}
  }
});
send(1,'initialize',{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'audit-contract-upgrade',version:'1.0'}});
