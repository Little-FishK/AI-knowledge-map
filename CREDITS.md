# 出处与致谢

本项目的**全部说明文字（summary / body / cases）均为原创撰写**。
外部来源仅用于确定「该收录哪些概念」以及部分经典 ML 概念的释义参考。

## 使用的来源

### aiknowledgemap — MIT License
- 仓库：https://github.com/gustavomartinellidev/aiknowledgemap
- 用途：经典机器学习概念的选题与释义参考（其 `short_definition` 写得规范，用作部分基础节点摘要的初稿依据）。
- 许可：MIT，允许使用与再分发，需保留版权声明与许可声明。

### mlabonne/llm-course — Apache License 2.0
- 仓库：https://github.com/mlabonne/llm-course
- 用途：现代 AI（LLM / RAG / Agent / 微调 / 量化 / 对齐）部分的**分类骨架**参考，据此确定节点清单。
- 许可：Apache-2.0，允许使用与再分发，需保留声明。

### roadmap.sh / developer-roadmap — ⚠️ 版权受限，仅作查漏参考
- 仓库：https://github.com/kamranahmedse/developer-roadmap
- 其许可声明**禁止**将其内容以任何形式再发布。
- 因此本项目**未使用其任何文字**，仅在私下通读其节点名称清单以检查选题是否有遗漏。
  概念名称属于行业通用术语与事实，不构成对其原创表达的使用。
- 原始清单存放于 `tools/_raw/`，已在 `.gitignore` 中排除，不入库、不发布。

## 依赖库

| 库 | 许可 | 用途 |
|---|---|---|
| [Cytoscape.js](https://github.com/cytoscape/cytoscape.js) | MIT | 图渲染 |
| [cytoscape-fcose](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose) | MIT | 力导向布局 |
| [cose-base](https://github.com/iVis-at-Bilkent/cose-base) | MIT | fcose 依赖 |
| [layout-base](https://github.com/iVis-at-Bilkent/layout-base) | MIT | fcose 依赖 |

均以源码形式内嵌于 `assets/vendor/`，以保证离线可用。
