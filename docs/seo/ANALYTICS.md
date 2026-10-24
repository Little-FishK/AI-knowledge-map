# 网站访问统计（GA4 免费版）

接入日期：2026-10-24。网站：https://ai-knowledge-map.com/ 。

- 账号：AI Knowledge Map（413294701）
- 媒体资源：AI Knowledge Map — Website（560639574）
- 网站数据流：16195355394；衡量 ID：G-RTDE80YXPH（公开配置，不是密钥）
- 报告时区：America/New_York。
- 后台：https://analytics.google.com/analytics/web/#/a413294701p560639574/reports/intelligenthome
- 实时：https://analytics.google.com/analytics/web/#/a413294701p560639574/realtime/overview

## 指标口径

| 需求 | GA4 指标或报表 | 解释 |
| --- | --- | --- |
| 浏览量 PV | 浏览次数（Views） | 包括不同网页，以及地图、教程、资料库内可区分的路由切换；相同地址的重复 history 通知不重复计数。刷新页面会再次计数。 |
| 独立访客 UV | 用户总数（Total users） | 在所选期间内按 GA 浏览器标识去重；不是实名认证人数，跨设备、清除 Cookie 会影响识别。首页“活跃用户”不等于这个指标。 |
| 回访率 | 新访客/回访访客分析 | 选定日期内 returning 用户总数 ÷ 不按访客类型拆分的用户总数。新访客和回访访客可能重叠，不能用 1−新用户占比代替。须先积累真实回访。 |
| 停留时间 | 每次会话的平均互动时长 | 页面处于前台的互动时间；不是打开后台标签页的总时长，也不代表读懂文章。 |
| 推广渠道 | 带来会话的来源/媒介、广告系列 | UTM 显式归因；无 UTM 时尽量使用 referrer。缺少 referrer 的旧链接、聊天应用或复制链接可能计为 direct。 |

从接入后开始收集，历史 PV/UV 不能补算。标准报表需要处理时间，先看实时报告。拒绝统计、DNT/GPC、拦截器、Google 网络不可达会造成漏计。

## 推广链接约定

每次对外推广都带 `utm_source`、`utm_medium`、`utm_campaign`，有需要再加 `utm_content`。一律小写英文字母、数字、下划线或连字符；不要放邮箱、姓名、账号、搜索文本或密钥。不要给网站内部跳转加 UTM。

| 场景 | 可复制链接 |
| --- | --- |
| Reddit 学习社区 | https://ai-knowledge-map.com/?lang=en&utm_source=reddit&utm_medium=social&utm_campaign=english_learning_20261024&utm_content=learnmachinelearning |
| DEV 文章 | https://ai-knowledge-map.com/?lang=en&utm_source=devto&utm_medium=referral&utm_campaign=english_learning_20261024&utm_content=resource_article |
| Hacker News | https://ai-knowledge-map.com/?lang=en&utm_source=hackernews&utm_medium=referral&utm_campaign=english_learning_20261024 |
| Data Elixir | https://ai-knowledge-map.com/?lang=en&utm_source=dataelixir&utm_medium=email&utm_campaign=english_learning_20261024 |
| Data Science Weekly | https://ai-knowledge-map.com/?lang=en&utm_source=datascienceweekly&utm_medium=email&utm_campaign=english_learning_20261024 |

这些是后续使用的链接；本次没有替换之前已发布的帖子，也没有额外联系作者。验证访问使用 `utm_source=implementation_check&utm_medium=internal&utm_campaign=analytics_setup_20261024`，分析真实增长时排除它。

## 实现和维护

`config/analytics.json` 保存公开配置；`assets/site-analytics.js` 负责同意选择、URL 清理、来源保留、站内浏览去重。广告功能关闭，不发送 User-ID、表单或搜索内容，不录屏。Google Signals 与广告个性化均不启用。访客允许后才加载 Google 脚本；选择保留 90 天，可通过页面左下角“Analytics privacy / 统计隐私”修改。关闭统计会停止后续事件并清理本站 GA Cookie；不等同于删除 Google 已收到的历史数据。

增强型衡量在数据流后台关闭，网页浏览使用手动事件。不要同时开启增强型 history page_view，以免重复计数。预览构建不注入统计，运行时只允许主域名与 www 的 HTTPS 地址。

构建入口 `tools/readiness/site-artifact.js` 调用 `tools/readiness/analytics.js`，给每个成品页面注入一次。既有发布包可用 `tools/prepare-analytics-release.js <isolated-checkout> <new-artifact-directory>` 添加相同技术头部；程序验证原文件哈希、整个正文未变和发布记录未变，再执行完整生产发布校验。

验证：`node --test tests/app/site-analytics.test.js`，`node tests/tooling/website-artifact.test.js`，以及完整发布包 `tools/verify-publish-target.js`。初次上线版本：88fc7b02037362ed084424f0b4e2877d87025064；GitHub 发布运行：https://github.com/Little-FishK/AI-knowledge-map/actions/runs/40103616073 。

参考：[GA4 用户指标](https://support.google.com/analytics/answer/12253918?hl=en)、[手动网页浏览避免重复计数](https://developers.google.com/analytics/devguides/collection/ga4/views?technology=websites)、[基本同意模式](https://support.google.com/analytics/answer/14009635?hl=en)。
