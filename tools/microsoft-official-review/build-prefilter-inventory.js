/* Build and mechanically prefilter the Microsoft AI official-material corpus. */
"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const reviewedAt = "2026-09-24";
const outputPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "microsoft-prefilter-inventory-20260924.json");
const learnBase = "https://learn.microsoft.com/_sitemaps/";

const sitemapNames = [
  ...Array.from({ length:7 }, (_, index) => `azure_en-us_${index + 1}`),
  "agent-framework_en-us_1", "semantic-kernel_en-us_1", "ai_en-us_1",
  "copilot_en-us_1", "microsoft-copilot-studio_en-us_1",
  ...Array.from({ length:91 }, (_, index) => `dotnet_en-us_${index + 1}`),
  ...Array.from({ length:9 }, (_, index) => `windows_en-us_${index + 1}`)
];

const familyRules = [
  ["foundry", /\/en-us\/azure\/foundry(?:\/|$)/],
  ["foundry-classic", /\/en-us\/azure\/foundry-classic(?:\/|$)/],
  ["foundry-local", /\/en-us\/azure\/foundry-local(?:\/|$)/],
  ["foundry-tools", /\/en-us\/azure\/ai-services(?:\/|$)/],
  ["azure-machine-learning", /\/en-us\/azure\/machine-learning(?:\/|$)/],
  ["azure-ai-search", /\/en-us\/azure\/search(?:\/|$)/],
  ["agent-framework", /\/en-us\/agent-framework(?:\/|$)/],
  ["semantic-kernel", /\/en-us\/semantic-kernel(?:\/|$)/],
  ["dotnet-ai", /\/en-us\/dotnet\/ai(?:\/|$)/],
  ["windows-ai", /\/en-us\/windows\/ai(?:\/|$)/],
  ["ai-playbook", /\/en-us\/ai(?:\/|$)/],
  ["copilot", /\/en-us\/copilot(?:\/|$)/],
  ["copilot-studio", /\/en-us\/microsoft-copilot-studio(?:\/|$)/]
];

function decodeXml(value) {
  return value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
}

function canonicalize(rawUrl) {
  const url = new URL(decodeXml(rawUrl));
  url.hash = "";
  url.search = "";
  url.pathname = url.pathname.replace(/\/$/, "") || "/";
  return url.toString().replace(/\/$/, "");
}

function familyFor(url) {
  return familyRules.find(([, pattern]) => pattern.test(url))?.[0] || null;
}

function parseSitemap(xml) {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(match => {
    const block = match[1];
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    const lastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] || null;
    if (!loc) return null;
    const url = canonicalize(loc);
    const family = familyFor(url);
    return family ? { family, url, lastmod, source:"microsoft-learn-sitemap" } : null;
  }).filter(Boolean);
}

async function fetchText(url) {
  const response = await fetch(url, { headers:{ "user-agent":"ai-knowledge-map-microsoft-review/1.0" } });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}

async function repoDocs(repo, family, pathFilter) {
  const headers = { "user-agent":"ai-knowledge-map-microsoft-review/1.0", accept:"application/vnd.github+json" };
  const metaResponse = await fetch(`https://api.github.com/repos/${repo}`, { headers });
  if (!metaResponse.ok) throw new Error(`${repo} metadata: HTTP ${metaResponse.status}`);
  const meta = await metaResponse.json();
  const treeResponse = await fetch(`https://api.github.com/repos/${repo}/git/trees/${encodeURIComponent(meta.default_branch)}?recursive=1`, { headers });
  if (!treeResponse.ok) throw new Error(`${repo} tree: HTTP ${treeResponse.status}`);
  const tree = await treeResponse.json();
  if (tree.truncated) throw new Error(`${repo} tree was truncated`);
  return tree.tree.filter(entry => entry.type === "blob" && pathFilter(entry.path)).map(entry => ({
    family, source:"official-github-repository", lastmod:null, repoPath:entry.path,
    url:`https://github.com/${repo}/blob/${meta.default_branch}/${entry.path}`
  }));
}

function classify(record) {
  const pathName = new URL(record.url).pathname.toLowerCase();
  const value = `${pathName} ${record.repoPath || ""}`;

  if (record.family === "autogen") return {
    status:"prefilter-rejected-superseded-framework",
    reason:"AutoGen 已进入维护模式并由 Microsoft Agent Framework 接替；其全量旧文档不进入当前主审核。"
  };
  if (record.family === "foundry-classic") return {
    status:"prefilter-rejected-classic",
    reason:"Foundry Classic 属于旧产品路径；当前主审核只保留新 Foundry 与必要迁移资料。"
  };
  if (record.lastmod && record.lastmod < "2024-01-01") return {
    status:"prefilter-rejected-before-2024",
    reason:"官方站点地图显示最后更新时间早于 2024-01-01，先按时效门槛淘汰。"
  };
  if (/(?:^|\/)(?:quickstarts?|quick-starts?|tutorials?|samples?|examples?)(?:\/|$)|(?:^|[-_/])get-started(?:[-_/]|$)/.test(value)) return {
    status:"prefilter-rejected-quickstart-or-sample",
    reason:"主要是快速开始、教程、样例或入门流程，不直接形成独立技术结论。"
  };
  if (/(?:^|\/)(?:release-notes?|changelog|whats-new|known-issues|faq)(?:\/|$)|(?:^|[-_/])release-notes?(?:[-_/]|$)/.test(value)) return {
    status:"prefilter-rejected-maintenance-page",
    reason:"更新日志、常见问题或已知问题属于维护信息，不作为独立知识卡候选。"
  };
  if (["copilot", "copilot-studio"].includes(record.family) && /(?:^|[-_/])(?:create|configure|customize|edit|enable|disable|install|navigate|open|publish|share|sign-in|setup|upload|download|delete|manage|use)(?:[-_/]|$)/.test(value)) return {
    status:"prefilter-rejected-copilot-operation",
    reason:"页面主要说明 Copilot 产品界面或日常操作，不补专业 AI 技术知识。"
  };
  if (/(?:^|\/)(?:training|certification|community|events?|pricing|support|resources?)(?:\/|$)/.test(value)) return {
    status:"prefilter-rejected-nontechnical",
    reason:"培训、活动、价格、支持或资源入口不是独立技术资料。"
  };
  if (record.family === "azure-machine-learning" && /\/component-reference(?:-v2)?\//.test(pathName)) return {
    status:"prefilter-rejected-low-value-component-reference",
    reason:"旧设计器或单一组件词条颗粒度过细，不能形成知识矩阵所需的独立重要资料。"
  };
  if (record.family === "foundry-tools" && /\/(?:anomaly-detector|custom-vision-service|content-moderator|immersive-reader)(?:\/|$)/.test(pathName)) return {
    status:"prefilter-rejected-retired-or-narrow-service",
    reason:"资料对应已退役、维护型或过窄的独立服务，不进入当前 Microsoft AI 主审核。"
  };
  if (record.family === "copilot") {
    const technical = /(?:architecture|data-handling|responsible-ai|security|privacy|transparency|governance|compliance|authentication|identity|network|extensibility|developer|api|limits|grounding|evaluation|observability|prompt|model|agent-builder|agents\/overview)/.test(pathName);
    if (!technical) return {
      status:"prefilter-rejected-copilot-low-technical-value",
      reason:"属于行业 Copilot、最终用户功能或业务流程说明，没有足够的架构、安全、评测或扩展机制价值。"
    };
  }
  if (record.family === "copilot-studio") {
    const technical = /(?:architecture|security|privacy|responsible|transparency|governance|data-loss|network-isolation|authentication|identity|telemetry|observability|evaluation|analytics|monitor|customer-managed-keys|api|limits|mcp|agent-to-agent|computer-use|grounding|knowledge|orchestration|generative-ai|slot-filling|connector|tool|code-interpreter|model-context)/.test(pathName);
    if (!technical) return {
      status:"prefilter-rejected-copilot-low-technical-value",
      reason:"属于 Copilot Studio 界面配置、内容编辑、渠道发布或业务操作，不进入专业技术资料审核。"
    }
  }
  if (record.family === "windows-ai") {
    const technical = /\/(?:apis|directml|windows-ml|models?|concepts?|npu|onnx|machine-learning|foundry-local|ml)\b/.test(pathName);
    if (!technical) return {
      status:"prefilter-rejected-windows-product-workflow",
      reason:"属于 Windows AI 产品入口、展厅或应用操作流程，未达到跨项目复用的技术重要性。"
    }
  }
  if (/\/(?:collections?|gallery|showcase)(?:\/|$)/.test(pathName)) return {
    status:"prefilter-rejected-navigation-collection",
    reason:"集合、展厅或目录页只承担导航作用，不单独进入重要性审核。"
  };
  return { status:"pending-importance-review", reason:"通过机械预筛，等待逐份重要性与内容审核。" };
}

function duplicateKey(record) {
  if (!record.url.includes("learn.microsoft.com")) return null;
  const pathName = new URL(record.url).pathname.toLowerCase();
  if (!/(?:model|version|preview)/.test(pathName)) return null;
  return `${record.family}:${pathName
    .replace(/(?:19|20)\d{2}(?:[-_/]\d{1,2}){0,2}/g, "{date}")
    .replace(/(?:^|[-_/])v?\d+(?:[-.]\d+){1,3}(?=[-_/]|$)/g, "-{version}")
    .replace(/[-_/](?:preview|beta|legacy)(?=[-_/]|$)/g, "")}`;
}

function generalLearningDecision(record) {
  const pathName = new URL(record.url).pathname.toLowerCase();
  const value = `${pathName} ${record.repoPath || ""}`;
  const productOperation = /(?:portal|studio|workspace|resource|subscription|tenant|billing|quota|region|rbac|vnet|firewall|private-endpoint|managed-identity|customer-managed-key|cli|powershell|arm-template|bicep|terraform|connector|integration|sdk|python|java|javascript|csharp|dotnet|rest-api|troubleshoot|migration|install|configuration|deployment-guide)/.test(value);
  const modelSpecific = /(?:gpt[-_/]?\d|phi[-_/]?\d|llama[-_/]?\d|mistral|cohere|deepseek|model-card|transparency-note|responsible-ai\/.*model)/.test(value);
  const learningTopic = /(?:concept|architecture|fundamental|best-practice|design|agent|workflow|orchestration|memory|tool-calling|function-calling|mcp|a2a|evaluation|observability|tracing|monitoring|guardrail|safety|responsible-ai|content-filter|prompt|fine-tun|rag|retrieval|vector|hybrid|semantic|ranking|relevance|embedding|chunking|inference|model-lifecycle|drift|mlops|fairness|explain|privacy|threat|red-team|multimodal|speech-recognition|language-model|neural|token|grounding)/.test(value);

  if (record.family === "ai-playbook") {
    return /\/playbook\/(?:technology-guidance|solutions)\//.test(pathName)
      ? { keep:true }
      : { keep:false, reason:"AI 资源入口或活动页不提供可迁移的学习内容。" };
  }
  if (record.family === "foundry") {
    const tail = pathName.split("/en-us/azure/foundry/")[1] || "";
    const conceptualArea = /\/(?:agents\/concepts|concepts|observability|responsible-ai|guardrails)\//.test(pathName);
    const portableTopic = /(?:memory|state-store|workflow|routine|runtime|tool|agentic|planning|evaluation|observability|tracing|monitoring|guardrail|safety|responsible|content-filter|prompt|fine-tun|rag|retrieval|vector|embedding|inference|resilience|human-in-the-loop|red-team|multimodal)/.test(tail);
    const vendorBoundary = /(?:azure-government|yaml-reference|pricing|regions|networking|permissions|identity|resource|quota|billing)/.test(tail);
    return conceptualArea && portableTopic && !vendorBoundary && !modelSpecific && !productOperation
      ? { keep:true }
      : { keep:false, reason:"Foundry 页面主要是平台操作、特定型号或 Azure 管理信息，不能作为通用 AI 学习资料。" };
  }
  if (record.family === "foundry-tools") {
    const conceptual = /(?:\/concepts?\/|best-practices|architecture|responsible|transparency|how-.*works|service-limits)/.test(pathName);
    return conceptual && learningTopic && !modelSpecific && !productOperation
      ? { keep:true }
      : { keep:false, reason:"页面主要教授 Microsoft 服务调用、语言 SDK 或产品配置，而非可迁移的 AI 原理。" };
  }
  if (record.family === "azure-machine-learning") {
    const tail = pathName.split("/en-us/azure/machine-learning/")[1] || "";
    const mlTopic = /(?:automl|mlops|model-monitor|data-drift|fairness|interpret|explain|causal|counterfactual|feature-importance|responsible-ai|model-evaluation|hyperparameter|deep-learning|training-concept|mlflow-concept)/.test(tail);
    return mlTopic && !productOperation && !/(?:release-note|glossary|data-science-virtual-machine|compute|workspace|datastore|pipeline-component)/.test(tail)
      ? { keep:true }
      : { keep:false, reason:"Azure ML 页面偏平台资源、数据工程或产品操作，未提供足够通用的机器学习知识。" };
  }
  if (record.family === "azure-ai-search") {
    const retrievalTopic = /(?:vector|hybrid|semantic|ranking|relevance|retrieval|rag|embedding|chunk|indexing|knowledge|query-rewrite|scoring|filter|analyzer|token)/.test(pathName);
    const connectorSpecific = /(?:azure-sql|blob|sharepoint|onelake|fabric|cosmos|mysql|onelake|power-bi|logic-app|web-manage)/.test(pathName);
    return retrievalTopic && !connectorSpecific && !productOperation
      ? { keep:true }
      : { keep:false, reason:"页面是 Azure Search 数据源连接、资源配置或产品操作，缺少通用检索学习价值。" };
  }
  if (record.family === "agent-framework") {
    const core = /\/(?:concepts|agents|workflows|hosting)\//.test(pathName) || /(?:mcp|a2a|human-in-the-loop|checkpoint|middleware|memory|observability)/.test(pathName);
    return core && !productOperation && !modelSpecific
      ? { keep:true }
      : { keep:false, reason:"页面是提供商适配、安装迁移或框架操作，未增加通用 Agent 知识。" };
  }
  if (record.family === "semantic-kernel") {
    const core = /\/concepts\//.test(pathName) && /(?:planning|function-calling|plugins?(?:\/|$)|filters?(?:\/|$)|security)/.test(pathName);
    return core && !productOperation && !modelSpecific
      ? { keep:true }
      : { keep:false, reason:"Semantic Kernel 页面偏框架接口或旧工作流，且已被 Agent Framework 或更通用资料覆盖。" };
  }
  if (record.family === "onnx-runtime") {
    const core = /(?:graph[-_]optimization|quantization|inference[-_]performance|threading)/.test(value);
    return core ? { keep:true } : { keep:false, reason:"ONNX Runtime 页面是贡献算子、内部构建或项目维护资料，不是通用推理学习内容。" };
  }
  if (record.family === "copilot" || record.family === "copilot-studio") {
    return { keep:false, reason:"Copilot 页面依赖 Microsoft 产品界面、管理模型或业务场景；通用主题由 Agent、MCP、安全与评测主资料覆盖。" };
  }
  if (record.family === "dotnet-ai") {
    const portable = /(?:evaluation|vector-stores|embedding|chat-client)/.test(pathName);
    return portable && !productOperation ? { keep:true } : { keep:false, reason:"资料主要教授 .NET 接口使用，而非跨语言 AI 原理。" };
  }
  if (["windows-ai", "foundry-local"].includes(record.family)) return {
    keep:false, reason:"资料与 Windows 或 Foundry Local 产品实现绑定，缺少对所有 AI 的通用学习价值。"
  };
  return learningTopic && !productOperation && !modelSpecific
    ? { keep:true }
    : { keep:false, reason:"没有形成可迁移到其他模型、框架或平台的 AI 学习主题。" };
}

async function main() {
  const learnChunks = [];
  let cursor = 0;
  async function worker() {
    while (cursor < sitemapNames.length) {
      const name = sitemapNames[cursor++];
      learnChunks.push(...parseSitemap(await fetchText(`${learnBase}${name}.xml`)));
    }
  }
  await Promise.all(Array.from({ length:12 }, worker));

  const [autogen, onnx] = await Promise.all([
    repoDocs("microsoft/autogen", "autogen", file => /\.(?:md|mdx|rst)$/i.test(file) && (
      /^python\/docs\/src\//.test(file) || /^dotnet\/website\/(?:articles|tutorial|release_note)\//.test(file) || /^docs\//.test(file)
    )),
    repoDocs("microsoft/onnxruntime", "onnx-runtime", file => /^docs\/.*\.(?:md|mdx|rst)$/i.test(file))
  ]);

  const byUrl = new Map();
  for (const record of [...learnChunks, ...autogen, ...onnx]) {
    if (!byUrl.has(record.url)) byUrl.set(record.url, record);
  }
  const records = [...byUrl.values()].sort((a, b) => a.family.localeCompare(b.family) || a.url.localeCompare(b.url));
  records.forEach((record, index) => Object.assign(record, { sequence:index + 1, ...classify(record) }));
  for (const record of records) {
    if (record.status !== "pending-importance-review") continue;
    const learning = generalLearningDecision(record);
    if (learning.keep) continue;
    record.status = "prefilter-rejected-not-general-learning";
    record.reason = learning.reason;
  }

  const groups = new Map();
  for (const record of records) {
    if (record.status !== "pending-importance-review") continue;
    const key = duplicateKey(record);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  }
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    group.sort((a, b) => String(b.lastmod || "").localeCompare(String(a.lastmod || "")) || b.url.localeCompare(a.url));
    for (const record of group.slice(1)) {
      record.status = "prefilter-rejected-duplicate-model-or-version";
      record.reason = `同一型号或版本主题已有更新路径：${group[0].url}`;
      record.duplicateOf = group[0].url;
    }
  }

  const countBy = key => Object.fromEntries([...records.reduce((map, record) => {
    const value = record[key];
    map.set(value, (map.get(value) || 0) + 1);
    return map;
  }, new Map()).entries()].sort());
  const pending = records.filter(record => record.status === "pending-importance-review").length;
  const inventory = {
    policy:"official-technical-importance-v2", prefilterVersion:"2.0", reviewedAt,
    scope:{
      description:"Microsoft 官方英文 AI 技术资料：Microsoft Learn 13 个产品簇，加 AutoGen 与 ONNX Runtime 官方仓库文档。",
      excluded:"Microsoft Research 论文归学术一级来源；训练课程、SDK 自动生成成员页及非技术营销内容不在本母集。",
      cutoff:"以官方站点地图 lastmod 判断；仍在 2024 年后维护的基础资料不因首次发布日期较早而机械淘汰。"
    },
    records,
    summary:{ rawCandidates:records.length, pendingImportanceReview:pending, prefilterRejected:records.length - pending,
      byFamily:countBy("family"), byStatus:countBy("status") }
  };
  fs.mkdirSync(path.dirname(outputPath), { recursive:true });
  fs.writeFileSync(outputPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify(inventory.summary, null, 2)}\n`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
