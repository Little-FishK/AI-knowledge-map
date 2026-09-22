# 仓库目录与数据边界

## 同一内容为什么有多份

| 目录 | 用途 | 修改方式 |
| --- | --- | --- |
| `data/deepdive/` | 中文理解页源材料 | 仅通过 Stage 2 MCP 控制器修改 |
| `data/content-locales/en/deepdive/` | 英文翻译源产物 | 仅通过翻译控制器修改；全部受 Git 跟踪 |
| `data/deepdive-runtime/` | 按页加载的浏览器运行时，含清单 | 从源材料生成，不手工改正文 |
| `data/graph-shadow/` | 图谱分片存储与迁移机制的一部分 | 由图谱写入契约和控制器维护，不是可随意删除的缓存 |
| 根目录 `en/`、`zh/` | 受控静态页构建的试点输出、兼容入口 | 当前各有监督学习试点页；仍被构建控制器、导航及测试使用，不代表全站页面目录 |
| `site-release/` | 已入 Git 的历史 130 页中文发布快照及验收样本 | 整套生成、整套校验，不混入源文件编辑 |
| `.tmp/translation-deployments/baseline.json` 指向的目录 | 本机完整发布基线 | 发布程序更新指针；不能随缓存批量清理 |
| Git `gh-pages` 分支 | 正式发布历史 | 发布程序提交并验证线上结果；不由本次目录整理更新 |

运行时和发布页是有明确来源的派生表示，不是三套独立编写的正文。
根目录 `index.html` 是源码预览；要查看完整发布版本，使用 `启动网站.cmd`。
不要手动分发 `site-release/` 的历史快照来代替当前线上版本。

## 文档与工具

- `docs/README.md`：当前文档分类入口。
- `docs/translation/`、`docs/operations/`、`docs/tooling/`：翻译、运维和工具说明。
- `docs/archive/`：历史阶段验收与发布记录，仅供追溯。
- `docs/deepdive-audits/`、`docs/deepdive-reviews/`：控制器约定的审核与章节材料，不是普通说明文档。它们的路径被协议使用，必须通过控制器迁移，不能用文件整理绕过契约。
- `tools/README.md`：各领域工具入口；布局实验位于 `tools/graph/browser/`，历史正文迁移工具位于 `tools/deepdive/migrations/`。
- `tests/`：按领域组织的测试；目录迁移同步更新调用路径。
- `assets/app/graph-layout-presets.js`：局部关系布局的展示预设，由 `graph-view.js` 调用；并非图谱源记录。

## 只留在本机的文件

- `.local/promotion/`：个人推广工作簿。
- `.local/downloads/`：重复下载文件，非构建输入。百度校验的唯一项目源文件位于 `config/site-verification/`。
- `.codex-tmp/`、`.workbuddy/`：本机工具与个人记忆，Git 忽略。
- `.tmp/`：诊断、构建和发布记录；按 [维护规则](WORKSPACE_MAINTENANCE.md) 清理。
- `.git/`、`.github/`、`.codex/`、`.claude/`、`.opencode/`：各自工具的约定目录；不要为了减少目录数量合并或重命名。

目录清理不重置 `.stage2/state.json`，不改变任何页面的审核状态。
