const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const reviewedAt = "2026-09-24";
const modern = JSON.parse(fs.readFileSync(path.join(root, ".tmp", "accepted-modern.json"), "utf8"));
const audit = JSON.parse(fs.readFileSync(path.join(root, "proposals", "hackathon", "kaggle-full-review-20260924.json"), "utf8"));

const legacy = [
  ["Google - Unlock Global Communication with Gemma", "gemma-language-tuning", "First Prize", "Gemma 2 Swahili", "Fine-tuning Gemma 2 for Swahili language use.", "alfaxadeyembe", "https://www.kaggle.com/code/alfaxadeyembe/introducing-gemma-2-swahili"],
  ["Google - Unlock Global Communication with Gemma", "gemma-language-tuning", "Second Prize", "Kyara: Retrieval Augmentation for LLM Fine-Tuning", "Retrieval-augmented data preparation and fine-tuning workflow for a language model.", "zake7749", "https://www.kaggle.com/code/zake7749/kyara-retrieval-augmentation-for-llm-fine-tuning"],
  ["Google - Unlock Global Communication with Gemma", "gemma-language-tuning", "Third Prize", "ArGemma: Fine-Tuning Gemma for Arabic", "Arabic adaptation workflow for Gemma.", "tahaalselwii", "https://www.kaggle.com/code/tahaalselwii/fine-tuning-gemma-for-arabic-argemma"],
  ["Google - Unlock Global Communication with Gemma", "gemma-language-tuning", "Fourth Prize", "Post-Training Gemma for Italian and beyond", "Post-training workflow for adapting Gemma to Italian and related multilingual use.", "anakin87", "https://www.kaggle.com/code/anakin87/post-training-gemma-for-italian-and-beyond"],
  ["Google - Unlock Global Communication with Gemma", "gemma-language-tuning", "Fifth Prize", "Ancient Chinese Expert: Gemma 2>ChatGPT", "Domain and language adaptation of Gemma 2 for Ancient Chinese.", "judith007", "https://www.kaggle.com/code/judith007/ancient-chinese-expert-gemma2-chatgpt/notebook?scriptVersionId=216814746"],

  ["NFL Big Data Bowl 2025", "nfl-big-data-bowl-2025", "Finalist", "Wendel Big Data Bowl 2025 dataset", "Competition dataset and analysis artifact for pre-snap defensive behavior.", "Ben Wendel", "https://www.kaggle.com/datasets/benwendel/wendel-big-data-bowl-2025"],
  ["NFL Big Data Bowl 2025", "nfl-big-data-bowl-2025", "Finalist", "Exposing Coverage Tells in the Presnap", "Methods for identifying pre-snap coverage signals from tracking data.", "Smit Bajaj", "https://www.kaggle.com/code/smitbajaj/exposing-coverage-tells-in-the-presnap"],
  ["NFL Big Data Bowl 2025", "nfl-big-data-bowl-2025", "Finalist", "TendenciQ", "Modeling defensive tendencies from pre-snap tracking data.", "Eric Steinberg", "https://www.kaggle.com/code/ericthesteinberg/tendenciq"],
  ["NFL Big Data Bowl 2025", "nfl-big-data-bowl-2025", "Finalist", "Safety Entropy", "Quantitative evaluation of safety positioning and uncertainty.", "Cole Jacobson", "https://www.kaggle.com/code/colejacobson/safety-entropy"],
  ["NFL Big Data Bowl 2025", "nfl-big-data-bowl-2025", "Finalist", "Under Cover 2: Predicting Disguised Defenses", "Predicting disguised defensive coverages from pre-snap movement.", "Sarah Pollack", "https://www.kaggle.com/code/sarahpollack/under-cover-2-predicting-disguised-defenses2"],
  ["NFL Big Data Bowl 2025", "nfl-big-data-bowl-2025", "Semi-finalist", "Dialing Up the Pressure", "Analysis of defensive pressure patterns from player tracking data.", "Andrew Akers", "https://www.kaggle.com/code/andrewakers9/dialing-up-the-pressure"],
  ["NFL Big Data Bowl 2025", "nfl-big-data-bowl-2025", "Semi-finalist", "Keep 'em Separated", "Spatial analysis of receiver and defender separation.", "Jonah Lubin", "https://www.kaggle.com/code/jonahdlubin/keep-em-separated"],
  ["NFL Big Data Bowl 2025", "nfl-big-data-bowl-2025", "Semi-finalist", "Down Set Hut", "Pre-snap tracking analysis and modeling workflow.", "TinData", "https://www.kaggle.com/code/tindata/down-set-hut"],
  ["NFL Big Data Bowl 2025", "nfl-big-data-bowl-2025", "Semi-finalist", "It's a Bluff: Predicting Receiver Decoy Motions", "Prediction of receiver decoy motion from pre-snap tracking features.", "Matt Polsky", "https://www.kaggle.com/code/mattpolsky/it-s-a-bluff-predicting-receiver-decoy-motions"],
  ["NFL Big Data Bowl 2025", "nfl-big-data-bowl-2025", "Semi-finalist", "Trench Chess", "Modeling tactical interactions around the line of scrimmage.", "Abhishek Varadarajan", "https://www.kaggle.com/code/abhishekvaradarajan/trench-chess"],

  ["Google - Gemini Long Context", "gemini-long-context", "Winner", "Exploring Sports Sponsorship – Ads Exposure Analysis", "Long-context video analysis workflow for measuring sponsor exposure.", "Oleksandr Arsentiev", "https://www.kaggle.com/code/oleksandrarsentiev/exploring-sports-sponsorship-ad-exposure-analysis"],
  ["Google - Gemini Long Context", "gemini-long-context", "Winner", "KeepTrack: Use Gemini to Keep Track of Anything", "Long-context multimodal workflow for extracting and tracking events from video.", "Daniel Bourke", "https://www.kaggle.com/code/mrdbourke/keeptrack-use-gemini-to-keep-track-of-anything"],
  ["Google - Gemini Long Context", "gemini-long-context", "Winner", "Building Process Documentation from Video with AI", "Converts long-form process video into structured operational documentation.", "Future of Work", "https://www.kaggle.com/code/futureofworkchannel/building-process-documentation-from-video-with-ai"],

  ["Google - AI Assistants for Data Tasks with Gemma", "data-assistants-with-gemma", "Category Winner", "Build AI Agents With Google's LLM Gemma", "Agent construction workflow using Gemma for data tasks.", "Sita Berete", "https://www.kaggle.com/code/sitaberete/build-ai-agents-with-google-s-llm-gemma"],
  ["Google - AI Assistants for Data Tasks with Gemma", "data-assistants-with-gemma", "Category Winner", "PyGEM: A Chatbot for Python Questions using Gemma", "A Gemma-based assistant specialized for Python questions.", "David Troxel", "https://www.kaggle.com/code/davidtroxellucla/pygem-a-chatbot-for-python-questions-using-gemma"],
  ["Google - AI Assistants for Data Tasks with Gemma", "data-assistants-with-gemma", "Category Winner", "Gemma meets LangChain - summarize kaggle writeups", "A LangChain and Gemma pipeline for summarizing Kaggle write-ups.", "toshik", "https://www.kaggle.com/code/toshik/gemma-meets-langchain-summarize-kaggle-writeups"],
  ["Google - AI Assistants for Data Tasks with Gemma", "data-assistants-with-gemma", "Category Winner", "Unleashing Gemma's Power by Prompt Engineering", "Prompt-engineering workflow and evaluation for Gemma.", "Nghi Huynh", "https://www.kaggle.com/code/nghihuynh/unleashing-gemma-s-power-by-prompt-engineering"],
  ["Google - AI Assistants for Data Tasks with Gemma", "data-assistants-with-gemma", "Category Winner", "KaggleBot - Gemma-7b-it RAG w few-shot prompting", "A retrieval-augmented Kaggle assistant combining Gemma with few-shot prompting.", "vbookshelf", "https://www.kaggle.com/code/vbookshelf/kagglebot-gemma-7b-it-rag-w-few-shot-prompting"],

  ["NFL Big Data Bowl 2024", "nfl-big-data-bowl-2024", "Finalist", "Pull the Plug", "Player-tracking analysis of tackling decisions and outcomes.", "Ben Davis", "https://www.kaggle.com/code/bendavis71/pull-the-plug"],
  ["NFL Big Data Bowl 2024", "nfl-big-data-bowl-2024", "Finalist", "Uncovering Missed Tackle Opportunities", "Modeling missed-tackle opportunities from tracking data.", "Matthew Chang", "https://www.kaggle.com/code/matthewpchang/uncovering-missed-tackle-opportunities/"],
  ["NFL Big Data Bowl 2024", "nfl-big-data-bowl-2024", "Finalist", "Momentum-based Fractional Tackles", "A momentum-aware method for assigning fractional tackle credit.", "TinData", "https://www.kaggle.com/code/tindata/momentum-based-fractional-tackles"],
  ["NFL Big Data Bowl 2024", "nfl-big-data-bowl-2024", "Finalist", "No Edge No Chance", "Evaluation method for edge-setting defenders.", "Devin Basley", "https://www.kaggle.com/code/devinbasley26/no-edge-no-chance?scriptVersionId=158207073"],
  ["NFL Big Data Bowl 2024", "nfl-big-data-bowl-2024", "Finalist", "Set a Framework to Evaluate Edge Setters", "A quantitative framework for evaluating edge setters.", "Smit Bajaj", "https://www.kaggle.com/code/smitbajaj/set-a-framework-to-evaluate-edge-setters/notebook"],
  ["NFL Big Data Bowl 2024", "nfl-big-data-bowl-2024", "Runner-up", "Optimization of Weak Side Schemes vs Read Option", "Optimization analysis for weak-side defensive schemes against read option plays.", "AM Cook", "https://www.kaggle.com/code/amcook/optimization-of-weak-side-schemes-vs-read-option"],
  ["NFL Big Data Bowl 2024", "nfl-big-data-bowl-2024", "Runner-up", "Scouting Opponents through Expected YAC", "Opponent scouting method using expected yards after catch.", "Lucky Prophet", "https://www.kaggle.com/code/luckyprophet5/scouting-opponents-through-expected-yac"],
  ["NFL Big Data Bowl 2024", "nfl-big-data-bowl-2024", "Runner-up", "Defensive Stopping Power", "Metric for evaluating defender stopping power.", "Allan Paiz", "https://www.kaggle.com/code/allanpaiz/defensive-stopping-power"],
  ["NFL Big Data Bowl 2024", "nfl-big-data-bowl-2024", "Runner-up", "Every Step You Take: Measuring a Defender's Moves", "Movement-based evaluation of defender actions.", "Hassaan Inayat Ali", "https://www.kaggle.com/code/hassaaninayatali/every-step-you-take-measuring-a-defender-s-moves/notebook"],
  ["NFL Big Data Bowl 2024", "nfl-big-data-bowl-2024", "Runner-up", "PASTA", "Tracking-data method for analyzing tackle and pursuit behavior.", "Broc Hillington", "https://www.kaggle.com/code/brochillington/pasta"]
].map(([event, slug, award, title, summary, team, url]) => ({ event, slug, award, title, summary, team, url }));

const closedAt = new Map(audit.records.map(row => [row.slug, row.closedAt]));
const rows = [...modern, ...legacy];
if (rows.length !== 157) throw new Error(`Expected 157 admitted projects, received ${rows.length}`);
if (new Set(rows.map(row => row.url)).size !== 157) throw new Error("Kaggle admitted project URLs must be unique");

const ordinal = new Map();
const entries = rows.map(row => {
  const next = (ordinal.get(row.slug) || 0) + 1;
  ordinal.set(row.slug, next);
  const id = `kaggle-${row.slug}-${String(next).padStart(2, "0")}`;
  return {
    id,
    sourceClass: "hackathon",
    sourceSubcategory: "kaggle",
    eventSlug: row.slug,
    award: row.award,
    team: row.team,
    title: row.title,
    publisher: row.team || "Kaggle 参赛团队",
    collection: row.event,
    contentKind: "获奖技术项目",
    authorityTier: "R",
    reviewStatus: "五项硬门槛通过",
    reviewPolicy: "hackathon-content-v1.1",
    reviewDecision: "admitted",
    reviewedAt,
    reviewBatch: "kaggle-full-review-20260924",
    primarySource: true,
    discoveryOnly: true,
    url: row.url,
    publishedAt: closedAt.get(row.slug) || "",
    accessedAt: reviewedAt,
    summary: row.summary || `${row.title} 的公开获奖技术产物。`,
    knowledgeDelta: row.summary || "公开获奖项目的实现、数据、评测或应用约束。",
    selectionReason: `${row.award}；身份、AI 专业相关、产物可访问、知识增量和奖项资格五项硬门槛均通过。`,
    evidenceUse: "用于发现获奖项目的实现流程、数据资源、评测方法与应用约束；具体结论需回到项目原文核对。",
    limitations: ["黑客马拉松奖项不等同于同行评审或独立复现。", "项目说明可能随 Kaggle 页面更新；使用前应核对代码、数据和依赖版本。"],
    tags: ["kaggle", "黑客马拉松", row.award, row.slug],
    linkedNodes: [],
    linkedSoftware: [],
    topicKey: id
  };
});

const proposal = {
  schemaVersion: 1,
  policy: "hackathon-content-v1.1",
  reviewedAt,
  sourceSubcategory: "hackathon/kaggle",
  count: entries.length,
  records: entries
};
fs.writeFileSync(path.join(root, "proposals", "hackathon", "kaggle-admitted-projects-20260924.json"), `${JSON.stringify(proposal, null, 2)}\n`);

const js = `/* Generated from proposals/hackathon/kaggle-admitted-projects-20260924.json. */\n(function () {\n  "use strict";\n  const library = window.PRO_LIBRARY;\n  if (!library || !Array.isArray(library.items)) throw new Error("Kaggle 黑客马拉松资料包需要先加载资料库");\n  const entries = ${JSON.stringify(entries, null, 2)};\n  library.items.push(...entries);\n})();\n`;
fs.writeFileSync(path.join(root, "data", "library-hackathon-kaggle.js"), js);
console.log(`Generated ${entries.length} Kaggle hackathon records.`);
