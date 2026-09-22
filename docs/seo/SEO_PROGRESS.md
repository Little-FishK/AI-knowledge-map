# SEO 实施记录

最新：2026-09-19 已部署中英文学习指南、语言目录导航及完整抓取验证。当前 265 个索引候选 URL（中英文理解页各130），Google/Bing sitemap 已重新提交，IndexNow HTTP 200。详见 [本轮 SEO/GEO 记录](2026-09-19-SEO-GEO.md)。下文保留为历史记录。

更新：2026-09-13。目标：中英文并重，优先 Google、Bing、百度；本轮只处理 SEO。

## 最新部署（覆盖下文早期“未部署”状态）

后续故障修复：`41adb4cb77ec73883cf95665937eddae2091f595` 修正 `release-navigation.js` 在脚本带 `?v=` 时错误计算站点根路径、生成 `/assets/zh/concepts/...` 的问题。现在使用 URL 相对路径解析，兼容版本参数和子目录部署。仅脚本、首页版本引用和发布清单变化，文章页集合与 sourceHash 完全不变。已在真实网站刷新地图后点击“理解原理”，确认进入 `/zh/concepts/supervised-learning/` 并正常显示文章；新增中英文、版本参数、子目录及缺失页回退回归，纳入 `test:routing`。

2026-09-13 已按维护者要求部署默认地图无 Hash 地址及静态目录导航。发布沿用现有 GitHub Pages `gh-pages` 分支，最终提交 `543e6957971c906c788b9171ae8069b178bd82bf`。控制器生产包含 137 个概念页，较此前线上新增英文 decision-tree、dimensionality-reduction；原有文章 sourceHash 无变化。导航脚本使用内容哈希版本参数，解决浏览器复用旧脚本的问题。隔离发布提交的导出产物已通过生产校验，开发工作区未被覆盖。

线上浏览器已确认旧 `/#/map` 加载后变成 `/`，地图正常显示且目录链接不重复。精确线上验证回执位于 `map-root-deployment-verification.json`。该部署不代表内容审核通过或搜索排名提升。

## 当前线上基线

- 规范首页：https://ai-knowledge-map.com/ 。`#/map` 保留为交互地图路由，独立文章使用真实路径参与搜索。
- 公开 Sitemap：138 个 URL，含首页、目录、关于页、130 个中文概念页和 5 个英文概念页。
- 全量公开 HTTP 检查：138 页均为 200，单一非空标题/摘要/H1，自引用 canonical，未发现 noindex；无重复标题、无重复摘要。
- 所有页面可沿初始 HTML 链接从首页到达，但首页经关于页才连接文字目录；目录的概念关系主要使用 Hash 地址。
- 这些检查不是实际爬虫请求、搜索引擎收录、排名、浏览器渲染或 Core Web Vitals 的证据。
- 可重跑命令：`node tools/seo-live-check.js https://ai-knowledge-map.com/ docs/seo/2026-09-13-live-baseline.json`。报告来自公开 HTTP，不包含账号信息。

## 已执行的站长平台操作

2026-09-13 在已登录的 Google Search Console 和 Bing Webmaster Tools 中观察并操作：

| 平台 | 操作前 | 本轮操作与回执 |
| --- | --- | --- |
| Google | Sitemap 最近读取 9 月 12 日，成功但仅发现 4 页；概览显示 0 次搜索点击，索引汇总仍在处理 | 重新提交原 Sitemap；显示提交成功，读取日期更新为 9 月 13 日，发现数量更新为 138 |
| Bing | Sitemap 最近抓取 9 月 9 日，成功且发现 4 页；6 月 12 日至 9 月 11 日效果报告显示 0 点击、0 展示 | 对原 Sitemap 执行 Re-submit；提交日期更新为 9 月 13 日，状态 Processing，发现数量暂为 4 |
| 百度 | 当前浏览器未登录 | 未提交、未验证站点；需要维护者登录后继续 |

发现 138 页不等于收录 138 页。当前数据范围短且存在报表延迟，不能据此判断长期优化效果。

同日 Google 首页 URL 检查明确显示“网址已收录到 Google”“网页已编入索引”。这是首页实际索引状态证据，不外推至其他 137 个网址。

## 已完成代码修复（尚未部署）

1. 发布首页初始 HTML 加入可见的文字目录链接，不再只依赖 JavaScript 注入；运行脚本避免重复添加。
2. 文字目录的概念卡和概念关系优先指向本次产物中存在的中文独立文章；未发布概念保留地图回退，避免生成死链。
3. 添加回归覆盖：子目录部署、静态首页链接、已发布文章链接、未发布文章回退。
4. 新增公开站点批量检查工具与基线 JSON。

验证：website-artifact、website-publication、website-changes、website-loader、routing 测试通过。

控制器以 `manual-review=hold` 构建独立生产候选，输出 `.tmp/site-releases/production-1789330007863-88c87d60`；生产验证通过，首页有 1 个静态文字目录链接，目录不再含概念 Hash 链接。

候选含 137 个概念页（线上基线为 135 个），说明当前工作区还包含其他内容更新。候选未提升为 site-release、未提交 Git、未部署、未发送针对候选的 IndexNow 通知。构建与公开阅读资格不代表内容审核通过。

## 接下来按顺序推进

### 默认地图地址整理（本地已完成，未部署）

默认地图不再生成 `#/map`，旧 Hash 首页在初始化或历史导航时规范为无片段地址。查询参数、部署子目录和节点定位 `#/map/<id>` 保留；理解页站名和普通返回地图按钮改为无片段首页。软件、教程、资料库路由保持原有格式。根目录桌面与子目录手机浏览器测试覆盖语言、刷新、前进后退、重置及无效节点回退；独立文章渲染测试覆盖普通首页链接与节点定位链接。

1. 明确发布差异，部署本轮链接修复；上线后核验精确产物，再通过既有差异流程向 IndexNow 提交真实变更 URL。
2. 登录百度并查看站点是否已验证；按实际可用入口提交规范地址。Google/Bing 的验证不能替代百度验证。
3. 记录 Google/Bing URL 检查的首页及中英样本状态；处理具体排除原因。不要反复提交未变化的 Sitemap。
4. 建立关键词与落地页映射。中文候选：AI 入门、人工智能学习路线、RAG 是什么、Transformer 原理、AI Agent 是什么；英文候选：AI learning roadmap、what is RAG、transformer explained、AI agent explained。它们是待验证候选，不是已经获得搜索量或难度数据的结论。
5. 先用 Search Console 的查询数据及 Bing Keyword Research 校准需求，再逐页调整真实标题、摘要和内容；避免全站套用“是什么”模板或堆关键词。
6. 扩展完整英文落地页。目前 5 页不足以覆盖大多数英文主题；正文与翻译依项目内容控制器流程推进，仅对实际发布的语言版本声明 hreflang。
7. 检查移动端性能与阅读体验；当前 GSC 核心网页指标无数据，不虚构性能评分。以真实移动端测试及后续字段数据定位改进。
8. 以连续 28 天为一周期比较搜索展示、点击、CTR、查询平均位置，并分别查看品牌词/非品牌词、中/英文和落地页。有效收录率使用引擎报告，不能用 Sitemap 计数代替。

## 官方依据

- [Google：JavaScript SEO 与 Hash 路由](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google：可抓取链接](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)
- [Google：多语言独立地址](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
- [Bing：发现与索引规范](https://www.bing.com/webmasters/help/bing-webmaster-guidelines-30fba23a)
- [百度：普通收录说明，提交不保证收录](https://ziyuan.baidu.com/linksubmit/index)
