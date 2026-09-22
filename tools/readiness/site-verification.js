'use strict';
// Exact provider proof files, not indexable content pages or arbitrary HTML.
function validate(name, bytes) {
  if (!/^baidu_verify_codeva-[A-Za-z0-9]+\.html$/.test(name) ||
      !/^[a-f0-9]{32}(?:\r?\n)?$/.test(bytes.toString('utf8'))) {
    throw Error('Invalid site verification file: ' + name);
  }
}
module.exports = {validate};
