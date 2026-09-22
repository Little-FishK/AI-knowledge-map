# SEO/GEO 发布与通知流程

当前生产源是 GitHub Pages 的 `gh-pages /`。`.github/workflows/publish-website.yml` 是后续可用的工作流；主分支整理与切换前不要声称它已经负责线上部署。

1. 保留上一个线上产物的完整目录和清单。运行 `npm run build:website:production -- https://ai-knowledge-map.com/`，由 MCP 控制器按当前内容资格构建。未通过的语言版本不能出现在规范链接、hreflang、Sitemap 或发布导航里。
2. 运行 `npm run test:website`、`node tools/verify-website.js NEW_RELEASE --production`。检查页面、变更摘要、品牌事实、链接与排版。正文修改仍走内容控制器。
3. 运行 `node tools/website-changes.js OLD_RELEASE NEW_RELEASE`。这是预览，不提交网络请求。只有新增、修改和移除的正式 HTML URL 进入变更清单；仅构建时间变化不触发通知。更换域名需单独做迁移方案，脚本拒绝跨域差异。
4. 将验证后的精确包晋升为 `site-release/`，仅把产物复制到干净的隔离发布分支；保留 `.git`，不复制主仓库或审查资料。对 Git 归档解压后的完整包再次验证，随后推送 `gh-pages`。不要对含 `.git` 的工作副本运行产物文件集合验证。
5. 等候 GitHub Pages 部署，运行 `node tools/check-live-website.js site-release`。线上清单、HTML、分享图、Sitemap 和 robots 必须匹配发布包；实际 URL 与模拟请求结果分别记录。Sitemap 地址固定为 `https://ai-knowledge-map.com/sitemap.xml`，每次由构建器更新内容。
6. 验证上线后，运行一次 `node tools/website-changes.js OLD_RELEASE site-release --submit`。它先确认线上精确清单和公开 IndexNow 验证文件，再提交变更 URL。记录前后摘要、时间、URL 和 HTTP 状态，避免对同一变更重复提交。200/202 表示接收；网络超时属于结果不明确，先检查站长工具记录，不立即重复提交。400/403/422 先修复配置与站点所有权，429 等待限额恢复。
7. Google/Bing URL 检查分别记录“已索引状态”和“实时可抓取状态”。Sitemap 已成功注册后，无需每次发布都重新添加同一地址。仅对重要的新页或有明确修复的页面申请索引，不能反复提交催促。
8. 有回归时恢复上一份已验证产物，按相同部署步骤发布。回滚后重新计算真实差异，再决定是否通知。不要通过重新生成正文模拟旧版本。

IndexNow 验证键是公开的所有权证明，随产物发布；它不是邮件、数据库或模型 API 密钥。

官方依据：[Google Sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)、[IndexNow](https://www.indexnow.org/documentation)、[Google URL 检查](https://support.google.com/webmasters/answer/9012289)。
