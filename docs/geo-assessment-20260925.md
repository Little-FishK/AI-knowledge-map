# GEO 现状评估 · 2026-09-25

评估对象：AI 知识地图（https://ai-knowledge-map.com/）的生成式引擎优化（GEO / Generative Engine Optimization）现状。
评估方式：读 PHASE8 计划与实施记录 + 实测线上抓取行为 + 读构建脚本。所有数字均为公开 HTTP 实测，可复现命令附在文末。

**一句话结论：GEO 本身做得相当扎实，但它的覆盖面停在概念页——资料库（2457 条）与软件目录对 AI 爬虫是隐形的。这不是执行滑坡，是范围从未扩展。**

---

## 1. GEO 基线：PHASE8 做了什么

时间线：`2026-09-09` 计划（`docs/archive/PHASE8_SEO_GEO_PLAN.md`）→ `2026-09-19` 实施并部署（`docs/seo/2026-09-19-SEO-GEO.md`）。

**做对的地方（质量明显高于同类个人项目）：**

- robots.txt 区分**搜索发现**与**模型训练**两条独立策略：`OAI-SearchBot` / `GPTBot` 分别声明，并指向 Sitemap。
- 260 篇文章（130 中 + 130 英）有自引用 canonical、双向 hreflang、`LearningResource` JSON-LD、可见面包屑。
- `/zh/`、`/en/` 学习指南是**真实链接**，"无需 JavaScript 即呈现完整目录"。
- IndexNow 提交、Google/Bing sitemap 重新提交，均有回执记录。
- **对伪技巧的明确拒绝**（原文）："没有把训练抓取授权扩大为 SEO 必要条件，没有添加对模型发号施令的隐藏提示或宣称 llms.txt 能提升排名。"
- **对证据边界的克制**（原文）："这些请求来自本机，不代表真实爬虫网络已经访问或引用"、"发现 138 页不等于收录 138 页"。
- 任务 54 建立了《可引用表达的逐页验收》7 项标准（自包含章节、范围边界、来源、时间、图表文字解释、稳定锚点、语言一致）。

这几点——尤其是拒绝 llms.txt 神话、拒绝隐藏提示注入、区分"发现"与"收录"——**说明执行者对 GEO 的真实机制有判断力，不是照着营销文章做的**。

---

## 2. 实测：爬虫看到的到底是什么

用 `curl` 直接取 HTML（不执行 JS，等同 GPTBot / ClaudeBot / PerplexityBot 的视角），剔除 `script`/`style`/标签后统计**可读字符数**：

| 路径 | HTML 字节 | 爬虫可读字符 | 判定 |
|---|---|---|---|
| `/zh/concepts/attention/` | 41,609 | 9,721 | ✅ 静态渲染 |
| `/en/concepts/attention/` | 63,853 | 32,353 | ✅ 静态渲染 |
| `/search/` | 333,986 | **72,996** | ✅✅ 全站文字目录 |
| `/zh/`（学习指南） | 39,486 | 9,205 | ✅ 静态渲染 |
| `/about/` | 10,764 | 866 | ⚠️ 偏薄但为真实内容 |
| `/`（地图首页） | 15,681 | **350** | ⚠️ 空壳（地图靠 JS） |
| **`/library/`** | 15,063 | **327** | ❌ **空壳** |
| **`/software/`** | 15,055 | **329** | ❌ **空壳** |

> **单位更正（2026-09-25 复核）**：本节初版把 `wc -c` 的**字节数**标成了"字符数"，并且用逐行 `sed` 剥 `<script>` 时无法匹配跨行脚本块，导致把 JS 源码计入了"可读文本"。上表已用 `tools/readiness/crawlable-text.js`（本轮的正式度量模块，门禁与复核脚本共用）重测。**结论方向不变、且更严重**：`/library/` 不是 1,965 字符的导航，而是 **327 字符**——连导航文案都算不上有实质内容。

`/library/` 的 327 字符就是导航栏和标题。**2457 条资料的内容、来源、摘要、使用边界——一条都看不到。**

进一步验证：

- `/library/` 页面文本中，"VALL-E" 0 次、"2457" 0 次，只有导航标签"专业资料库"出现 6 次。
- `/library/?item=vall-e-paper` 返回**完全相同**的 15,063 字节——查询参数不影响服务端输出，内容 100% 靠 JS。
- 页面只静态引入 4 个 `data/` 文件；资料库数据共 **2.8MB / 50 个 JS 文件**，需要 `library-view.js` 动态加载后才渲染。

**对 SEO 的影响有限**（Google 会做二阶段 JS 渲染），**对 GEO 是致命的**——GPTBot、ClaudeBot、PerplexityBot、OAI-SearchBot 基本不执行 JS。这意味着资料库的全部内容不在任何生成式引擎的语料里。

---

## 3. 根因：构建层只为一个模块做了静态渲染

`tools/readiness/site-artifact.js` 里的差异是全部的答案：

```js
// 第 99-100 行：资料库 / 软件目录 —— 只是套了同一个空壳
put('library/index.html', viewShell(home));
put('software/index.html', viewShell(home));

// 第 105 行：概念页 —— 逐个渲染成真实 HTML 文件
put(route(entry.id, entry.locale) + 'index.html', renderConcept(entry, entries, siteUrl, preview));
```

- **概念页**：构建时把正文渲染进 HTML → 有独立 URL、canonical、breadcrumb、JSON-LD → 进 sitemap。
- **资料库 / 软件目录**：只在 sitemap 里放了 1 条**列表页**（第 144-145 行给了 `CollectionPage` 元数据，描述写得很用心），**没有为任何单条生成页面**。

**计划层的证据更直接**：`PHASE8_SEO_GEO_PLAN.md` 全文 50 行，搜 `library` / `资料库` / `software` / `软件` —— **零命中**。

计划里确实留了一句"第二阶段完成后，新增学习入口……语义与搜索元数据联合复验"，但同文件第 5 行明确界定该"第二阶段"指"网站学习入口、阅读层次与地图关系解释的产品阶段"——**不含资料库**。所以这不是"打算以后做但忘了"，而是**资料库从未进入过 GEO 的范围**。

补充旁证：`docs/ORIGINAL_84_TASKS.md` 里第 49/50/53/56 条（Sitemap、爬虫区分、IndexNow、GEO 样本）状态均为"**本轮暂停扩展；历史局部成果待归并**"。

---

## 4. 覆盖率的真实数字

线上 `sitemap.xml` 共 **259 条**：

| 类型 | 条数 |
|---|---|
| `/zh/concepts/*` | 130 |
| `/en/concepts/*` | 122 |
| 列表页与入口（`/`、`/search/`、`/zh/`、`/en/`、`/library/`、`/software/`、`/about/`） | 7 |

**被结构化对外的内容：252 个概念页 + 1 个 `/search/` 目录。资料库 2457 条、软件目录全部条目：0 条。**

即：站点最有差异化价值的资产（2457 条带来源、使用边界、审核状态的资料）**在生成式引擎面前不存在**。

---

## 5. 附带发现

**5.1 llms.txt 的存在一个反讽**

- 本站 `llms.txt` → **HTTP 404**（`docs/` 里没有做或不做的决策记录）。
- 但项目**采集端高度依赖上游的 llms.txt**：`tools/anthropic-official-review/build-inventory.js` 从 `platform.claude.com/llms.txt`（637 条）与 `code.claude.com/docs/llms.txt`（208 条）构建清单；google-deepmind 用 `ai.google.dev/gemini-api/docs/llms.txt`；hugging-face 用 transformers / tokenizers / datasets 三个 llms.txt。

项目在**消费端**证明了 llms.txt 的实用性，却在**生产端**没有发布——而它自己恰好有 2457 条结构化资料要对外。

需要说明：2026-09-19 那句"没有宣称 llms.txt 能提升排名"是**正确**的（llms.txt 不是 Google 排名因素，Google 官方也明说无特殊 schema 要求）。但"它不是排名因素"与"它没有用途"是两件事——**对 2457 条资料而言，llms.txt 恰是成本最低的补法**：纯文本、不需要生成 2457 个 HTML 页面。

**5.2 8 个英文概念页线上 404**

PHASE8 记录曾提到本地产物缺少 8 个英文页（curse-of-dimensionality、dimensionality-reduction、distillation、context-window、self-consistency、red-teaming、controllable-generation、reward-hacking），当时"没有用该产物覆盖线上"。实测现状：**这 8 个全部 HTTP 404**，且不在 sitemap 中。英文概念页由此为 122/130，而非文档记载的 130/130。

（不能据此断定原因，可能是有意的撤下或翻译未过验证；但**文档数字与线上实况已不一致**，需要维护者确认。）

**5.3 sitemap 缺 lastmod**

259 条 URL 中无一个 `<lastmod>`。PHASE8 计划第 23 行本要求"真实更新日期规则"，未落地。

---

## 6. 修复方案（按性价比排序）

不能照搬概念页做法——259 个 HTML 已是 39MB，概念页平均 64KB；2457 条资料按此静态化约 **150MB**，会显著拖慢构建并撑大仓库。

| 优先级 | 措施 | 成本 | 收益 |
|---|---|---|---|
| **P0** | 照搬 `/search/` 模式：为资料库生成**一个静态文字目录页**（2457 条的标题 + 来源 + 摘要 + 链接），复用已验证的 `site-search.js` 思路 | 低（1 个页面，约 2MB） | 2457 条内容一次性进入爬虫视野 |
| **P0** | 发布 `llms.txt` / `llms-full.txt`，用**项目自己采集端相同的格式**输出资料库索引 | 极低（纯文本生成） | 覆盖所有 AI 引擎，成本最低 |
| **P1** | 列表页 JSON-LD 从 `CollectionPage` 升级为带 `ItemList`/`Dataset` 结构 | 低 | 机器可解析的条目清单 |
| **P2** | 英文概念页补回或从 sitemap 明确对齐（122 vs 130） | 中 | 消除文档与线上不一致 |
| **P3** | 为头部 N 条资料生成独立静态页（按访问价值挑选，而非全量） | 中 | 长尾抓取 |
| **P2** | sitemap 补 `lastmod` | 低 | 抓取调度效率 |

**根因修复**：把"静态渲染哪些页面"从散落在 `site-artifact.js` 的多个 `put(...)` 调用，提升为一条**可校验的清单**，并加断言——"凡在 sitemap 声明为可索引的内容类型，必须有静态 HTML 承载"。当前 `tests/tooling/website-artifact.test.js` 覆盖构建与防篡改，但**不检查"内容类型是否被静态渲染"**，所以这个缺口无门禁拦截（与资料库登记缺口是同一种病：机制自洽，但覆盖不全）。

---

## 7. 评分

| 维度 | 分 | 依据 |
|---|---|---|
| GEO 基础机制 | 9.0 | robots 搜索/训练分离、canonical、双向 hreflang、JSON-LD、IndexNow、站长平台接入 |
| 方法论诚实度 | 9.5 | 拒绝 llms.txt 神话与隐藏提示；区分"发现/收录/引用"；标注证据边界 |
| 技术判断力 | 9.0 | 识别 JS 渲染对爬虫的影响，为概念页做静态渲染并把目录做成无 JS 可用 |
| **覆盖完整性** | **3.0** | **2457 条资料 + 软件目录零覆盖，且从未进入计划** |
| 可引用表达标准 | 8.0（待执行） | 7 项标准已建立，但"逐章节实质检查待执行" |
| 线上一致性 | 5.0 | sitemap 259 vs 文档 265；8 个英文页 404；无 lastmod |

**综合约 6.5。**

需要说清楚：**这不是"GEO 做得差"，而是"GEO 做得很好的那部分，恰好避开了站点的核心资产"。** 概念页的 GEO 是可以拿去当范例的水准；问题在于资料库——这个项目最独特、最难被替代、也最需要被 AI 引用的部分——在生成式引擎眼中是空白的。

而且修复成本极低：**两个 P0 项（静态目录页 + llms.txt）都属生成器改动，不需要碰内容与审核流程**，不违反项目的 Stage 2 内容控制器约。

---

## 复现命令

```bash
# 爬虫视角：比较各页面的可读文本量
for p in / /zh/concepts/attention/ /search/ /library/ /software/; do
  printf "%-28s" "$p"
  curl -s "https://ai-knowledge-map.com$p" \
    | sed 's/<script[^>]*>.*<\/script>//g; s/<[^>]*>//g' | tr -s ' \n' ' ' | wc -c
done

# sitemap 覆盖构成
curl -s https://ai-knowledge-map.com/sitemap.xml | grep -o "<loc>[^<]*</loc>" | wc -l
curl -s https://ai-knowledge-map.com/sitemap.xml | grep -c "library"

# 资料库是否依赖 JS
curl -s "https://ai-knowledge-map.com/library/?item=vall-e-paper" | wc -c   # 与 /library/ 同尺寸
```

构建层证据：`tools/readiness/site-artifact.js` 第 99-100 行（空壳）vs 第 105 行（静态渲染）。
计划层证据：`docs/archive/PHASE8_SEO_GEO_PLAN.md` 全文搜 `library`/`资料库` → 零命中。
