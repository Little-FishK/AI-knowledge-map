/* Build and prefilter NVIDIA official AI learning-material candidates. */
"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const reviewedAt = "2026-09-24";
const outputPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "nvidia-learning-prefilter-20260924.json");

const llmsSets = [
  ["aiperf", "NVIDIA AIPerf", "https://docs.nvidia.com/aiperf/llms.txt"],
  ["aitune", "NVIDIA AITune", "https://docs.nvidia.com/aitune/llms.txt"],
  ["cosmos", "NVIDIA Cosmos", "https://docs.nvidia.com/cosmos/llms.txt"],
  ["cuvs", "NVIDIA cuVS", "https://docs.nvidia.com/cuvs/llms.txt"],
  ["dynamo", "NVIDIA Dynamo", "https://docs.nvidia.com/dynamo/llms.txt"],
  ["nemo-agent-toolkit", "NVIDIA NeMo Agent Toolkit", "https://docs.nvidia.com/nemo/agent-toolkit/llms.txt"],
  ["nemo-automodel", "NVIDIA NeMo AutoModel", "https://docs.nvidia.com/nemo/automodel/llms.txt"],
  ["nemo-curator", "NVIDIA NeMo Curator", "https://docs.nvidia.com/nemo/curator/llms.txt"],
  ["nemo-data-designer", "NVIDIA NeMo Data Designer", "https://docs.nvidia.com/nemo/datadesigner/llms.txt"],
  ["nemo-framework", "NVIDIA NeMo Framework", "https://docs.nvidia.com/nemo-framework/llms.txt"],
  ["nemo-guardrails", "NVIDIA NeMo Guardrails", "https://docs.nvidia.com/nemo/guardrails/llms.txt"],
  ["nemo-gym", "NVIDIA NeMo Gym", "https://docs.nvidia.com/nemo/gym/llms.txt"],
  ["nemo-rl", "NVIDIA NeMo RL", "https://docs.nvidia.com/nemo/rl/llms.txt"],
  ["nim", "NVIDIA NIM", "https://docs.nvidia.com/nim/llms.txt"],
  ["openshell", "NVIDIA OpenShell", "https://docs.nvidia.com/openshell/llms.txt"],
  ["riva", "NVIDIA Riva", "https://docs.nvidia.com/deeplearning/riva/llms.txt"],
  ["skills", "NVIDIA Skill Documentation", "https://docs.nvidia.com/skills/llms.txt"],
  ["skill-evaluator", "NVIDIA SkillEvaluator", "https://docs.nvidia.com/skills/skillevaluator/llms.txt"]
];

const sitemapSets = [
  ["nemo-evaluator", "NVIDIA NeMo Evaluator", "https://docs.nvidia.com/nemo/evaluator/sitemap.xml"],
  ["nemo-retriever", "NVIDIA NeMo Retriever", "https://docs.nvidia.com/nemo/retriever/sitemap.xml"],
  ["triton", "NVIDIA Triton Inference Server", "https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/sitemap.xml"]
];

const textCache = new Map();

async function fetchText(url) {
  if (!textCache.has(url)) textCache.set(url, (async () => {
    const response = await fetch(url, { headers:{ "user-agent":"ai-knowledge-map-nvidia-review/1.0" } });
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
    return response.text();
  })());
  return textCache.get(url);
}

function normalizeUrl(raw, base) {
  let value = raw.trim();
  if (/^docs\.nvidia\.com\//i.test(value)) value = `https://${value}`;
  const url = new URL(value, base);
  url.hash = "";
  url.search = "";
  url.pathname = url.pathname.replace(/\.md$/, "").replace(/\/$/, "") || "/";
  return url.href.replace(/\/$/, "");
}

function titleFromUrl(url) {
  const slug = new URL(url).pathname.split("/").filter(Boolean).at(-1)?.replace(/\.html$/, "") || "NVIDIA";
  return slug.replace(/[-_]+/g, " ").replace(/\b\w/g, letter => letter.toUpperCase());
}

function markdownLinks(markdown) {
  return [...markdown.matchAll(/^\s*- \[([^\]]+)\]\(([^)]+)\)/gm)].map(match => ({ title:match[1].trim(), rawUrl:match[2].trim() }));
}

async function crawlLlms(family, familyTitle, indexUrl, state) {
  const canonicalIndex = normalizeUrl(indexUrl, indexUrl);
  if (state.indexes.has(canonicalIndex)) return;
  state.indexes.add(canonicalIndex);
  const markdown = await fetchText(indexUrl);
  const nested = [];
  for (const link of markdownLinks(markdown)) {
    let url;
    try { url = normalizeUrl(link.rawUrl, indexUrl); } catch { continue; }
    if (/\/llms-full\.txt$/i.test(url)) {
      state.containers.add(url);
      continue;
    }
    if (/\/llms\.txt$/i.test(url)) {
      if (url !== canonicalIndex) nested.push(crawlLlms(family, familyTitle, url, state));
      continue;
    }
    if (!state.records.has(url)) state.records.set(url, { family, familyTitle, indexUrl, title:link.title, url });
  }
  await Promise.all(nested);
}

function parseSitemap(family, familyTitle, indexUrl, xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => {
    const url = normalizeUrl(match[1].replace(/&amp;/g, "&"), indexUrl);
    return { family, familyTitle, indexUrl, title:titleFromUrl(url), url };
  });
}

async function cudaRecords() {
  const indexUrl = "https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html";
  const html = await fetchText(indexUrl);
  const urls = new Set([indexUrl]);
  for (const match of html.matchAll(/href=["']([^"']+\.html(?:#[^"']*)?)["']/g)) {
    const url = normalizeUrl(match[1], indexUrl);
    if (url.startsWith("https://docs.nvidia.com/cuda/cuda-c-programming-guide/")) urls.add(url);
  }
  return [...urls].map(url => ({ family:"cuda-programming", familyTitle:"CUDA C++ Programming Guide", indexUrl, title:titleFromUrl(url), url }));
}

async function tensorRtLlmRecords() {
  const indexUrl = "https://nvidia.github.io/TensorRT-LLM/searchindex.js";
  const js = await fetchText(indexUrl);
  const match = js.match(/^Search\.setIndex\(([\s\S]+)\)\s*;?\s*$/);
  if (!match) throw new Error("Unable to parse TensorRT-LLM search index");
  const search = JSON.parse(match[1]);
  return [...new Set(search.docnames)].map((docname, index) => {
    const url = `https://nvidia.github.io/TensorRT-LLM/${docname}.html`;
    return { family:"tensorrt-llm", familyTitle:"TensorRT-LLM", indexUrl, title:search.titles?.[index] || titleFromUrl(url), url };
  });
}

function classify(record) {
  const pathName = new URL(record.url).pathname.toLowerCase();
  const value = `${record.title.toLowerCase()} ${pathName}`;
  const topicValue = `${record.title.toLowerCase()} ${pathName
    .replace(/\/nemo\/(?:guardrails|automodel|curator|gym|rl|datadesigner|evaluator|retriever|agent-toolkit)/g, "")
    .replace(/\/nemo-framework/g, "")
    .replace(/\/deeplearning\/triton-inference-server\/user-guide\/docs/g, "")
    .replace(/\/tensorrt-llm/g, "")
    .replace(/\/cuda\/cuda-c-programming-guide/g, "")}`;

  if (/\/(?:index|contents|genindex|py-modindex|search|part[1-5])\.html$/.test(pathName)) return ["prefilter-rejected-navigation", "目录、分卷导航或搜索索引不是独立学习资料。"];
  if (/(?:^|\/)(?:_?api|apis|api-reference|reference|_reference|python-api|_cpp_gen|modules?|classes?|functions?|cli|commands?)(?:\/|\.html$|$)/.test(pathName)) return ["prefilter-rejected-api-reference", "自动生成的 API、类、函数、CLI 或命令参考颗粒度过细。"];
  if (/(?:guardrails-python-sdk|python-sdk|developer-reference|sdk-reference|generated|apidocs?|docstrings?)(?:\/|$)/.test(pathName)) return ["prefilter-rejected-api-reference", "SDK、自动生成参考或代码成员文档不是独立学习资料。"];
  if (/\/(?:nemo_curator|nemo_automodel|nemo_gym|nemoguardrails)(?:\/|$)/.test(pathName)) return ["prefilter-rejected-api-reference", "Python 包模块与成员页属于自动生成代码参考。"];
  if (/(?:^|\/)(?:install(?:ation)?|quick[-_]?starts?|getting[-_]?started|get[-_]?started|tutorials?|examples?|samples?|recipes?|cookbook)(?:\/|$)/.test(pathName)) return ["prefilter-rejected-tutorial-or-setup", "安装、快速开始、教程、样例或配方以产品操作为主。"];
  if (/(?:^|\/)(?:release[-_]?notes?|changelog|known[-_]?issues?|troubleshooting|faq|migration|upgrade)(?:\/|\.html$|$)/.test(pathName)) return ["prefilter-rejected-maintenance", "版本、迁移、故障排除或维护信息不形成通用知识资料。"];
  if (/(?:support[-_]?matrix|model[-_]?support|compatibility|profiles?|environment[-_]?variables|requirements|license|notices)(?:\.html|\/|$)/.test(pathName)) return ["prefilter-rejected-compatibility-or-metadata", "兼容表、环境、许可证或型号支持信息不适合作为学习卡。"];
  if (/\/(?:19|20)\d{2}(?:[._-]\d{1,2})?(?:\/|$)|\/v(?:-|_)?\d+(?:[._-]\d+){1,3}(?:\/|$)/.test(pathName) && !/\/latest\//.test(pathName)) return ["prefilter-rejected-versioned-route", "历史或固定版本路径不与当前主资料重复进入审核。"];
  if (/(?:kubernetes|helm|docker|container|cloud|aws|azure|gcp|slurm|dgx|cluster[-_]?admin|operator|deployment[-_]?guide|configuration|configure|config[-_]?file|endpoint|rest[-_]?client)/.test(value)) return ["prefilter-rejected-product-operation", "页面主要教授部署环境、平台配置、容器或集群操作。"];
  if (/(?:h100|h200|a100|a10|b100|b200|blackwell|hopper|ampere|ada|turing|grace|jetson|gb200|gb300)/.test(value)) return ["prefilter-rejected-hardware-specific", "页面与特定 GPU 型号或架构绑定，缺少跨平台学习价值。"];
  if (/(?:llama\d*|deepseek|qwen|gemma|mistral|mixtral|falcon|phi[-_]?\d|gpt[-_]?oss|nemotron|stable[-_]?diffusion|whisper|parakeet|canary|magpie|starcoder)/.test(value)) return ["prefilter-rejected-model-specific", "页面围绕单一模型或配方，通用机制由更完整的主题资料承担。"];
  if (record.family === "nemo-framework" && /\/user-guide\/24\.07\//.test(pathName)) return ["prefilter-rejected-versioned-route", "NeMo 24.07 历史版不与当前 latest 文档重复进入审核。"];
  if (record.family === "cosmos" && /\/reason1\//.test(pathName)) return ["prefilter-rejected-model-specific", "单一 Cosmos 模型训练页不构成跨模型通用学习资料。"];
  if (/(?:^|\/)(?:dev|contribute|client|client_guide|backend|backend_guide|integrations?|integration-with-third-party-libraries|plugins?|adapters?|model-coverage|model-repository|workflows?|scripts?|tests?|legacy)(?:\/|$)/.test(pathName)) return ["prefilter-rejected-implementation-detail", "开发者内部、客户端、后端适配、插件、旧版或贡献文档不构成通用学习单元。"];
  if (/(?:^|\/)(?:datasets?)(?:\/|$)/.test(pathName) && !/(?:overview|concept|curat|quality|dedup|synthetic)/.test(topicValue)) return ["prefilter-rejected-implementation-detail", "数据集类与加载实现页面颗粒度过细。"];
  if (/\/(?:readme|drafts?|blog)\.html$/.test(pathName)) return ["prefilter-rejected-navigation", "README、草稿或博客目录不作为独立学习资料。"];
  if (record.family === "nim" && !/(?:architecture|inference|serving|performance|optimization|security|model[-_]?cache)/.test(value)) return ["prefilter-rejected-nim-operation", "NIM 页面主要是镜像、配置、部署或产品操作说明。"];
  if (record.family === "cosmos" && !/(?:architecture|world[-_]?model|multimodal|token|diffusion|reasoning|evaluation|safety|training)/.test(value)) return ["prefilter-rejected-narrow-product-page", "Cosmos 页面未形成可迁移的世界模型或多模态知识。"];
  if (record.family === "riva" && !/(?:speech|audio|asr|tts|language[-_]?model|streaming|latency|evaluation|architecture)/.test(value)) return ["prefilter-rejected-narrow-product-page", "Riva 页面主要是 SDK 或服务操作，没有通用语音 AI 学习增量。"];

  if (record.family === "triton" && !/\/(?:user_guide|blogs?)\//.test(pathName)) return ["prefilter-rejected-implementation-detail", "Triton 客户端、后端或扩展实现页不进入通用服务知识审核。"];
  if (record.family === "nemo-gym" && /\/(?:agent-server|build-environments|build-verifiers|how-to-guides)\//.test(pathName) && !/(?:architecture|concept|evaluation|reward|verification)/.test(topicValue)) return ["prefilter-rejected-implementation-detail", "NeMo Gym 的接入与构建步骤不形成通用强化学习知识。"];
  if (record.family === "nemo-curator" && /\/about\/concepts\/(?:audio|image|video)\//.test(pathName) && !/(?:quality|dedup|filter|classif|privacy|pii|caption|embedding|semantic|curat)/.test(topicValue)) return ["prefilter-rejected-implementation-detail", "多模态数据处理步骤缺少独立、可迁移的知识增量。"];
  if (record.family === "nemo-data-designer" && /\/concepts\/(?:models|processors|columns)\//.test(pathName) && !/(?:architecture|sampling|validation|quality|synthetic|inference)/.test(topicValue)) return ["prefilter-rejected-implementation-detail", "Data Designer 的模型、处理器或字段配置属于产品实现细节。"];

  const learningTopic = /(?:architecture|concept|design|fundamental|programming[-_]?model|execution[-_]?model|best[-_]?practice|performance|benchmark|evaluation|metric|quantization|precision|pruning|distillation|parallel|memory|cache|batch|scheduler|scheduling|inference|serving|training|fine[-_]?tun|post[-_]?train|reinforcement|reward|rollout|data[-_]?curat|synthetic[-_]?data|guardrail|safety|security|sandbox|retrieval|vector|embedding|rerank|agent|tool[-_]?call|agent[-_]?memory|observability|tracing|multimodal|speech|audio|prompt|context|distributed|scaling|checkpoint|attention|kernel|cuda[-_]?graph|stream|concurren|latency|throughput|world[-_]?model|diffusion|tokeniz|dedup|quality|filter|classif|verification)/.test(topicValue);
  if (!learningTopic) return ["prefilter-rejected-no-general-learning-topic", "没有识别出可迁移到其他模型、框架或平台的 AI 学习主题。"];

  return ["pending-importance-review", "通过通用学习价值预筛，等待逐份重要性、时效性和替代关系审核。"];
}

async function main() {
  const all = [];
  const llmsResults = await Promise.all(llmsSets.map(async ([family, familyTitle, indexUrl]) => {
    const state = { indexes:new Set(), containers:new Set(), records:new Map() };
    await crawlLlms(family, familyTitle, indexUrl, state);
    return { records:[...state.records.values()], containers:state.containers.size, indexes:state.indexes.size };
  }));
  for (const result of llmsResults) all.push(...result.records);
  for (const [family, familyTitle, indexUrl] of sitemapSets) all.push(...parseSitemap(family, familyTitle, indexUrl, await fetchText(indexUrl)));
  all.push(...await cudaRecords(), ...await tensorRtLlmRecords());

  const byUrl = new Map();
  for (const record of all) if (!byUrl.has(record.url)) byUrl.set(record.url, record);
  const records = [...byUrl.values()].sort((a, b) => a.family.localeCompare(b.family) || a.url.localeCompare(b.url));
  records.forEach((record, index) => {
    record.sequence = index + 1;
    [record.status, record.reason] = classify(record);
  });

  const summarize = key => Object.fromEntries([...records.reduce((map, record) => {
    const value = record[key];
    map.set(value, (map.get(value) || 0) + 1);
    return map;
  }, new Map()).entries()].sort());
  const pending = records.filter(record => record.status === "pending-importance-review").length;
  const payload = {
    policy:"official-technical-importance-v2",
    prefilterVersion:"1.0",
    reviewedAt,
    scope:{
      included:"面向通用 AI 学习的 NVIDIA 计算、训练、后训练、推理优化、服务、检索、数据、评测、安全、Agent、多模态与语音资料。",
      excluded:"论文和源码仓库由其他一级来源审核；BioNeMo、Parabricks、Holoscan、Jetson、车载、网络、Omniverse、集群与硬件运维等垂直或非通用产品线不进入母集。",
      rule:"产品线进入母集后，再排除 API 成员、安装配置、快速开始、样例、版本维护、型号兼容、特定硬件/模型和产品运维页面；通过项仍须逐份审核，不能直接建卡。"
    },
    records,
    summary:{
      rawLearningScopeCandidates:records.length,
      pendingImportanceReview:pending,
      prefilterRejected:records.length - pending,
      byFamily:summarize("family"),
      byStatus:summarize("status")
    }
  };
  fs.mkdirSync(path.dirname(outputPath), { recursive:true });
  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify(payload.summary, null, 2)}\n`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
