# AWS 官方技术资料学习候选池预筛（2026-09-24）

## 结论

- AWS 官方 AI 文档目录原始页：**3,627 份**。
- 按“学习资料、优先对所有 AI 有用”的口径预筛后：**147 份**进入逐份重要性审核。
- 预筛淘汰：**3,480 份**。
- 这 147 份是候选池，不等于审核通过数，也不等于最终建卡数。

## 与 OpenAI、Anthropic 对齐的候选池口径

1. 只统计 AWS 有发布资格的第一方官方技术资料；论文和开源项目分别归入其他一级来源。
2. 先完整读取官方目录并逐 URL 留痕，再做重要性预筛。
3. 只保留能够迁移到其他云、模型或框架的知识：训练、推理、评测、治理、安全、Agent、RAG、MLOps 与架构方法。
4. 排除快速开始、教程/样例、API/SDK、控制台步骤、IAM/VPC/区域/计费、具体模型页、AWS 资源运维、专属算法/组件、故障排查和重复的实现页。
5. 预筛通过项仍需逐份判断时效性、知识增量、替代关系和是否值得“一资料一卡”。

## 官方目录与结果

| 官方资料族 | 原始页 | 进入重要性审核 | 预筛淘汰 | 候选率 |
|---|---:|---:|---:|---:|
| Amazon Bedrock User Guide | 1,113 | 41 | 1,072 | 3.7% |
| Amazon SageMaker AI Developer Guide | 2,388 | 52 | 2,336 | 2.2% |
| AWS Well-Architected Generative AI Lens | 108 | 46 | 62 | 42.6% |
| Generative AI inference architecture and best practices | 18 | 8 | 10 | 44.4% |
| **合计** | **3,627** | **147** | **3,480** | **4.1%** |

官方机器可读目录：

- <https://docs.aws.amazon.com/bedrock/latest/userguide/toc-contents.json>
- <https://docs.aws.amazon.com/sagemaker/latest/dg/toc-contents.json>
- <https://docs.aws.amazon.com/wellarchitected/latest/generative-ai-lens/toc-contents.json>
- <https://docs.aws.amazon.com/prescriptive-guidance/latest/gen-ai-inference-architecture-and-best-practices-on-aws/toc-contents.json>

## 主要淘汰原因

| 原因 | 数量 |
|---|---:|
| 产品操作、作业、端点、容器或工作流步骤 | 1,714 |
| 无可识别的通用 AI 学习主题 | 465 |
| AWS 运维、权限、网络、区域、监控或计费 | 463 |
| 具体厂商、型号、模型卡或参数 | 328 |
| SageMaker 专属算法、组件或工具 | 323 |
| 教程、快速开始或样例 | 69 |
| API、SDK、CLI 或模板参考 | 61 |
| 维护/故障排查/旧版信息 | 31 |
| 元数据、导言或文档历史 | 23 |
| 行业/应用场景页 | 3 |

## 数据文件

- 审核明细：`proposals/official-technical/aws-learning-prefilter-20260924.json`
- 可复现脚本：`tools/aws-official-review/build-learning-prefilter.js`

