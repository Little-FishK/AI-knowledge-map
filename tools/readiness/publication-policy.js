'use strict';
// Website access policy only. This does not grant or change content approval.
const POLICIES = new Set(['approved-only', 'open-reading']);
function policy(value = 'approved-only') {
  if (!POLICIES.has(value)) throw Error('Invalid understanding page publication policy');
  return value;
}
function canPublish(entry, value = 'approved-only') {
  policy(value);
  return entry.eligible === true || (value === 'open-reading' && (entry.locale === 'zh' || (entry.locale === 'en' && entry.englishVerified === true))
    && entry.publicAccess === true && ['pending-review', 'needs-revision'].includes(entry.reviewStatus));
}
module.exports = { policy, canPublish };
