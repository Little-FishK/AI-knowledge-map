'use strict';
// Retry only a build snapshot invalidated during final validation, never a model call or push.
async function buildWithRetry(build) {
  try { return await build(); }
  catch(error) {
    if(!String(error.message).includes('ENGLISH_BUILD_CHANGED:'))throw error;
    return build();
  }
}
module.exports={buildWithRetry};
