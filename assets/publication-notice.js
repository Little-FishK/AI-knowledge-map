(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AI_PUBLICATION_NOTICE = api;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  function render(status, locale = 'zh-Hans') {
    if (!['pending-review', 'needs-revision'].includes(status)) return '';
    const english = locale === 'en', revision = status === 'needs-revision';
    const title = english ? 'Continuously revised' : '持续修订中';
    const message = english
      ? (revision ? 'Some content needs revision. Please consult the references while reading.' : 'This page is open for reading while its content continues to be reviewed and improved.')
      : (revision ? '本页部分内容有待修订，建议结合参考资料阅读。' : '本页已开放阅读，内容仍在复核与完善。');
    return `<aside class="dd-publication-notice" data-review-status="${status}" role="note"><strong>${title}</strong><span>${message}</span></aside>`;
  }
  return { render };
});
