'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../../assets/vendor/cytoscape.min.js'), 'utf8');
// Exercise the actual vendor expressions for element, layer and text caches.
for (const [zoomName, ratioName] of [['s','n'], ['i','t'], ['n','r']]) {
  const product = zoomName + '*' + ratioName;
  const expression = `Math.ceil(wt(${product}))`;
  assert.equal(source.includes(`Math.max(${product}>=.8?1:-4,`), false);
  assert.equal(source.split(expression).length - 1, 1);
  for (const [zoom, expected] of [[.25,-1],[.49,0],[.5,0],[.51,1],[.79,1],[.8,1],[.81,1],[1,1],[1.01,2]]) {
    assert.equal(vm.runInNewContext(expression, {[zoomName]:zoom,[ratioName]:2,wt:Math.log2}) + 0, expected, `${product}: ${zoom}`);
  }
}
console.log('PASS native texture levels at pixelRatio 2; no custom 80% threshold');
