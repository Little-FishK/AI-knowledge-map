# 百度文件验证

2026-09-20，站点 `https://www.ai-knowledge-map.com`，百度站点 ID `1429746500`。

- 百度页面要求文件名 `baidu_verify_codeva-tGdVIxA5TA.html`（大写 I）。
- 用户下载文件带浏览器重复下载后缀 `(1)`；只移除该后缀，不改原始文件内容。
- 长期源文件：`config/site-verification/baidu_verify_codeva-tGdVIxA5TA.html`。
- 生产构建复制到发布根目录，和 `index.html` 同级；预览不发布所有权证明。
- 发布清单以 `verificationFiles` 单独登记，并验证白名单文件名和32位十六进制内容；不作为文章生成 SEO 标签或加入 sitemap。
- 独立发布提交 `f3dba14`，只增加验证文件并更新发布清单，原260篇文章未更改。
- 完成验证后保留源文件及线上文件；后续受控构建将继续携带文件。
- `www` 目前301跳转到不带www域名，百度是否接受以平台实际回执为准。

线上文件： https://www.ai-knowledge-map.com/baidu_verify_codeva-tGdVIxA5TA.html

公开 HTTP 已确认：带 www 与不带 www 的验证文件均可访问，最终响应为 200，内容与用户原文件逐字节一致。已点击百度完成验证，等待平台回执。
百度平台实际回执：验证失败，原因是无法连接到您网站的服务器。本机公开 HTTP 访问成功不能证明百度网络可达；验证文件已部署正确，但站点所有权验证尚未完成。
2026-09-20 标签验证：按百度页面原值，将 meta name=baidu-site-verification、content=codeva-tGdVIxA5TA 加入首页 head，同时更新本地 index.html 源码以随以后构建保留。部署提交 7c0aebf，仅修改首页及发布清单；原验证文件继续保留。
标签验证最终回执：百度已明确报错 301 网页存在跳转，要求验证文件、网页必须直接返回200。www首页在到达规范域名之前返回301，因此跟随跳转后的200不满足百度验证。标签已正确上线并保留；应优先添加和验证不带www的正式主站，或另行评估让www直接返回200的托管方案。
