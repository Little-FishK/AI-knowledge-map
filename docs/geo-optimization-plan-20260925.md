# GEO 优化方案 · 2026-09-25

配套评估见 `docs/geo-assessment-20260925.md`。本文给出**可执行的完整优化清单**。

> **执行记录（2026-09-25，P0 已实施）**：实施结果见 `docs/seo/2026-09-25-GEO-P0.md`。三处与本文原计划不同，原因在执行中发现：
> 1. **体积/字符数一律以 `tools/readiness/crawlable-text.js` 为准**。原文若干"字符"实为 `wc -c` 字节数，且逐行 `sed` 无法剥掉跨行 `<script>` 块，把 JS 源码算成了可读文本。更正后 `/library/` 是 **327 字符**（非 1,965）。阈值因此定为 **700**（实测外壳 313–350，最薄真实内容页 866）。
> 2. **未按 P0-1 第 4 条"往 `/library/` 外壳里静态注入导航"**。外壳的视图容器是 `display:none` 且会被 JS 覆盖，往里塞文本等于给爬虫看用户看不到的内容。改为**外壳声明 `crawlableVia` 附属页**，由门禁校验附属页存在且达标。详见实施记录。
> 3. **软件目录从 P1-3 提到 P0 一并实施**。因为新门禁要求每个可索引页面都有可抓取承载页，`/software/`（329 字符）不补就会让发布失败。

## 前提与约束

方案必须尊重项目既有契约，否则改了也进不了主干：

1. **不碰正文与内容审核**。所有改动都在生成器层（`tools/readiness/`），不修改 `data/deepdive/`、`data/library-*.js` 的内容，不触碰 Stage 2 内容控制器与人工批准合同。
2. **可验证优先**。项目的精神是"机制自洽 + 有门禁"。任何新增能力都要配断言，否则就是下一个"登记缺口"。
3. **不做伪技巧**。延续 PHASE8 的立场：不做隐藏提示注入、不宣称 llms.txt 提升排名、不为凑长度写模板话术。
4. **体积可控**。概念页平均 64KB、259 个 HTML 已 39MB。**全量静态化 2457 条 ≈ 150MB，禁止走这条路。**

### 关键成本对比（真实数据实测）

| 做法 | 体积 | 结论 |
|---|---|---|
| 2457 条各生成独立 HTML 页 | **≈ 150 MB** | ❌ 不可行 |
| 单一静态目录页（含 summary + 证据用途 + 使用边界） | **≈ 1.4 MB** | ✅ 可行 |
| `llms.txt` 全量索引（每条一行） | **≈ 490 KB** | ✅ 可行 |

基准参照：现有 `/search/` 页 326KB 且运行良好；**1.4MB 一次性买下 2457 条的可抓取性，是极高杠杆。**

---

## 第 0 层：先建可验证性（必须最先做）

否则改完无法判断是否生效，且会再次出现"机制自洽但覆盖不全"。

**0.1 在 `tools/readiness/verify-site-seo.js` 增加覆盖断言**

该文件已有这条（第 17 行）：`metadata must cover every HTML page`——保证"每个 HTML 页都有 metadata"。
缺的是**反向保证**：

```
新增断言：对每个在 sitemap 中声明为可索引（indexable !== false）的页面，
其 HTML 去除 <script>/<style>/标签后的可读文本量必须 ≥ 阈值（建议 2000 字符）。
否则 fail：〈该页面对不执行 JS 的爬虫是空的〉
```

这条一旦存在，资料库缺口**在第一次构建时就会失败**，不可能潜伏到现在。

**0.2 新增爬虫视角复核脚本** `tools/readiness/check-crawlable.js`
输出各页面的"干净可读文本量"表（即本次评估用的方法），供发布前人工过目。可选加入 `package.json`：

```json
"check:crawlable": "node tools/readiness/check-crawlable.js"
```

**验收**：故意把 `library/index.html` 还原成空壳，0.1 的断言必须让构建失败。

---

## P0：三项高杠杆改动

### P0-1 资料库静态目录（照搬已验证的 `/search/` 模式）

**原理**：`/search/` 之所以对爬虫友好，是因为内容在**服务端写进 HTML**，`assets/site-search.js`（仅 28 行）只负责过滤已存在的 DOM。资料库照此办理即可。

**做法**：

1. 新增 `tools/readiness/library-directory.js`，导出生成函数：
   - **一级来源分类页**：`/library/<sourceClass>/index.html` × 9 个
   - **official 类再按二级来源细分**：`/library/official/<subcategory>/`（microsoft / anthropic / openai / nvidia / meta-ai / google-deepmind）——因为 official 占 89%，单页会过大
2. 每条渲染为静态 `<li>`，字段用**已有且 100% 覆盖**的：
   `title` · `publisher` · `collection` · `contentKind` · `authorityTier` ·
   `summary` · `evidenceUse`（证据用途）· `limitations`（使用边界）· 外链 `url`
3. **关联概念内链**：`linkedNodes`（91% 覆盖）用于生成指向站内概念页的链接。
   ⚠️ **必须过滤图中不存在的节点**——数据里存在幽灵 id（`computer-vision`、`diffusion-model`、`api`、`image-segmentation`、`security`、`benchmark`），最近似的真实节点是 `computer-use` / `diffusion` / `image-generation`。用 `data/graph.js` 的节点集合作白名单过滤。
4. `/library/` 自身（保留现有交互视图）静态嵌入：九个来源类的导航 + 各类实际条数 + 指向分类页的链接。这一步让 `/library/` 从 1,965 字符提到数千字符，不必改成 `documentPage`、零风险。
5. 所有新页进 `seoPages`（`CollectionPage`，带面包屑），随之自动进 sitemap。

**体积**：约 1.4 MB 总量；按二级来源细分后单页最大约 300KB，低于现有 `/search/` 的 326KB。

**风险与规避**：
- 重复内容：分类页之间无重叠（按 `sourceClass` 严格分区），各自 canonical 指向自身。
- 与交互视图冲突：**不改 `/library/` 的外壳**，只往 HTML 里注入静态导航，JS 仍按原样接管。

**验收**：`curl /library/official/anthropic/` 的可读文本量 > 20,000 字符；sitemap 从 259 增至 270+。

---

### P0-2 发布 llms.txt / llms-full.txt

**为什么值得做**（需要说清楚定位，避免与 PHASE8 的立场冲突）：

09-19 记录的"不宣称 llms.txt 能提升排名"是**正确**的——它不是 Google 排名因素。但**"不是排名因素"不等于"没有用途"**：
- llms.txt 的用途是给 AI 系统一份**结构化内容索引**，与排名无关；
- **项目自己在采集端就是这么用的**：`tools/anthropic-official-review/build-inventory.js` 从 `platform.claude.com/llms.txt`（637 条）与 `code.claude.com/docs/llms.txt`（208 条）构建清单，google-deepmind 与 hugging-face 同理。
- 消费端证明了它的实用性，而本站有 2457 条结构化资料——**不给出去，等于让下游用最笨的方式猜**。

**做法**：
1. 生成 `/llms.txt`（< 10KB）：H1 项目名 + blockquote 一句话定位 + 九个来源类分组 + 关键页面链接（地图 / 搜索目录 / 各分类页 / 学习指南）。遵循 llmstxt.org 约定格式。
2. 生成 `/llms-full.txt`（约 490KB）：全量条目索引，每条一行 `- [标题](原始URL) — 摘要`。
3. 在 `docs/seo/` 下补一份决策记录，写明：发布 llms.txt 的**理由是不对称的采集/供给**，明确声明**不承诺排名收益**——延续项目的证据纪律。

**验收**：`curl /llms.txt` 返回 200 且格式可被机器解析（H1 + H2 分组）。

---

### P0-3 JSON-LD 深化（低风险加分项）

- 分类页：`CollectionPage` + `ItemList`（列出该类条目名称与原始 URL）。
- 资料条目：因无独立页面，暂不单独标注；若未来做头部条目独立页，再用 `CreativeWork`。

**注意**：Google 官方明确"生成式 AI 搜索无特殊 schema 要求"，所以这是锦上添花，**不应占用优先级**。

---

## P1：一致性与覆盖面补齐

| 项 | 内容 | 依据 |
|---|---|---|
| P1-1 | **sitemap 补 `<lastmod>`**（当前 259 条一个都没有） | PHASE8 计划第 23 行本要求"真实更新日期规则"。用 `reviewedAt` / `accessedAt` 等**已存在的真实日期**，不伪造构建时间 |
| P1-2 | **首页 `/` 静态补内容**（当前仅 1,980 字符） | 可静态嵌入站点定位 + 六区结构 + 核心概念列表；复用 `/search/` 已有的渲染逻辑剪裁 |
| P1-3 | **软件目录 `/software/` 静态化** | 与资料库同病（1,965 字符空壳），同法处理 |
| P1-4 | **教程内容静态化** | `data/tutorials*.js` 同类问题，需先核实现状 |
| P1-5 | **sitemap 分片**（sitemap index） | 仅在页面数过千后需要；当前 270 条不必 |

---

## P2：长期项

| 项 | 内容 | 说明 |
|---|---|---|
| P2-1 | **8 个英文概念页对齐**（122/130） | curse-of-dimensionality、dimensionality-reduction、distillation、context-window、self-consistency、red-teaming、controllable-generation、reward-hacking 线上均 404。**先确认意图**：是有意撤下还是部署丢失，不要擅自恢复 |
| P2-2 | **执行任务 54 的 7 项可引用标准** | 标准已建立但"逐章节实质检查待执行"。这是 GEO 的内容侧根基，比技术手段更长效 |
| P2-3 | **OG / Twitter 卡片补全** | PHASE8 基线已记录"未配置完整 Open Graph"，影响链接在社交与 AI 界面中的呈现 |
| P2-4 | **资料的可发现性分语言处理** | 资料原文多为英文（publisher/collection 是英文，title 中英混合），而页面语言是 `zh-Hans`。需确认搜索引擎能否用英文查询命中 |

---

## 明确不推荐

| 不做 | 原因 |
|---|---|
| 为 2457 条各生成独立 HTML 页 | 约 150MB，拖垮构建与仓库，收益远低于单一目录页 |
| 隐藏提示注入、"喂给 AI 的指令" | PHASE8 已明确拒绝，且违反平台规范，风险高于收益 |
| 宣称或期待 llms.txt 提升排名 | 它不是排名因素。发布它的理由是结构化索引，不是排名 |
| 为凑摘要长度写模板话术 | PHASE8 已明确拒绝（"不为凑长度批量加入模板话术"） |
| 为 SEO 直接改写正文 | 违反 Stage 2 内容控制器约。正文修改必须走控制器 + 人工批准 |
| 反复重提未变化的 sitemap | PHASE8 已指出"不要反复提交未变化的 Sitemap" |

---

## 实施顺序

```
第 0 层（可验证性）
   └─ 0.1 verify-site-seo.js 加覆盖断言  ← 先做，否则无法验收
   └─ 0.2 check-crawlable.js 复核脚本
        ↓
P0-1 资料库静态分类目录（含内链幽灵节点过滤）
P0-2 llms.txt / llms-full.txt
        ↓
P0-3 JSON-LD 深化（加分项，可延后）
        ↓
P1-1 lastmod → P1-3 软件目录 → P1-2 首页 → P1-4 教程
        ↓
P2（需维护者先决策：8 个英文页的意图）
```

**每项的通用验收方式**：
1. `npm run test:website` 通过；
2. `verify-site-seo.js` 的新断言生效；
3. 用 `curl` 实测目标页面的可读文本量，与本文表格预期一致；
4. `sitemap.xml` 条目数正确增长。

---

## 预期终态

| 指标 | 现状 | 目标 |
|---|---|---|
| `/library/` 爬虫可读文本 | 1,965 字符 | ≥ 5,000 字符（导航 + 分类索引） |
| `/library/<class>/` 爬虫可读文本 | 不存在 | ≥ 20,000 字符 |
| sitemap 条目 | 259 | 270+ |
| 资料库覆盖率 | **0 / 2457** | **2457 / 2457** |
| llms.txt | 404 | 200，约 490KB 全量索引 |
| 覆盖缺口门禁 | 无 | 构建时即失败 |

**最省成本的路径是前两项 P0：一次生成器改动，约 1.9MB 产物，换回 2457 条资料的全部可抓取性。**
