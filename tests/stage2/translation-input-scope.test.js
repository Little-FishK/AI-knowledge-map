'use strict';
const assert=require('node:assert/strict');
const {relevantGlossary,outsideContext}=require('../../tools/deepdive-stage2/lib/translation-input-scope');
const {inventory}=require('../../tools/deepdive-stage2/lib/translation-preparation');
const terms={page:{zhHans:'当前页',note:'retain entire decision'},ai:{canonicalTerms:['AI']},
  other:{zhHans:'语音克隆'},reward:{canonicalTerms:['reward hacking'],avoid:['reward speculation'],note:'Do not confuse related concepts'},
  attention:{zhHans:'注意力'},cpp:{canonicalTerms:['C++']}};
assert.deepEqual(Object.keys(relevantGlossary(terms,'page','training; reward speculation; 注意力; C++')),['page','reward','attention','cpp']);
assert(relevantGlossary(terms,'page','ＡＩ').ai);
assert.equal(relevantGlossary(terms,'page','reward hacking').reward,terms.reward);
const html='<div title="外部"><p>前言</p><section><h2>甲</h2><section><h3>乙</h3><p>不复制正文</p></section></section><figure><svg><text>完整图</text></svg></figure><p>结尾</p></div>';
const manifest=inventory(html),context=outsideContext(html,manifest.chapters);
assert(!context.includes('不复制正文'));
assert(context.includes('<figure><svg><text>完整图</text></svg></figure>'));
assert(context.startsWith('<div title="外部"><p>前言</p>'));
assert(context.endsWith('<p>结尾</p></div>'));
for(const u of manifest.units.filter(u=>u.chapterId==='outside'))assert(context.includes(u.source));
assert.equal(outsideContext('<p>no chapters</p>',[]),'<p>no chapters</p>');
assert.throws(()=>outsideContext(html,[{start:0,end:20},{start:10,end:30}]),/Overlapping/);
console.log('PASS scoped glossary boundaries, aliases, complete rules, nested sections and outside resource preservation');
