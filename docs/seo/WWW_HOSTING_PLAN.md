# www 直接返回页面：待执行配置

2026-09-20。已部署 Cloudflare Pages 并修改 www DNS；公共 DNS 缓存和自定义域名激活尚待完成。GitHub Pages 设置未改。

## 实际执行状态

- 用户确认安装 Cloudflare GitHub 应用，仅授权 `Little-FishK/AI-knowledge-map`。
- Pages 项目 `ai-knowledge-map` 已成功部署提交 `7c0aebffabe9e67ad7809adb177d82e9863f1a60`，594 个公开发布文件。
- 生产分支 `gh-pages`，构建命令留空，输出目录 `.`，自动生产部署开启，其他分支自动预览已关闭。
- 已登记自定义域名 `www.ai-knowledge-map.com`，CNAME 目标 `ai-knowledge-map.pages.dev`。
- Spaceship 的 www CNAME 已修改并保存，TTL 保持 30 分钟。权威 nameserver 已返回新目标。
- 2026-09-20 15:38 UTC：公共解析仍返回旧目标，www 仍为 GitHub 301；Cloudflare 自定义域名尚未激活。不能认定百度验证完成。
- Pages 默认域名首页、中英文文章、sitemap 返回 200，未知路径返回 404，首页 meta 与裸域 canonical 均正确。证据见 `2026-09-20-cloudflare-check.json`。
- 注意：Cloudflare Pages 将 `.html` 文件请求 308 跳转到无扩展名地址。百度后续使用首页 HTML 标签验证，不以该文件的跳转后 200 当作通过。
- 下一步：缓存到期后验证 www 首页首个响应 200、有效证书和 meta，再点击百度 HTML 标签验证并记录平台回执。

## 原因

百度已拒绝 www 首页的 301 响应。当前 www CNAME 指向
`little-fishk.github.io`，GitHub Pages 的主域名为 `ai-knowledge-map.com`。
仅更换为另一个 GitHub Pages IP 或指向裸域名，不能取消该平台的主域名跳转。

## 配置方案

使用 Cloudflare Pages 独立提供 www 的静态页面，保留 GitHub Pages 原主站。
以下为接入配置与验证标准；实际完成范围以上方执行状态为准。

1. Pages 连接公开仓库 `Little-FishK/AI-knowledge-map`，生产分支选择
   `gh-pages`，使用分支中已经发布的静态文件，输出目录为仓库根目录。
   不从工作区重新构建 Stage 2 内容。Git 集成让后续生产发布自动同步。
2. 在 Pages 先绑定 `www.ai-knowledge-map.com`，取得实际分配的
   `*.pages.dev` 主机名。不能预先猜测该值。
3. 在 Spaceship 将 www 的 CNAME 从 `little-fishk.github.io`
   改到实际 Pages 主机名。保留其他 DNS 记录及 Spaceship nameservers。
4. 页面 canonical 和 sitemap 继续使用 `https://ai-knowledge-map.com/`。
   不设置 www 首页重定向，不更改 GitHub Pages 的 CNAME 文件。

## 验收

- www HTTPS 证书有效；首页首个 HTTP 响应为 200，无域名跳转。
- 首页源 HTML 包含百度验证 meta。
- 百度验证文件直接返回 200，字节与发布文件一致。
- 检查中英文理解页、静态资源和未知路径 404。
- 原主站仍正常，canonical、hreflang、sitemap 不变。
- 最后在百度站长平台重新点击验证，以平台回执为结果。

## 回退

恢复 www CNAME 为 `little-fishk.github.io`；这会恢复原有 GitHub Pages
跳转行为。DNS 生效时间依 TTL 和递归缓存而定。

## 官方依据

- https://developers.cloudflare.com/pages/configuration/custom-domains/
  子域名可通过外部 DNS 的 CNAME 接入，不必迁移 nameservers；必须先在
  Pages 登记自定义域名，再修改 DNS。
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages
  GitHub Pages 对配置好的 apex/www 组合自动跳转到选定的主域名。
