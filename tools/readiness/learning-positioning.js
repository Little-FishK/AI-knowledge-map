'use strict';
// Public landing-page copy; future resources are explicitly described as planned.
const copy = {
  en: {
    title: 'Learn AI from Scratch: Free Guide for Beginners',
    description: 'Learn AI from scratch for free. Explore a comprehensive map of AI concepts with clear explanations for beginners. No prior AI or coding knowledge needed.',
    introduction: 'AI Knowledge Map is a free learning resource for complete beginners. Build a broad understanding of artificial intelligence through a connected map of concepts, from machine learning and neural networks to large language models and AI agents. Clear, concept-first explanations help you understand what each idea means, how it works, and how it connects to the bigger picture. No prior AI or programming knowledge is needed to get started.',
    roadmap: 'Coming next: a curated library of professional AI resources and practical AI agent tutorials to help you turn understanding into hands-on skills.'
  },
  zh: {
    title: '零基础免费学 AI：概念与入门学习指南',
    description: '面向零基础初学者的免费 AI 学习指南。通过知识地图和清晰的概念解释，系统认识机器学习、神经网络、大语言模型与智能体，无需 AI 或编程基础即可开始。',
    introduction: 'AI 知识地图是面向零基础初学者的免费学习资源。通过相互连接的概念地图，从机器学习、神经网络到大语言模型与 AI 智能体，建立对人工智能的全面认识。以概念为起点的清晰解释，帮助你理解每个知识点是什么、如何运作，以及它与其他概念的关系。无需 AI 或编程基础即可开始。',
    roadmap: '后续计划：加入精选专业 AI 资料库和实用的智能体教程，帮助你从理解概念走向动手实践。'
  }
};
// Search engines show this as the homepage title link. It is used verbatim
// (no site-name suffix): brand first, then what the site offers, in English.
const homeTitle = 'AI Knowledge Map - Learn AI from Scratch, Free for Beginners';
const homeDescription = copy.en.description + ' 零基础免费学 AI，通过概念地图系统入门人工智能。';
function homeIntro(base='/') {
  return `<details id="learning-intro" style="flex:0 0 auto;padding:6px 16px;background:var(--bg-panel,#1b1e24);border-bottom:1px solid var(--line,#343944);max-height:40vh;overflow:auto"><summary style="cursor:pointer"><span lang="zh-Hans">零基础免费学 AI</span> · <span lang="en">Learn AI from scratch, for free</span></summary><div style="max-width:960px;margin:12px auto;line-height:1.7"><section lang="en"><h2>AI Knowledge Map: a free starting point for beginners</h2><p>${copy.en.introduction}</p><p>${copy.en.roadmap}</p><a href="${base}en/">Start learning AI in English →</a></section><section lang="zh-Hans"><h2>从零开始，理解 AI 的全貌</h2><p>${copy.zh.introduction}</p><p>${copy.zh.roadmap}</p><a href="${base}zh/">开始中文学习 →</a></section></div></details>`;
}
module.exports = {copy,homeTitle,homeDescription,homeIntro};
