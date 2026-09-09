"use strict";
// Product metadata only. Understanding-page bodies/state/audit evidence stay behind MCP.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const {collect, DATA_FILES} = require('./inventory');
const root = path.resolve(__dirname,'../..');
function build() {
  const context = vm.createContext({window:{}});
  for(const file of DATA_FILES) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file,timeout:2000});
  const w=context.window, assets=[];
  function urlsIn(value) {
    if(typeof value==='string')return (value.match(/https?:\/\/[^"'\s<>\\]+/g)||[]).map(u=>u.replace(/[),;。，；）]+$/g,''));
    if(!value||typeof value!=='object')return [];
    return Object.values(value).flatMap(urlsIn);
  }
  const add=(type,id,item,source)=>assets.push({type,id,source,title:item.title||item.name||item.label||id,urls:[...new Set(urlsIn(item))],accuracy:'not-reverified',teachingEffectiveness:'not-tested',recordCompleteness:'not-reverified'});
  w.GRAPH.nodes.forEach(n=>add('graph-node',n.id,n,'data/graph.js'));
  w.GRAPH.recommendedLearningPath.forEach(p=>add('existing-learning-phase',String(p.phase),p,'data/graph.js'));
  w.SOFTWARE.items.forEach(n=>add('software',n.id,n,'data/software.js'));
  for(const [id,p] of Object.entries(w.TUTORIALS.items)) {
    add('tutorial',id,p,'data/tutorials*.js');
    (p.resources||[]).forEach((r,i)=>add('tutorial-resource',`${id}/${r.id||i+1}`,r,'data/tutorials*.js'));
  }
  w.PRO_LIBRARY.items.forEach(n=>add('library',n.id,n,'data/library*.js'));
  for(const [id,p] of Object.entries(w.LIBRARY_PLATFORM_PROFILES)) add('source-profile',id,p,'data/library-platform-profiles.js');
  const images=[];
  function walk(dir) { if(!fs.existsSync(dir))return; for(const e of fs.readdirSync(dir,{withFileTypes:true})) { const p=path.join(dir,e.name); if(e.isDirectory())walk(p); else if(/\.(png|jpe?g|gif|webp|svg|avif)$/i.test(e.name))images.push(path.relative(root,p).replace(/\\/g,'/')); } }
  walk(path.join(root,'assets'));
  return {checkedAt:new Date().toISOString(),scope:'Product records and assets folder images; embedded understanding-page figures must be inventoried by leased MCP auditors. No quality pass inferred from flags.',summary:collect(),assets,images,urls:[...new Set(assets.flatMap(a=>a.urls))]};
}
if(require.main===module) {const output=process.argv[2]; const result=build(); if(output)fs.writeFileSync(path.resolve(output),JSON.stringify(result,null,2)); else process.stdout.write(JSON.stringify(result,null,2));}
module.exports={build};
