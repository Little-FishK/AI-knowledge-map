"use strict";

// Navigation integration only. Serve a synthetic deep-dive fixture so this test
// never opens Stage 2 page sources, runtime bodies, translations or audit data.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const { PROJECT_ROOT } = require("../../tools/shared/project-root");

function playwright() {
  try { return require("playwright"); }
  catch (_) {
    return require(require.resolve("playwright", { paths: [path.join(os.homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node")] }));
  }
}

function respond(request, response) {
  let relative;
  try { relative = decodeURIComponent(new URL(request.url, "http://localhost").pathname).replace(/^\/AI-knowledge-map(?=\/)/, "").replace(/^\/+/, "") || "index.html"; }
  catch (_) { response.writeHead(400).end(); return; }
  if (relative === "favicon.ico") { response.writeHead(204).end(); return; }
  if (relative === "data/deepdive-runtime/manifest.js") {
    response.writeHead(200, { "Content-Type": "text/javascript" }).end('window.DEEPDIVE_RUNTIME={base:"data/deepdive-runtime",ids:["supervised-learning","neural-network"],revision:"navigation-fixture"};');
    return;
  }
  if (/^data\/deepdive-runtime\/(supervised-learning|neural-network)\.js$/.test(relative)) {
    const id = path.basename(relative, ".js");
    response.writeHead(200, { "Content-Type": "text/javascript" }).end(`window.DEEPDIVE=window.DEEPDIVE||{};window.DEEPDIVE[${JSON.stringify(id)}]={title:"Navigation fixture",html:"<p>Navigation fixture</p>"};`);
    return;
  }
  const allowed = relative === "index.html" || relative.startsWith("assets/") || relative === "data/graph.js"
    || relative.startsWith("data/locales/") || relative === "data/content-locales/en/graph.js";
  const file = path.resolve(PROJECT_ROOT, relative);
  if (!allowed || !file.startsWith(PROJECT_ROOT + path.sep)) { response.writeHead(404).end(); return; }
  fs.readFile(file, (error, body) => {
    if (error) { response.writeHead(404).end(); return; }
    response.writeHead(200, { "Content-Type": file.endsWith(".js") ? "text/javascript" : file.endsWith(".css") ? "text/css" : "text/html", "Cache-Control": "no-store" }).end(body);
  });
}

async function exercise(browser, base, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await context.addInitScript(() => localStorage.setItem("ai-knowledge-map.locale.v1", "zh-Hans"));
  const hash = expected => page.waitForFunction(value => location.hash === value, expected);
  const selected = id => page.waitForFunction(value => window.__cy?.nodes(".sel").map(node => node.id()).join() === value, id);
  try {
    await page.goto(`${base}?lang=en#/map/supervised-learning`);
    await page.locator('#onboarding [data-skip]').click();
    await selected("supervised-learning");
    await page.waitForFunction(() => document.documentElement.lang === "en");
    assert.match(await page.title(), /Supervised/);
    await page.reload();
    await selected("supervised-learning");

    // Manual choice overrides the query too, so reloading preserves the choice.
    await page.locator("#btn-settings").click();
    await page.locator("#settings-language-select").selectOption("zh-Hans");
    await page.waitForFunction(() => new URL(location.href).searchParams.get("lang") === "zh-Hans");
    await page.reload();
    await selected("supervised-learning");
    assert.equal(await page.locator("html").getAttribute("lang"), "zh-Hans");

    await page.locator("#search").fill("神经网络");
    await page.locator('#search-results [data-id="neural-network"]').click();
    await hash("#/map/neural-network");
    await selected("neural-network");
    await page.locator('[data-dd="neural-network"]').click();
    await hash("#/concept/neural-network");
    await page.locator("#deepdive h1").filter({ hasText: "Navigation fixture" }).waitFor();
    await page.goBack();
    await hash("#/map/neural-network");
    await selected("neural-network");
    await page.goForward();
    await hash("#/concept/neural-network");
    await page.locator("#dd-back").click();
    await hash("#/map/neural-network");
    await selected("neural-network");
    await page.evaluate(() => window.__cy.emit("tap"));
    await hash("");
    await selected("");

    await page.goto(`${base}#/map/not-a-real-node`);
    await hash("");
    await page.waitForFunction(() => Boolean(window.__cy));
    await selected("");
    // Preserve existing ordinary exploration semantics.
    await page.locator("#search").fill("神经网络");
    await page.locator('#search-results [data-id="neural-network"]').click();
    await selected("neural-network");
    assert.equal(new URL(page.url()).hash, "");
    await page.goto(`${base}#/map/supervised-learning`);
    await selected("supervised-learning");
    await page.locator("#btn-reset").click();
    await hash("");
    await selected("");
    // Local layout changes coordinates only and restores the exact map after closing.
    await page.goto(`${base}?lang=en#/map`);
    await hash("");
    await page.waitForFunction(() => Boolean(window.__cy));
    assert.equal(page.url(), `${base}?lang=en`, 'legacy homepage retains language and deployment path');
    await page.reload();
    await page.waitForFunction(() => Boolean(window.__cy));
    assert.equal(page.url(), `${base}?lang=en`);
    await page.evaluate(() => { location.hash = '/map/supervised-learning'; });
    await selected('supervised-learning');
    await page.locator('[data-mode="graph"]').click();
    await hash('');
    await selected('');
    assert.equal(page.url(), `${base}?lang=en`, 'map navigation leaves no trailing hash');
    await page.goBack();
    await hash('#/map/supervised-learning');
    await selected('supervised-learning');
    await page.goForward();
    await hash('');
    await selected('');
    assert.deepEqual(errors, []);
    if (process.env.ROUTING_ONLY === '1') return;
    await page.goto(`${base}?lang=zh-Hans`);
    await page.waitForFunction(() => Boolean(window.__cy));
    const originalPositions = await page.evaluate(() => Object.fromEntries(window.__cy.nodes().map(n => [n.id(), {...n.position()}])));
    const originalEdges = await page.evaluate(() => window.__cy.edges().map(e => e.data()));
    await page.locator('#search').fill('监督学习');
    await page.locator('#search-results [data-id="supervised-learning"]').click();
    await selected('supervised-learning');
    await page.waitForFunction(() => {
      const cy = window.__cy, root = cy.getElementById('supervised-learning').position();
      const peer = cy.getElementById('self-supervised-learning').position();
      return Math.abs(peer.x - root.x - 356) < 1 && Math.abs(peer.y - root.y + 120) < 1;
    });
    assert.deepEqual(await page.evaluate(() => window.__cy.edges().map(e => e.data())), originalEdges);
    const shots = path.join(PROJECT_ROOT, '.tmp', 'local-layout-qa');
    await page.waitForFunction(() => {
      const cy = window.__cy;
      return cy.edges('.sl-peripheral-edge').length === 3
        && cy.edges('.sl-peripheral-edge').every(e => Number(e.style('opacity')) === 0)
        && cy.edges('.hl').not('.sl-peripheral-edge').every(e => e.source().id() === 'supervised-learning' || e.target().id() === 'supervised-learning' || (e.source().hasClass('sl-peer') && e.target().hasClass('sl-peer')));
    });
    assert.equal(await page.evaluate(() => {
      const cy = window.__cy, root = cy.getElementById('supervised-learning');
      return cy.nodes('.sl-peer').every(n => n.width() === root.width())
        && cy.nodes('.sl-support').every(n => n.width() < root.width() && n.position('x') < root.position('x'))
        && cy.nodes('.sl-output').every(n => n.width() < root.width() && n.position('x') > root.position('x'))
        && cy.edges('.sl-peer-edge').every(e => e.style('target-arrow-shape') === 'none')
        && cy.edges('.sl-output-edge').every(e => e.style('source-arrow-shape') === 'triangle')
        && cy.edges('.sl-risk-edge').every(e => e.style('target-arrow-shape') === 'triangle');
    }), true);
    await page.waitForFunction(() => {
      const dim = window.__cy.elements('.dim');
      return dim.length > 0 && dim.every(e => Number(e.style('opacity')) === 0 && e.style('events') === 'no');
    });
    fs.mkdirSync(shots, {recursive: true});
    await page.screenshot({path: path.join(shots, `supervised-${viewport.width}.png`)});
    await page.locator('#search').fill('神经网络');
    await page.locator('#search-results [data-id="neural-network"]').click();
    await selected('neural-network');
    assert.equal(await page.locator('#detail-body .d-title').textContent(), '神经网络');
    assert.equal(await page.evaluate(() => window.__cy.nodes('.sl-main').first().id()), 'neural-network');
    assert.deepEqual(await page.evaluate(() => window.__cy.nodes('.sl-support').map(n => n.id()).sort()), ['batch-norm', 'gradient-descent']);
    assert.equal(await page.evaluate(() => window.__cy.edges('.sl-peripheral-edge').length), 5);
    await page.waitForFunction(() => {
      const cy = window.__cy, root = cy.getElementById('neural-network').position();
      const peer = cy.getElementById('transformer').position();
      return Math.abs(peer.x - root.x - 713.6) < 1 && Math.abs(peer.y - root.y + 84.8) < 1;
    });
    assert.deepEqual(await page.evaluate(() => window.__cy.edges().map(e => e.data())), originalEdges);
    await page.screenshot({path: path.join(shots, `neural-${viewport.width}.png`)});
    await page.locator('#search').fill('注意力机制');
    await page.locator('#search-results [data-id="attention"]').click();
    await selected('attention');
    await page.waitForFunction(() => {
      const cy = window.__cy, root = cy.getElementById('attention').position();
      const output = cy.getElementById('transformer').position();
      return Math.abs(output.x - root.x - 453) < 1 && Math.abs(output.y - root.y + 171) < 1;
    });
    assert.deepEqual(await page.evaluate(() => window.__cy.nodes('.sl-support').map(n => n.id()).sort()), ['inference-optimization', 'positional-encoding']);
    assert.equal(await page.evaluate(() => window.__cy.edges('.hl').not('.sl-peripheral-edge').length), 10);
    assert.equal(await page.evaluate(() => window.__cy.edges('.hl').not('.sl-peripheral-edge').every(e => e.source().id() === 'attention' || e.target().id() === 'attention')), true);
    assert.equal(await page.evaluate(() => window.__cy.edges('.sl-output-edge').every(e => e.style(e.source().id() === 'attention' ? 'target-arrow-shape' : 'source-arrow-shape') === 'triangle')), true);
    assert.equal(await page.evaluate(() => window.__cy.edges('.sl-risk-edge').every(e => e.style('source-arrow-shape') === 'triangle' && e.style('target-arrow-shape') === 'none')), true);
    assert.deepEqual(await page.evaluate(() => window.__cy.edges().map(e => e.data())), originalEdges);
    await page.screenshot({path: path.join(shots, `attention-${viewport.width}.png`)});
    await page.locator('#search').fill('大语言模型');
    await page.locator('#search-results [data-id="llm"]').click();
    await selected('llm');
    await page.waitForFunction(() => {
      const cy = window.__cy, root = cy.getElementById('llm').position(), tip = cy.getElementById('agent').position();
      return Math.abs(tip.x - root.x - 837) < 1 && Math.abs(tip.y - root.y + 18) < 1;
    });
    assert.equal(await page.evaluate(() => window.__cy.nodes('.sl-support').length), 9);
    assert.equal(await page.evaluate(() => window.__cy.nodes('.sl-peer').length), 0);
    assert.equal(await page.evaluate(() => window.__cy.edges('.hl').not('.sl-peripheral-edge').length), 20);
    assert.equal(await page.evaluate(() => window.__cy.edges('.hl').not('.sl-peripheral-edge').every(e => e.source().id() === 'llm' || e.target().id() === 'llm')), true);
    assert.equal(await page.evaluate(() => window.__cy.edges('.sl-output-edge').every(e => e.style(e.source().id() === 'llm' ? 'target-arrow-shape' : 'source-arrow-shape') === 'triangle')), true);
    assert.equal(await page.evaluate(() => window.__cy.edges('.sl-risk-edge').every(e => e.style('target-arrow-shape') === 'triangle' && e.target().id() === 'llm')), true);
    assert.deepEqual(await page.evaluate(() => window.__cy.edges().map(e => e.data())), originalEdges);
    await page.screenshot({path: path.join(shots, `llm-${viewport.width}.png`)});
    await page.locator('#search').fill('上下文窗口');
    await page.locator('#search-results [data-id="context-window"]').click();
    await selected('context-window');
    await page.waitForFunction(() => {
      const cy = window.__cy, root = cy.getElementById('context-window').position(), tip = cy.getElementById('agent-memory').position();
      return Math.abs(tip.x - root.x - 800) < 1 && Math.abs(tip.y - root.y) < 1;
    });
    assert.equal(await page.evaluate(() => window.__cy.nodes('.sl-support').length), 6);
    assert.equal(await page.evaluate(() => window.__cy.edges('.hl').not('.sl-peripheral-edge').length), 17);
    assert.equal(await page.evaluate(() => window.__cy.edges('.hl').not('.sl-peripheral-edge').every(e => e.source().id() === 'context-window' || e.target().id() === 'context-window')), true);
    assert.equal(await page.evaluate(() => window.__cy.edges('.sl-output-edge').every(e => e.style(e.source().id() === 'context-window' ? 'target-arrow-shape' : 'source-arrow-shape') === 'triangle')), true);
    assert.equal(await page.evaluate(() => window.__cy.edges('.sl-risk-edge').every(e => e.style('target-arrow-shape') === 'triangle' && e.target().id() === 'context-window')), true);
    assert.deepEqual(await page.evaluate(() => window.__cy.edges().map(e => e.data())), originalEdges);
    await page.screenshot({path: path.join(shots, `context-${viewport.width}.png`)});
    await page.waitForFunction(() => {
      const cy = window.__cy, root = cy.getElementById('context-window').position(), risk = cy.getElementById('attention').position();
      return Math.abs(risk.x - root.x) < 0.1 && Math.abs(risk.y - root.y - 210) < 0.1;
    });
    await page.locator('#search').fill('多模态');
    await page.locator('#search-results [data-id="multimodal"]').click();
    await selected('multimodal');
    await page.waitForFunction(() => {
      const cy = window.__cy, root = cy.getElementById('multimodal').position(), tip = cy.getElementById('agent').position();
      return Math.abs(tip.x - root.x - 750) < 1 && Math.abs(tip.y - root.y) < 1;
    });
    assert.equal(await page.evaluate(() => window.__cy.nodes('.sl-support').length), 5);
    assert.equal(await page.evaluate(() => window.__cy.nodes('.sl-risk').length), 0);
    assert.equal(await page.evaluate(() => window.__cy.edges('.hl').not('.sl-peripheral-edge').length), 9);
    assert.equal(await page.evaluate(() => window.__cy.edges('.hl').not('.sl-peripheral-edge').every(e => e.source().id() === 'multimodal' || e.target().id() === 'multimodal')), true);
    assert.equal(await page.evaluate(() => window.__cy.edges('.sl-output-edge').every(e => e.style(e.source().id() === 'multimodal' ? 'target-arrow-shape' : 'source-arrow-shape') === 'triangle')), true);
    assert.deepEqual(await page.evaluate(() => window.__cy.edges().map(e => e.data())), originalEdges);
    await page.screenshot({path: path.join(shots, `multimodal-${viewport.width}.png`)});
    for (const [id, query, count] of [['information-theory', '信息论', 5], ['loss-function', '损失函数', 8], ['gradient-descent', '梯度下降', 6], ['unsupervised-learning', '无监督学习', 6], ['reinforcement-learning', '强化学习', 5], ['overfitting', '过拟合', 6], ['regularization', '正则化', 6], ['dimensionality-reduction', '降维', 3], ['curse-of-dimensionality', '维度灾难', 6], ['decision-tree', '决策树', 4], ['clustering', '聚类', 3], ['kernel-methods', '核方法', 6], ['backprop', '反向传播', 5], ['vanishing-gradient', '梯度消失', 7], ['batch-norm', '批归一化', 7], ['optimizer-schedule', '优化器', 6], ['residual-connection', '残差连接', 5], ['cnn', '卷积神经网络', 3], ['rnn', '循环神经网络', 6], ['tokenization', 'Token', 2], ['embedding', '嵌入', 12], ['positional-encoding', '位置编码', 4], ['normalization', '层归一化', 4], ['transformer', 'Transformer', 17], ['state-space-models', '状态空间', 6], ['self-supervised-learning', '自监督学习', 7], ['contrastive-learning', '对比学习', 4], ['clip', 'CLIP', 4], ['pretraining', '预训练', 13], ['post-training', '后训练', 6], ['fine-tuning', '微调', 17], ['peft-lora', 'LoRA', 4], ['distillation', '蒸馏', 4], ['distributed-training', '分布式训练', 4], ['synthetic-data', '合成数据', 7], ['quantization', '量化', 5], ['moe', 'MoE', 3], ['model-merging', '模型合并', 3], ['scaling-law', '缩放定律', 11], ['model-families', '模型家族', 4], ['lost-in-middle', '中间迷失', 8], ['in-context-learning', '上下文学习', 5], ['sampling-params', '采样', 6], ['logprobs', 'Logprobs', 5], ['prompt-engineering', '提示工程', 11], ['system-prompt', '系统提示', 5], ['context-engineering', '上下文工程', 8], ['constrained-decoding', '约束解码', 3], ['structured-output', '结构化输出', 7], ['streaming', '流式输出', 3], ['prefilling', '响应预填充', 4], ['prompt-caching', '提示缓存', 7], ['context-compaction', '上下文压缩', 5], ['inference-optimization', '推理优化', 5], ['model-selection', '模型选型', 8], ['model-routing', '模型路由', 6], ['rag', 'RAG', 19], ['retrieval', '检索与语义搜索', 10], ['vector-db', '向量数据库', 4], ['chunking', '文档切分', 4], ['reranking', '重排', 5], ['advanced-rag', '高级 RAG', 4], ['knowledge-graph', '知识图谱', 3], ['citations', '引用与溯源', 3], ['evaluation', '应用评测', 13], ['model-evaluation', '模型评测', 7], ['observability', '可观测性', 4], ['deployment', '部署形态', 9], ['data-drift-monitoring', '数据漂移', 4]].filter(([id]) => !process.env.LOCAL_LAYOUT_QA_IDS || process.env.LOCAL_LAYOUT_QA_IDS.split(',').includes(id))) {
      await page.locator('#search').fill(query);
      await page.locator(`#search-results [data-id="${id}"]`).click();
      await selected(id);
      await page.waitForTimeout(1200);
      assert.equal(await page.evaluate(() => window.__cy.edges('.hl').not('.sl-peripheral-edge').length), count);
      assert.equal(await page.evaluate(id => window.__cy.edges('.hl').not('.sl-peripheral-edge').every(e => e.source().id() === id || e.target().id() === id || (e.source().hasClass('sl-peer') && e.target().hasClass('sl-peer'))), id), true);
      assert.equal(await page.evaluate(() => window.__cy.edges('.sl-risk-edge').every(e => e.style(e.source().hasClass('sl-main') ? 'source-arrow-shape' : 'target-arrow-shape') === 'triangle')), true);
      assert.deepEqual(await page.evaluate(() => window.__cy.edges().map(e => e.data())), originalEdges);
      await page.screenshot({path: path.join(shots, `${id}-${viewport.width}.png`)});
    }
    for (const [id, query, count] of [['hallucination', '幻觉', 17], ['uncertainty-calibration', '不确定性校准', 5], ['privacy', '隐私与数据合规', 7], ['prompt-injection', '提示注入', 10], ['guardrails', '护栏', 12], ['reasoning-models', '推理模型', 12], ['cot', '思维链', 9], ['self-consistency', '自洽性', 5], ['tree-of-thoughts', '思维树', 5], ['test-time-compute', '推理时计算', 8], ['reflection', '自我反思', 5], ['planning', '规划与任务分解', 3], ['agent', 'AI Agent', 22], ['agent-loop', 'Agent 循环', 13], ['react', 'ReAct', 5], ['tool-calling', '工具调用', 13], ['code-execution', '代码执行与沙箱', 7], ['mcp-architecture', 'MCP 架构', 3], ['mcp', 'MCP 模型上下文协议', 3], ['agent-frameworks', 'Agent 框架', 1], ['agent-memory', 'Agent 记忆', 6], ['agent-skills', '智能体技能', 4], ['workflow-orchestration', '工作流编排', 5], ['multi-agent', '多 Agent 编排', 5], ['human-in-the-loop', '人在回路', 5], ['computer-use', '计算机操作', 4], ['code-generation', '代码生成 / AI 编程', 6], ['coding-tools', 'AI 编程工具', 3], ['agent-identity-access', 'Agent 身份、权限与密钥管理', 6], ['diffusion', '扩散模型', 9], ['vae', '变分自编码器 VAE', 4], ['gan', '生成对抗网络 GAN', 5], ['flow-matching', 'Flow Matching / Rectified Flow', 4], ['image-generation', '图像生成', 10], ['controllable-generation', '可控生成', 4], ['image-editing', '图像编辑', 2], ['super-resolution', '超分辨率与修复', 2], ['video-generation', '视频生成', 4], ['speech', '语音识别与合成', 5], ['voice-cloning', '声音克隆', 5], ['audio-generation', '音频与音乐生成', 2], ['world-models', '世界模型与 3D 生成', 3], ['content-detection', 'AIGC 检测与水印', 5], ['alignment', '对齐 Alignment', 12], ['interpretability', '可解释性', 6], ['jailbreak', '越狱 Jailbreak', 9], ['red-teaming', '红队测试', 6], ['data-poisoning', '数据投毒', 5], ['adversarial-robustness', '对抗样本与鲁棒性', 3], ['bias-fairness', '偏见与公平性', 4], ['reward-hacking', '奖励黑客', 8], ['rlhf', 'RLHF 与偏好对齐', 8], ['constitutional-ai', '宪法 AI', 4], ['training-data-governance', '训练数据治理', 6], ['governance', 'AI 治理与法规', 5]].filter(([id]) => !process.env.LOCAL_LAYOUT_QA_IDS || process.env.LOCAL_LAYOUT_QA_IDS.split(',').includes(id))) {
      await page.locator('#search').fill(query);
      await page.locator(`#search-results [data-id="${id}"]`).click();
      await selected(id);
      await page.waitForTimeout(1200);
      assert.equal(await page.evaluate(() => window.__cy.edges('.hl').not('.sl-peripheral-edge').length), count);
      assert.equal(await page.evaluate(id => window.__cy.edges('.hl').not('.sl-peripheral-edge').every(e => e.source().id() === id || e.target().id() === id || (e.source().hasClass('sl-peer') && e.target().hasClass('sl-peer'))), id), true);
      assert.equal(await page.evaluate(() => window.__cy.edges('.sl-risk-edge').every(e => e.style(e.source().hasClass('sl-main') ? 'source-arrow-shape' : 'target-arrow-shape') === 'triangle')), true);
      assert.deepEqual(await page.evaluate(() => window.__cy.edges().map(e => e.data())), originalEdges);
      await page.screenshot({path: path.join(shots, `${id}-${viewport.width}.png`)});
    }
    await page.locator('#detail-close').click();
    await page.waitForFunction(saved => window.__cy.nodes().every(n => Math.abs(n.position('x') - saved[n.id()].x) < 0.1 && Math.abs(n.position('y') - saved[n.id()].y) < 0.1), originalPositions);
    await page.waitForFunction(() => !window.__cy.elements('.dim').length && window.__cy.nodes().not('.hidden').every(n => Number(n.style('opacity')) === 1));
    assert.equal(await page.evaluate(() => window.__cy.elements('.sl-main, .sl-support, .nn-relation, .attention-relation, .llm-relation, .context-relation, .multimodal-relation, .batch-relation').length), 0);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
}

async function main() {
  const { chromium } = playwright();
  const executablePath = [process.env.DEEP_DIVE_BROWSER_PATH, chromium.executablePath(), "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe"].find(file => file && fs.existsSync(file));
  const server = http.createServer(respond);
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  let browser;
  try {
    browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
    const origin = `http://127.0.0.1:${server.address().port}`;
    await exercise(browser, `${origin}/`, { width: 1440, height: 900 });
    await exercise(browser, `${origin}/AI-knowledge-map/`, { width: 390, height: 844 });
    console.log("PASS: map deep links, language overrides, reload, history, return, reset and invalid IDs (desktop root + mobile project subpath; synthetic content only).");
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
