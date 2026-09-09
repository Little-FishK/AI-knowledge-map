"use strict";
// Controller-owned opaque backup. No source contents, private filenames, or audit answers leave this module.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function createReadinessCheckpoint({root,runtimeDirectory,acquireLock,loadState}) {
  root=path.resolve(root);const release=acquireLock(root);
  try {
    if(Object.values(loadState(root).pages).some(p=>p.lease))throw Error('Checkpoint requires no active content lease');
    const base=path.join(root,'.tmp','website-preview','phase1-3');
    // Refuse symlink/junction ancestors before creating or writing any destination.
    for(const part of ['.tmp','website-preview','phase1-3']) {
      const previous=part==='.tmp'?root:part==='website-preview'?path.join(root,'.tmp'):path.join(root,'.tmp','website-preview');
      const target=path.join(previous,part);
      if(fs.existsSync(target)&&fs.lstatSync(target).isSymbolicLink())throw Error('Unsafe checkpoint destination');
      fs.mkdirSync(target,{recursive:true});
    }
    const dest=fs.mkdtempSync(path.join(base,'checkpoint-')),files=[],excluded=[];
    function copy(source,relative) {
      const stat=fs.lstatSync(source);if(stat.isSymbolicLink())throw Error('Symlink in checkpoint source');
      const name=path.basename(source);
      if(name==='controller.lock'||/^(\.env(?:\..*)?|credentials?|secrets?)(?:\.|$)/i.test(name)){excluded.push(relative);return;}
      if(stat.isDirectory()){for(const n of fs.readdirSync(source).sort())copy(path.join(source,n),relative+'/'+n);return;}
      if(!stat.isFile())throw Error('Special checkpoint source file');
      const bytes=fs.readFileSync(source), target=path.join(dest,'saved',relative);
      fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes,{flag:'wx'});
      if(hash(fs.readFileSync(target))!==hash(bytes))throw Error('Checkpoint copy verification failed');
      files.push({path:relative,bytes:bytes.length,sha256:hash(bytes)});
    }
    const dirs=['assets','data','docs','tools','tests','config','.github','.stage2','zh','en'];
    const roots=['AGENTS.md','README.md','CREDITS.md','index.html','package.json','package-lock.json','.gitignore','.gitattributes','sitemap-concepts.xml','启动网站.cmd','stage2-cron.cmd'];
    for(const name of [...dirs,...roots])if(fs.existsSync(path.join(root,name)))copy(path.join(root,name),'project/'+name);
    const runtime=path.resolve(runtimeDirectory(root));
    if(runtime!==path.join(root,'.stage2')&&fs.existsSync(runtime))copy(runtime,'runtime');
    // Restore into a separate directory, never into the working project or live runtime.
    for(const f of files){const target=path.join(dest,'restore-check',f.path);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(dest,'saved',f.path),target);if(hash(fs.readFileSync(target))!==f.sha256)throw Error('Restore check failed');}
    const manifest={schemaVersion:1,createdAt:new Date().toISOString(),files,excluded,scope:'Project allowlist and controller runtime. Excludes credentials, Git database, caches, personal tool settings and other applications.'};
    const serialized=JSON.stringify(manifest,null,2);fs.writeFileSync(path.join(dest,'manifest.json'),serialized,{flag:'wx'});
    return {status:'checkpoint-verified',directory:dest,fileCount:files.length,bytes:files.reduce((s,f)=>s+f.bytes,0),manifestSha256:hash(serialized),restoredFilesVerified:files.length,excludedCount:excluded.length,scope:manifest.scope};
  } finally {release();}
}
module.exports={createReadinessCheckpoint};
