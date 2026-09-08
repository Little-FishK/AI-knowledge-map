/* AI Knowledge Map — authoritative bilingual terminology decisions. */
(function registerTerminology(root) {
  "use strict";

  function approved(displayTitle, details = {}) {
    return Object.freeze({
      displayTitle,
      canonicalTerms: Object.freeze([...(details.canonicalTerms || [displayTitle])]),
      acceptedAliases: Object.freeze([...(details.acceptedAliases || [])]),
      avoid: Object.freeze([...(details.avoid || [])]),
      context: details.context || "graph-node",
      note: details.note || "",
      references: Object.freeze([...(details.references || ["project-published"])]),
      status: "approved",
      standardsReview: details.standardsReview || "pending",
    });
  }

  function externallyReviewed(displayTitle, sourceReferences = ["google-ml-glossary"], details = {}) {
    return approved(displayTitle, {
      ...details,
      references: ["project-published", ...sourceReferences],
      standardsReview: "reviewed",
    });
  }

  const nodeTerms = Object.freeze({
    attention: externallyReviewed("Attention"),
    transformer: externallyReviewed("Transformer"),
    llm: externallyReviewed("Large Language Model (LLM)", ["google-ml-glossary"], {
      acceptedAliases: ["Large Language Model", "LLM"],
      note: "Spell out the term on first use; LLM is acceptable afterwards.",
    }),
    embedding: externallyReviewed("Embedding"),
    "context-window": externallyReviewed("Context Window"),
    "fine-tuning": externallyReviewed("Fine-tuning", ["google-ml-glossary"], {
      avoid: ["Fine Tuning", "Finetuning"],
      note: "Use the hyphenated form consistently.",
    }),
    "neural-network": externallyReviewed("Neural Network"),
    backprop: externallyReviewed("Backpropagation", ["google-ml-glossary"], {
      acceptedAliases: ["Backprop", "BP"],
      note: "Use Backpropagation in titles and on first use; Backprop is acceptable afterwards.",
    }),
    "vanishing-gradient": externallyReviewed("Vanishing Gradient Problem", ["google-ml-glossary"], {
      canonicalTerms: ["Vanishing Gradient Problem", "Exploding Gradient Problem"],
      acceptedAliases: ["Vanishing Gradients", "Exploding Gradients"],
      note: "The page centers on vanishing gradients and also explains the opposite failure mode, exploding gradients.",
    }),
    "batch-norm": externallyReviewed("Batch Normalization (BatchNorm)", ["google-ml-glossary"], {
      canonicalTerms: ["Batch Normalization"],
      acceptedAliases: ["BatchNorm", "BN"],
      avoid: ["Layer Normalization", "LayerNorm"],
      note: "Layer normalization is a related but distinct method and must not be treated as an alias.",
    }),
    "optimizer-schedule": externallyReviewed("Optimizers and Learning Rate Schedules", ["google-ml-glossary", "adam-paper"], {
      canonicalTerms: ["Optimizer", "Learning Rate Schedule"],
      acceptedAliases: ["Optimization Algorithm", "Learning Rate Scheduler"],
    }),
    "residual-connection": externallyReviewed("Residual Connection", ["resnet-paper"], {
      acceptedAliases: ["Skip Connection", "Shortcut Connection"],
      note: "Residual connection is the preferred project term; skip connection is accepted when the broader bypass pattern is intended.",
    }),
    cnn: externallyReviewed("Convolutional Neural Network (CNN)", ["google-ml-glossary"], {
      canonicalTerms: ["Convolutional Neural Network"],
      acceptedAliases: ["CNN", "Convolutional Network"],
    }),
    rnn: externallyReviewed("Recurrent Neural Network (RNN)", ["google-ml-glossary"], {
      canonicalTerms: ["Recurrent Neural Network"],
      acceptedAliases: ["RNN", "Recurrent Network"],
      note: "LSTM and GRU are variants, not aliases for every recurrent neural network.",
    }),
    tokenization: externallyReviewed("Tokens and Tokenization", ["subword-tokenization-paper"], {
      canonicalTerms: ["Token", "Tokenization"],
      acceptedAliases: ["Subword Tokenization"],
      note: "A tokenizer performs tokenization; it is the component, not a synonym for the process.",
    }),
    "positional-encoding": externallyReviewed("Positional Encoding and RoPE", ["attention-paper", "rope-paper"], {
      canonicalTerms: ["Positional Encoding", "Rotary Position Embedding (RoPE)"],
      acceptedAliases: ["Position Embedding", "RoPE"],
      note: "Use Rotary Position Embedding for the expansion of RoPE; positional encoding is the broader family.",
    }),
    normalization: externallyReviewed("Layer Normalization and RMSNorm", ["layer-norm-paper", "rmsnorm-paper"], {
      canonicalTerms: ["Layer Normalization", "Root Mean Square Layer Normalization (RMSNorm)"],
      acceptedAliases: ["LayerNorm", "RMSNorm"],
      avoid: ["Batch Normalization", "BatchNorm"],
      note: "Batch normalization is a related but distinct method and must not be treated as an alias.",
    }),
    "state-space-models": externallyReviewed("State Space Models and Mamba", ["mamba-paper"], {
      canonicalTerms: ["State Space Model (SSM)", "Mamba"],
      acceptedAliases: ["SSM", "Selective State Space Model"],
      note: "Mamba is a selective state space architecture, not a synonym for every state space model.",
    }),
    "self-supervised-learning": externallyReviewed("Self-supervised Learning", ["self-supervised-learning-paper"], {
      acceptedAliases: ["SSL", "Self-supervision"],
      avoid: ["Unsupervised Learning"],
      note: "Self-supervised learning constructs explicit targets from the data itself; it is not interchangeable with the broader unsupervised-learning category.",
    }),
    "contrastive-learning": externallyReviewed("Contrastive Learning", ["simclr-paper"], {
      acceptedAliases: ["Contrastive Representation Learning"],
      avoid: ["Contrastive Loss"],
      note: "A contrastive loss is an objective used by contrastive learning, not a synonym for the complete learning approach.",
    }),
    clip: externallyReviewed("CLIP (Contrastive Language–Image Pre-training)", ["clip-paper"], {
      canonicalTerms: ["CLIP", "Contrastive Language–Image Pre-training"],
      acceptedAliases: ["Contrastive Language-Image Pre-training"],
      avoid: ["Contrastive Learning", "Image–Text Alignment"],
      note: "CLIP is a specific model and training approach; contrastive learning and image–text alignment are broader concepts.",
    }),
    "peft-lora": externallyReviewed("Parameter-Efficient Fine-Tuning (PEFT) and LoRA", ["lora-paper", "qlora-paper"], {
      canonicalTerms: ["Parameter-Efficient Fine-Tuning (PEFT)", "Low-Rank Adaptation (LoRA)", "Quantized Low-Rank Adaptation (QLoRA)"],
      acceptedAliases: ["PEFT", "LoRA", "QLoRA"],
      avoid: ["Parameter Efficient Fine Tuning", "Low Rank Adaptation"],
      note: "LoRA and QLoRA are methods within the PEFT family, not synonyms for the entire family. Keep the project-standard hyphenation.",
    }),
    distillation: externallyReviewed("Knowledge Distillation", ["knowledge-distillation-paper"], {
      acceptedAliases: ["Model Distillation", "Distillation"],
      avoid: ["Model Compression", "Fine-tuning"],
      note: "Knowledge distillation is one model-compression approach; model compression is the broader category.",
    }),
    "distributed-training": externallyReviewed("Distributed Training and Parallelism Strategies", ["megatron-distributed-training-paper"], {
      canonicalTerms: ["Distributed Training", "Data Parallelism", "Tensor Parallelism", "Pipeline Parallelism"],
      acceptedAliases: ["Distributed Model Training"],
      avoid: ["Parallel Computing"],
      note: "Parallel computing is the broader field; this page specifically covers distributed model training and its parallelism strategies.",
    }),
    "synthetic-data": externallyReviewed("Synthetic Data", ["synthetic-data-collapse-paper"], {
      canonicalTerms: ["Synthetic Data"],
      acceptedAliases: ["Synthetic Training Data", "AI-generated Training Data"],
      avoid: ["Data Augmentation"],
      note: "Data augmentation can transform real examples and is not interchangeable with model-generated synthetic training data.",
    }),
    quantization: externallyReviewed("Model Quantization", ["gptq-paper"], {
      canonicalTerms: ["Model Quantization", "Weight Quantization"],
      acceptedAliases: ["Weight Quantization", "Low-precision Quantization"],
      avoid: ["GGUF", "GPTQ", "AWQ"],
      note: "GGUF is a format and GPTQ/AWQ are particular approaches; none is a synonym for the broader quantization concept.",
    }),
    moe: externallyReviewed("Mixture of Experts (MoE)", ["sparse-moe-paper"], {
      canonicalTerms: ["Mixture of Experts (MoE)"],
      acceptedAliases: ["Mixture of Experts", "MoE", "Sparse Mixture of Experts"],
      avoid: ["Sparse Model"],
      note: "Sparse model is broader than mixture-of-experts architectures and must not be used as an exact alias.",
    }),
    "model-merging": externallyReviewed("Model Merging and Adapter Composition", ["task-arithmetic-paper", "ties-merging-paper"], {
      canonicalTerms: ["Model Merging", "Adapter Composition", "Task Arithmetic"],
      acceptedAliases: ["Adapter Merging", "Task Arithmetic"],
      avoid: ["Model Ensemble"],
      note: "Model ensembles combine outputs at inference; model merging combines parameters or parameter updates into one model.",
    }),
    "scaling-law": externallyReviewed("Scaling Laws", ["neural-scaling-laws-paper", "chinchilla-paper"], {
      canonicalTerms: ["Neural Scaling Law", "Compute-optimal Scaling"],
      acceptedAliases: ["Neural Scaling Laws", "Language-model Scaling Laws"],
      avoid: ["Scale-up"],
      note: "The page covers empirical power-law relationships and compute-optimal allocation, not the generic act of scaling a system.",
    }),
    "model-families": approved("Major Model Families", {
      canonicalTerms: ["Model Family", "Open-weight Model", "Proprietary Model"],
      acceptedAliases: ["Model Families", "LLM Families"],
      avoid: ["Claude", "GPT", "Gemini", "Llama", "Open-source Model"],
      note: "Product-family names are examples, not aliases. Use open-weight when access to model weights is the intended distinction.",
    }),
    "lost-in-middle": externallyReviewed("Lost in the Middle", ["lost-middle-paper"], {
      canonicalTerms: ["Lost-in-the-middle Effect"],
      acceptedAliases: ["Lost-in-the-middle Effect", "Middle-position Degradation"],
      avoid: ["Context-window Limit"],
      note: "The effect concerns position-dependent use of long context, not merely exceeding a context-window length limit.",
    }),
    "in-context-learning": externallyReviewed("In-context Learning (ICL)", ["gpt3-paper"], {
      canonicalTerms: ["In-context Learning (ICL)"],
      acceptedAliases: ["In-context Learning", "ICL", "Few-shot In-context Learning"],
      avoid: ["Fine-tuning", "Few-shot Learning"],
      note: "Few-shot prompting is a common setup for in-context learning, but few-shot learning is the broader category and is not an exact alias.",
    }),
    "sampling-params": externallyReviewed("Sampling and Decoding Parameters", ["huggingface-generation-docs"], {
      canonicalTerms: ["Sampling Parameter", "Decoding Parameter", "Temperature", "Top-k Sampling", "Nucleus Sampling (Top-p)"],
      acceptedAliases: ["Decoding Parameters", "Generation Parameters"],
      avoid: ["Temperature", "Top-p", "Top-k"],
      note: "Temperature, top-p, and top-k are individual controls covered by the page, not aliases for the whole parameter family.",
    }),
    logprobs: externallyReviewed("Token Log Probabilities and Confidence", ["openai-logprobs-docs"], {
      canonicalTerms: ["Token Log Probability", "Confidence Estimation"],
      acceptedAliases: ["Logprobs", "Token Logprobs"],
      avoid: ["Accuracy", "Calibration"],
      note: "Token log probabilities are model likelihood signals, not guarantees of factual correctness. Calibration is a related evaluation process, not an alias.",
    }),
    "system-prompt": externallyReviewed("System Prompts and Role Prompting", ["anthropic-prompting-docs"], {
      canonicalTerms: ["System Prompt", "Role Prompting"],
      acceptedAliases: ["Role Prompt"],
      avoid: ["Role-play"],
      note: "Role prompting is a common use of system-level instructions; role-play is a broader behavior and is not the preferred technical label.",
    }),
    "context-engineering": externallyReviewed("Context Engineering", ["anthropic-context-engineering"], {
      acceptedAliases: ["Context Management", "Context Construction"],
      avoid: ["Prompt Engineering"],
      note: "Context engineering manages the full information set supplied to a model; prompt engineering is a related but narrower practice.",
    }),
    "constrained-decoding": externallyReviewed("Constrained Decoding", ["grammar-constrained-decoding-paper"], {
      acceptedAliases: ["Grammar-constrained Decoding", "Grammar-guided Decoding"],
      avoid: ["Structured Output"],
      note: "Constrained decoding is a generation-time mechanism that can implement structured output; structured output is the broader product requirement.",
    }),
    "structured-output": externallyReviewed("Structured Outputs", ["openai-structured-outputs-docs"], {
      canonicalTerms: ["Structured Output", "Schema-constrained Output"],
      acceptedAliases: ["Structured Output", "Schema-constrained Output"],
      avoid: ["JSON Mode"],
      note: "JSON mode is a narrower format control and must not be treated as equivalent to schema-conforming structured outputs.",
    }),
    streaming: externallyReviewed("Streaming Output", ["openai-streaming-docs"], {
      canonicalTerms: ["Response Streaming"],
      acceptedAliases: ["Streaming", "Token Streaming"],
      avoid: ["Realtime API", "Server-Sent Events"],
      note: "Server-Sent Events is one transport commonly used for streaming, while a realtime API is a broader interaction surface.",
    }),
    prefilling: externallyReviewed("Assistant Response Prefilling", ["anthropic-prompting-docs"], {
      canonicalTerms: ["Assistant Response Prefilling"],
      acceptedAliases: ["Response Prefill", "Assistant Prefill"],
      avoid: ["Prefill Phase", "Prompt Prefilling"],
      note: "This page concerns supplying the beginning of an assistant response. It is distinct from the inference prefill phase, and support is provider- and model-specific.",
    }),
    "prompt-caching": externallyReviewed("Prompt Caching", ["anthropic-prompt-caching-docs"], {
      acceptedAliases: ["Prefix Caching", "Cross-request KV Cache Reuse"],
      avoid: ["KV Cache"],
      note: "Prompt caching reuses work for matching prefixes across requests; a KV cache is the broader inference mechanism and is also used within a request.",
    }),
    "context-compaction": externallyReviewed("Context Compaction", ["anthropic-context-engineering"], {
      canonicalTerms: ["Context Compaction", "Context Summarization"],
      acceptedAliases: ["Conversation Compaction"],
      avoid: ["Prompt Compression"],
      note: "Context compaction is long-horizon context maintenance that summarizes or removes older material; prompt compression is a broader and potentially different technique.",
    }),
    "inference-optimization": externallyReviewed("LLM Inference Optimization", ["flashattention-paper", "vllm-paper", "speculative-decoding-paper"], {
      canonicalTerms: ["LLM Inference Optimization"],
      acceptedAliases: ["Inference Optimization", "LLM Serving Optimization"],
      avoid: ["KV Cache", "FlashAttention", "Speculative Decoding"],
      note: "KV caching, FlashAttention, and speculative decoding are component techniques covered by this page, not aliases for the full optimization area.",
    }),
    "model-selection": externallyReviewed("Model Selection and Cost", ["openai-agent-guide"], {
      canonicalTerms: ["Model Selection", "Inference Cost"],
      acceptedAliases: ["Model Selection", "Cost Optimization"],
      avoid: ["Model Routing"],
      note: "Model selection is the broader task-level or system-level choice. Request-level model routing is covered by a separate node.",
    }),
    "model-routing": externallyReviewed("Model Routing and Cascades", ["frugalgpt-paper"], {
      canonicalTerms: ["Model Routing", "Model Cascade"],
      acceptedAliases: ["LLM Router", "Model Cascade", "LLM Cascade"],
      avoid: ["Mixture of Experts", "MoE"],
      note: "Model routing chooses among complete models or services at the application layer; mixture-of-experts routing happens within one model.",
    }),
    "vector-db": externallyReviewed("Vector Databases", ["hnsw-paper"], {
      canonicalTerms: ["Vector Database", "Approximate Nearest Neighbor (ANN) Search"],
      acceptedAliases: ["Vector Store"],
      avoid: ["Vector Search", "Embedding Database"],
      note: "Vector search is a capability, while a vector database is a storage and retrieval system that commonly implements that capability.",
    }),
    chunking: externallyReviewed("Document Chunking", ["graphrag-inputs-docs"], {
      canonicalTerms: ["Document Chunking"],
      acceptedAliases: ["Text Chunking", "Chunking"],
      avoid: ["Tokenization", "Document Segmentation"],
      note: "This page concerns retrieval-oriented document chunking. Tokenization operates at a different representation level.",
    }),
    reranking: externallyReviewed("Reranking", ["sentence-transformers-reranking-docs"], {
      canonicalTerms: ["Retrieval Reranking", "Cross-encoder Reranker"],
      acceptedAliases: ["Retrieval Reranking", "Second-stage Reranking"],
      avoid: ["Cross-encoder", "Retrieval"],
      note: "A cross-encoder is a model architecture often used for reranking, not an exact alias for the complete reranking stage.",
    }),
    "advanced-rag": externallyReviewed("Advanced RAG", ["microsoft-graphrag-docs"], {
      canonicalTerms: ["Query Rewriting", "GraphRAG", "Agentic RAG", "Iterative Retrieval"],
      acceptedAliases: ["Advanced Retrieval-Augmented Generation"],
      avoid: ["RAG", "GraphRAG"],
      note: "GraphRAG is one advanced RAG technique covered by the page, not an alias for the full family of query and retrieval enhancements.",
    }),
    "knowledge-graph": externallyReviewed("Knowledge Graphs and GraphRAG", ["microsoft-graphrag-docs"], {
      canonicalTerms: ["Knowledge Graph", "GraphRAG"],
      acceptedAliases: ["Graph-based RAG"],
      avoid: ["Graph Database", "Vector Database"],
      note: "A graph database can store a knowledge graph but is not identical to the semantic entity-and-relation model itself.",
    }),
    citations: externallyReviewed("Citations and Source Attribution", ["anthropic-citations-docs"], {
      canonicalTerms: ["Citation", "Source Attribution"],
      acceptedAliases: ["Source Citations", "Document Attribution"],
      avoid: ["Grounded Answers", "References"],
      note: "Grounding is the broader requirement that claims be supported; citations expose specific source locations that readers can verify.",
    }),
    evaluation: externallyReviewed("LLM Application Evaluation", ["openai-evals-guide", "llm-judge-bias-paper"], {
      canonicalTerms: ["LLM Application Evaluation", "LLM-as-a-judge"],
      acceptedAliases: ["Evals", "LLM Evaluation"],
      avoid: ["Model Benchmarking", "Model Evaluation"],
      note: "This page evaluates an end-to-end LLM application. Model benchmarks and model-only evaluation are narrower or differently scoped.",
    }),
    observability: externallyReviewed("LLM Observability and Tracing", ["opentelemetry-genai-conventions"], {
      canonicalTerms: ["LLM Observability", "Tracing"],
      acceptedAliases: ["AI Observability", "LLM Tracing"],
      avoid: ["Monitoring", "Logging"],
      note: "Monitoring and logging are constituent signals; observability is the broader ability to understand system behavior from telemetry.",
    }),
    deployment: externallyReviewed("Model Deployment Options", ["openai-agent-guide"], {
      canonicalTerms: ["Model Deployment", "Cloud API", "Self-hosting", "Edge Deployment"],
      acceptedAliases: ["Model Deployment", "Deployment Options"],
      avoid: ["Serving", "Inference"],
      note: "Serving and inference are parts of operating a model; this page compares broader deployment arrangements and their trade-offs.",
    }),
    "data-drift-monitoring": externallyReviewed("Data Drift, Concept Drift, and Continuous Monitoring", ["concept-drift-review"], {
      canonicalTerms: ["Data Drift", "Concept Drift", "Continuous Monitoring"],
      acceptedAliases: ["Drift Monitoring", "Model Monitoring"],
      avoid: ["Model Drift"],
      note: "Data drift changes the input distribution; concept drift changes the relationship between inputs and target outputs. Keep the distinction explicit.",
    }),
    "uncertainty-calibration": externallyReviewed("Uncertainty Calibration and Selective Prediction", ["neural-calibration-paper", "selective-classification-paper"], {
      canonicalTerms: ["Uncertainty Calibration", "Selective Prediction"],
      acceptedAliases: ["Confidence Calibration", "Selective Classification"],
      avoid: ["Logprobs", "Abstention"],
      note: "Token log probabilities can be an input signal but are not calibrated correctness probabilities. Abstention is an action enabled by selective prediction.",
    }),
    privacy: externallyReviewed("Privacy and Data Compliance", ["training-data-extraction-paper", "nist-privacy-framework"], {
      canonicalTerms: ["Data Privacy", "Data Compliance", "Personally Identifiable Information (PII)"],
      acceptedAliases: ["AI Privacy", "Privacy Compliance"],
      avoid: ["Machine Unlearning", "Data Security"],
      note: "Machine unlearning is one possible response to deletion requirements, and data security is a related but distinct discipline.",
    }),
    guardrails: externallyReviewed("AI Guardrails", ["openai-agent-guide"], {
      canonicalTerms: ["AI Guardrail", "Layered Defense"],
      acceptedAliases: ["LLM Guardrails", "Input and Output Guardrails"],
      avoid: ["Safety Filter", "Access Control"],
      note: "Safety filters are one guardrail layer. Guardrails supplement rather than replace authentication, authorization, and access control.",
    }),
    "self-consistency": externallyReviewed("Self-consistency", ["self-consistency-paper"], {
      canonicalTerms: ["Self-consistency Decoding"],
      acceptedAliases: ["Self-consistency Decoding", "Multi-path Voting"],
      avoid: ["Majority Voting", "Ensembling"],
      note: "Voting is the aggregation operation; self-consistency specifically samples diverse reasoning paths and selects their most consistent answer.",
    }),
    "tree-of-thoughts": externallyReviewed("Tree of Thoughts (ToT)", ["tree-of-thoughts-paper"], {
      canonicalTerms: ["Tree of Thoughts (ToT)"],
      acceptedAliases: ["Tree of Thoughts", "ToT"],
      avoid: ["Chain of Thought", "Thought Tree"],
      note: "Tree of Thoughts extends linear chain-of-thought reasoning with explicit search, evaluation, and backtracking.",
    }),
    reflection: externallyReviewed("Reflection and Self-critique", ["reflexion-paper"], {
      canonicalTerms: ["Reflection", "Self-critique"],
      acceptedAliases: ["Self-reflection", "Self-critique"],
      avoid: ["Reflexion"],
      note: "Reflexion is a specific named framework that uses stored verbal feedback; it is not an exact alias for every reflection or self-critique loop.",
    }),
    planning: externallyReviewed("Planning and Task Decomposition", ["openai-agent-guide"], {
      canonicalTerms: ["Planning", "Task Decomposition", "Replanning"],
      acceptedAliases: ["Agent Planning", "Task Decomposition"],
      avoid: ["Chain of Thought", "Workflow"],
      note: "Planning determines and orders actions; chain-of-thought decomposes reasoning, while a workflow may be predetermined rather than planned dynamically.",
    }),
    "agent-loop": externallyReviewed("Agent Loop", ["openai-agent-guide"], {
      canonicalTerms: ["Agent Loop", "Exit Condition"],
      acceptedAliases: ["Agentic Loop", "Perceive–Reason–Act Loop"],
      avoid: ["ReAct Loop", "Workflow"],
      note: "ReAct is one reasoning-and-acting pattern that can implement an agent loop; it is not the name of every agent execution loop.",
    }),
    react: externallyReviewed("ReAct: Reasoning and Acting", ["react-paper"], {
      canonicalTerms: ["ReAct", "Reasoning and Acting"],
      acceptedAliases: ["ReAct", "Reasoning-and-acting Pattern"],
      avoid: ["React", "Agent Loop"],
      note: "Preserve the internal capital A in ReAct. The method interleaves reasoning traces and task-specific actions; an agent loop is the broader execution structure.",
    }),
    "code-execution": externallyReviewed("Code Execution and Sandboxing", ["openai-code-interpreter-docs"], {
      canonicalTerms: ["Code Execution", "Sandboxing"],
      acceptedAliases: ["Code Interpreter", "Sandboxed Code Execution"],
      avoid: ["Shell Access", "Code Generation"],
      note: "Code generation creates code; code execution runs it. Shell access is one execution interface and is not synonymous with a sandbox.",
    }),
    "mcp-architecture": externallyReviewed("MCP Architecture", ["mcp-architecture-docs"], {
      canonicalTerms: ["MCP Host", "MCP Client", "MCP Server", "Stdio Transport", "Streamable HTTP Transport"],
      acceptedAliases: ["MCP Client–Server Architecture"],
      avoid: ["SSE Transport", "HTTP/SSE Transport"],
      note: "Current MCP terminology uses Streamable HTTP, optionally with Server-Sent Events for streaming. SSE is not a separate current transport alongside HTTP.",
    }),
    "agent-frameworks": externallyReviewed("Agent Frameworks", ["openai-agent-orchestration"], {
      canonicalTerms: ["Agent Framework", "Agent SDK"],
      acceptedAliases: ["Agent Frameworks", "Agent SDKs"],
      avoid: ["Multi-agent System"],
      note: "Frameworks and SDKs provide scaffolding for agent loops, state, tools, and orchestration; they are not synonymous with multi-agent systems.",
    }),
    "agent-memory": externallyReviewed("Agent Memory", ["openai-agent-sessions"], {
      canonicalTerms: ["Agent Memory", "Short-term Memory", "Long-term Memory", "Episodic Memory", "Semantic Memory"],
      acceptedAliases: ["Memory"],
      avoid: ["Context Window"],
      note: "Conversation sessions and durable learned memory are distinct implementations. The context window is a working-state carrier, not a synonym for memory.",
    }),
    "agent-skills": externallyReviewed("Agent Skills", ["agent-skills-specification", "openai-codex-skills"], {
      canonicalTerms: ["Agent Skill"],
      acceptedAliases: ["Skills", "Reusable Capability Package"],
      avoid: ["Tool", "Agent Framework"],
      note: "A skill packages instructions and optional resources or scripts; it is broader than one tool and different from the framework hosting the agent.",
    }),
    "workflow-orchestration": externallyReviewed("Workflow Orchestration", ["openai-agent-orchestration"], {
      canonicalTerms: ["Workflow Orchestration", "Directed Acyclic Graph (DAG)"],
      acceptedAliases: ["Workflow", "DAG"],
      avoid: ["Autonomous Agent"],
      note: "The page contrasts code-defined workflows with model-directed autonomy while allowing hybrid designs.",
    }),
    "multi-agent": externallyReviewed("Multi-agent Orchestration", ["openai-agent-orchestration"], {
      canonicalTerms: ["Multi-agent Orchestration", "Manager Pattern", "Handoff"],
      acceptedAliases: ["Multi-agent System", "Agents as Tools", "Handoffs"],
      avoid: ["Workflow Orchestration"],
      note: "Manager-style agents-as-tools and handoffs differ in who retains control of the user-facing run.",
    }),
    "human-in-the-loop": externallyReviewed("Human-in-the-loop (HITL)", ["openai-human-in-the-loop"], {
      canonicalTerms: ["Human-in-the-loop"],
      acceptedAliases: ["HITL", "Human Approval", "Human Oversight"],
      avoid: ["Human on the Loop"],
      note: "Use the hyphenated form for the established compound term. This page focuses on approval and intervention gates for consequential actions.",
    }),
    "computer-use": externallyReviewed("Computer Use", ["openai-computer-use"], {
      canonicalTerms: ["Computer Use"],
      acceptedAliases: ["GUI Agent", "Browser Use"],
      avoid: ["Robotic Process Automation"],
      note: "Computer use operates graphical interfaces through visual observations and actions; it is not identical to deterministic RPA.",
    }),
    "coding-tools": externallyReviewed("AI Coding Tools", ["openai-codex-introduction"], {
      canonicalTerms: ["AI Coding Tool", "Coding Agent"],
      acceptedAliases: ["AI Coding Assistant", "Coding Agent"],
      avoid: ["Code Generation"],
      note: "Code generation is one capability; an AI coding tool may also inspect repositories, edit files, execute commands, and run tests.",
    }),
    vae: externallyReviewed("Variational Autoencoder (VAE)", ["vae-paper"], {
      canonicalTerms: ["Variational Autoencoder"],
      acceptedAliases: ["VAE"],
      avoid: ["Autoencoder", "Latent Space"],
      note: "An ordinary autoencoder is a broader, distinct model family, and latent space is a component rather than an alias.",
    }),
    gan: externallyReviewed("Generative Adversarial Network (GAN)", ["gan-paper"], {
      canonicalTerms: ["Generative Adversarial Network"],
      acceptedAliases: ["GAN", "Adversarial Generative Model"],
      avoid: ["Adversarial Generation"],
      note: "Spell out the established term on first use; GAN is acceptable afterwards.",
    }),
    "flow-matching": externallyReviewed("Flow Matching and Rectified Flow", ["flow-matching-paper", "rectified-flow-paper"], {
      canonicalTerms: ["Flow Matching", "Rectified Flow"],
      acceptedAliases: ["Flow-based Generative Modeling"],
      avoid: ["Diffusion Model"],
      note: "Rectified Flow is one member of the broader flow-matching family; flow matching and diffusion can be closely related but are not interchangeable labels.",
    }),
    "controllable-generation": externallyReviewed("Controllable Generation", ["controlnet-paper"], {
      canonicalTerms: ["Controllable Generation", "ControlNet"],
      acceptedAliases: ["Conditional Control"],
      note: "ControlNet is a specific architecture for spatial conditioning, not a synonym for the whole controllable-generation category.",
    }),
    "image-editing": externallyReviewed("Image Editing", ["instruct-pix2pix-paper", "latent-diffusion-paper"], {
      canonicalTerms: ["Image Editing", "Inpainting", "Instruction-based Image Editing"],
      acceptedAliases: ["Image-to-image Editing", "Inpainting"],
      avoid: ["Image Generation"],
      note: "The page covers editing an existing image. Inpainting and instruction-based editing are important subtypes, not replacements for every image-editing task.",
    }),
    "super-resolution": externallyReviewed("Image Super-resolution and Restoration", ["srgan-paper", "latent-diffusion-paper"], {
      canonicalTerms: ["Image Super-resolution", "Image Restoration"],
      acceptedAliases: ["Super-resolution", "Upscaling", "Image Restoration"],
      avoid: ["Image Enhancement"],
      note: "Image enhancement is broader. Generative super-resolution may synthesize plausible detail and must not be described as recovering evidence that was never captured.",
    }),
    "video-generation": externallyReviewed("Video Generation", ["video-diffusion-paper", "openai-sora-report"], {
      canonicalTerms: ["Video Generation", "Text-to-video Generation", "Image-to-video Generation"],
      acceptedAliases: ["Text-to-video", "Image-to-video"],
      avoid: ["Video Editing"],
      note: "Text-to-video and image-to-video are conditioning modes within video generation; editing an existing video is a distinct task.",
    }),
    "gradient-descent": externallyReviewed("Gradient Descent"),
    overfitting: externallyReviewed("Overfitting"),
    "supervised-learning": externallyReviewed("Supervised Learning"),
    "unsupervised-learning": externallyReviewed("Unsupervised Learning"),
    "reinforcement-learning": externallyReviewed("Reinforcement Learning", ["google-ml-glossary"], {
      acceptedAliases: ["RL"],
      note: "An RL agent learns a policy; do not silently equate it with an LLM application agent.",
    }),
    regularization: externallyReviewed("Regularization"),
    "decision-tree": approved("Decision Trees and Ensemble Methods", {
      canonicalTerms: ["Decision Tree", "Ensemble Method"],
    }),
    clustering: externallyReviewed("Clustering"),
    "dimensionality-reduction": approved("Dimensionality Reduction"),
    "curse-of-dimensionality": approved("Curse of Dimensionality"),
    pretraining: externallyReviewed("Pre-training", ["google-ml-glossary"], {
      canonicalTerms: ["Pre-training"],
      acceptedAliases: ["Pretraining"],
      note: "Use the hyphenated form as the project default; the closed form is an accepted industry variant.",
    }),
    rag: externallyReviewed("Retrieval-Augmented Generation (RAG)", ["google-ml-glossary"], {
      acceptedAliases: ["Retrieval-Augmented Generation", "RAG"],
      note: "Spell out the term on first use; RAG is acceptable afterwards.",
    }),
    "prompt-engineering": externallyReviewed("Prompt Engineering"),
    retrieval: approved("Retrieval and Semantic Search", {
      canonicalTerms: ["Information Retrieval", "Semantic Search"],
    }),
    cot: externallyReviewed("Chain of Thought (CoT)", ["google-ml-glossary"], {
      canonicalTerms: ["Chain of Thought"],
      acceptedAliases: ["Chain of Thought", "CoT"],
      note: "Use CoT only after the expanded form has been established. Use the hyphenated form when it modifies another noun, as in chain-of-thought prompting.",
    }),
    agent: externallyReviewed("AI Agent", ["google-ml-glossary"], {
      canonicalTerms: ["Agent"],
      acceptedAliases: ["LLM Agent"],
      avoid: ["Intelligent Agent", "Proxy"],
      context: "LLM application",
      note: "Use AI Agent for the tool-using LLM application. Explicitly say RL agent in reinforcement-learning contexts.",
    }),
    "tool-calling": externallyReviewed("Tool Calling", ["openai-function-calling"], {
      canonicalTerms: ["Tool Calling"],
      acceptedAliases: ["Function Calling"],
      note: "Function calling is accepted as a platform-specific synonym or a specific kind of tool calling.",
    }),
    mcp: externallyReviewed("Model Context Protocol (MCP)", ["mcp-specification"], {
      acceptedAliases: ["Model Context Protocol", "MCP"],
      note: "Spell out the protocol name on first use.",
    }),
    diffusion: approved("Diffusion Models"),
    "image-generation": approved("Image Generation"),
    multimodal: externallyReviewed("Multimodal Models", ["google-ml-glossary"], {
      canonicalTerms: ["Multimodal Model"],
      acceptedAliases: ["Multimodal AI"],
      note: "Use Multimodal Models for this model-focused page; Multimodal AI names the broader field.",
    }),
    hallucination: externallyReviewed("Hallucination", ["google-ml-glossary"], {
      avoid: ["Illusion"],
      note: "Use factual error when the claim is specifically about incorrect facts rather than the broader failure mode.",
    }),
    "prompt-injection": approved("Prompt Injection"),
    alignment: approved("AI Alignment", {
      acceptedAliases: ["Alignment"],
      avoid: ["Alignment Training"],
      note: "Alignment training is a process and should not replace the name of the broader concept.",
    }),
    "reasoning-models": externallyReviewed("Reasoning Models", ["openai-reasoning-models"]),
    "code-generation": approved("Code Generation / AI Coding", {
      canonicalTerms: ["Code Generation", "AI Coding"],
      acceptedAliases: ["Code Generation", "AI Coding"],
    }),
    "loss-function": externallyReviewed("Loss Function"),
    "information-theory": approved("Information Theory and Entropy", {
      canonicalTerms: ["Information Theory", "Entropy"],
    }),
    "kernel-methods": approved("Kernel Methods and SVMs", {
      canonicalTerms: ["Kernel Method", "Support Vector Machine (SVM)"],
      acceptedAliases: ["Kernel Methods", "Support Vector Machines", "SVMs"],
    }),
    "post-training": approved("Post-training", {
      avoid: ["Post Training", "Posttraining"],
      note: "Use the hyphenated form consistently.",
    }),
    "model-evaluation": approved("Model Evaluation and Benchmarks", {
      canonicalTerms: ["Model Evaluation", "Benchmark"],
    }),
    "agent-identity-access": approved("Agent Identity, Authorization, and Secrets", {
      canonicalTerms: ["Agent Identity", "Authorization", "Secrets Management"],
    }),
    "training-data-governance": approved("Training Data Governance"),
    "test-time-compute": approved("Test-time Compute and Verifiers", {
      canonicalTerms: ["Test-time Compute", "Verifier"],
      acceptedAliases: ["Test-time Compute", "Inference-time Scaling"],
      avoid: ["Test Time Compute"],
    }),
    speech: externallyReviewed("Speech Recognition and Synthesis", ["openai-speech-models"], {
      canonicalTerms: ["Automatic Speech Recognition (ASR)", "Speech-to-text (STT)", "Text-to-speech (TTS)"],
      acceptedAliases: ["Speech Recognition", "Speech Synthesis", "ASR", "STT", "TTS"],
      note: "Recognition and synthesis are inverse tasks. Use their specific names when discussing only one direction.",
    }),
    "voice-cloning": externallyReviewed("Voice Cloning", ["sv2tts-paper", "valle-paper", "elevenlabs-voice-cloning", "ftc-voice-cloning", "asvspoof-plan"], {
      canonicalTerms: ["Voice Cloning", "Zero-shot Voice Cloning", "Speaker Embedding", "Speaker Similarity"],
      acceptedAliases: ["Voice Clone", "Zero-shot Voice Cloning"],
      avoid: ["Speech Synthesis"],
      note: "Voice cloning is speaker-conditioned speech synthesis; speech synthesis is the broader task, not an exact synonym.",
    }),
    "audio-generation": externallyReviewed("Audio and Music Generation", ["musicgen-paper"], {
      canonicalTerms: ["Audio Generation", "Music Generation"],
      acceptedAliases: ["Sound-effect Generation"],
      avoid: ["Speech Synthesis"],
      note: "This page focuses on non-speech generation. TTS is covered under speech recognition and synthesis.",
    }),
    "world-models": externallyReviewed("World Models and 3D Generation", ["world-models-paper", "openai-sora-report"], {
      canonicalTerms: ["World Model", "3D Generation"],
      acceptedAliases: ["World Models", "Text-to-3D", "Interactive World Generation"],
      avoid: ["Video Generation"],
      note: "World models and 3D generation are related but distinct families combined on this overview page; fixed video generation is not an exact synonym.",
    }),
    "content-detection": externallyReviewed("AI-generated Content Detection and Watermarking", ["nist-synthetic-content", "c2pa-specification"], {
      canonicalTerms: ["Synthetic Content Detection", "Digital Watermarking", "Content Provenance"],
      acceptedAliases: ["AI Content Detection", "AI Watermarking", "Deepfake Detection"],
      avoid: ["Provenance Detection"],
      note: "Detection estimates origin from content; watermarking embeds a signal; provenance records origin and edits. Do not collapse these mechanisms into one synonym.",
    }),
    interpretability: externallyReviewed("AI Interpretability", ["anthropic-interpretability", "nist-ai-rmf"], {
      canonicalTerms: ["Interpretability", "Mechanistic Interpretability", "Explainable AI (XAI)"],
      acceptedAliases: ["Interpretability", "Explainable AI", "XAI"],
      note: "Explainability and interpretability overlap in industry usage but are not identical in every research taxonomy.",
    }),
    jailbreak: externallyReviewed("Jailbreaking", ["nist-adversarial-ml", "owasp-prompt-injection"], {
      canonicalTerms: ["Jailbreaking"],
      acceptedAliases: ["Jailbreak", "Jailbreak Attack", "Safety Bypass"],
      avoid: ["Prompt Injection"],
      note: "This project reserves jailbreaking for bypassing model safety restrictions and prompt injection for instruction hijacking across a trust boundary.",
    }),
    "red-teaming": externallyReviewed("AI Red Teaming", ["nist-genai-profile"], {
      canonicalTerms: ["AI Red Teaming"],
      acceptedAliases: ["Red Teaming", "Adversarial Testing"],
      note: "Use AI Red Teaming when the AI-system context is not already explicit.",
    }),
    "data-poisoning": externallyReviewed("Data Poisoning", ["nist-adversarial-ml"], {
      canonicalTerms: ["Data Poisoning", "Backdoor Attack", "Trigger"],
      acceptedAliases: ["Poisoning Attack", "Training-data Poisoning"],
      avoid: ["Prompt Injection", "Backdoor"],
      note: "A backdoor is one possible outcome or subtype of poisoning, not a synonym for all data-poisoning attacks.",
    }),
    "adversarial-robustness": externallyReviewed("Adversarial Examples and Robustness", ["nist-adversarial-ml"], {
      canonicalTerms: ["Adversarial Example", "Adversarial Robustness"],
      acceptedAliases: ["Adversarial Examples", "Adversarial Attack", "Robustness"],
      note: "Adversarial robustness is the resistance property; an adversarial example is a crafted input used to test or attack it.",
    }),
    "bias-fairness": externallyReviewed("Bias and Fairness", ["nist-ai-rmf"], {
      canonicalTerms: ["Algorithmic Bias", "Algorithmic Fairness"],
      acceptedAliases: ["Bias", "Fairness"],
      note: "Fairness has multiple context-dependent definitions; do not imply that a single metric universally establishes fairness.",
    }),
    "reward-hacking": externallyReviewed("Reward Hacking", ["deepmind-specification-gaming"], {
      canonicalTerms: ["Reward Hacking", "Specification Gaming"],
      acceptedAliases: ["Specification Gaming", "Gaming the Reward"],
      avoid: ["Sycophancy"],
      note: "Sycophancy can result from preference optimization, but it is not synonymous with the broader reward-hacking problem.",
    }),
    rlhf: externallyReviewed("RLHF and Preference Alignment", ["instructgpt-paper", "dpo-paper"], {
      canonicalTerms: ["Reinforcement Learning from Human Feedback (RLHF)", "Direct Preference Optimization (DPO)", "Preference Alignment", "Reward Model"],
      acceptedAliases: ["RLHF", "DPO", "Preference Alignment"],
      note: "DPO is a related direct preference-optimization method and does not itself run reinforcement learning; do not define it as RLHF.",
    }),
    "constitutional-ai": externallyReviewed("Constitutional AI", ["constitutional-ai-paper"], {
      canonicalTerms: ["Constitutional AI", "Reinforcement Learning from AI Feedback (RLAIF)"],
      acceptedAliases: ["CAI", "RLAIF"],
      note: "RLAIF is a training component or broader method family used by Constitutional AI, not a universal synonym for the complete approach.",
    }),
    governance: externallyReviewed("AI Governance and Regulation", ["eu-ai-act", "nist-ai-rmf", "iso-iec-42001"], {
      canonicalTerms: ["AI Governance", "AI Regulation", "EU AI Act", "NIST AI RMF", "ISO/IEC 42001"],
      acceptedAliases: ["AI Governance", "AI Regulation"],
      avoid: ["EU AI Act"],
      note: "The EU AI Act is one jurisdiction-specific law, not a synonym for the broader field of AI governance and regulation.",
    }),
  });

  const references = Object.freeze({
    "project-published": Object.freeze({
      title: "AI Knowledge Map published English content",
      url: "data/content-locales/en/graph.js",
      scope: "Current project-approved wording; external standards review may still be pending.",
    }),
    "gbt-41867-2022": Object.freeze({
      title: "GB/T 41867-2022 Information technology—Artificial intelligence—Terminology",
      url: "https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=195F522C14AD9A1A0094FF66D0B1EF1B",
      scope: "Preferred reference for established Simplified Chinese AI terminology.",
    }),
    "iso-iec-22989-2022": Object.freeze({
      title: "ISO/IEC 22989:2022 Artificial intelligence concepts and terminology",
      url: "https://www.iso.org/standard/74296.html",
      scope: "Preferred reference for formal English concept boundaries.",
    }),
    "google-ml-glossary": Object.freeze({
      title: "Google Machine Learning Glossary",
      url: "https://developers.google.com/machine-learning/glossary",
      scope: "Practical reference for machine learning, LLM, and generative AI usage.",
    }),
    "mcp-specification": Object.freeze({
      title: "Model Context Protocol specification",
      url: "https://modelcontextprotocol.io/specification/latest",
      scope: "Authoritative source for the protocol name and MCP primitives.",
    }),
    "openai-function-calling": Object.freeze({
      title: "OpenAI API function calling guide",
      url: "https://developers.openai.com/api/docs/guides/function-calling",
      scope: "Product-source evidence for the relationship between function calling and tool calling.",
    }),
    "openai-reasoning-models": Object.freeze({
      title: "OpenAI API reasoning models guide",
      url: "https://developers.openai.com/api/docs/guides/reasoning",
      scope: "Product-source evidence for reasoning-model terminology.",
    }),
    "openai-test-time-compute": Object.freeze({
      title: "OpenAI: Learning to reason with LLMs",
      url: "https://openai.com/index/learning-to-reason-with-llms/",
      scope: "Research-source evidence for test-time compute terminology.",
    }),
    "adam-paper": Object.freeze({
      title: "Adam: A Method for Stochastic Optimization",
      url: "https://arxiv.org/abs/1412.6980",
      scope: "Primary research source for Adam and optimizer terminology.",
    }),
    "resnet-paper": Object.freeze({
      title: "Deep Residual Learning for Image Recognition",
      url: "https://arxiv.org/abs/1512.03385",
      scope: "Primary research source for residual-learning and residual-connection terminology.",
    }),
    "subword-tokenization-paper": Object.freeze({
      title: "Neural Machine Translation of Rare Words with Subword Units",
      url: "https://arxiv.org/abs/1508.07909",
      scope: "Primary research source for BPE-based subword tokenization.",
    }),
    "attention-paper": Object.freeze({
      title: "Attention Is All You Need",
      url: "https://arxiv.org/abs/1706.03762",
      scope: "Primary research source for Transformer positional encodings.",
    }),
    "rope-paper": Object.freeze({
      title: "RoFormer: Enhanced Transformer with Rotary Position Embedding",
      url: "https://arxiv.org/abs/2104.09864",
      scope: "Primary research source for the RoPE name and mechanism.",
    }),
    "layer-norm-paper": Object.freeze({
      title: "Layer Normalization",
      url: "https://arxiv.org/abs/1607.06450",
      scope: "Primary research source for layer-normalization terminology and its distinction from batch normalization.",
    }),
    "rmsnorm-paper": Object.freeze({
      title: "Root Mean Square Layer Normalization",
      url: "https://arxiv.org/abs/1910.07467",
      scope: "Primary research source for RMSNorm terminology and mechanism.",
    }),
    "mamba-paper": Object.freeze({
      title: "Mamba: Linear-Time Sequence Modeling with Selective State Spaces",
      url: "https://arxiv.org/abs/2312.00752",
      scope: "Primary research source for Mamba and selective state space models.",
    }),
    "self-supervised-learning-paper": Object.freeze({
      title: "A Cookbook of Self-Supervised Learning",
      url: "https://arxiv.org/abs/2304.12210",
      scope: "Research reference for self-supervised-learning terminology and training objectives.",
    }),
    "simclr-paper": Object.freeze({
      title: "A Simple Framework for Contrastive Learning of Visual Representations",
      url: "https://arxiv.org/abs/2002.05709",
      scope: "Primary research source for contrastive representation learning.",
    }),
    "clip-paper": Object.freeze({
      title: "Learning Transferable Visual Models From Natural Language Supervision",
      url: "https://arxiv.org/abs/2103.00020",
      scope: "Primary research source for CLIP, image-text contrastive training, and zero-shot transfer.",
    }),
    "lora-paper": Object.freeze({
      title: "LoRA: Low-Rank Adaptation of Large Language Models",
      url: "https://arxiv.org/abs/2106.09685",
      scope: "Primary research source for Low-Rank Adaptation terminology and mechanism.",
    }),
    "qlora-paper": Object.freeze({
      title: "QLoRA: Efficient Finetuning of Quantized LLMs",
      url: "https://arxiv.org/abs/2305.14314",
      scope: "Primary research source for QLoRA terminology and quantized-base adaptation.",
    }),
    "knowledge-distillation-paper": Object.freeze({
      title: "Distilling the Knowledge in a Neural Network",
      url: "https://arxiv.org/abs/1503.02531",
      scope: "Primary research source for knowledge distillation and teacher-student compression.",
    }),
    "megatron-distributed-training-paper": Object.freeze({
      title: "Efficient Large-Scale Language Model Training on GPU Clusters Using Megatron-LM",
      url: "https://arxiv.org/abs/2104.04473",
      scope: "Primary research source for composing data, tensor, and pipeline parallelism in distributed language-model training.",
    }),
    "synthetic-data-collapse-paper": Object.freeze({
      title: "How Bad is Training on Synthetic Data? A Statistical Analysis of Language Model Collapse",
      url: "https://arxiv.org/abs/2404.05090",
      scope: "Primary research source for synthetic training data and recursive-training model-collapse boundaries.",
    }),
    "gptq-paper": Object.freeze({
      title: "GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers",
      url: "https://arxiv.org/abs/2210.17323",
      scope: "Primary research source for low-bit weight quantization of large language models.",
    }),
    "sparse-moe-paper": Object.freeze({
      title: "Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer",
      url: "https://arxiv.org/abs/1701.06538",
      scope: "Primary research source for sparse mixture-of-experts layers, gating, and conditional computation.",
    }),
    "task-arithmetic-paper": Object.freeze({
      title: "Editing Models with Task Arithmetic",
      url: "https://arxiv.org/abs/2212.04089",
      scope: "Primary research source for task vectors and parameter-space task arithmetic.",
    }),
    "ties-merging-paper": Object.freeze({
      title: "TIES-Merging: Resolving Interference When Merging Models",
      url: "https://arxiv.org/abs/2306.01708",
      scope: "Primary research source for interference-aware model merging.",
    }),
    "neural-scaling-laws-paper": Object.freeze({
      title: "Scaling Laws for Neural Language Models",
      url: "https://arxiv.org/abs/2001.08361",
      scope: "Primary research source for empirical power-law scaling with model size, data, and compute.",
    }),
    "chinchilla-paper": Object.freeze({
      title: "Training Compute-Optimal Large Language Models",
      url: "https://arxiv.org/abs/2203.15556",
      scope: "Primary research source for compute-optimal allocation between model size and training data.",
    }),
    "lost-middle-paper": Object.freeze({
      title: "Lost in the Middle: How Language Models Use Long Contexts",
      url: "https://aclanthology.org/2024.tacl-1.9/",
      scope: "Primary research source for position-dependent degradation when language models use long contexts.",
    }),
    "gpt3-paper": Object.freeze({
      title: "Language Models are Few-Shot Learners",
      url: "https://arxiv.org/abs/2005.14165",
      scope: "Primary research source for in-context learning and zero-, one-, and few-shot prompting.",
    }),
    "huggingface-generation-docs": Object.freeze({
      title: "Hugging Face Transformers — Generation",
      url: "https://huggingface.co/docs/transformers/main_classes/text_generation",
      scope: "Official implementation documentation for sampling and decoding parameters such as temperature, top-k, and top-p.",
    }),
    "openai-logprobs-docs": Object.freeze({
      title: "OpenAI API Reference — Log Probabilities",
      url: "https://developers.openai.com/api/reference/cli/resources/completions",
      scope: "Official API documentation for token log probabilities and alternative token likelihoods.",
    }),
    "anthropic-prompting-docs": Object.freeze({
      title: "Anthropic Prompting Best Practices",
      url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables",
      scope: "Official guidance for system prompts, role prompting, and the current model-specific boundary of assistant response prefilling.",
    }),
    "anthropic-context-engineering": Object.freeze({
      title: "Effective Context Engineering for AI Agents",
      url: "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents",
      scope: "Official engineering guidance for constructing, managing, and compacting agent context.",
    }),
    "grammar-constrained-decoding-paper": Object.freeze({
      title: "Grammar-Constrained Decoding for Structured NLP Tasks without Finetuning",
      url: "https://arxiv.org/abs/2305.13971",
      scope: "Primary research source for enforcing formal-language constraints during decoding.",
    }),
    "openai-structured-outputs-docs": Object.freeze({
      title: "OpenAI API Reference — Structured Outputs",
      url: "https://developers.openai.com/api/reference/cli/resources/beta/subresources/responses",
      scope: "Official API documentation for schema-conforming model output.",
    }),
    "openai-streaming-docs": Object.freeze({
      title: "OpenAI API Reference — Streaming Responses",
      url: "https://developers.openai.com/api/reference/typescript/resources/beta/subresources/responses/methods/create",
      scope: "Official API documentation for receiving response events as generation proceeds.",
    }),
    "anthropic-prompt-caching-docs": Object.freeze({
      title: "Anthropic Pricing — Prompt Caching",
      url: "https://docs.anthropic.com/en/docs/about-claude/pricing",
      scope: "Official product documentation for prompt-cache writes, reads, and pricing boundaries.",
    }),
    "flashattention-paper": Object.freeze({
      title: "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness",
      url: "https://arxiv.org/abs/2205.14135",
      scope: "Primary research source for IO-aware exact attention optimization.",
    }),
    "vllm-paper": Object.freeze({
      title: "Efficient Memory Management for Large Language Model Serving with PagedAttention",
      url: "https://arxiv.org/abs/2309.06180",
      scope: "Primary research source for memory-efficient KV-cache management in LLM serving.",
    }),
    "speculative-decoding-paper": Object.freeze({
      title: "Fast Inference from Transformers via Speculative Decoding",
      url: "https://arxiv.org/abs/2211.17192",
      scope: "Primary research source for exact-distribution speculative decoding with a smaller draft model.",
    }),
    "openai-agent-guide": Object.freeze({
      title: "A Practical Guide to Building Agents",
      url: "https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf",
      scope: "Official engineering guidance for choosing models and establishing a performance baseline before optimizing cost and latency.",
    }),
    "frugalgpt-paper": Object.freeze({
      title: "FrugalGPT: How to Use Large Language Models While Reducing Cost and Improving Performance",
      url: "https://arxiv.org/abs/2305.05176",
      scope: "Primary research source for LLM cascades that choose models per query under quality and cost objectives.",
    }),
    "hnsw-paper": Object.freeze({
      title: "Efficient and Robust Approximate Nearest Neighbor Search Using Hierarchical Navigable Small World Graphs",
      url: "https://arxiv.org/abs/1603.09320",
      scope: "Primary research source for hierarchical graph-based approximate nearest-neighbor search.",
    }),
    "graphrag-inputs-docs": Object.freeze({
      title: "Microsoft GraphRAG — Inputs and Chunking",
      url: "https://microsoft.github.io/graphrag/index/inputs/",
      scope: "Official implementation documentation for retrieval-oriented document inputs, chunking, and metadata.",
    }),
    "sentence-transformers-reranking-docs": Object.freeze({
      title: "Sentence Transformers — Cross-encoder Training Overview",
      url: "https://www.sbert.net/docs/cross_encoder/training_overview.html",
      scope: "Official library documentation for cross-encoders as second-stage rerankers in retrieve-and-rerank systems.",
    }),
    "microsoft-graphrag-docs": Object.freeze({
      title: "Microsoft GraphRAG — Query Engine Overview",
      url: "https://microsoft.github.io/graphrag/query/overview/",
      scope: "Official implementation documentation for local, global, DRIFT, and basic graph-assisted retrieval modes.",
    }),
    "anthropic-citations-docs": Object.freeze({
      title: "Claude Platform Docs — Citations",
      url: "https://platform.claude.com/docs/en/build-with-claude/citations",
      scope: "Official product documentation for source-grounded responses with verifiable document locations.",
    }),
    "openai-evals-guide": Object.freeze({
      title: "OpenAI API — Working with Evals",
      url: "https://developers.openai.com/api/docs/guides/evals",
      scope: "Official engineering guidance for repeatable evaluation criteria, data sources, graders, and evaluation runs.",
    }),
    "llm-judge-bias-paper": Object.freeze({
      title: "Judging the Judges: A Systematic Study of Position Bias in LLM-as-a-Judge",
      url: "https://arxiv.org/abs/2406.07791",
      scope: "Primary research source for systematic bias in model-based pairwise evaluation.",
    }),
    "opentelemetry-genai-conventions": Object.freeze({
      title: "OpenTelemetry Semantic Conventions for Generative AI",
      url: "https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/",
      scope: "Official semantic conventions for GenAI operations, token usage, input and output messages, and related telemetry.",
    }),
    "concept-drift-review": Object.freeze({
      title: "Learning under Concept Drift: A Review",
      url: "https://arxiv.org/abs/2004.05785",
      scope: "Research review source for concept-drift definitions, detection, adaptation, and evaluation.",
    }),
    "neural-calibration-paper": Object.freeze({
      title: "On Calibration of Modern Neural Networks",
      url: "https://arxiv.org/abs/1706.04599",
      scope: "Primary research source for confidence calibration and expected calibration error in neural networks.",
    }),
    "selective-classification-paper": Object.freeze({
      title: "Selective Classification for Deep Neural Networks",
      url: "https://arxiv.org/abs/1705.08500",
      scope: "Primary research source for selective classification and the risk–coverage trade-off.",
    }),
    "training-data-extraction-paper": Object.freeze({
      title: "Extracting Training Data from Large Language Models",
      url: "https://arxiv.org/abs/2012.07805",
      scope: "Primary research source for extracting memorized training examples and personally identifiable information from language models.",
    }),
    "nist-privacy-framework": Object.freeze({
      title: "NIST Privacy Framework",
      url: "https://www.nist.gov/privacy-framework",
      scope: "Authoritative risk-management framework for identifying and managing privacy risks in products and systems.",
    }),
    "self-consistency-paper": Object.freeze({
      title: "Self-Consistency Improves Chain of Thought Reasoning in Language Models",
      url: "https://arxiv.org/abs/2203.11171",
      scope: "Primary research source for sampling diverse reasoning paths and selecting the most consistent answer.",
    }),
    "tree-of-thoughts-paper": Object.freeze({
      title: "Tree of Thoughts: Deliberate Problem Solving with Large Language Models",
      url: "https://arxiv.org/abs/2305.10601",
      scope: "Primary research source for reasoning search with candidate thoughts, evaluation, lookahead, and backtracking.",
    }),
    "reflexion-paper": Object.freeze({
      title: "Reflexion: Language Agents with Verbal Reinforcement Learning",
      url: "https://arxiv.org/abs/2303.11366",
      scope: "Primary research source for an agent framework that stores verbal reflections from task feedback.",
    }),
    "react-paper": Object.freeze({
      title: "ReAct: Synergizing Reasoning and Acting in Language Models",
      url: "https://arxiv.org/abs/2210.03629",
      scope: "Primary research source for interleaving reasoning traces with task-specific actions and observations.",
    }),
    "openai-code-interpreter-docs": Object.freeze({
      title: "OpenAI API — Code Interpreter",
      url: "https://developers.openai.com/api/docs/guides/tools-code-interpreter",
      scope: "Official product documentation for iterative Python execution inside a sandboxed environment.",
    }),
    "mcp-architecture-docs": Object.freeze({
      title: "Model Context Protocol — Architecture Overview",
      url: "https://modelcontextprotocol.io/docs/learn/architecture",
      scope: "Official architecture documentation for MCP hosts, clients, servers, primitives, and current transport terminology.",
    }),
    "openai-agent-orchestration": Object.freeze({
      title: "OpenAI Agents SDK — Agent Orchestration",
      url: "https://openai.github.io/openai-agents-python/multi_agent/",
      scope: "Official SDK guidance for code-driven and model-driven orchestration, agents as tools, and handoffs.",
    }),
    "openai-agent-sessions": Object.freeze({
      title: "OpenAI Agents SDK — Sessions",
      url: "https://openai.github.io/openai-agents-python/sessions/",
      scope: "Official SDK documentation for persisted conversation history and session-backed agent state.",
    }),
    "agent-skills-specification": Object.freeze({
      title: "Agent Skills Specification",
      url: "https://agentskills.io/specification",
      scope: "Open specification for packaging reusable agent instructions and supporting resources.",
    }),
    "openai-codex-skills": Object.freeze({
      title: "Introducing the Codex App — Skills",
      url: "https://openai.com/index/introducing-the-codex-app/",
      scope: "Official product description of skills as reusable bundles of instructions, resources, and scripts.",
    }),
    "openai-human-in-the-loop": Object.freeze({
      title: "OpenAI Agents SDK — Human-in-the-loop",
      url: "https://openai.github.io/openai-agents-python/human_in_the_loop/",
      scope: "Official SDK documentation for pausing sensitive tool calls for human approval or rejection.",
    }),
    "openai-computer-use": Object.freeze({
      title: "OpenAI API — Computer Use",
      url: "https://developers.openai.com/api/docs/models/computer-use-preview",
      scope: "Official product documentation for a model trained to understand and execute computer tasks.",
    }),
    "openai-codex-introduction": Object.freeze({
      title: "Introducing Codex",
      url: "https://openai.com/index/introducing-codex/",
      scope: "Official product description of repository-aware coding agents that edit code and run tests in isolated environments.",
    }),
    "vae-paper": Object.freeze({
      title: "Auto-Encoding Variational Bayes",
      url: "https://arxiv.org/abs/1312.6114",
      scope: "Primary research source for variational autoencoders, latent-variable inference, and the reparameterization estimator.",
    }),
    "gan-paper": Object.freeze({
      title: "Generative Adversarial Networks",
      url: "https://arxiv.org/abs/1406.2661",
      scope: "Primary research source for the generator–discriminator minimax framework.",
    }),
    "flow-matching-paper": Object.freeze({
      title: "Flow Matching for Generative Modeling",
      url: "https://arxiv.org/abs/2210.02747",
      scope: "Primary research source for training continuous normalizing flows through vector-field regression along probability paths.",
    }),
    "rectified-flow-paper": Object.freeze({
      title: "Flow Straight and Fast: Learning to Generate and Transfer Data with Rectified Flow",
      url: "https://arxiv.org/abs/2209.03003",
      scope: "Primary research source for rectified flows and straighter transport trajectories.",
    }),
    "controlnet-paper": Object.freeze({
      title: "Adding Conditional Control to Text-to-Image Diffusion Models",
      url: "https://arxiv.org/abs/2302.05543",
      scope: "Primary research source for ControlNet and spatial conditioning with edges, depth, segmentation, and pose.",
    }),
    "instruct-pix2pix-paper": Object.freeze({
      title: "InstructPix2Pix: Learning to Follow Image Editing Instructions",
      url: "https://arxiv.org/abs/2211.09800",
      scope: "Primary research source for instruction-based editing of an input image.",
    }),
    "latent-diffusion-paper": Object.freeze({
      title: "High-Resolution Image Synthesis with Latent Diffusion Models",
      url: "https://arxiv.org/abs/2112.10752",
      scope: "Primary research source for latent diffusion, inpainting, and diffusion-based super-resolution.",
    }),
    "srgan-paper": Object.freeze({
      title: "Photo-Realistic Single Image Super-Resolution Using a Generative Adversarial Network",
      url: "https://arxiv.org/abs/1609.04802",
      scope: "Primary research source for perceptual-loss-driven GAN super-resolution and synthesized texture detail.",
    }),
    "video-diffusion-paper": Object.freeze({
      title: "Video Diffusion Models",
      url: "https://arxiv.org/abs/2204.03458",
      scope: "Primary research source for extending image diffusion architectures to temporally coherent video generation.",
    }),
    "openai-sora-report": Object.freeze({
      title: "Video Generation Models as World Simulators",
      url: "https://openai.com/index/video-generation-models-as-world-simulators/",
      scope: "Official technical report on large-scale video generation and its capabilities and limitations.",
    }),
    "openai-speech-models": Object.freeze({
      title: "OpenAI API — Speech models",
      url: "https://developers.openai.com/api/docs/models/all",
      scope: "Official product documentation distinguishing transcription and speech-generation model categories.",
    }),
    "sv2tts-paper": Object.freeze({
      title: "Transfer Learning from Speaker Verification to Multispeaker Text-To-Speech Synthesis",
      url: "https://arxiv.org/abs/1806.04558",
      scope: "Primary research source for speaker embeddings and zero-shot speaker conditioning.",
    }),
    "valle-paper": Object.freeze({
      title: "Neural Codec Language Models are Zero-Shot Text to Speech Synthesizers",
      url: "https://arxiv.org/abs/2301.02111",
      scope: "Primary research source for acoustic-prompt-based zero-shot text-to-speech synthesis.",
    }),
    "elevenlabs-voice-cloning": Object.freeze({
      title: "ElevenLabs Voice Cloning Documentation",
      url: "https://elevenlabs.io/docs/eleven-api/concepts/voice-cloning",
      scope: "Official product documentation for instant and professional voice-cloning workflows.",
    }),
    "ftc-voice-cloning": Object.freeze({
      title: "FTC Voice Cloning Challenge",
      url: "https://www.ftc.gov/news-events/contests/ftc-voice-cloning-challenge",
      scope: "Official consumer-protection source for voice-cloning harms and mitigation limits.",
    }),
    "asvspoof-plan": Object.freeze({
      title: "ASVspoof 2021 Evaluation Plan",
      url: "https://www.asvspoof.org/asvspoof2021/asvspoof2021_evaluation_plan.pdf",
      scope: "Official evaluation plan for spoofed-speech detection conditions and metrics.",
    }),
    "musicgen-paper": Object.freeze({
      title: "Simple and Controllable Music Generation",
      url: "https://arxiv.org/abs/2306.05284",
      scope: "Primary research source for token-based autoregressive music generation and text conditioning.",
    }),
    "world-models-paper": Object.freeze({
      title: "World Models",
      url: "https://arxiv.org/abs/1803.10122",
      scope: "Primary research source for learned environment models used by agents.",
    }),
    "nist-synthetic-content": Object.freeze({
      title: "NIST AI 100-4: Reducing Risks Posed by Synthetic Content",
      url: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-4.pdf",
      scope: "Authoritative taxonomy of authentication, provenance, watermarking, detection, and synthetic-content risk reduction.",
    }),
    "c2pa-specification": Object.freeze({
      title: "C2PA Technical Specification",
      url: "https://spec.c2pa.org/specifications/specifications/2.3/specs/C2PA_Specification.html",
      scope: "Industry technical specification for interoperable content provenance and authenticity.",
    }),
    "anthropic-interpretability": Object.freeze({
      title: "Anthropic — Mapping the Mind of a Large Language Model",
      url: "https://www.anthropic.com/research/mapping-mind-language-model",
      scope: "Primary laboratory source for feature discovery and manipulation in mechanistic interpretability.",
    }),
    "nist-adversarial-ml": Object.freeze({
      title: "NIST AI 100-2e2023: Adversarial Machine Learning Taxonomy and Terminology",
      url: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-2e2023.pdf",
      scope: "Authoritative taxonomy for evasion, poisoning, privacy, and misuse attacks against machine learning systems.",
    }),
    "owasp-prompt-injection": Object.freeze({
      title: "OWASP GenAI Security Project — Prompt Injection",
      url: "https://genai.owasp.org/llmrisk/llm01-prompt-injection/",
      scope: "Industry security guidance used to distinguish instruction injection from safety-policy bypass.",
    }),
    "nist-genai-profile": Object.freeze({
      title: "NIST AI 600-1: Generative Artificial Intelligence Profile",
      url: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf",
      scope: "Authoritative risk-management profile covering AI red teaming and generative-AI evaluation practices.",
    }),
    "nist-ai-rmf": Object.freeze({
      title: "NIST AI Risk Management Framework 1.0",
      url: "https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10",
      scope: "Authoritative voluntary framework for trustworthy AI, fairness, governance, measurement, and risk management.",
    }),
    "deepmind-specification-gaming": Object.freeze({
      title: "DeepMind — Specification Gaming: The Flip Side of AI Ingenuity",
      url: "https://deepmind.google/blog/specification-gaming-the-flip-side-of-ai-ingenuity/",
      scope: "Primary laboratory discussion and examples of specification gaming and proxy-objective failures.",
    }),
    "instructgpt-paper": Object.freeze({
      title: "Training Language Models to Follow Instructions with Human Feedback",
      url: "https://arxiv.org/abs/2203.02155",
      scope: "Primary research source for the demonstration, reward-model, and PPO stages of RLHF.",
    }),
    "dpo-paper": Object.freeze({
      title: "Direct Preference Optimization: Your Language Model is Secretly a Reward Model",
      url: "https://arxiv.org/abs/2305.18290",
      scope: "Primary research source for direct preference optimization without an explicit reward model or reinforcement-learning loop.",
    }),
    "constitutional-ai-paper": Object.freeze({
      title: "Constitutional AI: Harmlessness from AI Feedback",
      url: "https://arxiv.org/abs/2212.08073",
      scope: "Primary research source for constitutional principles, self-critique, revision, and reinforcement learning from AI feedback.",
    }),
    "eu-ai-act": Object.freeze({
      title: "European Commission — AI Act",
      url: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai",
      scope: "Official current overview of the EU AI Act, its risk-based approach, obligations, and application timeline.",
    }),
    "iso-iec-42001": Object.freeze({
      title: "ISO/IEC 42001:2023 AI Management Systems",
      url: "https://www.iso.org/standard/42001.html",
      scope: "Official international standard page for organizational AI management-system requirements.",
    }),
    "microsoft-terminology": Object.freeze({
      title: "Microsoft Terminology",
      url: "https://learn.microsoft.com/globalization/reference/microsoft-terminology",
      scope: "Preferred reference for software interface and product-localization terminology.",
    }),
  });

  function createNodeEntries(graph) {
    if (!graph || !Array.isArray(graph.nodes)) {
      throw new TypeError("A graph with a nodes array is required.");
    }
    return Object.freeze(Object.fromEntries(graph.nodes.map(node => {
      const decision = nodeTerms[node.id];
      const entry = decision || Object.freeze({
        displayTitle: "",
        canonicalTerms: Object.freeze([]),
        acceptedAliases: Object.freeze([]),
        avoid: Object.freeze([]),
        context: "graph-node",
        note: "Awaiting English term review.",
        references: Object.freeze([]),
        status: "draft",
        standardsReview: "pending",
      });
      return [node.id, Object.freeze({
        id: node.id,
        zhHans: node.title,
        ...entry,
      })];
    })));
  }

  root.AI_TERMINOLOGY = Object.freeze({
    schemaVersion: 2,
    revision: "2026-09-04-complete-graph-translation",
    sourceLocale: "zh-Hans",
    targetLocale: "en",
    policies: Object.freeze({
      sourceNames: "Chinese node names come from GRAPH.nodes and are not duplicated here.",
      release: "A published English node must have an approved entry and use its approved display title.",
      titles: "Display titles are localized page labels; canonicalTerms contains the reusable atomic terminology represented by the page.",
      aliases: "Aliases may differ in number across languages; duplicates and avoided forms are rejected.",
      standards: "Approved means approved for this project. standardsReview records external-source review separately.",
    }),
    references,
    nodeTerms,
    createNodeEntries,
  });
})(window);
