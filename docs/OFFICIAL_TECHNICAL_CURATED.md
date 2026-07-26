# 官方技术资料首批精选

> 复核日期：2026-07-25。页面内的标题、摘要、入选理由、证据用途和使用边界以 `data/library-official-technical.js` 为准。

## 选材原则

本批资料只收录厂商或其正式维护项目发布的一手技术内容，优先选择能长期作为入口的指南、模型或系统卡、核心机制、评测安全、部署运维资料。纯营销首页、转载、新闻摘要和内容高度重复的页面不用于补足数量。官方资料只证明该厂商公开了什么、接口如何工作以及它自报的评测与限制；跨产品优劣、真实生产效果和普遍性结论仍需独立来源。

## OpenAI（10篇）

1. **Migrate to the Responses API**：统一应用开发接口，是工具与 Agent 工作流的共同基础。
2. **Using tools**：覆盖模型连接外部能力的核心执行机制。
3. **Structured outputs**：提供可靠自动化所需的数据契约。
4. **Image generation**：代表官方图像生成与编辑工作流。
5. **Realtime API**：补充实时语音和事件驱动会话机制。
6. **Agents SDK quickstart**：把 Agent、工具、交接和追踪落到可运行代码。
7. **Working with evals**：提供可重复的质量评测流程。
8. **Safety best practices**：构成应用层安全最低基线。
9. **Models: choosing the right model**：避免用静态型号表代替持续更新的官方选型。
10. **GPT-5.5 System Card**：补足能力评估、安全测试和已知限制。

## Anthropic（10篇）

1. **Intro to Claude**：建立平台全貌与官方阅读入口。
2. **Models overview**：核对模型能力、上下文与版本定位。
3. **Tool use with Claude**：记录 Claude 工具协议和执行边界。
4. **Prompt engineering overview**：以成功标准和评测组织提示优化。
5. **Prompt caching**：解释长上下文应用的重要成本机制。
6. **Message Batches**：补齐异步批处理的生产模式。
7. **Citations**：支撑证据可追溯的资料问答。
8. **PDF support**：明确专业文档的读取方式与限制。
9. **Model Context Protocol**：保留 MCP 原始协议入口。
10. **Claude 4 System Card**：补足模型行为、安全评估与部署判断。

## Google / DeepMind（10篇）

1. **Gemini API quickstart**：验证鉴权、SDK 和基本请求。
2. **Gemini models**：作为持续变化的官方模型目录。
3. **Text generation**：建立通用生成接口基线。
4. **Structured outputs**：明确 JSON Schema 与函数调用的区别。
5. **Function calling**：覆盖 Gemini 工具执行循环。
6. **Long context**：校正容量、检索、性能与成本关系。
7. **Embeddings**：支撑语义搜索和 RAG。
8. **Live API**：补充实时双向多模态会话。
9. **Safety settings**：记录安全类别、阈值和开发者责任。
10. **Gemini model cards**：连接产品能力与 DeepMind 模型层资料。

## Microsoft（10篇）

1. **What is Microsoft Foundry?**：建立微软 AI 平台组件全貌。
2. **Azure OpenAI in Microsoft Foundry Models**：区分 Azure 托管层与模型层。
3. **Model catalog and collections**：覆盖多模型选型与部署。
4. **Content filtering in Microsoft Foundry**：解释生产内容过滤机制。
5. **Responsible AI practices for Azure OpenAI**：提供识别、测量、缓解、运营框架。
6. **Semantic Kernel overview**：代表微软 Agent SDK 应用架构。
7. **AutoGen documentation**：覆盖多智能体与事件驱动运行时。
8. **ONNX Runtime documentation**：补充跨硬件推理与优化。
9. **Microsoft Presidio documentation**：补充隐私识别与匿名化门禁。
10. **ML.NET documentation**：保留传统机器学习与 .NET 生态。

## Meta AI（10篇）

1. **Llama documentation**：Llama 技术资料主入口。
2. **Llama models**：核对官方模型、许可证与获取方式。
3. **Responsible use guide**：记录开放权重模型的应用责任。
4. **Llama Stack documentation**：覆盖可移植的推理、Agent、评测和安全 API。
5. **Segment Anything 2**：代表图像与视频可提示分割。
6. **DINOv2**：代表无监督视觉表征路线。
7. **AudioCraft**：覆盖音乐和音频生成。
8. **ImageBind**：覆盖六种模态的共享嵌入空间。
9. **Faiss documentation**：覆盖大规模向量检索基础设施。
10. **ExecuTorch documentation**：补齐端侧和嵌入式模型部署。

## NVIDIA（10篇）

1. **CUDA C++ Programming Guide**：解释整个 GPU 软件栈的编程底座。
2. **cuDNN documentation**：连接神经网络算子与高性能实现。
3. **TensorRT documentation**：覆盖通用深度学习推理优化。
4. **TensorRT-LLM documentation**：深入 LLM 量化、并行和 KV 缓存。
5. **Triton Inference Server documentation**：覆盖多模型生产服务。
6. **NeMo Framework user guide**：连接大模型训练、微调与部署。
7. **NVIDIA NIM documentation**：区分模型、引擎与推理微服务。
8. **NeMo Guardrails documentation**：提供可编程安全中间件。
9. **RAPIDS documentation**：补齐 GPU 数据处理管线。
10. **Nsight Systems user guide**：提供端到端性能可观测证据。

## Hugging Face 官方（10篇）

1. **Hugging Face Hub documentation**：覆盖资产、版本、权限和协作。
2. **Transformers documentation**：主流预训练模型使用与训练入口。
3. **Datasets documentation**：保障数据管线可复现。
4. **Tokenizers documentation**：深入分词完整处理流水线。
5. **Diffusers documentation**：覆盖开源图像与视频生成。
6. **Accelerate documentation**：覆盖多设备分布式训练。
7. **PEFT documentation**：覆盖 LoRA 等低成本适配方法。
8. **TRL documentation**：覆盖监督微调与偏好后训练。
9. **Evaluate documentation**：提供统一模型评测接口。
10. **Text Generation Inference documentation**：连接模型仓库与生产推理。

## AWS（10篇）

1. **Amazon Bedrock User Guide**：Bedrock 产品与能力总入口。
2. **Agents for Amazon Bedrock**：覆盖托管 Agent 编排。
3. **Knowledge Bases for Amazon Bedrock**：覆盖企业 RAG 全链路。
4. **Guardrails for Amazon Bedrock**：覆盖平台安全控制。
5. **Evaluate model performance in Amazon Bedrock**：覆盖自动和人工模型评测。
6. **Prompt management for Amazon Bedrock**：覆盖提示资产版本治理。
7. **Amazon SageMaker AI Developer Guide**：覆盖可控训练与 MLOps 生命周期。
8. **SageMaker JumpStart**：连接模型目录、微调与端点部署。
9. **AWS Neuron documentation**：覆盖 Trainium 与 Inferentia 软件栈。
10. **Machine Learning Lens**：把单项服务提升到生产架构审查。

## 其他厂商官方资料（10篇）

1. **ElevenLabs — Voice cloning: how it works（原有）**：覆盖专用声音克隆机制和边界。
2. **Mistral AI Documentation**：覆盖欧洲重要模型厂商的模型与 Agent 开发。
3. **Cohere Documentation**：突出企业检索、嵌入与重排。
4. **Stability AI Developer Platform**：覆盖独立图像生成平台。
5. **Runway API documentation**：覆盖异步视频生成工作流。
6. **xAI API documentation**：记录另一条主流模型服务路线。
7. **GroqCloud documentation**：代表低延迟专用推理服务。
8. **Perplexity API documentation**：覆盖检索原生与引用型 API。
9. **Adobe Firefly Services documentation**：覆盖企业内容生产与图像编辑。
10. **Mosaic AI documentation**：连接数据、模型、Agent、评测和治理。
