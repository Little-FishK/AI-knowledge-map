'use strict';
// These frozen inline declarations affect layout only and cannot fetch resources.
// Unknown properties, functions, escapes and CSS comments remain held for review.
function isLocalLayoutStyle(dependency) {
  if (dependency?.status !== 'requires-resource-review' || dependency.attribute !== 'style'
    || !['div', 'svg', 'p'].includes(dependency.tag) || typeof dependency.value !== 'string') return false;
  const length = '(?:0|\\d+(?:\\.\\d+)?(?:px|em|rem|%))';
  const rules = {
    display: /^(?:flex|block)$/,
    'flex-wrap': /^(?:wrap|nowrap)$/,
    'align-items': /^(?:flex-start|flex-end|center|stretch)$/,
    gap: new RegExp('^' + length + '$'),
    flex: new RegExp('^\\d+(?:\\.\\d+)? +\\d+(?:\\.\\d+)? +' + length + '$'),
    'min-width': new RegExp('^' + length + '$'),
    'max-width': new RegExp('^' + length + '$'),
    height: new RegExp('^(?:auto|' + length + ')$'),
    'font-size': new RegExp('^' + length + '$'),
  };
  const declarations = dependency.value.split(';').map(x => x.trim()).filter(Boolean);
  return declarations.length > 0 && declarations.every(declaration => {
    const parts = declaration.split(':');
    return parts.length === 2 && Object.hasOwn(rules, parts[0].trim()) && rules[parts[0].trim()].test(parts[1].trim());
  });
}
module.exports = { isLocalLayoutStyle };
