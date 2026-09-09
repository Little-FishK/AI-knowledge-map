# 第七阶段正式备份与恢复执行清单

## 最新实际结果：本机数据库级恢复已通过

2026-09-09 已从正式项目通过 verify-full TLS 生成完整 PostgreSQL 逻辑备份，备份数据仅经内存处理后用 Windows DPAPI CurrentUser 加密，未在项目或宿主机写入明文 dump。

- 最新备份：`%LOCALAPPDATA%/ai-knowledge-map/backup-private/backup-20260909T034905Z-5b7d15/`。
- 解密后 archive 大小：293,991 字节；SHA-256：`fb459f6b9c2f4db6b596395381eff8e361c54d1d06acb28c9c06bb9e3d322924`。
- 本机隔离恢复：auth/public schema、原始表/函数所有者与 ACL；2 个用户、2 条进度、4 条回执，外键无孤立进度。
- 源数据在导出前后摘要一致；恢复后的 auth.users、auth.identities、learning_progress、learning_operations 全行内容摘要与源数据一致。
- 恢复后的权限/业务回归：RLS、双账号隔离、匿名拒绝、RPC-only 写入、幂等、冲突、取消、删除级联全部通过。合成夹具仅在恢复库的回滚事务中运行，原始恢复数据保持不变。
- 最新数据库级恢复耗时约 6.76 秒，不能外推为完整服务恢复时间。临时容器无外部网络/无宿主端口，数据目录使用 tmpfs，结束后容器已移除。正式数据库未修改。

仍未完成：完整 Supabase 服务恢复及 OTP 重新登录、异地且可跨机器解密的备份、定时运行与失败通知。此本机 DPAPI 包和凭据都依赖当前 Windows 账号；不能把它称为异地灾难恢复。完整 dump 包含的平台 schema 与扩展（如 Vault）尚未在兼容 Supabase 环境恢复；外部 Storage 对象、SMTP 密钥和平台加密根密钥不因数据库 dump 而自动具备恢复能力。

工具：`tools/phase7-db-backup.ps1 -Mode Inventory|Backup|Restore`。Restore 要求显式私有备份目录，只能创建随机命名的无网络本机测试容器，没有接受远程恢复地址的参数。详细证据保存在该备份目录的 `manifest.json` 和 `restore-report.json`。

凭据验证更新：`tools/phase7-verify-db-credential.ps1` 已使用保存的 Windows 加密凭据，通过 Session pooler 成功连接正式数据库，执行 `BEGIN READ ONLY` 中的只读查询；结果为 database=postgres、serverVersion=17.6、readOnly=on。密码有效。首次尝试因客户端证书信任未就绪而失败，未将其误判为密码错误。随后从 Supabase 控制台提供的 `https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt` 获取公开 CA，启用 verify-full 后验证通过。CA 文件 SHA-256：`700723581420dd1ac98fd7e9ac529f0ef210eadcaf87fc868a3ad7d114c2f3b7`。验证未修改数据库，不代表备份或恢复已经完成。

下文为执行前计划与边界，完成状态以上方实际记录为准。

2026-09-09 维护者确认暂无备份存储、保存着数据库密码。先进行本机加密备份与恢复演练；异地存储仍待后续落实。已从控制台 Connect 核实 Session pooler 为 `aws-0-us-east-1.pooler.supabase.com:5432`、用户 `postgres.jjmihlewnbkfwpfgtfqi`、数据库 `postgres`。凭据输入脚本 `tools/phase7-store-db-credential.ps1` 使用隐藏字符的本机窗口，将密码通过 Windows DPAPI 加密保存到 `%LOCALAPPDATA%/ai-knowledge-map/backup-private/supabase-db.credential.xml`，目录仅当前 Windows 用户访问。脚本的模拟密码加密/解密与无明文检查已通过；不表示正式数据库已连接。此凭据文件绑定当前 Windows 账号，不是可迁移的灾难恢复备份。

## 已确定边界

- 源项目：`jjmihlewnbkfwpfgtfqi`，us-east-1，免费额度。
- 源数据库仅执行导出与只读核对；不得向源项目执行恢复、清表或测试夹具。
- 恢复目标必须为空白独立测试 Supabase 项目，或完整兼容的本地 Supabase 环境。普通 PostgreSQL 夹具只能验证业务表恢复，不能代表 Auth 用户可重新登录。
- 凭据、数据库导出、加密密钥不进入 Git 或网站发布产物。密码由维护者本机输入，不经过聊天；不把完整连接字符串放进日志。
- 正式数据不传给未获确认的存储提供方。加密备份与解密凭据分开存放。

## 待维护者确认

1. 异地存储提供方和具体目录；没有异地存储时可先本机加密验证，但不可标记灾难恢复完成。
2. 拟定每日备份，保留 7 个日备份与 4 个周备份。最多损失 24 小时、一个工作日内恢复为待演练目标。
3. 是否保存数据库密码；若遗失，重置前核对已有数据库连接。登录 Supabase 控制台不等于拥有数据库密码。
4. 选择恢复环境。新增收费、开启付费备份或升级方案均另行确认。

## 执行顺序

1. 从源项目 Connect 页面核对 Session pooler 地址和数据库版本。不得根据地区猜测实际主机。
2. 用兼容版本的 Supabase CLI 导出角色、业务 schema、数据；确认 Auth 用户数据包含在导出范围，单独保存迁移历史与 auth/storage 自定义变更。
3. 同时保存配置清单：邮件模板、SMTP 主机/端口/发件人、OTP 位数与期限、Site URL、重定向白名单、Edge Function 源码与网关配置。SMTP 密钥等秘密单独保管。
4. 为导出文件生成 SHA-256 清单，再加密。对加密包做解密与摘要核对；记录时间、工具版本和备份范围，不记录用户内容或密码。
5. 将加密包写入已确认位置，核对远端字节与摘要。只有这一步成功才能记录异地备份成功。
6. 验证恢复目标项目 ID 与源 ID 不同、目标为空，随后按官方指南恢复。若存在 Vault/列加密，先落实相应加密密钥恢复要求。
7. 比较用户/业务表/操作回执计数及外键完整性；验证 RLS、匿名拒绝、账号隔离、幂等回执、取消状态、冲突处理和迁移历史。
8. 在测试环境验证真实 OTP 重新登录、进度读取及删除级联；发信使用明确授权的测试邮箱。
9. 记录实际恢复耗时、最后可恢复数据时间和缺失配置。演练失败保留失败记录，修复后重新验收；不得仅凭导出命令退出码标记可恢复。
10. 首次完整成功后再启用定时任务与失败通知；是否自动清理旧备份需与保留策略一致。当前未创建定时任务。

## 官方依据（2026-09-09 核对）

- [Supabase 数据库备份](https://supabase.com/docs/guides/platform/backups)：免费项目需要自行落实备份。
- [CLI 备份与恢复](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)：角色、schema、数据、迁移历史、Auth/Storage 变更与函数配置分别处理。

实际执行时以当前版本工具的可用参数与只读检查结果为准，不在此文件中预填真实连接密码。
