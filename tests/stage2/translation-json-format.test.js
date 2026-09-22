'use strict';
const assert=require('node:assert/strict');
const {decode,removeTrailingCommas}=require('../../tools/deepdive-stage2/lib/translation-review-correction');
assert.deepEqual(decode('{"completed":true,"findings":[],"summary":"Done",\n}'),{completed:true,findings:[],summary:'Done'});
assert.deepEqual(decode('{"a":[1,2,],"b":{"x":3,},}'),{a:[1,2],b:{x:3}});
const value={quote:'literal ,} and ,] and escaped "quote" \\',nested:['comma,']};const text=JSON.stringify(value);assert.equal(removeTrailingCommas(text),text);assert.deepEqual(decode(text),value);
for(const bad of ['{"a":','{"a":"unterminated}','{"a":1 "b":2}','{"a":undefined}','{"a":1,,}'])assert.throws(()=>decode(bad));
console.log('PASS trailing separators normalize without changing strings; truncated or ambiguous JSON remains rejected');
