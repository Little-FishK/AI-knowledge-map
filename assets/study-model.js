(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AI_STUDY_MODEL=api;})(typeof window==='object'?window:globalThis,function(){
 'use strict';
 const safeKey=k=>typeof k==='string'&&k.length<=240&&/^(?:concept:[a-z0-9]+(?:-[a-z0-9]+)*|page:\/(?:[a-z0-9-]+\/)*|[a-z0-9]+(?:-[a-z0-9]+)*)$/.test(k)&&!['__proto__','constructor','prototype'].includes(k);
 const validPath=p=>typeof p==='string'&&p.length<=600&&/^\/(?:[a-zA-Z0-9_-]+\/)*(?:\?[a-zA-Z0-9_=&%.-]*)?(?:#[a-zA-Z0-9_-]+)?$/.test(p);
 const empty=owner=>({version:1,owner,notes:{},bookmarks:{},routes:{},views:{},history:[],searches:[],positions:{},quiz:{}});
 function validate(value,owner){
  if(!value||value.version!==1||value.owner!==owner)throw Error('Backup owner does not match this local profile');
  const out=empty(owner);
  for(const [key,note]of Object.entries(value.notes||{})){if(!safeKey(key)||typeof note!=='string'||note.length>20000)throw Error('Invalid note');out.notes[key]=note;}
  for(const [key,flag]of Object.entries(value.bookmarks||{})){if(!safeKey(key)||typeof flag!=='boolean')throw Error('Invalid bookmark');out.bookmarks[key]=flag;}
  for(const [id,route]of Object.entries(value.routes||{})){if(!safeKey(id)||typeof route.name!=='string'||route.name.length>100||!Array.isArray(route.items)||route.items.length>130||route.items.some(i=>!safeKey(i)))throw Error('Invalid route');out.routes[id]={name:route.name,items:[...new Set(route.items)]};}
  for(const [id,view]of Object.entries(value.views||{})){if(!safeKey(id)||typeof view.name!=='string'||view.name.length>100||(!view.value||typeof view.value!=='object'||Array.isArray(view.value))||JSON.stringify(view.value).length>10000)throw Error('Invalid saved view');out.views[id]={name:view.name,value:view.value};}
  for(const item of (value.history||[]).slice(0,50)){if(!safeKey(item.key)||typeof item.title!=='string'||item.title.length>300||!validPath(item.path)||!Number.isFinite(item.at))throw Error('Invalid history');out.history.push({key:item.key,title:item.title,path:item.path,at:item.at});}
  out.searches=(value.searches||[]).filter(q=>typeof q==='string'&&q.trim()&&q.length<=100).slice(0,10);
  for(const [key,p]of Object.entries(value.positions||{})){if(!safeKey(key)||typeof p.anchor!=='string'||p.anchor.length>100||!Number.isFinite(p.ratio)||p.ratio<0||p.ratio>1)throw Error('Invalid reading position');out.positions[key]={anchor:p.anchor,ratio:p.ratio};}
  for(const [key,result]of Object.entries(value.quiz||{})){if(!safeKey(key)||typeof result!=='boolean')throw Error('Invalid quiz result');out.quiz[key]=result;}
  if(Object.keys(out.notes).length>1000||Object.keys(out.routes).length>50||Object.keys(out.views).length>50)throw Error('Backup exceeds local limits');return out;
 }
 function restore(current,backup){const incoming=validate(backup,current.owner),out=validate(current,current.owner);for(const field of ['notes','bookmarks','routes','views','positions','quiz'])for(const [key,value]of Object.entries(incoming[field]))if(!Object.hasOwn(out[field],key))out[field][key]=value;out.history=[...out.history,...incoming.history.filter(i=>!out.history.some(j=>j.key===i.key))].slice(0,50);out.searches=[...new Set([...out.searches,...incoming.searches])].slice(0,10);return out;}
 const csvCell=value=>{let v=String(value??'');if(/^[=+@\-\t\r]/.test(v))v="'"+v;return '"'+v.replaceAll('"','""')+'"';};
 function mergeChanges(current,base,disk){const out=validate(disk,current.owner);validate(current,current.owner);validate(base,current.owner);for(const field of ['notes','bookmarks','routes','views','positions','quiz'])for(const key of new Set([...Object.keys(base[field]),...Object.keys(current[field])])){if(JSON.stringify(current[field][key])===JSON.stringify(base[field][key]))continue;if(Object.hasOwn(current[field],key))out[field][key]=current[field][key];else delete out[field][key];}for(const field of ['history','searches'])if(JSON.stringify(current[field])!==JSON.stringify(base[field])){if(!current[field].length)out[field]=[];else out[field]=field==='history'?[...current.history,...out.history].sort((a,b)=>b.at-a.at).filter((item,index,all)=>all.findIndex(other=>other.key===item.key)===index).slice(0,50):[...new Set([...current.searches,...out.searches])].slice(0,10);}return validate(out,current.owner);}
 return Object.freeze({empty,validate,restore,mergeChanges,safeKey,validPath,csvCell});
});
