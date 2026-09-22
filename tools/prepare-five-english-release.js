'use strict';
// Merge only verified public artifacts. Never reads Stage 2 source/state.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {verify}=require('./verify-website');
const {digest,safeFile}=require('./readiness/site-artifact');
const seo=require('./readiness/site-seo');
const [baseArg,generatedArg,outputArg]=process.argv.slice(2);
const root=path.resolve(__dirname,'..'),base=path.resolve(baseArg),generated=path.resolve(generatedArg),output=path.resolve(outputArg);
for(const dir of [base,generated,output])if(!dir.startsWith(root+path.sep))throw Error('Workspace artifacts required');
if(fs.existsSync(output))throw Error('Output must be new');
const ids=['constitutional-ai','clustering','regularization','voice-cloning','curse-of-dimensionality'];
verify(generated,true);
const original=JSON.parse(fs.readFileSync(safeFile(base,'release-manifest.json'),'utf8'));
const built=JSON.parse(fs.readFileSync(safeFile(generated,'release-manifest.json'),'utf8'));
fs.mkdirSync(output,{recursive:true});
for(const [name,record]of Object.entries(original.files)) {
  let bytes=fs.readFileSync(safeFile(base,name));
  // Reconstruct exact published LF bytes only when they match the signed-off manifest.
  if(digest(bytes)!==record.sha256&&(name==='CNAME'||/\.(js|json|html|css|xml|txt|svg)$/.test(name))) {
    const lf=Buffer.from(bytes.toString('utf8').replace(/\r\n/g,'\n'));
    if(digest(lf)===record.sha256)bytes=lf;
  }
  if(digest(bytes)!==record.sha256)throw Error('Baseline differs from manifest: '+name);
  const dest=safeFile(output,name);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,bytes);
}
const manifest=structuredClone(original);
const write=(name,bytes)=>{const dest=safeFile(output,name);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,bytes);manifest.files[name]={sha256:digest(Buffer.from(bytes)),bytes:Buffer.byteLength(bytes)};};
const copy=name=>write(name,fs.readFileSync(safeFile(generated,name)));
for(const id of ids) {
  const prior=original.pages.find(p=>p.id===id&&p.locale==='zh'),current=built.pages.find(p=>p.id===id&&p.locale==='zh');
  if(!prior||prior.sourceHash!==current?.sourceHash)throw Error('Chinese source changed: '+id);
  const en=built.pages.find(p=>p.id===id&&p.locale==='en');if(!en)throw Error('Missing approved English page: '+id);
  for(const lang of ['zh','en']) {
    const file=lang+'/concepts/'+id+'/index.html';copy(file);
    manifest.pages=manifest.pages.filter(p=>p.path!==file).concat(built.pages.find(p=>p.path===file));
    manifest.seoPages=manifest.seoPages.filter(p=>p.file!==file).concat(built.seoPages.find(p=>p.file===file));
  }
  copy('data/content-locales/en/deepdive/'+id+'.json');
}
copy('assets/app/runtime-loader.js');
const context={window:{}};vm.runInNewContext(fs.readFileSync(safeFile(output,'assets/concept-pages.js'),'utf8'),context,{timeout:1000});
for(const id of ids)context.window.AI_STATIC_CONCEPTS[id].en='en/concepts/'+id+'/';
write('assets/concept-pages.js','window.AI_STATIC_CONCEPTS='+JSON.stringify(context.window.AI_STATIC_CONCEPTS)+';\n');
const search=JSON.parse(fs.readFileSync(safeFile(base,'assets/site-search-index.json'),'utf8'));
const additions=JSON.parse(fs.readFileSync(safeFile(generated,'assets/site-search-index.json'),'utf8')).filter(p=>p.locale==='en'&&ids.includes(p.id));
if(additions.length!==5)throw Error('Unexpected search scope');
const combined=search.filter(p=>!(p.locale==='en'&&ids.includes(p.id))).concat(additions);
write('assets/site-search-index.json',JSON.stringify(combined));
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let html=fs.readFileSync(safeFile(output,'search/index.html'),'utf8');
const pos=html.lastIndexOf('</ul>');if(pos<0)throw Error('Missing search directory');
const cards=additions.map(r=>`<li class="directory-item" data-search="${escape([r.title,r.summary].join(' '))}"><a href="${escape(r.href)}">${escape(r.title)}</a><small>English reading</small><p>${escape(r.summary)}</p></li>`).join('');
html=html.slice(0,pos)+cards+html.slice(pos);
html=html.replace(/(<p id="search-status"[^>]*>)\d+/,(_m,p)=>p+combined.length);
write('search/index.html',html);manifest.seoPages.find(p=>p.file==='search/index.html').contentHash=seo.fingerprint(html);
write('sitemap.xml',seo.sitemap(manifest.seoPages,false));
manifest.createdAt=new Date().toISOString();
fs.writeFileSync(path.join(output,'release-manifest.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify({output,ids,changed:Object.keys(manifest.files).filter(f=>manifest.files[f].sha256!==original.files[f]?.sha256),verification:verify(output,true)},null,2));
