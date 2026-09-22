# 第七阶段：账号与跨设备学习进度

2026-09-08 开始。维护者授权实施第七阶段；服务、登录方式和新增费用等重大选择需确认。最新状态：账号功能已公开部署，登录弹窗修复后维护者确认基础功能良好，基础功能验收通过。完整阶段仍有访客导入/离线冲突专项验收和托管备份恢复收尾；本次反馈不扩展解释为全部专项步骤通过。最新发布为 `fb86314`，详见 `PHASE7_FINAL_ACCEPTANCE.md`。下文较早的未上线与待基础功能反馈描述是历史检查点。

## 最新公开部署记录

第七阶段收尾补充：用户密码验证成功后，已完成正式数据库本机加密备份与隔离数据库级恢复，源数据摘要与恢复数据一致，恢复后权限与同步 RPC 回归通过。详细证据见 `PHASE7_BACKUP_RUNBOOK.md`。完整 Supabase 服务恢复/OTP、异地备份、定时运行以及真实设备专项验收仍不据此标记完成。

2026-09-08 22:20 EDT，发布分支 `gh-pages` 提交 `896fc5f` 部署成功（GitHub Actions run `34302786469`）。正式域名为 `https://ai-knowledge-map.com/`。本机主工作区的未提交开发内容未随部署提交。

精确产物：`.tmp/site-releases/production-1788920333253-002ab4e3/`，55 个文件，1 个合格中文理解页、129 个排除页面；含受摘要保护的 CNAME。发布提交通过 git archive 导出后再次完整校验；`site-release/` 已同步此产物并保留上一版备份。

已设置根域名四条 GitHub Pages A 记录及 www CNAME；GitHub DNS 检查通过，证书可用，已勾选强制 HTTPS。线上首页、同步运行时、账号 UI 和监督学习 HTML 的摘要与发布清单一致。390px 无头浏览器验证 HTTPS 阅读、学习进度控件和邮箱登录表单，无页面脚本错误；不存在页面返回 404。本轮未向测试邮箱自动发送邮件。

维护者确认电脑/手机有关闭 VPN/代理的中国大陆网络，拟使用 `zzk070331@qq.com` 实测。此确认只代表测试条件就绪，不代表登录、收件或同步已经通过。

## 实施前已核实的基线

- 当前为 GitHub Pages 静态网站，没有认证后端或进度数据库。
- `assets/app/learning-view.js` 使用 `ai-knowledge-map.learned.v1` 保存节点 ID 数组，只有“已学习”这一维度。
- 旧实现会过滤不在当前图谱中的 ID；新存储应保留历史 ID，仅在显示时区分归档节点，避免节点调整造成记录丢失。
- 独立阅读页的 `assets/reading.js` 目前只有阅读增强，没有共享进度控件。
- 中英文共用稳定概念 ID；进度不应按语言复制两套。

## 进度合同（任务 39）

每个概念分别保存三个可取消的自报状态：读过（read）、自认为理解（understood）、完成自测（practiced）。三者不自动互相推导；完成自测不表示答案正确或已掌握。访问页面或滚动到底部不自动设置任何状态。

旧“已学习”保存为独立的 legacyLearned 历史标记，界面注明来自旧版。没有历史证据时，不填入阅读时间、内容版本、自测成绩或三个新状态。旧数组在迁移成功前后均不删除；迁移可重复执行且不会覆盖后来取消的状态。

数据以用户 ID、概念 ID、状态字段唯一定位；保存显式 true/false、服务器版本号、操作 ID，并可附加已知的内容版本。取消记录保留为 false，不能删除后让离线旧记录复活。节点退役保留归档记录，ID 迁移通过显式版本化映射处理；内容更新保留历史学习状态并提示可复习，不宣称用户已学会新版本。

## 同步与账户边界

- 访客无需注册即可阅读和记录；本地存储失败时明确提示当前记录未持久保存。
- 访客与各账号使用独立本地命名空间；退出及换账号后不显示上一账号数据。异步请求绑定会话代次，旧会话结果不得写入新账户状态。
- 首次登录先拉取云端记录，展示访客待导入记录与冲突，允许导入或跳过。仅在服务器确认后标记迁移完成，不清空访客备份；再次登录或另一账号登录不自动重复导入。
- 每个状态采用服务器版本条件更新；每次本地修改具有唯一操作 ID，重试幂等。不同字段可独立同步，同字段过期修改进入可见冲突，用户选择后基于最新版本提交。不得靠客户端时钟或“只取 true”解决冲突。
- 断网保留待同步队列；重连后先读取最新版本，再提交或显示冲突。鉴权失败暂停队列并提示重新登录；失败、等待、冲突、同步完成分别显示。
- 退出前有未同步记录时提供重试、导出或确认退出；退出仍保留按账户隔离的待同步记录供同账号恢复。
- 删除账号需要明确确认，在可信服务端验证当前用户身份并删除其账号及关联数据；成功后清理该账号本地数据。导出采用版本化 JSON，包含状态、历史标记及待同步记录。

## 服务选择：已获维护者确认（任务 40）

维护者已确认 Supabase 托管认证与 PostgreSQL、邮箱验证码登录，先用免费额度开发验证。维护者已创建项目 `jjmihlewnbkfwpfgtfqi`，提供控制台地址 `https://supabase.com/dashboard/project/jjmihlewnbkfwpfgtfqi`。控制台已核实项目状态 Healthy、计算实例 Nano、地区 East US / North Virginia (`us-east-1`)。维护者已购买 `ai-knowledge-map.com`，有效期至 2027-09-08；域名自动续费和注册信息隐私保护均已开启。账户功能尚未部署到公开网站。

正式邮箱登录需要自定义 SMTP；Supabase 默认发信只面向预授权团队邮箱且有很低的限额。免费项目可能因不活跃暂停，因此公共阅读必须独立于账号服务。地区访问、邮件送达和恢复能力都要实测。

官方依据：

- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/deployment/going-into-prod
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/auth/managing-user-data

## 任务与验收清单

| ID | 交付物与验收 | 当前状态 |
| --- | --- | --- |
| 39 | 上述状态、历史迁移与内容版本合同；实现后验证语义一致 | 已完成模型、UI 语义和单元测试 |
| 40 | 认证/数据库/地区/发信方案；验证真实邮件、目标地区访问和成本 | Supabase、域名、Resend、自定义 SMTP 与真实收件已通过；待目标地区访问/成本验收 |
| 41 | 地图及独立页均可访客记录；账号故障不影响阅读 | 精确生产产物的地图入口、独立页和 390px 浏览器验收通过；待公开部署 |
| 42 | 旧数组迁移、本地云端合并预览、重复导入、取消状态、保存失败恢复 | 已实现并通过模型/运行时测试；待真实账号导入验收 |
| 43 | 两设备修改、离线重连、幂等重试、并发标签页、过期响应、换账号 | 重试、幂等模型、跨标签页、过期响应和换账号测试通过；待真实双设备验收 |
| 44 | 验证码登录/恢复访问、退出、导出、删除账号、状态与失败提示 | 真实六位 OTP 前端登录、刷新恢复、安全退出和临时账号服务端删除通过 |
| 45 | 数据库权限和双账号真实隔离测试；匿名读写、伪造用户 ID、过期令牌均不能越权 | 真实 Supabase 双账号、匿名/伪造写入/篡改令牌拒绝、幂等与冲突验收通过 |
| 46 | 独立测试环境恢复备份、升级 schema、归档节点、内容更新与迁移重放 | 隔离数据库导出恢复与迁移重放通过；待托管环境恢复策略验收 |

单元测试和模拟服务不能替代真实认证、数据库权限、邮件送达与备份恢复验收。未完成这些检查前不将第七阶段标记完成。

## 实现进度：核心模块与隔离数据库验证

- `assets/progress-model.js`、`assets/progress-runtime.js`、`assets/progress-supabase.js` 与 `assets/progress-ui.js` 已接入地图和正式构建的独立页。它们实现访客本地记录、账号隔离、邮箱 OTP、分页读取、版本 RPC、失败重试、冲突选择、访客导入、跨标签页更新、导出、退出和删除入口。
- 官方 Supabase JS 2.115.0 已固定为本地静态资源，前端仅包含项目 URL 和 publishable key；Resend 密钥及 Supabase 管理密钥均未写入仓库或浏览器代码。
- `supabase/migrations/202609080001_learning_progress.sql` 已应用到真实 Supabase 项目；隔离 PostgreSQL 17.6、导出恢复后的数据库测试与托管项目目录权限检查均已完成。
- `supabase/functions/delete-account/index.ts` 已部署为 `delete-account`。旧 JWT 网关校验已关闭，函数内使用访问令牌调用 `getUser()` 后才用服务端管理权限删除当前用户。无会话请求返回 401；两个临时测试账号通过此函数成功删除，旧登录凭据随即失效，控制台确认只保留维护者账号。
- 进度模型、SDK 适配、运行时、服务端删除边界和移动浏览器测试均已加入 `npm run test:app`。
- `supabase/tests/bootstrap.sql` 只供空白 PostgreSQL 测试容器模拟 Auth 身份，禁止用于真实 Supabase。`supabase/tests/progress.sql` 已通过双账号 RLS、匿名拒绝、直接写入拒绝、回执私有、重放、冲突、取消及删除级联测试。
- 隔离数据库使用 pg_dump 导出并恢复到新数据库后，同一权限/同步测试再次通过。这证明测试 schema 与夹具可恢复；不代表真实 Supabase Auth 用户、令牌、托管配置及业务进度已经完成恢复验收。

正式构建控制器已为 `https://ai-knowledge-map.com/` 生成并验证精确生产产物：1 个合格中文理解页、129 个因当前人工批准缺失而排除的页面。产物共 54 个文件，完整性检查通过；地图入口和独立页在 390px 浏览器中均可记录访客进度并显示登录入口。产物尚未提升到 `site-release`，公开网站未启用账号。

## 云端接入进展

维护者已在内置浏览器完成登录。控制台已核实项目 `AI_knowledge_map`、状态 Healthy、Nano 计算实例、North Virginia (`us-east-1`)。首次只读查询 public schema 无表。

已通过 SQL 编辑器应用 `202609080001_learning_progress.sql` 对应建表、RLS 和 RPC 定义（粘贴时合并了空白和注释，逻辑不变）；控制台返回成功。随后查询系统目录确认：learning_progress 和 learning_operations 均启用 RLS；anon 均无 SELECT；authenticated 仅可 SELECT learning_progress，对两表均无直接 UPDATE 权限。尚未使用真实登录令牌验证双账号隔离，不能将目录检查当成端到端认证验收。

邮件设置已经完成以下配置，本次未升级 Supabase：

- Resend 免费方案中的发信子域名 `mail.ai-knowledge-map.com`（North Virginia）已验证。Spaceship DNS 已添加 DKIM TXT、两条发送 CNAME 和 `p=none` 的 DMARC TXT；公共 DNS 查询逐条返回预期值。
- Resend 密钥名为 `supabase-auth`，权限仅为 Sending access，并限制到 `mail.ai-knowledge-map.com`。密钥值不记录在仓库；它已写入 Supabase 的加密 SMTP 凭据。
- Supabase 自定义 SMTP 已启用：主机 `smtp.resend.com`、端口 `465`、用户名 `resend`、发件地址 `login@mail.ai-knowledge-map.com`、显示名 `AI Knowledge Map`，每用户最短间隔保持 60 秒。
- `supabase/templates/login-code.html` 已应用到 Magic link or OTP 模板。主题和正文均为中英双语，正文使用 `{{ .Token }}`；控制台预览正常，保存后页面重载仍显示自定义 SMTP 已启用。
- `supabase/templates/signup-code.html` 已应用到 Confirm sign up 模板。Supabase Site URL 已从默认 `http://localhost:3000` 改为 `https://ai-knowledge-map.com`，Email OTP length 已从 8 统一为前端约定的 6 位。
- 已通过正式 `/auth/v1/otp` 接口向维护者邮箱发送注册验证码。Resend 显示投递成功且实际邮件渲染包含六位 `{{ .Token }}`；前端验证后显示“账号已登录”和“已同步到账号”。登录账号的“读过”状态写入后经页面刷新正确恢复，验收后已取消该测试标记。

## 真实托管集成验收

2026-09-08 在项目中创建两个自动确认且不发邮件的临时用户。使用各自真实访问令牌验证：账号 A 的记录对账号 B 不可见；匿名查询、账号 B 直接向表写入账号 A 的 `user_id`、篡改后的访问令牌均被拒绝；RPC 首次写入成功，同一操作 ID 重放保持同一回执，过期版本写入返回服务器当前记录与 `conflict`。随后两个临时账号均由线上 `delete-account` 函数删除，测试数据通过外键级联清理。临时凭据与测试脚本已从工作区删除。

第七阶段尚需验收：真实双设备同步、真实访客导入、中国大陆网络可达性、托管备份恢复及部署后复验。具体步骤和备份草案见 `PHASE7_FINAL_ACCEPTANCE.md`。

后续代码复核补上了会话代次检查：登录拉取、手动刷新以及写入回执在退出或切换账号后不得落入新会话。已增加登录读取/刷新未完成时退出的回归测试。此前的旧生产产物尚未包含该修复，发布前需重新构建。
