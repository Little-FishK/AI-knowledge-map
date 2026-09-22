# 理解页公开阅读发布策略

2026-09-12：按用户确认，仅调整网站发布机制。审核规则、合同版本、评分、返修次数、单页任务限制、人工批准和 Stage 2 状态流转保持不变。

`config/site-publishing.json` 的 `understandingPagePolicy` 控制网站构建：

- `approved-only`：原有策略，仅纳入当前人工批准且完整审核通过的页面。
- `open-reading`：现有中文理解页可以公开阅读，不要求先完成新版审核。当前项目采用此策略。

控制器仍是唯一内容读取与打包入口，构建使用现有页面，不读取未发布候选来替换正文，不回写任何正文、审核记录、批准或工作流状态。活动内容租约期间仍拒绝构建。英文翻译仍遵循原有独立发布要求。

发布清单中的 `eligible` 保留原有严格审核资格含义；`publicAccess` 表示网站公开访问资格。`reviewStatus` 为 `reviewed`、`pending-review` 或 `needs-revision`。后两类页面显示“持续修订中”，已知修订项使用更明确的提示，不把公开访问标为审核通过。审核升级可以改变复核状态，不因等待补审而从公开阅读产物排除现有页面。

构建仍检查可渲染内容、活动 HTML、路径、资源哈希、完整页面集合、内部链接和 SEO。预览仍不可作为生产产物部署。生产公开阅读页必须带状态提示，不能伪装成已审核页。

流程：`node tools/build-website.js production` 通过 MCP 构建，再用 `node tools/verify-website.js <产物目录> --production` 检查；`node tools/promote-website.js <产物目录>` 保存旧版本备份后更新 `site-release/`。当前线上仍使用 `gh-pages /`，按 `docs/PHASE8_RELEASE_RUNBOOK.md` 将精确产物复制到干净的隔离发布分支，提交后通过 Git 归档回读验证，再推送 `gh-pages`。主分支及审核材料不随网站部署推送。仓库内的 Actions 发布工作流保留待以后启用。

回归检查：`node tests/tooling/website-publication.test.js`、`node tests/tooling/website-artifact.test.js`、`node tests/tooling/website-release.test.js site-release`。本策略不修改理解页内容质量门禁。

本次发布：`gh-pages` 提交 `591112d`，130 个中文理解页全部公开，129 个页面显示修订状态，0 个页面被排除。2026-09-12 16:56 UTC 已验证线上清单与所有页面 HTML、站点地图及指定资源的哈希一致，130 个理解页均返回 HTTP 200，随机无效地址仍返回 404。浏览器检查覆盖 130 个桌面页面和 10 个响应式样本；Stage 2 状态在构建前后保持同一摘要。旧线上提交 `07e7b7d` 与 `.tmp/public-reading-live-before.zip` 可用于回滚。
