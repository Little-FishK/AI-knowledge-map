# SEO/GEO 发布与通知流程

当前生产源是 GitHub Pages 的 `gh-pages /`。手动运行 `.github/workflows/publish-website.yml` 时必须填写该分支当前完整提交 SHA；工作流只从该提交导出产物，校验后上传，不读取历史 `site-release/`。是否由 Actions 或分支模式提供当前线上版本，仍以 Pages 设置、部署回执和线上核验为准。

1. 保留上一个线上产物的完整目录和清单。运行 `npm run build:website:production -- https://ai-knowledge-map.com/`，由 MCP 控制器按当前内容资格构建。未通过的语言版本不能出现在规范链接、hreflang、Sitemap 或发布导航里。
2. 运行 `npm run test:website`、`node tools/verify-website.js NEW_RELEASE --production`。检查页面、变更摘要、品牌事实、链接与排版。正文修改仍走内容控制器。
3. 运行 `node tools/website-changes.js OLD_RELEASE NEW_RELEASE`。这是预览，不提交网络请求。只有新增、修改和移除的正式 HTML URL 进入变更清单；仅构建时间变化不触发通知。更换域名需单独做迁移方案，脚本拒绝跨域差异。
4. 仅把验证后的精确包复制到干净的隔离发布分支；保留 `.git`，不复制主仓库或审查资料。推送 `gh-pages` 后记下完整提交 SHA。Actions 发布时输入这个 SHA；它会从分支导出文件，只对能精确复现清单摘要的 CRLF 文件还原 LF，并运行 `node tools/verify-publish-target.js RELEASE --site-url https://ai-knowledge-map.com/`。分支在校验或部署前推进时，本次发布会中止。`site-release/` 可保留为历史测试样本，不是 Actions 的上传源。
5. 等候 GitHub Pages 部署，针对本次精确发布包运行 `node tools/check-live-website.js NEW_RELEASE`。线上清单、HTML、分享图、Sitemap 和 robots 必须匹配发布包；实际 URL 与模拟请求结果分别记录。Sitemap 地址固定为 `https://ai-knowledge-map.com/sitemap.xml`，每次由构建器更新内容。
6. 验证上线后，运行一次 `node tools/website-changes.js OLD_RELEASE NEW_RELEASE --submit`。它先确认线上精确清单和公开 IndexNow 验证文件，再提交变更 URL。记录前后摘要、时间、URL 和 HTTP 状态，避免对同一变更重复提交。200/202 表示接收；网络超时属于结果不明确，先检查站长工具记录，不立即重复提交。400/403/422 先修复配置与站点所有权，429 等待限额恢复。
7. Google/Bing URL 检查分别记录“已索引状态”和“实时可抓取状态”。Sitemap 已成功注册后，无需每次发布都重新添加同一地址。仅对重要的新页或有明确修复的页面申请索引，不能反复提交催促。
8. 有回归时恢复上一份已验证产物，按相同部署步骤发布。回滚后重新计算真实差异，再决定是否通知。不要通过重新生成正文模拟旧版本。

IndexNow 验证键是公开的所有权证明，随产物发布；它不是邮件、数据库或模型 API 密钥。

官方依据：[Google Sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)、[IndexNow](https://www.indexnow.org/documentation)、[Google URL 检查](https://support.google.com/webmasters/answer/9012289)。
