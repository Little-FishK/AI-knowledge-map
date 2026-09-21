# AI Knowledge Map · AI 知识地图

**Learn how AI concepts fit together — 130 concepts, 416 connections, and a 9-stage learning path.**

**看懂 AI 概念之间的关系：130 个概念、416 条关联、9 个学习阶段。**

[**Explore in English →**](https://ai-knowledge-map.com/?lang=en) · [**中文在线体验 →**](https://ai-knowledge-map.com/?lang=zh-Hans) · [Report an issue / 反馈问题](https://github.com/Little-FishK/AI-knowledge-map/issues)

Free to read in your browser. No account is required to explore the map or read concept explainers.

免费在线阅读。浏览地图和概念讲解无需注册账号。

[![AI Knowledge Map — A free guide to AI concepts and foundations](assets/social/site-card.svg)](https://ai-knowledge-map.com/)

## English

AI Knowledge Map is an interactive learning resource for people starting with AI and developers connecting the ideas behind modern AI systems. Explore a concept, see how it relates to other ideas, then follow a learning path from foundations to LLMs, RAG, agents, and safety.

### What you can explore

- **An interactive concept map:** 130 concepts connected by 416 typed relationships, with search, filters, and a focused core view.
- **A 9-stage learning path:** a suggested order for working through the concepts without having to plan your own syllabus.
- **Concept explainers:** Chinese and English explanations for topics such as neural networks, Transformers, tokens, RAG, AI agents, and MCP.
- **Learning progress:** mark concepts as learned and keep track of what to explore next.
- **Further learning resources:** a software directory, tutorials, and a reference library. Some supporting resources are currently available only in Chinese.

### Start in three steps

1. [Open the English map](https://ai-knowledge-map.com/?lang=en) and start with the core view.
2. Turn on **Recommended path** to follow the nine learning stages, or search for a term you have just encountered.
3. Open a concept, read its explanation, and explore the related concepts before marking it as learned.

You can browse without signing in. Guest progress is stored in your browser; clearing browser data removes it. The live website also offers optional account-based progress sync, which requires an internet connection.

## 中文

AI 知识地图面向刚接触 AI 的学习者，以及希望把零散知识串起来的开发者。你可以从一个听过但不理解的词开始，也可以按推荐路线逐步学习，理解基础概念、大模型、RAG、Agent 和安全问题之间的联系。

### 你可以在这里做什么

- **看关系：** 130 个概念通过 416 条有方向、有类型的关系连接起来，支持搜索、筛选和核心视图。
- **找顺序：** 按 9 个阶段的推荐学习路径，逐步决定先学什么、后学什么。
- **理解原理：** 阅读中英文概念讲解，覆盖神经网络、Transformer、Token、RAG、AI Agent、MCP 等主题。
- **记录进度：** 标记已学习概念，查看接下来可以学习的内容。
- **继续探索：** 查阅软件目录、使用教程和专业资料库；部分配套资源目前仅提供中文。

### 三步开始

1. [打开中文地图](https://ai-knowledge-map.com/?lang=zh-Hans)，先从核心视图建立整体印象。
2. 开启“推荐学习路径”，或直接搜索刚听到的术语。
3. 打开概念、阅读讲解、查看相关概念，再标记为已学习。

无需登录即可浏览。访客进度保存在当前浏览器，清除浏览器数据后会丢失；线上网站也提供可选的账号与跨设备进度同步，需要联网使用。

## Feedback and contributions / 反馈与参与

Found an unclear explanation, a factual error, a broken link, or a translation problem? [Open an issue](https://github.com/Little-FishK/AI-knowledge-map/issues) with the page URL, the passage or behavior involved, and a suggested correction or source where possible.

欢迎反馈讲解不清、事实错误、失效链接、翻译问题或使用障碍。请附页面网址、具体段落或复现步骤，以及可供核对的来源或修改建议。

The material is under continuous revision. Coverage does not mean every page has passed all quality reviews. Contributions to concept explainers follow the project's [content review workflow](docs/DEEPDIVE_STAGE2_AUTOMATION.md) and [source policy](docs/SOURCE_POLICY.md).

内容持续维护与修订中，页面覆盖不等于全部通过质量审核。概念讲解的修改遵循项目的内容审核流程与来源要求。

## License / 许可

- **Original code:** [MIT](LICENSE).
- **Original articles and explanatory figures owned by this project:** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Credit **LittleFishK / AI Knowledge Map**, link the source and license, and indicate changes.
- **Third-party materials:** retain their respective licenses; see [CREDITS.md](CREDITS.md).

原创代码采用 MIT；项目拥有权利的原创文章和讲解图表采用 CC BY 4.0。第三方素材遵守各自许可。完整范围见 [CONTENT_LICENSE.md](CONTENT_LICENSE.md)。

## Source checkout / 源码使用

The live website and the `main` source snapshot are updated separately. Use [ai-knowledge-map.com](https://ai-knowledge-map.com/) for the current bilingual experience; cloning `main` may give you an earlier version.

线上网站与 `main` 源码快照分别更新。体验当前中英文功能请访问正式网站；下载 `main` 可能得到较早的源码版本。

For the source snapshot, download the complete repository and open `index.html` for the offline Chinese preview. Keep the `assets/` and `data/` directories alongside it. This does not reproduce every feature of the live website.

源码离线预览需下载整个仓库，再打开 `index.html`，并保留同目录下的 `assets/` 和 `data/`。离线中文预览不包含线上网站的全部功能。

### Development checks

Node.js 22 is required for the project checks:

```bash
npm install
npx playwright install chromium
npm run validate
```

For the content review and quality tooling, see [AGENTS.md](AGENTS.md) and the [review workflow](docs/DEEPDIVE_STAGE2_AUTOMATION.md). Running a check is not a claim that all content has passed review.
