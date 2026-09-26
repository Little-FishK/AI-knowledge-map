/* Build and prefilter AWS official AI learning-material candidates. */
"use strict";

const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../shared/project-root");

const reviewedAt = "2026-09-24";
const outputPath = path.join(PROJECT_ROOT, "proposals", "official-technical", "aws-learning-prefilter-20260924.json");

const sets = [
  ["bedrock", "Amazon Bedrock User Guide", "https://docs.aws.amazon.com/bedrock/latest/userguide/toc-contents.json", "https://docs.aws.amazon.com/bedrock/latest/userguide/"],
  ["sagemaker", "Amazon SageMaker AI Developer Guide", "https://docs.aws.amazon.com/sagemaker/latest/dg/toc-contents.json", "https://docs.aws.amazon.com/sagemaker/latest/dg/"],
  ["genai-lens", "AWS Well-Architected Generative AI Lens", "https://docs.aws.amazon.com/wellarchitected/latest/generative-ai-lens/toc-contents.json", "https://docs.aws.amazon.com/wellarchitected/latest/generative-ai-lens/"],
  ["inference-guidance", "Generative AI inference architecture and best practices", "https://docs.aws.amazon.com/prescriptive-guidance/latest/gen-ai-inference-architecture-and-best-practices-on-aws/toc-contents.json", "https://docs.aws.amazon.com/prescriptive-guidance/latest/gen-ai-inference-architecture-and-best-practices-on-aws/"]
];

async function fetchJson(url) {
  const response = await fetch(url, { headers:{ "user-agent":"ai-knowledge-map-aws-review/1.0" } });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

function collect(entries, family, familyTitle, indexUrl, baseUrl, ancestors = [], output = []) {
  for (const entry of entries || []) {
    const title = String(entry.title || "").trim();
    const sectionPath = [...ancestors, title].filter(Boolean);
    if (entry.href) {
      const url = new URL(entry.href, baseUrl);
      url.hash = "";
      url.search = "";
      output.push({ family, familyTitle, indexUrl, section:ancestors.at(-1) || "", sectionPath, title, url:url.href });
    }
    collect(entry.contents, family, familyTitle, indexUrl, baseUrl, sectionPath, output);
  }
  return output;
}

function classify(record) {
  const pathName = new URL(record.url).pathname.toLowerCase();
  const title = record.title.toLowerCase();
  const hierarchy = record.sectionPath.join(" ").toLowerCase();
  const value = `${title} ${pathName} ${hierarchy}`;
  const topicValue = `${title} ${pathName}`;

  if (/(?:document[-_]?history|doc[-_]?history|document[-_]?revisions|contributors|notices|glossary|resources)(?:\.html|\/|$)/.test(pathName)) return ["prefilter-rejected-metadata", "文档历史、贡献者、声明、词汇表或资源目录不是独立学习资料。"];
  if (/(?:quick[-_]?start|getting[-_]?started|detailed[-_]?getting[-_]?started|tutorials?|examples?|sample|workshop|notebook|code[-_]?examples|how[-_]?to)(?:\.html|\/|$)/.test(pathName)) return ["prefilter-rejected-tutorial-or-example", "快速开始、教程、样例、研讨会或代码示例以产品操作为主。"];
  if (/(?:api[-_]?reference|sdk|cli|boto3|command[-_]?line|cloudformation|cfn|java|javascript|python|dotnet|go[-_]?sdk|request[-_]?syntax|response[-_]?syntax)(?:\.html|\/|$)/.test(pathName)) return ["prefilter-rejected-api-or-sdk", "API、SDK、CLI 或基础设施模板参考颗粒度过细。"];
  if (/(?:troubleshoot|faq|known[-_]?issues|release[-_]?notes|migration|upgrade|legacy|deprecated)(?:\.html|\/|$)/.test(pathName)) return ["prefilter-rejected-maintenance", "故障排除、FAQ、迁移或旧版维护信息不形成通用学习资料。"];
  if (/(?:model[-_]?cards?|foundation[-_]?models?[-_]?reference|model[-_]?parameters|supported[-_]?models?|model[-_]?ids?|provider[-_]?models?|titan|anthropic|claude|cohere|mistral|llama|meta[-_]?models?|deepseek|qwen|moonshot|stability|nova|jurassic|jamba|openai|gpt[-_]?\d)/.test(value)) return ["prefilter-rejected-model-specific", "具体厂商、型号、模型卡或参数说明不作为通用学习资料。"];
  if (/(?:iam|identity|permission|policy|role|vpc|subnet|security[-_]?group|private[-_]?link|endpoint[-_]?policy|kms|encryption[-_]?key|cloudwatch|cloudtrail|eventbridge|s3[-_]?bucket|lambda|region|quota|pricing|billing|cost[-_]?management|marketplace|subscription|console|tagging|resource[-_]?group|cross[-_]?region|availability[-_]?zone)/.test(value)) return ["prefilter-rejected-aws-operation", "IAM、网络、区域、监控、计费或 AWS 资源配置不能迁移到其他平台。"];
  if (/(?:create|delete|update|manage|configure|set[-_]?up|enable|disable|submit|invoke|call|access|subscribe|upload|download)[-_]?(?:a|an|the)?[-_]?(?:job|resource|endpoint|project|workspace|domain|instance|cluster|application|profile|model|flow|agent|knowledge[-_]?base)/.test(pathName)) return ["prefilter-rejected-product-operation", "页面主要说明如何创建、配置或管理 AWS 产品资源。"];
  if (/(?:service[-_]?code|console|studio|canvas|jumpstart|autopilot[-_]?ui|notebook[-_]?instance|jupyter|rstudio|hyperpod|partner[-_]?apps?|marketplace)/.test(value)) return ["prefilter-rejected-product-operation", "AWS 控制台、Studio、托管工作区或市场操作缺少跨平台价值。"];
  if (/(?:^|[-_/])(?:create|delete|update|manage|configure|set[-_]?up|setup|enable|disable|submit|invoke|call|access|subscribe|upload|download|register|associate|attach|detach|launch|schedule|run|view|list|get|send|prepare|grant|request)(?:[-_/]|\.html$)/.test(pathName) || /^(?:create|delete|update|manage|configure|set up|enable|disable|submit|invoke|access|subscribe|upload|download|register|associate|attach|launch|schedule|run|view|list|get|send|prepare|grant|request)\b/.test(title)) return ["prefilter-rejected-product-operation", "页面是创建、调用、配置或管理 AWS 资源的操作步骤。"];
  if (/^(?:step\s+\d+|build|deploy|monitor|review|include|store|specify|add|prepare|use|using)\b/.test(title) || /(?:^|[-_/])(?:deploy|monitor|review|include|store|specify|build)(?:[-_/]|\.html$)/.test(pathName)) return ["prefilter-rejected-product-operation", "页面是部署、监控、检查或组装 AWS 工作流的操作步骤。"];
  if (/(?:connectors?|data[-_]?source|input[-_]?format|output[-_]?format|request[-_]?body|response[-_]?body|job[-_]?status|job[-_]?output|example_)/.test(pathName)) return ["prefilter-rejected-product-operation", "连接器、数据源、请求格式或作业输出属于 AWS 实现细节。"];

  if (record.family === "bedrock" && /(?:tutorial|logging|cors|service[-_]?tiers|provisioned[-_]?throughput|inference[-_]?(?:messages|responses)[-_]?api|action[-_]?group|flows?[-_]|sessions?[-_]|model[-_]?import[-_]?job)/.test(pathName)) return ["prefilter-rejected-product-operation", "Bedrock API、Flow、Session、吞吐层级或 Agent 配置属于产品实现。"];
  if (record.family === "bedrock" && /^(?:advanced topics|troubleshooting|prerequisites|stop|clone|purchase|disassociate|modify|return control|test|provision|analyze|code samples|creating your first|understand amazon s3|reports and metrics|supported languages|streaming responses|web search|client-side|server-side|general text generation|question and answer|text summarization|text classification|custom metric prompts|prompt datasets|inference parameters|making inference requests|chat with your document|retrieve and generate|retrieve only|generate a query)\b/.test(title)) return ["prefilter-rejected-product-operation", "页面主要是 Bedrock 操作、输出解释、单一任务或重复的实现说明。"];
  if (record.family === "bedrock" && /^(?:define evaluation methods|selective optimization|enhance your agent|handle computer use|define function details|edit an alias|define openapi schemas|amazon bedrock agents classic|customize agent|augment response|optimize performance for agents|agents: automate tasks|capacity and performance|converse api|custom model hyperparameters|encryption of agent resources|data management and encryption|cross-account safeguards|overview|safeguard tiers|api restrictions|chat completions api|inference profiles|infrastructure security|connect from agentcore|knowledge bases|custom model import|custom prompt datasets|built-in metric prompts|customize agent orchestration|provisioned throughput|data encryption|security$|security, guardrails|session management|tool use|track agent's)\b/.test(title)) return ["prefilter-rejected-product-operation", "页面是 Bedrock 功能配置、API、资源安全或宽泛目录页，不能独立承担跨平台教学。"];
  if (record.family === "bedrock" && /(?:custom[-_]?orchestration|agent[-_]?accuracy|code[-_]?interpretation|application[-_]?inference[-_]?profiles?|agent[-_]?alias|agent[-_]?collaborator|knowledge[-_]?base[-_]?association|zero[-_]?setup|structured[-_]?data)/.test(pathName)) return ["prefilter-rejected-product-operation", "Bedrock Agent、推理配置或知识库组装细节不能直接迁移到其他平台。"];
  if (record.family === "sagemaker" && /(?:^|\/)(?:ic-|object2vec|ntm-|xgboost|blazingtext|deepar|factorization|image[-_]?classification|semantic[-_]?segmentation|k[-_]?means|knn|lda-|linear[-_]?learner|pca-|randomcutforest|seq2seq|ip[-_]?insights|sms-|neo-|a2i-|pipelines?[-_]|canvas[-_]|studio[-_]|autopilot[-_])/.test(pathName)) return ["prefilter-rejected-narrow-sagemaker-feature", "内置算法、标注工作流、Notebook/Studio 或 SageMaker 专属组件不具备通用学习价值。"];
  if (record.family === "sagemaker" && /(?:config|schedule|processor|processing[-_]?job|byoc|endpoint|workteam|worker|feature[-_]?processor|feature[-_]?group)/.test(pathName) && !/(?:concept|overview|architecture|metric|bias|drift|quality|explain)/.test(topicValue)) return ["prefilter-rejected-product-operation", "SageMaker 作业、端点、监控计划或特征处理配置属于平台操作。"];
  if (record.family === "sagemaker" && /^(?:adapt|adapting|autoscale|check|define|stop|example|storage|how amazon|inspect reports|understand the results|pre-check|change|sageMaker ai training jobs|launching|debugging training jobs|construct|walkthrough|complete prerequisites|work with|benchmark|find the maximum|track results|inference recommendations|recommendation results|recommendation jobs|compiled recommendations|troubleshoot|instance storage|otel metrics|batch transforms|logs and metrics|process features|real-time inference|inference pipelines|kubernetes|deploying|sageMaker ai endpoint|sageMaker ai-created|tracking entities|manually create|log metrics|implement mlops|resume training|supported dataset|preparing your agent|creating assets|model deployment|training job submission|model evaluation job submission|ai model customization job submission|sample datasets|managed spot training|models, model versions|dissociate|cross-account|staging construct|compare model versions|sageMaker ai environment|managing storage|uncompressed model output|mapping of training storage|sageMaker ai insights|metric name mapping|connect to your observability|monitoring|autoscale multi-container|metrics for multi-container|security with multi-container|querying lineage|reserve capacity|logging and monitoring|modify your training script|logging parameters|sageMaker smart sifting|aws batch support|training plans|extend a training plan|triton inference|track worker|tracking cross-account|custom inference code|private docker|containers with custom|training output|provide training information|signal success)\b/i.test(record.title)) return ["prefilter-rejected-product-operation", "页面主要是 SageMaker 作业、容器、端点、结果查看或平台工作流操作。"];
  if (record.family === "sagemaker" && /^(?:hyperparameters|inference formats|prerequisites|troubleshooting|pytorch|tensorflow|release note|accessibility|encryption at rest|security|infrastructure security)$/i.test(record.title)) return ["prefilter-rejected-narrow-sagemaker-feature", "孤立参数页、框架页、前置条件或平台安全页不能独立形成通用学习资料。"];
  if (record.family === "sagemaker" && /(?:debugger|edge[-_]?manager|inference[-_]?recommender|training[-_]?plans?|smart[-_]?sifting|model[-_]?registry[-_]?(?:staging|deploy|share)|mlflow|greengrass|private[-_]?docker|training[-_]?compiler|neo[-_]|lmi[-_]?container)/.test(pathName)) return ["prefilter-rejected-narrow-sagemaker-feature", "SageMaker 专属调试器、推荐器、注册表流程或训练工具不具备足够的跨平台学习价值。"];
  if (record.family === "sagemaker" && /^(?:distributed training with the smddp library|sageMaker ai distributed data parallelism library|best practices to minimize interruptions during gpu driver upgrades|evaluation metrics formats|evaluation types and job submission|distributed training with amazon sageMaker ai rl|datasets format and objective metric|protect communications between ml compute instances)\b/i.test(record.title)) return ["prefilter-rejected-narrow-sagemaker-feature", "页面内容依赖 SageMaker 专属库、作业格式或基础设施，不能迁移为通用 AI 学习资料。"];

  if (record.family === "genai-lens") {
    if (/(?:scenarios?|autonomous[-_]?call[-_]?center|business[-_]?intelligence|kanban|code[-_]?review|incident[-_]?response|knowledge[-_]?worker|multi[-_]?tenant)(?:\.html|\/|$)/.test(pathName)) return ["prefilter-rejected-scenario", "行业或应用场景页面不承担通用概念教学。"];
    if (/(?:aws|service|infrastructure)/.test(title) && !/(?:architecture|security|reliability|performance|sustainability)/.test(title)) return ["prefilter-rejected-aws-operation", "AWS 服务或基础设施建议缺少跨云价值。"];
  }
  if (record.family === "inference-guidance" && /(?:aws[-_]?inference[-_]?stack|selecting[-_]?aws[-_]?service|amazon[-_]?bedrock|sage[-_]?maker|aws[-_]?partner)/.test(pathName)) return ["prefilter-rejected-aws-operation", "AWS 推理服务选型与合作伙伴信息不是通用推理知识。"];
  if (record.family === "inference-guidance" && title === "introduction") return ["prefilter-rejected-metadata", "导言不作为独立学习资料。"];

  const learningTopic = /(?:architecture|design[-_]?principle|lifecycle|responsible[-_]?ai|fairness|bias|explain|interpret|security|safety|guardrail|prompt[-_]?security|data[-_]?poison|excessive[-_]?agency|reliability|resilien|performance|efficien|evaluation|metric|benchmark|observability|trace|monitor|model[-_]?selection|model[-_]?custom|fine[-_]?tun|reinforcement|distill|training|distributed|hyperparameter|inference|batch|throughput|latency|autoscal|right[-_]?siz|optimization|quantiz|compression|cache|prompt[-_]?cache|agent|tool[-_]?use|orchestration|memory|session|retrieval|rag|knowledge[-_]?base|vector|embedding|rerank|chunk|semantic|hybrid[-_]?search|data[-_]?architecture|data[-_]?quality|label|drift|mlops|model[-_]?registry|governance|lineage|feature[-_]?store|automl|machine[-_]?learning[-_]?concept|inference[-_]?stack|system[-_]?optimization|model[-_]?monitor)/.test(topicValue);
  if (!learningTopic) return ["prefilter-rejected-no-general-learning-topic", "没有识别出可迁移到其他模型、框架或云平台的 AI 学习主题。"];

  if (record.family === "sagemaker") {
    const transferableSageMakerTopic = /(?:best practices|strategies|architecture|lifecycle|resilience|checkpoint|distributed|parallelism|scaling training|mixed precision|fine-tuning|reinforcement learning|bias|fairness|disparity|divergence|imbalance|shap|explain|robustness|toxicity|accuracy|evaluation|metric|model governance|lineage|mlops|inference cost optimization|model parallelism|large model inference|model registry|data refining|profile and optimize|training types|common data formats|asynchronous inference|batch transform|real-time inference)/.test(title);
    if (!transferableSageMakerTopic) return ["prefilter-rejected-narrow-sagemaker-feature", "虽与机器学习相关，但页面的核心知识仍依赖 SageMaker 专属实现。"];
  }

  return ["pending-importance-review", "通过通用学习价值预筛，等待逐份重要性、时效性和替代关系审核。"];
}

async function main() {
  const chunks = await Promise.all(sets.map(async ([family, familyTitle, indexUrl, baseUrl]) => {
    const json = await fetchJson(indexUrl);
    return collect(json.contents, family, familyTitle, indexUrl, baseUrl);
  }));
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
      included:"Amazon Bedrock、SageMaker AI、AWS Well-Architected Generative AI Lens 与生成式 AI 推理架构指南中的训练、推理、评测、治理、安全、Agent、检索和 MLOps 学习资料。",
      excluded:"AWS Research 论文归学术一级来源；SDK/源码归开源项目；Neuron/Trainium 等专属硬件、控制台与资源运维、IAM/VPC/区域/计费、具体模型与行业场景不进入通用学习候选。",
      rule:"官方目录页面先完整留痕，再排除不能迁移到其他模型、框架或云平台的内容；预筛通过项仍须逐份审核。"
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
