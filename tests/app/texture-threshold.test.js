'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../../assets/vendor/cytoscape.min.js'), 'utf8');
// Exercise the actual vendor expressions for element, layer and text caches.
for (const [zoomName, ratioName] of [['s','n'], ['i','t'], ['n','r']]) {
  const product = zoomName + '*' + ratioName;
  const expression = `Math.max(${product}>=.8?1:-4,Math.ceil(wt(${product})))`;
  assert.equal(source.split(expression).length - 1, 1);
  for (const [zoom, expected] of [[.5,-1],[.79,0],[.7999,0],[.8,1],[.81,1],[1,1],[1.01,1],[2,1],[2.01,2]]) {
    assert.equal(vm.runInNewContext(expression, {[zoomName]:zoom,[ratioName]:1,wt:Math.log2}) + 0, expected, `${product}: ${zoom}`);
  }
}
console.log('PASS texture detail threshold: 80% inclusive across elements, layers and labels');
