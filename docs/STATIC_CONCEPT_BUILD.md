# 双语静态理解页构建

构建器支持多页，当前实际纳入的已批准内容仍只有监督学习。生产正文只能由 Stage 2 MCP 控制器读取。增加构建清单项不代表该页已获得内容批准，也不会启动翻译。

运行 `npm run build:static-concepts` 默认读取 `config/static-concepts.json`；也可以运行 `node tools/build-static-concepts.js path/to/plan.json` 指定另一份清单。清单包含 schemaVersion=1、siteUrl 和 pages，每页必须有 pageId、reviewId、artifactHash。程序先校验整份清单，随后按顺序为每页启动全新的页锁定 MCP 进程，每进程一次构建、manual-review=hold。某页失败时记录原因并继续其余独立页面；任一失败则整体退出码为 1，已成功的页面保留。构建不部署、不请求翻译 API。

入口通过页锁定的 translation-static MCP 调用 stage2_build_static_translation。控制器核对源版本、独立语义门禁、英文发布版本及人工接受回执后，生成两张 HTML、语言入口注册表和 sitemap-concepts.xml。所有正文仍取自控制器冻结版本；本地预览 JSON 不能作为正式构建输入。发生版本变化时构建拒绝继续，应先走现有受控更新/翻译流程。

每页输出位于 zh/concepts/<pageId>/ 和 en/concepts/<pageId>/，与 assets 和地图首页一起部署。共享 assets/concept-pages.js 与 sitemap-concepts.xml 合并所有已成功纳入的页面；assets/static-concepts-manifest.json 记录版本和 HTML 哈希，不含审核者身份或私有审核内容。新增页面保留其他页；重建更新自身及共享索引。从输入清单移除页面不会删除旧产物或索引项。

控制器检测已生成文件和共享索引漂移，拒绝覆盖未知内容；初次迁移只接受与旧单页产物完全一致的文件。站点域名/子路径与既有清单不一致时拒绝构建，整站地址变更需要单独迁移。共享写入采用独占锁，冲突报告 busy；常规写入失败恢复本次修改前的文件。这不是断电或强杀恢复承诺，异常中断后需先检查锁和产物。

本地验证可运行 `node tools/run-public-site-preview.js 4992`，访问 `/AI-knowledge-map/zh/concepts/supervised-learning/` 或对应 en 地址。该服务支持现有 GitHub 子路径。运行 `npm run test:static-concepts` 验证控制器与实际构建页面；浏览器测试需要先有成功构建产物。

每种语言有自己的 canonical；hreflang 双向指向同一概念的另一语言。依据：[Google 多语言页面说明](https://developers.google.com/search/docs/specialty/international/localized-versions)。站点地图汇总已成功纳入的概念页，不代表全站所有内容类型，也不保证收录或 AI 引用。监督学习专用图例不会套用到其他页；其他英文 SVG 使用通用局部滚动，具体资源仍须逐页验收。

源码更新后必须重新构建并复验，当前构建不自动监听源变化，也不检查本次清单外页面的内容状态。失败页的旧产物保留，不能视为新版已发布；部署前应成功重建完整发布清单。多页隔离测试使用合成内容，不是第二张真实页面的审核证据。静态 HTML 与元数据不代表机器审核评级或真实学习效果；初学者测试按用户要求暂缓。
