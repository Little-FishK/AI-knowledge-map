# AI 知识地图 · 「理解原理」深读页标准

> 详情页只给一段概览；**深读页**要让读者<b>彻底</b>弄懂一个概念——为什么必要、怎么运作、根本原理、相关数学。质量对标 [Google ML Crash Course](https://developers.google.com/machine-learning)。首个样板：神经网络（`data/deepdive/neural-network.js`）。

## 一、机制（怎么接进地图）

- 每个概念一个文件：`data/deepdive/<node-id>.js`，内容注册到全局：
  ```js
  window.DEEPDIVE = window.DEEPDIVE || {};
  window.DEEPDIVE["<node-id>"] = { title, subtitle, aliases, meta, thesis, html };
  ```
- 在 `index.html` 的 `data/software.js` 之后、`app.js` 之前，为该文件加一行 `<script src="data/deepdive/<node-id>.js"></script>`。
- 详情页（`app.js` 的 `openDetail`）检测到 `window.DEEPDIVE[id]` 存在，就在**大区标签右侧**渲染「📖 理解原理」按钮；点击调用 `openDeepDive(id)`，打开 `#deepdive` 全屏阅读视图（返回/关闭/Esc 均回到详情）。
- 用 `window.DEEPDIVE` 而非 fetch，同样是为了 `file://` 双击可用。

## 二、写作规约（源于对 Codex 初稿 5 个错误的复盘）

Codex 写第一版时自述犯了 5 个错，这 5 条正是本标准的由来——**写每一页都要主动防这 5 个坑**：

1. **不以「知识点覆盖率」为目标。** 「出现过」≠「读者懂了」。先问「读者读完能自己回答什么」，再决定写什么；不为凑齐清单而堆内容。
2. **每一节回答由前文引出的唯一问题。** 在小节顶部用 `.dd-lead` 把这个问题<b>显式写出来</b>（「上一节留下的问题 / 本节回答」）。一节讲两件事，就拆开或删掉多余的。
3. **严格维护概念依赖顺序。** 用到的词必须已在前文建立。像「计算图」「动态规划」「CNN」「Transformer」这种，读者没准备好时绝不提前抛出——它们只进末尾的「延伸学习」表。
4. **分清三个层级，并用徽标标注、用过渡连接：**
   - **原理**（为什么能表示非线性）→ `.dd-badge.intuition`「直觉」
   - **数学**（梯度、链式法则怎么算）→ `.dd-badge.math`「数学」
   - **工程**（选什么网络、怎么调）→ `.dd-badge.eng`「工程」

   三者都要，但必须分层；不能把工程细节混进原理推导里。
5. **做「初学者困惑检查」，不只做结构检查。** 文件结构/标题/表格齐全 ≠ 课程在认知上连续。在最容易卡住的地方放 `.dd-note.warn`「你可能会困惑」，当场点破并解决。

一句话概括这 5 条：**认知连续 > 技术完整**。读者的困惑走到哪，内容就接到哪。

## 三、可用的内容组件（CSS 已在 style.css 定义）

| 类 | 用途 |
|---|---|
| `.dd-lead` | 小节顶部的「本节回答什么」引导句（规约 ②） |
| `.dd-badge.intuition/.math/.eng` | 章节标题旁的层级徽标（规约 ④） |
| `.dd-note.intuition/.math/.eng/.warn/.key` | 提示框：直觉/数学/工程/困惑/要点。`.warn` 用于初学者困惑（规约 ⑤） |
| `.dd-formula` + `.dd-formula-note` | 居中公式块 + 其下小注 |
| `.dd-fig` + `<figcaption>` + `.svg-t`/`.svg-tn` | 内联 SVG 原创制图 + 图注（勿复制外部图片） |
| `.dd-table` / `.dd-steps` / `.dd-chain` / `.dd-quiz` / `.dd-answers` | 表格 / 步骤 / 因果链 / 自测题 / 折叠答案 |

## 四、结构模板（神经网络页即按此写）

概览（title/subtitle/aliases/meta/thesis）→「你应该理解什么」清单 →（可选）贯穿全页的运行示例 → 正文各节（每节一问，标注层级）→ 把整条因果链串一遍 → 常见误解 → 自测题+答案 → 概念依赖与延伸 → 来源与改编说明。

## 五、版权

正文、图表、手算**一律原创**；参考 Google ML Crash Course 等（多为 CC BY 4.0）只做<b>结构与要点参考</b>，重新组织、扩写、自绘 SVG，**不复制其文字、图片或交互组件**。来源与访问日期记进页尾 `.dd-src`。数学务必自己逐步核验（神经网络页的手算已端到端验算过）。
