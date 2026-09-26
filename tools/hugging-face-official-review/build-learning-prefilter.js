/* Build and prefilter Hugging Face official AI learning-material candidates. */
"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const reviewedAt = "2026-09-24";
const outputPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "hugging-face-learning-prefilter-20260924.json");

const sets = [
  ["transformers", "Transformers", "https://huggingface.co/docs/transformers/llms.txt"],
  ["tokenizers", "Tokenizers", "https://huggingface.co/docs/tokenizers/llms.txt"],
  ["datasets", "Datasets", "https://huggingface.co/docs/datasets/llms.txt"],
  ["evaluate", "Evaluate", "https://huggingface.co/docs/evaluate/main/llms.txt"],
  ["peft", "PEFT", "https://huggingface.co/docs/peft/llms.txt"],
  ["trl", "TRL", "https://huggingface.co/docs/trl/llms.txt"],
  ["diffusers", "Diffusers", "https://huggingface.co/docs/diffusers/llms.txt"],
  ["accelerate", "Accelerate", "https://huggingface.co/docs/accelerate/llms.txt"],
  ["optimum", "Optimum", "https://huggingface.co/docs/optimum/llms.txt"],
  ["bitsandbytes", "bitsandbytes", "https://huggingface.co/docs/bitsandbytes/llms.txt"],
  ["lighteval", "Lighteval", "https://huggingface.co/docs/lighteval/llms.txt"],
  ["safetensors", "Safetensors", "https://huggingface.co/docs/safetensors/llms.txt"],
  ["smolagents", "smolagents", "https://huggingface.co/docs/smolagents/llms.txt"],
  ["openenv", "OpenEnv", "https://huggingface.co/docs/openenv/llms.txt"],
  ["kernels", "Kernels", "https://huggingface.co/docs/kernels/llms.txt"],
  ["text-generation-inference", "Text Generation Inference", "https://huggingface.co/docs/text-generation-inference/llms.txt"],
  ["text-embeddings-inference", "Text Embeddings Inference", "https://huggingface.co/docs/text-embeddings-inference/llms.txt"]
];

function canonicalize(rawUrl, baseUrl) {
  const url = new URL(rawUrl, baseUrl);
  url.hash = "";
  url.search = "";
  url.pathname = url.pathname.replace(/\.md$/, "").replace(/\/$/, "") || "/";
  return url.href.replace(/\/$/, "");
}

function parseLlms(markdown, family, familyTitle, indexUrl) {
  let section = "";
  const records = [];
  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^#{2,3}\s+(.+)$/);
    if (heading) section = heading[1].trim();
    const match = line.match(/^\s*- \[([^\]]+)\]\(([^)]+)\)(?:(?::| -)\s*(.*))?$/);
    if (!match) continue;
    const url = canonicalize(match[2], indexUrl);
    records.push({ family, familyTitle, indexUrl, section, title:match[1].trim(), url, description:(match[3] || "").trim() });
  }
  return records;
}

async function fetchText(url) {
  const response = await fetch(url, { headers:{ "user-agent":"ai-knowledge-map-hugging-face-review/1.0" } });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}

function classify(record) {
  const pathName = new URL(record.url).pathname.toLowerCase();
  const title = record.title.toLowerCase();
  const value = `${title} ${pathName}`;
  const topicValue = `${title} ${pathName
    .replace(/\/docs\/(?:transformers|tokenizers|datasets|evaluate|peft|trl|diffusers|accelerate|optimum|bitsandbytes|lighteval|safetensors|smolagents|openenv|kernels|text-generation-inference|text-embeddings-inference)/g, "")
    .replace(/\/(?:main|en)\//g, "/")}`;

  if (/\/llms(?:-full)?\.txt$/.test(pathName)) return ["prefilter-rejected-container", "llms 目录或整集合导出不是独立资料。"];
  if (/(?:^|\/)(?:index|overview-index|search)(?:\.html)?$/.test(pathName)) return ["prefilter-rejected-navigation", "总目录或搜索页只承担导航作用。"];
  if (/(?:^|\/)(?:api|api-reference|package_reference|reference|main_classes|internal|autodoc|modules?|classes?|functions?)(?:\/|$)/.test(pathName)) return ["prefilter-rejected-api-reference", "API、类、函数或自动生成成员参考颗粒度过细。"];
  if (/(?:^|\/)(?:installation|install|quicktour|quick-tour|quickstart|quick-start|getting_started|get-started|basic_tutorials|guided_tour|tutorials?|examples?|notebooks?|recipes?|cookbook)(?:\/|$)/.test(pathName)) return ["prefilter-rejected-tutorial-or-setup", "安装、快速开始、教程、样例或配方以工具操作为主。"];
  if (/(?:^|\/)(?:release_notes?|changelog|migration|upgrade|troubleshooting|faq|contributing|contribute)(?:\/|$)/.test(pathName)) return ["prefilter-rejected-maintenance", "版本、迁移、维护或贡献说明不形成通用学习资料。"];
  if (/\/(?:model_doc|models?|pipelines?)\//.test(pathName) && !/(?:auto|architecture|design|pipeline-overview|pipeline_tutorial|pipeline-data-flow)/.test(topicValue)) return ["prefilter-rejected-model-specific", "逐型号模型、架构实现或单一管线页面不作为通用学习资料。"];
  if (/(?:llama|qwen|gemma|mistral|mixtral|falcon|phi[-_]?\d|deepseek|gpt[-_]?\d|bert|roberta|t5|clip|whisper|stable[-_]?diffusion|flux|wan|cogvideo|hunyuan|kolors|pixart|sdxl)/.test(value)) return ["prefilter-rejected-model-specific", "页面围绕单一模型家族，通用机制由主题资料承担。"];
  if (/(?:aws|azure|google[-_]?cloud|sagemaker|vertex|tpu|trainium|inferentia|habana|gaudi|xla|mps|deepspeed|fsdp|megatron|colab|kaggle)/.test(value)) return ["prefilter-rejected-provider-or-backend", "云厂商、硬件或单一训练后端适配页缺少跨平台价值。"];
  if (/(?:^|\/)(?:integrations?|providers?|backends?|adapters?|commands?|cli|deployment|deploy)(?:\/|$)|(?:[_-]integrations?)(?:\/|$)/.test(pathName)) return ["prefilter-rejected-implementation-detail", "提供商适配、命令行或部署操作属于工具实现细节。"];
  if (/(?:benchmark-results?|leaderboard|supported-models?|support-matrix|environment_variables|configuration|config)(?:\/|$)/.test(pathName)) return ["prefilter-rejected-compatibility-or-metadata", "榜单、支持清单、环境或配置资料不是独立学习单元。"];

  if (record.family === "transformers" && /\/(?:tasks|serving|generation_strategies)\//.test(pathName) && !/(?:fine[-_]?tun|train|generation|decoding|token|attention|quantiz|cache|multimodal|image|audio|speech|video|object-detection|question-answering|classification)/.test(topicValue)) return ["prefilter-rejected-implementation-detail", "任务操作页未形成独立的模型工程知识。"];
  if (record.family === "diffusers" && /\/(?:using-diffusers|training)\//.test(pathName) && !/(?:architecture|memory|optimization|quantiz|fine[-_]?tun|training|scheduler|diffusion|guidance|lora|peft|video|image)/.test(topicValue)) return ["prefilter-rejected-implementation-detail", "Diffusers 使用步骤未形成可迁移的扩散模型知识。"];
  if (["text-generation-inference", "text-embeddings-inference"].includes(record.family) && !/(?:architecture|serving|batch|cache|quantiz|parallel|shard|performance|latency|throughput|inference|embedding|rerank|token)/.test(topicValue)) return ["prefilter-rejected-serving-operation", "推理服务页面主要是安装、配置或运维操作。"];
  if (record.family === "openenv" && !/(?:architecture|environment|reinforcement|reward|rollout|evaluation|sandbox|agent|training)/.test(topicValue)) return ["prefilter-rejected-narrow-product-page", "OpenEnv 页面缺少通用 Agent/RL 环境学习增量。"];
  if (record.family === "openenv" && /\/environments\//.test(pathName) && !/(?:agent_world_model|concept|architecture)/.test(pathName)) return ["prefilter-rejected-narrow-product-page", "单一 OpenEnv 环境实现不作为通用 Agent/RL 学习资料。"];
  if (record.family === "kernels" && !/(?:kernel|optimization|performance|memory|attention|quantiz|matrix|fusion)/.test(topicValue)) return ["prefilter-rejected-narrow-product-page", "Kernels 页面没有形成通用算子优化知识。"];
  if (record.family === "kernels" && /\/builder\/(?:agents-guide|builder-cli|github-actions|metal)(?:\/|$)/.test(pathName)) return ["prefilter-rejected-implementation-detail", "Kernel Builder 的代理、CLI、CI 或单一后端操作不具备通用学习价值。"];
  if (record.family === "lighteval" && /use-.+-as-backend/.test(pathName)) return ["prefilter-rejected-provider-or-backend", "特定评测后端接入不形成通用评测知识。"];
  if (record.family === "safetensors" && /\/convert-weights$/.test(pathName)) return ["prefilter-rejected-implementation-detail", "权重格式转换步骤不是独立的安全序列化知识。"];
  if (record.family === "tokenizers" && /\/training_from_memory$/.test(pathName)) return ["prefilter-rejected-tutorial-or-setup", "内存训练操作示例不形成独立分词知识。"];

  const learningTopic = /(?:architecture|concept|design|fundamental|tokeniz|pre[-_]?train|fine[-_]?tun|post[-_]?train|training|supervised|preference|dpo|grpo|ppo|reinforcement|reward|evaluation|metric|dataset|data[-_]?process|streaming|sharding|sampling|format|parquet|arrow|peft|lora|qlora|adapter|prompt[-_]?tun|quantiz|4[-_]?bit|8[-_]?bit|optimizer|precision|memory|cache|attention|generation|decoding|beam[-_]?search|speculative|inference|serving|batch|parallel|distributed|accelerat|optimization|compiler|export|diffusion|scheduler|guidance|multimodal|image|video|audio|speech|embedding|retrieval|rerank|agent|tool[-_]?call|sandbox|safety|serialization|secure|tensor|kernel|performance|latency|throughput)/.test(topicValue);
  if (!learningTopic) return ["prefilter-rejected-no-general-learning-topic", "没有识别出可迁移到其他模型、框架或平台的 AI 学习主题。"];

  return ["pending-importance-review", "通过通用学习价值预筛，等待逐份重要性、时效性和替代关系审核。"];
}

async function main() {
  const chunks = await Promise.all(sets.map(async ([family, familyTitle, indexUrl]) =>
    parseLlms(await fetchText(indexUrl), family, familyTitle, indexUrl)));
  const raw = chunks.flat();
  const byUrl = new Map();
  for (const record of raw) if (!byUrl.has(record.url)) byUrl.set(record.url, record);
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
      included:"Hugging Face 官方文档目录中具有跨模型学习价值的模型、分词、数据、评测、微调、后训练、扩散、分布式训练、优化、量化、安全序列化、Agent/RL 环境与推理服务工具链。",
      excluded:"Hub/Endpoints/Providers 等平台操作，云厂商集成，AutoTrain、Gradio、机器人与前端产品，第三方外部项目，以及模型卡、论文和源码仓库等由其他一级来源审核的材料。",
      rule:"只排除明显不具备通用学习资格的页面；预筛通过项仍须逐份审核，不能直接建卡。"
    },
    sets:sets.map(([id, title, indexUrl], index) => ({ id, title, indexUrl, indexedEntries:chunks[index].length })),
    records,
    summary:{
      rawIndexEntries:raw.length,
      canonicalDuplicates:raw.length - records.length,
      uniqueLearningScopeCandidates:records.length,
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
