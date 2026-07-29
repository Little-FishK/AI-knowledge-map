# AI 知识地图

一个可离线打开的 AI 学习知识网：用有方向、有类型的关系连接概念，并把概念原理、软件目录、专业资料库、使用教程和学习进度放在同一个静态网站里。

> 当前阶段：**Public Beta 准备中**。内容和核心交互已经可用，但尚未公开部署，也不应被视为权威教材。最新进度与已知缺口见 [docs/STATUS.md](docs/STATUS.md)。

## 当前内容

- 130 个概念节点、416 条关系边、6 个用途大区
- 130/130 个节点已覆盖“理解原理”页；覆盖不代表教学质量门禁通过，当前 L3/L4 均为 0/130
- 62 个软件条目、12 个软件门类
- 4 个使用教程页、22 条正式视频资源
- 9 类一级来源、73 个二级来源与73份平台档案、98 条专业资料（其中官方技术资料 90 条）
- 覆盖全部节点的 9 层官方推荐学习路径
- 本地“已学习”状态记录、搜索、过滤、聚焦与自动防重叠排布

## 使用

直接双击 `index.html` 即可离线打开。项目没有后端、账号或构建步骤。

学习进度保存在浏览器本地存储中，不会上传到服务器；清除该站点的浏览器数据会同时清除进度。

## 质量检查

需要 Node.js 22。首次运行浏览器审计前安装依赖：

```bash
npm install
npx playwright install chromium
```

运行数据、引用、布局、软件和教程校验：

```bash
npm run validate
```

运行包括理解原理页 L1/L2/L3、浏览器与 WCAG 审计在内的完整门禁：

```bash
npm run quality:all
```

Windows PowerShell 若阻止 `npm.ps1`，可将命令中的 `npm` 改为 `npm.cmd`。

## 视频双轨入库

同一份视频证据仍走教程与概念两条独立提案。教程轨写软件目录和使用教程；概念轨只负责判断已有节点补充、新节点、合并或不收录。已有节点补充与新节点事实包会进入理解原理页第二阶段，旧视频流程不再自行生成或发布理解原理页。

完整命令、评分和数据合同见 [docs/VIDEO_INGEST.md](docs/VIDEO_INGEST.md)。

## 理解原理页第二阶段

130 个已有页面从独立审计开始，只有真正的新节点从零写作。系统串行执行 `audit / update / write / repair`，每次 Codex 定时任务只处理一页的一个阶段；候选内容通过机械门禁后才由控制器原子发布。运行方式、材料隔离、三页试点和视频双轨边界见 [docs/DEEPDIVE_STAGE2_AUTOMATION.md](docs/DEEPDIVE_STAGE2_AUTOMATION.md)。

```bash
npm run stage2:status
```

## 内容与来源

正文采用原创表达；外部资料用于选题、事实核对和继续阅读，具体来源与第三方许可说明见 [CREDITS.md](CREDITS.md)。专业资料库的数据结构见 [docs/LIBRARY.md](docs/LIBRARY.md)，来源白名单与证据边界见 [docs/SOURCE_POLICY.md](docs/SOURCE_POLICY.md)，教程资源的收录标准见 [docs/TUTORIALS.md](docs/TUTORIALS.md)。

项目许可证尚未确定。在仓库加入明确的 `LICENSE` 前，不应把本项目内容或代码视为已获得开放授权。
