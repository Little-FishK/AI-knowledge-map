"use strict";

const fs = require("fs");
const path = require("path");
const { loadDeepDivePages } = require("../runtime/deepdive-loader");
const { PROJECT_ROOT } = require("../../shared/project-root");

const ROOT = PROJECT_ROOT;
const NODE_GROUPS = {
  2: [
    ["2", "neural-network"],
    ["2.1", "backprop"],
    ["2.2", "vanishing-gradient"],
    ["2.3", "batch-norm"],
    ["2.4", "optimizer-schedule"],
    ["2.5", "residual-connection"],
    ["2.6", "cnn"],
    ["2.7", "rnn"],
    ["2.8", "tokenization"],
    ["2.9", "embedding"],
    ["2.10", "positional-encoding"],
    ["2.11", "attention"],
    ["2.12", "normalization"],
    ["2.13", "transformer"],
    ["2.14", "state-space-models"],
    ["2.15", "self-supervised-learning"],
    ["2.16", "contrastive-learning"],
    ["2.17", "clip"],
  ],
  3: [
    ["3", "llm"],
    ["3.1", "pretraining"],
    ["3.2", "post-training"],
    ["3.3", "fine-tuning"],
    ["3.4", "peft-lora"],
    ["3.5", "distillation"],
    ["3.6", "distributed-training"],
    ["3.7", "synthetic-data"],
    ["3.8", "quantization"],
    ["3.9", "moe"],
    ["3.10", "model-merging"],
    ["3.11", "scaling-law"],
    ["3.12", "model-families"],
    ["3.13", "multimodal"],
  ],
  4: [
    ["4", "context-window"],
    ["4.1", "lost-in-middle"],
    ["4.2", "in-context-learning"],
    ["4.3", "sampling-params"],
    ["4.4", "logprobs"],
    ["4.5", "prompt-engineering"],
    ["4.6", "system-prompt"],
    ["4.7", "context-engineering"],
    ["4.8", "constrained-decoding"],
    ["4.9", "structured-output"],
    ["4.10", "streaming"],
    ["4.11", "prefilling"],
    ["4.12", "prompt-caching"],
    ["4.13", "context-compaction"],
    ["4.14", "inference-optimization"],
    ["4.15", "model-selection"],
    ["4.16", "model-routing"],
  ],
  5: [
    ["5", "rag"],
    ["5.1", "retrieval"],
    ["5.2", "vector-db"],
    ["5.3", "chunking"],
    ["5.4", "reranking"],
    ["5.5", "advanced-rag"],
    ["5.6", "knowledge-graph"],
    ["5.7", "citations"],
    ["5.8", "evaluation"],
    ["5.9", "model-evaluation"],
    ["5.10", "observability"],
    ["5.11", "deployment"],
    ["5.12", "data-drift-monitoring"],
    ["5.13", "hallucination"],
    ["5.14", "uncertainty-calibration"],
    ["5.15", "privacy"],
    ["5.16", "prompt-injection"],
    ["5.17", "guardrails"],
  ],
  6: [
    ["6", "reasoning-models"],
    ["6.1", "cot"],
    ["6.2", "self-consistency"],
    ["6.3", "tree-of-thoughts"],
    ["6.4", "test-time-compute"],
    ["6.5", "reflection"],
    ["6.6", "planning"],
  ],
  7: [
    ["7", "agent"],
    ["7.1", "agent-loop"],
    ["7.2", "react"],
    ["7.3", "tool-calling"],
    ["7.4", "code-execution"],
    ["7.5", "mcp-architecture"],
    ["7.6", "mcp"],
    ["7.7", "agent-frameworks"],
    ["7.8", "agent-memory"],
    ["7.9", "agent-skills"],
    ["7.10", "workflow-orchestration"],
    ["7.11", "multi-agent"],
    ["7.12", "human-in-the-loop"],
    ["7.13", "computer-use"],
    ["7.14", "code-generation"],
    ["7.15", "coding-tools"],
    ["7.16", "agent-identity-access"],
  ],
  8: [
    ["8", "diffusion"],
    ["8.1", "vae"],
    ["8.2", "gan"],
    ["8.3", "flow-matching"],
    ["8.4", "image-generation"],
    ["8.5", "controllable-generation"],
    ["8.6", "image-editing"],
    ["8.7", "super-resolution"],
    ["8.8", "video-generation"],
    ["8.9", "speech"],
    ["8.10", "voice-cloning"],
    ["8.11", "audio-generation"],
    ["8.12", "world-models"],
    ["8.13", "content-detection"],
  ],
  9: [
    ["9", "alignment"],
    ["9.1", "interpretability"],
    ["9.2", "jailbreak"],
    ["9.3", "red-teaming"],
    ["9.4", "data-poisoning"],
    ["9.5", "adversarial-robustness"],
    ["9.6", "bias-fairness"],
    ["9.7", "reward-hacking"],
    ["9.8", "rlhf"],
    ["9.9", "constitutional-ai"],
    ["9.10", "training-data-governance"],
    ["9.11", "governance"],
  ],
};
const GROUP = String(process.argv[2] || "2");
const NODES = NODE_GROUPS[GROUP];
if (!NODES) throw new Error(`不支持的节点组：${GROUP}`);
const OUTPUT = path.join(ROOT, "docs", "deepdive-reviews", `${GROUP}x-section-text-review.md`);

function decodeEntities(value) {
  const named = {
    amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
    ndash: "–", mdash: "—", hellip: "…", times: "×", minus: "−",
  };
  return String(value || "")
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&([a-z]+);/gi, (match, name) => named[name.toLowerCase()] ?? match);
}

function visibleText(html) {
  let source = String(html || "");
  source = source
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg\b([^>]*)[\s\S]*?<\/svg>/gi, (_, attrs) => {
      const label = String(attrs).match(/\baria-label=["']([^"']+)["']/i);
      return label ? ` 图示：${label[1]}。` : " ";
    })
    .replace(/<math\b([^>]*)[\s\S]*?<\/math>/gi, (_, attrs) => {
      const label = String(attrs).match(/\baria-label=["']([^"']+)["']/i);
      return label ? ` 公式：${label[1]}。` : " 公式。";
    })
    .replace(/<br\s*\/?>/gi, "，")
    .replace(/<\/(?:p|li|blockquote|figcaption|tr|table|figure|div|pre)>/gi, "。")
    .replace(/<\/(?:td|th)>/gi, "；")
    .replace(/<[^>]+>/g, " ");
  return decodeEntities(source)
    .replace(/\s+/g, " ")
    .replace(/；\s*。/g, "。")
    .replace(/。{2,}/g, "。")
    .replace(/，\s*。/g, "。")
    .trim();
}

function headingText(html, fallback) {
  const cleaned = String(html || "")
    .replace(/<span\b[^>]*class=["'][^"']*\bdd-n\b[^"']*["'][^>]*>[\s\S]*?<\/span>/gi, " ")
    .replace(/<span\b[^>]*class=["'][^"']*\bdd-badge\b[^"']*["'][^>]*>[\s\S]*?<\/span>/gi, " ");
  return visibleText(cleaned).replace(/[。；]+$/g, "").trim() || fallback;
}

function sections(html) {
  return [...String(html || "").matchAll(
    /<section\b[^>]*class=["'][^"']*\bdd-sec\b[^"']*["'][^>]*>([\s\S]*?)<\/section>/gi,
  )].map((match, index) => {
    const body = match[1];
    const heading = body.match(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i);
    const text = visibleText(body.replace(/<h[1-6]\b[^>]*>[\s\S]*?<\/h[1-6]>/i, " "));
    return {
      number: index + 1,
      heading: headingText(heading && heading[1], `第 ${index + 1} 章`),
      text,
    };
  });
}

const pages = loadDeepDivePages(ROOT);
const output = [
  `# ${GROUP}.x 节点理解原理页：分章节纯文本审阅稿`,
  "",
  "> 状态：待人工检查。本文档由当前正式理解原理页机械抽取而来，没有重写正文，也不会修改正式页面。每个三级标题对应原页面的一个章节；该标题下只有一个合并后的正文段落。表格、列表、公式说明与图注已转成行内文字，视觉结构会有所损失。",
  "",
  `> 范围：学习路径编号 ${NODES[0][0]} 至 ${NODES[NODES.length - 1][0]}，共 ${NODES.length} 页。生成日期：2026-08-12。`,
  "",
];

let sectionCount = 0;
for (const [order, id] of NODES) {
  const page = pages[id];
  if (!page) throw new Error(`缺少理解原理页：${order} ${id}`);
  const pageSections = sections(page.html);
  if (!pageSections.length) throw new Error(`页面没有可抽取章节：${order} ${id}`);
  sectionCount += pageSections.length;
  output.push(`## ${order} ${page.title}（${id}）`, "");
  for (const section of pageSections) {
    output.push(`### ${order}.${section.number} ${section.heading}`, "", section.text, "");
  }
}

output.splice(5, 0, `> 章节总数：${sectionCount}。`, "");
fs.writeFileSync(OUTPUT, `${output.join("\n").trim()}\n`, "utf8");
console.log(JSON.stringify({ output: path.relative(ROOT, OUTPUT), pages: NODES.length, sections: sectionCount }));
