'use strict';
const assert = require('node:assert/strict');
const {conceptSearchTitle, chineseTitle, englishTitle} = require('../../tools/readiness/concept-search-title');

assert.equal(
  chineseTitle({title:'RAG 检索增强生成'}),
  'RAG 是什么？检索增强生成原理通俗讲解 | AI 知识地图'
);
assert.equal(
  chineseTitle({title:'AI Agent 智能体'}),
  'AI Agent 是什么？智能体原理通俗讲解 | AI 知识地图'
);
assert.equal(
  chineseTitle({title:'监督学习'}),
  '监督学习是什么？原理通俗讲解 | AI 知识地图'
);
assert.equal(
  englishTitle({title:'Retrieval-Augmented Generation (RAG)'}),
  'What Is RAG? Retrieval-Augmented Generation Explained Simply'
);
assert.equal(
  englishTitle({title:'Transformer'}),
  'What Is Transformer? Explained Simply'
);
assert.equal(
  conceptSearchTitle({id:'rag',locale:'en',page:{title:'Retrieval-Augmented Generation (RAG)'}}),
  'What Is RAG? Retrieval-Augmented Generation Explained Simply'
);
assert.equal(
  conceptSearchTitle({id:'llm',locale:'zh',page:{title:'很长的原理页标题'}}, '大语言模型 LLM'),
  '大模型是什么？大语言模型（LLM）原理通俗讲解 | AI 知识地图'
);
assert.equal(
  conceptSearchTitle({id:'other',locale:'zh',page:{title:'很长的原理页标题'}}, '梯度下降'),
  '梯度下降是什么？原理通俗讲解 | AI 知识地图'
);
assert.throws(()=>conceptSearchTitle({locale:'fr',page:{title:'RAG'}}),/locale/);
console.log('PASS concept search titles keep query intent separate from article headings');
