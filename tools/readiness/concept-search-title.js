'use strict';

const clean = value => String(value || '').replace(/\s+/g, ' ').trim().replace(/[?？]+$/, '');

const priority = Object.freeze({
  zh: Object.freeze({
    llm: '大模型是什么？大语言模型（LLM）原理通俗讲解 | AI 知识地图',
    tokenization: 'Token 是什么？AI 分词原理通俗讲解 | AI 知识地图',
    rag: 'RAG 是什么？检索增强生成原理通俗讲解 | AI 知识地图',
    agent: 'AI Agent 是什么？智能体原理通俗讲解 | AI 知识地图',
    mcp: 'MCP 是什么？模型上下文协议原理通俗讲解 | AI 知识地图',
    transformer: 'Transformer 是什么？大模型核心架构通俗讲解 | AI 知识地图',
    hallucination: 'AI 幻觉是什么？大模型为什么会产生错误答案 | AI 知识地图',
  }),
  en: Object.freeze({
    llm: 'What Is an LLM? Large Language Models Explained Simply',
    tokenization: 'What Is a Token in AI? Tokens and Tokenization Explained Simply',
    rag: 'What Is RAG? Retrieval-Augmented Generation Explained Simply',
    agent: 'What Is an AI Agent? AI Agents Explained Simply',
    mcp: 'What Is MCP? Model Context Protocol Explained Simply',
    transformer: 'What Is a Transformer? Transformer Architecture Explained Simply',
    hallucination: 'What Is an AI Hallucination? Explained Simply',
  }),
});

function chineseTitle(page) {
  const title = clean(page?.title);
  if (!title) throw Error('Missing Chinese concept title');
  // Most bilingual Chinese titles follow “RAG 检索增强生成” or
  // “AI Agent 智能体”. Put the term beginners actually type first.
  const bilingual = title.match(/^([A-Za-z][A-Za-z0-9.+/-]*(?:\s+[A-Za-z][A-Za-z0-9.+/-]*)*)\s+([\u3400-\u9fff].+)$/u);
  if (bilingual) {
    const query = bilingual[1], explanation = bilingual[2];
    const guide = explanation.includes('原理') ? '通俗讲解' : '原理通俗讲解';
    return `${query} 是什么？${explanation}${guide} | AI 知识地图`;
  }
  return `${title}是什么？原理通俗讲解 | AI 知识地图`;
}

function englishTitle(page) {
  const title = clean(page?.title);
  if (!title) throw Error('Missing English concept title');
  // Prefer a familiar acronym as the query while retaining the expansion.
  const expanded = title.match(/^(.+?)\s*\(([A-Z][A-Z0-9.+/-]{1,15})\)$/);
  if (expanded) return `What Is ${expanded[2]}? ${expanded[1]} Explained Simply`;
  return `What Is ${title}? Explained Simply`;
}

function conceptSearchTitle(entry, preferredTitle) {
  if (!entry || !['zh', 'en'].includes(entry.locale)) throw Error('Unsupported concept title locale');
  if (priority[entry.locale][entry.id]) return priority[entry.locale][entry.id];
  const page = preferredTitle ? {...entry.page, title: preferredTitle} : entry.page;
  return entry.locale === 'en' ? englishTitle(page) : chineseTitle(page);
}

module.exports = {conceptSearchTitle, chineseTitle, englishTitle, priority};
