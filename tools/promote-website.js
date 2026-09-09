"use strict";
// Promote an already verified production artifact to the exact directory consumed by CI.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {verify}=require('./verify-website');
const root=path.resolve(__dirname,'..'),source=path.resolve(process.argv[2]||''),target=path.join(root,'site-release');
function insideWorkspace(value){const relative=path.relative(root,value);return relative&&!relative.startsWith('..')&&!path.isAbsolute(relative);}
if(!insideWorkspace(source)||source===target)throw Error('Source must be a generated artifact inside this workspace');
const sourceResult=verify(source,true);
const staging=path.join(root,`.site-release-${crypto.randomUUID()}.tmp`);
if(fs.existsSync(staging))throw Error('Unexpected staging collision');
fs.cpSync(source,staging,{recursive:true,errorOnExist:true,force:false});
verify(staging,true);
let backup=null;
if(fs.existsSync(target)){
  const backupRoot=path.join(root,'.tmp','site-release-backups');fs.mkdirSync(backupRoot,{recursive:true});
  backup=path.join(backupRoot,new Date().toISOString().replace(/[:.]/g,'-'));
  fs.renameSync(target,backup);
}
try{fs.renameSync(staging,target);}catch(error){if(backup&&!fs.existsSync(target))fs.renameSync(backup,target);throw error;}
const finalResult=verify(target,true);
console.log(JSON.stringify({state:'promoted',source,target,backup,verification:finalResult},null,2));
