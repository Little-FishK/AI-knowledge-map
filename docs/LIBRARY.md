# 专业资料库

专业资料库用于保存重要但不一定适合成为节点或软件教程的高质量信息。一级导航严格按九类信息来源分类，二级导航细分到具体平台、机构、集合或经认证个人；内容形式与主题只作为筛选标签。

正式数据位于 `data/library.js`，注册为 `window.PRO_LIBRARY`。
二级来源的平台档案位于 `data/library-platform-profiles.js`，注册为 `window.LIBRARY_PLATFORM_PROFILES`。

每条资料至少包含：

- 唯一 ID、一级来源、二级来源、标题、发布者和具体集合；
- 内容形式、权威等级、审核状态与是否一手；
- 原始 HTTPS 地址和访问日期；
- 原创摘要、允许支持的证据范围和局限；
- 标签，以及关联节点和软件；
- `discoveryOnly`，明确该资料是否只能用于发现。

修改后运行：

```powershell
npm run validate
```

资料进入库不表示它可以自动改变节点、教程或学习路径。晋升必须进入各自已有的门禁流程。

## 两级来源结构

- `sourceClasses[].id`：九类固定一级来源。
- `sourceClasses[].subcategories[]`：该类允许使用的二级平台或来源集合。
- `items[].sourceClass`：资料所属的唯一一级来源。
- `items[].sourceSubcategory`：资料所属的唯一二级来源，必须存在于对应一级来源中。

二级来源是分类与审核边界，不是对整个平台的内容背书。例如 `academic/arxiv` 表示资料来自 arXiv，仍需逐篇判断作者、版本、证据和论文状态；`open-source/github-canonical` 只允许项目确认的主仓库，不代表 GitHub 上所有仓库可信。

## 二级来源档案

每个二级来源必须有一份档案，并在用户选中该来源时先于资料列表显示：

- `kind`：`platform` 或 `collection`；
- `website`：平台型来源必须提供 HTTPS 官网；集合型来源必须为 `null`，页面明确显示“无统一网址”；
- `positioning`：该平台或集合在资料体系中的定位；
- `background`：形成时间、发展脉络与重要边界；
- `organization`：相关公司、机构或运营主体；
- `foundingTeam`：创始人、发起团队，或为何不存在单一创始团队；
- `reviewedAt`：档案事实的最近复核日期。

平台档案用于帮助用户判断来源，不改变资料的权威等级，也不替代逐条证据审核。
