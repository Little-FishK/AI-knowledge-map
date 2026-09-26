# 资料库门禁盲区：meta-ai / nvidia 两批评审资料从未被校验

日期：2026-09-25　范围：只读核查，未改动任何资料文件

## 结论

线上资料库页实际加载 **1829 条**资料，而 `npm run validate` 报告 **1433 条**。
差额 **396 条**全部来自 `data/library-official-meta-ai-importance-*.js`（7 个）与
`data/library-official-nvidia-importance-*.js`（7 个）——这 14 个文件**从未进入任何校验器**。

因此这 396 条（占线上资料 21.7%）是在**没有通过资料库门禁**的情况下发布到线上的。

## 证据一：加载链缺口

`tools/validators/library.js` 的 require 列表从 `microsoft-importance-07` 直接跳到
`library-official-china.js`，14 个 meta-ai/nvidia 文件不在其中。

同一缺口还存在于另外 3 处登记点：

| 登记点 | 状态 |
|---|---|
| `assets/app/library-view.js` 的 `bundle` | 已登记（浏览器会加载） |
| `tools/validators/library.js` require 列表 | **缺失** |
| `tools/readiness/site-artifact.js` 的 `copyTree` 列表 | **缺失** |
| `tools/readiness/inventory.js` 的 `DATA_FILES` | **缺失** |
| `tools/i18n/inventory.js` 的 `DATA_SCRIPTS` | **缺失** |

实测（node + vm，按 bundle 顺序完整加载）：

```
PRO_LIBRARY.items 校验器加载链 = 178（只含 6 个基线文件时的值）
PRO_LIBRARY.items 浏览器完整加载 = 1829
官方技术资料 official 分类：校验器 995 → 浏览器 1391（差 396 = meta-ai 136 + nvidia 260）
openai / anthropic / google-deepmind / microsoft 两边完全一致
```

四个品牌两边数字一致，说明校验器**确实**加载了它们的 importance 文件，唯独漏了这两个品牌。

## 证据二：一旦补上加载链，门禁报 618 个问题

把 14 个 require 补进校验器后（仅用于本次核查，已复原）：

```
专业资料库 1829 条 · 一级来源 9 类 · 二级来源 85 个
来源分布：academic=105 standards=66 official=1391 knowledge-base=117 ...
✗ 发现 612 个问题
```

分类：

| 问题 | 数量 | 说明 |
|---|---|---|
| `官方技术资料 <id> 的审核机制无效` | 405 | meta-ai 141 + nvidia 264，即两批**全部**条目 |
| `官方技术资料 <id> 的域名 dev.meta.ai 不在 meta-ai 白名单` | 141 | 全部 meta-ai 条目 |
| `资料 <id> 关联了不存在的节点：X` | 61 | 42 条 meta-ai 条目，nvidia 无此问题 |

### 审核机制为什么判无效

`tools/validators/library.js` 第 303-307 行只承认三个品牌的 `-official-value-score-v1`：

```js
["openai", "anthropic", "google-deepmind"].includes(item.sourceSubcategory)
  ? new Set(["official-technical-importance-v2", `${sub}-official-value-score-v1`])
  : item.sourceSubcategory === "microsoft"
    ? new Set(["official-knowledge-matrix-v1", "microsoft-official-value-score-v1"])
    : new Set(["official-knowledge-matrix-v1"]);   // meta-ai / nvidia 落到这里
```

meta-ai/nvidia 的两批评审写的是 `meta-ai-official-value-score-v1` 与
`nvidia-official-value-score-v1`，命名与前三家同构，但白名单没放行。

### 域名为什么判不在白名单

`officialHosts["meta-ai"]`（第 261 行）= `llama.com`、`www.llama.com`、`ai.meta.com`、
`github.com`、`faiss.ai`、`docs.pytorch.org`。实际数据用的是 **`dev.meta.ai`**（141 条全部）。
nvidia 用的是 `nvidia.github.io`，在白名单内，无问题。

### 失效节点

graph 只有 130 个节点，以下 6 个 id 被 meta-ai 资料引用但**不存在**：

| 引用的节点 | 次数 | 图里最接近的真实节点 |
|---|---|---|
| `computer-vision` | 29 | `computer-use` |
| `diffusion-model` | 11 | `diffusion` |
| `api` | 9 | （无） |
| `image-segmentation` | 7 | `image-generation` / `image-editing` |
| `security` | 4 | （无） |
| `benchmark` | 1 | （无） |

即线上有 61 个「资料 → 概念」链接指向不存在的概念。

## 影响判断

1. **文档数字与线上不一致**：README / `docs/I18N.md` / `docs/SOURCE_POLICY.md` 写 1433 条、
   官方技术资料 995 条，而线上渲染 1829 条、官方 1391 条。文档规模门禁之所以通过，
   是因为它拿的是**同一个漏了 14 个文件的校验器**的口径，属于自我一致、而非与线上一致。
2. **发布链路会回退**：`tools/readiness/site-artifact.js` 的 `copyTree` 列表也没有这 14 个文件。
   gh-pages 现在有它们，是靠发布分支另行带上；走正常构建路径重建会丢。
3. **61 个死链**在线上可见。

## 未做动作

本次只做只读核查。校验器的 require 改动已复原（`node tools/validators/library.js` 仍 exit 0），
14 个数据文件、graph、文档均未改动。修复范围的取舍见对话。
