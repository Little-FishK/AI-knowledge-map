# 现成知识源调研 —— 谁能填上 LLM 时代的缺口（2026-07-19）

> 背景：[import-notes.md](import-notes.md) 发现 aiknowledgemap 停留在大模型之前，LLM/RAG/Agent/提示工程全是空白。
> 本文调研：全网有没有人已经把这部分整理好了，能不能直接用。

---

## 1. 候选源对比

| 源 | 覆盖我们的缺口 | 结构化程度 | 许可证 | 能否直接用 |
|---|---|---|---|---|
| **roadmap.sh** (nilbuild/developer-roadmap) ⭐361k | ⭐⭐⭐⭐⭐ **完美命中** | ⭐⭐⭐⭐⭐ JSON 树 + 每节点一个 md | ❌ **自定义版权协议，禁止转载** | **不能**（见 §3） |
| **mlabonne/llm-course** ⭐81k | ⭐⭐⭐⭐ 很好 | ⭐⭐ README 散文 + Colab | ✅ **Apache-2.0** | **能**（见 §4） |
| Hannibal046/Awesome-LLM 等 awesome 列表 | ⭐⭐ 偏论文/工具链接 | ⭐ 扁平链接列表 | 多为 MIT/CC0 | 只适合当活跃层素材源 |
| aiknowledgemap | ⭐ 几乎为零 | ⭐⭐⭐⭐ JSON 树 | ✅ MIT | 只能填基础/共享大区 |

---

## 2. roadmap.sh —— 内容完美，但用不了

它的仓库里有四份和我们直接相关的路线图，**每个节点一个 markdown 说明文件**：

| 路线图 | 节点数 | 对应我们的大区 |
|---|---|---|
| `ai-engineer` | **157** | 应用搭建 + 编程与Agent |
| `ai-agents` | **101** | 编程与Agent（Agent循环、工具调用、MCP、各家框架） |
| `prompt-engineering` | **46** | 应用搭建 |
| `ai-red-teaming` | **64** | 安全与对齐 |
| 合计 | **368** | 正好是 aiknowledgemap 空白的那四个大区 |

数据形态也和我们要的一模一样：`<roadmap>.json`（节点树）+ `content/<slug>@<id>.md`（每节点定义）。

### 但是它的 license 是这么写的

> 大意：本项目的一切文字与图片受版权保护，**允许个人使用**，但**不允许**以任何形式（数字/非数字/文字/图形）发布本项目的图片、文件或内容；允许分享仓库或 roadmap.sh 的**链接**，但把内容搬到其他媒介传播需事先取得作者同意。

（原文见 `https://raw.githubusercontent.com/nilbuild/developer-roadmap/master/license`）

**结论：不能把它的文字搬进我们的 `graph.json`。** 我们的地图目标包含"对外展示 / GitHub Pages"（SPEC §1），一旦发布就违反了这条。即便只自己用，将来想分享也会被这一步卡住，属于埋雷。

**能做而不越界的**：把它当**私下的选题清单**参考——看它覆盖了哪些概念、我们漏了什么。概念名称本身是事实，不是它的原创表达；但**每一句定义我们必须自己写**，不复制粘贴。

---

## 3. mlabonne/llm-course —— 可以放心用的骨架 ✅

Apache-2.0，81k stars，作者是 Liquid AI 的研究员，内容维护到 2025 年。三条主线，正好补上我们的四个空白大区：

**🧩 LLM 基础** → 我们的 `foundations`
数学 / Python / 神经网络（训练与优化、过拟合、MLP）/ NLP（文本预处理、特征抽取、**词嵌入**、RNN）

**🧑‍🔬 LLM Scientist** → 我们的 `foundations` + `frontier`
1. **LLM 架构**：架构总览、**tokenization**、**注意力机制**、采样策略 ← *aiknowledgemap 完全没有的三个关键概念*
2. 预训练：数据准备、分布式训练、训练优化、监控
3. 后训练数据集：存储与对话模板、合成数据生成、数据增强、质量过滤
4. **监督微调 SFT**：训练技术、参数、分布式、监控
5. **偏好对齐**：拒绝采样、**DPO**、奖励模型、强化学习 ← *对齐/RLHF 的落脚点*
6. **评测**：自动基准、人工评测、模型评测（LLM-as-judge）、反馈信号
7. **量化**：基础技术、GGUF & llama.cpp、GPTQ & AWQ、SmoothQuant
8. **新趋势**：模型融合、**多模态**、**可解释性**、**测试时计算扩展**

**👷 LLM Engineer** → 我们的 `building` + `coding` + `safety`
1. 运行 LLM：API、开源模型、**提示工程**、结构化输出
2. 向量存储：文档摄入、切分、**嵌入模型**、向量数据库
3. **RAG**：编排器、检索器、记忆、评测
4. **高级 RAG**：查询构造、工具、后处理、程序化 LLM
5. **Agent**：Agent 基础、**Agent 协议**（MCP 在此）、厂商框架、其他框架
6. 推理优化：Flash Attention、**KV 缓存**、投机解码
7. 部署：本地 / demo / 服务端 / 边缘
8. **安全**：提示注入攻击、后门、防御措施

**约 60 个二级概念 + 每节 4 个要点**，扩成节点后 **80~100 个**，量级足够，且全部命中你日常真正用得上的东西。

---

## 4. 修订后的 M0-3 方案（替代 import-notes.md §5）

| 来源 | 贡献 | 大区 | 许可 |
|---|---|---|---|
| **aiknowledgemap** | 25~30 个经典 ML 基础节点，`short_definition` 可作 summary 初稿 | foundations（+少量 safety/generation） | MIT ✅ 注明出处即可 |
| **mlabonne/llm-course** | 现代 AI 的**分类骨架**，我们据此定节点清单 | foundations / building / coding / safety | Apache-2.0 ✅ 注明出处 |
| **roadmap.sh** | **仅作私下查漏的选题清单**，一个字都不抄 | — | ⚠️ 禁转载 |
| **我们自己写** | 全部现代概念的 summary/body/案例 + **所有跨边** | 全部 | 我们的原创 |

**跨边仍然 100% 靠我们自己**——这三个源没有一个表达了跨分支联系（roadmap.sh 是路线图，llm-course 是课程目录，aiknowledgemap 是纯树）。这恰好印证了这张地图的价值定位：**联系是市面上没人做的那部分**。

**M0-3 修订目标**：基础层 30~40 个节点（经典 ML ~15 + 现代 AI ~20），跨边 ≥ 20 条。

---

## 5. 附带产出：仓库需要一个 CREDITS

导入 MIT / Apache-2.0 的内容要注明出处。M0 阶段就建 `CREDITS.md`，逐条记录：源、许可证、我们用了什么。

Sources: [aiknowledgemap](https://github.com/gustavomartinellidev/aiknowledgemap) · [developer-roadmap](https://github.com/kamranahmedse/developer-roadmap) · [mlabonne/llm-course](https://github.com/mlabonne/llm-course) · [Awesome-LLM](https://github.com/hannibal046/awesome-llm)
