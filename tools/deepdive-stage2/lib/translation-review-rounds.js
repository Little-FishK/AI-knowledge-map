'use strict';
const crypto=require('node:crypto');
const hash=x=>'sha256:'+crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function scope(record,units) {
  const base=record.verificationBase;
  if(!base)return {phase:'full-review',unitKeys:units.map(u=>u.key)};
  const changed=units.filter(u=>base.unitHashes[u.key]!==hash(u));
  const keys=new Set([...changed.map(u=>u.key),...base.findingKeys]);
  const chapters=new Set([...keys].map(k=>k.split('/')[0]));
  const sources=new Set(units.filter(u=>keys.has(u.key)).map(u=>u.source));
  // Whole affected chapters retain formula/fragment/reference context; repeated
  // source occurrences and page header are checked across chapter boundaries.
  for(const u of units)if(chapters.has(u.key.split('/')[0])||sources.has(u.source)||/^(outside|page-header)\//.test(u.key))keys.add(u.key);
  return {phase:'verification',unitKeys:units.filter(u=>keys.has(u.key)).map(u=>u.key),baseAuditHash:base.auditHash};
}
function plan(revision,units,record){const s=scope(record,units);return [{...s,index:0,batchId:hash({version:'translation-rounds-v1',revision,...s})}];}
function base(record,units){return {revision:record.revision,auditHash:hash(record.audit),unitHashes:Object.fromEntries(units.map(u=>[u.key,hash(u)])),findingKeys:record.audit.findings.map(f=>f.unitKey)};}
module.exports={plan,base,hash};
