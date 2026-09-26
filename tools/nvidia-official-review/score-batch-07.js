"use strict";

const { runScoreBatch } = require("./score-batch-runner");

const definitions = [
  [3,3,2,2,"多头、多查询与分组查询注意力的结构和 KV 共享权衡直接影响模型兼容性、显存和推理吞吐。"],
  [1,2,1,1,"trtllm-bench 页面较短，完整 benchmark 方法已由开发指南专题覆盖。"],
  [2,2,1,2,"AutoDeploy 的 KV cache 架构补充自动部署管线中的缓存所有权和运行时边界。"],
  [2,2,2,2,"Pipeline Cache 复用编译与转换结果，明确缓存键、失效和跨运行复用设计。"],
  [2,2,1,1,"Cache Initialization Stage 深入说明缓存初始化 transform，属于编译管线实现补充。"],
  [2,2,2,2,"checkpoint loading 的格式、映射和加载路径决定模型启动时间与权重兼容性。"],
  [3,3,2,2,"TensorRT-LLM 的解耦服务主功能页明确 prefill/decode 角色、KV 传输和部署关系。"],
  [2,2,2,2,"Encoder-only embedding 模型支持补足生成式推理之外的检索与向量编码路径。"],
  [2,1,1,1,"Helix 功能页较短，机制已由上一批保留的完整 Helix 技术文章覆盖。"],
  [3,3,2,2,"KV cache compression 主功能页定义压缩策略、适用边界与运行时接口。"],
  [3,3,2,2,"KV Cache Connector 提供跨进程或服务交换缓存状态的标准集成契约。"],
  [3,3,2,2,"KV Cache System 统一块管理、复用、淘汰和跨请求生命周期，是推理运行时核心。"],
  [2,2,1,2,"ModelExpress 提供更快的 checkpoint 解释和加载路径，补充大模型冷启动优化。"],
  [2,1,1,1,"多模态支持页较短，且已有更完整的多模态服务与生成优化资料。"],
  [1,1,1,1,"Overlap Scheduler 页面仅 1,490 字，不能支撑独立架构结论。"],
  [3,3,2,2,"Paged Attention、in-flight batching 与请求调度的组合是高吞吐连续批处理核心。"],
  [3,3,2,2,"Tensor、pipeline、expert 等并行策略的组合与约束决定大模型跨 GPU 执行架构。"],
  [2,2,2,2,"前缀 tokenization cache 避免重复文本预处理，补充 KV cache 之前的前端复用层。"],
  [3,3,2,2,"量化主功能页汇总支持格式、校准与执行边界，是当前 TensorRT-LLM 压缩入口。"],
  [3,3,2,2,"Sparse Attention 主功能页说明模式、配置与运行时支持，承担当前能力边界。"],
  [3,3,2,2,"Sub-agent routing 根据代理身份与会话特征分配服务资源，提供面向多代理工作负载的新路由机制。"],
  [3,3,2,2,"Torch compile 与分段 prefill CUDA Graph 结合，减少动态图和不同批次形状的启动开销。"],
  [2,2,0,1,"VisualGen CUDA Graph 仍为 Beta，且绑定特定视觉生成路径，持久性不足。"],
  [2,2,0,1,"VisualGen Quantized Attention 仍为 Beta，正式量化和视频优化资料已覆盖主要机制。"],
  [2,2,0,1,"VisualGen Sparse Attention 仍为 Beta，通用 Sparse Attention 主资料更稳定。"],
  [3,3,2,2,"自定义 kernel 的注册、编译和集成接口支持在不破坏运行时契约的情况下扩展算子。"],
  [1,2,1,1,"Torch Architecture Overview 内容较短，主架构总览已在开发指南中保留。"],
  [2,2,2,2,"Torch attention 实现补充后端算子选择、张量布局和执行路径细节。"],
  [2,1,1,1,"Torch checkpoint loading 与通用 checkpoint loading 页面重复。"],
  [1,1,1,1,"Torch Overlap Scheduler 正文不足千字，无法形成独立资料。"],
  [1,1,1,1,"Torch Quantization 正文仅 564 字，完整量化主资料已覆盖。"],
  [2,2,1,2,"Torch KV Cache Manager 说明块分配、序列状态与回收的后端实现接口。"],
  [2,2,2,2,"Torch Scheduler 定义等待、运行和完成请求的选择与批次形成机制。"],
  [3,0,0,0,"Triton Architecture 深链返回 404，条目不可访问。"],
  [3,0,0,0,"Triton Batcher 深链返回 404，条目不可访问。"],
  [2,0,0,0,"Triton Metrics 深链返回 404，条目不可访问。"],
  [3,0,0,0,"Triton Performance Tuning 深链返回 404，条目不可访问。"],
  [2,0,0,0,"Triton Ragged Batching 深链返回 404，条目不可访问。"],
  [2,0,0,0,"Triton Response Cache 深链返回 404，条目不可访问。"],
  [3,0,0,0,"Triton Scheduler 深链返回 404，条目不可访问。"]
];

runScoreBatch(7, definitions);
