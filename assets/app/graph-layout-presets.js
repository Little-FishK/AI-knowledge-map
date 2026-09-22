/* Presentation-only local layout presets; no graph source records. */
(function (global) {
  "use strict";
  const app = global.AIMap = global.AIMap || {};
  app.createGraphLayoutPresets = function () {
    const supervisedOffsets = {
      'self-supervised-learning': [356, -120],
      'unsupervised-learning': [274, -240],
      'decision-tree': [-308, -104],
      'kernel-methods': [-308, 118],
      'fine-tuning': [518, -2],
      'alignment': [634, 168],
      'overfitting': [296, 218]
    };
    // User reference: proposals/local-relationship-layout.md. Balance branches around the main node.
    const neuralOffsets = {
      'rnn': [760, -11],
      'transformer': [892, -106],
      'batch-norm': [-310, 128],
      'vanishing-gradient': [295, 311],
      'gradient-descent': [-310, -128],
      'cnn': [808, -206],
      'gan': [939, 244],
      'vae': [878, 379],
      'kernel-methods': [473, -294],
      'decision-tree': [314, -447],
      'interpretability': [167, 351],
      'adversarial-robustness': [1, 367]
    };
    Object.keys(neuralOffsets).forEach(id => { neuralOffsets[id] = neuralOffsets[id].map(value => value * 0.8); });
    const attentionOffsets = {
      'positional-encoding': [-265, -102],
      'inference-optimization': [-265, 112],
      'state-space-models': [290, -284],
      'transformer': [453, -171],
      'reranking': [578, -74],
      'prompt-caching': [710, -6],
      'interpretability': [568, 94],
      'vanishing-gradient': [472, 155],
      'context-window': [2, 230],
      'lost-in-middle': [118, 194]
    };
    const llmOffsets = {
      'scaling-law': [-36, -197],
      'pretraining': [-102, -174],
      'transformer': [-157, -128],
      'tokenization': [-191, -69],
      'loss-function': [-210, 0],
      'information-theory': [-190, 65],
      'sampling-params': [-152, 127],
      'fine-tuning': [-110, 171],
      'alignment': [-45, 196],
      'multimodal': [272, -272],
      'reasoning-models': [517, -213],
      'rag': [558, -115],
      'agent': [837, -18],
      'code-generation': [718, 51],
      'prompt-engineering': [549, 104],
      'in-context-learning': [491, 182],
      'streaming': [395, 225],
      'context-window': [26, 288],
      'prompt-injection': [78, 221],
      'jailbreak': [162, 179]
    };
    const contextOffsets = {
      'tokenization': [-160, -160],
      'positional-encoding': [-205, -95],
      'inference-optimization': [-230, -20],
      'context-compaction': [-215, 60],
      'context-engineering': [-170, 135],
      'state-space-models': [-100, 190],
      'llm': [280, -280],
      'rag': [430, -220],
      'chunking': [550, -135],
      'in-context-learning': [660, -65],
      'agent-memory': [800, 0],
      'multi-agent': [650, 85],
      'agent-loop': [510, 165],
      'cot': [350, 225],
      'attention': [-55, 255],
      'lost-in-middle': [40, 200],
      'video-generation': [150, 230]
    };
    const multimodalOffsets = {
      'llm': [-110, -170],
      'transformer': [-190, -95],
      'embedding': [-215, 0],
      'clip': [-190, 95],
      'contrastive-learning': [-110, 170],
      'image-generation': [350, -180],
      'computer-use': [570, -90],
      'agent': [750, 0],
      'speech': [400, 170]
    };
    const localLayouts = {'supervised-learning': supervisedOffsets, 'neural-network': neuralOffsets, 'attention': attentionOffsets, 'llm': llmOffsets, 'context-window': contextOffsets, 'multimodal': multimodalOffsets};

    const batchLayouts = {
      'rlhf': {
        support: ['reinforcement-learning', 'fine-tuning', 'information-theory', 'post-training'], peer: ['constitutional-ai'], risk: ['reward-hacking', 'bias-fairness'], output: ['alignment'],
        offsets: { 'reinforcement-learning': [-125, -185], 'fine-tuning': [-205, -65], 'information-theory': [-205, 65], 'post-training': [-125, 185], 'constitutional-ai': [245, -285], 'alignment': [700, 0], 'reward-hacking': [0, 210], 'bias-fairness': [135, 185] }
      },
      'constitutional-ai': {
        support: ['governance'], peer: ['rlhf'], risk: [], output: ['alignment', 'reward-hacking'],
        offsets: { 'governance': [-195, 0], 'rlhf': [245, -245], 'alignment': [420, -125], 'reward-hacking': [680, 0] }
      },
      'training-data-governance': {
        support: [], peer: [], risk: [], output: ['pretraining', 'synthetic-data', 'data-poisoning', 'privacy', 'bias-fairness', 'scaling-law'],
        offsets: { 'pretraining': [300, -230], 'synthetic-data': [480, -150], 'data-poisoning': [620, -75], 'privacy': [760, 0], 'bias-fairness': [500, 110], 'scaling-law': [320, 190] }
      },
      'governance': {
        support: ['content-detection'], peer: [], risk: [], output: ['constitutional-ai', 'alignment', 'interpretability', 'guardrails'],
        offsets: { 'content-detection': [-195, 0], 'constitutional-ai': [290, -220], 'alignment': [475, -115], 'interpretability': [700, 0], 'guardrails': [390, 145] }
      },
      'adversarial-robustness': {
        support: ['curse-of-dimensionality'], peer: ['jailbreak'], risk: [], output: ['neural-network'],
        offsets: { 'curse-of-dimensionality': [-195, 0], 'jailbreak': [245, -235], 'neural-network': [660, 0] }
      },
      'bias-fairness': {
        support: ['pretraining', 'rlhf', 'training-data-governance'], peer: [], risk: [], output: ['alignment'],
        offsets: { 'pretraining': [-155, -150], 'rlhf': [-215, 0], 'training-data-governance': [-155, 150], 'alignment': [660, 0] }
      },
      'reward-hacking': {
        support: ['loss-function', 'constitutional-ai', 'test-time-compute'], peer: [], risk: [], output: ['alignment', 'reinforcement-learning', 'evaluation', 'rlhf', 'hallucination'],
        offsets: { 'loss-function': [-155, -150], 'constitutional-ai': [-215, 0], 'test-time-compute': [-155, 150], 'alignment': [315, -205], 'reinforcement-learning': [505, -115], 'evaluation': [720, 0], 'rlhf': [505, 115], 'hallucination': [315, 205] }
      },
      'jailbreak': {
        support: ['alignment', 'red-teaming', 'guardrails', 'lost-in-middle', 'prefilling'], peer: ['prompt-injection', 'adversarial-robustness'], risk: [], output: ['system-prompt', 'llm'],
        offsets: { 'alignment': [-115, -190], 'red-teaming': [-195, -100], 'guardrails': [-220, 0], 'lost-in-middle': [-195, 100], 'prefilling': [-115, 190], 'prompt-injection': [235, -315], 'adversarial-robustness': [440, -230], 'system-prompt': [430, -100], 'llm': [700, 0] }
      },
      'red-teaming': {
        support: ['model-evaluation'], peer: ['evaluation'], risk: [], output: ['data-poisoning', 'jailbreak', 'prompt-injection', 'guardrails'],
        offsets: { 'model-evaluation': [-195, 0], 'evaluation': [245, -285], 'data-poisoning': [350, -165], 'jailbreak': [520, -80], 'guardrails': [700, 0], 'prompt-injection': [390, 145] }
      },
      'data-poisoning': {
        support: ['red-teaming', 'training-data-governance'], peer: ['prompt-injection'], risk: [], output: ['pretraining', 'rag'],
        offsets: { 'red-teaming': [-175, -95], 'training-data-governance': [-175, 95], 'prompt-injection': [245, -265], 'pretraining': [420, -125], 'rag': [680, 0] }
      },
      'content-detection': {
        support: [], peer: ['gan'], risk: ['image-generation', 'speech'], output: ['voice-cloning', 'governance'],
        offsets: { 'gan': [245, -285], 'voice-cloning': [410, -120], 'governance': [690, 0], 'image-generation': [0, 210], 'speech': [135, 185] }
      },
      'alignment': {
        support: ['fine-tuning', 'supervised-learning', 'reinforcement-learning', 'post-training', 'constitutional-ai', 'rlhf', 'interpretability', 'governance', 'bias-fairness'], peer: [], risk: ['reward-hacking'], output: ['jailbreak', 'llm'],
        offsets: { 'fine-tuning': [-45, -195], 'supervised-learning': [-110, -172], 'reinforcement-learning': [-160, -125], 'post-training': [-195, -62], 'constitutional-ai': [-210, 0], 'rlhf': [-195, 62], 'interpretability': [-160, 125], 'governance': [-110, 172], 'bias-fairness': [-45, 195], 'jailbreak': [410, -120], 'llm': [700, 0], 'reward-hacking': [0, 210] }
      },
      'interpretability': {
        support: ['logprobs', 'governance', 'attention'], peer: [], risk: [], output: ['hallucination', 'alignment', 'neural-network'],
        offsets: { 'logprobs': [-155, -150], 'governance': [-215, 0], 'attention': [-155, 150], 'hallucination': [350, -150], 'alignment': [680, 0], 'neural-network': [350, 150] }
      },
      'voice-cloning': {
        support: ['fine-tuning', 'content-detection'], peer: [], risk: ['privacy'], output: ['speech', 'controllable-generation'],
        offsets: { 'fine-tuning': [-175, -95], 'content-detection': [-175, 95], 'speech': [420, -125], 'controllable-generation': [680, 0], 'privacy': [0, 210] }
      },
      'audio-generation': {
        support: ['diffusion'], peer: ['speech'], risk: [], output: [],
        offsets: { 'diffusion': [-195, 0], 'speech': [245, -235] }
      },
      'world-models': {
        support: ['reinforcement-learning'], peer: ['video-generation'], risk: [], output: ['synthetic-data'],
        offsets: { 'reinforcement-learning': [-195, 0], 'video-generation': [245, -235], 'synthetic-data': [660, 0] }
      },
      'super-resolution': {
        support: [], peer: ['image-generation'], risk: ['hallucination'], output: [],
        offsets: { 'image-generation': [245, -235], 'hallucination': [0, 210] }
      },
      'video-generation': {
        support: ['diffusion', 'flow-matching'], peer: ['world-models'], risk: ['context-window'], output: [],
        offsets: { 'diffusion': [-175, -95], 'flow-matching': [-175, 95], 'world-models': [245, -235], 'context-window': [0, 210] }
      },
      'speech': {
        support: ['transformer'], peer: ['audio-generation'], risk: ['content-detection'], output: ['voice-cloning', 'multimodal'],
        offsets: { 'transformer': [-195, 0], 'audio-generation': [245, -245], 'voice-cloning': [420, -125], 'multimodal': [680, 0], 'content-detection': [0, 210] }
      },
      'image-generation': {
        support: ['diffusion', 'embedding', 'clip', 'flow-matching'], peer: ['image-editing', 'super-resolution', 'controllable-generation'], risk: ['content-detection'], output: ['multimodal'],
        offsets: { 'diffusion': [-125, -185], 'embedding': [-205, -65], 'clip': [-205, 65], 'flow-matching': [-125, 185], 'image-editing': [235, -335], 'super-resolution': [430, -255], 'controllable-generation': [590, -165], 'multimodal': [720, 0], 'content-detection': [0, 210] }
      },
      'controllable-generation': {
        support: ['fine-tuning'], peer: ['image-editing'], risk: [], output: ['voice-cloning', 'image-generation'],
        offsets: { 'fine-tuning': [-195, 0], 'image-editing': [245, -245], 'voice-cloning': [420, -125], 'image-generation': [680, 0] }
      },
      'image-editing': {
        support: [], peer: ['controllable-generation'], risk: [], output: ['image-generation'],
        offsets: { 'controllable-generation': [245, -235], 'image-generation': [660, 0] }
      },
      'vae': {
        support: ['neural-network'], peer: ['gan'], risk: [], output: ['diffusion', 'flow-matching'],
        offsets: { 'neural-network': [-195, 0], 'gan': [245, -245], 'diffusion': [420, -125], 'flow-matching': [680, 0] }
      },
      'gan': {
        support: ['neural-network'], peer: ['content-detection', 'vae', 'diffusion'], risk: [], output: [],
        offsets: { 'neural-network': [-195, 0], 'content-detection': [220, -310], 'vae': [420, -230], 'diffusion': [630, -90] }
      },
      'flow-matching': {
        support: ['vae'], peer: ['diffusion'], risk: [], output: ['image-generation', 'video-generation'],
        offsets: { 'vae': [-195, 0], 'diffusion': [245, -245], 'image-generation': [420, -125], 'video-generation': [680, 0] }
      },
      'coding-tools': {
        support: ['code-generation', 'agent-loop', 'code-execution'], peer: [], risk: [], output: [],
        offsets: { 'code-generation': [-155, -150], 'agent-loop': [-215, 0], 'code-execution': [-155, 150] }
      },
      'agent-identity-access': {
        support: ['human-in-the-loop'], peer: [], risk: [], output: ['agent', 'tool-calling', 'mcp', 'prompt-injection', 'privacy'],
        offsets: { 'human-in-the-loop': [-195, 0], 'tool-calling': [315, -205], 'mcp': [505, -115], 'agent': [720, 0], 'privacy': [505, 115], 'prompt-injection': [315, 205] }
      },
      'diffusion': {
        support: ['transformer', 'self-supervised-learning', 'vae', 'cnn'], peer: ['gan', 'flow-matching'], risk: [], output: ['image-generation', 'audio-generation', 'video-generation'],
        offsets: { 'transformer': [-125, -185], 'self-supervised-learning': [-205, -65], 'vae': [-205, 65], 'cnn': [-125, 185], 'gan': [245, -305], 'flow-matching': [455, -220], 'image-generation': [430, -105], 'audio-generation': [720, 0], 'video-generation': [430, 125] }
      },
      'human-in-the-loop': {
        support: ['logprobs', 'agent-identity-access', 'uncertainty-calibration'], peer: [], risk: [], output: ['guardrails', 'agent'],
        offsets: { 'logprobs': [-155, -150], 'agent-identity-access': [-215, 0], 'uncertainty-calibration': [-155, 150], 'guardrails': [390, -135], 'agent': [680, 0] }
      },
      'computer-use': {
        support: ['multimodal'], peer: ['agent-loop'], risk: ['prompt-injection'], output: ['agent'],
        offsets: { 'multimodal': [-195, 0], 'agent-loop': [245, -235], 'agent': [660, 0], 'prompt-injection': [0, 210] }
      },
      'code-generation': {
        support: ['llm', 'context-engineering'], peer: ['code-execution'], risk: ['hallucination'], output: ['model-evaluation', 'coding-tools'],
        offsets: { 'llm': [-175, -95], 'context-engineering': [-175, 95], 'code-execution': [250, -245], 'model-evaluation': [400, -135], 'coding-tools': [680, 0], 'hallucination': [0, 210] }
      },
      'agent-skills': {
        support: ['tool-calling', 'context-engineering'], peer: ['context-compaction'], risk: [], output: ['agent'],
        offsets: { 'tool-calling': [-175, -95], 'context-engineering': [-175, 95], 'context-compaction': [250, -225], 'agent': [660, 0] }
      },
      'workflow-orchestration': {
        support: ['tool-calling', 'model-routing'], peer: ['agent', 'multi-agent'], risk: [], output: [],
        offsets: { 'tool-calling': [-175, -95], 'model-routing': [-175, 95], 'agent': [270, -235], 'multi-agent': [590, -80] }
      },
      'multi-agent': {
        support: ['agent', 'tool-calling'], peer: ['workflow-orchestration', 'agent-loop'], risk: ['context-window'], output: [],
        offsets: { 'agent': [-175, -95], 'tool-calling': [-175, 95], 'workflow-orchestration': [260, -235], 'agent-loop': [590, -80], 'context-window': [0, 210] }
      },
      'mcp': {
        support: ['mcp-architecture', 'agent-identity-access'], peer: [], risk: [], output: ['tool-calling'],
        offsets: { 'mcp-architecture': [-185, -95], 'agent-identity-access': [-185, 95], 'tool-calling': [660, 0] }
      },
      'agent-frameworks': {
        support: [], peer: [], risk: [], output: ['agent'],
        offsets: { 'agent': [660, 0] }
      },
      'agent-memory': {
        support: ['rag', 'chunking', 'retrieval'], peer: ['context-compaction'], risk: ['context-window'], output: ['agent'],
        offsets: { 'rag': [-155, -150], 'chunking': [-215, 0], 'retrieval': [-155, 150], 'context-compaction': [245, -235], 'agent': [670, 0], 'context-window': [0, 210] }
      },
      'tool-calling': {
        support: ['structured-output', 'guardrails', 'agent-identity-access'], peer: ['mcp', 'code-execution'], risk: ['prompt-injection'], output: ['mcp-architecture', 'agent-skills', 'agent-loop', 'agent', 'workflow-orchestration', 'react', 'multi-agent'],
        offsets: { 'structured-output': [-155, -150], 'guardrails': [-215, 0], 'agent-identity-access': [-155, 150], 'mcp': [235, -315], 'code-execution': [445, -245], 'mcp-architecture': [335, -145], 'agent-skills': [500, -95], 'agent-loop': [655, -45], 'agent': [820, 0], 'workflow-orchestration': [650, 55], 'react': [495, 110], 'multi-agent': [330, 165], 'prompt-injection': [0, 210] }
      },
      'code-execution': {
        support: ['guardrails'], peer: ['code-generation', 'tool-calling'], risk: [], output: ['coding-tools', 'agent', 'test-time-compute', 'hallucination'],
        offsets: { 'guardrails': [-195, 0], 'code-generation': [235, -260], 'tool-calling': [445, -190], 'coding-tools': [350, -80], 'agent': [690, 0], 'test-time-compute': [455, 90], 'hallucination': [310, 165] }
      },
      'mcp-architecture': {
        support: [], peer: ['mcp'], risk: ['prompt-injection'], output: ['tool-calling'],
        offsets: { 'mcp': [245, -235], 'tool-calling': [660, 0], 'prompt-injection': [0, 210] }
      },
      'agent': {
        support: ['tool-calling', 'llm', 'rag', 'human-in-the-loop', 'code-execution', 'advanced-rag', 'multimodal', 'guardrails', 'model-selection', 'structured-output', 'prompt-caching', 'agent-frameworks', 'agent-identity-access'], peer: ['workflow-orchestration', 'reinforcement-learning'], risk: ['prompt-injection'], output: ['computer-use', 'agent-skills', 'agent-loop', 'planning', 'agent-memory', 'multi-agent'],
        offsets: { 'tool-calling': [-90, -390], 'llm': [-175, -355], 'rag': [-245, -300], 'human-in-the-loop': [-300, -235], 'code-execution': [-335, -160], 'advanced-rag': [-355, -80], 'multimodal': [-360, 0], 'guardrails': [-355, 80], 'model-selection': [-335, 160], 'structured-output': [-300, 235], 'prompt-caching': [-245, 300], 'agent-frameworks': [-175, 355], 'agent-identity-access': [-90, 390], 'workflow-orchestration': [245, -365], 'reinforcement-learning': [465, -295], 'computer-use': [355, -185], 'agent-skills': [555, -110], 'agent-loop': [850, 0], 'planning': [625, 90], 'agent-memory': [470, 165], 'multi-agent': [330, 230], 'prompt-injection': [0, 210] }
      },
      'agent-loop': {
        support: ['tool-calling', 'context-compaction', 'coding-tools', 'observability', 'reflection', 'context-engineering', 'prompt-caching'], peer: ['planning', 'computer-use', 'react', 'multi-agent'], risk: ['context-window'], output: ['agent'],
        offsets: { 'tool-calling': [-105, -235], 'context-compaction': [-175, -175], 'coding-tools': [-215, -95], 'observability': [-225, 0], 'reflection': [-215, 95], 'context-engineering': [-175, 175], 'prompt-caching': [-105, 235], 'planning': [235, -330], 'computer-use': [430, -265], 'react': [575, -175], 'multi-agent': [675, -80], 'agent': [820, 0], 'context-window': [0, 210] }
      },
      'react': {
        support: ['reflection', 'cot', 'tool-calling'], peer: ['agent-loop'], risk: [], output: ['hallucination'],
        offsets: { 'reflection': [-155, -150], 'cot': [-215, 0], 'tool-calling': [-155, 150], 'agent-loop': [245, -235], 'hallucination': [660, 0] }
      },
      'test-time-compute': {
        support: ['cot', 'self-consistency', 'tree-of-thoughts', 'reflection', 'code-execution'], peer: ['scaling-law'], risk: ['reward-hacking'], output: ['reasoning-models'],
        offsets: { 'cot': [-115, -190], 'self-consistency': [-195, -100], 'tree-of-thoughts': [-220, 0], 'reflection': [-195, 100], 'code-execution': [-115, 190], 'scaling-law': [245, -245], 'reasoning-models': [675, 0], 'reward-hacking': [0, 210] }
      },
      'reflection': {
        support: [], peer: ['self-consistency'], risk: ['hallucination'], output: ['agent-loop', 'react', 'test-time-compute'],
        offsets: { 'self-consistency': [245, -235], 'agent-loop': [370, -105], 'test-time-compute': [680, 0], 'react': [390, 135], 'hallucination': [0, 210] }
      },
      'planning': {
        support: [], peer: ['cot', 'agent-loop'], risk: [], output: ['agent'],
        offsets: { 'cot': [235, -240], 'agent-loop': [445, -160], 'agent': [680, 0] }
      },
      'cot': {
        support: [], peer: ['prompt-engineering', 'planning', 'self-consistency', 'tree-of-thoughts'], risk: ['context-window'], output: ['reasoning-models', 'test-time-compute', 'react', 'hallucination'],
        offsets: { 'prompt-engineering': [230, -320], 'planning': [420, -270], 'self-consistency': [575, -190], 'tree-of-thoughts': [690, -95], 'reasoning-models': [470, -70], 'test-time-compute': [780, 0], 'react': [490, 90], 'hallucination': [320, 165], 'context-window': [0, 210] }
      },
      'self-consistency': {
        support: ['sampling-params'], peer: ['cot', 'reflection'], risk: [], output: ['hallucination', 'test-time-compute'],
        offsets: { 'sampling-params': [-195, 0], 'cot': [235, -240], 'reflection': [435, -165], 'hallucination': [380, 135], 'test-time-compute': [665, 0] }
      },
      'tree-of-thoughts': {
        support: ['evaluation'], peer: ['cot', 'reasoning-models'], risk: [], output: ['test-time-compute'],
        offsets: { 'evaluation': [-195, 0], 'cot': [235, -240], 'reasoning-models': [440, -165], 'test-time-compute': [670, 0] }
      },
      'prompt-injection': {
        support: ['red-teaming', 'guardrails', 'agent-identity-access'], peer: ['jailbreak', 'data-poisoning'], risk: [], output: ['mcp-architecture', 'llm', 'agent', 'computer-use', 'tool-calling'],
        offsets: { 'red-teaming': [-155, -150], 'guardrails': [-215, 0], 'agent-identity-access': [-155, 150], 'jailbreak': [235, -305], 'data-poisoning': [445, -235], 'mcp-architecture': [350, -115], 'llm': [540, -65], 'agent': [800, 0], 'computer-use': [550, 85], 'tool-calling': [350, 155] }
      },
      'guardrails': {
        support: ['human-in-the-loop', 'governance', 'red-teaming', 'uncertainty-calibration'], peer: [], risk: ['streaming'], output: ['privacy', 'prompt-injection', 'hallucination', 'agent', 'tool-calling', 'code-execution', 'jailbreak'],
        offsets: { 'human-in-the-loop': [-150, -150], 'governance': [-205, -55], 'red-teaming': [-205, 55], 'uncertainty-calibration': [-150, 150], 'privacy': [330, -220], 'prompt-injection': [500, -150], 'hallucination': [625, -75], 'agent': [830, 0], 'tool-calling': [625, 80], 'code-execution': [500, 155], 'jailbreak': [330, 220], 'streaming': [0, 210] }
      },
      'reasoning-models': {
        support: ['tree-of-thoughts', 'synthetic-data', 'cot', 'post-training', 'model-evaluation', 'test-time-compute'], peer: ['model-families', 'model-selection', 'scaling-law', 'llm'], risk: [], output: [],
        offsets: { 'tree-of-thoughts': [-110, -205], 'synthetic-data': [-190, -125], 'cot': [-220, -40], 'post-training': [-220, 50], 'model-evaluation': [-190, 135], 'test-time-compute': [-110, 210], 'model-families': [235, -310], 'model-selection': [435, -250], 'scaling-law': [540, -130], 'llm': [720, -55] }
      },
      'hallucination': {
        support: ['rag', 'prompt-engineering', 'cot', 'citations', 'logprobs', 'self-consistency', 'code-execution', 'react', 'interpretability', 'guardrails', 'uncertainty-calibration'], peer: ['privacy'], risk: ['sampling-params', 'reward-hacking', 'super-resolution', 'code-generation', 'reflection'], output: [],
        offsets: { 'rag': [-100, -340], 'prompt-engineering': [-180, -300], 'cot': [-245, -245], 'citations': [-300, -180], 'logprobs': [-340, -95], 'self-consistency': [-355, 0], 'code-execution': [-340, 95], 'react': [-300, 180], 'interpretability': [-245, 245], 'guardrails': [-180, 300], 'uncertainty-calibration': [-100, 340], 'privacy': [315, -330], 'sampling-params': [0, 210], 'reward-hacking': [105, 205], 'super-resolution': [200, 180], 'code-generation': [290, 135], 'reflection': [365, 75] }
      },
      'uncertainty-calibration': {
        support: ['logprobs', 'model-evaluation'], peer: [], risk: [], output: ['guardrails', 'hallucination', 'human-in-the-loop'],
        offsets: { 'logprobs': [-185, -95], 'model-evaluation': [-185, 95], 'guardrails': [345, -155], 'hallucination': [455, -70], 'human-in-the-loop': [690, 0] }
      },
      'privacy': {
        support: ['guardrails', 'agent-identity-access', 'training-data-governance'], peer: ['hallucination'], risk: ['overfitting', 'voice-cloning'], output: ['deployment'],
        offsets: { 'guardrails': [-155, -150], 'agent-identity-access': [-215, 0], 'training-data-governance': [-155, 150], 'hallucination': [270, -245], 'deployment': [660, 0], 'overfitting': [0, 210], 'voice-cloning': [120, 195] }
      },
      'observability': {
        support: [], peer: ['evaluation'], risk: [], output: ['prompt-caching', 'agent-loop', 'data-drift-monitoring'],
        offsets: { 'evaluation': [245, -225], 'prompt-caching': [365, -105], 'agent-loop': [665, 0], 'data-drift-monitoring': [385, 145] }
      },
      'deployment': {
        support: ['model-families', 'quantization', 'inference-optimization', 'peft-lora'], peer: ['distributed-training', 'model-selection'], risk: ['privacy'], output: ['model-routing', 'data-drift-monitoring'],
        offsets: { 'model-families': [-150, -150], 'quantization': [-205, -55], 'inference-optimization': [-205, 55], 'peft-lora': [-150, 150], 'distributed-training': [245, -285], 'model-selection': [455, -205], 'model-routing': [680, 0], 'data-drift-monitoring': [385, 145], 'privacy': [0, 210] }
      },
      'data-drift-monitoring': {
        support: ['observability', 'evaluation'], peer: [], risk: [], output: ['model-routing', 'deployment'],
        offsets: { 'observability': [-185, -95], 'evaluation': [-185, 95], 'model-routing': [365, -135], 'deployment': [635, 0] }
      },
      'citations': {
        support: ['structured-output'], peer: [], risk: [], output: ['rag', 'hallucination'],
        offsets: { 'structured-output': [-195, 0], 'rag': [545, -20], 'hallucination': [340, 140] }
      },
      'evaluation': {
        support: ['observability', 'data-drift-monitoring'], peer: ['loss-function', 'model-evaluation', 'red-teaming'], risk: ['overfitting', 'reward-hacking'], output: ['model-merging', 'model-selection', 'model-routing', 'rag', 'tree-of-thoughts'],
        offsets: { 'observability': [-185, -95], 'data-drift-monitoring': [-185, 95], 'loss-function': [215, -325], 'model-evaluation': [410, -265], 'red-teaming': [590, -195], 'model-merging': [400, -80], 'model-selection': [795, 0], 'model-routing': [640, 95], 'rag': [490, 170], 'tree-of-thoughts': [330, 225], 'overfitting': [0, 210], 'reward-hacking': [120, 190] }
      },
      'model-evaluation': {
        support: [], peer: ['evaluation', 'red-teaming'], risk: [], output: ['reasoning-models', 'model-selection', 'code-generation', 'uncertainty-calibration'],
        offsets: { 'evaluation': [210, -270], 'red-teaming': [410, -195], 'reasoning-models': [455, -65], 'model-selection': [700, 0], 'code-generation': [525, 110], 'uncertainty-calibration': [320, 190] }
      },
      'reranking': {
        support: ['attention', 'vector-db'], peer: [], risk: [], output: ['retrieval', 'rag', 'lost-in-middle'],
        offsets: { 'attention': [-185, -95], 'vector-db': [-185, 95], 'retrieval': [345, -140], 'rag': [610, 0], 'lost-in-middle': [385, 140] }
      },
      'advanced-rag': {
        support: ['retrieval', 'knowledge-graph', 'agent'], peer: ['rag'], risk: [], output: [],
        offsets: { 'retrieval': [-155, -150], 'knowledge-graph': [-215, 0], 'agent': [-155, 150], 'rag': [410, -30] }
      },
      'knowledge-graph': {
        support: [], peer: ['embedding'], risk: [], output: ['rag', 'advanced-rag'],
        offsets: { 'embedding': [240, -205], 'rag': [595, 0], 'advanced-rag': [365, 140] }
      },
      'retrieval': {
        support: ['embedding', 'contrastive-learning', 'vector-db', 'chunking', 'reranking'], peer: [], risk: ['curse-of-dimensionality'], output: ['advanced-rag', 'rag', 'agent-memory', 'lost-in-middle'],
        offsets: { 'embedding': [-115, -195], 'contrastive-learning': [-195, -100], 'vector-db': [-220, 0], 'chunking': [-195, 105], 'reranking': [-115, 200], 'advanced-rag': [335, -190], 'rag': [685, 0], 'agent-memory': [515, 105], 'lost-in-middle': [330, 180], 'curse-of-dimensionality': [0, 210] }
      },
      'vector-db': {
        support: ['embedding'], peer: [], risk: [], output: ['retrieval', 'rag', 'reranking'],
        offsets: { 'embedding': [-195, 0], 'retrieval': [350, -140], 'rag': [610, 0], 'reranking': [385, 140] }
      },
      'chunking': {
        support: [], peer: [], risk: ['context-window'], output: ['retrieval', 'rag', 'agent-memory'],
        offsets: { 'retrieval': [335, -155], 'rag': [620, 0], 'agent-memory': [400, 125], 'context-window': [0, 210] }
      },
      'model-selection': {
        support: ['model-families', 'model-evaluation', 'evaluation', 'deployment', 'prompt-caching'], peer: ['reasoning-models'], risk: [], output: ['agent', 'model-routing'],
        offsets: { 'model-families': [-115, -195], 'model-evaluation': [-195, -100], 'evaluation': [-220, 0], 'deployment': [-195, 105], 'prompt-caching': [-115, 200], 'reasoning-models': [285, -200], 'model-routing': [640, 0], 'agent': [400, 140] }
      },
      'model-routing': {
        support: ['model-selection', 'evaluation', 'data-drift-monitoring'], peer: ['moe'], risk: [], output: ['deployment', 'workflow-orchestration'],
        offsets: { 'model-selection': [-155, -150], 'evaluation': [-215, 0], 'data-drift-monitoring': [-155, 150], 'moe': [260, -205], 'deployment': [625, 0], 'workflow-orchestration': [385, 145] }
      },
      'rag': {
        support: ['llm', 'embedding', 'vector-db', 'chunking', 'retrieval', 'reranking', 'citations', 'evaluation'], peer: ['fine-tuning', 'prompt-engineering'], risk: ['context-window', 'lost-in-middle', 'data-poisoning'], output: ['knowledge-graph', 'advanced-rag', 'agent', 'agent-memory', 'hallucination'],
        offsets: { 'llm': [-65, -245], 'embedding': [-145, -195], 'vector-db': [-205, -125], 'chunking': [-235, -45], 'retrieval': [-235, 45], 'reranking': [-205, 130], 'citations': [-145, 205], 'evaluation': [-65, 255], 'fine-tuning': [235, -335], 'prompt-engineering': [460, -245], 'knowledge-graph': [350, -120], 'advanced-rag': [550, -70], 'agent': [840, 0], 'agent-memory': [640, 110], 'hallucination': [430, 190], 'context-window': [0, 210], 'lost-in-middle': [110, 195], 'data-poisoning': [215, 155] }
      },
      'prompt-caching': {
        support: ['attention', 'inference-optimization', 'observability'], peer: [], risk: [], output: ['prompt-engineering', 'model-selection', 'agent', 'agent-loop'],
        offsets: { 'attention': [-155, -150], 'inference-optimization': [-215, 0], 'observability': [-155, 150], 'prompt-engineering': [320, -170], 'model-selection': [490, -90], 'agent': [690, 0], 'agent-loop': [420, 145] }
      },
      'context-compaction': {
        support: ['context-engineering'], peer: ['agent-skills'], risk: [], output: ['context-window', 'agent-loop', 'agent-memory'],
        offsets: { 'context-engineering': [-195, 0], 'agent-skills': [245, -235], 'context-window': [405, -85], 'agent-loop': [650, 0], 'agent-memory': [400, 145] }
      },
      'inference-optimization': {
        support: ['prompt-caching', 'quantization'], peer: [], risk: [], output: ['attention', 'context-window', 'deployment'],
        offsets: { 'prompt-caching': [-185, -95], 'quantization': [-185, 95], 'attention': [350, -145], 'deployment': [615, 0], 'context-window': [385, 140] }
      },
      'structured-output': {
        support: ['prompt-engineering', 'prefilling', 'constrained-decoding'], peer: ['streaming'], risk: [], output: ['tool-calling', 'agent', 'citations'],
        offsets: { 'prompt-engineering': [-155, -150], 'prefilling': [-215, 0], 'constrained-decoding': [-155, 150], 'streaming': [245, -235], 'tool-calling': [435, -85], 'agent': [665, 0], 'citations': [405, 145] }
      },
      'streaming': {
        support: ['llm'], peer: ['structured-output'], risk: ['guardrails'], output: [],
        offsets: { 'llm': [-195, -15], 'structured-output': [400, -100], 'guardrails': [0, 210] }
      },
      'prefilling': {
        support: [], peer: ['system-prompt', 'constrained-decoding'], risk: ['jailbreak'], output: ['structured-output'],
        offsets: { 'system-prompt': [205, -250], 'constrained-decoding': [405, -155], 'structured-output': [615, 0], 'jailbreak': [0, 210] }
      },
      'system-prompt': {
        support: ['in-context-learning'], peer: ['prefilling'], risk: ['jailbreak'], output: ['prompt-engineering', 'context-engineering'],
        offsets: { 'in-context-learning': [-195, -20], 'prefilling': [255, -210], 'prompt-engineering': [390, -80], 'context-engineering': [625, 20], 'jailbreak': [0, 210] }
      },
      'context-engineering': {
        support: ['prompt-engineering', 'system-prompt', 'context-compaction'], peer: [], risk: ['context-window'], output: ['agent-skills', 'agent-loop', 'code-generation', 'lost-in-middle'],
        offsets: { 'prompt-engineering': [-150, -150], 'system-prompt': [-215, 0], 'context-compaction': [-150, 150], 'agent-skills': [305, -200], 'agent-loop': [500, -115], 'code-generation': [700, 0], 'lost-in-middle': [440, 130], 'context-window': [0, 210] }
      },
      'constrained-decoding': {
        support: ['sampling-params'], peer: ['prefilling'], risk: [], output: ['structured-output'],
        offsets: { 'sampling-params': [-195, 0], 'prefilling': [280, -155], 'structured-output': [555, 35] }
      },
      'sampling-params': {
        support: ['llm', 'information-theory', 'logprobs', 'constrained-decoding'], peer: [], risk: ['hallucination'], output: ['self-consistency'],
        offsets: { 'llm': [-130, -175], 'information-theory': [-205, -60], 'logprobs': [-205, 60], 'constrained-decoding': [-130, 175], 'self-consistency': [480, -65], 'hallucination': [0, 210] }
      },
      'logprobs': {
        support: ['sampling-params'], peer: [], risk: [], output: ['interpretability', 'uncertainty-calibration', 'human-in-the-loop', 'hallucination'],
        offsets: { 'sampling-params': [-200, 0], 'interpretability': [300, -165], 'uncertainty-calibration': [470, -85], 'human-in-the-loop': [660, 0], 'hallucination': [390, 145] }
      },
      'prompt-engineering': {
        support: ['llm', 'in-context-learning', 'system-prompt', 'prompt-caching'], peer: ['fine-tuning', 'rag'], risk: [], output: ['cot', 'structured-output', 'context-engineering', 'hallucination'],
        offsets: { 'llm': [-130, -175], 'in-context-learning': [-205, -60], 'system-prompt': [-205, 60], 'prompt-caching': [-130, 175], 'fine-tuning': [225, -275], 'rag': [425, -190], 'cot': [445, -65], 'context-engineering': [710, 0], 'structured-output': [535, 105], 'hallucination': [340, 185] }
      },
      'model-families': {
        support: ['state-space-models', 'reasoning-models'], peer: [], risk: [], output: ['deployment', 'model-selection'],
        offsets: { 'state-space-models': [-185, -100], 'reasoning-models': [-185, 100], 'deployment': [365, -120], 'model-selection': [610, 15] }
      },
      'lost-in-middle': {
        support: ['attention', 'positional-encoding', 'retrieval', 'reranking', 'context-engineering'], peer: [], risk: [], output: ['context-window', 'rag', 'jailbreak'],
        offsets: { 'attention': [-115, -195], 'positional-encoding': [-195, -100], 'retrieval': [-220, 0], 'reranking': [-195, 105], 'context-engineering': [-115, 200], 'context-window': [360, -145], 'rag': [615, 0], 'jailbreak': [385, 145] }
      },
      'in-context-learning': {
        support: ['llm'], peer: ['fine-tuning'], risk: ['context-window'], output: ['prompt-engineering', 'system-prompt'],
        offsets: { 'llm': [-195, -20], 'fine-tuning': [260, -205], 'prompt-engineering': [610, 0], 'system-prompt': [385, 130], 'context-window': [0, 210] }
      },
      'moe': {
        support: ['transformer'], peer: ['model-routing'], risk: [], output: ['scaling-law'],
        offsets: { 'transformer': [-195, 0], 'model-routing': [300, -160], 'scaling-law': [560, 35] }
      },
      'model-merging': {
        support: ['peft-lora', 'evaluation'], peer: ['fine-tuning'], risk: [], output: [],
        offsets: { 'peft-lora': [-185, -90], 'evaluation': [-185, 90], 'fine-tuning': [400, -30] }
      },
      'scaling-law': {
        support: ['self-supervised-learning', 'transformer', 'distributed-training', 'moe', 'synthetic-data', 'training-data-governance'],
        peer: ['reasoning-models', 'test-time-compute'], risk: [], output: ['pretraining', 'llm'],
        offsets: { 'self-supervised-learning': [-90, -210], 'transformer': [-180, -130], 'distributed-training': [-220, -40], 'moe': [-220, 55], 'synthetic-data': [-175, 145], 'training-data-governance': [-90, 220], 'reasoning-models': [255, -240], 'test-time-compute': [455, -155], 'pretraining': [665, 0], 'llm': [420, 140] }
      },
      'distributed-training': {
        support: ['optimizer-schedule'], peer: ['deployment'], risk: [], output: ['pretraining', 'scaling-law'],
        offsets: { 'optimizer-schedule': [-200, -25], 'deployment': [275, -205], 'pretraining': [610, 0], 'scaling-law': [370, 135] }
      },
      'synthetic-data': {
        support: ['world-models', 'self-supervised-learning', 'training-data-governance'], peer: [], risk: [],
        output: ['distillation', 'reasoning-models', 'post-training', 'scaling-law'],
        offsets: { 'world-models': [-155, -145], 'self-supervised-learning': [-215, 0], 'training-data-governance': [-155, 145], 'distillation': [340, -160], 'reasoning-models': [505, -85], 'post-training': [700, 0], 'scaling-law': [430, 140] }
      },
      'quantization': {
        support: [], peer: ['distillation', 'regularization'], risk: [], output: ['inference-optimization', 'deployment', 'peft-lora'],
        offsets: { 'distillation': [220, -260], 'regularization': [415, -190], 'inference-optimization': [475, -65], 'deployment': [690, 10], 'peft-lora': [410, 145] }
      },
      'fine-tuning': {
        support: ['llm', 'supervised-learning', 'optimizer-schedule', 'regularization'],
        peer: ['rag', 'prompt-engineering', 'in-context-learning', 'model-merging'], risk: ['overfitting'],
        output: ['peft-lora', 'post-training', 'alignment', 'rlhf', 'controllable-generation', 'voice-cloning'],
        offsets: { 'llm': [-145, -165], 'supervised-learning': [-215, -55], 'optimizer-schedule': [-215, 65], 'regularization': [-145, 170], 'rag': [220, -390], 'prompt-engineering': [400, -335], 'in-context-learning': [565, -275], 'model-merging': [720, -215], 'peft-lora': [460, -80], 'post-training': [840, 0], 'alignment': [685, 90], 'rlhf': [540, 155], 'controllable-generation': [400, 205], 'voice-cloning': [260, 245], 'overfitting': [0, 210] }
      },
      'peft-lora': {
        support: ['fine-tuning', 'quantization'], peer: [], risk: [], output: ['deployment', 'model-merging'],
        offsets: { 'fine-tuning': [-185, -90], 'quantization': [-185, 90], 'model-merging': [360, -120], 'deployment': [610, 10] }
      },
      'distillation': {
        support: ['information-theory', 'synthetic-data'], peer: ['pretraining', 'quantization'], risk: [], output: [],
        offsets: { 'information-theory': [-185, -90], 'synthetic-data': [-185, 90], 'pretraining': [315, -130], 'quantization': [505, 75] }
      },
      'clip': {
        support: ['embedding', 'contrastive-learning'], peer: [], risk: [], output: ['multimodal', 'image-generation'],
        offsets: { 'embedding': [-185, -90], 'contrastive-learning': [-185, 90], 'multimodal': [380, -120], 'image-generation': [605, 15] }
      },
      'pretraining': {
        support: ['self-supervised-learning', 'unsupervised-learning', 'transformer', 'gradient-descent', 'optimizer-schedule', 'distributed-training', 'scaling-law', 'training-data-governance'],
        peer: ['distillation'], risk: ['data-poisoning', 'bias-fairness'], output: ['llm', 'post-training'],
        offsets: { 'self-supervised-learning': [-65, -245], 'unsupervised-learning': [-145, -195], 'transformer': [-205, -125], 'gradient-descent': [-235, -45], 'optimizer-schedule': [-235, 45], 'distributed-training': [-205, 130], 'scaling-law': [-145, 205], 'training-data-governance': [-65, 255], 'distillation': [295, -225], 'llm': [675, -5], 'post-training': [440, 125], 'data-poisoning': [0, 210], 'bias-fairness': [120, 185] }
      },
      'post-training': {
        support: ['pretraining', 'fine-tuning', 'rlhf', 'synthetic-data'], peer: [], risk: [], output: ['alignment', 'reasoning-models'],
        offsets: { 'pretraining': [-130, -170], 'fine-tuning': [-205, -60], 'rlhf': [-205, 60], 'synthetic-data': [-130, 170], 'reasoning-models': [365, -125], 'alignment': [610, 10] }
      },
      'state-space-models': {
        support: ['rnn'], peer: ['attention', 'transformer'], risk: [], output: ['context-window', 'model-families'],
        offsets: { 'rnn': [-195, -30], 'attention': [220, -240], 'transformer': [405, -150], 'context-window': [610, 0], 'model-families': [365, 145] }
      },
      'self-supervised-learning': {
        support: [], peer: ['unsupervised-learning', 'supervised-learning'], risk: [],
        output: ['pretraining', 'scaling-law', 'diffusion', 'synthetic-data'],
        offsets: { 'unsupervised-learning': [205, -260], 'supervised-learning': [400, -190], 'pretraining': [670, 0], 'scaling-law': [465, -75], 'diffusion': [505, 100], 'synthetic-data': [305, 175] }
      },
      'contrastive-learning': {
        support: [], peer: [], risk: [], output: ['embedding', 'clip', 'multimodal', 'retrieval'],
        offsets: { 'embedding': [290, -165], 'clip': [475, -85], 'multimodal': [675, 0], 'retrieval': [390, 140] }
      },
      'positional-encoding': {
        support: [], peer: [], risk: ['lost-in-middle'], output: ['attention', 'transformer', 'context-window'],
        offsets: {'attention': [350, -130], 'transformer': [600, 0], 'context-window': [400, 120], 'lost-in-middle': [0, 210]}
      },
      'normalization': {
        support: [], peer: ['batch-norm'], risk: [], output: ['residual-connection', 'transformer', 'vanishing-gradient'],
        offsets: {'batch-norm': [230, -230], 'residual-connection': [420, -90], 'transformer': [630, 0], 'vanishing-gradient': [350, 150]}
      },
      'transformer': {
        support: ['neural-network', 'embedding', 'attention', 'positional-encoding', 'residual-connection', 'normalization'],
        peer: ['rnn', 'state-space-models', 'batch-norm'], risk: [], output: ['moe', 'pretraining', 'llm', 'multimodal', 'diffusion', 'speech', 'scaling-law'],
        offsets: {'neural-network': [-85, -190], 'embedding': [-170, -125], 'attention': [-215, -40], 'positional-encoding': [-215, 45], 'residual-connection': [-170, 130], 'normalization': [-85, 190], 'rnn': [220, -360], 'state-space-models': [410, -300], 'batch-norm': [550, -245], 'moe': [390, -120], 'pretraining': [570, -85], 'llm': [790, 0], 'multimodal': [660, 90], 'diffusion': [530, 165], 'speech': [390, 220], 'scaling-law': [230, 260]}
      },
      'rnn': {
        support: ['neural-network', 'backprop'], peer: ['transformer', 'state-space-models'], risk: ['vanishing-gradient'], output: [],
        offsets: {'neural-network': [-180, -85], 'backprop': [-180, 85], 'transformer': [250, -170], 'state-space-models': [490, 0], 'vanishing-gradient': [0, 210]}
      },
      'tokenization': {
        support: [], peer: [], risk: [], output: ['llm', 'context-window'],
        offsets: {'llm': [500, -45], 'context-window': [310, 150]}
      },
      'embedding': {
        support: ['contrastive-learning'], peer: ['knowledge-graph'], risk: [],
        output: ['image-generation', 'clip', 'multimodal', 'transformer', 'retrieval', 'vector-db', 'rag', 'clustering', 'dimensionality-reduction', 'curse-of-dimensionality'],
        offsets: {'contrastive-learning': [-190, 0], 'knowledge-graph': [220, -350], 'image-generation': [420, -300], 'clip': [560, -230], 'multimodal': [680, -150], 'transformer': [720, -75], 'retrieval': [850, 0], 'vector-db': [750, 75], 'rag': [630, 145], 'clustering': [500, 210], 'dimensionality-reduction': [360, 265], 'curse-of-dimensionality': [220, 300]}
      },
      'optimizer-schedule': {
        support: ['gradient-descent', 'backprop', 'loss-function'], peer: [], risk: [], output: ['distributed-training', 'pretraining', 'fine-tuning'],
        offsets: {'gradient-descent': [-150, -130], 'backprop': [-210, 0], 'loss-function': [-150, 130], 'distributed-training': [350, -140], 'pretraining': [620, 0], 'fine-tuning': [380, 140]}
      },
      'residual-connection': {
        support: ['batch-norm', 'normalization'], peer: [], risk: [], output: ['cnn', 'transformer', 'vanishing-gradient'],
        offsets: {'batch-norm': [-180, -90], 'normalization': [-180, 90], 'cnn': [380, -145], 'transformer': [620, 0], 'vanishing-gradient': [400, 145]}
      },
      'cnn': {
        support: ['neural-network', 'residual-connection'], peer: [], risk: [], output: ['diffusion'],
        offsets: {'neural-network': [-180, -90], 'residual-connection': [-180, 90], 'diffusion': [500, 0]}
      },
      'backprop': {
        support: ['loss-function'], peer: [], risk: ['vanishing-gradient'], output: ['gradient-descent', 'optimizer-schedule', 'rnn'],
        offsets: {'loss-function': [-185, 0], 'vanishing-gradient': [0, 210], 'optimizer-schedule': [350, -160], 'gradient-descent': [610, 0], 'rnn': [370, 145]}
      },
      'vanishing-gradient': {
        support: ['backprop', 'residual-connection', 'attention', 'batch-norm', 'normalization'], peer: [], risk: [], output: ['neural-network', 'rnn'],
        offsets: {'backprop': [-100, -170], 'residual-connection': [-180, -90], 'attention': [-210, 0], 'batch-norm': [-180, 90], 'normalization': [-100, 170], 'neural-network': [330, -135], 'rnn': [570, 0]}
      },
      'batch-norm': {
        support: [], peer: ['normalization', 'transformer'], risk: [], output: ['neural-network', 'residual-connection', 'regularization', 'vanishing-gradient'],
        offsets: {'normalization': [220, -280], 'transformer': [410, -210], 'residual-connection': [450, -90], 'neural-network': [650, 0], 'regularization': [500, 100], 'vanishing-gradient': [330, 185]}
      },
      'decision-tree': {
        support: ['supervised-learning'], peer: ['neural-network', 'kernel-methods'], risk: [], output: [],
        offsets: {'supervised-learning': [-180, 0], 'neural-network': [250, -150], 'kernel-methods': [460, 0]}
      },
      'clustering': {
        support: ['embedding'], peer: [], risk: ['curse-of-dimensionality'], output: ['unsupervised-learning'],
        offsets: {'embedding': [-185, 0], 'unsupervised-learning': [410, 0], 'curse-of-dimensionality': [0, 210]}
      },
      'kernel-methods': {
        support: ['regularization'], peer: ['neural-network', 'decision-tree'], risk: [], output: ['supervised-learning', 'curse-of-dimensionality'],
        offsets: {'regularization': [-180, 0], 'neural-network': [240, -220], 'decision-tree': [420, -130], 'supervised-learning': [600, 0], 'curse-of-dimensionality': [360, 155]}
      },
      'regularization': {
        support: ['gradient-descent', 'batch-norm', 'kernel-methods'], peer: [], risk: [],
        output: ['overfitting', 'fine-tuning', 'quantization'],
        offsets: {'gradient-descent': [-150, -130], 'batch-norm': [-210, 0], 'kernel-methods': [-150, 130], 'overfitting': [350, -140], 'fine-tuning': [620, 0], 'quantization': [360, 140]}
      },
      'dimensionality-reduction': {
        support: ['unsupervised-learning'], peer: [], risk: [],
        output: ['embedding', 'curse-of-dimensionality'],
        offsets: {'unsupervised-learning': [-180, 0], 'embedding': [300, -135], 'curse-of-dimensionality': [520, 30]}
      },
      'curse-of-dimensionality': {
        support: ['dimensionality-reduction', 'embedding', 'kernel-methods'], peer: [], risk: [],
        output: ['clustering', 'retrieval', 'adversarial-robustness'],
        offsets: {'dimensionality-reduction': [-150, -130], 'embedding': [-210, 0], 'kernel-methods': [-150, 130], 'clustering': [340, -150], 'retrieval': [620, 0], 'adversarial-robustness': [370, 145]}
      },
      'unsupervised-learning': {
        support: [], peer: ['supervised-learning', 'self-supervised-learning'], risk: [],
        output: ['clustering', 'dimensionality-reduction', 'pretraining'],
        offsets: {'supervised-learning': [220, -240], 'self-supervised-learning': [385, -165], 'clustering': [610, 0], 'dimensionality-reduction': [470, 105], 'pretraining': [290, 190]}
      },
      'reinforcement-learning': {
        support: ['world-models'], peer: ['agent'], risk: ['reward-hacking'],
        output: ['rlhf', 'alignment'],
        offsets: {'world-models': [-190, 0], 'agent': [280, -200], 'rlhf': [580, 0], 'alignment': [390, 145], 'reward-hacking': [0, 210]}
      },
      'overfitting': {
        support: ['regularization', 'loss-function'], peer: [], risk: [],
        output: ['supervised-learning', 'fine-tuning', 'evaluation', 'privacy'],
        offsets: {'regularization': [-180, -85], 'loss-function': [-180, 85], 'supervised-learning': [300, -170], 'fine-tuning': [520, -80], 'evaluation': [680, 0], 'privacy': [390, 160]}
      },
      'information-theory': {
        support: [], peer: [], risk: [],
        output: ['loss-function', 'llm', 'sampling-params', 'rlhf', 'distillation'],
        offsets: {'loss-function': [280, -200], 'llm': [500, -100], 'sampling-params': [680, 0], 'rlhf': [490, 115], 'distillation': [300, 205]}
      },
      'loss-function': {
        support: ['information-theory'], peer: ['evaluation'], risk: ['overfitting', 'reward-hacking'],
        output: ['gradient-descent', 'backprop', 'llm', 'optimizer-schedule'],
        offsets: {'information-theory': [-190, 0], 'evaluation': [280, -250], 'gradient-descent': [480, -140], 'backprop': [660, 0], 'llm': [500, 100], 'optimizer-schedule': [340, 185], 'overfitting': [0, 210], 'reward-hacking': [125, 200]}
      },
      'gradient-descent': {
        support: ['loss-function', 'backprop'], peer: [], risk: [],
        output: ['regularization', 'optimizer-schedule', 'neural-network', 'pretraining'],
        offsets: {'loss-function': [-180, -90], 'backprop': [-180, 90], 'regularization': [320, -180], 'optimizer-schedule': [450, -90], 'neural-network': [660, 0], 'pretraining': [460, 110]}
      }
    };
    Object.entries(batchLayouts).forEach(([id, config]) => { localLayouts[id] = config.offsets; });

    return {localLayouts, batchLayouts};
  };
})(window);
