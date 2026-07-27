/* 理解原理页 —— 无监督学习 */
window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE['unsupervised-learning'] = window.createDeepDive({
  title:'无监督学习：没有人工标签时，结构从假设中来',
  subtitle:'用聚类、降维、密度估计和生成建模理解“没有标准答案”的目标设计、非唯一性、伪结构与验证。',
  thesis:'无监督学习从未人工标注的数据中寻找规律，但数据不会自动宣布哪种结构最有用。算法必须引入距离、密度、独立性、重建或概率分布等归纳偏置；因此结果不是被动“发现真相”，而是<b>数据、表示、目标函数和超参数共同生成的解释</b>，必须用稳定性、外部知识与下游价值验证。',
  goals:['区分无监督与自监督','识别四类目标的归纳偏置','手算缩放如何改变距离','设计稳定性、外部与下游验证'],
  quality:{
    contractVersion:2,
    examples:[{
      section:3,
      evidence:{
        setup:'假设我们准备用距离把行为相近的用户分到一组',
        rule:'二维欧氏距离把两个特征上的差分别平方、相加，再开平方',
        steps:'购买次数相差',
        interpretation:'这并不证明金额在业务上更重要'
      }
    }],
    sectionContracts:[
      {section:1,
        definition:{answer:'无监督学习在没有人工逐条标签时，仍用目标函数学习数据结构。',evidence:'无监督学习并非只有“自动分组”'},
        problem:{answer:'它解决大量无标签数据无法直接按标准答案训练的问题。',evidence:'三类任务的用途不同'},
        inputOutput:{answer:'输入是无标签样本，输出可以是分组、低维坐标或分布模型。',evidence:'用更少的新坐标概括原来的多个特征'},
        mechanism:{answer:'先选择结构假设，再把“更好”写成可计算目标并优化。',evidence:'每类任务还要把“更好”写成可计算目标'},
        interpretation:{answer:'目标值只能按所选假设解释，例如重建误差小表示压缩丢失较少。',evidence:'越小表示压缩后丢失的信息越少'},
        boundary:{answer:'没有人工标签不等于没有目标，也不等于结果天然正确。',evidence:'没有人工标签，只表示答案不由人逐条提供'}
      },
      {section:2,
        definition:{answer:'聚类、降维、密度估计和生成建模是四类不同的无监督任务。',evidence:'四类任务回答不同问题'},
        problem:{answer:'本节解决这些任务为何同属无监督却不能混为一谈的问题。',evidence:'分组、压缩和生成为什么都叫无监督'},
        inputOutput:{answer:'共同输入是无人工标签的数据，输出分别是簇、低维坐标、分布或新样本。',evidence:'簇或归属概率'},
        mechanism:{answer:'每类任务用不同目标把结构假设转成可优化规则。',evidence:'相似样本应成组'},
        interpretation:{answer:'同一数据可以同时存在多种合理结构，输出要按用途解释。',evidence:'同一数据可以同时存在多个合理结构'},
        boundary:{answer:'不能脱离实际用途宣布其中一种结构是唯一正确答案。',evidence:'选择取决于用途'}
      },
      {section:3,
        definition:{answer:'特征尺度会在距离计算中形成未经声明的隐含权重。',evidence:'尺度就是一种未经声明的权重'},
        problem:{answer:'本节解释消费金额为何可能淹没购买次数对相似度的影响。',evidence:'消费金额为何会淹没购买次数'},
        inputOutput:{answer:'输入是四位用户的次数和金额，输出是标准化前后的两两距离。',evidence:'这里只比较两个特征'},
        mechanism:{answer:'欧氏距离将各特征差平方、相加并开平方，z-score 再按各维波动缩放。',evidence:'分别平方、相加，再开平方'},
        interpretation:{answer:'金额项主导只说明数值尺度较大，不证明金额业务上更重要。',evidence:'这并不证明金额在业务上更重要'},
        boundary:{answer:'标准化也隐含各维方差约等权，未必符合真实业务代价。',evidence:'并非天然正确'}
      },
      {section:4,
        definition:{answer:'本节用同一数据的两种几何图展示表示与尺度会改变结构。',evidence:'同一数据可被不同目标切出不同结构'},
        problem:{answer:'它解决算法究竟发现天然簇还是执行几何假设的疑问。',evidence:'算法是在“发现簇”'},
        inputOutput:{answer:'输入是同一组二维点，输出是原始尺度与缩放后的两种空间布局。',evidence:'输入是同一组二维点，输出是两种尺度下的几何布局'},
        mechanism:{answer:'改变特征尺度会改变距离贡献，随后算法按新的几何关系切分。',evidence:'标准化/加权后'},
        interpretation:{answer:'图中的分离应解释为表示和目标共同产生的候选结构。',evidence:'两维共同决定几何'},
        boundary:{answer:'二维图不能代替用途验证，也不能单独证明存在天然类别。',evidence:'必须回到用途验证'}
      },
      {section:5,
        definition:{answer:'降维是用较少新坐标概括原来的多个特征。',evidence:'降维就是用更少的新坐标概括这些特征'},
        problem:{answer:'它解决多特征数据难以压缩、观察和交给后续模型的问题。',evidence:'把多项特征压成少数坐标'},
        inputOutput:{answer:'输入是高维特征向量，输出是一个或多个低维坐标。',evidence:'原来的两个特征就被压成了一个'},
        mechanism:{answer:'PCA 选择保留总体变化较多的投影方向，其他方法可优先保持近邻。',evidence:'PCA 选择这条主要方向'},
        interpretation:{answer:'低维坐标表示样本沿所选方向的位置或邻域关系。',evidence:'总体活跃程度'},
        boundary:{answer:'变化最大或图上成岛都不保证对应当前业务的重要结构。',evidence:'变化最大”不保证“对当前业务最重要'}
      },
      {section:6,
        definition:{answer:'密度估计学习数据在哪些区域集中、哪些区域少见。',evidence:'密度估计要学出一张分布地图'},
        problem:{answer:'它解决没有标签时如何描述常见模式并识别罕见区域的问题。',evidence:'为什么它能帮助发现异常'},
        inputOutput:{answer:'输入是大量无标签样本，输出是可给位置计算密度的分布模型。',evidence:'给模型很多没有标签的样本'},
        mechanism:{answer:'比较不同参数的对数似然，选择最能解释整批样本的参数。',evidence:'训练比较不同参数'},
        interpretation:{answer:'低密度表示记录少见，适合进入复核而不是直接判错。',evidence:'于是进入人工检查队列'},
        boundary:{answer:'密度证据不包含业务价值，低密度不等于有害或欺诈。',evidence:'密度估计给的是分布证据，不是业务判决'}
      },
      {section:7,
        definition:{answer:'自监督学习从样本自身自动构造明确的预测目标。',evidence:'自监督从样本自动构造明确目标'},
        problem:{answer:'它解决缺少人工标签时仍需要明确训练答案的问题。',evidence:'遮盖 token 没有人标注'},
        inputOutput:{answer:'输入是被遮盖或变换后的样本，输出是原 token、下一帧或同对象表示。',evidence:'原 token、下一帧或同一对象视图'},
        mechanism:{answer:'从原始数据中隐藏一部分，再让模型恢复或预测它。',evidence:'可由数据恢复'},
        interpretation:{answer:'预测损失可直接计算，但学到的表示仍可能不唯一。',evidence:'损失明确，表示仍非唯一'},
        boundary:{answer:'自监督是否归入无监督存在口径差异，应按监督信号来源说明。',evidence:'广义上，自监督常被归入无监督表示学习'}
      },
      {section:8,
        definition:{answer:'内部指标是不使用人工正确答案、仅利用数据与结果计算的评估分数。',evidence:'内部指标是不借助人工正确答案'},
        problem:{answer:'它解决没有标签时怎样初步比较多个聚类结果的问题。',evidence:'怎样比较两个聚类结果'},
        inputOutput:{answer:'输入是数据、距离和候选分组，输出是轮廓系数等评估证据。',evidence:'只利用输入数据和算法结果'},
        mechanism:{answer:'轮廓系数比较同簇平均距离与最近其他簇平均距离。',evidence:'轮廓系数专门评估聚类结果'},
        interpretation:{answer:'接近一表示归组清楚，接近零表示边界，小于零可能分错。',evidence:'接近 1 通常表示组内紧'},
        boundary:{answer:'内部高分只证明当前几何分隔，不能证明业务语义和实际价值。',evidence:'不证明这些组具有业务含义'}
      },
      {section:9,
        definition:{answer:'伪结构是由采集批次、设备或缺失处理等混杂因素形成的分组。',evidence:'伪结构常来自批次、设备和缺失机制'},
        problem:{answer:'它解决算法发现的群体可能只是数据来源差异的问题。',evidence:'可能只是两台仪器'},
        inputOutput:{answer:'输入是分组及来源元数据，输出是混杂探针和分层对照证据。',evidence:'采集日期、地区、设备、文件格式'},
        mechanism:{answer:'训练探针、分层重采样并替换背景或元数据以检查结构变化。',evidence:'先训练一个探针预测这些混杂变量'},
        interpretation:{answer:'若来源变量能预测分组，当前簇更可能反映采集流程而非目标语义。',evidence:'比较去除前后结构'},
        boundary:{answer:'高影响人群应用还需要合法基础、公平评测、人工复核与申诉。',evidence:'高影响用途需要合法基础'}
      },
      {section:10,
        definition:{answer:'上线无监督结果需要版本化数据、特征、目标、验证和簇映射。',evidence:'版本化整个结构发现过程'},
        problem:{answer:'它解决数据或模型变化后旧簇含义无法可靠延续的问题。',evidence:'旧簇编号还能继续使用吗'},
        inputOutput:{answer:'输入是冻结的数据与配置，输出是经稳定性和外部证据选择的版本化结果。',evidence:'冻结数据快照、特征、缺失处理和距离'},
        mechanism:{answer:'比较目标与随机种子，验证用途，记录匹配规则并持续监控漂移。',evidence:'比较多种合理目标与随机种子'},
        interpretation:{answer:'结果应按稳定性和外部价值选择，而不是按图是否漂亮选择。',evidence:'不只看漂亮图'},
        boundary:{answer:'重训后簇会置换、分裂或合并，簇编号不能作为永久身份。',evidence:'不能把“簇2”当永久身份'}
      }
    ],
    termReviews:[
      {section:1,reviewedAt:'2026-07-26',terms:[
        {name:'降维',meaning:'用更少的新坐标概括原来的多个特征',purpose:'压缩数据并保留与目标有关的主要变化',definitionEvidence:'降维 就是用更少的新坐标概括原来的多个特征',purposeEvidence:'便于压缩、画图或交给后续模型使用'},
        {name:'PCA',meaning:'按照总体变化大小选择压缩方向的降维方法',purpose:'用少量坐标保留数据中的主要变化',definitionEvidence:'PCA 是一种降维方法',purposeEvidence:'尽量保留数据中变化最大的方向'},
        {name:'重建误差',meaning:'还原数据与原数据之间的差异',purpose:'衡量压缩表示丢失了多少原始信息',definitionEvidence:'重建误差就是还原结果与原数据之间的差',purposeEvidence:'越小表示压缩后丢失的信息越少'},
        {name:'密度估计',meaning:'学习数据在哪些区域更常出现的任务',purpose:'发现罕见样本并生成或补全合理样本',definitionEvidence:'密度估计 学习数据在哪些区域更常出现',purposeEvidence:'用来发现罕见样本，或生成、补全与训练数据相似的样本'},
        {name:'似然',meaning:'参数对已观察数据合理程度的评分',purpose:'比较不同参数对整批训练数据的解释能力',definitionEvidence:'似然表示一组模型参数让已经观察到的数据出现得有多合理',purposeEvidence:'密度模型选择让整批数据获得更高似然的参数'}
      ]},
      {section:5,reviewedAt:'2026-07-26',terms:[
        {name:'协方差矩阵',meaning:'概括多个特征如何共同变化的矩阵',purpose:'帮助 PCA 找到保留总体变化的投影方向',definitionEvidence:'概括各特征怎样一起变化',purposeEvidence:'数据投到这些方向后，各新坐标还保留多少变化'},
        {name:'局部邻域',meaning:'一个点周围最相近的一组点',purpose:'让降维图尽量保留原空间中的近邻关系',definitionEvidence:'一个点周围最相近的若干点',purposeEvidence:'把这些近邻放到二维图中仍然靠近'},
        {name:'高维',meaning:'每个样本由很多个特征描述',purpose:'说明降维前距离和邻居是在多特征空间中计算的',definitionEvidence:'原数据拥有很多特征',purposeEvidence:'原始高维空间里有哪些近邻'},
        {name:'特征向量',meaning:'把一个样本的多个特征按顺序组成的数值列表',purpose:'作为投影和距离计算的统一输入表示',definitionEvidence:'表示某位用户的特征向量',purposeEvidence:'用户在这条方向上的一维坐标'},
        {name:'t-SNE',meaning:'主要保留局部近邻关系的非线性降维方法',purpose:'探索可能的小群体和局部邻居',definitionEvidence:'t-SNE 和 UMAP 在做另一件事',purposeEvidence:'适合观察局部邻居和候选小群体'},
        {name:'UMAP',meaning:'强调局部邻接并尝试兼顾较大尺度结构的降维方法',purpose:'探索邻域和连续变化',definitionEvidence:'局部邻接关系，并尝试保留部分较大尺度结构',purposeEvidence:'适合探索邻域和连续变化'}
      ]},
      {section:6,reviewedAt:'2026-07-26',terms:[
        {name:'概率密度',meaning:'连续空间中某个位置附近的数据集中程度',purpose:'比较哪些区域常见、哪些区域罕见',definitionEvidence:'概率密度表示某个位置附近的数据有多集中',purposeEvidence:'比较不同区域谁更常见'},
        {name:'对数似然',meaning:'把每个样本的密度取对数后相加得到的整体评分',purpose:'稳定地比较参数对整批训练数据的解释程度',definitionEvidence:'对数似然就是把每个样本的密度先取对数，再把结果相加',purposeEvidence:'比较哪组参数更能解释整批数据'}
      ]},
      {section:8,reviewedAt:'2026-07-26',terms:[
        {name:'内部指标',meaning:'只利用数据和模型结果计算的评估分数',purpose:'在没有标准标签时比较若干候选结果',definitionEvidence:'内部指标是不借助人工正确答案',purposeEvidence:'帮助我们在若干候选结果之间做初步比较'},
        {name:'轮廓系数',meaning:'比较样本对本簇和最近其他簇距离的聚类指标',purpose:'检查样本是否更接近自己的簇',definitionEvidence:'轮廓系数专门评估聚类结果',purposeEvidence:'判断一个样本是否更接近自己的组'},
        {name:'稳定性检查',meaning:'检查结果在数据或设置轻微变化后能否保持',purpose:'排查只由随机性或偶然样本造成的结构',definitionEvidence:'稳定性检查回答另一件事',purposeEvidence:'判断当前结构是否只是一次偶然结果'}
      ]}
    ],
    formulas:[
      {id:'two-dimensional-euclidean-distance',section:3,symbols:[
        {name:'d',meaning:'两位用户之间的二维欧氏距离',evidence:'二维欧氏距离'},
        {name:'u',meaning:'参与比较的第一位用户特征向量',evidence:'对用户 u'},
        {name:'v',meaning:'参与比较的第二位用户特征向量',evidence:'和 v=(v₁,v₂)'}
      ]},
      {id:'z-score-by-feature',section:3,symbols:[
        {name:'z',meaning:'标准化后的特征值',evidence:'z-score 标准化'},
        {name:'x',meaning:'标准化前的原始特征值',evidence:'每个特征分别做 z-score 标准化'},
        {name:'i',meaning:'用户索引',evidence:'i 表示第几位用户'},
        {name:'j',meaning:'特征索引',evidence:'j 表示第几个特征'},
        {name:'μ',meaning:'当前特征的均值',evidence:'分别是第 j 个特征在四位用户中的均值和标准差'},
        {name:'σ',meaning:'当前特征的标准差',evidence:'分别是第 j 个特征在四位用户中的均值和标准差'}
      ]},
      {id:'pca-one-dimensional-projection',section:5,symbols:[
        {name:'z',meaning:'投影后的一维坐标',evidence:'用户在这条方向上的一维坐标'},
        {name:'w',meaning:'选定的单位投影方向',evidence:'表示我们选择的一条方向'},
        {name:'x',meaning:'某位用户的原始特征向量',evidence:'表示某位用户的特征向量'},
        {name:'μ',meaning:'全部用户的平均特征向量',evidence:'表示所有用户的平均位置'},
        {name:'T',meaning:'转置；此处用于形成内积',evidence:'转置”符号'}
      ]},
      {id:'pca-retained-variance',section:5,symbols:[
        {name:'W',meaning:'要寻找的多条投影方向组成的矩阵',evidence:'要寻找的若干条投影方向'},
        {name:'T',meaning:'矩阵转置',evidence:'转置”符号'},
        {name:'I',meaning:'单位矩阵；约束方向单位化且彼此垂直',evidence:'各方向长度为 1，并且彼此垂直'},
        {name:'Σ',meaning:'描述各特征共同变化的协方差矩阵',evidence:'协方差矩阵'},
        {name:'Tr',meaning:'矩阵对角线元素之和',evidence:'取矩阵对角线之和'}
      ]},
      {id:'density-maximum-likelihood',section:6,symbols:[
        {name:'θ',meaning:'密度模型的可调参数',evidence:'参数为 θ 的模型'},
        {name:'p',meaning:'模型给样本的概率密度',evidence:'模型给这个样本的概率密度'},
        {name:'x',meaning:'一个训练样本',evidence:'第 i 个训练样本'},
        {name:'i',meaning:'训练样本索引',evidence:'第 i 个训练样本'},
        {name:'n',meaning:'训练样本的总数量',evidence:'n 表示训练样本总数'}
      ]},
      {id:'silhouette-score',section:8,symbols:[
        {name:'s',meaning:'当前样本的轮廓系数',evidence:'s 是这个样本的轮廓系数'},
        {name:'a',meaning:'当前样本到同簇其他点的平均距离',evidence:'a 是它到同组其他点的平均距离'},
        {name:'b',meaning:'当前样本到最近其他簇的平均距离',evidence:'b 是它到最近另一组的平均距离'},
        {name:'max',meaning:'从 a 与 b 中取较大的数作为归一化分母',evidence:'max(a,b) 取两者中较大的一个'}
      ]}
    ]
  },
  sections:[
    {title:'没有标签不等于没有目标函数',badge:'定义',lead:'算法凭什么判断一个表示或分组更好？',body:'<p>无监督学习并非只有“自动分组”。<b>聚类</b>把相似样本放在一起；<b>降维</b>就是用更少的新坐标概括原来的多个特征，便于压缩、画图或交给后续模型使用；<b>密度估计</b>学习数据在哪些区域更常出现，用来发现罕见样本，或生成、补全与训练数据相似的样本。三类任务的用途不同，不能只列算法名而不说明它们解决什么问题。</p><p>每类任务还要把“更好”写成可计算目标。K-means 让同组样本尽量靠近。<b>PCA 是一种降维方法</b>，它尽量保留数据中变化最大的方向。自动编码器把压缩后的数据还原，<b>重建误差就是还原结果与原数据之间的差</b>，越小表示压缩后丢失的信息越少。<b>似然表示一组模型参数让已经观察到的数据出现得有多合理</b>，密度模型选择让整批数据获得更高似然的参数。没有人工标签，只表示答案不由人逐条提供，并不表示训练没有目标。</p><div class="dd-note"><b>贯穿例子：</b>四位用户用两个特征描述：月购买次数 x₁ 与消费金额 x₂。A=(1,100)、B=(2,110)、C=(8,900)、D=(9,920)。我们观察标准化前后，距离与分组如何改变。</div>'},
    {title:'四类任务回答不同问题',kind:'eng',badge:'任务地图',lead:'分组、压缩和生成为什么都叫无监督？',body:'<div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>任务</th><th>典型目标</th><th>输出</th><th>隐含假设</th></tr></thead><tbody><tr><td>聚类</td><td>紧致/密度/图切分</td><td>簇或归属概率</td><td>相似样本应成组</td></tr><tr><td>降维</td><td>方差/邻域/重建</td><td>低维坐标</td><td>重要结构可压缩</td></tr><tr><td>密度估计</td><td>最大似然</td><td>p(x)</td><td>分布族可描述数据</td></tr><tr><td>生成建模</td><td>似然/去噪/对抗</td><td>新样本</td><td>训练分布值得复现</td></tr></tbody></table></div><p>同一数据可以同时存在多个合理结构，例如按消费规模、品类偏好或活跃周期分组；选择取决于用途。</p>'},
    {title:'尺度就是一种未经声明的权重',kind:'math',badge:'逐步演算',lead:'先明确要比较谁、为什么比较，再看消费金额为何会淹没购买次数。',body:'<p><b>任务场景：</b>假设我们准备用距离把行为相近的用户分到一组。距离越小，就暂时把两位用户视为越相似。这里只比较两个特征：<code>x₁</code> 是月购买次数，<code>x₂</code> 是月消费金额（元）。本节重新列出要用的数据，因此不要求读者回头寻找题干。</p><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>用户</th><th>月购买次数 x₁</th><th>月消费金额 x₂（元）</th></tr></thead><tbody><tr><td>A</td><td>1</td><td>100</td></tr><tr><td>B</td><td>2</td><td>110</td></tr><tr><td>C</td><td>8</td><td>900</td></tr><tr><td>D</td><td>9</td><td>920</td></tr></tbody></table></div><p><b>先定义计算规则：</b>二维欧氏距离把两个特征上的差分别平方、相加，再开平方。对用户 <code>u=(u₁,u₂)</code> 和 <code>v=(v₁,v₂)</code>：</p><div class="dd-formula" data-formula-id="two-dimensional-euclidean-distance" data-display="mathml"><math display="block" aria-label="u 与 v 的欧氏距离等于第一个特征差的平方加第二个特征差的平方，再开平方"><mrow><mi>d</mi><mo>(</mo><mi>u</mi><mo>,</mo><mi>v</mi><mo>)</mo><mo>=</mo><msqrt><mrow><msup><mrow><mo>(</mo><msub><mi>u</mi><mn>1</mn></msub><mo>−</mo><msub><mi>v</mi><mn>1</mn></msub><mo>)</mo></mrow><mn>2</mn></msup><mo>+</mo><msup><mrow><mo>(</mo><msub><mi>u</mi><mn>2</mn></msub><mo>−</mo><msub><mi>v</mi><mn>2</mn></msub><mo>)</mo></mrow><mn>2</mn></msup></mrow></msqrt></mrow></math></div><p><b>代入 A 与 B：</b>购买次数相差 <code>2−1=1</code>，金额相差 <code>110−100=10</code>。所以距离为 <span class="dd-radical" role="math" aria-label="1²+10² 的平方根"><span class="dd-radicand">1²+10²</span></span>=<span class="dd-radical" role="math" aria-label="101 的平方根"><span class="dd-radicand">101</span></span>≈<b>10.05</b>。平方和中次数贡献 <code>1²=1</code>，金额贡献 <code>10²=100</code>；虽然两人的购买次数也不同，原始距离的约 99% 已来自金额项。</p><p><b>再代入 B 与 C：</b>次数相差 <code>8−2=6</code>，金额相差 <code>900−110=790</code>，所以距离为 <span class="dd-radical" role="math" aria-label="6²+790² 的平方根"><span class="dd-radicand">6²+790²</span></span>≈<b>790.02</b>。这并不证明金额在业务上更重要；只是“元”的数值范围远大于“次”，计算在未经声明的情况下给了金额更高权重。</p><p><b>怎样让两维按各自的典型波动比较？</b>可以对每个特征分别做 z-score 标准化：</p><div class="dd-formula" data-formula-id="z-score-by-feature" data-display="mathml"><math display="block" aria-label="第 i 个用户第 j 个特征的标准分，等于原值减去第 j 个特征的均值，再除以第 j 个特征的标准差"><mrow><msub><mi>z</mi><mrow><mi>i</mi><mi>j</mi></mrow></msub><mo>=</mo><mfrac><mrow><msub><mi>x</mi><mrow><mi>i</mi><mi>j</mi></mrow></msub><mo>−</mo><msub><mi>μ</mi><mi>j</mi></msub></mrow><msub><mi>σ</mi><mi>j</mi></msub></mfrac></mrow></math></div><p>这里 <code>i</code> 表示第几位用户，<code>j</code> 表示第几个特征；<code>μⱼ</code> 和 <code>σⱼ</code> 分别是第 <code>j</code> 个特征在四位用户中的均值和标准差。标准化后，数值表示“离本特征均值多少个标准差”，次数和金额不再直接用“次”和“元”比较。</p><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>距离</th><th>原始单位</th><th>z-score 后（约）</th><th>读法</th></tr></thead><tbody><tr><td>A 到 B</td><td>10.05</td><td>0.284</td><td>两人都处在低频、低消费区域，差异很小</td></tr><tr><td>B 到 C</td><td>790.02</td><td>2.595</td><td>次数与金额的相对偏离都参与距离</td></tr></tbody></table></div><p>标准化让购买次数重新拥有可见影响，但它也隐含“各维按自身方差约等权”的选择，并非天然正确。金额若确实代表更高业务代价，完全等权反而会丢掉价值判断；此时应显式加入业务权重，并记录理由和敏感性分析。</p><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>处理</th><th>距离主要由什么决定</th><th>解释</th></tr></thead><tbody><tr><td>原始单位</td><td>数值范围最大的特征</td><td>本例隐式给金额高权重</td></tr><tr><td>z-score</td><td>各维相对自身波动的偏离</td><td>各维方差约等权</td></tr><tr><td>业务加权</td><td>显式定义的成本或价值</td><td>需记录权重理由并验证稳健性</td></tr></tbody></table></div>'},
    {title:'原创图：同一数据可被不同目标切出不同结构',badge:'可视化',lead:'算法是在“发现簇”，还是在执行一套几何假设？',body:'<figure class="dd-fig"><svg viewBox="0 0 735 310" role="img" aria-label="同一组二维点在不同距离尺度和密度目标下产生不同结构"><rect x="20" y="35" width="210" height="235" rx="10" fill="#21252d" stroke="#596273"/><text x="125" y="62" text-anchor="middle" class="svg-t">原始尺度</text><line x1="55" y1="235" x2="205" y2="235" stroke="#778293"/><line x1="55" y1="235" x2="55" y2="82" stroke="#778293"/><circle cx="72" cy="216" r="8" fill="#65a6d9"/><circle cx="80" cy="213" r="8" fill="#65a6d9"/><circle cx="174" cy="95" r="8" fill="#d3a05a"/><circle cx="184" cy="90" r="8" fill="#d3a05a"/><text x="125" y="260" text-anchor="middle" class="svg-t" font-size="11">金额轴主导</text><path d="M230,150 L285,150" stroke="#778293"/><rect x="290" y="35" width="210" height="235" rx="10" fill="#21252d" stroke="#596273"/><text x="395" y="62" text-anchor="middle" class="svg-t">标准化/加权后</text><line x1="325" y1="235" x2="475" y2="235" stroke="#778293"/><line x1="325" y1="235" x2="325" y2="82" stroke="#778293"/><circle cx="345" cy="210" r="8" fill="#65a6d9"/><circle cx="375" cy="195" r="8" fill="#65a6d9"/><circle cx="435" cy="110" r="8" fill="#d3a05a"/><circle cx="465" cy="92" r="8" fill="#d3a05a"/><text x="395" y="260" text-anchor="middle" class="svg-t" font-size="11">两维共同决定几何</text><path d="M500,150 L548,150" stroke="#778293"/><rect x="552" y="35" width="165" height="235" rx="10" fill="#21252d" stroke="#596273"/><text x="635" y="62" text-anchor="middle" class="svg-t">用途验证</text><text x="575" y="105" class="svg-t">换数据仍相似？</text><text x="575" y="140" class="svg-t">可解释？</text><text x="575" y="175" class="svg-t">有下游增益？</text><text x="575" y="210" class="svg-t">风险可接受？</text></svg><figcaption>图 1　输入是同一组二维点，输出是两种尺度下的几何布局。结构先受表示与尺度影响，再由算法目标切分；最后必须回到用途验证，而不是停在二维图上。</figcaption></figure>'},
    {title:'降维保留什么，由优化目标决定',kind:'math',badge:'压缩',lead:'先理解“把多项特征压成少数坐标”，再比较 PCA 与 t-SNE/UMAP 分别承诺保留什么。',body:'<p><b>什么是降维？</b>一位用户原本可能由购买次数、金额、活跃天数、品类数等许多特征描述。降维就是用更少的新坐标概括这些特征。它一定会选择“哪些差异值得保留”；不同方法选择的标准不同，因此得到的二维图不能互相替代。</p><div class="dd-note key"><b>先记住一个直觉：</b>把桌面上的物体用灯照到墙上，墙上的影子就是一次投影。影子只保留沿墙面方向的位置，朝向灯光的深度会丢失。PCA 要寻找一个让数据影子尽量分散、因而少丢主要变化的方向。</div><p><b>先看二维压成一维：</b>把每位用户画成平面上的一个点。若“购买次数高的人通常消费也高”，这些点会大致沿一条斜线排列。PCA 选择这条主要方向，用一个数表示每个点在斜线上的位置；原来的两个特征就被压成了一个“总体活跃程度”坐标。</p><p>用 <code>x</code> 表示某位用户的特征向量，<code>μ</code> 表示所有用户的平均位置，<code>w</code> 表示我们选择的一条方向。要求 <code>w</code> 的长度为 1，是为了让新坐标的尺度只反映数据，而不被任意放大。用户在这条方向上的一维坐标是：</p><div class="dd-formula" data-formula-id="pca-one-dimensional-projection" data-display="mathml"><math display="block" aria-label="新坐标 z 等于方向 w 的转置乘以用户向量 x 减去平均向量 mu"><mrow><mi>z</mi><mo>=</mo><msup><mi>w</mi><mi>T</mi></msup><mo>(</mo><mi>x</mi><mo>−</mo><mi>μ</mi><mo>)</mo></mrow></math></div><p>这里的“转置”符号 <code>T</code> 只表示把方向 <code>w</code> 与偏移量 <code>x−μ</code> 做内积，得到沿该方向走了多远。若把一维坐标再放回原空间，可得到近似位置 <code>x̂=μ+zw</code>。原点与近似位置之间的差，就是压缩丢掉的信息；PCA 选择让所有用户总体丢失尽量小的方向。</p><p><b>从一条方向推广到多条方向：</b>当原数据有很多特征、希望保留两个或更多新坐标时，把多条方向并排放进矩阵 <code>W</code>。因此，<code>W</code> 不是突然出现的新数据，而是“我们正在寻找的若干条压缩方向”的集合。下面的正式写法表达同一目标：</p><div class="dd-formula" data-formula-id="pca-retained-variance" data-display="mathml"><math display="block" aria-label="在 W 转置乘 W 等于单位矩阵的约束下，选择 W 使投影后保留的总方差最大"><mrow><munder><mo>max</mo><mrow><msup><mi>W</mi><mi>T</mi></msup><mi>W</mi><mo>=</mo><mi>I</mi></mrow></munder><mspace width="0.5em"/><mi>Tr</mi><mo>(</mo><msup><mi>W</mi><mi>T</mi></msup><mi>Σ</mi><mi>W</mi><mo>)</mo></mrow></math></div><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>符号或术语</th><th>在这里表示什么</th></tr></thead><tbody><tr><td><code>W</code></td><td>要寻找的若干条投影方向；每一列是一条方向</td></tr><tr><td><code>WᵀW=I</code></td><td>各方向长度为 1，并且彼此垂直，避免重复记录同一个方向</td></tr><tr><td><code>Σ</code>（协方差矩阵）</td><td>概括各特征怎样一起变化；例如次数升高时金额是否也常升高</td></tr><tr><td><code>WᵀΣW</code></td><td>数据投到这些方向后，各新坐标还保留多少变化</td></tr><tr><td><code>Tr</code>（迹）</td><td>取矩阵对角线之和；这里就是把各新坐标保留的变化量加起来</td></tr><tr><td><code>max</code></td><td>在所有合格方向中，选择保留总变化量最大的一组</td></tr></tbody></table></div><p>这里的“方差”可以先读成“数据有多分散”。PCA 保留分散程度最大的方向；等价地，在平方误差口径下，它让压缩后再还原的数据与原数据尽量接近。它适合概括整体趋势，也能近似重建原特征，但“变化最大”不保证“对当前业务最重要”：一个数值波动很大的无关特征也可能被优先保留。</p><p><b>t-SNE 和 UMAP 在做另一件事。</b>它们通常先判断每个点在原始高维空间里有哪些近邻，再尝试把这些近邻放到二维图中仍然靠近。所谓“局部邻域”，就是一个点周围最相近的若干点；所谓“高维”，只是原数据拥有很多特征，并不神秘。</p><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>方法</th><th>主要想保留什么</th><th>二维图可以怎样读</th><th>不能轻易怎样读</th></tr></thead><tbody><tr><td>PCA</td><td>整体变化较大的线性方向</td><td>方向、相对位置和保留方差有明确含义</td><td>不能保证保留低方差但重要的信号</td></tr><tr><td>t-SNE</td><td>很近的点仍尽量靠近</td><td>适合观察局部邻居和候选小群体</td><td>不同“岛”之间谁更远、岛有多大通常不能直接比较</td></tr><tr><td>UMAP</td><td>局部邻接关系，并尝试保留部分较大尺度结构</td><td>适合探索邻域和连续变化</td><td>二维距离仍不等于原空间精确距离，结果受参数和随机性影响</td></tr></tbody></table></div><p>“图上出现几个岛”只说明这种方法在当前参数、随机种子和表示下把点这样摆放，并不能单独证明数据中存在几个天然类别。判断是否真的存在稳定分组，应回到原始特征空间检查距离与邻居，在不同样本和参数下重画，并用外部知识或下游任务验证。</p>'},
    {title:'密度估计先学习“哪里常见”，再服务具体任务',kind:'math',badge:'概率',lead:'密度估计到底输出什么，为什么它能帮助发现异常、补全数据或生成新样本？',body:'<p><b>先说任务：</b>给模型很多没有标签的样本，例如大量用户的“购买次数—消费金额”记录；密度估计要学出一张分布地图，说明哪些区域数据集中、哪些区域很少出现。<b>概率密度表示某个位置附近的数据有多集中</b>，可用来比较不同区域谁更常见；它不是说某个连续数值点本身拥有多少概率。</p><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>学到“哪里常见”后</th><th>怎样使用</th><th>仍需注意</th></tr></thead><tbody><tr><td>异常筛查</td><td>把落在低密度区域的新记录送去复核</td><td>罕见不等于错误或欺诈</td></tr><tr><td>生成样本</td><td>从高密度结构附近抽取与训练数据相似的新样本</td><td>会复制训练分布的偏差</td></tr><tr><td>缺失值补全</td><td>在已知特征条件下选择较合理的缺失取值</td><td>分布变化后旧模型可能失效</td></tr></tbody></table></div><p><b>模型怎样学习这张地图？</b>用 <code>xᵢ</code> 表示第 <code>i</code> 个训练样本，<code>n</code> 表示训练样本总数，<code>pθ(xᵢ)</code> 表示参数为 <code>θ</code> 的模型给这个样本的概率密度。参数 <code>θ</code> 控制地图形状。训练比较不同参数，寻找让已观察样本整体显得更合理的一组 <code>θ*</code>。</p><p><b>对数似然就是把每个样本的密度先取对数，再把结果相加</b>，用它比较哪组参数更能解释整批数据。取对数会把很多密度的乘法变成加法，计算更稳定，同时不会改变参数优劣的排序：</p><div class="dd-formula" data-formula-id="density-maximum-likelihood" data-display="mathml"><math display="block" aria-label="选择参数 theta，使所有训练样本对数概率密度之和最大"><mrow><msup><mi>θ</mi><mo>*</mo></msup><mo>=</mo><munder><mo>arg max</mo><mi>θ</mi></munder><mspace width="0.5em"/><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>n</mi></munderover><mi>log</mi><mo> </mo><msub><mi>p</mi><mi>θ</mi></msub><mo>(</mo><msub><mi>x</mi><mi>i</mi></msub><mo>)</mo></mrow></math></div><p>例如，大多数用户落在“低频低消费”或“高频高消费”区域，一个突然出现的“极低频、极高消费”记录可能得到较低密度，于是进入人工检查队列。但这只说明它少见：新业务客户、节日订单或录入错误都可能造成同样结果。</p><div class="dd-note warn"><b>密度估计给的是分布证据，不是业务判决。</b>　低密度不等于有害，高密度也不等于正确；实际行动还要结合时间、类别、成本与人工复核。</div>'},
    {title:'自监督与无监督既有包含关系，也有训练形式差异',badge:'消歧',lead:'遮盖 token 没有人标注，为何还说有“答案”？',body:'<p>广义上，自监督常被归入无监督表示学习；狭义训练形式上，自监督从样本自动构造明确目标，例如原 token、下一帧或同一对象视图。传统聚类没有逐样本唯一答案，目标只衡量整体几何。区分二者有助于判断评测：预测目标可直接算 held-out loss，簇语义必须外部验证。</p><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>范式</th><th>自动目标</th><th>结果是否唯一</th></tr></thead><tbody><tr><td>自监督预测</td><td>有，可由数据恢复</td><td>损失明确，表示仍非唯一</td></tr><tr><td>聚类</td><td>整体几何目标</td><td>粒度与语义不唯一</td></tr></tbody></table></div>'},
    {title:'内部指标先检查“分得像不像”，再由外部证据判断“有没有用”',kind:'eng',badge:'评测',lead:'没有标准标签时，怎样比较两个聚类结果？轮廓系数究竟测了什么？',body:'<p><b>先分清角色：</b>密度估计是一个学习任务，会输出分布模型；<b>内部指标是不借助人工正确答案，只利用输入数据和算法结果计算的评估分数</b>。它帮助我们在若干候选结果之间做初步比较，例如比较分成 2 组还是 3 组、标准化前还是标准化后，但它本身不会产生新的分组。</p><p><b>轮廓系数专门评估聚类结果</b>，用于判断一个样本是否更接近自己的组，而不是更接近别的组。对当前样本，<code>a</code> 是它到同组其他点的平均距离，<code>b</code> 是它到最近另一组的平均距离，<code>s</code> 是这个样本的轮廓系数；<code>max(a,b)</code> 取两者中较大的一个：</p><div class="dd-formula" data-formula-id="silhouette-score" data-display="mathml"><math display="block" aria-label="轮廓系数 s 等于最近其他簇平均距离 b 减同簇平均距离 a，再除以 a 和 b 中较大的一个"><mrow><mi>s</mi><mo>=</mo><mfrac><mrow><mi>b</mi><mo>−</mo><mi>a</mi></mrow><mrow><mi>max</mi><mo>(</mo><mi>a</mi><mo>,</mo><mi>b</mi><mo>)</mo></mrow></mfrac></mrow></math></div><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>数值例子</th><th>计算</th><th>怎样解释</th></tr></thead><tbody><tr><td><code>a=2, b=8</code></td><td><code>s=(8−2)/8=0.75</code></td><td>离本组近、离其他组远，当前归组较清楚</td></tr><tr><td><code>a=5, b=4</code></td><td><code>s=(4−5)/5=−0.20</code></td><td>反而更靠近另一组，可能分错或位于边界</td></tr></tbody></table></div><p>单个样本的 <code>s</code> 位于 −1 到 1 之间；把所有样本取平均，可以比较若干候选聚类。接近 1 通常表示组内紧、组间远；接近 0 表示位于边界；小于 0 表示可能更像别组。但高分只证明当前特征和距离下的几何分隔较清楚，不证明这些组具有业务含义。</p><p><b>稳定性检查回答另一件事：</b>换一个随机种子、重新抽取一部分样本、改变时间窗口或轻微扰动特征后，分组是否仍大致相同。它用来判断当前结构是否只是一次偶然结果。最后还要做外部或下游验证：请专家解释各组、用少量已知标签核对，或检查分组是否真的改善检索和决策。</p><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>证据层</th><th>具体用途</th><th>不能单独证明</th></tr></thead><tbody><tr><td>内部指标</td><td>结果是否符合所选距离和目标</td><td>分组是否有业务意义</td></tr><tr><td>稳定性</td><td>结果是否依赖随机性或偶然样本</td><td>稳定的分组是否值得使用</td></tr><tr><td>外部/下游</td><td>是否符合专家知识并改善真实任务</td><td>所有未来数据都保持有效</td></tr></tbody></table></div>'},
    {title:'伪结构常来自批次、设备和缺失机制',kind:'eng',badge:'失败边界',lead:'算法发现的两个群体可能只是两台仪器吗？',body:'<p>采集日期、地区、设备、文件格式、缺失值填补和爬虫来源都可能比目标语义更容易分开。先训练一个探针预测这些混杂变量，比较去除前后结构；按来源分层重采样；用反事实替换背景或元数据。</p><p>给簇命名会把统计团块实体化，尤其在人群、医疗、信贷等场景。敏感属性或代理特征可能造成差别待遇；高影响用途需要合法基础、人工复核、申诉和公平评测。</p>'},
    {title:'从探索到上线需要版本化整个结构发现过程',kind:'eng',badge:'工作流',lead:'模型、特征或数据一变，旧簇编号还能继续使用吗？',body:'<ol><li>写明问题与不用标签的理由。</li><li>冻结数据快照、特征、缺失处理和距离。</li><li>比较多种合理目标与随机种子。</li><li>用稳定性和外部证据选择，不只看漂亮图。</li><li>记录簇匹配规则与版本，监控漂移。</li><li>若结果驱动行动，做对照实验和风险审查。</li></ol><p>簇编号可在重训后置换或分裂，不能把“簇2”当永久身份；需用质心匹配、样本重叠与语义规则迁移。</p>'},
    {title:'常见误区与学习路线',role:'reference',badge:'误区与依赖',lead:'没有标签时，更需要明确自己的假设。',body:'<div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>误区</th><th>更准确的理解</th></tr></thead><tbody><tr><td>无监督没有损失函数</td><td>目标由距离、密度或重建假设定义</td></tr><tr><td>算法会发现天然类别</td><td>结构依赖表示、尺度与用途</td></tr><tr><td>二维图分开证明高维有簇</td><td>投影会扭曲距离与密度</td></tr><tr><td>内部指标高就有业务价值</td><td>仍需稳定性与下游证据</td></tr><tr><td>簇编号可以长期复用</td><td>重训后可能置换、分裂或合并</td></tr></tbody></table></div><div class="dd-table-wrap"><table class="dd-table"><thead><tr><th>层级</th><th>依赖与延伸</th></tr></thead><tbody><tr><td>先修</td><td>概率、距离、特征缩放</td></tr><tr><td><b>本页核心</b></td><td>目标非唯一性、稳定性、外部验证</td></tr><tr><td>方法</td><td>聚类、降维、生成模型、异常检测</td></tr><tr><td>延伸</td><td>自监督学习、因果混杂、数据治理</td></tr></tbody></table></div>'}
  ],
  chain:['明确用途与无标签约束','选择表示、尺度和结构假设','优化分组/压缩/密度目标','比较多目标与随机种子','排查混杂并做外部验证','版本化结果并监控行动风险'],
  quiz:[{q:'无监督学习为什么不是没有目标？',a:'它仍优化距离、密度、重建或概率等由研究者选择的目标。'},{q:'A到B的原始欧氏距离约多少？',a:'<span class="dd-radical" role="math" aria-label="101 的平方根"><span class="dd-radicand">101</span></span>≈10.05。'},{q:'标准化解决了什么，又引入什么？',a:'避免数值尺度无意主导，但相当于给各维方差约等权。'},{q:'密度估计学习的是什么？低密度记录为什么不能直接判成异常或欺诈？',a:'它学习数据在哪些区域更集中，可用于异常筛查、生成和缺失值补全；低密度只说明少见，业务变化、节日、新客户或录入错误都可能造成少见。'},{q:'某样本到同簇平均距离 a=2，到最近其他簇平均距离 b=8，轮廓系数是多少？它能证明分组有业务价值吗？',a:'s=(8−2)/8=0.75，说明当前距离下该点更接近本簇；它不能证明簇具有业务语义，仍需稳定性和外部/下游验证。'},{q:'为何二维可视化不能证明簇？',a:'非线性投影可能扭曲全局距离、面积和密度。'},{q:'无真值时至少需要哪三层证据？',a:'内部指标、稳定性，以及外部知识或下游价值。'}],
  sources:[{title:'The Elements of Statistical Learning',url:'https://hastie.su.domains/Papers/ESLII.pdf',note:'聚类、密度与无监督学习'},{title:'Deep Learning — Representation Learning',url:'https://www.deeplearningbook.org/contents/representation.html',note:'表示学习目标'},{title:'Visualizing Data using t-SNE',url:'https://www.jmlr.org/papers/v9/vandermaaten08a.html',note:'局部邻域可视化'},{title:'How to Use t-SNE Effectively',url:'https://distill.pub/2016/misread-tsne/',note:'投影误读边界'}]
});
