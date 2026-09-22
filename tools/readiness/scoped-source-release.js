'use strict';
function authorizeSourceChange(id,prior,current,english,authorizations={}) {
 if(!prior||!current)throw Error('Missing Chinese source: '+id);
 if(prior.sourceHash===current.sourceHash)return false;
 const permit=authorizations[id],hash=/^sha256:[a-f0-9]{64}$/;
 if(!permit||!hash.test(permit.before)||!hash.test(permit.after)||permit.before!==prior.sourceHash||permit.after!==current.sourceHash||english?.sourceHash!==current.sourceHash||english.englishVerified!==true)throw Error('Chinese source changed: '+id);
 return true;
}
module.exports={authorizeSourceChange};
