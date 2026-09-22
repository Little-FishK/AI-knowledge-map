'use strict';
// Per-page deployment is independent of slow model calls on other pages.
function createQueue(deploy,emit=()=>{},pageIds=null) {
  if(pageIds!==null&&(!Array.isArray(pageIds)||!pageIds.length||pageIds.some(id=>typeof id!=='string'||!id)))throw Error('Invalid deployment page scope');
  const scope=pageIds&&new Set(pageIds);
  let tail=Promise.resolve();const seen=new Set();let failed=false;
  return {
    observe(status){for(const page of status.pages||[]){
      if(scope&&!scope.has(page.pageId))continue;
      if(page.state!=='published'||!page.artifactHash)continue;
      const key=page.pageId+':'+page.artifactHash;if(seen.has(key))continue;seen.add(key);
      tail=tail.then(async()=>{try{const result=await deploy(page,status.campaignId);if(!result.alreadyLive)emit({event:'page-live',pageId:page.pageId,...result});}
        catch(e){failed=true;emit({event:'deployment-blocked',pageId:page.pageId,error:e.message});}});
    }},
    async drain(){await tail;return {failed};}
  };
}
module.exports={createQueue};
