/*
 * 已逐页审查内容的教学合同迁移清单。
 *
 * 这里只登记人工确认过的正文证据，不生成或补写教学内容。formulaIndex 是
 * 历史页面迁移期的稳定定位；新公式仍应直接提供 data-formula-id。
 */
(function () {
  "use strict";
  window.DEEPDIVE = window.DEEPDIVE || {};
  const six = (section, pairs) => ({
    section,
    ...Object.fromEntries(
      ["definition", "problem", "inputOutput", "mechanism", "interpretation", "boundary"]
        .map((key, index) => [key, { answer: pairs[index][0], evidence: pairs[index][1] }])
    )
  });

  const contracts = {
    "supervised-learning": {
      contractVersion: 2,
      examples: [{
        section: 3,
        evidence: {
          setup: "令 y=1 表示垃圾邮件",
          rule: "二分类交叉熵写成完整形式",
          steps: "第一封实际是垃圾邮件",
          interpretation: "给真实类别的概率越小，惩罚增长得越快",
        },
      }],
      termReviews: [{
        section: 6,
        reviewedAt: "2026-07-26",
        terms: [{
          name: "降维",
          meaning: "用少数坐标概括原来的多个特征",
          purpose: "压缩数据或帮助观察多特征结构",
          definitionEvidence: "降维（用少数坐标概括多个特征",
          purposeEvidence: "便于压缩或观察",
        }],
      }],
      sectionContracts: [
        {
          section: 1,
          definition: {
            answer: "监督学习使用与输入配对的目标值作为训练时的监督信号。",
            evidence: "「监督」指训练时每个输入都有一个可比较的目标信号",
          },
          problem: {
            answer: "它解决如何让机器从带答案的样本中总结预测规则的问题。",
            evidence: "想让机器「学」一件事，最直接的办法是什么",
          },
          inputOutput: {
            answer: "输入是样本特征，训练目标是标签，最终输出是对新样本的预测。",
            evidence: "一封邮件的内容",
          },
          mechanism: {
            answer: "模型反复比较预测与目标，并让预测逐步贴近目标。",
            evidence: "让预测逐步贴近这些目标",
          },
          interpretation: {
            answer: "结果应解释为能否把学到的规则推广到未见过的样本。",
            evidence: "推广到没见过的邮件",
          },
          boundary: {
            answer: "标签可能含误标、分歧和代理偏差，并不天然等于客观真相。",
            evidence: "标签不等于真相",
          },
        },
        {
          section: 2,
          definition: {
            answer: "分类预测离散类别，回归预测连续数值。",
            evidence: "答案是离散还是连续",
          },
          problem: {
            answer: "它区分目标答案是几选一，还是一个连续数量的问题。",
            evidence: "答案不总是这种「几选一」",
          },
          inputOutput: {
            answer: "两者都接收样本输入；分类输出类别，回归输出连续数值。",
            evidence: "同样是「从输入预测输出」",
          },
          mechanism: {
            answer: "分类学习区分类别的边界，回归学习贴合数值变化的趋势。",
            evidence: "分类学的是一条把类别分开的",
          },
          interpretation: {
            answer: "分类结果看落在哪一类，回归结果看预测数值及趋势。",
            evidence: "回归学的是一条尽量穿过数据的",
          },
          boundary: {
            answer: "目标是离散还是连续会约束任务类型及可选损失。",
            evidence: "决定了用哪一类、配哪种损失",
          },
        },
        {
          section: 3,
          definition: {
            answer: "训练是在寻找一组模型参数，使训练样本的平均损失尽量小。",
            evidence: "学习，就是寻找一组参数",
          },
          problem: {
            answer: "它把分类与回归统一成可计算、可优化的训练目标。",
            evidence: "分类、回归看着不同",
          },
          inputOutput: {
            answer: "函数接收输入 x，输出预测 fθ(x)，并与标签 y 比较。",
            evidence: "分别是第 i 个样本的输入与标签",
          },
          mechanism: {
            answer: "损失函数把预测与标签的不一致变成数值，再最小化平均损失。",
            evidence: "把一次预测与标签之间的不一致变成数字",
          },
          interpretation: {
            answer: "交叉熵越小，模型分给真实类别的概率通常越高。",
            evidence: "给真实类别的概率越小，惩罚增长得越快",
          },
          boundary: {
            answer: "本节只建立概率到损失的联系，暂不要求计算梯度和参数更新。",
            evidence: "本节只建立「概率 → 损失」的联系",
          },
        },
        {
          section: 4,
          definition: {
            answer: "泛化是模型在未见过、且来自目标场景的数据上保持可靠。",
            evidence: "真正要的是在",
          },
          problem: {
            answer: "它解决训练集高分不能证明模型能应对新数据的问题。",
            evidence: "把训练集的标签全预测对，是不是就成功了",
          },
          inputOutput: {
            answer: "输入是分开的训练、验证和测试数据，输出是模型选择与最终验收结果。",
            evidence: "把数据分成三份",
          },
          mechanism: {
            answer: "训练集调参数，验证集选方案，方案冻结后测试集只做最终验收。",
            evidence: "测试集留到方案冻结后做最终验收",
          },
          interpretation: {
            answer: "训练误差下降而验证误差上升，是模型过拟合的信号。",
            evidence: "训练误差一直降、验证误差却开始升",
          },
          boundary: {
            answer: "测试结果一旦用于继续修改方案，该测试集就失去独立验收资格。",
            evidence: "不能继续充当无偏的最终测试",
          },
        },
        {
          section: 5,
          definition: {
            answer: "标注瓶颈是可靠且贴近真实目标的监督信号难以低成本获得。",
            evidence: "可靠监督信号稀缺",
          },
          problem: {
            answer: "它解释监督学习为何受数据目标、质量和覆盖范围限制。",
            evidence: "这么直接有效的办法，短板在哪",
          },
          inputOutput: {
            answer: "输入是人工、交易、测量、行为或规则产生的目标值，产出带目标值的数据。",
            evidence: "目标可能来自人工标注，也可能来自交易结果",
          },
          mechanism: {
            answer: "通过收集或标注目标值，把原始样本转成可计算训练损失的样本对。",
            evidence: "监督学习的燃料是",
          },
          interpretation: {
            answer: "数据量大不等于监督质量高，关键是目标一致、场景覆盖和可核验。",
            evidence: "与真实目标一致、覆盖部署场景、质量可核验",
          },
          boundary: {
            answer: "标签可能只是代理、含噪声，并会因部署分布变化而失效。",
            evidence: "攻击方式、用户和语言会持续变化",
          },
        },
        {
          section: 6,
          definition: {
            answer: "四种学习范式由监督信号的来源与交互方式区分。",
            evidence: "监督信号从哪里来",
          },
          problem: {
            answer: "它回答没有外部目标值时，机器还能依靠什么信号学习。",
            evidence: "如果没有外部提供的目标值",
          },
          inputOutput: {
            answer: "输入可带标签、无标签、自造目标或来自环境，输出相应任务能力。",
            evidence: "无需人工标注，用数据本身构造答案",
          },
          mechanism: {
            answer: "监督靠标签，无监督找结构，自监督构造答案，强化学习依靠奖励试错。",
            evidence: "在环境里试错，靠奖励信号",
          },
          interpretation: {
            answer: "判断范式时应优先追踪监督信号从哪里产生。",
            evidence: "从数据来源看",
          },
          boundary: {
            answer: "自监督在计算形式上类似监督训练，归类并非只有一个口径。",
            evidence: "无需纠结唯一归类",
          },
        },
        {
          section: 7,
          definition: {
            answer: "监督学习在大模型时代仍以输入—目标样本训练和验证系统。",
            evidence: "在今天依然处处都在",
          },
          problem: {
            answer: "它说明自监督预训练之后为何仍需要监督学习。",
            evidence: "既然大模型靠自监督预训练",
          },
          inputOutput: {
            answer: "以指令为输入、理想回答为标签，输出更符合指令的助手模型。",
            evidence: "「指令」是输入，「理想回答」是标签",
          },
          mechanism: {
            answer: "监督微调使用示范样本调整基座模型，下游任务也可用领域标签适配。",
            evidence: "指令微调（SFT）就是监督学习",
          },
          interpretation: {
            answer: "自监督改变预训练方式，但没有取代监督微调和下游监督适配。",
            evidence: "大模型改变了大量表示与知识的获得方式",
          },
          boundary: {
            answer: "用带答案数据评测模型，不代表模型曾用这些数据做监督训练。",
            evidence: "不等于模型在该数据集上做过监督训练",
          },
        },
      ],
      formulas: [
        {
          id: "supervised-empirical-risk",
          section: 3,
          formulaIndex: 1,
          symbols: [
            { name: "θ", meaning: "模型需要学习的参数集合", evidence: "θ 是模型要学习的参数集合" },
            { name: "n", meaning: "训练样本总数", evidence: "n 是训练样本总数" },
            { name: "i", meaning: "训练样本编号", evidence: "i 是样本编号" },
            { name: "L", meaning: "衡量单次预测与标签不一致的损失函数", evidence: "L 是损失函数" },
            { name: "f", meaning: "带参数的预测函数", evidence: "带参数的函数" },
            { name: "x", meaning: "样本输入", evidence: "第 i 个样本的输入与标签" },
            { name: "y", meaning: "样本标签", evidence: "第 i 个样本的输入与标签" },
          ],
        },
        {
          id: "supervised-binary-cross-entropy",
          section: 3,
          formulaIndex: 2,
          symbols: [
            { name: "L", meaning: "当前样本的二分类交叉熵损失", evidence: "二分类交叉熵写成完整形式" },
            { name: "y", meaning: "垃圾邮件取一、正常邮件取零的标签", evidence: "y=1 表示垃圾邮件" },
            { name: "p", meaning: "模型输出的垃圾邮件概率", evidence: "这封邮件是垃圾邮件」的概率" },
          ],
        },
      ],
    },

    "information-theory": {
      contractVersion: 2,
      examples: [{
        section: 8,
        evidence: {
          setup: "真实天气分布 P=(1/2,1/4,1/4)",
          rule: "先用 P 自己的码长求平均",
          steps: "事件仍按 P 出现，所以把 Q 码长按 P 加权相加",
          interpretation: "概率放错位置就会增加平均损失",
        },
      }],
      termReviews: [{
        section: 9,
        reviewedAt: "2026-07-26",
        terms: [
          {
            name: "似然",
            meaning: "模型为已观察序列分配的整体概率",
            purpose: "比较模型对已观察文本的解释程度",
            definitionEvidence: "似然 在这里表示模型给整句真实 token 序列分配了多大概率",
            purposeEvidence: "用来比较模型对已观察文本的解释程度",
          },
          {
            name: "对数似然",
            meaning: "逐步概率乘积取对数后得到的和",
            purpose: "把连乘改写成便于稳定计算的加法",
            definitionEvidence: "对数似然 把逐步概率的乘法变成对数之和",
            purposeEvidence: "便于稳定计算",
          },
        ],
      }],
      sectionContracts: [
        {
          section: 1,
          definition: {
            answer: "概率分布为所有可能事件分配非负且总和为一的概率。",
            evidence: "概率分布会给每个事件分配一个不小于 0 的数",
          },
          problem: {
            answer: "本节建立后续信息量公式共同使用的事件、分布、对数与期望。",
            evidence: "后面所有公式究竟在对什么对象做计算",
          },
          inputOutput: {
            answer: "输入是真实分布 P、模型分布 Q 与事件 x，输出是平均预测或编码代价。",
            evidence: "平均要付出多大代价",
          },
          mechanism: {
            answer: "对数把独立事件的概率乘法变成信息量加法，期望再按 P 加权平均。",
            evidence: "用事件真实出现的概率作权重求加权平均",
          },
          interpretation: {
            answer: "下标 P 表示事件按谁出现，公式中的 Q 表示模型给真实事件的概率。",
            evidence: "看到下标 P，先问",
          },
          boundary: {
            answer: "现实中的真实分布 P 通常不可直接知道，只能用有限样本估计。",
            evidence: "现实中 P 通常未知",
          },
        },
        {
          section: 2,
          definition: {
            answer: "自信息是事件发生时消除的不确定性，等于其概率的负对数。",
            evidence: "I P (x)=−log₂P(x)",
          },
          problem: {
            answer: "它量化一次具体结果究竟有多罕见、多令人意外。",
            evidence: "一次结果有多意外",
          },
          inputOutput: {
            answer: "输入事件概率 P(x)，输出以 bit 表示的单次信息量。",
            evidence: "概率减半，自信息增加 1 bit",
          },
          mechanism: {
            answer: "对事件概率取以二为底的负对数，概率越小结果越大。",
            evidence: "自信息依次是 1、2、3 bit",
          },
          interpretation: {
            answer: "零 bit 表示结果完全确定，数值越大表示事件越意外。",
            evidence: "观察到它没有消除任何不确定性",
          },
          boundary: {
            answer: "高自信息只表示罕见，不代表该事件重要或对任务有用。",
            evidence: "不表示事件的重要性",
          },
        },
        {
          section: 3,
          definition: {
            answer: "熵是按照真实分布，对所有事件自信息求出的加权平均。",
            evidence: "熵就是按真实频率 P 对每个事件的自信息求平均",
          },
          problem: {
            answer: "它概括整个真实分布平均有多不确定、多难预测。",
            evidence: "怎样概括整个分布平均有多难预测",
          },
          inputOutput: {
            answer: "输入完整真实分布 P，输出每次事件的平均信息量或理想编码代价。",
            evidence: "H(P)=1/2×1+1/4×2+1/4×2=1.5",
          },
          mechanism: {
            answer: "先计算各事件自信息，再用各自真实概率加权求和。",
            evidence: "三个事件的信息量是 1、2、2 bit",
          },
          interpretation: {
            answer: "均匀分布熵最大，确定分布熵为零，表示平均不确定性的两个端点。",
            evidence: "均匀分布的熵最大",
          },
          boundary: {
            answer: "理想长期平均码长不等于单个现实码字或文件的实际占用。",
            evidence: "单个符号的实际码字通常受整数长度",
          },
        },
        {
          section: 4,
          definition: {
            answer: "交叉熵是数据按 P 出现、模型按 Q 报概率时的平均对数损失。",
            evidence: "H(P,Q)=E x∼P [−log₂Q(x)]",
          },
          problem: {
            answer: "它衡量模型分布 Q 预测真实分布 P 时长期平均要付出的代价。",
            evidence: "平均损失究竟怎样计算",
          },
          inputOutput: {
            answer: "输入真实分布 P 和模型分布 Q，输出以 bit 计的平均损失。",
            evidence: "P 决定哪些事件多常出现",
          },
          mechanism: {
            answer: "对真实事件的负对数概率求单次损失，再用 P 作权重平均。",
            evidence: "计算 −log₂Q(x)",
          },
          interpretation: {
            answer: "Q 给真实事件的概率越大损失越小，漏掉真实事件则代价很高。",
            evidence: "Q 给真实事件的概率越大，损失越小",
          },
          boundary: {
            answer: "只有 Q 与 P 相同的时候，交叉熵才退化为真实分布自身的熵。",
            evidence: "若恰好 Q=P",
          },
        },
        {
          section: 5,
          definition: {
            answer: "KL 散度是使用模型分布 Q 相对使用真实分布 P 多出的平均对数代价。",
            evidence: "每次事件平均多付出的 bit 数",
          },
          problem: {
            answer: "它隔离交叉熵中由模型分布与真实分布失配造成的额外代价。",
            evidence: "交叉熵比熵多出的代价",
          },
          inputOutput: {
            answer: "输入有方向的 P 与 Q，输出非负的平均额外 bit 数。",
            evidence: "H(P,Q)−H(P)",
          },
          mechanism: {
            answer: "用交叉熵减去真实分布自身的熵，等价于对概率比的对数按 P 平均。",
            evidence: "把前者从后者中减掉",
          },
          interpretation: {
            answer: "KL 为零表示 Q 在 P 会发生的事件上与 P 一致。",
            evidence: "完全一致时为 0",
          },
          boundary: {
            answer: "KL 有方向且可为无穷，训练集交叉熵下降也不保证真实 KL 下降。",
            evidence: "训练损失下降不保证未知数据上的真实 KL",
          },
        },
        {
          section: 6,
          definition: {
            answer: "欧氏距离是概率坐标差的几何长度，KL 是有方向的平均对数代价。",
            evidence: "欧氏距离把两个概率分布当作普通向量",
          },
          problem: {
            answer: "本节解释为何普通几何距离不能替代 KL 表达预测或编码后悔。",
            evidence: "为什么不直接计算两点之间的直线距离",
          },
          inputOutput: {
            answer: "两者都输入概率分布 P、Q，但分别输出几何尺度和 bit 代价。",
            evidence: "本页使用 bit/事件",
          },
          mechanism: {
            answer: "欧氏距离平方求和再开根号；KL 则计算概率比例的加权对数。",
            evidence: "衡量坐标差的几何长度",
          },
          interpretation: {
            answer: "欧氏距离回答坐标相差多远，KL 回答用 Q 预测 P 多付多少。",
            evidence: "它们回答的不是同一个问题",
          },
          boundary: {
            answer: "KL 不对称且不满足三角不等式，所以不是严格数学距离。",
            evidence: "严格说它是“散度”而不是数学上的距离",
          },
        },
        {
          section: 7,
          definition: {
            answer: "困惑度是平均对数损失指数化后得到的熵等效分支数。",
            evidence: "更准确的名称是",
          },
          problem: {
            answer: "它把抽象的平均 bit 或 nat 损失转换成较直观的等效选择数量。",
            evidence: "怎样换成较直观的等效选择数",
          },
          inputOutput: {
            answer: "输入平均 token 交叉熵，输出正数形式的等效分支数。",
            evidence: "PPL=2 H(P,Q)",
          },
          mechanism: {
            answer: "bit 损失使用二为底指数，nat 损失使用自然指数。",
            evidence: "若训练损失使用自然对数",
          },
          interpretation: {
            answer: "数值越低表示模型平均给实际 token 的概率越高。",
            evidence: "PPL 越低只说明模型给实际 token 的平均概率更高",
          },
          boundary: {
            answer: "困惑度不等于词表大小，也不能跨不同 tokenizer 直接比较。",
            evidence: "不能跨 tokenizer 直接比较",
          },
        },
        {
          section: 8,
          definition: {
            answer: "该例把熵、交叉熵、KL 与困惑度连接成一次完整数值推导。",
            evidence: "从 P、Q 一直算到困惑度",
          },
          problem: {
            answer: "它解决只会背公式却不知道每一步由谁加权、为何计算的问题。",
            evidence: "每一步怎样对应前面的定义",
          },
          inputOutput: {
            answer: "输入天气分布 P 与模型分布 Q，输出四个相互关联的信息量指标。",
            evidence: "真实天气分布 P=(1/2,1/4,1/4)",
          },
          mechanism: {
            answer: "先算 P 的熵，再按 P 加权 Q 的码长，二者相减并指数化。",
            evidence: "先用 P 自己的码长求平均",
          },
          interpretation: {
            answer: "Q 把概率放错事件会增加平均损失，低估真实事件尤其昂贵。",
            evidence: "概率放错位置就会增加平均损失",
          },
          boundary: {
            answer: "若 Q 给 P 可能发生的事件零概率，对数损失和正向 KL 都会无穷大。",
            evidence: "正向 KL 都变为正无穷",
          },
        },
        {
          section: 9,
          definition: {
            answer: "经验交叉熵是有限样本上逐 token 负对数概率的平均。",
            evidence: "就是常见的经验交叉熵",
          },
          problem: {
            answer: "它说明不知道真实分布 P 时，训练程序怎样得到可计算损失。",
            evidence: "训练程序又是怎样得到交叉熵损失",
          },
          inputOutput: {
            answer: "输入真实 token 序列和模型条件概率，输出序列或批次平均损失。",
            evidence: "每一步给真实下一个 token 概率",
          },
          mechanism: {
            answer: "对逐步条件概率取对数求和、加负号，再按 token 和批次平均。",
            evidence: "把逐步概率的乘法变成对数之和",
          },
          interpretation: {
            answer: "验证或测试损失用于估计新数据表现，但仍受有限抽样误差影响。",
            evidence: "用于估计新数据表现，仍有抽样误差",
          },
          boundary: {
            answer: "训练损失下降只说明拟合当前训练样本，不能单独证明通用能力改善。",
            evidence: "只说明模型更适合当前训练样本",
          },
        },
      ],
      formulas: [
        {
          id: "self-information",
          section: 2,
          formulaIndex: 1,
          symbols: [
            { name: "I", meaning: "事件发生时获得的自信息", evidence: "自信息：一次结果有多意外" },
            { name: "P", meaning: "数据的真实分布", evidence: "真实分布或数据分布", section: 1 },
            { name: "x", meaning: "实际发生的事件", evidence: "实际发生的一个事件", section: 1 },
          ],
        },
        {
          id: "entropy",
          section: 3,
          formulaIndex: 1,
          symbols: [
            { name: "H", meaning: "真实分布的平均自信息，即熵", evidence: "熵就是按真实频率 P 对每个事件的自信息求平均" },
            { name: "P", meaning: "数据的真实分布", evidence: "真实分布或数据分布", section: 1 },
            { name: "x", meaning: "实际发生的事件", evidence: "实际发生的一个事件", section: 1 },
            { name: "E", meaning: "按真实分布加权求平均", evidence: "按 P 取期望", section: 1 },
          ],
        },
        {
          id: "event-log-loss",
          section: 4,
          formulaIndex: 1,
          symbols: [
            { name: "Q", meaning: "模型给出的预测分布", evidence: "模型分布或预测分布", section: 1 },
            { name: "x", meaning: "当前实际发生的事件", evidence: "实际发生的一个事件", section: 1 },
          ],
        },
        {
          id: "cross-entropy",
          section: 4,
          formulaIndex: 2,
          symbols: [
            { name: "H", meaning: "使用模型分布编码真实事件的平均代价", evidence: "得到交叉熵" },
            { name: "P", meaning: "决定事件出现频率的真实分布", evidence: "P 决定哪些事件多常出现" },
            { name: "Q", meaning: "决定预测概率与码长的模型分布", evidence: "Q 决定模型为这些事件付出多少损失" },
            { name: "E", meaning: "按真实分布加权求平均", evidence: "长期平均时必须用 P 作权重" },
            { name: "x", meaning: "当前实际发生的事件", evidence: "事件 x 真正发生后" },
          ],
        },
        {
          id: "kl-from-cross-entropy",
          section: 5,
          formulaIndex: 1,
          symbols: [
            { name: "H", meaning: "熵或交叉熵", evidence: "平均理想码长是 H(P)" },
            { name: "P", meaning: "数据真实分布", evidence: "知道真实分布 P" },
            { name: "Q", meaning: "用于预测或编码的模型分布", evidence: "改用模型分布 Q" },
            { name: "D", meaning: "KL 散度记号", evidence: "可以理解为：数据按 P 产生" },
            { name: "KL", meaning: "模型相对真实分布多付的平均编码代价", evidence: "每次事件平均多付出的 bit 数" },
            { name: "x", meaning: "事件索引", evidence: "P 可能出现的事件" },
          ],
        },
        {
          id: "cross-entropy-decomposition",
          section: 5,
          formulaIndex: 2,
          symbols: [
            { name: "H", meaning: "熵与交叉熵", evidence: "平均理想码长是 H(P)" },
            { name: "P", meaning: "数据真实分布", evidence: "知道真实分布 P" },
            { name: "Q", meaning: "模型分布", evidence: "改用模型分布 Q" },
            { name: "D", meaning: "KL 散度记号", evidence: "可以理解为：数据按 P 产生" },
            { name: "KL", meaning: "额外平均编码代价", evidence: "每次事件平均多付出的 bit 数" },
          ],
        },
        {
          id: "euclidean-distance",
          section: 6,
          formulaIndex: 1,
          symbols: [
            { name: "d", meaning: "两个概率向量的欧氏距离", evidence: "欧氏距离把两个概率分布当作普通向量" },
            { name: "P", meaning: "第一个概率分布", evidence: "两个概率分布当作普通向量" },
            { name: "Q", meaning: "第二个概率分布", evidence: "两个概率分布当作普通向量" },
            { name: "x", meaning: "概率向量的事件坐标", evidence: "概率坐标相差多远" },
          ],
        },
        {
          id: "perplexity-from-bits",
          section: 7,
          formulaIndex: 1,
          symbols: [
            { name: "PPL", meaning: "熵等效分支数，即困惑度", evidence: "熵等效分支数" },
            { name: "H", meaning: "以 bit 每 token 计量的平均交叉熵", evidence: "平均交叉熵是 2 bit/token" },
            { name: "P", meaning: "真实分布", evidence: "真实分布或数据分布", section: 1 },
            { name: "Q", meaning: "模型预测分布", evidence: "模型分布或预测分布", section: 1 },
          ],
        },
        {
          id: "language-model-nll",
          section: 9,
          formulaIndex: 1,
          symbols: [
            { name: "NLL", meaning: "整句负对数似然", evidence: "整句负对数似然为" },
            { name: "Q", meaning: "语言模型给真实下一个 token 的概率", evidence: "给真实下一个 token 概率" },
            { name: "x", meaning: "序列中的 token", evidence: "把一句话分成" },
            { name: "t", meaning: "token 的预测位置", evidence: "在每一步" },
          ],
        },
      ],
    },

    clustering: {
      contractVersion: 2,
      examples: [{
        section: 3,
        evidence: {
          setup: "五个已给坐标",
          rule: "分配—更新",
          steps: "把每簇坐标逐维求平均",
          interpretation: "从 3 降到约 1.833",
        },
      }],
      termReviews: [
        {
          section: 1,
          reviewedAt: "2026-07-26",
          terms: [
            { name: "聚类", meaning: "依据相似规则把无人工类别答案的样本分组", purpose: "探索数据中可复用的结构", definitionEvidence: "聚类</b>是在没有人工类别答案时", purposeEvidence: "数据里是否存在可复用的结构" },
          ],
        },
        {
          section: 6,
          reviewedAt: "2026-07-26",
          terms: [
            { name: "DBSCAN", meaning: "按局部密度连通关系形成簇的方法", purpose: "处理弯曲簇并识别稀疏噪声点", definitionEvidence: "DBSCAN</b> 是密度聚类", purposeEvidence: "解决弯曲簇和噪声点" },
            { name: "核心点", meaning: "半径邻域内点数达到阈值的样本", purpose: "作为扩展密度连通区域的起点", definitionEvidence: "点数达到 minPts 时 x 是核心点", purposeEvidence: "核心点的邻域相互可达就归为同簇" },
            { name: "高维", meaning: "由很多坐标轴共同描述样本的空间", purpose: "指出距离可能失去区分度的场景", definitionEvidence: "高维距离趋同", purposeEvidence: "使邻域失去区分" },
          ],
        },
        {
          section: 8,
          reviewedAt: "2026-07-26",
          terms: [
            { name: "似然", meaning: "固定观测数据后衡量一组模型参数对数据支持程度的量", purpose: "作为混合模型迭代拟合和诊断的目标", definitionEvidence: "似然会因协方差坍缩", purposeEvidence: "数值异常，需要正则化" },
          ],
        },
        {
          section: 9,
          reviewedAt: "2026-07-26",
          terms: [
            { name: "内部指标", meaning: "只依据样本几何与簇归属计算的质量指标", purpose: "在没有外部标签时辅助比较候选粒度", definitionEvidence: "内部指标、稳定性和业务约束", purposeEvidence: "比较指标和重采样一致性" },
            { name: "轮廓系数", meaning: "比较样本簇内距离和最近他簇距离的内部指标", purpose: "辅助判断分组的紧致与分离程度", definitionEvidence: "轮廓系数 比较一个样本与本簇", purposeEvidence: "接近 1 表示既紧致又分离" },
          ],
        },
        {
          section: 11,
          reviewedAt: "2026-07-26",
          terms: [
            { name: "降维", meaning: "把样本转换为更少坐标的表示方法", purpose: "辅助诊断高维聚类结构但不替代原空间验证", definitionEvidence: "降维、维度灾难", purposeEvidence: "诊断 降维" },
          ],
        },
      ],
      formulas: [
        {
          id: "kmeans-objective",
          section: 2,
          formulaIndex: 1,
          symbols: [
            { name: "J", meaning: "所有样本到所属中心的平方距离之和", evidence: "J 是所有样本到各自中心的平方距离之和" },
            { name: "i", meaning: "样本编号", evidence: "i 是样本编号" },
            { name: "n", meaning: "输入样本总数", evidence: "输入是 n 个同尺度向量" },
            { name: "x", meaning: "第 i 个输入向量", evidence: "xᵢ 是第 i 个向量" },
            { name: "μ", meaning: "样本当前所属簇的中心", evidence: "是该簇中心" },
            { name: "c", meaning: "样本当前所属的簇编号", evidence: "cᵢ 是它当前所属的簇" },
          ],
        },
        {
          id: "kmeans-worked-objective",
          section: 3,
          formulaIndex: 1,
          symbols: [
            { name: "J", meaning: "组内平方距离总和", evidence: "组内平方和" },
            { name: "old", meaning: "中心更新前的目标值", evidence: "是更新前组内平方和" },
            { name: "new", meaning: "中心更新后的目标值", evidence: "是更新后组内平方和" },
          ],
        },
        {
          id: "dbscan-core-point",
          section: 6,
          formulaIndex: 1,
          symbols: [
            { name: "N", meaning: "给定点的半径邻域集合", evidence: "表示点 x 的 ε 邻域" },
            { name: "ε", meaning: "定义邻域的最大距离半径", evidence: "邻域半径 ε" },
            { name: "x", meaning: "正在判断是否为核心点的样本", evidence: "点数达到 minPts 时 x 是核心点" },
            { name: "y", meaning: "被检查是否落入邻域的候选点", evidence: "y 是候选邻点" },
            { name: "d", meaning: "计算两个样本差异的距离函数", evidence: "d(x,y) 是两点距离" },
            { name: "minPts", meaning: "成为核心点所需的最少邻域点数", evidence: "最少点数 minPts" },
          ],
        },
        {
          id: "gmm-density-responsibility",
          section: 8,
          formulaIndex: 1,
          symbols: [
            { name: "p", meaning: "样本在混合模型下的概率密度", evidence: "概率模型只说明" },
            { name: "x", meaning: "输入的数值样本向量", evidence: "位于两簇之间的用户" },
            { name: "k", meaning: "混合模型的成分编号", evidence: "由哪个成分生成" },
            { name: "π", meaning: "各高斯成分的混合权重", evidence: "用软权重更新 π" },
            { name: "μ", meaning: "各高斯成分的均值", evidence: "更新 π、μ、Σ" },
            { name: "Σ", meaning: "各高斯成分的协方差", evidence: "协方差允许椭圆簇" },
            { name: "r", meaning: "样本属于某成分的后验责任度", evidence: "计算责任度 r" },
            { name: "z", meaning: "样本对应的潜在成分编号", evidence: "由哪个成分生成更可能" },
            { name: "i", meaning: "输入样本编号", evidence: "边界不确定性" },
          ],
        },
      ],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "聚类依据选定相似规则，把没有人工类别答案的样本分组。", evidence: "依据事先选定的相似规则把样本分组" },
          problem: { answer: "它探索数据中是否存在可复用结构，而非发现唯一真实身份。", evidence: "数据里是否存在可复用的结构" },
          inputOutput: { answer: "输入表示、距离与参数，输出簇编号及中心、树或软归属。", evidence: "输入是每个对象的特征表示" },
          mechanism: { answer: "特征选择、缩放和距离先定义邻近，算法再依规则形成组。", evidence: "共同定义邻近" },
          interpretation: { answer: "簇编号没有大小或天然语义，须查看代表样本后命名。", evidence: "簇编号本身没有大小或天然语义" },
          boundary: { answer: "遗漏任务信息或混杂主导时，分组即使稳定也可能无用。", evidence: "稳定地给出一个无用甚至有害的分组" },
        },
        {
          section: 2,
          definition: { answer: "K-means 用固定数量的中心概括数值向量并最小化组内平方和。", evidence: "怎样用 k 个中心概括数值向量" },
          problem: { answer: "它寻找让样本到所属中心总体平方距离尽量小的分组。", evidence: "所有样本到各自中心的平方距离之和" },
          inputOutput: { answer: "输入 n 个同尺度向量和 k，输出归属、中心与目标值 J。", evidence: "输入是 n 个同尺度向量" },
          mechanism: { answer: "交替执行最近中心分配和簇内均值更新，直至不再改善。", evidence: "两个步骤交替" },
          interpretation: { answer: "J 小只说明当前尺度下更紧致，不代表业务分组更好。", evidence: "不能直接解释为业务分组更好" },
          boundary: { answer: "它只保证局部最优，非球形簇、初始化和尺度会影响结果。", evidence: "不保证全局最优" },
        },
        {
          section: 3,
          definition: { answer: "该例完整展示 K-means 一轮分配、均值更新和目标重算。", evidence: "分配—更新”规则用于五个已给坐标" },
          problem: { answer: "它解释中心怎样移动以及一次迭代为何能降低组内平方和。", evidence: "看清一次迭代的输入和输出" },
          inputOutput: { answer: "输入五点与旧中心，输出两个新中心、归属和新目标值。", evidence: "输出簇1={A,B,C}" },
          mechanism: { answer: "先按最近中心分配，再把每簇坐标逐维求平均。", evidence: "把每簇坐标逐维求平均" },
          interpretation: { answer: "J 从 3 降到约 1.833，表示当前分组变得更紧致。", evidence: "说明新中心对当前分组更紧致" },
          boundary: { answer: "本例收敛不证明全局最优，弯月、异密度和离群点会失真。", evidence: "不证明得到全局最优或真实类别" },
        },
        {
          section: 4,
          definition: { answer: "图中并列呈现质心、密度连通和层次切分三种簇假设。", evidence: "K-means 用质心划 Voronoi 区" },
          problem: { answer: "它帮助比较同一批点在不同簇形状假设下为何分组不同。", evidence: "同一批点被不同簇假设观察" },
          inputOutput: { answer: "输入同一组二维点，输出质心分区、连通区域或多粒度结构。", evidence: "球形、密度连通与层次切分分别看到什么" },
          mechanism: { answer: "最近质心划分区域，密度连接邻域，层次方法在树高切分。", evidence: "DBSCAN 连接密度区域" },
          interpretation: { answer: "图形归属是特定假设的结果，不能视作唯一自然类别。", evidence: "没有一种形状假设适合所有数据" },
          boundary: { answer: "二维示意只展示形状差异，不能替代稳定性和业务验证。", evidence: "保留多粒度结构" },
        },
        {
          section: 5,
          definition: { answer: "该节说明 K-means 隐含球形、相近方差和规模的偏好。", evidence: "偏好球形、相近方差与相近规模" },
          problem: { answer: "它诊断长条、异密度和离群点为何会误导质心分组。", evidence: "离群点能显著拖动均值" },
          inputOutput: { answer: "输入样本及平方欧氏距离，输出最近质心的硬分配。", evidence: "最近质心边界是线性的" },
          mechanism: { answer: "平方距离强化远点影响，并以线性最近中心边界切分空间。", evidence: "平方欧氏距离把远点惩罚得很重" },
          interpretation: { answer: "中心被拖、弯月切开或小簇被吞提示形状假设失配。", evidence: "大簇可能被拆，小簇可能被吞" },
          boundary: { answer: "标准化只能修复特征尺度，无法改变簇形状假设。", evidence: "标准化只处理尺度" },
        },
        {
          section: 6,
          definition: { answer: "DBSCAN 按局部密度可达性形成簇并标记稀疏噪声点。", evidence: "DBSCAN 是密度聚类" },
          problem: { answer: "它处理质心难以表示的弯曲簇和噪声点。", evidence: "解决弯曲簇和噪声点" },
          inputOutput: { answer: "输入样本、距离、ε 和 minPts，输出簇、边界点与噪声。", evidence: "输出是若干密度连通簇" },
          mechanism: { answer: "从核心点扩展相互可达邻域，并吸收邻近边界点。", evidence: "核心点的邻域相互可达就归为同簇" },
          interpretation: { answer: "噪声表示当前密度尺度下未进入稠密区域，不等于脏数据。", evidence: "噪声不是“错误数据”" },
          boundary: { answer: "异密度数据难用单一 ε，高维距离趋同也会削弱邻域。", evidence: "一个 ε 难兼顾" },
        },
        {
          section: 7,
          definition: { answer: "层次聚类按链接规则贪心合并簇，并用树状图保留过程。", evidence: "把“如何合并”写进链接规则" },
          problem: { answer: "它在未知单一簇数时保留多个可能的分组粒度。", evidence: "树状图保留多个粒度" },
          inputOutput: { answer: "输入点对距离和链接规则，输出合并树及选定高度的簇。", evidence: "single、complete 与 average linkage" },
          mechanism: { answer: "每轮合并链接距离最近的两簇，直到形成完整层次。", evidence: "一旦贪心合并通常不再拆开" },
          interpretation: { answer: "切树高度决定粒度，应与稳定区间和使用目的共同解释。", evidence: "切树高度应结合稳定区间和用途" },
          boundary: { answer: "早期错误会传递，不同链接规则也会产生不同形状偏好。", evidence: "早期错误会传递" },
        },
        {
          section: 8,
          definition: { answer: "高斯混合用多个概率成分和后验责任度表达软聚类。", evidence: "把硬分组改成后验概率" },
          problem: { answer: "它让边界样本保留不确定性，而非强制归入单一簇。", evidence: "位于两簇之间的用户" },
          inputOutput: { answer: "输入样本和成分数，输出权重、均值、协方差与责任度。", evidence: "更新 π、μ、Σ" },
          mechanism: { answer: "E 步计算责任度，M 步按软权重更新分布参数。", evidence: "E 步计算责任度" },
          interpretation: { answer: "60%/40% 表示当前模型下的相对生成可能性，不是身份比例。", evidence: "不赋予社会或因果身份" },
          boundary: { answer: "它依赖高斯假设，协方差坍缩会造成数值异常。", evidence: "协方差坍缩而数值异常" },
        },
        {
          section: 9,
          definition: { answer: "选 k 是在多个候选结果中确定有用分组粒度的过程。", evidence: "保留多细的分组才有用" },
          problem: { answer: "它避免用总会随 k 下降的惯性机械选择最大簇数。", evidence: "惯性可为0，所以不能选最小值" },
          inputOutput: { answer: "输入候选聚类、内部指标与约束，输出主选及替代粒度。", evidence: "输出是一个主选粒度" },
          mechanism: { answer: "对候选 k 重训，比较几何指标、稳定性和业务可行动性。", evidence: "对每个候选重新训练" },
          interpretation: { answer: "轮廓接近 1 表示紧致分离，接近 0 表示处于边界。", evidence: "接近 1 表示既紧致又分离" },
          boundary: { answer: "所有内部指标都有假设，不能替代外部业务效果验证。", evidence: "内部几何分数不能替代真实业务效果" },
        },
        {
          section: 10,
          definition: { answer: "稳定性验收比较聚类在初始化、重采样和时间切片下的一致性。", evidence: "稳定性与语义验证比一次最优分数更重要" },
          problem: { answer: "它判断一次聚类是否只是采样或随机种子的偶然产物。", evidence: "换随机种子或月份簇就重排" },
          inputOutput: { answer: "输入多次聚类结果，输出对齐后的 ARI、NMI 或共簇一致性。", evidence: "用 ARI/NMI 或最优匹配比较" },
          mechanism: { answer: "先匹配可置换的簇编号，再比较样本重叠、分裂与合并。", evidence: "先按样本重叠或质心最优匹配" },
          interpretation: { answer: "稳定结果可继续语义审查，仍不自动证明业务价值或因果身份。", evidence: "查看代表样本、特征分布和边界点" },
          boundary: { answer: "单次高分不可替代重采样、混杂检查和下游对照实验。", evidence: "做对照实验测真实增益与伤害" },
        },
        {
          section: 12,
          definition: { answer: "在线分群把冻结聚类应用于新样本并持续监控结构变化。", evidence: "在线分群还要处理漂移与冷启动" },
          problem: { answer: "它处理新用户冷启动、分布漂移和重训后的簇身份衔接。", evidence: "新用户到来时" },
          inputOutput: { answer: "输入新样本与旧模型，输出旧簇归属或重训迁移决策。", evidence: "用冻结中心或已训练模型给新样本分配" },
          mechanism: { answer: "按窗口监控距离和簇规模，有结构变化证据才触发重训。", evidence: "按时间窗口监控距离、簇规模" },
          interpretation: { answer: "重训后应匹配新旧簇，再解释分裂、合并和漂移。", evidence: "审查分裂与合并" },
          boundary: { answer: "频繁重训导致标签抖动，永不重训会固化过时结构。", evidence: "频繁重训会让业务标签抖动" },
        },
      ],
    },

    "kernel-methods": {
      contractVersion: 2,
      examples: [{
        section: 7,
        evidence: {
          setup: "取 x=(1,2)、z=(3,1)",
          rule: "K(x,z)=(x·z+1)²",
          steps: "显式内积为9+12+4+6+4+1=36",
          interpretation: "核函数只算原空间点积就得到六维特征内积",
        },
      }],
      termReviews: [
        {
          section: 1,
          reviewedAt: "2026-07-26",
          terms: [
            { name: "特征向量", meaning: "用一组数值特征描述单个样本的输入", purpose: "作为 SVM 计算边界位置的模型输入", definitionEvidence: "带标签的特征向量", purposeEvidence: "输入是带标签" },
          ],
        },
        {
          section: 3,
          reviewedAt: "2026-07-26",
          terms: [
            { name: "高维", meaning: "由更多坐标组成的特征空间", purpose: "用丰富特征把原空间非线性关系变成线性关系", definitionEvidence: "显式展开可能很大", purposeEvidence: "隐式特征映射" },
          ],
        },
      ],
      formulas: [
        {
          id: "svm-soft-margin",
          section: 2,
          formulaIndex: 1,
          symbols: [
            { name: "w", meaning: "分类超平面的法向量", evidence: "输出是边界法向量 w" },
            { name: "C", meaning: "训练违例相对间隔宽度的惩罚系数", evidence: "惩罚系数 C" },
            { name: "ξ", meaning: "每个训练样本侵入间隔的非负违例量", evidence: "每个样本的违例量 ξᵢ" },
            { name: "i", meaning: "训练样本编号", evidence: "样本 xᵢ" },
            { name: "y", meaning: "取负一或正一的二分类标签", evidence: "二分类标签 yᵢ∈{−1,+1}" },
            { name: "x", meaning: "输入的训练特征向量", evidence: "输入是样本 xᵢ" },
            { name: "b", meaning: "分类超平面的截距", evidence: "截距 b" },
          ],
        },
        {
          id: "rbf-kernel",
          section: 4,
          formulaIndex: 1,
          symbols: [
            { name: "K", meaning: "两输入在 RBF 核下的相似度", evidence: "输出是一个核相似度 K" },
            { name: "x", meaning: "参与相似度计算的已缩放向量", evidence: "两个已缩放向量 x、x′" },
            { name: "exp", meaning: "把负距离转换为零到一相似度的指数函数", evidence: "exp 是指数函数" },
            { name: "γ", meaning: "控制相似度随距离衰减速度的尺度参数", evidence: "γ 决定距离衰减速度" },
          ],
        },
        {
          id: "polynomial-explicit-map",
          section: 7,
          formulaIndex: 1,
          symbols: [
            { name: "φ", meaning: "二次多项式核对应的六维显式特征映射", evidence: "一个对应映射是 φ(x)" },
            { name: "x", meaning: "第一个原空间二维向量", evidence: "取 x=(1,2)" },
            { name: "z", meaning: "第二个原空间二维向量", evidence: "z=(3,1)" },
          ],
        },
        {
          id: "gram-positive-semidefinite",
          section: 9,
          formulaIndex: 1,
          symbols: [
            { name: "K", meaning: "样本两两核值组成的 Gram 矩阵", evidence: "即 Gram 矩阵半正定" },
            { name: "Φ", meaning: "各样本显式特征向量组成的矩阵", evidence: "对应某个Hilbert空间内积" },
            { name: "a", meaning: "用于检验半正定性的任意系数向量", evidence: "对任意样本与系数" },
          ],
        },
      ],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "SVM 是寻找大间隔分类边界的监督学习模型。", evidence: "支持向量机（SVM） 是分类或回归模型" },
          problem: { answer: "它在多个训练正确的边界中选择对小扰动更稳定的一条。", evidence: "哪一条对小扰动更稳" },
          inputOutput: { answer: "输入带标签向量，输出决策分数以及阈值后的类别。", evidence: "输入是带标签的特征向量" },
          mechanism: { answer: "它最大化边界到两侧最近训练点之间的几何间隔。", evidence: "寻找离两侧最近训练点都尽量远" },
          interpretation: { answer: "分数绝对值大表示离当前边界较远，但不是概率。", evidence: "不是概率或因果置信度" },
          boundary: { answer: "噪声点和未缩放特征会扭曲几何边界，因此需软间隔与缩放。", evidence: "特征尺度相差悬殊" },
        },
        {
          section: 2,
          definition: { answer: "软间隔目标把间隔宽度和训练违例惩罚合并优化。", evidence: "软间隔目标把“边界尽量简单”" },
          problem: { answer: "它在容忍少量噪声与保持宽间隔之间作可调权衡。", evidence: "训练样本尽量满足间隔" },
          inputOutput: { answer: "输入样本、标签和 C，输出 w、b 及各样本违例量。", evidence: "输出是边界法向量 w" },
          mechanism: { answer: "最小化向量范数和 C 加权违例，并满足分类间隔约束。", evidence: "越小对应间隔越宽" },
          interpretation: { answer: "ξ 为零表示满足间隔，超过一通常意味着可能分错。", evidence: "表示可能分错" },
          boundary: { answer: "C 过大追噪声、过小欠拟合，必须使用隔离验证集。", evidence: "必须在隔离验证数据上选择" },
        },
        {
          section: 3,
          definition: { answer: "核技巧用核函数直接计算隐式特征空间的内积。", evidence: "核技巧 解决“非线性关系需要丰富特征" },
          problem: { answer: "它避免为非线性关系显式构造并保存庞大的特征向量。", evidence: "无需真的保存 φ(x) 的全部坐标" },
          inputOutput: { answer: "输入两个样本和 K，输出它们经隐式映射后的内积。", evidence: "输入是两个原始样本 x、x′" },
          mechanism: { answer: "训练计算 Gram 矩阵，预测只与支持向量计算核并加权。", evidence: "预测时把新点与支持向量逐一算核并加权" },
          interpretation: { answer: "核值大只表示在当前核先验下更相似，不代表现实语义相同。", evidence: "不等于现实语义相同" },
          boundary: { answer: "核必须合法，且不会消除过拟合、错误尺度与矩阵规模成本。", evidence: "任意相似度不能直接代入" },
        },
        {
          section: 4,
          definition: { answer: "RBF 核把平方欧氏距离转成零到一的局部相似度。", evidence: "把欧氏距离转换为 0 到 1" },
          problem: { answer: "它让线性模型在隐式空间表达弯曲的分类区域。", evidence: "直线边界无法表达弯曲分类区域" },
          inputOutput: { answer: "输入两个缩放向量和 γ，输出核相似度 K。", evidence: "输入是两个已缩放向量" },
          mechanism: { answer: "平方距离乘负 γ 后取指数，距离越远相似度越接近零。", evidence: "距离增大时结果趋近 0" },
          interpretation: { answer: "K 只能在同一缩放和 γ 下比较，不能解释为概率。", evidence: "K 的数值只能相对于同一缩放" },
          boundary: { answer: "γ 太大易过拟合、太小易欠拟合，并须与 C 联合选择。", evidence: "必须与 C 联合验证" },
        },
        {
          section: 5,
          definition: { answer: "支持向量是训练后具有非零对偶系数的关键边界样本。", evidence: "支持向量 是位于间隔边缘" },
          problem: { answer: "它说明预测函数为何只需保留一部分训练样本的贡献。", evidence: "不必保存所有训练点的贡献" },
          inputOutput: { answer: "输入支持向量、系数和新样本，输出加权核决策分数。", evidence: "输出是各支持向量核相似度加权求和" },
          mechanism: { answer: "远离间隔的正确样本系数为零，边界点保留非零系数。", evidence: "远离间隔且已被正确分类的点系数为零" },
          interpretation: { answer: "它们显示模型边界依赖哪些训练样本，但不是因果解释。", evidence: "不能解释真实因果" },
          boundary: { answer: "支持向量接近全量时预测仍慢，系数稀疏也不代表训练便宜。", evidence: "支持向量比例接近 100%" },
        },
        {
          section: 6,
          definition: { answer: "规模选型是在精确核、线性模型和近似核间作工程决策。", evidence: "工程上是否可训练和部署" },
          problem: { answer: "它判断核 SVM 的内存、训练时间和延迟是否可承受。", evidence: "可用内存、训练时限和延迟预算" },
          inputOutput: { answer: "输入数据规模与资源预算，输出可执行的模型方案。", evidence: "输出是采用精确核、线性 SVM 还是近似核" },
          mechanism: { answer: "用样本量—资源曲线估算 n² 核矩阵及求解成本。", evidence: "完整核矩阵有 n² 个元素" },
          interpretation: { answer: "近似结果应联合解释质量损失、资源节省和随机误差。", evidence: "同时解释质量损失、资源节省和随机误差" },
          boundary: { answer: "支持向量稀疏不消除训练成本，近似核也不必然优于线性模型。", evidence: "不能消除训练核矩阵成本" },
        },
        {
          section: 7,
          definition: { answer: "该例展示二次多项式核等价于六维显式特征内积。", evidence: "二次多项式核等于哪些显式特征" },
          problem: { answer: "它说明核函数怎样避免实际展开高维坐标。", evidence: "怎样避免真正展开高维坐标" },
          inputOutput: { answer: "输入二维向量 x、z，输出核值与对应显式内积 36。", evidence: "取 x=(1,2)、z=(3,1)" },
          mechanism: { answer: "先算原空间点积再平方，或展开 φ 后逐项相乘求和。", evidence: "显式内积为9+12+4+6+4+1=36" },
          interpretation: { answer: "两条路径同为 36，证明该核在本例复现六维内积。", evidence: "得到六维特征内积" },
          boundary: { answer: "隐式计算省去坐标展开，但模型容量和核矩阵成本仍存在。", evidence: "复杂度仍会反映在泛化和核矩阵上" },
        },
        {
          section: 8,
          definition: { answer: "图示把原空间同心圆映射成按半径平方可线性切分的数据。", evidence: "原空间非线性，特征空间线性" },
          problem: { answer: "它解释非线性边界如何来自坐标映射而非非线性超平面。", evidence: "核技巧改变的是分类器，还是坐标系" },
          inputOutput: { answer: "输入同心圆二维点，输出加入 r² 后可线性分开的表示。", evidence: "φ(x): 加入 r²" },
          mechanism: { answer: "特征映射加入半径平方，SVM 在新空间画直线边界。", evidence: "按 r² 线性切分" },
          interpretation: { answer: "隐式空间的线性最大间隔映回原空间表现为非线性。", evidence: "映回原空间后边界可以非线性" },
          boundary: { answer: "示意只证明所选映射适合该形状，不保证适合任意数据。", evidence: "原空间：需要圆形边界" },
        },
        {
          section: 9,
          definition: { answer: "合法核须产生对称半正定的 Gram 矩阵。", evidence: "核必须产生合法的 Gram 矩阵" },
          problem: { answer: "它保证核对应某个内积空间并保持 SVM 对偶问题凸性。", evidence: "使SVM对偶保持凸性" },
          inputOutput: { answer: "输入样本与核函数，输出两两核值组成的 Gram 矩阵。", evidence: "对任意样本与系数" },
          mechanism: { answer: "任意系数向量的二次型都非负，即矩阵无负特征值。", evidence: "Gram 矩阵半正定" },
          interpretation: { answer: "半正定说明存在隐式内积表示，并非相似度语义自动正确。", evidence: "对应某个Hilbert空间内积" },
          boundary: { answer: "非对称或含负特征值的相似度会使优化保证失效。", evidence: "可能让优化失去保证" },
        },
        {
          section: 10,
          definition: { answer: "嵌套验证把参数选择与最终泛化估计分成内外两层。", evidence: "嵌套验证中联合选择" },
          problem: { answer: "它避免反复查看测试集造成过度乐观的参数报告。", evidence: "先看测试集调RBF参数会过度乐观" },
          inputOutput: { answer: "输入训练数据和候选 C、γ，输出所选配置及外层估计。", evidence: "搜索 C、γ" },
          mechanism: { answer: "训练折拟合缩放器，内层调参，外层或冻结测试仅评估。", evidence: "外层或冻结测试集只做一次估计" },
          interpretation: { answer: "还应报告支持向量比例、类别切片和 PR 曲线。", evidence: "报告支持向量比例" },
          boundary: { answer: "无关维与错误尺度仍会破坏 RBF 距离并导致过拟合。", evidence: "无关维与错误尺度会让RBF距离失去区分" },
        },
        {
          section: 12,
          definition: { answer: "核矩阵规模分析估算精确核训练的存储和求解上限。", evidence: "核矩阵的二次规模决定训练上限" },
          problem: { answer: "它解释大样本时精确核为何在内存与时间上不可行。", evidence: "十万样本的完整 Gram 矩阵为什么难以承受" },
          inputOutput: { answer: "输入样本数和元素字节数，输出矩阵内存及替代方案。", evidence: "n=100,000时是10¹⁰项" },
          mechanism: { answer: "n 个样本形成 n² 个核值，优化器还需额外工作区。", evidence: "尚未包含优化器工作区" },
          interpretation: { answer: "应绘制规模—时间—内存—质量曲线评估生产可行性。", evidence: "应画样本量—训练时间—内存—质量曲线" },
          boundary: { answer: "预测稀疏性不能消除训练阶段的矩阵构造和优化成本。", evidence: "不能消除构造与优化成本" },
        },
        {
          section: 13,
          definition: { answer: "SVM 决策值是带符号间隔，不是经过校准的类别概率。", evidence: "SVM 分数不是概率" },
          problem: { answer: "它防止把距离超平面的数值错误解释成置信概率。", evidence: "能说有90%把握吗" },
          inputOutput: { answer: "输入决策分数和独立校准集，输出校准概率或多分类结果。", evidence: "独立验证数据上做Platt scaling" },
          mechanism: { answer: "用校准器映射分数，多分类则用一对其余或一对一组合。", evidence: "one-vs-rest或one-vs-one" },
          interpretation: { answer: "阈值应按漏报和误报成本选择，并报告每类召回与校准误差。", evidence: "阈值应根据漏报/误报成本选择" },
          boundary: { answer: "训练折复用于校准会过度自信，类别分数也未必可直接比较。", evidence: "概率会过度自信" },
        },
        {
          section: 14,
          definition: { answer: "相似度漂移是上线数据改变后原核距离不再具有训练期含义。", evidence: "分布漂移会重写“相似”的含义" },
          problem: { answer: "它解释模型仍输出数值时局部邻域为何已经失效。", evidence: "固定γ仍输出数值却不再代表原来的局部尺度" },
          inputOutput: { answer: "输入线上距离与间隔统计，输出漂移告警或组合版本重训。", evidence: "监控核相似度分位数" },
          mechanism: { answer: "监控支持向量命中、决策间隔和分组校准并对照边界样本。", evidence: "保留代表性边界样本做回归" },
          interpretation: { answer: "新群体普遍远离支持向量提示模型正在外推。", evidence: "新群体是否普遍远离所有支持向量" },
          boundary: { answer: "标准化器或表示更新后旧核不可单独沿用，必须组合重训。", evidence: "核模型必须作为组合版本重训" },
        },
        {
          section: 15,
          definition: { answer: "验收检查点是核 SVM 上线前必须提交的质量与资源证据清单。", evidence: "最终至少报告什么" },
          problem: { answer: "它防止只报告准确率而遗漏参数、校准和系统成本。", evidence: "同时报告标准化流程" },
          inputOutput: { answer: "输入训练、验证与硬件测量，输出可复核的验收报告。", evidence: "C与核参数、支持向量比例" },
          mechanism: { answer: "汇总配置、切片质量、校准误差、内存和单样本延迟。", evidence: "切片质量以及目标硬件上的训练内存" },
          interpretation: { answer: "质量与资源指标须按同一模型版本联合判断是否可上线。", evidence: "目标硬件上的训练内存与单样本延迟" },
          boundary: { answer: "清单是最低证据，不替代漂移监控、外部效度和风险审查。", evidence: "校准误差、切片质量" },
        },
      ],
    },

    "neural-network": {
      contractVersion: 2,
      examples: [{
        section: 9,
        evidence: {
          setup: "输入 x = [1, 2]",
          rule: "学习率 η = 0.1",
          steps: "预测从 0.4013 升到约 0.4702",
          interpretation: "损失从 0.913 降到约 0.755",
        },
      }],
      termReviews: [
        {
          section: 1,
          reviewedAt: "2026-07-26",
          terms: [
            { name: "高维", meaning: "由大量坐标共同描述一个样本的输入空间", purpose: "说明人工枚举组合特征为何会迅速失控", definitionEvidence: "几千、几百万维", purposeEvidence: "靠人枚举特征会迅速失控" },
          ],
        },
        {
          section: 2,
          reviewedAt: "2026-07-26",
          terms: [
            { name: "特征向量", meaning: "按固定顺序排列的一组样本输入数值", purpose: "把现实对象转换成网络可计算的数字输入", definitionEvidence: "承载特征向量 x", purposeEvidence: "变成一串数字" },
          ],
        },
      ],
      formulas: [
        { id: "nn-linear-score", section: 1, formulaIndex: 1, symbols: [
          { name: "y", meaning: "线性模型输出的预测分数", evidence: "预测分数 y′ 是加权和的结果" },
          { name: "w", meaning: "各输入特征的可学习权重", evidence: "权重 w 决定每个输入的影响方向与强弱" },
          { name: "x", meaning: "输入特征的各个坐标", evidence: "线性模型学的是输入" },
          { name: "b", meaning: "使线性边界整体平移的偏置", evidence: "偏置 b 决定这条边界整体平移多少" },
        ] },
        { id: "nn-two-linear-layers", section: 1, formulaIndex: 2, symbols: [
          { name: "h", meaning: "第一层线性变换产生的中间向量", evidence: "把两层写出来" },
          { name: "W", meaning: "两层分别使用的权重矩阵", evidence: "W = W₂W₁" },
          { name: "x", meaning: "送入第一层的输入向量", evidence: "先不加任何非线性" },
          { name: "b", meaning: "每层线性变换的偏置向量", evidence: "W₂b₁ + b₂" },
          { name: "y", meaning: "第二层线性变换的输出", evidence: "把第一行代进第二行" },
        ] },
        { id: "nn-linear-composition", section: 1, formulaIndex: 3, symbols: [
          { name: "y", meaning: "两层线性复合后的最终输出", evidence: "y 是两层复合后的输出" },
          { name: "W", meaning: "复合后可合并为一个矩阵的层权重", evidence: "记 W = W₂W₁" },
          { name: "x", meaning: "整个复合映射的输入向量", evidence: "多叠几层线性变换" },
          { name: "b", meaning: "复合后合并得到的偏置项", evidence: "W₂b₁ + b₂" },
        ] },
        { id: "nn-neuron", section: 2, formulaIndex: 1, symbols: [
          { name: "z", meaning: "节点激活前的加权和", evidence: "z 叫预激活值" },
          { name: "w", meaning: "节点用来检测输入方向的权重向量", evidence: "向量 w 指定它关心哪个方向" },
          { name: "x", meaning: "送入节点的特征或上一层输出", evidence: "点积 w·x 衡量输入" },
          { name: "b", meaning: "调节节点触发门槛的偏置", evidence: "偏置 b 调节它多容易被触发" },
          { name: "a", meaning: "节点经过激活后传给下一层的输出", evidence: "a 是节点过完激活后" },
          { name: "φ", meaning: "作用于预激活值的非线性激活函数", evidence: "激活函数决定这份响应怎样通过" },
        ] },
        { id: "nn-layer-vector", section: 2, formulaIndex: 2, symbols: [
          { name: "a", meaning: "一层全部节点响应组成的输出向量", evidence: "a 是节点过完激活后" },
          { name: "m", meaning: "该层并行节点的数量", evidence: "同时算一层的 m 个节点" },
        ] },
        { id: "nn-dense-parameter-count", section: 2, formulaIndex: 3, symbols: [
          { name: "n_in", meaning: "全连接层接收的输入数", evidence: "有 n_in 个输入" },
          { name: "n_out", meaning: "全连接层包含的输出节点数", evidence: "n_out 个节点" },
        ] },
        { id: "nn-empirical-risk", section: 6, formulaIndex: 1, symbols: [
          { name: "θ", meaning: "网络中全部可学习权重和偏置", evidence: "网络里全部权重和偏置" },
          { name: "N", meaning: "训练样本总数", evidence: "训练集上的平均损失" },
          { name: "i", meaning: "训练样本编号", evidence: "真实 y 差多少" },
          { name: "L", meaning: "单个预测与真实答案之间的损失函数", evidence: "L 是单样本损失" },
          { name: "f", meaning: "由参数 θ 决定的网络预测函数", evidence: "让训练集上的平均损失尽量低" },
          { name: "x", meaning: "第 i 个训练输入", evidence: "预测 ŷ 与真实 y" },
          { name: "y", meaning: "第 i 个训练样本的真实答案", evidence: "真实 y 差多少" },
        ] },
        { id: "nn-directional-derivative", section: 7, formulaIndex: 1, symbols: [
          { name: "L", meaning: "参数位置对应的损失值", evidence: "梯度 ∇_θ L 是损失" },
          { name: "θ", meaning: "当前全部模型参数组成的向量", evidence: "损失对每个参数" },
          { name: "ε", meaning: "沿测试方向移动的小步长度", evidence: "相同长度的一小步" },
          { name: "u", meaning: "长度为一的候选移动方向", evidence: "朝各个方向都走" },
        ] },
        { id: "nn-gradient-step", section: 7, formulaIndex: 2, symbols: [
          { name: "θ", meaning: "更新前后模型参数向量", evidence: "控制步长" },
          { name: "η", meaning: "控制每次参数移动幅度的学习率", evidence: "学习率 η 控制步长" },
          { name: "L", meaning: "当前参数下要降低的训练损失", evidence: "损失面是弯的" },
        ] },
        { id: "nn-backprop-chain", section: 8, formulaIndex: 1, symbols: [
          { name: "L", meaning: "网络最终输出对应的损失", evidence: "损失只说「最终错了多少」" },
          { name: "w", meaning: "正在计算责任的某个网络权重", evidence: "只把某个参数增大一丁点" },
          { name: "ŷ", meaning: "网络前向传播得到的预测", evidence: "参数变 → 节点变 → 预测变" },
          { name: "a", meaning: "激活函数后的节点输出", evidence: "同一个靠后的节点" },
          { name: "z", meaning: "节点激活前的加权和", evidence: "逐层相乘" },
        ] },
        { id: "nn-worked-parameters", section: 9, formulaIndex: 1, symbols: [
          { name: "W", meaning: "两层网络的初始权重矩阵或向量", evidence: "W₁ 的每一行对应一个隐藏节点" },
          { name: "b", meaning: "两层网络各自的初始偏置", evidence: "初始参数" },
        ] },
        { id: "nn-worked-update", section: 9, formulaIndex: 2, symbols: [
          { name: "W", meaning: "按梯度更新的网络权重", evidence: "输出权重梯度" },
          { name: "b", meaning: "按梯度更新的网络偏置", evidence: "偏置 ∂L/∂b₂" },
          { name: "L", meaning: "用来计算参数梯度的二元交叉熵损失", evidence: "二元交叉熵" },
        ] },
      ],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "神经网络是可学习的多层非线性函数复合。", evidence: "在训练中自己学出有用的中间特征" },
          problem: { answer: "它处理线性边界和人工特征枚举无法覆盖的复杂关系。", evidence: "任何直线都会同时切错两边" },
          inputOutput: { answer: "输入高维特征，输出由学习到的弯曲边界产生的预测。", evidence: "一张图的每个像素、一段话的每个词" },
          mechanism: { answer: "在线性层之间加入非线性，并逐层学习中间特征。", evidence: "层与层之间插入一个" },
          interpretation: { answer: "隐藏表示是对任务有用的特征，不一定对应人类概念。", evidence: "隐藏层就是这些「学出来的特征」" },
          boundary: { answer: "小表格、强解释或规则足够时，简单模型常更合适。", evidence: "更合适、更省、更可控" },
        },
        {
          section: 2,
          definition: { answer: "网络由输入层、隐藏层、输出层及权重、偏置和激活组成。", evidence: "网络的结构：它由什么组成" },
          problem: { answer: "它把复杂映射拆成可学习的模式探测器与层级表示。", evidence: "可学习的模式探测器" },
          inputOutput: { answer: "输入层承载特征，隐藏层产生新向量，输出层给任务答案。", evidence: "特征进来 预测出去" },
          mechanism: { answer: "每个节点先加权求和再激活，一层并行检测多种模式。", evidence: "先加权求和，再过激活函数" },
          interpretation: { answer: "权重控制方向强弱，偏置控制门槛，激活输出响应。", evidence: "决定信息被放大、抑制还是反向" },
          boundary: { answer: "参数越多计算与过拟合风险越高，容量须匹配数据。", evidence: "让容量匹配数据量和任务难度" },
        },
        {
          section: 3,
          definition: { answer: "前向传播用固定参数把输入逐层转换成预测。", evidence: "从输入到输出，一层层算下去" },
          problem: { answer: "它回答网络在当前参数下会对一个输入给出什么答案。", evidence: "怎样给出答案" },
          inputOutput: { answer: "输入预处理后的 x，输出经隐藏层和输出层得到的 ŷ。", evidence: "输出层按任务选一个合适的变换" },
          mechanism: { answer: "每层重复线性变换与非线性，并把结果送入下一层。", evidence: "重复「线性变换 + 非线性」" },
          interpretation: { answer: "推理只计算当前输出，不会修改模型参数。", evidence: "不改参数，只回答" },
          boundary: { answer: "前向只产生预测，不能单独回答误差和参数应如何更新。", evidence: "训练则还要多回答三件事" },
        },
        {
          section: 4,
          definition: { answer: "激活函数是插在线性层之间的非线性变换。", evidence: "这个非线性，就是激活函数 φ" },
          problem: { answer: "它打破多层线性仍等于单层线性的表达坍缩。", evidence: "给了网络表达非线性的能力" },
          inputOutput: { answer: "输入预激活 z，输出 ReLU、Sigmoid 等变换后的响应。", evidence: "ReLU = max(0, z)" },
          mechanism: { answer: "多个激活折点把空间切成斜率不同的小块并层层组合。", evidence: "每块内部近似是直的" },
          interpretation: { answer: "隐藏激活制造表示，输出变换则规定答案的范围和含义。", evidence: "把内部数值翻译成有含义的答案" },
          boundary: { answer: "ReLU 可死亡，Sigmoid 会饱和，选择需区分层位置和任务。", evidence: "两端饱和，隐藏层易梯度消失" },
        },
        {
          section: 5,
          definition: { answer: "神经网络的根本结构是许多简单可微函数的复合。", evidence: "神经网络把一个复杂映射" },
          problem: { answer: "函数复合提供表达能力，可微性提供参数可训练性。", evidence: "函数复合 提供表达能力" },
          inputOutput: { answer: "输入上一层表示，输出逐层重新编码后的任务相关表示。", evidence: "重新编码 上一层的信息" },
          mechanism: { answer: "宽度并行检测模式，深度继续组合更高层级模式。", evidence: "用更多级复合表达层级结构" },
          interpretation: { answer: "层表示是对最终任务好用的新坐标，不必能被人命名。", evidence: "这就是「表示学习」" },
          boundary: { answer: "万能逼近不保证容易训练、样本高效或能够泛化。", evidence: "表达能力、可优化性、样本效率、泛化能力" },
        },
        {
          section: 6,
          definition: { answer: "输出层规定预测语义，损失把预测错误变成可优化标量。", evidence: "输出层与损失" },
          problem: { answer: "它连接内部数值、真实任务答案和参数训练信号。", evidence: "网络内部表示与真实任务之间的接口" },
          inputOutput: { answer: "输入最终表示、任务与标签，输出预测及标量损失 L。", evidence: "预测 ŷ 与真实 y 差多少" },
          mechanism: { answer: "按任务选输出变换，再用匹配损失比较预测和标签。", evidence: "含义定下来，才能定义一种与之匹配的「错误度量」" },
          interpretation: { answer: "损失是可导训练信号，准确率和 F1 是人的评价指标。", evidence: "损失 ≠ 评价指标" },
          boundary: { answer: "准确率、F1 等评价指标往往不可导，通常不能直接充当训练损失。", evidence: "一般不直接拿来做反向传播的目标" },
        },
        {
          section: 7,
          definition: { answer: "梯度下降按损失梯度的反方向迭代更新参数。", evidence: "梯度下降：为什么要朝梯度的反方向走" },
          problem: { answer: "它同时决定大量参数应怎样小幅改变才能降低损失。", evidence: "该同时怎样改这些参数" },
          inputOutput: { answer: "输入当前参数、梯度和学习率，输出更新后的参数。", evidence: "学习率 η 控制步长" },
          mechanism: { answer: "梯度给最快上升方向，取负并乘学习率得到下降步。", evidence: "取负就是「最快下降」" },
          interpretation: { answer: "η 太小训练慢，太大会越过低点并震荡或发散。", evidence: "太大则震荡甚至发散" },
          boundary: { answer: "负梯度只在足够小邻域内最陡，不保证一步到全局最低。", evidence: "足够小 的邻域内最陡" },
        },
        {
          section: 8,
          definition: { answer: "反向传播是用链式法则高效计算全部参数梯度的方法。", evidence: "高效计算梯度的方法" },
          problem: { answer: "它解决最终损失怎样分配给几百万参数的信用分配问题。", evidence: "信用分配问题" },
          inputOutput: { answer: "输入前向中间量和损失导数，输出每个参数的梯度。", evidence: "一次反向即得全部梯度" },
          mechanism: { answer: "从输出向前逐层乘局部导数，并复用已经计算的下游影响。", evidence: "算过的下游影响不为每个参数重算" },
          interpretation: { answer: "梯度正负说明增大参数会让损失如何局部变化。", evidence: "正梯度说明增大它会让损失上升" },
          boundary: { answer: "反向传播只算梯度，真正更新参数仍由梯度下降或 Adam 完成。", evidence: "真正更新参数的是梯度下降 / Adam" },
        },
        {
          section: 9,
          definition: { answer: "该例把前向、损失、反向和一次参数更新串成完整训练步。", evidence: "完整手算：一次前向 + 一次更新" },
          problem: { answer: "它展示抽象公式如何在一个 2→2→1 网络中产生可验证数值。", evidence: "合成一次真实的数字演算" },
          inputOutput: { answer: "输入 x、y、初始参数和 η，输出新参数、预测与损失。", evidence: "学习率 η = 0.1" },
          mechanism: { answer: "先前向得到 0.4013，再链式求梯度并按 0.1 更新。", evidence: "输出层的梯度极简" },
          interpretation: { answer: "预测升至 0.4702 且损失降至 0.755，说明该步方向有效。", evidence: "损失从 0.913 降到约 0.755" },
          boundary: { answer: "一次小更新只验证局部计算，不证明最终泛化或整体收敛。", evidence: "一次更新很小" },
        },
        {
          section: 10,
          definition: { answer: "训练失败是优化信号无法稳定下降或不能泛化的现象集合。", evidence: "训练为什么会失败" },
          problem: { answer: "它帮助把不收敛定位到梯度、激活、数据、初始化或过拟合。", evidence: "几种典型失败" },
          inputOutput: { answer: "输入训练与验证曲线及中间数值，输出根因候选和修复措施。", evidence: "现象 根因 常见应对" },
          mechanism: { answer: "按症状检查链式乘积、尺度、对称性和数据标签。", evidence: "逐层查数值与梯度" },
          interpretation: { answer: "先在极小数据上故意过拟合，可区分实现错误与容量不足。", evidence: "先用极小数据集故意过拟合" },
          boundary: { answer: "归一化和残差是稳定训练结构，不是神经网络定义的必需零件。", evidence: "不是神经网络定义里必需的零件" },
        },
        {
          section: 11,
          definition: { answer: "泛化是模型在未见数据上仍保持低误差的能力。", evidence: "没见过 的数据上也保持低误差" },
          problem: { answer: "它防止把记住训练样本误当成学到可迁移规律。", evidence: "把训练样本背下来" },
          inputOutput: { answer: "输入独立训练、验证和测试数据，输出各集合质量曲线。", evidence: "训练集 / 验证集 / 测试集" },
          mechanism: { answer: "训练拟合参数，验证选架构超参，测试只做最终泛化评估。", evidence: "按验证表现来挑架构和超参数" },
          interpretation: { answer: "训练损失降而验证损失升表示模型开始过拟合，应早停。", evidence: "模型已经在「背」而非「学」" },
          boundary: { answer: "正则、增强和减容都有假设，过强会欠拟合或损伤有效信号。", evidence: "太强会欠拟合" },
        },
      ],
    },

    backprop: {
      contractVersion: 2,
      examples: [
        {
          section: 4,
          evidence: {
            setup: "把前向拆成",
            rule: "从损失 1 开始倒着走",
            steps: "经过乘法到 w",
            interpretation: "dL/dL=1",
          },
        },
        {
          section: 9,
          evidence: {
            setup: "在 w=2 处取 ε=10⁻⁴",
            rule: "用中心差分而非单边差分",
            steps: "同时试几个数量级的 ε",
            interpretation: "应非常接近",
          },
        },
      ],
      formulas: [
        {
          id: "backprop-central-difference",
          section: 1,
          formulaIndex: 1,
          symbols: [
            { name: "L", meaning: "参数扰动后重新计算的标量损失", evidence: "所有参数最终汇入同一个标量损失" },
            { name: "θ", meaning: "被检查导数的第 i 个模型参数", evidence: "中心差分每个参数" },
            { name: "i", meaning: "待检查参数的编号", evidence: "每个参数至少要做两次前向" },
            { name: "ε", meaning: "有限差分施加的微小参数扰动", evidence: "ε 太大会有截断误差" },
          ],
        },
        {
          id: "backprop-local-chain-rule",
          section: 3,
          formulaIndex: 1,
          symbols: [
            { name: "L", meaning: "最终要对输入求敏感度的损失", evidence: "最终损失变多少" },
            { name: "u", meaning: "当前局部节点的输入", evidence: "输入 u 变化一点" },
            { name: "z", meaning: "局部函数 f 产生的节点输出", evidence: "输出 z 变化一点" },
          ],
        },
        {
          id: "backprop-branch-sum",
          section: 5,
          formulaIndex: 1,
          symbols: [
            { name: "u", meaning: "由共享参数两条路径共同产生的输出", evidence: "设 u=w²+w" },
            { name: "w", meaning: "同时进入平方和直接加法路径的共享参数", evidence: "参数 w 一条路径经过平方" },
          ],
        },
        {
          id: "backprop-numerical-check",
          section: 9,
          formulaIndex: 1,
          symbols: [
            { name: "g", meaning: "由中心差分算出的数值梯度", evidence: "将数值梯度与反向梯度比较" },
            { name: "num", meaning: "下标表示该梯度来自 numerical 数值近似", evidence: "数值梯度" },
            { name: "L", meaning: "在扰动后参数位置计算的损失函数", evidence: "将数值梯度与反向梯度比较" },
            { name: "ε", meaning: "中心差分的参数扰动步长", evidence: "ε=10⁻⁴" },
          ],
        },
      ],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "有限差分通过正负微扰参数并重算损失来近似导数。", evidence: "有限差分不是已经能近似导数了吗" },
          problem: { answer: "它说明逐个试参数为何不能承担大模型训练。", evidence: "为什么不能把每个参数轻轻推一下试错" },
          inputOutput: { answer: "输入参数、损失和 ε，输出单个参数的近似偏导。", evidence: "中心差分每个参数至少要做两次前向" },
          mechanism: { answer: "分别计算正负 ε 扰动的损失，用差除以 2ε。", evidence: "L(θᵢ+ε)−L(θᵢ−ε)" },
          interpretation: { answer: "数值只适合抽查少量参数，反向传播才适合批量求梯度。", evidence: "适合抽查少量参数" },
          boundary: { answer: "ε 太大有截断误差，太小会受浮点舍入影响。", evidence: "太小又会被浮点舍入吞掉" },
        },
        {
          section: 2,
          definition: { answer: "计算图把复杂函数表示成局部运算连接的有向无环图。", evidence: "形成有向无环计算图" },
          problem: { answer: "它避免一次展开巨大公式，并让局部求导规则得到复用。", evidence: "怎样避免一次推整条巨大公式" },
          inputOutput: { answer: "输入参数与样本，前向输出节点值和损失，反向输出敏感度。", evidence: "前向从左到右算值" },
          mechanism: { answer: "前向记录运算和中间值，反向按链式法则拼接局部导数。", evidence: "各自只实现局部导数" },
          interpretation: { answer: "图中红色值表示最终损失对相应节点的局部敏感度。", evidence: "损失对这里有多敏感" },
          boundary: { answer: "计算图只保证按已写运算求导，不保证损失目标或数据正确。", evidence: "每个节点只需知道自己的局部规则" },
        },
        {
          section: 3,
          definition: { answer: "链式法则把上游梯度乘局部导数得到输入梯度。", evidence: "上游梯度乘局部导数" },
          problem: { answer: "它回答梯度通过一个节点时应怎样继续传给输入。", evidence: "究竟拿到什么、计算什么、传出什么" },
          inputOutput: { answer: "输入 ∂L/∂z 与 ∂z/∂u，输出 ∂L/∂u。", evidence: "节点从下游收到" },
          mechanism: { answer: "将输出对损失的敏感度与输出对输入的局部变化率相乘。", evidence: "相乘就是“u 变化一点" },
          interpretation: { answer: "结果表示 u 微小变化会让最终损失怎样局部变化。", evidence: "最终损失变多少" },
          boundary: { answer: "它只是微积分的高效复用顺序，不是新的优化算法。", evidence: "并没有发明新的微积分" },
        },
        {
          section: 4,
          definition: { answer: "该例把乘法、减法和半平方损失逐节点前向与反向。", evidence: "完整手算：−4 怎样一步步出现" },
          problem: { answer: "它解释权重梯度 −4 如何从标量损失种子逐步产生。", evidence: "从损失 1 开始倒着走" },
          inputOutput: { answer: "输入 x=2、y=6、w=2，输出 L=2 与两个 −4 梯度。", evidence: "把前向拆成 u=wx" },
          mechanism: { answer: "先算 u、e、L，再从 dL/dL=1 逆序乘局部导数。", evidence: "这个 1 像一单位“敏感度”" },
          interpretation: { answer: "对 w 的 −4 表示此处增大 w 会让损失局部下降。", evidence: "∂L/∂w=−2×x" },
          boundary: { answer: "该标量例只展示链式规则，向量网络还需向量—雅可比积。", evidence: "不省略任何中间节点" },
        },
        {
          section: 5,
          definition: { answer: "分叉求和是共享变量所有下游路径梯度贡献的总和。", evidence: "分叉路径为什么要累加梯度" },
          problem: { answer: "它防止只沿一条路径反传而漏掉共享变量的部分责任。", evidence: "只沿其中一条反传会漏掉什么" },
          inputOutput: { answer: "输入各下游路径贡献，输出共享参数的总导数。", evidence: "两条下游路径分别贡献" },
          mechanism: { answer: "平方路径给 2w，直接路径给 1，到 w 节点相加。", evidence: "到 w 节点相加" },
          interpretation: { answer: "覆盖而非累加会让共享参数梯度静默偏小。", evidence: "结果会静悄悄偏小" },
          boundary: { answer: "图内路径求和不同于跨批累积，后者须显式控制清零。", evidence: "批次累加和图内分叉不是同一件事" },
        },
        {
          section: 6,
          definition: { answer: "向量—雅可比积直接计算上游向量乘局部雅可比的结果。", evidence: "即向量—雅可比积" },
          problem: { answer: "它避免为向量层显式存储和计算巨大雅可比矩阵。", evidence: "不显式构造巨大雅可比" },
          inputOutput: { answer: "输入上游 v 和局部函数，输出 vᵀJ 的输入梯度。", evidence: "下游已经给出向量" },
          mechanism: { answer: "各算子用专门规则直接计算乘积，不生成完整 J。", evidence: "不需要显式生成完整雅可比" },
          interpretation: { answer: "一次反向可同时得到标量损失对大量参数的梯度。", evidence: "一次反向得到损失对所有参数梯度" },
          boundary: { answer: "反向模式适合多输入少输出，少输入多输出可能更适合前向模式。", evidence: "少量输入 → 大量输出" },
        },
        {
          section: 7,
          definition: { answer: "训练激活缓存保存反向局部导数所需的前向中间值。", evidence: "训练必须保存这些激活直到反向使用" },
          problem: { answer: "它解释训练显存为何远高于只做前向推理。", evidence: "训练显存为什么远高于只做前向推理" },
          inputOutput: { answer: "输入前向激活和状态，输出可供反向计算的缓存或重计算计划。", evidence: "很多局部导数依赖前向值" },
          mechanism: { answer: "默认保存激活；检查点则丢弃部分并在反向时重做前向。", evidence: "反向经过时重新执行那段前向" },
          interpretation: { answer: "检查点以额外计算换内存，不改变理想数学梯度。", evidence: "以额外计算换内存" },
          boundary: { answer: "重计算须可重复，并谨慎处理随机数与副作用。", evidence: "谨慎处理随机数与有副作用操作" },
        },
        {
          section: 8,
          definition: { answer: "计算图故障是代码操作切断依赖或污染反向所需状态。", evidence: "切断或污染计算图" },
          problem: { answer: "它诊断公式正确且程序可运行时为何梯度仍为零或错误。", evidence: "梯度为什么仍可能是零、None 或错误数值" },
          inputOutput: { answer: "输入图边界、张量状态和梯度日志，输出故障类型及定位证据。", evidence: "故障 机制 检查方法" },
          mechanism: { answer: "逐项检查 detach、原地修改、累加、精度、离散操作和广播。", evidence: "检查 requires-grad 和图边界" },
          interpretation: { answer: "零、None、Inf 或错误维求和分别指向不同实现故障。", evidence: "小梯度变 0 或大值变 Inf" },
          boundary: { answer: "形状合法不代表语义正确，不可微操作也没有普通连续梯度。", evidence: "形状合法但梯度在错误维度求和" },
        },
        {
          section: 9,
          definition: { answer: "梯度检查用独立有限差分近似验证自动微分实现。", evidence: "用有限差分给自动梯度做体检" },
          problem: { answer: "它提供独立证据判断反向代码是否算对了局部导数。", evidence: "证明实现没有写错" },
          inputOutput: { answer: "输入小模型、参数与 ε，输出数值梯度和相对误差。", evidence: "比较相对误差" },
          mechanism: { answer: "固定随机性后对参数做中心差分，并与自动梯度比较。", evidence: "用中心差分而非单边差分" },
          interpretation: { answer: "双精度确定性小模型中两种梯度应非常接近。", evidence: "确定性前向中应非常接近" },
          boundary: { answer: "折点、随机层、步长不当和极端尺度会造成误报。", evidence: "检查也可能误报" },
        },
      ],
    },

    "vanishing-gradient": {
      contractVersion: 2,
      examples: [{
        section: 9,
        evidence: {
          setup: "损失停滞时",
          rule: "比较靠近输入与输出的层",
          steps: "做深度消融",
          interpretation: "浅层梯度系统性远小于深层",
        },
      }],
      termReviews: [{
        section: 7,
        reviewedAt: "2026-07-26",
        terms: [
          { name: "正交", meaning: "保持不同方向互相垂直且范数受控的矩阵结构", purpose: "让初始信号沿不同方向传播时尺度更稳定", definitionEvidence: "正交初始化", purposeEvidence: "方向范数初始更稳定" },
        ],
      }],
      formulas: [{
        id: "vanishing-jacobian-chain",
        section: 2,
        formulaIndex: 1,
        symbols: [
          { name: "L", meaning: "输出端产生的标量训练损失", evidence: "L 是输出端的标量损失" },
          { name: "h", meaning: "各层或时间步的隐藏状态", evidence: "h₀ 是较早层状态" },
          { name: "K", meaning: "从早期状态到输出状态跨越的总层数", evidence: "网络层数" },
          { name: "J", meaning: "相邻两层隐藏状态之间的局部雅可比", evidence: "Jₖ=∂hₖ/∂h" },
          { name: "k", meaning: "局部雅可比所在的层编号", evidence: "每层局部行为" },
        ],
      }],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "梯度消失或爆炸是反向信号沿深路径指数缩小或放大的现象。", evidence: "梯度不断缩小；大于 1 则不断放大" },
          problem: { answer: "它解释输出层有误差信号时早期层为何几乎不更新或数值失控。", evidence: "早期层为什么收不到消息" },
          inputOutput: { answer: "输入上游梯度和各层局部导数，输出传到早期层的参数梯度。", evidence: "把上游梯度乘以局部导数" },
          mechanism: { answer: "深层路径连续相乘，相关方向多数小于一会衰减、大于一会放大。", evidence: "信号必须经过更多次乘法" },
          interpretation: { answer: "输出附近仍学而早期冻结提示消失，Inf 或 NaN 尖峰提示爆炸。", evidence: "输出附近层仍能学习" },
          boundary: { answer: "极小或极大梯度还会受浮点精度和优化器影响，须排除实现问题。", evidence: "浮点精度和优化器随后还会进一步影响" },
        },
        {
          section: 2,
          definition: { answer: "雅可比连乘把深层网络反向传播写成相邻层局部变化率的乘积。", evidence: "链式法则怎样把深度写成连乘" },
          problem: { answer: "它在一个表达式中连接总层数、局部尺度和最终梯度量级。", evidence: "同时包含网络层数和每层局部行为" },
          inputOutput: { answer: "输入输出端梯度和各层 J，输出损失对早期状态 h₀ 的梯度。", evidence: "∂L/∂h₀" },
          mechanism: { answer: "从 K 层开始依次右乘各局部雅可比，标量近似量级为 cᴷ。", evidence: "整体量级约为 cᴷ" },
          interpretation: { answer: "0.9 经 50 层约 0.00515，1.1 经 50 层约 117.4。", evidence: "温和缩小也会累积" },
          boundary: { answer: "真实矩阵不同方向可同时收缩和放大，单个平均尺度只作粗略直觉。", evidence: "不能只用单个平均值概括" },
        },
        {
          section: 3,
          definition: { answer: "激活导数是局部雅可比的一部分，直接控制反向信号通过比例。", evidence: "激活函数为什么直接进入反向尺度" },
          problem: { answer: "它解释只更换激活函数为何会改变深层网络可训练性。", evidence: "仅换激活函数为什么就能改变" },
          inputOutput: { answer: "输入预激活值和上游梯度，输出乘激活导数后的梯度。", evidence: "局部导数特征" },
          mechanism: { answer: "sigmoid 饱和时导数近零，ReLU 负区则完全阻断梯度。", evidence: "两端饱和区几乎不传梯度" },
          interpretation: { answer: "长期进入饱和区或负区表示对应单元和路径难以获得信用信号。", evidence: "负区长期为零的“死亡”单元" },
          boundary: { answer: "GELU 等平滑激活仍不能单独保证整个雅可比链稳定。", evidence: "不能单独保证整体雅可比稳定" },
        },
        {
          section: 4,
          definition: { answer: "权重矩阵的奇异值描述不同输入方向在一层中被放大或缩小多少。", evidence: "权重矩阵的奇异值描述不同方向" },
          problem: { answer: "它揭示平均梯度正常时某些重要方向仍可能已经消失。", evidence: "平均梯度范数正常”为什么仍可能掩盖" },
          inputOutput: { answer: "输入权重 W 和激活导数 Dφ，输出局部雅可比 J 的方向尺度。", evidence: "J=Dφ·W" },
          mechanism: { answer: "权重奇异方向先伸缩，激活导数再按状态对方向加权。", evidence: "激活导数再对方向加权" },
          interpretation: { answer: "最大奇异值偏大提示爆炸风险，相关小奇异值提示信息丢失。", evidence: "最小相关奇异值很小" },
          boundary: { answer: "全局范数会被少量大值掩盖，必须按层、通道和分位数检查。", evidence: "只看一个全局平均值不够" },
        },
        {
          section: 5,
          definition: { answer: "RNN 把同一状态更新沿时间展开，使序列距离成为有效深度。", evidence: "RNN 怎样把“深度”换成时间距离" },
          problem: { answer: "它解释参数层数不多的循环网络为何仍难学习长期依赖。", evidence: "仍难学几十步以前的信息" },
          inputOutput: { answer: "输入序列 xₜ 和旧状态 hₜ₋₁，输出当前状态及远期损失梯度。", evidence: "hₜ=φ(Wₕhₜ₋₁+Wₓxₜ)" },
          mechanism: { answer: "从 T 步损失回到 t 步须连续乘 T−t 个状态雅可比。", evidence: "要乘 T−t 个状态雅可比" },
          interpretation: { answer: "时间跨度越长，早期信息覆盖和反向信用衰减风险越大。", evidence: "序列距离就是有效深度" },
          boundary: { answer: "参数共享不会缩短反向路径，同一矩阵重复相乘仍有指数效应。", evidence: "参数共享不会减少反向路径长度" },
        },
        {
          section: 6,
          definition: { answer: "LSTM 或 GRU 用门控加法状态通道控制信息保留与写入。", evidence: "门控怎样建立更稳定的状态通道" },
          problem: { answer: "它缓解普通 RNN 长时间路径中反复非线性和矩阵乘积造成的衰减。", evidence: "更容易保留长期信息" },
          inputOutput: { answer: "输入旧状态、候选信息和门值，输出受控更新的新状态。", evidence: "旧状态乘遗忘门，再加新候选" },
          mechanism: { answer: "遗忘门接近一时，状态和梯度可沿近似加法通道保留。", evidence: "不必每步都经过同样的饱和非线性" },
          interpretation: { answer: "门值表示当前模型选择保留、遗忘或写入多少状态信息。", evidence: "遗忘门接近 1" },
          boundary: { answer: "门控不保证无限记忆，门值、容量、优化和噪声仍会限制。", evidence: "门控不是无限记忆保证" },
        },
        {
          section: 7,
          definition: { answer: "初始化按层宽选择随机权重方差，使训练起点的信号尺度可控。", evidence: "初始化怎样让第一步信号尺度不立即失控" },
          problem: { answer: "它避免随机权重一开始就让前向激活和反向梯度逐层缩放。", evidence: "过小和过大都可能失败" },
          inputOutput: { answer: "输入层宽与激活类型，输出 Xavier、He 或正交初始权重。", evidence: "按输入和输出宽度选择方差" },
          mechanism: { answer: "Xavier 平衡前后向方差，He 补偿 ReLU 约一半单元关闭。", evidence: "考虑 ReLU 约一半单元为零" },
          interpretation: { answer: "所列方差是基于激活与宽度假设的起点尺度，不是训练目标。", evidence: "前后向方差折中" },
          boundary: { answer: "初始化只稳定起点，训练后权重谱和激活分布仍会改变。", evidence: "初始化只控制起点" },
        },
        {
          section: 8,
          definition: { answer: "残差、归一化、门控、裁剪和损失缩放作用于不同传播环节。", evidence: "为什么不能互相替代" },
          problem: { answer: "它避免把所有防崩技巧混成一个无法解释的通用修复。", evidence: "它们实际改变的是同一段数学吗" },
          inputOutput: { answer: "输入具体失败证据，输出与故障环节匹配的稳定机制。", evidence: "直接改变 主要帮助 不能单独解决" },
          mechanism: { answer: "短路径改雅可比，归一化改尺度，裁剪限制最终大范数。", evidence: "雅可比加入恒等短路径" },
          interpretation: { answer: "技巧有效应解释为它恢复了对应层级的信号或数值范围。", evidence: "激活尺度和局部条件" },
          boundary: { answer: "裁剪不能创造消失信号，损失缩放也不能修复真实数学梯度过小。", evidence: "真实数学梯度过小" },
        },
        {
          section: 9,
          definition: { answer: "梯度剖面诊断按层记录激活、梯度和更新，定位信号首次异常处。", evidence: "怎样证明是梯度消失" },
          problem: { answer: "它区分路径消失、图切断、精度下溢和普通优化缓慢。", evidence: "而不是泛泛的“训练慢”" },
          inputOutput: { answer: "输入分层统计和消融实验，输出可证伪的根因判断。", evidence: "哪些观测能把根因定位到反向路径" },
          mechanism: { answer: "先验证任务可学，再记录深浅层统计并逐次替换单一机制。", evidence: "替换单一机制" },
          interpretation: { answer: "浅层系统性更小支持长路径消失，全层 None 更像图切断。", evidence: "所有层梯度均为 None/零" },
          boundary: { answer: "FP16 零梯度可能只是下溢，必须用 FP32 或损失缩放复验。", evidence: "而非数学连乘本身" },
        },
      ],
    },

    "batch-norm": {
      contractVersion: 2,
      examples: [{
        section: 3,
        evidence: {
          setup: "同一通道只有两个值 1 和 3",
          rule: "2·x̂+0.5",
          steps: "标准化 (x−2)/1",
          interpretation: "它不能消除“统计量由谁估计”的 batch 依赖",
        },
      }],
      termReviews: [{
        section: 8,
        reviewedAt: "2026-07-26",
        terms: [
          { name: "归纳偏好", meaning: "模型结构预先偏向某类数据规律的假设", purpose: "说明 GroupNorm 与 BatchNorm 的统计方式不可无损互换", definitionEvidence: "归纳偏好不同", purposeEvidence: "不能无损换权重" },
        ],
      }],
      formulas: [
        {
          id: "batchnorm-forward",
          section: 1,
          formulaIndex: 1,
          symbols: [
            { name: "μ", meaning: "当前批在指定统计轴上的均值", evidence: "共同产生均值和方差" },
            { name: "B", meaning: "共同估计统计量的当前 mini-batch 集合", evidence: "集合 B 中的激活" },
            { name: "m", meaning: "参与该通道统计的激活元素数量", evidence: "m 是其中参与统计的激活数量" },
            { name: "x", meaning: "标准化前的单个激活值", evidence: "一个元素既直接影响自己的分子" },
            { name: "i", meaning: "参与统计的激活元素编号", evidence: "集合 B 中的激活" },
            { name: "σ", meaning: "当前批在指定轴上的方差", evidence: "均值和方差" },
            { name: "y", meaning: "标准化并仿射变换后的输出激活", evidence: "经过 γ/β 后输出" },
            { name: "γ", meaning: "每通道可学习的输出缩放参数", evidence: "γ、β 是每通道可学习参数" },
            { name: "β", meaning: "每通道可学习的输出平移参数", evidence: "γ、β 是每通道可学习参数" },
            { name: "ε", meaning: "避免小方差造成数值放大的稳定常数", evidence: "ε 限制小方差时的放大" },
          ],
        },
        {
          id: "batchnorm-running-mean",
          section: 5,
          formulaIndex: 1,
          symbols: [
            { name: "μ", meaning: "运行均值或当前批均值", evidence: "旧运行均值 10、本批均值 14" },
            { name: "run", meaning: "下标表示用于推理的长期运行统计", evidence: "运行统计是模型状态" },
            { name: "α", meaning: "当前批统计写入运行状态的更新系数", evidence: "α=0.1" },
            { name: "B", meaning: "下标表示当前训练批的统计量", evidence: "本批均值 14" },
          ],
        },
        {
          id: "batchnorm-conv-fusion",
          section: 11,
          formulaIndex: 1,
          symbols: [
            { name: "W", meaning: "融合前后的卷积权重", evidence: "对卷积输出 Wx+b" },
            { name: "b", meaning: "融合前后的卷积偏置", evidence: "遗漏卷积偏置" },
            { name: "γ", meaning: "冻结 BatchNorm 的通道缩放参数", evidence: "γ、β 是 BN 缩放和平移" },
            { name: "β", meaning: "冻结 BatchNorm 的通道平移参数", evidence: "γ、β 是 BN 缩放和平移" },
            { name: "μ", meaning: "冻结的通道运行均值", evidence: "固定 BN" },
            { name: "σ", meaning: "冻结的通道运行方差", evidence: "匹配的运行统计" },
            { name: "run", meaning: "下标表示推理使用的运行统计", evidence: "eval 状态" },
            { name: "ε", meaning: "BatchNorm 推理公式使用的稳定常数", evidence: "ε 不同都会破坏等价" },
          ],
        },
      ],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "BatchNorm 用当前批统计标准化每通道激活，再学习缩放和平移。", evidence: "BatchNorm 在一次前向中做什么" },
          problem: { answer: "它稳定通道尺度并让训练中的参数优化更容易。", evidence: "共同产生均值和方差" },
          inputOutput: { answer: "输入批激活 x，输出经 μB、σ²B、γ、β 变换的 y。", evidence: "经过 γ/β 后输出" },
          mechanism: { answer: "先算批均值方差，标准化后乘 γ、加 β。", evidence: "γ、β 是每通道可学习参数" },
          interpretation: { answer: "标准化中间量近似零均值单位方差，最终输出不必满足。", evidence: "输出不必满足它" },
          boundary: { answer: "有限 ε、有限 batch 和同批样本耦合都会影响实际输出。", evidence: "有限 ε 和有限 batch" },
        },
        {
          section: 2,
          definition: { answer: "卷积 BatchNorm 为每个通道跨批次和空间位置独立统计。", evidence: "每个通道独立汇总 N×H×W 个值" },
          problem: { answer: "它明确不同张量形状的统计轴和参数数量。", evidence: "卷积张量究竟沿哪些轴统计" },
          inputOutput: { answer: "输入 [N,C,H,W]，输出每通道统计和同形状标准化张量。", evidence: "对形状 [N,C,H,W]" },
          mechanism: { answer: "固定 c，汇总 N×H×W，而不跨通道求均值。", evidence: "不在通道之间求均值" },
          interpretation: { answer: "因此 γ、β、运行均值和运行方差各只有 C 个。", evidence: "各有 C 个" },
          boundary: { answer: "全连接和一维卷积的统计元素不同，不能照搬二维轴。", evidence: "每特征统计的元素" },
        },
        {
          section: 3,
          definition: { answer: "该手算展示两个激活值的批统计、标准化和仿射恢复。", evidence: "手算一组 BatchNorm" },
          problem: { answer: "它解释 γ、β 后输出为何不再是零均值单位方差。", evidence: "标准化与仿射输出是什么" },
          inputOutput: { answer: "输入 [1,3]、γ=2、β=0.5，输出 [−1.5,2.5]。", evidence: "同一通道只有两个值 1 和 3" },
          mechanism: { answer: "均值为 2、方差为 1，标准化成 [−1,1] 后仿射。", evidence: "2·x̂+0.5" },
          interpretation: { answer: "γ、β 可恢复所需通道尺度，但不会消除批依赖。", evidence: "能恢复任意每通道线性尺度" },
          boundary: { answer: "该例忽略 ε 且只有两点，不能代表真实统计稳定性。", evidence: "不能消除“统计量由谁估计”的 batch 依赖" },
        },
        {
          section: 4,
          definition: { answer: "BatchNorm 训练用当前批统计，推理用冻结运行统计。", evidence: "训练和推理是两条不同的数据路径" },
          problem: { answer: "它避免单样本推理结果依赖线上请求怎样拼批。", evidence: "推理输出不应随线上请求如何拼批而改变" },
          inputOutput: { answer: "训练输入批并输出当前批归一化值和更新状态；推理输入样本并输出固定变换。", evidence: "训练输出使用当前批统计" },
          mechanism: { answer: "训练累积运行状态，eval 前向读取冻结 μrun 与 σ²run。", evidence: "运行统计只为未来推理积累" },
          interpretation: { answer: "同图随邻居改变表示仍处于 train 路径或状态使用错误。", evidence: "同一图片与不同邻居拼批会得到不同结果" },
          boundary: { answer: "batch=1 且空间小会使当前方差近零，运行统计未保存也会劣化。", evidence: "方差甚至接近零" },
        },
        {
          section: 5,
          definition: { answer: "运行统计是训练批统计的指数移动平均，也是模型持久状态。", evidence: "运行统计是模型状态，不是普通日志" },
          problem: { answer: "它为没有可靠当前批统计的部署推理提供长期估计。", evidence: "变成部署时的长期估计" },
          inputOutput: { answer: "输入旧运行均值、本批均值和 α，输出更新后的运行均值。", evidence: "新值为 10.4" },
          mechanism: { answer: "旧值乘 1−α，本批统计乘 α，再求和写回。", evidence: "指数移动平均" },
          interpretation: { answer: "运行状态偏向近期批分布，须与真实部署域相符。", evidence: "会偏向最近分布" },
          boundary: { answer: "不同框架 momentum 定义可能相反，运行方差约定也须核对。", evidence: "命名在不同框架中可能指 α" },
        },
        {
          section: 6,
          definition: { answer: "BatchNorm 通过尺度重参数化和更平滑的优化条件帮助训练。", evidence: "为什么 BatchNorm 常让优化更容易" },
          problem: { answer: "它解释 BN 的收益为何不能只归因于内部协变量偏移。", evidence: "是唯一解释吗" },
          inputOutput: { answer: "输入批激活与统计，输出条件改善且对初始化较不敏感的网络。", evidence: "改善条件、加快训练并降低初始化敏感性" },
          mechanism: { answer: "标准化与可学习仿射改变参数尺度，使损失和梯度更平滑。", evidence: "尺度重参数化允许更大学习率" },
          interpretation: { answer: "收益是许多卷积网络与合适 batch 下的经验结论。", evidence: "实践上更稳妥的结论" },
          boundary: { answer: "架构、优化器、增强和 batch 构成都会改变收益，无 BN 也可稳定训练。", evidence: "不要把经验收益推广成定理" },
        },
        {
          section: 7,
          definition: { answer: "批噪声是有限批成员变化造成同一样本归一化结果扰动。", evidence: "批噪声为何带来隐式正则" },
          problem: { answer: "它说明 BN 统计噪声怎样影响泛化以及为何与 batch 大小相关。", evidence: "同一个样本每次被不同批伴随" },
          inputOutput: { answer: "输入当前批组成，输出带随机统计扰动的样本表示。", evidence: "批成员变化会改变均值与方差" },
          mechanism: { answer: "有限样本估计随批次变化，抑制网络依赖精确激活尺度。", evidence: "抑制对精确激活尺度的依赖" },
          interpretation: { answer: "适量噪声可能像正则，但更小 batch 不一定更好。", evidence: "估计过差时优化会先受损" },
          boundary: { answer: "比较 batch 时须同时控制学习率、步数、统计质量和隐式正则。", evidence: "应区分学习率、训练步数" },
        },
        {
          section: 8,
          definition: { answer: "有效统计量是每通道用于估计均值方差的近似独立元素数。", evidence: "卷积 BN 的有效统计量数量" },
          problem: { answer: "它判断小 batch 是否真的导致通道统计不可靠。", evidence: "小 batch 何时真正失效" },
          inputOutput: { answer: "输入 N、H、W 及相关性，输出统计噪声风险与替代方案。", evidence: "有效统计量数量是 N×H×W" },
          mechanism: { answer: "空间位置可补充样本数，但相关性会降低有效独立数量。", evidence: "有效独立样本数还会低于表面数量" },
          interpretation: { answer: "深层特征图更小，同样 N 往往比早期层更噪。", evidence: "深层特征图变小后" },
          boundary: { answer: "SyncBN、冻结或 GroupNorm 各有通信、域偏差或不同归纳偏好。", evidence: "增加通信与同步等待" },
        },
        {
          section: 9,
          definition: { answer: "分布式训练中优化全局批、每卡微批和 BN 统计批是不同口径。", evidence: "全局 batch”有三个口径" },
          problem: { answer: "它解释优化器见 256 个样本时 BN 为何可能只统计 16 个。", evidence: "为什么 BN 可能只看到 16 张" },
          inputOutput: { answer: "输入设备数、微批和累积步，输出梯度批与统计批的实际规模。", evidence: "所有设备与累积步的样本总量" },
          mechanism: { answer: "梯度跨设备和时间累积，普通 BN 只统计单卡当前微批。", evidence: "梯度累积不会自动把多个时间步" },
          interpretation: { answer: "SyncBN 仅聚合当前步设备统计，通常不跨累积步。", evidence: "一般仍不跨累积步" },
          boundary: { answer: "只报告 batch size 无法复现 BN，须同时记录所有统计口径。", evidence: "无法重建 BN 行为" },
        },
        {
          section: 10,
          definition: { answer: "域迁移会让源域运行均值方差不再适配目标域激活。", evidence: "运行统计可能先于权重失效" },
          problem: { answer: "它解释新相机或新影像域下 eval 输出整体漂移。", evidence: "为什么 eval 模式输出整体漂移" },
          inputOutput: { answer: "输入目标域激活和源域运行统计，输出漂移证据或重估方案。", evidence: "目标域亮度、对比度、传感器或预处理变化" },
          mechanism: { answer: "固定源统计无法再正确居中和缩放目标域通道。", evidence: "固定统计不再居中缩放当前激活" },
          interpretation: { answer: "BN 前激活标准化偏差可先于平均准确率暴露统计漂移。", evidence: "会晚于统计漂移信号" },
          boundary: { answer: "重估数据须代表真实部署且不能泄漏评测标签。", evidence: "不能泄漏评测标签" },
        },
        {
          section: 11,
          definition: { answer: "卷积—BN 融合把冻结推理归一化代数吸收到卷积权重和偏置。", evidence: "卷积—BN 融合怎样保持推理等价" },
          problem: { answer: "它省去独立 BN 推理算子而保持相同仿射输出。", evidence: "省去独立 BN 算子" },
          inputOutput: { answer: "输入卷积参数和冻结 BN 状态，输出融合后的 W′ 与 b′。", evidence: "改写为新的仿射层" },
          mechanism: { answer: "按运行标准差缩放 W，并把 μrun、γ、β 合入 b。", evidence: "对卷积输出 Wx+b" },
          interpretation: { answer: "融合前后逐层差异应只来自允许的浮点误差。", evidence: "只允许可接受的浮点舍入差异" },
          boundary: { answer: "仅 eval 与匹配状态下等价，训练、广播、ε 或偏置错误会破坏。", evidence: "只对 eval 状态与匹配的运行统计成立" },
        },
        {
          section: 12,
          definition: { answer: "BatchNorm 验收是覆盖数值、轴、模式、状态、多卡、融合和域的测试组。", evidence: "怎样诊断与验收 BatchNorm" },
          problem: { answer: "它防止形状正确但统计协议错误的实现进入部署。", evidence: "逐通道与参考实现比较均值、方差和输出" },
          inputOutput: { answer: "输入实现和多类测试批，输出逐层误差、状态一致性与切片结果。", evidence: "保存/加载后运行均值、方差和批计数完全一致" },
          mechanism: { answer: "先手算最小例，再逐项比较 train/eval、多卡、状态与融合路径。", evidence: "融合前后用多批输入比较逐层最大误差与最终指标" },
          interpretation: { answer: "eval 随邻居变化或保存加载后状态不一致都应阻断。", evidence: "eval 模式必须不变" },
          boundary: { answer: "单一平均指标无法覆盖设备、增强、季节和机构等域漂移。", evidence: "新设备、增强、季节或机构" },
        },
      ],
    },

    "optimizer-schedule": {
      contractVersion: 2,
      examples: [
        {
          section: 3,
          evidence: {
            setup: "β=0.5",
            rule: "采用一种常见记号",
            steps: "横向梯度依次为 +4,−4,+4,−4",
            interpretation: "纵向因长期同号而积累",
          },
        },
        {
          section: 9,
          evidence: {
            setup: "只看到 loss=1.23",
            rule: "固定数据顺序和预算",
            steps: "短跑多个学习率数量级",
            interpretation: "确定“开始下降—稳定—发散”的区间",
          },
        },
      ],
      formulas: [
        {
          id: "optimizer-sgd",
          section: 2,
          formulaIndex: 1,
          symbols: [
            { name: "θ", meaning: "第 t 步更新前后的模型参数", evidence: "SGD 只使用当前 mini-batch" },
            { name: "t", meaning: "优化更新的步编号", evidence: "每一步抖动" },
            { name: "η", meaning: "第 t 步使用的全局学习率", evidence: "学习率 ηₜ" },
            { name: "g", meaning: "第 t 个 mini-batch 产生的梯度", evidence: "当前 mini-batch 梯度 gₜ" },
          ],
        },
        {
          id: "optimizer-momentum",
          section: 3,
          formulaIndex: 1,
          symbols: [
            { name: "v", meaning: "梯度指数平均形成的动量状态", evidence: "动量 v=(横,纵)" },
            { name: "t", meaning: "当前优化步编号", evidence: "步 梯度" },
            { name: "β", meaning: "控制历史状态保留比例的动量系数", evidence: "β 越高，平滑窗口越长" },
            { name: "g", meaning: "当前批次的梯度向量", evidence: "梯度 g=(横,纵)" },
            { name: "θ", meaning: "按动量方向更新的模型参数", evidence: "把左右摆动变成向前速度" },
            { name: "η", meaning: "把动量转换为参数移动的学习率", evidence: "平滑窗口越长" },
          ],
        },
        {
          id: "optimizer-adam-moments",
          section: 4,
          formulaIndex: 1,
          symbols: [
            { name: "m", meaning: "梯度方向的一阶指数移动平均", evidence: "m 平滑方向" },
            { name: "v", meaning: "平方梯度的二阶指数移动平均", evidence: "v 估计平方梯度尺度" },
            { name: "β", meaning: "一阶和二阶矩各自的历史保留系数", evidence: "β₁、β₂、ε" },
            { name: "g", meaning: "当前批次参数梯度", evidence: "平方梯度历史" },
            { name: "t", meaning: "Adam 状态更新的步编号", evidence: "早期偏差" },
          ],
        },
        {
          id: "optimizer-adam-update",
          section: 4,
          formulaIndex: 2,
          symbols: [
            { name: "θ", meaning: "Adam 更新前后的模型参数", evidence: "为不同参数形成不同有效步长" },
            { name: "t", meaning: "当前参数更新步编号", evidence: "帽子表示对初始化为零造成的早期偏差" },
            { name: "η", meaning: "控制 Adam 所有参数总体更新幅度的全局学习率", evidence: "Adam 仍有全局 η" },
            { name: "m", meaning: "完成偏差修正的一阶矩估计", evidence: "m 平滑方向" },
            { name: "v", meaning: "完成偏差修正的平方梯度尺度估计", evidence: "被分母缩小" },
            { name: "ε", meaning: "防止除零并控制极小尺度的稳定常数", evidence: "ε 防止除零" },
          ],
        },
        {
          id: "optimizer-adamw",
          section: 5,
          formulaIndex: 1,
          symbols: [
            { name: "θ", meaning: "同时接受梯度更新与独立衰减的参数", evidence: "每步直接缩小参数" },
            { name: "η", meaning: "梯度更新和衰减共同使用的全局学习率", evidence: "不与梯度尺度混合" },
            { name: "g", meaning: "传给 Adam 自适应更新的任务梯度", evidence: "AdamUpdate(g)" },
            { name: "λ", meaning: "统一控制参数比例缩小的权重衰减系数", evidence: "λ 更接近统一的参数缩小率" },
          ],
        },
      ],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "优化器把当前带噪梯度和历史状态转换为参数更新。", evidence: "优化器的工作不是重新定义目标" },
          problem: { answer: "它解决当前批梯度噪声、尺度差异和狭长谷地摆动。", evidence: "梯度为什么还不是一次可靠更新" },
          inputOutput: { answer: "输入当前梯度与状态，输出稳定更新；调度器再给全局步长。", evidence: "转换成稳定更新" },
          mechanism: { answer: "利用历史方向、每参数尺度和阶段学习率决定移动。", evidence: "怎样结合梯度历史形成更新" },
          interpretation: { answer: "优化器改善的是到达目标的轨迹，不会重新定义什么结果算好。", evidence: "不是重新定义目标" },
          boundary: { answer: "它不能修复错误损失、数据或标签，也不保证验证泛化。", evidence: "修复数据与标签错误" },
        },
        {
          section: 2,
          definition: { answer: "SGD 是只用当前 mini-batch 梯度与学习率的优化器。", evidence: "SGD 是最小基线" },
          problem: { answer: "它提供低状态开销、行为清楚的训练基线。", evidence: "最简单的优化器究竟保存什么状态" },
          inputOutput: { answer: "输入 θt、gt、ηt，输出下一步参数 θt+1。", evidence: "SGD 只使用当前 mini-batch 梯度" },
          mechanism: { answer: "把学习率乘当前梯度，再从当前参数中减去。", evidence: "它没有每参数历史状态" },
          interpretation: { answer: "单步会抖动，但长期平均仍可能指向有用方向。", evidence: "长期平均可能仍朝有用方向前进" },
          boundary: { answer: "早期训练损失更快不等于相同步数、算力和验证结果更好。", evidence: "不能宣称整体更好" },
        },
        {
          section: 3,
          definition: { answer: "Momentum 对历史梯度做指数平均，形成带惯性的更新方向。", evidence: "让一致方向积累、交替方向抵消" },
          problem: { answer: "它缓解狭长谷地中陡峭方向摆动和平坦方向前进缓慢。", evidence: "把左右摆动变成向前速度" },
          inputOutput: { answer: "输入 gt、旧 vt−1、β，输出新动量和下一参数。", evidence: "初始速度为 0" },
          mechanism: { answer: "历史与当前梯度加权求和，同号累积、交替分量部分抵消。", evidence: "横向翻转被历史削弱" },
          interpretation: { answer: "表中纵向动量趋近 −1，横向幅度低于原始梯度。", evidence: "纵向接近稳定 −1" },
          boundary: { answer: "β 过高会对新地形反应迟缓，并可能越过目标。", evidence: "带着惯性越过目标" },
        },
        {
          section: 4,
          definition: { answer: "Adam 同时估计梯度一阶矩和平方梯度二阶矩来缩放更新。", evidence: "平方梯度历史提供了什么信息" },
          problem: { answer: "它处理不同参数长期梯度尺度差异和稀疏更新。", evidence: "为不同参数形成不同有效步长" },
          inputOutput: { answer: "输入 gt、m、v 和超参数，输出偏差修正后的参数更新。", evidence: "帽子表示对初始化为零造成的早期偏差" },
          mechanism: { answer: "m 平滑方向，根号 v 缩放幅度，η 控制整体步长。", evidence: "梯度历史一直很大的参数会被分母缩小" },
          interpretation: { answer: "大历史梯度参数有效步长更小，小或稀疏梯度参数相对更大。", evidence: "可能得到相对更大步长" },
          boundary: { answer: "自适应不免除 η、β、ε、批量和裁剪的联合调参。", evidence: "默认值是常用起点，不是跨任务定律" },
        },
        {
          section: 5,
          definition: { answer: "AdamW 把参数比例衰减与自适应梯度更新分开执行。", evidence: "把权重衰减从梯度里拿出来" },
          problem: { answer: "它避免 L2 梯度被 Adam 每参数预条件器改变衰减强度。", evidence: "什么时候不再等价" },
          inputOutput: { answer: "输入参数、任务梯度、η 和 λ，输出梯度更新加独立衰减后的参数。", evidence: "AdamUpdate(g)" },
          mechanism: { answer: "先应用 AdamUpdate，再额外减去 ηλθ。", evidence: "参数更新时独立缩小" },
          interpretation: { answer: "λ 因而更接近所有被衰减参数统一的缩小率。", evidence: "统一的参数缩小率" },
          boundary: { answer: "偏置和归一化参数是否排除仍是需验证的配方选择。", evidence: "不是语法规则" },
        },
        {
          section: 6,
          definition: { answer: "学习率调度让全局参数步长随训练阶段系统变化。", evidence: "学习率为什么要随训练阶段变化" },
          problem: { answer: "它处理初期不稳定、中期主要学习和后期精细收敛的不同需求。", evidence: "很难同时适合训练初期、中期和收尾" },
          inputOutput: { answer: "输入全局步数与配方，输出当前预热、峰值或衰减学习率。", evidence: "总步数或批量改变后" },
          mechanism: { answer: "先逐步升至峰值，再按线性、余弦或分段规则降低。", evidence: "预热 峰值/平台 衰减" },
          interpretation: { answer: "预热防早期尖峰，衰减降低后期在噪声中的游走。", evidence: "降低参数在噪声中持续游走" },
          boundary: { answer: "总步数或 batch 改变后不可照搬原曲线绝对步数。", evidence: "不能只复制原曲线的绝对步数" },
        },
        {
          section: 7,
          definition: { answer: "批量大小同时决定梯度噪声、更新频率、吞吐和可用学习率。", evidence: "批量大小为什么属于优化器配方" },
          problem: { answer: "它解释扩大全局 batch 为何不只是系统吞吐优化。", evidence: "还是也改变梯度和可用学习率" },
          inputOutput: { answer: "输入微批、累积步和设备数，输出有效 batch 与更新次数。", evidence: "有效 batch 与优化器更新频率" },
          mechanism: { answer: "大 batch 降低采样噪声，但每个 epoch 的更新次数也减少。", evidence: "减少每个 epoch 的更新次数" },
          interpretation: { answer: "达到临界批量后继续放大多半只改善并行效率。", evidence: "达到临界批量后" },
          boundary: { answer: "公平比较须说明固定样本、步数、算力还是墙钟时间。", evidence: "公平比较应固定/报告" },
        },
        {
          section: 8,
          definition: { answer: "梯度裁剪、损失缩放和有限值检测分别保护更新与数值表示。", evidence: "在保护哪一层" },
          problem: { answer: "它区分 NaN 背后的梯度爆炸、低精度下溢和溢出。", evidence: "解决的是同一问题吗" },
          inputOutput: { answer: "输入梯度与数值状态，输出裁剪梯度、还原梯度或跳步决策。", evidence: "在 Inf/NaN 时跳过更新并调整缩放" },
          mechanism: { answer: "裁剪限制大范数，损失缩放先放大再还原，检测在异常时跳过。", evidence: "更新前再还原" },
          interpretation: { answer: "频繁裁剪或跳步说明根因未消失，不能只依赖保护机制。", evidence: "主要缓解爆炸" },
          boundary: { answer: "这些机制不能修复消失梯度、错误目标或长期过大的峰值学习率。", evidence: "不能把消失梯度、错误目标" },
        },
        {
          section: 9,
          definition: { answer: "优化日志诊断把损失、学习率、梯度、状态和有效更新连成轨迹。", evidence: "怎样从日志判断更新到底发生了什么" },
          problem: { answer: "它避免只看单个 loss 数字而无法判断优化器是否健康。", evidence: "为什么几乎无法判断优化器是否健康" },
          inputOutput: { answer: "输入训练运行日志，输出学习率错位、梯度异常或更新停滞的定位。", evidence: "必须记录 回答的问题 危险信号" },
          mechanism: { answer: "先验证小样本可学，再扫学习率并在固定预算下比较配方。", evidence: "先用几十个样本确认能过拟合" },
          interpretation: { answer: "非零梯度却无更新指向优化器组或缩放问题，尖峰指向不稳定。", evidence: "非零梯度却几乎不更新" },
          boundary: { answer: "一次改多项无法归因，扩大规模也必须先小比例试跑。", evidence: "不要一次改五项后归功于优化器名字" },
        },
      ],
    },

    "residual-connection": {
      contractVersion: 2,
      examples: [
        {
          section: 5,
          evidence: {
            setup: "20 块后梯度倍率",
            rule: "每块局部导数",
            steps: "0.98²⁰≈0.668",
            interpretation: "把每块雅可比放在 1 附近",
          },
        },
        {
          section: 10,
          evidence: {
            setup: "普通堆叠与残差堆叠",
            rule: "保持宽度、数据、优化预算尽量一致",
            steps: "做深度扫描",
            interpretation: "支持缓解退化",
          },
        },
      ],
      formulas: [
        {
          id: "residual-forward",
          section: 2,
          formulaIndex: 1,
          symbols: [
            { name: "y", meaning: "残差块把捷径与分支相加后的输出", evidence: "y 是捷径与增量相加后的块输出" },
            { name: "x", meaning: "同时进入恒等捷径和变换分支的输入", evidence: "把 x 重新生成一遍" },
            { name: "F", meaning: "相对输入学习增量修正的残差分支", evidence: "残差分支只需输出很小修正" },
            { name: "H", meaning: "残差块希望逼近的完整目标映射", evidence: "目标映射是 H(x)" },
          ],
        },
        {
          id: "residual-local-jacobian",
          section: 4,
          formulaIndex: 1,
          symbols: [
            { name: "y", meaning: "残差块输出", evidence: "损失对输入的梯度" },
            { name: "x", meaning: "残差块输入", evidence: "x 直接相加的捷径" },
            { name: "I", meaning: "恒等捷径对输入的单位雅可比", evidence: "I 来自 x 直接相加的捷径" },
            { name: "J", meaning: "变换分支 F 对输入 x 的局部雅可比", evidence: "分支局部导数" },
            { name: "F", meaning: "残差块的可学习变换分支", evidence: "分支雅可比接近零" },
          ],
        },
        {
          id: "residual-loss-gradient",
          section: 4,
          formulaIndex: 2,
          symbols: [
            { name: "L", meaning: "通过残差块反向传播的标量损失", evidence: "损失对输入的梯度" },
            { name: "x", meaning: "需要接收梯度的残差块输入", evidence: "直接到达输入" },
            { name: "y", meaning: "从下游接收上游梯度的残差块输出", evidence: "上游梯度" },
            { name: "I", meaning: "捷径贡献的恒等梯度路径", evidence: "仍有一份上游梯度可直接到达输入" },
            { name: "J", meaning: "变换分支贡献的局部雅可比", evidence: "多块还要连乘多个" },
            { name: "F", meaning: "残差变换分支", evidence: "分支雅可比接近零" },
          ],
        },
      ],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "深度退化是更深模型连训练误差都高于较浅模型的优化现象。", evidence: "这叫深度退化" },
          problem: { answer: "它解释新增层理论可恒等却在现实优化中损害训练表现。", evidence: "更深网络为什么可能连训练集都做得更差" },
          inputOutput: { answer: "输入浅层表示和新增模块，输出应保留表示或学习相对修正。", evidence: "新增层理论上可输出原输入" },
          mechanism: { answer: "普通层难合成恒等且路径变长，残差架构直接写入恒等捷径。", evidence: "残差连接把恒等映射直接写进架构" },
          interpretation: { answer: "训练误差随深度升高支持退化，不同于训练好而验证差的过拟合。", evidence: "和“训练很好、验证差”的过拟合不同" },
          boundary: { answer: "残差改善恒等解可达性，但不会自动解决数据和泛化问题。", evidence: "只需学相对输入的修正" },
        },
        {
          section: 2,
          definition: { answer: "残差块把目标完整映射改写为输入加一个可学习增量 F。", evidence: "完整映射怎样改写成增量" },
          problem: { answer: "它让接近恒等的目标只需学习小修正，而非重建整个输入。", evidence: "为什么学习 F(x)=H(x)−x 可能更容易" },
          inputOutput: { answer: "输入 x，分支输出 F(x)，块输出 y=x+F(x)。", evidence: "残差分支只需输出很小修正" },
          mechanism: { answer: "捷径原样传 x，变换分支学差值，最后逐元素相加。", evidence: "块一开始就是近似恒等" },
          interpretation: { answer: "F 接近零表示已有特征足够，较大 F 表示需要强修正。", evidence: "已有特征已经足够" },
          boundary: { answer: "目标远离恒等时分支仍能学习，但增量参数化优势会减弱。", evidence: "分支仍可学习大残差，但优势减弱" },
        },
        {
          section: 3,
          definition: { answer: "恒等捷径是绕过 F、把输入直接送到相加点的前向路径。", evidence: "不经过变换分支的通道" },
          problem: { answer: "它在新分支无用或学坏时仍保留已有输入信息。", evidence: "输入信息怎样继续向后" },
          inputOutput: { answer: "输入 x，经两路分别得到 x 与 F(x)，输出两者相加的 y。", evidence: "两条路径都执行" },
          mechanism: { answer: "上路执行变换，下路原样保留，随后在加法节点合并。", evidence: "输出是相加，不是二选一" },
          interpretation: { answer: "捷径帮助跨块复用特征，不表示变换分支被跳过。", evidence: "恒等通道使表示不会因为某个新分支" },
          boundary: { answer: "若 F(x) 尺度远大于 x，恒等信息仍会被分支淹没。", evidence: "恒等信息仍可能被淹没" },
        },
        {
          section: 4,
          definition: { answer: "残差块的输入雅可比是恒等项 I 加分支雅可比 JF。", evidence: "反向为什么出现恒等项" },
          problem: { answer: "它解释上游梯度怎样同时沿捷径与变换分支返回输入。", evidence: "同时经过捷径和变换分支" },
          inputOutput: { answer: "输入上游 ∂L/∂y 和分支雅可比，输出 ∂L/∂x。", evidence: "损失对输入的梯度" },
          mechanism: { answer: "捷径贡献 I，分支贡献 JF，两路贡献在输入处相加。", evidence: "I 来自 x 直接相加的捷径" },
          interpretation: { answer: "JF 接近零时单块梯度近似原样传递，但不是固定等于一。", evidence: "单块梯度近似原样传递" },
          boundary: { answer: "多块 I+JF 仍会连乘，方向可能放大、缩小或抵消。", evidence: "残差保证梯度为 1" },
        },
        {
          section: 5,
          definition: { answer: "数值例比较普通层和近恒等残差块经过 20 层的梯度倍率。", evidence: "普通连乘与近恒等路径差多少" },
          problem: { answer: "它量化短路径把每层导数从 0.8 拉近 1 后的深度收益。", evidence: "短路径的优势能有多大" },
          inputOutput: { answer: "输入每块局部导数和块数，输出 20 块后的乘积倍率。", evidence: "20 块后梯度倍率" },
          mechanism: { answer: "把每块有效导数连续相乘，得到 0.0115、0.668、1 或 1.486。", evidence: "0.98²⁰≈0.668" },
          interpretation: { answer: "近一雅可比让深度积累不再一开始就把信号压到百分之一。", evidence: "不再从一开始就把信号压到百分之一" },
          boundary: { answer: "这只是单方向常数简化，真实网络每层矩阵与方向不同。", evidence: "只是单方向简化" },
        },
        {
          section: 6,
          definition: { answer: "投影捷径用线性层或 1×1 卷积把输入变成可相加形状。", evidence: "形状不同时捷径为什么需要投影" },
          problem: { answer: "它解决输入与分支输出宽度或分辨率不同无法逐元素相加。", evidence: "两个张量还能直接相加吗" },
          inputOutput: { answer: "输入 x 和目标形状，输出 P(x)，再与 F(x) 相加。", evidence: "输出变成 y=P(x)+F(x)" },
          mechanism: { answer: "卷积用通道和步幅匹配，Transformer 用线性投影匹配宽度。", evidence: "常用 1×1 卷积和步幅" },
          interpretation: { answer: "投影保留相加接口，但主路径不再是严格恒等。", evidence: "不再保证严格恒等" },
          boundary: { answer: "应只在阶段形状变化处投影，避免每块都复杂化最短路径。", evidence: "而不是每块都把捷径变成复杂网络" },
        },
        {
          section: 7,
          definition: { answer: "残差分支尺度表示 F(x) 相对主干 x 的激活大小。", evidence: "分支尺度和零初始化" },
          problem: { answer: "它解释公式含 x 时分支为何仍可淹没主干或使深网爆炸。", evidence: "为什么分支仍可能把主干淹没" },
          inputOutput: { answer: "输入主干和分支激活，输出范数比及缩放或初始化决策。", evidence: "监控主干/分支范数比" },
          mechanism: { answer: "末层近零初始化、小残差系数和深度缩放让网络从近恒等开始。", evidence: "让分支末层权重或归一化尺度近零初始化" },
          interpretation: { answer: "F/x 早期很大提示分支过猛，长期近零提示无收益或优化不足。", evidence: "分支长期接近零" },
          boundary: { answer: "过强缩放会压制有效分支，仍须结合梯度、容量和任务收益。", evidence: "梯度、容量和任务收益" },
        },
        {
          section: 8,
          definition: { answer: "Pre-Norm 在子层前归一化，Post-Norm 在残差相加后归一化。", evidence: "Pre-Norm 与 Post-Norm 改变哪条路径" },
          problem: { answer: "它说明归一化位置怎样改变 Transformer 主干和深层优化。", evidence: "为什么会影响深层训练" },
          inputOutput: { answer: "输入 x 和子层 F，输出两种归一化位置对应的残差结果。", evidence: "y=LN(x+F(x))" },
          mechanism: { answer: "Pre-Norm 让 x 主干绕过子层归一化，Post-Norm 让相加结果再过 LN。", evidence: "x 主干更接近严格恒等" },
          interpretation: { answer: "Pre-Norm 通常更易训练深层，Post-Norm 的表示与收敛性质不同。", evidence: "通常更易稳定训练深层" },
          boundary: { answer: "选择仍取决于深度、缩放、初始化和最终归一化，不是无条件优劣。", evidence: "不是无条件更好" },
        },
        {
          section: 9,
          definition: { answer: "不同跳线可用相加、拼接、门控或条件跳过实现不同语义。", evidence: "与其他“跳线”到底有什么不同" },
          problem: { answer: "它避免把图上跨层连线都误认为标准残差连接。", evidence: "语义和计算可能完全不同" },
          inputOutput: { answer: "输入多路特征，输出相加、拼接、门控混合或跳层结果。", evidence: "合并方式 主要目的" },
          mechanism: { answer: "ResNet 相加，DenseNet 与 U-Net 常拼接，Highway 学门控比例。", evidence: "学习门控制两路比例" },
          interpretation: { answer: "相加强调增量和短梯度路径，拼接强调保留各路并增加宽度。", evidence: "增量学习与短梯度路径" },
          boundary: { answer: "标准残差仍执行 F，并不会自动降低推理 FLOPs。", evidence: "残差不等于跳过计算" },
        },
        {
          section: 10,
          definition: { answer: "残差实验用受控对照判断收益是否来自更好的可优化性。", evidence: "怎样证明残差改善的是可优化性" },
          problem: { answer: "它区分路径优化、参数数量变化和正则差异造成的分数提升。", evidence: "怎样区分“参数更多”" },
          inputOutput: { answer: "输入普通与残差等深模型，输出训练误差、梯度与尺度对照。", evidence: "普通堆叠与残差堆叠" },
          mechanism: { answer: "控制宽度数据预算，扫描深度并记录梯度、主干分支比和零初始化消融。", evidence: "记录分支/主干尺度" },
          interpretation: { answer: "深残差模型训练误差更低且早层梯度恢复，才支持缓解退化。", evidence: "支持缓解退化" },
          boundary: { answer: "可优化性改善不保证未知数据更好，仍须正则和独立评测。", evidence: "不保证未知数据一定更好" },
        },
      ],
    },

    cnn: {
      contractVersion: 2,
      examples: [{
        section: 2,
        evidence: {
          setup: "四个窗口",
          rule: "局部内积",
          steps: "3−0=3",
          interpretation: "正负号表示两条对角位置的相对亮度",
        },
      }],
      termReviews: [{
        section: 8,
        reviewedAt: "2026-07-26",
        terms: [
          { name: "归纳偏置", meaning: "模型结构预先偏向某类规律的假设", purpose: "说明普通卷积天然偏好平移等变而非所有变换不变", definitionEvidence: "归纳偏置", purposeEvidence: "平移等变" },
        ],
      }],
      formulas: [
        {
          id: "cnn-shared-convolution",
          section: 1,
          formulaIndex: 1,
          symbols: [
            { name: "Y", meaning: "卷积计算得到的输出特征图", evidence: "Y 是输出特征图" },
            { name: "i", meaning: "输出特征图的纵向空间位置", evidence: "i、j 是输出空间位置" },
            { name: "j", meaning: "输出特征图的横向空间位置", evidence: "i、j 是输出空间位置" },
            { name: "o", meaning: "被计算的输出通道编号", evidence: "o 是输出通道" },
            { name: "u", meaning: "核窗口内纵向位置", evidence: "u、v 是核窗口内位置" },
            { name: "v", meaning: "核窗口内横向位置", evidence: "u、v 是核窗口内位置" },
            { name: "c", meaning: "参与求和的输入通道编号", evidence: "c 是输入通道" },
            { name: "K", meaning: "在所有空间位置复用的卷积核权重", evidence: "K 是共享核权重" },
            { name: "X", meaning: "输入到卷积的特征图", evidence: "X 是输入特征图" },
            { name: "b", meaning: "每个输出通道使用的偏置", evidence: "b[o] 是输出通道偏置" },
          ],
        },
        {
          id: "cnn-worked-feature-map",
          section: 2,
          formulaIndex: 1,
          symbols: [
            { name: "Y", meaning: "四个局部窗口内积组成的二乘二特征图", evidence: "四个窗口得到一张 2×2 特征图" },
          ],
        },
        {
          id: "cnn-output-shape",
          section: 3,
          formulaIndex: 1,
          symbols: [
            { name: "out", meaning: "单个空间轴的输出长度", evidence: "out 是输出长度" },
            { name: "in", meaning: "单个空间轴的输入长度", evidence: "in 是单个空间轴的输入长度" },
            { name: "p", meaning: "输入两侧的填充量", evidence: "p 是两侧填充量" },
            { name: "d", meaning: "核元素间隔使用的膨胀率", evidence: "d 是膨胀率" },
            { name: "k", meaning: "卷积核在该轴上的宽度", evidence: "k 是核宽度" },
            { name: "s", meaning: "窗口每次移动的步幅", evidence: "s 是步幅" },
          ],
        },
        {
          id: "cnn-parameter-count",
          section: 4,
          formulaIndex: 1,
          symbols: [
            { name: "k", meaning: "卷积核的高或宽", evidence: "kₕ、k𝓌 是核的高和宽" },
            { name: "C", meaning: "卷积的输入或输出通道数量", evidence: "Cᵢₙ 是输入通道数" },
          ],
        },
        {
          id: "cnn-receptive-field",
          section: 6,
          formulaIndex: 1,
          symbols: [
            { name: "r", meaning: "当前层单元映回原输入的理论感受野边长", evidence: "rₗ 是该层单元在原输入上的理论感受野边长" },
            { name: "k", meaning: "当前层卷积核宽度", evidence: "kₗ 是核宽" },
            { name: "j", meaning: "当前层相邻单元中心映回输入的跳距", evidence: "jₗ 是相邻单元中心映回输入时的跳距" },
            { name: "s", meaning: "当前层卷积步幅", evidence: "sₗ 是步幅" },
          ],
        },
      ],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "卷积是在滑动局部窗口上重复使用同一核权重的多通道内积。", evidence: "卷积是滑动窗口上的共享内积" },
          problem: { answer: "它用较少参数在任意空间位置检测同一局部模式。", evidence: "为什么一套边缘核能在图片任意位置工作" },
          inputOutput: { answer: "输入特征图 X 和核 K，输出按位置与通道组织的特征图 Y。", evidence: "X 是输入特征图" },
          mechanism: { answer: "取局部窗口逐项乘核并跨位置和输入通道求和，再加偏置。", evidence: "跨窗口和输入通道相加" },
          interpretation: { answer: "响应正负只表示当前核方向和强度，不等于检测到可命名对象。", evidence: "不自动等于某个可命名对象" },
          boundary: { answer: "许多库实现互相关而不翻核，边界、步幅和缩放也会破坏理想性质。", evidence: "实现互相关而不翻转核" },
        },
        {
          section: 2,
          definition: { answer: "该例用一个二乘二核遍历三乘三灰度图并得到四个响应。", evidence: "四个窗口得到一张 2×2 特征图" },
          problem: { answer: "它展示每个特征图元素如何由对应局部窗口内积得到。", evidence: "局部内积怎样响应" },
          inputOutput: { answer: "输入给定 X、K、步幅一和无填充，输出 Y=[[-2,1],[-1,3]]。", evidence: "Y=[[1−3, 2−1],[0−1, 3−0]]" },
          mechanism: { answer: "按四个窗口左上角切片，与核逐项相乘并相加。", evidence: "左上到右下的亮度差" },
          interpretation: { answer: "正负响应表示两条对角位置的相对亮度，而非对象身份。", evidence: "而非“发现了对象”" },
          boundary: { answer: "一个手工核只响应一种局部差异，真实网络需学习多核并非线性组合。", evidence: "训练会从任务损失中学习许多核" },
        },
        {
          section: 3,
          definition: { answer: "输出几何由输入长度、核、填充、步幅和膨胀共同决定。", evidence: "步幅、填充和膨胀决定输出几何" },
          problem: { answer: "它防止尺寸计算错误导致残差无法相加或特征错位。", evidence: "尺寸错一格为何会让残差相加失败" },
          inputOutput: { answer: "输入 in、k、p、s、d，输出向下取整的空间长度 out。", evidence: "out 是输出长度" },
          mechanism: { answer: "先算膨胀核有效覆盖，从填充后长度扣除，再按步幅计窗口数。", evidence: "只保留完整落入规则的窗口" },
          interpretation: { answer: "示例 32 输入在 k3、p1、s2 下输出 16。", evidence: "out=⌊(32+2−2−1)/2⌋+1=16" },
          boundary: { answer: "偶数核或大步幅时框架左右填充规则可能不同。", evidence: "不同框架的左右填充规则可能不同" },
        },
        {
          section: 4,
          definition: { answer: "卷积参数量由核面积和输入输出通道决定，而不由图像面积决定。", evidence: "通道决定参数量，不由图片面积决定" },
          problem: { answer: "它估算模型容量并区分参数存储与空间计算成本。", evidence: "3×3 卷积从64通道变128通道有多少参数" },
          inputOutput: { answer: "输入核高宽、Cin、Cout 与偏置约定，输出总参数量。", evidence: "每个输出通道还有一个偏置" },
          mechanism: { answer: "每个输出通道持有 kh×kw×Cin 个权重和一个偏置。", evidence: "括号内加 1" },
          interpretation: { answer: "示例共有 73,856 参数，在所有空间位置共享。", evidence: "空间位置共享这 73,856 个参数" },
          boundary: { answer: "参数量不随面积变，但乘加计算仍随输出空间面积增长。", evidence: "乘加计算量会随输出空间面积增长" },
        },
        {
          section: 5,
          definition: { answer: "平移等变表示输入移动时卷积特征响应按同样位移移动。", evidence: "共享核产生平移等变响应" },
          problem: { answer: "它解释共享核为何能在不同空间位置检测同一模式。", evidence: "输入向右移动一格" },
          inputOutput: { answer: "输入图像及其平移版本，输出对应平移的卷积特征图。", evidence: "响应也右移 1 格" },
          mechanism: { answer: "同一 K 在全部位置使用，因此相同局部图案产生相同响应。", evidence: "所有位置同一 K" },
          interpretation: { answer: "等变保留位置变化；分类不变还需池化、增强或聚合。", evidence: "分类不变还需全局池化" },
          boundary: { answer: "边界填充和离散采样会破坏严格平移等变。", evidence: "忽略边界与采样" },
        },
        {
          section: 6,
          definition: { answer: "感受野是某层单元理论上能受原输入多大区域影响。", evidence: "感受野按跳距逐层增长" },
          problem: { answer: "它判断局部卷积堆叠何时能够汇集更大范围上下文。", evidence: "能看多大区域" },
          inputOutput: { answer: "输入各层核与步幅，输出逐层跳距 j 和感受野 r。", evidence: "从 r₀=1、j₀=1 开始" },
          mechanism: { answer: "当前核新增 k−1 个前层跳距覆盖，并把跳距乘步幅。", evidence: "后续每增加一个核位置会跨更大输入距离" },
          interpretation: { answer: "三层三乘三步幅一的理论感受野为七乘七。", evidence: "理论感受野为 7×7" },
          boundary: { answer: "理论覆盖不等于有效贡献，真实梯度影响常集中在中心。", evidence: "理论覆盖不等于有效贡献" },
        },
        {
          section: 7,
          definition: { answer: "混叠是降采样前高频未滤除而折叠成低频伪影。", evidence: "下采样前不过滤会产生混叠" },
          problem: { answer: "它解释棋盘纹理缩小后为何出现原图不存在的结构。", evidence: "变成不存在的图案" },
          inputOutput: { answer: "输入高分辨率特征和降采样算子，输出较小特征图及潜在伪影。", evidence: "stride卷积或池化减少采样率" },
          mechanism: { answer: "超过新奈奎斯特频率的细节折叠到低频，低通可先抑制。", evidence: "折叠为低频伪影" },
          interpretation: { answer: "伪纹理或小目标消失提示采样信息损失，不只是压缩。", evidence: "小物体若小于一个下采样单元" },
          boundary: { answer: "平均或低通能减轻混叠但也可能损伤任务需要的高频细节。", evidence: "不是免费压缩" },
        },
        {
          section: 8,
          definition: { answer: "等变让输出随变换移动，不变让输出在变换后保持相同。", evidence: "等变、不变与数据增强不能混为一谈" },
          problem: { answer: "它澄清普通 CNN 是否天然忽略平移、旋转和尺度变化。", evidence: "是否天生对旋转、缩放都不敏感" },
          inputOutput: { answer: "输入变换前后图像，输出随动特征或保持不变的任务预测。", evidence: "输入移动，特征同样移动" },
          mechanism: { answer: "卷积近似平移等变；池化与训练形成不变，增强注入额外假设。", evidence: "需聚合与训练" },
          interpretation: { answer: "增强等于声明哪些变化不应改变标签，须符合任务语义。", evidence: "告诉模型哪些变换应保持标签" },
          boundary: { answer: "错误增强会注入错误不变性，例如旋转数字六仍强制同标签。", evidence: "增强反而注入错误不变性" },
        },
        {
          section: 9,
          definition: { answer: "CNN、ViT 与混合骨干是不同局部和全局关系建模方案。", evidence: "各有计算甜点区" },
          problem: { answer: "它根据数据、延迟、任务尺度和全局关系需求选择视觉骨干。", evidence: "注意力出现后为什么卷积仍广泛存在" },
          inputOutput: { answer: "输入任务和资源约束，输出需实测的 CNN、ViT 或混合候选。", evidence: "约束 优先验证" },
          mechanism: { answer: "CNN 依赖局部共享和金字塔，ViT 用注意力直接连接全局内容。", evidence: "ViT 更直接建立全局内容关系" },
          interpretation: { answer: "有限数据端侧和密集预测常利于 CNN，大规模全局任务可利于 ViT。", evidence: "有限数据、端侧和密集预测中高效" },
          boundary: { answer: "两类架构不断互借，最终选择须在目标硬件和数据上验证。", evidence: "两类设计不断互借" },
        },
        {
          section: 11,
          definition: { answer: "特征可视化展示某通道与输入区域的相关响应，不是因果解释。", evidence: "可视化特征不能替代干预验证" },
          problem: { answer: "它防止看到高激活样本后直接给通道命名为对象检测器。", evidence: "就能把它命名为轮子检测器吗" },
          inputOutput: { answer: "输入通道与样本，输出激活图及遮挡、替换、消融的变化证据。", evidence: "最大激活样本只展示相关性" },
          mechanism: { answer: "用遮挡、反事实和消融主动改变候选特征，再比较输出。", evidence: "配合遮挡、反事实替换、特征消融" },
          interpretation: { answer: "跨数据集干预都稳定改变输出才支持模型确实依赖该特征。", evidence: "观察干预是否稳定改变输出" },
          boundary: { answer: "单张显著图不能证明依赖区域，更不能证明因果机制。", evidence: "更不能证明因果机制" },
        },
      ],
    },

    rnn: {
      contractVersion: 2,
      examples: [{
        section: 2,
        evidence: {
          setup: "沿用上一节的一维输入 x=[1,0,2]",
          rule: "Wₕ=0.5",
          steps: "h₃=0.5×0.5+2=2.25",
          interpretation: "早期信息按距离指数衰减",
        },
      }],
      formulas: [
        {
          id: "rnn-recurrence",
          section: 1,
          formulaIndex: 1,
          symbols: [
            { name: "h", meaning: "更新前后的隐藏状态", evidence: "hₜ₋₁ 与 hₜ 是更新前后的隐藏状态" },
            { name: "t", meaning: "序列当前时间步编号", evidence: "t 是时间步" },
            { name: "φ", meaning: "把状态预激活转换为新状态的激活函数", evidence: "φ 是状态激活" },
            { name: "W", meaning: "状态、输入或输出使用的共享权重", evidence: "Wₕ 变换旧状态" },
            { name: "x", meaning: "当前时间步输入", evidence: "xₜ 是当前输入" },
            { name: "b", meaning: "状态递推使用的偏置", evidence: "b 是偏置" },
            { name: "y", meaning: "由当前状态产生的时间步输出", evidence: "当前输出 yₜ" },
            { name: "g", meaning: "把隐藏状态转换为任务输出的函数", evidence: "g 把状态变成当前输出" },
          ],
        },
        {
          id: "rnn-worked-recurrence",
          section: 2,
          formulaIndex: 1,
          symbols: [
            { name: "h", meaning: "一维 RNN 各时间步递推得到的状态", evidence: "最后状态到底混合了哪些历史" },
          ],
        },
        {
          id: "rnn-temporal-jacobian",
          section: 4,
          formulaIndex: 1,
          symbols: [
            { name: "h", meaning: "较早或较晚时间步的隐藏状态", evidence: "hₖ 是较早第 k 步状态" },
            { name: "t", meaning: "梯度路径终点的较晚时间步", evidence: "hₜ 是较晚第 t 步状态" },
            { name: "k", meaning: "梯度路径起点的较早时间步", evidence: "第 k 步状态" },
            { name: "i", meaning: "连乘中遍历的中间时间步", evidence: "乘积遍历中间时间步 i" },
            { name: "diag", meaning: "把激活逐坐标导数组成对角矩阵", evidence: "激活函数逐坐标导数组成的对角矩阵" },
            { name: "φ", meaning: "每个时间步使用的状态激活函数", evidence: "非线性饱和会进一步让 φ′ 接近零" },
            { name: "W", meaning: "每个时间步复用的状态权重矩阵", evidence: "Wₕ 是每步复用的状态权重" },
          ],
        },
        {
          id: "rnn-lstm-state",
          section: 5,
          formulaIndex: 1,
          symbols: [
            { name: "c", meaning: "LSTM 的旧、新细胞状态及候选内容", evidence: "cₜ₋₁、cₜ 是旧、新细胞状态" },
            { name: "t", meaning: "当前 LSTM 时间步编号", evidence: "暴露给外部的隐藏状态" },
            { name: "f", meaning: "控制旧细胞状态保留比例的遗忘门", evidence: "fₜ 是遗忘门" },
            { name: "i", meaning: "控制候选内容写入比例的输入门", evidence: "iₜ 是输入门" },
            { name: "h", meaning: "LSTM 暴露给外部的隐藏状态", evidence: "hₜ 是暴露给外部的隐藏状态" },
            { name: "o", meaning: "控制细胞状态暴露比例的输出门", evidence: "oₜ 是输出门" },
            { name: "tanh", meaning: "把细胞状态压缩后交给输出门的非线性", evidence: "完整非线性" },
          ],
        },
      ],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "RNN 在每个时间步复用同一递推单元更新隐藏状态。", evidence: "同一个单元在时间上反复使用" },
          problem: { answer: "它用固定大小状态处理可变长度、逐步到达的序列。", evidence: "参数量为何不随序列长度增加" },
          inputOutput: { answer: "输入 xt 和旧状态 ht−1，输出新状态 ht 与当前输出 yt。", evidence: "xₜ 是当前输入" },
          mechanism: { answer: "共享权重变换旧状态与当前输入，相加激活后再生成输出。", evidence: "序列变长只增加重复计算" },
          interpretation: { answer: "ht 是面向当前任务的历史摘要，不是可检索的完整日志。", evidence: "不是一份可检索的完整日志" },
          boundary: { answer: "共享递推允许任意长度，也会让同一误差和压缩反复累积。", evidence: "同一个变换及其误差反复作用" },
        },
        {
          section: 2,
          definition: { answer: "该例逐步计算一维线性 RNN 的三个隐藏状态。", evidence: "三步递推可以逐项手算" },
          problem: { answer: "它展示最终状态如何按时间距离加权混合历史输入。", evidence: "最后状态到底混合了哪些历史" },
          inputOutput: { answer: "输入 [1,0,2]、Wh=0.5 和 h0=0，输出 h3=2.25。", evidence: "h₃=0.5×0.5+2=2.25" },
          mechanism: { answer: "每一步把上一状态乘 0.5，再加当前输入。", evidence: "0.5×1+0" },
          interpretation: { answer: "最近输入权重一，两步前权重 0.25，说明早期影响衰减。", evidence: "两步前输入权重为 0.25" },
          boundary: { answer: "Wh 小于一导致遗忘，大于一可能放大状态并引发梯度爆炸。", evidence: "状态与梯度也更易爆炸" },
        },
        {
          section: 3,
          definition: { answer: "BPTT 把循环按时间展开，再沿展开图执行反向传播。", evidence: "时间展开把循环变成深度为 T 的计算图" },
          problem: { answer: "它把未来损失的责任分配给每次复用的递归参数。", evidence: "递归参数怎样收到来自未来损失的责任" },
          inputOutput: { answer: "输入保存的时间步激活和损失，输出共享参数各次贡献的总梯度。", evidence: "三次使用同一参数的梯度相加" },
          mechanism: { answer: "前向顺序递推，反向沿状态路径返回并累加复用贡献。", evidence: "梯度从未来沿共享状态路径返回" },
          interpretation: { answer: "序列越长，需保存的激活、反向路径和信用距离越长。", evidence: "序列越长，需保存的激活和梯度路径越长" },
          boundary: { answer: "截断 BPTT 省内存，但会切断超过 K 步的直接信用路径。", evidence: "超过 K 步的直接信用路径也被切断" },
        },
        {
          section: 4,
          definition: { answer: "时间梯度由每个中间步的激活导数和状态权重雅可比连续相乘。", evidence: "梯度问题来自雅可比反复相乘" },
          problem: { answer: "它解释 Wh=0.5 和 1.2 为何分别导致消失与爆炸。", evidence: "会走向两个极端" },
          inputOutput: { answer: "输入早晚状态、激活导数和 Wh，输出跨时间状态敏感度。", evidence: "hₜ 是较晚第 t 步状态" },
          mechanism: { answer: "按中间时间步顺序连乘 diag(φ′i)Wh。", evidence: "乘积遍历中间时间步 i" },
          interpretation: { answer: "十步 0.5 约 0.00098，十步 1.2 约 6.19。", evidence: "早期责任几乎消失" },
          boundary: { answer: "裁剪只限制爆炸，不能恢复已被状态丢弃的原文和长期记忆。", evidence: "被状态丢掉的原文" },
        },
        {
          section: 5,
          definition: { answer: "LSTM 用遗忘、输入和输出门控制加法细胞状态通道。", evidence: "用近似加法通道控制记忆" },
          problem: { answer: "它缓解普通 tanh RNN 长路径中每步完整非线性造成的衰减。", evidence: "更容易保留信息" },
          inputOutput: { answer: "输入旧状态、候选内容和三门，输出新 c 与暴露的 h。", evidence: "c̃ₜ 是候选内容" },
          mechanism: { answer: "遗忘门保留旧 c，输入门写候选，输出门决定暴露比例。", evidence: "决定旧记忆保留比例" },
          interpretation: { answer: "门是数据学习的连续向量，不是符号规则或硬存储槽。", evidence: "数据驱动的连续向量" },
          boundary: { answer: "即使 f=0.99，五百步后也只保留约 0.0066，不是无限记忆。", evidence: "0.99⁵⁰⁰≈0.0066" },
        },
        {
          section: 6,
          definition: { answer: "教师强制在训练时把真实上一步答案作为下一步输入。", evidence: "训练每一步都看真答案" },
          problem: { answer: "它造成训练与推理输入分布不同，单次错误上线后会滚雪球。", evidence: "教师强制制造训练—推理输入差异" },
          inputOutput: { answer: "训练输入真实 yt−1，推理输入模型预测，输出后续序列和状态。", evidence: "推理时只能输入模型自己的预测" },
          mechanism: { answer: "预测错误把状态带入训练中罕见区域，随后错误继续累积。", evidence: "后续错误继续累积" },
          interpretation: { answer: "这种分布错位称为 exposure bias，应单独评估自由生成轨迹。", evidence: "这叫 exposure bias" },
          boundary: { answer: "计划采样有偏，序列损失噪声大，解码策略也不修复训练错位。", evidence: "不修复训练分布错位" },
        },
        {
          section: 7,
          definition: { answer: "many-to-one、多对多、编码解码和双向是不同序列读取输出方式。", evidence: "双向、堆叠与多对多只是读取方式变化" },
          problem: { answer: "它为分类、逐步标注、生成和离线双向理解选择输出结构。", evidence: "分类、标注和生成各该取哪个输出" },
          inputOutput: { answer: "输入完整或流式序列，输出末状态、逐步标签或另一序列。", evidence: "many-to-one 取末状态" },
          mechanism: { answer: "双向模型分别读取左右文再合并，堆叠则把状态送入更深递推层。", evidence: "同时读取左右文" },
          interpretation: { answer: "双向利用已可见的未来上下文，不等于预测尚未到达的未来。", evidence: "双向不等于预测未来" },
          boundary: { answer: "严格在线场景不能使用双向未来输入，堆叠还会拉长优化路径。", evidence: "不能偷看尚未到达的数据" },
        },
        {
          section: 8,
          definition: { answer: "RNN 压缩历史到固定状态，注意力则保留各位置可直接访问的 KV。", evidence: "核心差别是访问历史的方式" },
          problem: { answer: "它比较小流式状态与精确回看全历史之间的成本收益。", evidence: "小状态和全量 KV 历史分别换来了什么" },
          inputOutput: { answer: "输入序列与部署约束，输出需实测的 RNN 或注意力方案。", evidence: "固定状态压缩" },
          mechanism: { answer: "RNN 顺序更新固定状态，注意力让当前位置直接连接旧位置。", evidence: "可直接连接旧位置" },
          interpretation: { answer: "低频传感器端侧可偏 RNN，引用远处原句的任务可偏注意力。", evidence: "在线异常检测" },
          boundary: { answer: "实际速度还取决于内核、批量和硬件，不能只按复杂度标签选型。", evidence: "实际速度取决于内核、批量和硬件" },
        },
        {
          section: 9,
          definition: { answer: "RNN 工程验收按依赖长度、流式状态和恢复场景拆分评测。", evidence: "评测要把长度、流式约束和状态恢复拆开" },
          problem: { answer: "它避免平均准确率掩盖长依赖遗忘和会话状态故障。", evidence: "平均准确率为何不能证明 RNN 真正记住长依赖" },
          inputOutput: { answer: "输入长度切片、干扰和恢复场景，输出性能曲线、延迟与状态指标。", evidence: "按依赖距离画性能曲线" },
          mechanism: { answer: "加入状态重置、缺包、超长外推，并测延迟、吞吐和冷启动。", evidence: "状态重置、缺包和超长外推" },
          interpretation: { answer: "随距离快速下降说明长依赖失败，跨用户串扰说明状态隔离错误。", evidence: "上下文串扰与隐私泄漏" },
          boundary: { answer: "隐藏状态须绑定身份、可重置并版本化，模型升级后旧状态可能不兼容。", evidence: "模型升级后旧状态未必兼容" },
        },
      ],
    },

    tokenization: {
      contractVersion: 2,
      examples: [{
        section: 3,
        evidence: {
          setup: "设玩具语料只含",
          rule: "按词频统计相邻对",
          steps: "lo + w",
          interpretation: "完整的 low 合成一个词尾 token",
        },
      }],
      termReviews: [{
        section: 4,
        reviewedAt: "2026-07-26",
        terms: [
          { name: "似然", meaning: "概率模型对某个候选切分赋予的相对支持程度", purpose: "让 Unigram 在多种覆盖中选择概率更高的切分", definitionEvidence: "按片段概率选择高似然切分", purposeEvidence: "可采样多种切分" },
        ],
      }],
      formulas: [{
        id: "tokenizer-vocab-length-tradeoff",
        section: 5,
        formulaIndex: 1,
        symbols: [
          { name: "V", meaning: "tokenizer 的有限词表及其大小", evidence: "词表 |V| 变大" },
          { name: "d", meaning: "每个 token 嵌入向量的维度", evidence: "输入嵌入和输出分类矩阵随词表增长" },
          { name: "L", meaning: "tokenizer 编码后序列的 token 长度", evidence: "平均序列长度 L 可能缩短" },
        ],
      }],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "Tokenizer 是把 Unicode 文本确定性编译为 token ID 的版本化管线。", evidence: "一段文字要经过哪几道门" },
          problem: { answer: "它把屏幕文本转换成模型嵌入矩阵可接收的整数序列。", evidence: "从用户按键到嵌入向量" },
          inputOutput: { answer: "输入原始 Unicode，输出规范化片段、ID、特殊符号和嵌入索引。", evidence: "Unicode 原始文本" },
          mechanism: { answer: "依次执行规范化、预切分、子词编码、词表查 ID 和模板插入。", evidence: "规范化可能统一某些等价字符" },
          interpretation: { answer: "文本看似相同也可能得到不同 ID，字符数不能推断 token 数。", evidence: "不能从屏幕上的字符数推断 token 数" },
          boundary: { answer: "任一步实现或版本差异都会改变后续 ID，不能用大致相同替代。", evidence: "大致相同”的实现不够" },
        },
        {
          section: 2,
          definition: { answer: "字符、UTF-8 字节、子词片段和 token ID 是四个不同层级。", evidence: "字符、字节、子词与 ID 分别是什么" },
          problem: { answer: "它澄清一个可见字形为何未必等于一个码点或 token。", evidence: "一个字就是一个 token”为什么只在偶然情况下成立" },
          inputOutput: { answer: "输入可见文本，输出码点、字节、子词和可查嵌入的整数 ID。", evidence: "可索引嵌入矩阵某一行" },
          mechanism: { answer: "Unicode 先编码为字节，再由子词规则覆盖并映射到词表 ID。", evidence: "有限词表可组合开放文本" },
          interpretation: { answer: "子词片段不保证完整语义，ID 也不保证跨 tokenizer 同义。", evidence: "跨 tokenizer 仍表示同一片段" },
          boundary: { answer: "组合音标、emoji 和零宽连接符会让可见字符数与底层单位分离。", evidence: "尤其容易让“可见字符数”失效" },
        },
        {
          section: 3,
          definition: { answer: "BPE 反复把语料中高频相邻符号对合并成新子词符号。", evidence: "高频相邻对怎样变成新符号" },
          problem: { answer: "它从有限符号底座学习压缩常见片段的合并规则。", evidence: "不是一张人工词典" },
          inputOutput: { answer: "输入带词频的初始字符序列，输出有序合并规则和子词表示。", evidence: "初始把每个词写成字符加词尾符" },
          mechanism: { answer: "每轮统计相邻对，合并最高频者，再重新统计下一轮。", evidence: "反复加入最有压缩收益的相邻合并" },
          interpretation: { answer: "完整 low 出现五次，因此第三轮优先形成词尾 token。", evidence: "因为它出现 5 次" },
          boundary: { answer: "真实实现还受预切分、并列频次和词尾约定影响。", evidence: "并列频次规则和实现细节" },
        },
        {
          section: 4,
          definition: { answer: "BPE、Unigram 和字节级方案以不同搜索方向构造子词覆盖。", evidence: "BPE、Unigram 与字节级方案在优化什么" },
          problem: { answer: "它比较确定合并、概率切分和完备字节回退的取舍。", evidence: "搜索方向不同" },
          inputOutput: { answer: "输入语料和词表预算，输出子词词表、规则或片段概率模型。", evidence: "训练思路 编码特点" },
          mechanism: { answer: "BPE 向上合并，Unigram 从大候选向下剪枝，字节级先保证覆盖。", evidence: "从大候选词表向下剪枝" },
          interpretation: { answer: "无未知只表示任意文本可编码，不表示序列短或语言覆盖高。", evidence: "不说明编码高效" },
          boundary: { answer: "罕见字符可能回退成多个字节 token，占用更多上下文位置。", evidence: "罕见串可能很长" },
        },
        {
          section: 5,
          definition: { answer: "词表大小在嵌入参数量与编码序列长度之间进行交换。", evidence: "词表大小是一笔参数—序列长度交换" },
          problem: { answer: "它解释扩大词表为何缩短常见片段却增加参数和稀疏更新。", evidence: "付出和节省的分别是什么" },
          inputOutput: { answer: "输入词表大小、嵌入维度和语料，输出参数量与长度分布。", evidence: "嵌入参数量 ≈ |V| × d" },
          mechanism: { answer: "大词表让常见片段合成单 token，同时扩大嵌入和输出矩阵。", evidence: "输入嵌入和输出分类矩阵随词表增长" },
          interpretation: { answer: "词表变大时 L 可能下降，但罕见 token 的训练更新更少。", evidence: "罕见 token 获得的更新也更少" },
          boundary: { answer: "压缩率更高不保证语义或下游质量更好，须联合测吞吐与语言切片。", evidence: "压缩率更高不等于语义学习一定更好" },
        },
        {
          section: 6,
          definition: { answer: "分词效率是同一信息被编码成多少 token 的语言与任务分布。", evidence: "分词效率为什么会影响多语言公平性" },
          problem: { answer: "它揭示不同语言为何消耗不同上下文预算和截断风险。", evidence: "不同语言可能消耗不同上下文预算" },
          inputOutput: { answer: "输入多语言真实语料，输出 fertility、长度、截断率和任务质量。", evidence: "每语言长度分布" },
          mechanism: { answer: "高频语料更易学成长 token，低资源语言更常拆成字符或字节。", evidence: "低资源语言可能被拆成字符或字节" },
          interpretation: { answer: "token 较多表示成本和截断压力，不能单独证明歧视。", evidence: "不能把某个语言天然较多 token 直接解释为歧视" },
          boundary: { answer: "必须控制形态、书写系统和长度，避免把任务差异全归因 tokenizer。", evidence: "结合形态结构、书写系统和任务质量" },
        },
        {
          section: 7,
          definition: { answer: "特殊 token 和聊天模板是训练中赋予特定 ID 控制语义的协议。", evidence: "为何属于模型协议" },
          problem: { answer: "它规定序列、角色、助手和工具结果的边界与顺序。", evidence: "不同角色标记为什么会得到不同结果" },
          inputOutput: { answer: "输入消息结构，输出插入 BOS、EOS、角色和工具 token 的 ID 序列。", evidence: "聊天模板决定这些 ID 的顺序" },
          mechanism: { answer: "模板按训练约定插入控制 ID，模型再从对应嵌入行读取语义。", evidence: "特定 ID 承担" },
          interpretation: { answer: "漏前缀、重复 BOS 或错用 EOS 会把模型带入陌生状态。", evidence: "训练中不熟悉的状态" },
          boundary: { answer: "登记新 token 不会自动赋义，还须扩展矩阵并训练新行。", evidence: "不会自动赋予概念" },
        },
        {
          section: 8,
          definition: { answer: "分词边界决定数字、代码和复制任务需学习的基本组合路径。", evidence: "为什么对边界敏感" },
          problem: { answer: "它解释位结构、缩进和运算符被不稳定合并时任务为何变难。", evidence: "改变要学习的最短路径" },
          inputOutput: { answer: "输入数字、代码或生成 token，输出片段序列和解码字节流。", evidence: "生成时 token 也是解码单位" },
          mechanism: { answer: "片段内需恢复隐藏结构，逐字符又会增加长度，需以真实任务权衡。", evidence: "同时学习内容和隐藏边界" },
          interpretation: { answer: "边界设计优劣应看复制、计算、代码和长度切片而非像不像词。", evidence: "通过真实任务验证" },
          boundary: { answer: "流式块可能是不完整 UTF-8，停止串也会跨 token 边界。", evidence: "停止串也可能跨 token 边界" },
        },
        {
          section: 9,
          definition: { answer: "Unicode 静默故障源于视觉相同文本具有不同码点或偏移单位。", evidence: "Unicode 和偏移量怎样制造静默故障" },
          problem: { answer: "它防止字符串规则绕过、实体错位和审计证据定位错误。", evidence: "底层序列可能为什么不同" },
          inputOutput: { answer: "输入原文、规范化形式和偏移单位，输出 token 及原文 offset mapping。", evidence: "tokenizer 又输出自己的 offset mapping" },
          mechanism: { answer: "明确规范化并在码点、UTF-16 单元和 UTF-8 字节间正确换算。", evidence: "不同码点组成" },
          interpretation: { answer: "高亮错位但无报错通常提示偏移单位或规范化前后混用。", evidence: "通常不会报错" },
          boundary: { answer: "规范化能减少差异，也可能破坏必须逐字保真的任务。", evidence: "可能改变要求逐字保真的任务" },
        },
        {
          section: 10,
          definition: { answer: "Tokenizer 验收用固定工件、往返、黄金 ID、偏移和流式测试验证协议。", evidence: "怎样做一次可复现的 tokenizer 验收" },
          problem: { answer: "它避免普通英文能往返就误判多语言和模板接口可靠。", evidence: "不代表接口已经可靠" },
          inputOutput: { answer: "输入模型分词工件和边界样本，输出精确 ID、偏移、长度与流式结果。", evidence: "做黄金 ID 测试" },
          mechanism: { answer: "固定哈希后跨实现逐项比对，并随机切块验证解码和停止检测。", evidence: "跨语言实现逐项比对" },
          interpretation: { answer: "任何黄金 ID、offset、模板次数或切块结果变化都应阻断发布。", evidence: "确认 UTF-8 解码和停止串检测结果不变" },
          boundary: { answer: "必须覆盖 emoji、CJK、RTL、代码、随机字节和任务语言分布。", evidence: "emoji、CJK、RTL、代码和随机字节" },
        },
      ],
    },

    "embedding": {
      contractVersion: 2,
      examples: [{
        section: 4,
        evidence: {
          setup: "查询 q=[1,0]",
          rule: "三者长度都为 1",
          steps: "1×0.8 + 0×0.6 = 0.8",
          interpretation: "不同模型的 0.8 没有统一含义",
        },
      }],
      termReviews: [{
        section: 7,
        reviewedAt: "2026-07-26",
        terms: [
          {
            name: "高维",
            meaning: "一个表示由很多个数值坐标共同组成",
            purpose: "用足够多的坐标保存与训练任务有关的差异",
            definitionEvidence: "高维”只表示一个向量有很多坐标",
            purposeEvidence: "768 个数共同描述一段文本",
          },
          {
            name: "降维",
            meaning: "把高维向量有损映射到较少坐标",
            purpose: "帮助人观察可疑簇和离群点，而非证明检索质量",
            definitionEvidence: "把数百维临时映射成二维或三维图",
            purposeEvidence: "适合发现可疑簇和离群点",
          },
        ],
      }],
      formulas: [{
        id: "embedding-cosine-similarity",
        section: 3,
        formulaIndex: 1,
        symbols: [
          { name: "A", meaning: "第一个待比较的嵌入向量", evidence: "A 和 B 是要比较的两个嵌入向量" },
          { name: "B", meaning: "第二个待比较的嵌入向量", evidence: "A 和 B 是要比较的两个嵌入向量" },
          { name: "θ", meaning: "两个嵌入向量之间的夹角", evidence: "θ 是它们之间的夹角" },
          { name: "A·B", meaning: "两个向量的点积", evidence: "A·B 是点积" },
          { name: "‖A‖", meaning: "向量 A 的长度", evidence: "‖A‖ 与 ‖B‖ 是各自的长度" },
          { name: "‖B‖", meaning: "向量 B 的长度", evidence: "‖A‖ 与 ‖B‖ 是各自的长度" },
        ],
      }],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "嵌入是把文本等对象映射为连续数值向量的表示方法。", evidence: "嵌入是一种把文本映射成连续向量的表示方法" },
          problem: { answer: "它让机器能够用数值运算比较原本不能直接计算的语义。", evidence: "机器只会算数字，不会直接比「意思」" },
          inputOutput: { answer: "输入一段文本，输出一个固定维度的连续向量坐标。", evidence: "给每段话在一张「语义地图」上标了个坐标" },
          mechanism: { answer: "训练使任务上相近的文本落到相近的向量位置。", evidence: "让「意思近」体现成「数字近」" },
          interpretation: { answer: "向量靠近表示模型认为两段内容对当前任务较相似。", evidence: "语义相近的文本，向量之间的距离也近" },
          boundary: { answer: "这种接近由训练目标定义，并不是天然完整的语义真值。", evidence: "不是随便变，而要变得" },
        },
        {
          section: 2,
          definition: { answer: "嵌入空间的几何结构是训练目标塑造出的任务相关表示。", evidence: "训练目标逼出来的" },
          problem: { answer: "它解释向量远近为何可能对应内容是否相关。", evidence: "向量的远近，凭什么正好对应意思的远近" },
          inputOutput: { answer: "输入相近与无关的样本对，输出经参数调整后的向量空间。", evidence: "大量「这两句意思相近 / 这两句无关」的样本对" },
          mechanism: { answer: "训练反复拉近相关样本并推开无关样本，形成可比较的几何。", evidence: "使相近的向量靠拢、无关的向量推开" },
          interpretation: { answer: "邻近关系表示训练数据和目标所学到的相似性。", evidence: "把语义关系「学」进去了" },
          boundary: { answer: "距离等于语义只是训练副产品，会继承样本和目标的偏好。", evidence: "「距离 = 语义」都不是设计出来的规则" },
        },
        {
          section: 3,
          definition: { answer: "余弦相似度用两个向量夹角的余弦衡量方向接近程度。", evidence: "余弦相似度用两个向量夹角的余弦值比较方向" },
          problem: { answer: "它把难以直接比较的语义关系转成可排序的数值。", evidence: "语义，第一次变成了能用一个数直接比较的量" },
          inputOutput: { answer: "输入同一模型产生的两个嵌入向量，输出 −1 到 1 的相似度。", evidence: "结果范围是 −1 到 1" },
          mechanism: { answer: "点积除以两向量长度，消除尺度后只比较方向。", evidence: "分母先消除长度影响" },
          interpretation: { answer: "接近 1 表示同向，接近 0 表示近乎垂直，接近 −1 表示反向。", evidence: "越接近 1 越同向" },
          boundary: { answer: "结果不是正确概率，不能跨模型或脱离具体任务解释。", evidence: "不能跨模型比较，也不能脱离真实任务" },
        },
        {
          section: 4,
          definition: { answer: "该例用二维单位向量演示余弦相似度的完整计算与排序。", evidence: "用二维玩具向量代替真实的数百维向量" },
          problem: { answer: "它说明“更同向”怎样转化成候选文档的可复算排名。", evidence: "“更同向”怎样变成一个可复算的排名" },
          inputOutput: { answer: "输入查询向量和两个候选向量，输出各自余弦值与相关顺序。", evidence: "候选“返还商品”" },
          mechanism: { answer: "单位向量的长度分母为一，因此点积直接等于余弦相似度。", evidence: "因为三个向量都是单位长度，分母均为 1" },
          interpretation: { answer: "候选 a 的 0.8 高于候选 b 的 −0.6，因此在该空间更相关。", evidence: "a=[0.8,0.6]" },
          boundary: { answer: "玩具分数只说明模型空间排序，业务阈值仍须真实标签校准。", evidence: "阈值必须在真实查询、难负例与标签上校准" },
        },
        {
          section: 5,
          definition: { answer: "输入嵌入层与独立嵌入模型是名称相同但粒度不同的组件。", evidence: "这是两回事，别混" },
          problem: { answer: "该区分防止在 Transformer 输入表示与 RAG 检索表示间错误选型。", evidence: "把两者混为一谈，选型和实现都会出错" },
          inputOutput: { answer: "前者输入 token 并逐 token 输出向量，后者输入整段文本并输出单个向量。", evidence: "输出谁的向量" },
          mechanism: { answer: "前者是模型第一层，后者是为整段语义比较而独立训练的模型。", evidence: "独立训练的模型" },
          interpretation: { answer: "需要给 Transformer 喂入序列时用前者，需要语义检索时用后者。", evidence: "做 RAG 时你需要的是后者" },
          boundary: { answer: "二者产生的表示用途和粒度不同，不能仅凭“嵌入”一词互换。", evidence: "Transformer 内部的输入嵌入层" },
        },
        {
          section: 6,
          definition: { answer: "语义搜索是按查询与文档嵌入的向量邻近关系召回内容。", evidence: "最典型的用武之地：语义搜索" },
          problem: { answer: "它解决同义表达没有共同关键词时字面搜索漏召回的问题。", evidence: "命中不了只写「商品返还流程」的文档" },
          inputOutput: { answer: "输入查询和文档集合，输出按向量相似度排序的相关文档。", evidence: "查询和每篇文档" },
          mechanism: { answer: "查询与文档使用同一模型编码，再从索引中寻找最近向量。", evidence: "语义搜索换了个思路" },
          interpretation: { answer: "被召回表示模型空间中接近，并不自动保证答案真正相关。", evidence: "检索捞得对不对" },
          boundary: { answer: "RAG 效果还取决于检索质量，嵌入不佳会成为实际瓶颈。", evidence: "RAG 效果的真正瓶颈" },
        },
        {
          section: 7,
          definition: { answer: "实践风险包括模型空间不兼容、否定难例和高维距离失真。", evidence: "实践里的两个坑" },
          problem: { answer: "它防止换模型后混用向量，以及相似度掩盖语义翻转。", evidence: "用 A 建的库、拿 B 的向量去查" },
          inputOutput: { answer: "输入待发布模型与分切片金集，输出召回、排序和错误切片指标。", evidence: "带相关等级的查询—文档小金集" },
          mechanism: { answer: "换模型重建索引，并以难负例、过滤和重排处理否定边界。", evidence: "加入结构化过滤或重排" },
          interpretation: { answer: "平均指标好但否定切片失败，表示困难负例和排序边界仍有缺口。", evidence: "应诊断为困难负例与排序边界问题" },
          boundary: { answer: "二维降维图是有损诊断视图，不能替代原空间的任务指标。", evidence: "不能取代 Recall@k 等任务指标" },
        },
      ],
    },

    "positional-encoding": {
      contractVersion: 2,
      examples: [{
        section: 4,
        evidence: {
          setup: "令 q=k=(1,0)",
          rule: "每前进一位旋转角 θ=60°",
          steps: "cos 60°=0.5",
          interpretation: "相对位移相同，因此这对维度贡献相同",
        },
      }],
      termReviews: [{
        section: 3,
        reviewedAt: "2026-07-26",
        terms: [{
          name: "高维",
          meaning: "向量含有许多坐标维度，而不只二维示意中的两个坐标",
          purpose: "让多组不同旋转频率共同编码不同距离尺度",
          definitionEvidence: "d 是位置向量总维数",
          purposeEvidence: "高维对变化慢，提供长尺度坐标",
        }],
      }],
      formulas: [
        {
          id: "sinusoidal-position-encoding",
          section: 3,
          formulaIndex: 1,
          symbols: [
            { name: "PE", meaning: "加到 token 表示上的位置向量", evidence: "PE 是要加到 token 表示上的位置向量" },
            { name: "pos", meaning: "token 从零开始的位置索引", evidence: "pos 是该 token 从 0 开始的位置索引" },
            { name: "i", meaning: "正弦余弦维度对的组编号", evidence: "i 是第几组正弦—余弦维度" },
            { name: "d", meaning: "位置向量的总维数", evidence: "d 是位置向量总维数" },
          ],
        },
        {
          id: "rope-relative-dot-product",
          section: 4,
          formulaIndex: 1,
          symbols: [
            { name: "q", meaning: "查询位置的内容向量", evidence: "q 是某个位置的查询内容向量" },
            { name: "k", meaning: "键位置的内容向量", evidence: "k 是另一个位置的键内容向量" },
            { name: "m", meaning: "查询的位置索引", evidence: "m 与 n 分别是查询和键的位置索引" },
            { name: "n", meaning: "键的位置索引", evidence: "m 与 n 分别是查询和键的位置索引" },
            { name: "θ", meaning: "每前进一个位置所旋转的角度", evidence: "每前进一位旋转角 θ=60°" },
            { name: "R", meaning: "执行二维旋转的矩阵函数", evidence: "R(α) 表示把二维向量旋转角度 α" },
            { name: "ᵀ", meaning: "矩阵或向量转置操作", evidence: "上标 ᵀ 表示转置" },
          ],
        },
        {
          id: "relative-attention-bias",
          section: 6,
          formulaIndex: 1,
          symbols: [
            { name: "score", meaning: "softmax 前的注意力原始分数", evidence: "score(i,j) 是 softmax 之前的注意力原始分数" },
            { name: "i", meaning: "发起注意的查询位置", evidence: "i 是发起注意的查询位置" },
            { name: "j", meaning: "被查询位置查看的键位置", evidence: "j 是被查看的键位置" },
            { name: "qᵢ", meaning: "位置 i 的查询向量", evidence: "qᵢ 和 kⱼ 是二者的查询、键向量" },
            { name: "kⱼ", meaning: "位置 j 的键向量", evidence: "qᵢ 和 kⱼ 是二者的查询、键向量" },
            { name: "d", meaning: "键向量的维数", evidence: "d 是键向量维数" },
            { name: "b", meaning: "由相对位置差决定的附加偏置函数", evidence: "b(i−j) 是由相对距离决定的附加偏置" },
          ],
        },
      ],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "排列等变指输入重排时逐 token 输出会以相同方式重排。", evidence: "最终输出以同样方式重排" },
          problem: { answer: "本节解释只按内容计算的注意力为何无法区分精确位置。", evidence: "没有额外坐标区分第 1 位和第 7 位" },
          inputOutput: { answer: "输入同步重排的 token，输出对应同步重排的注意力表示。", evidence: "重排输入只是重排 Q/K/V 的行列" },
          mechanism: { answer: "Q、K、V 都只由内容生成，行列置换会贯穿点积与混合计算。", evidence: "自注意力用每个 token 的内容生成 Q、K、V" },
          interpretation: { answer: "输出仍归属于原 token，但模型没有独立坐标辨认顺序和距离。", evidence: "保留“哪个输出属于哪个输入”" },
          boundary: { answer: "因果遮罩提供过去方向，却不足以表达精确距离、周期和顺序模式。", evidence: "仍需要位置机制表达精确距离" },
        },
        {
          section: 2,
          definition: { answer: "位置机制是在表示、注意力分数或查询键几何中注入坐标关系的设计。", evidence: "把坐标关系注入不同计算位置" },
          problem: { answer: "它让注意力在比较内容之外还能使用绝对索引或相对距离。", evidence: "位置可以加到表示、分数或几何变换中" },
          inputOutput: { answer: "输入 token 位置或位置差，输出位置向量、分数偏置或旋转后的 Q/K。", evidence: "旋转 Q/K" },
          mechanism: { answer: "绝对方法加表示，相对方法改 logits，RoPE 按位置旋转查询与键。", evidence: "相对偏置 / ALiBi" },
          interpretation: { answer: "注入位置不同意味着模型接收坐标信号的计算路径不同。", evidence: "位置不是一种固定“编码格式”" },
          boundary: { answer: "函数能算到训练长度外，不代表模型已学会在那里可靠使用信号。", evidence: "模型未必会用" },
        },
        {
          section: 3,
          definition: { answer: "正弦位置编码用多组不同频率的正弦和余弦组成位置向量。", evidence: "多组不同速度的指针共同形成位置签名" },
          problem: { answer: "它减少单一周期重复导致相距很远的位置被混淆。", evidence: "单一频率会周期性重复" },
          inputOutput: { answer: "输入位置索引、维度组和总维数，输出每个坐标的正弦或余弦值。", evidence: "pos 是该 token 从 0 开始的位置索引" },
          mechanism: { answer: "快频区分局部位移，慢频提供长尺度，多频组合延后相位重复。", evidence: "低维对变化快，分辨局部位移" },
          interpretation: { answer: "每组数值可看作不同转速指针，共同构成该位置的签名。", evidence: "每个 sin/cos 对可看作圆上的指针" },
          boundary: { answer: "可线性表达平移并不保证有限模型和数据能学会长度外推。", evidence: "不代表有限层和有限数据必然学到" },
        },
        {
          section: 4,
          definition: { answer: "RoPE 按位置旋转查询和键，使点积包含二者的相对相位。", evidence: "点积怎样只留下位置差" },
          problem: { answer: "它让注意力分数表达相对位移，而不依赖一对位置的共同平移。", evidence: "绝对角度为什么相消" },
          inputOutput: { answer: "输入内容向量 q、k 和位置 m、n，输出旋转后的点积分数。", evidence: "位置 m 的查询" },
          mechanism: { answer: "旋转矩阵相乘时共同绝对角相消，剩下角度差 (n−m)θ。", evidence: "共同经历的绝对旋转会相消" },
          interpretation: { answer: "位置对 (0,1) 与 (2,3) 的差都为一，所以本例贡献相同。", evidence: "绝对位置不同，但相对位移相同" },
          boundary: { answer: "真实模型会把高维向量分组并使用不同频率，二维例只展示单组机制。", evidence: "真实 RoPE 把高维向量两两分组" },
        },
        {
          section: 5,
          definition: { answer: "RoPE 的几何图像是同一内容向量随位置在二维平面上旋转。", evidence: "每对维度是一只指针" },
          problem: { answer: "它直观展示旋转保持长度，同时把位置差写入相对角度。", evidence: "旋转保持向量长度" },
          inputOutput: { answer: "输入内容向量与位置角，输出长度不变但相位改变的 Q/K。", evidence: "同一内容向量 按位置旋转" },
          mechanism: { answer: "不同维度对采用不同转速，使点积同时感知多种距离尺度。", evidence: "不同频率对提供不同距离尺度" },
          interpretation: { answer: "进入注意力分数的是两个位置指针的相对角，而非单独绝对角。", evidence: "相对角 进入 Q·K 分数" },
          boundary: { answer: "旋转维度、基频、配对和数值布局都必须与训练权重完全一致。", evidence: "都必须与训练权重一致" },
        },
        {
          section: 6,
          definition: { answer: "相对位置偏置直接按查询与键的位置差修改注意力原始分数。", evidence: "在分数上直接表达距离" },
          problem: { answer: "它让任务无需绝对位置表也能显式偏好某些相对距离。", evidence: "为什么不直接修改 logits" },
          inputOutput: { answer: "输入内容点积与相对距离，输出加入距离偏置的注意力 score。", evidence: "由相对距离决定的附加偏置" },
          mechanism: { answer: "ALiBi 用不同注意力头的线性斜率惩罚较远历史。", evidence: "各注意力头不同斜率的线性距离惩罚" },
          interpretation: { answer: "更负偏置会在 softmax 后降低对应远距位置的注意权重。", evidence: "让更远历史获得更负偏置" },
          boundary: { answer: "距离越远越不相关是一种归纳偏好，不适合所有序列结构。", evidence: "未必适合所有结构" },
        },
        {
          section: 7,
          definition: { answer: "长上下文缩放把更多位置映射到训练过或较可控的相位范围。", evidence: "位置插值把新位置压缩到训练位置区间" },
          problem: { answer: "它缓解新位置落入完全未见相位，却引入距离分辨率权衡。", evidence: "收益和代价是什么" },
          inputOutput: { answer: "输入扩展位置和缩放规则，输出压缩或重映射后的 RoPE 相位。", evidence: "把位置 64K 映射到训练时 8K 范围" },
          mechanism: { answer: "插值、基频调整或分维缩放减少相位外推幅度。", evidence: "调整基频或按维度分段缩放" },
          interpretation: { answer: "可运行、困惑度稳定、可检索和能推理是逐级更强的证据。", evidence: "“扩展成功”证据" },
          boundary: { answer: "压缩位置会缩小相邻相位差，短距区分和长距覆盖不可兼得。", evidence: "短距离区分与长距离覆盖因此存在权衡" },
        },
        {
          section: 8,
          definition: { answer: "频率混叠指不同长距离位移可能落到相似的周期相位组合。", evidence: "不同位移可能具有相似相位" },
          problem: { answer: "它解释位置公式可计算任意索引时任务质量仍会退化。", evidence: "位置函数能算到任意整数" },
          inputOutput: { answer: "输入超出训练分布的距离，输出由多频相位组合形成的位置关系。", evidence: "多频组合缓解而非消除这个问题" },
          mechanism: { answer: "快频反复绕圈，慢频对近邻不敏感，模型还须学会组合二者。", evidence: "快速频率在长距离上多次绕圈" },
          interpretation: { answer: "所谓支持长度必须说明是能运行、能检索还是能完成推理。", evidence: "把“支持”定义为可运行、可检索还是可推理" },
          boundary: { answer: "有效长度还受训练采样、缩放、缓存实现与任务定义共同约束。", evidence: "不是一个只由公式决定的常数" },
        },
        {
          section: 9,
          definition: { answer: "KV cache 位置一致性要求缓存键值与完整序列 position ID 对齐。", evidence: "KV cache 为什么最容易出现位置静默错位" },
          problem: { answer: "它防止增量推理张量形状正常但旋转位置错位造成质量下降。", evidence: "错误通常保持形状合法" },
          inputOutput: { answer: "输入历史缓存和新 token，输出使用全序列位置旋转后的新 Q/K 与 logits。", evidence: "完整序列中的位置" },
          mechanism: { answer: "新 token 延续全局位置起点，而不能复用当前小批张量局部索引。", evidence: "不是当前小批张量中的局部索引" },
          interpretation: { answer: "全量前向正常而缓存前向偏离，优先怀疑 position ID 与配置。", evidence: "比较“完整序列一次前向”和“逐 token 带 cache 前向”" },
          boundary: { answer: "前缀复用、滑窗、分页缓存、左填充和异长批次最易触发错位。", evidence: "位置起点尤其容易错" },
        },
        {
          section: 10,
          definition: { answer: "位置能力评测是跨长度、证据深度和任务难度的对照实验矩阵。", evidence: "怎样评测模型是真的使用了位置" },
          problem: { answer: "它区分模型仅能容纳长输入与真正检索、排序和利用远处信息。", evidence: "从复制升级到组合" },
          inputOutput: { answer: "输入受控内容及不同填充和证据位置，输出分切片成功率与置信区间。", evidence: "按位置、长度和任务给出成功率与置信区间" },
          mechanism: { answer: "先建短基线，再扫长度深度、打乱顺序、提高组合难度并对齐 cache。", evidence: "先测短长度基线" },
          interpretation: { answer: "顺序对照后答案应相应变化，否则模型可能没有使用位置关系。", evidence: "答案应相应改变" },
          boundary: { answer: "固定单针或只报最大长度会产生假阳性，不能证明长程推理。", evidence: "报告分布而非最大值" },
        },
      ],
    },

    attention: {
      contractVersion: 2,
      examples: [{
        section: 3,
        evidence: {
          setup: "设单个查询 q=[1,0]",
          rule: "键维度 d=2",
          steps: "0.670v₁+0.330v₂",
          interpretation: "输出却不是复制 v₁",
        },
      }],
      formulas: [{
        id: "scaled-dot-product-attention",
        section: 2,
        formulaIndex: 1,
        symbols: [
          { name: "Attention", meaning: "缩放点积注意力的输出函数", evidence: "Attention 表示这整套注意力计算的输出" },
          { name: "Q", meaning: "所有可见 token 的查询向量矩阵", evidence: "Q、K、V 分别是所有可见 token 的查询、键、值向量排成的矩阵" },
          { name: "K", meaning: "所有可见 token 的键向量矩阵", evidence: "Q、K、V 分别是所有可见 token 的查询、键、值向量排成的矩阵" },
          { name: "V", meaning: "所有可见 token 的值向量矩阵", evidence: "Q、K、V 分别是所有可见 token 的查询、键、值向量排成的矩阵" },
          { name: "ᵀ", meaning: "把键矩阵转置以形成两两点积", evidence: "上标 T 表示转置" },
          { name: "d", meaning: "每个键或查询向量的维数", evidence: "d 是每个键/查询向量的维数" },
          { name: "softmax", meaning: "把一排分数归一化为总和为一的非负权重", evidence: "softmax 把每个查询对应的一排分数变为和为 1 的权重" },
        ],
      }],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "注意力是一种为当前 token 动态选择并汇总其他位置的信息机制。", evidence: "让模型自己动态判断" },
          problem: { answer: "它解决相关信息可能很远且相关对象随内容变化的问题。", evidence: "相关的词可能离得很远" },
          inputOutput: { answer: "输入当前词与上下文词的表示，输出融合相关上下文后的新表示。", evidence: "理解一句话里的某个词" },
          mechanism: { answer: "模型根据当前内容计算应关注哪些位置，而不是使用固定连接规则。", evidence: "该看谁是随内容变的" },
          interpretation: { answer: "“她”若汇总“小红”的信息，表示该层认为二者在当前上下文相关。", evidence: "处理「她」，就得联系到「小红」" },
          boundary: { answer: "门控 RNN 可缓解长链遗忘和串行约束，但不能消除其结构限制。", evidence: "门控 RNN 能缓解但不能消除" },
        },
        {
          section: 2,
          definition: { answer: "缩放点积注意力用查询匹配键得到权重，再对值向量加权求和。", evidence: "一套三步的匹配-加权流程" },
          problem: { answer: "它让每个 token 能按当前内容从所有可见位置选择信息。", evidence: "自己决定该看哪些词" },
          inputOutput: { answer: "输入 Q、K、V 矩阵，输出每个查询汇总全部值后的新表示。", evidence: "看完全场后」得到的新表示" },
          mechanism: { answer: "先做 QK 点积和尺度缩放，再 softmax，最后用权重乘 V。", evidence: "把这排匹配度过一个 softmax" },
          interpretation: { answer: "较高权重表示该头该层让相应值对当前信息混合贡献更大。", evidence: "粗细即权重大小" },
          boundary: { answer: "位置机制与掩码也会修改分数，权重不只由裸内容点积决定。", evidence: "会在 softmax 前共同修改分数" },
        },
        {
          section: 3,
          definition: { answer: "数值例子展示点积、缩放、softmax 与值加权的完整结果。", evidence: "手算一次缩放点积注意力" },
          problem: { answer: "它澄清 Key 决定取多少，而 Value 决定实际取什么。", evidence: "Key 决定“取多少”" },
          inputOutput: { answer: "输入一个查询、两个键和两个值，输出二维混合向量。", evidence: "从两组匹配分数到最终输出" },
          mechanism: { answer: "点积分数除以根号二后经 softmax 得到 0.670 与 0.330。", evidence: "exp(s)/Σexp(s)" },
          interpretation: { answer: "第一把键更匹配，故 v₁ 权重更高，但输出仍混入 v₂。", evidence: "第一把键更匹配" },
          boundary: { answer: "单层单头权重只是混合系数，不能作为结论的唯一因果解释。", evidence: "注意力权重不是解释概率" },
        },
        {
          section: 4,
          definition: { answer: "自注意力指 Q、K、V 全部来自同一个输入序列。", evidence: "全部来自同一句话" },
          problem: { answer: "它使句子内部每个位置能查看并更新自身份的上下文表示。", evidence: "句子内部互相看" },
          inputOutput: { answer: "输入单个序列，输出该序列每个位置融合句内信息后的表示。", evidence: "每个词都在看这句话里的所有词" },
          mechanism: { answer: "序列中每个位置同时充当查询来源以及供其他位置读取的键和值。", evidence: "句子里的每个词都在看这句话里的所有词" },
          interpretation: { answer: "“她”在同句找到“小红”是自注意力，而不是跨序列读取。", evidence: "「她」在同一句里找到「小红」" },
          boundary: { answer: "若 Q 来自一个序列而 K/V 来自另一个序列，则是交叉注意力。", evidence: "还有一种「跨着看」" },
        },
        {
          section: 5,
          definition: { answer: "全局注意力让任意两个可见位置在单层内直接交互并可并行计算。", evidence: "路径长度都是 1，且同时算" },
          problem: { answer: "它改善经典 RNN 的远距长传递链和时间步串行训练瓶颈。", evidence: "改善了两个关键瓶颈" },
          inputOutput: { answer: "输入整段序列表示，输出所有位置同时完成上下文混合的表示。", evidence: "同时输出每个位置融合可见上下文后的新表示" },
          mechanism: { answer: "所有位置对并行计算匹配，使远处信息无需逐时间步传递。", evidence: "任意两位置在一层内直接交互" },
          interpretation: { answer: "短路径有利于远距依赖且并行利于扩大模型，但不保证关注正确。", evidence: "不保证模型一定会把权重放在正确位置" },
          boundary: { answer: "直接连接仍经过投影、softmax 与后续层，不能理解为信息无衰减。", evidence: "并非“没有衰减”" },
        },
        {
          section: 6,
          definition: { answer: "多头注意力是在同层并行运行多组独立 Q/K/V 投影与混合。", evidence: "并行运行多组投影" },
          problem: { answer: "它为语法、指代、位置等不同关系提供多个表示子空间和路由机会。", evidence: "词与词的关系有很多种" },
          inputOutput: { answer: "输入同一层表示，输出各头结果拼接并投影后的联合表示。", evidence: "最后拼接并投影" },
          mechanism: { answer: "每个头在自己的 Q/K/V 子空间形成一组注意力分布和信息混合。", evidence: "每组有自己的 Q/K/V 子空间" },
          interpretation: { answer: "观察到某头呈现指代模式是经验现象，不是预先指定职责。", evidence: "没人预先指定某个头“专管指代”" },
          boundary: { answer: "不同头可能冗余，不能假定每个头都有稳定清晰且唯一的功能。", evidence: "也有许多头相互冗余" },
        },
        {
          section: 7,
          definition: { answer: "标准全局自注意力的分数矩阵包含序列长度平方个位置对。", evidence: "注意力分数矩阵有 n² 个元素" },
          problem: { answer: "它解释长上下文计算、显存与延迟为何快速增长。", evidence: "长上下文推理又慢又贵的原因" },
          inputOutput: { answer: "输入 n 个 token，输出 n×n 匹配分数及对应上下文混合。", evidence: "n 是序列的 token 数" },
          mechanism: { answer: "每个位置与所有位置匹配，导致计算和朴素显存随 n² 增长。", evidence: "每个位置都要和所有位置算一次匹配" },
          interpretation: { answer: "加速后若远距准确率下降，应先排查可见范围和掩码。", evidence: "先诊断可见范围与 mask" },
          boundary: { answer: "FlashAttention 降低搬运与显存常数但不改变全局注意力平方计算量级。", evidence: "不降复杂度，但大幅减少显存搬运" },
        },
      ],
    },

    normalization: {
      contractVersion: 2,
      examples: [{
        section: 3,
        evidence: {
          setup: "先忽略 ε，并令 γ=1、β=0",
          rule: "(1²+0²+1²)/3",
          steps: "[−1,0,1]/0.816",
          interpretation: "结果均值为 0、均方约为 1",
        },
      }],
      formulas: [
        {
          id: "layernorm-definition",
          section: 2,
          formulaIndex: 1,
          symbols: [
            { name: "μ", meaning: "当前 token 隐藏向量所有坐标的均值", evidence: "μ 是均值" },
            { name: "d", meaning: "隐藏向量的坐标总数", evidence: "d 是坐标总数" },
            { name: "Σ", meaning: "对全部隐藏坐标求和", evidence: "Σ 表示把全部坐标相加" },
            { name: "xᵢ", meaning: "当前隐藏向量的第 i 个坐标", evidence: "xᵢ 是它第 i 个坐标" },
            { name: "σ²", meaning: "当前隐藏向量各坐标的总体方差", evidence: "σ² 是方差" },
            { name: "LN", meaning: "LayerNorm 确定性变换及其输出", evidence: "LN(x)ᵢ 是该维最终输出" },
            { name: "γᵢ", meaning: "第 i 隐藏维的可学习缩放参数", evidence: "γᵢ 与 βᵢ 是第 i 维可学习的缩放与偏移" },
            { name: "βᵢ", meaning: "第 i 隐藏维的可学习偏移参数", evidence: "γᵢ 与 βᵢ 是第 i 维可学习的缩放与偏移" },
            { name: "ε", meaning: "防止小方差除法失控的小正数", evidence: "ε 是防止方差过小时除法失控的小正数" },
          ],
        },
        {
          id: "rmsnorm-definition",
          section: 4,
          formulaIndex: 1,
          symbols: [
            { name: "RMS", meaning: "当前向量的均方根尺度", evidence: "RMS(x) 是向量 x 的均方根尺度" },
            { name: "RMSNorm", meaning: "按均方根缩放但不减均值的归一化输出", evidence: "RMSNorm(x)ᵢ 是该维输出" },
            { name: "xᵢ", meaning: "输入向量的第 i 个坐标", evidence: "xᵢ 是第 i 个坐标" },
            { name: "d", meaning: "输入向量的坐标数量", evidence: "d 是坐标数" },
            { name: "Σ", meaning: "对所有坐标平方求和", evidence: "Σ 把各坐标平方相加" },
            { name: "ε", meaning: "保证除法数值稳定的小正数", evidence: "ε 负责数值稳定" },
            { name: "γᵢ", meaning: "第 i 个坐标的可学习缩放", evidence: "γᵢ 是第 i 维可学习缩放" },
          ],
        },
      ],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "归一化是在指定轴上重参数化表示并控制数值尺度的变换。", evidence: "归一化把输入映射到更受控的尺度" },
          problem: { answer: "它缓解激活尺度漂移导致饱和、溢出、舍入和优化条件恶化。", evidence: "数值大小”会影响优化" },
          inputOutput: { answer: "输入一层激活向量，输出尺度受控且可再学习幅度与偏移的表示。", evidence: "恢复任务需要的幅度和偏移" },
          mechanism: { answer: "先按规定轴统计尺度，再标准化，并通过 γ、β 恢复表达自由度。", evidence: "再用可学习 γ" },
          interpretation: { answer: "较稳定尺度表示固定学习率面对的方向差异更可控，而非分布必为正态。", evidence: "有的方向很陡、有的方向很平" },
          boundary: { answer: "归一化只是条件改善，不能保证每层输出服从标准正态或训练必然稳定。", evidence: "不是保证每层输出永远服从标准正态分布" },
        },
        {
          section: 2,
          definition: { answer: "LayerNorm 对单个 token 的隐藏维先减均值再除以标准差。", evidence: "先中心化，再按标准差缩放" },
          problem: { answer: "它控制每个 token 内各隐藏坐标的共同偏移和尺度。", evidence: "一个 token 的 d 维向量" },
          inputOutput: { answer: "输入一个 d 维隐藏向量，输出逐维归一化并仿射变换后的向量。", evidence: "当前 token 的全部隐藏维" },
          mechanism: { answer: "计算总体均值方差，以根号方差加 ε 缩放，再应用逐维 γ、β。", evidence: "在定义一个确定性变换" },
          interpretation: { answer: "每行独立统计意味着其他 token 或 batch 不参与当前结果。", evidence: "不混合别的 token 或 batch" },
          boundary: { answer: "误用 sequence 轴时形状仍可能合法，但算法语义已经改变。", evidence: "张量形状可能仍合法" },
        },
        {
          section: 3,
          definition: { answer: "该手算例将向量 [1,2,3] 中心化并按总体标准差缩放。", evidence: "向量 [1,2,3] 变成什么" },
          problem: { answer: "它展示 LayerNorm 每一步数值及为何方差使用分母三。", evidence: "手算 LayerNorm：向量 [1,2,3] 变成什么" },
          inputOutput: { answer: "输入 [1,2,3] 与 γ=1、β=0，输出约 [−1.225,0,1.225]。", evidence: "[−1.225,0,1.225]" },
          mechanism: { answer: "先求均值二与离均差，再求方差三分之二并除以 0.816。", evidence: "(1²+0²+1²)/3" },
          interpretation: { answer: "结果均值为零且均方约一，正缩放和平移被标准化消去。", evidence: "若所有输入都加 10" },
          boundary: { answer: "本例忽略 ε 且固定仿射参数，真实层仍会学习逐维尺度和偏移。", evidence: "仿射参数随后可以" },
        },
        {
          section: 4,
          definition: { answer: "RMSNorm 不减均值，只用向量均方根控制整体尺度。", evidence: "保留均值，只控制均方根" },
          problem: { answer: "它用更简化的统计保留共同平移信息并获得尺度不敏感性。", evidence: "不减均值，能省掉什么" },
          inputOutput: { answer: "输入隐藏向量，输出各坐标除以整体 RMS 后再乘逐维 γ 的向量。", evidence: "直接用 xᵢ 除以整体均方根" },
          mechanism: { answer: "将所有坐标平方求平均、加 ε、开根，再作为共同分母。", evidence: "Σ 把各坐标平方相加" },
          interpretation: { answer: "示例输出均方为一但均值非零，说明它与 LayerNorm 保留信息不同。", evidence: "均值不为 0" },
          boundary: { answer: "RMSNorm 对正比例缩放近似不敏感，却会响应所有维度共同平移。", evidence: "会改变方向和输出" },
        },
        {
          section: 5,
          definition: { answer: "Norm 类型首先由统计轴和样本依赖关系决定，而不只由名称决定。", evidence: "统计轴决定它是 LayerNorm 还是另一种算法" },
          problem: { answer: "它防止把 BatchNorm、LayerNorm、RMSNorm 与 GroupNorm 混为一谈。", evidence: "依赖关系却完全不同" },
          inputOutput: { answer: "输入具有 batch、序列、隐藏或空间轴的张量，输出按指定轴统计的结果。", evidence: "训练批统计；推理常用移动统计" },
          mechanism: { answer: "BatchNorm 跨批和空间统计，LayerNorm/RMSNorm 仅按当前 token 隐藏维。", evidence: "单 token 的隐藏维" },
          interpretation: { answer: "LayerNorm 适合小批和变长序列是因其不依赖同批其他样本。", evidence: "单 token 统计不随同批其他样本改变" },
          boundary: { answer: "normalized_shape 必须符合模型定义，不能总是假定只用最后一维。", evidence: "不能凭最后一维习惯猜测" },
        },
        {
          section: 6,
          definition: { answer: "归一化不变性描述整体缩放或共同平移后输出是否保持不变。", evidence: "归一化保留什么，又抹掉什么" },
          problem: { answer: "它揭示稳定尺度的同时可能删除任务所需绝对幅度信息。", evidence: "也可能删除任务需要的信号" },
          inputOutput: { answer: "输入原向量及整体缩放平移版本，输出各归一化方法的变化关系。", evidence: "整体缩放与各维共同平移被消除" },
          mechanism: { answer: "LayerNorm 减均值再缩放，RMSNorm 只除尺度，因此平移响应不同。", evidence: "但不对共同平移不变" },
          interpretation: { answer: "二者保留维度相对模式，却会弱化或消除整体幅度和均值。", evidence: "保留维度之间的相对模式" },
          boundary: { answer: "γ/β 无法恢复被当前样本统计完全消去的均值或尺度，需旁路保留。", evidence: "必须确认架构中还有旁路保留它" },
        },
        {
          section: 7,
          definition: { answer: "Pre-Norm 在子层前归一化，Post-Norm 在残差相加后归一化。", evidence: "Pre-Norm 与 Post-Norm" },
          problem: { answer: "它解释仅移动 Norm 为何会改变深层网络的梯度传递难度。", evidence: "改变的是残差梯度路径" },
          inputOutput: { answer: "输入残差 x 与子层 F，输出 x+F(Norm(x)) 或 Norm(x+F(x))。", evidence: "Pre-Norm: x + F(Norm(x))" },
          mechanism: { answer: "Pre-Norm 保留更直接恒等主干，Post-Norm 梯度每层还穿过 Norm 雅可比。", evidence: "更直接的恒等路径" },
          interpretation: { answer: "Pre-Norm 通常更易优化且对预热初始化较不敏感，但不是绝对更优。", evidence: "减少对学习率预热和初始化的敏感" },
          boundary: { answer: "残差位置改变模型函数和权重含义，训练好的两类模型不能无损互换。", evidence: "不能把一个已训练 Post-Norm 模型无损改成 Pre-Norm" },
        },
        {
          section: 8,
          definition: { answer: "ε 是加入方差或均方根分母的小正数，用于限制小方差增益。", evidence: "ε 不是装饰" },
          problem: { answer: "它防止几乎常量向量中的舍入噪声被极小分母巨幅放大。", evidence: "微小舍入噪声会被放大约一百万倍" },
          inputOutput: { answer: "输入小方差与 ε，输出受控的有效分母和最大放大倍数。", evidence: "分母约 0.00316" },
          mechanism: { answer: "将 ε 放入根号内提升分母下限，但具体公式位置也会改变结果。", evidence: "二者在小方差区不同" },
          interpretation: { answer: "ε 增大通常更稳定，却更偏离严格单位方差目标。", evidence: "ε 越大越稳" },
          boundary: { answer: "迁移权重和融合算子必须同时匹配公式位置、ε 与累加精度。", evidence: "不是只匹配层名" },
        },
        {
          section: 9,
          definition: { answer: "混合精度归一化常用 FP32 统计，再把结果转回模型低精度。", evidence: "统计量常要升到 FP32" },
          problem: { answer: "它降低平方溢出、求和舍入和小差异丢失造成的系统误差。", evidence: "直接平方和求和有什么风险" },
          inputOutput: { answer: "输入 FP16/BF16 激活，输出高精度均值方差或 RMS 及低精度表示。", evidence: "再转换回模型精度" },
          mechanism: { answer: "高精度完成均值、方差/RMS 和倒数平方根，避免低精度统计失真。", evidence: "以更高精度计算均值" },
          interpretation: { answer: "没有 NaN 只说明数值有限，不能证明轴、精度和广播符合模型。", evidence: "“没有 NaN”不代表实现正确" },
          boundary: { answer: "融合实现还须逐层比较前向与梯度，不能只检查能否生成文本。", evidence: "而不只跑通生成" },
        },
        {
          section: 10,
          definition: { answer: "Norm 故障诊断沿数据、层输入、归一化、子层、残差与损失逐段测量。", evidence: "沿数据→层输入→Norm 输出→子层输出→残差和→损失逐段测量" },
          problem: { answer: "它定位已有 Norm 时仍出现 loss spike 或后端质量下降的真实链路。", evidence: "为何仍可能出现 loss spike" },
          inputOutput: { answer: "输入异常训练批或推理后端，输出各阶段 RMS、logits、梯度和误差。", evidence: "每头 logits 最大值与全遮罩行" },
          mechanism: { answer: "依据异常发生在 Norm 前后、注意力或残差处逐层缩小原因范围。", evidence: "Norm 只约束它所在位置的表示" },
          interpretation: { answer: "输出正常而注意力 NaN 时应检查 QK、mask 与 softmax，而非只调 Norm。", evidence: "QK logits、掩码或 softmax 溢出" },
          boundary: { answer: "学习率、初始化、损失尺度和残差累积仍可越过归一化保护。", evidence: "学习率、初始化、损失尺度、残差累积和注意力 softmax 仍可能失控" },
        },
        {
          section: 11,
          definition: { answer: "归一化验收用手算、不变性、退化输入与跨精度前后向对齐验证实现。", evidence: "怎样验收一个归一化实现" },
          problem: { answer: "它捕捉形状合法但轴、ε、广播或累加精度错误的静默故障。", evidence: "检查仿射广播" },
          inputOutput: { answer: "输入小向量、极端数值和多种张量形状，输出参考与实现误差。", evidence: "全相同、极小方差、极大值和零向量" },
          mechanism: { answer: "先核对手算与不变性，再比较不同精度输出梯度和端到端指标。", evidence: "比参考前后向" },
          interpretation: { answer: "改变其他 batch 样本若影响 LayerNorm 输出，说明统计轴实现错误。", evidence: "LayerNorm 输出不应变化" },
          boundary: { answer: "融合和量化后端还须检查逐层误差与最终指标，单点样例不足。", evidence: "融合算子、量化后端与原实现" },
        },
      ],
    },

    transformer: {
      contractVersion: 2,
      examples: [{
        section: 3,
        evidence: {
          setup: "输入 x=[1,2]",
          rule: "本例是 x+Sublayer(Norm(x))",
          steps: "y=r+F(Norm(r))",
          interpretation: "两次相加都保留了进入子层前的主干",
        },
      }],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "Transformer 是把注意力、前馈、残差和归一化封装为可重复堆叠层的架构。", evidence: "Transformer 是什么" },
          problem: { answer: "它把单次跨位置传信息机制组织成能逐层加工表示的深层模型骨架。", evidence: "注意力只解决了一件事" },
          inputOutput: { answer: "输入一串 token 表示，输出经标准层逐层加工后的同长度表示序列。", evidence: "信息一层层被加工" },
          mechanism: { answer: "每层组合跨位置混合与逐位置变换，再通过残差和归一化稳定优化。", evidence: "注意力连同前馈、残差和归一化" },
          interpretation: { answer: "注意力像信息路由引擎，Transformer 是可批量拼装的完整模块。", evidence: "注意力是「引擎」" },
          boundary: { answer: "可重复堆叠不等于无限，层数仍受优化、内存、通信和延迟限制。", evidence: "并不是字面上的无限" },
        },
        {
          section: 2,
          definition: { answer: "标准 Transformer 层通常包含注意力、前馈、残差与归一化四类功能。", evidence: "最常见的四类功能" },
          problem: { answer: "它同时解决跨位置通信、逐位置加工和深层优化条件问题。", evidence: "两个主角、两个配件" },
          inputOutput: { answer: "输入一串向量，输出经注意力和前馈处理后供下一层使用的向量序列。", evidence: "输出 → 作为下一层的输入" },
          mechanism: { answer: "注意力先混合上下文，前馈再逐位置变换，两者由残差和 Norm 包围。", evidence: "先多头注意力、后前馈网络" },
          interpretation: { answer: "注意力负责位置间传递，前馈负责位置内加工，脚手架负责可训练性。", evidence: "一个负责跨位置传信息，一个负责逐位置加工" },
          boundary: { answer: "四类功能是概念地图，具体实现可用 RMSNorm、门控和不同 Norm 位置。", evidence: "不是所有实现逐字相同的配方" },
        },
        {
          section: 3,
          definition: { answer: "该例手算一个 Pre-Norm 块中注意力与前馈两条残差更新。", evidence: "手算一次 Pre-Norm Transformer 块" },
          problem: { answer: "它展示各子层怎样先后修改同一 token 又保留残差主干。", evidence: "怎样先后改变同一个 token 的表示" },
          inputOutput: { answer: "输入二维 x、注意力结果 A 和前馈结果，输出 y=[1.7,2.3]。", evidence: "[1.7,2.3]" },
          mechanism: { answer: "先归一化并加入注意力，再归一化中间 r 并加入前馈输出。", evidence: "注意力先把其他位置的信息写入当前 token" },
          interpretation: { answer: "两次残差相加保留子层前表示，同时把跨位置与逐位置信息写入。", evidence: "前馈网络再对当前位置独立加工" },
          boundary: { answer: "二维结果是假设值，只演示结构；Pre-Norm 和 Post-Norm 权重不可互换。", evidence: "用二维玩具向量演示结构，不代表真实权重" },
        },
        {
          section: 4,
          definition: { answer: "残差提供直接梯度路径，归一化控制各层激活尺度。", evidence: "深层训练的关键配件" },
          problem: { answer: "它缓解深层导数连乘导致梯度过小或过大以及尺度漂移。", evidence: "可能快速变小或变大" },
          inputOutput: { answer: "输入子层变换与残差主干，输出相加且尺度受控的深层表示。", evidence: "让输入原样绕过本层相加" },
          mechanism: { answer: "残差绕开部分连乘，Norm 将表示拉回可控范围，两者改善不同链路。", evidence: "分别改善这两类条件" },
          interpretation: { answer: "能堆深来自梯度路径和数值尺度共同受控，而非只靠注意力。", evidence: "防止越传越大或越传越小" },
          boundary: { answer: "具体机制可替换，但移除或换位会改变优化条件并要求重新调配方。", evidence: "不是某个名称永远不可替换" },
        },
        {
          section: 5,
          definition: { answer: "位置表示是额外注入 token 索引、距离或相位的顺序信号。", evidence: "一个容易忽略的点：位置编码" },
          problem: { answer: "它解决无位置自注意力无法区分同一 token 集合不同排列的问题。", evidence: "机制本身无法区分先后" },
          inputOutput: { answer: "输入 token 表示及其位置，输出同时含内容与顺序信息的表示或分数。", evidence: "位置机制接收每个 token 的位置索引或相对距离" },
          mechanism: { answer: "无位置注意力对排列等变，绝对、相对或旋转位置机制打破该歧义。", evidence: "把 token 顺序打乱，输出也只会按同样顺序重排" },
          interpretation: { answer: "位置编码让模型区分主客体顺序，而不仅识别有哪些词。", evidence: "相同词集合的不同排列可以产生不同关系表示" },
          boundary: { answer: "位置函数设计还影响训练长度之外的外推，能编码不等于会利用。", evidence: "直接影响模型能否外推" },
        },
        {
          section: 6,
          definition: { answer: "编码器、解码器及二者组合是 Transformer 的三种主要连接骨架。", evidence: "三种搭法：编码器与解码器" },
          problem: { answer: "它们通过不同可见范围适配理解、生成和输入输出转换任务。", evidence: "怎么搭出不同用途的模型" },
          inputOutput: { answer: "编码器输入全文输出双向表示，解码器输入前缀输出后续 token 分布。", evidence: "解码器接收已生成前缀并输出下一个 token 的概率分布" },
          mechanism: { answer: "编码器看左右全文，解码器用因果掩码只看左侧历史。", evidence: "差别主要在「能看到哪些词」" },
          interpretation: { answer: "BERT 类适合理解，GPT 类适合生成，T5 类适合显式序列转换。", evidence: "编码器 + 解码器" },
          boundary: { answer: "这是典型用途而非绝对限制，实际模型还可混合可见性和交叉注意力。", evidence: "不是能力的绝对边界" },
        },
        {
          section: 7,
          definition: { answer: "模态无关指架构只要求输入可表示为向量 token 序列。", evidence: "能不能变成一串向量（token）" },
          problem: { answer: "它让图像、音频、视频和蛋白质复用同类序列建模模块。", evidence: "为什么它不止用于文本" },
          inputOutput: { answer: "输入各模态切分并投影后的 token，输出经注意力融合的序列表示。", evidence: "把一张图切成一个个小方块" },
          mechanism: { answer: "模态专用前端先把对象变向量序列，再由 Transformer 建模位置关系。", evidence: "每块当作一个「词」" },
          interpretation: { answer: "共享模块使跨模态注意力可行，但不代表所有参数必须统一。", evidence: "建立跨模态注意力" },
          boundary: { answer: "系统也可组合专用编码器和投影器，统一架构不等于统一参数。", evidence: "不等于所有模态必须由同一组参数完成" },
        },
        {
          section: 8,
          definition: { answer: "Transformer 的可扩展性来自训练矩阵化并行与深层标准模块堆叠。", evidence: "为什么它改变了一切" },
          problem: { answer: "它缓解经典 RNN 时间步依赖，使大规模硬件并行训练更可行。", evidence: "相较经典 RNN 的时间步依赖" },
          inputOutput: { answer: "输入序列批次，输出由大规模矩阵运算并行得到的各位置表示。", evidence: "训练时的序列位置计算变成大规模矩阵运算" },
          mechanism: { answer: "数据、张量和流水线并行共同提高 GPU/TPU 利用率。", evidence: "更容易做数据、张量和流水线并行" },
          interpretation: { answer: "它打通规模化的重要道路，但能力增长还依赖数据、目标和优化。", evidence: "不能归功于单一模块" },
          boundary: { answer: "注意力长度成本、通信、显存和自回归解码仍是硬约束。", evidence: "仍构成硬约束" },
        },
      ],
    },

    "state-space-models": {
      contractVersion: 2,
      examples: [{
        section: 2,
        evidence: {
          setup: "输入 x=[1,0,2] 和初始状态 h₀=0",
          rule: "Ā=0.8、B̄=1",
          steps: "0.8×0.8+2",
          interpretation: "同时含有过去的衰减记忆和当前输入",
        },
      }],
      formulas: [
        {
          id: "ssm-continuous-dynamics",
          section: 1,
          formulaIndex: 1,
          symbols: [
            { name: "t", meaning: "连续时间变量", evidence: "t 是连续时间" },
            { name: "x", meaning: "当前时刻输入", evidence: "x(t) 是当前输入" },
            { name: "h", meaning: "概括此前历史的有限维状态", evidence: "h(t) 是概括此前历史的有限维状态" },
            { name: "ḣ", meaning: "状态关于连续时间的变化率", evidence: "ḣ(t) 是状态随时间的变化率" },
            { name: "y", meaning: "当前时刻模型输出", evidence: "y(t) 是当前输出" },
            { name: "A", meaning: "控制状态自身连续演化的矩阵", evidence: "A 决定状态自身怎样演化" },
            { name: "B", meaning: "把当前输入写入状态的矩阵", evidence: "B 把输入写入状态" },
            { name: "C", meaning: "从内部状态读出输出的矩阵", evidence: "C 从状态读出输出" },
            { name: "D", meaning: "把输入直接送至输出的直通矩阵", evidence: "D 提供输入到输出的直通路径" },
          ],
        },
        {
          id: "ssm-discrete-recurrence",
          section: 2,
          formulaIndex: 1,
          symbols: [
            { name: "hₖ", meaning: "第 k 步更新后的状态", evidence: "hₖ₋₁ 与 hₖ 是更新前后的状态" },
            { name: "hₖ₋₁", meaning: "第 k 步更新前的历史状态", evidence: "hₖ₋₁ 与 hₖ 是更新前后的状态" },
            { name: "xₖ", meaning: "第 k 个离散时间步的输入", evidence: "xₖ 是第 k 步输入" },
            { name: "Ā", meaning: "连续状态矩阵离散化后的一步转移矩阵", evidence: "连续矩阵离散化后的 Ā 与 B̄" },
            { name: "B̄", meaning: "连续输入矩阵离散化后的写入矩阵", evidence: "连续矩阵离散化后的 Ā 与 B̄" },
            { name: "e", meaning: "用于定义矩阵指数的自然指数函数", evidence: "符号 e 表示自然指数函数" },
            { name: "Δ", meaning: "连续信号的采样步长", evidence: "Δ 是采样步长" },
            { name: "A", meaning: "连续时间状态演化矩阵", evidence: "把连续演化 A 换算为一步状态转移" },
          ],
        },
        {
          id: "ssm-convolution-kernel",
          section: 3,
          formulaIndex: 1,
          symbols: [
            { name: "yₖ", meaning: "第 k 个离散时间步的输出", evidence: "yₖ 是第 k 步输出" },
            { name: "Σ", meaning: "把不同回看距离的输入贡献相加", evidence: "Σ 把从当前到最早位置的贡献相加" },
            { name: "i", meaning: "相对当前输出向过去回看的距离", evidence: "i 是回看距离" },
            { name: "k", meaning: "当前输出的离散时间步索引", evidence: "第 k 步输出" },
            { name: "C", meaning: "从状态中读出输出的矩阵", evidence: "矩阵 C 负责从状态读出输出" },
            { name: "Ā", meaning: "离散的一步状态转移矩阵", evidence: "Āⁱ 表示状态转移重复 i 次" },
            { name: "B̄", meaning: "离散输入写入矩阵", evidence: "矩阵 B̄ 负责把历史输入写入状态" },
            { name: "xₖ₋ᵢ", meaning: "距离当前输出 i 步的历史输入", evidence: "xₖ₋ᵢ 是 i 步前的输入" },
            { name: "Kᵢ", meaning: "长卷积核在回看距离 i 的系数", evidence: "Kᵢ=CĀⁱB̄ 就是距离 i 对应的卷积核系数" },
          ],
        },
        {
          id: "selective-ssm-update",
          section: 4,
          formulaIndex: 1,
          symbols: [
            { name: "xₜ", meaning: "当前位置的输入向量", evidence: "xₜ 是当前输入" },
            { name: "fθ", meaning: "由参数 θ 控制的可学习选择函数", evidence: "fθ 是参数为 θ 的小型可学习函数" },
            { name: "Δₜ", meaning: "由当前输入决定的当前位置步长", evidence: "当前位置的步长 Δₜ" },
            { name: "Bₜ", meaning: "由当前输入决定的连续写入参数", evidence: "写入参数 Bₜ" },
            { name: "Cₜ", meaning: "由当前输入决定的连续读出参数", evidence: "读出参数 Cₜ" },
            { name: "hₜ", meaning: "当前位置更新后的有限维状态", evidence: "hₜ₋₁ 与 hₜ 是更新前后状态" },
            { name: "hₜ₋₁", meaning: "当前位置更新前的历史状态", evidence: "hₜ₋₁ 与 hₜ 是更新前后状态" },
            { name: "Ā", meaning: "依赖当前步长的离散状态转移", evidence: "Ā(Δₜ) 是由当前步长得到的离散状态转移" },
            { name: "B̄ₜ", meaning: "当前位置对应的离散输入写入参数", evidence: "B̄ₜ 是对应离散写入参数" },
          ],
        },
      ],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "状态空间模型用有限维状态随输入连续演化来概括历史。", evidence: "输入驱动的动态系统" },
          problem: { answer: "它把任意长历史压缩成可递推更新的固定大小内部状态。", evidence: "一段历史怎样被压成有限维状态" },
          inputOutput: { answer: "输入连续时间信号 x(t)，输出状态 h(t) 和读出 y(t)。", evidence: "x(t) 是当前输入" },
          mechanism: { answer: "A 演化旧状态，B 写入输入，C 读出状态，D 提供直通输出。", evidence: "矩阵描述物理动态" },
          interpretation: { answer: "状态保存的是训练任务认为有用的历史摘要，而不是原输入副本。", evidence: "用于保存对任务有用的历史" },
          boundary: { answer: "有限维状态意味着信息被压缩，能保存多少取决于容量与动力学。", evidence: "概括此前历史的有限维状态" },
        },
        {
          section: 2,
          definition: { answer: "离散化把连续动力学按采样步长转换成逐 token 状态递推。", evidence: "手算离散化后的序列递推" },
          problem: { answer: "它让连续时间方程能处理离散序列且保持正确时间尺度。", evidence: "采样间隔改变时" },
          inputOutput: { answer: "输入旧状态、当前输入和采样步长，输出新状态及离散转移参数。", evidence: "更新前后的状态" },
          mechanism: { answer: "矩阵指数和离散化规则将 A、B 与 Δ 组合为 Ā、B̄。", evidence: "零阶保持等离散化方法会同时计算 Ā、B̄" },
          interpretation: { answer: "温度例第三步的 2.64 是衰减后旧状态 0.64 加当前异常 2。", evidence: "衰减为 0.64，再加当前输入 2" },
          boundary: { answer: "采样频率变化却不重算参数会改变模型时间尺度，递推也可能爆炸。", evidence: "若采样频率改变而不重算" },
        },
        {
          section: 3,
          definition: { answer: "线性时不变 SSM 的递推可展开成由动力学生成核的一维长卷积。", evidence: "同一线性 SSM 也可以看成一维卷积" },
          problem: { answer: "该等价视角让训练整段序列时可避免逐步串行递归。", evidence: "递归难并行，训练时如何一次处理整段" },
          inputOutput: { answer: "输入整段 x 与卷积核 K，输出所有时间步 y；流式时则维护状态 h。", evidence: "训练时可构造卷积核" },
          mechanism: { answer: "反复代入递推得到 Kᵢ=CĀⁱB̄，再汇总每个历史输入的贡献。", evidence: "反复代入可得" },
          interpretation: { answer: "递推适合 O(1) 增量状态更新，卷积或扫描适合训练吞吐。", evidence: "取决于训练吞吐还是流式延迟" },
          boundary: { answer: "固定卷积等价只适用于线性时不变参数，选择性会破坏其简单形式。", evidence: "同一线性系统的两种计算顺序" },
        },
        {
          section: 4,
          definition: { answer: "选择性 SSM 让步长、写入或读出参数依赖当前输入内容。", evidence: "按内容决定写入与遗忘" },
          problem: { answer: "它解决固定记忆规则难以只保留特定内容 token 的问题。", evidence: "只记住红色 token" },
          inputOutput: { answer: "输入当前 xₜ 与旧 hₜ₋₁，输出内容相关参数和新状态 hₜ。", evidence: "它输出当前位置的步长" },
          mechanism: { answer: "小型函数 fθ 由 xₜ 生成选择参数，再据此离散并更新状态。", evidence: "使相同距离的输入能被不同程度保留" },
          interpretation: { answer: "不同 token 可具有不同保留强度，表示模型按内容改变记忆时间尺度。", evidence: "内容选择力增强" },
          boundary: { answer: "输入依赖破坏固定卷积核，且有限状态容量并未因此消失。", evidence: "仍把历史压进有限状态" },
        },
        {
          section: 5,
          definition: { answer: "脉冲响应展示单次输入对未来状态随距离指数衰减的曲线。", evidence: "遗忘门改变脉冲的有效记忆长度" },
          problem: { answer: "它把抽象状态保留率转为早期事件还能影响多久的直观量。", evidence: "会让早期事件留下多久" },
          inputOutput: { answer: "输入单位脉冲与保留率 Ā，输出各距离 d 的残留贡献 Āᵈ。", evidence: "状态贡献 Āᵈ" },
          mechanism: { answer: "每过一步再乘一次保留率，故 0.5 比 0.9 衰减得更快。", evidence: "早期输入贡献按 Āᵈ 衰减" },
          interpretation: { answer: "距离十时 0.5 仅剩 0.001，而 0.9 仍有 0.349。", evidence: "保留率 0.9 仍保留 0.349" },
          boundary: { answer: "固定衰减只是线性示例，选择性会让不同输入采用不同时间尺度。", evidence: "不同输入拥有不同时间尺度" },
        },
        {
          section: 6,
          definition: { answer: "线性复杂度表示序列计算随长度 n 近似按一次方增长。", evidence: "线性复杂度不等于实际必然更快" },
          problem: { answer: "它区分渐近复杂度优势与目标硬件上的真实墙钟性能。", evidence: "为什么短序列上仍可能输" },
          inputOutput: { answer: "输入目标长度、batch、硬件和实现，输出吞吐、延迟、显存与质量。", evidence: "tokens/s、延迟与显存" },
          mechanism: { answer: "SSM 用 scan 和固定推理状态避免位置两两匹配，但内核常数仍重要。", evidence: "依赖高效 scan/融合" },
          interpretation: { answer: "O(n) 只说明增长趋势，短序列时常数与利用率可令注意力更快。", evidence: "常数项和硬件利用率可压过复杂度优势" },
          boundary: { answer: "必须在实际硬件、长度和批量上实测，不能仅凭复杂度符号选型。", evidence: "必须在目标硬件、长度和 batch 上测" },
        },
        {
          section: 7,
          definition: { answer: "状态稳定性描述递推在很长步数后是衰减、漂移还是爆炸。", evidence: "状态稳定性决定长外推是否可信" },
          problem: { answer: "它解释训练长度正常的模型在更长序列上为何可能失真。", evidence: "推到 100k 为什么可能漂移或爆炸" },
          inputOutput: { answer: "输入不同长度、零输入、脉冲和数值精度，输出状态与任务曲线。", evidence: "FP32/BF16/FP16 的状态差异" },
          mechanism: { answer: "谱半径大于一放大状态，远小于一快速遗忘，有限精度累积误差。", evidence: "特征值绝对值的最大值" },
          interpretation: { answer: "零输入滚动若持续增大表明动力学或数值实现存在不稳定。", evidence: "状态是否衰减、漂移或爆炸" },
          boundary: { answer: "训练区间稳定不能推出任意长度稳定，必须单独做长度外推压力测试。", evidence: "训练区间内稳定不等于任意长度稳定" },
        },
        {
          section: 8,
          definition: { answer: "随机访问能力是从长历史中精确找回指定旧内容或位置。", evidence: "精确复制与任意检索" },
          problem: { answer: "它揭示有限状态能概括趋势却可能丢失大量互不相关细节。", evidence: "无法同时保存大量互不相关细节" },
          inputOutput: { answer: "输入含目标片段和大量干扰的长序列，输出目标内容及原位置。", evidence: "把一个目标片段藏在大量干扰文本中再要求找回" },
          mechanism: { answer: "所有历史压入固定状态会竞争容量，选择性只能改善写入而不能无限扩容。", evidence: "没有让有限状态变成无限数据库" },
          interpretation: { answer: "能放下百万 token 与仍能精确取回它们是两个不同能力指标。", evidence: "信息仍可取回" },
          boundary: { answer: "精确回看可交给稀疏注意力或外部检索，形成压缩与访问混合架构。", evidence: "稀疏注意力或外部检索负责精确回看" },
        },
        {
          section: 9,
          definition: { answer: "SSM 与 RNN 共享递归状态，与长卷积在线性时不变条件下等价。", evidence: "与 RNN、卷积和注意力的关系" },
          problem: { answer: "该定位帮助按流式状态、长动力学或精确回看需求选择机制。", evidence: "更匹配的机制" },
          inputOutput: { answer: "输入任务的信息访问模式，输出更适合的 RNN、SSM、卷积或注意力。", evidence: "固定小状态、流式" },
          mechanism: { answer: "现代 SSM 通过连续离散化、结构化矩阵和并行扫描提升训练效率。", evidence: "结构化矩阵和并行扫描" },
          interpretation: { answer: "固定状态适合流式，注意力或检索更适合任意位置精确回看。", evidence: "任意位置精确回看" },
          boundary: { answer: "选择性跨越固定卷积核，但仍不是显式保留每个旧位置的注意力。", evidence: "注意力则显式保留位置表示" },
        },
        {
          section: 11,
          definition: { answer: "SSM 运行状态是当前会话此前输入的压缩记忆，具有明确生命周期。", evidence: "部署时状态必须拥有明确生命周期" },
          problem: { answer: "它防止跨用户状态泄漏、批处理错位和故障恢复后的持续污染。", evidence: "不能把一个用户的 SSM 状态直接交给下一位用户" },
          inputOutput: { answer: "输入会话 token 与专属旧状态，输出新 token 结果及该会话新状态。", evidence: "每条序列各自的状态顺序" },
          mechanism: { answer: "按会话租户隔离，支持重置、超时回收、版本迁移和受信检查点重建。", evidence: "支持显式重置、超时回收和模型版本迁移" },
          interpretation: { answer: "一次批状态错位会让后续递推持续受错误历史影响，而非只错一步。", evidence: "后续输出持续污染" },
          boundary: { answer: "未知来源旧状态不得静默复用，故障后应从受信检查点恢复。", evidence: "不是静默复用来源不明的旧状态" },
        },
      ],
    },

    "self-supervised-learning": {
      contractVersion: 2,
      examples: [
        {
          section: 4,
          evidence: {
            setup: "A⁺ 是 A 的裁剪正样本",
            rule: "τ=0.2",
            steps: "54.60/60.73",
            interpretation: "模型已经把正视图排在明显更高的位置",
          },
        },
        {
          section: 11,
          evidence: {
            setup: "按商品身份拆分的训练图和测试查询图",
            rule: "避免同一商品的近重复图跨训练与测试",
            steps: "换背景不换商品”和“换商品不换背景",
            interpretation: "模型利用了摄影棚捷径而不是商品身份",
          },
        },
      ],
      formulas: [
        {
          id: "autoregressive-self-supervision",
          section: 2,
          formulaIndex: 1,
          symbols: [
            { name: "L", meaning: "下标 AR 指定的整段自回归负对数损失", evidence: "L_AR 是整段文本的自回归损失" },
            { name: "Σ", meaning: "把每个预测位置的损失相加", evidence: "Σ 把各位置损失相加" },
            { name: "t", meaning: "当前要预测的 token 位置", evidence: "t 是当前预测位置" },
            { name: "T", meaning: "输入序列的 token 总数", evidence: "T 是序列 token 数" },
            { name: "log", meaning: "把真实 token 概率转换为可加损失的自然对数", evidence: "log 是自然对数" },
            { name: "pθ", meaning: "参数 θ 的模型给出的条件概率", evidence: "参数 θ 的模型根据前缀赋给真实下一个 token 的条件概率" },
            { name: "xₜ", meaning: "位置 t 的真实 token", evidence: "xₜ 是第 t 个真实 token" },
            { name: "x<ₜ", meaning: "位置 t 之前的全部 token 前缀", evidence: "x<ₜ 是它之前的全部 token" },
          ],
        },
        {
          id: "masked-reconstruction-loss",
          section: 3,
          formulaIndex: 1,
          symbols: [
            { name: "L", meaning: "下标 mask 指定的全部被遮位置总损失", evidence: "L_mask 是所有被遮位置的总损失" },
            { name: "Σ", meaning: "只把被遮位置的损失相加", evidence: "只对其中的位置求和" },
            { name: "i", meaning: "被遮位置集合中的某个位置", evidence: "i∈M 表示只对其中的位置求和" },
            { name: "M", meaning: "本次训练中被遮住的位置集合", evidence: "M 是被遮位置集合" },
            { name: "log", meaning: "对真实被遮内容概率取自然对数", evidence: "负对数同样惩罚给真实内容的低概率" },
            { name: "pθ", meaning: "模型根据可见上下文恢复真实内容的概率", evidence: "pθ 是模型据此恢复 xᵢ 的概率" },
            { name: "xᵢ", meaning: "位置 i 原本的真实内容", evidence: "xᵢ 是位置 i 原本的真实内容" },
            { name: "x", meaning: "下标反斜线 M 指移除遮盖集合后的可见上下文", evidence: "x\\M 是拿掉 M 中内容后仍可见的上下文" },
          ],
        },
        {
          id: "infonce-positive-probability",
          section: 4,
          formulaIndex: 1,
          symbols: [
            { name: "ℓ", meaning: "正样本匹配的负对数概率损失", evidence: "ℓ 是正样本的负对数概率损失" },
            { name: "log", meaning: "对正样本归一化概率取自然对数", evidence: "负对数概率损失" },
            { name: "exp", meaning: "把缩放相似度指数化以形成归一化权重", evidence: "exp 与分母求和把各候选分数转成概率" },
            { name: "sim", meaning: "两个表示之间的相似度函数", evidence: "sim 计算两表示的相似度" },
            { name: "a", meaning: "锚点样本 A 的表示", evidence: "a 是锚点样本 A 的表示" },
            { name: "a⁺", meaning: "同一对象增强视图 A⁺ 的表示", evidence: "a⁺ 是同一商品增强视图 A⁺ 的表示" },
            { name: "τ", meaning: "缩放相似度差异的温度参数", evidence: "τ 是温度，负责缩放相似度差异" },
            { name: "Σ", meaning: "对正样本与所有候选负样本指数分数求和", evidence: "j 遍历正样本和候选负样本" },
            { name: "j", meaning: "候选样本的遍历索引", evidence: "j 遍历正样本和候选负样本" },
          ],
        },
        {
          id: "vicreg-anti-collapse-objective",
          section: 7,
          formulaIndex: 1,
          symbols: [
            { name: "L", meaning: "总损失及三个带下标的组成损失项", evidence: "L 是总损失" },
            { name: "λ", meaning: "方差约束项的权重系数", evidence: "λ 与 μ 分别控制后两项强度" },
            { name: "μ", meaning: "协方差去冗余项的权重系数", evidence: "λ 与 μ 分别控制后两项强度" },
          ],
        },
      ],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "自监督学习由原始数据及变换自动构造输入与明确训练目标。", evidence: "目标从数据自身产生" },
          problem: { answer: "它把海量无人工逐条标签的数据转化为可优化的监督信号。", evidence: "标签不是人工写的，但目标仍然明确" },
          inputOutput: { answer: "输入原始样本 z 和构造规则 q，输出模型输入 x 与自动目标 y。", evidence: "从中构造模型输入 x 和自动目标 y" },
          mechanism: { answer: "模型 fθ 根据 x 预测，损失 ℓ 比较预测与由同一数据生成的 y。", evidence: "由损失函数 ℓ 比较预测与 y" },
          interpretation: { answer: "有明确损失仍属于监督信号，差别在目标来源而非是否有目标。", evidence: "监督学习描述“有目标损失”" },
          boundary: { answer: "自监督是目标构造方式，无监督是更宽总称，二者不能简单等同。", evidence: "无监督则是更宽的总称" },
        },
        {
          section: 2,
          definition: { answer: "自回归目标用此前 token 作为输入，把下一个真实 token 当自动标签。", evidence: "自回归目标把每个位置都变成训练样本" },
          problem: { answer: "它从一段序列产生密集预测目标并同时训练生成接口。", evidence: "一段长度 T 的文本为何能提供 T−1 个目标" },
          inputOutput: { answer: "输入位置 t 前的前缀 x<ₜ，输出对真实 xₜ 的条件概率。", evidence: "输入前缀 自动目标" },
          mechanism: { answer: "因果遮罩阻止查看未来，对各位置真实 token 概率取负对数并求和。", evidence: "因果遮罩只允许读取此前 token" },
          interpretation: { answer: "损失下降表示模型更像训练分布地预测后续，不等于事实或行为正确。", evidence: "目标奖励“像数据分布”" },
          boundary: { answer: "预训练目标不直接奖励真实、无害或服从用户，需后训练和独立评测。", evidence: "不直接奖励真实、无害或服从当前用户" },
        },
        {
          section: 3,
          definition: { answer: "遮盖重建隐藏部分输入，再要求模型用仍可见的双向上下文恢复它。", evidence: "用双向证据恢复缺失部分" },
          problem: { answer: "它让模型从上下文学习可预测结构，而无需人工提供缺失内容标签。", evidence: "根据左右文恢复被遮 token" },
          inputOutput: { answer: "输入遮去集合 M 的文本或图像，输出每个被遮位置原始内容的概率。", evidence: "M 是被遮位置集合" },
          mechanism: { answer: "只对被遮位置计算负对数损失，并用可见上下文预测真实内容。", evidence: "只对其中的位置求和" },
          interpretation: { answer: "中等遮盖率常在任务难度与可预测证据之间取得更好平衡。", evidence: "在可预测证据与任务难度之间较平衡" },
          boundary: { answer: "过低会走局部复制捷径，过高会由不可预测细节主导，像素重建也可能偏离语义。", evidence: "重建像素还可能把容量花在颜色纹理" },
        },
        {
          section: 4,
          definition: { answer: "对比学习把同一对象的增强视图视为正对，并从候选负对中识别它。", evidence: "把正对从负对中识别出来" },
          problem: { answer: "它训练表示空间让同一对象靠近、不同对象相对远离。", evidence: "同一商品的匹配压力" },
          inputOutput: { answer: "输入锚点、正视图与负样本表示，输出正样本归一化概率和损失。", evidence: "正样本概率 54.60/60.73" },
          mechanism: { answer: "相似度除温度后指数化并在全部候选中归一化，再取正样本负对数。", evidence: "进入指数和归一化之前的缩放相似度" },
          interpretation: { answer: "本例正样本概率约 0.899、损失约 0.106，说明当前候选中排序较好。", evidence: "指数约 [54.60,4.48,1.65]" },
          boundary: { answer: "低温放大排序也放大标签错误，同类别 false negative 会施加错误排斥。", evidence: "实际上语义相近却被训练规则当成负例" },
        },
        {
          section: 5,
          definition: { answer: "预文本目标是从原始数据自动构造、用于迫使模型保留某类信息的训练任务。", evidence: "预文本目标决定模型被迫保留什么" },
          problem: { answer: "它解释相同数据为何因预测、遮盖或增强规则不同而学到不同表示。", evidence: "相同原始数据经过不同构造" },
          inputOutput: { answer: "输入原始文本图像音频与构造规则，输出用于下游迁移的参数或表示。", evidence: "原始数据 z" },
          mechanism: { answer: "右移保留顺序生成分布，遮盖保留可预测结构，增强声明不变变化。", evidence: "忽略被声明为不变的变化" },
          interpretation: { answer: "表示里保留什么由自动标签规则决定，并非自动中立或天然语义完整。", evidence: "“自动标签”并不中立" },
          boundary: { answer: "预文本效果必须通过线性探测、微调或提示等真实下游任务独立验收。", evidence: "下游任务独立验收" },
        },
        {
          section: 6,
          definition: { answer: "增强策略是把某种变化声明为不应改变目标语义的数据变换。", evidence: "增强策略实际定义了语义不变性" },
          problem: { answer: "它防止模型记忆像素捷径，同时也可能错误删除任务关键信息。", evidence: "裁掉语义主体" },
          inputOutput: { answer: "输入原始样本与增强规则，输出被视为同一对象的两种训练视图。", evidence: "随机裁剪可能把正样本变成错误正对" },
          mechanism: { answer: "训练拉近增强前后表示，迫使模型忽略增强改变的属性。", evidence: "颜色不决定身份" },
          interpretation: { answer: "若换背景不影响识别而换主体会改变结果，增强更可能抓住主体。", evidence: "模型会被迫认为背景与商品身份等价" },
          boundary: { answer: "裁剪、颜色、旋转、变速和回译是否保语义取决于具体任务。", evidence: "否定、实体或语气变化" },
        },
        {
          section: 7,
          definition: { answer: "表示坍缩是所有输入映射到近乎同一向量而失去区分信息。", evidence: "所有输入都输出近乎相同向量" },
          problem: { answer: "它解决无显式负样本的一致性目标可由常量表示轻易满足的问题。", evidence: "所有表示变成同一常数不是最优吗" },
          inputOutput: { answer: "输入同一样本的两视图，输出一致但仍有方差且维度不冗余的表示。", evidence: "两视图一致却不再含可区分信息" },
          mechanism: { answer: "停止梯度、动量教师或方差协方差约束制造不对称并阻止常量解。", evidence: "用停止梯度、教师动量更新" },
          interpretation: { answer: "训练损失低但表示方差、奇异值和邻居多样性塌陷说明仍发生坍缩。", evidence: "而非只看训练损失" },
          boundary: { answer: "没有显式负样本不等于无需防坍缩机制，不同方法的保护手段不同。", evidence: "没有显式负样本”不等于没有防坍缩机制" },
        },
        {
          section: 8,
          definition: { answer: "迁移评测用冻结、微调、少样本或检索协议测预训练表示的下游价值。", evidence: "迁移评测要区分冻结表示与端到端适配" },
          problem: { answer: "它避免用单一线性探测或预训练损失误判表示是否有用。", evidence: "线性探测差，是否说明预训练完全失败" },
          inputOutput: { answer: "输入固定数据划分、表示和调参预算，输出多协议及分切片下游指标。", evidence: "固定数据划分和调参预算" },
          mechanism: { answer: "线性探测测可分性，全量微调测适配性，冻结检索测距离空间。", evidence: "表示是否线性可分" },
          interpretation: { answer: "某协议差只表明对应访问方式受限，不足以推出预训练完全失败。", evidence: "低估可微调信息" },
          boundary: { answer: "协议受下游容量、提示、索引和预算影响，必须按来源难度与分布外切片。", evidence: "按来源、群体、难度与分布外样本切片" },
        },
        {
          section: 9,
          definition: { answer: "自监督数据治理覆盖来源许可、隐私、去重、污染和删除链路。", evidence: "规模优势把瓶颈转移到数据治理" },
          problem: { answer: "它防止自动目标规模化放大违法来源、隐私泄漏、偏见和评测污染。", evidence: "数据免费且无风险" },
          inputOutput: { answer: "输入原始数据及处理链，输出可追溯、可删除且覆盖被审计的训练集。", evidence: "记录来源、时间、处理链和删除能力" },
          mechanism: { answer: "通过许可审计、同意管理、去重、污染检测和群体覆盖检查治理。", evidence: "许可、隐私、同意、去重、污染" },
          interpretation: { answer: "评测集进入预训练语料会伪造迁移能力，必须作为污染处理。", evidence: "会伪造迁移能力" },
          boundary: { answer: "自监督只节省人工标签，不自动赋予数据授权或让目标符合产品价值。", evidence: "自监督只省标签，不免除治理" },
        },
        {
          section: 11,
          definition: { answer: "商品对比验收闭环从自动训练目标追踪到未见商品的真实检索表现。", evidence: "从训练目标一直追到未见商品上的真实检索结果" },
          problem: { answer: "它识别训练损失下降但模型只利用摄影棚背景捷径的失败。", evidence: "损失下降但模型只记住背景" },
          inputOutput: { answer: "输入商品级拆分图像，输出 top-k、表示方差及背景角度品类切片。", evidence: "输出是 top-k 商品检索结果" },
          mechanism: { answer: "先隔离商品、训练正对、冻结编码器检索，再做背景与主体反事实对照。", evidence: "随后冻结编码器" },
          interpretation: { answer: "换背景后同商品召回失败表示模型追踪摄影棚而非商品身份。", evidence: "说明模型利用了摄影棚捷径" },
          boundary: { answer: "该闭环只覆盖当前匹配任务，颜色文字或新拍摄域需重定义增强并复测。", evidence: "必须重新定义增强并复测对应切片" },
        },
      ],
    },

    "contrastive-learning": {
      contractVersion: 2,
      examples: [{
        section: 3,
        evidence: {
          setup: "锚点 A、正视图 A⁺、负样本鞋 B 和汽车 C",
          rule: "温度 τ=0.2",
          steps: "54.60/76.34",
          interpretation: "B 的 0.263 带来比 C 的 0.022 更强推远信号",
        },
      }],
      termReviews: [{
        section: 1,
        reviewedAt: "2026-07-26",
        terms: [{
          name: "特征向量",
          meaning: "编码器把一张视图转换成的数值表示",
          purpose: "让视图关系可计算并让下游任务读取特征",
          definitionEvidence: "把它映射为特征向量 z",
          purposeEvidence: "下游可使用投影前表示",
        }],
      }, {
        section: 10,
        reviewedAt: "2026-07-26",
        terms: [
          { name: "高维", meaning: "一个表示由许多数值坐标共同组成", purpose: "保存编码器学到的多种特征信息", definitionEvidence: "高维表示", purposeEvidence: "目标任务和反事实切片验收" },
          { name: "降维", meaning: "把高维坐标有损映射到更少坐标", purpose: "让人可视化检查可疑簇和离群点", definitionEvidence: "可视化降维方法", purposeEvidence: "适合发现可疑簇和离群点" },
          { name: "t-SNE", meaning: "强调局部邻近关系的非线性可视化降维方法", purpose: "辅助观察表示中的局部簇与异常", definitionEvidence: "t-SNE 与 UMAP 都是把高维表示有损映射", purposeEvidence: "适合发现可疑簇和离群点" },
          { name: "UMAP", meaning: "基于邻域图结构的非线性可视化降维方法", purpose: "辅助观察表示的邻域与整体布局", definitionEvidence: "二维或三维的可视化降维方法", purposeEvidence: "会改变原空间距离" },
        ],
      }],
      formulas: [
        {
          id: "contrastive-infonce",
          section: 2,
          formulaIndex: 1,
          symbols: [
            { name: "ℓ", meaning: "当前锚点正样本的负对数概率损失", evidence: "ℓᵢ 是锚点 i 的正样本负对数概率损失" },
            { name: "i", meaning: "当前锚点的样本编号", evidence: "i 是当前锚点编号" },
            { name: "log", meaning: "将正样本概率转换为可优化的负对数损失", evidence: "正样本负对数概率损失" },
            { name: "exp", meaning: "把缩放后的候选相似度指数化", evidence: "exp 和 Σ 将全部候选分数归一化成概率" },
            { name: "sim", meaning: "比较锚点和候选表示的相似度函数", evidence: "sim 是相似度函数" },
            { name: "z", meaning: "锚点、正视图或候选样本的向量表示", evidence: "zᵢ 是它的向量" },
            { name: "τ", meaning: "缩放相似度差异的温度参数", evidence: "τ 是缩放相似度的温度" },
            { name: "Σ", meaning: "对候选集合所有指数分数求和", evidence: "将全部候选分数归一化成概率" },
            { name: "j", meaning: "候选正负样本的遍历索引", evidence: "j 遍历候选集合中的正负样本" },
          ],
        },
        {
          id: "moco-momentum-update",
          section: 7,
          formulaIndex: 1,
          symbols: [
            { name: "θ", meaning: "带 key 或 query 下标的编码器参数", evidence: "θ_key 是生成队列 key 的编码器参数" },
            { name: "m", meaning: "控制旧 key 参数保留比例的动量系数", evidence: "m 是接近 1 的动量系数" },
          ],
        },
        {
          id: "contrastive-vicreg-objective",
          section: 9,
          formulaIndex: 1,
          symbols: [
            { name: "L", meaning: "总损失及三个带下标的组成损失项", evidence: "L 是总损失" },
            { name: "λ", meaning: "方差防坍缩项的权重", evidence: "λ 和 μ 是后两项权重" },
            { name: "μ", meaning: "协方差去冗余项的权重", evidence: "λ 和 μ 是后两项权重" },
          ],
        },
      ],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "对比学习用正对与负对关系塑造编码器的向量表示空间。", evidence: "谁与谁相同”的关系表" },
          problem: { answer: "它无需类别名称也能让同一对象视图靠近并区分其他对象。", evidence: "没有类别名称" },
          inputOutput: { answer: "输入原始样本生成的多种视图，输出编码器特征和对比空间向量。", evidence: "映射到专门计算对比损失的空间" },
          mechanism: { answer: "同源视图构成正对，其他样本构成负对，规则提供隐式关系标签。", evidence: "构造规则事实上给出了隐式关系标签" },
          interpretation: { answer: "A 与 A⁺ 应靠近；B、C 是否该远离取决于任务对“相同”的定义。", evidence: "锚点 A 是一张鞋图" },
          boundary: { answer: "投影头可隔离训练空间与下游表示，但不能修复错误的正负关系构造。", evidence: "让下游可使用投影前表示" },
        },
        {
          section: 2,
          definition: { answer: "InfoNCE 把一个锚点的正视图当作候选集合中的正确临时类别。", evidence: "让一个正样本与整组候选竞争" },
          problem: { answer: "它把关系学习转为在正负候选之间提高正样本概率的分类式目标。", evidence: "为什么它看起来像一个临时分类任务" },
          inputOutput: { answer: "输入锚点、正视图、候选向量和温度，输出正样本概率损失。", evidence: "分母包含正对和负对" },
          mechanism: { answer: "相似度除温度后指数归一化，拉高正 logit 并按概率压低负 logit。", evidence: "按当前 softmax 概率推低负对" },
          interpretation: { answer: "较相似负样本拥有更高 softmax 概率，因此收到更大推远梯度。", evidence: "候选中的正对是正确类别" },
          boundary: { answer: "通常须先归一化向量，否则模型可能只靠增大范数降低损失。", evidence: "避免模型仅靠增大范数降低损失" },
        },
        {
          section: 3,
          definition: { answer: "手算例将三项相似度经温度、指数和归一化得到损失与梯度强度。", evidence: "完整手算：相似鞋比汽车贡献更大梯度" },
          problem: { answer: "它说明困难负样本为何比简单负样本对一次更新影响更大。", evidence: "相似度 [0.8,0.6,0.1] 如何变成损失" },
          inputOutput: { answer: "输入 A 与 A⁺、B、C 的相似度，输出概率 0.715 和损失 0.335。", evidence: "正对概率 p⁺=54.60/76.34" },
          mechanism: { answer: "相似度除以 0.2，指数化后用总和归一化，最后取正对负对数。", evidence: "第一步除以温度得 logits" },
          interpretation: { answer: "B 概率 0.263 大于 C 的 0.022，所以 B 受到更强推远信号。", evidence: "交叉熵对其 logit 的导数就是当前 softmax 概率" },
          boundary: { answer: "B 对实例检索可为合理困难负例，对鞋类语义则可能是假负例。", evidence: "若目标是鞋类语义" },
        },
        {
          section: 4,
          definition: { answer: "温度 τ 是在 softmax 前缩放所有相似度差异的参数。", evidence: "温度控制模型关注多难的负样本" },
          problem: { answer: "它控制训练聚焦最高分困难候选还是让多候选共同贡献。", evidence: "既能强化区分，也会放大噪声" },
          inputOutput: { answer: "输入相似度与 τ，输出尖锐或平滑的候选概率和对应梯度。", evidence: "使 softmax 集中在最高的几个候选" },
          mechanism: { answer: "τ 变小放大 logit 间隔，τ 变大压缩间隔并趋向均匀分布。", evidence: "τ 太大则概率近均匀" },
          interpretation: { answer: "小温度让困难负样本主导更新，大温度使区分压力变弱。", evidence: "困难负样本获得更大梯度" },
          boundary: { answer: "温度必须与 batch、向量归一化和标签噪声联合调节。", evidence: "必须与 batch、相似度归一化和数据噪声一起调" },
        },
        {
          section: 5,
          definition: { answer: "表示空间由正对拉近、负对推远的采样关系共同雕刻。", evidence: "增强与采样共同雕刻空间" },
          problem: { answer: "它直观呈现困难负例与假负例使用同一推远动作却语义可能相反。", evidence: "同一个锚点周围" },
          inputOutput: { answer: "输入 A、A⁺、B、C 的构造关系，输出它们在表示空间的移动方向。", evidence: "哪些点被拉近、哪些被推远" },
          mechanism: { answer: "训练拉近正视图并推远候选负例，推力取决于相似度与概率。", evidence: "拉近 A⁺；推远 B、C" },
          interpretation: { answer: "B 是困难负还是错误假负，必须由下游语义而非损失自身判断。", evidence: "取决于下游语义定义" },
          boundary: { answer: "损失只能执行给定关系，无法自行知道采样关系是否符合产品任务。", evidence: "损失只知道构造出的关系" },
        },
        {
          section: 6,
          definition: { answer: "数据增强通过把两种视图设为正对来声明某种变化不影响语义。", evidence: "增强定义模型应忽略哪些变化" },
          problem: { answer: "它减少位置、色彩或措辞捷径，却可能删掉真正决定标签的信息。", evidence: "随机裁剪不是无害的数据处理" },
          inputOutput: { answer: "输入原样本与裁剪、颜色或回译规则，输出被拉近的正视图对。", evidence: "两视图之间的差异" },
          mechanism: { answer: "视图差异在优化中被压缩，模型被迫对该变化近似不敏感。", evidence: "被声明为“不影响语义”" },
          interpretation: { answer: "小目标被裁掉或否定实体被改写，说明增强破坏了任务标签。", evidence: "否定或实体被替换" },
          boundary: { answer: "合理增强依赖领域：医学侧别、熟度颜色等不能照搬自然图像配方。", evidence: "旋转改变医学方位" },
        },
        {
          section: 7,
          definition: { answer: "MoCo 用历史 key 队列和慢更新动量编码器提供大量较一致负样本。", evidence: "解决的是负样本供给" },
          problem: { answer: "它避免为了更多负样本把超大 batch 一次全部放入显存。", evidence: "为什么不用把超大 batch 一次塞进显存" },
          inputOutput: { answer: "输入 query 编码器参数和旧 key 参数，输出平滑更新的 key 编码器。", evidence: "生成队列 key 的编码器参数" },
          mechanism: { answer: "key 参数保留 m 比例旧值并吸收 1−m 比例当前 query 参数。", evidence: "坐标系变化更缓慢" },
          interpretation: { answer: "慢更新让不同时间进入队列的 key 相对可比，但队列过旧仍会漂移。", evidence: "队列太旧会产生表示漂移" },
          boundary: { answer: "大 batch 和跨设备共享增加通信与假负率，更多负例并非单调收益。", evidence: "不能把“更多负样本”当单调收益" },
        },
        {
          section: 8,
          definition: { answer: "假负样本是按采样规则标为负对、按目标语义却应相近的样本。", evidence: "假负样本会把同类语义撕裂" },
          problem: { answer: "它解释同类鞋被推远时模型究竟学实例身份还是类别语义。", evidence: "两张不同鞋图被当负对" },
          inputOutput: { answer: "输入任务语义及候选关系，输出合理负例、假负例或假正例判断。", evidence: "关系标签必须与时间、身份和任务语义一致" },
          mechanism: { answer: "实例区分允许同类互斥，类别检索则需多正样本或过滤同类候选。", evidence: "监督对比的多正样本" },
          interpretation: { answer: "正负关系不是自然事实，而是对具体下游相同概念的建模决定。", evidence: "正负不是自然事实" },
          boundary: { answer: "近邻挖掘、伪标签和去偏损失会引入新误差，且还须检查假正样本。", evidence: "但都会引入新误差" },
        },
        {
          section: 9,
          definition: { answer: "表示坍缩是不同输入映射为近乎同一向量、失去区分信息。", evidence: "不同输入都输出近乎相同向量" },
          problem: { answer: "它防止只拉近正对的一致性目标以常数向量获得完美损失。", evidence: "全部输出同一个向量不是完美答案吗" },
          inputOutput: { answer: "输入正对视图，输出既一致又保持维度方差与多样性的表示。", evidence: "维持各维方差并惩罚冗余协方差" },
          mechanism: { answer: "停止梯度与教师学生制造不对称，VICReg 另加方差和协方差约束。", evidence: "用停止梯度、教师—学生或预测头" },
          interpretation: { answer: "损失正常但标准差、有效秩或邻居多样性下降仍表示部分或全部坍缩。", evidence: "loss 正常下降不能排除" },
          boundary: { answer: "无显式负样本方法仍需特定防坍缩机制，不能只监控训练损失。", evidence: "仍需防止表示坍缩" },
        },
        {
          section: 10,
          definition: { answer: "表示验收用下游探测、检索、微调与反事实切片验证学到的信息。", evidence: "表示必须用目标任务和反事实切片验收" },
          problem: { answer: "它发现低训练损失却只识别水印、背景或设备等捷径的模型。", evidence: "模型没有只认水印" },
          inputOutput: { answer: "输入冻结表示和受控切片，输出线性、kNN、Recall@k 与反事实指标。", evidence: "做 kNN/Recall@k" },
          mechanism: { answer: "交换背景颜色水印设备，若主体不变时结果大幅变动则暴露捷径。", evidence: "交换背景、颜色、水印或拍摄设备" },
          interpretation: { answer: "降维图只用于发现异常，不能单独证明真实簇、公平或检索质量。", evidence: "不能单独证明真实簇结构" },
          boundary: { answer: "比较模型必须固定骨干、数据、增强、预算和协议并覆盖分布外切片。", evidence: "必须固定骨干、数据、增强、训练预算和评测协议" },
        },
      ],
    },

    clip: {
      contractVersion: 2,
      examples: [{
        section: 3,
        evidence: {
          setup: "沿用上一节 logits [[8,2],[3,7]]",
          rule: "按行、按列各算一次",
          steps: "e⁸/(e⁸+e²)",
          interpretation: "两个行概率越接近 1，图到文损失越小",
        },
      }],
      formulas: [
        {
          id: "clip-dual-encoder-normalization",
          section: 1,
          formulaIndex: 1,
          symbols: [
            { name: "v", meaning: "归一化后的图像向量", evidence: "vᵢ 是归一化后的图像向量" },
            { name: "i", meaning: "batch 中图像样本的编号", evidence: "Iᵢ 是第 i 张图像" },
            { name: "f", meaning: "带 img 或 txt 下标的模态编码器", evidence: "f_img 是图像编码器" },
            { name: "I", meaning: "输入图像样本", evidence: "Iᵢ 是第 i 张图像" },
            { name: "t", meaning: "归一化后的文本向量", evidence: "tⱼ 是归一化后的文本向量" },
            { name: "j", meaning: "batch 中文本样本的编号", evidence: "Tⱼ 是第 j 段文本" },
            { name: "T", meaning: "输入文本样本", evidence: "Tⱼ 是第 j 段文本" },
            { name: "‖", meaning: "计算向量 L2 长度的范数符号", evidence: "双竖线 ‖·‖ 表示向量长度" },
          ],
        },
        {
          id: "clip-pairwise-logits",
          section: 2,
          formulaIndex: 1,
          symbols: [
            { name: "S", meaning: "图文候选对的 softmax 前匹配分数矩阵", evidence: "Sᵢⱼ 是第 i 张图与第 j 段文本送入 softmax 前的匹配分数" },
            { name: "i", meaning: "图像在 batch 中的行编号", evidence: "第 i 张图" },
            { name: "j", meaning: "文本在 batch 中的列编号", evidence: "第 j 段文本" },
            { name: "v", meaning: "单位长度的图像向量", evidence: "vᵢ 和 tⱼ 是单位长度图像、文本向量" },
            { name: "t", meaning: "单位长度的文本向量", evidence: "vᵢ 和 tⱼ 是单位长度图像、文本向量" },
            { name: "ᵀ", meaning: "转置向量以便与另一向量做点积", evidence: "上标 ᵀ 表示转置" },
            { name: "τ", meaning: "控制候选分布尖锐程度的温度", evidence: "τ 是温度，用来控制候选概率分布的尖锐程度" },
          ],
        },
        {
          id: "clip-symmetric-cross-entropy",
          section: 3,
          formulaIndex: 1,
          symbols: [
            { name: "L", meaning: "图到文与文到图损失的算术平均", evidence: "L 是两方向损失的算术平均" },
            { name: "CE", meaning: "在对应候选方向选择真配对的交叉熵", evidence: "CE_image→text 是每张图在全部文本中选中配对文本的平均交叉熵" },
          ],
        },
      ],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "CLIP 双编码器分别把图像和文本映射到同一个归一化向量空间。", evidence: "双编码器先各自理解，再在向量空间相遇" },
          problem: { answer: "它把像素与 token 两种不同输入转换成可直接比较的对象。", evidence: "怎样变成可比较对象" },
          inputOutput: { answer: "输入图像 I 和文本 T，输出同维单位长度向量 v 与 t。", evidence: "两个编码器输出同维向量" },
          mechanism: { answer: "独立编码后除以各自 L2 长度，使点积等于余弦相似度。", evidence: "除以长度会把向量变成单位长度" },
          interpretation: { answer: "较大点积表示模型认为图文在训练关系中更匹配，可用于检索排序。", evidence: "点积就等于余弦相似度" },
          boundary: { answer: "独立编码便于离线索引，却在打分前缺少 token 与区域深度交互。", evidence: "没有逐 token/区域的深度交互" },
        },
        {
          section: 2,
          definition: { answer: "相似度矩阵包含 batch 中每张图与每段文本的全部两两匹配分数。", evidence: "一个 batch 自动形成 N×N 个图文组合" },
          problem: { answer: "它让 N 个真配对同时生成正样本和批内候选负样本。", evidence: "两对真配对为什么同时产生两对负样本" },
          inputOutput: { answer: "输入 N 个图向量、N 个文本向量和 τ，输出 N×N logits。", evidence: "会形成 N 行图像乘 N 列文本" },
          mechanism: { answer: "每个单位图向量与每个单位文向量点积再除温度形成矩阵。", evidence: "vᵢᵀtⱼ 是点积" },
          interpretation: { answer: "对角线是采集正配对，非对角线按标准目标参与负对竞争。", evidence: "矩阵对角线是采集到的正配对" },
          boundary: { answer: "非对角线不保证真负例，batch 变大时语义同类假负例也会增加。", evidence: "假负样本”也会增加" },
        },
        {
          section: 3,
          definition: { answer: "CLIP 用图到文和文到图两个方向的交叉熵共同对齐共享空间。", evidence: "同时做图找文和文找图" },
          problem: { answer: "它防止只优化一个检索方向而令另一侧结构较弱。", evidence: "为什么损失需要按行、按列各算一次" },
          inputOutput: { answer: "输入图文 logits 矩阵，输出行方向、列方向概率和平均损失 L。", evidence: "图到文对每一行做 softmax" },
          mechanism: { answer: "每行让图选择真文本，每列让文本选择真图，两项交叉熵取平均。", evidence: "文到图则按列竞争" },
          interpretation: { answer: "本例图到文真配对概率接近一，说明行方向区分很强且损失较小。", evidence: "I₂ 选 T₂ 的概率" },
          boundary: { answer: "小温度会强化困难负对，也会在弱配对噪声下强记错误。", evidence: "过尖也会强迫模型记住错误" },
        },
        {
          section: 4,
          definition: { answer: "共享空间是图文编码器只在相似度矩阵处交汇的联合表示空间。", evidence: "正配对沿对角线形成共享空间" },
          problem: { answer: "该图展示训练怎样同时移动两侧向量以提高真配对相似度。", evidence: "训练究竟移动了哪些向量" },
          inputOutput: { answer: "输入猫狗图文向量，输出含对角真配对高分的相似度矩阵。", evidence: "猫图 / 狗图" },
          mechanism: { answer: "对称损失拉高对角线配对分数并压低非对角候选。", evidence: "拉高对角线，压低非对角线" },
          interpretation: { answer: "矩阵对角高说明采集图文在该 batch 中相互可检索。", evidence: "使真配对在共享空间靠近" },
          boundary: { answer: "图示只反映全局向量关系，不证明词与区域已形成细粒度对齐。", evidence: "只在相似度矩阵处交汇" },
        },
        {
          section: 5,
          definition: { answer: "零样本分类把预先声明的类别写成文本并编码为类别原型。", evidence: "零样本分类把类别写成文本原型" },
          problem: { answer: "它无需训练新分类头即可在候选类别集合中为图像选择标签。", evidence: "没有训练新的分类头" },
          inputOutput: { answer: "输入待测图和类别文本模板，输出图与各文本原型的相似度及类别。", evidence: "与全部文本原型计算相似度" },
          mechanism: { answer: "编码并归一化多个模板，汇成原型，再对相似度 softmax 或取最大。", evidence: "多个模板可平均成类别原型" },
          interpretation: { answer: "最高相似原型表示在已声明闭集候选中模型最偏向该类。", evidence: "在预先声明的类别集合中" },
          boundary: { answer: "它不是自动发现任意标签，模板、语言、温度和候选集都会改变结果。", evidence: "不是模型凭空发现所有可能标签" },
        },
        {
          section: 6,
          definition: { answer: "双编码器检索独立预编码候选，交叉编码器联合处理查询与每个候选。", evidence: "检索效率来自独立编码" },
          problem: { answer: "它权衡百万候选高吞吐召回与细粒度关系判断能力。", evidence: "复杂关系查询却容易失败" },
          inputOutput: { answer: "输入查询文本和图库，输出 ANN 候选列表及可选精排顺序。", evidence: "找出与查询向量最接近的一小批候选" },
          mechanism: { answer: "CLIP 先按全局向量召回，交叉编码器再用 token 区域交互精排。", evidence: "先用 CLIP 高召回" },
          interpretation: { answer: "可离线建索引表示高召回高吞吐，逐候选联合计算换取更细关系判断。", evidence: "每个候选都需联合计算" },
          boundary: { answer: "ANN 是近似搜索会有召回损失，交叉编码器难以对全库逐项运行。", evidence: "不逐一精确扫描全部图库" },
        },
        {
          section: 7,
          definition: { answer: "组合理解要求模型区分对象相同但角色、数量、方位或否定不同的描述。", evidence: "对象共现不等于关系、计数与否定理解" },
          problem: { answer: "它揭示全局主题相似可能掩盖主客体和谓词错误。", evidence: "狗追人”和“人追狗”" },
          inputOutput: { answer: "输入仅改变关系属性的图文最小对照，输出成对排序正确率。", evidence: "只交换主客体、数量、方位或否定" },
          mechanism: { answer: "保持其他统计一致并只改变目标关系，隔离模型是否真正利用该关系。", evidence: "保持其他词与图像统计一致" },
          interpretation: { answer: "总体 Recall 高但 pairwise accuracy 低表示模型主要依赖对象共现。", evidence: "报告 pairwise accuracy" },
          boundary: { answer: "高相似度不是逻辑蕴含，不能证明描述中每个谓词都获图像支持。", evidence: "高相似度不是蕴含关系" },
        },
        {
          section: 8,
          definition: { answer: "弱图文配对使用网页替代文本、标题或邻近文字提供开放词汇监督。", evidence: "弱配对数据同时带来规模与噪声" },
          problem: { answer: "它以低标注成本扩展规模，却引入错配、偏见、隐私和评测污染。", evidence: "既有价值又危险" },
          inputOutput: { answer: "输入网页图像和周边文本，输出经来源、去重、许可与覆盖治理的配对集。", evidence: "alt-text、标题和邻近文字" },
          mechanism: { answer: "人工抽样、去重、群体语言切片和授权删除链共同控制风险。", evidence: "来源、授权、删除链路" },
          interpretation: { answer: "近重复跨训练测试会虚高迁移成绩，强过滤又可能删掉少数语境。", evidence: "过滤过强则可能删除少数语言和文化语境" },
          boundary: { answer: "海量文本不等于准确描述图像，网页文字可能只描述页面或广告。", evidence: "可能描述页面而非图像" },
        },
        {
          section: 9,
          definition: { answer: "CLIP 分数是图像与文本全局表示的匹配相似度，而非通用质量分。", evidence: "不是通用图像质量或安全裁判" },
          problem: { answer: "它防止用单一可被投机的相似度替代视觉质量、安全和人类偏好。", evidence: "为什么仍可能是一张坏图" },
          inputOutput: { answer: "输入生成图与提示，输出相似度；完整评测另输出质量多样性关系安全指标。", evidence: "生成评估至少分开测" },
          mechanism: { answer: "水印、大字、背景或对抗纹理可提高全局匹配而不修复真实图像缺陷。", evidence: "相似度可被大字、水印、典型背景和对抗纹理提高" },
          interpretation: { answer: "CLIP 高分只支持提示相关性证据，不能推出解剖正确、真实或安全。", evidence: "却忽略解剖错误、事实矛盾" },
          boundary: { answer: "高影响判断必须由独立模型和人工样本校验，不能只用一个嵌入分数。", evidence: "高影响判断不得只靠一个嵌入分数" },
        },
      ],
    },

    "llm": {
      contractVersion: 2,
      examples: [{
        section: 2,
        evidence: {
          setup: "假设模型选“巴黎”的条件概率是 0.62",
          rule: "条件概率的连乘",
          steps: "0.62×0.80=0.496",
          interpretation: "仍补不回第一步的巨大差距",
        },
      }],
      formulas: [
        {
          id: "llm-next-token-softmax",
          section: 2,
          formulaIndex: 1,
          symbols: [
            { name: "P", meaning: "在给定前文后为候选 token 分配的条件概率", evidence: "P 表示条件概率" },
            { name: "w", meaning: "词表中的一个候选 token", evidence: "w 是词表中的某个候选 token" },
            { name: "z", meaning: "模型为词表所有候选产生的原始分数向量", evidence: "z 是模型最后一层为每个候选 token 算出的实数向量" },
            { name: "softmax", meaning: "把原始分数归一化为总和为一的概率分布", evidence: "softmax 把整排 z 归一化" },
          ],
        },
        {
          id: "llm-path-probability",
          section: 2,
          formulaIndex: 2,
          symbols: [
            { name: "P", meaning: "按当前前文逐步选中目标 token 的条件概率", evidence: "P 表示条件概率" },
          ],
        },
        {
          id: "llm-training-cross-entropy",
          section: 5,
          formulaIndex: 1,
          symbols: [
            { name: "L", meaning: "整段训练序列的负对数似然损失", evidence: "L 是一段训练文本的总损失" },
            { name: "Σ", meaning: "把每个 token 位置的损失相加", evidence: "Σₜ 表示对所有预测位置 t 求和" },
            { name: "t", meaning: "当前预测位置的编号", evidence: "位置 t 的真实 token" },
            { name: "log", meaning: "把目标 token 的概率转换为对数惩罚", evidence: "−log 越大，惩罚越重" },
            { name: "P", meaning: "给定此前 token 时真实下一个 token 的条件概率", evidence: "P 是模型给真实 token 的条件概率" },
            { name: "x", meaning: "训练文本序列中的 token", evidence: "xₜ 是位置 t 的真实 token" },
          ],
        },
        {
          id: "llm-temperature",
          section: 7,
          formulaIndex: 1,
          symbols: [
            { name: "P", meaning: "温度调整后的候选 token 概率", evidence: "P(w) 是温度缩放后选到它的概率" },
            { name: "w", meaning: "当前要比较的候选 token", evidence: "w 是某个候选 token" },
            { name: "softmax", meaning: "把调温后的原始分数归一化成概率", evidence: "再做 softmax" },
            { name: "z", meaning: "模型输出的词表原始分数向量", evidence: "z 是词表各候选的 logits" },
            { name: "T", meaning: "控制概率分布尖锐或平坦程度的温度参数", evidence: "T 是采样温度" },
          ],
        },
      ],
      termReviews: [{
        section: 9,
        reviewedAt: "2026-07-26",
        terms: [{
          name: "似然",
          meaning: "模型依照训练数据统计规律给某段续写分配的相对可能性",
          purpose: "用于比较不同续写与训练文本统计规律的相似程度",
          definitionEvidence: "给某段续写分配的相对可能性",
          purposeEvidence: "用来比较哪种续写更像训练文本",
        }],
      }],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "大语言模型把多种语言任务统一改写成依据前文继续生成 token 的任务。", evidence: "这个「特别会续写的模型」，就是大语言模型" },
          problem: { answer: "它用同一个生成接口承接问答、翻译、摘要、写作等不同语言任务。", evidence: "处理语言是「分而治之」" },
          inputOutput: { answer: "输入包含任务要求和已有文本的提示，输出是逐步追加形成的续写。", evidence: "把任务塞进文字里" },
          mechanism: { answer: "任务被语言化后，模型反复执行下一个 token 预测，直到得到完整回答。", evidence: "只要一个模型足够会「续写」" },
          interpretation: { answer: "所谓通用主要指多种任务共享接口与参数，不等于每项能力都同样可靠。", evidence: "不必为每个任务单独建模型、单独标数据" },
          boundary: { answer: "精确计算、实时事实和严格可复现输出往往仍需工具、检索或结构化系统。", evidence: "要精确计算、要可靠事实、要严格可复现" },
        },
        {
          section: 2,
          definition: { answer: "自回归生成是在每一步根据已有前缀预测下一个 token 的概率分布。", evidence: "整个词表上的一个概率分布" },
          problem: { answer: "它把整段文本生成拆成可以逐步计算和采样的一连串局部决策。", evidence: "怎么生成一整句" },
          inputOutput: { answer: "输入是当前前缀，输出是词表概率分布以及按解码规则选出的一个 token。", evidence: "词表上所有 token 的一张概率表" },
          mechanism: { answer: "模型用 softmax 得到概率，选中 token 后把它接回前文并循环执行。", evidence: "把它接回去，再来一遍" },
          interpretation: { answer: "完整答案的路径概率是各步条件概率之积，早期低概率选择会持续压低整条路径。", evidence: "整段文本的概率，被拆成每一步条件概率的连乘" },
          boundary: { answer: "模型不会先写好全局草稿；贪心、采样和束搜索会从同一分布得到不同结果。", evidence: "它没有全局草稿" },
        },
        {
          section: 3,
          definition: { answer: "token 化把文本切成词表编号，嵌入再把离散编号变成可计算的连续向量。", evidence: "每个 token 对应词表里的一个编号" },
          problem: { answer: "它为神经网络建立从人类文字到数值表示的入口。", evidence: "可模型只会算数字" },
          inputOutput: { answer: "输入是原始文本，输出依次是 token 编号和叠加位置信息的向量序列。", evidence: "一串文字终于变成了一叠模型能做数学运算的向量" },
          mechanism: { answer: "分词器按词表切分，模型查嵌入表并加入位置编码后交给 Transformer。", evidence: "每个 token id 查一张大表" },
          interpretation: { answer: "相近向量表示模型在训练中学到了相似用法，不代表两个 token 完全同义。", evidence: "语义相近的词落在相近的位置" },
          boundary: { answer: "token 数不是字数，生僻词、拼写和不同语言可能产生差异很大的切分成本。", evidence: "计费和「上下文长度」都按 token 算，不按字数" },
        },
        {
          section: 4,
          definition: { answer: "带因果掩码的 Transformer 把前文向量加工成用于预测下一 token 的上下文表示。", evidence: "把「前文的每个 token 向量」反复加工" },
          problem: { answer: "它需要在不偷看未来答案的条件下，让当前位置综合此前各处信息。", evidence: "才能算出下一个词" },
          inputOutput: { answer: "输入是含位置的 token 向量序列，输出是每个位置融合前文后的上下文表示。", evidence: "输入已经是一叠向量了" },
          mechanism: { answer: "自注意力选择相关前文并按权重汇总，层叠加工产生上下文表示。", evidence: "按权重把它们的信息汇总过来" },
          interpretation: { answer: "某位置更关注“法国”等前文只能说明该次计算的关联权重更高。", evidence: "模型能把注意力落在「法国」上" },
          boundary: { answer: "因果掩码是训练有效性的边界；若看见未来 token，模型会学会抄答案。", evidence: "否则就是「拿着答案预测答案」" },
        },
        {
          section: 5,
          definition: { answer: "预训练用文本自身的下一个 token 作为目标，以交叉熵衡量预测误差。", evidence: "让模型预测下一个 token" },
          problem: { answer: "它让模型能利用海量未人工标注文本学习语言统计规律与可复用表示。", evidence: "数据自己给自己当标签" },
          inputOutput: { answer: "输入是文本前缀和真实后继 token，输出是词表概率与汇总后的训练损失。", evidence: "输入是文本前缀与其中真实的后继 token" },
          mechanism: { answer: "真实 token 概率越低，负对数惩罚越大；梯度下降据此更新全部参数。", evidence: "把这个“对真实后续的惊讶程度”不断压小" },
          interpretation: { answer: "损失下降表示模型对训练分布中的真实续写更少意外，不表示句子已经被事实核验。", evidence: "损失下降表示模型对这类文本的真实后续更少“意外”" },
          boundary: { answer: "训练数据有限且带偏差、噪声和时效边界，规模扩大也不能自动消除这些问题。", evidence: "扩大数据与参数不能自动消除这些边界" },
        },
        {
          section: 6,
          definition: { answer: "涌现能力是广泛预测训练中形成的模式和表示在新任务上的可迁移表现。", evidence: "作为可迁移副产品形成" },
          problem: { answer: "它解释了模型没有为每个任务单独训练，却能通过提示完成多种新任务。", evidence: "一个只会猜下一个词的模型，凭什么会翻译" },
          inputOutput: { answer: "输入是大规模多样文本与足够模型容量，输出是可被提示调用的语言和任务模式。", evidence: "输入是大量、多样的训练文本和足够的模型容量" },
          mechanism: { answer: "预测不同文本迫使模型压缩并复用语法、语义、世界共现和任务格式等规律。", evidence: "为了降低损失，模型会学到可复用的语法、事实、代码和部分推理表示" },
          interpretation: { answer: "新任务成绩提升是可观察能力证据，但不能单凭流畅回答断言模型具有人的理解。", evidence: "能力测评上升只能说明模型在该测试中表现更好" },
          boundary: { answer: "看似推理的输出可能来自模式模仿；分布变化、反事实或细节扰动仍可能使能力失效。", evidence: "模仿、记忆和真正组合泛化会混在一起" },
        },
        {
          section: 7,
          definition: { answer: "解码是把模型给出的词表分数转成实际 token 序列的选择过程。", evidence: "具体怎么从里面挑词" },
          problem: { answer: "它在确定性、文本多样性与退化风险之间调节实际生成行为。", evidence: "决定了它多稳、多有创意" },
          inputOutput: { answer: "输入是 logits、温度、采样规则和可见上下文，输出是选定 token 及最终文本。", evidence: "解码过程的输入是模型给出的 logits" },
          mechanism: { answer: "温度改变分布尖锐度，贪心取最大项，采样按概率抽取，束搜索保留多条候选路径。", evidence: "按概率大小掷骰子" },
          interpretation: { answer: "低温通常使分布更集中、输出更稳定，高温使候选更平均、结果更多样。", evidence: "分布被摊平，低概率词也有机会" },
          boundary: { answer: "温度不增加知识；上下文窗口也限制可见历史，长序列还带来计算和注意力稀释问题。", evidence: "不会修改模型参数或补充新知识" },
        },
        {
          section: 8,
          definition: { answer: "后训练把会续写的基础模型进一步塑造成能遵循指令与偏好的助手。", evidence: "从「基座」到「助手」" },
          problem: { answer: "它弥合原始文本续写目标与用户希望得到的有用、安全、合规回答之间的差距。", evidence: "可你把问题丢给它" },
          inputOutput: { answer: "输入是示范、偏好比较或反馈数据，输出是行为更符合目标规范的助手模型。", evidence: "输入不再只是原始网页文本" },
          mechanism: { answer: "预训练先学通用模式，指令微调学习回答格式，偏好优化再调整候选回答排序。", evidence: "补齐要两步，合起来是今天所有对话模型走的三段路" },
          interpretation: { answer: "阶段对照能区分知识能力、指令遵循和偏好行为分别由哪类训练改变。", evidence: "不能把“更听话”误读成“事实更正确”" },
          boundary: { answer: "对齐只能改变行为倾向，不能保证每个输入都正确、安全，也不能替代外部验证。", evidence: "后训练只改变行为倾向" },
        },
        {
          section: 9,
          definition: { answer: "语言似然是续写符合训练分布的相对可能性，并不是命题事实真值。", evidence: "给某段续写分配的相对可能性" },
          problem: { answer: "它解释为何流畅生成仍会幻觉，并帮助区分检索、对齐与提示注入等不同治理问题。", evidence: "语言似然不等于事实真值" },
          inputOutput: { answer: "输入是提示与可用上下文，输出是统计上可能的续写，而不是经过事实数据库核验的结论。", evidence: "模型输出候选 token 的概率以及由解码形成的续写" },
          mechanism: { answer: "下一个 token 目标奖励像训练文本的续写，却没有内置事实、权限或指令信任边界。", evidence: "从来不是「对不对」" },
          interpretation: { answer: "幻觉、知识截止、对齐偏差和提示注入相关但根因不同，必须分别诊断。", evidence: "它们相关，却不是完全相同的单一根因" },
          boundary: { answer: "高风险结论需借助检索、工具、引用和权限隔离，不能把语言概率当作事实证明。", evidence: "为什么需要外部证据" },
        },
      ],
    },

    "pretraining": {
      contractVersion: 2,
      examples: [{
        section: 3,
        evidence: {
          setup: "假设模型给三个正确 token 的概率依次为 0.50、0.25、0.80",
          rule: "损失 −ln p",
          steps: "若一次更新后“鱼”的概率从 0.25 升到 0.50",
          interpretation: "第二个位置最不确定，贡献最大损失",
        },
      }],
      formulas: [{
        id: "pretraining-cross-entropy-perplexity",
        section: 3,
        formulaIndex: 1,
        symbols: [
          { name: "L", meaning: "各预测位置负对数损失的平均值", evidence: "L̄ 是三个预测位置的平均交叉熵" },
          { name: "t", meaning: "当前预测位置的编号", evidence: "t 是位置编号" },
          { name: "p", meaning: "模型分给当前位置正确 token 的概率", evidence: "pₜ 是模型在位置 t 分给正确 token 的概率" },
          { name: "ln", meaning: "以自然常数为底的对数函数", evidence: "ln 是自然对数" },
          { name: "PPL", meaning: "平均交叉熵对应的困惑度指标", evidence: "PPL 是困惑度" },
          { name: "exp", meaning: "以自然常数 e 为底的指数函数", evidence: "exp 是以自然常数 e 为底的指数函数" },
        ],
      }],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "预训练是在具体任务之前先从通用数据学习可迁移参数和表示的训练阶段。", evidence: "在面对具体任务之前，先打好通用基础" },
          problem: { answer: "它减少每个任务都从头收集大量标注并只学一小块能力的重复成本。", evidence: "直接针对某个任务训练，要专门标注的数据" },
          inputOutput: { answer: "输入是大规模通用数据和初始模型，输出是可继续适配的参数检查点。", evidence: "输出是一份可继续微调或直接用于表示提取的参数检查点" },
          mechanism: { answer: "模型从数据自身构造目标、计算损失并反复更新共享参数。", evidence: "反复从数据自身构造目标、计算损失并更新参数" },
          interpretation: { answer: "留出损失和多类能力评测共同判断通用底子是否形成，不能只看训练集。", evidence: "留出集损失和多类能力评测" },
          boundary: { answer: "若目标领域与通用数据相差很远，仍需领域适配或更合适的专用模型。", evidence: "目标领域与预训练数据相差很远" },
        },
        {
          section: 2,
          definition: { answer: "自监督预训练从原始数据自身构造预测、掩码、对比或重建目标。", evidence: "从数据本身构造监督信号" },
          problem: { answer: "它解决原始数据规模巨大而逐样本人工标签昂贵的问题。", evidence: "怎样让原始数据自己提供学习目标" },
          inputOutput: { answer: "输入依目标而定，输出可以是词表概率、匹配分数或重建样本。", evidence: "下一 token 的词表概率" },
          mechanism: { answer: "预测与真实目标的损失经梯度下降传回模型，逐步更新参数。", evidence: "用交叉熵衡量预测分布与真实下一 token 的差距" },
          interpretation: { answer: "目标选择决定可见信息和直接能力倾向，不能把不同目标当成同一算法。", evidence: "目标决定模型每次能看见什么、输出什么" },
          boundary: { answer: "自监督不消除数据许可、重复、泄漏、偏见以及与下游任务错位的风险。", evidence: "数据泄漏、重复样本和目标与下游任务的错位" },
        },
        {
          section: 3,
          definition: { answer: "next-token 训练把一段序列右移，使每个位置都提供一个后继 token 目标。", evidence: "经过右移，会产生三次预测" },
          problem: { answer: "它说明一段原始文本怎样自动变成密集监督，以及概率变化怎样影响损失。", evidence: "一句文本怎样同时产生多个训练样本" },
          inputOutput: { answer: "输入是逐步增长的前缀与正确后继，输出是正确概率、位置损失和平均指标。", evidence: "模型给三个正确 token 的概率依次为 0.50、0.25、0.80" },
          mechanism: { answer: "各位置计算负对数概率并取平均，反向传播再提高正确 token 的相对分数。", evidence: "反向传播会同时调整共享参数" },
          interpretation: { answer: "概率最低的位置贡献最大损失，困惑度较低表示在同分词和数据上更会预测。", evidence: "第二个位置最不确定，贡献最大损失" },
          boundary: { answer: "低困惑度只反映评测分布上的 token 预测，不能证明事实、助手行为或泛化。", evidence: "低困惑度不等于事实更真或助手更好" },
        },
        {
          section: 4,
          definition: { answer: "可迁移能力来自为降低广泛预测误差而形成的可复用内部表示。", evidence: "形成能复用的语法、语义、代码结构和事实共现表示" },
          problem: { answer: "它解释单一预测目标为何可能支持语法、常识、代码和部分推理任务。", evidence: "只是预测下一个词，怎么就学到了语法、常识，甚至推理" },
          inputOutput: { answer: "输入是跨主题训练样本，直接输出更新表示，外部输出是被任务调用后的成绩。", evidence: "训练直接输出的是更低损失和更新后的内部表示" },
          mechanism: { answer: "共享参数必须压缩跨样本反复出现的结构，单句记忆不足以解释大量新前缀。", evidence: "只背某一句，无法解释大量新前缀" },
          interpretation: { answer: "新组合、反事实和分布外题仍稳定成功，才构成更强的组合泛化证据。", evidence: "反事实题和分布外样本仍能稳定答对" },
          boundary: { answer: "会续写推理文本可能来自模板记忆或表面捷径，不能自动等同可靠推理。", evidence: "不能把“会续写推理文本”直接等同于可靠推理" },
        },
        {
          section: 5,
          definition: { answer: "预训练的直接产物是擅长建模数据分布、但尚未被塑造成助手的基座模型。", evidence: "产出的是「基座模型」" },
          problem: { answer: "它区分语言建模能力与遵循用户指令、偏好和安全规范的助手行为。", evidence: "我们是不是就得到一个能用的助手了" },
          inputOutput: { answer: "输入是预训练数据流，输出是基座模型检查点和相应训练记录。", evidence: "输出是基座模型检查点及其训练记录" },
          mechanism: { answer: "后续用指令示范和偏好反馈继续更新，才把基座逐步塑造成对话助手。", evidence: "要把基座变成能对话的助手，还要两步" },
          interpretation: { answer: "留出损失较低表示语言建模目标有进展，不等同于能正确回答指令。", evidence: "说明语言建模目标取得进展" },
          boundary: { answer: "后训练不能保证事实正确，高风险用途仍需检索、工具和独立验证。", evidence: "不说明它已经遵循指令" },
        },
        {
          section: 6,
          definition: { answer: "预训练成本由计算、显存、通信、数据工程、故障恢复和评测共同构成。", evidence: "从头预训练会消耗大规模数据、加速器集群与长期工程投入" },
          problem: { answer: "它解释前沿基座训练为何集中在少数机构，以及多数团队为何复用已有模型。", evidence: "为什么不是人人都能做" },
          inputOutput: { answer: "预算规划输入模型、token、硬件和数据方案，输出成本、工期与检查点计划。", evidence: "输出是预计计算量、时间、成本及可恢复的检查点计划" },
          mechanism: { answer: "前后向计算、多设备同步、数据供给和恢复验证共同限制实际吞吐。", evidence: "多设备要同步梯度、参数或激活" },
          interpretation: { answer: "实际吞吐偏低可能是通信或数据管线瓶颈，不能直接归因于模型结构。", evidence: "实际吞吐低于理论峰值并不一定表示模型设计错误" },
          boundary: { answer: "小模型从头训、继续预训练或微调应按领域差异、数据规模和预算选择。", evidence: "小规模领域模型、继续预训练或直接微调何者合适" },
        },
      ],
    },

    "post-training": {
      contractVersion: 2,
      examples: [{
        section: 8,
        evidence: {
          setup: "同一个退款提示怎样穿过三阶段",
          rule: "SFT 模仿示范，偏好优化排序可行回答，可验证反馈奖励能被外部检查的结果或过程",
          steps: "偏好数据把 B 相对 A 的胜率从原始候选倾向中抬高",
          interpretation: "偏好 0.70”不是事实正确率",
        },
      }],
      formulas: [{
        id: "post-training-preference-objective",
        section: 3,
        formulaIndex: 1,
        symbols: [
          { name: "J", meaning: "训练希望提高的偏好与约束综合目标", evidence: "J 是要提高的总目标" },
          { name: "θ", meaning: "当前正在通过后训练更新的模型参数", evidence: "θ 是正在更新的模型参数" },
          { name: "R", meaning: "回答符合偏好比较数据的收益项", evidence: "R偏好 衡量回答符合偏好数据的程度" },
          { name: "λ", meaning: "控制偏好收益和参考约束强度的系数", evidence: "λ 控制“追求偏好”与“别偏离太远”的权衡" },
          { name: "KL", meaning: "衡量当前回答分布偏离参考分布程度的散度", evidence: "KL 衡量当前分布偏离参考分布多少" },
          { name: "π", meaning: "模型对可能回答分配的概率分布", evidence: "πθ 是当前模型的回答分布" },
        ],
      }],
      termReviews: [{
        section: 1,
        reviewedAt: "2026-07-26",
        terms: [{
          name: "似然",
          meaning: "模型给训练文本及其续写分配的相对可能性",
          purpose: "作为预训练学习数据中常见语言规律的优化信号",
          definitionEvidence: "模型给训练文本及其续写分配的相对可能性",
          purposeEvidence: "是为了学会数据中常见的语言规律",
        }],
      }],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "后训练是基座模型之后用产品目标数据和反馈继续塑造行为的一组训练阶段。", evidence: "后训练是阶段总称" },
          problem: { answer: "它弥合文本续写似然与用户意图、工具、安全和推理策略之间的差距。", evidence: "为什么还不能直接当助手" },
          inputOutput: { answer: "输入是基座模型及示范、偏好或验证反馈，输出是助手模型和评测记录。", evidence: "输入是基座模型、指令示范、偏好比较或可验证反馈" },
          mechanism: { answer: "各阶段生成候选、按不同目标比较，再由损失或奖励更新模型参数。", evidence: "生成候选—比较目标—计算损失或奖励—更新参数" },
          interpretation: { answer: "行为触发率变化表示模型更常按目标表现，不代表突然获得权威事实。", evidence: "目标行为的触发概率发生变化" },
          boundary: { answer: "若基础能力、事实或少数语言切片回归，总偏好分数提高也不能算成功。", evidence: "不能仅凭总偏好分数宣布成功" },
        },
        {
          section: 2,
          definition: { answer: "监督微调用指令与理想回答示范继续做 token 级交叉熵训练。", evidence: "收集高质量的“指令—理想回答”示范" },
          problem: { answer: "它先让基座学会回答、遵循格式并在适当位置拒绝的基本助手行为。", evidence: "回答而非随意续写、按格式输出、在合适位置拒绝" },
          inputOutput: { answer: "输入是指令、上下文和示范回答，目标输出是示范中的 token 序列。", evidence: "目标输出是示范回答中的 token 序列" },
          mechanism: { answer: "模型逐 token 降低示范回答的交叉熵，使这些行为更常出现在生成分布中。", evidence: "模型像预训练一样逐 token 降低交叉熵" },
          interpretation: { answer: "格式或拒答指标提高表示更常复现示范行为，不保证未覆盖场景正确。", evidence: "表示模型更常复现示范行为" },
          boundary: { answer: "示范覆盖、冲突、语言失衡和模板偏差都会限制或扭曲模型行为。", evidence: "模型会把这些问题一并学进去" },
        },
        {
          section: 3,
          definition: { answer: "偏好优化用同一提示下回答间的相对比较来调整模型的回答概率。", evidence: "比较同一提示的多个回答" },
          problem: { answer: "它处理开放任务中无法为每个提示写出唯一标准答案的质量取舍。", evidence: "最好回答”写不成唯一标准答案" },
          inputOutput: { answer: "输入是提示、好坏回答对和参考模型，输出是重新排序回答的策略模型。", evidence: "训练输出仍是更新后的策略模型" },
          mechanism: { answer: "训练提高偏好收益，同时用 KL 或等价约束限制偏离参考模型的程度。", evidence: "拉大好回答与差回答的相对分数" },
          interpretation: { answer: "偏好胜率只说明在当前标注者、提示和候选机制下更常选中目标回答。", evidence: "偏好胜率提高表示在当前标注者、提示和候选生成方式下" },
          boundary: { answer: "代理偏好可能奖励迎合、冗长和自信，且群体与约束选择会改变结果。", evidence: "偏好有群体差异" },
        },
        {
          section: 4,
          definition: { answer: "可验证反馈用测试、检查器或证明器为答案结果或推理过程产生训练信号。", evidence: "用单元测试、答案检查器、证明器或过程验证器给反馈" },
          problem: { answer: "它为数学、代码等具有客观检查条件的任务提供比主观偏好更明确的反馈。", evidence: "数学、代码等有客观答案的任务" },
          inputOutput: { answer: "输入是题目、模型答案或步骤与规则，输出是通过、分数或具体错误位置。", evidence: "输出是通过/失败、分数或具体出错步骤" },
          mechanism: { answer: "奖励引导模型搜索、检查和修正，使更能通过验证的轨迹获得更高概率。", evidence: "学习拆解、搜索、检查与修正" },
          interpretation: { answer: "验证分数上升表示更会满足当前检查器，而不是已证明真实任务全面正确。", evidence: "验证分数上升只说明模型更会满足当前检查器" },
          boundary: { answer: "弱验证器会被奖励投机，必须用隐藏测试、对抗样例和独立终验约束。", evidence: "弱验证器会被奖励黑客利用" },
        },
        {
          section: 5,
          definition: { answer: "后训练主要重分配已有行为和能力的可访问性，也可能改变策略和风格。", evidence: "能力“出现”与“被稳定调用”要分开测" },
          problem: { answer: "它帮助区分能力真的增加、能力更稳定被调用和仅有表面风格变化。", evidence: "怎样区分新增能力、能力被更稳定调用和表面风格变化" },
          inputOutput: { answer: "输入是基座与后训练模型的多次、多提示测评，输出是能力上限和触发稳定性指标。", evidence: "同时看 pass@1、更多采样下的能力上限和跨提示鲁棒性" },
          mechanism: { answer: "训练提高某种解题或拒答策略的触发概率，也可能让固定模板被过早套用。", evidence: "后训练可提高触发概率" },
          interpretation: { answer: "单次成功与多次采样能力上限的差异可帮助判断能力是否存在但不易访问。", evidence: "基座模型可能在少量采样中解出题" },
          boundary: { answer: "精确事实的更新、删除和出处审计不适合只靠写入模型权重完成。", evidence: "检索或工具查询通常比继续训练更合适" },
        },
        {
          section: 6,
          definition: { answer: "评测与数据闭环用独立测试发现收益和回归，再有治理地改进训练数据。", evidence: "新失败样例可回流成训练数据" },
          problem: { answer: "它回答训练损失下降是否真的改善助手，并防止平均分掩盖重要失败。", evidence: "训练损失下降，是否说明助手真的更好" },
          inputOutput: { answer: "输入是各阶段模型和独立切片，输出是帮助、事实、安全、成本等多维指标。", evidence: "同时测帮助性、事实性、安全、推理、格式、延迟与成本" },
          mechanism: { answer: "每阶段设置闸门，保留终验集并按来源去重，失败样例经治理后再回流。", evidence: "采用阶段闸门" },
          interpretation: { answer: "总分上升但某些用户或任务回归，表示收益不均且不能宣布整体通过。", evidence: "不能用平均值掩盖" },
          boundary: { answer: "测试集若直接进入训练会造成污染，使离线成绩失去独立验证意义。", evidence: "测试集不能直接混入训练" },
        },
        {
          section: 8,
          definition: { answer: "运行例子展示 SFT、偏好优化与可验证反馈对同一退款回答的逐层作用。", evidence: "同一个退款提示怎样穿过三阶段" },
          problem: { answer: "它区分流畅续写、受偏好回答和满足外部政策规则三种不同成功标准。", evidence: "又分别改变什么" },
          inputOutput: { answer: "输入是退款提示和三个候选回答，输出是 SFT 似然、偏好概率与规则结果。", evidence: "SFT 似然" },
          mechanism: { answer: "SFT 建立回答分布，偏好移动候选概率，验证器再检查日期、例外和订单字段。", evidence: "外部规则验证进一步检查日期、质量例外和订单字段" },
          interpretation: { answer: "候选 B 被保留是偏好与规则共同支持，不代表偏好概率本身就是正确率。", evidence: "偏好 0.70”不是事实正确率" },
          boundary: { answer: "只查关键词的验证器会诱发奖励投机，上线还要保留多类能力与安全切片。", evidence: "模型可能学会堆关键词而不核对订单" },
        },
      ],
    },

    "fine-tuning": {
      contractVersion: 2,
      examples: [{
        section: 5,
        evidence: {
          setup: "设基座矩阵 W=I",
          rule: "LoRA 用列向量 B=[0.2,0.1]ᵀ 与行向量 A=[1,−1] 相乘",
          steps: "适配器增量 ΔWx",
          interpretation: "合并输出 (W+ΔW)x",
        },
      }],
      formulas: [{
        id: "fine-tuning-lora-rank-one",
        section: 5,
        formulaIndex: 1,
        symbols: [
          { name: "W", meaning: "保持冻结的基座模型权重矩阵", evidence: "W 是冻结的基座权重" },
          { name: "ΔW", meaning: "LoRA 适配器学习到的权重增量矩阵", evidence: "ΔW 是适配器学到的增量" },
          { name: "A", meaning: "把输入映射到少数低维变化方向的小矩阵", evidence: "A 把输入压到一个低维方向" },
          { name: "B", meaning: "把低维变化方向展开回输出空间的小矩阵", evidence: "B 再把该方向展开回输出空间" },
          { name: "rank", meaning: "矩阵中彼此独立变化方向的数量", evidence: "秩”可先理解为矩阵中彼此独立的变化方向数量" },
        ],
      }],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "微调以预训练模型为起点，用针对性数据继续训练并适配某个任务或领域。", evidence: "拿别人预训练好的模型当起点" },
          problem: { answer: "它避免为每个专门任务都从随机权重开始承担海量数据和计算成本。", evidence: "绝大多数人做不起" },
          inputOutput: { answer: "输入是预训练模型、任务样本和配置，输出是新权重或可挂载适配器。", evidence: "输出是适配后的权重或一个可挂载的适配器" },
          mechanism: { answer: "模型从已有参数出发，按任务损失用梯度只进行相对有限的参数更新。", evidence: "仍然计算任务损失并用梯度更新参数" },
          interpretation: { answer: "目标任务留出指标提高说明更适配该任务，还需检查通用能力是否回归。", evidence: "留出任务指标提高说明模型更适合当前任务" },
          boundary: { answer: "数据太少、领域差异太大或基础模型没有相应能力时，小幅更新可能不足。", evidence: "轻推一步”未必够" },
        },
        {
          section: 2,
          definition: { answer: "迁移学习把源任务中学到的可复用表示和参数搬到新的目标任务。", evidence: "把一个领域学到的能力搬到另一个任务上" },
          problem: { answer: "它解释少量目标数据为何能建立在昂贵的通用能力之上快速适配。", evidence: "为什么用一小批数据「接着训一会儿」就够" },
          inputOutput: { answer: "输入是已有参数表示与目标样本，输出是适应目标任务的边界或生成行为。", evidence: "输出是对目标任务更合适的决策边界或生成行为" },
          mechanism: { answer: "梯度重点调整与目标样本相关的表示和输出方向，复用其余通用规律。", evidence: "优先调整当前样本最相关的表示与输出方向" },
          interpretation: { answer: "目标越接近预训练覆盖且表示越可复用，通常需要的目标样本越少。", evidence: "迁移通常越省样本" },
          boundary: { answer: "领域、模态或标签语义差距过大会出现负迁移，可能不如简单专用模型。", evidence: "还可能出现负迁移" },
        },
        {
          section: 3,
          definition: { answer: "微调适合固化格式、语气和工作方式等行为，不适合充当可更新事实库。", evidence: "风格是可训练的行为" },
          problem: { answer: "它帮助在提示、检索和权重更新之间选择与需求性质匹配的工具。", evidence: "什么问题该用微调，什么问题不该" },
          inputOutput: { answer: "输入是需求、更新频率、溯源要求和预算，输出是提示、RAG、微调或组合。", evidence: "输出是提示、RAG、微调或组合方案" },
          mechanism: { answer: "示范训练把行为写进参数，检索则在调用时把外部事实放进上下文。", evidence: "知识会变，检索能随时更新、还能给出处" },
          interpretation: { answer: "格式通过率提高证明行为更稳定，却不能证明模型掌握更多或更新的事实。", evidence: "不能据此推断事实覆盖更完整" },
          boundary: { answer: "行为和知识需求可同时存在，此时可用微调固定行为并由 RAG 提供证据。", evidence: "实际系统可以用微调固定格式" },
        },
        {
          section: 4,
          definition: { answer: "指令微调是在预训练模型上用指令与理想回答做的监督微调。", evidence: "指令微调 = 在预训练模型上做的一次监督学习" },
          problem: { answer: "它把只会续写的基座模型塑造成收到用户指令后更常直接回答的助手。", evidence: "把「基座」调成「助手」" },
          inputOutput: { answer: "输入是指令和上下文，目标输出是示范回答的 token 序列。", evidence: "目标输出是示范回答的 token" },
          mechanism: { answer: "交叉熵逐 token 提高示范回答的条件概率，使模型复现示范行为。", evidence: "交叉熵逐步提高示范回答的概率" },
          interpretation: { answer: "指令遵循率提升只说明更常遵守训练规范，不代表事实自动正确。", evidence: "不代表回答事实必然正确" },
          boundary: { answer: "示范覆盖、冲突和错误拒答标准会被模型继承，仍需独立评测。", evidence: "模型会继承这些缺陷" },
        },
        {
          section: 5,
          definition: { answer: "参数高效微调冻结大部分基座权重，只训练少量新增参数表达任务增量。", evidence: "低秩假设任务适配只需少数方向" },
          problem: { answer: "它降低大模型全量微调的显存、存储和多任务版本维护成本。", evidence: "微调一次是不是也得改动全部、也很贵" },
          inputOutput: { answer: "输入是基座权重和任务数据，输出是低秩增量矩阵或合并后的适配权重。", evidence: "部署时可动态挂载适配器" },
          mechanism: { answer: "LoRA 用 A 压缩输入方向、B 展开输出方向，以 BA 近似权重更新。", evidence: "A 把输入压到一个低维方向" },
          interpretation: { answer: "玩具例中秩一增量把基座输出从 [3,1] 调整为 [3.4,1.2]。", evidence: "合并输出 (W+ΔW)x" },
          boundary: { answer: "低秩假设并非所有任务都成立，缩放、目标层和秩会限制可表达的更新。", evidence: "目标层选择与 dropout" },
        },
        {
          section: 6,
          definition: { answer: "微调主要风险包括对小数据过拟合、遗忘通用能力和忠实学习脏示范。", evidence: "三个最容易翻车的坑" },
          problem: { answer: "它帮助判断目标任务变好时是否以泛化、通用能力或数据质量为代价。", evidence: "翻车也集中在几个固定的地方" },
          inputOutput: { answer: "输入是训练曲线、独立任务集、通用基线和数据审计，输出是风险定位。", evidence: "输出是过拟合、遗忘或数据缺陷的定位" },
          mechanism: { answer: "比较训练与验证走势、目标与通用指标以及错误和示范的对应关系来诊断。", evidence: "训练损失继续下降而验证集变差" },
          interpretation: { answer: "目标任务提高但通用集下降指向灾难性遗忘，而不是无条件变强。", evidence: "目标任务提高但通用集下降" },
          boundary: { answer: "低学习率、早停、混合通用样本和 PEFT 只能降风险，不能替代留出评测。", evidence: "不能替代独立留出集" },
        },
        {
          section: 7,
          definition: { answer: "方案选择阶梯先尝试提示，再处理外部知识，最后才训练并固化行为。", evidence: "由轻到重的阶梯" },
          problem: { answer: "它避免在更便宜、易迭代的方案已能达标时承担训练和维护成本。", evidence: "第一步该做什么" },
          inputOutput: { answer: "输入是代表性需求、质量门槛和总成本，输出是达到门槛的最轻方案。", evidence: "输出是达到门槛的最轻方案" },
          mechanism: { answer: "在同一测试集依次验证提示、RAG 和微调，不达标才升级方案。", evidence: "从最省的试起，不够了再往上走" },
          interpretation: { answer: "比较质量、延迟、token、训练和维护成本，才能判断哪个方案整体更优。", evidence: "比较质量、延迟、单次 token、训练与维护成本" },
          boundary: { answer: "阶梯不是绝对规则，离线、低延迟或高调用量可使微调更早经济。", evidence: "微调可能更早变得经济" },
        },
      ],
    },

    "peft-lora": {
      contractVersion: 2,
      examples: [{
        section: 3,
        evidence: {
          setup: "rank=8 时，16.8M 参数的矩阵",
          rule: "A+B 参数",
          steps: "65,536 / 16,777,216 ≈ 0.391%",
          interpretation: "两个低秩矩阵只训练约 0.39% 参数",
        },
      }],
      formulas: [{
        id: "peft-lora-forward",
        section: 2,
        formulaIndex: 1,
        symbols: [
          { name: "h", meaning: "基座分支与 LoRA 分支相加后的层输出", evidence: "h 是 d 维输出" },
          { name: "W", meaning: "被冻结且仍参与计算的基座权重矩阵", evidence: "W 是冻结的 d×k 基座权重" },
          { name: "x", meaning: "送入当前线性层的输入向量", evidence: "x 是 k 维输入" },
          { name: "α", meaning: "控制低秩分支相对强度的缩放系数", evidence: "α 是缩放系数" },
          { name: "r", meaning: "低秩增量可以表达的秩上限和中间维数", evidence: "r 是秩上限" },
          { name: "A", meaning: "把 k 维输入压缩到 r 维的小矩阵", evidence: "A 先把 k 维输入压到 r 维" },
          { name: "B", meaning: "把 r 维表示展开到 d 维的小矩阵", evidence: "B 再把 r 维展开到 d 维" },
          { name: "ℝ", meaning: "矩阵元素取值所在的实数集合", evidence: "ℝ 表示矩阵元素是实数" },
          { name: "k", meaning: "当前线性层输入向量的维数", evidence: "x 是 k 维输入" },
          { name: "d", meaning: "当前线性层输出向量的维数", evidence: "h 是 d 维输出" },
        ],
      }],
      termReviews: [{
        section: 5,
        reviewedAt: "2026-07-26",
        terms: [{
          name: "降维",
          meaning: "把向量的坐标数量从较多变成较少",
          purpose: "让 MLP 的中间表示回到主干所需的维度",
          definitionEvidence: "把向量的坐标数量从较多变成较少",
          purposeEvidence: "用于让 MLP 输出回到主干维度",
        }],
      }],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "LoRA 用两个窄矩阵的乘积表示基座权重的低秩任务增量。", evidence: "低秩的是增量，不是基座" },
          problem: { answer: "它避免为适配任务而让大权重矩阵的每个元素都独立训练和存储。", evidence: "为何不必让每个元素都独立变化" },
          inputOutput: { answer: "输入仍是 k 维向量，输出仍是 d 维向量，并叠加一个低秩分支。", evidence: "输入仍是原层的 k 维向量" },
          mechanism: { answer: "若任务变化只有少数独立方向，就用 B 与 A 的乘积近似 ΔW。", evidence: "可以由两个更窄的矩阵相乘得到" },
          interpretation: { answer: "较低有效秩表示任务适配可由少数变化方向表达，并非基座本身很小。", evidence: "包含多少个彼此独立的变化方向" },
          boundary: { answer: "低秩是经验假设，复杂迁移或新能力可能需要更高秩、更多层或全量微调。", evidence: "这是经验假设，不是所有任务定理" },
        },
        {
          section: 2,
          definition: { answer: "LoRA 前向把冻结基座输出与经过缩放的低秩增量输出相加。", evidence: "LoRA 分支怎样与原线性层相加" },
          problem: { answer: "它明确低秩分支怎样改变原层输出，以及 rank 和 alpha 怎样控制表达与尺度。", evidence: "α/r 控制更新尺度" },
          inputOutput: { answer: "输入是 k 维 x，输出是 d 维 h，A 与 B 在中间使用 r 维表示。", evidence: "x 是 k 维输入" },
          mechanism: { answer: "A 先压缩、B 再展开并乘 alpha/r，然后与 W x 相加。", evidence: "比例 α/r 控制低秩分支相对基座分支的强度" },
          interpretation: { answer: "rank 改变可表达方向，alpha 改变分支强度，必须联合消融而非孤立比较。", evidence: "必须和 α、层、数据一起消融" },
          boundary: { answer: "冻结 W 省去其更新状态，但梯度传播、基座计算和训练激活仍存在。", evidence: "基座计算与激活并未消失" },
        },
        {
          section: 3,
          definition: { answer: "参数账按 A 的 r×k 与 B 的 d×r 元素数相加，计算 LoRA 可训练参数。", evidence: "A+B 参数" },
          problem: { answer: "它量化一个大投影矩阵在指定 rank 下实际减少多少可训练状态。", evidence: "4096×4096 投影省多少可训练参数" },
          inputOutput: { answer: "输入是 d、k 和 rank，输出是 A+B 参数数、相对比例与容量判断。", evidence: "rank=8 时，16.8M 参数的矩阵" },
          mechanism: { answer: "rank 八时两个矩阵各有 32768 个元素，合计 65536 个可训练参数。", evidence: "32,768" },
          interpretation: { answer: "约百分之零点三九一是可训练参数比例，不是总显存或总计算比例。", evidence: "可训练比例 65,536 / 16,777,216 ≈ 0.391%" },
          boundary: { answer: "更低 rank 可能欠拟合，更高 rank 增加容量、优化器状态和过拟合风险。", evidence: "容量高、状态更多" },
        },
        {
          section: 4,
          definition: { answer: "LoRA 主要省冻结权重的梯度、优化器状态和任务检查点，而非全部训练资源。", evidence: "不为冻结 W 保存梯度与 Adam 一、二阶状态" },
          problem: { answer: "它解释训练参数只有百分之零点三九时，显存为何不会同比缩小。", evidence: "训练显存为什么不会缩到 0.39%" },
          inputOutput: { answer: "输入是权重、梯度、状态和激活清单，输出是全量微调与 LoRA 资源账。", evidence: "适配器检查点也小" },
          mechanism: { answer: "冻结项不存梯度和优化器状态，但完整基座仍前向且保存反向所需激活。", evidence: "基座权重、前向激活、反向所需中间值" },
          interpretation: { answer: "激活可随 batch、序列和层数成为主导，参数比例不能直接预测峰值显存。", evidence: "激活常随 batch、序列和层数主导" },
          boundary: { answer: "大矩阵 W x 仍占主要 FLOPs，因此训练速度不会按参数比例加速。", evidence: "训练速度也不会按参数比例加速" },
        },
        {
          section: 5,
          definition: { answer: "目标模块选择决定 LoRA 允许任务数据改动 Transformer 的哪些计算环节。", evidence: "选择允许任务数据改动哪些计算环节" },
          problem: { answer: "它权衡少量目标层的可控和节省，与覆盖更多层的适配容量。", evidence: "只对 Q/V 投影加 LoRA 与覆盖所有线性层" },
          inputOutput: { answer: "输入是候选模块、rank 和固定预算，输出是任务、通用、安全与分布外指标。", evidence: "输出是各方案的任务、通用、安全和未见分布指标" },
          mechanism: { answer: "注意力投影改变寻址与信息混合，MLP 投影改变每层特征变换。", evidence: "分别参与“找谁、怎样匹配、取什么信息、怎样送回主干”" },
          interpretation: { answer: "更多层令训练损失下降但留出收益停滞，表示容量未转化为泛化。", evidence: "容量没有转化为泛化" },
          boundary: { answer: "模块名称随架构变化，匹配失败可静默训练零参数，启动时必须断言。", evidence: "可能静默训练零参数" },
        },
        {
          section: 6,
          definition: { answer: "QLoRA 用低位量化存储冻结基座，同时只训练独立的 LoRA 适配器。", evidence: "量化后的冻结基座 + 可训练 LoRA" },
          problem: { answer: "它进一步降低基座权重存储，使有限显存也能进行参数高效微调。", evidence: "基座是 4-bit" },
          inputOutput: { answer: "输入是量化基座、LoRA 配置和数据，输出是适配器与完整量化训练配方。", evidence: "输出是适配器及其量化训练配方" },
          mechanism: { answer: "低位权重在计算时反量化参与矩阵乘，反向梯度通过运算传给 A 与 B。", evidence: "基座参数不更新，但这次矩阵运算仍把梯度传给 A/B" },
          interpretation: { answer: "分离推理与合并后再量化的差异应归因到不同产物路径，并分别评测。", evidence: "不是同一产物" },
          boundary: { answer: "QLoRA 同时受量化误差和低秩容量限制，显存下降也不等于 FLOPs 同比下降。", evidence: "训练内存下降不等于训练 FLOPs 同比例下降" },
        },
        {
          section: 7,
          definition: { answer: "适配器可与基座分离动态挂载，也可把增量合并回基座形成单一权重。", evidence: "合并 W←W+(α/r)BA" },
          problem: { answer: "它权衡固定部署的简单推理与多租户切换、回滚和版本治理。", evidence: "为什么文件更简单却更难回滚" },
          inputOutput: { answer: "输入是基座、适配器和合并配方，输出是分离服务或新的合并模型产物。", evidence: "分离保存便于按租户/任务切换和回滚" },
          mechanism: { answer: "合并消除额外分支乘法，分离则由路由在请求时选择和加载适配器。", evidence: "可消除分支额外矩阵乘" },
          interpretation: { answer: "分离小文件利于切换，合并简化推理但失去独立开关并产生新大文件。", evidence: "失去独立开关" },
          boundary: { answer: "适配器必须绑定基座和配置血缘，合并及量化顺序也会改变最终行为。", evidence: "必须绑定基座哈希、tokenizer、目标模块" },
        },
        {
          section: 8,
          definition: { answer: "少量低秩参数可经多层放大全局重排 logits，因此行为变化不按参数比例缩小。", evidence: "不按改动数量线性变化" },
          problem: { answer: "它解释小适配器为何既能学会格式，也可能破坏拒答和通用能力。", evidence: "为什么能让模型学会新格式，也能破坏安全拒答" },
          inputOutput: { answer: "输入是适配数据和低秩更新，输出是所有输入上改变后的概率与行为。", evidence: "少量低秩更新作用于多层和所有输入" },
          mechanism: { answer: "参数方向经层间放大改变最终 logits，窄数据还会形成模板、遗忘或触发器。", evidence: "能显著重排 logits" },
          interpretation: { answer: "目标指标提高不能代表风险同比很小，必须同时观察通用与安全回归。", evidence: "对目标、通用、长上下文、多语言、安全、工具和校准做回归" },
          boundary: { answer: "第三方适配器属于可执行模型制品，应按模型权重权限治理来源、签名和加载。", evidence: "加载权限应等同模型代码/权重" },
        },
        {
          section: 9,
          definition: { answer: "方案选择按知识更新、行为稳定、资源和能力重塑深度匹配不同技术。", evidence: "何时选 LoRA，何时选其他方案" },
          problem: { answer: "它避免把所有知识、格式、能力或端侧体积需求都错误地交给 LoRA。", evidence: "任务只需要新知识、固定格式或深层能力改变时" },
          inputOutput: { answer: "输入是任务性质和同预算基线，输出是提示、检索、LoRA、全量微调等选择。", evidence: "比较同预算基线" },
          mechanism: { answer: "比较每个方案达到成功门槛后的训练、服务、路由、评测与维护总成本。", evidence: "每成功任务成本" },
          interpretation: { answer: "增加 rank 或层数后留出增益平台且回归上升，说明应停止扩容量。", evidence: "真实留出增益平台而通用/安全退化上升" },
          boundary: { answer: "知识频繁更新优先检索，端侧压缩还需量化或蒸馏，广泛重塑可能要全量微调。", evidence: "知识频繁更新优先 RAG/工具" },
        },
      ],
    },

    "distillation": {
      contractVersion: 2,
      examples: [{
        section: 3,
        evidence: {
          setup: "教师 logits [4,2,0]",
          rule: "e^(z/2) / Σ",
          steps: "refund .665",
          interpretation: "温度 2 保持排序，却让 ask/reject 的相对信息更可见",
        },
      }],
      formulas: [{
        id: "distillation-soft-target-loss",
        section: 2,
        formulaIndex: 1,
        symbols: [
          { name: "p", meaning: "温度调整后分给某个类别的概率", evidence: "变成总和为 1 的概率 pᵀᵢ" },
          { name: "i", meaning: "正在查看的候选类别编号", evidence: "i 是类别编号" },
          { name: "T", meaning: "控制教师和学生软分布平坦程度的温度", evidence: "T 是温度" },
          { name: "softmax", meaning: "把一组原始分数归一化为总和为一的概率", evidence: "softmax 把 z/T 变成总和为 1 的概率" },
          { name: "z", meaning: "模型为各候选类别产生的未归一化原始分数", evidence: "z 是各类别未经归一化的原始分数" },
          { name: "L", meaning: "学生在硬标签与教师信号上的综合训练损失", evidence: "L 是学生的总训练损失" },
          { name: "α", meaning: "在人工真值监督和教师监督之间分配权重的系数", evidence: "α 在 0 到 1 之间" },
          { name: "硬标签", meaning: "由人工或可靠规则提供的目标类别监督", evidence: "L硬标签 衡量学生与人工真值的差距" },
          { name: "KL", meaning: "衡量学生软分布偏离教师软分布程度的非对称散度", evidence: "KL(p教师∥p学生) 衡量学生软分布偏离教师软分布多少" },
          { name: "教师", meaning: "为蒸馏样本提供目标软分布的较强模型", evidence: "教师软分布" },
          { name: "学生", meaning: "正在通过蒸馏损失更新的较小模型", evidence: "学生软分布" },
        ],
      }],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "知识蒸馏由教师为较小学生产生软分布、表示或示范等训练信号。", evidence: "用一个较强或较大的教师模型" },
          problem: { answer: "它让小模型在容量和成本更低时，尽量保留教师在目标分布上的行为。", evidence: "为较小学生模型产生训练信号" },
          inputOutput: { answer: "输入是同一样本，教师输出完整候选概率，学生输出自己的近似分布。", evidence: "教师输出 refund、ask、reject 的整张概率表" },
          mechanism: { answer: "软分布保留次优类别与边界关系，学生通过损失逼近而非只看唯一标签。", evidence: "学生拟合教师完整分布" },
          interpretation: { answer: "学生接近教师表示行为迁移成功，不等于教师判断具有事实真值。", evidence: "不表示教师判断是真值" },
          boundary: { answer: "教师概率会失准并携带偏差，必须与硬真值结合并在真实标签上校准。", evidence: "硬真值与教师信号应组合" },
        },
        {
          section: 2,
          definition: { answer: "温度软化先缩小 logits 差异，再用软分布 KL 与硬标签损失共同训练学生。", evidence: "增大 T 缩小 logit 差" },
          problem: { answer: "它让接近零的次优类别产生可学习信号，传递教师认为错误类别有多相似。", evidence: "能显示教师认为哪些错误“比较像”" },
          inputOutput: { answer: "输入是教师学生 logits、温度和真值，输出是软概率与综合蒸馏损失。", evidence: "L 是学生的总训练损失" },
          mechanism: { answer: "softmax 处理 z/T，损失按 alpha 混合硬标签项与经 T 平方缩放的 KL 项。", evidence: "控制真值监督与教师监督的比例" },
          interpretation: { answer: "正向 KL 更惩罚学生漏掉教师支持的类别，反向方向更倾向高概率模式。", evidence: "鼓励学生覆盖教师分布" },
          boundary: { answer: "温度只软化训练信号，不会自动修复教师或学生部署概率的校准。", evidence: "温度不是校准修复" },
        },
        {
          section: 3,
          definition: { answer: "数值例把同一教师 logits 分别以温度一和二归一化，比较软化效果。", evidence: "三个退款动作的温度软化" },
          problem: { answer: "它具体展示较高温度怎样在不改排序时提高次优类别的可见概率。", evidence: "在 T=1 与 T=2 时怎样变化" },
          inputOutput: { answer: "输入是三个动作的 logits 与温度，输出是各动作归一化后的概率。", evidence: "教师 logits [4,2,0]" },
          mechanism: { answer: "温度二先把 logits 除二，再取指数并除以各指数之和。", evidence: "e^(z/2) / Σ" },
          interpretation: { answer: "refund 仍最高，但 ask 与 reject 概率上升，为学生提供相对关系梯度。", evidence: "让 ask/reject 的相对信息更可见" },
          boundary: { answer: "仅硬标签只推动 refund 接近一，无法告诉学生两个错误类别的相对相似度。", evidence: "仅硬标签会只推动 refund 接近 1" },
        },
        {
          section: 4,
          definition: { answer: "蒸馏可在 logits、内部特征、样本关系或最终序列四类信号层级进行。", evidence: "先区分四种信号" },
          problem: { answer: "它说明教师接口受限或师生架构不同时，仍可选择哪类可见信号迁移。", evidence: "拿不到教师内部状态时" },
          inputOutput: { answer: "输入是教师接口、学生架构和目标能力，输出是对应监督数据与学生损失。", evidence: "输出是概率、特征、关系或示范数据" },
          mechanism: { answer: "学生分别匹配候选分数、中间向量、相似结构或教师生成的回答序列。", evidence: "越靠内部，提供的信息越细" },
          interpretation: { answer: "风格一致但换措辞失败，说明可能只复制了采样路径而非完整教师分布。", evidence: "只复制了采样路径" },
          boundary: { answer: "API 不开放 logits、词表不齐或层无法对应，都会限制可用蒸馏方法。", evidence: "强行逐层匹配会限制学生自己的表示方式" },
        },
        {
          section: 5,
          definition: { answer: "学生容量是其参数、层数、上下文、词表和计算深度共同限定的行为上限。", evidence: "学生的参数、层数、上下文、词表和计算深度" },
          problem: { answer: "它解释为何再多教师示范也不能把教师的全部能力无损塞进小学生。", evidence: "为什么不能通过足够多示范全部塞进学生" },
          inputOutput: { answer: "输入是学生容量、蒸馏数据与目标权重，输出是被优先保留和先丢失的能力。", evidence: "优先保留高频、易拟合和目标函数权重高的行为" },
          mechanism: { answer: "有限容量在任务间分配表示，数据频率和损失权重决定优化优先级。", evidence: "因互相冲突的任务产生干扰" },
          interpretation: { answer: "增加样本后收益平台表示容量或目标冲突成为瓶颈，不是教师查询仍不足。", evidence: "增加教师样本会进入收益平台" },
          boundary: { answer: "学生单项基准超过教师可能来自匹配、正则或污染，不能推出全面更强。", evidence: "不等于全面更强" },
        },
        {
          section: 6,
          definition: { answer: "蒸馏课程是按目标切片选择、验证、去重并组织教师样本的覆盖方案。", evidence: "用真实流量、困难样本、高风险和对抗集构造课程" },
          problem: { answer: "它防止最强教师只在狭窄数据上教学，导致学生在语言、长度和工具上偏科。", evidence: "最强教师只在短英文 FAQ 上教学" },
          inputOutput: { answer: "输入是真实流量、困难和高风险提示，输出是带版本、概率与验证结果的课程。", evidence: "保留概率/版本/提示" },
          mechanism: { answer: "教师多样采样后由规则、执行器或人工验证，再去重并控制难度与风格。", evidence: "外部规则、执行器或人工验证" },
          interpretation: { answer: "学生只在课程分布逼近教师，不代表凭空获得课程未覆盖的能力。", evidence: "不会凭空获得长上下文、多语言、工具、拒答和故障恢复" },
          boundary: { answer: "教师查询有成本，主动选学生不确定且教师可能有增益的样本更有效。", evidence: "而不是均匀浪费" },
        },
        {
          section: 7,
          definition: { answer: "蒸馏会连同教师的错误、偏见、拒答倾向和不确定性表达一起迁移。", evidence: "软分布会传递教师偏好" },
          problem: { answer: "它反驳小模型天然更安全，并要求用独立真值识别师生共同盲点。", evidence: "是否也自然更安全" },
          inputOutput: { answer: "输入是教师软分布或示范，输出是可能继承或表面化这些行为的学生。", evidence: "序列示范可能包含幻觉、隐私、偏见或过度拒答" },
          mechanism: { answer: "学生模仿教师概率和序列，容量不足时还可能只学安全措辞而丢失条件判断。", evidence: "只学到表面安全措辞" },
          interpretation: { answer: "师生一致或同源验证高分可能只是共同盲点，不能代替安全真值。", evidence: "不用教师一致率代替安全真值" },
          boundary: { answer: "敏感任务需结合硬标签、独立规则、多教师分歧和人工审查。", evidence: "敏感任务结合硬标签" },
        },
        {
          section: 8,
          definition: { answer: "蒸馏、量化、剪枝和 LoRA 分别改变模型行为容量、位宽、结构和适配增量。", evidence: "在不同维度压缩" },
          problem: { answer: "它防止把四种都称为更小的方法误认为具有相同收益与损失来源。", evidence: "它们各改变了什么" },
          inputOutput: { answer: "输入是原模型与压缩目标，输出分别是学生、低位权重、稀疏结构或适配器。", evidence: "训练更小学生行为" },
          mechanism: { answer: "各方法通过重训行为、舍入数值、删除连接或限制低秩更新来减少不同资源。", evidence: "移除权重/结构" },
          interpretation: { answer: "组合后误差会交互，单项方法的独立评测不能代表最终系统。", evidence: "最终组合必须重新端到端评测" },
          boundary: { answer: "量化会放大脆弱切片，教师若已量化，其分布本身也已发生改变。", evidence: "量化可能加剧学生已脆弱切片" },
        },
        {
          section: 9,
          definition: { answer: "部署验收用质量、容量与系统成本的联合前沿判断压缩是否值得。", evidence: "部署证据是质量—容量—成本前沿" },
          problem: { answer: "它检验学生参数更少是否真正降低每次成功任务成本，而非只让失败更便宜。", evidence: "更便宜但更常失败" },
          inputOutput: { answer: "输入是师生逐样本与系统测量，输出是能力损失切片和成本收益前沿。", evidence: "同时报告逐 token KL/困惑度" },
          mechanism: { answer: "比较目标、长上下文、安全等质量切片及延迟、能耗和人工接管成本。", evidence: "系统侧测 TTFT/TPOT、吞吐、显存、能耗" },
          interpretation: { answer: "teacher-only、student-only 与 both-wrong 切片区分迁移损失和教师自身错误。", evidence: "教师本身错误不能算学生“未模仿失败”" },
          boundary: { answer: "只有硬风险门槛通过、硬件收益真实且牺牲能力可回退时才可接受。", evidence: "硬风险门槛通过" },
        },
      ],
    },

    "distributed-training": {
      contractVersion: 2,
      examples: [{
        section: 3,
        evidence: {
          setup: "每卡 4 样本、累积 8 步，8 GPU",
          rule: "每卡 4×累积8×8卡=256 样本",
          steps: "800/(8×140)=71.4%",
          interpretation: "额外 40ms 来自通信、同步和负载不均",
        },
      }],
      formulas: [
        {
          id: "distributed-training-global-batch-gradient",
          section: 2,
          formulaIndex: 1,
          symbols: [
            { name: "B", meaning: "一次参数更新实际使用的全局样本数量", evidence: "B全局 是一次参数更新实际使用的样本数" },
            { name: "b", meaning: "每个数据并行设备在一个微步处理的局部批量", evidence: "b 是每卡每个微步的局部 batch" },
            { name: "n", meaning: "并行处理不同样本的数据并行副本数", evidence: "n 是数据并行副本数" },
            { name: "a", meaning: "执行一次参数更新前累计的微步数量", evidence: "a 是累计多少个微步才更新" },
            { name: "g", meaning: "本地或全局平均的参数梯度", evidence: "gᵣ 是第 r 个 rank 的累计梯度" },
            { name: "r", meaning: "参与数据并行训练的进程或设备编号", evidence: "r 是 rank 编号" },
          ],
        },
        {
          id: "distributed-training-pipeline-bubble",
          section: 5,
          formulaIndex: 1,
          symbols: [
            { name: "f", meaning: "理想化流水线中没有有效计算的时间比例", evidence: "f气泡 是理想化空闲时间比例" },
            { name: "p", meaning: "流水线划分出的连续模型阶段数量", evidence: "p 是流水线阶段数" },
            { name: "m", meaning: "一个批次拆出的 micro-batch 数量", evidence: "m 是一个批次拆出的 micro-batch 数" },
          ],
        },
        {
          id: "distributed-training-3d-global-batch",
          section: 7,
          formulaIndex: 1,
          symbols: [
            { name: "B", meaning: "全局批量或每个数据副本的局部微批量", evidence: "B微批 是每个数据并行副本一次处理的样本数" },
            { name: "a", meaning: "累积多少个局部微批后执行一次参数更新", evidence: "a 是梯度累积步数" },
            { name: "N", meaning: "处理不同样本的数据并行副本数量", evidence: "N数据并行 是处理不同样本的数据副本数" },
            { name: "TP", meaning: "共同计算同一层张量的张量并行度", evidence: "TP 与 PP 只是共同完成同一副本的模型计算" },
            { name: "PP", meaning: "共同计算同一样本不同模型阶段的流水线并行度", evidence: "TP 与 PP 只是共同完成同一副本的模型计算" },
          ],
        },
      ],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "分布式训练先核算权重、梯度、优化器、激活和缓冲，再选择如何分片。", evidence: "权重、梯度、优化器、激活、通信缓冲和碎片逐项估算" },
          problem: { answer: "它解决推理权重虽可装入单卡，但完整反向训练状态远超单卡内存的问题。", evidence: "为何 24GB GPU 仍不能全量 Adam 微调" },
          inputOutput: { answer: "输入是模型、精度、优化器、batch 与序列配置，输出是峰值内存账和并行选择。", evidence: "输出是各类状态的峰值及每卡能否容纳" },
          mechanism: { answer: "数据、状态、单层、模型层和激活分别可由不同并行或重计算策略处理。", evidence: "分片策略分别解决不同对象" },
          interpretation: { answer: "权重能加载只证明推理主体可放下，不证明梯度与状态也能运行。", evidence: "不证明反向传播能运行" },
          boundary: { answer: "静态估算受实现、碎片和通信缓冲影响，必须实测峰值并保留余量。", evidence: "必须用实测峰值留出安全余量" },
        },
        {
          section: 2,
          definition: { answer: "同步数据并行让各副本看不同样本，再归约梯度执行同一次参数更新。", evidence: "各 rank 用相同全局平均梯度更新" },
          problem: { answer: "它在扩大样本吞吐时保持所有模型副本参数一致。", evidence: "为什么最后参数仍保持一致" },
          inputOutput: { answer: "输入是各 rank 本地累计梯度，输出是每个副本相同的全局平均梯度。", evidence: "把结果发回每一方" },
          mechanism: { answer: "all-reduce 对各设备梯度求和或平均，所有副本再使用同一结果更新。", evidence: "共同求和并把结果发回每一方" },
          interpretation: { answer: "设备数变化会改变全局批量和优化噪声，需固定训练语义后再比较硬件。", evidence: "会增大全局批量，改变梯度噪声" },
          boundary: { answer: "数据顺序、随机流、dropout 与浮点归约顺序仍会令训练轨迹不同。", evidence: "loss 看似相同不代表实验相同" },
        },
        {
          section: 3,
          definition: { answer: "运行例同时计算八卡数据并行的全局批量与固定工作强扩展效率。", evidence: "8 卡全局批量与强扩展效率" },
          problem: { answer: "它检验设备、局部 batch 和累积怎样决定一次更新样本数及速度损耗。", evidence: "一次优化步看了多少样本" },
          inputOutput: { answer: "输入是八卡、每卡四样本、累积八步和实测时间，输出批量与效率。", evidence: "每卡 4 样本、累积 8 步，8 GPU" },
          mechanism: { answer: "八个副本各累计八个微步，第八步同步后才共同更新一次。", evidence: "第 8 步同步后才进行一次全局更新" },
          interpretation: { answer: "百分之七十一点四效率表明理想加速被通信、同步和负载不均削弱。", evidence: "额外 40ms 来自通信、同步和负载不均" },
          boundary: { answer: "该效率只适用于固定总工作的强扩展，不能直接代表弱扩展或最终质量。", evidence: "同一总工作时间" },
        },
        {
          section: 4,
          definition: { answer: "张量并行把同一层矩阵或注意力头分给多卡共同完成。", evidence: "把同一层矩阵或注意力头分给多张卡共同计算" },
          problem: { answer: "它使单层权重或激活超过单卡容量时仍能执行该层计算。", evidence: "单个 4096×16384 MLP 放不下一张卡" },
          inputOutput: { answer: "输入是同一批激活和分片权重，输出是经集合通信拼回的等价层结果。", evidence: "输出要经过集合通信拼回" },
          mechanism: { answer: "列并行产生局部输出，行并行消费局部特征并用 all-reduce 汇总。", evidence: "后续行并行可消费局部特征" },
          interpretation: { answer: "每卡内存下降但单位卡吞吐下降，通常表示通信或小算子抵消收益。", evidence: "通信或局部算子太小抵消了收益" },
          boundary: { answer: "层内通信频繁，TP 更适合同节点高速互连，不宜跨慢网盲目增加度数。", evidence: "不应仅为“多用几张卡”跨慢网络扩大" },
        },
        {
          section: 5,
          definition: { answer: "流水线并行把连续模型层分成阶段，并以多个微批填充前向反向节拍。", evidence: "把连续模型层分成 p 个阶段" },
          problem: { answer: "它让模型层跨设备放置，同时尽量减少阶段等待形成的气泡。", evidence: "理想气泡比例是多少" },
          inputOutput: { answer: "输入是阶段数、微批数和各阶段成本，输出是调度、气泡率和峰值激活。", evidence: "一个大 batch 再拆成 m 个 micro-batch" },
          mechanism: { answer: "微批依次穿过阶段，增加微批可填充启动收尾空闲但会增加其他开销。", evidence: "增加 m 减气泡" },
          interpretation: { answer: "四阶段八微批的简化气泡约百分之二十七点三，表示仍有等待时间。", evidence: "气泡约 27.3%" },
          boundary: { answer: "简式假设阶段成本接近，不含通信、前后向差异和异步权重版本问题。", evidence: "只描述阶段成本相近的简化调度" },
        },
        {
          section: 6,
          definition: { answer: "ZeRO 和 FSDP 在数据并行副本间分片优化器、梯度及参数等冗余状态。", evidence: "不再各自长期保存完整训练状态" },
          problem: { answer: "它降低普通数据并行每卡复制完整 Adam 状态和参数的内存浪费。", evidence: "怎样按 rank 分摊" },
          inputOutput: { answer: "输入是按 rank 分片的训练状态，输出仍应等价于同步数据并行的一次更新。", evidence: "输出仍应等价于一次同步数据并行更新" },
          mechanism: { answer: "计算前 all-gather 本层参数，反向后 reduce-scatter 梯度并保留各自分片。", evidence: "只把不同分片留在各卡" },
          interpretation: { answer: "峰值下降而集合通信上升是用通信换内存的预期结果。", evidence: "用通信换内存的预期结果" },
          boundary: { answer: "细粒度预取、offload 和检查点重分片会引入带宽、复杂度与恢复限制。", evidence: "可能被搬运带宽限制" },
        },
        {
          section: 7,
          definition: { answer: "三维并行按设备拓扑组合数据、张量和流水线三个协作轴。", evidence: "DP、TP、PP 分别表示数据并行、张量并行和流水线并行" },
          problem: { answer: "它在大集群中匹配不同通信频率与链路速度，并保持 batch 语义正确。", evidence: "通信域如何不同" },
          inputOutput: { answer: "输入是拓扑、并行度与批量配置，输出是 rank 分组、通信域和优化语义。", evidence: "输出是 rank 分组、通信域与不变的优化器语义" },
          mechanism: { answer: "TP 放高速域、PP 传相邻激活、DP 同步不同样本的梯度与状态。", evidence: "TP 组内每层频繁通信" },
          interpretation: { answer: "只有 DP 副本处理不同样本，TP 和 PP 合作同一样本所以不增加全局批量。", evidence: "TP/PP 合作处理同一批样本" },
          boundary: { answer: "把全部 GPU 都乘入 batch 会错误放大全局批量并改变学习率和训练轨迹。", evidence: "错误改变学习率和训练轨迹" },
        },
        {
          section: 8,
          definition: { answer: "可靠检查点保存恢复训练所需的模型、优化器、随机流、数据游标和并行元数据。", evidence: "保存模型、优化器、调度器、随机数、数据游标" },
          problem: { answer: "它避免长时间训练因节点故障从头开始或从不一致状态继续。", evidence: "训练两周后一个节点故障" },
          inputOutput: { answer: "输入是全量分片训练状态，输出是原子、完整且可重分片或明确受限的快照。", evidence: "临时产物+原子清单" },
          mechanism: { answer: "各 rank 写分片并由原子清单提交，恢复时重建状态、随机流和数据位置。", evidence: "避免一半 rank 成功的损坏快照" },
          interpretation: { answer: "真实恢复后损失和样本序列一致，比只检查文件存在更能证明正确。", evidence: "比较恢复后 loss/样本序列" },
          boundary: { answer: "间隔需权衡写入开销和丢失计算，成员变化还会影响 batch 与随机流。", evidence: "在写入开销与丢失计算间取舍" },
        },
        {
          section: 9,
          definition: { answer: "强扩展固定总工作测加速，弱扩展固定每卡工作测规模增长下的单位效率。", evidence: "强扩展固定总模型与总工作" },
          problem: { answer: "它避免 GPU 增加后用不同问题规模或不同训练语义制造虚假加速。", evidence: "应该保持总问题大小还是每卡问题大小" },
          inputOutput: { answer: "输入是多设备数下同一协议，输出速度、效率、资源、恢复和质量联合报告。", evidence: "输出是速度、效率、内存、功耗、恢复与最终质量的联合报告" },
          mechanism: { answer: "trace 把 step 拆成数据、前向、反向、通信、优化器与检查点定位等待。", evidence: "GPU 利用率低只是症状" },
          interpretation: { answer: "MFU 低只说明有效模型计算占峰值较少，不能单独定位具体瓶颈。", evidence: "不能单独判断瓶颈来自数据、通信还是小算子" },
          boundary: { answer: "吞吐提升但最终质量下降不算成功，必须同时验证 batch、随机和数值语义。", evidence: "吞吐提高但最终质量下降不是成功扩展" },
        },
      ],
    },

    "synthetic-data": {
      contractVersion: 2,
      examples: [{
        section: 4,
        evidence: {
          setup: "生成 100k",
          rule: "资格、金额和证据规则",
          steps: "规则通过 60k",
          interpretation: "漏斗的目标不是最大保留",
        },
      }],
      formulas: [
        {
          id: "synthetic-data-retained-distribution",
          section: 3,
          formulaIndex: 1,
          symbols: [
            { name: "q", meaning: "生成或最终保留样本的相对概率分布", evidence: "最终分布 q保留" },
            { name: "x", meaning: "合成得到的任务输入", evidence: "x 是合成输入" },
            { name: "y", meaning: "与输入配套的标签、回答或轨迹", evidence: "y 是标签、回答或轨迹" },
            { name: "a", meaning: "验证器接受某个候选样本的概率", evidence: "a(x,y) 是验证器接受它的概率" },
            { name: "w", meaning: "控制主题、难度、语言或风险配额的保留权重", evidence: "w(x,y) 是为主题、难度、语言或风险设置的保留权重" },
          ],
        },
        {
          id: "synthetic-data-generational-mixture",
          section: 7,
          formulaIndex: 1,
          symbols: [
            { name: "D", meaning: "某一代使用的训练数据分布", evidence: "Dₜ 是第 t 代模型看到的训练分布" },
            { name: "t", meaning: "合成数据回流迭代的代数编号", evidence: "第 t 代生成数据分布" },
            { name: "α", meaning: "当前训练混合中合成数据所占比例", evidence: "α 是合成数据所占比例" },
            { name: "真实", meaning: "保留下来的原始真实数据分布", evidence: "D真实 是保留的原始真实数据分布" },
            { name: "合成", meaning: "当前一代生成器产生的数据分布", evidence: "D合成,t 是第 t 代生成数据分布" },
          ],
        },
      ],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "合成数据是由模型、程序或模拟器产生，而非直接从目标世界观察的训练样本。", evidence: "合成数据 是由模型、程序或模拟器产生" },
          problem: { answer: "它针对真实数据缺口补充边界组合、改写、标签、结果或环境轨迹。", evidence: "先从真实失败切片定义缺什么" },
          inputOutput: { answer: "输入是待补失败切片和生成规则，输出是样本、标签、轨迹或执行结果。", evidence: "输出可以是输入、标签、推理轨迹" },
          mechanism: { answer: "生成器提出候选，独立证据筛选真正覆盖缺口且正确的样本。", evidence: "通过独立验证" },
          interpretation: { answer: "在合成集上变准只表示适应该集，必须看真实隔离集是否改善。", evidence: "最终要看真实隔离测试" },
          boundary: { answer: "生成数量不等于独立信息，开放世界事实不能由教师凭记忆创造。", evidence: "数量不代表独立性、新颖性或正确性" },
        },
        {
          section: 2,
          definition: { answer: "教师、程序、自训练和数据增强分别依赖不同的真值来源与保持假设。", evidence: "四种来源拥有不同真值结构" },
          problem: { answer: "它防止用同一信任规则处理教师偏差、模拟差距、自我确认和标签漂移。", evidence: "不能共用一套信任假设" },
          inputOutput: { answer: "输入是缺口、生成器和真值来源，输出是带来源类型与验证要求的数据管线。", evidence: "输出是带来源类型和验证要求的数据管线" },
          mechanism: { answer: "程序提供骨架，教师增加语言变化，再由规则或人工进行独立复核。", evidence: "程序构造可验证骨架" },
          interpretation: { answer: "来源标签表示信任结构不同，不应把所有合成样本视为同等可靠。", evidence: "不能混成“synthetic=true”一个标签" },
          boundary: { answer: "每类都有限制：程序有现实差距，教师有偏差，自训练会确认错误，增强会改标签。", evidence: "变换偷偷改标签" },
        },
        {
          section: 3,
          definition: { answer: "保留分布由生成频率、验证接受概率和覆盖配比权重共同相乘决定。", evidence: "三项相乘后还要对所有保留候选归一化" },
          problem: { answer: "它解释验证通过率很高时，保留集为何仍可能集中于简单重复样本。", evidence: "保留集仍可能充满简单重复题" },
          inputOutput: { answer: "输入是候选分布、接受概率和配额，输出是归一化后的最终训练分布。", evidence: "才得到总和为 1 的最终分布" },
          mechanism: { answer: "生成器限定可见候选，验证器筛选，权重再调整通过者的主题与难度比例。", evidence: "生成器决定候选能到哪里" },
          interpretation: { answer: "高接受率可能只表示生成器迎合弱验证器，不能单独证明数据质量。", evidence: "高接受率可能只是生成器迎合了弱验证器" },
          boundary: { answer: "验证器既删除错误也选择可存活的风格和解法，因此自身必须独立评测。", evidence: "验证器也是选择器" },
        },
        {
          section: 4,
          definition: { answer: "漏斗例把十万退款候选依次做规则验证、语义去重和覆盖配额筛选。", evidence: "10 万候选最后为何只保留 1.2 万" },
          problem: { answer: "它展示最大化候选或保留数量为何不是构造高价值训练集的目标。", evidence: "每一步损失与收益是什么" },
          inputOutput: { answer: "输入是十万候选，输出是一万二千条经验证、去重并按目标切片配额的数据。", evidence: "配额保留 12k" },
          mechanism: { answer: "规则去错、语义去重去近邻、配额再纠正语言难度与风险覆盖。", evidence: "最后按语言、难度和风险配额纠正剩余分布" },
          interpretation: { answer: "最终百分之十二接受率说明多数候选错误、重复或属于过量切片。", evidence: "总体接受率 12%" },
          boundary: { answer: "合成比例不能因候选便宜任意升高，真实锚点保留尾部和世界约束。", evidence: "真实锚点用于保留语言尾部和外部世界约束" },
        },
        {
          section: 5,
          definition: { answer: "可执行验证只证明测试、方程或解析规则明确写出的特定性质。", evidence: "执行器能证明特定性质" },
          problem: { answer: "它用于快速筛查代码、数学和结构化输出，却不能替代完整需求与安全真值。", evidence: "为什么训练样本仍可能有毒" },
          inputOutput: { answer: "输入是候选与测试或约束，输出是通过失败及可选的执行证据。", evidence: "程序在给定测试通过" },
          mechanism: { answer: "静态规则、执行、独立模型和人工多重验证，并用故意错误测试验证器。", evidence: "故意制造错误看能否拒绝" },
          interpretation: { answer: "通过表示满足已写断言，不表示覆盖未写边界、过程正确或没有漏洞。", evidence: "不能证明测试覆盖未写边界" },
          boundary: { answer: "生成器会寻找验证漏洞，同源教师和裁判也会共享盲点。", evidence: "两个模型都同意”不等于独立证据" },
        },
        {
          section: 6,
          definition: { answer: "覆盖评测把词面、语义、任务结构、解法和群体多样性分开衡量。", evidence: "词面、语义、结构、解法和群体多样性是不同维度" },
          problem: { answer: "它防止 embedding 距离或高温措辞变化冒充真实用户任务覆盖。", evidence: "真实用户输入仍可能覆盖不到" },
          inputOutput: { answer: "输入是合成候选、真实失败分类和切片，输出是多种覆盖与下游指标。", evidence: "输出是重复率、难度、覆盖、真假可分性和下游增益" },
          mechanism: { answer: "按真实失败建覆盖矩阵，每格设置目标量与真实锚点，再做隔离集消融。", evidence: "在每格设置目标量与真实锚点" },
          interpretation: { answer: "单一多样性指标不能证明现实相关、未知长尾或没有副作用。", evidence: "单项指标高不能互相替代" },
          boundary: { answer: "最终结论需比较真实基线、加合成、等量真实和打乱标签等对照。", evidence: "真实基线、加合成、等量真实、打乱标签等对照" },
        },
        {
          section: 7,
          definition: { answer: "模型坍缩是合成回流时尾部模式消失、错误和风格逐代放大的退化。", evidence: "稀有模式会逐代消失" },
          problem: { answer: "它判断模型学习模型输出是否必然退化，以及哪些混合方式加强反馈回路。", evidence: "是否必然一代比一代差" },
          inputOutput: { answer: "输入是真实与当代合成分布及比例，输出是下一代训练分布和覆盖变化。", evidence: "Dₜ 是第 t 代模型看到的训练分布" },
          mechanism: { answer: "替换真实数据且欠采样尾部会强化退化，保留真实锚点和配额可减弱。", evidence: "持续累积原始真实数据、限制合成比例" },
          interpretation: { answer: "平均准确率稳定而少数语言下降，仍表示尾部可能已经发生坍缩。", evidence: "少数语言与罕见场景可能已坍缩" },
          boundary: { answer: "合成并非必然崩溃，实际路径还取决于跨代累积、验证误差和覆盖控制。", evidence: "不能简化成“合成必崩”或“筛选就安全”" },
        },
        {
          section: 8,
          definition: { answer: "合成数据治理记录来源谱系、许可、敏感性、污染和可撤回路径。", evidence: "带稳定 ID、来源谱系、许可和撤回路径的样本" },
          problem: { answer: "它反驳自己生成的文本天然没有版权、隐私或测试污染问题。", evidence: "是否天然没有版权、隐私或测试污染问题" },
          inputOutput: { answer: "输入是种子、生成器、模板与验证器，输出是可追踪和可撤回的数据制品。", evidence: "治理输入是种子数据、生成器、模板、验证器和混合计划" },
          mechanism: { answer: "生成前查用途，生成后扫记忆、PII 和评测近邻，再去重、限额与隔离。", evidence: "生成后扫描记忆式片段" },
          interpretation: { answer: "扫描通过只说明当前规则未发现问题，不构成法律或权利结论。", evidence: "不是版权、隐私或授权结论" },
          boundary: { answer: "具体法律与合同义务随地区和用途变化，模型生成本身不决定权利。", evidence: "具体法律与合同判断需按地区和用途处理" },
        },
        {
          section: 9,
          definition: { answer: "合成数据决策比较其在真实缺口上的边际收益与收集真实数据的替代成本。", evidence: "何时值得用，何时应优先收集真实数据" },
          problem: { answer: "它识别规则明确可验证的适用任务，以及开放偏好和罕见伤害等高风险任务。", evidence: "最适合补哪类缺口" },
          inputOutput: { answer: "输入是缺口、验证能力、真实数据成本和风险，输出是合成、真实或组合方案。", evidence: "比较“加合成”与“等预算真实/人工/工具改进”" },
          mechanism: { answer: "先小规模对照并按切片看边际增益，真实指标不升就停止扩量。", evidence: "真实指标不升，应停止扩量" },
          interpretation: { answer: "只更像教师而真实指标不升，表示迁移教师风格而非解决真实缺口。", evidence: "合成只让模型更像教师" },
          boundary: { answer: "开放世界事实、文化偏好、罕见伤害与真实意图更需要真实观察和专家参与。", evidence: "应投资真实观察、专家标注与参与式评估" },
        },
      ],
    },

    "quantization": {
      contractVersion: 2,
      examples: [{
        section: 3,
        evidence: {
          setup: "对称 INT3 范围 −4…3",
          rule: "s=1.2/3=0.4",
          steps: "x=−1.1→q=−3→−1.2",
          interpretation: "舍入造成小误差，超出范围的 1.25 被截断",
        },
      }],
      formulas: [{
        id: "quantization-linear-map",
        section: 2,
        formulaIndex: 1,
        symbols: [
          { name: "x", meaning: "执行量化前的原始浮点数值", evidence: "x 是原浮点值" },
          { name: "s", meaning: "相邻整数格点对应的浮点步长尺度", evidence: "s 是相邻整数格点代表的浮点步长" },
          { name: "round", meaning: "把实数舍入为最近整数的操作", evidence: "round 取最近整数" },
          { name: "z", meaning: "让某个整数编码精确对应浮点零的零点", evidence: "z 是让某个整数格点对应浮点零的 zero-point" },
          { name: "clip", meaning: "把超出范围的结果限制到整数上下限", evidence: "clip 把超范围结果限制在整数下限" },
          { name: "q", meaning: "量化后存储和计算使用的整数编码", evidence: "最终编码是 q" },
        ],
      }],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "量化把连续浮点数映射到有限离散编码，并在计算时使用近似值。", evidence: "映射到有限个离散格点" },
          problem: { answer: "它以可控数值误差减少模型权重、激活或 KV 的存储与带宽需求。", evidence: "更低位宽减少模型读取的字节" },
          inputOutput: { answer: "输入是浮点权重、激活或缓存，输出是整数编码、尺度和还原近似值。", evidence: "输出是整数编码、尺度元数据和计算时还原的近似值" },
          mechanism: { answer: "区间内数值舍入到格点，区间外截断，导致原值差异部分消失。", evidence: "落在同一格的连续值会变得不可区分" },
          interpretation: { answer: "文件变小说明数值表示更紧凑，不表示推理仍使用原始精确数值。", evidence: "量化不是压缩文件后无损解压" },
          boundary: { answer: "位宽标签不含对象、符号范围和量化配置，不能由 INT4 单独推断效果。", evidence: "不能只看“INT4”猜范围" },
        },
        {
          section: 2,
          definition: { answer: "线性量化用 scale 和 zero-point 在浮点区间与整数格点间建立映射。", evidence: "浮点范围怎样对应整数范围" },
          problem: { answer: "它明确编码、舍入、截断和反量化怎样产生可计算的近似值。", evidence: "它通常不再与 x 完全相等" },
          inputOutput: { answer: "输入是浮点 x、尺度、零点和整数范围，输出是编码 q 与近似值 x̂。", evidence: "最终编码是 q" },
          mechanism: { answer: "先除尺度并舍入、加零点、截断到上下限，再按尺度和零点反量化。", evidence: "把超范围结果限制在整数下限" },
          interpretation: { answer: "误差由位宽、范围和步长共同决定，对称与非对称还会改变格点利用。", evidence: "范围与步长共同选择的结果" },
          boundary: { answer: "覆盖极值会让主体格点变粗，截断极值则可能让重要异常值饱和。", evidence: "覆盖全部极值" },
        },
        {
          section: 3,
          definition: { answer: "数值例把四个浮点值映射到对称 INT3 格点，再计算反量化绝对误差。", evidence: "四个数怎样落到 INT3 格点" },
          problem: { answer: "它展示舍入误差与超范围截断，并说明改变 scale 的误差权衡。", evidence: "量化后误差多大" },
          inputOutput: { answer: "输入是 INT3 范围、最大绝对值和四个原值，输出编码、近似值与误差。", evidence: "对称 INT3 范围 −4…3" },
          mechanism: { answer: "以零点四为步长除、舍入并截断，再乘零点四还原近似值。", evidence: "s=1.2/3=0.4" },
          interpretation: { answer: "普通值产生小舍入误差，一点二五因超过正上限而被截到一点二。", evidence: "超出范围的 1.25 被截断" },
          boundary: { answer: "扩大 scale 覆盖一点二五会使其他格点更粗，因此不存在对所有值都更优的范围。", evidence: "其他格点更粗" },
        },
        {
          section: 4,
          definition: { answer: "量化粒度规定一整个张量、每通道或每个权重组共享一个尺度。", evidence: "per-tensor 为整张张量共用一个尺度" },
          problem: { answer: "它减少少数异常通道支配整张矩阵范围而压粗多数普通值的问题。", evidence: "为什么整张矩阵一个 scale 常被少数异常通道支配" },
          inputOutput: { answer: "输入是权重、分组轴和组大小，输出是各组整数编码与尺度元数据。", evidence: "输出是各组整数编码与尺度元数据" },
          mechanism: { answer: "更细分组分别适配局部范围，以更多 scale、索引和内核复杂度换较小误差。", evidence: "细粒度让每组适配自己的范围" },
          interpretation: { answer: "同为四位的文件若分组轴、大小和打包格式不同，不能直接比较。", evidence: "模型文件“4-bit”不可直接横比" },
          boundary: { answer: "更细粒度不保证更快，不支持布局时元数据和反量化会抵消收益。", evidence: "元数据读取和反量化可能抵消收益" },
        },
        {
          section: 5,
          definition: { answer: "异常值是幅度远大于主体的少数权重或激活，会拉大量化范围与步长。", evidence: "统一 scale 为覆盖极值而变大" },
          problem: { answer: "它解释少量大激活为何让多数普通值挤入靠近零的少数格点。", evidence: "少量大激活为什么让大多数普通值挤在零附近" },
          inputOutput: { answer: "输入是待量化层与校准激活，输出是范围、高精通道或补偿后的权重。", evidence: "输出是范围、保留高精度通道或经过补偿的权重" },
          mechanism: { answer: "不同方法保留异常通道、迁移尺度或按曲率与激活重要性补偿权重。", evidence: "它们分别处理异常通道、权重激活平衡和权重重要性" },
          interpretation: { answer: "平均误差小仍可能令少数关键 logits 排序翻转并改变工具或拒答动作。", evidence: "平均误差小不代表行为安全" },
          boundary: { answer: "盲目剪裁会伤害稀有 token、语言或长上下文，校准集必须覆盖真实难例。", evidence: "不能只用短英文百科" },
        },
        {
          section: 6,
          definition: { answer: "PTQ 在训练后量化，QAT 训练中模拟误差，QLoRA 在量化基座上训练适配器。", evidence: "三者的输出分别是量化模型、适应量化误差的新模型和可挂载适配器" },
          problem: { answer: "它帮助按误差敏感度和成本决定仅校准、重新训练还是参数高效适配。", evidence: "什么时候只用校准数据，什么时候需要重新训练" },
          inputOutput: { answer: "输入是原模型、校准或训练数据，输出依次为量化模型、新模型或适配器。", evidence: "保持低位基座冻结，只训练高精度低秩适配器" },
          mechanism: { answer: "PTQ 估尺度，QAT 在前向模拟舍入让权重适应，QLoRA 只更新低秩分支。", evidence: "在训练前向中模拟舍入与截断" },
          interpretation: { answer: "先以低成本 PTQ 为基线，仅在关键切片不达标时承担更高训练成本。", evidence: "应先从低成本 PTQ 基线开始" },
          boundary: { answer: "PTQ 仍需代表性数据，QAT 会过拟合，QLoRA 的最终合并产物还需重测。", evidence: "最终部署是否合并和重新量化要另做评测" },
        },
        {
          section: 7,
          definition: { answer: "量化速度收益取决于硬件内核、打包、负载与当前瓶颈，而非仅文件大小。", evidence: "省显存不保证更快" },
          problem: { answer: "它解释 INT4 文件缩小到 FP16 四分之一时端到端吞吐为何可能不升。", evidence: "为什么端到端吞吐可能不升" },
          inputOutput: { answer: "输入是目标硬件、负载和量化产物，输出是延迟、吞吐、显存、功耗等实测。", evidence: "输出应包括首 token 延迟、每 token 延迟、吞吐" },
          mechanism: { answer: "低位内核减少权重读取，反量化、格式转换、启动和小 batch 又会增加开销。", evidence: "会抵消带宽收益" },
          interpretation: { answer: "decode 常带宽受限更可能获益，prefill 是否获益取决于低精计算支持。", evidence: "prefill 是一次处理整段输入提示" },
          boundary: { answer: "能装入显存只通过容量门，CPU offload 的 PCIe 搬运仍可能违反延迟 SLO。", evidence: "不等于延迟满足 SLO" },
        },
        {
          section: 8,
          definition: { answer: "量化与推测解码、LoRA 合并、KV 压缩和张量并行会产生交互误差。", evidence: "量化误差会与后续优化叠加" },
          problem: { answer: "它防止把各单项优化的测试结果直接相加并当作最终产物质量。", evidence: "能把单项测试相加吗" },
          inputOutput: { answer: "输入是完整优化配方与最终模型，输出是重新量化校准后的端到端指标。", evidence: "按真实最终产物重新量化或校准" },
          mechanism: { answer: "合并改变权重范围、KV 误差耦合注意力、布局改变通信，因此旧 scale 会失效。", evidence: "LoRA 合并后权重范围变化" },
          interpretation: { answer: "同为 INT4 若基座、对象、粒度、数据、内核或硬件不同，就不可复现比较。", evidence: "否则“同为 INT4”无法复现" },
          boundary: { answer: "不能用更多重试掩盖压缩损失，因为会增加成本、延迟和选择偏差。", evidence: "不可把压缩损失用更多重试隐藏" },
        },
        {
          section: 9,
          definition: { answer: "量化评测同时检查逐样本排序翻转、长尾质量与目标硬件系统收益。", evidence: "评测要抓排序翻转和长尾退化" },
          problem: { answer: "它解释平均困惑度几乎不变时，工具和安全动作仍可能明显退化。", evidence: "为什么工具调用和安全仍可能明显变差" },
          inputOutput: { answer: "输入是相同负载下量化前后模型，输出质量差、延迟、吞吐、资源和失败样例。", evidence: "输出量化前后质量差、延迟区间" },
          mechanism: { answer: "按能力与风险切片比较 logits 排序，再在真实硬件测各延迟分位和成功成本。", evidence: "按通用能力、目标任务、稀有 token" },
          interpretation: { answer: "平均困惑度小变化不能排除接近边界的关键 token 排序翻转。", evidence: "不能排除少数关键动作排序翻转" },
          boundary: { answer: "只有硬风险切片不退化且系统收益在目标硬件成立，配置才能发布。", evidence: "量化配置才是可行方案" },
        },
      ],
    },

    "moe": {
      contractVersion: 2,
      examples: [{
        section: 3,
        evidence: {
          setup: "4 个专家、6 个 token、每 token 选 2 个",
          rule: "平均负载为 12/4=3",
          steps: "E1: 5 / cap 3",
          interpretation: "E1 的 5 路中有 2 路必须处理溢出",
        },
      }],
      formulas: [
        {
          id: "moe-topk-routing",
          section: 2,
          formulaIndex: 1,
          symbols: [
            { name: "x", meaning: "当前 token 经过共享层后的上下文向量", evidence: "x 是当前 token 的上下文向量" },
            { name: "W", meaning: "把 token 表示映射为各专家分数的路由器权重", evidence: "Wᵣ 是路由器权重" },
            { name: "g", meaning: "softmax 产生的所有专家路由概率向量", evidence: "概率向量 g" },
            { name: "softmax", meaning: "把专家原始分数归一化为总和为一的概率", evidence: "softmax 输出每个专家的概率向量" },
            { name: "k", meaning: "当前 token 要选择的专家数量", evidence: "k 是选几个专家" },
            { name: "S", meaning: "概率最高的 k 个专家编号组成的集合", evidence: "S 是概率最高的 k 个专家编号集合" },
            { name: "e", meaning: "被选集合中的某一个专家编号", evidence: "e 是其中一个专家" },
            { name: "E", meaning: "某个专家前馈网络对 token 向量的输出", evidence: "Eₑ(x) 是专家 e 的 FFN 输出" },
            { name: "y", meaning: "选中专家输出按路由权重合成的最终结果", evidence: "y 是加权合成的最终专家输出" },
          ],
        },
        {
          id: "moe-expert-capacity",
          section: 3,
          formulaIndex: 1,
          symbols: [
            { name: "C", meaning: "单个专家在当前批次最多接收的路由数量", evidence: "C 是单个专家在这一批最多接收的路由数" },
            { name: "ceil", meaning: "把计算结果向上取为最近整数", evidence: "ceil 表示向上取整" },
            { name: "c", meaning: "在平均专家负载上增加容量余量的因子", evidence: "c 是容量因子" },
            { name: "N", meaning: "当前用于路由的 token 总数", evidence: "N 是 token 数" },
            { name: "k", meaning: "每个 token 选择的专家数量", evidence: "k 是每个 token 选择的专家数" },
            { name: "E", meaning: "当前 MoE 层拥有的专家总数", evidence: "E 是专家总数" },
          ],
        },
      ],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "MoE 用多个可选 FFN 专家替换稠密 FFN，并为每个 token 只激活少数专家。", evidence: "替换为多个可选 FFN“专家”" },
          problem: { answer: "它让模型总参数容量增长，而单 token 的专家计算不必按总参数同比增长。", evidence: "总参数大，不等于每个 token 全部计算" },
          inputOutput: { answer: "输入是 token 上下文表示，输出是与原 FFN 相同维度的更新表示。", evidence: "输出仍是与原 FFN 相同维度的更新表示" },
          mechanism: { answer: "路由器选 top-k 专家执行，未选专家跳过，共享注意力等仍稠密计算。", evidence: "未选专家本次不计算" },
          interpretation: { answer: "总参数表示可选容量，激活参数更接近本 token 计算，但两者都不等于墙钟速度。", evidence: "不表示每个 token 调用了全部能力" },
          boundary: { answer: "总存储、加载、路由和通信仍增加，不能把稀疏专家当作免费稠密扩模。", evidence: "用参数容量与通信复杂度换取条件计算" },
        },
        {
          section: 2,
          definition: { answer: "top-k 路由为专家打分、选最高的 k 个，并加权合成它们的输出。", evidence: "路由器如何选择并组合专家" },
          problem: { answer: "它决定每个 token 使用哪些专家，以及多个专家结果怎样形成单一层输出。", evidence: "两个专家输出怎样合成" },
          inputOutput: { answer: "输入是 token 向量，输出是专家概率、选中集合和加权专家结果 y。", evidence: "y 是加权合成的最终专家输出" },
          mechanism: { answer: "W 路由打分经 softmax 得到 g，TopK 选 S，再在 S 内重归一化求和。", evidence: "只在已选集合 S 内重新归一化后的权重" },
          interpretation: { answer: "top-1 成本低但路径脆弱，top-2 增加冗余与表达也近似翻倍专家成本。", evidence: "top-2 增加冗余与表达" },
          boundary: { answer: "硬选择令未选专家无当前任务梯度，架构还可能混入共享专家，不能只看标签。", evidence: "未选专家收不到当前 token 的任务梯度" },
        },
        {
          section: 3,
          definition: { answer: "专家容量按平均路由负载乘容量因子并向上取整，限制单专家批次负载。", evidence: "容量按平均路由数乘安全系数分配" },
          problem: { answer: "它计算有限专家缓冲下热点专家会溢出多少，以及不同处理策略的代价。", evidence: "容量因子 1.0 时每专家能接多少" },
          inputOutput: { answer: "输入是 token、top-k、专家数和容量因子，输出容量及每个专家溢出量。", evidence: "4 个专家、6 个 token、每 token 选 2 个" },
          mechanism: { answer: "十二条路由除以四个专家得平均三条，CF 为一时容量就是三。", evidence: "平均负载为 12/4=3" },
          interpretation: { answer: "E1 收五条而容量三，说明两条必须丢弃、转路由或用更大容量。", evidence: "2 路必须处理溢出" },
          boundary: { answer: "提高容量减少丢弃却增加缓冲与最坏计算，重路由也会增加通信并改变语义。", evidence: "缓冲与最坏计算增" },
        },
        {
          section: 4,
          definition: { answer: "路由坍缩是少数专家越来越热门、其余专家因缺样本和梯度而饥饿的正反馈。", evidence: "专家几乎收不到样本和梯度" },
          problem: { answer: "它解释初期稍强的专家为何会持续吸收更多 token 并垄断训练信号。", evidence: "后续为什么可能越来越热门" },
          inputOutput: { answer: "输入是路由概率与实际分配，输出要兼顾任务质量、负载和溢出。", evidence: "输出要同时优化任务质量与专家负载" },
          mechanism: { answer: "辅助损失、探索噪声、z-loss 和容量约束分别抑制集中与数值过尖。", evidence: "约束路由 logits 不要无限变大" },
          interpretation: { answer: "专家熵和负载接近均匀只代表计算分散，不证明语义路由或群体质量。", evidence: "不能证明不同语言或群体获得同等质量" },
          boundary: { answer: "均衡过强会把本应去专业专家的 token 强行摊开并伤害任务质量。", evidence: "损害语义路由" },
        },
        {
          section: 5,
          definition: { answer: "专家并行以两次 all-to-all 把 token 发到专家设备并按原顺序返回。", evidence: "再 all-to-all 返回原顺序" },
          problem: { answer: "它让分散在不同 GPU 的专家处理各自 token，同时引入网络通信瓶颈。", evidence: "token 怎样到达被选专家再返回" },
          inputOutput: { answer: "输入是按目的专家分组的 token，输出是专家计算后恢复原序的表示。", evidence: "按目的专家打包 token" },
          mechanism: { answer: "设备按专家打包并全互换，专家计算后再全互换回发送设备。", evidence: "all-to-all 交换到持有专家的设备" },
          interpretation: { answer: "all-to-all 占比高或 GPU 等待表明路由偏斜、小消息或慢链路主导。", evidence: "不均匀消息使网络难以饱和" },
          boundary: { answer: "每 token FLOPs 下降不保证墙钟变快，MoE 依赖高速互连与足够批量。", evidence: "不保证墙钟延迟下降" },
        },
        {
          section: 6,
          definition: { answer: "生产推理的专家热点是实时流量让少数专家负载远高于训练时分布。", evidence: "训练与推理的热点分布可能不同" },
          problem: { answer: "它解释训练均衡的路由为何在小 batch 或主题突发的线上流量中爆满。", evidence: "生产为何仍可能某专家爆满" },
          inputOutput: { answer: "输入是逐 token 生产流量，输出是各层专家负载、熵、溢出和通信时间。", evidence: "推理监控每层/专家负载" },
          mechanism: { answer: "领域集中和逐 token 小批使路由更尖，同时所有专家权重仍需驻留或快速加载。", evidence: "batch 小、逐 token 生成会让路由分布更尖" },
          interpretation: { answer: "训练负载健康而线上热点高，说明数据分布和批处理条件发生了变化。", evidence: "对峰值主题压测" },
          boundary: { answer: "稀疏计算不等于稀疏存储，未激活专家通常仍要占显存或可快速访问。", evidence: "稀疏计算不等于稀疏存储" },
        },
        {
          section: 7,
          definition: { answer: "专家专化是假设某专家选择与特定能力存在稳定且可干预验证的功能关系。", evidence: "需要因果证据" },
          problem: { answer: "它避免因某专家常接代码 token 就拟人化地给它固定领域名称。", evidence: "就能叫“代码专家”吗" },
          inputOutput: { answer: "输入是路由日志与能力切片，输出是关联统计和干预后的能力变化。", evidence: "输出是关联统计及交换、屏蔽专家后的能力变化" },
          mechanism: { answer: "先测专家与切片关联，再交换或屏蔽专家，观察特定能力是否选择性下降。", evidence: "只有移除或交换某专家后代码能力选择性下降" },
          interpretation: { answer: "互信息只表示专家编号可由切片预测，干预后选择性下降才是更强功能证据。", evidence: "仍不能证明因果" },
          boundary: { answer: "共享注意力和跨层路由共同形成行为，单层专家标签不能解释整条回答或权限。", evidence: "多个层的路由共同形成行为" },
        },
        {
          section: 8,
          definition: { answer: "MoE、应用模型路由和多智能体都做选择，但决策粒度和候选对象不同。", evidence: "决策粒度有何不同" },
          problem: { answer: "它防止把模型内部 token 路由、请求级模型选择和子任务分工混成同一机制。", evidence: "MoE 与应用模型路由和多智能体不同" },
          inputOutput: { answer: "MoE 输入每层 token 并选 FFN，应用路由选完整服务，多智能体选角色或工具。", evidence: "每层每 token" },
          mechanism: { answer: "MoE 路由由内部参数学习，应用路由由可观测产品规则控制，多智能体编排子任务。", evidence: "应用路由可观测并由产品规则控制" },
          interpretation: { answer: "三者都叫路由不表示可交换，必须按错误发生的决策层归因。", evidence: "两者可叠加，评测需区分到底哪一层造成错误或延迟" },
          boundary: { answer: "当内部和应用路由叠加时，评测必须区分究竟哪一层造成错误或延迟。", evidence: "哪一层造成错误或延迟" },
        },
        {
          section: 9,
          definition: { answer: "MoE 验收联合比较容量、质量、路由稳定性和目标硬件系统效率。", evidence: "同时看容量、质量与系统效率" },
          problem: { answer: "它判断总参数大幅增加而激活 FLOPs 接近时，真实质量成本前沿是否改善。", evidence: "如何判断这次扩展值得" },
          inputOutput: { answer: "输入是 MoE 与同 FLOPs 稠密基线，输出质量、通信、负载、资源和恢复指标。", evidence: "输入是 MoE 与相同激活 FLOPs 的稠密基线" },
          mechanism: { answer: "同任务硬件下测质量与系统指标，再做专家消融、路由扰动和分布热点对比。", evidence: "做专家消融和路由扰动" },
          interpretation: { answer: "CV 越大表示负载相对偏斜更强，但 CV 低不证明语义或群体质量。", evidence: "越大表示相对偏斜越强" },
          boundary: { answer: "不能靠丢 token 或少数切片退化换吞吐，参数数字也必须同时报告 active 值。", evidence: "没有靠丢 token 或少数切片退化换吞吐" },
        },
      ],
    },

    "model-merging": {
      contractVersion: 2,
      examples: [{
        section: 4,
        evidence: {
          setup: "退款任务 ΔR=[.6,−.4,.1]",
          rule: "直接相加",
          steps: "[+.1, −.1, +.3]",
          interpretation: "坐标抵消并不表示任务冲突已“解决”",
        },
      }],
      formulas: [
        {
          id: "model-merging-weighted-average",
          section: 2,
          formulaIndex: 1,
          symbols: [
            { name: "θ", meaning: "某个源检查点或合并后模型的完整参数", evidence: "θᵢ 是第 i 个源检查点的完整参数" },
            { name: "i", meaning: "参与合并的源检查点编号", evidence: "第 i 个源检查点" },
            { name: "α", meaning: "为每个源检查点指定的合并权重", evidence: "αᵢ 是它的合并权重" },
          ],
        },
        {
          id: "model-merging-task-vectors",
          section: 3,
          formulaIndex: 1,
          symbols: [
            { name: "θ", meaning: "共同基座、任务模型或合并模型的完整参数", evidence: "θ基座 是所有任务微调共同出发的精确检查点" },
            { name: "Δ", meaning: "任务模型相对共同基座的逐坐标参数增量", evidence: "得到任务增量 Δᵢ" },
            { name: "i", meaning: "当前任务模型或任务增量的编号", evidence: "第 i 个任务模型" },
            { name: "α", meaning: "控制某个任务增量加入合并模型强度的系数", evidence: "αᵢ 控制第 i 个增量加入多强" },
          ],
        },
      ],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "模型合并直接对多个模型检查点参数做运算，产生未经联合再训练的新模型。", evidence: "直接对两个或多个模型检查点的参数做运算" },
          problem: { answer: "它尝试低成本整合多个训练解，但必须先保证参数坐标具有可比较语义。", evidence: "为什么中间模型不一定能工作" },
          inputOutput: { answer: "输入是源模型权重与合并配方，输出是必须重新评测的新检查点。", evidence: "输出是必须重新评测的新模型" },
          mechanism: { answer: "兼容检查点按坐标加权；同初始化附近和低损失连通使平均更可能可用。", evidence: "存在一条路径，沿途模型损失都不高" },
          interpretation: { answer: "数组形状一致只证明数字能相加，不证明同一位置承担相同功能。", evidence: "形状相同只表示数组能相加" },
          boundary: { answer: "架构、词表、基座或表示排列不对齐时，平均可抵消有用功能并彻底失效。", evidence: "否则数字能相加但语义不能" },
        },
        {
          section: 2,
          definition: { answer: "检查点平均按系数对兼容源模型的每个参数坐标加权求和。", evidence: "怎样做最简单组合" },
          problem: { answer: "它平滑同一训练轨迹或同基座同任务不同超参数解的噪声与波动。", evidence: "同一次训练后期多个检查点做简单平均" },
          inputOutput: { answer: "输入是兼容检查点、权重和验证集，输出是加权检查点及泛化评测。", evidence: "输出是加权检查点及其泛化评测" },
          mechanism: { answer: "所有源参数乘 alpha 后逐坐标求和，权重和为一时形成加权平均。", evidence: "所有权重和为 1 时得到加权平均" },
          interpretation: { answer: "uniform 等权，greedy 只加入验证集有益候选，二者代表不同选择偏差。", evidence: "greedy soup 只逐个加入能改善验证集的候选" },
          boundary: { answer: "算术平均不保证坐标对齐或损失低，反复看验证集还会过拟合该验证集。", evidence: "不保证平均后损失低" },
        },
        {
          section: 3,
          definition: { answer: "任务向量是任务微调模型减去精确共同基座得到的参数增量。", evidence: "任务增量 Δᵢ" },
          problem: { answer: "它消除重复的共同基座，让合并聚焦每次微调究竟改变了哪些坐标。", evidence: "为什么先减同一基座比直接平均两个微调模型更可解释" },
          inputOutput: { answer: "输入是共同基座、任务模型和系数，输出是加权任务增量加回基座的新模型。", evidence: "最后再把加权增量加回共同基座" },
          mechanism: { answer: "逐坐标计算每个 Δ，按 alpha 缩放求和，再加回同一基座。", evidence: "使比较聚焦“微调改变了什么”" },
          interpretation: { answer: "反向更新会抵消，同向大更新会过冲，系数必须在独立验证集搜索。", evidence: "若都很大且同向，叠加可能过冲" },
          boundary: { answer: "任务向量不是独立语义模块，基座 revision、量化或词表不同也会失去共同原点。", evidence: "没有统一原点" },
        },
        {
          section: 4,
          definition: { answer: "三维例用两个任务增量的逐坐标相加展示符号抵消和同向过冲。", evidence: "两个三维任务向量怎样冲突" },
          problem: { answer: "它直观说明坐标相加后的折中不一定同时保留两个任务能力。", evidence: "直接相加留下什么" },
          inputOutput: { answer: "输入是退款与安全的三维增量，输出是和向量及每维冲突诊断。", evidence: "退款任务 ΔR=[.6,−.4,.1]" },
          mechanism: { answer: "同维数值直接相加，前两维符号相反而近乎抵消，第三维同向增强。", evidence: "维 1/2 符号冲突" },
          interpretation: { answer: "前两维接近零可能删除两种有用更新，而不是自动解决任务冲突。", evidence: "两种有用更新都被删除" },
          boundary: { answer: "真实模型单坐标大小不直接等于功能重要性，玩具例只解释符号与尺度干扰。", evidence: "单坐标大小也不直接对应功能重要性" },
        },
        {
          section: 5,
          definition: { answer: "置换对称指神经元编号可重排且函数不变，但参数坐标随之改变。", evidence: "神经元编号变了，组合功能没变" },
          problem: { answer: "它解释独立训练模型功能相同却无法直接按同一坐标平均的原因。", evidence: "权重坐标发生什么" },
          inputOutput: { answer: "输入是源权重或校准激活，输出是神经元、通道或注意力头对应关系。", evidence: "输出是神经元、通道或注意力头的对应关系" },
          mechanism: { answer: "权重匹配或激活匹配寻找配对，再按配对重排参数坐标。", evidence: "再按配对重排坐标" },
          interpretation: { answer: "高余弦相似只说明整体夹角接近，不能排除少数关键层不对齐。", evidence: "可掩盖少数关键层不对齐" },
          boundary: { answer: "局部置换对齐仍不保证两模型间参数路径位于同一低损失区域。", evidence: "不保证两模型之间的参数路径保持低损失" },
        },
        {
          section: 6,
          definition: { answer: "TIES 和 DARE 是剪小更新、处理符号或随机稀疏任务增量的经验启发式。", evidence: "处理的是经验冲突" },
          problem: { answer: "它们尝试减轻任务向量更新密集且同一坐标符号冲突造成的干扰。", evidence: "更新密集且符号冲突时" },
          inputOutput: { answer: "输入是多个任务增量和阈值、密度、随机种子，输出是稀疏或冲突处理后的增量。", evidence: "阈值、密度、随机种子和系数" },
          mechanism: { answer: "TIES 剪小值并选主符号，DARE 随机丢弃元素后重标度。", evidence: "随机丢弃任务向量元素并重标度" },
          interpretation: { answer: "减少冲突后指标改善只支持当前配方有效，不构成解析成功保证。", evidence: "这些都不是解析保证" },
          boundary: { answer: "小更新可能合成重要功能，反向更新也可能必要，随机丢弃还引入方差。", evidence: "许多小值合成重要功能" },
        },
        {
          section: 7,
          definition: { answer: "适配器组合在共同基座上合成多个低秩 ΔW，与完整模型权重合并不同。", evidence: "多个 LoRA 线性相加" },
          problem: { answer: "它判断多适配器同时改权重是否真正成为可用多任务模型。", evidence: "是否天然等于多任务模型" },
          inputOutput: { answer: "输入是精确基座、适配器和缩放配置，输出是分离路由或合并后的权重。", evidence: "共享精确基座时可组合" },
          mechanism: { answer: "可按系数相加各低秩增量，也可先展开后作为任务向量处理。", evidence: "先合并每个适配器再处理任务向量" },
          interpretation: { answer: "分离路由易切换回滚，合并减少推理分支却把任务干扰固定进权重。", evidence: "合并减少推理分支但固定干扰" },
          boundary: { answer: "不同 rank、scale 与目标层不可直接比大小，量化整数也需先恢复浮点语义。", evidence: "对打包整数坐标直接平均通常没有正确浮点语义" },
        },
        {
          section: 8,
          definition: { answer: "兼容性清单是合并前必须满足的架构、词表、基座、精度和许可条件。", evidence: "兼容性清单是硬门槛" },
          problem: { answer: "它在不兼容元数据出现时阻止无意义或不可分发的合并尝试。", evidence: "应该直接停止" },
          inputOutput: { answer: "输入是源模型元数据与许可，输出是停止决定或完整可追踪合并配方。", evidence: "保存源模型哈希、基座、系数" },
          mechanism: { answer: "逐项比对架构、tokenizer、位置、基座 revision、量化恢复和许可。", evidence: "tokenizer、词表大小/顺序、特殊 token 一致" },
          interpretation: { answer: "形状或词表大小相同仍可能 id 错序，造成嵌入和输出头语义破坏。", evidence: "token id 语义不同会直接破坏嵌入与输出头" },
          boundary: { answer: "合并产物是新的模型发布，不能沿用任一源模型名称和安全声明。", evidence: "不应沿用任一源模型名称/安全声明" },
        },
        {
          section: 9,
          definition: { answer: "合并评测同时覆盖源任务、交叉组合、硬风险、通用能力与系统成本。", evidence: "寻找能力干扰而不只看各自基准" },
          problem: { answer: "它发现两个单项基准维持时仍可能在组合提示中出现的能力交互失败。", evidence: "为什么组合提示仍可能失败" },
          inputOutput: { answer: "输入是源模型、候选与独立测试，输出逐样本迁移、风险、成本和回滚配方。", evidence: "输出不仅有每项分数" },
          mechanism: { answer: "比较多种合并和路由基线、画帕累托前沿、查插值损失并做模块消融。", evidence: "按系数画帕累托前沿" },
          interpretation: { answer: "插值中点损失峰值高表示直接平均跨过坏区域，合并风险更高。", evidence: "直接平均风险大" },
          boundary: { answer: "平均分不能掩盖高风险样本变不安全；成功必须可复现、可回滚且硬风险不退化。", evidence: "不能用两个平均分掩盖" },
        },
      ],
    },

    "scaling-law": {
      contractVersion: 2,
      examples: [{
        section: 3,
        evidence: {
          setup: "若 α=0.10",
          rule: "R=L−L∞",
          steps: "1.50+0.50×0.794",
          interpretation: "本轮只减少 20.6%",
        },
      }],
      formulas: [
        {
          id: "scaling-law-reducible-loss",
          section: 1,
          formulaIndex: 1,
          symbols: [
            { name: "L", meaning: "给定规模下按统一口径测得的目标损失", evidence: "L(x) 是规模为 x 时测得的目标损失" },
            { name: "x", meaning: "参数、训练 token 或计算量等被放大的资源尺度", evidence: "x 可以是参数数 N、训练 token 数 D 或计算量 C" },
            { name: "A", meaning: "可约损失在参考资源尺度上的幅度系数", evidence: "A 决定可约部分在参考尺度上的大小" },
            { name: "α", meaning: "控制可约损失随规模下降速度的正缩放指数", evidence: "α 是正的缩放指数" },
          ],
        },
        {
          id: "scaling-law-log-linearization",
          section: 2,
          formulaIndex: 1,
          symbols: [
            { name: "log", meaning: "把乘法变加法并把幂指数变系数的对数函数", evidence: "log 是对数函数" },
            { name: "L", meaning: "总损失与其不可约下限", evidence: "纵轴是 log(L−L∞)" },
            { name: "A", meaning: "线性化后决定直线截距的幅度系数", evidence: "截距为 log A" },
            { name: "α", meaning: "线性化后直线斜率绝对值对应的缩放指数", evidence: "直线斜率为 −α" },
            { name: "x", meaning: "横轴上的模型、数据或计算资源尺度", evidence: "横轴是 log x" },
          ],
        },
        {
          id: "scaling-law-tenfold-example",
          section: 3,
          formulaIndex: 1,
          symbols: [
            { name: "R", meaning: "总损失减不可约下限后的可约损失", evidence: "R=L−L∞ 是可约损失" },
            { name: "C", meaning: "扩大前使用的原始训练计算量", evidence: "C 是原计算量" },
          ],
        },
        {
          id: "scaling-law-training-compute",
          section: 4,
          formulaIndex: 1,
          symbols: [
            { name: "C", meaning: "训练过程中执行的总浮点运算次数", evidence: "C 是训练总 FLOPs" },
            { name: "N", meaning: "稠密模型包含的参数总数量", evidence: "N 是模型参数数量" },
            { name: "D", meaning: "训练过程中处理过的 token 总数量", evidence: "D 是训练中处理的 token 总数" },
          ],
        },
        {
          id: "scaling-law-lifecycle-cost",
          section: 8,
          formulaIndex: 1,
          symbols: [
            { name: "K", meaning: "总成本或训练、推理、运维子成本", evidence: "K总 是规划期内全部成本" },
            { name: "N", meaning: "规划时间范围内预计处理的请求数量", evidence: "N请求 是预计请求数量" },
          ],
        },
      ],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "缩放定律是在固定系统附近拟合资源规模与验证损失关系的经验曲线。", evidence: "对一组训练实验的统计拟合" },
          problem: { answer: "它为参数、数据或算力扩大时的边际收益与预算规划提供近似预测。", evidence: "资源增加时验证损失怎样变化" },
          inputOutput: { answer: "输入是多个规模点及同口径结果，输出是拟合参数和带不确定性的附近预测。", evidence: "输出是拟合参数与带不确定性的附近规模预测" },
          mechanism: { answer: "总损失分成难以消除的下限与按 x 负幂下降的可约部分。", evidence: "单靠继续扩大 x 难以消除的下限" },
          interpretation: { answer: "资源按相同倍数增加只会按固定比例减少剩余可约损失，边际回报递减。", evidence: "逐次增加相同倍数只能按固定比例减少剩余可约损失" },
          boundary: { answer: "规律依赖模型族、数据、配方和目标指标，不是跨系统不变的自然常数。", evidence: "不是由物理定律推导出的常数" },
        },
        {
          section: 2,
          definition: { answer: "对数线性化把可约损失的幂律转换成 log-log 坐标中的直线。", evidence: "对数把乘法变成加法，也把幂指数变成系数" },
          problem: { answer: "它让缩放指数可由直线斜率估计，并帮助诊断数据点是否服从同一幂律。", evidence: "幂律的指数如何从图上读出来" },
          inputOutput: { answer: "输入是规模和损失点，输出是斜率、截距、下限估计及置信区间。", evidence: "输出是斜率、截距、下限估计和置信区间" },
          mechanism: { answer: "先减不可约下限，再对资源和可约损失取同底对数，幂指数成为斜率。", evidence: "先从总损失减去下限" },
          interpretation: { answer: "斜率负 alpha 表示资源增大时可约损失下降，截距 log A 表示幅度。", evidence: "直线斜率为 −α" },
          boundary: { answer: "L∞ 估错会让图弯曲，有限区间近似直线也不能支持无限外推。", evidence: "不能把它无限外推" },
        },
        {
          section: 3,
          definition: { answer: "数值例用指数零点一计算十倍算力对剩余可约损失的比例改善。", evidence: "十倍资源只减少约五分之一可约损失" },
          problem: { answer: "它纠正把资源扩大十倍误解为总损失也缩到十分之一的直觉。", evidence: "能得到多少改善" },
          inputOutput: { answer: "输入是 alpha、当前损失、下限和计算倍数，输出是新可约损失与总损失预测。", evidence: "若 L∞=1.50、当前 L=2.00" },
          mechanism: { answer: "十倍规模使可约部分乘十的负零点一次方，再加回不变的损失下限。", evidence: "1.50+0.50×0.794" },
          interpretation: { answer: "零点七九四表示剩余百分之七十九点四，因此本轮改善百分之二十点六。", evidence: "本轮只减少 20.6%" },
          boundary: { answer: "只有指数、下限可信且目标规模仍在拟合区间内时，该数值外推才有意义。", evidence: "不是实际训练保证" },
        },
        {
          section: 4,
          definition: { answer: "计算最优分配在固定训练 FLOPs 下权衡模型参数量与训练 token 数。", evidence: "固定算力迫使参数与数据互相权衡" },
          problem: { answer: "它避免只把参数做大而令模型见到的数据过少，或模型太小形成容量瓶颈。", evidence: "为什么可训练 token 会变少" },
          inputOutput: { answer: "输入是计算预算和候选 N、D，输出是等计算实验得到的质量前沿。", evidence: "输出是等计算实验前沿" },
          mechanism: { answer: "稠密训练成本近似六乘 N 乘 D，预算固定时一项增加迫使另一项减少。", evidence: "N 翻倍，D 就约减半" },
          interpretation: { answer: "平衡点是容量不足和训练不足两类瓶颈间的经验折中，不是最大模型。", evidence: "不是“把参数堆到最大”" },
          boundary: { answer: "系数六是粗略近似，架构、序列、重计算和硬件利用都会改变墙钟成本。", evidence: "FLOPs 相同也不保证时间或质量相同" },
        },
        {
          section: 5,
          definition: { answer: "Kaplan 与 Chinchilla 是不同实验范围和拟合约束下得到的计算分配经验。", evidence: "模型范围、训练点、拟合方法与约束不同" },
          problem: { answer: "它解释早期结论偏大模型而后续结论强调更多训练数据为何不必矛盾。", evidence: "为什么早期结论偏向更大模型" },
          inputOutput: { answer: "输入是当前架构数据和优化器的小规模等计算实验，输出是本系统自己的前沿。", evidence: "拟合自己的前沿" },
          mechanism: { answer: "在多个规模与数据点联合拟合，再比较固定计算下不同 N-D 组合。", evidence: "一组小规模等计算实验" },
          interpretation: { answer: "很多大模型 token 不足支持增加数据，但不能把每参数 token 比例当永恒常数。", evidence: "许多大模型训练 token 不足" },
          boundary: { answer: "模型族、tokenizer、过滤或上下文变化后指数会漂移，必须重新测量。", evidence: "经验指数会漂移" },
        },
        {
          section: 6,
          definition: { answer: "有效数据量反映 token 的新信息、质量和覆盖，而不是只计算名义数量。", evidence: "名义 token 不等于有效数据" },
          problem: { answer: "它解释重复、错误和评测污染为何令相同 token 数具有不同训练价值。", evidence: "是否等价于一万亿个新信息 token" },
          inputOutput: { answer: "输入是数据混合、重复、质量与来源，输出是覆盖、记忆、偏差和下游收益。", evidence: "同一 D 对应不同“有效数据量”" },
          mechanism: { answer: "去重和过滤改变单位 token 信号，也可能删除稀有样本并改变语言群体分布。", evidence: "可能缩窄覆盖面、放大语言或群体偏差" },
          interpretation: { answer: "相同 D 不表示相同有效信息，必须同时报告数据配比和真实切片表现。", evidence: "数据混合比例变化" },
          boundary: { answer: "去重、过滤、重复训练和合成补技能都有收益与覆盖或回流风险。", evidence: "模型坍缩和错误回流" },
        },
        {
          section: 7,
          definition: { answer: "能力跳变可由连续概率越过离散判分阈值造成，不一定表示内部机制突然出现。", evidence: "准确率、pass@1 或“全部步骤正确”带有阈值" },
          problem: { answer: "它区分真实能力机制变化与准确率、pass@1 等测量方式制造的台阶。", evidence: "一定意味着模型内部突然出现了全新机制吗" },
          inputOutput: { answer: "输入是不同规模的连续损失、离散任务分数和分组结果，输出是变化曲线。", evidence: "同时画连续指标、离散指标和分组结果" },
          mechanism: { answer: "正确答案概率从低于二分之一升至高于二分之一时，损失连续但 argmax 翻转。", evidence: "会突然从错变对" },
          interpretation: { answer: "仅有离散曲线不能判断涌现来源，需在阈值附近加点并查看连续指标。", evidence: "仅凭一条离散曲线无法区分" },
          boundary: { answer: "平均损失改善不保证事实、安全或罕见能力同步改善，必须独立切片评测。", evidence: "不保证事实性、安全性或罕见能力同步改善" },
        },
        {
          section: 8,
          definition: { answer: "生命周期优化把一次训练、重复推理、运维与失败成本放进同一规划周期。", evidence: "训练最优不一定是产品全生命周期最优" },
          problem: { answer: "它解释多训练较小模型为何可能因长期推理更便宜而降低总成本。", evidence: "为什么多训练一个较小模型" },
          inputOutput: { answer: "输入是训练候选、请求规模和部署约束，输出是满足质量的生命周期成本前沿。", evidence: "输出是满足质量条件的生命周期成本前沿" },
          mechanism: { answer: "总成本把一次训练费用与请求数乘单次推理费用及运维失败费用相加。", evidence: "各项必须使用同一时间范围和质量门槛" },
          interpretation: { answer: "请求越多，单次推理成本权重越大，参数较小但训练更充分的模型更可能占优。", evidence: "模型每次推理的显存、延迟和能耗会重复支付" },
          boundary: { answer: "一次性研究与高流量服务的最优点不同，只优化训练 FLOPs 会转移部署成本。", evidence: "会把成本转移到部署阶段" },
        },
        {
          section: 9,
          definition: { answer: "外推失效是新规模点因系统或数据条件变化而偏离原缩放曲线。", evidence: "外推何时会失效" },
          problem: { answer: "它防止把小模型拟合出的直线无限延长并当作大规模质量保证。", evidence: "为什么不能无限延长" },
          inputOutput: { answer: "输入是新规模锚点及配方数据变化，输出是断点诊断、分段拟合和扩大置信区间。", evidence: "加入中间规模锚点" },
          mechanism: { answer: "架构、数据、优化或指标发生断点时，新点离开旧线，应重做消融和拟合。", evidence: "新点离开旧直线" },
          interpretation: { answer: "收益提前饱和可能是数据耗尽，异常变差也可能是训练不稳而非定律改变。", evidence: "先排查学习率、并行与数值问题" },
          boundary: { answer: "缩放定律只预测相似系统附近趋势，不能证明安全、可靠或可控。", evidence: "缩放定律是地图，不是保证书" },
        },
      ],
    },

    "model-families": {
      contractVersion: 2,
      sectionContracts: [
        {
          section: 1,
          "definition": { "answer": "模型家族是一套描述模型机制与交付方式的分析坐标，而不是品牌集合。", "evidence": "不是品牌集合，而是一套描述模型机制与交付方式的坐标" },
          "problem": { "answer": "它解决只凭 Transformer 等单一标签无法判断模型能力的问题。", "evidence": "为什么“它是 Transformer”远远不够" },
          "inputOutput": { "answer": "输入一个待分析模型，输出架构、训练目标、模态接口和产品层四项说明。", "evidence": "输出是架构、训练目标、模态接口和后训练/产品层四项说明" },
          "mechanism": { "answer": "沿四个相互独立的轴逐项分析模型，而不把名称当作完整解释。", "evidence": "信息怎样读取、保存与混合" },
          "interpretation": { "answer": "四轴结果说明模型为什么擅长某类任务，也暴露部署与行为约束。", "evidence": "四轴帮助解释“为什么擅长”" },
          "boundary": { "answer": "家族标签不能替代版本核验和任务实测。", "evidence": "仍要查具体版本并实测" }
        },
        {
          section: 2,
          "definition": { "answer": "编码器、解码器和编码器—解码器是三种不同的信息流组织方式。", "evidence": "编码器、解码器与编码器—解码器的信息流不同" },
          "problem": { "answer": "它解释同样使用注意力的模型为什么适合不同任务。", "evidence": "同样使用注意力，为什么适合的任务不同" },
          "inputOutput": { "answer": "编码器接收完整序列并输出各位置的双向表示。", "evidence": "编码器输入完整序列并输出每个位置的双向表示" },
          "mechanism": { "answer": "因果解码器根据提示和已生成前缀逐位置预测下一个 token。", "evidence": "因果解码器输入提示与已生成前缀" },
          "interpretation": { "answer": "应看训练信号和计算路径是否贴合任务，而不只看架构名称。", "evidence": "训练信号与计算路径是否贴合任务" },
          "boundary": { "answer": "某种信息流的天然强项不等于其他任务完全做不了。", "evidence": "天然强项”不是排他能力" }
        },
        {
          section: 3,
          "definition": { "answer": "扩散模型学习逐步去除噪声，而不是从左到右续写 token。", "evidence": "扩散模型学习逐步去噪，不是从左到右续写" },
          "problem": { "answer": "它解释图像生成模型为何能从随机噪声逐步恢复结构。", "evidence": "为什么图像生成常从噪声开始" },
          "inputOutput": { "answer": "训练输入是带噪样本、时间步与可选条件，输出是噪声或等价去噪目标的预测。", "evidence": "训练输入是带噪样本、时间步和可选条件" },
          "mechanism": { "answer": "模型反复预测并移除噪声，逐步把随机变量恢复成有结构的样本。", "evidence": "反复使用这些预测恢复结构" },
          "interpretation": { "answer": "一次更新可同时修正整幅潜变量，而非只追加末尾内容。", "evidence": "可以同时修正整幅潜变量" },
          "boundary": { "answer": "传统扩散采样通常需要多次迭代，因此延迟可能较高。", "evidence": "传统采样需要多步" }
        },
        {
          section: 4,
          "definition": { "answer": "状态空间与递归家族用压缩状态承载历史并进行线性扫描。", "evidence": "状态空间与递归家族用压缩状态换线性扫描" },
          "problem": { "answer": "它解决不做所有位置两两比较时如何携带历史信息的问题。", "evidence": "不做所有位置两两比较，模型如何携带历史" },
          "inputOutput": { "answer": "每个位置输入 xₜ 和旧状态，输出新状态及当前位置的 yₜ。", "evidence": "xₜ 是当前位置输入" },
          "mechanism": { "answer": "矩阵 A 更新旧状态，B 写入当前输入，C 把新状态读成输出。", "evidence": "矩阵 A 更新旧状态" },
          "interpretation": { "answer": "序列变长时，线性扫描的计算增长通常慢于全局注意力。", "evidence": "递归或状态空间扫描步数只增加约四倍" },
          "boundary": { "answer": "需要精确随机访问或原样复制很早片段时，压缩状态可能吃亏。", "evidence": "需要精确随机访问、原样复制早期片段时" }
        },
        {
          section: 5,
          "definition": { "answer": "多模态融合让图像、音频等表示与文本表示进入可相互影响的计算路径。", "evidence": "多模态融合把图像、音频等表示与文本表示放进能够相互影响的计算路径" },
          "problem": { "answer": "它解决不同模态信息如何共同影响模型判断或生成的问题。", "evidence": "图像加文本输入，是否就形成了统一理解" },
          "inputOutput": { "answer": "输入可以是图像、音频与文本，输出可为共享表示、文本、图像或动作。", "evidence": "输出可以是共享表示、文本、图像或动作" },
          "mechanism": { "answer": "一种方式是用投影器把视觉向量转换成语言模型可读取的 token。", "evidence": "投影器把向量变成语言模型可读 token" },
          "interpretation": { "answer": "流畅描述图片只说明生成路径可用，不证明所有视觉能力可靠。", "evidence": "输出流畅地描述图片只证明生成路径可用" },
          "boundary": { "answer": "OCR、空间关系、计数和细粒度定位仍必须分别测试。", "evidence": "OCR、空间关系、计数和细粒度定位都可靠" }
        },
        {
          section: 6,
          "definition": { "answer": "本节用退款助手展示先拆任务、再匹配模型家族的系统设计方法。", "evidence": "为退款助手拆分任务，而非先挑品牌" },
          "problem": { "answer": "它回答退款助手是否需要由同一个大模型包办全部步骤。", "evidence": "需要同一个模型包办吗" },
          "inputOutput": { "answer": "输入退款请求和准确率、模态、延迟、权限约束，输出分工后的系统方案。", "evidence": "准确率·模态·延迟·权限" },
          "mechanism": { "answer": "先拆出意图分类、检索、票据读取与执行，再为各步选择合适组件。", "evidence": "先拆任务与硬约束" },
          "interpretation": { "answer": "组合系统往往比单一最大模型更便宜、更可测且更可控。", "evidence": "组合系统通常比“最大模型全包”更便宜、可测、可控" },
          "boundary": { "answer": "涉及退款执行等高风险动作时，应交给具有权限边界的工具。", "evidence": "高风险动作交给有权限边界的工具" }
        },
        {
          section: 7,
          "definition": { "answer": "模型选择是先按硬约束过滤，再比较质量与成本前沿的过程。", "evidence": "把硬约束先过滤，再比较质量—成本前沿" },
          "problem": { "answer": "它解决排行榜第一的模型未必适合具体业务的问题。", "evidence": "排行榜第一为什么可能不是你的最佳模型" },
          "inputOutput": { "answer": "输入候选家族、规模和业务约束，输出可行候选及权衡结果。", "evidence": "候选家族和规模" },
          "mechanism": { "answer": "先剔除不满足模态、延迟和部署约束的候选，再进行多目标比较。", "evidence": "先筛硬约束：数据驻留、许可、模态、上下文、硬件、最大延迟" },
          "interpretation": { "answer": "示例数值只演示决策流程，不代表真实厂商性能。", "evidence": "数字是教学算例，不代表真实厂商性能" },
          "boundary": { "answer": "不可把量纲和意义不同的指标随意相加为单一总分。", "evidence": "不把异质指标随意加成总分" }
        },
        {
          section: 8,
          "definition": { "answer": "后训练是在基础模型之上改变行为表现的一组训练方法。", "evidence": "后训练改变行为，但不会抹去基础机制" },
          "problem": { "answer": "它解释行为变化是否意味着模型已经换成一种新架构。", "evidence": "“推理模型”“聊天模型”“工具模型”是新架构吗" },
          "inputOutput": { "answer": "输入监督数据、偏好或奖励信号，输出行为经过调整的模型。", "evidence": "监督微调、偏好优化、强化学习和蒸馏" },
          "mechanism": { "answer": "训练信号调整模型参数，从而改变指令遵循、风格和工具调用。", "evidence": "可显著改变回答风格、遵循指令、推理时计算与工具调用" },
          "interpretation": { "answer": "行为更可靠不能直接解释成基础模型记住了某个数据库。", "evidence": "不能直接推断基础模型“记住了数据库”" },
          "boundary": { "answer": "后训练不能替代执行系统的真实鉴权与权限控制。", "evidence": "真正权限在执行层" }
        },
        {
          section: 9,
          "definition": { "answer": "开放权重、API 和品牌描述的是交付层，而不是架构家族。", "evidence": "开放权重、API 与品牌属于交付层，不是架构家族" },
          "problem": { "answer": "它解决从开放或 API 等标签误推隐私、安全和能力的问题。", "evidence": "为什么都不成立" },
          "inputOutput": { "answer": "输入权重许可、代码数据开放度、托管位置与政策，输出部署风险判断。", "evidence": "权重许可、训练代码、数据开放程度、托管位置和 API 数据政策" },
          "mechanism": { "answer": "开放权重提供自托管可能性，API 则由服务方托管并按接口交付。", "evidence": "开放权重允许自托管" },
          "interpretation": { "answer": "不能仅凭交付名称直接推出模型能力、隐私或合规结论。", "evidence": "不能从名称直接推出" },
          "boundary": { "answer": "最终判断必须结合部署拓扑、合同条款与日志策略。", "evidence": "部署拓扑、合同、日志策略" }
        }
      ],
      formulas: [
        {
          id: "model-families-autoregressive-decoder",
          section: 2,
          formulaIndex: 1,
          "symbols": [
            { name: "p", "meaning": "条件概率", "evidence": "条件概率" },
            { name: "x", "meaning": "条件输入", "evidence": "x 是条件输入" },
            { name: "y", "meaning": "完整输出序列", "evidence": "y 是完整输出序列" },
            { name: "t", "meaning": "当前生成位置", "evidence": "t 是当前生成位置" }
          ]
        },
        {
          id: "model-families-diffusion-noising",
          section: 3,
          formulaIndex: 1,
          "symbols": [
            { name: "x", "meaning": "干净样本或带噪样本", "evidence": "干净样本" },
            { name: "t", "meaning": "扩散时间步", "evidence": "时间步 t 的带噪样本" },
            { name: "α", "meaning": "原信号保留比例", "evidence": "ᾱₜ 控制还保留多少原信号" },
            { name: "ε", "meaning": "随机噪声", "evidence": "ε 是加入的随机噪声" },
            { name: "θ", "meaning": "去噪网络参数", "evidence": "参数为 θ 的去噪网络" },
            { name: "c", "meaning": "文本等条件", "evidence": "c 是文本等条件" }
          ]
        },
        {
          id: "model-families-recurrent-state",
          section: 4,
          formulaIndex: 1,
          "symbols": [
            { name: "x", "meaning": "当前位置输入", "evidence": "xₜ 是当前位置输入" },
            { name: "h", "meaning": "历史压缩状态", "evidence": "此前历史压缩成的状态" },
            { name: "t", "meaning": "序列位置编号", "evidence": "当前位置输入" },
            { name: "A", "meaning": "旧状态更新矩阵", "evidence": "矩阵 A 更新旧状态" },
            { name: "B", "meaning": "当前输入写入矩阵", "evidence": "B 写入当前输入" },
            { name: "C", "meaning": "状态读取矩阵", "evidence": "矩阵 C 再把状态读成输出" },
            { name: "y", "meaning": "当前位置输出", "evidence": "输出 yₜ" }
          ]
        }
      ],
      termReviews: [{
        section: 3,
        reviewedAt: "2026-07-26",
        terms: [{
          name: "高维",
          meaning: "一个样本需要由很多个数值坐标共同描述",
          purpose: "图像潜变量包含大量位置与通道，因此扩散要同时处理许多坐标",
          definitionEvidence: "高维表示一个样本需要由很多个数值坐标共同描述",
          purposeEvidence: "图像潜变量包含大量位置与通道"
        }]
      }],
      examples: [{
        section: 6,
        evidence: {
          setup: "退款请求",
          rule: "先拆任务与硬约束",
          steps: "意图分类/检索",
          interpretation: "组合系统通常比“最大模型全包”更便宜、可测、可控"
        }
      }]
    },
    "multimodal": {
      contractVersion: 2,
      examples: [{
        section: 3,
        evidence: {
          setup: "设猫图向量",
          rule: "余弦相似度为点积",
          steps: "v·t₂=0.96",
          interpretation: "单个相似度不是概率"
        }
      }],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "多模态系统是能够联合接收、关联并转换两种或更多模态的模型系统。", evidence: "本页所说的多模态系统" },
          problem: { answer: "它解决现实任务中图、文、声等信息相互依赖而不能割裂处理的问题。", evidence: "为什么要费劲让一个模型同时处理图、文、声" },
          inputOutput: { answer: "输入是一种或多种模态及任务指令，输出可以是文本、图像、声音、动作或判断。", evidence: "输入是一种或多种模态的数据与任务指令" },
          mechanism: { answer: "系统先编码各模态，再建立能让不同模态彼此影响的信息通道。", evidence: "先把各模态编码成可计算表示" },
          interpretation: { answer: "输出只表示当前图文问答等具体任务的结果，不能外推全部感知能力。", evidence: "“猫趴在键盘上”是一次图文问答结果" },
          boundary: { answer: "任务不需要跨模态联系时，专用模型通常更简单且成本更低。", evidence: "若任务不需要跨模态联系" }
        },
        {
          section: 2,
          definition: { answer: "模态无感是指 Transformer 只要求输入能表示成向量 token 序列。", evidence: "不关心输入是什么，只关心「能不能切成一串 token（向量）」" },
          problem: { answer: "它解释原本用于语言的计算骨架为何也能处理图像块和音频帧。", evidence: "Transformer 是为语言设计的，凭什么能拿来处理图像和声音" },
          inputOutput: { answer: "输入是不同来源的向量序列，输出是经过 Transformer 更新的 token 表示。", evidence: "输出是 Transformer 更新后的 token 表示" },
          mechanism: { answer: "自注意力让序列中的 token 交换信息，从而复用同一套计算规则。", evidence: "自注意力让 token 彼此交换信息" },
          interpretation: { answer: "得到数值表示只证明完成了共同计算，不证明不同模态语义已经对应。", evidence: "输出表示只能说明模型完成了数值变换" },
          boundary: { answer: "没有配对训练或其他对齐信号时，跨模态 token 仍可能互不相关。", evidence: "没有配对训练或其他对齐信号时" }
        },
        {
          section: 3,
          definition: { answer: "模态对齐是建立可比较的跨模态表示或可学习的信息通道。", evidence: "建立可学习的模态对齐与信息通道" },
          problem: { answer: "它解决猫的图像与“猫”这个词怎样在模型中建立对应的问题。", evidence: "怎么让「猫的图」和「猫」这个词" },
          inputOutput: { answer: "训练输入是成对或带对应关系的图文样本，输出是可比较或可查询的跨模态特征。", evidence: "对齐训练的输入是成对或带对应关系的图文样本" },
          mechanism: { answer: "对比目标拉近正确配对并推远错误配对，或通过投影和交叉注意力建立连接。", evidence: "提高正确配对的相似度、降低错误配对的相似度" },
          interpretation: { answer: "相对分数越高只表示在当前候选中更匹配，并不是事实概率。", evidence: "相对分数越高表示“在当前候选中更匹配”" },
          boundary: { answer: "配对数据偏差、候选变化以及计数和空间推理都可能令全局对齐失效。", evidence: "单靠全局对齐并不够" }
        },
        {
          section: 4,
          definition: { answer: "视觉接入链用编码器和投影层给语言模型增加图像信息入口。", evidence: "怎么让它长出「眼睛」" },
          problem: { answer: "它解决已经会生成语言的模型如何读取图像并依据图像回答的问题。", evidence: "怎么把「看」接到「说」上" },
          inputOutput: { answer: "输入是一张图和文字问题，输出是语言模型生成的答案。", evidence: "这条接入链的输入是一张图和文字问题" },
          mechanism: { answer: "视觉编码器提取特征，投影层转成视觉 token，语言模型结合文字逐步生成。", evidence: "投影层把特征变成语言模型可接收的视觉 token" },
          interpretation: { answer: "答案是以图像为条件的语言生成结果，不是传感器的直接读数。", evidence: "不是视觉传感器的直接读数" },
          boundary: { answer: "编码压缩可能损失细字、空间位置和超高分辨率细节，必须分切片验证。", evidence: "可能因编码压缩而丢失" }
        },
        {
          section: 5,
          definition: { answer: "能力图描述多模态系统可实现的输入模态到输出模态的任务转换。", evidence: "模态打通，解锁了什么" },
          problem: { answer: "它回答图文声接入同一系统后能支持哪些新的业务任务。", evidence: "哪些以前做不到的事成为可能" },
          inputOutput: { answer: "输入是跨模态业务任务，输出是所需转换方向和可验收的具体结果。", evidence: "输入是一个跨模态业务任务" },
          mechanism: { answer: "先确定条件模态和结果模态，再沿对齐与生成链选择相应能力。", evidence: "先判断哪些模态提供条件、哪种模态承载结果" },
          interpretation: { answer: "能力结果只能解释为特定任务切片的达标情况，不能按接口名称外推。", evidence: "结果只能解释为该任务切片上的能力" },
          boundary: { answer: "支持图像不代表 OCR、图表推理、定位和视频理解全部可靠。", evidence: "不能推出 OCR、图表推理、定位和视频理解全部达标" }
        },
        {
          section: 6,
          definition: { answer: "多模态挑战是对齐、计算与生成三个环节新增的失败来源。", evidence: "分成对齐、计算与生成三类" },
          problem: { answer: "它帮助定位纯文本模型没有的看错、对错关系和视觉幻觉问题。", evidence: "它有什么新的坑，是纯文本模型没有的" },
          inputOutput: { answer: "诊断输入是失败样本、模态原件和中间表示，输出是首次出错环节及处置。", evidence: "诊断输入是失败样本、模态原件和中间表示" },
          mechanism: { answer: "依次检查原始输入、编码保真、跨模态对应和生成忠实度。", evidence: "原始输入是否清楚—编码是否保留关键信息" },
          interpretation: { answer: "仅观察最终回答无法区分没看清、没对齐或语言模型脑补。", evidence: "单看最终回答无法区分" },
          boundary: { answer: "关键场景仍需与原始图像或独立工具核对，不能把描述当客观读数。", evidence: "关键场景仍需核对" }
        }
      ]
    },
    "context-window": {
      contractVersion: 2,
      examples: [{
        section: 1,
        evidence: {
          setup: "在 16K 预算里",
          rule: "加起来一旦超过上限",
          steps: "总占用 12K",
          interpretation: "留下 4K 给工具结果波动或更长回答"
        }
      }],
      formulas: [{
        id: "context-window-kv-bytes",
        section: 4,
        formulaIndex: 1,
        symbols: [
          { name: "B", meaning: "单请求 KV 缓存的字节数", evidence: "单个请求的 KV 缓存字节数" },
          { name: "L", meaning: "模型层数", evidence: "L 是层数" },
          { name: "H", meaning: "每层 KV 头数", evidence: "是每层 KV 头数" },
          { name: "d", meaning: "每个注意力头的维度", evidence: "是每个头的维度" },
          { name: "n", meaning: "已经缓存的 token 数", evidence: "是已经缓存的 token 数" },
          { name: "b", meaning: "每个数值元素占用的字节数", evidence: "是每个数值元素占用的字节数" }
        ]
      }],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "上下文窗口是模型单次调用能够直接条件化的 token 总量上限。", evidence: "上下文窗口是模型单次处理时能容纳的" },
          problem: { answer: "它解决一次调用中哪些信息能直接影响下一 token 的容量问题。", evidence: "哪些信息能够直接影响下一 token" },
          inputOutput: { answer: "输入是规则、历史、证据、工具结果和输出预留，输出是不超限的 token 布局。", evidence: "输入是系统规则、用户内容、历史、检索证据" },
          mechanism: { answer: "服务用 tokenizer 计数，超限后按产品策略拒绝、裁剪或压缩。", evidence: "先按 tokenizer 计数" },
          interpretation: { answer: "16K 等数值表示共享容量上限，不表示每个位置都能同样准确地利用。", evidence: "窗口大小只表示容量上限" },
          boundary: { answer: "具体是否计入输出及超限后的处理方式取决于产品实现。", evidence: "具体行为取决于产品实现" }
        },
        {
          section: 2,
          definition: { answer: "无状态调用表示模型不会自动保留上一次请求的对话内容。", evidence: "基础推理调用通常是无状态的" },
          problem: { answer: "它解释聊天看似记得过去而 API 每轮仍需重发历史的原因。", evidence: "模型是不是把对话「记住」了" },
          inputOutput: { answer: "输入是本次提交及外部取回内容，输出是只以这些 token 为条件的回答。", evidence: "输入是本次显式提交的消息与外部取回内容" },
          mechanism: { answer: "应用通过重发历史、摘要或检索结果，让旧信息重新进入当前计算。", evidence: "应用通过重发历史、摘要或检索结果制造连续体验" },
          interpretation: { answer: "回答提到旧信息只说明该信息本轮可见，不说明模型永久记住了它。", evidence: "只能解释为该信息本轮仍可见" },
          boundary: { answer: "服务端用户资料、外部记忆或参数更新属于其他机制，并非上下文窗口。", evidence: "属于外部记忆或训练，不是上下文窗口本身" }
        },
        {
          section: 3,
          definition: { answer: "上下文长度受标准全局注意力的平方位置关系及其他系统资源共同约束。", evidence: "平方开销是重要约束，但不是唯一原因" },
          problem: { answer: "它解释厂商为什么不能把所有模型的窗口免费扩展到无限大。", evidence: "为什么厂商不干脆做成无限" },
          inputOutput: { answer: "输入序列长度 n，输出需要计算或存储的位置关系数量与资源开销。", evidence: "输入变量是序列长度" },
          mechanism: { answer: "全局自注意力让每个位置与所有位置比较，因而形成 n² 个注意力分数。", evidence: "每个位置与全部位置比较" },
          interpretation: { answer: "长度扩大十倍时位置对约扩大一百倍，说明长前缀会迅速变贵。", evidence: "长度扩大十倍，位置对扩大约一百倍" },
          boundary: { answer: "滑窗、稀疏注意力和高效内核能改变复杂度或常数，因此并非所有实现相同。", evidence: "不代表所有长上下文实现都严格按同一常数增长" }
        },
        {
          section: 4,
          definition: { answer: "声明长度、注意力计算、KV 容量和有效利用是四种不同限制。", evidence: "注意力计算、KV 容量和有效长度不是一回事" },
          problem: { answer: "它解释同样支持 16K 的请求为何可能分别变慢、溢出或答错。", evidence: "有的请求慢、有的并发一高就 OOM" },
          inputOutput: { answer: "诊断输入包含长度、并发、硬件、证据位置和结果，输出是真正瓶颈。", evidence: "诊断输入是请求长度、并发、硬件配置、证据位置和任务结果" },
          mechanism: { answer: "分别测量计算、KV 占用、长度泛化和上下文装配，定位首次失效层。", evidence: "计算、KV 容量、训练长度或装配中的真正瓶颈" },
          interpretation: { answer: "接口成功只代表输入被接收，不能替代准确率或并发容量证据。", evidence: "不能用接口返回成功替代准确率" },
          boundary: { answer: "KV 估算不含模型权重、临时工作区和内存碎片，只能作为容量近似。", evidence: "不包含模型权重、临时工作区和内存碎片" }
        },
        {
          section: 5,
          definition: { answer: "有效上下文是模型在当前任务中实际能够正确取用的信息。", evidence: "有效上下文是模型在当前任务中实际能够取用并正确运用的信息" },
          problem: { answer: "它解决接口能接收很多 token 却仍可能漏掉证据或受噪声干扰的问题。", evidence: "把所有资料一股脑塞进去，就万事大吉了吗" },
          inputOutput: { answer: "输入是候选材料及排序，输出是能够引用正确证据的任务答案。", evidence: "输入是候选材料及其顺序" },
          mechanism: { answer: "注意力从大量 token 选择线索，而位置偏差与无关内容会改变选择。", evidence: "模型通过注意力从大量 token 中选择线索" },
          interpretation: { answer: "一次回答正确不能证明整个窗口的每个位置都被可靠利用。", evidence: "不能由一次成功回答推出整段窗口都被可靠使用" },
          boundary: { answer: "长窗口有中间迷失与噪声稀释，关键材料仍需选择和合理放置。", evidence: "位置偏差和无关噪声会改变选择" }
        },
        {
          section: 6,
          definition: { answer: "窗口治理是对超预算内容进行保留、检索、压缩、排序和预留的过程。", evidence: "输出是保留、检索、压缩、排序及输出预留方案" },
          problem: { answer: "它解决内容超过窗口或长对话开始丢失早期信息的问题。", evidence: "当要处理的内容超过窗口" },
          inputOutput: { answer: "输入是超预算内容、任务目标与失败代价，输出是可执行的上下文装配方案。", evidence: "窗口治理接收超预算内容、任务目标和失败代价" },
          mechanism: { answer: "先保护硬规则，再检索证据、压缩可恢复历史并预留工具和回答空间。", evidence: "先保护不可丢失的规则与当前任务" },
          interpretation: { answer: "方案要同时比较答案质量、证据覆盖、成本和延迟，而非只看是否塞入。", evidence: "比较答案质量、证据覆盖、成本和延迟" },
          boundary: { answer: "摘要、检索与外部记忆都会漏失或过期，需要原文回查和失败回退。", evidence: "需要原文回查与失败回退" }
        }
      ]
    },
    "lost-in-middle": {
      contractVersion: 2,
      examples: [{
        section: 9,
        evidence: {
          setup: "30 个等长文档",
          rule: "只改变位置",
          steps: "34/60≈56.7%",
          interpretation: "绝对提升 20 个百分点"
        }
      }],
      formulas: [{
        id: "lost-in-middle-position-accuracy",
        section: 3,
        formulaIndex: 1,
        symbols: [
          { name: "A", meaning: "当前条件下测得的任务准确率", evidence: "当前条件下测得的任务准确率" },
          { name: "p", meaning: "证据的归一化相对位置", evidence: "证据在上下文中的归一化相对位置" },
          { name: "L", meaning: "上下文的总 token 长度", evidence: "上下文总 token 长度" },
          { name: "d", meaning: "相似干扰项的数量或强度", evidence: "相似干扰项的数量或强度" }
        ]
      }],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "中间迷失是证据位于长上下文不同位置时表现发生变化的经验效应。", evidence: "中间迷失是一个需要实验确认的经验位置效应" },
          problem: { answer: "它解释内容虽在窗口内，模型却可能无法稳定利用中段证据的问题。", evidence: "位于中段时常更差" },
          inputOutput: { answer: "输入是同题同证据的不同位置版本，输出是各位置桶准确率或引用命中率。", evidence: "输出是各位置桶的准确率或引用命中率" },
          mechanism: { answer: "固定其余内容只移动关键证据，观察任务表现是否随位置稳定变化。", evidence: "只移动证据就引起稳定变化" },
          interpretation: { answer: "U 形曲线表示该实验首尾优于中段，不是所有系统的固定定律。", evidence: "U 形曲线表示首尾在该实验中优于中段" },
          boundary: { answer: "不同模型、任务和长度可能没有相同形状，必须在目标工作负载复测。", evidence: "不表示每个模型、长度和任务都有同一形状" }
        },
        {
          section: 2,
          definition: { answer: "窗口容量是接口可接收的上限，有效上下文是任务中能被可靠利用的部分。", evidence: "上下文窗口与有效上下文有什么区别" },
          problem: { answer: "它避免把 128K 等容量声明误当成任意位置的任务可靠性。", evidence: "不能用厂商窗口数字替代自己工作负载上的位置与长度评测" },
          inputOutput: { answer: "容量输入请求长度并输出是否接受；利用评测输入任务条件并输出质量和引用。", evidence: "容量指标的输入是请求 token 数" },
          mechanism: { answer: "容量由服务上限判定，有效利用则通过位置和长度受控实验测得。", evidence: "前者由服务上限判定，后者必须通过任务实验测得" },
          interpretation: { answer: "支持 128K 只说明可接收，不说明中间证据一定会被正确使用。", evidence: "只能解释为可接收容量" },
          boundary: { answer: "任务难度、干扰项、提示结构与模型版本都会改变有效长度。", evidence: "还受任务难度、干扰项、检索需求、提示结构和模型版本影响" }
        },
        {
          section: 3,
          definition: { answer: "位置曲线是准确率随证据位置、长度与干扰条件变化的分桶结果。", evidence: "怎样把位置效应测成一条曲线" },
          problem: { answer: "它把位置敏感从主观印象变成可重复、可比较的测量。", evidence: "只比较一个开头样本和一个中间样本，无法排除样本难度和偶然波动" },
          inputOutput: { answer: "输入是配对问题及位置长度干扰设置，输出准确率、置信区间和样本量。", evidence: "输出每个条件的准确率、置信区间和样本量" },
          mechanism: { answer: "每题生成首中尾版本并随机化无关顺序，让每道题成为自己的对照。", evidence: "使题目自身成为对照" },
          interpretation: { answer: "曲线显示位置与表现的条件关系，不直接给出唯一成因。", evidence: "表示准确率可能随三个变量共同变化" },
          boundary: { answer: "差异小于统计波动或样本太少时，不能宣称存在位置效应。", evidence: "不能宣称出现位置效应" }
        },
        {
          section: 4,
          definition: { answer: "中间迷失的候选机制包括位置偏置、长距检索、干扰竞争和提示结构。", evidence: "可能因素包括首因/近因偏置、长距离检索困难" },
          problem: { answer: "它回答复现位置曲线后该如何谨慎解释可能成因。", evidence: "为什么会发生" },
          inputOutput: { answer: "输入是位置曲线、内部轨迹和受控消融，输出是仍成立的候选解释。", evidence: "输入是已复现的位置曲线、注意力或检索轨迹和受控消融" },
          mechanism: { answer: "分别改变训练长度、干扰相似度和提示结构，观察曲线响应以缩小原因。", evidence: "观察曲线如何变化，可以缩小原因范围" },
          interpretation: { answer: "注意力相关只能作为诊断线索，不能当作唯一因果证据。", evidence: "注意力权重相关只能作为线索" },
          boundary: { answer: "现象复现不意味着存在适用于所有模型的单一机制。", evidence: "不等于存在一个适用于所有模型的单一机制答案" }
        },
        {
          section: 5,
          definition: { answer: "缓解方案通过减少干扰并让问题和关键证据更容易相互定位。", evidence: "减少无关上下文，并让任务与关键证据更容易彼此定位" },
          problem: { answer: "它解决关键证据被大量无关或相似内容淹没的问题。", evidence: "如何降低关键证据被淹没" },
          inputOutput: { answer: "输入原始候选、问题与预算，输出去重重排且带来源的紧凑上下文。", evidence: "输出去重、重排、带来源标记的紧凑上下文" },
          mechanism: { answer: "先筛无关项，再将高价值证据移近任务并保留追溯引用。", evidence: "先筛掉无关内容" },
          interpretation: { answer: "提升表示证据更易定位，不表示模型的窗口能力被永久改变。", evidence: "效果应解释为证据更易定位" },
          boundary: { answer: "若召回已经漏掉正确证据，重排和位置调整无法补救。", evidence: "后续重排和位置调整都无法补救" }
        },
        {
          section: 6,
          definition: { answer: "可信验证是在相同位置、长度和干扰组合上比较基线与缓解方案。", evidence: "缓解方案怎样验证才可信" },
          problem: { answer: "它防止只测试答案位于开头的理想布局而高估方案效果。", evidence: "不能只测试“答案刚好在最前面”的理想布局" },
          inputOutput: { answer: "输入是基线和方案的同条件结果，输出分桶质量、引用、延迟与成本差异。", evidence: "输出是分桶质量、引用、延迟和成本差异" },
          mechanism: { answer: "只改变缓解方案，保存最终请求并核对证据集合是否保持一致。", evidence: "只允许缓解方案本身变化" },
          interpretation: { answer: "准确率升而引用错可能只是凭先验猜对，不能视作成功取证。", evidence: "模型可能凭先验猜对" },
          boundary: { answer: "平均分上升但高风险位置桶下降时，方案仍不能通过。", evidence: "方案仍不能通过" }
        },
        {
          section: 7,
          definition: { answer: "归因边界区分数据管道故障与模型对已在场证据的位置利用失败。", evidence: "哪些失败不能简单叫“中间迷失”" },
          problem: { answer: "它避免用中间迷失这个术语掩盖召回、解析、权限或截断故障。", evidence: "避免用一个流行术语掩盖普通的数据管道故障" },
          inputOutput: { answer: "输入失败请求、最终上下文和管道日志，输出数据故障或位置利用问题。", evidence: "输入是失败请求、最终装配内容和检索解析日志" },
          mechanism: { answer: "先确认正确证据在场，再只改变位置复测结果是否变化。", evidence: "仅改变位置会改变结果" },
          interpretation: { answer: "只有证据在场且位置置换改变结果时，才支持中间迷失归因。", evidence: "才把失败解释为中间迷失" },
          boundary: { answer: "无法构造位置对照时应保留原因未定，而不是强行归因。", evidence: "应保留“原因未定”" }
        },
        {
          section: 8,
          definition: { answer: "位置回归是随模型、提示和检索器版本持续重复的分桶评测。", evidence: "位置测试应进入持续评测" },
          problem: { answer: "它检测系统升级后有效上下文能力是否在特定位置或任务退化。", evidence: "模型、提示和检索器更新都可能改变有效上下文" },
          inputOutput: { answer: "输入固定可置换任务集和系统版本，输出分桶趋势、阈值与告警。", evidence: "输出按位置、长度、任务和风险分桶的趋势及告警" },
          mechanism: { answer: "每次升级重复相同装配评分流程，并与已保存基线逐桶比较。", evidence: "重复同一装配与评分流程并比较基线" },
          interpretation: { answer: "总平均稳定不能掩盖关键位置桶跌破最低门槛。", evidence: "总平均稳定但关键位置桶越过最低门槛" },
          boundary: { answer: "固定测试模板也会被过拟合，因此任务集需要定期更新。", evidence: "避免只对固定模板过拟合" }
        },
        {
          section: 9,
          definition: { answer: "本案例用同一退款证据的首中尾版本绘制位置准确率曲线。", evidence: "一条位置曲线怎样算出来" },
          problem: { answer: "它区分真实位置效应、题目偶然波动与重排同时删文档的混杂。", evidence: "怎样区分真实位置效应与样本偶然" },
          inputOutput: { answer: "输入是 30 篇等长文档的受控位置版本，输出正确数、准确率和区间。", evidence: "正确 / 60" },
          mechanism: { answer: "同题生成首中尾版本，只改变证据位置并按位置桶统计正确数。", evidence: "同一个问题实例分别生成开头、中间和结尾三个版本" },
          interpretation: { answer: "中段由 56.7% 升到 76.7% 是二十个百分点改善，但尚不能全归因位置。", evidence: "绝对提升 20 个百分点" },
          boundary: { answer: "若重排同时删除八篇干扰文档，就必须再做只改位置的消融。", evidence: "不能把全部提升归因于“位置更靠后”" }
        }
      ]
    },
    "in-context-learning": {
      contractVersion: 2,
      examples: [{
        section: 1,
        evidence: {
          setup: "zorp",
          rule: "zorp 与正向情感关联",
          steps: "沿临时映射应输出 zorp",
          interpretation: "不是把 zorp 的新含义永久写入权重"
        }
      }],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "上下文学习是模型仅凭当前提示中的任务说明和示例临时适配新任务。", evidence: "上下文学习的输入是任务说明" },
          problem: { answer: "它解决不训练模型也要快速试用新任务或临时标签映射的问题。", evidence: "不做任何训练，怎么可能让模型「学会」" },
          inputOutput: { answer: "输入是说明、示例和新查询，输出是按提示中临时规律生成的答案。", evidence: "输出是模型按提示中临时规律生成的答案" },
          mechanism: { answer: "模型在一次前向计算中利用示例定位模式，全程不更新权重。", evidence: "模型在一次前向计算中利用示例" },
          interpretation: { answer: "答对表示当前请求遵循了映射，不表示新规则已经写入参数。", evidence: "结果只说明当前请求中成功遵循了映射" },
          boundary: { answer: "删除示例或发起新请求后，临时标签约定不会自动保留。", evidence: "约定不会自动保留" }
        },
        {
          section: 2,
          definition: { answer: "上下文学习是运行时临时适配，微调是训练时持久修改模型权重。", evidence: "运行时的临时适配" },
          problem: { answer: "它解决面对新任务时该用提示示例还是训练参数的选择问题。", evidence: "这两者差在哪" },
          inputOutput: { answer: "输入任务与资源约束，输出临时提示适配、参数训练或组合方案。", evidence: "输入是任务稳定性、样本量、延迟、调用规模和维护约束" },
          mechanism: { answer: "ICL 每次把示例作为 token 计算，微调则通过损失和梯度更新参数。", evidence: "微调则用损失和梯度更新权重" },
          interpretation: { answer: "前者适合快速试验，后者适合长期固化，二者并非互斥。", evidence: "前者适合快速试验，后者适合长期固化" },
          boundary: { answer: "ICL 受窗口和重复 token 成本限制，微调则需要数据和训练维护。", evidence: "受上下文窗口限制，示例塞不多" }
        },
        {
          section: 3,
          definition: { answer: "任务定位解释认为示例帮助模型识别并续写预训练中学过的局部模式。", evidence: "示例在「定位任务」" },
          problem: { answer: "它解释只训练下一个 token 预测的模型为何能看示例后照做。", evidence: "凭什么看几个例子就会照做" },
          inputOutput: { answer: "输入是带重复格式与映射的 token 序列，输出是符合模式的下一个 token 分布。", evidence: "输出是符合该局部模式的下一个 token 分布" },
          mechanism: { answer: "预训练补全列表、问答和对照表，使模型学会识别当前模式并继续。", evidence: "预训练让模型练习补全大量列表、问答和对照表" },
          interpretation: { answer: "示例更像把已有能力拨到当前任务频道，而非从零灌输全部知识。", evidence: "示例只是把它「拨」到那个频道上" },
          boundary: { answer: "内部机制仍是活跃研究课题，任务定位不是已证实的唯一算法。", evidence: "不是已经证明的唯一内部算法" }
        },
        {
          section: 4,
          definition: { answer: "标签打乱实验是分别破坏 few-shot 提示组成部分的受控对照。", evidence: "研究者做过一个对照" },
          problem: { answer: "它检验示例究竟主要提供正确标签知识还是任务格式和范围。", evidence: "示例的标签是不是必须全对" },
          inputOutput: { answer: "输入原提示和四类改动版本，输出各版本在相同任务上的分数。", evidence: "输出各版本任务分数" },
          mechanism: { answer: "每次只改变标签、格式、标签集合或输入分布之一并比较降幅。", evidence: "每次只改变一项" },
          interpretation: { answer: "降幅小只说明该因素在当前实验影响较弱，不代表普遍无关。", evidence: "不表示它在所有任务都不重要" },
          boundary: { answer: "专业任务和新知识映射仍可能依赖完全正确且一致的示例。", evidence: "专业任务与新知识映射仍可能高度依赖正确示例" }
        },
        {
          section: 5,
          definition: { answer: "示例工程是在 token 预算内选择数量、覆盖、顺序和格式的过程。", evidence: "示例选择接收候选示例、当前查询和 token 预算" },
          problem: { answer: "它解决有限示例怎样组成更有效且更稳定的 few-shot 提示。", evidence: "到底怎么给，才最有效" },
          inputOutput: { answer: "输入候选示例、查询和预算，输出数量适中、覆盖充分且格式统一的提示。", evidence: "输出数量适中、类别覆盖、顺序稳定且格式统一的提示" },
          mechanism: { answer: "先保证正确一致，再选相似和边界样本，并以多个顺序复测。", evidence: "先保证正确与一致" },
          interpretation: { answer: "应看多个目标切片上的稳定收益，而非单一排列的一次高分。", evidence: "结果应看目标切片上的稳定收益" },
          boundary: { answer: "示例继续增加会边际递减并占用窗口，不是越多越好。", evidence: "不是越多越好" }
        },
        {
          section: 6,
          definition: { answer: "few-shot 思维链用带中间步骤的示例诱导模型按同类格式作答。", evidence: "让示例演示「怎么想」" },
          problem: { answer: "它解决仅给输入答案时难以诱导模型展示中间计算的问题。", evidence: "如果示例里连「怎么一步步想出答案」也写出来" },
          inputOutput: { answer: "输入是带推理格式的示例和新问题，输出是仿照格式生成的步骤与答案。", evidence: "输出是模型仿照该格式生成的步骤与答案" },
          mechanism: { answer: "模式续写让模型先生成类似中间步骤，再给出最终答案。", evidence: "通过模式续写诱导更长的中间计算" },
          interpretation: { answer: "步骤看似流畅只表示格式被复现，不能证明推理或事实正确。", evidence: "生成步骤看似合理不等于事实正确" },
          boundary: { answer: "必须用最终答案、可验证中间结果与任务边界共同验收。", evidence: "最终答案、可验证中间结果和任务边界共同验收" }
        },
        {
          section: 7,
          definition: { answer: "ICL 的实用边界由窗口、稳定性、持久性、覆盖范围和成本共同决定。", evidence: "边界判断输入是窗口容量、提示敏感性、知识新颖度" },
          problem: { answer: "它回答方便且无需训练的 ICL 为什么仍不能完全替代微调。", evidence: "为什么还需要微调" },
          inputOutput: { answer: "输入容量、敏感性、知识新颖度、规模和稳定要求，输出 ICL、微调或组合决策。", evidence: "输出是继续用 ICL、转向微调或两者组合的决策" },
          mechanism: { answer: "比较新增示例带来的分桶质量收益、token 成本与顺序波动。", evidence: "若增加示例只提高 token 成本却不再改善分桶质量" },
          interpretation: { answer: "顺序变化就跌破业务阈值，说明临时适配尚不够稳定。", evidence: "说明临时适配已接近实用边界" },
          boundary: { answer: "顺序变化就越过业务阈值或查询超出覆盖时，微调往往更合适。", evidence: "换顺序就越过业务阈值" }
        }
      ]
    },
    "sampling-params": {
      contractVersion: 2,
      examples: [{
        section: 3,
        evidence: {
          setup: "logits [2,1,0]",
          rule: "先用每个 logit 除以 T",
          steps: "[0.867,0.117,0.016]",
          interpretation: "小 T 放大 logit 差使分布变尖"
        }
      }],
      formulas: [
        {
          id: "sampling-softmax", section: 2, formulaIndex: 1,
          symbols: [
            { name: "p", meaning: "softmax 后的下一 token 概率", evidence: "softmax 后抽到该候选的概率" },
            { name: "z", meaning: "候选 token 的原始 logit", evidence: "候选 token i 的原始 logit" },
            { name: "i", meaning: "当前候选 token 的编号", evidence: "i 是当前候选编号" },
            { name: "j", meaning: "遍历全部词表候选的索引", evidence: "j 遍历词表中的全部候选" },
            { name: "c", meaning: "从所有 logits 同减的常数", evidence: "同时从所有 logits 减去的常数" },
            { name: "e", meaning: "自然指数函数的底数", evidence: "自然指数函数的底数" }
          ]
        },
        {
          id: "sampling-temperature", section: 3, formulaIndex: 1,
          symbols: [
            { name: "p", meaning: "缩放后的候选抽样概率", evidence: "缩放后候选 i 的抽样概率" },
            { name: "z", meaning: "候选 token 的原始 logit", evidence: "候选 i 的 logit" },
            { name: "i", meaning: "当前候选 token 的编号", evidence: "候选 i 的 logit" },
            { name: "T", meaning: "大于零的温度参数", evidence: "T 是大于 0 的温度" }
          ]
        }
      ],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "自回归生成是每次选择一个 token 并将其反馈到下一步的循环。", evidence: "自回归解码循环的输入是当前提示" },
          problem: { answer: "它解释早期一次随机选择为何能让后续整段回答走向不同路径。", evidence: "为什么会改写后面整段回答" },
          inputOutput: { answer: "输入当前提示和已生成前缀，输出一个新 token 或停止信号。", evidence: "输出是一个新 token 或停止信号" },
          mechanism: { answer: "模型给 logits，解码器变形过滤并选择，再把 token 追加为下一步输入。", evidence: "解码器变形、过滤并选择一个 token" },
          interpretation: { answer: "单条回答只是一次路径实现，不代表从同一分布采样的其他路径。", evidence: "单条输出只是这条路径的结果" },
          boundary: { answer: "任何一步分叉都会改变后续条件分布，因此局部概率不能单独解释整段结果。", evidence: "微小分叉会改变之后每一步的条件分布" }
        },
        {
          section: 2,
          definition: { answer: "logit 是相对分数，softmax 将整组 logits 归一化成概率分布。", evidence: "logits 只是相对分数，softmax 才给概率" },
          problem: { answer: "它解决模型原始分数怎样变成可用于抽样的下一 token 概率。", evidence: "给所有 logits 同时加 100，概率为什么不变" },
          inputOutput: { answer: "输入全词表相对 logits，输出总和为一的下一 token 概率。", evidence: "输出和为 1 的下一 token 概率分布" },
          mechanism: { answer: "先指数化各分数，再除以全体指数和完成归一化。", evidence: "指数化放大分数差，再用总和归一化" },
          interpretation: { answer: "概率只表示当前前缀下模型的相对语言偏好，不是事实正确率。", evidence: "不是事实正确率" },
          boundary: { answer: "单步概率不能直接当作整段答案的置信度。", evidence: "不能直接当整段答案置信度" }
        },
        {
          section: 3,
          definition: { answer: "温度是在 softmax 前用正数 T 缩放全部 logits 差异的参数。", evidence: "温度缩放输入原始 logits 和正数 T" },
          problem: { answer: "它控制同一候选排名下概率分布是更尖锐还是更平坦。", evidence: "同一排名怎样变尖或变平" },
          inputOutput: { answer: "输入原始 logits 与温度 T，输出尖锐度改变的新概率分布。", evidence: "输出尖锐度改变的新概率分布" },
          mechanism: { answer: "每个 logit 除以 T 后再经过 softmax 归一化。", evidence: "先用每个 logit 除以 T，再做 softmax" },
          interpretation: { answer: "小 T 强化高分候选，大 T 增加尾部候选的抽样机会。", evidence: "T 大时尾部占比上升" },
          boundary: { answer: "温度不增加知识，且 T 等于零通常是服务的贪心特判。", evidence: "T=0 通常是服务自定义的贪心特判" }
        },
        {
          section: 4,
          definition: { answer: "top-k 是只保留分数排名前 k 个候选的固定数量截断。", evidence: "top-k 把排名 k 之后的 logits 设为负无穷" },
          problem: { answer: "它减少低排名尾部候选，但固定数量无法适应不同分布形状。", evidence: "固定候选数，不看概率间隔" },
          inputOutput: { answer: "输入候选分数和整数 k，输出前 k 个候选及重归一化概率。", evidence: "输出只含排名前 k 的支持集及重归一化概率" },
          mechanism: { answer: "删除 k 名之后的候选，再把保留概率除以其总和。", evidence: "其余候选分数置为负无穷后重新归一化" },
          interpretation: { answer: "实际抽样应使用截断重归一化后的数值，而非原始概率。", evidence: "实际抽样概率必须读截断后的数值" },
          boundary: { answer: "极尖分布可能保留弱项，极平分布又可能删掉同样合理的候选。", evidence: "在极尖或极平分布上都可能过松或过严" }
        },
        {
          section: 5,
          definition: { answer: "top-p 保留累计概率首次达到阈值 p 的最小高概率前缀。", evidence: "累计质量首次达到阈值的最小候选前缀" },
          problem: { answer: "它让候选数量根据模型当前确定或犹豫程度动态变化。", evidence: "候选数随犹豫变化" },
          inputOutput: { answer: "输入降序概率和阈值 p，输出达到累计质量的候选集。", evidence: "top-p 接收已排序概率和累计阈值 p" },
          mechanism: { answer: "从最高概率起累加，跨过阈值后截断并重新归一化。", evidence: "保留下来的概率还要再次归一化" },
          interpretation: { answer: "分布越尖集合越小，越平集合通常越大。", evidence: "分布尖时集合自动缩小，分布平时集合扩大" },
          boundary: { answer: "阈值包含规则、并列排序和最低保留数都取决于实现。", evidence: "不能只凭参数名假定" }
        },
        {
          section: 6,
          definition: { answer: "解码管线是惩罚、温度、截断与抽样按实现顺序组成的处理链。", evidence: "参数组合的先后会改变最终分布" },
          problem: { answer: "它解释相同参数数值在不同服务或处理顺序下为何结果不同。", evidence: "temperature、penalty、top-k、top-p 同时打开时" },
          inputOutput: { answer: "输入原始 logits、生成历史和参数，输出最终支持集与抽样分布。", evidence: "输出是最终支持集与抽样分布" },
          mechanism: { answer: "惩罚改分数，温度改累计速度，top-k 或 top-p 再删除候选。", evidence: "惩罚会改分数甚至排名" },
          interpretation: { answer: "组合效果只能依据具体服务的处理顺序和默认值解释。", evidence: "参数组合只能按服务实现解释" },
          boundary: { answer: "同时启用多种截断可能比任一单独机制严格得多。", evidence: "可能比任一单独策略严格得多" }
        },
        {
          section: 7,
          definition: { answer: "重复惩罚依据已生成 token 历史修改当前候选分数或可选集合。", evidence: "重复惩罚接收已生成 token 历史和当前 logits" },
          problem: { answer: "它用于缓解机械循环和无意义复述，但可能压制必要重复。", evidence: "为什么减少“的的的”也可能破坏代码变量和固定术语" },
          inputOutput: { answer: "输入历史与当前 logits，输出对已出现 token 调整后的分数。", evidence: "输出对出现过的 token 调整后的分数" },
          mechanism: { answer: "presence 看出现与否，frequency 看次数，n-gram 规则可直接禁止续写。", evidence: "presence 看是否出现，frequency 看次数" },
          interpretation: { answer: "重复率降低不等于语义质量提高，必须检查任务正确性。", evidence: "较低重复率不等于语义更好" },
          boundary: { answer: "代码、引用和固定术语需要复用时，惩罚可能删掉唯一正确候选。", evidence: "惩罚可能删除唯一正确候选" }
        },
        {
          section: 8,
          definition: { answer: "停止条件是在 token、文本、结构或预算层决定何时结束生成的规则。", evidence: "停止条件决定边界，不决定内容完整性" },
          problem: { answer: "它避免模型无限生成并为服务设置明确的输出边界。", evidence: "EOS、停止字符串和 max tokens 有什么本质区别" },
          inputOutput: { answer: "输入新 token、解码文本、语法状态和预算，输出继续或停止及原因。", evidence: "输出继续生成或停止及结束原因" },
          mechanism: { answer: "EOS 匹配 token，停止串匹配文本，最大长度检查预算，语法器检查接受态。", evidence: "EOS 在 token 层触发" },
          interpretation: { answer: "结束原因只说明哪个规则触发，不能说明内容完整或语义正确。", evidence: "停止成功不能解释为内容完整或语义正确" },
          boundary: { answer: "停止串可能跨流式块或出现在引用中，需要有状态匹配和防误截。", evidence: "流式跨块与引用中误命中仍需处理" }
        },
        {
          section: 9,
          definition: { answer: "贪心、束搜索和随机采样是从逐步候选分布构造序列的三类策略。", evidence: "贪心、采样、束搜索分别优化什么" },
          problem: { answer: "它解决每步局部选择怎样转化为整条输出序列的搜索问题。", evidence: "为什么不保证整条序列概率最高" },
          inputOutput: { answer: "输入每步候选分布，输出一条或多条完成序列。", evidence: "输出一条或多条完成序列" },
          mechanism: { answer: "贪心留第一名，束搜索保留多前缀，随机采样按概率选择。", evidence: "束搜索保留若干累计高分前缀" },
          interpretation: { answer: "序列最终应按任务质量验收，不能把模型概率直接等同正确。", evidence: "最终应按任务质量解释" },
          boundary: { answer: "束宽、长度偏置和开放生成退化限制束搜索的适用范围。", evidence: "限制了束搜索的适用范围" }
        },
        {
          section: 10,
          definition: { answer: "任务化参数选择是围绕成功标准与风险验证候选解码配置。", evidence: "按任务选择参数，而不是寻找万能配方" },
          problem: { answer: "它避免把代码低温、创作高温等经验当作跨模型通用定律。", evidence: "为什么仍只是粗略经验" },
          inputOutput: { answer: "输入任务标准、风险、成本和服务实现，输出配置与外部验收方案。", evidence: "输出候选解码配置与外部验收方案" },
          mechanism: { answer: "先建低随机基线，再逐项扫描机制并对组合做消融复测。", evidence: "先建立低随机基线" },
          interpretation: { answer: "低温只会稳定已有高分路径，不会修正知识或算法错误。", evidence: "低温只让既有高分路径更稳定" },
          boundary: { answer: "事实、代码和结构任务仍需证据、测试或解析器进行外部验证。", evidence: "无法修复知识错误、偏见或错误算法" }
        },
        {
          section: 11,
          definition: { answer: "seed 是随机数生成器的起点，不是整个推理系统的确定性快照。", evidence: "seed 只固定某个随机数生成器的序列" },
          problem: { answer: "它解释固定随机种子后输出仍可能因系统细节变化而分叉。", evidence: "固定 seed 为什么仍未必完全可复现" },
          inputOutput: { answer: "输入 seed、请求、版本、实现与环境，输出可比较的 token 路径。", evidence: "输出是可比较的 token 路径" },
          mechanism: { answer: "概率边界或抽取顺序一变，同一随机数就可能落入不同候选区间。", evidence: "让同一随机数选中不同 token" },
          interpretation: { answer: "托管服务固定 seed 通常表示近似复现，不是逐字一致证明。", evidence: "只能提供近似复现" },
          boundary: { answer: "模型、tokenizer、浮点内核、批处理与解码实现都必须同时锁定。", evidence: "模型与 tokenizer 版本、解码实现和执行环境" }
        },
        {
          section: 12,
          definition: { answer: "随机系统评测是在固定条件下重复采样并统计质量与失败分布。", evidence: "随机解码评测接收固定输入集" },
          problem: { answer: "它解决一次生成结果无法代表参数总体质量与尾部风险的问题。", evidence: "一次生成的好坏为什么不能代表" },
          inputOutput: { answer: "输入固定数据、版本和配置，输出质量、多样性、方差、成本与失败分布。", evidence: "输出多次独立采样的质量、多样性、方差、成本与失败分布" },
          mechanism: { answer: "固定其余条件逐项扫描，重复独立采样，再用外部工具验收。", evidence: "用解析器、测试或证据做外部验证" },
          interpretation: { answer: "均值需和方差、分位数与最坏失败一起解释。", evidence: "均值不能掩盖最坏失败" },
          boundary: { answer: "字符串差异大不等于有价值的多样性，必须结合任务标准。", evidence: "高字符串差异也不自动等于有价值的多样性" }
        }
      ]
    },
    "logprobs": {
      contractVersion: 2,
      examples: [{
        section: 7,
        evidence: {
          setup: "两个token概率0.8和0.25",
          rule: "自回归条件概率相乘",
          steps: "总 logprob≈",
          interpretation: "不同聚合偏好不同长度"
        }
      }],
      formulas: [
        {
          id: "logprobs-sequence", section: 1, formulaIndex: 1,
          symbols: [
            { name: "P", meaning: "模型给事件分配的概率", evidence: "P 表示模型给事件分配的概率" },
            { name: "log", meaning: "自然对数函数", evidence: "log 是自然对数" },
            { name: "x", meaning: "序列中的 token", evidence: "xₜ 是位置 t 的 token" },
            { name: "n", meaning: "序列 token 总数", evidence: "n 是序列 token 总数" },
            { name: "t", meaning: "当前求和位置索引", evidence: "t 是求和位置索引" }
          ]
        },
        {
          id: "logprobs-candidate-score", section: 9, formulaIndex: 1,
          symbols: [
            { name: "score", meaning: "完整候选的总 logprob 分数", evidence: "是整段候选的总 logprob" },
            { name: "c", meaning: "完整候选标签序列", evidence: "c 是一个完整候选标签" },
            { name: "t", meaning: "候选中的 token 位置", evidence: "第 t 个候选 token" },
            { name: "p", meaning: "当前条件下的 token 概率", evidence: "当前条件下的 token 概率" },
            { name: "prompt", meaning: "所有候选共用的提示", evidence: "所有候选共用的提示" }
          ]
        },
        {
          id: "logprobs-expected-cost", section: 12, formulaIndex: 1,
          symbols: [
            { name: "E", meaning: "阈值下的平均业务成本", evidence: "阈值 τ 下的平均业务成本" },
            { name: "cost", meaning: "一次系统决策产生的业务代价", evidence: "平均业务成本" },
            { name: "τ", meaning: "自动回答的接收阈值", evidence: "τ 是自动接收阈值" },
            { name: "C", meaning: "三类动作各自的一次成本", evidence: "分别是错误接收、拒答和升级验证一次的代价" },
            { name: "P", meaning: "验证集上的经验事件概率", evidence: "验证集上对应动作事件的经验概率" }
          ]
        }
      ],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "序列 logprob 是各位置条件 token 概率取对数后的累计分数。", evidence: "序列 logprob 的输入是每个位置在既定前缀下的 token 概率" },
          problem: { answer: "它把许多很小的条件概率连乘变成稳定且可加的分数。", evidence: "连乘很多小概率为何要改成求和" },
          inputOutput: { answer: "输入各位置条件概率，输出整段候选可相加比较的对数分数。", evidence: "输出是整段候选可相加比较的对数分数" },
          mechanism: { answer: "对数把条件概率乘积转换成各位置 logprob 的求和。", evidence: "对数把条件概率连乘变成求和" },
          interpretation: { answer: "分数越接近零表示模型越偏好该 token 序列。", evidence: "总 logprob 越接近 0" },
          boundary: { answer: "模型偏好更高不能推出序列表达的事实更正确。", evidence: "不能推出事实更正确" }
        },
        {
          section: 2,
          definition: { answer: "答案分数是按任务规则把多个 token logprob 聚合后的结果。", evidence: "token 分数不等于答案分数" },
          problem: { answer: "它解决一句多 token 答案应如何形成可比较置信信号的问题。", evidence: "一句答案的置信度如何从多个 token 得到" },
          inputOutput: { answer: "输入多个 token logprob，输出总和、平均、最弱点或任务分数。", evidence: "输出总和、平均值、最弱位置或任务自定义分数" },
          mechanism: { answer: "先定义任务单位和规范候选，再在验证集选择聚合规则。", evidence: "先定义任务单位和候选规范" },
          interpretation: { answer: "总和偏短序列，平均值又可能隐藏一个关键低概率位置。", evidence: "总和随长度下降，平均值可能掩盖关键低概率 token" },
          boundary: { answer: "自由文本存在大量同义表达，单字符串聚合尤其不可靠。", evidence: "单一字符串分数边界尤其明显" }
        },
        {
          section: 3,
          definition: { answer: "高 logprob 只说明模型熟悉并偏好当前说法，不表示它符合事实。", evidence: "高概率也会自信地错" },
          problem: { answer: "它防止把语言模型内部概率误用成世界事实验证器。", evidence: "logprob 不是事实验证器" },
          inputOutput: { answer: "输入高分回答和独立证据，输出语言偏好与事实正确性的分别判断。", evidence: "输出是语言偏好和事实正确性的分别判断" },
          mechanism: { answer: "训练频率、提示暗示和流畅模式都可能抬高错误说法概率。", evidence: "训练频率、提示暗示和流畅模式都能提高 logprob" },
          interpretation: { answer: "高分可表示常见或流畅，低分也可能只是名字罕见。", evidence: "罕见但正确的名字又可能低分" },
          boundary: { answer: "世界事实必须通过检索、工具或人工证据独立验证。", evidence: "必须用检索、工具或人工证据验证世界事实" }
        },
        {
          section: 4,
          definition: { answer: "校准是把模型原始分数映射成目标任务上的经验正确频率。", evidence: "校准把分数映射到频率" },
          problem: { answer: "它赋予置信 0.8 等数值可检验的长期频率含义。", evidence: "“置信 0.8”应满足什么经验含义" },
          inputOutput: { answer: "输入原始分数和独立真实标签，输出分数到经验正确率的映射。", evidence: "输出分数到经验正确率的映射" },
          mechanism: { answer: "对相近分数分桶或拟合映射，再比较预测置信与实际正确率。", evidence: "把相近分数分桶后" },
          interpretation: { answer: "标为 0.8 的样本组长期应有约八成正确。", evidence: "应长期约八成正确" },
          boundary: { answer: "校准只在目标任务分布成立，模型提示或分布变化后需重做。", evidence: "变化后必须重新校准" }
        },
        {
          section: 5,
          definition: { answer: "选择性预测允许系统按置信和风险选择回答、升级或拒答。", evidence: "低于阈值可补检索、升级模型、请求澄清或转人工" },
          problem: { answer: "它解决模型不确定时仍强制回答会放大高代价错误的问题。", evidence: "低置信时系统应该做什么" },
          inputOutput: { answer: "输入校准分数、错误代价和覆盖要求，输出回答或回退动作。", evidence: "输出自动回答、补检索、升级、澄清或拒答动作" },
          mechanism: { answer: "阈值把低分样本交给更安全但更昂贵的处理路径。", evidence: "阈值把更多低分样本交给安全回退" },
          interpretation: { answer: "提高阈值通常降低覆盖，是否更安全要看风险曲线。", evidence: "通常降低覆盖" },
          boundary: { answer: "阈值必须按业务成本选择，不能只追求一个准确率数字。", evidence: "而非只看准确率" }
        },
        {
          section: 6,
          definition: { answer: "接口核验是按真实 tokenizer 和 API 位置汇总完整候选序列。", evidence: "分词与接口陷阱" },
          problem: { answer: "它避免只读首 token 而错误比较多 token 或共享前缀标签。", evidence: "不能只读一个 token" },
          inputOutput: { answer: "输入 tokenizer、完整候选和 API 返回，输出规范标签序列分数。", evidence: "输出每个规范标签的完整序列分数" },
          mechanism: { answer: "按实际切分逐 token 累加，并确认接口覆盖所需候选和位置。", evidence: "必须用实际 tokenizer 汇总完整序列" },
          interpretation: { answer: "top-k 中未返回只表示未暴露，不能解释为候选概率为零。", evidence: "top-k 未返回不等于概率为零" },
          boundary: { answer: "不同模型词表与训练分布不同，原始 logprob 没有共同刻度。", evidence: "跨模型原始 logprob 也没有共同刻度" }
        },
        {
          section: 7,
          definition: { answer: "本手算展示条件概率、总 logprob、平均 logprob 和几何平均的互换。", evidence: "完整手算：概率、logprob 与序列分数怎样互换" },
          problem: { answer: "它说明同一答案的不同聚合分数如何计算及各自偏差。", evidence: "两个token概率0.8和0.25组成的答案有多大联合概率" },
          inputOutput: { answer: "输入两个条件概率，输出联合概率和三种对数聚合结果。", evidence: "输出联合概率、总 logprob、平均 logprob 和几何平均概率" },
          mechanism: { answer: "概率先相乘得 0.20，对数分别相加得负 1.609。", evidence: "先相乘得 0.20" },
          interpretation: { answer: "这些结果描述同一序列偏好，但聚合方式会产生不同长度偏好。", evidence: "不同聚合偏好不同长度" },
          boundary: { answer: "这些模型分数都不能直接当作答案正确率。", evidence: "不能混作答案正确率" }
        },
        {
          section: 8,
          definition: { answer: "决策链把 token 信号经任务聚合、校准和风险策略转成动作。", evidence: "token信号必须经过任务校准才能触发行动" },
          problem: { answer: "它解决 API 局部概率怎样成为可用且可审计系统决策的问题。", evidence: "局部概率怎样变成可用的系统决策" },
          inputOutput: { answer: "输入 logprobs、任务单位、校准数据和代价，输出回答或回退动作。", evidence: "输出可审计的自动回答或回退动作" },
          mechanism: { answer: "依次完成序列或语义聚合、独立校准和风险阈值决策。", evidence: "依次做序列或语义聚合、独立校准和风险阈值决策" },
          interpretation: { answer: "动作表示校准后成本策略的选择，不是原始概率本身的结论。", evidence: "共同决定可执行动作" },
          boundary: { answer: "模型或分布任一变化都必须重放整条决策链。", evidence: "任何一层变化都要重放全链" }
        },
        {
          section: 9,
          definition: { answer: "完整候选比较是固定共同提示后累加每个标签 token 的条件 logprob。", evidence: "候选标签必须比较完整序列概率" },
          problem: { answer: "它公平处理长度不同、共享前缀或切分不同的候选标签。", evidence: "怎样公平比较" },
          inputOutput: { answer: "输入共同提示和多个完整标签，输出各标签整段条件 logprob。", evidence: "输出各标签整段条件 logprob" },
          mechanism: { answer: "用 teacher forcing 逐 token 累加，并按预定长度规则比较。", evidence: "用 teacher forcing 逐 token 累加" },
          interpretation: { answer: "分数较高表示该模型在共同提示下更偏好该完整标签。", evidence: "整段候选的总 logprob" },
          boundary: { answer: "tokenizer 或模型变化后须重算并分别校准，不能直接横比原始值。", evidence: "跨模型应先分别校准再比较预期风险" }
        },
        {
          section: 10,
          definition: { answer: "语义不确定性先把意义等价的不同字符串合并成答案簇。", evidence: "语义不确定性要先合并等价表达" },
          problem: { answer: "它避免把巴黎、Paris 等同义回答误当成互相竞争的不同答案。", evidence: "该算三种答案吗" },
          inputOutput: { answer: "输入多次生成和等价判定器，输出意义簇及每簇累计概率。", evidence: "输出意义簇及每簇累计概率" },
          mechanism: { answer: "用规则、执行结果或语义蕴含判定等价并累加簇内概率。", evidence: "规则、执行结果或语义蕴含把等价表达合并" },
          interpretation: { answer: "簇间概率更接近任务答案层的不确定性，而非措辞差异。", evidence: "更接近任务不确定性" },
          boundary: { answer: "聚类器会误合并或误拆分，必须以人工标注验证。", evidence: "必须用人工标注验证" }
        },
        {
          section: 12,
          definition: { answer: "覆盖率—风险曲线描述不同阈值下自动回答比例与已回答错误率。", evidence: "覆盖率—风险曲线比单一阈值更重要" },
          problem: { answer: "它区分提高阈值是真降低风险，还是仅仅让系统更少回答。", evidence: "会变安全还是只是更少回答" },
          inputOutput: { answer: "输入校准分数、真实标签和动作成本，输出覆盖、风险和期望成本曲线。", evidence: "输出每个阈值的覆盖率、已接收错误率和期望成本" },
          mechanism: { answer: "按分数排序并逐步扩大自动回答集合，在每点统计接收错误率。", evidence: "按分数排序逐步扩大自动集合" },
          interpretation: { answer: "阈值升高但风险不降表示该切片的排序或校准已经失效。", evidence: "说明分数排序或校准在该切片失效" },
          boundary: { answer: "不同长度、领域、损失和版本必须分别画曲线并持续回流标签。", evidence: "只监控平均logprob无法发现" }
        }
      ]
    },
    "prompt-engineering": {
      contractVersion: 2,
      examples: [{ section: 3, evidence: { setup: "初版“回答退款问题”", rule: "一次只修改一个因素", steps: "17 个通过", interpretation: "下一步应补检索证据或业务规则" } }],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "提示工程通过设计当前输入的措辞、结构、示例与约束改善输出。", evidence: "提示工程的输入是任务目标、受众、上下文、边界和输出要求" },
          problem: { answer: "它解决不训练模型时怎样快速提高任务输出命中率的问题。", evidence: "不训练、不改模型" },
          inputOutput: { answer: "输入任务约束，输出可提交给模型且能够测试的提示。", evidence: "输出是可直接提交给模型并能被测试的提示" },
          mechanism: { answer: "改变本次条件以收窄可接受续写范围，而不更新权重。", evidence: "通过改变当前请求的条件来收窄可接受输出" },
          interpretation: { answer: "通过表示特定模型和切片上的约束命中率提高。", evidence: "效果只对已测模型和任务切片成立" },
          boundary: { answer: "模型或输入分布变化后必须重新做回归测试。", evidence: "换模型或分布后需要回归" }
        },
        {
          section: 2,
          definition: { answer: "提示是条件生成过程可见的任务、格式、证据与行为条件。", evidence: "条件生成的输入是提示和已有前缀" },
          problem: { answer: "它解释模型权重不变时问法为何仍会显著改变结果。", evidence: "只是问法变了，凭什么结果差这么多" },
          inputOutput: { answer: "输入提示和前缀，输出下一 token 分布及最终续写。", evidence: "输出是下一 token 分布及最终续写" },
          mechanism: { answer: "提示改变可见条件，从而重新分配各候选 token 的概率。", evidence: "重新分配候选概率" },
          interpretation: { answer: "更符合要求只表示约束命中率提高，并非获得新知识。", evidence: "不表示模型获得了新知识" },
          boundary: { answer: "提示也不能赋予模型新知识或真实系统权限。", evidence: "不表示模型获得了新知识或真实权限" }
        },
        {
          section: 3,
          definition: { answer: "提示任务契约明确目标、上下文、边界、回退和输出结构。", evidence: "输出明确的目标、必要上下文、禁止边界、回退规则与可验证结构" },
          problem: { answer: "它把含糊愿望改成模型和评测器都可执行的任务。", evidence: "把一句含糊愿望，改写成模型和评测器都能执行的任务契约" },
          inputOutput: { answer: "输入原始需求与失败样本，输出可验证的提示契约。", evidence: "任务契约接收原始需求和失败样本" },
          mechanism: { answer: "一次只改一个因素，并在固定测试集上比较失败变化。", evidence: "在固定测试集复测" },
          interpretation: { answer: "改善应能对应特定失败减少，才可归因于该修改。", evidence: "分数改善应能对应某类失败减少" },
          boundary: { answer: "无法对应失败的提示堆叠不能形成可靠优化结论。", evidence: "不可归因的提示堆叠" }
        },
        {
          section: 4,
          definition: { answer: "上下文学习让模型凭当前提示中的示例临时定位任务模式。", evidence: "它的底层原理，其实是上下文学习" },
          problem: { answer: "它解释给示例、角色和格式为何能让模型照着输出。", evidence: "为什么「给几个示例、给个格式」模型就照做了" },
          inputOutput: { answer: "输入示例和新查询，输出按示例模式生成的回答。", evidence: "输出按示例模式生成的回答" },
          mechanism: { answer: "模型在前向计算中识别输入输出规律并续写相同模式。", evidence: "在前向计算中定位输入输出规律" },
          interpretation: { answer: "行为变化是当前上下文的临时塑造，并非参数学习。", evidence: "不把临时模式写入权重" },
          boundary: { answer: "上下文学习不保证每个提示都会被忠实遵循。", evidence: "不保证每个提示都被忠实遵循" }
        },
        {
          section: 5,
          definition: { answer: "提示边界诊断根据失败类型决定继续提示、RAG、工具或微调。", evidence: "输出继续改提示、接入 RAG、采用约束工具或微调的决策" },
          problem: { answer: "它回答提示压不稳或缺少事实时应当换用什么机制。", evidence: "什么时候该换招" },
          inputOutput: { answer: "输入失败类型、知识、稳定性、规模与成本，输出机制选择。", evidence: "边界诊断输入失败类型、知识来源、稳定性、调用规模和成本" },
          mechanism: { answer: "缺事实补证据，缺硬格式加约束验证，长期不稳再训练。", evidence: "缺事实时补证据" },
          interpretation: { answer: "持续失败说明根因可能不在措辞，而在知识或控制层。", evidence: "跨大量请求仍不稳定时再评估训练" },
          boundary: { answer: "提示不能创造模型没有的知识、权限或确定性保证。", evidence: "提示不能创造知识、权限或确定性保证" }
        },
        {
          section: 6,
          definition: { answer: "提示注入是不可信内容被模型误当成指令而偏离原任务的攻击。", evidence: "提示注入的输入是混有可信指令与不可信外部文本的上下文" },
          problem: { answer: "它揭示模型能被提示塑造也会形成可被恶意文本利用的攻击面。", evidence: "恶意的提示能不能劫持它" },
          inputOutput: { answer: "输入混合上下文，输出可能偏离原任务的模型行为。", evidence: "输出可能是偏离原任务的模型行为" },
          mechanism: { answer: "攻击利用模型以相同 token 通道读取指令与外部数据。", evidence: "同样以 token 读取指令和数据" },
          interpretation: { answer: "识别可疑语句只提供告警，不代表系统已经安全。", evidence: "检测到攻击语句不等于建立安全边界" },
          boundary: { answer: "必须依靠权限隔离、工具白名单、最小授权与人工确认。", evidence: "权限隔离、工具白名单、最小授权和人工确认" }
        }
      ]
    },
    "system-prompt": {
      contractVersion: 2,
      examples: [
        { section: 3, evidence: { setup: "用户要求退800元", rule: "超过500元需批准", steps: "退款工具根据登录主体", interpretation: "提示通过不代表退款获准" } },
        { section: 4, evidence: { setup: "建立200条契约测试", rule: "一次只改变规则表达", steps: "长版通过170条", interpretation: "净收益为负表示回归多于修复" } }
      ],
      formulas: [{
        id: "system-prompt-contract-metrics", section: 4, formulaIndex: 1,
        symbols: [
          { name: "r", meaning: "契约测试通过率", evidence: "r 是契约测试通过率" },
          { name: "m", meaning: "通过的测试条数", evidence: "m 是通过的测试条数" },
          { name: "n", meaning: "测试总条数", evidence: "n 是测试总条数" },
          { name: "Δ", meaning: "版本相对基线的净收益", evidence: "Δ 是版本相对基线的净收益" },
          { name: "f", meaning: "新版本修复的旧失败数", evidence: "f 是新版本修复的旧失败数" },
          { name: "g", meaning: "新版本造成的新回归数", evidence: "g 是新版本造成的新回归数" }
        ]
      }],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "系统提示是应用在每次推理中注入的高优先级行为契约 token。", evidence: "系统提示的输入是应用注入的角色、任务、行为边界和输出契约" },
          problem: { answer: "它为同一模型声明当前应用角色、任务边界和输出要求。", evidence: "文本是否变成模型不可违反的程序" },
          inputOutput: { answer: "输入角色、任务和契约，输出这些 token 条件下的回答分布。", evidence: "输出是这些 token 条件下的回答分布" },
          mechanism: { answer: "聊天模板编码角色，训练提高模型遵循高优先级指令的倾向。", evidence: "训练提高遵循高优先级指令的倾向" },
          interpretation: { answer: "遵循只表示概率行为符合预期，不是形式规则被执行。", evidence: "遵循结果只能当概率行为" },
          boundary: { answer: "秘密、身份、权限和副作用必须由模型外系统保护。", evidence: "必须由模型外系统控制" }
        },
        {
          section: 2,
          definition: { answer: "指令优先级按消息信任角色解决跨层冲突，而非只看出现时间。", evidence: "优先级解决冲突，时间顺序只补充同层上下文" },
          problem: { answer: "它解决用户、系统和不可信数据给出相反指令时应听谁的问题。", evidence: "用户消息为什么不应覆盖更早的系统约束" },
          inputOutput: { answer: "输入带角色来源和时间的消息，输出应执行任务和被忽略冲突。", evidence: "输出应执行的高层任务和被忽略的低层冲突" },
          mechanism: { answer: "系统开发者高于用户，网页工具文本只作数据，同层才按新意图更新。", evidence: "同一层才用较新意图补充" },
          interpretation: { answer: "优先级表示设计期望，运行时仍要检查模型是否实际遵守。", evidence: "优先级是期望规则，不是执行保证" },
          boundary: { answer: "模型可能解析冲突失败，因此副作用仍需确定性验证。", evidence: "运行时仍须验证输出与副作用" }
        },
        {
          section: 3,
          definition: { answer: "退款案例把系统提示、结构化提议、策略门和业务工具分层。", evidence: "退款助手的契约怎样从需求变成提示与硬门" },
          problem: { answer: "它说明超过五百元需批准不能只写成自然语言提示。", evidence: "超过500元需批准" },
          inputOutput: { answer: "输入请求、订单、金额规则与主体，输出退款提议或缺信息状态。", evidence: "输出是结构化退款提议或缺信息状态" },
          mechanism: { answer: "模型提出意图，策略门核验所有权金额令牌，工具执行并返回状态。", evidence: "确定性策略门再核验所有权、金额与审批令牌" },
          interpretation: { answer: "模型说可退款只表示建议，不表示现实退款已经获准。", evidence: "提示通过不代表退款获准" },
          boundary: { answer: "超过五百元且没有批准令牌时，执行器必须拒绝。", evidence: "执行器必须拒绝" }
        },
        {
          section: 4,
          definition: { answer: "提示消融是在同一契约测试集上只改变一个提示因素的实验。", evidence: "系统提示预算要用消融实验而不是越写越长" },
          problem: { answer: "它区分新增规则效果下降来自表达冲突还是上下文竞争。", evidence: "规则冲突还是上下文竞争" },
          inputOutput: { answer: "输入多个提示版本和固定测试集，输出通过、修复、回归、成本与延迟。", evidence: "输出通过率、修复数、回归数、成本和延迟" },
          mechanism: { answer: "一次只改规则表达并逐切片比较新修复与新回归。", evidence: "一次只改变规则表达并逐切片比较" },
          interpretation: { answer: "净收益为负表示新增回归超过修复，不应发布。", evidence: "净收益为负表示回归多于修复" },
          boundary: { answer: "总通过率可能掩盖关键安全回归，不能独自决定发布。", evidence: "不能独自决定发布" }
        },
        {
          section: 5,
          definition: { answer: "权限分层让模型只提意图，策略门授权，业务工具改变真实状态。", evidence: "提示契约与执行权限必须分层" },
          problem: { answer: "它保证模型遭到注入时仍有模型外层阻止真实副作用。", evidence: "哪一层仍能阻止真实副作用" },
          inputOutput: { answer: "输入结构化意图和权威状态，输出允许、拒绝或待审批工具调用。", evidence: "输出允许、拒绝或待审批的工具调用" },
          mechanism: { answer: "策略门核验身份金额目标域，工具负责幂等执行并回传事实。", evidence: "确定性策略门执行校验" },
          interpretation: { answer: "图中箭头表示控制流，不表示提示拥有现实授权。", evidence: "箭头表示控制流" },
          boundary: { answer: "系统提示不能替代身份、业务规则和工具权限校验。", evidence: "不表示系统提示本身拥有授权能力" }
        },
        {
          section: 6,
          definition: { answer: "最小分区提示将稳定目标、信任边界、流程、schema 和失败处理分开。", evidence: "最小、分区、无矛盾的契约" },
          problem: { answer: "它减少角色、政策、数据和示例混写造成的冲突与维护困难。", evidence: "混在一段里会发生什么" },
          inputOutput: { answer: "输入规则动态数据和边界，输出最小、分区且无矛盾的契约。", evidence: "输出最小、分区且无矛盾的行为契约" },
          mechanism: { answer: "稳定规则留提示，动态数据结构化注入，冲突明示优先级和回退。", evidence: "频繁变化的数据通过结构化配置或检索注入" },
          interpretation: { answer: "分区后更易定位规则来源和测试失败，不表示越短必然越好。", evidence: "提示越短并不自动越好" },
          boundary: { answer: "任何删减都必须用覆盖边界的正反例重新验收。", evidence: "仍须用覆盖边界的正反例验收" }
        },
        {
          section: 7,
          definition: { answer: "提示注入利用不可信数据与指令共享同一 token 和注意力通道。", evidence: "提示注入利用的是指令与数据共享通道" },
          problem: { answer: "它解释 XML 标签为何只能提示边界而不能提供真实隔离。", evidence: "为什么只能降低混淆而不能隔离" },
          inputOutput: { answer: "输入可信指令和恶意外部数据，输出模型意图及实际工具动作。", evidence: "输出模型意图和实际工具动作" },
          mechanism: { answer: "恶意 token 仍参与注意力，可能诱导模型改写目标或调用工具。", evidence: "恶意 token 仍参加同一注意力计算" },
          interpretation: { answer: "标签降低混淆不等于建立权限边界或证明抵抗攻击。", evidence: "标签只能提示“这是数据”" },
          boundary: { answer: "防线必须包括最小上下文、白名单、最小权限和审批。", evidence: "真正防线是最小上下文、工具白名单、最小权限与审批" }
        },
        {
          section: 8,
          definition: { answer: "系统提示不是秘密存储，应默认其文本或语义可能被复述和推断。", evidence: "系统提示不是秘密存储" },
          problem: { answer: "它解决哪些政策可以公开写入、哪些敏感资产必须留在服务端的问题。", evidence: "是否可以放内部政策和检测阈值" },
          inputOutput: { answer: "输入提示资产和攻击路径，输出复述、推断与实际损失判断。", evidence: "输出原文复述、语义推断与实际安全损失" },
          mechanism: { answer: "攻击可通过直接索要、逐段推断、错误回显或工具日志获取内容。", evidence: "直接索要、角色扮演、逐段推断、错误回显或工具日志" },
          interpretation: { answer: "公开规范被复述未必是事故，必须按资产价值判断。", evidence: "公开行为规范被复述未必是事故" },
          boundary: { answer: "密钥、个人数据和敏感检测逻辑绝不能进入提示上下文。", evidence: "不能进入上下文" }
        },
        {
          section: 9,
          definition: { answer: "输出契约用版本化 schema 和明确状态表达建议、拒绝与缺信息。", evidence: "输出结构与拒绝路径必须可被消费者验证" },
          problem: { answer: "它避免下游仅凭模型一句自然语言就触发现实副作用。", evidence: "下游为何不能只读这句话" },
          inputOutput: { answer: "输入模型建议，输出版本化状态字段和拒绝原因。", evidence: "输出版本化状态、字段和拒绝原因" },
          mechanism: { answer: "消费者依次校验类型、枚举、跨字段、身份和业务状态。", evidence: "依次做类型、枚举、跨字段、身份和业务状态校验" },
          interpretation: { answer: "结构合法只说明格式通过，不说明业务语义正确。", evidence: "结构合法只表示格式通过" },
          boundary: { answer: "自由文本解释不能触发副作用，权限仍以权威系统为准。", evidence: "自由文本解释不触发副作用" }
        },
        {
          section: 10,
          definition: { answer: "长时状态装配将系统规则、历史、摘要、工具观察和记忆组成每轮上下文。", evidence: "会话、摘要和记忆会让旧提示假设漂移" },
          problem: { answer: "它解释系统提示未改时长对话行为仍会变化的原因。", evidence: "为什么长对话后行为仍可能变化" },
          inputOutput: { answer: "输入不变量、历史摘要与记忆，输出本轮模型可见上下文。", evidence: "输出本轮模型可见上下文" },
          mechanism: { answer: "每轮重申边界、携带来源状态，任务切换时清除局部记忆。", evidence: "任务切换时清除局部记忆" },
          interpretation: { answer: "行为漂移可能来自条件上下文变化，不一定是系统提示文件变化。", evidence: "历史消息、压缩摘要、工具观察和记忆不断改变条件上下文" },
          boundary: { answer: "初始规则出现一次不能保证压缩后仍保留或阻止旧目标残留。", evidence: "不能保证摘要后仍存在" }
        },
        {
          section: 11,
          definition: { answer: "提示版本发布把提示及关联模型、模板、schema 和评测证据一起管理。", evidence: "版本化提示像代码" },
          problem: { answer: "它发现一句措辞修改对其他语言、任务、工具和拒绝行为的旁路影响。", evidence: "为什么也可能改变完全无关的任务" },
          inputOutput: { answer: "输入全套版本和回归集，输出带证据的候选版本与回滚包。", evidence: "输出带回归证据的候选版本与回滚包" },
          mechanism: { answer: "灰度比较任务成功、冲突、误拒、成本和人工修正。", evidence: "灰度比较任务成功、冲突、误拒、成本和人工修正" },
          interpretation: { answer: "文本 diff 只说明改动内容，不能证明行为没有回归。", evidence: "文本 diff 只说明改了什么" },
          boundary: { answer: "异常时必须能同时回滚提示和关联 schema。", evidence: "同时回滚提示与关联schema" }
        },
        {
          section: 12,
          definition: { answer: "契约测试用正常、冲突、恶意和故障四类样本验证行为边界。", evidence: "契约测试覆盖正常、冲突、恶意和故障四象限" },
          problem: { answer: "它避免只测理想对话而漏掉冲突、攻击和工具故障。", evidence: "不能只保存几个理想对话" },
          inputOutput: { answer: "输入四类样本，输出结构、决策、副作用与事实断言结果。", evidence: "输出结构、决策、副作用与用户可见事实的断言结果" },
          mechanism: { answer: "按语言长度版本风险切片执行，并保存失败与置信区间。", evidence: "按语言、长度、版本和风险切片统计" },
          interpretation: { answer: "措辞可变化，但高风险动作和事实边界必须确定性通过。", evidence: "高风险动作和事实边界必须确定性通过" },
          boundary: { answer: "模型评审只能辅助扩展，高风险判定仍需确定性检查或人工。", evidence: "高风险判定使用确定性检查或人工复核" }
        }
      ]
    },
    "context-engineering": {
      contractVersion: 2,
      examples: [{ section: 9, evidence: { setup: "签收 35 天", rule: "围绕验收条件定义必要字段", steps: "1+1+5+1=8K", interpretation: "最小充分”不是字数最少" } }],
      formulas: [
        {
          id: "context-engineering-budget", section: 3, formulaIndex: 1,
          symbols: [
            { name: "B", meaning: "各类上下文 token 预算", evidence: "分别是规则、当前任务、证据和历史的 token 占用" }
          ]
        },
        {
          id: "context-engineering-success-gates", section: 10, formulaIndex: 1,
          symbols: [
            { name: "S", meaning: "任务是否成功", evidence: "S 表示任务是否成功" },
            { name: "R", meaning: "必要证据是否被召回", evidence: "R 表示必要证据被召回" },
            { name: "K", meaning: "证据装配后是否保留", evidence: "K 表示装配后仍保留" },
            { name: "F", meaning: "压缩后关键事实是否保真", evidence: "F 表示压缩后关键事实保真" },
            { name: "U", meaning: "回答是否实际使用证据", evidence: "U 表示回答实际使用证据" },
            { name: "A", meaning: "是否通过最终业务验收", evidence: "A 表示最终通过业务验收" }
          ]
        }
      ],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "上下文工程在有限窗口内选择、排序、压缩和标注本轮可见信息。", evidence: "上下文工程的输入是本轮可用的规则、任务、证据、历史、工具结果与记忆" },
          problem: { answer: "它解决模型在当前时刻究竟能看到哪些完成任务所需信息的问题。", evidence: "模型回答时究竟“知道”什么" },
          inputOutput: { answer: "输入多类候选信息，输出带来源、顺序和预算的最终上下文包。", evidence: "输出是带来源、顺序和预算的最终上下文包" },
          mechanism: { answer: "装配器对信息进行选择、过滤、压缩、排序和更新。", evidence: "装配器进行选择、过滤、压缩和排序" },
          interpretation: { answer: "回答只表明模型使用最终包生成，不代表候选池全部可见。", evidence: "回答只说明模型基于最终包完成了生成" },
          boundary: { answer: "没有进入最终上下文的信息在本轮调用中无法直接使用。", evidence: "未进入包的信息本轮不可用" }
        },
        {
          section: 2,
          definition: { answer: "上下文按规则、任务、证据、记忆和示例五类职责分层。", evidence: "上下文由哪些层组成" },
          problem: { answer: "分层用于处理多来源内容的冲突、更新、权限和追溯。", evidence: "才能处理冲突、更新和可观测性" },
          inputOutput: { answer: "输入多来源内容，输出五类带来源时间可信度和作用域的区块。", evidence: "输出规则、任务、证据、记忆和示例五类带元数据区块" },
          mechanism: { answer: "元数据决定冲突优先级、更新方式和记忆适用范围。", evidence: "来源、时间、可信度和作用域决定冲突与更新方式" },
          interpretation: { answer: "文本离模型近只表示位置，不代表来源更可信。", evidence: "离模型更近只表示位置，不表示更可信" },
          boundary: { answer: "缺少来源标签时难以解释冲突或撤销错误记忆。", evidence: "无法可靠解释冲突或撤销错误记忆" }
        },
        {
          section: 3,
          definition: { answer: "token 预算是在窗口上限内为规则、任务、证据、历史和输出分配容量。", evidence: "token 预算应怎样分配" },
          problem: { answer: "它防止输入占满窗口后回答或工具结果被截断。", evidence: "给输出和工具往返留余量" },
          inputOutput: { answer: "输入窗口、候选 token 与输出需求，输出受保护、可压缩和余量预算。", evidence: "输出受保护预算、可压缩预算与安全余量" },
          mechanism: { answer: "先锁定规则任务输出，再按单位 token 价值挑证据和历史。", evidence: "先锁定规则、任务和输出" },
          interpretation: { answer: "不等式仅表示装配计划不超限，不保证所有位置同样可用。", evidence: "结果表示装配计划可行" },
          boundary: { answer: "预算规划不是鼓励把窗口全部填满，还须保留波动空间。", evidence: "不是鼓励把窗口全部填满" }
        },
        {
          section: 4,
          definition: { answer: "证据装配是在召回后继续过滤、重排、去重、扩展和组织候选。", evidence: "为什么检索到了还不够" },
          problem: { answer: "它解决候选池含答案但最终请求丢失、淹没或误用证据的问题。", evidence: "模型最终读到什么还取决于重排、切块、组织与引用" },
          inputOutput: { answer: "输入召回候选、权限时效和子问题，输出带邻接语境和引用的证据包。", evidence: "输出去重重排且保留邻接语境与引用的证据包" },
          mechanism: { answer: "依次做权限时效过滤、围绕子问题重排、去重扩展和结构化装配。", evidence: "过滤、重排、扩展和结构化决定模型实际读到什么" },
          interpretation: { answer: "召回命中只说明候选池有答案，不证明最终回答使用了它。", evidence: "召回命中只说明候选池含答案" },
          boundary: { answer: "关键证据被截断或压缩失真时，检索本身成功也无效。", evidence: "不能证明最终上下文保留或回答正确使用" }
        },
        {
          section: 5,
          definition: { answer: "记忆治理规定历史与记忆的写入、更新、撤销、作用域和保留期。", evidence: "记忆是一项有写入和淘汰规则的数据治理工作" },
          problem: { answer: "它防止过期、冲突或敏感历史持续污染后续任务。", evidence: "历史和记忆为什么不能无限累积" },
          inputOutput: { answer: "输入历史事实与作用域期限，输出可更新撤销追溯的摘要或记录。", evidence: "输出可更新、撤销和追溯的短期摘要或长期记录" },
          mechanism: { answer: "只写稳定有价值事实，并保留未解决项和证据链接。", evidence: "保留未解决项和证据链接" },
          interpretation: { answer: "流畅摘要只表示文本连贯，不能证明关键事实仍保真。", evidence: "流畅摘要不能解释为事实保真" },
          boundary: { answer: "敏感或过期记忆必须按作用域和保留期淘汰。", evidence: "敏感或过期记忆必须淘汰" }
        },
        {
          section: 6,
          definition: { answer: "外部文本是带来源的不可信数据，不应自动升级为模型指令。", evidence: "检索文档和网页属于不可信数据" },
          problem: { answer: "它降低网页、文档和工具结果中的隐形指令劫持模型的风险。", evidence: "外部文本如何避免变成隐形指令" },
          inputOutput: { answer: "输入外部文本来源和工具，输出标记数据及经过授权的动作。", evidence: "输出标记为数据的内容和经过授权的动作" },
          mechanism: { answer: "数据边界减少混淆，权限校验和批准阻止现实副作用。", evidence: "权限校验和人工批准阻止副作用" },
          interpretation: { answer: "一次拒绝恶意句子只是一条样本结果，不是安全保证。", evidence: "不代表形成安全保证" },
          boundary: { answer: "编码、多语言与间接注入仍须单独测试。", evidence: "编码、多语言和间接注入仍需测试" }
        },
        {
          section: 7,
          definition: { answer: "上下文可观测性使系统能够重建模型当时实际看见的信息。", evidence: "必须能重建“模型当时看见了什么”" },
          problem: { answer: "它把笼统的模型答错拆成可定位的召回、装配、压缩或生成故障。", evidence: "如何观测并调试上下文系统" },
          inputOutput: { answer: "输入最终上下文、元数据、裁剪、版本和输出，输出可重放失败轨迹。", evidence: "输出可重放的失败轨迹与首次失效关卡" },
          mechanism: { answer: "逐层测召回排序保真引用答案，并用消融定位贡献。", evidence: "用消融定位贡献" },
          interpretation: { answer: "首次失效关卡说明应修复哪个管道环节，而非默认换模型。", evidence: "首次失效关卡" },
          boundary: { answer: "日志必须脱敏，不能为了调试重新泄露用户秘密。", evidence: "日志不能为了调试重新泄露用户秘密" }
        },
        {
          section: 8,
          definition: { answer: "更长上下文扩大容量上限，但不自动提高有效利用和系统质量。", evidence: "更长上下文”为什么不等于“更好系统" },
          problem: { answer: "它防止把所有历史拼接进大窗口并假设结果必然改善。", evidence: "不是把所有历史直接拼接" },
          inputOutput: { answer: "输入材料位置长度成本和任务结果，输出容量与有效利用的分离曲线。", evidence: "输出容量与有效利用的分离曲线" },
          mechanism: { answer: "比较不同长度与位置下的证据充分性、冲突、延迟和准确率。", evidence: "更多 token 会增加冲突、延迟和中间迷失概率" },
          interpretation: { answer: "较短但证据充分的上下文可能比更长的文本堆更有效。", evidence: "较短但证据充分的包可能更好" },
          boundary: { answer: "窗口扩容不能替代检索、排序、更新和任务验证。", evidence: "不能替代检索、排序、更新和验证" }
        },
        {
          section: 9,
          definition: { answer: "本案例把 27K 候选压成 8K 最小充分输入并保留 4K 余量。", evidence: "一次 16K 退款问答怎样装配" },
          problem: { answer: "它解决退款一般规则、质量例外、订单事实和输出如何共存于窗口。", evidence: "有限窗口变成最小充分证据包" },
          inputOutput: { answer: "输入 27K 候选信息，输出 8K 输入、4K 余量和可追溯证据。", evidence: "装配后输入 1+1+5+1=8K" },
          mechanism: { answer: "保护规则任务，压缩历史，保留一般规则、质量例外和版本元数据。", evidence: "保留 30 天一般规则、质量例外及版本元数据" },
          interpretation: { answer: "最小充分表示所有决定字段齐全，而不是文本字数最少。", evidence: "最小充分”不是字数最少" },
          boundary: { answer: "摘要不得丢失例外、否定、数值、未解决项和来源。", evidence: "摘要必须保留例外、否定、数值、未解决项和来源" }
        },
        {
          section: 10,
          definition: { answer: "管道评测把任务成功拆成召回、保留、保真、使用和业务验收关卡。", evidence: "先把成功事件拆成可观察关卡" },
          problem: { answer: "它区分最终答案变化究竟由哪个上下文环节或模型造成。", evidence: "怎样区分是召回、筛选、压缩、排序还是模型本身造成的" },
          inputOutput: { answer: "输入冻结数据模型和装配变体，输出逐关卡、切片、成本和样本差异。", evidence: "输出每个关卡、任务切片、成本和逐样本差异" },
          mechanism: { answer: "一次只替换一个组件，并从召回到业务验收逐关检查。", evidence: "一次只替换一个组件" },
          interpretation: { answer: "任一逻辑关卡失败都足以导致任务失败。", evidence: "任一布尔关卡失败都足以让任务失败" },
          boundary: { answer: "平均分不能补偿高风险切片的关键证据缺失。", evidence: "平均分不能补偿关键证据缺失" }
        }
      ]
    },
    "constrained-decoding": {
      contractVersion: 2,
      examples: [{ section: 4, evidence: { setup: "状态 q₃", rule: "schema 只允许 refund 或 ask", steps: ".30/.45=.667", interpretation: "只证明动作名称合法" } }],
      formulas: [{
        id: "constrained-decoding-renormalization", section: 3, formulaIndex: 1,
        symbols: [
          { name: "P", meaning: "模型原始或受限 token 概率", evidence: "模型给 token t 的原始概率" },
          { name: "t", meaning: "当前被评估的候选 token", evidence: "token t 的原始概率" },
          { name: "s", meaning: "当前文法解析状态", evidence: "解析状态 s" },
          { name: "M", meaning: "仍可通向合法结果的 token 集", evidence: "仍能通向完整合法结果的 token 集" },
          { name: "u", meaning: "遍历整个词表的候选索引", evidence: "u 遍历所有词表候选" }
        ]
      }],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "约束解码在每步采样时把不符合形式规则的 token 概率置零。", evidence: "约束解码输入模型 logits、当前前缀和形式规则" },
          problem: { answer: "它解决只靠提示要求 JSON 仍会以小概率产生坏格式的问题。", evidence: "百万次调用仍会稳定出现坏格式" },
          inputOutput: { answer: "输入 logits、前缀和规则，输出只从合法 token 集产生的序列。", evidence: "输出只从合法 token 集抽样的序列" },
          mechanism: { answer: "约束器删除非法候选并对剩余概率重新归一化。", evidence: "把非法候选概率置零并重新归一化" },
          interpretation: { answer: "格式通过只表示结果属于指定形式语言。", evidence: "只说明结果属于形式语言" },
          boundary: { answer: "它不保证字段真实、业务关系成立或调用者有权限。", evidence: "不证明字段真实、业务关系成立或调用者有权限" }
        },
        {
          section: 2,
          definition: { answer: "增量状态机记录文法前缀所处位置及下一步合法 token。", evidence: "文法怎样变成增量状态" },
          problem: { answer: "它解决模型每次只生成一个 token 时如何判断前缀仍可完成的问题。", evidence: "下一 token 合不合法" },
          inputOutput: { answer: "输入 schema、文法和 tokenizer，输出解析状态与合法 token 集。", evidence: "输出可随前缀推进的解析状态及合法 token 集" },
          mechanism: { answer: "每接受完整 token 字节串推进状态，只有接受态可结束。", evidence: "每接受一个完整 token 字节串就更新状态" },
          interpretation: { answer: "允许当前 token 表示前缀仍可继续，只有接受态才能正常结束。", evidence: "只有接受态才可结束" },
          boundary: { answer: "不支持的 schema 关键字和开放世界事实须生成后验证。", evidence: "必须留给生成后校验" }
        },
        {
          section: 3,
          definition: { answer: "受限分布是原概率经合法集合掩码并重新归一化后的概率。", evidence: "掩码后必须重新归一化" },
          problem: { answer: "它说明模型最偏好非法 token 时合法候选概率怎样变化。", evidence: "受限分布怎样变化" },
          inputOutput: { answer: "输入原概率和合法集合，输出非法为零且合法总和为一的分布。", evidence: "输出非法项为零且合法项总和为一的新分布" },
          mechanism: { answer: "先用指示函数掩码，再除以剩余合法概率质量。", evidence: "先掩码再在合法集归一化" },
          interpretation: { answer: "合法高概率候选少时，受限输出的内容质量仍可能下降。", evidence: "合法输出也可能内容很差" },
          boundary: { answer: "空合法集应诊断 schema、tokenizer、前缀或顺序不兼容。", evidence: "应返回可诊断失败" }
        },
        {
          section: 4,
          definition: { answer: "退款示例展示枚举约束如何删除 delete 并重算 refund 与 ask。", evidence: "一步退款动作怎样被约束" },
          problem: { answer: "它解释模型偏好非法动作时如何保证只生成 schema 允许值。", evidence: "模型偏好 delete" },
          inputOutput: { answer: "输入状态 q₃、候选概率与枚举，输出两个合法动作的新概率。", evidence: "输出 refund 与 ask 的重归一化分布" },
          mechanism: { answer: "删除 delete 和其他项，用 0.45 合法质量归一化剩余候选。", evidence: "合法质量 0.45 作为分母" },
          interpretation: { answer: "refund 的 0.667 是受限抽样概率，不是退款资格概率。", evidence: "refund 为 0.667" },
          boundary: { answer: "资格、金额和权限仍必须由外部业务与鉴权系统校验。", evidence: "退款资格、金额和权限仍需外部校验" }
        },
        {
          section: 5,
          definition: { answer: "tokenizer 感知掩码判断整个 token 字节串能否推进到可继续状态。", evidence: "token 不是字符，掩码必须理解 tokenizer" },
          problem: { answer: "它避免按首字符过滤而误删跨字符 token 或合法枚举前缀。", evidence: "按“下一个字符是否合法”过滤 token 会错" },
          inputOutput: { answer: "输入解析状态与完整 token 字节串，输出该 token 是否可继续。", evidence: "输出能否走到可继续状态" },
          mechanism: { answer: "模拟整个 token 通过解析器，并保留仍可完成枚举的前缀。", evidence: "合法枚举前缀也应保留" },
          interpretation: { answer: "token 表面相似不能替代对完整字节和后续可达性的判断。", evidence: "token 可跨字符、引号、逗号与 Unicode 字节" },
          boundary: { answer: "更换模型或 tokenizer 后必须重新编译，不能复用旧掩码。", evidence: "旧缓存可能封死合法路径或放行错误" }
        },
        {
          section: 6,
          definition: { answer: "schema 复杂度由枚举、递归、交叉分支和正则共同扩大状态空间。", evidence: "复杂 schema 会制造状态与性能问题" },
          problem: { answer: "它解释字段分支增加为何拖慢首次编译和逐 token 掩码。", evidence: "首 token 可能更慢、解码也更抖" },
          inputOutput: { answer: "输入 schema、tokenizer 和资源限额，输出状态数、成本与拒绝原因。", evidence: "输出编译状态数、逐步掩码成本与拒绝原因" },
          mechanism: { answer: "编译文法并缓存状态，运行时为每个前缀计算合法集合。", evidence: "大枚举、递归和交叉分支扩大状态空间" },
          interpretation: { answer: "首 token 慢常反映编译，每 token 慢常反映合法集计算。", evidence: "首次文法编译" },
          boundary: { answer: "缓存键必须含 schema 哈希和 tokenizer 版本，并限制资源规模。", evidence: "缓存键必须同时包含 schema 哈希与 tokenizer 版本" }
        },
        {
          section: 7,
          definition: { answer: "流式提交边界规定只有完整接受态并通过校验后才能执行工具。", evidence: "流式输出和工具调用的提交边界" },
          problem: { answer: "它防止把仍可继续或已截断的合法前缀误当成完整参数执行。", evidence: "能否边生成边执行字段" },
          inputOutput: { answer: "输入前缀、接受态、schema 和授权，输出原子工具调用。", evidence: "输出仅在全部校验完成后的原子工具调用" },
          mechanism: { answer: "等待接受态，完成 schema 与业务校验，再以幂等键提交。", evidence: "重试必须带幂等键" },
          interpretation: { answer: "前缀合法仅表示仍可完成，不表示对象已经完整。", evidence: "前缀合法不等于对象完整" },
          boundary: { answer: "断流 JSON 不能自动补齐后执行，外部文本仍需注入隔离。", evidence: "不能自动补齐截断 JSON 后执行" }
        },
        {
          section: 8,
          definition: { answer: "约束解码验收分开测语法、schema、业务、事实、权限和任务结果。", evidence: "格式、模式、业务和权限要分别评测" },
          problem: { answer: "它防止 JSON 有效率百分百掩盖内容错误或越权动作。", evidence: "团队还应该看哪些数" },
          inputOutput: { answer: "输入输出、schema、事实、主体和工具反馈，输出六层质量指标。", evidence: "输出语法、模式、业务、事实、授权与任务质量指标" },
          mechanism: { answer: "解析器、schema、规则、数据库和执行层按顺序逐关验证。", evidence: "解析成功只是第一关" },
          interpretation: { answer: "格式成功不能补偿后续业务或权限关卡失败。", evidence: "不能被格式有效率补偿" },
          boundary: { answer: "高风险动作还需幂等、越权拦截和故障回归。", evidence: "高风险动作还要验证幂等和越权拦截" }
        }
      ]
    },
    "structured-output": {
      contractVersion: 2,
      examples: [{ section: 4, evidence: { setup: "amount=120", rule: "最多可退 80", steps: "可退上限 ¥80", interpretation: "不能静默截成 80 执行" } }],
      formulas: [
        {
          id: "structured-output-refundable", section: 4, formulaIndex: 1,
          symbols: [
            { name: "R", meaning: "订单当前最多可退金额", evidence: "R 是本订单当前最多可退金额" },
            { name: "P", meaning: "订单实付金额", evidence: "P 是订单实付金额" },
            { name: "D", meaning: "此前已退款金额", evidence: "D 是此前已退款金额" },
            { name: "L", meaning: "政策允许的金额上限", evidence: "L 是政策允许的金额上限" },
            { name: "min", meaning: "取候选上限中的较小值", evidence: "取两个候选上限中较小者" }
          ]
        },
        {
          id: "structured-output-constrained-proportional", section: 5, formulaIndex: 1,
          symbols: [
            { name: "P", meaning: "原始或约束后的 token 概率", evidence: "原始 token t 的概率" },
            { name: "t", meaning: "当前候选 token", evidence: "token t 的概率" },
            { name: "s", meaning: "当前解析状态", evidence: "状态 s" },
            { name: "M", meaning: "当前合法 token 集", evidence: "当前仍合法的 token 集" }
          ]
        }
      ],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "结构化输出把模型回答变成可解析、校验、拒绝和版本化的数据对象。", evidence: "结构化输出输入任务语义和版本化数据契约" },
          problem: { answer: "它解决自然语言变体对程序接口造成解析和状态歧义的问题。", evidence: "为什么人能理解而程序会崩" },
          inputOutput: { answer: "输入任务语义与契约，输出可解析校验且可拒绝的对象。", evidence: "输出可解析、可校验并可被程序拒绝的对象" },
          mechanism: { answer: "schema、约束生成和解析器把字段类型边界变成机械检查。", evidence: "把自然语言容错转成明确字段和状态" },
          interpretation: { answer: "格式有效只表示机器能读，不表示内容真实。", evidence: "格式有效只表示机器能读取" },
          boundary: { answer: "结构化对象仍不能自动获得执行权限。", evidence: "不表示对象内容可信或允许执行" }
        },
        {
          section: 2,
          definition: { answer: "四道门依次验证完整语法、schema、业务事实和权限副作用。", evidence: "四道门必须逐层通过" },
          problem: { answer: "它说明 JSON 可解析距离安全执行退款还差哪些检查。", evidence: "离执行退款还差多远" },
          inputOutput: { answer: "输入模型对象、schema、业务数据和主体，输出通过、错误或升级。", evidence: "输出通过、字段错误、补信息、拒绝或升级" },
          mechanism: { answer: "按语法、形状、事实关系、身份权限的顺序逐层检查。", evidence: "依次检查完整语法、schema、业务事实和权限副作用" },
          interpretation: { answer: "前一门通过只表示该层合格，不能替代后一层。", evidence: "前一层通过不能替代后一层" },
          boundary: { answer: "任何一层失败都必须阻断执行，不允许下游猜测。", evidence: "任何失败都禁止下游猜测执行" }
        },
        {
          section: 3,
          definition: { answer: "最小 schema 只要求模型生成必须进行语义判断的字段。", evidence: "最小 schema 比大而全更可靠" },
          problem: { answer: "它减少大对象的无效路径、消费者耦合和版本迁移风险。", evidence: "为什么会提高错误率和耦合" },
          inputOutput: { answer: "输入业务决策字段和兼容要求，输出最小字段及显式分支。", evidence: "输出只含模型必须判断的字段与显式分支" },
          mechanism: { answer: "服务器填权威派生值，枚举与 discriminated union 拆小任务。", evidence: "服务器填身份、时间和派生值" },
          interpretation: { answer: "字段更少表示模型责任更窄，不表示业务信息被删除。", evidence: "只让模型产生需要语义判断的字段" },
          boundary: { answer: "过度嵌套会增加状态空间、无效路径与迁移成本。", evidence: "过度嵌套会增加无效路径、版本耦合和迁移成本" }
        },
        {
          section: 4,
          definition: { answer: "本案例展示语法和 schema 合法的退款对象仍可在事实与权限层失败。", evidence: "合法对象如何在后两层失败" },
          problem: { answer: "它解释 amount 120 在通用范围内却不能安全执行的原因。", evidence: "为什么仍不能执行" },
          inputOutput: { answer: "输入对象、订单政策和角色，输出业务错误码或安全动作。", evidence: "输出业务错误码或安全动作" },
          mechanism: { answer: "用实付、已退和政策上限计算实际可退额，再检查批准权限。", evidence: "公式算得最多可退 80" },
          interpretation: { answer: "schema 的 0 到 500 只表示通用形状范围，不代表订单可退额。", evidence: "违反订单不变量" },
          boundary: { answer: "不能静默把 120 改成 80 执行，须解释或转人工。", evidence: "不能静默截成 80 执行" }
        },
        {
          section: 5,
          definition: { answer: "生成时约束和生成后校验分别减少无效路径与捕获语义错误。", evidence: "约束生成与生成后校验是互补的" },
          problem: { answer: "它解释服务端会校验时为何仍值得在生成阶段约束。", evidence: "为什么还要生成时约束" },
          inputOutput: { answer: "输入模型分布、schema 与业务规则，输出受约束且复验的对象。", evidence: "输出格式受约束且经后验验证的对象" },
          mechanism: { answer: "生成时掩码非法 token，生成后检查实现、版本和语义。", evidence: "生成时掩码减少无效重试" },
          interpretation: { answer: "结构通过率上升不保证业务正确率或任务质量也上升。", evidence: "不能只庆祝结构通过率" },
          boundary: { answer: "自动修复仅适合纯语法且能证明语义等价的情况。", evidence: "只有纯语法且可证明等价的修复" }
        },
        {
          section: 6,
          definition: { answer: "失败恢复按失败层选择局部、有限且无副作用的下一动作。", evidence: "失败恢复要局部、有限且无副作用" },
          problem: { answer: "它避免无限重试增加延迟、注入面和重复执行风险。", evidence: "无限重试会发生什么" },
          inputOutput: { answer: "输入字段路径错误码范围和幂等键，输出修复、澄清、拒绝或升级。", evidence: "输出局部修复、澄清、重取事实、拒绝或人工升级" },
          mechanism: { answer: "针对错误类型有限重试，校验通过前绝不执行副作用。", evidence: "重试次数必须有限" },
          interpretation: { answer: "连续同类失败表示当前 schema 或任务路径不适合继续生成。", evidence: "同类连续失败应降级" },
          boundary: { answer: "校验完成前不得产生副作用，执行重试还须复用幂等键。", evidence: "校验前不产生副作用" }
        },
        {
          section: 7,
          definition: { answer: "schema 版本演进是生产者与所有消费者共同参与的分布式契约迁移。", evidence: "版本演进是一项分布式契约" },
          problem: { answer: "它防止新字段或枚举让旧消费者拒绝或静默误执行。", evidence: "旧消费者为什么可能静默误读" },
          inputOutput: { answer: "输入新旧 schema、组件版本和 trace，输出兼容矩阵与迁移计划。", evidence: "输出兼容矩阵与 expand/contract 发布计划" },
          mechanism: { answer: "先更新消费者兼容新旧，再切生产者，最后退役旧契约。", evidence: "先让消费者接受新旧" },
          interpretation: { answer: "新增语法项不自动等于向后兼容，需按消费者行为判断。", evidence: "不能仅按“新增”判断兼容" },
          boundary: { answer: "提示、schema、编译器和消费者版本必须一起记录回放。", evidence: "回放旧 trace 才能复现当时规则" }
        },
        {
          section: 8,
          definition: { answer: "安全执行用认证主体、工具白名单、策略与审批重新验证合法参数。", evidence: "安全执行不信任模型提供的身份与工具名" },
          problem: { answer: "它防止提示注入诱导模型选择语法允许但不合适的动作或金额。", evidence: "为什么提示注入仍可能造成伤害" },
          inputOutput: { answer: "输入合法参数和权威安全状态，输出最小权限执行或拒绝。", evidence: "输出以最小权限执行或拒绝" },
          mechanism: { answer: "服务器重取认证身份并校验对象、金额、工具、速率和审批。", evidence: "服务器重新鉴权并限制金额与对象" },
          interpretation: { answer: "schema 合法只限制形状，字符串中仍可能携带攻击载荷。", evidence: "结构化字符串仍可携带注入载荷" },
          boundary: { answer: "模型不能继承服务账号权限，每次工具调用都要重新鉴权。", evidence: "每次工具调用都以最小权限和当前主体重新鉴权" }
        },
        {
          section: 9,
          definition: { answer: "端到端契约评测沿生成、校验、执行和业务后果逐层定位失败。", evidence: "评测应沿整条契约定位失败" },
          problem: { answer: "它补足结构化输出成功率无法反映事实、权限与副作用的缺陷。", evidence: "还缺哪些能决定上线的数字" },
          inputOutput: { answer: "输入输出、日志、工具结果和后果，输出多层质量、延迟和成本指标。", evidence: "输出语法、schema、字段、事实、权限、幂等、任务质量、延迟与成本指标" },
          mechanism: { answer: "先查完整，再查形状、事实关系和当前主体能否执行。", evidence: "先问输出是否完整" },
          interpretation: { answer: "最终损失决定错误严重性，不能把越权与无害重试等权平均。", evidence: "错误预算按最终损失分级" },
          boundary: { answer: "单次越权必须设独立硬门和即时回滚，不能被平均成功率抵消。", evidence: "不能被大量无害格式成功平均掉" }
        }
      ]
    },
    "streaming": {
      contractVersion: 2,
      examples: [{ section: 4, evidence: { setup: "排队 120ms", rule: "首字约 400ms", steps: "400+39×50=2350ms", interpretation: "只有取消信号传播到模型服务" } }],
      formulas: [{
        id: "streaming-latency", section: 4, formulaIndex: 1,
        symbols: [
          { name: "TTFT", meaning: "请求到首 token 可见的时间", evidence: "从请求发出到首 token 可见的时间" },
          { name: "Q", meaning: "请求排队时间", evidence: "Q 是排队时间" },
          { name: "P", meaning: "输入前缀的预填充时间", evidence: "处理输入前缀的预填充时间" },
          { name: "D", meaning: "首步解码时间", evidence: "D 是首步解码时间" },
          { name: "E", meaning: "完整响应完成时间", evidence: "E 是完整完成时间" },
          { name: "N", meaning: "输出 token 总数", evidence: "N 是输出 token 总数" },
          { name: "TPOT", meaning: "每个后续 token 的平均解码间隔", evidence: "每个 token 的平均解码间隔" },
          { name: "X", meaning: "传输与前端渲染耗时", evidence: "网络传输与前端渲染耗时" }
        ]
      }],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "流式输出把生成过程包装成逐步送达、可取消并有终态的事件流。", evidence: "流式输出输入正在生成的 token 和请求生命周期" },
          problem: { answer: "它改善用户等待形状和交互控制，而不是减少完整生成工作量。", evidence: "流式改善的是等待形状，不是总工作量" },
          inputOutput: { answer: "输入生成 token 与生命周期，输出增量事件和最终状态。", evidence: "输出逐步可见的增量事件及最终状态" },
          mechanism: { answer: "服务在增量可用时立即发送，客户端边解码边安全展示。", evidence: "提前传送已产生内容" },
          interpretation: { answer: "首字快表示可见时间短，不表示最终响应更快或已经完成。", evidence: "改善首字和取消体验" },
          boundary: { answer: "前缀可见不能替代 done、完整校验和业务提交。", evidence: "不能解释为请求已经完成或通过校验" }
        },
        {
          section: 2,
          definition: { answer: "token、UTF-8 字节、字符、网络块和协议事件由不同层决定边界。", evidence: "token、字节块、字符和事件不是同一边界" },
          problem: { answer: "它避免直接把网络 chunk 当成字符、token 或完整 JSON 解析。", evidence: "网络 chunk 不能直接当成一个字符或一个模型 token" },
          inputOutput: { answer: "输入 token、字节块和协议帧，输出完整字符与类型化事件。", evidence: "输出完整字符与类型化事件" },
          mechanism: { answer: "客户端跨块保留 UTF-8 和协议解析状态再组装内容。", evidence: "客户端必须跨块保留解码状态" },
          interpretation: { answer: "TCP chunk 仅表示传输分片，不代表语义或提交单位。", evidence: "TCP chunk 只表示一次传输分片" },
          boundary: { answer: "网络分片不能直接作为 JSON 或业务提交边界。", evidence: "不能作为 JSON 或业务提交边界" }
        },
        {
          section: 3,
          definition: { answer: "流式事件协议用类型、序号、请求标识和终态表达完整生命周期。", evidence: "事件协议要表达生命周期而非只发字符串" },
          problem: { answer: "它让客户端区分正常完成、取消、错误、重连和连接中断。", evidence: "怎样区分正常结束、取消和错误" },
          inputOutput: { answer: "输入请求状态和各类增量，输出带 id、sequence、版本与终态的事件流。", evidence: "输出带 request id、sequence、版本和终态的事件流" },
          mechanism: { answer: "客户端按 sequence 去重推进状态，服务明确发送 done 或错误终态。", evidence: "客户端按序去重和状态机处理" },
          interpretation: { answer: "只有 done 且最终校验通过才表示 completed。", evidence: "只有显式 done 且最终校验通过才完成" },
          boundary: { answer: "EOF 可能来自断网、崩溃或取消，不能推断正常完成。", evidence: "EOF 只表示连接关闭" }
        },
        {
          section: 4,
          definition: { answer: "时间线案例把排队、预填充、首 token、逐 token 解码和完成拆开。", evidence: "一次 40-token 回答的时间线" },
          problem: { answer: "它计算用户何时看到首字、完整完成以及取消能节省多少工作。", evidence: "用户何时看见、何时完成" },
          inputOutput: { answer: "输入排队、预填充、token 数和 TPOT，输出 TTFT、完成与浪费。", evidence: "输出 TTFT、完整时间与取消后浪费" },
          mechanism: { answer: "首字为排队加预填充和首步，完成再加后续 token 间隔。", evidence: "首字约 400ms" },
          interpretation: { answer: "0.4 秒开始阅读不表示 2.4 秒的完整计算已经消失。", evidence: "完整约 2.35 到 2.4 秒" },
          boundary: { answer: "取消只有传播至模型服务时才停止剩余 token 计算。", evidence: "只有取消信号传播到模型服务" }
        },
        {
          section: 5,
          definition: { answer: "背压是慢消费者把容量限制反馈给快生产者的流量控制。", evidence: "背压是慢消费者对快生产者的反馈" },
          problem: { answer: "它防止浏览器渲染慢时缓冲无限增长并导致延迟或断连。", evidence: "服务器每秒发 100 个 delta，会发生什么" },
          inputOutput: { answer: "输入生产消费速率和水位，输出批量、暂停、合并或取消。", evidence: "输出批量渲染、暂停、合并或取消决策" },
          mechanism: { answer: "压力从 DOM、客户端、网关逐层传播到上游读取。", evidence: "必须把压力逐层传回网关和上游" },
          interpretation: { answer: "缓冲增长和延迟扩大表示消费速度长期低于生产速度。", evidence: "缓冲不断增长，内存和延迟上升" },
          boundary: { answer: "工具事件不能像文本 delta 一样随意合并，必须保序。", evidence: "工具事件则必须保持顺序与语义" }
        },
        {
          section: 6,
          definition: { answer: "取消、超时和重连以 request id、序号、日志和幂等键保持一致状态。", evidence: "取消、超时和重连都需要幂等语义" },
          problem: { answer: "它防止前端停止后模型或退款工具仍运行，以及重连重复执行。", evidence: "用户点停止后，为什么工具仍可能完成退款" },
          inputOutput: { answer: "输入 id、sequence、取消、幂等和日志，输出取消、完成、未知或重放状态。", evidence: "输出已取消、已完成、未知或可重放状态" },
          mechanism: { answer: "逐层传播取消，超时先查动作状态，重连按序号去重重放。", evidence: "超时后先查询动作状态再重试" },
          interpretation: { answer: "停止显示只表示 UI 终止，不表示事务已撤销。", evidence: "前端停止显示不等于事务撤销" },
          boundary: { answer: "已提交副作用只能补偿或人工处理，不能假装取消成功。", evidence: "需要补偿或人工处理" }
        },
        {
          section: 7,
          definition: { answer: "结构化流必须缓冲到完整接受态并通过 schema、事实和权限校验。", evidence: "结构化输出必须缓冲到接受态" },
          problem: { answer: "它防止看到半截 amount 或 JSON 前缀时过早执行工具。", evidence: "为什么不能提前执行" },
          inputOutput: { answer: "输入 tool_call_delta，输出完整且经全部校验的参数。", evidence: "输出完整接受态并经 schema、事实和权限校验的参数" },
          mechanism: { answer: "客户端只组装前缀，等待接受态后再校验并提交。", evidence: "客户端只能组装和预览" },
          interpretation: { answer: "前缀合法只表示仍可能完成，不表示数值和对象已经定稿。", evidence: "数字、字符串和对象前缀都可能继续变化" },
          boundary: { answer: "中断回答要标记 interrupted，不能混作完整训练或评测样本。", evidence: "不能混入完整答案的训练或评测" }
        },
        {
          section: 8,
          definition: { answer: "增量安全渲染跨块累积文本并在安全单元上解析、扫描和展示。", evidence: "安全、Markdown 与 UI 都有增量陷阱" },
          problem: { answer: "它处理无害 delta 拼接后形成脚本、链接或敏感信息的问题。", evidence: "拼接后为什么可能形成脚本、链接或敏感信息" },
          inputOutput: { answer: "输入跨块文本和风险策略，输出安全渲染与审核后的展示单元。", evidence: "输出纯文本累积、安全 Markdown/HTML 和审核后的展示单元" },
          mechanism: { answer: "扫描器保留跨块窗口，前端累积纯文本后用安全渲染器。", evidence: "扫描器维护跨块窗口" },
          interpretation: { answer: "单个块无害不能说明拼接后的完整内容无害。", evidence: "单个 delta 看起来无害" },
          boundary: { answer: "高风险领域可延迟审核，流式并非所有场景默认更好。", evidence: "流式并非所有场景默认更好" }
        },
        {
          section: 9,
          definition: { answer: "流式可靠性评测同时覆盖性能、取消、恢复、缓冲、安全和最终质量。", evidence: "评测应覆盖完成、取消和故障路径" },
          problem: { answer: "它补足漂亮平均 TTFT 无法证明完成和故障路径可靠的问题。", evidence: "还缺哪些指标才能证明流式可靠" },
          inputOutput: { answer: "输入日志、切片和故障注入，输出性能、恢复、资源与质量指标。", evidence: "输出 TTFT、TPOT、完成、取消传播、浪费 token、恢复、缓冲、帧率和最终质量" },
          mechanism: { answer: "按网络设备并发切片并注入断流、乱序、重复、超时和重启。", evidence: "网络设备并发切片和故障注入" },
          interpretation: { answer: "成功需同时满足及时、安全、可取消、正确提交和故障显式。", evidence: "成功必须同时证明安全增量及时" },
          boundary: { answer: "故障不得静默伪装成完成，最终状态和副作用必须验收。", evidence: "故障不伪装完成" }
        }
      ]
    },
    "observability": {
      contractVersion: 2,
      examples: [{ section: 5, evidence: {
        setup: "1.42 秒到底慢在哪里",
        rule: "根时长只由关键路径决定",
        steps: "1420ms 的主因是工具重试",
        interpretation: "所有 span 时长之和是工作量，不等于端到端时间"
      }}],
      formulas: [
        { id: "observability-critical-path", section: 5, formulaIndex: 1, symbols: [
          { name: "Tcritical", meaning: "根 trace 的关键路径墙钟时间", evidence: "输出关键路径墙钟延迟 Tcritical" },
          { name: "CriticalPath", meaning: "考虑依赖与并行关系的最长完成路径函数", evidence: "并行阶段取决定完成的最长依赖路径" },
          { name: "Tqueue", meaning: "关键路径上的排队时间", evidence: "排队计算网络和重试耗时" },
          { name: "Tcompute", meaning: "关键路径上的模型与组件计算时间", evidence: "排队计算网络和重试耗时" },
          { name: "Tnetwork", meaning: "关键路径上的网络时间", evidence: "排队计算网络和重试耗时" },
          { name: "Tretry", meaning: "关键路径上的退避和重试时间", evidence: "工具重试" }
        ]},
        { id: "observability-weighted-rate", section: 7, formulaIndex: 1, symbols: [
          { name: "RateWeighted", meaning: "修正不等概率采样后的总体率估计", evidence: "输出 HorvitzThompson 风格加权率 RateWeighted" },
          { name: "i", meaning: "被观测请求编号", evidence: "每条 trace" },
          { name: "yi", meaning: "第 i 条请求的目标结果指示或数值", evidence: "结果 yi" },
          { name: "pii", meaning: "第 i 条请求被保留的概率", evidence: "保留概率 pii" }
        ]}
      ],
      termReviews: [
        { section: 3, reviewedAt: "2026-07-27", terms: [
          { name: "trace", meaning: "对应一次用户任务的跨组件完整因果轨迹", purpose: "把一次请求的检索模型工具与结果串成时间线", definitionEvidence: "输出一个根 trace", purposeEvidence: "context 跨边界传播" },
          { name: "span", meaning: "trace 内一次有明确开始结束和父级的操作", purpose: "记录单个组件调用的时间版本状态与副作用", definitionEvidence: "有父子关系的 span 树", purposeEvidence: "每个 span 记录时间、父级、版本、状态和实际副作用" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["AI 可观测性重建请求从输入到副作用的版本化因果时间线。","HTTP 200 为什么仍可能是严重失败"],
          ["它发现传输成功但语义证据权限或业务动作失败。","退款助手怎样依然伤害用户"],
          ["输入链路事件，输出可定位回放验证的因果时间线。","输出可定位、回放和验证的因果时间线"],
          ["串联实际收到的输入、调用、观察和最终状态。","trace 记录实际输入动作和状态"],
          ["HTTP 成功只说明传输完成，不说明 AI 任务成功。","不表示语义、证据、权限或业务动作正确"],
          ["观测不要求默认永久保存全部敏感原文。","敏感原文并非默认必存"]
        ]),
        six(2, [
          ["日志、指标、追踪和评测标签是互补观测信号。","日志、指标和追踪各回答不同问题"],
          ["它解释已有海量日志为何事故时仍无法判断规模和链路。","为什么事故发生时仍然只能猜"],
          ["输入事件趋势路径和判断，输出对应信号类别。","输出 log、metric、trace 或评测标签"],
          ["用 trace ID 和版本把四层信号相互连接。","四者通过 trace ID 和版本连接"],
          ["日志解释步骤，指标看趋势，trace 看路径，标签看质量。","日志解释某步发生什么"],
          ["缺少任一层级都会留下特定诊断盲区。","只有其中一种都会留下诊断盲区"]
        ]),
        six(3, [
          ["根 trace 表示用户任务，span 表示其中有边界的操作。","Trace 和 span 怎样表达一次任务"],
          ["它把十次模型工具调用保持在同一因果链中。","怎样保持同一条因果链"],
          ["输入跨组件调用，输出根 trace 和父子 span 树。","输出一个根 trace 与有父子关系的 span 树"],
          ["传播 context 并记录每个 span 的时间父级版本状态。","context 跨边界传播"],
          ["工具 span 和业务状态才是调用及副作用证据。","工具 span 与业务状态才是调用证据"],
          ["模型事后叙述不能替代系统实际记录。","不能替代系统记录"]
        ]),
        six(4, [
          ["复现字段保存足以比较发布前后差异的版本证据。","记录足以复现的版本，而不是一团文本"],
          ["它定位同样输入昨天成功今天失败时哪些条件改变。","最少需要比较哪些变化"],
          ["输入版本和调用字段，输出最小证据与受控引用。","输出最小可比较的版本证据与受控内容引用"],
          ["以哈希稳定 ID 和版本连接模型提示索引工具策略。","哈希和稳定 ID 支持差异定位"],
          ["记录过少不能复现，记录全部会扩大隐私风险。","记录太少无法复现，记录全部又扩大隐私面"],
          ["自由思维链不应作为系统事实或调用证据。","自由思维链不作为事实证据"]
        ]),
        six(5, [
          ["端到端延迟由依赖图中的关键路径墙钟时间决定。","运行示例：1.42 秒到底慢在哪里"],
          ["它回答根 trace 时长是否等于所有 span 时长相加。","等于所有 span 时长相加吗"],
          ["输入 span 时间依赖与阶段耗时，输出关键路径延迟。","输出关键路径墙钟延迟 Tcritical"],
          ["串行相加，并行只计决定最终完成的最长依赖路径。","并行阶段取决定完成的最长依赖路径"],
          ["全部 span 时长之和表示工作量，不是墙钟完成时间。","不等于端到端时间"],
          ["本例主因是工具重试，不能归咎于模型平均耗时。","主因是工具重试"]
        ]),
        six(6, [
          ["语义监控把质量标签异步回写到具体 trace 和版本切片。","质量指标必须连接到具体 trace 和切片"],
          ["它定位点赞下降来自哪些任务版本和失败类型。","怎样知道是哪些任务、哪个版本和哪类失败"],
          ["输入质量标签，输出分任务版本群体的趋势。","输出按任务语言风险模型提示索引和群体切片的质量趋势"],
          ["聚合趋势后下钻到脱敏 trace 和实际路径验证。","必须下钻到脱敏 trace"],
          ["点赞转人工重问等在线代理不等于真实质量。","代理指标只提供根因线索"],
          ["代理信号必须用人工或最终业务状态校验。","必须下钻到脱敏 trace，并用人工或最终业务状态校验"]
        ]),
        six(7, [
          ["不等概率 trace 采样可用纳入概率加权估计总体率。","采样、基数与成本怎样不破坏证据"],
          ["它解决千万流量不能全存又不能漏掉事故的问题。","只随机 1% 又会漏掉事故吗"],
          ["输入结果和保留概率，输出修正后的加权率。","输出 HorvitzThompson 风格加权率 RateWeighted"],
          ["用结果除纳入概率加总，再除权重总和。","分子求 Σ(yi/pii)"],
          ["高风险尾部可多采，但估总体时必须修正概率。","必须记录纳入概率"],
          ["只保存失败不能估总体失败率，灾难另走安全通道。","不能直接估生产失败率"]
        ]),
        six(8, [
          ["观测隐私治理按诊断目的最小化采集和访问敏感数据。","隐私最小化和调试能力如何共存"],
          ["它解释全量 prompt 最好调试为何仍不可默认接受。","为什么这不是默认可接受方案"],
          ["输入目的敏感等级和保留，输出采集脱敏隔离决定。","输出脱敏、哈希、加密原文隔离或不采集决定"],
          ["优先存类型范围代号，原文进入短期授权受控区。","使用短期授权受控存储"],
          ["最小字段仍应保留足以诊断金额等错误的结构。","能用类型范围和稳定代号诊断"],
          ["删除必须传播到派生索引和备用日志。","必须覆盖派生索引和备用日志"]
        ]),
        six(9, [
          ["可观测闭环把告警连接到止损回滚根因验证和评测回流。","告警、回滚和失败回流才构成闭环"],
          ["它防止仪表盘变红却没有负责人和处置动作。","仪表盘变红但没人行动，能叫可观测吗"],
          ["输入 SLO 告警和版本，输出止损回滚实验与样本。","输出止损、回滚、根因实验与经审核的回归样本"],
          ["先恢复安全服务，再用 trace 和发布标记验证根因。","先恢复安全服务，再研究长期修复"],
          ["处置与长期修复是两个步骤，不能为研究延迟止损。","告警先恢复安全服务"],
          ["可观测性不替代权限幂等和事故响应演练。","不能替代权限、幂等和事故演练"]
        ])
      ]
    },
    "model-evaluation": {
      contractVersion: 2,
      examples: [{ section: 4, evidence: {
        setup: "100 道退款题",
        rule: "点估计的差不等于稳定差异",
        steps: "A 的 82% 与 B 的 78% 区间大量重叠",
        interpretation: "一百题不足以强断言"
      }}],
      formulas: [
        { id: "model-eval-binomial-se", section: 4, formulaIndex: 1, symbols: [
          { name: "SE", meaning: "样本准确率估计的标准误", evidence: "输出标准误 SE" },
          { name: "phat", meaning: "样本中回答正确的比例", evidence: "答对比例 phat" },
          { name: "n", meaning: "独立评测样本数量", evidence: "样本量 n" },
          { name: "CI95", meaning: "粗略百分之九十五置信区间", evidence: "95% 区间" }
        ]},
        { id: "model-eval-pass-k", section: 5, formulaIndex: 1, symbols: [
          { name: "passK", meaning: "k 次独立采样至少一次成功的概率", evidence: "输出至少一次成功的理想概率 passK" },
          { name: "p", meaning: "单次独立采样成功概率", evidence: "单次独立成功概率 p" },
          { name: "k", meaning: "同一任务的采样次数", evidence: "采样次数 k" }
        ]}
      ],
      termReviews: [],
      sectionContracts: [
        six(1, [
          ["模型评测估计模型在特定分布配置和指标下的能力。","先说清楚究竟在估计什么"],
          ["它反驳模型存在脱离使用场景的单一真实能力分。","有没有一个脱离场景的“真实能力分”"],
          ["输入 M、D、C、Y，输出带不确定性的能力估计。","输出带不确定性的能力估计"],
          ["固定题目提示工具预算和评分后运行有限样本测量。","M 在 D、C 下对 Y 的估计"],
          ["分数只对给定实验条件成立，不是模型固有常数。","不是脱离场景的真实能力常数"],
          ["分布或配置变化后旧分数不能直接外推。","旧分数不能直接外推"]
        ]),
        six(2, [
          ["模型、组件、应用和线上评测对应不同实验边界。","模型评测与应用评测不能互相替代"],
          ["它解释裸模型更好为何进入产品后仍可能更差。","为什么装进产品后仍可能更差"],
          ["输入比较对象和控制条件，输出对应评测层级。","输出模型、组件、应用或线上实验评测"],
          ["模型评测隔离能力，应用评测保留业务全链路。","前者便于归因，后者支持发布"],
          ["裸模型分数不包含真实权限延迟和用户结果。","不能替代端到端权限、延迟和用户结果验收"],
          ["两类评测必须组合使用，不能互相替代。","不能互相替代"]
        ]),
        six(3, [
          ["公平模型比较固定题目提示工具预算采样和评分条件。","一次公平比较需要固定哪些变量"],
          ["它解释两个准确率八十为何可能完全不可比。","为什么可能完全不可比"],
          ["输入相同实验条件，输出逐题结果和质量成本曲线。","输出可比较的逐题结果及质量成本曲线"],
          ["预注册条件并保存配置哈希版本和随机种子。","预算不同就是不同处理条件"],
          ["单次生成与百次挑最好回答的是不同使用问题。","不能把单次生成与百次挑最好称为公平比较"],
          ["失败超时必须按预先规则计分且不得静默丢弃。","失败和超时必须按预注册规则计分"]
        ]),
        six(4, [
          ["置信区间描述有限样本准确率估计的统计不确定性。","运行示例：100 道退款题上的差距有多确定"],
          ["它判断八十二题对与七十八题对能否证明模型更强。","能直接宣布 A 更强吗"],
          ["输入 n、phat 和配对结果，输出标准误区间和差异证据。","输出标准误 SE、95% 区间和配对差异证据"],
          ["按二项比例计算标准误，并保留同题配对差异。","SE=sqrt(phat×(1−phat)/n)"],
          ["区间大量重叠说明当前样本不足以支持强结论。","说明一百题不足以强断言"],
          ["关键风险切片可以独立否决总体点估计优势。","高风险切片可独立否决总体优势"]
        ]),
        six(5, [
          ["passK 衡量 k 次独立采样至少出现一次成功的理想概率。","pass@k 把模型质量和计算预算混在一起"],
          ["它解释 pass100 高为何单次生成仍频繁失败。","为什么用户点一次生成仍可能频繁失败"],
          ["输入 p 和 k，输出至少一次成功的理想概率。","输出至少一次成功的理想概率 passK"],
          ["用一减去 k 次全部失败概率进行计算。","passK=1−(1−p)^k"],
          ["数值提高主要来自增加采样计算而非单次能力突变。","提高主要来自十倍计算预算"],
          ["真实错误相关且需验证器，因此公式只是上界直觉。","公式只是上界直觉"]
        ]),
        six(6, [
          ["基准污染包括题目答案及其镜像翻译讲解衍生文本泄漏。","公开基准为什么会被污染和过拟合"],
          ["它回答从未显式微调是否足以证明模型没见过题。","就能算“未见过”吗"],
          ["输入题目衍生与近邻，输出污染风险和治理决定。","输出污染风险、保留、替换或降权决定"],
          ["结合时间新题私有门禁语义筛查和查看次数治理。","共同降低风险"],
          ["词面去重无法识别改写和组织层榜单过拟合。","词面去重也抓不到改写"],
          ["私有题降低泄漏但不保证代表生产分布。","不保证代表真实用户分布"]
        ]),
        six(7, [
          ["模型评分组合确定规则、执行测试、LLM 裁判和领域人工。","自动指标、LLM 裁判与人工盲评"],
          ["它解释评分器自身为什么也必须接受评测。","为什么评分器本身也要接受评测"],
          ["输入多类仪器，输出属性分数分歧和仲裁结果。","输出各属性分数、分歧及仲裁结果"],
          ["用盲化换序双标和人工金标测量各自偏差。","用盲化、换序、双标和金标校准"],
          ["组合仪器的目的在暴露盲区而不是投票造真值。","不是投票制造真值"],
          ["规则覆盖、裁判偏差和人工疲劳都必须显式报告。","组合仪器的目的不是投票制造真值，而是让各自的盲区可见"]
        ]),
        six(8, [
          ["模型发布门槛把离线结果转成替换路由保留或回滚决定。","从排行榜到发布门槛"],
          ["它回答模型总分提高后是否应该真正换模型。","怎样把证据转成“换不换模型”的决定"],
          ["输入切片区间成本延迟和线上结果，输出发布方案。","输出替换、路由、保留或回滚方案"],
          ["先过硬门槛，再比较帕累托并进行影子金丝雀。","先判越权隐私等硬门槛"],
          ["离线胜出只有迁移到真实流量后才是生产证据。","经过影子或小流量才能成为生产证据"],
          ["不得通过删门禁题或换指标放行失败候选。","不能通过删题或改指标来放行"]
        ])
      ]
    },
    "evaluation": {
      contractVersion: 2,
      examples: [{ section: 5, evidence: {
        setup: "新版本总分从 80.0 升到 83.2",
        rule: "越权切片“不得低于旧版且至少 60%”",
        steps: "RiskLoss 从 0.682 升至 0.862",
        interpretation: "高风险退化不能被平均抵消"
      }}],
      formulas: [
        { id: "evaluation-measurement-error", section: 4, formulaIndex: 1, symbols: [
          { name: "ScoreObserved", meaning: "评分器在样本上给出的观测分数", evidence: "输出观测分数 ScoreObserved" },
          { name: "Qtrue", meaning: "不可直接完全观察的潜在真实质量", evidence: "潜在质量 Qtrue" },
          { name: "Bjudge", meaning: "评分器产生的系统性偏差", evidence: "评分器系统偏差 Bjudge" },
          { name: "Esample", meaning: "有限样本带来的随机误差", evidence: "样本随机误差 Esample" }
        ]},
        { id: "evaluation-weighted-risk", section: 5, formulaIndex: 1, symbols: [
          { name: "PassWeighted", meaning: "按真实流量权重汇总的通过率", evidence: "输出加权通过率 PassWeighted" },
          { name: "RiskLoss", meaning: "按失败概率和严重度加权的风险损失", evidence: "风险损失 RiskLoss" },
          { name: "i", meaning: "评测切片编号", evidence: "切片权重" },
          { name: "wi", meaning: "第 i 个切片的流量权重", evidence: "切片权重 wi" },
          { name: "pi", meaning: "第 i 个切片的任务通过率", evidence: "通过率 pi" },
          { name: "ci", meaning: "第 i 个切片一次失败的严重度", evidence: "失败严重度 ci" }
        ]}
      ],
      termReviews: [],
      sectionContracts: [
        six(1, [
          ["应用评测先把业务成功写成可复现的评分契约。","从“回答不错”改写成验收契约"],
          ["它解决不同评审对好答案理解不一致的问题。","分数还能指导上线吗"],
          ["输入样本属性评分器和版本，输出通过失败及原因。","输出可复现的通过、失败及原因"],
          ["把任务拆成原子属性并先判硬约束再排软目标。","硬约束先判，软目标只在可行方案间排序"],
          ["评分规则不共享时平均分无法支持发布决定。","总分不能指导上线"],
          ["安全权限等硬失败不能被文风和普通质量抵消。","把两者先混成平均分，会让“更好听”补偿“更危险”"]
        ]),
        six(2, [
          ["应用评测对象是从输入到业务结果的完整版本化系统链。","评测对象是一条有边界的链"],
          ["它避免答案错误时不经诊断就归因于底层模型。","怎样避免第一反应就是“换更强模型”"],
          ["输入整条链路，输出组件诊断与端到端结果。","输出组件诊断与端到端业务结果"],
          ["端到端决定发布，组件指标定位首次偏离。","组件指标定位第一次偏离"],
          ["局部组件提升不等于最终业务任务提升。","组件局部提高不代表完整任务提高"],
          ["组件诊断不能代替最终端到端验收。","诊断也不能替代最终验收"]
        ]),
        six(3, [
          ["代表性评测集由真实分布、高损失、事故和边界案例组成。","样本应来自任务分布而不是灵感题库"],
          ["它防止少量正常问题制造虚假的安全感。","为什么会制造虚假的安全感"],
          ["输入多类样本来源，输出带切片标签的数据集。","输出带语言、群体、长度、工具和风险标签的数据集"],
          ["分开发、冻结、挑战和线上抽样四类用途管理。","四者不能混用同一权重解释"],
          ["挑战集用于暴露长尾，其比例不代表生产发生率。","挑战集比例不等于生产发生率"],
          ["线上样本必须经过脱敏、权限和时间窗口治理。","线上抽样估计真实分布"]
        ]),
        six(4, [
          ["评分器是带系统偏差和随机误差的质量测量仪器。","评分器是一组需要校准的测量仪器"],
          ["它回答 LLM 裁判合格是否等于真实质量合格。","真实质量就一定合格吗"],
          ["输入潜在质量偏差和误差，输出观测分数。","输出观测分数 ScoreObserved"],
          ["用人工金标测裁判精确召回一致性和位置偏差。","用人工金标测精确率、召回率、位置和文风偏差"],
          ["观测分数混合真实质量、系统偏差和抽样误差。","分数是三者叠加的结果"],
          ["高风险确定属性应优先使用程序或状态检查。","应优先程序或状态检查"]
        ]),
        six(5, [
          ["切片门禁同时计算加权通过率和严重度风险损失。","运行示例：平均提升为何仍不能发布"],
          ["它解释总分上升时越权退化为何仍阻断上线。","新版本总分从 80.0 升到 83.2，但越权率也上升，应该上线吗"],
          ["输入权重通过率严重度，输出通过率和风险损失。","输出加权通过率 PassWeighted 与风险损失 RiskLoss"],
          ["按权重汇总通过率，并按失败概率乘严重度汇总风险。","后者求 Σwi×(1−pi)×ci"],
          ["风险从零点六八二升至零点八六二表示新版更危险。","从 0.682 升至 0.862"],
          ["争议成本只排优先级，越权必须由硬门槛保护。","越权仍应用硬门槛"]
        ]),
        six(6, [
          ["组件消融固定其他因素并只替换一个系统组件。","组件消融把相关性变成修复线索"],
          ["它诊断端到端掉分来自模型检索提示工具还是渲染。","怎样判断是模型、检索还是提示造成"],
          ["输入同样本和单变量替换，输出端到端差异线索。","输出检索、生成、工具或渲染对端到端差异的因果线索"],
          ["用 oracle、工具回放和规则开关隔离不同环节。","oracle 证据消除召回限制"],
          ["消融缩小原因候选，不证明组件独立决定结果。","消融只缩小原因候选"],
          ["一次改变多个变量时不能进行可靠归因。","一次改变多个因素无法归因"]
        ]),
        six(7, [
          ["发布流程依次经过离线、影子、金丝雀和分级扩大。","离线、影子、小流量与正式发布"],
          ["它避免离线集通过后直接全量暴露真实用户和副作用。","为什么不能直接全量切换"],
          ["输入各阶段结果和阈值，输出扩大停止或回滚。","输出继续扩大、停止或回滚决定"],
          ["离线查门槛，影子查容量，金丝雀查真实交互。","金丝雀才观察真实交互"],
          ["每一级需保持观察窗口并用稳定用户单位分流。","每级保持观察窗口"],
          ["越权尾延迟或错误预算超线必须停止扩大。","必须自动停止扩大"]
        ]),
        six(8, [
          ["评测治理把失败样本纳入版本化发现审核和冻结流程。","评测集会老化，也会被团队过拟合"],
          ["它防止持续加题调参使门禁逐渐成为训练信号。","为什么仍可能越测越不可信"],
          ["输入样本治理字段，输出各数据池迁移记录。","输出发现池、审核、开发集、冻结集及下一版本的迁移记录"],
          ["审核去重后进入开发集，下一发布周期再冻结门禁。","当前冻结集不能因候选失败而删改"],
          ["反复针对固定失败调参会造成测试过拟合。","会使门禁变成训练集"],
          ["开放世界不可逆风险仍需要权限和人工控制。","仍需权限和人工控制"]
        ])
      ]
    },
    "citations": {
      contractVersion: 2,
      examples: [{ section: 3, evidence: {
        setup: "四条主张、三个引用",
        rule: "按主张计",
        steps: "引用正确性=2/3",
        interpretation: "不能互相替代"
      }}],
      formulas: [{ id: "citation-quality-coverage", section: 3, formulaIndex: 1, symbols: [
        { name: "CitationPrecision", meaning: "已给引用中真正支持相邻主张的比例", evidence: "输出 CitationPrecision" },
        { name: "NsupportedCitation", meaning: "正确支持主张的已给引用数量", evidence: "正确支持引用数 NsupportedCitation" },
        { name: "Ncitation", meaning: "回答中全部已给引用数量", evidence: "全部已给引用数 Ncitation" },
        { name: "Coverage", meaning: "全部应引主张中得到正确支持的比例", evidence: "Coverage" },
        { name: "NcoveredClaim", meaning: "获得正确证据支持的应引主张数", evidence: "被正确支持主张数 NcoveredClaim" },
        { name: "Nclaim", meaning: "回答中全部应引用主张数", evidence: "应引用主张数 Nclaim" }
      ]}],
      termReviews: [
        { section: 3, reviewedAt: "2026-07-27", terms: [
          { name: "蕴含", meaning: "证据内容在语义和限定条件上足以推出主张", purpose: "区分真正支持与仅仅主题相关的材料", definitionEvidence: "蕴含是“证据内容足以推出该主张”", purposeEvidence: "而不只是主题相近" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["引用是原子主张到版本化原文跨度的可验证映射。","引用是映射关系，不是答案装饰"],
          ["它防止段末堆链接却没有一句主张真正被支持。","为什么可能一句都没被支持"],
          ["输入主张白名单和跨度，输出可点击证据映射。","输出主张到版本化原文的可点击映射"],
          ["从白名单选择证据 ID，再由渲染层生成定位链接。","跨度在语义上蕴含主张才算支持"],
          ["文档或链接存在不等于其内容支持相邻主张。","只证明文档可定位"],
          ["无白名单证据时应删减降格或拒答，不能编链接。","而不是补一个主题相关链接"]
        ]),
        six(2, [
          ["原子主张是能够独立判断真假的最小回答断言。","先把复合句拆成原子主张"],
          ["它避免一个引用被误认为同时支持速度准确率和成本。","需要几个证据"],
          ["输入复合回答，输出原子主张及引用或推断类型。","输出可分别判断真假的原子主张"],
          ["拆分数字比较因果归因，并为每条绑定最小证据。","每条只绑定最小充分证据"],
          ["连接词可能引入额外因果或推断主张。","“因为”还引入因果主张"],
          ["建议可不引用，但事实前提仍必须有证据。","支撑建议的事实前提仍需引用"]
        ]),
        six(3, [
          ["引用正确性衡量已给链接质量，覆盖率衡量应引主张覆盖。","完整示例：计算引用正确性与完整性"],
          ["它区分引用有多少是真的与回答还有多少主张缺证。","怎样判断系统到底做得好不好"],
          ["输入四类计数，输出 CitationPrecision 与 Coverage。","输出 CitationPrecision 与 Coverage"],
          ["分别以全部引用和全部应引主张作为分母计算。","前者等于 NsupportedCitation/Ncitation"],
          ["六十六点七与五十表示不同缺陷，不能互相替代。","分别说明已给链接质量和应引主张覆盖"],
          ["主题相近不构成蕴含，必须足以推出具体主张。","而不只是主题相近"]
        ]),
        six(4, [
          ["稳定引用锚点由规范文档版本和原始跨度构成。","证据锚点要经得住切块、更新与重排"],
          ["它防止重新切块或网页更新后旧引用跳错位置。","旧引用为什么会跳错位置"],
          ["输入文档版本和坐标，输出跨更新仍可定位的引用。","输出跨切块更新仍可定位的引用"],
          ["块 ID 映射到原始页章节字符或版面坐标。","引用必须映射回原始版本坐标"],
          ["chunk ID 是索引产物，不是永久证据身份。","chunk ID 只是索引产物"],
          ["旧版本无法定位时必须明确标记链接漂移。","不能悄悄跳到新文档首页"]
        ]),
        six(5, [
          ["证据闭环先选择证据，再生成主张并逐条核验。","原创图：生成前选择证据，生成后逐主张核验"],
          ["它防止先写答案再按主题补出伪引用。","为什么“先写答案再补链接”特别容易制造伪引用"],
          ["输入问题证据和主张，输出二部图与定位链接。","输出主张—证据二部图、蕴含完整性检查及定位链接"],
          ["生成前限定白名单，生成后检查每条主张的蕴含和覆盖。","生成后逐主张核验"],
          ["主张证据二部图比文字加链接更可审计。","能发现缺证和错配"],
          ["验证失败主张必须删除、降格或继续补查。","必须删除、降格或补查"]
        ]),
        six(6, [
          ["引用验证分为证据蕴含、来源适用和事实可信三层。","蕴含、来源质量与事实真值要分别判断"],
          ["它处理低质量文章确实写了某话但事实仍可能错误。","这个引用算正确吗"],
          ["输入主张跨度来源与独立证据，输出三层判断。","输出蕴含判断、来源适用性和事实可信度三个结果"],
          ["先查语义支持，再查来源范围，最后交叉核实事实。","文章确实声称 X 只证明归因忠实"],
          ["忠实归因不等于被归因的说法真实。","不能证明 X 为真"],
          ["自动蕴含在否定范围表格跨句上需要人工抽检。","自动蕴含模型只能筛查，否定词、表格、范围限定和跨句推断仍需人工抽检"]
        ]),
        six(7, [
          ["冲突证据处理保留不同来源及其口径时间和适用范围。","冲突证据不能被静默平均"],
          ["它回答两个可信来源给出不同数字时如何呈现。","模型该选哪个"],
          ["输入来源差异，输出裁决选择或并列冲突说明。","输出可裁决选择或并列展示的冲突说明"],
          ["先核对范围版本，无法裁决时并列并说明条件。","仍冲突则保留双方及适用条件"],
          ["检索排名靠前不能替代来源权威与口径判断。","检索名次不能代替来源裁决"],
          ["综合推断必须标明来源，不能伪装成原话。","不能伪装成某一来源原话"]
        ]),
        six(8, [
          ["引用界面把标记摘录来源日期和原文定位一起呈现。","引用界面也是验证系统的一部分"],
          ["它确保用户实际能够检查证据而不是只到首页。","用户点开后只到文档首页，是否算可核验"],
          ["输入主张锚点权限，输出就近标记和高亮原句。","输出紧邻标记、悬停摘要及点击高亮原句"],
          ["按主张范围展示最小摘录并跳转对应版本坐标。","用户能回到支持跨度才算可核验"],
          ["首页链接无法证明特定主张所依据的具体内容。","跳到首页不够"],
          ["摘录须满足版权最小充分原则并说明访问限制。","受限来源应明确访问限制"]
        ]),
        six(9, [
          ["引用评测由人工金标主张证据蕴含和来源质量建立。","评测要有人标主张，也要测定位是否真的可用"],
          ["它解释 URL 返回成功为何不足以验收引用。","自动检查 URL 200，为什么远远不够"],
          ["输入人工金标，输出正确完整定位冲突和任务指标。","输出正确性、完整性、错位率、来源层级、冲突覆盖及任务质量"],
          ["逐主张比较定位跨度和语义支持并测试无证拒答。","还要测试无足够证据时是否拒绝"],
          ["URL 可访问只证明资源存在，不证明定位或支持。","不证明定位或支持正确"],
          ["数字日期因果表格和多跳必须分别切片。","数字、日期、因果、表格和多跳推断需分别切片"]
        ]),
        six(11, [
          ["检索、引用、归因和事实核查是四道不同质量关。","先澄清：检索、引用、归因与事实核查是四道不同关"],
          ["它解释找到正确论文后答案为何仍可能不可靠。","为何仍可能写出不可靠答案"],
          ["输入材料跨度表述和核查证据，输出四关状态。","输出四道关分别通过或失败的状态"],
          ["依次检查找到材料、连接跨度、忠实归因和事实可信。","检索负责找材料，引用负责连接跨度"],
          ["grounded 单标签会掩盖各层不同的失败原因。","一个 grounded 标签不能覆盖四层"],
          ["解释必须显式给出推断步骤、条件与不确定性。","必须显式给出推断步骤和不确定性"]
        ])
      ]
    },
    "knowledge-graph": {
      contractVersion: 2,
      examples: [{ section: 3, evidence: {
        setup: "Apple 收购 Beats；Tim 领导 Apple",
        rule: "先给 Apple 公司分配",
        steps: "0.9×0.95^3≈0.772",
        interpretation: "最终必须回查三段原文"
      }}],
      formulas: [
        { id: "knowledge-graph-fact", section: 2, formulaIndex: 1, symbols: [
          { name: "Fact", meaning: "一条带限定条件和治理状态的图事实", evidence: "输出一条可追踪、可撤回的限定边 Fact" },
          { name: "subject", meaning: "事实的主体稳定实体 ID", evidence: "主体 subject" },
          { name: "predicate", meaning: "受控本体中的关系类型", evidence: "关系 predicate" },
          { name: "object", meaning: "事实的客体实体或值", evidence: "客体 object" },
          { name: "validTime", meaning: "事实成立的有效时间", evidence: "有效时间 validTime" },
          { name: "source", meaning: "支持事实的原文证据", evidence: "来源 source" },
          { name: "confidence", meaning: "抽取或确认置信信息", evidence: "置信度 confidence" },
          { name: "status", meaning: "候选确认冲突或撤回状态", evidence: "状态 status" }
        ]},
        { id: "knowledge-graph-path-confidence", section: 3, formulaIndex: 1, symbols: [
          { name: "Ppath", meaning: "独立近似下整条路径的正确概率", evidence: "输出 cook 到 dre 的可追踪路径及独立近似置信度 Ppath" },
          { name: "pEntity", meaning: "锚点实体解析正确率", evidence: "实体解析正确率 pEntity" },
          { name: "pEdge", meaning: "每一条关系边的正确率", evidence: "每条边正确率 pEdge" },
          { name: "h", meaning: "路径包含的关系边数量", evidence: "路径边数 h" }
        ]}
      ],
      termReviews: [],
      sectionContracts: [
        six(1, [
          ["知识图谱用稳定实体和显式关系组织可追踪事实。","图解决的是关系寻址，而不只是相似搜索"],
          ["它解决唯一身份、多跳约束、时间版本和全局结构查询。","向量检索能找到相关段落，为什么还要图"],
          ["输入实体关系时间证据，输出可按关系查询的事实图。","输出可按关系和约束查询的事实图"],
          ["把实体身份和受控边显式存储后按路径寻址。","擅长唯一身份、多跳、时间版本与全局结构"],
          ["路径存在只说明图中有连接，不说明连接真实。","不表示连接真实"],
          ["单段可答或维护收益不足时无需建设知识图谱。","单段即可回答或维护成本高于收益时不必建图"]
        ]),
        six(2, [
          ["图事实是带身份、关系、时间、来源、置信和状态的边。","事实应是带限定条件的边"],
          ["它避免把带历史与冲突的事实简化为三个字符串。","为什么不是三个字符串就够"],
          ["输入七类限定字段，输出可追踪可撤回事实边。","输出一条可追踪、可撤回的限定边 Fact"],
          ["稳定 ID 定身份，本体定关系，时间来源定适用证据。","稳定 ID 区分同名实体"],
          ["时间与来源说明事实何时成立以及凭什么成立。","时间和来源限定事实何时及为何成立"],
          ["缺限定字段的三元组不能可靠支持历史冲突查询。","不能支持可靠历史与冲突查询"]
        ]),
        six(3, [
          ["多跳查询沿受控关系从起点实体连接到目标实体。","完整示例：从四句话解析同名实体并回答多跳问题"],
          ["它展示同名解析和每条边错误如何影响最终路径。","怎样回答“Tim 间接关联谁”"],
          ["输入实体和边正确率，输出路径及近似置信度。","输出 cook 到 dre 的可追踪路径及独立近似置信度 Ppath"],
          ["先解析稳定实体，再按关系方向走三条边并乘正确率。","Ppath=pEntity×pEdge^h"],
          ["零点七七二说明每一跳误差会累积降低路径可信度。","说明每跳误差会累积"],
          ["独立假设只作直觉，最终必须逐边回查原文。","最终必须回查三段原文"]
        ]),
        six(4, [
          ["本体是为目标问题定义实体关系方向基数和时间规则的最小约束。","本体是问题驱动的约束"],
          ["它避免关系过宽无法查询或过细难以抽取维护。","关系类型越多，图是否越有知识"],
          ["输入真实问题和建模规则，输出最小可用 schema。","输出能支持目标查询的最小 schema"],
          ["先从问题反推必要类型关系和身份规则。","本体质量看能否稳定回答业务问题"],
          ["类型数量多不代表知识质量或查询能力更强。","不看类型数量"],
          ["schema 改变必须迁移旧边并保持语义兼容。","必须迁移旧边并保持语义兼容"]
        ]),
        six(5, [
          ["知识图谱证据闭环从原文抽取图，再由路径回到原文。","原创图：从原文证据到图路径，再回到原文"],
          ["它解释 GraphRAG 为何不能只把边列表交给模型。","为什么仍不能只把边列表交给模型"],
          ["输入原始文档，输出证据图、查询路径和原文证据。","输出实体解析、关系时间来源绑定后的图"],
          ["构建时绑定跨度，查询后按路径重新取回对应原文。","再由查询路径回取原文"],
          ["图负责寻路聚合，原文负责事实核验和纠错。","原文跨度负责事实核验与纠错"],
          ["回答的每条路径都必须回到有权限的原文。","必须能回到可访问的原文证据"]
        ]),
        six(6, [
          ["时态图分别记录事实有效时间和系统获知时间。","时间与冲突必须一等建模"],
          ["它处理 CEO 等关系变化时保留历史和来源冲突。","CEO 从甲变成乙，为什么不能覆盖旧边"],
          ["输入有效区间获知时间和冲突，输出可按时间查询的并存边。","输出可按时间点查询的并存边"],
          ["新事实关闭旧有效区间但保留历史来源和冲突状态。","关闭旧边有效期而不删除历史证据"],
          ["observedAt 表示获知时间，不等于事实生效时间。","observedAt 不等于事实生效时间"],
          ["未解决冲突必须展示或按明确用途规则选择。","不能静默覆盖"]
        ]),
        six(7, [
          ["GraphRAG 按问题尺度检索路径、邻域或社区摘要。","GraphRAG 有路径、邻域与社区三个尺度"],
          ["它决定应取有限关系路径还是全局图主题。","应取最短路径还是整张图摘要"],
          ["输入问题锚点和预算，输出图结构结果及对应原文。","输出受约束路径、有限邻域或社区摘要及对应原文"],
          ["实体题扩邻域，多跳题搜路径，全局题用社区。","实体题扩邻域，多跳题搜类型路径"],
          ["社区摘要只是有损索引而不是最终事实证据。","社区摘要是有损索引"],
          ["必须限制跳数节点和边类型以防枢纽淹没证据。","必须限制规模"]
        ]),
        six(8, [
          ["图与向量检索组合语义锚点、关系约束和文本回查。","图与向量检索应互补而非二选一"],
          ["它解决问题无精确实体名时图查询缺少起点的问题。","问题里没有精确实体名，图从哪里开始走"],
          ["输入自然语言图和文本，输出路径约束后的候选证据。","输出经过实体解析、路径约束和文本重排的候选证据"],
          ["向量找锚点，图扩路径，文本重排并回查。","向量负责没有精确实体名时找锚点"],
          ["各检索通道贡献必须保留以便诊断收益。","各路贡献必须可观测"],
          ["只能在相同质量延迟成本预算下比较方案。","同一质量、延迟和成本预算下比较"]
        ]),
        six(9, [
          ["图评测分解构建、路径查询和最终应用三层质量。","评测要分解构建质量与任务贡献"],
          ["它防止问答偶然正确被误当成所有图边都正确。","问答答对了，能证明图里的边都对吗"],
          ["输入金标图和任务，输出三层指标与切片结果。","输出构建层、查询层和应用层指标"],
          ["分别测实体关系时间来源、路径证据和最终答案。","输入金标实体、关系、时间、来源、查询路径和最终答案"],
          ["平均边准确率会掩盖高连接实体误合并的放大伤害。","会掩盖非线性伤害"],
          ["必须按路径长度热度时间更新和冲突切片。","必须按路径长度、实体热度、时间更新和冲突切片"]
        ]),
        six(11, [
          ["知识图谱、图数据库、网络图和 GraphRAG 属于不同系统层。","先澄清：知识图谱、图数据库与可视化不是同义词"],
          ["它避免把能画图或能沿边查询误认为已获得可靠知识。","把 CSV 导入图数据库并画成网络，就获得知识图谱了吗"],
          ["输入图类系统，输出存储、展示、知识或检索层分类。","输出“图数据库、可视化、知识图谱或图辅助检索”的层级分类"],
          ["按是否只存储、只展示、治理事实或辅助检索区分。","图数据库负责存储查询，网络图负责展示"],
          ["能沿边查询只说明结构存在，不说明边是真实知识。","不证明边是真实知识"],
          ["小型知识图谱也可存在关系表而无需专用图数据库。","不强制使用专用图数据库"]
        ])
      ]
    },
    "advanced-rag": {
      contractVersion: 2,
      examples: [{ section: 7, evidence: {
        setup: "签收 35 天的质量问题能退吗",
        rule: "双路召回 + RRF",
        steps: "融合扩大证据覆盖，重排和时效规则再把四条缩成",
        interpretation: "RRF 不是最终裁判"
      }}],
      formulas: [{ id: "advanced-rag-rrf", section: 3, formulaIndex: 1, symbols: [
        { name: "RRF", meaning: "倒数排名融合得到的文档分数", evidence: "RRF 分数 RRF(d)" },
        { name: "d", meaning: "待融合排名的候选文档", evidence: "文档 d" },
        { name: "J", meaning: "参与融合的检索器数量", evidence: "输入 J 路检索器" },
        { name: "j", meaning: "检索器编号", evidence: "j 是检索器编号" },
        { name: "k", meaning: "降低头部名次差异的平滑常数", evidence: "平滑常数 k" },
        { name: "rj", meaning: "文档 d 在第 j 路检索器中的名次", evidence: "候选名次 rj(d)" }
      ]}],
      termReviews: [
        { section: 2, reviewedAt: "2026-07-27", terms: [
          { name: "HyDE", meaning: "生成假设文档以构造语义检索表示的方法", purpose: "在缺少直接关键词时帮助召回潜在相关文档", definitionEvidence: "HyDE 的假设文档只构造搜索表示", purposeEvidence: "改写补搜索表达而不替换用户意图" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["高级 RAG 从可观测中间产物定位检索证据链的失败层。","先定位失败层"],
          ["它避免答案错误后未经诊断就盲目增加重排等组件。","为什么不能直接加一个重排器"],
          ["输入各层产物，输出首次失败层和可证伪修复假设。","输出首次偏离预期的层及可证伪修复假设"],
          ["一次只改变一层并在同一数据上复跑比较。","一次只改变该层并复跑同一数据"],
          ["答案改善而延迟超预算说明复杂链只应路由困难查询。","只应把复杂链路路由给困难查询"],
          ["未定位失败前不能通过堆组件冒充优化。","不能直接堆组件"]
        ]),
        six(2, [
          ["查询改写补充检索表达但必须保留原问题约束。","查询改写与扩展"],
          ["它处理用户表达含歧义、省略实体或不适合直接搜索的问题。","用户问题为何不一定是最佳搜索词"],
          ["输入原问题实体条件，输出结构化改写或子查询。","输出保留约束的结构化改写或多个子查询"],
          ["显式记录补充和拆分差异，原问题用于最终验收。","原问题仍用于最终验收"],
          ["HyDE 假设文档只用于搜索表示而不是证据。","HyDE 的假设文档只构造搜索表示"],
          ["新增实体或丢否定会将检索引向错误前提。","必须保留差异与来源"]
        ]),
        six(3, [
          ["混合召回融合关键词与稠密检索器的候选排名。","混合召回与融合"],
          ["它解决精确词与语义改写各自的召回盲区。","稠密与关键词为什么互补"],
          ["输入多路名次，输出每个候选的 RRF 分数。","输出文档 d 的 RRF 分数 RRF(d)"],
          ["各路按名次倒数贡献并相加，避免分数量纲不一。","避免直接相加不同量纲分数"],
          ["名次靠前贡献更大，但融合分不是事实质量分。","名次靠前贡献更大"],
          ["融合不负责判断来源时效、权限和真实性。","不判断时效、权限或真实性"]
        ]),
        six(4, [
          ["重排与装配把融合候选变成去重、带引用的最终上下文。","重排与上下文装配"],
          ["它处理候选重复、相邻块割裂和版本冲突。","候选相关后怎样避免重复和冲突"],
          ["输入候选分数和治理信息，输出可引用上下文。","输出去重且保留必要冲突与引用的上下文"],
          ["精排后合并邻接块并过滤过期无权内容。","交叉编码器精排后按来源合并邻接块"],
          ["前排相关只说明适合回答，不等于来源可信。","前排相关只说明适合回答，不等于可信"],
          ["权威证据冲突时必须同时保留并解释。","必须显式保留和解释"]
        ]),
        six(5, [
          ["多跳检索根据当前缺失证据逐步生成下一子查询。","多跳与自适应检索"],
          ["它解决必须先查 A 才能知道如何查询 B 的问题。","需要先查 A 才知道查 B"],
          ["输入问题和槽位缺口，输出子查询实体及槽位状态。","输出下一子查询、中间实体及更新后的槽位状态"],
          ["每跳验证实体来源并只在填补缺口时继续。","每一跳只在填补缺口或解决冲突时继续"],
          ["错误实体会沿后续查询传播并形成滚雪球。","错误实体会让后续检索滚雪球"],
          ["必须限制步数资源并设置无进展终止条件。","最大步数、预算和无进展终止是必需边界"]
        ]),
        six(6, [
          ["高级链路评测用组件消融证明每个新增环节的净收益。","是否值得升级"],
          ["它回答复杂 RAG 是否真的优于固定的基础 RAG。","高级链路如何证明比基础 RAG 好"],
          ["输入基础与单组件变体，输出证据答案延迟成本差异。","输出 Recall、NDCG、证据忠实、答案成功、延迟和成本差异"],
          ["固定查询集一次增加一个组件并比较端到端结果。","通过组件消融确认新增环节"],
          ["局部排序变好而答案不变说明瓶颈在后续。","瓶颈已在后续"],
          ["没有稳定端到端净收益的组件应该删除。","没有稳定净收益的组件应删除"]
        ]),
        six(7, [
          ["退款案例依次进行查询分解、双路融合、重排和治理过滤。","一次退款查询怎样逐层修复"],
          ["它解释为何不能只通过增大 topK 解决复杂条件问题。","为什么需要改写、融合和重排"],
          ["输入两路名次和治理规则，输出共同支撑结论的 A+B。","输出可共同支撑结论的 A+B 证据"],
          ["RRF 扩候选，重排判资格，时效过滤旧政策。","重排识别退款资格，版本过滤删除旧政策"],
          ["融合分接近说明 RRF 不能替代细粒度判断。","RRF 不是最终裁判"],
          ["回答只能引用真实取回且通过治理的材料。","只能引用真实取回、通过治理检查的材料"]
        ]),
        six(8, [
          ["纠错循环围绕明确缺失证据槽位决定继续或停止。","纠错与多跳何时应该停止"],
          ["它防止证据不足演化成无限查询改写循环。","怎样避免把一次缺证变成无休止循环"],
          ["输入槽位证据和预算，输出继续、解冲突或停止。","输出继续检索、解决冲突或透明停止"],
          ["仅在填缺口、升来源或解冲突时记录进展。","只有填补缺口、提升来源等级或解决版本冲突才算进展"],
          ["连续两轮无新槽位说明继续搜索没有取得进展。","连续两轮无新槽位就停止"],
          ["假设文本和代理自写内容不可升级为回答证据。","不能升级为回答证据"]
        ])
      ]
    },
    "reranking": {
      contractVersion: 2,
      examples: [{ section: 7, evidence: {
        setup: "双塔 top-4",
        rule: "交叉编码器",
        steps: "从 rank=2 到 rank=1 得 0.5 到 1.0",
        interpretation: "只说明首个相关结果提前"
      }}],
      formulas: [
        { id: "reranking-mrr-change", section: 7, formulaIndex: 1, symbols: [
          { name: "MRRbefore", meaning: "重排前首个相关结果的倒数排名", evidence: "输出 MRRbefore" },
          { name: "rankbefore", meaning: "重排前首个相关结果名次", evidence: "从 rank=2" },
          { name: "MRRafter", meaning: "重排后首个相关结果的倒数排名", evidence: "MRRafter" },
          { name: "rankafter", meaning: "重排后首个相关结果名次", evidence: "到 rank=1" }
        ]},
        { id: "reranking-batched-latency", section: 8, formulaIndex: 1, symbols: [
          { name: "Trerank", meaning: "候选重排总延迟", evidence: "输出重排延迟 Trerank" },
          { name: "Tfixed", meaning: "网络与编排固定开销", evidence: "固定编排开销 Tfixed" },
          { name: "Tbatch", meaning: "交叉编码器每批处理耗时", evidence: "每批耗时 Tbatch" },
          { name: "k", meaning: "需要重排的候选总数", evidence: "候选数 k" },
          { name: "b", meaning: "每个批次可处理的候选数", evidence: "每批候选量 b" }
        ]}
      ],
      termReviews: [],
      sectionContracts: [
        six(1, [
          ["重排在高召回候选集合内做更精细的相关性排序。","两阶段为何必要"],
          ["它避免让昂贵模型逐个比较数据库全部文档。","为什么不让最强模型比较数据库全部文档"],
          ["输入查询全库和预算，输出候选及重排前排片段。","输出首阶段高召回候选及重排后的前排片段"],
          ["便宜首阶段缩小集合，昂贵重排器只重排该集合。","只在该集合内做精细交互"],
          ["证据不在候选中是召回失败而不是排序失败。","不是重排失败"],
          ["只有小库且预算允许时才可能省略首阶段。","才可能省略首阶段"]
        ]),
        six(2, [
          ["双塔独立编码查询文档，交叉编码器共同编码二者。","双塔与交叉编码器"],
          ["它解释交叉编码为何更精细同时计算更慢。","重排器为何通常更准但更慢"],
          ["输入查询文档和预算，输出双塔分或交叉相关分。","输出双塔相似分或交叉编码相关分"],
          ["交叉编码让查询和文档 token 直接交互。","共同读取查询与文档 token"],
          ["高分表示训练目标下相关，不代表来源真实。","不证明来源真实"],
          ["长文截断后的低分不能代表全文无关。","低分不能代表全文无关"]
        ]),
        six(3, [
          ["候选深度 k 是送入重排器的首阶段结果数量。","候选深度的上限"],
          ["它权衡正确证据覆盖与线性增长的重排成本。","重排 top-20 与 top-200 如何权衡"],
          ["输入 Recall 曲线和预算，输出重排候选 k。","输出需要重排的 k"],
          ["观察 Recall 随 k 增长并在收益饱和处控制深度。","增大 k 提高包含正确证据的机会"],
          ["Recall 饱和后继续扩大会增加噪声和延迟。","主要增加噪声和延迟"],
          ["Recall 很低时应先修召回而非重排器。","应先修召回而不是换更强重排器"]
        ]),
        six(4, [
          ["Late interaction 用预计算 token 向量保留局部查询文档交互。","Late interaction"],
          ["它在双塔速度与交叉编码精度之间寻找折中。","能否保留 token 交互又预计算文档"],
          ["输入 token 向量，输出 MaxSim 聚合相关分。","输出通过 MaxSim 聚合的相关分"],
          ["离线存文档 token，在线逐查询 token 找最大匹配并聚合。","在线仍保留查询 token 与文档 token 的局部匹配"],
          ["它比单向量保留更多局部匹配，同时索引更大。","代价是索引更大"],
          ["相关性分不能替代时效、权限和事实核验。","不能替代时效、权限或事实核验"]
        ]),
        six(5, [
          ["LLM 重排可用点式、成对或列表方式比较候选。","LLM 重排的偏差"],
          ["它处理语言模型列表排序可能出现的位置和长度偏差。","会出现什么问题"],
          ["输入候选顺序和提示，输出点式成对或列表排序。","输出点式、成对或列表排序"],
          ["用随机置换和成对校准检查排序对输入位置的敏感性。","置换与成对校准用于测偏差"],
          ["只有不同置换下排序稳定才构成可信证据。","排序变化稳定才是可信证据"],
          ["成本高且位置偏差未校准时不适合默认全量使用。","不适合作为高吞吐默认方案"]
        ]),
        six(6, [
          ["重排端到端评测连接排序、证据、引用、成本和任务成功。","端到端评测输入重排前后候选、必要证据"],
          ["它解释 NDCG 提升为何不一定使最终答案更好。","NDCG 提升为何不一定让答案更好"],
          ["输入候选证据引用任务，输出排序与任务指标。","输出 NDCG、MRR、证据覆盖、引用忠实、延迟、费用和任务成功"],
          ["比较重排前后证据进入上下文及被正确引用的变化。","输入重排前后候选、必要证据、引用和最终任务结果"],
          ["排序改善不代表生成器正确使用了证据。","不说明生成器正确使用证据"],
          ["版本权限和错误但贴题文档必须单独设门禁。","必须包含版本、权限和答案切片"]
        ]),
        six(7, [
          ["排序案例把质量例外从召回第三位提升到重排第一位。","一次排序怎样改变可见证据"],
          ["它说明近似材料排前如何把最终答案带偏。","为什么答案仍可能被排在前面的近似材料带偏"],
          ["输入候选名次和等级，输出前后 MRR 与证据覆盖。","输出 MRRbefore、MRRafter 与 top2 证据覆盖"],
          ["按首个相关结果名次取倒数并比较重排前后。","MRR 是首个相关结果排名 rank 的倒数"],
          ["从零点五到一只说明首个相关结果被提前。","只说明首个相关结果提前"],
          ["来源时效和多证据使用仍需独立验证。","旧版条款可信度和生成是否同时使用一般规则与例外仍需另测"]
        ]),
        six(8, [
          ["重排延迟由固定开销和候选批次数共同构成。","精度收益怎样换算成延迟预算"],
          ["它解释为何线上不能总把 top200 送交叉编码器。","为什么线上系统不能总把 top-200 交给交叉编码器"],
          ["输入批大小候选数和耗时，输出总重排延迟。","输出重排延迟 Trerank"],
          ["候选数除批容量向上取整，再乘每批耗时并加固定开销。","批次数是向上取整 k/b"],
          ["二十与一百条延迟只适用于给定硬件和批设置。","只适用于给定硬件和批设置"],
          ["额外 Recall 必须证明可改善最终任务才值得延迟。","必须证明能改善最终任务"]
        ])
      ]
    },
    "chunking": {
      contractVersion: 2,
      examples: [{ section: 7, evidence: {
        setup: "一条退款政策应该怎样切",
        rule: "结构化父子切分用小单元提高命中率",
        steps: "L=120、w=40、o=10 得 n=4",
        interpretation: "只能由跨边界证据命中与最终答案改善决定"
      }}],
      formulas: [{ id: "chunking-overlap-count", section: 7, formulaIndex: 1, symbols: [
        { name: "n", meaning: "带重叠滑窗产生的近似块数", evidence: "输出块数 n" },
        { name: "L", meaning: "原文 token 长度", evidence: "文档长度 L" },
        { name: "w", meaning: "每个块的窗口 token 长度", evidence: "窗口 w" },
        { name: "o", meaning: "相邻块重叠 token 数", evidence: "重叠 o" }
      ]}],
      termReviews: [],
      sectionContracts: [
        six(1, [
          ["文档切分把原文变成带定位信息的可检索证据单位。","切分是检索的分辨率"],
          ["它解决答案跨边界、块缺语境或整篇过大稀释主题的问题。","正确答案跨两个块时会发生什么"],
          ["输入文档查询和预算，输出带原文位置的证据块。","输出带原文位置的可检索证据块"],
          ["按真实答案跨度和结构决定边界并建立版本化索引。","块定义了检索能直接找到的最小单位"],
          ["关键词命中不代表块包含完整判断条件。","不表示块含有独立判断所需的完整条件"],
          ["切分变化必须生成新 ID 和偏移，不能直接覆盖。","不能直接覆盖导致引用失效"]
        ]),
        six(2, [
          ["切分策略包括固定长度、结构、语义和父子切分。","策略选择输入文档结构可靠性、主题边界和回填需求"],
          ["它回答固定五百 token 是否适用于所有文档。","固定 500 token 是否适合所有文档"],
          ["输入结构和回填需求，输出一种策略或组合。","输出固定长度、结构、语义或父子切分及其组合"],
          ["分别按预算、标题、主题变化或父子层级划分。","父子切分用小块定位并回填大块"],
          ["不同策略应按真实查询的证据完整性比较。","按真实查询证据完整性比较"],
          ["没有任何一种切分策略是所有文档的默认答案。","不是所有文档的默认答案"]
        ]),
        six(3, [
          ["重叠让相邻块重复一段边界内容以降低句子截断。","重叠的收益与代价"],
          ["它处理答案恰好跨越两个窗口边界的问题。","为什么相邻块常保留一段重复"],
          ["输入窗口跨度和预算，输出重叠范围及合并规则。","输出相邻块重复范围及检索后合并规则"],
          ["重复边界后在检索阶段按文档和邻接关系合并去重。","增加索引、重复召回和上下文竞争"],
          ["收益看完整证据命中，代价看去重后 token。","收益应看完整证据命中"],
          ["重叠不能修复错误阅读顺序和权限串库。","不能修复阅读顺序或权限错误"]
        ]),
        six(4, [
          ["块元数据保存文档身份、层级、位置、版本和权限。","保留元数据与层级"],
          ["它防止段落脱离标题后主语和适用范围丢失。","一个段落离开标题后还表达同一意思吗"],
          ["输入定位治理字段，输出可过滤可回查的证据单元。","输出可定位、可过滤、可回查的证据单元"],
          ["标题辅助嵌入，引用始终指回原文坐标。","引用仍必须指向原文坐标"],
          ["脱离标题语义改变的段落不能当作无上下文事实。","不能作为无上下文事实"],
          ["权限和版本必须跟随每个块传播。","权限和版本必须随块一起传播"]
        ]),
        six(5, [
          ["非纯文本切分先恢复材料特有的原子结构。","非纯文本需要专门解析"],
          ["它防止字符硬切破坏表格、代码、PDF 和对话含义。","表格、代码和 PDF 能按字符硬切吗"],
          ["输入结构化材料，输出保留原子结构的证据块。","输出保留各自原子结构的块"],
          ["先恢复阅读顺序表头依赖或指代，再执行切分。","解析器先恢复阅读顺序、表头、函数依赖或指代实体，再切分"],
          ["检索失败可能其实是解析阶段已丢失正确内容。","检索失败其实发生在索引之前"],
          ["字符硬切只适合结构不重要且经过验证的文本。","只适合结构不重要且已验证的连续文本"]
        ]),
        six(6, [
          ["切分调参用证据和端到端任务指标联合选择块大小。","怎样调块大小"],
          ["它判断应优化 Recall 还是最终答案正确率。","应该优化 Recall@k 还是答案正确率"],
          ["输入标注查询和候选任务，输出召回引用答案成本指标。","输出证据召回、引用定位、答案、token、延迟和重复率"],
          ["先检查完整证据召回，再检查上下文和最终答案。","先确保必要证据完整进入候选"],
          ["Recall 高而证据残缺仍表示切分方案失败。","Recall 高但证据残缺仍不合格"],
          ["不同查询粒度可用多套索引，不存在通用五百一十二。","不存在通用最佳 512 token"]
        ]),
        six(7, [
          ["退款案例比较固定、重叠和父子切分的证据完整性。","一条退款政策应该怎样切"],
          ["它展示期限和质量例外被固定窗口拆开后的损失。","检索器会看到什么"],
          ["输入 L、w、o 和结构，输出 n、索引 token 与证据。","输出块数 n、索引 token 与完整证据"],
          ["用步长 w 减 o 滑动，并向上取整得到块数。","n 等于向上取整"],
          ["四块和百分之二十五膨胀是给定长度下的结果。","L=120、w=40、o=10 得 n=4"],
          ["是否值得必须由跨边界命中和答案改善决定。","只能由跨边界证据命中与最终答案改善决定"]
        ]),
        six(8, [
          ["边界材料需按 PDF、表格、代码和对话分别解析。","边界案例如何分别处理"],
          ["它解释一个字符切分器为何同时破坏多类材料。","为什么会同时破坏 PDF、表格、代码和对话"],
          ["输入解析材料和约束，输出可还原含义的证据块。","输出可独立还原含义的证据块和解析质量指标"],
          ["用渲染对照、表头覆盖、AST 和实体绑定验收。","AST 检查和实体绑定"],
          ["检索不到可能是内容从未完整进入索引。","正确内容从未进入索引"],
          ["重叠不能补救双栏错序、串库或版本混合。","不能补救双栏错序、串库或混版本"]
        ])
      ]
    },
    "retrieval": {
      contractVersion: 2,
      examples: [{ section: 2, evidence: {
        setup: "查询“退款期限”",
        rule: "关键词和语义各有盲区",
        steps: "Recall@2=2/2=100%",
        interpretation: "检索评测需要先标注“什么算相关”"
      }}],
      formulas: [
        { id: "retrieval-cosine", section: 2, formulaIndex: 1, symbols: [
          { name: "CosineSim", meaning: "查询与文档向量方向的余弦相似度", evidence: "余弦相似度 CosineSim" },
          { name: "q", meaning: "查询的嵌入向量", evidence: "查询 q" },
          { name: "d", meaning: "候选文档或片段的嵌入向量", evidence: "文档向量 d" }
        ]},
        { id: "retrieval-ranking-metrics", section: 6, formulaIndex: 1, symbols: [
          { name: "MRR", meaning: "第一个相关结果排名倒数的查询平均", evidence: "MRR 是每题第一个相关结果排名倒数的平均" },
          { name: "N", meaning: "评测查询数量", evidence: "输入 N 个查询" },
          { name: "i", meaning: "查询编号", evidence: "每题相关集合" },
          { name: "ranki", meaning: "第 i 个查询首个相关结果的排名", evidence: "排序位置 ranki" },
          { name: "RecallK", meaning: "前 K 结果覆盖全部相关项的比例", evidence: "RecallK 等于 HitK 除以 Relevant" },
          { name: "HitK", meaning: "前 K 中命中的相关项数", evidence: "HitK 是前 K 中命中的相关项数" },
          { name: "Relevant", meaning: "该查询全部相关项数", evidence: "Relevant 是全部相关项数" }
        ]}
      ],
      termReviews: [],
      sectionContracts: [
        six(1, [
          ["检索从可访问知识库中挑出与查询相关的少量候选。","为什么要「检索」"],
          ["它解决知识库无法全部装入上下文且噪声成本过高的问题。","为什么不干脆把整个知识库都塞给模型"],
          ["输入查询、知识库和预算，输出少量候选片段及来源。","输出少量候选片段及其来源"],
          ["在模型生成前先缩小材料范围并保留最相关候选。","先缩小材料范围"],
          ["被召回只代表候选相关，不代表可回答或内容正确。","不表示片段足以回答或内容正确"],
          ["知识库可完整安全装入时才可能省略检索。","才可能不需要检索"]
        ]),
        six(2, [
          ["关键词检索匹配字面，语义检索匹配嵌入空间中的意思。","运行示例：对字面 vs 对意思"],
          ["它解决同义改写漏召回与精确编号被语义弱化的互补问题。","有两种根本不同的思路"],
          ["输入查询和两类分数，输出融合后的候选排序。","输出融合后的候选排序"],
          ["关键词与向量相似度分别召回，再融合并可重排。","生产通常融合并重排"],
          ["余弦分数只表示表示空间方向接近，不证明事实正确。","不证明事实正确"],
          ["精确编号偏关键词，换说法偏语义，不能认定一种恒优。","精确编号优先关键词，换说法优先语义"]
        ]),
        six(3, [
          ["语义检索分为离线建索引和在线查询两个阶段。","它怎么运作：离线 + 在线"],
          ["它把大量文档预处理为可快速搜索的向量索引。","一次检索背后分两个阶段"],
          ["输入文档与查询，输出带元数据的 TopK 候选。","输出带片段 ID、版本、权限与相似度的 TopK 候选"],
          ["离线切块嵌入建库，在线同规则编码查询并找最近邻。","离线先切块、嵌入并建索引"],
          ["返回排名是检索器判断，不是事实正确性的最终排序。","不是最终事实排序"],
          ["表示模型、切块或权限变化后索引必须同步更新。","必须重建或更新索引"]
        ]),
        six(4, [
          ["检索瓶颈是必要证据未进入候选时生成无法可靠补回。","为什么它是 RAG 的真正瓶颈"],
          ["它解释模型很强且文风流畅时为何答案仍会失败。","为什么大家反复强调「问题多半出在检索」"],
          ["输入问题证据和召回，输出召回、挤出或不存在状态。","输出“证据已召回、被噪声挤出或库中不存在”的状态"],
          ["把必要证据逐项与召回结果对照并定位缺口。","必要证据未召回"],
          ["检索合格也只证明候选具备，不保证装配生成正确。","也不保证装配和生成正确"],
          ["应按证据链层次定位，不能把所有失败归咎模型。","先定位证据链断在哪一层"]
        ]),
        six(5, [
          ["检索改进组合查询改写、混合召回、切块和重排。","怎么捞得更准"],
          ["它在提高证据覆盖的同时控制上下文噪声。","怎样提高召回又不让噪声淹没答案"],
          ["输入候选查询和治理信息，输出更小的精排候选集。","输出经过查询改写、混合召回和重排的更小候选集"],
          ["粗召回先避免漏证据，精排再把可回答片段提前。","粗召回追求不漏，精排追求把真正可回答片段放前"],
          ["改进结果需同时观察召回、噪声、版本与权限。","同时解释召回、噪声、版本和权限"],
          ["TopK 过大会增加噪声，重排器自身也会犯错。","重排器也必须独立评测"]
        ]),
        six(6, [
          ["Recall、Precision、MRR 和 nDCG 衡量不同检索性质。","Recall@K、MRR 和 nDCG 各在测什么"],
          ["它区分召回正确文档与把它排在足够靠前的位置。","排第 1 和排第 20 不是同样好"],
          ["输入相关集合与排序，输出覆盖、精度和排序指标。","输出 RecallK、PrecisionK、MRR 与 nDCG"],
          ["按相关标注统计前 K 命中及首个相关结果排名。","RecallK 等于 HitK 除以 Relevant"],
          ["MRR 高只说明首个证据靠前，不说明全部必要证据齐全。","不代表一般规则和例外都已召回"],
          ["指标必须按任务需要几个证据及排序用途选择。","指标必须按任务证据需求选择"]
        ])
      ]
    },
    "rag": {
      contractVersion: 2,
      examples: [{ section: 2, evidence: {
        setup: "签收 35 天还能退吗",
        rule: "两句分别引用 A、B",
        steps: "通常不能；若属于质量问题",
        interpretation: "无证据时不补其他例外"
      }}],
      formulas: [{ id: "rag-assertion-support", section: 6, formulaIndex: 1, symbols: [
        { name: "SupportRate", meaning: "可核验断言中有充分证据支持的比例", evidence: "断言支持率的分子" },
        { name: "Ssupported", meaning: "有充分证据支持的可核验断言数", evidence: "可核验断言数 Ssupported" },
        { name: "Sverifiable", meaning: "回答中全部可核验断言数", evidence: "可核验断言数 Sverifiable" }
      ]}],
      termReviews: [
        { section: 1, reviewedAt: "2026-07-27", terms: [
          { name: "似然", meaning: "给定上下文时某段文字出现的可能性", purpose: "说明语言模型优化文字概率而非直接核验现实真相", definitionEvidence: "似然是“某段文字在上下文中有多可能出现”", purposeEvidence: "模型优化似然并不等于核验现实真相" }
        ]},
        { term: "增强", section: 2, evidence: "增强保留证据边界" },
        { term: "断言支持率", section: 6, evidence: "断言支持率的分子" }
      ],
      sectionContracts: [
        six(1, [
          ["RAG 在回答前检索外部资料并把证据交给模型。","为什么需要 RAG"],
          ["它补足模型知识过期、私有数据缺失和无依据生成。","为什么回答前还要「查资料」"],
          ["输入问题与有权知识库，输出带相关证据的回答任务。","输出带相关证据的回答任务"],
          ["先检索缺失事实，再让模型在证据条件下生成。","在生成前补充模型训练中缺失、过期或私有的信息"],
          ["结果更可核验，不表示材料和回答自动正确。","不代表材料或回答自动正确"],
          ["无权、无可靠来源或无需外部事实时不应强行检索。","不应为使用 RAG 而强行检索"]
        ]),
        six(2, [
          ["RAG 由检索、上下文增强和基于证据生成三步组成。","端到端示例：检索 → 增强 → 生成"],
          ["它把外部资料变成可供当前回答引用的运行时证据。","RAG 这个名字就是它的三步"],
          ["输入问题和带元数据片段，输出提示与逐断言引用答案。","输出检索结果、增强后的提示和带逐断言引用的答案"],
          ["检索找候选，增强保边界，生成只据材料回答。","检索找候选，增强保留证据边界"],
          ["引用只有真正支撑对应断言时才构成证据。","引用只有真正支持对应断言才有意义"],
          ["无证据时必须无答案或追问，不能补写事实。","找不到证据时应明确无答案或追问"]
        ]),
        six(3, [
          ["RAG 把部分事实从固定权重转为运行时可更新证据。","它到底解决了什么"],
          ["它缓解幻觉、支持知识更新并提供来源回查。","对应第 1 节的三个硬伤"],
          ["输入外部知识和问题，输出少无据断言、可更新且可回查的答案。","输出更少无依据断言、可更新答案及可回查来源"],
          ["运行时检索证据并要求回答受材料约束。","把事实从模型权重移到运行时证据"],
          ["有出处只表示可以检查，不等于来源可信或推理忠实。","不等于出处可信或推理忠实"],
          ["RAG 只能缓解幻觉，不能彻底消灭幻觉。","它缓解而不能消灭幻觉"]
        ]),
        six(4, [
          ["RAG 注入运行时事实，微调改变模型行为倾向。","RAG vs 微调：喂事实还是改行为"],
          ["它解决要用私有知识时如何在检索和训练间选择。","除了 RAG，微调不也行吗？该怎么选"],
          ["输入事实或行为需求，输出 RAG、微调或组合方案。","输出 RAG、微调或二者组合"],
          ["按知识更新、溯源和行为稳定性判断两种机制。","知识更新频繁且需溯源时优先 RAG"],
          ["检索适合可变事实，微调适合风格格式和做事方式。","微调改变权重中的风格、格式和行为倾向"],
          ["检索不替代行为训练，微调不充当实时数据库。","微调也不能可靠充当实时数据库"]
        ]),
        six(5, [
          ["RAG 可在检索、装配、证据本身或生成忠实性上失败。","失败边界分析输入检索片段、上下文装配和最终回答"],
          ["它解释系统有引用时为何仍可能答错。","RAG 不是银弹。它最容易在哪失效"],
          ["输入片段、上下文和回答，输出分层失败原因。","输出检索遗漏、上下文噪声、证据错误或生成不忠实等原因"],
          ["先检查证据可用与召回，再检查装配和生成利用。","RAG 上限先受可用证据和检索限制"],
          ["引用存在不证明来源真正支持对应断言。","不证明来源支持断言"],
          ["治理、权限与版本错误不能靠更强模型修复。","不能靠换更强模型修复"]
        ]),
        six(6, [
          ["RAG 分层诊断分别测证据、上下文、断言和最终任务。","怎样把失败定位到检索、上下文或生成"],
          ["它避免端到端准确率下降却不知道应修哪一层。","还不足以指导修复"],
          ["输入目标证据和断言，输出覆盖精度支持率与任务成功。","输出证据覆盖、上下文精度、断言支持率和任务成功"],
          ["逐问题保存目标断言、相关片段、最终上下文和生成断言。","输入目标断言、必要证据、最终上下文和生成断言"],
          ["支持率下降定位生成忠实性，不代表检索必然失败。","不能单独证明检索或最终业务任务合格"],
          ["评分器需用人工样本校准并按规则权限时效切片。","上线前应保留一组人工核验样本校准评分器"]
        ])
      ]
    },
    "model-routing": {
      contractVersion: 2,
      examples: [{ section: 5, evidence: {
        setup: "1000 笔退款按“需要强模型概率”排序",
        rule: "若门槛是质量≥93%、错放≤15",
        steps: "τ=.5 是最低成本可行点",
        interpretation: "仍需对该切片强制升级"
      }}],
      formulas: [
        { id: "routing-constrained-objective", section: 3, formulaIndex: 1, symbols: [
          { name: "m", meaning: "把请求映射到候选模型的路由策略", evidence: "所选模型 m(x)" },
          { name: "x", meaning: "当前请求", evidence: "输入请求 x" },
          { name: "Ecost", meaning: "路由策略的期望模型成本", evidence: "最低期望成本策略" },
          { name: "c", meaning: "一次模型选择的成本", evidence: "成本 c" },
          { name: "Equality", meaning: "路由后总体期望质量", evidence: "平均质量" },
          { name: "q", meaning: "所选模型在请求上的质量结果", evidence: "质量 q" },
          { name: "Q0", meaning: "总体质量下限", evidence: "质量下限 Q0" },
          { name: "Risk", meaning: "关键切片的错误下放风险", evidence: "关键切片风险 Riskk" },
          { name: "k", meaning: "关键切片编号", evidence: "逐切片硬约束" },
          { name: "R", meaning: "关键切片允许的风险上限", evidence: "上限 Rk" }
        ]},
        { id: "routing-cascade-cost-time", section: 4, formulaIndex: 1, symbols: [
          { name: "ECost", meaning: "级联平均调用成本", evidence: "输出期望成本 ECost" },
          { name: "Cs", meaning: "小模型单次成本", evidence: "小模型成本 Cs" },
          { name: "r", meaning: "请求升级到强模型的比例", evidence: "升级率 r" },
          { name: "Cl", meaning: "强模型单次成本", evidence: "强模型成本 Cl" },
          { name: "ETime", meaning: "级联平均延迟", evidence: "期望延迟 ETime" },
          { name: "Ts", meaning: "小模型延迟", evidence: "小模型延迟 Ts" },
          { name: "Tjudge", meaning: "升级判定延迟", evidence: "判定延迟 Tjudge" },
          { name: "Tl", meaning: "强模型延迟", evidence: "强模型延迟 Tl" }
        ]}
      ],
      termReviews: [
        { term: "级联", section: 2, evidence: "输出规则路由、直接路由、级联或并行选择" },
        { term: "反事实", section: 3, evidence: "补足下放样本的反事实" },
        { term: "校准", section: 6, evidence: "输出经独立集校准的“升级可修复概率”" }
      ],
      sectionContracts: [
        six(1, [
          ["模型路由按每个请求在已有候选模型或人工路径间选择。","路由把一次选型变成逐请求决策"],
          ["它让简单请求少付计算成本并升级异常与高风险请求。","为何不该付相同计算成本"],
          ["输入请求风险和候选证据，输出模型、人工或拒绝路径。","输出小模型、强模型、人工或拒绝路径"],
          ["逐请求判断已有候选谁足够，硬风险规则优先。","高风险硬规则优先于概率分数"],
          ["下放表示现有证据支持小模型足够，不表示天然简单。","不表示请求天然简单"],
          ["路由不能创造所有候选都缺失的能力。","不会创造候选都没有的能力"]
        ]),
        six(2, [
          ["路由架构包括规则、直接路由、级联和并行选择。","直接路由、级联和并行选择"],
          ["它决定是在调用前选择还是根据首答证据升级。","还是先让小模型回答再决定升级"],
          ["输入时点信号成本和 SLO，输出一种适合的路由形态。","输出规则路由、直接路由、级联或并行选择"],
          ["调用前信号直接选，首答验证信号用于级联。","首答和验证信号适合级联"],
          ["并行以更高成本换低墙钟时间，级联增加升级尾延迟。","并行用成本换墙钟时间"],
          ["首阶段有副作用时不得无审查地继续级联。","不得无审查级联"]
        ]),
        six(3, [
          ["路由目标是在切片风险硬约束下最小化期望成本。","数学目标必须带切片硬约束"],
          ["它防止多数简单样本高分抵消少数困难请求错放。","路由器会学到什么危险捷径"],
          ["输入请求模型成本质量和门槛，输出最低成本策略。","输出满足逐切片硬约束的最低期望成本策略"],
          ["预测强弱模型相对收益，并用双跑补反事实。","用随机双跑补足下放样本的反事实"],
          ["平均质量合格不代表每个关键切片风险可接受。","平均质量不能抵消少数切片错放"],
          ["没有下放反事实时不能声称错放风险已被正确估计。","下放样本的反事实"]
        ]),
        six(4, [
          ["级联成本包含所有请求的小模型成本和升级请求的强模型成本。","级联期望成本和延迟怎样计算"],
          ["它解释平均费用与升级请求串行尾延迟如何形成。","平均成本真是 ¥0.045 吗"],
          ["输入成本升级率和延迟，输出期望成本与期望延迟。","输出期望成本 ECost 与期望延迟 ETime"],
          ["所有请求先跑小模型，升级者再串行判定和跑强模型。","所有请求先付 Cs"],
          ["零点零四五只包含给定模型调用假设。","0.045 元成立于给定调用假设"],
          ["评分器、失败、人工和副作用必须另计。","不含评分器、失败和人工"]
        ]),
        six(5, [
          ["阈值案例把升级分数与阈值比较后选择大小模型。","阈值怎样改变覆盖、错误与成本"],
          ["它展示更保守阈值如何交换升级成本与错放风险。","τ=.5 与 τ=.3 如何取舍"],
          ["输入请求分数阈值和结果，输出最低成本可行阈值。","输出满足质量与错放门槛的最低成本阈值"],
          ["降低阈值会增加升级并减少困难请求错放。","τ 降低会增加升级、成本并减少错放"],
          ["全局可行点只有在各关键切片也通过时才能采用。","只在全局与所有关键切片同时通过时可选"],
          ["高风险切片失败必须强制升级而非平均抵消。","不能靠全局平均掩盖"]
        ]),
        six(6, [
          ["路由信号是决策时可获得且经校准的升级收益证据。","路由信号必须在决策时可得且可校准"],
          ["它避免用未来标签或模型自信冒充可部署特征。","哪些特征真正能预测强模型比小模型更有价值"],
          ["输入当时可得特征，输出校准后的升级可修复概率。","输出经独立集校准的“升级可修复概率”"],
          ["在独立集校准分数，并按切片检查可靠性。","分数可靠性必须按切片检查"],
          ["未校准自报置信度不等于真实升级收益概率。","模型自报置信度不能未经校准"],
          ["训练使用未来或强模型后验信息属于数据泄漏。","训练时使用未来标签或强模型后验信息会数据泄漏"]
        ]),
        six(7, [
          ["公平路由评测比较不同语言领域群体和风险切片的服务结果。","错误下放会集中在谁身上"],
          ["它发现平均质量隐藏的长尾系统性弱模型服务。","为什么长尾语言和专业用户仍可能系统性得到弱模型"],
          ["输入切片，输出下放错放升级收益及置信区间。","输出各切片下放率、强对小错率、错放率、升级收益与置信区间"],
          ["逐切片统计并比较路由前后的错误和服务质量。","平均合格可能隐藏长尾用户持续收到弱模型"],
          ["公平限制不可接受差距，不要求升级比例完全相同。","不是强求相同升级比例"],
          ["高影响任务可用规则直接绕过学习路由。","高影响任务可直接绕过学习路由"]
        ]),
        six(8, [
          ["在线路由治理持续探索下放反事实并监控漂移。","路由器上线也需要探索、监控与回退"],
          ["它处理模型价格流量变化导致旧阈值立刻失真的问题。","旧阈值为什么会立即失真"],
          ["输入版本分数原因和反馈，输出审计重校准或回退。","输出探索审计、重校准、金丝雀或保守回退动作"],
          ["随机双跑估错放，漂移后重新收集数据并校准。","随机双跑让系统看见下放反事实"],
          ["错放超预算说明应先收紧执行路径而非只改显示指标。","错放超预算时先禁用危险动作或全量升级"],
          ["不可逆工具只能由一个获批路径执行。","不能只移动阈值掩盖根因"]
        ])
      ]
    },
    "model-selection": {
      contractVersion: 2,
      examples: [{ section: 5, evidence: {
        setup: "处理 1000 笔退款",
        rule: "先筛硬约束，再比较完整经济性",
        steps: "¥151/900=¥0.168",
        interpretation: "人工单价或流量结构改变，结论也会改变"
      }}],
      formulas: [
        { id: "model-selection-constrained", section: 3, formulaIndex: 1, symbols: [
          { name: "m", meaning: "候选模型与配套配置", evidence: "输入候选 m" },
          { name: "TotalCost", meaning: "候选的生命周期总成本", evidence: "总成本 TotalCost" },
          { name: "Quality", meaning: "候选在第 k 个质量维度的结果", evidence: "各质量 Qualityk" },
          { name: "k", meaning: "质量约束索引", evidence: "第 k 项质量下限" },
          { name: "Q", meaning: "质量下限", evidence: "Qk 是第 k 项质量下限" },
          { name: "Risk", meaning: "候选在第 j 个风险维度的结果", evidence: "风险 Riskj" },
          { name: "j", meaning: "风险约束索引", evidence: "第 j 项风险上限" },
          { name: "R", meaning: "风险上限", evidence: "Rj 是第 j 项风险上限" },
          { name: "P95", meaning: "候选的第九十五百分位延迟", evidence: "延迟 P95" },
          { name: "L", meaning: "允许的延迟上限", evidence: "L 是延迟上限" },
          { name: "Privacy", meaning: "候选的数据与隐私类别", evidence: "隐私类别 Privacy" },
          { name: "C", meaning: "允许的隐私类别集合", evidence: "C 是允许的隐私类别集合" }
        ]},
        { id: "model-selection-cost-per-success", section: 4, formulaIndex: 1, symbols: [
          { name: "CostPerSuccess", meaning: "每个真实成功任务的完整成本", evidence: "完整成本 CostPerSuccess" },
          { name: "Ccall", meaning: "模型调用成本", evidence: "调用 Ccall" },
          { name: "Ctool", meaning: "检索与工具成本", evidence: "检索工具 Ctool" },
          { name: "Cretry", meaning: "重试与升级成本", evidence: "重试升级 Cretry" },
          { name: "Chuman", meaning: "人工处理成本", evidence: "人工 Chuman" },
          { name: "Cinfra", meaning: "基础设施成本", evidence: "基础设施 Cinfra" },
          { name: "Closs", meaning: "失败造成的损失", evidence: "失败损失 Closs" },
          { name: "Nsuccess", meaning: "独立确认的成功任务数", evidence: "成功任务数 Nsuccess" }
        ]},
        { id: "model-selection-availability", section: 8, formulaIndex: 1, symbols: [
          { name: "Asystem", meaning: "串行链路的近似系统可用率", evidence: "系统可用率 Asystem" },
          { name: "i", meaning: "串行依赖编号", evidence: "第 i 个依赖" },
          { name: "A", meaning: "第 i 个依赖的可用率", evidence: "依赖的可用率 Ai" }
        ]}
      ],
      termReviews: [
        { term: "强模型上界", section: 2, evidence: "强模型基线输入冻结评测集" },
        { term: "帕累托前沿", section: 3, evidence: "进入帕累托前沿" },
        { term: "每成功任务成本", section: 4, evidence: "输出每成功任务完整成本" }
      ],
      sectionContracts: [
        six(1, [
          ["模型选型是在业务硬约束内寻找最小生命周期成本方案。","模型选型输入任务分布、成功定义"],
          ["它解决不同任务无法共享一个排行榜结论的问题。","为什么不能共享同一排行榜结论"],
          ["输入分布门槛和预算，输出满足约束的候选配置集合。","输出满足全部硬约束的候选配置集合"],
          ["先定义成功与不可补偿门槛，再比较候选。","先定义“成功”和不可补偿门槛"],
          ["榜单分数只在任务与约束相同时才可比较。","这些条件相同才可解释"],
          ["硬约束失败不能被价格或普通样本高分抵消。","不能被价格或普通样本高分抵消"]
        ]),
        six(2, [
          ["强模型基线是当前架构在充分证据下的能力上界参照。","先用强模型建立系统上界"],
          ["它区分模型能力不足与任务、数据、检索或工具问题。","怎样判断是模型不够强还是检索、提示和流程有问题"],
          ["输入冻结集和完整系统，输出质量上界及逐样本错误。","输出当前系统架构可达到的质量上界及逐样本错误"],
          ["先跑强基线，再固定其余变量逐项替换做消融。","一次只替换一个变量做消融"],
          ["oracle 下仍失败说明应先修系统定义或证据链。","优先修任务、数据或工具"],
          ["强模型上界是诊断参照，不是自动生产推荐。","不是自动生产推荐"]
        ]),
        six(3, [
          ["模型选型是带质量风险延迟隐私约束的成本最小化。","选型是受约束的多目标优化"],
          ["它避免把不可补偿维度武断加成一个总分。","怎样放进同一决策，而不武断加成一个总分"],
          ["输入候选指标和门槛，输出可行域最低成本方案。","输出可行域中总成本 TotalCost 最低的方案"],
          ["先筛硬门槛，再在可行候选中比较帕累托和成本。","先执行硬门槛，再看帕累托和成本"],
          ["帕累托前沿表示未被全面支配，不等于自动胜出。","不代表自动胜出"],
          ["不满足任一硬约束的候选不进入经济性比较。","Qk 是第 k 项质量下限"]
        ]),
        six(4, [
          ["每成功任务成本汇总任务全链路成本并除以真实成功数。","完整成本从请求流转而不是价目表计算"],
          ["它揭示低单次调用价格如何被重试、人工和失败反超。","为什么可能更贵"],
          ["输入全链路成本和成功数，输出每成功任务完整成本。","输出每成功任务完整成本 CostPerSuccess"],
          ["分子汇总全部成本，分母只计独立确认的业务成功。","分母只计真实业务成功"],
          ["调用便宜若增加人工和失败，最终方案仍可能更贵。","低单次价格若带来更多人工和失败"],
          ["难以定价的高风险不能货币化抵消，应保留硬门槛。","无法定价的高风险应保留硬门槛"]
        ]),
        six(5, [
          ["退款案例先筛三种模型的硬门槛再比较完整成本。","便宜模型怎样输给较贵模型"],
          ["它验证单次价格最低不等于每成功任务成本最低。","谁的每成功任务成本低"],
          ["输入一千笔任务及三候选数据，输出可行者和单位成功成本。","输出可行候选及每成功任务成本"],
          ["先淘汰越权与延迟失败者，再用完整成本除成功数。","再计算 M 的 151÷900≈0.168 元"],
          ["M 只在当前人工价格和流量假设下胜出。","它在当前假设胜出"],
          ["成本或流量改变后必须重新做敏感性分析。","必须重做敏感性分析"]
        ]),
        six(6, [
          ["供应商与运行方式共同构成一个可治理的模型候选。","供应商与运行方式也是候选的一部分"],
          ["它处理质量相近端点在合同版本容量和退出上的差异。","为什么合同、版本与退出能力会决定结果"],
          ["输入行为合同和退出证据，输出运行方案与替代路径。","输出可治理的运行方案与替代路径"],
          ["通过合同审查和真实切换演练验证治理与恢复能力。","实际切换恢复时间才是退出能力证据"],
          ["接口一致不能推导格式拒答或分词行为一致。","接口相同不保证格式、拒答和 tokenization 相同"],
          ["自托管同样必须计运维、补丁、许可和值班。","自托管也必须计入运维、补丁和值班成本"]
        ]),
        six(7, [
          ["静态模型组合按组件难度和风险分配不同执行者。","一个应用可静态组合多个模型"],
          ["它避免让单一大模型承担权限、抽取和所有高风险步骤。","为什么常常不是最终系统设计"],
          ["输入组件需求，输出规则、各级模型或人工职责分工。","输出规则、小模型、中模型、强模型或人工的职责分工"],
          ["对每个组件固定责任、接口和独立验收门槛。","让权限检查、抽取和高风险判断分别验收"],
          ["组合收益来自系统分工，不能全归因于某个模型。","不能把路由收益误记为底层模型能力"],
          ["动态路由必须作为后续独立系统另行评测。","动态路由是后续独立系统"]
        ]),
        six(8, [
          ["回退链为模型或依赖失败预定义替代动作与预算。","回退、降级和退出必须进入评测"],
          ["它说明首选超时或非法输出时用户实际经历的路径。","用户实际经历什么"],
          ["输入失败信号和依赖可用率，输出回退分支及系统可用率。","输出重试、升级、确定性代码、询问、人工或失败分支以及系统可用率"],
          ["按错误类型选择分支，并用依赖乘积估算串行可用率。","可用率近似各 Ai 的乘积"],
          ["单组件高可用不代表串行端到端链路同样可用。","端到端仍会下降"],
          ["相关故障、副作用和总延迟必须做故障注入。","必须通过故障注入验证"]
        ]),
        six(9, [
          ["模型选择是随价格版本分布政策和风险变化的生命周期决策。","选择会过期，需要触发复评"],
          ["它防止团队把采购时结论永久沿用到变化后的系统。","为什么下个月可能不再可行"],
          ["输入各类变化信号，输出复评、灰度切换或退出决定。","输出继续使用、重新比较、灰度切换或退出决定"],
          ["触发器出现即重跑冻结集、真实抽样并更新决策卡。","并更新决策卡"],
          ["历史最优只对当时的数据、成本和约束假设成立。","历史最优只对当时数据和假设成立"],
          ["任何旧结论都不能绕过当前门禁自动继承。","不能永久继承"]
        ])
      ]
    },
    "inference-optimization": {
      contractVersion: 2,
      examples: [{ section: 5, evidence: {
        setup: "退款助手启用大批处理后吞吐翻倍",
        rule: "调度参数必须按 SLO 而非峰值吞吐选择",
        steps: "平均 TTFT 520→470ms；p99 TTFT 1.8→3.2s",
        interpretation: "资源利用率改善不保证尾部体验"
      }}],
      formulas: [
        { id: "inference-latency", section: 1, formulaIndex: 1, symbols: [
          { name: "TTFT", meaning: "请求到首 token 可见的时间", evidence: "TTFT 是请求到首 token 的时间" },
          { name: "Q", meaning: "调度队列等待时间", evidence: "输入排队" },
          { name: "Ccontext", meaning: "检索与上下文组装时间", evidence: "Ccontext 是上下文准备时间" },
          { name: "Tprefill", meaning: "输入预填充耗时", evidence: "输入长度" },
          { name: "Tfirst", meaning: "首个解码步耗时", evidence: "Tfirst 是首步解码时间" },
          { name: "Tcomplete", meaning: "端到端完成时间", evidence: "端到端完成时间" },
          { name: "N", meaning: "输出 token 总数", evidence: "N 是输出 token 总数" },
          { name: "TPOT", meaning: "首 token 后平均每个 token 的时间", evidence: "TPOT 是首 token 后平均每个新 token 的时间" },
          { name: "Texternal", meaning: "工具与传输等外部耗时", evidence: "工具与传输日志" }
        ]},
        { id: "inference-roofline", section: 2, formulaIndex: 1, symbols: [
          { name: "AI", meaning: "每字节数据搬运对应的浮点运算量", evidence: "AI 是每搬运一字节完成的浮点运算数" },
          { name: "FLOPs", meaning: "浮点运算次数", evidence: "每阶段 FLOPs" },
          { name: "BytesIO", meaning: "内存读写字节数", evidence: "内存读写字节" },
          { name: "Perfmax", meaning: "roofline 估算性能上限", evidence: "输出算术强度 AI 与 roofline 性能上限" },
          { name: "ComputePeak", meaning: "硬件峰值计算吞吐", evidence: "峰值算力" },
          { name: "Bandwidth", meaning: "硬件内存带宽", evidence: "内存带宽 Bandwidth" }
        ]},
        { id: "inference-kv-memory", section: 4, formulaIndex: 1, symbols: [
          { name: "MKV", meaning: "KV 缓存总内存", evidence: "输出缓存内存 MKV" },
          { name: "Nlayer", meaning: "模型层数", evidence: "层数 Nlayer" },
          { name: "NKVhead", meaning: "每层 KV 头数", evidence: "KV 头数 NKVhead" },
          { name: "d", meaning: "每个 KV 头的维度", evidence: "头维 d" },
          { name: "Ntoken", meaning: "每请求缓存 token 数", evidence: "token 数 Ntoken" },
          { name: "B", meaning: "并发请求数", evidence: "并发 B" },
          { name: "b", meaning: "每个元素占用字节", evidence: "元素字节 b" }
        ]},
        { id: "inference-speculative-yield", section: 8, formulaIndex: 1, symbols: [
          { name: "Edraft", meaning: "每轮期望确认的 token 数", evidence: "近似轮产出" },
          { name: "a", meaning: "逐 token 接受率", evidence: "逐 token 接受率 a" },
          { name: "k", meaning: "每轮草稿 token 数", evidence: "草稿长度 k" }
        ]}
      ],
      termReviews: [
        { term: "prefill", section: 1, evidence: "输入长度、输出长度" },
        { term: "roofline", section: 2, evidence: "roofline 性能上限" },
        { term: "连续批处理", section: 3, evidence: "连续批处理输入等待请求" },
        { term: "推测解码", section: 8, evidence: "推测解码输入草稿模型" }
      ],
      sectionContracts: [
        six(1, [
          ["推理阶段拆分把请求分成排队、prefill、decode 和外部耗时。","先把端到端时间拆开"],
          ["它解释长输入短回答与短输入长回答为何需不同优化。","为何需要不同优化"],
          ["输入阶段日志和长度，输出 TTFT、TPOT 与完成时间。","输出 TTFT、TPOT 和端到端完成时间"],
          ["先测排队和首 token，再累加后续 token 与外部耗时。","TTFT 是请求到首 token 的时间"],
          ["不同指标分别指向输入、解码、排队或外部瓶颈。","指标指向不同瓶颈"],
          ["单一 tokens/s 不能代表交互用户体验。","不能用单一 tokens/s 代表用户体验"]
        ]),
        six(2, [
          ["算术强度描述每搬运一字节数据所完成的计算量。","prefill 与 decode 的硬件性格不同"],
          ["它解释同一模型两阶段为何分别偏算力和偏带宽。","一个吃算力、一个吃带宽"],
          ["输入 FLOPs、字节、算力和带宽，输出 AI 与性能上限。","输出算术强度 AI 与 roofline 性能上限"],
          ["性能上限取峰值算力和 AI 乘带宽中的较小者。","上限取算力峰值与 AI×带宽中的较小者"],
          ["低 AI 更可能受带宽限制，高 AI 更可能受算力限制。","每搬运一字节完成的浮点运算数"],
          ["roofline 是定位直觉，不是具体内核的精确预测。","不是每个内核的精确耗时预测"]
        ]),
        six(3, [
          ["连续批处理在每个调度步动态移除完成序列并插入新请求。","连续批处理用动态调度填掉空洞"],
          ["它减少静态批中短序列结束后留下的计算空槽。","为什么 GPU 仍像在为它保留座位"],
          ["输入队列、容量和优先级，输出插入、移除、分块或抢占。","输出每个调度步的移除、插入、分块或抢占决定"],
          ["完成序列立即让位，新请求按容量和优先级进入。","完成序列立刻让位给新请求"],
          ["吞吐上升不意味着 p99 和公平性同时改善。","吞吐提高不代表尾延迟更好"],
          ["过载必须有准入、背压和租户公平约束。","必须有准入控制、背压和租户公平边界"]
        ]),
        six(4, [
          ["KV 缓存为每个活跃 token 在每层保存 K 和 V。","KV cache 是并发容量的隐藏预算"],
          ["它解释权重可放入显存但并发提高后仍会 OOM。","为什么并发一上来仍 OOM"],
          ["输入架构序列和并发规模，输出 KV 总内存。","输出缓存内存 MKV"],
          ["层、头、维度、token、并发和字节相乘并因 K/V 乘二。","K 与 V 各保存一次所以乘二"],
          ["估算值用于解释并发上限与显存不足。","估算解释 OOM 和并发上限"],
          ["分页只减碎片，量化或滑窗仍需质量回归。","PagedAttention 只减少碎片"]
        ]),
        six(5, [
          ["案例比较静态小批、激进连续批和分池分块三种调度。","优化前后为何平均更快但 p99 更差"],
          ["它解释吞吐翻倍时交互用户仍可能投诉。","交互用户为何投诉"],
          ["输入方案与延迟吞吐指标，输出是否满足交互 SLO。","输出是否满足交互 SLO 的选择"],
          ["先比较吞吐，再检查 TTFT 的中位数和尾部分位数。","先比较吞吐，再检查 p50 与 p99"],
          ["平均更快但 p99 变差说明长输入或组批阻塞尾部。","让 p99 失败"],
          ["案例结论只适用于给定负载，变化后必须重测。","负载变化必须重测"]
        ]),
        six(6, [
          ["FlashAttention 以 IO 感知分块精确计算同一注意力。","FlashAttention 减少 IO，不近似注意力结果"],
          ["它减少完整注意力中间矩阵反复往返 HBM。","softmax 还能算得精确吗"],
          ["输入相同 Q、K、V，输出相同结果和更少 HBM 往返。","输出数值精度范围内相同的注意力结果和更少 HBM 往返"],
          ["分块装入片上存储并在线维护 softmax 统计量。","通过分块和在线 softmax 改变计算顺序"],
          ["收益表示注意力 IO 降低，不代表所有服务瓶颈消失。","不代表 KV 容量、排队或工具延迟得到解决"],
          ["短序列或非注意力瓶颈场景可能没有收益。","短序列和非注意力瓶颈可能无收益"]
        ]),
        six(7, [
          ["量化用较低位宽表示权重、激活或 KV。","量化减少字节，但属于质量相关改动"],
          ["它在显存和带宽受限时减少数据占用与搬运。","为何既可能更快也可能更慢"],
          ["输入对象位宽硬件和任务，输出速度显存及质量差异。","输出低精度模型及显存、速度和质量差异"],
          ["低位宽节省存储带宽，但需要反量化和校准。","反量化与校准又增加开销"],
          ["只有硬件支持和瓶颈匹配时才可能获得净加速。","更快只在支持良好且瓶颈匹配时成立"],
          ["必须覆盖语言、长上下文、工具参数和高风险任务。","必须按语言、长上下文、工具参数和高风险任务回归"]
        ]),
        six(8, [
          ["推测解码让草稿模型先提 token，再由目标模型批量验证。","推测解码用并行验证减少串行步数"],
          ["它减少目标模型逐 token 串行前向的轮数。","大模型怎样既加速又保持目标分布"],
          ["输入草稿与目标模型、k 和 a，输出验证后的 token。","输出经目标模型验证后的 token"],
          ["草稿并行提出，目标批量验证并按规则接受或校正。","目标模型批量验证并按规则接受或校正"],
          ["近似产出随接受率和草稿长度提高，但还需扣除验证成本。","近似轮产出是 1+a+…+a^k"],
          ["低接受率或高验证成本会使推测解码变慢。","低接受率或高验证成本会变慢"]
        ]),
        six(9, [
          ["生产基准用真实负载联合验收性能、资源、质量和成本。","真实负载基准和质量门禁缺一不可"],
          ["它判断离线单请求加速能否迁移到生产环境。","怎样证明生产真的更好"],
          ["输入真实负载与故障，输出分位延迟吞吐资源质量成本。","输出延迟分位数、吞吐、资源、失败率、质量和每成功任务成本"],
          ["固定负载对照并覆盖稳态、突发、过载和节点故障。","覆盖稳态、过载和节点故障"],
          ["平均 tokens/s 提升不能证明尾延迟和任务质量改善。","只有平均 tokens/s 提升不能证明生产更好"],
          ["算法和低精度变化都必须经过独立质量门禁。","必须经过质量门禁"]
        ])
      ]
    },
    "context-compaction": {
      contractVersion: 2,
      examples: [{
        section: 7,
        evidence: {
          setup: "18k token 项目历史压进 4k 预算",
          rule: "真正可供历史使用的只剩1,500",
          steps: "状态、摘要、原文各 500 token",
          interpretation: "不是可永久替代原始日志的真相"
        }
      }],
      formulas: [
        { id: "compaction-utility", section: 4, formulaIndex: 1, symbols: [
          { name: "U", meaning: "压缩方案综合效用", evidence: "输出一个用于比较方案的综合效用" },
          { name: "Gtask", meaning: "后续任务成功收益", evidence: "后续任务收益" },
          { name: "λ", meaning: "token 成本惩罚权重", evidence: "λ 表示每单位 token 成本的惩罚" },
          { name: "Ctoken", meaning: "上下文 token 成本", evidence: "token 成本" },
          { name: "μ", meaning: "关键信息丢失惩罚权重", evidence: "μ 表示关键信息丢失的惩罚" },
          { name: "Lcritical", meaning: "关键信息损失量", evidence: "关键信息损失" }
        ]},
        { id: "compaction-budget", section: 7, formulaIndex: 1, symbols: [
          { name: "Bhistory", meaning: "可分配给历史内容的 token 预算", evidence: "Bhistory 是历史预算" },
          { name: "R", meaning: "压缩后历史长度占原历史长度的比例", evidence: "压缩率是装入历史与原历史之比" }
        ]},
        { id: "compaction-task-gap", section: 11, formulaIndex: 1, symbols: [
          { name: "Δtask", meaning: "全量与压缩上下文的任务成功率差", evidence: "输出任务成功差 Δtask" },
          { name: "success(full context)", meaning: "使用全量上下文的任务成功率", evidence: "success(full context) 是全量上下文成功率" },
          { name: "success(compacted context)", meaning: "使用压缩上下文的任务成功率", evidence: "success(compacted context) 是压缩上下文成功率" }
        ]}
      ],
      termReviews: [
        { term: "受保护状态", section: 3, evidence: "结构化状态输入目标、约束、权限" },
        { term: "递归摘要", section: 5, evidence: "递归摘要输入上一代摘要和新事件" },
        { term: "压缩回归", section: 11, evidence: "压缩回归输入同一原始历史" }
      ],
      sectionContracts: [
        six(1, [
          ["上下文压缩在预算内保留下一步决策所需的信息。","上下文压缩输入完整历史、当前任务和 token 预算"],
          ["它解决全量历史过长与最近截断会丢关键约束的冲突。","为什么不能只保最近消息"],
          ["输入历史、任务和预算，输出可支持决策的精简上下文。","输出仍足以支持下一步决策的精简上下文"],
          ["按任务价值而非消息时间选择和保留信息。","按任务价值而非消息时间选择信息"],
          ["变短只表示 token 更少，不表示关键事实完整。","不代表关键事实都保住"],
          ["目标、权限和验收条件不明时不得直接丢原文。","不得直接丢弃原文"]
        ]),
        six(2, [
          ["压缩可采用截断、摘要、字段抽取或外存检索。","四种压缩方式"],
          ["它区分不同方法各自可能丢失的信息。","不同手段丢失的信息有何不同"],
          ["输入类型和损失容忍度，输出一种或多种压缩方案。","输出截断、摘要、字段抽取或外存检索方案"],
          ["截断删除、摘要重写、抽取保字段、检索按需取原文。","截断按位置删除，摘要重新表述"],
          ["方法应按最不能承受的失败选择，而非按流畅度。","根据最不能承受的失败选择或组合"],
          ["四种方法有损方式不同，不能视为等价压缩。","不是把四者当成等价压缩"]
        ]),
        six(3, [
          ["结构化状态保存硬事实，叙事摘要保存可重建对话概述。","结构化状态与叙事分离"],
          ["它防止自由摘要改写目标、权限、进度和未决事项。","哪些内容不应交给自由摘要决定"],
          ["输入硬状态和叙事，输出版本化字段与可重建摘要。","输出可版本化字段"],
          ["字段按权限事件更新，摘要不能覆盖状态记录。","摘要不能覆盖状态"],
          ["来源可回查时，压缩文本才不是唯一事实源。","来源引用仍可回查"],
          ["无来源摘要不能单独承担事实、权限和验收依据。","不是唯一且不可验证的事实源"]
        ]),
        six(4, [
          ["压缩效用综合任务收益、token 成本和信息损失。","压缩率不是唯一指标"],
          ["它避免把 token 减少百分比误当成压缩质量。","token 减少 90% 是否就是好压缩"],
          ["输入收益成本损失和权重，输出方案综合效用。","输出一个用于比较方案的综合效用"],
          ["用 λ 和 μ 分别惩罚 token 成本与关键信息损失。","λ 表示每单位 token 成本的惩罚"],
          ["效用更高只在相同任务与权重口径下表示更好。","同一任务和权重口径下更好"],
          ["不同风险场景的效用数值不能直接横向比较。","不能跨风险场景直接比较"]
        ]),
        six(5, [
          ["递归摘要反复把上一代摘要与新事件重写成新摘要。","递归摘要输入上一代摘要和新事件"],
          ["它揭示多代重写如何累积遗漏、偏差和错误确定性。","递归摘要会漂移"],
          ["输入旧摘要和新事件，输出更短的新摘要。","输出更短的新摘要"],
          ["每次重写都可能放大上一代遗漏与措辞偏差。","每次重写都可能累积遗漏和措辞偏差"],
          ["与原始重建结果分歧说明摘要漂移而非事实改变。","说明摘要漂移，而不是原始事实改变"],
          ["高风险字段须无损保存并支持原始事件重建。","高风险字段必须无损保存"]
        ]),
        six(6, [
          ["压缩安全治理覆盖摘要、索引和缓存中的派生数据。","安全治理输入原文与摘要的数据分类"],
          ["它防止敏感数据残留和恶意指令被固化为长期规则。","摘要是否天然比原文更安全"],
          ["输入分类来源和删除请求，输出保留隔离审计删除动作。","输出保留、隔离、审计与删除动作"],
          ["压缩前后都检查作用域、来源、保留期与删除传播。","摘要可能继续保存敏感数据"],
          ["更短不代表更安全，摘要仍可能泄露或固化指令。","更短不等于更安全"],
          ["无可信来源的文本不能升级为系统权限。","不能升级为系统权限"]
        ]),
        six(7, [
          ["预算案例把十八千历史分配进四千 token 总窗口。","18k token 项目历史压进 4k 预算"],
          ["它演示怎样保验收条件并留下可回查原始证据。","既不丢验收条件，也保留足够原始证据"],
          ["输入总预算与预留，输出历史预算和三块五百 token 分配。","输出 1500 token 历史预算及状态、摘要、原文各 500 token 的分配"],
          ["先扣系统与回答预算，再在历史预算中分配三通道。","真正可供历史使用的只剩1,500"],
          ["八点三只表示长度比例，不能证明任务信息保真。","8.3% 只描述长度"],
          ["任务改变后必须围绕新问题重建摘要和检索。","任务改变时摘要和检索必须围绕新问题重建"]
        ]),
        six(8, [
          ["三通道分别保存硬状态、任务摘要和原文索引。","压缩器应输出状态、摘要和可回查证据三条通道"],
          ["它解决流畅摘要无法支撑长期代理证据与约束的问题。","为什么一段流畅摘要不足以支撑长期 Agent"],
          ["输入原始事件，输出状态、摘要和带权限的原文索引。","输出受保护状态、任务摘要和带权限的原文索引"],
          ["三路独立生成，并在当前任务组装上下文时合流。","随后按当前任务合流"],
          ["摘要只负责叙事，不能替代硬约束和证据回查。","一段流畅摘要无法替代三者"],
          ["预算不足时必须披露未装入上下文的证据。","必须明确哪些证据未装入"]
        ]),
        six(9, [
          ["受保护状态是带来源、版本和权限的数据库式记录。","受保护状态要像数据库记录，而不是散文"],
          ["它防止硬约束经多次摘要后被弱化或改写。","防止“不要改生产库”在第三次摘要后变成“谨慎修改”"],
          ["输入不可丢事项和来源，输出完整版本化状态记录。","输出带类型、值、写入者、时间、作用域、版本和状态的记录"],
          ["显式更新事件替换当前值，同时保留历史审计。","更新通过显式事件替换并保留审计历史"],
          ["未决状态不会因语言润色被误判为已经通过。","“未决”不会被润色成“已通过”"],
          ["只有授权主体可以改写目标、权限和硬约束。","只有授权主体能改写目标、权限和硬约束"]
        ]),
        six(10, [
          ["差异化压缩按代码、讨论、工具输出和文档采用不同策略。","差异化压缩：代码、对话和工具输出不能用同一摘要器"],
          ["它防止退出码、补丁或未采纳建议被叙事摘要歪曲。","哪一个更该逐字保留"],
          ["输入信息类型，输出补丁、决定、执行证据或检索索引。","输出与类型匹配的补丁记录、决定摘要、执行证据或检索索引"],
          ["先识别无损字段，再对其余叙事进行有损摘要。","先判断哪些字段必须逐字无损"],
          ["退出码、权限和测试结果不能被中心思想替代。","不能只保“中心思想”"],
          ["预算装不下的证据必须显式报告而非静默遗漏。","无法容纳的证据要显式报告缺失"]
        ]),
        six(11, [
          ["压缩回归让全量与压缩上下文完成同一组后续任务。","压缩回归输入同一原始历史"],
          ["它发现字面相似摘要仍会造成的行动和约束错误。","ROUGE 很高的摘要，为什么仍可能让 Agent 做错事"],
          ["输入两种上下文和任务集，输出成功差、违例与引用指标。","输出任务成功差 Δtask、约束违例、无源断言和引用命中"],
          ["固定任务分别运行全量和压缩版本并比较结果。","全量版与压缩版以及一组后续任务"],
          ["成功率差越大表示压缩造成的任务损失越严重。","差值越大表示压缩损失越严重"],
          ["模型、摘要提示或预算变化后必须重跑回归。","模型、提示或预算变化后必须重跑"]
        ]),
        six(13, [
          ["压缩触发与并发隔离用版本快照管理多分支上下文。","压缩触发与并发隔离"],
          ["它避免忙乱中改写状态以及并行分支互相覆盖。","两个并行子任务能共用同一摘要吗"],
          ["输入水位阶段事件和版本，输出快照、增量与合并结果。","输出压缩快照、分支增量及冲突合并结果"],
          ["里程碑建快照，分支同源派生并按来源规则合并。","各分支从同一版本派生并按来源合并"],
          ["最后完成只代表时间靠后，不代表有权覆盖其他分支。","最后完成不等于有权覆盖"],
          ["基础版本变化后旧分支必须重放或标记过期。","必须重放或标记过期"]
        ])
      ]
    },
    "prompt-caching": {
      contractVersion: 2,
      examples: [{
        section: 4,
        evidence: {
          setup: "系统规则 2k、工具 3k、共享政策 5k",
          rule: "按稳定性排序把大段共享内容放在前",
          steps: "0.7×10k=7k",
          interpretation: "真实注意力成本非线性，必须实测"
        }
      }],
      formulas: [
        {
          id: "prompt-cache-lcp",
          section: 3,
          formulaIndex: 1,
          symbols: [
            { name: "LCP", meaning: "最长共同 token 前缀长度", evidence: "最长共同前缀计算" },
            { name: "A", meaning: "第一条 token 序列", evidence: "两条 token 序列 A、B" },
            { name: "B", meaning: "第二条 token 序列", evidence: "两条 token 序列 A、B" },
            { name: "ℓ", meaning: "从开头连续相同的 token 数", evidence: "输出从首 token 起连续相同的长度 ℓ" }
          ]
        },
        {
          id: "prompt-cache-expected-saving",
          section: 4,
          formulaIndex: 1,
          symbols: [
            { name: "E[Nsaved]", meaning: "每请求期望避免处理的输入 token 数", evidence: "平均节省 7k token" },
            { name: "h", meaning: "缓存命中率", evidence: "h 是命中率" },
            { name: "L", meaning: "命中的 token 长度", evidence: "L 是命中的 token 长度" }
          ]
        },
        {
          id: "prompt-cache-memory",
          section: 6,
          formulaIndex: 1,
          symbols: [
            { name: "MKV", meaning: "KV 缓存总字节数", evidence: "输出 KV 字节数 MKV" },
            { name: "Nlayer", meaning: "模型层数", evidence: "层数 Nlayer" },
            { name: "NKVhead", meaning: "每层 KV 头数", evidence: "KV 头数 NKVhead" },
            { name: "d", meaning: "每个 KV 头的维度", evidence: "头维 d" },
            { name: "Ntoken", meaning: "缓存 token 数", evidence: "token 数 Ntoken" },
            { name: "b", meaning: "每个数值元素的字节数", evidence: "每元素字节 b" }
          ]
        }
      ],
      termReviews: [
        { term: "KV 状态", section: 1, evidence: "输出可供后续请求复用的中间 KV 状态" },
        { term: "最长共同前缀", section: 3, evidence: "最长共同前缀计算输入" },
        { term: "缓存命名空间", section: 7, evidence: "输出缓存命名空间、键和失效动作" }
      ],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "提示缓存复用不同请求共同输入前缀的中间 KV 状态。", evidence: "提示缓存输入模型配置和多个请求共享的精确 token 前缀" },
          problem: { answer: "它减少重复的输入预填充计算并降低首 token 延迟。", evidence: "GPU 为什么还要从头处理" },
          inputOutput: { answer: "输入模型配置和精确前缀，输出可复用的 KV 状态。", evidence: "输出可供后续请求复用的中间 KV 状态" },
          mechanism: { answer: "服务命中最长前缀后只对新后缀继续预填充。", evidence: "再只计算新后缀" },
          interpretation: { answer: "命中只表示省输入计算，不表示答案已缓存或正确。", evidence: "不表示答案被缓存或输出一定正确" },
          boundary: { answer: "模型、分词、位置配置和安全域必须一致。", evidence: "只适用于模型、tokenizer、位置配置和安全域一致" }
        },
        {
          section: 2,
          definition: { answer: "四类缓存分别复用生成历史、输入状态、答案或工具数据。", evidence: "三种缓存不要混淆" },
          problem: { answer: "它避免用同一命中率混报不同收益和正确性风险。", evidence: "分别复用了什么" },
          inputOutput: { answer: "输入保存对象、范围和跳过阶段，输出缓存机制类别。", evidence: "输出请求内 KV、跨请求前缀、回答或应用数据缓存之一" },
          mechanism: { answer: "根据复用对象判断缓存跳过的是解码、预填充还是整个生成。", evidence: "看它复用当前生成历史、共同输入状态、最终答案还是工具结果" },
          interpretation: { answer: "不同缓存的命中具有完全不同的性能和内容含义。", evidence: "就能解释收益与正确性风险" },
          boundary: { answer: "这些机制不得共享一个未经拆分的命中率指标。", evidence: "不能共享一个命中率口径" }
        },
        {
          section: 3,
          definition: { answer: "LCP 是两条 token 序列从开头连续相同的最大长度。", evidence: "输出从首 token 起连续相同的长度 ℓ" },
          problem: { answer: "它解释相同文档因顺序变化为何仍可能零命中。", evidence: "顺序不同为什么仍可能命中为零" },
          inputOutput: { answer: "输入 token 序列 A 和 B，输出连续共同前缀长度。", evidence: "输入两条 token 序列 A、B" },
          mechanism: { answer: "逐 token 比较并在第一次分叉处停止复用。", evidence: "第一次分叉就停止复用" },
          interpretation: { answer: "LCP 长表示计算状态可复用，不代表语义相近。", evidence: "不代表两份提示语义更相近" },
          boundary: { answer: "影响 token、位置或模型状态的变化都会终止命中。", evidence: "都会终止命中" }
        },
        {
          section: 4,
          definition: { answer: "运行案例估算十二千 token 请求的命中长度与净延迟收益。", evidence: "12k 输入里究竟省了多少" },
          problem: { answer: "它展示稳定片段排序后如何计算平均节省量。", evidence: "怎样布局并估算" },
          inputOutput: { answer: "输入片段、命中率和延迟，输出命中长度、token 与延迟节省。", evidence: "输出 10k 命中长度、平均节省 7k token 及粗略延迟收益" },
          mechanism: { answer: "先稳定排序，再计算 h 乘 L 并扣除查找搬运。", evidence: "再用 h×L 求平均避免量并扣除查找搬运" },
          interpretation: { answer: "四百四十和三百零八毫秒只是给定假设下的估算。", evidence: "是给定假设下的估算" },
          boundary: { answer: "实际注意力成本非线性，因此上线收益必须实测。", evidence: "真实注意力成本必须实测" }
        },
        {
          section: 5,
          definition: { answer: "缓存友好布局把稳定公共内容放前、动态私有内容放后。", evidence: "提示布局与规范化决定命中" },
          problem: { answer: "它提高前缀复用而不破坏提示语义和权限。", evidence: "既提高复用，又不破坏语义和权限" },
          inputOutput: { answer: "输入稳定性、权限和语义顺序，输出确定性提示序列。", evidence: "输出稳定公共内容在前、动态私有内容在后的序列" },
          mechanism: { answer: "固定序列化和排序，使相同公共内容产生精确 token 前缀。", evidence: "确定性序列化提高精确前缀复用" },
          interpretation: { answer: "高命中只有在规则含义和隔离不变时才有价值。", evidence: "保持安全规则含义和租户隔离" },
          boundary: { answer: "不得为命中率移动或共享本应私有的内容。", evidence: "不能为提高命中率移动或共享本应私有的内容" }
        },
        {
          section: 6,
          definition: { answer: "KV 容量由层数、头数、头维、token、精度和并发共同决定。", evidence: "KV 容量随层、token 和并发增长" },
          problem: { answer: "它解释长前缀为何不能无限常驻昂贵的 GPU 显存。", evidence: "为什么 10k token 前缀不能无限常驻 GPU" },
          inputOutput: { answer: "输入架构与序列规模，输出 KV 字节数和存储选择。", evidence: "输出 KV 字节数 MKV 与存储层级选择" },
          mechanism: { answer: "每层每头为每个 token 保存 K 和 V，因此各维度相乘并乘二。", evidence: "K 与 V 各保存一份，所以乘二" },
          interpretation: { answer: "估算占用用于权衡 GPU 驻留、数据搬运和重新计算。", evidence: "用于比较 GPU 驻留、搬运与重算" },
          boundary: { answer: "不同架构、并行和量化会改变真实内存数值。", evidence: "架构、并行和量化不同会改变实际值" }
        },
        {
          section: 7,
          definition: { answer: "缓存失效用完整模型语义版本隔离不兼容的 KV 状态。", evidence: "缓存键和失效必须包含模型语义版本" },
          problem: { answer: "它防止换适配器或位置配置后静默复用错误状态。", evidence: "换了 LoRA 或 RoPE 配置还能复用吗" },
          inputOutput: { answer: "输入模型及租户版本，输出命名空间、缓存键和失效动作。", evidence: "输出缓存命名空间、键和失效动作" },
          mechanism: { answer: "任一语义配置变化即隔离缓存，并抽样重算检查污染。", evidence: "命中后抽样重算可发现污染" },
          interpretation: { answer: "相同文本在不同模型语义版本下也可能产生不同 KV。", evidence: "同一文本也可能产生不同 KV" },
          boundary: { answer: "版本字段不完整时必须拒绝复用旧状态。", evidence: "版本字段不完整时必须拒绝复用" }
        },
        {
          section: 8,
          definition: { answer: "KV 是输入派生的敏感状态，必须按租户和数据域治理。", evidence: "KV 虽不是可读原文，仍是输入的派生数据" },
          problem: { answer: "它防止跨租户泄露、命中侧信道和未经授权的状态复用。", evidence: "为什么仍属于敏感数据状态" },
          inputOutput: { answer: "输入数据分类、租户和保留规则，输出隔离、加密、审计和删除策略。", evidence: "输出隔离域、加密、审计与删除策略" },
          mechanism: { answer: "按安全域分区，并控制访问、保留和删除传播。", evidence: "命中时间可能泄露前缀是否存在" },
          interpretation: { answer: "不可读并不等于不敏感，时延本身也可能泄露存在性。", evidence: "仍是输入的派生数据" },
          boundary: { answer: "跨租户只共享真正公共、同权限且同版本的内容。", evidence: "只限真正公共且权限一致的版本化内容" }
        },
        {
          section: 9,
          definition: { answer: "缓存评测衡量节省计算减去查找、搬运、驻留和排队后的净收益。", evidence: "评测要证明净收益而非命中率" },
          problem: { answer: "它解释命中率翻倍但首 token 延迟不改善的现象。", evidence: "为什么 TTFT 可能没有改善" },
          inputOutput: { answer: "输入请求级性能、资源和质量，输出分切片净收益。", evidence: "输出按租户、长度、并发切片的净收益" },
          mechanism: { answer: "固定语义和负载做 A/B，并注入版本、冷启动和雪崩故障。", evidence: "测试错版本、冷启动和雪崩" },
          interpretation: { answer: "TTFT 不降说明命中太短或额外开销抵消了收益。", evidence: "查找、搬运、排队抵消了收益" },
          boundary: { answer: "命中率不能单独作为缓存上线或扩容依据。", evidence: "命中率升高但 TTFT 不降" }
        }
      ]
    },
    "prefilling": {
      contractVersion: 2,
      examples: [{
        section: 4,
        evidence: {
          setup: "无前缀：回答从零开始",
          rule: "预填 “{”：模型只预测其后",
          steps: "“action” .60",
          interpretation: "两个分布的事件空间不同"
        }
      }],
      formulas: [{
        id: "prefilling-conditional-sequence",
        section: 2,
        formulaIndex: 1,
        symbols: [
          { name: "P", meaning: "条件概率", evidence: "输出下一 token 的概率分布" },
          { name: "y", meaning: "完整续写，y 下标 t 是第 t 个续写 token", evidence: "最终续写" },
          { name: "x", meaning: "用户与系统上下文", evidence: "上下文 x" },
          { name: "p", meaning: "已提供的回答前缀", evidence: "前缀 p" },
          { name: "t", meaning: "自回归生成位置", evidence: "先前续写" }
        ]
      }],
      termReviews: [
        { term: "响应预填充", section: 1, evidence: "响应预填充输入用户/系统上下文" },
        { term: "锚定", section: 7, evidence: "锚定测试输入同一问题" },
        { term: "约束解码", section: 8, evidence: "硬结构应优先使用约束解码" }
      ],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "响应预填充把已确认的 assistant 文本作为续写前缀。", evidence: "响应预填充输入用户/系统上下文" },
          problem: { answer: "它用最短的已知开头减少寒暄或格式偏离。", evidence: "模型接下来看到的任务发生了什么" },
          inputOutput: { answer: "输入上下文和前缀，输出前缀之后的 token 序列。", evidence: "输出从该前缀之后继续的 token 序列" },
          mechanism: { answer: "前缀进入条件上下文，模型只预测它后面的内容。", evidence: "前缀被放进条件上下文" },
          interpretation: { answer: "续写连贯不代表前缀中的事实已经得到证明。", evidence: "不证明前缀中的事实正确" },
          boundary: { answer: "只能预填能够独立保证正确的最小骨架。", evidence: "只应预填可独立保证正确的最小骨架" }
        },
        {
          section: 2,
          definition: { answer: "预填只改变当前条件概率，不修改模型参数。", evidence: "它改变条件，不改变参数" },
          problem: { answer: "它解释同一提示加入回答前缀后为何分布变化。", evidence: "概率分布为什么会变化" },
          inputOutput: { answer: "输入 x、p 和先前续写，输出下一 token 分布及最终续写。", evidence: "输出下一 token 的概率分布与最终续写" },
          mechanism: { answer: "模型每步读取前缀，所以事件空间和条件概率随之改变。", evidence: "注意力每步都读取 p" },
          interpretation: { answer: "更具体的前缀减少路径，却可能把续写锚在错误区域。", evidence: "把续写锚在错误区域" },
          boundary: { answer: "概率偏置不能保证完整结构、事实或安全。", evidence: "概率偏置不是硬保证" }
        },
        {
          section: 3,
          definition: { answer: "响应预填、输入 prefill、提示缓存和约束解码是四种不同机制。", evidence: "三种相似名称必须分开" },
          problem: { answer: "它避免把内容控制、输入计算、缓存和硬约束混为一谈。", evidence: "到底各是什么" },
          inputOutput: { answer: "输入功能及作用对象，输出四种机制中的一种分类。", evidence: "输出“响应前缀、输入计算、缓存复用或硬约束”中的一种分类" },
          mechanism: { answer: "按处理对象和是否改变内容条件两个维度进行判断。", evidence: "再判断它改变内容条件还是只减少计算" },
          interpretation: { answer: "相似名称并不表示功能语义相同或接口能够互换。", evidence: "名称相似不能推出语义或接口兼容" },
          boundary: { answer: "最终行为必须以具体服务文档和契约测试为准。", evidence: "实际行为仍以服务文档和契约测试为准" }
        },
        {
          section: 4,
          definition: { answer: "运行案例比较空前缀与左花括号前缀的首步分布。", evidence: "一个字符怎样重新分配首步概率" },
          problem: { answer: "它澄清两个不同生成位置的概率不能直接相减。", evidence: "预填 { 后会怎样" },
          inputOutput: { answer: "输入两种前缀条件和候选，输出两个位置的分布及结构指标。", evidence: "输出两个不同位置的概率分布和完整结构指标" },
          mechanism: { answer: "左花括号成为上下文后，模型只预测它之后的 token。", evidence: "模型只预测其后" },
          interpretation: { answer: "点二五和点六零不是同一事件，不能称为概率提升。", evidence: "不是同一事件，不能说概率" },
          boundary: { answer: "案例只能说明结构变化，不能证明事实正确率提高。", evidence: "要解释的是完整输出的结构、事实与失败类型" }
        },
        {
          section: 5,
          definition: { answer: "低风险预填固定中性开场，高风险预填会替模型注入结论。", evidence: "适合固定开场，不适合替模型做结论" },
          problem: { answer: "它帮助判断哪些文本可预填，哪些必须由权威系统确定。", evidence: "哪些已经偷偷注入答案" },
          inputOutput: { answer: "输入候选文本、证据和风险，输出中性骨架或拒绝预填。", evidence: "输出中性骨架或“不使用预填”的决定" },
          mechanism: { answer: "只固定结构，结论和外部状态交由权威系统确认。", evidence: "必须由权威系统确认" },
          interpretation: { answer: "固定未知事实会把格式引导变成未经授权的业务决定。", evidence: "前缀越长，越可能锚定未知事实" },
          boundary: { answer: "身份、金额、引文和工具状态不可凭模型预填。", evidence: "结论、身份、金额、引文和工具状态" }
        },
        {
          section: 6,
          definition: { answer: "API 契约决定 assistant 前缀如何被接收、返回和计费。", evidence: "API 模板、拼接与停止规则会制造隐藏错误" },
          problem: { answer: "它避免前缀被拒绝、回显、重复拼接或错误截断。", evidence: "为什么有些服务不允许最后一条 assistant 消息非空" },
          inputOutput: { answer: "输入服务能力、前缀和流式规则，输出一份正确拼接的结果。", evidence: "输出正确拼接的一份完整结果" },
          mechanism: { answer: "服务解释前缀语义，客户端按真实契约拼接、解码和停止。", evidence: "客户端再按契约拼接、解码和停止" },
          interpretation: { answer: "回显或重复开头表示客户端对服务契约理解错误。", evidence: "回显或重复开头说明契约理解有误" },
          boundary: { answer: "不完整转义、Unicode 或未经实测的接口不能直接上线。", evidence: "不适合直接上线" }
        },
        {
          section: 7,
          definition: { answer: "锚定是已有结论前缀迫使后续理由围绕它保持连贯。", evidence: "错误前缀会造成锚定和“合理化”" },
          problem: { answer: "它揭示强迫答案以是开头为何会诱发支持性编造。", evidence: "为什么强迫答案以“是”开头" },
          inputOutput: { answer: "输入空、是、否三种前缀，输出结论和证据的变化。", evidence: "输出结论变化和证据变化" },
          mechanism: { answer: "模型按语言连贯性续写既有开头并搜索相容理由。", evidence: "模型按连贯性续写已有开头" },
          interpretation: { answer: "理由随前缀翻转说明格式替代了证据。", evidence: "格式正在替代证据" },
          boundary: { answer: "高风险任务只用中性骨架且必须单独进行红队测试。", evidence: "高风险任务只能使用中性骨架" }
        },
        {
          section: 8,
          definition: { answer: "业务验证在完整输出后检查结构、事实、权限和副作用。", evidence: "预填不能替代完整约束和业务验证" },
          problem: { answer: "它防止合法 JSON 开头被误当成可信且获准的动作。", evidence: "仍要经过哪些门" },
          inputOutput: { answer: "输入输出、schema、权威数据和权限，输出接受、拒绝或询问。", evidence: "输出可接受、拒绝或重新询问" },
          mechanism: { answer: "系统依次检查完整性、结构、事实、权限和幂等提交。", evidence: "依次检查完整性、结构、字段事实、实体权限和幂等提交" },
          interpretation: { answer: "JSON 可解析只代表形式成立，不代表内容真实或动作获准。", evidence: "不说明事实或动作获准" },
          boundary: { answer: "硬结构用约束解码，预填只能作为兼容或体验优化。", evidence: "预填只作兼容或体验优化" }
        },
        {
          section: 9,
          definition: { answer: "配对评测在相同样本上比较空前缀和候选前缀。", evidence: "评测要和无预填基线配对" },
          problem: { answer: "它发现格式改善背后可能出现的事实、安全和拒答退化。", evidence: "怎样发现事实质量、拒答和安全被前缀伤害" },
          inputOutput: { answer: "输入两组同样本结果，输出质量、风险、延迟和成本差异。", evidence: "输出格式、事实、拒答、安全、延迟和成本差异" },
          mechanism: { answer: "逐切片比较，并注入断流、回显及接口升级等故障。", evidence: "注入断流、回显和接口升级故障" },
          interpretation: { answer: "只有格式改善且内容与风险不退化才可采用。", evidence: "只有格式改善且内容与风险不退化才可采用" },
          boundary: { answer: "模型、接口或模板版本变化后必须重新评测。", evidence: "模型、API 或模板版本变化后必须重新评测" }
        }
      ]
    },
    "decision-tree": {
      contractVersion: 2,
      examples: [{
        section: 7,
        evidence: {
          setup: "六个样本标签",
          rule: "按金额阈值切分",
          steps: "父节点退3、留3",
          interpretation: "选择最大增益",
        },
      }],
      formulas: [
        {
          id: "tree-split-gain",
          section: 2,
          formulaIndex: 1,
          symbols: [
            { name: "Gain", meaning: "候选切分带来的加权不纯度下降", evidence: "Gain 是不纯度下降" },
            { name: "I", meaning: "节点目标分布的不纯度函数", evidence: "不纯度 I 衡量" },
            { name: "parent", meaning: "执行候选切分前的父节点", evidence: "父节点分成左、右子节点" },
            { name: "L", meaning: "候选切分得到的左子节点", evidence: "左右节点不纯度" },
            { name: "R", meaning: "候选切分得到的右子节点", evidence: "左右节点不纯度" },
            { name: "n", meaning: "父节点中的样本总数", evidence: "n 是父节点样本数" },
            { name: "nL", meaning: "左子节点中的样本数", evidence: "nL 、 nR 是左右样本数" },
            { name: "nR", meaning: "右子节点中的样本数", evidence: "nL 、 nR 是左右样本数" },
          ],
        },
        {
          id: "tree-gini-children",
          section: 7,
          formulaIndex: 1,
          symbols: [
            { name: "Gini", meaning: "节点类别比例计算出的基尼不纯度", evidence: "基尼不纯度" },
            { name: "L", meaning: "阈值左侧的子节点", evidence: "左侧两笔" },
            { name: "R", meaning: "阈值右侧的子节点", evidence: "右侧四笔" },
          ],
        },
        {
          id: "tree-gini-gain-example",
          section: 7,
          formulaIndex: 2,
          symbols: [
            { name: "Gain", meaning: "父节点减去加权子节点后的不纯度下降", evidence: "选择最大增益" },
          ],
        },
        {
          id: "tree-pruning-objective",
          section: 9,
          formulaIndex: 1,
          symbols: [
            { name: "R", meaning: "树或子树在训练数据上的风险", evidence: "代价复杂度剪枝" },
            { name: "α", meaning: "每增加一个叶子的复杂度惩罚强度", evidence: "α提高会偏好更少叶" },
            { name: "T", meaning: "正在比较的候选树或子树", evidence: "再选择子树" },
            { name: "leaves", meaning: "候选树包含的叶节点集合", evidence: "控制的是叶子自由度" },
          ],
        },
        {
          id: "forest-mean-variance",
          section: 12,
          formulaIndex: 1,
          symbols: [
            { name: "Var", meaning: "多棵树平均预测的方差", evidence: "平均的方差近似为" },
            { name: "ρ", meaning: "任意两棵树预测误差的相关系数", evidence: "两树误差相关ρ" },
            { name: "σ", meaning: "单棵树预测误差的标准差", evidence: "每棵树方差为σ²" },
            { name: "B", meaning: "随机森林中的树数量", evidence: "B棵树平均" },
          ],
        },
        {
          id: "boosting-functional-gradient",
          section: 13,
          formulaIndex: 1,
          symbols: [
            { name: "r", meaning: "第 m 轮样本 i 的负梯度纠错目标", evidence: "负梯度等于" },
            { name: "i", meaning: "训练样本编号", evidence: "i 是样本编号" },
            { name: "L", meaning: "用于计算负梯度的训练损失", evidence: "平方损失" },
            { name: "y", meaning: "训练样本的真实目标", evidence: "等于 y−F" },
            { name: "F", meaning: "当前轮次的集成预测函数", evidence: "Fₘ₋₁ 是上一轮集成预测函数" },
            { name: "x", meaning: "输入到集成模型的样本特征", evidence: "拟合概率尺度上的梯度" },
            { name: "η", meaning: "新树加入集成时的学习率", evidence: "学习率η小" },
            { name: "h", meaning: "第 m 轮新训练的弱树", evidence: "新树拟合残差" },
          ],
        },
      ],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "决策树由条件节点与叶子组成，把输入逐步路由到预测结果。", evidence: "决策树 是由条件节点和叶子组成的预测模型" },
          problem: { answer: "它用一串可读 if/else 规则组合复杂非线性决策边界。", evidence: "怎样把复杂边界变成一串 if/else" },
          inputOutput: { answer: "输入一行特征，分类叶输出类别概率，回归叶输出数值均值。", evidence: "输入是一行特征" },
          mechanism: { answer: "每个节点选择特征阈值分组，再对子节点递归重复直到停止。", evidence: "对子节点重复同一过程" },
          interpretation: { answer: "单条路径说明当前模型执行过的条件规则，不等于现实因果理由。", evidence: "不等于因果理由" },
          boundary: { answer: "轴对齐树表示旋转或平滑边界可能需要很多层，结构也可能不稳定。", evidence: "可能需要很多层" },
        },
        {
          section: 2,
          definition: { answer: "不纯度衡量节点目标混杂程度，增益衡量切分后的加权下降。", evidence: "不纯度 I 衡量一个节点中的目标有多混杂" },
          problem: { answer: "它为不同特征和阈值候选提供统一的分裂比较标准。", evidence: "怎样比较候选分裂" },
          inputOutput: { answer: "输入父节点及左右候选样本，输出按样本数加权的不纯度增益。", evidence: "把父节点分成左、右子节点" },
          mechanism: { answer: "父不纯度减去左右子节点按样本比例加权的不纯度。", evidence: "应按两边样本数加权" },
          interpretation: { answer: "增益越大表示切分后子节点总体更同质，但只代表当前节点。", evidence: "让加权子节点更同质" },
          boundary: { answer: "贪心不保证全局最优，高基数特征会因候选多获得虚高增益。", evidence: "高基数特征还可能" },
        },
        {
          section: 3,
          definition: { answer: "单树过拟合是叶子利用训练噪声和偶然字段获得低训练误差。", evidence: "利用噪声、ID、缺失模式等偶然细节" },
          problem: { answer: "它解释树长到每叶一个样本时为何未知数据和结构稳定性变差。", evidence: "树一直长到每片叶一个样本" },
          inputOutput: { answer: "输入训练样本，输出切分规则和叶预测；过深时叶由极少样本决定。", evidence: "输出是一组切分规则和叶子预测" },
          mechanism: { answer: "持续分裂扩大自由度，使模型把偶然细节当作稳定切分条件。", evidence: "不断分裂到叶子只剩极少样本" },
          interpretation: { answer: "训练满分、验证差、极端叶概率和重采样结构变化都是风险信号。", evidence: "训练近满分、验证明显较差" },
          boundary: { answer: "剪枝过强会欠拟合，且无法修复来自数据泄漏的证据污染。", evidence: "也不能修复污染的证据" },
        },
        {
          section: 4,
          definition: { answer: "随机森林是对 bootstrap 样本训练多棵随机特征树并聚合的 bagging。", evidence: "随机森林 是并行训练许多决策树" },
          problem: { answer: "它降低单树对训练样本扰动敏感所产生的高方差。", evidence: "很多高方差树平均为何更稳" },
          inputOutput: { answer: "输入同一训练集，输出分类投票或回归平均的集成预测。", evidence: "输出时分类投票、回归取平均" },
          mechanism: { answer: "样本与特征随机化降低树间相关，平均抵消不相关误差。", evidence: "两者共同降低相关性" },
          interpretation: { answer: "收益取决于树误差相关程度，可结合袋外估计和独立验证判断。", evidence: "结果应看独立验证、袋外估计" },
          boundary: { answer: "强泄漏特征会让所有树同错；森林还增加内存延迟并弱化单路径解释。", evidence: "多加树也不会解决问题" },
        },
        {
          section: 5,
          definition: { answer: "梯度提升按顺序训练弱树，每轮拟合当前损失的负梯度。", evidence: "梯度提升 按顺序增加弱树" },
          problem: { answer: "它让后续树专门纠正已有集成尚未解决的预测错误。", evidence: "后面的树在学什么" },
          inputOutput: { answer: "输入样本、当前预测和损失，输出加入新树后的集成预测。", evidence: "输入是样本、当前集成预测与损失函数" },
          mechanism: { answer: "计算负梯度作为纠错目标，新树拟合后按学习率加入模型。", evidence: "再乘学习率加入已有模型" },
          interpretation: { answer: "平方损失时负梯度等于普通残差，其他损失不一定。", evidence: "不一定是普通数值残差" },
          boundary: { answer: "树深、轮数或学习率过大会追噪声，早停验证必须保持时间实体独立。", evidence: "都会追逐噪声" },
        },
        {
          section: 6,
          definition: { answer: "树的数据治理包括特征可用时点、缺失语义、编码和切分独立性。", evidence: "输入仍必须满足预测时可获得" },
          problem: { answer: "它说明树无需数值标准化并不代表无需可靠数据准备。", evidence: "是否意味着数据准备不重要" },
          inputOutput: { answer: "输入治理后的表格特征，输出预测及不同口径的模型依赖解释。", evidence: "训练输出的特征重要度" },
          mechanism: { answer: "树会迅速利用泄漏、ID、缺失或高基数字段进行切分。", evidence: "都可能被树迅速利用" },
          interpretation: { answer: "不纯度、置换和 SHAP 回答不同预测依赖问题，都不等于因果。", evidence: "三者都描述模型依赖" },
          boundary: { answer: "类别或缺失漂移会改变路由路径，即使模型仍能输出也可能失效。", evidence: "路径含义可能已经失效" },
        },
        {
          section: 7,
          definition: { answer: "该例计算一个金额阈值使父节点基尼不纯度下降多少。", evidence: "一个阈值让基尼不纯度下降多少" },
          problem: { answer: "它展示候选分裂如何由左右标签构成转换为增益数值。", evidence: "按金额阈值切分是否值得" },
          inputOutput: { answer: "输入六个标签和候选阈值，输出父、左右 Gini 与增益。", evidence: "六个样本标签" },
          mechanism: { answer: "分别算节点类别比例的 Gini，再按左右样本比例加权并从父值扣除。", evidence: "Gain=0.5" },
          interpretation: { answer: "增益 0.25 表示该切分使加权不纯度下降四分之一。", evidence: "树会比较全部合法特征/阈值并选择最大增益" },
          boundary: { answer: "高基数 ID 也可产生虚高增益，仍须最小叶约束与防泄漏。", evidence: "高基数ID几乎能逐个隔离样本" },
        },
        {
          section: 8,
          definition: { answer: "该图把多个单特征阈值组合为矩形叶区和阶梯状边界。", evidence: "轴对齐切分组合成阶梯边界" },
          problem: { answer: "它解释每个节点规则简单时整棵树为何仍能表达非线性。", evidence: "整棵树为何能表示非线性" },
          inputOutput: { answer: "输入二维特征点，输出由金额与次数阈值划分的叶预测区域。", evidence: "金额 ≤ 500" },
          mechanism: { answer: "先沿一个坐标轴切分，再在子区域沿另一轴继续切分。", evidence: "多次轴对齐切分形成矩形叶区" },
          interpretation: { answer: "每个矩形区域对应一条树路径及其叶子预测。", evidence: "单个规则线性且可读" },
          boundary: { answer: "斜向或平滑边界可能需要大量矩形和更深的树近似。", evidence: "旋转边界可能需要很多层" },
        },
        {
          section: 9,
          definition: { answer: "预剪枝提前停止分裂，后剪枝先长树再按复杂度选择子树。", evidence: "预剪枝用max_depth" },
          problem: { answer: "它控制叶子自由度并平衡先发现组合切分与防止过拟合。", evidence: "控制的是叶子自由度" },
          inputOutput: { answer: "输入大树、训练风险和 α，输出带叶数惩罚的候选子树。", evidence: "代价复杂度剪枝先长大树，再选择子树" },
          mechanism: { answer: "代价复杂度目标把树风险与 α 乘叶子数相加，α 大偏好小树。", evidence: "α提高会偏好更少叶" },
          interpretation: { answer: "训练满分验证差支持叶过小，概率极端支持叶频率方差高。", evidence: "训练满分、验证差" },
          boundary: { answer: "剪枝路径须训练折生成、验证选 α、测试最终评估，不能复用测试。", evidence: "验证选择α，再在测试集评估" },
        },
        {
          section: 10,
          definition: { answer: "树的数据边界规定缺失、类别编码和时间字段在预测时如何获得处理。", evidence: "决定真实可靠性" },
          problem: { answer: "它防止数据管道把未来、标签或实体代理泄漏给模型。", evidence: "为什么数据管道仍可能毁掉模型" },
          inputOutput: { answer: "输入含缺失与类别的时间数据，输出经训练折处理的可部署特征。", evidence: "可显式缺失分支" },
          mechanism: { answer: "在训练折内插补编码、按时间切分，并审计字段可用时点。", evidence: "时间数据必须按发生时间切分" },
          interpretation: { answer: "目标打乱仍高分或时间外骤降提示泄漏与不稳定代理。", evidence: "打乱目标检测、时间外验证" },
          boundary: { answer: "无需标准化不等于无需治理，缺失和类别漂移仍会改变路径。", evidence: "无需标准化”不等于“无需治理" },
        },
        {
          section: 12,
          definition: { answer: "随机森林平均方差由树方差、树间误差相关和树数共同决定。", evidence: "靠降低树间相关性来降方差" },
          problem: { answer: "它解释简单复制相同树为何无法持续获得平均降方差收益。", evidence: "只是多训练几棵相同树" },
          inputOutput: { answer: "输入单树方差 σ²、相关 ρ 和树数 B，输出平均预测方差近似。", evidence: "若每棵树方差为σ²" },
          mechanism: { answer: "增加 B 只消除不相关误差，bootstrap 与随机特征负责降低 ρ。", evidence: "B增大只消除不相关部分" },
          interpretation: { answer: "ρ 高时树数收益快速饱和，降低相关性比单纯加树更关键。", evidence: "ρ高，收益很快饱和" },
          boundary: { answer: "时间或群组数据不能随意 bootstrap，树数还会增加内存延迟。", evidence: "不能随意bootstrap" },
        },
        {
          section: 13,
          definition: { answer: "梯度提升是在函数空间沿损失负梯度逐轮加入新树。", evidence: "沿负梯度小步前进" },
          problem: { answer: "它解释拟合残差为何只是平方损失下负梯度的一种特例。", evidence: "拟合残差”只是一个特例" },
          inputOutput: { answer: "输入当前函数、样本损失梯度和学习率，输出加入 hₘ 后的新函数。", evidence: "Fₘ=Fₘ₋₁" },
          mechanism: { answer: "新树拟合每个样本的负梯度，再按 η 加到上一轮集成。", evidence: "新树拟合残差" },
          interpretation: { answer: "树深控制交互，η 控制单轮修正，轮数控制累计拟合程度。", evidence: "树深控制交互阶数" },
          boundary: { answer: "早停必须使用隔离验证集，测试集不能参与轮数和配方选择。", evidence: "测试集不能兼作早停监控" },
        },
        {
          section: 14,
          definition: { answer: "路径解释描述当前模型对当前输入执行的规则序列。", evidence: "路径只描述模型在当前输入上的执行规则" },
          problem: { answer: "它避免把一个阈值路径误写成稳定、唯一或因果的真实原因。", evidence: "是完整原因吗" },
          inputOutput: { answer: "输入模型版本和样本，输出路径、贡献、敏感性及替代解释证据。", evidence: "同时给预测版本、输入值" },
          mechanism: { answer: "沿树记录条件，同时比较相关替代特征和相邻阈值扰动。", evidence: "相关特征可能互相替代" },
          interpretation: { answer: "SHAP、置换重要度和路径解释口径不同，均只描述模型依赖。", evidence: "回答的问题不同" },
          boundary: { answer: "解释不是因果结论，还应提供缺失处理、申诉规则与代理变量风险。", evidence: "也都不是因果结论" },
        },
      ],
    },

    "curse-of-dimensionality": {
      contractVersion: 2,
      examples: [{
        section: 7,
        evidence: {
          setup: "单位超立方体每轴切10格",
          rule: "10ᵈ单元",
          steps: "d=5需要10⁵=100,000格",
          interpretation: "展示局部覆盖所需数据为何指数增长",
        },
      }],
      termReviews: [
        {
          section: 1,
          reviewedAt: "2026-07-26",
          terms: [
            { name: "高维", meaning: "由很多坐标轴共同描述的输入空间", purpose: "指出覆盖成本随坐标轴数增长的场景", definitionEvidence: "高维空间的第一个困难", purposeEvidence: "每增加一维，单元数再乘 m" },
            { name: "密度估计", meaning: "根据邻近样本数量估计数据在空间中的集中程度", purpose: "判断新点常见、稀少或异常", definitionEvidence: "固定样本被摊进越来越多单元", purposeEvidence: "近邻、直方图和密度估计便不稳定" },
          ],
        },
        {
          section: 6,
          reviewedAt: "2026-07-26",
          terms: [
            { name: "降维", meaning: "把高维样本转换为更少坐标的表示", purpose: "降低覆盖、存储或计算负担", definitionEvidence: "降维 是把高维样本转换为更少坐标的表示", purposeEvidence: "降低覆盖、存储或估计负担" },
            { name: "PCA", meaning: "保留较大线性方差的投影方法", purpose: "利用近似低维线性结构压缩数据", definitionEvidence: "PCA 输出保留大方差的线性坐标", purposeEvidence: "数据近似线性子空间可用 PCA" },
            { name: "线性子空间", meaning: "由少数线性方向张成的数据结构", purpose: "说明 PCA 有效所利用的结构假设", definitionEvidence: "数据近似线性子空间", purposeEvidence: "PCA 输出保留大方差的线性坐标" },
          ],
        },
      ],
      formulas: [
        {
          id: "curse-grid-cover",
          section: 1,
          formulaIndex: 1,
          symbols: [
            { name: "m", meaning: "每个坐标轴划分的区间数", evidence: "m 表示每个轴切成多少段" },
            { name: "d", meaning: "输入空间的坐标轴数量", evidence: "d 是坐标轴数量" },
          ],
        },
        {
          id: "curse-distance-concentration",
          section: 9,
          formulaIndex: 1,
          symbols: [
            { name: "D", meaning: "两点之间的总欧氏距离", evidence: "D² 表示两点的总平方距离" },
            { name: "d", meaning: "独立噪声坐标的维度数", evidence: "d 是维度" },
            { name: "μ", meaning: "单维差平方的均值", evidence: "单维差平方的均值记为 μ" },
            { name: "σ", meaning: "单维差平方的标准差", evidence: "标准差记为 σ" },
            { name: "E", meaning: "总平方距离的期望", evidence: "均值随 d 线性增长" },
            { name: "SD", meaning: "总平方距离的标准差", evidence: "标准差只随" },
          ],
        },
        {
          id: "curse-regularized-objective",
          section: 13,
          formulaIndex: 1,
          symbols: [
            { name: "w", meaning: "线性模型的可学习权重向量", evidence: "线性模型有十万特征" },
            { name: "L", meaning: "模型在训练数据上的损失", evidence: "样本量—性能学习曲线" },
            { name: "λ", meaning: "稀疏或小权重惩罚的强度", evidence: "λ过小无法抑制噪声" },
          ],
        },
      ],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "覆盖数是在指定每维分辨率时，覆盖整个空间所需区域的数量。", evidence: "高维空间的第一个困难是 覆盖成本" },
          problem: { answer: "它解释固定轴分辨率为何随维度增加迅速变得不可承受。", evidence: "每个轴只切十格，为什么很快不可行" },
          inputOutput: { answer: "输入每维区间数 m 与维度 d，输出网格单元总数 m 的 d 次方。", evidence: "输入是每维区间数 m 和维度 d" },
          mechanism: { answer: "每新增一维都与已有区间做笛卡尔组合，因此总数再乘 m。", evidence: "每增加一维，单元数再乘 m" },
          interpretation: { answer: "固定样本被摊到更多单元，局部空缺增多，使近邻和密度估计不稳。", evidence: "绝大多数局部区域没有数据" },
          boundary: { answer: "网格是解释资源增长的模型；低维数据结构可使有效覆盖远小于环境空间。", evidence: "不表示所有算法都会真的建网格" },
        },
        {
          section: 2,
          definition: { answer: "距离集中是最近与最远距离的相对差距在某些高维条件下缩小。", evidence: "距离集中 是指" },
          problem: { answer: "它解释近邻排序为何会在高维和噪声维下失去区分度。", evidence: "最近邻为何失去区分度" },
          inputOutput: { answer: "输入高维向量和距离度量，输出最近、最远距离及相对差异。", evidence: "输出可以是每个查询的最近、最远距离" },
          mechanism: { answer: "多维差异相加使总距离均值增长，而随机波动的相对比例下降。", evidence: "随机波动所占比例却下降" },
          interpretation: { answer: "相对距离壳层变窄意味着小噪声更容易改变近邻排序。", evidence: "相似度排序更容易翻转" },
          boundary: { answer: "现象依赖分布、尺度、归一化和度量，不能概括为所有高维都无近邻。", evidence: "不能推成“所有高维空间都没有近邻”" },
        },
        {
          section: 3,
          definition: { answer: "无关特征是不与任务目标保持稳定关系却参与计算的输入维度。", evidence: "无关特征 是与任务目标没有稳定关系" },
          problem: { answer: "它解释多加字段为何会稀释距离信号并扩大过拟合自由度。", evidence: "多加字段为什么可能降低模型效果" },
          inputOutput: { answer: "输入加入额外字段的样本，输出仍是预测或排序，但信噪比可能下降。", evidence: "模型输出仍是预测或排序" },
          mechanism: { answer: "噪声坐标进入距离求和，或给模型更多偶然贴合训练数据的路径。", evidence: "得到更多可以偶然贴合训练样本的自由度" },
          interpretation: { answer: "训练改善而验证下降支持新增字段被当成巧合捷径而非稳定信号。", evidence: "训练分数提高而验证表现下降" },
          boundary: { answer: "删除特征也可能损失交互信息，选择必须在训练拟合并独立验证。", evidence: "简单删除也可能漏掉交互信号" },
        },
        {
          section: 4,
          definition: { answer: "环境维度是观测坐标数，内在维度是产生数据变化的有效自由度。", evidence: "环境维度 是数据文件拥有的坐标数" },
          problem: { answer: "它解释百万像素图像为何不必覆盖完整百万维空间也能学习。", evidence: "图像有百万像素，为什么仍能学习" },
          inputOutput: { answer: "输入高维观测，输出对低维流形、子空间或有效因素结构的表示。", evidence: "输出结构却可能主要由少数因素控制" },
          mechanism: { answer: "模型利用局部性、共享结构或可学习坐标，把资源集中到真实数据区域。", evidence: "把估计资源集中到数据真正出现的区域" },
          interpretation: { answer: "谱、局部距离、重建和学习曲线共同支持结构是否有效低维。", evidence: "由特征值谱、局部距离、重建曲线" },
          boundary: { answer: "内在维度随尺度、噪声与任务变化，不是永久固定的单个属性。", evidence: "不是数据集永久不变的单个数字" },
        },
        {
          section: 5,
          definition: { answer: "向量检索按查询与索引向量的距离或相似度返回前 k 个候选。", evidence: "输出距离最小或相似度最高的前 k 个候选" },
          problem: { answer: "它分析嵌入维度如何同时影响召回、噪声、内存与延迟。", evidence: "嵌入维度越高是否召回越准" },
          inputOutput: { answer: "输入查询嵌入与向量索引，输出排序后的候选及检索指标。", evidence: "输入查询嵌入与向量索引" },
          mechanism: { answer: "更宽向量增加表示方向和距离计算，信号或噪声都会进入索引搜索。", evidence: "增加每条向量的存储、距离计算" },
          interpretation: { answer: "应联合解释 Recall@k、延迟、内存、构建时间与查询切片。", evidence: "联合报告 Recall@k、延迟、内存" },
          boundary: { answer: "更宽不必然更准；模型、距离、量化或索引参数变化后必须重测。", evidence: "更宽嵌入不是必然更准" },
        },
        {
          section: 6,
          definition: { answer: "缓解方法通过选择特征、投影、学习潜变量或限制模型自由度利用结构。", evidence: "共同思路是利用结构" },
          problem: { answer: "它减少高维覆盖与估计负担，同时尽量保留下游任务所需关系。", evidence: "降维是否总能保留重要信息" },
          inputOutput: { answer: "输入高维特征与保真目标，输出较少字段、低维坐标或受约束模型。", evidence: "输出较小字段集合" },
          mechanism: { answer: "PCA 保方差、随机投影保距离、自编码器学非线性、正则限自由度。", evidence: "随机投影用概率保证近似距离" },
          interpretation: { answer: "要用压缩前后任务质量、近邻、切片和资源曲线判断收益。", evidence: "比较压缩前后下游质量" },
          boundary: { answer: "方法会丢少数或低方差信号，二维图也只能提出假设。", evidence: "任何压缩都可能丢掉低方差或稀有信号" },
        },
        {
          section: 7,
          definition: { answer: "该例用固定轴分辨率手算覆盖单元及平均样本密度随维数变化。", evidence: "局部覆盖如何随维度崩塌" },
          problem: { answer: "它把抽象指数增长落到二维、五维和十维的具体样本覆盖。", evidence: "每轴误差不超过0.1" },
          inputOutput: { answer: "输入每轴十格、一百万样本和维度，输出单元数及每格平均样本。", evidence: "若有一百万样本" },
          mechanism: { answer: "计算十的 d 次方单元，再用样本总量除以单元数。", evidence: "一百万样本，二维平均每格10,000个" },
          interpretation: { answer: "十维平均每格万分之一条样本，说明局部统计几乎无数据。", evidence: "十维平均每格只有0.0001个" },
          boundary: { answer: "例子不声称算法实际建网格，只展示相同局部分辨率的覆盖代价。", evidence: "不是所有算法都实际建网格" },
        },
        {
          section: 8,
          definition: { answer: "该图把二维、五维和十维固定分辨率下的稀疏程度并列展示。", evidence: "高维体积把固定样本推向边界和稀疏区" },
          problem: { answer: "它说明维度增加时为何局部附近越来越难拥有足够样本。", evidence: "附近”越来越难有足够样本" },
          inputOutput: { answer: "输入固定样本与轴分辨率，输出不同维度的网格规模和局部密度。", evidence: "2维：10²格" },
          mechanism: { answer: "维度增加使组合网格指数增长，而样本数保持不变。", evidence: "固定数据几乎全为空格" },
          interpretation: { answer: "学习可行通常因为数据占据低内在结构，而非覆盖整个环境空间。", evidence: "利用低内在维度" },
          boundary: { answer: "图是覆盖直觉而非真实数据分布证明，具体内在结构仍需估计。", evidence: "往往因为真实数据只占" },
        },
        {
          section: 9,
          definition: { answer: "距离集中可由独立坐标差平方和的均值与相对标准差解释。", evidence: "距离集中可用均值与方差解释" },
          problem: { answer: "它解释独立噪声维度增加时所有点为何在相对尺度上显得接近。", evidence: "为什么让所有点看起来差不多远" },
          inputOutput: { answer: "输入维度 d 及单维差平方的均值方差，输出总平方距离分布尺度。", evidence: "单维差平方的均值记为" },
          mechanism: { answer: "总均值随 d 线性增长，标准差随根号 d 增长，相对波动按根号 d 下降。", evidence: "均值随 d 线性增长" },
          interpretation: { answer: "距离壳层相对变窄时，无关维度会稀释真正有意义的坐标差异。", evidence: "无关维度会稀释有意义差异" },
          boundary: { answer: "推导依赖独立性、分布与度量，归一化嵌入可能改用余弦。", evidence: "这依赖独立性、分布和度量" },
        },
        {
          section: 11,
          definition: { answer: "kNN 与核密度依赖有限半径内的局部样本来估计标签或密度。", evidence: "kNN 与核密度把稀疏性直接暴露出来" },
          problem: { answer: "它说明高维中为包含固定样本比例，邻域为何必须扩大到不再局部。", evidence: "高维邻域半径要扩大多少" },
          inputOutput: { answer: "输入维度 d 与目标覆盖比例 p，输出每轴等效邻域尺度。", evidence: "若希望邻域覆盖总体比例 p" },
          mechanism: { answer: "每轴尺度取 p 的 1/d 次方，维度升高时该值趋近一。", evidence: "每轴等效半径尺度约为" },
          interpretation: { answer: "十维为找百分之一数据已跨每轴多数范围，局部平均混合远处结构。", evidence: "十维邻域已跨过每轴大部分范围" },
          boundary: { answer: "小邻域方差大无样本，大邻域偏差大抹平结构，带宽无法一概而定。", evidence: "小邻域没有样本，大邻域又抹平结构" },
        },
        {
          section: 12,
          definition: { answer: "内在维度估计试图量化数据在特定尺度和任务下的有效自由度。", evidence: "内在维度必须用多种尺度和任务证据估计" },
          problem: { answer: "它回答高环境维数据真正需要多少方向才能描述或完成任务。", evidence: "到底有多少有效自由度" },
          inputOutput: { answer: "输入样本与观察尺度，输出谱、邻域、重建或学习曲线提供的维度证据。", evidence: "都能提供估计" },
          mechanism: { answer: "用特征值能量、局部体积增长、压缩损失和任务样本复杂度交叉判断。", evidence: "特征值谱 能量集中于少数方向" },
          interpretation: { answer: "压缩后任务保持、近邻稳定且数据需求下降，才支持结构被有效利用。", evidence: "最可靠的结论来自交叉证据" },
          boundary: { answer: "估计对噪声、样本量和尺度敏感，单个数不能作为永久属性。", evidence: "单个数字不应当作数据的永久属性" },
        },
        {
          section: 13,
          definition: { answer: "正则化在样本不足时限制模型实际可用的函数自由度。", evidence: "缩小模型能自由选择的函数集合" },
          problem: { answer: "它解释输入列很多时仍可训练，以及自由参数失控为何过拟合。", evidence: "为什么线性模型有十万特征也可能训练" },
          inputOutput: { answer: "输入数据损失、参数 w、正则函数和 λ，输出受偏好约束的训练目标。", evidence: "L(w)+λ" },
          mechanism: { answer: "L1 偏好稀疏、L2 偏好小权重、低秩与共享限制有效方向。", evidence: "L1假设只有少数特征重要" },
          interpretation: { answer: "增加数据持续改善支持高方差；训练验证都差更像表示或偏差问题。", evidence: "若增加数据持续改善" },
          boundary: { answer: "λ 太小抑制不了噪声，太大会压掉真实信号，必须嵌套验证。", evidence: "λ过小无法抑制噪声" },
        },
      ],
    },

    "dimensionality-reduction": {
      contractVersion: 2,
      examples: [{
        section: 7,
        evidence: {
          setup: "四个点 (2,1)、(4,2)、(6,3)、(8,4)",
          rule: "最大特征向量归一化",
          steps: "均值为(5,2.5)",
          interpretation: "所有点投影到一维后都能精确重建",
        },
      }],
      termReviews: [
        {
          section: 1,
          reviewedAt: "2026-07-26",
          terms: [
            { name: "高维", meaning: "每个样本由很多原始特征坐标描述", purpose: "指出需要压缩的输入形态", definitionEvidence: "样本数 × 原始特征数", purposeEvidence: "从一千维压到二维" },
            { name: "降维", meaning: "把样本转换为更少新坐标的表示过程", purpose: "降低存储计算成本或支持观察结构", definitionEvidence: "从许多原始坐标转换为较少的新坐标", purposeEvidence: "解决存储、计算、噪声和可视化问题" },
            { name: "PCA", meaning: "偏向保留全局线性方差与重建质量的线性降维", purpose: "以较少主轴概括总体变化", definitionEvidence: "PCA 偏向全局线性方差与重建", purposeEvidence: "保留了哪些关系" },
            { name: "局部邻域", meaning: "一个样本周围距离较近的一组样本关系", purpose: "让低维展示优先保持近邻", definitionEvidence: "更关注局部邻域", purposeEvidence: "声明要保真的对象" },
            { name: "t-SNE", meaning: "优先保留局部邻域的低维可视化方法", purpose: "帮助提出高维局部群体假设", definitionEvidence: "t-SNE 和 UMAP 更关注局部邻域", purposeEvidence: "可视化问题" },
            { name: "UMAP", meaning: "基于邻域结构构造低维嵌入的方法", purpose: "帮助观察高维数据的局部关系", definitionEvidence: "t-SNE 和 UMAP 更关注局部邻域", purposeEvidence: "可视化问题" },
          ],
        },
        {
          section: 2,
          reviewedAt: "2026-07-26",
          terms: [
            { name: "线性子空间", meaning: "由若干线性方向张成的低维坐标空间", purpose: "限制 PCA 使用可解释的线性投影", definitionEvidence: "用若干互相垂直的方向作为新坐标轴", purposeEvidence: "PCA（主成分分析） 寻找一个低维" },
            { name: "正交", meaning: "投影方向长度为一且彼此垂直", purpose: "避免主轴重复描述同一方向", definitionEvidence: "长度为一且彼此正交", purposeEvidence: "互相垂直的方向作为新坐标轴" },
            { name: "协方差矩阵", meaning: "概括各中心化特征共同变化的矩阵", purpose: "从中求出 PCA 的主轴方向", definitionEvidence: "训练协方差矩阵", purposeEvidence: "选择最大特征值对应的前几条方向" },
            { name: "特征向量", meaning: "协方差变换下方向保持不变的候选轴", purpose: "作为 PCA 的投影方向", definitionEvidence: "求特征向量", purposeEvidence: "每一列是一条要学习的投影方向" },
            { name: "重建误差", meaning: "原数据与从低维坐标还原数据的平方差", purpose: "衡量压缩丢失的信息量", definitionEvidence: "平方重建误差最小", purposeEvidence: "可近似重建原数据" },
          ],
        },
      ],
      formulas: [
        {
          id: "pca-max-variance",
          section: 2,
          formulaIndex: 1,
          symbols: [
            { name: "W", meaning: "列向量为主成分方向的投影矩阵", evidence: "W 的每一列是一条要学习的投影方向" },
            { name: "X", meaning: "减去训练均值后的中心化数据矩阵", evidence: "X 表示已经中心化的数据矩阵" },
            { name: "I", meaning: "表达主轴单位正交约束的单位矩阵", evidence: "表示这些方向长度为一且彼此正交" },
            { name: "Var", meaning: "投影坐标的总方差", evidence: "让投影坐标的总方差最大" },
          ],
        },
        {
          id: "pca-project-reconstruct",
          section: 7,
          formulaIndex: 1,
          symbols: [
            { name: "z", meaning: "样本在第一主轴上的一维坐标", evidence: "一维坐标 z" },
            { name: "x", meaning: "原始二维样本", evidence: "四个点 (2,1)" },
            { name: "μ", meaning: "训练样本的二维均值", evidence: "均值为(5,2.5)" },
            { name: "w", meaning: "归一化后的第一主轴方向", evidence: "最大特征向量归一化为 w₁" },
            { name: "i", meaning: "样本编号", evidence: "所有点投影" },
            { name: "x̂", meaning: "从一维坐标还原的重建样本", evidence: "都能精确重建" },
          ],
        },
        {
          id: "jl-distance-bound",
          section: 9,
          formulaIndex: 1,
          symbols: [
            { name: "ε", meaning: "允许的相对平方距离误差", evidence: "(1±ε) 倍范围" },
            { name: "x", meaning: "一对原始高维点中的第一个", evidence: "所有成对平方距离" },
            { name: "y", meaning: "一对原始高维点中的第二个", evidence: "成对平方距离" },
            { name: "R", meaning: "把原始点映射到低维的随机线性矩阵", evidence: "随机映射" },
          ],
        },
        {
          id: "autoencoder-objective",
          section: 12,
          formulaIndex: 1,
          symbols: [
            { name: "z", meaning: "编码器产生的低维潜变量", evidence: "压成潜变量 z" },
            { name: "f", meaning: "把输入映射到潜变量的编码器", evidence: "编码器 f" },
            { name: "θ", meaning: "编码器的可学习参数", evidence: "带参数 θ 的编码器" },
            { name: "x", meaning: "自编码器的原始输入", evidence: "接收原始输入 x" },
            { name: "x̂", meaning: "解码器从潜变量生成的重建输入", evidence: "产生重建 x̂" },
            { name: "g", meaning: "把潜变量还原为输入的解码器", evidence: "解码器 g" },
            { name: "φ", meaning: "解码器的可学习参数", evidence: "带参数 φ 的解码器" },
            { name: "L", meaning: "重建误差与潜变量正则组成的训练目标", evidence: "L 是总训练损失" },
            { name: "λ", meaning: "潜变量正则项的权重", evidence: "λ 控制正则相对重建的权重" },
            { name: "R", meaning: "约束潜变量结构的正则函数", evidence: "R(z) 是对潜变量结构的正则函数" },
          ],
        },
      ],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "降维把每个样本从许多原始坐标转换为较少的新坐标。", evidence: "降维 把每个样本从许多原始坐标转换为较少的新坐标" },
          problem: { answer: "它减少存储、计算与噪声并支持展示，但必须选择保留哪些结构。", evidence: "解决存储、计算、噪声和可视化问题" },
          inputOutput: { answer: "输入高维样本矩阵，输出样本数不变、特征维数更少的表示。", evidence: "样本数 × 较少维数" },
          mechanism: { answer: "不同方法按方差、距离、重建或局部邻域目标选择低维坐标。", evidence: "声明要保真的对象" },
          interpretation: { answer: "低维坐标只能按所选目标解释，不天然对应业务或真实二维结构。", evidence: "没有天然业务含义" },
          boundary: { answer: "任何压缩都可能丢掉任务信号，不能同时无损保留全部关系。", evidence: "不可能同时无损保留所有关系" },
        },
        {
          section: 2,
          definition: { answer: "PCA 在中心化数据上寻找最大方差的正交线性子空间。", evidence: "寻找一个低维 线性子空间" },
          problem: { answer: "它用较少线性坐标保留尽可能多的总体变化并降低重建误差。", evidence: "最大方差与最小重建误差为何相连" },
          inputOutput: { answer: "输入中心化矩阵 X，输出投影方向 W 和低维坐标 XW。", evidence: "XW 是投影后的低维坐标" },
          mechanism: { answer: "对训练协方差矩阵求特征向量并选择最大特征值对应方向。", evidence: "选择最大特征值对应的前几条方向" },
          interpretation: { answer: "主成分方差大表示该线性方向承载较多训练样本差异。", evidence: "该方向携带的样本差异越多" },
          boundary: { answer: "最大方差与最小平方重建的等价只适用于正交线性投影，不保证任务信号。", evidence: "不保证保留标签、因果或少数类信号" },
        },
        {
          section: 3,
          definition: { answer: "尺度处理决定各原始变量以绝对量还是相对偏离参与 PCA。", evidence: "数值范围大的变量会更强地影响主轴" },
          problem: { answer: "它解决不同单位变量的方差不可直接比较及全量拟合泄漏的问题。", evidence: "收入和年龄一起做 PCA" },
          inputOutput: { answer: "输入分开的训练验证测试特征，输出训练均值、尺度、投影及其变换结果。", evidence: "训练阶段输出均值、尺度和投影矩阵" },
          mechanism: { answer: "先切分，只在训练折拟合标准化器与 PCA，再变换其他集合。", evidence: "先切分 → 在训练折拟合标准化器与 PCA" },
          interpretation: { answer: "原单位和标准化方案应分别通过重建与下游任务证据比较。", evidence: "分别比较重建与下游指标" },
          boundary: { answer: "标准化不是永远正确，绝对尺度有业务含义时可能抹掉重要信息。", evidence: "盲目标准化反而会抹掉含义" },
        },
        {
          section: 4,
          definition: { answer: "t-SNE 与 UMAP 是优先保留高维局部近邻的低维嵌入方法。", evidence: "局部近邻关系嵌入二维或三维" },
          problem: { answer: "它们帮助观察高维局部群体，但不能完整展示所有全局距离。", evidence: "二维簇之间很远是否表示原空间也很远" },
          inputOutput: { answer: "输入高维样本及邻域超参数，输出每个样本的二维或三维展示坐标。", evidence: "输出是每个样本的低维展示坐标" },
          mechanism: { answer: "先构造高维近邻或邻近概率，再优化低维坐标使近邻仍靠近。", evidence: "先在高维空间构造近邻或邻近概率" },
          interpretation: { answer: "图中相邻点支持局部相似假设，岛间距离、面积和方向通常不可定量解释。", evidence: "岛屿间距、簇面积、朝向和空白" },
          boundary: { answer: "布局受随机种子与超参数影响，不可直接用于因果解释或高风险决策。", evidence: "不适合用二维距离直接做因果解释" },
        },
        {
          section: 5,
          definition: { answer: "监督与非线性压缩用标签、度量目标或重建目标学习任务相关表示。", evidence: "用自编码器学习非线性压缩" },
          problem: { answer: "它处理任务信号位于低方差方向、PCA 无法优先保留的问题。", evidence: "最大方差方向不含标签信号怎么办" },
          inputOutput: { answer: "输入特征及可选标签或重建目标，输出服务分类、检索或重建的低维表示。", evidence: "监督降维输入特征与标签" },
          mechanism: { answer: "监督投影利用标签，度量学习调整相对距离，自编码器编码后再重建输入。", evidence: "自编码器由编码器输出潜变量 z" },
          interpretation: { answer: "应联合下游质量、重建、近邻保持和少数类表现判断压缩是否有效。", evidence: "分别用下游准确率或召回、重建误差" },
          boundary: { answer: "监督方法会过拟合或泄漏，自编码器可能学背景捷径，低重建不保证任务信息完整。", evidence: "低重建误差也不等于任务信息完整" },
        },
        {
          section: 6,
          definition: { answer: "目标维数是通过验证选择的质量—资源折中超参数。", evidence: "性能—成本超参数" },
          problem: { answer: "它决定压缩到多低仍能满足任务、少数类与成本门槛。", evidence: "解释方差 95% 是通用规则吗" },
          inputOutput: { answer: "输入候选维数与固定流程，输出质量、存储、延迟和稳定性曲线。", evidence: "输出应是一条质量、存储、延迟与稳定性" },
          mechanism: { answer: "逐维数训练或变换并比较下游、重建、资源和切片指标。", evidence: "应逐维数比较" },
          interpretation: { answer: "选择满足质量门槛的最低成本点，而不是固定解释方差百分比。", evidence: "选择满足质量门槛的最低成本点" },
          boundary: { answer: "维数选择不能看测试集，部署分布变化后也必须重新验证。", evidence: "测试集留到流程冻结后" },
        },
        {
          section: 7,
          definition: { answer: "该例手算二维数据的中心化、主轴、投影坐标与线性重建。", evidence: "二维 PCA 怎样找到第一主轴" },
          problem: { answer: "它展示把四个共线点压到一维究竟保留和丢失多少信息。", evidence: "压到一维会丢多少信息" },
          inputOutput: { answer: "输入四个二维点，输出均值、主方向、一维坐标和重建点。", evidence: "四个点 (2,1)、(4,2)、(6,3)、(8,4)" },
          mechanism: { answer: "先中心化，求最大特征向量，投影得 z，再由均值和主轴重建。", evidence: "最大特征向量归一化" },
          interpretation: { answer: "点全部位于同一直线，因此一维投影可精确重建且解释方差百分之百。", evidence: "解释方差率100%" },
          boundary: { answer: "加入独立噪声后第二特征值会上升，一维压缩会开始丢失信号。", evidence: "第二特征值会上升" },
        },
        {
          section: 8,
          definition: { answer: "该图汇总 PCA、随机投影与邻域嵌入各自保留的结构目标。", evidence: "不同目标保留不同结构" },
          problem: { answer: "它解释同一高维数据经过不同降维目标为何不会得到同一布局。", evidence: "为什么不会画成同一张图" },
          inputOutput: { answer: "输入含信号、噪声和邻域的高维 X，输出三类低维表示。", evidence: "高维 X 信号 + 噪声 + 邻域" },
          mechanism: { answer: "PCA 最大化线性方差，随机投影近似距离，邻域方法重构局部关系。", evidence: "优先重构局部邻域" },
          interpretation: { answer: "不同输出必须用重建、召回、准确率和切片指标按目标解释。", evidence: "重建·Recall·准确率" },
          boundary: { answer: "图只展示目标差异，不能证明某方法对所有下游任务都更好。", evidence: "最终必须用目标任务判定" },
        },
        {
          section: 9,
          definition: { answer: "随机投影用随机矩阵把高维点映射到低维，并概率性近似保持距离。", evidence: "随机映射到 k=O(log n/ε²) 维" },
          problem: { answer: "它以极低拟合成本处理大规模稀疏高维数据的距离压缩。", evidence: "换取极低拟合成本" },
          inputOutput: { answer: "输入 n 个高维点、目标误差 ε 和随机矩阵，输出 k 维坐标。", evidence: "对 n 个点" },
          mechanism: { answer: "用同一随机线性矩阵 R 变换所有点，使成对距离高概率落在误差范围。", evidence: "所有成对平方距离落在 (1±ε) 倍范围" },
          interpretation: { answer: "ε 越小需要的维数通常越高，保证针对距离而不是标签或重建。", evidence: "可高概率让所有成对平方距离" },
          boundary: { answer: "维数只是概率上界，随机误差与具体下游表现仍须实测。", evidence: "具体任务仍要实测" },
        },
        {
          section: 11,
          definition: { answer: "降维器是从训练数据估计参数、再对新数据执行变换的模型。", evidence: "降维器是模型" },
          problem: { answer: "它防止无标签 PCA 利用验证或测试分布产生评测泄漏。", evidence: "为什么也能泄漏测试集" },
          inputOutput: { answer: "训练折输入拟合标准化与投影参数，验证测试只输出 transform 后坐标。", evidence: "再变换验证部分" },
          mechanism: { answer: "每个交叉验证折内重拟合转换器，并在内层验证选择维数。", evidence: "每一折都应在该折训练部分重新拟合" },
          interpretation: { answer: "全量拟合后的高分说明表示提前适应未来分布，不能当独立泛化证据。", evidence: "提前适应未来分布" },
          boundary: { answer: "重新 fit 会产生新版本，必须与下游模型一并回归而非只替换矩阵。", evidence: "必须连同下游模型一起回归" },
        },
        {
          section: 12,
          definition: { answer: "自编码器用编码器产生潜变量，再由解码器重建输入。", evidence: "z=fθ(x)" },
          problem: { answer: "它学习非线性压缩，但低重建误差不保证保留分类、检索或因果因素。", evidence: "低重建误差为何不保证分类" },
          inputOutput: { answer: "输入原始 x，输出潜变量 z 与重建 x̂，并计算重建及正则损失。", evidence: "x̂=gφ(z)" },
          mechanism: { answer: "联合优化编码器和解码器，使重建误差与潜变量正则目标降低。", evidence: "L=‖x−x̂‖²+λR(z)" },
          interpretation: { answer: "应同时看重建、线性探测、近邻、反事实与分布外迁移。", evidence: "应同时测重建、下游线性探测" },
          boundary: { answer: "高容量模型可能记住背景噪声并压掉稀有信号，正则不保证语义解耦。", evidence: "不保证语义解耦" },
        },
        {
          section: 13,
          definition: { answer: "表示漂移是新数据相对训练期主轴、残差和低维分布发生变化。", evidence: "部署后要监控投影残差与表示漂移" },
          problem: { answer: "它发现固定降维器仍能输出坐标、但表示已悄悄失真的部署故障。", evidence: "继续运行却悄悄失真" },
          inputOutput: { answer: "输入新数据与旧投影，输出坐标及均值、方差、残差、夹角和下游监控。", evidence: "监控每维均值/方差、重建残差、子空间夹角" },
          mechanism: { answer: "比较训练基线与新窗口统计，超阈值后重拟合并组合灰度发布。", evidence: "超过阈值时用新时间窗重拟合" },
          interpretation: { answer: "丢弃方向方差上升或残差变大表示旧子空间不再覆盖新结构。", evidence: "方差转移到训练时被丢弃的方向" },
          boundary: { answer: "不能只换投影矩阵或直接比较独立 t-SNE 坐标，坐标系变化会破坏下游含义。", evidence: "不能只替换投影矩阵" },
        },
      ],
    },

    "regularization": {
      contractVersion: 2,
      examples: [{
        section: 3,
        evidence: {
          setup: "设当前 w=4",
          rule: "正则梯度为 λw",
          steps: "总梯度 −0.4+0.2",
          interpretation: "正则不是每次强行变小",
        },
      }, {
        section: 10,
        evidence: {
          setup: "同时改增强、Dropout、权重衰减和训练轮数",
          rule: "一次只改变一类机制",
          steps: "扫描强度而非只试默认值",
          interpretation: "验证改善同时训练略差",
        },
      }],
      termReviews: [{
        section: 6,
        reviewedAt: "2026-07-26",
        terms: [{
          name: "局部邻域",
          meaning: "围绕一个原样本、由小幅允许变换形成的一组附近样本",
          purpose: "扩大有限样本覆盖并声明哪些输入变化不应改变标签",
          definitionEvidence: "扩展每个样本的局部邻域",
          purposeEvidence: "某些变化不应影响输出",
        }],
      }],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "正则化是在多个训练拟合相近的解中加入选择偏好。", evidence: "正则化向选择过程加入偏好" },
          problem: { answer: "它解决有限数据无法唯一决定函数、优化器可能选择脆弱拟合的问题。", evidence: "有限数据通常不足以唯一确定函数" },
          inputOutput: { answer: "输入多个经验风险相近的候选解，输出更符合任务偏好的解。", evidence: "许多训练损失相近" },
          mechanism: { answer: "通过改变目标、数据、表示或训练路径，让某些解更容易被找到。", evidence: "更容易被优化器找到" },
          interpretation: { answer: "正则有效时训练拟合可能略差，但未知验证表现改善。", evidence: "具有更低总目标" },
          boundary: { answer: "偏好依赖任务而非普遍真理，过强会压掉真实复杂性并导致欠拟合。", evidence: "正则过强会压掉真实复杂性" },
        },
        {
          section: 2,
          definition: { answer: "正则目标是在数据损失之外加入带强度系数的偏好惩罚。", evidence: "J data (θ)+λΩ(θ)" },
          problem: { answer: "它把“不要太复杂”等抽象偏好变成优化器可使用的标量。", evidence: "怎样变成优化器能使用的标量" },
          inputOutput: { answer: "输入模型参数、数据损失、正则函数与 λ，输出总训练目标。", evidence: "λ 控制权衡" },
          mechanism: { answer: "Ω 衡量不希望的参数或行为，λ 决定该惩罚相对数据拟合的分量。", evidence: "Ω 衡量不希望出现的参数或行为" },
          interpretation: { answer: "L2 连续缩小各维，L1 更易产生精确零，组稀疏删除整组参数。", evidence: "许多参数变为零，产生稀疏" },
          boundary: { answer: "不同惩罚隐含不同几何偏好，特征相关或分组无意义时可能不稳定。", evidence: "分组必须有任务含义" },
        },
        {
          section: 3,
          definition: { answer: "L2 正则在数据梯度之外增加与当前参数成正比的拉回梯度。", evidence: "正则梯度为 λw" },
          problem: { answer: "它用数值说明正则项怎样实际改变一次参数更新。", evidence: "梯度究竟多出什么" },
          inputOutput: { answer: "输入参数、数据梯度、λ 与学习率，输出合成梯度和新参数。", evidence: "设当前 w=4" },
          mechanism: { answer: "把数据梯度与 λw 相加，再按学习率执行梯度下降更新。", evidence: "总梯度 −0.4+0.2" },
          interpretation: { answer: "参数仍可沿数据方向增大，但正则把增幅从 0.04 减为 0.02。", evidence: "幅度从无正则的 0.04 降到 0.02" },
          boundary: { answer: "正则与数据梯度竞争，并不保证每一步都让参数绝对值变小。", evidence: "正则不是每次强行变小" },
        },
        {
          section: 4,
          definition: { answer: "AdamW 将权重衰减作为优化更新之外的独立参数缩小步骤。", evidence: "在优化更新之外独立执行" },
          problem: { answer: "它解决 Adam 中耦合 L2 被每参数缩放后有效强度难以解释的问题。", evidence: "为什么在 Adam 中不再等价" },
          inputOutput: { answer: "输入 Adam 更新、权重、学习率和衰减率，输出解耦衰减后的参数。", evidence: "θ←(1−ηλ)θ" },
          mechanism: { answer: "AdamW 不把 λθ 混入自适应梯度缩放，而在更新外统一乘小权重。", evidence: "对包括 λθ 在内的总梯度做每参数缩放" },
          interpretation: { answer: "解耦后衰减系数与参数历史梯度尺度分离，含义更直接。", evidence: "让衰减更可解释" },
          boundary: { answer: "配置名 weight_decay 不能证明具体实现，还须记录哪些参数参与衰减。", evidence: "必须查看具体优化器实现" },
        },
        {
          section: 5,
          definition: { answer: "Dropout 在训练时随机屏蔽激活，使共享参数在许多子网络中工作。", evidence: "每个激活以概率 p 被屏蔽" },
          problem: { answer: "它减少表示对固定神经元组合的共适应依赖。", evidence: "为什么不是单纯破坏信息" },
          inputOutput: { answer: "输入网络激活与屏蔽概率，输出随机子网络的缩放激活。", evidence: "其余激活通常除以 1−p" },
          mechanism: { answer: "每批采样不同屏蔽组合，迫使参数在多种缺失路径下仍能工作。", evidence: "每个 batch 相当于采样一个子网络" },
          interpretation: { answer: "训练时子网络变化，标准推理时使用完整网络并匹配期望尺度。", evidence: "推理时使用完整网络" },
          boundary: { answer: "比例过高会丢信号，已有强正则时收益可能小，模式切换错误会偏尺度。", evidence: "训练/评估模式切换错误" },
        },
        {
          section: 6,
          definition: { answer: "数据增强通过改变输入且保留标签，声明任务应具有的输入不变性。", evidence: "关于任务对称性和不变性的声明" },
          problem: { answer: "它扩大有限样本周围覆盖，减少模型依赖偶然表面特征。", evidence: "扩展每个样本的局部邻域" },
          inputOutput: { answer: "输入原样本及允许变换，输出标签不变的额外训练样本。", evidence: "改变输入但保留标签" },
          mechanism: { answer: "对输入施加平移、裁剪、改写或噪声，训练模型保持输出稳定。", evidence: "迫使模型少依赖固定像素位置" },
          interpretation: { answer: "有效增强说明变换后的差异不应影响任务答案。", evidence: "某些变化不应影响输出" },
          boundary: { answer: "变换若改变标签语义，会稳定注入错误监督，而不是带来有效正则。", evidence: "声明错了，就会稳定地教错模型" },
        },
        {
          section: 7,
          definition: { answer: "早停用独立验证选择优化轨迹中的检查点，从而限制继续拟合。", evidence: "早停用验证集选择路径上的某个检查点" },
          problem: { answer: "它在不改模型与损失时，阻止训练后期继续追逐噪声和个例。", evidence: "提前停止为什么也能改善泛化" },
          inputOutput: { answer: "输入训练过程中的验证曲线，输出被选中的最佳检查点。", evidence: "必须保存最佳检查点" },
          mechanism: { answer: "持续监视验证指标，超过耐心窗口未改善时停止并回到最佳点。", evidence: "耐心窗口太短" },
          interpretation: { answer: "训练早期常先学重复大尺度模式，后期才逐渐贴合噪声。", evidence: "继续优化才逐渐拟合噪声" },
          boundary: { answer: "验证噪声和耐心窗口会影响停止点，不能只在训练最后一步判断。", evidence: "不是只在最后一步判断" },
        },
        {
          section: 8,
          definition: { answer: "偏差—方差权衡描述正则增强时拟合能力下降与样本敏感性降低的竞争。", evidence: "弱正则保留低偏差但可能高方差" },
          problem: { answer: "它解释验证误差为何常随正则强度先下降、后上升。", evidence: "为什么正则从零逐渐变强时" },
          inputOutput: { answer: "输入一系列正则强度，输出训练和验证误差曲线及候选强度。", evidence: "正则强度 λ" },
          mechanism: { answer: "增强正则提高训练误差但降低偶然性敏感，过强后又压掉真实结构。", evidence: "训练误差通常随正则增强而上升" },
          interpretation: { answer: "应选择验证误差最低附近，而不是让训练损失最低的 λ。", evidence: "验证误差的最低点才是候选" },
          boundary: { answer: "最佳强度随数据、模型、优化器和训练时长变化，不能永久沿用。", evidence: "不能把一次找到的 λ 当永久常数" },
        },
        {
          section: 9,
          definition: { answer: "正则配方是多个可能互补或重复约束同一失败路径的机制组合。", evidence: "必须把正则视为配方而不是独立开关" },
          problem: { answer: "它解释同时加入增强、衰减、早停和 Dropout 时为何效果不能简单相加。", evidence: "为什么会相互作用而不是简单相加" },
          inputOutput: { answer: "输入现有正则组合与训练验证表现，输出下一步消融或强度调整。", evidence: "观察 更可能的状态 下一步" },
          mechanism: { answer: "不同机制可能重复破坏表示或共同限制容量，从而互补也可能导致欠拟合。", evidence: "Dropout 再破坏表示可能导致欠拟合" },
          interpretation: { answer: "训练好验证差先排查过拟合或泄漏，两边都差则应减弱约束。", evidence: "训练与验证都差" },
          boundary: { answer: "平均结果良好仍可能掩盖关键切片覆盖不足，不能只继续调 λ。", evidence: "总体好、关键切片差" },
        },
        {
          section: 10,
          definition: { answer: "可归因正则实验是在固定其余条件下单独改变一种机制并做消融。", evidence: "怎样设计一次可归因的正则实验" },
          problem: { answer: "它避免同时修改多项配方后无法判断究竟哪项产生效果。", evidence: "为什么得不出可靠结论" },
          inputOutput: { answer: "输入固定切分、基线、强度网格和随机种子，输出训练验证及切片证据。", evidence: "固定预算与随机种子组" },
          mechanism: { answer: "先建基线，再单变量扫描强度，最后组合并逐项移除做消融。", evidence: "一次只改变一类机制" },
          interpretation: { answer: "典型有效证据是训练略差而验证改善，并在切片和种子间稳定。", evidence: "验证改善同时训练略差" },
          boundary: { answer: "切分不独立、预算不同或多项同时变化时，观察差异不能归因于正则。", evidence: "按实体/时间去重" },
        },
      ],
      formulas: [{
        id: "regularization-objective",
        section: 2,
        formulaIndex: 1,
        symbols: [
          { name: "J", meaning: "数据目标或加入正则后的总目标", evidence: "J_data 要求贴合样本" },
          { name: "θ", meaning: "模型需要学习的参数", evidence: "不希望出现的参数或行为" },
          { name: "λ", meaning: "正则项相对数据目标的权重", evidence: "λ 控制权衡" },
          { name: "Ω", meaning: "衡量不希望参数或行为的正则函数", evidence: "Ω 衡量不希望出现的参数或行为" },
        ],
      }],
    },

    "overfitting": {
      contractVersion: 2,
      examples: [{
        section: 5,
        evidence: {
          setup: "训练 MSE",
          rule: "只看训练误差",
          steps: "会选择 15 次",
          interpretation: "验证集不是“阻止模型学习”",
        },
      }],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "过拟合是模型贴合训练样本中的偶然性，却不能把表现迁移到部署数据。", evidence: "同时包含稳定规律、抽样波动、测量噪声和偶然标识" },
          problem: { answer: "它解释为何训练集表现不是最终目标，未知部署数据才是验收对象。", evidence: "为什么我们却要求它回答未来从未见过的数据" },
          inputOutput: { answer: "训练输入有限样本并得到拟合模型，真正输出要求是在新部署条件下可靠预测。", evidence: "同一任务在新用户、新时间、新设备" },
          mechanism: { answer: "优化器只降低训练损失，容量足够的模型会同时利用规律与偶然性。", evidence: "会同时利用规律和偶然性" },
          interpretation: { answer: "训练准确率只证明贴合已见样本，不能单独解释为已经泛化。", evidence: "模型贴合已见样本" },
          boundary: { answer: "训练集只是未知分布的一次有限抽样，无法覆盖所有未来情境。", evidence: "一次有限抽样" },
        },
        {
          section: 2,
          definition: { answer: "欠拟合、合理拟合和过拟合由训练表现与独立验证表现的组合区分。", evidence: "训练和验证两边的组合" },
          problem: { answer: "它避免把所有表现差或泛化间隙都误诊为模型过于复杂。", evidence: "模型表现差”还不够" },
          inputOutput: { answer: "输入训练与验证表现，输出欠拟合、合理拟合、过拟合或分布偏移诊断。", evidence: "状态 训练表现 独立验证表现" },
          mechanism: { answer: "比较两边绝对水平、变化方向及间隙，再决定优先排查环节。", evidence: "过拟合 继续变好 停滞或变差，间隙扩大" },
          interpretation: { answer: "训练和验证都差更像欠拟合；训练继续改善而验证恶化才支持过拟合。", evidence: "欠拟合/优化不足 差 也差" },
          boundary: { answer: "预处理、标签和难度口径不同也会制造间隙，须先检查证据过程。", evidence: "也会制造间隙" },
        },
        {
          section: 3,
          definition: { answer: "经验风险是训练样本平均损失，真实风险是部署分布上的期望损失。", evidence: "前者是可计算的训练经验风险" },
          problem: { answer: "它用数学区分模型实际最小化的量与我们真正关心的部署表现。", evidence: "模型究竟在最小化什么" },
          inputOutput: { answer: "经验风险输入有限训练样本；真实风险输入部署分布概念并输出期望损失。", evidence: "部署分布上的期望风险" },
          mechanism: { answer: "逐训练样本平均得到经验风险，对部署分布取期望定义真实风险。", evidence: "1/n ΣᵢL" },
          interpretation: { answer: "训练风险低而部署风险没有同步降低，就是过拟合的风险关系。", evidence: "R 没有同步降低" },
          boundary: { answer: "验证仅是带抽样方差的估计，且必须代表部署分布并保持独立。", evidence: "它本身也有方差" },
        },
        {
          section: 4,
          definition: { answer: "训练—验证曲线展示拟合进程，并用验证最优附近作为候选停止点。", evidence: "早停选择验证最优附近的检查点" },
          problem: { answer: "它识别过拟合从验证改善转为持续恶化的渐进过程。", evidence: "一个逐渐扩大的过程" },
          inputOutput: { answer: "输入各训练步的训练与验证损失，输出停止点和故障模式线索。", evidence: "训练损失 验证损失" },
          mechanism: { answer: "持续训练降低训练损失，同时监视独立验证何时不再改善。", evidence: "选择验证最优附近的检查点" },
          interpretation: { answer: "验证先改善再恶化是经典过拟合轨迹，两边都高则应查欠拟合或管道。", evidence: "验证先改善再持续恶化" },
          boundary: { answer: "曲线有随机噪声，早停应使用耐心窗口并通过多个随机种子复核。", evidence: "应使用耐心窗口和多次种子验证" },
        },
        {
          section: 5,
          definition: { answer: "该模拟比较不同多项式容量的训练 MSE 与独立验证 MSE。", evidence: "完整数值例子" },
          problem: { answer: "它展示更低训练误差为何可能选择未知数据上更差的模型。", evidence: "更低训练误差怎样选出更差模型" },
          inputOutput: { answer: "输入多项式次数及两类 MSE，输出训练选择与验证选择的差异。", evidence: "多项式次数 训练 MSE 验证 MSE" },
          mechanism: { answer: "分别按训练误差和验证误差排序候选模型并比较选择结果。", evidence: "若用训练 MSE 选模型" },
          interpretation: { answer: "训练会选十五次，独立验证选五次，说明高次模型在追逐噪声。", evidence: "用独立验证则选择 5 次" },
          boundary: { answer: "数字是教学模拟，验证最佳也有抽样误差，微小差异需区间或重复切分。", evidence: "验证最佳也有抽样误差" },
        },
        {
          section: 6,
          definition: { answer: "数据泄漏是训练与验证之间共享了部署时不应可用的信息。", evidence: "数据泄漏为什么会伪装成完美泛化" },
          problem: { answer: "它解释训练与验证都很好时，分数仍可能高估部署风险。", evidence: "第一反应仍应是检查切分" },
          inputOutput: { answer: "输入原始实体、时间、文档和预处理流程，输出保持独立的正确切分。", evidence: "泄漏类型 模型利用的捷径 正确切分" },
          mechanism: { answer: "重复实体、未来字段、相邻切块或全数据预处理把验证信息送入训练。", evidence: "验证分布进入标准化" },
          interpretation: { answer: "泄漏后高验证分只证明利用了捷径，不能估计真实部署风险。", evidence: "分数高也不能估计部署风险" },
          boundary: { answer: "正则化无法修复证据污染，必须重建切分并重跑选择过程。", evidence: "必须重新构造切分" },
        },
        {
          section: 7,
          definition: { answer: "验证集用于反复选择方案，测试集只在流程冻结后做最终估计。", evidence: "测试集应在流程冻结后" },
          problem: { answer: "它解释没有反向传播时，反复查看测试分数为何仍造成信息泄漏。", evidence: "反复查看测试分数为什么仍算学习" },
          inputOutput: { answer: "训练集拟合参数、验证集输出选择信号、测试集输出最终独立估计。", evidence: "训练集：拟合参数" },
          mechanism: { answer: "每次根据分数选择架构、阈值或种子，都把该数据的信息反馈进系统。", evidence: "都把那份数据的信息反馈进系统" },
          interpretation: { answer: "测试结果一旦影响下一轮开发，该集合就已成为验证集。", evidence: "它就已经变成新的验证集" },
          boundary: { answer: "静态测试不能替代上线后的分布与反馈回路监控。", evidence: "不用静态测试替代" },
        },
        {
          section: 8,
          definition: { answer: "模型容量表示可表达与可拟合的自由度，但不等同于参数数量。", evidence: "参数个数”不是有效复杂度的唯一度量" },
          problem: { answer: "它纠正参数比样本多就必然过拟合的简单单调判断。", evidence: "是否足以断言一定过拟合" },
          inputOutput: { answer: "输入容量、训练过程与数据结构，输出必须由独立测试测量的泛化结果。", evidence: "共同决定优化实际偏向哪些解" },
          mechanism: { answer: "架构、初始化、优化、增强和训练时长共同形成对可泛化解的隐式偏好。", evidence: "架构、初始化、优化器、数据增强" },
          interpretation: { answer: "双下降说明测试误差可随容量先降、再升、再下降。", evidence: "随后再次下降，称为双下降" },
          boundary: { answer: "现代现象不否定过拟合，仍须独立分布证据，不能用参数量代替测量。", evidence: "最终仍要用独立分布证据" },
        },
        {
          section: 9,
          definition: { answer: "大模型过拟合表现为序列记忆、基准污染或小样本适配损害基础能力。", evidence: "仍会记忆、污染基准或在小数据微调中退化" },
          problem: { answer: "它识别大规模预训练与小规模微调中不同形态的记忆和评测失真。", evidence: "评测会把记忆误当推理" },
          inputOutput: { answer: "输入训练语料、基准或微调样本，输出需用改写、时间外和能力回归评估。", evidence: "时间外基准、近重复审计、动态题" },
          mechanism: { answer: "重复罕见序列促进逐字记忆，小样本微调则快速适应措辞与模板。", evidence: "快速记住措辞与格式" },
          interpretation: { answer: "相似题高分而改写骤降支持污染，模板内好而模板外差支持微调过拟合。", evidence: "相似题异常高分，改写后骤降" },
          boundary: { answer: "参数高维和数据巨大不会自动消除记忆、隐私与评测污染风险。", evidence: "预训练可记住罕见、重复或高可识别序列" },
        },
        {
          section: 10,
          definition: { answer: "缓解过拟合是针对数据、模型、训练时长或评测边界采取不同干预。", evidence: "不同方法究竟在改变什么" },
          problem: { answer: "它避免把所有过拟合问题都简化成按下同一个“加正则”按钮。", evidence: "加正则”不是一个按钮" },
          inputOutput: { answer: "输入已识别的记忆路径，输出对应的数据、约束、早停或切分措施。", evidence: "手段 改变的环节" },
          mechanism: { answer: "数据扩大覆盖，增强声明不变性，参数约束限自由度，早停限拟合时间。", evidence: "限制继续拟合噪声的时间" },
          interpretation: { answer: "选择手段前要定位问题来自重复、自由度、训练过久还是证据污染。", evidence: "要先识别过拟合来自" },
          boundary: { answer: "训练与验证都差时继续加约束可能加重欠拟合，切分修复也不是模型正则。", evidence: "治疗错误病因" },
        },
      ],
      formulas: [
        {
          id: "overfitting-risks",
          section: 3,
          formulaIndex: 1,
          symbols: [
            { name: "R", meaning: "训练经验风险或部署期望风险", evidence: "训练经验风险，后者是部署分布上的期望风险" },
            { name: "f", meaning: "正在评估的预测模型", evidence: "模型究竟在最小化什么" },
            { name: "n", meaning: "训练样本数量", evidence: "有限样本估计" },
            { name: "i", meaning: "训练样本索引", evidence: "1/n Σᵢ" },
            { name: "L", meaning: "预测与目标之间的损失函数", evidence: "L 是衡量预测与目标差异的损失函数" },
            { name: "x", meaning: "样本输入", evidence: "xᵢ 与 yᵢ 是第 i 个样本的输入和目标" },
            { name: "y", meaning: "样本目标", evidence: "xᵢ 与 yᵢ 是第 i 个样本的输入和目标" },
            { name: "E", meaning: "对部署数据分布取期望", evidence: "部署分布上的期望风险" },
            { name: "P", meaning: "部署时的数据分布", evidence: "代表部署分布" },
          ],
        },
        {
          id: "overfitting-generalization-gap",
          section: 3,
          formulaIndex: 2,
          symbols: [
            { name: "R", meaning: "训练或验证集合上的经验风险", evidence: "训练增强、损失权重或样本难度" },
          ],
        },
      ],
    },

    "reinforcement-learning": {
      contractVersion: 2,
      examples: [{
        section: 7,
        evidence: {
          setup: "35 天质量问题退款",
          rule: "γ=0.9 的 G",
          steps: "直接承诺",
          interpretation: "若奖励只记录即时满意",
        },
      }],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "强化学习研究行动会改变后续情境的连续决策，并学习状态到动作的策略。", evidence: "强化学习 研究连续决策" },
          problem: { answer: "它解决没有逐步标准答案、只能从行动后果和延迟反馈学习的问题。", evidence: "机器怎样从行动后果中学习" },
          inputOutput: { answer: "策略输入当前状态，输出动作或动作概率；学习结果是一套决策策略。", evidence: "输入是当前状态，策略输出动作" },
          mechanism: { answer: "智能体选动作，环境返回奖励和下一状态，经验再用于更新策略。", evidence: "环境再返回 奖励 r 和 下一状态 s′" },
          interpretation: { answer: "策略要按长期后果评价，单步奖励最高的动作未必长期最好。", evidence: "必须把延迟后果也算进去" },
          boundary: { answer: "训练分布随策略变化；状态遗漏关键信息时算法无法恢复正确决策。", evidence: "再好的算法也无法区分" },
        },
        {
          section: 2,
          definition: { answer: "折扣回报是从当前时刻起把未来奖励按距离衰减后求和。", evidence: "把以后收到的奖励按远近加权后相加" },
          problem: { answer: "它把即时得失与延迟后果放进同一个可比较的长期目标。", evidence: "单步奖励可能与最终结果冲突" },
          inputOutput: { answer: "输入奖励序列和折扣因子，输出当前时刻的标量回报。", evidence: "Gₜ 是从 t 开始的折扣回报" },
          mechanism: { answer: "第 k 步后的奖励乘 γ 的 k 次方，再将所有加权奖励相加。", evidence: "γᵏ 让较远奖励权重逐步减小" },
          interpretation: { answer: "正回报表示折扣后的未来收益超过成本，不等于每一步奖励都为正。", evidence: "回报却说明这一步值得" },
          boundary: { answer: "γ 表达时间尺度和偏好，越大信用分配越难，并非越大越正确。", evidence: "不是越大越正确" },
        },
        {
          section: 3,
          definition: { answer: "价值函数估计从状态或状态—动作对出发、遵循策略的期望回报。", evidence: "价值函数 把未来许多种可能轨迹压成一个期望回报" },
          problem: { answer: "它在轨迹尚未结束时估计当前状态或动作的长期好坏。", evidence: "还没走完整条轨迹时" },
          inputOutput: { answer: "V 输入状态，Q 输入状态与首个动作，两者都输出期望回报估计。", evidence: "输入分别是状态或状态—动作对" },
          mechanism: { answer: "Bellman 递推把长期回报拆成一步奖励与下一状态的折扣价值。", evidence: "一步奖励 + 下一状态剩余价值" },
          interpretation: { answer: "价值是对策略与环境随机性的平均，单次幸运轨迹不能代表高价值。", evidence: "一次幸运轨迹不等于高价值" },
          boundary: { answer: "价值并非事实标签，近似 Q 对未见动作高估时最大化会放大错误。", evidence: "会对动作取最大值" },
        },
        {
          section: 4,
          definition: { answer: "探索是花一部分选择机会获取新信息、纠正动作价值估计误差。", evidence: "花一部分机会购买信息" },
          problem: { answer: "它防止策略永远选择当前看来最好、因而错过更优动作。", evidence: "可能永远学不到更好策略" },
          inputOutput: { answer: "输入各动作的收益估计、采样次数或策略概率，输出兼顾当前收益和信息价值的动作选择。", evidence: "估计收益＋不确定性奖励" },
          mechanism: { answer: "ε-greedy 保留随机机会，熵奖励维持多个动作概率，UCB 优先尝试可能好但证据不足的动作。", evidence: "以 1−ε 选择当前最优" },
          interpretation: { answer: "当前最优只表示已有有限样本下估计最高，并不等于真实平均收益最高。", evidence: "当前最优只是“根据已有样本估计最好”" },
          boundary: { answer: "高风险现实动作不应在线乱试，应使用模拟器、约束、离线实验、审批或回滚环境。", evidence: "不能用“需要探索”替无边界试错辩护" },
        },
        {
          section: 5,
          definition: { answer: "价值法间接从 Q 选动作，策略梯度直接调整参数化动作概率。", evidence: "价值法 先学习动作价值 Q" },
          problem: { answer: "它回答如何把回报与价值估计转化为更好的策略。", evidence: "有哪些办法把策略变得更好" },
          inputOutput: { answer: "算法输入状态、动作与回报经验，输出价值估计或更新后的策略参数。", evidence: "输入是状态—动作，输出每个动作的长期价值估计" },
          mechanism: { answer: "优势为正提高已选动作概率、为负降低；Actor–Critic 用 Critic 提供基线。", evidence: "A 为正就提高该动作概率" },
          interpretation: { answer: "优势表示动作相对该状态通常表现好多少，而不是一种新的奖励。", evidence: "它不是新奖励" },
          boundary: { answer: "PPO 只限制单次策略变化，不保证奖励正确、安全或最终任务改善。", evidence: "不保证奖励正确或策略安全" },
        },
        {
          section: 6,
          definition: { answer: "奖励是可计算目标代理，环境是动作产生训练可见后果的规则边界。", evidence: "奖励 是可计算的目标代理" },
          problem: { answer: "本节解释训练回报上升为何仍可能偏离真实目标并产生副作用。", evidence: "仍不能断言真实目标已经达成" },
          inputOutput: { answer: "训练输入状态与环境反馈，输出回报；验收还需真实任务和风险指标。", evidence: "同时报告奖励与真实任务指标" },
          mechanism: { answer: "策略主动搜索奖励或模拟环境的漏洞，从未计价行为中获利。", evidence: "主动寻找二者之间可利用的缝隙" },
          interpretation: { answer: "奖励改善必须结合独立环境、时间与风险切片，不能单独解释为成功。", evidence: "未参与训练的环境、时间段和风险切片" },
          boundary: { answer: "约束、回放和人工监督只能覆盖已检查副作用，不能证明未知失败不存在。", evidence: "不能证明所有未知失败都已覆盖" },
        },
        {
          section: 7,
          definition: { answer: "退款例把状态、动作、延迟奖励、回报与 TD 信用分配组成一个 MDP。", evidence: "一次退款处理怎样成为 MDP" },
          problem: { answer: "它展示即时满意较高的动作为何可能因后续损失而长期更差。", evidence: "立即承诺的短期奖励可能低于" },
          inputOutput: { answer: "输入订单状态与两个动作的奖励序列，输出各自折扣回报和动作选择。", evidence: "γ=0.9 的 G" },
          mechanism: { answer: "按折扣计算两条轨迹，并用 TD 将下一状态价值传回当前动作。", evidence: "时序差分可用" },
          interpretation: { answer: "先核验的回报为正且高于直接承诺，说明短期摩擦可换来长期正确。", evidence: "核验虽有即时摩擦" },
          boundary: { answer: "状态缺少权限、日期或证据时，精确奖励也补不回丢失的决策信息。", evidence: "奖励再精确也补不回" },
        },
        {
          section: 8,
          definition: { answer: "本节汇总在线探索、离线外推、奖励投机、策略突变和环境漂移的失效路径。", evidence: "探索、离线数据和策略更新怎样失效" },
          problem: { answer: "它解决高风险系统不能通过在线随机试错获得所有经验的问题。", evidence: "不能让退款助手在线随机尝试越权动作" },
          inputOutput: { answer: "输入模拟、日志或受控交互经验，输出受约束的策略与风险证据。", evidence: "模拟器、历史日志或受限沙箱" },
          mechanism: { answer: "安全集合限制动作，保守估计约束未见动作，分阶段闸门限制更新风险。", evidence: "保守估计、行为约束" },
          interpretation: { answer: "应联合监控 KL、关键行为回归和真实环境指标，而非只看 PPO 损失。", evidence: "同时监控 KL、关键行为回归和真实环境指标" },
          boundary: { answer: "PPO 裁剪只限制单步变化，多步累积仍可远离参考策略且不证明安全。", evidence: "不证明长期安全" },
        },
      ],
      formulas: [
        {
          id: "rl-discounted-return",
          section: 2,
          formulaIndex: 1,
          symbols: [
            { name: "G", meaning: "从当前时刻开始的折扣回报", evidence: "从 t 开始的折扣回报" },
            { name: "t", meaning: "当前决策时刻", evidence: "t 是当前时刻" },
            { name: "k", meaning: "奖励距离当前的步数", evidence: "k 表示奖励距离现在多少步" },
            { name: "γ", meaning: "未来奖励的折扣因子", evidence: "γ （gamma）是 0 到 1 之间的 折扣因子" },
            { name: "r", meaning: "对应未来时刻收到的奖励", evidence: "是对应未来奖励" },
          ],
        },
        {
          id: "rl-bellman-value",
          section: 3,
          formulaIndex: 1,
          symbols: [
            { name: "V", meaning: "状态在策略下的期望回报", evidence: "Vπ(s) 回答" },
            { name: "π", meaning: "从状态选择动作的策略", evidence: "遵循策略 π" },
            { name: "s", meaning: "当前状态", evidence: "从状态 s 出发" },
            { name: "s′", meaning: "执行动作后的下一状态", evidence: "s′ 是执行动作后的下一状态" },
            { name: "E", meaning: "对策略与环境随机性取期望", evidence: "同时平均策略选择与环境随机性" },
            { name: "r", meaning: "当前转移得到的一步奖励", evidence: "一步奖励" },
            { name: "γ", meaning: "下一状态价值的折扣因子", evidence: "γ 是上一节定义的折扣因子" },
          ],
        },
        {
          id: "rl-policy-gradient",
          section: 5,
          formulaIndex: 1,
          symbols: [
            { name: "J", meaning: "策略要最大化的期望回报目标", evidence: "J 是期望回报目标" },
            { name: "θ", meaning: "参数化策略的可学习参数", evidence: "调整参数 θ" },
            { name: "π", meaning: "给状态分配动作概率的策略", evidence: "策略 πθ(a|s) 输出动作概率" },
            { name: "s", meaning: "策略观察到的状态", evidence: "状态—动作" },
            { name: "a", meaning: "策略在状态中选择的动作", evidence: "已选动作概率" },
            { name: "A", meaning: "动作相对状态基线的优势", evidence: "优势 A(s,a) 表示" },
            { name: "E", meaning: "对交互经验取平均", evidence: "核心更新信号" },
          ],
        },
      ],
    },

    "loss-function": {
      contractVersion: 2,
      examples: [{
        section: 7,
        evidence: {
          setup: "我们用最简单的一条直线模型",
          rule: "取半平方损失",
          steps: "前向预测",
          interpretation: "一次更新只证明这一步让当前损失下降",
        },
      }],
      termReviews: [{
        section: 3,
        reviewedAt: "2026-07-26",
        terms: [
          {
            name: "似然",
            meaning: "噪声模型让已观察误差出现得多合理",
            purpose: "比较不同参数对训练数据的解释程度",
            definitionEvidence: "似然 表示某个噪声模型让已观察误差出现得有多合理",
            purposeEvidence: "用来比较不同参数对数据的解释程度",
          },
          {
            name: "对数似然",
            meaning: "许多样本概率乘积取对数后得到的和",
            purpose: "转成可稳定求和并可最小化的损失",
            definitionEvidence: "对数似然 把许多样本概率的乘法变成加法",
            purposeEvidence: "取负后就能作为需要最小化的损失",
          },
        ],
      }],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "损失函数把预测与目标的差异转换成可比较、可求导的标量。", evidence: "接收预测与目标，输出一个数" },
          problem: { answer: "它解决一句笼统的好坏评价无法指导大量参数分别更新的问题。", evidence: "怎样决定每个参数往哪边动" },
          inputOutput: { answer: "输入预测值与目标值，输出一个通常越小越好的数值。", evidence: "损失函数 L(ŷ,y)" },
          mechanism: { answer: "损失的局部斜率把结果好坏连接到每个参数的变化方向。", evidence: "这个数的斜率把“结果好坏”连接到参数变化" },
          interpretation: { answer: "损失大小只在相同数据、定义和归一化口径下可直接比较。", evidence: "数值才可直接比较" },
          boundary: { answer: "单一标量会掩盖不同样本、群体和错误类型的差异与价值取舍。", evidence: "压成一个数也会丢信息" },
        },
        {
          section: 2,
          definition: { answer: "经验风险是有限训练集上所有单样本损失的平均。", evidence: "训练数据上的平均损失，也叫" },
          problem: { answer: "它把一次预测的错误汇总成训练程序可整体降低的目标。", evidence: "整个训练集又应该优化什么" },
          inputOutput: { answer: "输入样本、标签和模型参数，输出单样本损失、批量损失或总体目标。", evidence: "xᵢ 是输入， yᵢ 是目标" },
          mechanism: { answer: "逐样本计算损失后求平均，必要时再加权加入正则项。", evidence: "所有单样本损失相加再除以" },
          interpretation: { answer: "J 表示整体训练目标，不再是某一个样本的损失。", evidence: "已经不是某一个样本的损失" },
          boundary: { answer: "训练经验风险只针对有限训练集，可能与未来样本的平均风险有差距。", evidence: "两者之间可能存在差距" },
        },
        {
          section: 3,
          definition: { answer: "MSE、MAE 和 Huber 是对回归误差采用不同增长形状的损失。", evidence: "误差增大时，代价增长多快" },
          problem: { answer: "它们决定普通误差和离群误差应以多大力量影响模型。", evidence: "会学出不同模型" },
          inputOutput: { answer: "输入预测误差 e，输出平方、绝对值或分段形式的损失。", evidence: "令误差 e=ŷ−y" },
          mechanism: { answer: "损失曲线斜率决定不同大小误差产生的梯度强弱。", evidence: "形状决定不同误差能产生多大的梯度" },
          interpretation: { answer: "MSE 偏向均值，MAE 偏向中位数，Huber 在敏感与稳健间折中。", evidence: "在均值敏感性与中位数稳健性之间折中" },
          boundary: { answer: "不能只按噪声分布名称选择损失，还要结合真实业务错误代价。", evidence: "不能只看分布名称" },
        },
        {
          section: 4,
          definition: { answer: "分类交叉熵是模型分给真实类别概率的负对数。", evidence: "单样本交叉熵就是这个概率的负对数" },
          problem: { answer: "它区分同样分类错误中犹豫地错和非常自信地错。", evidence: "为什么只看“猜没猜中”还不够" },
          inputOutput: { answer: "输入样本、真实类别和预测概率，输出单样本对数损失。", evidence: "分给真实类别 y 的概率" },
          mechanism: { answer: "对真实类别概率取负对数，概率越接近零惩罚增长越快。", evidence: "重罚“自信地错”" },
          interpretation: { answer: "损失越小表示模型平均给真实类别分配了更高概率。", evidence: "提高模型赋给训练数据的联合概率" },
          boundary: { answer: "交叉熵只衡量概率预测，不直接保证事实、指令遵循或安全。", evidence: "不直接保证事实正确" },
        },
        {
          section: 5,
          definition: { answer: "可微代理是能频繁计算并提供局部斜率、暂时代替真实目标的训练信号。", evidence: "因此“可微代理”就是" },
          problem: { answer: "它解决准确率、成交率和满意度难以直接为每次更新提供梯度的问题。", evidence: "为什么不直接让优化器最大化它" },
          inputOutput: { answer: "训练输入可微代理得到更新，验证再输出真实任务和产品指标。", evidence: "真实指标则在验证阶段检查" },
          mechanism: { answer: "代理随参数平滑变化，因而能计算可用于更新的局部斜率。", evidence: "从而能计算有用的局部斜率" },
          interpretation: { answer: "代理下降只有在独立指标也改善时，才支持真实目标随之改善。", evidence: "代理下降是否真的带来想要的结果" },
          boundary: { answer: "真实目标可能延迟、稀疏且受模型外因素影响，代理也可能与其错位。", evidence: "同时受价格、界面、库存等模型之外因素影响" },
        },
        {
          section: 6,
          definition: { answer: "权重、掩码和正则项共同规定哪些错误进入目标以及占多大分量。", evidence: "怎样进入同一个标量" },
          problem: { answer: "它们处理类别不平衡、无效位置、高代价错误和模型复杂度约束。", evidence: "类别不平衡、不同 token 或高代价错误" },
          inputOutput: { answer: "输入分项损失及选择规则，输出经过重加权、筛选或约束的训练目标。", evidence: "掩码决定哪些位置根本不计入目标" },
          mechanism: { answer: "权重放大梯度，掩码移除位置，正则项把额外偏好加入总目标。", evidence: "样本权重会放大某些案例的梯度" },
          interpretation: { answer: "提高少数类权重可能提升召回，同时增加误报并改变概率含义。", evidence: "提高少数类召回可能增加误报" },
          boundary: { answer: "重加权后的结果必须回到自然验证分布和关键切片重新测量。", evidence: "必须在未重加权的验证分布" },
        },
        {
          section: 7,
          definition: { answer: "本例展示单个回归误差怎样经损失和梯度推动参数更新。", evidence: "一个误差怎样推动参数" },
          problem: { answer: "它把抽象的训练信号落实成可以逐项核对的数值闭环。", evidence: "一串可以逐项核对的数字" },
          inputOutput: { answer: "输入初始 w=2 和样本 x=2、y=6，输出更新后的 w=2.4 与更小损失。", evidence: "初始参数设为 w=2" },
          mechanism: { answer: "先前向预测并计算半平方损失，再用梯度和学习率更新参数。", evidence: "取半平方损失" },
          interpretation: { answer: "负梯度把 w 推向更接近真实三倍关系的方向，使当前损失下降。", evidence: "把 w 从 2 推向了更接近 3 的 2.4" },
          boundary: { answer: "一次更新只证明当前样本当前一步改善，不证明完整规律或泛化。", evidence: "不证明已经学会完整规律或能够泛化" },
        },
        {
          section: 8,
          definition: { answer: "损失曲线是训练代理随步骤变化的汇总记录，不是完整质量报告。", evidence: "损失曲线会怎样欺骗你" },
          problem: { answer: "它揭示平均训练损失下降仍可能掩盖的严重失败。", evidence: "还有哪些严重问题完全看不出来" },
          inputOutput: { answer: "输入训练和分项曲线，输出关于优化状态的有限诊断线索。", evidence: "训练损失很低" },
          mechanism: { answer: "平均与聚合会遮住少数群体、子目标、口径变化和代理错位。", evidence: "少数群体或长尾任务恶化" },
          interpretation: { answer: "每种表面改善都要配合切片、验证、人工或线上指标解释。", evidence: "按群体、难度和场景切片" },
          boundary: { answer: "不同归一化、权重或损失定义下的曲线数值不能直接比较。", evidence: "归一化或权重定义不同" },
        },
        {
          section: 9,
          definition: { answer: "损失选择是从真实决策和错误代价到代理、验证与监控的完整流程。", evidence: "怎样为一个任务选择并验证损失" },
          problem: { answer: "它解决面对新任务时不应只从现成公式列表盲选损失的问题。", evidence: "还是从错误代价开始" },
          inputOutput: { answer: "输入真实决策、输出语义和风险约束，输出经验证的训练损失方案。", evidence: "模型输出会触发什么动作" },
          mechanism: { answer: "依次定义语义、选择代理、手算检查、基线实验、独立验证和上线监控。", evidence: "同时报告代理损失、任务指标、校准和关键切片" },
          interpretation: { answer: "方案有效需训练信号连通且独立任务指标与关键切片共同改善。", evidence: "确认小数据上能过拟合" },
          boundary: { answer: "上线后仍须监控收益、伤害和分布漂移，不能让代理取代产品目标。", evidence: "不让训练目标替代产品目标" },
        },
      ],
      formulas: [
        {
          id: "loss-single-sample",
          section: 2,
          formulaIndex: 1,
          symbols: [
            { name: "L", meaning: "一个样本的损失", evidence: "得到这个样本的损失" },
            { name: "i", meaning: "样本编号", evidence: "先看第 i 个样本" },
            { name: "f", meaning: "参数化模型的预测函数", evidence: "模型预测写成" },
            { name: "θ", meaning: "模型参数集合", evidence: "模型参数统称为 θ" },
            { name: "x", meaning: "样本输入", evidence: "xᵢ 是输入" },
            { name: "y", meaning: "样本目标", evidence: "yᵢ 是目标" },
          ],
        },
        {
          id: "loss-empirical-risk",
          section: 2,
          formulaIndex: 2,
          symbols: [
            { name: "J", meaning: "训练数据上的平均损失", evidence: "字母 J 用来提醒我们" },
            { name: "θ", meaning: "模型参数集合", evidence: "模型参数统称为 θ" },
            { name: "n", meaning: "训练样本总数", evidence: "训练集共有 n 个样本" },
            { name: "i", meaning: "样本编号", evidence: "先看第 i 个样本" },
            { name: "L", meaning: "每个样本的损失", evidence: "所有单样本损失相加" },
          ],
        },
        {
          id: "loss-total-objective",
          section: 2,
          formulaIndex: 3,
          symbols: [
            { name: "J", meaning: "训练程序整体降低的目标", evidence: "训练程序要整体降低的目标" },
            { name: "θ", meaning: "模型参数集合", evidence: "模型参数统称为 θ" },
            { name: "λ", meaning: "正则项权重", evidence: "λ 决定这项约束占多大分量" },
            { name: "R", meaning: "对不希望出现的参数特征的惩罚", evidence: "R(θ) 衡量不希望出现的参数特征" },
          ],
        },
        {
          id: "loss-huber",
          section: 3,
          formulaIndex: 1,
          symbols: [
            { name: "L", meaning: "Huber 单样本损失", evidence: "Huber 需要一个转折阈值" },
            { name: "δ", meaning: "平方段与线性段的转折阈值", evidence: "转折阈值 δ" },
            { name: "e", meaning: "预测值减真实值的误差", evidence: "令误差 e=ŷ−y" },
          ],
        },
        {
          id: "loss-classification-cross-entropy",
          section: 4,
          formulaIndex: 1,
          symbols: [
            { name: "L", meaning: "单样本交叉熵损失", evidence: "单样本交叉熵" },
            { name: "p", meaning: "模型分给真实类别的概率", evidence: "分给真实类别 y 的概率" },
            { name: "θ", meaning: "分类模型参数", evidence: "参数是 θ 的模型" },
            { name: "x", meaning: "分类输入", evidence: "看到输入 x 后" },
            { name: "y", meaning: "真实类别", evidence: "真实类别 y" },
          ],
        },
      ],
    },

    "gradient-descent": {
      contractVersion: 2,
      examples: [{
        section: 9,
        evidence: {
          setup: "看到损失不降时",
          rule: "先做“小样本记忆测试”",
          steps: "核对预测和损失输入",
          interpretation: "训练损失下降更快只说明代理目标优化更快",
        },
      }],
      sectionContracts: [
        {
          section: 1,
          definition: { answer: "梯度是损失对全部参数偏导数按顺序组成的向量。", evidence: "把所有参数的偏导数按顺序排成一个向量" },
          problem: { answer: "它用当前位置的局部斜率回答参数下一小步应往哪里移动。", evidence: "下一小步该怎么选" },
          inputOutput: { answer: "输入当前参数位置与损失，输出每个参数方向的局部敏感度。", evidence: "当前位置往各方向倾斜多少" },
          mechanism: { answer: "逐个固定其他参数求偏导，再把全部偏导组合成梯度。", evidence: "把其他参数固定" },
          interpretation: { answer: "正分量表示参数增大会使损失上升，负分量表示相反。", evidence: "第一个参数增大时损失上升得很快" },
          boundary: { answer: "梯度只描述当前位置附近，不提供远处地形或全局最优位置。", evidence: "不知道远处最低点在哪里" },
        },
        {
          section: 2,
          definition: { answer: "负梯度是在当前参数空间几何下，与梯度完全相反的方向。", evidence: "也就是负梯度" },
          problem: { answer: "它解释固定短步长度时，哪个方向的一阶预测下降最多。", evidence: "为什么负梯度在局部下降最快" },
          inputOutput: { answer: "输入当前梯度和允许步长，输出局部最陡下降的位移方向。", evidence: "Δθ 表示准备迈出的一小步" },
          mechanism: { answer: "局部损失变化由梯度与位移点积近似，反向使该点积最负。", evidence: "完全朝梯度反方向走会让这个点积最负" },
          interpretation: { answer: "结论只在一阶局部近似和指定欧氏长度下成立。", evidence: "当前位置附近、同样短的一步" },
          boundary: { answer: "它不保证到达全局最低点，参数缩放或预条件也会改变有效方向。", evidence: "不保证通往全局最低点" },
        },
        {
          section: 3,
          definition: { answer: "梯度下降更新式用学习率缩放梯度，并从当前参数中减去它。", evidence: "前面的减号表示朝梯度反方向走" },
          problem: { answer: "它把抽象的局部下降方向变成训练循环真正执行的参数一步。", evidence: "训练循环里真正执行的一步" },
          inputOutput: { answer: "输入当前参数、梯度和学习率，输出下一次更新后的参数。", evidence: "更新前的全部参数" },
          mechanism: { answer: "学习率控制沿负梯度移动距离，更新索引 t 记录连续步骤。", evidence: "控制这次沿梯度走多远" },
          interpretation: { answer: "示例中负梯度使参数从错误初值二向理想值三靠近。", evidence: "当前错误初始值为 2" },
          boundary: { answer: "方向正确仍可能被过大学习率用坏，使损失上升而非下降。", evidence: "同一个正确梯度，被过大步长用坏了" },
        },
        {
          section: 4,
          definition: { answer: "曲率描述参数移动时损失斜率改变得有多快。", evidence: "曲率 描述斜率变化得有多快" },
          problem: { answer: "它解释学习率为什么有稳定上限以及为何会越过谷底。", evidence: "学习率为什么存在稳定上限" },
          inputOutput: { answer: "输入损失曲率和学习率，输出误差收缩、震荡或发散的行为。", evidence: "括号里的数决定误差怎样变化" },
          mechanism: { answer: "误差每步乘以由学习率决定的倍率，绝对值小于一才收缩。", evidence: "绝对值小于 1 才会逐步收缩" },
          interpretation: { answer: "倍率为负表示跨越最优点，绝对值大于一表示误差放大。", evidence: "为负表示每一步越过最优点" },
          boundary: { answer: "一维二次函数给出清楚边界，但真实神经网络并非完美二次碗。", evidence: "真实神经网络不是一个完美二次碗" },
        },
        {
          section: 5,
          definition: { answer: "狭长谷地是不同参数方向曲率差异很大的损失地形。", evidence: "两个参数方向陡峭程度相差很大的损失地形" },
          problem: { answer: "它解释普通梯度为何横向来回摆动而沿低损失方向前进缓慢。", evidence: "为什么让普通梯度之字形前进" },
          inputOutput: { answer: "输入多参数损失地形，输出受曲率差异影响的优化轨迹。", evidence: "损失由两个参数决定" },
          mechanism: { answer: "陡坡方向主导梯度，统一学习率又被该方向的稳定上限限制。", evidence: "梯度常被两侧陡坡主导" },
          interpretation: { answer: "椭圆越狭长，最大与最小曲率比越大，条件越差。", evidence: "这个比值常用“条件数”概括" },
          boundary: { answer: "动量只能改善持续方向与往返摆动，并不会改变错误目标。", evidence: "部分抵消左右交替的摆动" },
        },
        {
          section: 6,
          definition: { answer: "mini-batch 用随机小批样本的平均梯度估计全量梯度并立即更新。", evidence: "只随机抽取一小组样本求平均，然后立刻更新" },
          problem: { answer: "它在梯度精度、更新反馈频率、显存和计算吞吐之间折中。", evidence: "为什么故意使用不精确梯度" },
          inputOutput: { answer: "输入随机样本批次，输出带抽样误差但可频繁计算的梯度。", evidence: "某一步会有抽样误差" },
          mechanism: { answer: "合理抽样使小批梯度平均指向全量梯度，同时单步带噪声。", evidence: "平均来看指向全量梯度" },
          interpretation: { answer: "硬件效率要看单位时间吞吐、计算单元利用、显存与通信。", evidence: "单位时间能处理多少样本" },
          boundary: { answer: "批量并非越大越好，过大会增加显存同步并减少更新次数。", evidence: "批量过大，会占用更多显存" },
        },
        {
          section: 7,
          definition: { answer: "优化器规定拿到梯度后如何利用当前与历史信息更新参数。", evidence: "拿到梯度后怎样更新参数" },
          problem: { answer: "SGD、动量和 Adam 处理批次噪声、狭长谷地及各参数尺度差异。", evidence: "从 SGD 到动量和 Adam" },
          inputOutput: { answer: "输入当前梯度及可选历史状态，输出参数更新量和新的历史状态。", evidence: "它每一步拿当前小批梯度" },
          mechanism: { answer: "SGD 直接更新，动量平均方向，Adam 还按平方梯度尺度调整步长。", evidence: "Adam 同时保存两种历史" },
          interpretation: { answer: "历史一致方向会累积，交替方向会抵消，不同坐标可获不同有效步长。", evidence: "左右交替的分量会互相抵消" },
          boundary: { answer: "Adam 增加状态且不保证所有任务最优，也不能修复错误损失或数据。", evidence: "默认设置不保证所有任务或泛化都最好" },
        },
        {
          section: 8,
          definition: { answer: "预热、衰减与裁剪分别控制初期步长、后期步长和异常梯度。", evidence: "分别控制训练初期、训练后期和偶发异常步" },
          problem: { answer: "它们针对训练不同阶段的不稳定、震荡和偶发巨大更新。", evidence: "分别解决什么" },
          inputOutput: { answer: "输入训练步数或梯度长度，输出调整后的学习率或受限梯度。", evidence: "若超过阈值 C，就按比例缩短这次梯度" },
          mechanism: { answer: "预热逐渐升率，衰减逐渐降率，裁剪仅在超阈值时缩放梯度。", evidence: "前若干步从很小值逐渐升上去" },
          interpretation: { answer: "应分别观察初期发散、后期震荡以及裁剪触发频率和幅度。", evidence: "多少步触发、裁掉多少" },
          boundary: { answer: "三者不可互换，也不能修复错误目标、持续爆炸根因或长期过大学习率。", evidence: "不能消除持续梯度爆炸的根因" },
        },
        {
          section: 9,
          definition: { answer: "训练停滞诊断是沿数据、损失、梯度、更新、超参与验证逐层定位断点。", evidence: "先确认信号在哪一环断掉" },
          problem: { answer: "它避免损失不降时盲目更换优化器而掩盖真正故障。", evidence: "不要一上来就换 Adam 碰运气" },
          inputOutput: { answer: "输入样本、预测、损失、梯度和更新日志，输出可验证的故障假设。", evidence: "输入、目标、预测和单样本损失" },
          mechanism: { answer: "先做小样本记忆，再查输入、梯度、更新比率、学习率短跑和单变量比较。", evidence: "先做“小样本记忆测试”" },
          interpretation: { answer: "零梯度、巨大尖峰或更新比率近零分别指向不同链路故障。", evidence: "梯度非零但这个比率接近 0" },
          boundary: { answer: "训练代理下降更快不等于真实任务更好，停止仍需独立验证决定。", evidence: "停止点仍应由未参与更新的数据" },
        },
      ],
      formulas: [
        {
          id: "gradient-first-order-approximation",
          section: 2,
          formulaIndex: 1,
          symbols: [
            { name: "J", meaning: "当前训练目标", evidence: "J 是训练目标" },
            { name: "θ", meaning: "当前全部模型参数", evidence: "θ 表示当前全部参数" },
            { name: "Δθ", meaning: "准备迈出的参数变化", evidence: "Δθ 表示准备迈出的一小步" },
            { name: "∇", meaning: "训练目标关于参数的梯度", evidence: "梯度把每个参数" },
          ],
        },
        {
          id: "gradient-steepest-direction",
          section: 2,
          formulaIndex: 2,
          symbols: [
            { name: "Δθ", meaning: "固定长度的参数变化", evidence: "Δθ 表示准备迈出的一小步" },
            { name: "ε", meaning: "这一步的欧氏长度", evidence: "欧氏长度固定为 ε" },
            { name: "J", meaning: "训练目标", evidence: "J 是训练目标" },
            { name: "∇", meaning: "训练目标的梯度", evidence: "梯度向量的长度" },
          ],
        },
        {
          id: "gradient-update",
          section: 3,
          formulaIndex: 1,
          symbols: [
            { name: "θ", meaning: "更新前后的模型参数", evidence: "更新前的全部参数" },
            { name: "t", meaning: "当前更新编号", evidence: "t 是当前第几次更新" },
            { name: "η", meaning: "控制更新距离的学习率", evidence: "读作 eta" },
            { name: "g", meaning: "当前位置或小批量估计的梯度", evidence: "当前位置的梯度" },
          ],
        },
        {
          id: "gradient-quadratic-example",
          section: 4,
          formulaIndex: 1,
          symbols: [
            { name: "J", meaning: "贯穿示例的半平方损失", evidence: "代入半平方损失" },
            { name: "w", meaning: "直线模型的倍数参数", evidence: "w 仍是模型要学习的倍数参数" },
            { name: "g", meaning: "损失关于参数 w 的梯度", evidence: "g(w) 是损失对 w 的梯度" },
          ],
        },
        {
          id: "gradient-error-recurrence",
          section: 4,
          formulaIndex: 2,
          symbols: [
            { name: "e", meaning: "当前参数离最优值的距离", evidence: "定义当前参数离最优值的距离" },
            { name: "t", meaning: "更新编号", evidence: "更新一步后" },
            { name: "η", meaning: "控制每次参数更新距离的学习率", evidence: "学习率 η" },
          ],
        },
        {
          id: "gradient-sgd-update",
          section: 7,
          formulaIndex: 1,
          symbols: [
            { name: "θ", meaning: "模型参数", evidence: "直接更新" },
            { name: "t", meaning: "更新编号", evidence: "t 是当前第几次更新", section: 3 },
            { name: "η", meaning: "控制每次参数更新距离的学习率", evidence: "控制这次沿梯度走多远", section: 3 },
            { name: "g", meaning: "当前小批梯度", evidence: "当前小批梯度" },
          ],
        },
        {
          id: "gradient-momentum-update",
          section: 7,
          formulaIndex: 2,
          symbols: [
            { name: "v", meaning: "保留历史梯度的速度状态", evidence: "增加一个“速度” v" },
            { name: "t", meaning: "更新编号", evidence: "t 是当前第几次更新", section: 3 },
            { name: "β", meaning: "动量的记忆系数", evidence: "β 控制记忆有多长" },
            { name: "g", meaning: "当前小批梯度", evidence: "当前小批梯度" },
            { name: "θ", meaning: "模型参数", evidence: "决定怎样使用梯度更新参数" },
            { name: "η", meaning: "控制每次参数更新距离的学习率", evidence: "控制这次沿梯度走多远", section: 3 },
          ],
        },
      ],
    },
    "constitutional-ai": {
      contractVersion: 1,
      examples: [
        {
          section: 4,
          evidence: {
            setup: "用户要求“直接保证全额退款，不要核对订单”时",
            rule: "真实性和权限是硬约束",
            steps: "删去无证据保证",
            interpretation: "帮助性只在可行集合 B/C 内排序",
          },
        },
      ],
      formulas: [],
    },
    "tool-calling": {
      contractVersion: 2,
      examples: [{
        section: 2,
        evidence: {
          setup: "天气只读可自动，通知写操作暂停确认",
          rule: "执行器校验并调用",
          steps: "结果以不可信工具数据回传",
          interpretation: "每个调用都记录 ID、授权和结果"
        }
      }],
      formulas: [],
      termReviews: [
        { section: 2, reviewedAt: "2026-07-27", terms: [
          { name: "schema", meaning: "规定工具名称参数类型必填字段和返回结构的机器契约", purpose: "让编排器可靠解析并校验模型提出的调用", definitionEvidence: "工具 schema", purposeEvidence: "执行器校验并调用" }
        ]},
        { section: 3, reviewedAt: "2026-07-27", terms: [
          { name: "API", meaning: "外部程序按约定请求和返回数据或动作的接口", purpose: "由持有凭证的执行器真正访问外部能力", definitionEvidence: "API 凭证", purposeEvidence: "制造副作用" }
        ]},
        { section: 4, reviewedAt: "2026-07-27", terms: [
          { name: "JSON", meaning: "用对象字段数组数值字符串表达结构化数据的文本格式", purpose: "把工具名和参数变成程序可可靠读取的数据", definitionEvidence: "JSON 或专用消息", purposeEvidence: "解决程序怎样读取意图" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["工具调用让模型以结构化意图请求外部程序查算或执行。","输出结构化调用意图、工具结果与基于结果的回答"],
          ["它解决模型无法触达实时私有数据和真实副作用。","无法获取实时私有数据、精确执行和真实副作用"],
          ["输入任务知识工具说明外部状态，输出调用结果回答。","输入用户任务、模型已有知识、可用工具说明和实时外部状态"],
          ["模型请求能力，执行器调用外部系统并回传结果。","模型只能请求能力，不能自行操作外部系统"],
          ["工具结果扩展可用事实但仍可能错误需验证。","工具结果也可能错误"],
          ["模型本身不能拥有或直接执行外部系统权限。","不能自行操作外部系统"]
        ]),
        six(2, [
          ["五步流程把工具说明调用意图执行观察与回答串联。","输出工具选择参数、执行结果、观察与最终回答"],
          ["它解决模型调用工具背后实际发生哪些步骤。","编排器先向模型提供工具契约"],
          ["输入问题 schema 权限策略，输出调用观察回答。","输入用户问题、工具 schema、当前权限和副作用策略"],
          ["提供契约生成调用校验执行回传数据再继续。","模型生成调用，执行器校验并调用"],
          ["天气只读可自动而通知写操作必须确认。","天气只读可自动，通知写操作暂停确认"],
          ["每个动作需调用 ID 授权者和结果审计。","记录 ID、授权和结果"]
        ]),
        six(3, [
          ["执行边界分开模型候选意图和编排层真实副作用。","输出允许、拒绝、请求确认或校验错误"],
          ["它解决是否模型权重自己去调用天气 API 的误解。","模型权重只产生候选意图"],
          ["输入工具参数主体资源权限规则，输出执行决定。","输入模型生成的工具名参数、当前主体、资源、动作权限和业务规则"],
          ["编排层持有凭证并在授权校验后制造副作用。","编排层才有 API 凭证并制造副作用"],
          ["平台隐藏执行器不改变意图和执行责任分离。","这条责任边界仍存在"],
          ["模型自信或文字不能成为业务授权依据。","模型自信不能替代授权"]
        ]),
        six(4, [
          ["结构协议规定工具名参数类型必填枚举和消息通道。","输出可解析请求或结构错误"],
          ["它解决程序怎样准确解析模型想调用什么参数。","解决程序怎样读取意图"],
          ["输入工具 schema 字段通道，输出请求或错误。","输入工具名、参数 schema、必填项、类型枚举和调用通道"],
          ["按 JSON 或专用消息解析后继续业务与权限校验。","JSON 或专用消息"],
          ["解析成功只证明形状合法不证明语义安全。","解析成功只证明形状合法"],
          ["工具描述用于选择，不能授予执行权限。","不是权限授予"]
        ]),
        six(5, [
          ["工具调用是一项结构化行动，Agent 是围绕目标的受控多轮系统。","输出单次工具调用或多轮 Agent 轨迹"],
          ["它解决工具调用和 AI Agent 究竟是什么关系。","一次天气查询不自动成为 Agent"],
          ["输入动作观察目标循环，输出调用或轨迹分类。","输入一次结构化动作、工具观察、目标状态和循环控制"],
          ["工具实现行动，Agent 加规划状态反馈预算终止权限。","Agent 还需要规划、状态、反馈、预算、终止和权限"],
          ["观察改变下一步才形成 Agent 的反馈闭环。","观察改变下一步时才构成闭环"],
          ["单次工具请求本身不等于自主 Agent。","不自动成为 Agent"]
        ]),
        six(6, [
          ["工具安全在不可信输入到真实副作用之间强制最小权限和确认。","输出安全执行、拒绝或人工批准"],
          ["它解决提示注入接上工具后怎样放大破坏面。","提示注入不能扩大权限"],
          ["输入内容调用风险权限沙箱确认，输出安全决定。","输入不可信网页邮件、候选调用、工具风险、可逆性、权限、沙箱和确认"],
          ["最小权限沙箱业务校验并对高危动作确认。","高危动作执行前确认"],
          ["工具返回恶意文字仍是数据而非授权指令。","恶意文字仍是数据"],
          ["schema 校验不能替代资源归属和业务授权。","schema 之外的业务授权"]
        ]),
        six(7, [
          ["工具设计评测同时衡量选择参数授权执行与最终任务。","输出选择正确率、schema 通过率、授权拒绝、任务完成、重复副作用、延迟和错误归因"],
          ["它解决模型老选错工具传错参数时怎样诊断改善。","按需只暴露相关工具"],
          ["输入工具说明约束故障样本，输出分层指标。","输入工具集合、名称描述、参数约束和故障样本"],
          ["按需暴露工具并用枚举必填减少参数空间，再故障注入。","参数优先枚举必填"],
          ["分层指标区分模型选择问题和执行器运行问题。","选择正确但执行失败应查执行器"],
        ["最终回答正确但越权或重复副作用仍判失败。","最终回答正确但调用了越权工具不能算成功"]
        ])
      ]
    },
    react: {
      contractVersion: 2,
      examples: [{
        section: 3,
        evidence: {
          setup: "官方报告目标、主体年份币种口径",
          rule: "读取同一合并表 120/100",
          steps: "再算 (120−100)/100",
          interpretation: "新闻 130 因不同口径被排除"
        }
      }],
      formulas: [
        { id: "react-feedback-loop", section: 2, formulaIndex: 1, symbols: [
          { name: "h", meaning: "根据当前证据形成的可审计最小假设或决策摘要", evidence: "输出假设 ht" },
          { name: "t", meaning: "当前 ReAct 交互轮次编号", evidence: "历史 Ht" },
          { name: "reason", meaning: "根据问题和历史形成当前假设的决策过程", evidence: "先根据缺口形成最小假设" },
          { name: "q", meaning: "用户需要解决并保持受保护的问题目标", evidence: "输入问题 q" },
          { name: "H", meaning: "之前结构化动作和带来源观察的历史", evidence: "历史 Ht" },
          { name: "a", meaning: "为消除当前关键缺口而选择的结构化候选动作", evidence: "候选动作 at" },
          { name: "choose", meaning: "根据假设和可用工具选择取证动作的过程", evidence: "再选择取证动作" },
          { name: "tools", meaning: "当前允许调用的检索计算与环境工具集合", evidence: "工具集合" },
          { name: "o", meaning: "环境返回的内容来源状态码或错误观察", evidence: "环境观察 ot" },
          { name: "environment", meaning: "执行动作并返回真实观察的外部环境", evidence: "环境返回来源与错误状态" }
        ]},
        { id: "react-action-score", section: 6, formulaIndex: 1, symbols: [
          { name: "Score", meaning: "候选动作信息收益扣除成本风险后的设计优先分数", evidence: "输出行动分数 Score(a)" },
          { name: "a", meaning: "正在评估是否值得执行的候选工具动作", evidence: "候选动作 a" },
          { name: "ΔU", meaning: "执行动作后预期消除的关键不确定性", evidence: "预期不确定性下降 ΔU" },
          { name: "λ", meaning: "把执行费用折算进动作选择的成本权重", evidence: "权重 λ、μ" },
          { name: "cost", meaning: "动作的调用费用延迟和资源消耗", evidence: "成本 cost" },
          { name: "μ", meaning: "把安全与业务风险折算进动作选择的风险权重", evidence: "权重 λ、μ" },
          { name: "risk", meaning: "动作可能造成的权限隐私或外部副作用风险", evidence: "风险 risk" }
        ]}
      ],
      termReviews: [
        { section: 5, reviewedAt: "2026-07-27", terms: [
          { name: "Thought", meaning: "原始 ReAct 表达中用于描述当前决策依据的中间文本槽", purpose: "帮助研究和调试行动选择但不要求生产公开私有推理", definitionEvidence: "完整 Thought", purposeEvidence: "生产无需展示" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["ReAct 让当前假设选择行动并用真实观察修正后续轨迹。","输出交错的取证动作、带来源观察与更新后的答案"],
          ["它解决纯推理缺新事实与固定脚本不能按反馈改道。","连接纯文本推理缺新事实和固定脚本遇变化不会改道的缺陷"],
          ["输入问题假设工具历史环境，输出动作观察更新答案。","输入问题、当前假设、工具、历史和外部环境"],
          ["形成最小假设，选取证动作，以观察更新计划或停止。","观察必须实际改变假设、计划或停止判断"],
          ["观察改变后续决策才构成闭环而非工具装饰。","没有形成闭环"],
          ["工具结果若不影响原猜测就没有 ReAct 机制收益。","只用来装饰原先猜测"]
        ]),
        six(2, [
          ["ReAct 最小机制按假设行动观察顺序更新历史。","输出假设 ht、候选动作 at、环境观察 ot 与更新历史 Hnext"],
          ["它解决三个阶段各自产出什么以及为何不能交换。","顺序保证行动针对缺口、观察约束后续"],
          ["输入 q H 工具，输出 h a o 和新历史。","输入问题 q、历史 Ht 和工具集合"],
          ["从缺口形成假设选择动作，环境观察加入下一轮。","最后把动作观察加入下一轮"],
          ["观察必须可被下一轮读取并改变假设。","观察约束后续"],
          ["观察数据不能修改用户目标或当前授权。","观察不能修改用户目标或授权"]
        ]),
        six(3, [
          ["年报案例用官方同口径证据计算净利润同比增长。","输出有页码证据的 20% 增长"],
          ["它解决如何证明观察纠正模型而非给猜测补链接。","新闻 130 因不同口径被排除"],
          ["输入官方目标主体口径数值公式，输出证据答案。","输入官方报告目标、主体年份币种口径、2025/2024 数值和同比公式"],
          ["定位 PDF 核主体币种读同表两数再计算。","依次定位官网 PDF、确认 Acme plc 与百万美元"],
          ["一百二十与一百同口径相减除一百得二成。","再算 (120−100)/100"],
          ["不同口径新闻数字不能与报表净利润混算。","只有通过口径检查才成为证据"]
        ]),
        six(4, [
          ["观察治理把工具输出标为带来源状态和信任等级的数据。","输出可用事实、待交叉验证数据、可重试错误或注入警报"],
          ["它解决工具返回文字为何不能直接相信或照做。","控制器把网页文本视为数据"],
          ["输入工具来源时间状态解析信任内容，输出观察状态。","输入工具名、来源 URL、时间、状态码、解析方式、信任等级和内容"],
          ["先分离状态与内容再验证来源，注入文字不作授权。","不让其成为授权指令"],
          ["超时表示未知或可重试，不表示事实不存在。","超时也不能改写成不存在"],
          ["闭环会放大错误观察，关键事实必须独立验证。","关键事实需独立验证"]
        ]),
        six(5, [
          ["ReAct 与 CoT 工具调用 Agent 循环反思按核心对象区分。","输出 CoT、工具调用、ReAct、Agent 循环或反思"],
          ["它解决 ReAct 是邻近概念别名还是可组合范式。","可组合但不互相等同"],
          ["输入步骤动作反馈控制诊断，输出概念分类。","输入是否有内部步骤、结构化动作、多轮环境反馈、生产状态控制或失败诊断"],
          ["按是否引新事实多轮反馈和生产控制逐项判断。","ReAct 强调反馈改变后续轨迹"],
          ["完整 Agent 比 ReAct 多预算权限恢复和终止。","完整 Agent 还加预算权限恢复终止"],
          ["生产无需展示完整自由推理轨迹。","生产无需展示完整 Thought"]
        ]),
        six(6, [
          ["行动选择权衡信息增益执行成本和安全风险。","输出行动分数 Score(a) 与执行或停止决定"],
          ["它解决工具能调用为何不等于当前值得调用。","重复搜索因信息增益近零应停止"],
          ["输入动作 ΔU 成本风险权重，输出分数决定。","输入候选动作 a、预期不确定性下降 ΔU、成本 cost、风险 risk 及权重 λ、μ"],
          ["用信息下降减成本风险，优先消除关键缺口。","优先能消除关键缺口且风险成本可接受的动作"],
          ["重复搜索低分而官方报告取证通常高信息。","重复搜索因信息增益近零"],
          ["分数只是设计框架，不能伪造精确概率。","不要求伪造精确概率"]
        ]),
        six(7, [
          ["失败控制按打转淹没误读拼接和伪完成选择恢复动作。","输出继续、换源、澄清、停止或失败"],
          ["它解决 ReAct 怎样变慢走偏或永远停不下来。","打转、观察淹没、状态码误读"],
          ["输入去重预算错误口径覆盖，输出控制动作。","输入动作与结果去重、上下文预算、工具错误、实体时间单位口径和证据覆盖"],
          ["按失败类型应用去重最小事实错误结构一致性与映射。","分别需要去重、最小事实、错误结构、四项一致检查与证据映射"],
          ["每轮调用会叠加成本，只有新证据或状态推进才值得继续。","每轮都有真实成本"],
          ["简单一步任务不应承担 ReAct 多轮成本。","一步可答任务不值得 ReAct 成本"]
        ]),
        six(8, [
          ["ReAct 评测在同预算下比较无工具一次检索固定流程与闭环。","输出任务成功、证据覆盖、无效动作、错误恢复、步数、延迟、费用和超时"],
          ["它解决漂亮单条轨迹为何不能证明方法有效。","只猜中 20% 不算闭环成功"],
          ["输入四种基线轨迹，输出质量证据效率和错误分层。","输入同预算的无工具、一次检索、固定工作流和 ReAct 轨迹"],
          ["逐项验收来源主体口径数值公式并记录成本。","逐项检查官网、主体币种、同口径两数、公式页码"],
          ["最终数字正确但证据链缺失可能只是碰巧猜中。","不能算闭环成功"],
          ["需按计划参数观察综合终止错误分层归因。","按计划参数观察综合终止错误分层归因"]
        ])
      ]
    },
    "agent-loop": {
      contractVersion: 2,
      examples: [{
        section: 4,
        evidence: {
          setup: "失败 100≠90、六轮预算",
          rule: "禁止改测试与发布另确认",
          steps: "从 3 降到 0",
          interpretation: "技术验收全绿仍不能推导发布授权"
        }
      }],
      formulas: [{
        id: "agent-loop-state-transition",
        section: 3,
        formulaIndex: 1,
        symbols: [
          { name: "S", meaning: "控制器在一轮开始时持有的完整受保护状态", evidence: "输出下一状态 Snext" },
          { name: "t", meaning: "当前循环轮次的编号", evidence: "历史 Ht、预算 Bt、授权 At" },
          { name: "G", meaning: "不可被不可信观察覆盖的目标与验收约束", evidence: "受保护目标 G" },
          { name: "O", meaning: "最近一次工具执行返回的真实环境观察", evidence: "观察 Ot" },
          { name: "H", meaning: "到当前轮为止的动作和结果历史", evidence: "历史 Ht" },
          { name: "B", meaning: "当前剩余的步数时间和费用预算", evidence: "预算 Bt" },
          { name: "A", meaning: "当前主体已经明确授予的动作权限", evidence: "授权 At" },
          { name: "a", meaning: "模型策略提出但尚未执行的候选动作", evidence: "候选动作 at" },
          { name: "policy", meaning: "根据当前状态提出下一候选动作的模型或决策策略", evidence: "策略只从当前状态提出动作" },
          { name: "execute", meaning: "在权限和 schema 校验后执行候选动作的函数", evidence: "执行前权限校验" },
          { name: "update", meaning: "把工具结果写入观察历史并形成下一状态的更新函数", evidence: "经 update 更新观察和历史" }
        ]
      }],
      termReviews: [
        { section: 2, reviewedAt: "2026-07-27", terms: [
          { name: "schema", meaning: "规定工具动作名称参数类型和返回结构的机器契约", purpose: "阻止模型自由文本直接变成未校验资源操作", definitionEvidence: "执行器按 schema 操作", purposeEvidence: "模型不直接写资源" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["Agent 循环用动作后的真实观察不断更新决策状态。","输出逐轮观察、动作与验证状态"],
          ["它解决一次生成无法知道补丁是否应用测试是否通过。","一次生成看不到动作后的真实结果"],
          ["输入目标未知状态动作验收，输出逐轮状态。","输入目标、未知环境状态、可用动作和验收"],
          ["执行小动作获取事实，再按事实选择下一动作。","通过小动作取得新事实并缩小不确定性"],
          ["只有新增观察或可验证变化才算循环进展。","只有新观察、候选减少或可验证状态变化才算进展"],
          ["无信息增益的重复调用不是 Agent 进展。","只是昂贵重采样"]
        ]),
        six(2, [
          ["循环角色分为模型控制器执行器和验证器。","输出模型提议、控制决定、工具结果与验证结论"],
          ["它解决谁思考谁动手谁能裁定通过的问题。","模型自报完成只是预测"],
          ["输入目标动作资源验收，输出四类角色产物。","输入受保护目标、候选动作、实际资源状态和验收规则"],
          ["模型提议控制调度执行器操作验证器按标准裁决。","执行器按 schema 操作"],
          ["完成只能由受保护验收和资源证据决定。","验证器用不可被候选改弱的标准裁决"],
          ["模型不能直接改资源自授权或改弱裁判。","模型不直接写资源"]
        ]),
        six(3, [
          ["状态转移形式化每轮受保护字段候选动作执行和更新。","输出下一状态 Snext"],
          ["它解决自然语言 Agent 怎样落成不丢约束的状态机。","工具内容不能覆盖 G、B 或 A"],
          ["输入 G O H B A a，输出下一状态。","输入受保护目标 G、观察 Ot、历史 Ht、预算 Bt、授权 At 和候选动作 at"],
          ["策略提议、权限校验、执行工具、update 写入状态。","执行结果经 update 更新观察和历史"],
          ["状态版本使每次动作选择可以复现和审计。","状态必须版本化"],
          ["不可信观察只更新事实，不能改目标预算授权。","不能覆盖 G、B 或 A"]
        ]),
        six(4, [
          ["修复案例用四轮新证据逐项满足技术条件并等待发布授权。","输出定位、最小补丁、目标测试、全量回归和待发布状态"],
          ["它解决同一失败怎样逐轮减少不确定性而非盲改。","每轮用新事实降低未满足条件 Ut"],
          ["输入失败预算禁止项授权，输出修复和待确认状态。","输入失败 100≠90、六轮预算、禁止改测试与发布另确认"],
          ["定位修改测试回归，并以未满足条件数衡量进展。","从 3 降到 0"],
          ["技术条件归零只说明补丁通过，不代表批准发布。","技术验收全绿仍不能推导发布授权"],
          ["无条件减少或新诊断证据的轮次不算进展。","无新条件减少就不算进展"]
        ]),
        six(5, [
          ["计划循环验证器分别维持方向吸收反馈和裁决完成。","输出计划方向、循环调整与验证裁决"],
          ["它解决有计划为何仍需循环有循环为何仍需验证。","任一缺失都会造成绕路、僵化或伪完成"],
          ["输入依赖观察验收，输出三种机制产物。","输入任务依赖、新观察和外部验收"],
          ["计划定顺序循环改动作验证器按契约裁决。","计划说明大致顺序"],
          ["三者组合才同时获得方向适应性和可验收完成。","循环让后续动作响应环境"],
          ["验证标准必须处于循环外且不可由候选改弱。","必须在循环外受保护"]
        ]),
        six(6, [
          ["终止策略定义成功预算无进展依赖失败和授权暂停五类出口。","输出成功、预算结束、无进展、依赖失败或授权暂停"],
          ["它解决循环何时必须停止以及谁能强制决定。","控制器强制硬预算"],
          ["输入验收资源进展依赖授权，输出终止状态。","输入验收、步数时间 token 费用、进展历史、依赖状态和授权需求"],
          ["控制器计预算检测重复并按出口条件强制停止。","检测等价动作循环"],
          ["重试只有带新参数证据或替代路径才有信息价值。","重试必须带新参数、退避、替代工具或证据"],
          ["模型不能自行忽略预算授权或无进展出口。","模型不能自行忽略出口"]
        ]),
        six(7, [
          ["失败诊断用结构化轨迹区分动作观察目标完成和权限故障。","输出动作振荡、观察污染、目标漂移、伪完成或权限升级归因"],
          ["它解决循环卡住时怎样定位坏在哪一层。","输入状态版本、候选动作、校验决定"],
          ["输入状态动作决定结果来源验证，输出失败归因。","输入状态版本、候选动作、校验决定、工具状态码、结果来源和验证证据"],
          ["按信号匹配去重原错误目标保护证据终止逐次授权。","用状态去重、保留原错误、不可压缩目标"],
          ["结构化轨迹足以复现动作选择和外部结果。","状态版本、候选动作、校验决定"],
          ["无需保存可能不忠实且含敏感信息的完整私有推理。","无需保存完整私有思维文本"]
        ])
      ]
    },
    agent: {
      contractVersion: 2,
      examples: [{
        section: 3,
        evidence: {
          setup: "摘要目标、不可信网页、最多四轮",
          rule: "网页指令不能扩大权限，发送必须暂停确认",
          steps: "确认后仍核对收件人内容与消息 ID",
          interpretation: "达到预算、重复动作、依赖失败或缺授权都要退出"
        }
      }],
      formulas: [{
        id: "agent-chain-success",
        section: 5,
        formulaIndex: 1,
        symbols: [
          { name: "Pchain", meaning: "所有必要步骤都成功时整条任务完成的理想化概率", evidence: "输出理想化全链成功概率 Pchain" },
          { name: "s", meaning: "独立同分布简化假设下一步成功的概率", evidence: "简化单步成功率 s" },
          { name: "m", meaning: "任务必须连续成功的必要步骤数量", evidence: "必要步骤数 m" }
        ]
      }],
      termReviews: [
        { section: 2, reviewedAt: "2026-07-27", terms: [
          { name: "状态机", meaning: "用明确状态和事件控制允许转换与停止的系统模型", purpose: "使 Agent 每轮动作有可检查前置和退出条件", definitionEvidence: "循环的工程本质是状态机", purposeEvidence: "决定继续、停止、失败或等待确认" }
        ]},
        { section: 7, reviewedAt: "2026-07-27", terms: [
          { name: "幂等", meaning: "重复提交同一动作也只产生一次等效业务结果", purpose: "避免超时重试造成重复下单转账或删除", definitionEvidence: "使用幂等与审计", purposeEvidence: "高危下单转账删除" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["AI Agent 是围绕目标自主选择动作并用反馈继续的多步系统。","输出多步动作轨迹与经外部验证的任务结果"],
          ["它解决模型会调工具后还缺少谁主导多步流程的问题。","由系统主动选择下一动作"],
          ["输入目标状态工具权限预算停止，输出轨迹与结果。","输入用户目标、当前状态、工具、权限、预算和停止条件"],
          ["模型提议决策，执行器操作资源，观察反馈驱动下一轮。","模型负责提出决策，执行器才真正操作资源"],
          ["经外部验证的结果才表示任务完成而非模型自报。","经外部验证的任务结果"],
          ["自主不意味着无限权限也不保证一定完成。","自主不等于无限权限或保证完成"]
        ]),
        six(2, [
          ["Agent 循环反复执行状态评估动作检查执行观察和更新。","输出下一候选动作、执行结果与更新状态"],
          ["它解决 Agent 凭什么根据每步结果自己继续任务。","决定继续、停止、失败或等待确认"],
          ["输入目标状态观察预算授权，输出动作结果新状态。","输入目标、已完成状态、工具观察、剩余预算和授权"],
          ["评估后检查执行，读取真实回执再决定状态转换。","每轮先评估状态，再由策略和权限检查动作"],
          ["记录状态动作观察即可审计，不需要公开私有思维链。","不要求公开私有思维链"],
          ["没有环境观察或业务回执不能宣布完成。","没有外部观察就不能宣告完成"]
        ]),
        six(3, [
          ["网页案例演示带权限预算和确认检查点的 Agent 循环。","输出安全摘要、被拒动作、待确认草稿或已验证发送"],
          ["它解决外部网页藏恶意指令时如何避免越权。","不可信网页试图诱导 Agent 读取私密文件并外发"],
          ["输入目标网页轮数禁止项授权回执，输出安全状态。","输入摘要目标、不可信网页、最多四轮、禁止读私密文件、发送授权和消息回执"],
          ["拒绝网页扩权，发送前确认，发送后核对回执。","网页指令不能扩大权限，发送必须暂停确认"],
          ["消息 ID 与内容收件人匹配后才算发送完成。","核对收件人内容与消息 ID"],
          ["预算重复依赖失败或缺授权都必须停止循环。","达到预算、重复动作、依赖失败或缺授权都要退出"]
        ]),
        six(4, [
          ["Agent 架构由决策模型工具规划记忆与控制器组成。","输出由决策模型、工具执行器、规划状态、记忆检索与控制器组成的系统"],
          ["它解决 Agent 拆开后各部件分别承担什么责任。","模型理解与提出动作，工具访问世界"],
          ["输入目标环境，输出组件系统及接口。","输入目标和环境"],
          ["模型决策工具执行规划依赖记忆状态控制器强制边界。","控制器强制权限预算停止"],
          ["组件通过版本化接口交换可观察状态和动作。","通过版本化接口连接"],
          ["模型能力不能替代执行权限与环境真实状态。","不能替代执行权限和真实状态"]
        ]),
        six(5, [
          ["多步可靠性估计必要步骤联合成功而非单步平均表现。","输出理想化全链成功概率 Pchain 与真实任务指标"],
          ["它解决单步表现很好为何多步任务仍频繁失败。","公式只是风险直觉"],
          ["输入 m、s、依赖、检查点和恢复，输出链路指标。","输入必要步骤数 m、简化单步成功率 s、步骤依赖、检查点、重试和回滚"],
          ["独立同概率时连乘 s 的 m 次，再与真实轨迹比较。","Pchain=s^m"],
          ["九成单步十步约三成五展示联合条件快速下降。","s=0.9、m=10 得约 35%"],
          ["真实相关与恢复使公式不是通用定律。","真实步骤相关且有恢复"]
        ]),
        six(6, [
          ["自主度设计在固定工作流受限 Agent 与混合系统间选择。","输出确定性工作流、受限 Agent 或混合系统"],
          ["它解决自主 Agent 是否越自主越先进的问题。","越自主不代表越先进"],
          ["输入可知性变化成本验证预算，输出系统形态。","输入路径可预知性、环境变化、错误成本、可验证性和运行预算"],
          ["固定步骤写死，未知局部交模型，检查点回确定控制。","真正未知的局部交给模型判断"],
          ["混合方案通常比全自主更可测可复现。","混合通常更可测可复现"],
          ["额外自主只在确有未知决策价值时值得承担风险。","可能只增加成本和失控面"]
        ]),
        six(7, [
          ["Agent 安全控制在每次工具动作前强制身份权限参数和确认。","输出允许、拒绝、沙箱模拟或人工确认"],
          ["它解决 Agent 真能动手后提示注入怎样放大破坏。","提示注入文字不能成为授权来源"],
          ["输入工具身份资源参数内容可逆批准，输出安全动作。","输入工具能力、主体身份、资源、动作参数、不可信内容、可逆性和用户批准"],
          ["最小权限执行器重新鉴权，高危动作确认幂等审计。","每次调用前重新鉴权"],
          ["允许只针对当前主体资源动作，不授权未来或别的工具。","明确确认并使用幂等与审计"],
          ["模型建议和外部内容永远不能作为权限凭证。","模型建议永远不是权限凭证"]
        ])
      ]
    },
    planning: {
      contractVersion: 2,
      examples: [{
        section: 4,
        evidence: {
          setup: "S0 到 S4 的节点、依赖和预计 5/8/3/6/10 分钟",
          rule: "S3 必须等待两者",
          steps: "S1 与 S2 在 S0 后并行",
          interpretation: "关键路径为 S0→S1→S3→S4"
        }
      }],
      formulas: [],
      termReviews: [
        { section: 2, reviewedAt: "2026-07-27", terms: [
          { name: "diff", meaning: "文件或结构在执行前后发生的可审计差异", purpose: "把修改动作转换成可观察的世界状态证据", definitionEvidence: "退出码 diff 测试", purposeEvidence: "转成事实" }
        ]},
        { section: 4, reviewedAt: "2026-07-27", terms: [
          { name: "DAG", meaning: "节点依赖方向明确且不存在循环的有向无环图", purpose: "表达可并行任务与必须等待的关键依赖", definitionEvidence: "依赖图案例", purposeEvidence: "并行就绪集、关键路径" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["可执行计划是带前置动作产物完成谓词和回退的状态图。","输出带前置条件、动作、产物、完成谓词与回退的状态图"],
          ["它解决自然语言步骤清单为何无法说明真正完成和失败恢复。","何时真的完成”和“失败回哪里"],
          ["输入目标状态约束工具风险，输出可执行状态图。","输入目标、当前世界状态、约束、工具和风险"],
          ["每个节点绑定前置动作产物谓词回退和外部观察。","工具调用只是一项动作"],
          ["工具被调用只表示动作发生，不表示目标状态达成。","不是目标完成"],
          ["世界状态必须由外部观察证明而非模型宣称。","世界状态必须由外部观察证明"]
        ]),
        six(2, [
          ["规划器执行器观察器控制器分别负责图动作事实和状态转换。","输出推进、重试、回退或局部重规划"],
          ["它解决为何不能让模型边想边直接修改所有状态。","计划中写“完成”不能冒充真实完成"],
          ["输入目标图节点结果观察，输出控制动作。","输入目标约束、依赖图、就绪节点、执行结果和外部观察"],
          ["规划图执行就绪节点，观察转事实，控制器比较预期实际。","观察器把退出码 diff 测试转成事实"],
          ["角色分离让每项产物和责任可追踪。","规划器提出有限视野图"],
          ["计划文字不能覆盖来自执行环境的事实状态。","不能冒充真实完成"]
        ]),
        six(3, [
          ["任务契约让执行和验收共享一个节点完成定义。","输出执行器与验收者共享的节点定义"],
          ["它解决怎样避免跑过测试被误当成测试通过。","“我已理解”不是谓词"],
          ["输入前置动作产物谓词回退批准，输出契约。","输入前置事实、限定动作、可观察产物、机器完成谓词、回退和批准主体"],
          ["缓存节点绑定复现修改 diff 双测试和完成条件。","修改 key、产出 diff 与双测试"],
          ["完成谓词检查世界状态而不是聊天中的自我报告。","以两组测试通过为完成"],
          ["高风险节点必须另声明批准主体与禁止状态。","还要声明禁止状态"]
        ]),
        six(4, [
          ["依赖图表示任务节点先后并行和关键路径。","输出并行就绪集、关键路径和最早完成 29 分钟"],
          ["它解决哪些步骤可并行哪些必须等待证据。","S3 必须等待两者"],
          ["输入节点依赖时长，输出就绪路径和最早完成。","输入 S0 到 S4 的节点、依赖和预计 5/8/3/6/10 分钟"],
          ["S1 S2 并行，S3 等两者，S4 等 S3。","S1 与 S2 在 S0 后并行"],
          ["关键路径决定二十九分钟而非串行三十二分钟。","关键路径为 S0→S1→S3→S4"],
          ["验收失败只作废受补丁影响的下游节点。","不重复已验证调查"]
        ]),
        six(5, [
          ["滚动规划近处具体远处粗略并随新观察更新子图。","输出近处具体节点、远处粗目标和新版本子图"],
          ["它解决未知环境为何不该预写死二十步细节。","每到高不确定点再展开下一段"],
          ["输入近远状态观察不变量，输出版本子图。","输入近端已知状态、远端不确定依赖、新观察、目标与安全不变量"],
          ["执行到高不确定点后展开并只替换受影响部分。","只替换受观察影响的子图"],
          ["计划版本记录触发证据与作废节点用于审计。","记录触发证据和作废节点"],
          ["新文本不能静默覆盖已验证事实与安全不变量。","不能静默覆盖已验证事实"]
        ]),
        six(6, [
          ["局部重规划按失败类型作废最小依赖子图并保留检查点。","输出重试、回到事实来源、作废补丁子图或全面重规划"],
          ["它解决测试失败后重写完整计划造成重复劳动。","重新制定完整计划”经常造成重复劳动"],
          ["输入失败差异检查点依赖类型，输出恢复范围。","输入失败节点、预期与实际差异、稳定检查点、依赖下游和失败类型"],
          ["瞬态重试事实错回源补丁错重做下游目标变才扩大。","瞬态错误限次幂等重试"],
          ["更新范围随因果依赖而不是随文本段落决定。","补丁副作用只重做补丁验收"],
          ["已验证稳定产物不得被无关失败重复搜索覆盖。","稳定产物用版本 ID 固定"]
        ]),
        six(7, [
          ["规划方式按路径可知性选择工作流搜索 ToT 或 Agent。","输出固定工作流、传统搜索、ToT 或 Agent 规划"],
          ["它解决是否所有长任务都需要语言模型规划器。","固定分支用工作流"],
          ["输入可知性动作空间动态反馈权限，输出规划方式。","输入路径可预知性、动作空间、环境动态、工具反馈和风险权限"],
          ["已知分支工作流，可穷举搜索，未知动态才 Agent。","可穷举候选用搜索"],
          ["工具真实反馈区分规划候选与已经发生的世界状态。","未知环境路径才需要 Agent"],
          ["权限事务幂等批准必须由外部系统强制。","由外部系统强制"]
        ]),
        six(8, [
          ["计划评测同时衡量成功可执行性恢复路径延迟和成本。","输出最终成功、可执行率、前置错误、重复步骤、重规划、恢复距离、关键路径延迟和成本"],
          ["它解决怎样评估计划而不奖励漂亮长文本。","调用翻倍而成功不变没有价值"],
          ["输入三种执行方案轨迹，输出质量恢复成本指标。","输入同任务的直接行动、固定工作流和规划器轨迹"],
          ["先静态检查 DAG 契约资源，再故障注入局部恢复。","先静态检查工具存在、DAG 无环"],
          ["指标揭示计划是否减少错误重复和恢复距离。","无效/重复步骤、重规划次数"],
          ["成功不变而调用翻倍表示规划器没有创造价值。","成功不变没有价值"]
        ])
      ]
    },
    reflection: {
      contractVersion: 2,
      examples: [{
        section: 4,
        evidence: {
          setup: "v1 单键、跨用户反例",
          rule: "只改 key 为 (user_id,product_id)",
          steps: "v2 两组均 2/2",
          interpretation: "只有复合键满足完整目标"
        }
      }],
      formulas: [],
      termReviews: [
        { section: 4, reviewedAt: "2026-07-27", terms: [
          { name: "保护性回归", meaning: "防止修复一个缺陷时破坏原本正确行为的测试集合", purpose: "同时验证缓存隔离与原有命中收益", definitionEvidence: "保护性回归未破坏", purposeEvidence: "隔离测试和命中保护测试" },
          { name: "TTL", meaning: "缓存项目在被视为过期前允许存活的时间", purpose: "区分键隔离错误与缓存生命周期配置错误", definitionEvidence: "不改测试与 TTL", purposeEvidence: "复合键补丁" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["反思修正用外部失败证据约束原因假设和最小补丁。","输出可证伪原因假设、最小补丁及复测决定"],
          ["它解决同一模型再想一遍为何不必然纠错。","没有新证据的再想一遍"],
          ["输入候选证据验收预算，输出假设补丁复测。","输入候选、外部失败证据、受保护验收和修改预算"],
          ["由测试检索环境等证据改变状态，再提出可证伪修改。","真正改变信息状态"],
          ["成功必须修复原失败且保护性回归没有破坏。","保护性回归未破坏"],
          ["无新证据循环只是同一盲点中的重新采样。","同一盲点内重采样"]
        ]),
        six(2, [
          ["反思闭环分离生成验证诊断修改和复测角色产物。","输出保留、回退、继续调查或停止"],
          ["它解决为何生成评判诊断修改必须保持不同接口。","产物与接口分开"],
          ["输入候选验证假设补丁验收，输出闭环动作。","输入候选、验证结果、原因假设、补丁和同一验收"],
          ["执行器生成验证器举证反思器假设再应用复测。","执行器生成，验证器只给可复现证据"],
          ["同一模型可分时扮演角色但状态与标准必须隔离。","角色可以由同一模型分时承担"],
          ["评判者不能通过降低验收标准伪造修复。","不得偷偷降低验收标准"]
        ]),
        six(3, [
          ["反思记录是能把失败证据转成单一可验收动作的结构。","输出可执行且可审计的修正计划"],
          ["它解决检查代码逻辑这类空泛批评为何无效。","不能驱动验收"],
          ["输入失败版本假设动作验证，输出可审计计划。","输入失败现象、环境版本、原因假设、单一动作和预期验证"],
          ["记录证据机制补丁和失败保护双测试。","缓存串值证据、缺 user_id 的可证伪机制"],
          ["原因不明先做区分实验，不一次列十种猜测。","原因不明时先做区分实验"],
          ["无定位动作的泛泛建议不能作为修正记录。","“检查代码逻辑”没有定位动作"]
        ]),
        six(4, [
          ["缓存案例把跨用户反例转成复合键最小修复。","输出 v2 复合键或回退"],
          ["它解决怎样证明第二次修复来自反馈而不是走运。","证明修复受反馈约束"],
          ["输入单键反例双测试，输出复合键或回退。","输入 v1 单键、跨用户反例、隔离测试和命中保护测试"],
          ["只改复合键并复跑失败测试与保护性测试。","只改 key 为 (user_id,product_id)"],
          ["复合键两组全过，禁缓存则破坏命中契约。","v2 两组均 2/2"],
          ["只看失败用例会错误接受禁用缓存的过度修复。","禁用缓存虽修隔离却破坏命中"]
        ]),
        six(5, [
          ["最小修改控制每轮改动范围以保留因果归因和回退。","输出一个可回退补丁序列及归因证据"],
          ["它解决一次改五处即使通过也为何不利于学习。","先改能区分假设的最小范围"],
          ["输入假设 diff 依赖测试验收，输出补丁序列。","输入当前原因假设、代码 diff、相互依赖、失败测试和保护验收"],
          ["应用最小区分补丁，失败回退，依赖修改分检查点。","多项依赖可用检查点分步"],
          ["通过结果才能归因到受控修改而非五项混合。","只能把收益归因到这一组受控修改"],
          ["不得删测试吞异常放宽断言来制造绿色。","不得删除测试、吞异常或放宽断言"]
        ]),
        six(6, [
          ["反思记忆保存带条件版本反例和过期规则的验证经验。","输出可检索但需重新核对前提的经验"],
          ["它解决完整失败对话长期保存为何会污染新任务。","不能把过去结论当当前事实"],
          ["输入失败条件信号策略反例版本，输出条件经验。","输入已验证失败模式、适用条件、诊断信号、策略、反例、来源版本和过期规则"],
          ["把局部验证结果抽象为带前提经验并在新任务复核。","多租户缓存键覆盖租户边界"],
          ["适用条件满足才允许迁移经验到新任务。","需重新核对前提"],
          ["两个同源模型角色不能替代独立证据和人工。","不能替代事实来源、测试或合格人工"]
        ]),
        six(7, [
          ["停止策略用边际修好改坏成本新证据决定反思轮数。","输出继续、回退、报告未知或人工升级"],
          ["它解决修正轮数增加时何时边际收益转负。","边际收益和改坏风险怎样共同决定停止"],
          ["输入每轮收益损害成本证据稳定性，输出停止动作。","输入每轮修好数、改坏数、成本延迟、新证据和验证器稳定性"],
          ["逐轮计算净收益并检查无证据循环验收冲突预算。","净收益依次为 31、4、−4"],
          ["第三轮负四表示默认继续会比停止更差。","第三轮不应默认执行"],
          ["轮数更多不等于修正更可靠，耗尽应明确升级。","轮数更多不代表修正更可靠"]
        ]),
        six(8, [
          ["反思评测在同预算下隔离外部反馈相对多采样的贡献。","输出最终成功、首轮正确改坏率、边际收益、轮数、回退和升级"],
          ["它解决多调用本身提高命中时如何证明反馈有用。","若无反馈多采样同样有效"],
          ["输入四种同预算策略，输出成功损害与成本指标。","输入同预算的直接单次、无反馈多采样、外部反馈反思和更强模型单次"],
          ["用隐藏测试和原正确对照比较反馈策略与无反馈策略。","隐藏测试防止针对可见验收过拟合"],
          ["必须同时报告改好和改坏而非只看最终成功。","首轮正确改坏率"],
          ["无反馈同效时不能声称复杂反思框架必要。","没有证明复杂反思框架的必要性"]
        ])
      ]
    },
    "test-time-compute": {
      contractVersion: 2,
      examples: [{
        section: 8,
        evidence: {
          setup: "单次成功率 35%、k=4 候选",
          rule: "候选出现和最终选对是两个事件",
          steps: "最后算 0.68×0.85",
          interpretation: "端到端成功 57.8%"
        }
      }],
      formulas: [{
        id: "test-time-candidate-coverage",
        section: 3,
        formulaIndex: 1,
        symbols: [
          { name: "Pcoverage", meaning: "k 个候选中至少出现一个成功候选的理想概率", evidence: "输出至少一个成功候选的理想概率 Pcoverage" },
          { name: "p", meaning: "一次独立候选生成成功的概率", evidence: "输入单次成功概率 p" },
          { name: "k", meaning: "为同一任务生成并纳入候选池的数量", evidence: "候选数 k" }
        ]
      }],
      termReviews: [
        { section: 1, reviewedAt: "2026-07-27", terms: [
          { name: "推理时扩展", meaning: "在单次请求回答阶段增加候选搜索工具或验证计算", purpose: "按请求难度动态分配额外计算以改善难题质量", definitionEvidence: "推理计算按请求增加候选、搜索、工具和验证", purposeEvidence: "可动态路由" }
        ]},
        { section: 4, reviewedAt: "2026-07-27", terms: [
          { name: "验证器", meaning: "依据测试规则或模型对候选结果进行检查和反馈的组件", purpose: "识别候选是否满足明确任务契约并指导搜索", definitionEvidence: "验证器输入候选答案或过程", purposeEvidence: "输出通过、失败、分数或修正反馈" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["训练时扩展改变共享权重，推理时扩展按请求增加计算。","输出训练时扩展或推理时扩展的选择"],
          ["它解决同样额外计算在部署前和每请求支付为何不同。","直接增加服务成本"],
          ["输入两类预算难度延迟边界，输出扩展选择。","输入训练预算、请求难度、推理预算、延迟费用和知识边界"],
          ["训练预算写入权重，推理预算动态路由候选工具验证。","训练计算改变权重并由请求共享"],
          ["推理扩展允许因题分配，却增加每请求延迟费用。","后者可动态路由"],
          ["两种扩展都不能保证创造完全缺失的事实。","不能保证创造训练与上下文完全缺失的事实"]
        ]),
        six(2, [
          ["推理计算可采用长轨迹并行候选显式搜索和工具执行。","输出长串行轨迹、并行候选、显式搜索或工具执行"],
          ["它解决额外 token 候选节点工具是否提供同一种收益。","先诊断瓶颈再选形态"],
          ["输入深度覆盖状态验证工具，输出计算形态。","输入任务依赖深度、解法覆盖、状态空间、外部可验证性和工具可用性"],
          ["按深依赖覆盖分支和证据缺口分别路由计算。","深依赖用串行，多个解法用并行"],
          ["形态选择表示针对当前瓶颈增加计算，而非普遍更优。","有状态分支用搜索，缺新证据用工具"],
          ["弱反馈的开放任务可能让搜索优化错误目标。","可能让额外计算优化错目标"]
        ]),
        six(3, [
          ["候选覆盖计算至少一个成功候选进入候选池的概率。","输出至少一个成功候选的理想概率 Pcoverage"],
          ["它解决增加第 k 个候选为何边际覆盖越来越少。","新增候选的覆盖增益随 k 增加而递减"],
          ["输入 p、k 和相关性，输出理想覆盖概率。","输入单次成功概率 p、候选数 k 和候选相关性"],
          ["独立假设下用一减全部 k 次失败的概率。","Pcoverage=1−(1−p)^k"],
          ["公式只描述候选出现，不包含最终选择成功。","只估候选池覆盖"],
          ["相关候选使真实覆盖低于独立上界。","通常相关并低于上界"]
        ]),
        six(4, [
          ["验证器依据明确契约检查候选结果或中间过程。","输出通过、失败、分数或修正反馈"],
          ["它解决候选生成后系统怎样知道选哪一个。","候选答案或过程"],
          ["输入候选契约测试版本领域，输出验证结果。","输入候选答案或过程、明确契约、测试规则、版本和领域"],
          ["结果验证终态，过程验证早剪枝，优先独立规则。","结果验证检查终态，过程验证提前剪枝"],
          ["验证通过只覆盖编码契约，不能宣称绝对正确。","任何验证器都有覆盖漏洞"],
          ["搜索会利用评分漏洞，高分不能替代真实正确。","高分不等于真实正确"]
        ]),
        six(5, [
          ["有效状态搜索要求每次扩展产生新状态证据或验证变化。","输出可追踪的状态变化与候选"],
          ["它解决有状态探索和同一错误冗长改写如何区分。","重复生成同一错误的冗长文字不算新增探索"],
          ["输入状态动作证据停止反馈，输出状态变化候选。","输入当前状态、合法动作、新证据、停止条件和反馈"],
          ["每步必须填证据改验证或产生机制不同候选。","每次扩展应填补证据、改变验证状态或产生不同候选"],
          ["更长文本若无新信息就没有增加搜索覆盖。","不算新增探索"],
          ["对用户解释的长度不能作为内部可靠性的证据。","向用户提供的简洁可核验解释与内部计算长度"]
        ]),
        six(6, [
          ["预算策略按难度价值验证和资源上限动态分配计算。","输出预算档位、提前停止、升级或报告未知"],
          ["它解决继续搜索何时期望收益低于新增费用延迟。","目标是单位成本质量收益"],
          ["输入难度不确定验证和四类上限，输出预算动作。","输入难度估计、校准不确定性、验证结果、token、调用、墙钟、金额上限和任务价值"],
          ["简单短答困难扩候选，强证据停，耗尽报未知。","简单请求短答，困难且可验证请求扩候选"],
          ["路由收益需连同困难样本被错误降级一起解释。","记录被错误降级的难例"],
          ["所有请求最大预算不是单位成本最优策略。","目标是单位成本质量收益，而非所有请求用最大预算"]
        ]),
        six(8, [
          ["代码案例分开候选覆盖验证选择与端到端成功。","输出候选覆盖、选择率与端到端成功 57.8%"],
          ["它解决至少一个正确和最终选对为何是不同概率。","候选出现和最终选对是两个事件"],
          ["输入单次率候选数实测覆盖验证率，输出三层结果。","输入单次成功率 35%、k=4 候选、实测覆盖 68% 和验证器选择准确率 85%"],
          ["先算独立上界，再用实测覆盖乘验证选择率。","先用独立式得到 82.1% 上界"],
          ["百分之五十七点八是覆盖与选择共同作用的成功率。","最后算 0.68×0.85"],
          ["验证器弱或候选同质会吃掉增加计算的收益。","验证器若仅 55%，收益几乎被吃掉"]
        ])
      ]
    },
    "tree-of-thoughts": {
      contractVersion: 2,
      examples: [{
        section: 7,
        evidence: {
          setup: "初始串值状态 S0、三个原因分支、最多四节点预算",
          rule: "先比较 A 缺 user_id、B 命名空间、C 对象复用",
          steps: "A1 复合键通过 4/4 成为终态",
          interpretation: "说明为何必须剪枝"
        }
      }],
      formulas: [{
        id: "tot-full-tree-nodes",
        section: 7,
        formulaIndex: 1,
        symbols: [
          { name: "Nnodes", meaning: "包含根节点在内的完整搜索树节点总数", evidence: "节点总数 Nnodes=121" },
          { name: "k", meaning: "每个状态平均扩展出的候选分支数量", evidence: "分支数 k=3" },
          { name: "d", meaning: "从根状态向下扩展的最大搜索深度", evidence: "搜索深度 d=4" }
        ]
      }],
      termReviews: [
        { section: 1, reviewedAt: "2026-07-27", terms: [
          { name: "CoT", meaning: "沿一条生成前缀产生中间推理步骤的思维链方法", purpose: "对比 ToT 保存分支并可回溯的能力", definitionEvidence: "线性 CoT", purposeEvidence: "解决线性 CoT 的路径锁定" }
        ]},
        { section: 3, reviewedAt: "2026-07-27", terms: [
          { name: "BFS", meaning: "按深度逐层扩展所有候选的广度优先搜索", purpose: "优先覆盖浅层可能解但需要保存更多状态", definitionEvidence: "BFS 先铺同层", purposeEvidence: "输出 BFS、DFS 或 beam 的访问顺序" },
          { name: "DFS", meaning: "沿一个分支尽量深入后再回溯的深度优先搜索", purpose: "用较少内存快速找到深解但可能浪费在错误首支", definitionEvidence: "DFS 先深入", purposeEvidence: "输出 BFS、DFS 或 beam 的访问顺序" },
          { name: "beam", meaning: "每一层只保留固定数量最高分候选的束搜索", purpose: "在完整广搜成本与单路径深搜之间折中", definitionEvidence: "beam 每层只留 b 个高分状态", purposeEvidence: "候选上限" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["思维树把线性生成改成可保存分支评估剪枝和回溯的搜索。","输出带父子关系的搜索树、被保留或剪枝的状态及验证终态"],
          ["它解决早期选择错误后线性前缀难以恢复的问题。","解决线性 CoT 的路径锁定"],
          ["输入状态候选评估预算，输出树状态与终态。","输入当前问题状态、候选扩展、评估器和预算"],
          ["保存备选和父子关系，按评估结果改变展开顺序并回溯。","保存备选状态和真正回溯"],
          ["真正 ToT 必须有外部搜索控制而非只写更多段落。","真正搜索由外部状态控制"],
          ["没有状态保存和回溯的多段文字不属于 ToT。","不算 ToT"]
        ]),
        six(2, [
          ["搜索问题由状态扩展价值评估和终止条件四部分构成。","输出状态表示、扩展操作、价值评估与终止条件"],
          ["它解决什么样的中间思路才能被系统搜索和复用。","影响后续决策的事实"],
          ["输入事实产物动作评分终止，输出四项搜索定义。","输入任务事实、已验证产物、合法动作、评分维度和完成谓词"],
          ["状态保留事实，扩展合法动作，评分候选，外部条件终止。","状态只保留影响后续决策的事实"],
          ["粒度决定搜索能否去重定位和控制分支。","粒度过细会爆炸"],
          ["过粗状态会掩盖错误并妨碍去重。","过粗会掩盖错误并妨碍去重"]
        ]),
        six(3, [
          ["BFS DFS beam 是有限预算下不同的状态访问策略。","输出 BFS、DFS 或 beam 的访问顺序与候选上限"],
          ["它解决有限预算应先铺开还是先深入的问题。","BFS 先铺同层，DFS 先深入"],
          ["输入 k d b 内存验证成本，输出策略与上限。","输入分支数 k、深度 d、beam 宽度 b、内存和验证成本"],
          ["BFS 按层、DFS 沿支、beam 每层保留高分候选。","beam 每层只留 b 个高分状态"],
          ["完整树随分支和深度指数增长，必须剪枝。","完整树节点随 k 和 d 指数增长"],
          ["搜索评分不能绕过动作权限和真实执行门。","不能绕过高风险动作的权限和真实执行门"]
        ]),
        six(4, [
          ["评估器判断候选状态可行性价值风险和验证成本。","输出淘汰、保留、优先级或终态确认"],
          ["它解决模型自评是否足以决定剪掉哪些分支。","自评共享生成器盲点"],
          ["输入状态约束证据收益风险成本，输出评估动作。","输入候选状态、硬约束、证据、预计收益、风险、剩余成本和真实验证结果"],
          ["先强制硬约束，再用证据测试排序软价值。","违反权限语法的候选直接淘汰"],
          ["分数是成功估计而非真值，需按实际终态校准。","不能把一个 0.73 分伪装成真值"],
          ["可执行任务优先使用外部测试而非同模型自评。","优先用测试与规则"]
        ]),
        six(5, [
          ["搜索预算计入生成评分工具状态和被剪候选的全部成本。","输出继续扩展、剪枝、回溯或停止"],
          ["它解决更多分支何时不再值得继续投入。","边际成功增益和停止上限"],
          ["输入各类成本边际增益上限，输出搜索动作。","输入每次生成评分工具执行 token 与墙钟成本、边际成功增益和停止上限"],
          ["持续比较新增候选成功增益与单位成本。","记录被剪候选已经消耗的成本"],
          ["beam 翻倍仅增一点时应把预算转向验证或状态。","应把预算用于验证或初始状态"],
          ["搜索扩大探索空间但不能保证质量收益。","搜索扩大探索空间，不保证收益"]
        ]),
        six(6, [
          ["ToT 可在文本状态搜索，Agent 还需真实环境反馈和权限。","输出仅供规划的候选与可执行的受权动作"],
          ["它解决思维树是否等同真实世界 Agent 规划。","Agent 还必须调用工具获得新事实"],
          ["输入想象状态工具观察权限环境，输出规划或动作。","输入文本内想象状态、真实工具观察、当前权限和动态环境"],
          ["文本候选经工具观察更新，动作再通过授权执行。","在环境变化后重规划"],
          ["想象出的测试通过不能替代真实业务回执。","想象测试通过不能替代实际回执"],
          ["搜索不能创造上下文中缺失的事实知识。","不会创造模型上下文中缺失的知识"]
        ]),
        six(7, [
          ["缓存案例演示有限预算下分支验证剪枝补丁和回溯。","输出搜索轨迹、补丁终态与回溯点"],
          ["它解决三个可能原因如何避免同时乱改。","先比较 A 缺 user_id、B 命名空间、C 对象复用"],
          ["输入 S0 分支预算测试，输出轨迹终态回溯。","输入初始串值状态 S0、三个原因分支、最多四节点预算和测试证据"],
          ["比较三原因，用证据剪 B，扩 A，失败则回 C。","测试把 B 剪掉并优先扩展 A"],
          ["A1 四项测试通过才成为终态而非只靠高分。","A1 复合键通过 4/4 成为终态"],
          ["完整树一百二十一节点说明有限预算必须剪枝。","说明为何必须剪枝"]
        ]),
        six(8, [
          ["评估器失败分析定位搜索如何系统性淘汰正确路径。","输出过早剪枝、评分泄漏、同质分支、模拟当事实或循环回溯的归因"],
          ["它解决弱评估器为何可能比单次生成更危险。","评估器失败分析输入"],
          ["输入评分剪枝差异测试历史，输出失败归因。","输入各分支评分、被剪顺序、状态差异、真实测试和访问历史"],
          ["拆分评分维度，保留探索配额访问集并真实验证终态。","拆分硬可行性、证据、收益、风险与成本"],
          ["高分仅改变探索优先级，不能替代真实环境成功。","终态必须由环境验证"],
          ["不可逆昂贵执行不适合盲目扩展分支。","不适合盲目扩展"]
        ]),
      ]
    },
    "self-consistency": {
      contractVersion: 2,
      examples: [
        { section: 7, evidence: {
          setup: "独立单路径正确率 p=0.6",
          rule: "按恰好三、四、五条正确的二项项相加",
          steps: "0.3456+0.2592+0.07776=0.68256",
          interpretation: "采样不是必然增益"
        }},
        { section: 12, evidence: {
          setup: "数值单位问题、必要变量、首批三条路径",
          rule: "20mg 两票也必须过单位与范围验证",
          steps: "失败后换分解再采两条",
          interpretation: "五条仍无验证共识就停止并转专家"
        }}
      ],
      formulas: [
        { id: "self-consistency-majority-five", section: 7, formulaIndex: 1, symbols: [
          { name: "Pmajority", meaning: "五条路径中至少三条正确的多数票成功概率", evidence: "多数概率 Pmajority" },
          { name: "p", meaning: "一条独立推理路径得到正确答案的概率", evidence: "单路径正确率 p=0.6" }
        ]},
        { id: "self-consistency-effective-samples", section: 9, formulaIndex: 1, symbols: [
          { name: "neff", meaning: "考虑路径相关性后相当于独立路径的有效数量", evidence: "输出有效样本数 neff" },
          { name: "n", meaning: "实际生成并参与估计的名义路径数量", evidence: "输入名义样本数 n" },
          { name: "ρ", meaning: "不同路径错误之间的平均相关程度", evidence: "路径错误相关系数 ρ" }
        ]}
      ],
      termReviews: [
        { section: 3, reviewedAt: "2026-07-27", terms: [
          { name: "温度", meaning: "控制采样分布随机程度和尖锐程度的参数", purpose: "在路径多样性与单路径质量之间调节", definitionEvidence: "输入温度", purposeEvidence: "多样性是为了减少相关错误" },
          { name: "top-p", meaning: "只从累计概率达到阈值的最小 token 候选集合采样", purpose: "限制低概率噪声同时保留一定候选多样性", definitionEvidence: "top-p", purposeEvidence: "一组质量可用且机制不同的候选" }
        ]},
        { section: 9, reviewedAt: "2026-07-27", terms: [
          { name: "相关系数", meaning: "概括两条路径错误共同变化程度的标准化数值", purpose: "估计重复路径真正提供了多少独立信息", definitionEvidence: "路径错误相关系数 ρ", purposeEvidence: "输出有效样本数 neff" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["自洽性对同一问题采样多条路径并聚合规范化答案。","输出多条推理路径、规范化答案簇与聚合结果"],
          ["它解决一条推理路径因早期随机分支而偶然出错。","解决的是单路径偶然错误"],
          ["输入问题采样配置聚合规则，输出路径答案簇和结果。","输入同一个可多路径求解的问题、采样配置和聚合规则"],
          ["生成多条路径，抽取答案，规范化后投票。","让较常出现的正确路径有机会在投票中胜出"],
          ["多数表示采样过程偏好，不直接表示事实正确。","若多数路径共享同一偏差"],
          ["共享偏差时投票会稳定地产生同一错误。","不能修复所有路径共同相信的错误前提"]
        ]),
        six(2, [
          ["多数投票概率描述独立路径下过半正确的机会。","输出多数票正确概率"],
          ["它解决增加独立样本在什么条件下能降低错误。","只有 p 大于 0.5 且错误近似独立时"],
          ["输入 p、奇数 n 和独立性，输出多数正确率。","输入单路径正确率 p、奇数样本数 n 和路径独立性"],
          ["把超过半数正确的二项概率项相加。","增加 n 才通常提高多数正确率"],
          ["p 小于半数会让投票强化错误。","p 小于 0.5 会强化错误"],
          ["相关路径会使独立投票收益假设失效并饱和。","相关性高则收益饱和"]
        ]),
        six(3, [
          ["采样多样性用温度 top-p 和数量产生不同但有效的路径。","输出一组质量可用且机制不同的候选"],
          ["它解决温度为零是否还能形成有意义的自洽投票。","温度为零常重复同一路径"],
          ["输入温度 top-p 上限有效率多样性，输出候选集。","输入温度、top-p、样本上限、单路径有效率和答案多样性"],
          ["在开发集联合调参并监控独特答案与解析失败。","联合调节温度与样本数"],
          ["适度随机减少相关错误，不代表温度越高越好。","不是越随机越好"],
          ["过高温度会降低单路径质量并制造无效步骤。","过高会生成无效步骤"]
        ]),
        six(4, [
          ["答案规范化把形式不同但任务等价的结果放入同一投票簇。","输出可投票的等价簇及解析失败"],
          ["它解决二分之一零点五与百分之五十是否同一票。","1/2、0.5、50% 应合为同簇"],
          ["输入结构答案单位形式和等价规则，输出簇和失败。","输入每条路径的最终结构化答案、单位、数值形式和任务等价规则"],
          ["按数学化简单位标签或受控语义规则先规范再计票。","数学式化简、单位换算、固定标签或受控语义聚类"],
          ["规范化结果定义什么算同一答案，直接决定票数。","规范化簇决定每种答案最终获得多少票"],
          ["规则过细拆票，过粗会合并不同答案。","过细会拆票，过粗会把不同答案合并"]
        ]),
        six(5, [
          ["共识强度表示同一采样系统多次偏好某个答案。","输出共识强度和是否需要验证或拒答"],
          ["它解决十条路径一致为何仍可能全部错误。","共享训练偏差会形成稳定错误"],
          ["输入票数来源证据多样性，输出验证或拒答动作。","输入票数、路径来源、外部证据、模型与提示多样性"],
          ["先判断来源独立程度，再用外部工具检查多数答案。","由计算器、检索、测试或独立规则验证"],
          ["多数只代表模型采样偏好，不代表世界事实。","不说明它符合世界事实"],
          ["高影响结论不能只靠同模型重复生成确认。","高影响结论应由"]
        ]),
        six(6, [
          ["成本停止根据票差验证边际收益与预算决定是否继续采样。","输出继续采样、停止回答、拒答或转人工"],
          ["它解决每题固定采样四十次是否值得的问题。","不必每题固定采四十次"],
          ["输入票差有效数验证预算价值成本，输出停止动作。","输入当前票差、有效样本数、验证结果、剩余预算、任务价值和错误成本"],
          ["逐批采样并在验证或边际收益条件满足时停止。","在验证通过、统计边界满足或边际收益低于成本时停止"],
          ["停止表示当前策略条件满足，不等于票率是正确概率。","票占比未经校准"],
          ["八成票不能直接解释为八成事实正确。","8/10 不能直接解释成 80% 正确率"]
        ]),
        six(7, [
          ["五票手算用二项概率计算至少三条正确的机会。","输出五条中至少三条正确的多数概率 Pmajority"],
          ["它解决单路径六成正确时五次投票提升有多大。","从 60% 提升到约 68.3%"],
          ["输入独立 p=0.6，输出 Pmajority。","输入独立单路径正确率 p=0.6"],
          ["把恰好三四五条正确的项逐项相加。","按恰好三、四、五条正确的二项项相加"],
          ["结果零点六八二五六表示约八点三个百分点增益。","0.68256"],
          ["p 小于半数时采样反而强化错误。","p=0.4 时会降到约 31.7%"]
        ]),
        six(8, [
          ["流程图把多路径规范化投票与外部验证串成可审计流程。","输出最终答案、验证状态与各阶段追踪"],
          ["它解决十条思维链为何不等同十个独立证人。","不是十个独立证人"],
          ["输入路径规范化投票验证器，输出答案验证与追踪。","输入同一问题的多条路径、答案规范化器、投票器和外部验证器"],
          ["抽取答案合并等价形式投票再外部验证。","先抽取最终答案，再把 1/2 与 0.5 合票"],
          ["内部推理长度不增加答案的投票权重。","内部推理文本不增加票权"],
          ["图示流程不能证明候选在统计上真正独立。","图展示的是可审计搜索流程"]
        ]),
        six(9, [
          ["有效样本数把相关路径折算成等价独立样本数量。","输出有效样本数 neff"],
          ["它解决十条路径使用同一错误公式为何没有十倍信息。","只有约 1.82 个独立样本的效果"],
          ["输入 n、ρ 和方差，输出 neff。","输入名义样本数 n、路径错误相关系数 ρ 和单路径方差"],
          ["用 n 除以一加 n 减一倍相关系数。","neff=n/[1+(n−1)ρ]"],
          ["十条半相关路径约等于一点八二条独立路径。","n=10、ρ=0.5 时只有约 1.82"],
          ["ρ 是近似摘要，机制多样性仍需实际实验验证。","相关系数只是近似摘要"]
        ]),
        six(10, [
          ["顺序采样根据实时票数验证和预算动态停止。","输出继续、停止、验证或升级"],
          ["它解决怎样避免每题固定采样相同最大次数。","先取少量样本"],
          ["输入票数相关性验证边界预算，输出停止状态。","输入当前规范化票数、相关性估计、外部验证、冻结停止边界和预算"],
          ["逐批采样并按冻结的票差统计验证或收益规则判断。","按票差、序贯统计界、验证器结果或边际收益判断"],
          ["停止只在选定假设和错误成本下有定义。","阈值在开发集按错误成本确定后冻结"],
          ["假设不成立时固定票差不提供误差保证。","固定票差不能提供误差保证"]
        ]),
        six(12, [
          ["剂量案例把采样规范化验证和停止串为高风险决策流程。","输出结构化答案、验证结果或专家升级"],
          ["它解决多数票出现后为何仍不能直接发布药物剂量。","20mg 两票也必须过单位与范围验证"],
          ["输入单位变量路径规则预算，输出答案验证或升级。","输入数值单位问题、必要变量、首批三条路径、单位规则、范围检查和最多五条预算"],
          ["先规范单位和变量，再采样合票验证，必要时换分解。","先规范 mg/g 和每次每日"],
          ["两票二十毫克只有通过单位范围规则才可接受。","必须过单位与范围验证"],
          ["五条仍无验证共识时停止并转专家。","停止并转专家"]
        ]),
        six(13, [
          ["策略评测比较单次固定投票和序贯验证的质量成本。","输出准确率、P95 调用数、token、延迟、拒答和质量成本曲线"],
          ["它解决只报准确率提高三点为何无法判断是否值得上线。","质量成本曲线"],
          ["输入多策略和冻结测试集，输出质量成本与切片结果。","输入贪心单次、同温度单次、固定多数和带验证的序贯策略，以及冻结测试集"],
          ["记录路径簇验证停止，并按可规范性验证器难度切片。","记录每条路径、簇、验证和停止原因"],
          ["曲线说明增益用了多少调用延迟和拒答换来。","准确率、P95 调用数、token、延迟、拒答"],
          ["开发集调参后冻结，测试集只能报告一次。","独立测试集只报告一次"]
        ])
      ]
    },
    cot: {
      contractVersion: 2,
      examples: [{
        section: 2,
        evidence: {
          setup: "初始状态 n0=23、转入操作和分组规则",
          rule: "先更新总人数 n1=n0+5，再计算 g=n1/4",
          steps: "输出 n1=28、g=7 及反向检查 7×4=28",
          interpretation: "错误位置立即可见"
        }
      }],
      formulas: [],
      termReviews: [
        { section: 2, reviewedAt: "2026-07-27", terms: [
          { name: "token", meaning: "模型逐步生成和重新读取的文本片段单位", purpose: "让后续生成以已经写出的中间步骤为上下文", definitionEvidence: "增加中间 token", purposeEvidence: "为后续生成提供上下文" }
        ]},
        { section: 3, reviewedAt: "2026-07-27", terms: [
          { name: "few-shot", meaning: "在提示中提供少量带答案格式的示例", purpose: "让模型从示例模仿分步推理模式", definitionEvidence: "few-shot 给一两个带步骤示例", purposeEvidence: "让模型模仿格式" },
          { name: "zero-shot", meaning: "不提供示例而直接用指令要求模型完成任务", purpose: "用最少提示触发逐步回答并建立简单基线", definitionEvidence: "zero-shot 只要求逐步处理", purposeEvidence: "先用直接答案做基线" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["思维链提示让模型在最终答案前生成一串中间推理步骤。","输出中间步骤与最终答案"],
          ["它解决多步问题直接跳到结论容易犯错的问题。","把直接猜结论改成先写可检查的局部状态"],
          ["输入多步问题和分步指令示例，输出步骤与答案。","输入一个多步问题和分步指令或示例"],
          ["先生成局部步骤，并把它们作为后续生成上下文。","步骤可为后续生成提供上下文"],
          ["二十三加五再除四得到七展示可检查的分解。","先算 23+5=28，再算 28÷4=7"],
          ["中间步骤仍可能错误或只是事后合理化。","仍可能错误或事后合理化"]
        ]),
        six(2, [
          ["逐步机制把问题表示为可检查的状态更新和反向验证。","输出 n1=28、g=7 及反向检查 7×4=28"],
          ["它解决写出过程为何比一步给答案更容易定位错误。","错误位置立即可见"],
          ["输入初始状态操作规则，输出中间状态结果和检查。","输入初始状态 n0=23、转入操作和分组规则"],
          ["先求 n1 再求 g，最后乘四验证总数。","先更新总人数 n1=n0+5，再计算 g=n1/4"],
          ["中间二十七会暴露加法步骤而非只留下错误答案。","若中间写成 27"],
          ["外显步骤不是模型内部计算的完整忠实记录。","不是模型内部计算的完整忠实记录"]
        ]),
        six(3, [
          ["触发方式用少量示例或直接指令引出分步回答。","输出直接答案、few-shot 思维链或 zero-shot 分步回答"],
          ["它解决怎样让模型生成思维链而非直接蹦答案。","先用直接答案做基线"],
          ["输入任务能力示例和要求，输出选择的回答方式。","输入任务、模型能力、示例数量和输出要求"],
          ["few-shot 模仿带步骤示例，zero-shot 直接要求逐步。","few-shot 给一两个带步骤示例"],
          ["是否有效必须相对直接答案按任务实测。","再按任务实测增益"],
          ["高风险结果仍需外部工具或来源验证。","不能只因写了步骤就放行"]
        ]),
        six(4, [
          ["自洽性和思维树是用多候选或分支搜索加强单链的方法。","输出自洽投票或思维树搜索结果"],
          ["它解决单条思维链偶然走错路径时如何增加机会。","降低单条路径偶然错误"],
          ["输入单链预算多样性聚合评价器，输出投票或搜索。","输入单链结果、采样预算、候选多样性、答案聚合规则和搜索评价器"],
          ["自洽多次采样聚合，思维树展开评价回溯。","自洽性多次独立采样后按答案聚合"],
          ["更多计算只在候选与评价提供新增信息时有效。","都用更多计算"],
          ["相关候选或失准评价器会让多路径一致犯错。","多想仍可能一致地错"]
        ]),
        six(5, [
          ["思维链是提示范式，推理模型是后训练预算策略。","输出提示式思维链或推理模型的判断"],
          ["它解决现代推理模型是否只是思维链训练版的问题。","不能用是否展示长解释来等同"],
          ["输入来源预算形态可见性，输出概念区分。","输入能力来源、预算控制、计算形态和轨迹可见性"],
          ["比较提示引出文字与后训练多形态推理计算。","推理模型经后训练学习"],
          ["原始轨迹可隐藏，展示长文不是推理模型定义。","原始轨迹可以隐藏"],
          ["两者相关但计算来源和形式不能混为一谈。","两者相关但不能"]
        ]),
        six(6, [
          ["思维链使用决策权衡任务难度可验证性成本窗口和风险。","输出直接答、分步生成、外部工具或转人工"],
          ["它解决何时额外草稿计算值得以及何时只会啰嗦。","简单格式化常不值得增加 token"],
          ["输入步数验证成本窗口风险，输出处理方式。","输入任务步数、可验证性、延迟费用、上下文预算、风险和解释用途"],
          ["难题分步并验证，简单题直答，高风险调用外部控制。","多步数学和代码可从步骤与验证受益"],
          ["增加步骤会增加 token 并挤占上下文窗口。","长步骤还会挤占上下文"],
          ["可见思维链不等于可靠解释或正确性保证。","不保证答案正确"]
        ])
      ]
    },
    "reasoning-models": {
      contractVersion: 2,
      examples: [
        {
          section: 3,
          evidence: {
            setup: "p=0.35、k=4",
            rule: "至少一个正确候选为 1−(1−p)^k",
            steps: "再乘 q=0.80 上限约 66%",
            interpretation: "该数值只是预算直觉而非性能保证"
          }
        },
        {
          section: 4,
          evidence: {
            setup: "100 题从预算 1 到 4",
            rule: "用成功收益减两类成本",
            steps: "4 到 8 只多 3 题",
            interpretation: "显示收益递减"
          }
        }
      ],
      formulas: [{
        id: "reasoning-expected-utility",
        section: 4,
        formulaIndex: 1,
        symbols: [
          { name: "U", meaning: "给定推理预算后成功收益扣除计算和延迟的期望效用", evidence: "输出期望效用 U(b)" },
          { name: "b", meaning: "候选数搜索步数或推理努力等级等预算", evidence: "输入推理预算 b" },
          { name: "Psuccess", meaning: "给定预算下任务最终成功的概率", evidence: "成功概率 Psuccess(b)" },
          { name: "V", meaning: "一次任务成功带来的业务价值", evidence: "成功任务价值 V" },
          { name: "Ccompute", meaning: "给定预算消耗的模型工具和验证计算成本", evidence: "计算成本 Ccompute(b)" },
          { name: "Clatency", meaning: "给定预算增加的响应等待和 SLA 损失", evidence: "延迟成本 Clatency(b)" }
        ]
      }],
      termReviews: [
        { section: 2, reviewedAt: "2026-07-27", terms: [
          { name: "思维链", meaning: "通过提示或示例让模型生成中间推理步骤的方法", purpose: "引出已有模型能力并让部分步骤可检查", definitionEvidence: "思维链提示引出已有能力", purposeEvidence: "一条中间步骤" }
        ]},
        { section: 3, reviewedAt: "2026-07-27", terms: [
          { name: "测试时缩放", meaning: "在回答阶段增加候选搜索验证或工具等计算", purpose: "用推理时算力提高可验证难题的成功机会", definitionEvidence: "测试时缩放输入", purposeEvidence: "输出额外计算下的端到端成功估计" },
          { name: "验证器", meaning: "对候选答案或中间步骤进行评分检查和选择的组件", purpose: "从多个候选中挑选更可能正确的结果", definitionEvidence: "验证器选中正确候选", purposeEvidence: "再乘 q=0.80" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["推理模型经专门后训练学习把额外计算用于拆解搜索检查修正。","输出经过拆解、搜索、检查和修正后的答案"],
          ["它解决模型回答更慢为什么可能代表难题能力提升。","额外计算用于难题"],
          ["输入任务预算候选工具，输出经推理处理的答案。","输入任务、可用推理预算、候选与验证工具"],
          ["按训练出的策略将预算用于搜索验证而非只写长解释。","不是单纯把可见解释写长"],
          ["慢表示投入更多预算，不表示该回答必然更正确。","不能保证时间越长越正确"],
          ["收益依任务模型和预算而异，简单任务可能不值得。","数学代码等任务上常有收益"]
        ]),
        six(2, [
          ["思维链是提示引出步骤，推理模型是后训练出的预算使用策略。","输出提示式思维链或经过后训练的推理模型"],
          ["它解决先想再答是否就等同推理模型的问题。","长解释既不是推理模型的充分条件也不是必要条件"],
          ["输入触发来源策略轨迹，输出概念分类。","输入触发方式、能力来源、计算策略和轨迹可见性"],
          ["比较提示触发与后训练预算分配及多候选工具能力。","推理模型学习怎样分配预算"],
          ["二者可组合，差异不由界面是否展示轨迹决定。","二者可以组合"],
          ["不能以解释文字长短判定是否使用推理模型。","不是必要条件"]
        ]),
        six(3, [
          ["测试时缩放是在回答阶段增加候选搜索验证工具计算。","输出额外计算下的端到端成功估计"],
          ["它解决同一模型如何用更多回答时算力提高成功率。","同一模型怎样用更多回答时计算提高难题成功机会"],
          ["输入 p、k、相关性和 q，输出端到端估计。","输入单条正确概率 p、候选数 k、候选相关性和验证器选中正确候选的概率 q"],
          ["先算至少一个正确候选概率再乘验证选择概率。","至少一个正确候选为 1−(1−p)^k"],
          ["独立假设数值约六成六只是理想化上限直觉。","再乘 q=0.80 上限约 66%"],
          ["真实候选相关会降低收益，不能把示例当性能承诺。","该数值只是预算直觉而非性能保证"]
        ]),
        six(4, [
          ["预算效用用成功价值减去计算和延迟成本评价推理投入。","输出期望效用 U(b)"],
          ["它解决多想一次新增成功是否值得额外费用延迟。","比较增加一档预算带来的边际效用"],
          ["输入 b、成功率价值和两类成本，输出 U。","输入推理预算 b、成功概率 Psuccess(b)、成功任务价值 V"],
          ["计算收益减成本并逐档比较边际效用。","用成功收益减两类成本"],
          ["一到四收益较大而四到八只多三题表示递减。","显示收益递减"],
          ["缺外部真值的事实问题不能靠预算创造证据。","不能靠加预算创造证据"]
        ]),
        six(5, [
          ["工程代价是推理轨迹候选验证工具增加的费用延迟和资源。","输出费用、响应时间、资源占用及路由选择"],
          ["它解决简单任务为何使用最高推理预算得不偿失。","简单格式化用单次生成"],
          ["输入长度候选验证工具 SLO 难度，输出代价与路由。","输入轨迹长度、候选数量、验证次数、工具调用、延迟 SLO 和任务难度"],
          ["按任务难度可验证性和风险选择生成搜索或独立检查。","难数学题可多候选验证"],
          ["高预算表示更多资源消耗，不等于所有任务质量提高。","高影响任务增加独立检查而非只拉长文字"],
          ["隐藏推理计费和上下文行为必须以实际接口测量。","必须按实际接口测量"]
        ]),
        six(6, [
          ["推理局限是搜索前提候选或验证器错误会随预算延续。","输出可接受答案、继续搜索、检索或拒答"],
          ["它解决搜索方向和验证器错时增加计算会发生什么。","模型可能沿错误前提搜索更深"],
          ["输入前提覆盖验证证据测试，输出继续或停止动作。","输入搜索前提、候选覆盖、验证器独立性、外部证据和最终测试"],
          ["依据外部测试验证候选，证据不足则检索或拒答。","数学代码事实分别需要代回、执行测试和来源核对"],
          ["可见解释不证明忠实，隐藏轨迹也不能直接审计。","可见解释不保证忠实"],
          ["高推理预算不是正确性或安全性的保证。","验证器也可能被同源错误欺骗"]
        ]),
        six(7, [
          ["失败诊断区分候选覆盖相关性验证器停止规则和证据缺失。","输出候选覆盖、相关性、验证器、停止规则或证据缺失的归因"],
          ["它解决高预算仍答错不能只归为一种故障的问题。","先查正确候选是否出现"],
          ["输入候选排序停止预算证据，输出分层归因。","输入全部候选、候选间差异、验证器排序、停止时点、预算曲线和外部证据"],
          ["先查正确候选出现，再查选择和停止是否正确。","再查是否被选中"],
          ["无候选指向生成覆盖，有候选未选中指向验证器。","有候选未选中则改验证器"],
          ["外部证据缺失时应检索拒答而非继续内省。","不应继续内省"]
        ])
      ]
    },
    guardrails: {
      contractVersion: 2,
      examples: [
        {
          section: 3,
          evidence: {
            setup: "含转账指令的不可信邮件",
            rule: "工具层按授权、账户和金额规则确定性拒绝",
            steps: "先标记来源并隔离内容",
            interpretation: "单层失效仍无副作用"
          }
        },
        {
          section: 4,
          evidence: {
            setup: "旧阈值漏5个、误拦18个；新阈值漏1个、误拦135个",
            rule: "FN×Cmiss + FP×Cblock + Creview",
            steps: "旧阈值 5090 元，新阈值 1675 元",
            interpretation: "在该损失假设下选新阈值"
          }
        }
      ],
      formulas: [{
        id: "guardrail-threshold-cost",
        section: 4,
        formulaIndex: 1,
        symbols: [
          { name: "Ecost", meaning: "给定护栏阈值下漏拦误拦和审核造成的期望总成本", evidence: "输出期望总成本 Ecost" },
          { name: "FN", meaning: "恶意请求被护栏错误放行的漏拦数量", evidence: "漏拦数 FN" },
          { name: "Cmiss", meaning: "一次漏拦造成的平均业务损失", evidence: "漏拦成本 Cmiss" },
          { name: "FP", meaning: "正常请求被护栏错误阻断的误拦数量", evidence: "误拦数 FP" },
          { name: "Cblock", meaning: "一次误拦造成的用户或业务损失", evidence: "误拦成本 Cblock" },
          { name: "Creview", meaning: "策略引入的延迟与人工审核总成本", evidence: "延迟审核成本 Creview" }
        ]
      }],
      termReviews: [
        { section: 2, reviewedAt: "2026-07-27", terms: [
          { name: "PII", meaning: "能够直接或间接识别个人的身份相关信息", purpose: "在输入和上下文层减少敏感数据暴露", definitionEvidence: "PII", purposeEvidence: "输入层查来源与速率" },
          { name: "schema", meaning: "规定输出字段类型和结构的机器可验证契约", purpose: "阻止格式错误输出直接进入下游动作", definitionEvidence: "schema", purposeEvidence: "输出层检查内容结构" }
        ]},
        { section: 4, reviewedAt: "2026-07-27", terms: [
          { name: "F1", meaning: "精确率与召回率的调和平均指标", purpose: "对比只看分类性能与按真实损失选择阈值的差异", definitionEvidence: "不能只看 F1", purposeEvidence: "基率、动作与成本变化后必须重算" }
        ]},
        { section: 6, reviewedAt: "2026-07-27", terms: [
          { name: "fail closed", meaning: "控制不可用或结果未知时默认拒绝或延迟", purpose: "避免高影响动作在防线故障时被自动放行", definitionEvidence: "fail closed", purposeEvidence: "高影响依赖失效时" },
          { name: "fail open", meaning: "控制不可用时允许低风险请求继续并同时告警", purpose: "在可接受风险下维持低影响功能可用性", definitionEvidence: "fail open", purposeEvidence: "低风险体验控制" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["护栏是模型部署后分布在预防限制检测恢复环节的控制组合。","输出模型外的预防、限制、检测和恢复控制"],
          ["它解决安全训练后仍存在业务权限攻击和地域等剩余风险。","承接安全训练无法覆盖的场景剩余风险"],
          ["输入模型红线权限地域攻击可逆性，输出场景控制。","输入已部署模型、业务红线、用户权限、数据地域、攻击和可逆性"],
          ["把具体风险映射到模型外可强制或可恢复的控制。","让一次模型误判不直接成为真实伤害"],
          ["目标是降低事故概率与损失半径而非宣告绝对安全。","降低发生概率和损失半径"],
          ["护栏通过不能被描述成系统绝对安全认证。","护栏不是绝对安全认证"]
        ]),
        six(2, [
          ["五层护栏分别控制输入上下文输出工具和运行轨迹。","输出每层可观察信号、控制和盲区"],
          ["它解决输入过滤为何拦不住格式合法但越权的动作。","每层只见局部"],
          ["输入五类信号，输出各层控制与不可见风险。","输入用户与外部文本、检索上下文、生成输出、工具动作和运行轨迹"],
          ["从来源隔离内容检查到工具鉴权和运行恢复逐层控制。","输入层查来源与速率，上下文层隔离"],
          ["某层通过只说明该层未命中，不代表端到端安全。","输出层检查内容结构"],
          ["高影响动作必须经过模型无法绕过的执行门。","不可由模型绕过的执行门"]
        ]),
        six(3, [
          ["邮件案例展示软分类漏报后工具硬规则仍阻断转账。","输出被拒转账与可审计轨迹"],
          ["它解决恶意邮件应在哪些控制点被拒绝的问题。","含转账指令的不可信邮件"],
          ["输入邮件调用权限白名单上限批准，输出拒绝和轨迹。","输入含转账指令的不可信邮件、模型候选调用、当前用户委托、白名单、单笔上限和批准状态"],
          ["先隔离来源，再按授权账户金额确定拒绝并记录规则。","先标记来源并隔离内容"],
          ["成功表示即使模型提议危险调用，外部仍无副作用。","单层失效仍无副作用"],
          ["案例不要求第一层永不漏报，而要求后续硬边界有效。","不是分类器永不漏报"]
        ]),
        six(4, [
          ["阈值成本把漏拦误拦与审核延迟按业务损失合计。","输出期望总成本 Ecost"],
          ["它解决更严格阈值是否一定更值得的问题。","基率、动作与成本变化后必须重算"],
          ["输入 FN FP 三类成本，输出期望成本与阈值选择。","输入恶意与正常请求数量、漏拦数 FN、误拦数 FP"],
          ["将漏误拦数量分别乘成本并加审核成本。","FN×Cmiss + FP×Cblock + Creview"],
          ["当前假设下新阈值成本更低所以优于旧阈值。","旧阈值 5090 元，新阈值 1675 元"],
          ["结论只对当前基率动作和成本成立，不能只看 F1。","不能只看 F1"]
        ]),
        six(5, [
          ["执行门是在真实副作用前强制身份资源参数上限审批的边界。","输出允许、拒绝或升级及有限副作用"],
          ["它解决输出分类通过为何仍不能证明工具动作安全。","输出内容安全不等于动作授权安全"],
          ["输入候选动作身份资源参数审批幂等，输出执行决定。","输入模型输出的候选动作、当前身份、资源、参数、上限、审批与幂等状态"],
          ["动作前重新鉴权并强制硬红线，之后记录和熔断。","确定性执行门在动作前重新鉴权"],
          ["允许只表示当前动作满足执行规则，不代表生成内容全安全。","软分类器负责降风险"],
          ["运行监控不能撤销已经发生的不可逆伤害。","不能撤销已经发生的不可逆伤害"]
        ]),
        six(6, [
          ["策略组合定义硬规则分类服务人工审批的顺序与故障默认。","输出短路拒绝、综合评分、升级或默认动作"],
          ["它解决多个分类器投票是否必然更安全的问题。","硬红线先执行且不能被低风险高分抵消"],
          ["输入控制优先级超时不可用，输出组合决定。","输入硬规则、模型分类器、外部服务、人工审批、优先级、超时和不可用状态"],
          ["先硬红线再软评分，按风险选择关闭或开放默认。","高影响依赖失效时 fail closed"],
          ["决定需携带规则版本和命中原因用于申诉回放。","每次决定保存规则版本和命中原因"],
          ["低风险才可 fail open，高影响未知必须拒绝或延迟。","低风险体验控制可 fail open 并告警"]
        ]),
        six(7, [
          ["护栏攻击面是分类规则日志供应链队列和更新数据的自身风险。","输出编码绕过、队列耗尽、数据污染、隐私外发与规则误伤风险"],
          ["它解决攻击者为何会攻击护栏而不只攻击主模型。","攻击者会针对最弱控制"],
          ["输入护栏组件和更新数据，输出绕过污染供应链风险。","输入分类器规则日志第三方服务人工队列和更新数据"],
          ["对护栏本身做权限审查容量保护和供应链测试。","护栏自身也需权限、供应链审查和容量保护"],
          ["测试通过仅表示当前分布下降低风险。","当前测试分布下降低风险"],
          ["不能把护栏输出视为内容安全认证。","不是内容安全认证"]
        ]),
        six(8, [
          ["故障注入主动破坏单层并验证真实执行边界和恢复能力。","输出硬边界、幂等、告警和恢复是否真实生效"],
          ["它解决模型口头拒绝是否证明工具不会调用的问题。","模型说“不会转账”不是执行证据"],
          ["输入全链路证据，输出边界幂等告警恢复结果。","输入模型文本、工具意图、策略决定、执行结果和外部业务状态"],
          ["注入不可用超时重复旧规则越权和满队列并查外部状态。","主动注入分类器不可用、超时、重复请求、旧规则"],
          ["通过表示外部系统没有未授权副作用且可恢复。","外部系统没有未授权副作用"],
          ["聊天措辞不能替代工具日志与业务状态证据。","不是执行证据"]
        ]),
        six(9, [
          ["线上护栏监控同时衡量攻击漏拦和正常用户伤害。","输出按语言、动作、来源和版本切片的护栏有效性"],
          ["它解决拦截率上升究竟是攻击增多还是规则误伤。","可能是攻击增加也可能是误伤"],
          ["输入攻击拦截申诉延迟副作用标签，输出切片有效性。","输入攻击成功、漏拦误拦、申诉、越权拦截、策略延迟"],
          ["随机抽样补漏并在分布变化后重新校准阈值。","随机人工抽样估计未命中风险"],
          ["命中率只是活动量，需真实标签才说明有效性。","只有命中数，不能证明控制有效"],
          ["总体指标不能掩盖语言动作来源等局部失效。","按语言、动作、来源和版本切片"]
        ]),
        six(11, [
          ["例外治理是有范围期限所有者和补偿控制的临时策略覆盖。","输出带工单的临时策略覆盖与审计记录"],
          ["它解决跳过规则的临时要求如何避免变成永久后门。","无所有者、范围或失效时间的例外就是永久后门"],
          ["输入申请批准理由范围期限监控撤销，输出例外记录。","输入申请者批准者、业务理由、主体资源动作范围、起止时间、补偿监控和撤销条件"],
          ["先算基础决定再显式覆盖，到期自动恢复并通知。","策略引擎先计算基础决定"],
          ["回放必须看出哪个例外怎样改变了原始决定。","显示例外如何改变结果"],
          ["硬红线例外需更高权限或双人批准，不能由模型创建。","高风险硬红线需更高权限或双人批准"]
        ])
      ]
    },
    "prompt-injection": {
      contractVersion: 2,
      examples: [{
        section: 4,
        evidence: {
          setup: "“总结 URL”的用户目标、不可信网页",
          rule: "不可信内容可以作为摘要数据，却不能扩大权限",
          steps: "逐步检查动作来源、必要性、主体资源权限和确认",
          interpretation: "拒绝读私密文件与外发，只保留摘要"
        }
      }],
      formulas: [],
      termReviews: [
        { section: 2, reviewedAt: "2026-07-27", terms: [
          { name: "token", meaning: "模型共同处理指令和外部数据的文本片段单位", purpose: "说明角色和自然语言都由同一统计模型解释", definitionEvidence: "一整串 token", purposeEvidence: "内容仍由同一模型解释" },
          { name: "SQL 注入", meaning: "攻击者让输入数据被数据库错误解释为查询语法的传统注入攻击", purpose: "对比参数化查询的强语法边界与自然语言歧义", definitionEvidence: "SQL 注入", purposeEvidence: "不能靠转义根治自然语言歧义" }
        ]},
        { section: 5, reviewedAt: "2026-07-27", terms: [
          { name: "Agent", meaning: "由模型规划并调用外部工具完成任务的系统", purpose: "说明提示注入如何从错误文字升级为真实副作用", definitionEvidence: "输入 Agent 可调用的工具", purposeEvidence: "造成真实副作用" },
          { name: "幂等", meaning: "重复执行同一业务动作也只产生一次等效结果", purpose: "降低超时重试或重复提议造成的副作用", definitionEvidence: "执行器必须最小授权、幂等", purposeEvidence: "对高风险动作确认" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["提示注入是把恶意命令放入模型会读取的内容以诱导偏离意图。","输出哪些文字是不可信数据、哪些动作偏离授权意图"],
          ["它解决模型会不会听错来源并执行攻击者指令的问题。","模型可能把它误当可服从指令"],
          ["输入用户目标外部内容和候选动作，输出信任与偏离判断。","输入用户目标、模型读到的外部内容和候选动作"],
          ["标记不可信来源并比较候选动作是否符合授权目标。","攻击者把命令写进网页邮件文档或工具返回"],
          ["被诱导表示模型行为选择偏离，不表示攻击者已获服务器权限。","被劫持的是行为选择而非服务器权限本身"],
          ["实际伤害仍由模型外执行器授予的权限决定。","取决于模型外执行器最终授予的权限"]
        ]),
        six(2, [
          ["提示注入成因是自然语言角色边界由模型统计解释而非强制隔离。","哪些边界只是统计信号、哪些边界可强制执行"],
          ["它解释网页文字为何可能被模型误当必须执行的命令。","新颖对抗文本可能让它误分指令和数据"],
          ["输入角色上下文和授权层，输出软信号与硬边界判断。","输入角色标记、自然语言上下文和模型外授权层"],
          ["模型解释角色内容，外部权限策略再强制检查动作。","内容仍由同一模型解释"],
          ["角色标记提高遵循概率但不提供绝对安全保证。","角色会影响模型"],
          ["自然语言不能仅靠转义根治，必须有独立执行控制。","独立权限和策略执行器阻断越权结果"]
        ]),
        six(3, [
          ["直接与间接注入按恶意文字的控制者和入口分类。","输出直接注入或间接注入及对应受害者"],
          ["它解决攻击来自用户还是外部内容以及谁会受害。","恶意文字的控制者和进入上下文的渠道"],
          ["输入控制者和渠道，输出类型与受害者。","输入恶意文字的控制者和进入上下文的渠道"],
          ["用户对话输入归直接，网页邮件工具结果归间接。","直接注入由当前用户在对话中发起"],
          ["间接注入更隐蔽且常使无辜用户成为受害者。","后者常让无辜用户成为受害者"],
          ["两类文字都不能成为扩大当前身份权限的凭证。","不能获得超出当前身份的工具权限"]
        ]),
        six(4, [
          ["网页案例演示不可信数据可进入模型但权限不能随之流入。","输出安全摘要、被拒动作和需要用户确认的草稿"],
          ["它解决总结网页时怎样阻止隐藏指令读取文件并外发。","模型提出的文件与发送动作"],
          ["输入目标网页候选动作和授权，输出摘要拒绝与确认。","输入“总结 URL”的用户目标、不可信网页"],
          ["按来源必要性权限确认逐步检查每个候选动作。","逐步检查动作来源、必要性、主体资源权限和确认"],
          ["安全结果保留摘要并拒绝私密读取与未确认发送。","拒绝读私密文件与外发，只保留摘要"],
          ["不可信文字永远不能扩大权限或批准外部副作用。","不能扩大权限、改变高层目标或批准副作用"]
        ]),
        six(5, [
          ["工具风险是模型被诱导后可借已有工具造成的最大影响。","输出注入成功后的最大影响面"],
          ["它解决接入工具与 Agent 后提示注入为何更危险。","还可能造成真实副作用"],
          ["输入工具凭证可逆性确认，输出最大影响面。","输入 Agent 可调用的工具、凭证范围、动作可逆性和确认机制"],
          ["将模型提议送入最小权限执行器并对高风险动作确认。","执行器必须最小授权、幂等并对高风险动作确认"],
          ["能力和自主度越大，成功注入可造成的后果通常越大。","工具能力和自主度会放大后果"],
          ["模型输出只是候选动作，不能直接成为权限凭证。","模型提议始终只是候选动作"]
        ]),
        six(6, [
          ["纵深防御用多层独立控制让单层误判不产生越权副作用。","输出未授权调用率、秘密泄露率、任务成功率和误拒率"],
          ["它解决关键词过滤为何不足以及应如何验证防线。","不是模型每次都口头识破攻击"],
          ["输入成对样本不变量日志，输出安全和效用指标。","输入干净与带攻击文档、权限不变量、工具日志和正常任务样本"],
          ["组合最小权限来源标记策略确认执行检查并攻击测试。","组合最小权限、内容来源标记、独立策略、人工确认和执行前检查"],
          ["通过表示权限不变量成立，不要求模型都识别攻击。","危险提议不能穿过授权边界"],
          ["必须同时观察误拒和任务成功，避免防线阻断正常使用。","任务成功率和误拒率"]
        ]),
        six(7, [
          ["提示注入与越狱按攻击目标和被突破边界区分。","输出提示注入、间接注入或越狱标签"],
          ["它解决两者手法相似时为何仍需分别命名。","手法可以重叠"],
          ["输入目标渠道受害者和边界，输出攻击标签。","输入攻击者目标、输入渠道、受害者和被突破的边界"],
          ["劫持系统行为归注入，突破内容限制归越狱。","提示注入侧重劫持系统行为"],
          ["同一输入可能同时实现行为劫持与安全限制突破。","同一输入也可能同时属于两者"],
          ["称为越狱不能成为忽略工具权限控制的理由。","不能因为称为越狱就忽略工具权限风险"]
        ])
      ]
    },
    privacy: {
      contractVersion: 2,
      examples: [
        {
          section: 3,
          evidence: {
            setup: "含身份证号和病史的工单",
            rule: "先在本地域替换标识，再只检索有权段落",
            steps: "删除沿缓存向量日志标注备份传播",
            interpretation: "只在输出端过滤不能撤回前面已经越界的数据"
          }
        },
        {
          section: 4,
          evidence: {
            setup: "每次查询预算 εi",
            rule: "基本组合把同一数据集上的 εi 相加",
            steps: "0.4+0.3+0.2 得 0.9",
            interpretation: "不替代访问授权、准确性或公平性"
          }
        }
      ],
      formulas: [{
        id: "privacy-basic-composition",
        section: 4,
        formulaIndex: 1,
        symbols: [
          { name: "εtotal", meaning: "同一保护范围内多次查询组合后的总隐私预算上界", evidence: "输出组合隐私预算 εtotal" },
          { name: "i", meaning: "参与组合的查询编号", evidence: "每次查询预算 εi" },
          { name: "ε", meaning: "一次差分隐私查询允许的隐私损失预算", evidence: "每次查询预算 εi" }
        ]
      }],
      termReviews: [
        { section: 1, reviewedAt: "2026-07-27", terms: [
          { name: "准标识符", meaning: "单独未必指名但与其他信息组合可缩小到个人的字段", purpose: "识别去掉姓名后仍可能发生的重新识别风险", definitionEvidence: "年龄邮编罕见病和时间仍可能组合重识别", purposeEvidence: "删掉姓名只移除最明显线索" }
        ]},
        { section: 2, reviewedAt: "2026-07-27", terms: [
          { name: "成员推断", meaning: "判断某条个人记录是否参与过模型训练的攻击", purpose: "评估模型输出是否泄露个人参与训练的信息", definitionEvidence: "成员推断", purposeEvidence: "攻击路径" }
        ]},
        { section: 4, reviewedAt: "2026-07-27", terms: [
          { name: "差分隐私", meaning: "限制单条记录加入或移除对输出分布影响的概率保证", purpose: "降低攻击者判断个人是否参与数据集的能力", definitionEvidence: "限制单条记录对输出分布的边际影响", purposeEvidence: "保护更强" },
          { name: "ε", meaning: "差分隐私中控制可区分程度的隐私损失预算", purpose: "累计衡量重复查询泄露并阻止超额使用", definitionEvidence: "每次查询预算 εi", purposeEvidence: "输出组合隐私预算 εtotal" },
          { name: "δ", meaning: "差分隐私保证允许超出主要概率界的小概率例外", purpose: "明确概率保证并非绝对零失败事件", definitionEvidence: "允许的小概率例外 δ", purposeEvidence: "预算限制单条记录" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["隐私识别判断数据能否直接或组合关联到自然人及其用途。","输出直接标识符、准标识符、敏感推断与目的外使用风险"],
          ["它解决删掉姓名后记录是否真的成为匿名数据。","删掉姓名只移除最明显线索"],
          ["输入字段外部信息目的和访问者，输出识别与用途风险。","输入数据字段、外部可联结信息、处理目的和可访问者"],
          ["组合准标识符并记录主体用途依据保存期和接收方。","年龄邮编罕见病和时间仍可能组合重识别"],
          ["脱敏只在特定攻击者知识和验证方法下成立。","只能相对明确攻击者知识和测试成立"],
          ["不能把去掉直接标识符称为永久匿名保证。","“已脱敏”只能相对明确"]
        ]),
        six(2, [
          ["隐私威胁模型覆盖训练推理运营和输出的全部数据路径。","输出记忆抽取、成员推断、跨租户检索、日志泄露或敏感属性推断等攻击路径"],
          ["它解决模型未打印姓名时系统仍可能怎样伤害隐私。","模型没有直接打印姓名不表示"],
          ["输入阶段副本和主体，输出攻击路径与验证证据。","输入训练、推理、运营和输出各阶段的数据副本与主体"],
          ["沿真实数据流检查供应商缓存标注备份和攻击前提。","沿数据实际流向检查供应商、缓存、标注和备份"],
          ["无直接输出只排除一种表现，不排除复制和推断风险。","目的外使用没有发生"],
          ["输出过滤不能修复数据已发第三方或跨租户取回。","上游复制和目的外使用"]
        ]),
        six(3, [
          ["客服案例展示敏感工单跨本地域检索模型日志和删除的完整链路。","输出最小化负载、受控令牌映射、授权结果、审计元数据与逐站删除回执"],
          ["它解决哪些最容易漏掉的副本和边界需要控制。","哪些副本最容易被清单漏掉"],
          ["输入敏感工单权限模型和删除请求，输出控制与回执。","输入含身份证号和病史的工单、租户权限、外部模型和删除请求"],
          ["本地替换标识后最小授权检索，回填再鉴权并传播删除。","回填前再次授权"],
          ["完成表示每站有最小数据和回执，不等于外部方零风险。","删除沿缓存向量日志标注备份传播"],
          ["输出端过滤无法撤回之前已经越界的输入数据。","不能撤回前面已经越界的数据"]
        ]),
        six(4, [
          ["差分隐私预算限制单条记录对随机输出分布的边际影响。","预算限制单条记录对输出分布的边际影响"],
          ["它解决重复加噪查询为什么仍需累计预算。","重复发布带噪统计时隐私泄露如何累计"],
          ["输入相邻集 εi δ 和时间范围，输出 εtotal 与准入。","输入相邻数据集、每次查询预算 εi、允许的小概率例外 δ 和时间范围"],
          ["基本组合把同一范围的每次 ε 预算相加。","基本组合把同一数据集上的 εi 相加"],
          ["较小 ε 通常隐私更强但会增加统计噪声。","ε 越小通常保护更强但统计噪声更大"],
          ["差分隐私不替代授权准确性公平性和用途控制。","不替代访问授权、准确性或公平性"]
        ]),
        six(5, [
          ["信任边界图是个人数据跨系统节点和副本的控制地图。","输出每次跨边界所需的最小化、授权、保留和回执控制"],
          ["它解决怎样发现只删主库而日志向量未删的缺口。","删除只做了主库、日志和向量库没删"],
          ["输入数据节点副本和删除链，输出逐边界控制。","输入数据从原始工单到受控域、模型方、输出追踪和删除链路的节点与副本"],
          ["沿箭头逐站核对字段所有者和删除回执状态。","沿箭头逐站核对字段、所有者和删除状态"],
          ["无负责人或回执的节点表示删除链仍不完整。","任一无负责人或无回执节点就是缺口"],
          ["图示不能替代网络流证据和真实删除回放。","不能替代实际网络日志和删除回放"]
        ]),
        six(6, [
          ["数据最小化按明确任务限制字段精度人数和保存时间。","输出保留、泛化、本地计算、聚合或删除决定"],
          ["它解决以后可能有用为何不能支持无限收集保存。","未来可能有用不是无限保存的目的"],
          ["输入目的字段精度人数时长和效用，输出最小处理决定。","输入任务目的、候选字段、精度、主体人数、保存时长和效用实验"],
          ["逐字段消融必要性并优先使用较粗较短较本地形式。","逐字段消融验证必要性"],
          ["保留决定表示当前目的下收益值得风险，不授权新目的。","训练调试分析各自单独授权"],
          ["新增用途必须重新评估，不能继承旧同意。","新用途必须重新评估"]
        ]),
        six(7, [
          ["权限控制让检索候选和工具动作服从当前主体资源动作授权。","输出允许的检索候选、工具调用与不可变审计记录"],
          ["它解决用户能提问是否等于代理能读取所有文档。","用户能提问不代表代理能读取全库"],
          ["输入主体租户资源字段动作凭证，输出授权结果。","输入当前主体、租户、资源、字段、动作和短期凭证"],
          ["召回前按允许域过滤，返回和写入时再次鉴权。","返回和写操作时再次按权威状态鉴权"],
          ["授权结果只适用于当前主体资源动作和时间。","缓存与嵌入也按租户隔离"],
          ["提示注入不能扩大底层身份拥有的权限范围。","提示注入也不能扩大身份权限"]
        ]),
        six(8, [
          ["删除谱系追踪原始数据到所有派生副本与模型权重。","输出已删除、排队删除、停止使用或暂不可验证的逐站状态"],
          ["它解决删数据库一行为何不能立刻声称已经遗忘。","界面消失不等于全链路遗忘"],
          ["输入对象与派生关系，输出逐站删除状态和回执。","输入原始对象及其清洗集、训练切片、嵌入、缓存、标注、检查点和备份派生关系"],
          ["直接存储删并回执，备份排程，权重另做遗忘验证。","可删存储返回完成回执"],
          ["状态必须区分完成排队停用和当前不可验证。","已删除、排队删除、停止使用或暂不可验证"],
          ["模型权重内单样本影响可能无法立即证明删除。","可能需重训或机器遗忘验证"]
        ]),
        six(9, [
          ["隐私评测用带辅助信息的攻击模拟验证真实暴露面。","输出攻击成功率、暴露人数字段、访问时长、误拦和删除完成率"],
          ["它解决随机未见手机号是否足以证明系统安全。","而非只随机扫手机号"],
          ["输入敏感切片攻击者知识和攻击测试，输出多维风险指标。","输入敏感切片、攻击者辅助知识、训练抽取、成员与属性推断"],
          ["模拟已知线索并分别执行抽取推断越权和删除回放。","测试应模拟攻击者已知部分模板或身份线索"],
          ["攻击率需连同暴露人数和高影响尾部事件解释。","按高影响尾部事件单独报告"],
          ["单一平均隐私分数不能掩盖罕见严重泄露。","不能掩盖罕见但严重泄露"]
        ]),
        six(10, [
          ["供应商验证比较合同声明与系统实际发送和保留的数据。","输出声明与实际网络流的一致性证据"],
          ["它解决不用于训练条款在运行时如何证明。","合同条款、子处理方、区域、字段、保留、训练使用"],
          ["输入合同处理方区域字段保留加密删除，输出一致性证据。","输入合同条款、子处理方、区域、字段、保留、训练使用、加密密钥和删除接口"],
          ["以网络代理审计日志抽样核对实际字段并随变化复核。","用代理与审计日志抽样核对"],
          ["一致表示观察期内流量符合声明，不表示供应商零风险。","模型或条款变化触发再评估"],
          ["无法举证时限制数据或换方案，自托管也需承担新责任。","无法举证就限制数据或更换方案"]
        ]),
        six(11, [
          ["隐私误区辨析把常见控制声明映射到实际覆盖与残余风险。","隐私误区辨析是把常见控制声明映射"],
          ["它解决去姓名加密不训练等说法为何不是完整隐私保证。","这些局部控制为何不能成为完整隐私保证"],
          ["输入常见隐私声明，输出其覆盖范围和未覆盖风险。","输出该声明真正覆盖的风险与仍未覆盖的数据流"],
          ["逐项核对目的可关联性访问副本和删除证据。","逐项回到目的、可关联性、访问、派生副本和删除证据"],
          ["加密保护传输存储，不限制解密后的用途与访问。","不限制解密后的合法账户滥用"],
          ["辨析结论不替代法律判断和完整攻击验证。","不替代具体法律判断或对完整系统的攻击验证"]
        ])
      ]
    },
    "uncertainty-calibration": {
      contractVersion: 2,
      examples: [{
        section: 4,
        evidence: {
          setup: "十笔退款的分数和正确标签",
          rule: "计算规则是每桶的 |准确率−平均置信| 乘该桶样本占比",
          steps: "低桶贡献 0.010，中桶 0.040，高桶 0.070",
          interpretation: "高桶平均置信 0.90 却只正确 2/3"
        }
      }],
      formulas: [
        {
          id: "calibration-ece",
          section: 3,
          formulaIndex: 1,
          symbols: [
            { name: "ECE", meaning: "各置信分桶加权后的平均校准差距", evidence: "输出可靠性图与期望校准误差 ECE" },
            { name: "m", meaning: "当前置信度分桶的编号", evidence: "分桶 Bm" },
            { name: "B", meaning: "落入同一置信范围的预测样本集合", evidence: "分桶 Bm" },
            { name: "n", meaning: "参与校准评估的预测样本总数", evidence: "输入 n 个预测" },
            { name: "acc", meaning: "某个置信分桶内的实际正确比例", evidence: "实际准确率 acc(Bm)" },
            { name: "conf", meaning: "某个置信分桶内的平均模型分数", evidence: "每桶平均置信 conf(Bm)" }
          ]
        },
        {
          id: "calibration-decision-cost",
          section: 6,
          formulaIndex: 1,
          symbols: [
            { name: "Cost", meaning: "给定阈值策略下三类结果的总期望成本", evidence: "输出自动、转人工或拒绝以及期望成本 Cost(τ)" },
            { name: "τ", meaning: "决定样本能否自动处理的校准分数阈值", evidence: "阈值 τ" },
            { name: "Cerror", meaning: "一次错误自动处理造成的业务成本", evidence: "错误成本 Cerror" },
            { name: "PerrorAuto", meaning: "样本错误且被自动处理的概率", evidence: "三类结果的概率乘成本" },
            { name: "Cmanual", meaning: "一次转交人工审核的成本", evidence: "人工成本 Cmanual" },
            { name: "Pmanual", meaning: "样本被转交人工的概率", evidence: "输出自动、转人工或拒绝" },
            { name: "Creject", meaning: "一次拒绝或延迟服务造成的成本", evidence: "拒绝成本 Creject" },
            { name: "Preject", meaning: "样本被系统拒绝处理的概率", evidence: "输出自动、转人工或拒绝" }
          ]
        }
      ],
      termReviews: [
        { section: 2, reviewedAt: "2026-07-27", terms: [
          { name: "logprob", meaning: "模型为某个 token 给出的对数条件概率", purpose: "构造连续原始分数并分析生成偏好", definitionEvidence: "token 的 logprob", purposeEvidence: "构造原始分数" },
          { name: "校准集", meaning: "只用于学习原始分数到经验正确率映射的独立带标签样本", purpose: "避免在训练或最终测试数据上拟合概率解释", definitionEvidence: "独立校准集", purposeEvidence: "学习该分数到任务正确频率的映射" }
        ]},
        { section: 3, reviewedAt: "2026-07-27", terms: [
          { name: "ECE", meaning: "置信分桶内置信度与准确率差异的加权平均", purpose: "检查概率承诺是否匹配经验频率", definitionEvidence: "期望校准误差 ECE", purposeEvidence: "平均差距越小" },
          { name: "Brier", meaning: "预测概率与二元真实标签平方差的平均评分", purpose: "同时惩罚概率偏差和错误结果", definitionEvidence: "Brier 分数", purposeEvidence: "同时惩罚概率偏差和错误" },
          { name: "似然", meaning: "模型对已观察标签赋予概率的大小", purpose: "用带标签数据衡量概率预测是否支持真实结果", definitionEvidence: "负对数似然", purposeEvidence: "惩罚更重" },
          { name: "对数似然", meaning: "把真实标签概率取对数后汇总的概率评分", purpose: "更强惩罚给错误结果极低概率的过度自信预测", definitionEvidence: "负对数似然", purposeEvidence: "高置信却错误”惩罚更重" }
        ]},
        { section: 5, reviewedAt: "2026-07-27", terms: [
          { name: "logits", meaning: "softmax 转换前各类别未归一化的模型分数", purpose: "作为温度缩放调整概率尖锐程度的输入", definitionEvidence: "输入分类 logits z", purposeEvidence: "输出 softmax(z/T) 的重标度概率" },
          { name: "softmax", meaning: "把各类别实数分数转换成总和为一的概率分布", purpose: "由温度控制分类概率分布的尖锐或平缓程度", definitionEvidence: "softmax(z/T)", purposeEvidence: "软化过度尖锐分布" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["校准要求相同分数组的声称概率匹配经验正确频率。","相同分数组的经验正确率是否匹配声称概率"],
          ["它解决总体准确相同的系统谁更能识别自己会错。","两个准确率都是 80% 的助手"],
          ["输入答案分数和标签，输出分组概率匹配判断。","输入一组任务答案、模型分数和最终正确标签"],
          ["将相同分数样本分组并比较长期正确频率。","0.8 是否长期约对应 80% 正确"],
          ["准确率区分度和校准分别衡量数量排序和数值含义。","三者不是一回事"],
          ["恒报基准率可能校准却不能用于风险分流。","没有分流价值"]
        ]),
        six(2, [
          ["原始置信信号是尚未拥有任务正确概率含义的风险分数。","输出一个尚未具备概率含义的风险分数"],
          ["它解决模型自述与 token 概率是否能直接当正确率。","都不能直接解释为答案正确概率"],
          ["输入概率采样自评证据验证器和分歧，输出原始分数。","输入 token 概率、多次采样、模型自评、检索覆盖、外部验证器和模型分歧"],
          ["在独立校准集学习分数到明确任务事件频率的映射。","学习该分数到任务正确频率的映射"],
          ["映射后的数值只对应已定义的任务正确事件。","任务事件可以是“退款资格正确且引用支持”"],
          ["平均 token 概率和自信措辞都不是天然正确概率。","平均 token 概率和“我很确定”的措辞"]
        ]),
        six(3, [
          ["可靠性图和 ECE 检查置信承诺与实际正确频率。","输出可靠性图与期望校准误差 ECE"],
          ["它解决一批零到一分数是否名副其实的问题。","怎样检查一批 0 到 1 的分数"],
          ["输入预测分桶置信和准确，输出图与 ECE。","输入 n 个预测、分桶 Bm、每桶平均置信 conf(Bm)"],
          ["逐桶求绝对差并按样本占比加权求和。","再乘该桶样本占比 |Bm|/n 并求和"],
          ["较小 ECE 只表示当前分桶下平均差距较小。","当前分桶下平均差距越小"],
          ["桶边界和切片可掩盖失准，不能机械跨设置比较。","不能跨不同分桶机械比较"]
        ]),
        six(4, [
          ["ECE 数值案例把十笔退款按低中高置信分桶计算。","输出低中高三桶贡献与总 ECE"],
          ["它暴露高分组实际错误率远高于分数声称。","高桶平均置信 0.90 却只正确 2/3"],
          ["输入十笔分数与标签，输出桶贡献和总误差。","输入十笔退款的分数和正确标签"],
          ["分别得到三桶加权差并相加为约零点一二。","低桶贡献 0.010，中桶 0.040，高桶 0.070"],
          ["高桶过度自信说明原零点七阈值并不安全。","原阈值会放行大量高成本错误"],
          ["十个样本只演示算法，不能作为精确生产估计。","不能把 0.120 当精确生产估计"]
        ]),
        six(5, [
          ["温度缩放是在不改排序下重标度分类概率的后处理。","输出 softmax(z/T) 的重标度概率"],
          ["它解决分类概率普遍过尖且过度自信的问题。","软化过度尖锐分布"],
          ["输入 logits 校准标签和 T，输出重标度概率。","输入分类 logits z、独立校准标签和温度 T"],
          ["选择最小化校准集负对数似然的温度。","选择使校准集负对数似然最小的 T"],
          ["T 大于一软化概率且通常不改变 top1 类别。","通常不改 top1 预测"],
          ["它不创造知识，事件或分布变化后需重新验证。","不创造缺失知识"]
        ]),
        six(6, [
          ["选择性决策按校准阈值选择自动人工或拒绝。","输出自动、转人工或拒绝以及期望成本 Cost(τ)"],
          ["它解决覆盖率和被自动处理样本风险如何取舍。","覆盖也降低选择性风险"],
          ["输入分数阈值成本容量和 SLA，输出动作和成本。","输入校准分数、阈值 τ、错误成本 Cerror"],
          ["仅让过阈值样本自动并求各结果概率成本之和。","按三类结果的概率乘成本并求和"],
          ["阈值升高通常减少自动覆盖同时降低错误风险。","阈值升高通常降低覆盖"],
          ["审核队列满不能成为绕过高风险门槛的理由。","队列满时不能绕过高风险门槛"]
        ]),
        six(7, [
          ["序列置信是受长度措辞和共享盲点影响的生成信号。","输出经过任务定义的风险分数"],
          ["它解释每个 token 高概率为何整段仍可能幻觉。","为什么整段答案仍可能是幻觉"],
          ["输入 token 概率长度采样事件证据，输出任务风险分数。","输入 token 条件概率、文本长度、语义采样、任务事件和外部证据"],
          ["针对资格引用工具业务状态分别定义并校准事件。","分别校准资格、引用、工具和业务状态"],
          ["高序列概率可能只代表常见短措辞而非事实正确。","平均 logprob 偏好常见短措辞"],
          ["分布外和对抗输入可使映射失效，高置信不保安全。","高置信不是安全证明"]
        ]),
        six(8, [
          ["生产校准监控持续连接分数版本阈值决策和成熟标签。","输出滚动 ECE、Brier、风险覆盖曲线"],
          ["它解决真实标签延迟时怎样发现校准随时间腐烂。","真实正确标签常常延迟几天"],
          ["输入分数版本阈值切片标签，输出指标和响应。","输入原始分数、校准版本、阈值、决策、切片和延迟成熟标签"],
          ["冻结发布证据金丝雀抽查，标签成熟后分切片重算。","标签成熟后按语言政策和长度重算"],
          ["代理只作预警，成熟标签才验证真实概率含义。","代理信号只做早期预警"],
          ["无代表性新标签时调温度不能恢复旧映射有效性。","单纯调大温度不能恢复校准"]
        ])
      ]
    },
    hallucination: {
      contractVersion: 2,
      examples: [{
        section: 5,
        evidence: {
          setup: "以“张伟论文”为例",
          rule: "先按作者年份主题检索，再交叉核对作者主页和 DOI",
          steps: "仍无精确匹配就说明检索范围并请求机构信息",
          interpretation: "高影响断言必须由外部证据验证"
        }
      }],
      formulas: [{
        id: "atomic-fact-support-rate",
        section: 6,
        formulaIndex: 1,
        symbols: [
          { name: "Rsupport", meaning: "可核验断言中得到指定可靠证据支持的比例", evidence: "支持率 Rsupport" },
          { name: "Nsupported", meaning: "被指定可靠来源明确支持的断言数量", evidence: "被支持数 Nsupported" },
          { name: "Nverifiable", meaning: "回答中能够按证据独立查证的断言总数", evidence: "可核验断言数 Nverifiable" }
        ]
      }],
      termReviews: [
        { section: 2, reviewedAt: "2026-07-27", terms: [
          { name: "token", meaning: "语言模型处理和预测的文本片段单位", purpose: "说明模型训练直接优化的是续写概率而非事实核验", definitionEvidence: "下一 token 训练", purposeEvidence: "并不查询一个通用真相裁判" },
          { name: "似然", meaning: "在模型假定的分布下当前文本或续写出现的相对可能程度", purpose: "说明语言上常见的续写不自动等于真实世界事实", definitionEvidence: "语言似然无法验证", purposeEvidence: "语言上合理的续写" },
          { name: "语言似然", meaning: "一段续写在模型所学语言分布下出现的相对可能性", purpose: "区分语言上合理与世界事实为真", definitionEvidence: "只靠语言似然无法验证", purposeEvidence: "语言上合理的续写" }
        ]},
        { section: 5, reviewedAt: "2026-07-27", terms: [
          { name: "RAG", meaning: "生成前先从外部资料检索相关证据再回答的方法", purpose: "把回答锚定到可核验的当前材料", definitionEvidence: "RAG 给真实材料", purposeEvidence: "先按作者年份主题检索" },
          { name: "DOI", meaning: "用于长期标识学术论文等数字对象的唯一标识符", purpose: "交叉核对题名作者和真实出版记录", definitionEvidence: "DOI 注册库", purposeEvidence: "交叉核对作者主页和 DOI" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["幻觉是看似可信却缺乏依据或事实错误的模型生成。","专指看似可信却缺乏依据或事实错误的生成"],
          ["它解决为何流畅细节丰富的编造需与普通错误区分。","危险来自流畅细节让读者难以察觉"],
          ["输入输出断言与权威证据，输出支持矛盾等标记。","输入模型输出、可核验断言和权威证据"],
          ["把断言逐条与指定证据比对并标注状态。","输出“支持、矛盾、未覆盖或不可核验”的标记"],
          ["未覆盖表示现有证据不足，不等于断言必然为假。","不能把“暂未找到”直接写成“不存在”"],
          ["没有明确证据范围时不得从查无结果推断不存在。","没有指定证据范围时"]
        ]),
        six(2, [
          ["结构性幻觉风险来自语言似然目标不包含通用事实验证。","只靠语言似然无法验证的事实缺口"],
          ["它解释更大模型为何仍可能在开放世界和长尾事实中编造。","长尾或开放世界问题"],
          ["输入训练目标问题和证据，输出是否存在事实验证缺口。","输入训练目标、问题和模型可用证据"],
          ["模型按上下文提高续词概率而不是查询真相裁判。","并不查询一个通用真相裁判"],
          ["合理续写表示语言模式匹配，不表示世界事实正确。","语言上合理的续写"],
          ["规模数据工具可降风险，但不能保证所有未知事实零错。","不能对所有未知事实给出零错误保证"]
        ]),
        six(3, [
          ["表面自信是表达风格与生成分布的现象，不是事实把握。","语气强度是否与证据匹配"],
          ["它解决笃定措辞为什么不能当作内容正确证据。","肯定语气成为事实概率"],
          ["输入概率风格证据和校准，输出语气证据匹配判断。","输入生成概率、表达风格、证据覆盖和校准结果"],
          ["将表达强度与外部证据覆盖和任务校准比较。","依赖外部验证和经任务校准的风险信号"],
          ["笃定只表示生成出肯定句，不表示模型知道真相。","不使肯定语气成为事实概率"],
          ["模型自述没有可直接验证的内在编造标志。","没有可直接读取的内在“我正在编造”标志"]
        ]),
        six(4, [
          ["高发条件是增加无依据模式补全风险的输入和采样信号。","输出需要检索、澄清、降温或拒答的风险动作"],
          ["它帮助判断哪些问题不应直接依赖参数记忆回答。","哪些信号说明模型正在从“有依据回答”滑向“按语言模式补全”"],
          ["输入覆盖时间预设温度和资料，输出风险控制动作。","输入知识覆盖、时间范围、问题预设、采样温度和可用资料"],
          ["识别冷门新近错误预设与高温后选择控制措施。","冷门私有事实、知识截止后的事件"],
          ["条件出现表示风险提高，并不宣告该次回答必错。","不表示每次必错"],
          ["低温仍可能稳定复现错误，不能作为事实保证。","即使低温也可能稳定复现同一错误"]
        ]),
        six(5, [
          ["幻觉缓解组合检索引用工具澄清拒答和人工复核。","输出有引用的回答、带范围的“不确定”、澄清问题或转人工"],
          ["它解决重要事实如何先取证再回答而不是按模式补全。","高影响断言必须由外部证据验证"],
          ["输入问题来源工具覆盖与风险，输出回答或升级动作。","输入待核验问题、检索来源、工具结果、证据覆盖和任务风险"],
          ["检索作者信息并交叉核对，失败后说明范围并澄清。","先按作者年份主题检索"],
          ["未找到精确匹配只支持带范围的不确定结论。","说明检索范围并请求机构信息"],
          ["RAG 引用提示仍会失效，关键事实必须外部核验。","RAG、引用和提示都可能失效"]
        ]),
        six(6, [
          ["原子事实评测逐条衡量可核验断言的证据支持。","输出可核验断言数 Nverifiable、被支持数 Nsupported"],
          ["它避免整段二元打分掩盖一条危险的关键错误。","一个药量、金额或 DOI 的关键矛盾可让整段失败"],
          ["输入回答和证据集，输出支持率矛盾率和覆盖率。","输入一段回答和指定证据集"],
          ["拆最小断言映射来源并计算支持数除以可核验数。","Nsupported/Nverifiable 计算比例"],
          ["五条中三条支持得到百分之六十的相对证据精度。","5 条中 3 条支持即 60%"],
          ["平均支持率不能抵消高影响矛盾或低证据覆盖。","不能只看平均支持率"]
        ]),
        six(7, [
          ["分层诊断把幻觉归因到检索来源生成引用或拒答环节。","输出检索覆盖、证据质量、忠实性、引用正确性或选择性回答的失败归因"],
          ["它解决有真实引用却不支持邻近断言时错误在哪里。","有引用但引用不支持断言时如何定位错误"],
          ["输入候选来源断言映射和拒答，输出分层失败归因。","输入检索候选、来源版本、回答断言、引用映射和拒答行为"],
          ["依次检查取回质量忠实性引用对应和拒答。","先问证据是否取回，再问来源是否可靠"],
          ["不同层结果说明不同故障位置，不能相互替代。","是不同目标，不能互相替代"],
          ["闭卷事实性、材料忠实性与引用正确性需分别评估。","闭卷事实性、给定材料忠实性和引用正确性"]
        ])
      ]
    },
    "data-drift-monitoring": {
      contractVersion: 2,
      examples: [{
        section: 4,
        evidence: {
          setup: "退款原因从 50/30/20 变成 30/30/40",
          rule: "计算规则仍是逐桶求 (a−e)×ln(a/e) 后相加",
          steps: "不想要贡献约 0.102，尺寸为 0，质量贡献约 0.139",
          interpretation: "最大贡献提示质量问题占比翻倍"
        }
      }],
      formulas: [
        {
          id: "drift-psi",
          section: 3,
          formulaIndex: 1,
          symbols: [
            { name: "PSI", meaning: "各离散桶分布变化贡献的总和", evidence: "输出各桶贡献和总漂移量 PSI" },
            { name: "i", meaning: "正在比较的离散数据桶编号", evidence: "最后对桶 i 求和" },
            { name: "a", meaning: "当前监控窗口中的桶比例", evidence: "当前窗口的比例 ai" },
            { name: "e", meaning: "基线参照窗口中的桶比例", evidence: "基线比例 ei" },
            { name: "ln", meaning: "用于比较比例倍数的自然对数函数", evidence: "自然对数 ln(ai/ei)" }
          ]
        },
        {
          id: "drift-slice-mixture",
          section: 6,
          formulaIndex: 1,
          symbols: [
            { name: "Qoverall", meaning: "所有切片混合后的总体任务表现", evidence: "输出总体表现 Qoverall" },
            { name: "k", meaning: "语言地区风险等切片的编号", evidence: "每个切片" },
            { name: "w", meaning: "某个切片占全部流量的比例", evidence: "流量权重 wk" },
            { name: "q", meaning: "某个切片内部的任务表现", evidence: "切片表现 qk" }
          ]
        }
      ],
      termReviews: [
        { section: 1, reviewedAt: "2026-07-27", terms: [
          { name: "协变量漂移", meaning: "模型输入分布 P(x) 发生变化", purpose: "区分输入构成改变与正确答案规则改变", definitionEvidence: "P(x) 变表示输入构成变", purposeEvidence: "分类只定位变化发生在哪一层" },
          { name: "概念漂移", meaning: "同样输入对应的正确标签关系 P(y|x) 发生变化", purpose: "识别旧决策规则在新政策下失效", definitionEvidence: "P(y|x) 变表示同样输入的正确答案规则变", purposeEvidence: "旧决策边界失效" }
        ]},
        { section: 3, reviewedAt: "2026-07-27", terms: [
          { name: "PSI", meaning: "汇总离散桶当前比例与基线比例差异的指数", purpose: "提供可持续比较的分布变化效应信号", definitionEvidence: "输出各桶贡献和总漂移量 PSI", purposeEvidence: "作为需要调查的效应信号" },
          { name: "高维", meaning: "一个样本同时由很多特征坐标表示的状态", purpose: "说明普通单变量距离不足以覆盖复杂嵌入变化", definitionEvidence: "高维嵌入", purposeEvidence: "可做分类器二样本检验或聚类监控" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["漂移分类区分协变量标签概念和真实性能四种变化。","输出协变量、标签、概念或性能漂移的诊断"],
          ["它解决用户说法标签比例规则和实际错误是否是一回事。","用户说法变了、退款资格规则变了、模型答错变多"],
          ["输入历史与当前的 x、y、条件关系和指标，输出漂移类型。","输入过去与当前的输入 x、标签 y、条件关系和任务指标"],
          ["分别比较 P(x)、P(y)、P(y|x) 和直接性能。","P(x) 变表示输入构成变"],
          ["分类结果定位变化层级，不等于已经证明任务受损。","只定位变化发生在哪一层"],
          ["不能单凭输入分布变化断言模型质量下降。","不能单凭输入变化断言模型已经变差"]
        ]),
        six(2, [
          ["基线是带版本的历史分布或系统参照。","输出训练集、最近稳定期、去年同期或控制组等带版本参照"],
          ["它解决当前流量究竟应和哪个时期或版本比较。","当前流量应该和训练集、上周还是去年同期比较"],
          ["输入问题版本季节与窗口，输出合适的参照。","输入监控问题、应用与模型版本、季节性和时间窗口"],
          ["组合快速慢速季节和控制基线并核对版本。","快速窗口发现突变，慢速窗口观察趋势"],
          ["不同基线回答不同问题，越线含义必须随参照解释。","比较前先确认提示、索引、政策和埋点版本一致"],
          ["滚动基线可能跟随变化并吞掉慢性漂移。","滚动基线可能吞掉慢性漂移"]
        ]),
        six(3, [
          ["PSI 汇总同一组离散桶当前与基线比例的变化。","输出各桶贡献和总漂移量 PSI"],
          ["它把多个类别比例差异压成可比较的漂移信号。","词类比例差多少，怎样压成一个可比较数"],
          ["输入 ai 与 ei，输出桶贡献和 PSI 总值。","输入同一组离散桶在当前窗口的比例 ai 与基线比例 ei"],
          ["逐桶求差乘对数比例并对 i 求和。","逐桶计算差值 ai−ei，再乘自然对数"],
          ["零表示分桶分布相同，较高表示差异较大。","分布相同时结果为零"],
          ["分桶平滑样本量会改变数值，不能自动触发重训。","不能作为自动重训结论"]
        ]),
        six(4, [
          ["PSI 手算案例分解退款原因各桶对总漂移的贡献。","输出每桶 PSI 贡献、总和及业务解释"],
          ["它找出整体数值主要由哪个业务类别推动。","漂移主要来自哪里"],
          ["输入退款原因的基线和当前比例，输出贡献与总和。","输入“不想要、尺寸、质量”等桶的基线 e 与当前 a"],
          ["按同一公式逐桶计算并把贡献相加。","三项和约 0.241"],
          ["质量桶贡献最大提示该原因占比翻倍值得调查。","最大贡献提示质量问题占比翻倍"],
          ["完整分桶和平滑不同会改总值，仍需政策和真值确认。","仍需核对 45 天政策和 14 天成熟标签"]
        ]),
        six(5, [
          ["延迟标签监控把即时代理与稍后成熟的业务真值连接。","输出早期预警和成熟性能"],
          ["它解决最终退款正确性需十四天才能知道时如何预警。","退款最终是否正确要 14 天才知道"],
          ["输入即时代理和回填结果，输出预警与真实性能。","输入检索空结果、重问、人工接管、置信等即时代理"],
          ["保存事件切片版本，标签成熟后重算质量和校准。","标签成熟后再计算准确率、风险、校准和覆盖"],
          ["代理只提出假设，必须由最终业务状态校验。","代理只能提出待验证假设"],
          ["未成熟样本不能因为尚无失败而提前记为正确。","不能提前记为正确"]
        ]),
        six(6, [
          ["切片监控同时观察总体加权表现和群体内部表现。","输出总体表现 Qoverall 与各切片区间"],
          ["它解决总体稳定掩盖少数高风险群体退化的问题。","权重变化能掩盖少数群体退化"],
          ["输入 wk、qk、样本量和风险，输出总体与切片区间。","输入每个切片的流量权重 wk、切片表现 qk、样本量和风险等级"],
          ["按权重求总体并分别比较构成与切片内变化。","同时比较构成变化与切片内变化"],
          ["总体变化可能仅来自流量构成而非任何切片变差。","总体是各切片表现的加权和"],
          ["小样本需区间，高损失切片不能只等总体显著。","高损失切片可使用事件门槛"]
        ]),
        six(7, [
          ["调查树是从漂移告警到验证根因和选择修复的流程。","输出经验证的根因候选和修复选择"],
          ["它避免把任何统计变化直接等同于需要自动重训。","检测到漂移后是否应该自动重训"],
          ["输入告警版本和切片证据，输出根因候选与动作。","输入一次漂移告警、版本与切片证据"],
          ["先验信号再查切片外因，回放后选择最小修复。","先排除埋点时区采样等信号错误"],
          ["只有对照回放支持的候选才能作为可行动根因。","在新旧系统和冻结工具响应上回放"],
          ["异常生产输入须审核，不能自动写回训练集。","不能自动回流训练"]
        ]),
        six(8, [
          ["告警手册把监控信号连接到负责人和允许的处置动作。","输出观察、呼叫、阻断、回滚或转人工处置"],
          ["它解决红灯太多却无人知道何时做什么的问题。","每天几十个红灯没人处理"],
          ["输入阈值预算负责人动作，输出分级响应。","输入基线、窗口、最小样本、效应阈值、错误预算、负责人和允许动作"],
          ["普通噪声看连续窗口，安全事件可即时阻断。","安全事件可立即阻断"],
          ["告警表示规则越线，需要调查或止损而非宣告根因。","恢复后记录真阳性和处置收益"],
          ["没告警只覆盖已选特征，不能证明系统没有退化。","不证明系统没有退化"]
        ])
      ]
    },
    deployment: {
      contractVersion: 2,
      examples: [{
        section: 4,
        evidence: {
          setup: "准确率 +3 点、吞吐减半、p95 翻倍",
          rule: "若门槛是任务≥87%、越权≤0.5%、p95≤1.8s、峰值容量≥16 req/s",
          steps: "ceil(24/17)=2",
          interpretation: "优化后才进入金丝雀"
        }
      }],
      formulas: [
        {
          id: "deployment-capacity",
          section: 3,
          formulaIndex: 1,
          symbols: [
            { name: "ρ", meaning: "请求系统的资源利用率", evidence: "输出利用率 ρ" },
            { name: "λ", meaning: "单位时间到达的请求数量", evidence: "到达率 λ" },
            { name: "S", meaning: "一个请求平均占用服务资源的时间", evidence: "平均服务时间 S" },
            { name: "c", meaning: "能够同时服务请求的并行槽位数", evidence: "并行槽位 c" },
            { name: "Lsystem", meaning: "系统内正在服务或排队的平均请求数", evidence: "系统内平均请求数 Lsystem" },
            { name: "W", meaning: "请求从进入到完成的端到端平均时间", evidence: "端到端平均时间 W" }
          ]
        },
        {
          id: "deployment-release-unit",
          section: 7,
          formulaIndex: 1,
          symbols: [
            { name: "ReleaseUnit", meaning: "必须作为一个整体追踪和回滚的发布单元", evidence: "输出一个 releaseId 与兼容矩阵" },
            { name: "Model", meaning: "发布使用的模型版本", evidence: "输入模型、提示、解码" },
            { name: "Prompt", meaning: "发布使用的提示版本", evidence: "输入模型、提示、解码" },
            { name: "Decode", meaning: "生成时使用的解码配置", evidence: "输入模型、提示、解码" },
            { name: "Index", meaning: "检索使用的索引版本", evidence: "索引用蓝绿别名" },
            { name: "ToolSchema", meaning: "工具输入输出的接口契约版本", evidence: "工具 schema" },
            { name: "Policy", meaning: "权限与安全策略版本", evidence: "策略、代码和基础设施配置" },
            { name: "Code", meaning: "编排和服务代码版本", evidence: "策略、代码和基础设施配置" },
            { name: "Infra", meaning: "承载服务的基础设施配置版本", evidence: "基础设施配置" }
          ]
        }
      ],
      termReviews: [
        { section: 3, reviewedAt: "2026-07-27", terms: [
          { name: "continuous batching", meaning: "运行中持续把新请求加入当前批次的调度方式", purpose: "提高不同长度生成请求共享硬件的吞吐", definitionEvidence: "continuous batching 提升吞吐但让调度复杂", purposeEvidence: "提高吞吐" }
        ]},
        { section: 7, reviewedAt: "2026-07-27", terms: [
          { name: "幂等键", meaning: "让相同业务动作的重复请求只生效一次的稳定标识", purpose: "防止超时重试造成重复退款等副作用", definitionEvidence: "重试不重复退款", purposeEvidence: "使用幂等键" },
          { name: "expand/contract", meaning: "先扩展兼容结构、迁移后再删除旧结构的 schema 变更流程", purpose: "使新旧代码在发布与回滚期间都能读写", definitionEvidence: "先让新旧代码都能读写", purposeEvidence: "再迁移，最后删除旧字段" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["运行位置决定托管、自托管、端侧或混合方案及责任边界。","输出托管 API、自托管、端侧或混合方案"],
          ["它解决数据、延迟、弹性、成本和运维责任如何取舍。","选择必须基于实际流量、隐私、可用性和团队责任"],
          ["输入流量地域隐私硬件和团队能力，输出运行方案。","输入流量、数据地域、隐私、延迟、可用性、硬件和团队运维能力"],
          ["逐项比较方案获得的控制与必须承担的运维。","每种位置交换的是控制权、弹性、成本和责任"],
          ["选择表示约束下的责任分配，不表示某方案天然更快。","端侧不自动低延迟，自托管也不自动便宜"],
          ["没有补丁值班灾备能力时不应只为控制偏好自托管。","不能只因偏好数据控制就自托管"]
        ]),
        six(2, [
          ["服务路径是请求跨认证排队检索模型工具和传输的完整链路。","服务路径输入一次请求及其认证、排队、检索"],
          ["它解释模型计算很快而用户仍等待两秒的原因。","关键路径上的排队或工具可以主导 2s"],
          ["输入一次请求及所有阶段，输出端到端延迟状态和副作用。","输出端到端延迟、状态与副作用"],
          ["沿关键路径串联阶段并追踪所有发布依赖。","发布单元必须覆盖全部依赖"],
          ["单个模型耗时不能代表用户端到端体验。","模型耗时 600ms 只是其中一段"],
          ["外部动作必须另有权限幂等和补偿设计。","外部副作用需要权限、幂等与补偿"]
        ]),
        six(3, [
          ["容量账用利用率和 Little 定律描述服务拥塞。","输出利用率 ρ 与系统内平均请求数 Lsystem"],
          ["它初步判断到达率和服务能力是否会导致排队。","ρ=0.8 已会排队"],
          ["输入 λ、S、c、W，输出 ρ 和 Lsystem。","输入到达率 λ、平均服务时间 S、并行槽位 c 和端到端平均时间 W"],
          ["计算 ρ=λ×S/c 与 Lsystem=λ×W。","ρ=λ×S/c，Lsystem=λ×W"],
          ["ρ 接近一表示尾延迟会非线性恶化。","接近 1 时尾延迟非线性恶化"],
          ["LLM 长度批处理工具和突发仍需真实压力测试。","仍需压力测试"]
        ]),
        six(4, [
          ["发布门禁把质量安全延迟吞吐和成本共同用于上线决策。","输出是否满足全部门槛及所需实例数 nInstance"],
          ["它防止只因离线准确率提高就直接发布慢服务。","质量更高却不能直接上线"],
          ["输入两个版本的多项指标，输出门禁结论和容量数量。","输入 v41 与 v42 的任务通过率、越权率、p95、吞吐和单位成功成本"],
          ["逐项过门槛，再用峰值吞吐除以实例能力并向上取整。","24/17 得至少 2 个实例"],
          ["两实例是无冗余下限，实际故障余量可能要求三个。","实际需求提高到 3"],
          ["不能使用平均利用率替代峰值和故障容量评估。","不能按平均利用率裸配"]
        ]),
        six(5, [
          ["批处理缓存量化裁剪和路由是改变不同瓶颈的优化。","缓存复用计算，量化改变数值表示"],
          ["它区分看似都能变快的手段各自改了什么。","批处理改变排队"],
          ["输入瓶颈和各优化参数，输出性能资源质量与隔离差异。","输出吞吐、首 token 延迟、显存、质量与隔离差异"],
          ["按瓶颈选手段并一次只改少量可追踪变量。","一次只改少量变量并记录逐请求版本"],
          ["收益需与对应的排队泄漏精度或证据风险一起解释。","裁剪改变可见证据，路由改变请求模型"],
          ["多种优化同时上线会失去收益与退化归因。","才能归因和回归"]
        ]),
        six(6, [
          ["影子金丝雀蓝绿是观察不同发布风险的渐进策略。","影子结果不影响用户且禁止不可逆动作"],
          ["它们控制候选版本影响真实用户和副作用的范围。","金丝雀产生真实结果，蓝绿保留两套完整环境"],
          ["输入版本流量副作用窗口和回滚能力，输出发布动作。","输入候选版本、真实流量、副作用风险、观察窗口和回滚能力"],
          ["影子不生效、金丝雀小流量生效、蓝绿保留双环境。","发布策略输入候选版本、真实流量、副作用风险"],
          ["通过表示对应观察窗口未越线，不保证绝对安全。","策略选择取决于要观察的风险"],
          ["副作用需幂等补偿，分流需保持用户或会话稳定。","按用户或会话稳定分流"]
        ]),
        six(7, [
          ["原子发布把模型提示索引工具策略代码和配置组成发布单元。","输入模型、提示、解码、索引、工具 schema、策略、代码和基础设施配置"],
          ["它避免只退模型却留下不兼容提示缓存或业务状态。","单退模型会留下新提示、缓存或状态"],
          ["输入全部组件版本，输出 releaseId 与兼容矩阵。","输出一个 releaseId 与兼容矩阵"],
          ["按 releaseId 同步恢复可逆组件并对状态使用兼容迁移。","回滚按 releaseId 同步恢复可逆组件"],
          ["回滚成功表示组合恢复兼容，不代表外部副作用消失。","不可逆副作用只能补偿"],
          ["不可逆动作必须补偿，不能宣称通过版本回滚撤销。","不能假装已经回滚"]
        ]),
        six(8, [
          ["安全降级是在容量不足时按风险选择有限服务动作。","输出排队、拒绝、延迟、小模型、截短或停服动作"],
          ["它在拥塞时保护关键路径又不绕过高风险验证。","高权限退款不得因拥塞绕过验证"],
          ["输入容量风险价值可逆性和依赖状态，输出降级动作。","输入容量、风险等级、任务价值、可逆性和当前依赖状态"],
          ["低风险可延迟切模型，高风险失败关闭并标记结果。","低风险任务可延迟或切换模型"],
          ["降级结果表示能力受限，必须被监控而非伪装正常。","显式标记并监控"],
          ["超时任务可能仍执行，重试需预算条件与同一幂等键。","重试必须有可恢复条件、总预算和同一幂等键"]
        ])
      ]
    },
    "agent-identity-access": {
      contractVersion: 2,
      examples: [{
        section: 5,
        evidence: {
          setup: "用户登录后选择仓库 A",
          rule: "网关校验后交换凭证",
          steps: "执行时最后一跳注入",
          interpretation: "不把泄露风险降为零，也不授权发布"
        }
      }],
      formulas: [{
        id: "agent-access-effective", section: 4, formulaIndex: 1,
        symbols: [
          { name: "E", meaning: "当前请求最终获得的有效动作集合", evidence: "输出它们交集内的动作集合" },
          { name: "UserDelegation", meaning: "用户为本次任务明确委托的动作和资源集合", evidence: "用户委托" },
          { name: "AgentPolicy", meaning: "Agent 运行环境允许的动作集合", evidence: "Agent 策略" },
          { name: "ToolPolicy", meaning: "具体工具执行器允许的动作和参数集合", evidence: "工具策略" },
          { name: "ResourcePolicy", meaning: "目标资源服务最终允许的访问集合", evidence: "资源策略" },
          { name: "Context", meaning: "会话风险、资源、时间和确认等动态限制", evidence: "当前上下文" }
        ]
      }],
      termReviews: [
        { section: 3, reviewedAt: "2026-07-27", terms: [
          { name: "认证", meaning: "用可验证凭据确认请求主体是谁", purpose: "为后续授权提供可信主体输入", definitionEvidence: "分别回答是谁", purposeEvidence: "认证成功只是进入授权判断的一个输入" },
          { name: "授权", meaning: "根据主体、动作、资源和上下文裁决是否允许", purpose: "阻止已登录主体访问未获准对象", definitionEvidence: "能做什么", purposeEvidence: "事前阻断" },
          { name: "委托", meaning: "记录某主体为何以及在何范围内代表另一主体行动", purpose: "防止服务自身权限冒充用户同意", definitionEvidence: "代表谁为何能做", purposeEvidence: "委托范围" },
          { name: "审计", meaning: "记录请求、策略决定、资源和结果的可追溯事件链", purpose: "支持归因、调查和精准撤销", definitionEvidence: "实际发生什么", purposeEvidence: "审计记录" }
        ]},
        { section: 6, reviewedAt: "2026-07-27", terms: [
          { name: "audience", meaning: "令牌被签发给并允许接收它的目标服务", purpose: "阻止给服务 A 的令牌被转用到服务 B", definitionEvidence: "受众 audience", purposeEvidence: "把给服务 A 的令牌转给服务 B" },
          { name: "scope", meaning: "令牌明确允许的动作范围", purpose: "限制令牌只能执行被委托的操作", definitionEvidence: "范围 scope", purposeEvidence: "read 令牌拿去写 main" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["身份与访问控制把模型意图和现实权限分开。","身份与访问控制把模型意图和现实执行权限分开"],
          ["它防止自然语言声称代表用户就获得权限。","为什么一句自然语言“我代表用户”不能像门禁卡一样开门"],
          ["输入目标主体动作资源上下文，输出允许拒绝或暂停。","输入是用户目标、可验证主体、候选动作、资源和上下文，输出是允许、拒绝或暂停"],
          ["先认证主体，再授权动作并求本次委托交集。","分别认证谁、授权能做什么，再求本次委托交集"],
          ["自然语言只能提出候选动作。","自然语言只能提出候选"],
          ["它不能成为门禁凭证。","不能成为门禁凭证"]
        ]),
        six(2, [
          ["主体链连接用户会话工作负载和资源服务。","输出可追踪的委托链与审计链"],
          ["它解决多服务请求中怎样保留谁代表谁。","怎样保留“谁代表谁”的可追溯关系"],
          ["输入四类主体，输出委托链和审计链。","输入用户、Agent 会话、执行工作负载和资源服务，输出可追踪的委托链与审计链"],
          ["用户委托会话，网关换凭证，资源服务裁决。","执行网关交换窄凭证"],
          ["共享机器人账号只表示一个技术身份。","共享机器人账号只表示一个技术身份"],
          ["它无法解释委托关系或精准撤销。","无法解释谁代表谁或精准撤销"]
        ]),
        six(3, [
          ["认证授权委托审计回答四个不同安全问题。","分别回答是谁、能做什么、代表谁为何能做、实际发生什么"],
          ["它解决四个常用术语混用造成的漏洞。","四个常被混用的词"],
          ["输入主体策略委托事件，输出四类安全结果。","输入是主体证据、策略、任务委托和事件，输出认证结果、授权决定、委托范围与审计记录"],
          ["先认证，再按委托授权，并记录完整审计。","四者互补但不能替代"],
          ["认证成功只是授权判断的一项输入。","认证成功只是进入授权判断的一个输入"],
          ["审计不能替代事前阻断。","事后审计也不能代替事前阻断"]
        ]),
        six(4, [
          ["有效权限是五类允许集合的交集。","输出它们交集内的动作集合"],
          ["它避免用一个宽泛角色名表达 Agent 能力。","为什么不能只用一个宽泛角色名表达"],
          ["输入五类策略，输出有效动作集合。","输入用户委托、Agent 策略、工具策略、资源策略和当前上下文，输出它们交集内的动作集合"],
          ["每层只缩小范围，参数资源变化重新求交。","每一层只能缩小上游范围"],
          ["交集内动作才是本次请求有效权限。","交集内的动作集合"],
          ["交集空或对象不明时默认拒绝。","交集为空或对象无法唯一解析时默认拒绝"]
        ]),
        six(5, [
          ["令牌案例展示任务委托怎样变成短期窄凭证。","运行示例：一次委托怎样变成令牌"],
          ["它防止用户确认到资源执行之间权限放大。","怎样防止权限被放大"],
          ["输入任务动作风险，输出窄令牌和审计。","输入仓库 A 的任务委托、结构化建分支动作和会话风险，输出仅面向目标 API、仓库和动作的五分钟令牌及审计结果"],
          ["网关检查交换，最后一跳注入，资源服务复核。","执行时最后一跳注入"],
          ["短期窄令牌缩小可达资源和持续窗口。","短期窄令牌缩小损失半径"],
          ["它不把风险清零也不授权发布。","不把泄露风险降为零，也不授权发布"]
        ]),
        six(6, [
          ["令牌验证除签名外还核对受众范围资源和时间。","令牌验证输入签名、签发方、受众、scope、资源、时间和发送者绑定"],
          ["它解释签名有效的令牌为何仍可能拒绝。","签名有效，为什么仍可能拒绝"],
          ["输入完整令牌上下文，输出接受或拒绝。","输出接受或拒绝"],
          ["资源服务逐项核对当前请求与令牌声明。","资源服务还须逐项核对当前请求"],
          ["签名只证明内容未被未知方篡改。","签名只证明内容未被未知方篡改"],
          ["任一上下文不匹配都拒绝且不得透传。","任一上下文不匹配都拒绝"]
        ]),
        six(7, [
          ["秘密管理让凭证只在受信执行器最后一跳出现。","最后一跳注入的凭证"],
          ["它防止密钥进入提示日志记忆或工具参数。","密钥为什么不能进入模型"],
          ["输入密钥身份工具权限，输出受控注入凭证。","输入密钥标识、工作负载身份、目标工具和最小动作权限，输出在受信执行器最后一跳注入的凭证"],
          ["模型只见 schema 和脱敏结果，日志只记指纹。","模型只看 schema 与脱敏结果"],
          ["不进上下文降低复制泄漏。","降低复制泄漏"],
          ["过宽网关仍可能被借用越权。","过宽执行网关仍可能被模型借用越权"]
        ]),
        six(8, [
          ["执行层防线把被注入操纵的意图限制在权限边界。","输出越权拒绝、需确认暂停或窄权限执行"],
          ["它说明模型受骗后还剩哪些独立防线。","安全系统还剩哪些独立防线"],
          ["输入候选委托策略资源检查，输出拒绝暂停或执行。","输入被操纵的候选动作、委托、策略交集和资源侧检查，输出越权拒绝、需确认暂停或窄权限执行"],
          ["网关求交集，资源服务再次检查。","执行层即使面对错误意图也不能越过"],
          ["目标是限制损失而非保证模型永不受骗。","目标不是保证模型永不受骗"],
          ["错误策略仍需要测试和审计。","错误策略仍需测试和审计"]
        ])
      ]
    },
    "code-generation": {
      contractVersion: 2,
      examples: [{
        section: 4,
        evidence: {
          setup: "首个补丁",
          rule: "把需求变成三条验收",
          steps: "失败测试定位缓存键缺少 user_id",
          interpretation: "不授权自动合并或发布"
        }
      }],
      formulas: [],
      termReviews: [
        { section: 5, reviewedAt: "2026-07-27", terms: [
          { name: "上下文工程", meaning: "选择并组织当前任务所需代码、约束和证据的过程", purpose: "让模型在有限窗口中看到仓库修改所需的关键关系", definitionEvidence: "仓库上下文工程输入当前失败", purposeEvidence: "完成修改所需的最小相关代码包" }
        ]},
        { section: 7, reviewedAt: "2026-07-27", terms: [
          { name: "pass@k", meaning: "采样 k 个候选时至少一个通过隐藏测试的任务比例", purpose: "衡量增加候选采样预算后的命中能力", definitionEvidence: "统计 k 个候选至少一个命中", purposeEvidence: "还包含采样预算带来的收益" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["AI 编程把自然语言意图转换为可运行代码。","AI 编程是把自然语言意图转换为可运行代码的生成任务"],
          ["它解决从需求到候选程序或补丁的翻译问题。","让模型把「意图」翻译成「能跑的代码」"],
          ["输入需求代码验收，输出补丁解释或程序。","输入是需求、已有代码和验收条件，输出是候选补丁、解释或新程序"],
          ["模型按代码模式生成并交给执行工具验证。","把「意图」翻译成「能跑的代码」"],
          ["能运行表示语法和部分路径成立。","代码能够运行只表示语法和部分路径成立"],
          ["它不证明需求安全性能全部正确。","不证明需求、安全与性能全部正确"]
        ]),
        six(2, [
          ["代码因语料丰富结构重复且可执行验证而适合大模型。","训练语料丰富、语法结构重复且可以用编译和测试产生外部反馈"],
          ["它解释代码生成为何成为成功的大模型应用。","为什么「写代码」偏偏成了大模型落地最成功的方向之一"],
          ["输入需求和模式，输出可工具检验的实现。","输入是需求与代码模式，输出是可被工具检验的候选实现"],
          ["生成后用编译测试反馈把错误收缩成反例。","验证把模糊错误压成具体反例"],
          ["测试通过只支持已经表达规格的行为。","测试可能缺边界条件"],
          ["缺失边界会让错误代码测试全绿。","缺失边界条件仍会让测试全绿的错误代码通过"]
        ]),
        six(3, [
          ["代码生成能力从补全扩展到仓库级 Agent。","输出补全、对话修改、仓库级补丁或 Agent 轨迹"],
          ["它说明 AI 编程怎样沿任务范围逐步演进。","从「补全」到「编程 Agent」"],
          ["输入范围上下文工具自主权，输出相应阶段结果。","输入任务范围、仓库上下文、工具和自主权，输出补全、对话修改、仓库级补丁或 Agent 轨迹"],
          ["范围越大越需要搜索规划执行和恢复。","增加搜索、规划、执行和恢复闭环"],
          ["高阶段表示负责的工作面更宽。","阶段更高表示负责的工作面更宽"],
          ["它不表示更聪明或自动获得更大权限。","不应自动获得更大权限"]
        ]),
        six(4, [
          ["代码执行案例展示写跑测改的证据闭环。","代码执行运行示例"],
          ["它解决光会生成代码为何还不够可靠。","光会「写」代码还不够"],
          ["输入需求补丁测试，输出最小修复和运行证据。","输入缓存需求、首个补丁、用户隔离测试和项目回归，输出修正后的最小补丁与运行证据"],
          ["先定义验收再用失败测试定位并分层验证。","把需求变成三条验收"],
          ["失败测试把模糊 bug 收缩成缺少用户键。","失败测试定位缓存键缺少 user_id"],
          ["测试通过不授权自动合并或发布。","不授权自动合并或发布"]
        ]),
        six(5, [
          ["仓库上下文工程选择修改所需的最小相关代码。","输出完成修改所需的最小相关代码包"],
          ["它解决小函数强但进入大项目常出错的问题。","为什么同一个模型，写个小函数很强，一放进你的大项目就常出错"],
          ["输入失败接口调用测试约定，输出相关代码包。","输入当前失败、接口、调用者、测试、约定和依赖版本，输出完成修改所需的最小相关代码包"],
          ["从复现符号关系开始按需扩展上下文。","从复现和符号关系逐步扩展材料"],
          ["上下文充分只表示关键约束可见。","上下文充分只表示关键约束可见"],
          ["模型仍可能误解或遗漏未加载路径。","仍可能误解或遗漏未加载路径"]
        ]),
        six(6, [
          ["代码风险控制用多层证据决定补丁是否可接受。","输出接受、修正、拒绝或待验证项"],
          ["它处理幻觉 API、隐藏 bug、安全漏洞和过度信任。","能直接信吗：风险"],
          ["输入补丁依赖测试规则审查，输出处置决定。","输入候选补丁、依赖、测试、安全规则和审查者，输出接受、修正、拒绝或待验证项"],
          ["编译测试静态分析人工 diff 分层检查。","编译、测试、静态分析和人工 diff 分层检查"],
          ["模型应被视为高产但会犯错的工程协作者。","高产初级工程师"],
          ["人类审查本身也不能保证不漏错。","不表示人类审查天然不会漏错"]
        ]),
        six(7, [
          ["代码评测按固定预算衡量候选命中或仓库任务成功。","输出 pass@1、pass@k 或仓库级任务成功"],
          ["它解释片段题高分为何不等于会修真实仓库。","片段题不等于真实仓库"],
          ["输入任务测试权限 k 重试，输出评测指标。","输入固定任务、隐藏测试、工具权限、采样数 k 和重试预算，输出 pass@1、pass@k 或仓库级任务成功"],
          ["片段按候选命中，仓库还测定位修改回归。","仓库评测还要求定位、最小修改和回归"],
          ["分数只在预算环境一致时可比较。","只在预算和环境一致时可比"],
          ["测试通过不证明安全性能和完整意图。","不能证明安全性能和完整意图"]
        ])
      ]
    },
    "human-in-the-loop": {
      contractVersion: 2,
      examples: [{
        section: 3,
        evidence: {
          setup: "模型给退款请求0.8的正确概率",
          rule: "错误概率乘损失并加人工与延迟成本",
          steps: "22 元复核成本低于 92 元自动成本",
          interpretation: "不可把模型语气或 token 概率当任务正确率"
        }
      }],
      formulas: [
        {
          id: "hitl-expected-cost", section: 3, formulaIndex: 1,
          symbols: [
            { name: "a", meaning: "候选处置动作以及其中期望成本最低的动作", evidence: "a 是候选动作" },
            { name: "P", meaning: "给定案例和动作后的任务错误概率", evidence: "是采取动作后的错误概率" },
            { name: "error", meaning: "采取动作后产生错误业务结果的事件", evidence: "错误概率乘损失" },
            { name: "x", meaning: "当前需要路由或审核的业务案例", evidence: "x 是当前案例" },
            { name: "C", meaning: "错误损失、人工复核或延迟中的一项成本", evidence: "三个 C 分别是错误损失、复核成本和延迟成本" }
          ]
        },
        {
          id: "hitl-queue-utilization", section: 8, formulaIndex: 1,
          symbols: [
            { name: "ρ", meaning: "审核需求占理论处理能力的利用率", evidence: "ρ 是审核容量利用率" },
            { name: "λ", meaning: "单位时间到达审核队列的任务数", evidence: "λ 是每小时到达任务数" },
            { name: "c", meaning: "同时参与处理队列的审核者人数", evidence: "c 是审核者人数" },
            { name: "μ", meaning: "单个审核者单位时间平均处理任务数", evidence: "μ 是单人每小时处理数" }
          ]
        }
      ],
      termReviews: [
        { section: 3, reviewedAt: "2026-07-27", terms: [
          { name: "期望损失", meaning: "把各错误结果的概率与业务代价相乘后求和的决策成本", purpose: "在自动、复核和禁止之间按风险成本选择", definitionEvidence: "错误概率乘损失", purposeEvidence: "输出期望成本最低的自动、复核或禁止动作" }
        ]},
        { section: 6, reviewedAt: "2026-07-27", terms: [
          { name: "锚定", meaning: "人的判断被先看到的模型建议过度影响的认知偏差", purpose: "解释审核者为何可能机械沿用模型结论", definitionEvidence: "减轻锚定", purposeEvidence: "先形成初判再显示模型建议" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["人在回路在风险决策点接入有资格且有拒绝权的人。","人在回路是在特定决策点把有资格的人、原始证据和拒绝权接入自动系统"],
          ["它让人的判断能在伤害发生前改变结果。","用人的判断改变风险结果"],
          ["输入风险证据资格决定，输出批准修改拒绝或升级。","输入是风险动作、审核者资格、证据和可用决定，输出是批准、修改、拒绝或升级"],
          ["把证据和可执行权交给正确时刻的合格人员。","有资格的人、原始证据和拒绝权"],
          ["人工步骤有效需真正改变风险结果。","人的判断能否改变结果"],
          ["无证据权力的确认只增加延迟和依赖。","会增加延迟并形成自动化依赖"]
        ]),
        six(2, [
          ["事前批准同步复核事后抽检离线纠错是四类介入点。","输出事前批准、同步复核、事后抽检或离线纠错"],
          ["它区分四种人工参与分别保护什么。","四种介入点解决不同问题"],
          ["输入可逆性伤害时机目标，输出介入方式。","输入动作可逆性、伤害时机和改进目标，输出事前批准、同步复核、事后抽检或离线纠错"],
          ["按是否保护当前动作结果未知错误或未来模型选择。","分别保护当前副作用、交付结果、未知错误和未来模型"],
          ["四种方式可以组合但不能互相替代。","可以组合但不能互相替代"],
          ["事后标注不能撤销已经发生的伤害。","无法撤销已经发生的伤害"]
        ]),
        six(3, [
          ["退款案例用期望损失选择自动复核或禁止。","输出期望成本最低的自动、复核或禁止动作"],
          ["它解决正确概率零点八是否应自动批准。","是否应该自动批准"],
          ["输入概率和各类成本，输出最低成本动作。","输入校准正确概率、错误退款损失、自动收益、复核成本和延迟损失，输出期望成本最低的自动、复核或禁止动作"],
          ["逐动作计算错误概率乘损失并加人工延迟成本。","错误概率乘损失并加人工与延迟成本"],
          ["本例复核二十二元低于自动九十二元。","22 元复核成本低于 92 元自动成本"],
          ["结论依赖校准和成本，token 概率不能替代。","不可把模型语气或 token 概率当任务正确率"]
        ]),
        six(4, [
          ["风险路由组合红线规则校准阈值和随机抽检。","输出自动、人工、禁止以及随机抽检分配"],
          ["它防止只送低置信样本漏掉高置信系统错误。","只把低置信样本交给人，会漏掉什么"],
          ["输入规则分数容量流量，输出路由和抽检。","输入红线规则、校准不确定性、审核容量和生产流量，输出自动、人工、禁止以及随机抽检分配"],
          ["红线阻断，高风险升级，不确定按分数，自动流随机抽检。","自动流量保留抽检"],
          ["随机抽检用于估计阈值未发现的错误。","估计真正漏审率"],
          ["拥堵不能静默取消高风险红线。","不能静默取消高风险红线"]
        ]),
        six(5, [
          ["决策门按风险把建议路由到自动人工或禁止。","输出低风险自动、合格复核或禁止延迟路径"],
          ["它让自动人工禁止共享同一风险模型。","怎样让自动化、人工复核和禁止执行共享同一风险模型"],
          ["输入建议证据成本容量，输出三类处置路径。","输入 AI 建议、证据、错误成本、可逆性、校准和容量，输出低风险自动、合格复核或禁止延迟路径"],
          ["风险路由在副作用前选择并用结果反馈更新。","风险路由器在副作用前选择动作"],
          ["路由人工只表示该案例需要判断。","路由到人工只表示需要判断"],
          ["它不表示人必然正确或容量足够。","不表示审核者必然正确或当前容量足够"]
        ]),
        six(6, [
          ["审核界面帮助人独立检查模型建议与原始证据。","审核界面必须帮助人发现模型错误"],
          ["它避免只展示结论和同意拒绝造成锚定。","审核者能做出独立判断吗"],
          ["输入材料建议证据后果，输出批准修改或拒绝。","输入原始材料、模型建议、证据、现状差异、后果和替代方案，输出审核者可独立作出的批准修改或拒绝"],
          ["高风险先初判再显示建议，三类决定同样可用。","先形成初判再显示模型建议"],
          ["记录理由用于重建当时审核条件。","记录审核者、时间、看到的模型/规则版本和理由"],
          ["默认焦点和追责压力不能诱导机械同意。","不能用默认焦点或追责压力诱导机械同意"]
        ]),
        six(7, [
          ["人因评测衡量盲审基线自动化偏见分歧和疲劳。","输出基线正确率、自动化偏见、分歧和疲劳指标"],
          ["它区分专家分歧来自人错误还是案例含糊。","是人不可靠还是案例本来模糊"],
          ["输入盲审对照难度轮班速度，输出人因指标。","输入盲审样本、含已知错误建议的对照、案例难度、轮班和审核速度，输出基线正确率、自动化偏见、分歧和疲劳指标"],
          ["先测无模型判断再比较建议造成的改判。","先测不看模型的判断"],
          ["分歧可能反映任务和指南含糊。","专家分歧可能来自任务含糊"],
          ["不能只用一致率断言人不可靠。","不能只用一致率断言人不可靠"]
        ]),
        six(8, [
          ["审核队列容量用到达率人数和服务率描述负载。","审核队列容量输入到达率"],
          ["它判断需求超过处理率时风险策略能否工作。","审核到达率超过处理率时，风险策略还能工作吗"],
          ["输入到达人员服务风险 SLA，输出利用率和降级。","输入到达率、审核人数、单人服务率、风险等级和 SLA，输出利用率、队龄、所需人员和降级动作"],
          ["计算利用率并按峰值复杂度保留余量。","利用率接近一时等待非线性增长"],
          ["八人只达到理论满载而没有峰值余量。","八人只达到理论满载而无峰值余量"],
          ["平均公式不能替代分布休息和故障演练。","不替代复杂度分布、休息和故障演练"]
        ]),
        six(9, [
          ["反馈治理校正人工升级数据的选择偏差。","反馈数据带选择偏差"],
          ["它防止只用困难升级样本训练而偏离生产。","只用“被升级给人”的困难样本训练"],
          ["输入升级路由采样随机标签，输出可校正训练集。","输入升级样本、路由原因、采样概率、自动流量随机标签和审核分歧，输出可校正选择偏差的训练集"],
          ["保存采样概率并抽标自动流量，独立测试。","用独立近生产测试集评估"],
          ["升级集不是生产总体分布。","升级集不是生产分布"],
          ["重加权不能消除未抽样的未知偏差。","不能消除未被抽样的未知偏差"]
        ]),
        six(10, [
          ["闭环评测比较多种路由方案对最终伤害的影响。","输出漏审、误升级、改判、最终伤害、队列、申诉和成本"],
          ["它证明人工是否真正减少最终伤害。","评测必须证明人工真的减少最终伤害"],
          ["输入四类方案，输出风险队列申诉成本。","输入全自动、规则路由、不确定性路由和人机组合方案，输出漏审、误升级、改判、最终伤害、队列、申诉和成本"],
          ["按风险切片并随机抽查自动通过流量。","抽查自动通过流量估计沉在水下的高置信错误"],
          ["自动化率高只表示人处理更少。","自动化率高只表示人处理更少"],
          ["它不能证明最终风险更低。","不能证明最终风险更低"]
        ])
      ]
    },
    "computer-use": {
      contractVersion: 2,
      examples: [{
        section: 3,
        evidence: {
          setup: "输入 128.50",
          rule: "提交前展示差异并批准",
          steps: "超时先查询",
          interpretation: "编号出现才表示业务完成"
        }
      }],
      formulas: [{
        id: "computer-use-safe-action", section: 4, formulaIndex: 1,
        symbols: [
          { name: "A", meaning: "当前界面动作是否满足全部执行条件", evidence: "A 表示当前动作是否允许" },
          { name: "Target", meaning: "目标控件的角色名称和上下文是否匹配", evidence: "Target 表示目标控件匹配" },
          { name: "State", meaning: "页面、焦点和选择状态等前置条件是否满足", evidence: "State 表示页面与焦点前置条件满足" },
          { name: "Permission", meaning: "当前主体是否获准操作目标资源", evidence: "Permission 表示主体对资源有权操作" },
          { name: "Bound", meaning: "动作后果是否可控、可撤销或已经批准", evidence: "Bound 表示后果可控或已批准" }
        ]
      }],
      termReviews: [
        { section: 2, reviewedAt: "2026-07-27", terms: [
          { name: "DOM", meaning: "浏览器对网页元素、属性和层级关系的结构化表示", purpose: "用元素语义和属性定位网页控件", definitionEvidence: "网页结构与属性丰富", purposeEvidence: "语义定位" },
          { name: "可访问性树", meaning: "按角色、名称和可操作性呈现界面的辅助技术结构", purpose: "以跨视觉样式的语义信息定位控件", definitionEvidence: "角色、名称与可操作性", purposeEvidence: "优先使用角色名称等语义定位" }
        ]},
        { section: 5, reviewedAt: "2026-07-27", terms: [
          { name: "状态差分", meaning: "比较动作前后可观察界面与业务状态的变化", purpose: "验证动作是否产生预期结果并决定下一步", definitionEvidence: "动作前观察、候选动作和动作后新观察", purposeEvidence: "输出继续、恢复或终止" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["计算机使用智能体是观察动作再验证的反馈控制器。","计算机使用智能体是根据界面观察选择鼠标键盘动作并用新状态验证结果的反馈控制器"],
          ["它解决没有稳定 API 时的界面操作问题。","解决没有稳定 API 时的界面操作"],
          ["输入目标权限界面条件，输出动作和业务状态。","输入是目标、主体权限、截图或结构和完成条件，输出是受限动作与业务状态"],
          ["在观察动作新观察循环中不断更新状态。","观察—动作—新观察循环"],
          ["看到按钮只表示像素或节点存在。","单次看到按钮只表示像素或节点存在"],
          ["它不证明可点击获权或任务完成。","不证明可点击、获权或任务已完成"]
        ]),
        six(2, [
          ["截图 DOM 和可访问性树是互补观察通道。","三种观察通道互补"],
          ["它解决坐标和语义结构哪种更可靠的问题。","哪一个最可靠"],
          ["输入应用和界面信息，输出单一或组合观察。","输入应用类型、界面结构和可用辅助信息，输出截图、DOM、可访问性树或组合观察"],
          ["语义优先视觉验证坐标绑定几何。","优先使用角色名称等语义定位"],
          ["任一通道只呈现局部界面状态。","任一通道都只呈现局部状态"],
          ["后台焦点权限仍需外部检查。","后台事实、焦点和权限仍需外部检查"]
        ]),
        six(3, [
          ["报销案例展示填写上传批准提交和回执验证。","安全地填写并提交一张报销单"],
          ["它解决从打开页面到提交要验证哪些状态。","哪些状态必须逐步验证"],
          ["输入身份金额收据说明，输出编号或未知状态。","输入受信域名、用户身份、金额 128.50、收据和说明，输出报销编号或明确未知状态"],
          ["逐字段验值，提交前批准，超时先查询。","提交前展示差异并批准，超时先查询"],
          ["编号出现才表示业务完成。","编号出现才表示业务完成"],
          ["点击发送和选择器关闭都不是完成证据。","都不是完成证据"]
        ]),
        six(4, [
          ["安全动作要求目标状态权限后果四项同时成立。","四个布尔条件"],
          ["它解决点击动作至少需要哪些前置条件。","至少需要哪些前置条件"],
          ["输入四个条件，输出允许重新观察或升级。","输入目标匹配、状态前置、权限和后果边界四个布尔条件，输出允许、重新观察或升级"],
          ["逻辑与要求全部为真，未知按未满足处理。","任何未知都按未满足处理"],
          ["通过只表示当前动作满足声明条件。","通过只说明当前动作满足已声明条件"],
          ["它不保证内容可信或后续业务成功。","不保证页面内容可信或后续业务结果成功"]
        ]),
        six(5, [
          ["状态差分闭环在每个动作后重新观察和决策。","状态差分闭环"],
          ["它避免长任务只在最后检查一次成功。","为什么长任务不能只在最后检查一次成功"],
          ["输入前观察动作后观察，输出继续恢复或终止。","输入动作前观察、候选动作和动作后新观察，输出继续、恢复或终止"],
          ["每步重新定位并检查业务回执。","每步重新定位并检查业务回执"],
          ["差分表示已观察到的变化。","差分只覆盖可观察变化"],
          ["后台异步副作用仍需权威查询。","仍需业务 ID 或权威系统查询"]
        ]),
        six(6, [
          ["可靠性控制处理焦点等待和重复提交事故。","焦点、等待与重复提交是三类基础事故"],
          ["它防止页面无响应后重复点击造成双重付款。","为什么可能产生双重付款"],
          ["输入焦点等待动作幂等状态，输出操作决定。","输入焦点、等待条件、动作类型、幂等键和前后状态，输出输入、等待、查询或单次提交决定"],
          ["条件等待，写超时先查，再从检查点恢复。","写动作超时先查询"],
          ["幂等降低重复副作用。","幂等降低重复副作用"],
          ["它不能修复写错对象或金额。","无法修复写错对象或错误金额"]
        ]),
        six(7, [
          ["界面信任隔离把网页和 OCR 文本视为不可信数据。","网页内容是数据"],
          ["它防止页面文字把自己提升成高优先级命令。","不是给智能体的高优先级命令"],
          ["输入外部文本秘密，输出数据和受控注入。","输入网页、邮件、OCR 文本和拟使用秘密，输出标为不可信数据的内容及受控字段注入"],
          ["控制平面给指令，密钥库直达允许字段。","秘密从密钥库直达指定字段"],
          ["界面要求不等于用户授权。","“界面要求”不是“用户授权”"],
          ["允许列表仍须测试间接提示注入。","仍须测试间接提示注入"]
        ]),
        six(8, [
          ["API/UI 选型选择稳定接口界面或混合路径。","输出 API、UI 或混合执行路径"],
          ["它解释有浏览器能力后为何仍优先 API。","为什么还应优先调用 API"],
          ["输入接口稳定视觉遗留限制，输出执行路径。","输入可用接口、稳定性、幂等、视觉需求和遗留限制，输出 API、UI 或混合执行路径"],
          ["核心数据走 API，必要最后一公里用 UI。","核心数据优先 API"],
          ["UI 适合无接口跨应用或视觉状态任务。","只有无接口、跨应用或必须观察视觉状态时使用 UI"],
          ["选择 UI 不降低审计权限和回执要求。","不表示可以降低审计和权限要求"]
        ]),
        six(9, [
          ["扰动评测在布局环境和注入变化下验证任务。","评测必须加入布局与环境扰动"],
          ["它解决单机跑通十次能否证明可靠的问题。","能证明智能体可靠吗"],
          ["输入任务与环境变化，输出质量副作用恢复指标。","输入任务、分辨率、缩放、语言、网络、弹窗、会话和页面版本变化，输出任务、子目标、错误点击、重复副作用和恢复指标"],
          ["逐扰动运行并用业务状态判定完成。","完成由业务状态判定"],
          ["单一环境成功只覆盖该环境。","只覆盖单一环境"],
          ["它不能证明跨布局和注入鲁棒。","不能证明跨布局和注入鲁棒"]
        ]),
        six(11, [
          ["语义检查点保存已验证业务状态用于跨崩溃恢复。","长任务恢复依赖语义检查点"],
          ["它解决浏览器崩溃后为何不能续第十七次点击。","为什么不可靠"],
          ["输入主体对象子目标回执，输出可恢复状态。","输入已验证主体、对象 ID、子目标、草稿、回执和下一步前置条件，输出可跨崩溃恢复的业务状态"],
          ["重开受信入口并重新定位，不复用旧句柄。","不复用坐标和旧 DOM 句柄"],
          ["检查点表示已验证业务状态。","已验证主体、对象 ID、子目标"],
          ["结果未知必须查询而非重放动作。","必须按幂等键查询而非重放动作"]
        ]),
        six(12, [
          ["轨迹隐私最小化计算机操作审计中的敏感暴露。","轨迹审计也要最小化敏感暴露"],
          ["它解决保存全屏截图带来的新泄漏风险。","会带来什么新风险"],
          ["输入轨迹和用途，输出脱敏有期限审计记录。","输入截图、结构动作、键盘事件和调试用途，输出最小化、脱敏且有保留期的审计记录"],
          ["保存目标窗口差分，秘密仅记安全注入。","秘密只记录已安全注入"],
          ["可复盘不等于保存全部屏幕。","可复盘不等于保存全屏"],
          ["无关通知客户数据密钥不得默认暴露。","不得因调试默认暴露"]
        ])
      ]
    },
    "workflow-orchestration": {
      contractVersion: 2,
      examples: [{
        section: 3,
        evidence: {
          setup: "发票抽取—校验—审批—入账",
          rule: "重复上传命中同一实例",
          steps: "入账超时先查状态",
          interpretation: "不表示未知副作用可直接重试"
        }
      }],
      formulas: [{
        id: "workflow-idempotency-key", section: 4, formulaIndex: 1,
        symbols: [
          { name: "K", meaning: "业务系统用于识别重复活动请求的幂等键", evidence: "K 是业务去重使用的幂等键" },
          { name: "workflowId", meaning: "当前持久工作流实例的唯一标识", evidence: "workflowId 标识流程实例" },
          { name: "activityType", meaning: "当前副作用所属的活动种类", evidence: "activityType 标识活动种类" },
          { name: "logicalAttempt", meaning: "同一业务意图在工作流中的逻辑尝试标识", evidence: "logicalAttempt 标识同一业务意图" }
        ]
      }],
      termReviews: [
        { section: 2, reviewedAt: "2026-07-27", terms: [
          { name: "DAG", meaning: "用无环有向边表示步骤依赖的任务图", purpose: "表达批处理和可并行的无环阶段", definitionEvidence: "DAG 表达无环依赖", purposeEvidence: "无环依赖、批处理、并行扇出" },
          { name: "状态机", meaning: "用有限状态和条件转换描述流程生命周期", purpose: "表达循环、超时和人工暂停", definitionEvidence: "状态机表达条件循环", purposeEvidence: "条件、循环、超时、人工暂停" }
        ]},
        { section: 6, reviewedAt: "2026-07-27", terms: [
          { name: "死信", meaning: "超过重试边界后等待人工或专门处理的失败任务队列", purpose: "隔离永久失败并避免无限重试", definitionEvidence: "进入死信/人工队列", purposeEvidence: "不能放任重试风暴" }
        ]},
        { section: 7, reviewedAt: "2026-07-27", terms: [
          { name: "Saga", meaning: "用一系列局部事务和补偿动作协调长流程的模式", purpose: "在无法跨系统原子提交时恢复业务一致性", definitionEvidence: "跨系统事务靠补偿", purposeEvidence: "恢复跨系统一致性" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["工作流编排由确定性控制器持久调度概率活动。","工作流编排是由确定性控制器持久记录节点状态并调度概率活动的系统"],
          ["它解决 Agent 会话不能承担事务状态的问题。","为什么“让 Agent 自己记住步骤”不是工作流"],
          ["输入步骤依赖规则，输出可恢复流程实例。","输入是可描述的步骤、依赖、schema 和恢复规则，输出是可重启、可审计的流程实例"],
          ["编排器记决定，LLM 只做局部概率活动。","LLM 只负责局部判断"],
          ["固定路径应由工作流控制。","固定路径用工作流"],
          ["真正未知路径才使用受限 Agent。","路径真正未知时才嵌入受限 Agent"]
        ]),
        six(2, [
          ["DAG 状态机事件和 Agent 子流程表达不同控制结构。","输出 DAG、状态机、事件驱动或 Agent 子流程"],
          ["它解决有条件循环为何不能只画成 DAG。","为什么不能只画成 DAG"],
          ["输入环等待事件未知性，输出控制模型。","输入流程是否有环、等待、异步事件和未知路径，输出 DAG、状态机、事件驱动或 Agent 子流程"],
          ["无环用 DAG，条件循环用状态机，未知局部用 Agent。","DAG 表达无环依赖，状态机表达条件循环"],
          ["四种模型可在同一系统组合。","模型可组合但各自有复杂度"],
          ["有条件循环硬塞 DAG 会失去清晰状态。","会失去清晰状态"]
        ]),
        six(3, [
          ["发票案例展示持久流程怎样从正确位置恢复。","发票抽取—校验—审批—入账"],
          ["它处理抽取失败和入账超时后的继续策略。","流程怎样从正确位置继续"],
          ["输入文件 schema 校验审批 API，输出入账或暂停。","输入文件、版本化发票 schema、校验规则、审批和财务 API，输出入账编号或带原因的暂停状态"],
          ["哈希去重局部重试持久等待，超时先查状态。","入账超时先查状态"],
          ["恢复表示从已确认节点继续。","恢复表示从已确认节点继续"],
          ["它不表示未知副作用可直接重试。","不表示未知副作用可直接重试"]
        ]),
        six(4, [
          ["至少一次执行要求副作用使用稳定幂等键去重。","至少一次执行意味着活动可能重复"],
          ["它解决重试让同一付款执行多次的问题。","使同一活动可能执行多次"],
          ["输入流程活动逻辑尝试，输出幂等键。","输入流程 ID、活动类型和逻辑尝试，输出稳定幂等键"],
          ["用唯一键去重表和状态查询只保留一次业务效果。","重复请求只产生一次业务效果"],
          ["长链一次成功率会随步骤数相乘下降。","十步则0.99¹⁰≈90.44%"],
          ["幂等不等于网络只传一次，也不修复错误参数。","不等于网络只传一次"]
        ]),
        six(5, [
          ["持久历史记录调度执行结果计时和审批事件。","输入每次调度、开始、完成、失败、计时和审批事件"],
          ["它让进程崩溃后可重放决定而不重做副作用。","重启变成重放决定，而非重做副作用"],
          ["输入事件，输出可重放控制决定。","输出重启后可重放的控制决定"],
          ["读取记录恢复，副作用用幂等和查询去重。","业务活动靠幂等键和状态查询避免重做"],
          ["历史只证明系统记录了事件。","历史证明系统记录了某个事件"],
          ["未知外部结果仍需查询或人工。","未知结果仍需查询或人工"]
        ]),
        six(6, [
          ["重试策略按错误类型决定有界重试或升级。","重试策略输入错误类型"],
          ["它避免永久错误被指数退避无限放大。","指数退避能解决吗"],
          ["输入错误次数时限，输出重试死信或停止。","输入错误类型、尝试次数、退避和最大时限，输出重试、死信、人工处理或停止"],
          ["瞬态重试，永久错误修复，超限进入人工队列。","超过阈值进入人工队列"],
          ["重试表示再次尝试而非错误已可恢复。","指数退避不能让永久错误变瞬态"],
          ["有界策略仍须防止重试风暴。","不能放任重试风暴"]
        ]),
        six(7, [
          ["补偿是失败后执行的新业务恢复动作。","用新的业务动作恢复跨系统一致性"],
          ["它处理跨系统长流程无法原子回滚的问题。","跨系统事务靠补偿，不是假装原子提交"],
          ["输入副作用后续失败逆向动作，输出恢复或升级。","输入已完成副作用、后续失败和预定义逆向动作，输出部分恢复、补偿失败或人工升级状态"],
          ["按成功副作用逆序执行预定义补偿并验证。","为每个成功副作用预定义补偿"],
          ["补偿不是数据库原子回滚。","而非数据库原子回滚"],
          ["补偿会失败且有些动作不可逆。","有些动作不可逆"]
        ]),
        six(8, [
          ["版本迁移保护正在运行的旧工作流实例。","版本迁移要保护正在运行的旧实例"],
          ["它避免新代码删除状态后旧历史无法重放。","昨天启动的流程重放会怎样"],
          ["输入历史代码 schema，输出兼容分支或迁移状态。","输入运行中实例历史、工作流代码和活动 schema 版本，输出兼容分支或显式迁移后的状态"],
          ["相同历史保持相同决定，非确定值写入活动结果。","相同历史得到相同控制决定"],
          ["快照回放降低不兼容风险。","历史快照回放降低不兼容风险"],
          ["它不能证明未来外部响应兼容。","不能证明所有未来外部响应兼容"]
        ]),
        six(9, [
          ["人工任务是可超时升级的持久等待状态。","人工任务是可超时、可升级的持久状态"],
          ["它解决等待数天时流程怎样不丢失不永久卡死。","怎样不丢失也不永久卡死"],
          ["输入负责人证据 SLA 路径，输出审批或超时事件。","输入负责人资格、证据、SLA、提醒和升级路径，输出批准、拒绝、超时升级或取消事件"],
          ["释放进程并用任务令牌等待外部批准恢复。","用任务令牌在外部事件到达后恢复"],
          ["持久等待不表示可以无限悬挂。","不表示审批可无限期悬挂"],
          ["超时不能自动通过，敏感理由受保留策略。","超时不能静默自动通过"]
        ]),
        six(10, [
          ["恢复评测用故障注入验证流程从正确节点继续。","恢复评测输入理想任务与崩溃"],
          ["它解决理想路径全通过为何仍不能上线的问题。","为什么仍不能上线"],
          ["输入任务和六类故障，输出恢复与副作用指标。","输入理想任务与崩溃、丢包、重复回调、旧 schema、补偿失败和队列满载故障，输出端到端成功、重复副作用、补偿、积压、SLA 与恢复节点"],
          ["注入故障后用事件历史核对恢复位置和真实副作用。","事件历史用于核对是否从正确位置继续"],
          ["一次理想路径通过不能代表恢复可靠。","一次理想路径通过不能代表可上线"],
          ["故障注入只覆盖已设计的故障场景。","故障注入也只覆盖已设计场景"]
        ]),
        six(12, [
          ["概率活动重放读取历史结果而不重新生成。","概率活动的结果必须入历史"],
          ["它避免恢复时同一模型输出变化导致另一分支。","为什么可能走向另一个分支"],
          ["输入模型版本输出校验历史，输出相同控制分支。","输入已记录的模型输入版本、模型版本、输出和校验结果，输出相同历史下相同的控制分支"],
          ["旧历史读旧结果，新尝试才创建新活动事件。","显式新尝试才创建新事件"],
          ["结果确定性来自历史记录而非模型本身。","恢复时读取旧结果而不再次生成"],
          ["缓存键缺版本会把过期答案伪装成确定性。","旧答案会被伪装成确定性"]
        ])
      ]
    },
    "multi-agent": {
      contractVersion: 2,
      examples: [{
        section: 3,
        evidence: {
          setup: "三个20分钟研究任务加10分钟合并",
          rule: "关键路径为 max(20,20,20)+10",
          steps: "70/30≈2.33",
          interpretation: "加入开销后仅 1.56 倍"
        }
      }],
      formulas: [{
        id: "multi-agent-critical-path", section: 3, formulaIndex: 1,
        symbols: [
          { name: "T", meaning: "公式中各分支、合并和总体的墙钟时间", evidence: "用户等待的并行墙钟下界" },
          { name: "parallel", meaning: "多个可并行分支共同执行的调度方案", evidence: "并行墙钟下界" },
          { name: "max", meaning: "从所有分支时长中取最长的一条", evidence: "由最慢分支加串行合并决定" },
          { name: "i", meaning: "当前遍历的分支编号", evidence: "第 i 条分支时长" },
          { name: "merge", meaning: "所有分支完成后的串行合并阶段", evidence: "串行合并时长" },
          { name: "Work", meaning: "所有分支和合并阶段累计的总工作成本", evidence: "Work 是总工作成本" },
          { name: "W", meaning: "单个分支或合并阶段消耗的工作量", evidence: "分别是各分支和合并工作量" },
          { name: "n", meaning: "参与并行执行的分支总数", evidence: "n 是分支数" }
        ]
      }],
      termReviews: [
        { section: 2, reviewedAt: "2026-07-27", terms: [
          { name: "黑板系统", meaning: "多个工作者异步读写同一版本化共享状态的协作拓扑", purpose: "支持解耦协作、恢复和跨角色汇合", definitionEvidence: "黑板/共享状态", purposeEvidence: "异步协作与恢复" }
        ]},
        { section: 6, reviewedAt: "2026-07-27", terms: [
          { name: "乐观锁", meaning: "写入时检查读取后的版本是否已被他人修改的并发控制", purpose: "发现并发覆盖而不长期独占共享状态", definitionEvidence: "乐观锁或事件日志", purposeEvidence: "检测并发冲突" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["多智能体系统把任务拆给多个受边界约束的 Agent。","多智能体系统把一个任务拆给多个受边界约束的 Agent"],
          ["它用通信成本换并行权限隔离或独立复核。","用通信成本换并行、权限隔离或独立复核"],
          ["输入瓶颈依赖接口，输出角色子任务和统一结果。","输入是单 Agent 的明确瓶颈、任务依赖和可验收接口，输出是角色化子任务与统一结果"],
          ["协调者拆分，工作者执行，最后合并验证。","由协调者合并和验证"],
          ["收益来自边界和可验证分工而非角色数量。","有效分工来自输入、权限、完成条件或验证视角不同"],
          ["强依赖短任务或接口不清时只会增加开销。","增加 Agent 只会复制上下文和错误"]
        ]),
        six(2, [
          ["拓扑规定多 Agent 的通信和控制结构。","输出管理者—工作者、流水线、对等或黑板拓扑"],
          ["它解决四种控制问题应怎样选择的问题。","四种拓扑对应四种控制问题"],
          ["输入依赖集中并行共享需求，输出拓扑。","输入依赖结构、控制集中度、并行需求和共享状态方式，输出管理者—工作者、流水线、对等或黑板拓扑"],
          ["按结构分配消息所有权终止和验收。","须指定任务 ID、终止条件和验收者"],
          ["拓扑名称只描述协调结构。","拓扑名称只描述协调结构"],
          ["它不保证信息独立或结论正确。","不保证参与者信息独立或结论正确"]
        ]),
        six(3, [
          ["并行案例计算关键路径墙钟总工时和加速比。","输出关键路径墙钟、总工时和加速比"],
          ["它解释三条并行研究为何达不到三倍加速。","为什么不是3倍加速"],
          ["输入分支准备合并时长，输出墙钟成本加速。","输入三条分支时长、重复准备和合并成本，输出关键路径墙钟、总工时和加速比"],
          ["最慢分支加合并决定墙钟，所有工作量累加成本。","并行墙钟由最慢分支加串行合并决定"],
          ["理想二点三三倍加入开销后仅一点五六倍。","加入开销后仅 1.56 倍"],
          ["资源不足依赖和排队会继续降低收益。","强依赖和排队会进一步降低收益"]
        ]),
        six(4, [
          ["任务契约规定子任务输入输出权限和完成证据。","任务契约要写输入、输出、权限和完成证据"],
          ["它解决一句去研究竞争对手为何无法可靠合并。","为什么难以合并"],
          ["输入范围资料预算权限，输出可合并委派单。","输入子任务范围、资料、schema、预算、权限和完成证据，输出可独立执行且可合并的委派单"],
          ["提供最小上下文并返回结构化结果来源缺口。","工作者返回结构化结果、来源、缺口和置信边界"],
          ["契约通过只表示交接可检查。","契约通过只表示交接可检查"],
          ["它不证明事实正确，写权限与自批仍须分离。","不表示研究事实正确"]
        ]),
        six(5, [
          ["依赖图标记可并行分支和必须等待的因果边。","输出可并行分支、必须等待的边以及最终聚合路径"],
          ["它决定哪些任务可并行并用验证门可信合并。","任务依赖图决定并行，验证门决定可信合并"],
          ["输入子任务约束状态验证，输出调度聚合路径。","输入子任务、先后约束、共享状态和验证门，输出可并行分支、必须等待的边以及最终聚合路径"],
          ["无依赖分支并行，验证制品再进入聚合器。","聚合器只接收经过验证的制品"],
          ["图中并行表示调度许可而非必须同时运行。","图中并行是调度许可"],
          ["缺少独立证据时分支仍会共同犯错。","多个分支仍会共同犯错"]
        ]),
        six(6, [
          ["共享状态是带版本所有者来源和冲突的恢复记录。","输出带所有者、来源和冲突状态的可恢复记录"],
          ["它防止两个工作者并发更新时最后写入覆盖。","最后写入者一定正确吗"],
          ["输入任务事实产物版本，输出版本化记录。","输入任务、事实、决策、产物及版本，输出带所有者、来源和冲突状态的可恢复记录"],
          ["消息通知变更，乐观锁或事件日志检测冲突。","写入用乐观锁或事件日志检测并发冲突"],
          ["最后写入不表示更正确。","最后写入不表示更正确"],
          ["冲突必须保留并仲裁，幂等只防重复副作用。","幂等任务 ID 只防重复副作用"]
        ]),
        six(7, [
          ["独立验证用不同数据工具或视角检查候选结论。","输入候选结论、数据源、工具和验证者视角"],
          ["它解释五个相同模型为何可能全部出错。","为什么仍可能全部错"],
          ["输入候选数据工具视角，输出支持反驳或未知。","输出外部证据支持、反驳或不确定结论"],
          ["只有信息或验证机制不同才增加独立性。","信息或验证机制真正不同才增加独立性"],
          ["一致票数本身不是证据。","一致票数本身不是证据"],
          ["共享训练提示检索会造成相关错误。","不能用多数票掩盖"]
        ]),
        six(8, [
          ["控制协议规定终止重试仲裁和反循环条件。","终止、重试与反循环是控制协议的一部分"],
          ["它防止 Agent 相互回派形成无限讨论。","怎样保证会停"],
          ["输入深度预算进展错误，输出继续重试或停止。","输入委派深度、预算、回合、进展证据和工具错误，输出继续、重试、仲裁、人工升级或停止"],
          ["回派需新缺口，无进展或预算耗尽则终止。","无进展或预算耗尽时终止"],
          ["停止只表示不再自动工作。","停止表示系统不再自动工作"],
          ["无法验证必须明确返回不完整。","无法验证应明确返回不完整"]
        ]),
        six(9, [
          ["多智能体评测必须与同任务同预算基线比较。","评测必须与同预算单智能体比较"],
          ["它区分结构收益和单纯增加 token 的收益。","还是只是多花了四倍 token"],
          ["输入四类方案，输出质量延迟成本移交指标。","输入同任务、同预算的单 Agent、多采样、确定性工作流和多 Agent 方案，输出质量、关键路径、总成本、移交和验证指标"],
          ["消融角色隔离共享状态并行以定位贡献。","消融角色隔离、共享状态和并行以定位收益来源"],
          ["多花 token 的提升不能归因于结构。","不能归因于结构"],
          ["少数高并行案例不能代表所有任务。","不能代表所有任务"]
        ]),
        six(11, [
          ["任务树可观测性按父子任务归因等待和成本。","输出关键路径时长与按研究、合并、验证、返工拆分的总成本"],
          ["它解释 token 翻倍是并行还是循环委派。","怎样知道是正常并行还是循环委派"],
          ["输入追踪父子角色版本成本，输出路径与成本分解。","输入 trace ID、父子关系、角色、版本、token、工具、重试和产物哈希，输出关键路径时长与按研究、合并、验证、返工拆分的总成本"],
          ["同时报告关键路径和总工时并按阶段拆分。","二者同时报告才能识别过度并行"],
          ["关键路径解释等待，总工时解释费用。","前者解释用户等待，后者解释费用"],
          ["缓存与排队必须单独归因。","不能把节省或延迟都算给多智能体"]
        ])
      ]
    },
    "coding-tools": {
      contractVersion: 2,
      examples: [{
        section: 3,
        evidence: {
          setup: "空数据集调用 export_csv([]) 返回500",
          rule: "先复现并写旧代码会失败的测试",
          steps: "由窄到宽验证",
          interpretation: "不证明所有平台和并发路径无误"
        }
      }],
      formulas: [{
        id: "coding-tools-validation-cost", section: 4, formulaIndex: 1,
        symbols: [
          { name: "V", meaning: "所有验证层累计的时间成本", evidence: "V 是累计验证时间成本" },
          { name: "i", meaning: "当前验证层的编号", evidence: "i 是验证层编号" },
          { name: "L", meaning: "验证金字塔包含的层数", evidence: "L 是层数" },
          { name: "n", meaning: "某一验证层被执行的迭代次数", evidence: "是第 i 层被执行的迭代次数" },
          { name: "t", meaning: "某一验证层单次产生反馈的时间", evidence: "是该层一次反馈时间" }
        ]
      }],
      termReviews: [
        { section: 1, reviewedAt: "2026-07-27", terms: [
          { name: "调用链", meaning: "从入口到目标函数之间的调用关系路径", purpose: "定位现象经过哪些代码边界到达根因", definitionEvidence: "接口、调用者", purposeEvidence: "定位难题" }
        ]},
        { section: 5, reviewedAt: "2026-07-27", terms: [
          { name: "diff", meaning: "修改前后文件内容的结构化差异", purpose: "限制补丁范围并审查无关或危险变更", definitionEvidence: "diff 门限制改动范围", purposeEvidence: "输出可回退交付" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["仓库级编程工具围绕真实项目执行完整修复闭环。","仓库级编程工具是围绕真实项目执行复现、定位、编辑、验证和审查的 Agent"],
          ["它解决自然语言现象与代码结构不一一对应的定位。","Issue 说“导出失败”，为什么不能直接搜索“export”然后改第一处"],
          ["输入任务仓库约束环境，输出补丁证据和未知项。","输入是任务现象、仓库状态、项目约束和环境，输出是最小补丁、运行证据与未验证项"],
          ["先复现定位，再最小编辑验证审查。","复现、定位、编辑、验证和审查"],
          ["交付应由运行证据与受控差异支持。","最小补丁、运行证据"],
          ["未复现就修改只是在猜根因。","未复现就修改只是在猜根因"]
        ]),
        six(2, [
          ["工具链是观察编辑验证反复更新假设的循环。","工具闭环输入仓库观察"],
          ["它说明搜索编辑测试分别提供什么反馈。","分别给智能体什么反馈"],
          ["输入观察定位编辑测试 diff，输出假设或变更。","输入仓库观察、搜索定位、候选编辑、测试结果和 diff，输出下一步假设或可交付变更"],
          ["各阶段用外部证据定位首次偏离。","失败则回到首次偏离处"],
          ["工具成功只表示命令本身执行。","工具调用成功只表示命令执行"],
          ["它不证明目标正确或用户工作未受损。","不表示目标行为正确或用户工作未受损"]
        ]),
        six(3, [
          ["CSV 案例展示模糊报错怎样变成最小可证补丁。","修复空CSV导出导致的500错误"],
          ["它解决空数据导出错误的复现定位和修复。","怎样把一个模糊报错变成最小、可证的补丁"],
          ["输入错误堆栈约定，输出分支测试和 diff。","输入空数据触发的 500、堆栈、调用者和已有约定，输出空集合分支、失败到通过测试及受控 diff"],
          ["先写失败测试再做最小实现并逐层验证。","先复现并写旧代码会失败的测试"],
          ["通过支持已声明的空输入行为修复。","已声明空输入行为修复"],
          ["它不证明所有平台并发路径无误。","不证明所有平台和并发路径无误"]
        ]),
        six(4, [
          ["验证金字塔按因果接近度从窄到宽运行检查。","输出由单测、模块、集成到全量的验证顺序与总成本"],
          ["它避免每轮先跑全量导致反馈慢且难归因。","为什么一开始跑40分钟全量测试反而妨碍调试"],
          ["输入反馈时间迭代风险，输出顺序和总成本。","输入各层反馈时间、迭代次数和变更风险，输出由单测、模块、集成到全量的验证顺序与总成本"],
          ["先证伪根因再逐层扩大覆盖。","先跑最能证伪根因的窄测试"],
          ["示例把总反馈时间从一百二十降到四十七分钟。","120 分钟降为 47 分钟"],
          ["最终仍须执行风险要求的宽测试。","最终仍须执行风险要求的宽测试"]
        ]),
        six(5, [
          ["证据门依次检查复现测试和补丁差异。","复现、测试和差异三道证据门"],
          ["它解释测试绿后为何还要审查 diff 和工作树。","为什么“测试绿了”还要检查diff和工作树"],
          ["输入任务状态复现补丁验证，输出交付或返工。","输入 Issue、工作区状态、复现、根因、补丁和验证结果，输出可回退交付或带新证据的返工"],
          ["三道门分别证明问题行为和范围。","复现门证明问题存在，测试门检查行为，diff 门限制改动范围"],
          ["三门通过支持当前交付决定。","三门通过支持当前交付决定"],
          ["未覆盖需求供应链权限风险仍存在。","不代表未覆盖需求、供应链和权限风险消失"]
        ]),
        six(6, [
          ["工作树保护维护用户已有和未提交修改。","工作树保护输入分支"],
          ["它防止测试失败恢复时覆盖用户工作。","为什么不能直接 git reset"],
          ["输入分支文件 diff 范围，输出允许集合或停止。","输入分支、已跟踪和未跟踪文件、已有 diff 与任务范围，输出允许修改集合、冲突说明或停止"],
          ["记录状态只改范围，删除前解析精确目标。","删除迁移先解析精确目标"],
          ["Git 只可回退已提交的历史。","Git 能回退已提交历史"],
          ["测试失败不授权硬重置用户工作。","测试失败也不授权硬重置"]
        ]),
        six(7, [
          ["测试证据是旧实现失败和新实现通过的可重复转换。","输出失败到通过转换及剩余不确定性"],
          ["它解释测试全绿为何仍可能是错误补丁。","为什么100%测试绿仍可能是错误补丁"],
          ["输入测试实现清单跳过项，输出转换和未知。","输入新增测试、旧实现、新实现、收集清单和跳过项，输出失败到通过转换及剩余不确定性"],
          ["先证旧失败再证新通过并核查执行范围。","先证明测试在旧代码失败"],
          ["绿色只覆盖实际运行过的断言。","百分百绿色只覆盖运行过的断言"],
          ["弱断言缺平台仍会漏错。","弱断言和缺平台仍会漏错"]
        ]),
        six(8, [
          ["供应链审查把依赖生成片段和许可证纳入补丁。","依赖、生成代码与许可证都是补丁的一部分"],
          ["它说明新增一个包的真实改动远超十行代码。","真实改动范围有多大"],
          ["输入依赖片段许可锁文件 API，输出接受或拒绝。","输入新增依赖、生成片段、许可证、锁文件和危险 API，输出接受、替代、锁定或拒绝决定"],
          ["优先现有依赖，新增时查来源传递漏洞许可。","检查来源、传递依赖、漏洞和许可"],
          ["少写代码不表示改动范围更小。","少写十行代码不等于改动更小"],
          ["依赖生命周期属于补丁范围。","依赖生命周期属于补丁范围"]
        ]),
        six(9, [
          ["仓库上下文工程围绕调用链选择最小相关文件。","输出当前假设所需的最小相关文件集合"],
          ["它防止把整个仓库塞给模型反而稀释约束。","读更多文件为何可能降低修复质量"],
          ["输入复现符号调用接口测试约定，输出文件集。","输入复现、符号、调用链、接口、测试和项目约定，输出当前假设所需的最小相关文件集合"],
          ["先读窄范围，假设扩展时按需加载。","改动扩展到新模块时再加载"],
          ["材料少不是目标，关键约束充分才是。","材料更少不是目标"],
          ["未查看路径和假设必须记录。","未查看假设必须记录"]
        ]),
        six(10, [
          ["补丁评测同时衡量正确性范围和维护成本。","补丁评测输入任务"],
          ["它判断基准通过率能否代表真实团队收益。","能代表真实团队收益吗"],
          ["输入任务测试 diff 审查基线，输出多维指标。","输入任务、隐藏测试、diff、人工审查和多种工具权限基线，输出正确性、范围、维护成本、时间及合并后缺陷指标"],
          ["按仓库特征切片并保护验收文件。","按语言仓库规模和测试质量切片"],
          ["基准分只是受控任务下的一项证据。","基准通过率不能单独代表团队收益"],
          ["修改评分脚本迎合指标必须判失败。","修改评分脚本迎合指标必须判失败"]
        ]),
        six(12, [
          ["防奖励投机把验收基础设施置于补丁控制之外。","防奖励投机输入只读隐藏测试"],
          ["它阻止删除失败测试或弱化断言制造全绿。","删掉失败测试就能全绿"],
          ["输入只读验收和补丁，输出独立结果与告警。","输入只读隐藏测试、评分脚本、CI 策略和候选补丁，输出干净环境中的独立验收与可疑测试修改告警"],
          ["修改验收需独立批准，最终在干净环境重跑。","最终在补丁之外重跑"],
          ["全绿必须来自真实行为满足验收。","全绿若来自删除测试"],
          ["缓存污染或弱化断言不能算成功。","不能算任务成功"]
        ])
      ]
    },
    "agent-frameworks": {
      contractVersion: 2,
      examples: [{
        section: 3,
        evidence: {
          setup: "从手写客服循环到持久状态图",
          rule: "中途杀进程，验证从批准前状态恢复且不重复退款",
          steps: "先复现原轨迹，再杀进程验证不重复退款",
          interpretation: "图画得漂亮不是验收"
        }
      }],
      formulas: [{
        id: "agent-framework-tco", section: 9, formulaIndex: 1,
        symbols: [
          { name: "TCO", meaning: "选定时间范围内使用框架的总拥有成本", evidence: "TCO 是选定时间范围内的总拥有成本" },
          { name: "C", meaning: "开发、运行、诊断、迁移或锁定中的一项成本", evidence: "分别是初始开发、日常运行、故障诊断、升级迁移和供应商锁定成本" }
        ]
      }],
      termReviews: [
        { section: 2, reviewedAt: "2026-07-27", terms: [
          { name: "trace", meaning: "把一次任务中的模型、工具、状态和错误事件串联起来的追踪记录", purpose: "定位失败发生在哪个运行环节", definitionEvidence: "trace、队列、评测", purposeEvidence: "观测部署五层责任" }
        ]},
        { section: 4, reviewedAt: "2026-07-27", terms: [
          { name: "领域状态", meaning: "由业务自己定义并版本化的对象和流程事实", purpose: "避免核心业务语义被框架消息格式锁定", definitionEvidence: "领域状态设计输入订单", purposeEvidence: "独立于框架消息" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["智能体框架封装模型工具状态和追踪的运行时。","智能体框架是把模型调用、工具循环、状态保存和追踪封装成运行时的开发组件"],
          ["它减少 Agent 最小循环的重复样板代码。","减少实现摩擦"],
          ["输入最小循环与痛点，输出运行时能力。","输入是已理解的最小 Agent 循环和具体工程痛点，输出是较少样板代码及可选路由、检查点和观测能力"],
          ["把循环步骤产品化并增加可选横切能力。","框架把这些步骤产品化"],
          ["框架价值是实现摩擦减少而非任务自动正确。","它减少实现摩擦，不定义业务成功"],
          ["需求不清时厚框架只会隐藏调用栈。","需求不清时厚框架只会隐藏调用栈"]
        ]),
        six(2, [
          ["框架能力分模型循环状态生态和观测五层。","输出模型适配、运行循环、状态图、扩展生态和观测部署五层责任"],
          ["它解决不同产品都声称支持 Agent 时怎样比较。","“支持 Agent”可能只支持模型接口，也可能包含持久工作流，怎样比较"],
          ["输入候选框架能力，输出五层责任。","输入候选产品能力，输出模型适配、运行循环、状态图、扩展生态和观测部署五层责任"],
          ["逐层核对职责与不应外包的业务决定。","逐层比较可避免把“支持 Agent”当成同一能力"],
          ["层级覆盖多不表示更适合生产。","层级覆盖越多不表示越适合生产"],
          ["目标权限语义指标仍由业务拥有。","业务仍须自己拥有目标、权限、领域语义和价值指标"]
        ]),
        six(3, [
          ["客服案例展示手写循环何时迁移到持久状态图。","从手写客服循环到持久状态图"],
          ["它解决增加框架何时比继续写条件分支更清楚。","什么时候“加一个框架”比继续写 if/else 更清楚"],
          ["输入审批回调恢复权限，输出领域状态和状态图。","输入手写循环、退款审批、跨天回调、恢复和租户权限，输出版本化领域状态与持久状态图"],
          ["复现旧轨迹后注入崩溃并验证不重复退款。","先复现原轨迹，再杀进程验证不重复退款"],
          ["恢复和诊断改善才证明迁移价值。","只有在恢复或诊断改善时才证明价值"],
          ["图画漂亮不等于框架迁移通过。","图画得漂亮不是验收"]
        ]),
        six(4, [
          ["领域状态是独立于框架消息的版本化业务事实。","领域状态设计输入订单"],
          ["它避免把业务对象塞入消息后锁死迁移。","为什么把全部业务数据塞进框架 message 列表会锁死迁移"],
          ["输入业务对象版本，输出 schema 和迁移记录。","输入订单、批准、证据、幂等键和版本，输出独立于框架消息的 schema 与迁移记录"],
          ["消息从状态派生，检查点存版本，分支明确归并。","消息从状态派生"],
          ["框架消息只是领域状态的一个视图。","框架消息只是一个视图"],
          ["它不能成为唯一真相或跨租户共享字典。","不能成为业务唯一真相或跨租户共享字典"]
        ]),
        six(5, [
          ["分层架构把应用控制框架运行时和外部系统分开。","输出可替换的责任边界"],
          ["它说明哪些层可替换哪些必须由应用拥有。","哪一层应该能被替换，哪一层必须由应用自己拥有"],
          ["输入三层组件，输出可替换责任边界。","输入应用领域控制、框架运行时和外部模型工具存储，输出可替换的责任边界"],
          ["应用持有目标权限验收，框架承载循环和观测。","应用拥有目标、权限、验收和 schema"],
          ["可替换表示接口和测试隔离良好。","可替换表示接口与测试隔离良好"],
          ["它不表示任意框架可无损互换。","不表示任意框架可无损互换"]
        ]),
        six(6, [
          ["可靠性语义显式规定重试取消和终止。","重试、取消和终止语义必须可见"],
          ["它防止框架自动重试悄悄重复副作用。","为什么可能悄悄重复副作用"],
          ["输入调用错误预算取消，输出重试查询或停止。","输入调用类型、错误、幂等键、预算和取消信号，输出重试、查询、取消或终止"],
          ["按调用类型有界重试，写操作先查询去重。","写工具先查询结果并去重"],
          ["自动重试只表示再次调度。","框架自动重试只表示再次调度"],
          ["它可能放大永久错误和副作用。","可能放大永久错误和副作用"]
        ]),
        six(7, [
          ["抽象逃生口保留供应商原始事件和直接调用路径。","输出可诊断差异与直接调用路径"],
          ["它解决统一模型接口遮蔽新能力和错误细节。","解决统一接口遮蔽新能力和错误细节的问题"],
          ["输入原始与适配结果，输出差异和逃生口。","输入供应商原始请求响应、扩展字段和框架适配结果，输出可诊断差异与直接调用路径"],
          ["对照原始事件并允许绕过最低公分母适配器。","保留原始请求响应"],
          ["接口一致不表示语义等价。","接口一致不等于语义等价"],
          ["更换适配器必须重跑任务安全成本评测。","必须重跑任务、安全和成本评测"]
        ]),
        six(8, [
          ["插件治理审查连接器代码依赖权限和提示。","插件治理输入连接器代码"],
          ["它处理社区工具包等于执行第三方代码的风险。","为何可能等于执行第三方代码"],
          ["输入插件依赖凭证，输出允许限制锁定或拒绝。","输入连接器代码、依赖、权限、提示和生产凭证，输出允许、沙箱限制、版本锁定或拒绝"],
          ["逐工具允许并审计升级默认值。","逐工具允许并审计升级默认值"],
          ["安装成功不表示供应链可信。","安装成功或来源流行不表示供应链可信"],
          ["生产凭证和运行权限必须最小化。","开发/生产凭证"]
        ]),
        six(9, [
          ["选型实验比较框架总拥有成本与故障表现。","输出同预算质量、延迟、恢复和 TCO"],
          ["它解决节省开发时间是否被长期成本抵消。","让每月升级和故障排查增加多少成本"],
          ["输入任务框架五类成本，输出质量恢复和 TCO。","输入代表任务、候选框架和初始开发、运行、诊断、迁移、锁定五类成本，输出同预算质量、延迟、恢复和 TCO"],
          ["限定时间试验并注入崩溃人工中断。","time-box 实验注入崩溃与人工中断"],
          ["TCO 是决策框架而非精确预测。","TCO 是决策框架而非精确预测"],
          ["权重与时间范围必须按团队实际估计。","必须按团队实际估计"]
        ]),
        six(10, [
          ["迁移契约测试比较框架升级前后的事件和副作用。","迁移契约测试输入冻结的状态"],
          ["它防止大版本升级悄悄改变关键行为。","哪些行为最容易悄悄变化"],
          ["输入冻结轨迹，输出新旧事件副作用差异。","输入冻结的状态、工具序列、权限拒绝、人工暂停、超时、恢复和业务结果，输出旧版与新版的事件及副作用差异"],
          ["先迁移 schema，再分开实例并灰度观察。","先迁移 schema，再分开运行新旧实例并灰度观察"],
          ["文本措辞可以变化但控制边界不得变化。","自然语言不必逐字相同"],
          ["权限状态副作用不能静默变化。","不得静默变化"]
        ]),
        six(12, [
          ["逐层购买抽象按真实需求组合最薄组件。","自建与引入不是二选一，而是逐层购买抽象"],
          ["它解决只需追踪时是否必须采用完整框架。","是否必须采用完整Agent框架"],
          ["输入需求组件信号，输出最薄抽象组合。","输入真实需求、已有组件和升级信号，输出 SDK、追踪、队列、状态图等最薄组合"],
          ["先购横切能力，重复出现恢复路由才加厚。","只有恢复、中断或图路由反复出现才加厚运行时"],
          ["混合方案表示责任可以拆分。","混合自建与引入表示责任可拆分"],
          ["不能没有退出条件地因惯性扩张。","不允许框架因惯性扩张且没有退出条件"]
        ])
      ]
    },
    "agent-skills": {
      contractVersion: 2,
      examples: [{
        section: 4,
        evidence: {
          setup: "输入为已核验CSV和报告日期",
          rule: "数字逐项回连中间JSON",
          steps: "生成文档后调用渲染脚本",
          interpretation: "不负责清洗缺失数据或凭空补全事实"
        }
      }, {
        section: 5,
        evidence: {
          setup: "100个请求里只有20个真正需要技能S",
          rule: "精确率衡量触发中有多少选对",
          steps: "精确率为18/(18+16)",
          interpretation: "高风险低基率场景应优先减少误触发"
        }
      }],
      formulas: [{
        id: "agent-skills-selection", section: 5, formulaIndex: 1,
        symbols: [
          { name: "Precision", meaning: "所有技能触发中选择正确的比例", evidence: "Precision 是触发结果中正确的比例" },
          { name: "Recall", meaning: "真实需要某技能的请求中被触发的比例", evidence: "Recall 是真实需要请求中被找回的比例" },
          { name: "TP", meaning: "真实需要且正确触发技能的请求数量", evidence: "TP 是正确触发技能的请求数" },
          { name: "FP", meaning: "不需要技能却被错误触发的请求数量", evidence: "FP 是不需要技能却误触发的请求数" },
          { name: "FN", meaning: "需要技能却没有触发的请求数量", evidence: "FN 是需要技能却未触发的请求数" }
        ]
      }],
      termReviews: [
        { section: 3, reviewedAt: "2026-07-27", terms: [
          { name: "渐进披露", meaning: "发现时只加载轻量描述，选中后再按需加载完整资源", purpose: "减少未选技能材料占用上下文和干扰选择", definitionEvidence: "扩展资源按任务逐步加载", purposeEvidence: "避免把整套文档永久塞进上下文" },
          { name: "schema", meaning: "规定输入输出字段、类型和约束的机器可检查契约", purpose: "让技能、脚本和组合之间能校验中间制品", definitionEvidence: "字段、文件、schema与示例", purposeEvidence: "输入/输出" }
        ]},
        { section: 7, reviewedAt: "2026-07-27", terms: [
          { name: "幂等", meaning: "重复执行同一动作仍只产生一次预期副作用", purpose: "防止重试脚本造成重复写入", definitionEvidence: "错误码、幂等、超时", purposeEvidence: "约束副作用" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["智能体技能是重复任务的版本化能力包。","智能体技能是把一类重复任务的触发、步骤、资源和验收封装成版本化能力包"],
          ["它减少重复设计并规模化已经验证的做法。","通过固化已验证做法减少重复设计"],
          ["输入任务轨迹和通过条件，输出复用制品。","输入是多次真实任务轨迹与稳定通过条件，输出是可发现、可执行、可回退的复用制品"],
          ["从成功失败轨迹提炼稳定步骤并保留回退。","先从真实成功/失败轨迹提炼稳定部分"],
          ["封装表示稳定部分能够复用。","技能的收益来自复用"],
          ["目标持续变化或不可验收时应回退通用 Agent。","应回退通用 Agent"]
        ]),
        six(2, [
          ["提示工具技能工作流是责任不同的四类制品。","输出提示、工具、技能或工作流分类"],
          ["它解决四者都指导 Agent 时怎样区分的问题。","四者都能“告诉 Agent 怎么做”，差别在哪里"],
          ["输入制品及责任，输出对应层级分类。","输入一个 Agent 制品及其责任，输出提示、工具、技能或工作流分类"],
          ["按本轮表达动作任务方法和持久状态区分。","提示指导本轮表达，工具提供动作，技能组织某类任务，工作流持久编排系统状态"],
          ["四类制品可以组合但不能互相替代。","四者可以组合但不能互相替代"],
          ["技能不授予权限也不保证现实副作用安全。","不保证执行器的现实副作用安全"]
        ]),
        six(3, [
          ["技能包由描述输入输出步骤资源脚本治理六类契约组成。","一个技能包至少包含六类契约"],
          ["它解决只有 README 时难以稳定复用的问题。","为什么难以稳定复用"],
          ["输入六类信息，输出可独立执行验收的能力包。","输入适用任务、数据契约、操作步骤、参考资源、脚本和治理信息，输出能够独立执行与验收的六类契约"],
          ["入口完整读取，扩展按需加载，确定工作交脚本。","入口必须完整读取，扩展资料按需加载"],
          ["六类齐全表示责任和依赖可追踪。","六类齐全表示责任可追踪"],
          ["依赖变化后仍须回归，不能假设永远正确。","依赖变化后仍须回归"]
        ]),
        six(4, [
          ["PDF 案例把写作脚本模板和验收封装为技能。","生成并验收月度PDF报告"],
          ["它解决散落提示和资产怎样形成可靠能力。","它解决散落提示、脚本和品牌模板如何形成可靠能力的问题"],
          ["输入 CSV 日期品牌，输出 PDF 校验版本警告。","输入已核验 CSV、报告日期和品牌规则，输出 PDF、校验报告、完整版本和未解决警告"],
          ["脚本算数模型解释渲染检查并回连证据。","系统用脚本计算数字、模型解释趋势、渲染器检查版面"],
          ["通过表示本次内容与版式验收满足声明。","通过表示本次制品满足声明的内容与版式验收"],
          ["技能不负责清洗缺失数据或补全事实。","不负责清洗缺失数据或凭空补全事实"]
        ]),
        six(5, [
          ["技能选择是带请求基率的分类问题。","选择技能是一个带基率的分类问题"],
          ["它解释高召回为何仍会频繁误触发。","为什么仍可能频繁打扰用户"],
          ["输入请求与描述，输出技能澄清或无技能。","输入请求与技能描述，输出选中技能、澄清或无技能"],
          ["用 TP FP FN 计算精确率与召回率。","18 个真阳性和 16 个假阳性"],
          ["百分之五十二点九表示近半触发错误。","精确率仅 52.9%"],
          ["比例依赖基率，高风险场景应优先减少误触发。","高风险低基率场景应优先减少误触发"]
        ]),
        six(6, [
          ["渐进披露把轻量发现与完整执行知识分开。","发现时只看描述，选中后再渐进加载与验证"],
          ["它减少把所有技能全文放入上下文造成的竞争。","减少上下文竞争"],
          ["输入任务目录，输出入口和按需资源。","输入任务和轻量描述目录，输出所选技能入口以及执行时按需加载的参考、脚本和资产"],
          ["先选描述再读入口并加载必要资源验收。","选中后完整读取入口，再加载必要资源并验收"],
          ["它降低上下文竞争而不表示其他材料无用。","不表示未加载材料无用"],
          ["入口遗漏关键约束仍会使执行失真。","入口遗漏关键约束仍会让后续执行失真"]
        ]),
        six(7, [
          ["确定性脚本负责可重复计算转换和验证。","脚本承担确定性工作"],
          ["它解决模型不擅长精确重复操作的问题。","解决模型不擅长精确重复操作的问题"],
          ["输入校验数据，输出结果和错误码。","输入经过 schema 校验的数据，输出可重复计算、转换或验证结果及错误码"],
          ["用沙箱超时幂等和测试约束副作用。","用沙箱、超时、幂等和测试约束副作用"],
          ["确定性只表示同条件下行为稳定。","确定性只表示同条件下行为稳定"],
          ["它不表示代码安全输入可信或写操作获批。","不表示代码安全、输入可信或写操作已经批准"]
        ]),
        six(8, [
          ["版本治理锁定入口资源脚本依赖和环境。","版本要同时锁入口、资源、脚本和环境"],
          ["它解决只改参考文档也改变技能行为的问题。","为什么也可能改变技能行为"],
          ["输入完整依赖，输出不可变可重放版本集合。","输入入口、资源、模板、脚本、依赖和运行环境，输出不可变技能版本与可重放的完整版本集合"],
          ["引用变化触发回归并回放高风险历史轨迹。","任何引用变化都触发回归"],
          ["版本锁定支持解释旧结果。","版本锁定支持解释旧结果"],
          ["它不能阻止外部服务变化或链接失效。","不能阻止外部服务变化"]
        ]),
        six(9, [
          ["技能评测分选择正确和执行正确两层。","评测分“选对技能”和“技能做对任务”两层"],
          ["它区分触发错误和技能执行错误。","怎样区分触发错误与执行错误"],
          ["输入请求反例任务基线，输出两层指标。","输入请求集、近邻反例、确认选对的任务和旧版本基线，输出选择指标与执行指标"],
          ["先测选择再测步骤脚本制品权限。","先判断是否选对技能，再判断步骤、脚本、制品和权限是否通过"],
          ["分层结果能定位失败发生在哪一层。","从而定位失败层"],
          ["总体分和漂亮案例不能代表异常失败分布。","漂亮成功示例也不能代表异常输入分布"]
        ]),
        six(10, [
          ["技能生命周期管理决定保留合并弃用禁用或回退。","输出保留、合并、弃用、立即禁用或回退决定"],
          ["它解决过时重叠技能持续增加风险的问题。","解决重叠和过时技能持续增加选择混淆与风险的问题"],
          ["输入所有者使用失败依赖权限，输出生命周期决定。","输入目录中的所有者、使用率、失败、依赖和权限状态，输出保留、合并、弃用、立即禁用或回退决定"],
          ["定期审计并在高风险漏洞时优先停止使用。","高风险漏洞优先停止使用"],
          ["保留历史版本只用于解释旧产物。","只用于解释旧产物"],
          ["保留历史不表示旧技能仍可触发。","不表示旧技能仍可触发"]
        ]),
        six(12, [
          ["冲突解析决定多技能应选择组合澄清或回退。","多个技能同时匹配时要显式消歧与组合"],
          ["它解决表格和文档技能同时命中时谁接管。","“把Excel数据做成PDF汇报”同时命中表格和文档技能"],
          ["输入候选契约权限冲突，输出选择组合或澄清。","输入多个候选技能的输入输出、权限、依赖和冲突声明，输出单一选择、按 schema 组合、澄清或无技能回退"],
          ["先硬过滤再辨重叠互补并指定唯一所有者。","先用硬条件过滤，再判断是重叠还是前后互补"],
          ["组合成功只表示接口能够衔接。","组合成功只表示接口衔接"],
          ["不能并发写同一资源或靠加载顺序决定权限。","不能让两个技能并发写同一资源或靠加载顺序决定权限"]
        ])
      ]
    },
    "agent-memory": {
      contractVersion: 2,
      examples: [{
        section: 9,
        evidence: {
          setup: "用户先说“报告默认中文”",
          rule: "先按用户与项目权限过滤",
          steps: "m42胜出",
          interpretation: "不表示用户的全局中文偏好被删除"
        }
      }],
      formulas: [
        {
          id: "agent-memory-retrieval-score", section: 4, formulaIndex: 1,
          symbols: [
            { name: "score", meaning: "候选记忆在当前任务中的排序分数", evidence: "score 是排序分数" },
            { name: "m", meaning: "当前参与检索排序的一条候选记忆", evidence: "m 是一条候选记忆" },
            { name: "Rel", meaning: "候选记忆与当前任务的相关性", evidence: "分别是相关性、时效性、重要度和来源置信" },
            { name: "Rec", meaning: "候选记忆相对当前时刻的时效性", evidence: "分别是相关性、时效性、重要度和来源置信" },
            { name: "Imp", meaning: "候选记忆对任务的预估重要程度", evidence: "分别是相关性、时效性、重要度和来源置信" },
            { name: "Src", meaning: "候选记忆来源的可信程度", evidence: "分别是相关性、时效性、重要度和来源置信" },
            { name: "α", meaning: "相关性在总排序分数中的权重", evidence: "是对应权重" },
            { name: "β", meaning: "时效性在总排序分数中的权重", evidence: "是对应权重" },
            { name: "γ", meaning: "重要度在总排序分数中的权重", evidence: "是对应权重" },
            { name: "δ", meaning: "来源置信在总排序分数中的权重", evidence: "是对应权重" },
            { name: "Penalty", meaning: "候选记忆存在冲突时扣除的惩罚", evidence: "Penalty 是冲突惩罚" }
          ]
        },
        {
          id: "agent-memory-net-value", section: 12, formulaIndex: 1,
          symbols: [
            { name: "V", meaning: "使用记忆相对无记忆基线的净贡献", evidence: "V 是记忆相对基线的净贡献" },
            { name: "Success", meaning: "给定实验方案下的端到端任务成功率", evidence: "分别是使用记忆与不使用记忆的任务成功率" },
            { name: "memory", meaning: "启用待评估记忆系统的实验方案", evidence: "使用记忆与不使用记忆" },
            { name: "noMemory", meaning: "关闭记忆系统的对照基线方案", evidence: "使用记忆与不使用记忆" },
            { name: "Cost", meaning: "把风险事件汇总成的成本函数", evidence: "是隐私越界和陈旧引用成本" },
            { name: "privacyStale", meaning: "隐私越界和陈旧记忆引用两类风险", evidence: "隐私越界和陈旧引用成本" },
            { name: "λ", meaning: "把风险成本换算到成功率尺度的权重", evidence: "把风险成本换算到与成功率可比较的权重" }
          ]
        }
      ],
      termReviews: [
        { section: 2, reviewedAt: "2026-07-27", terms: [
          { name: "情景记忆", meaning: "带时间和来源的具体经历或事件记录", purpose: "保留某件事何时发生以及证据来自哪里", definitionEvidence: "带时间来源的具体事件", purposeEvidence: "具体事件保留时间来源" },
          { name: "语义记忆", meaning: "从多次事件中整合出的稳定事实或偏好", purpose: "让跨任务仍有效的知识可被重复使用", definitionEvidence: "从多次事件整合出的稳定事实或偏好", purposeEvidence: "多次证据才可整合为稳定偏好" },
          { name: "程序性规则", meaning: "可重复执行的流程、策略或操作规范", purpose: "保存跨任务复用的做事方式", definitionEvidence: "可复用流程、策略与操作规范", purposeEvidence: "程序性记忆类别" }
        ]},
        { section: 10, reviewedAt: "2026-07-27", terms: [
          { name: "TTL", meaning: "记录在到期前允许保留的有效时长", purpose: "让临时记忆能够自动过期而非永久积累", definitionEvidence: "冲突 + 失效 + TTL", purposeEvidence: "可逆更新" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["外部记忆是可持久写入检索并纠正的状态系统。","外部记忆是 Agent 可持久写入、按需检索并可纠正的状态系统"],
          ["它解决历史超出窗口与跨会话连续性问题。","支持长期个性化和任务连续性"],
          ["输入事件事实偏好，输出获准使用的记忆证据。","输入是超出当前窗口仍可能有用的事件、事实和偏好，输出是当前任务获准使用的记忆证据"],
          ["按写入检索更新维持跨会话状态。","通过写入、检索和更新维持跨会话连续性"],
          ["命中只表示找到了记录。","命中只表示找到了记录"],
          ["命中不表示最新真实或有权使用。","不表示记录最新、真实或有权使用"]
        ]),
        six(2, [
          ["记忆分为上下文工作状态情景语义和程序性层。","输出上下文历史、工作状态、情景、语义或程序性记忆类别"],
          ["它解决当前工具结果与长期偏好是否同处一层的问题。","应该住在同一个地方吗"],
          ["输入候选信息用途有效期，输出记忆类别。","输入一条候选信息及其用途和有效期，输出上下文历史、工作状态、情景、语义或程序性记忆类别"],
          ["按时间来源稳定程度和用途选择层级。","多次证据才可整合为稳定偏好"],
          ["分类决定相应写入与淘汰策略。","分类帮助选择写入和淘汰策略"],
          ["信息可能跨层，不能凭名称升级长期规则。","不能仅凭名称自动升级为长期规则"]
        ]),
        six(3, [
          ["写入门控决定候选内容是否值得持久保存。","写入门控输入候选内容"],
          ["它避免每句话都保存造成噪声冲突和隐私问题。","解决每句话都保存造成的噪声、冲突和隐私问题"],
          ["输入来源效用置信敏感作用域期限，输出写入决定。","输入候选内容、来源、置信度、未来效用、敏感度、作用域和保留期，输出拒绝、待确认或版本化记录"],
          ["重要事实确认或多证据后再提升。","重要事实经确认或多证据后再提升"],
          ["写入成功只表示符合保存策略。","写入成功只表示符合保存策略"],
          ["它不证明内容真实或未来一定有用。","不证明内容为真或未来一定有用"]
        ]),
        six(4, [
          ["记忆检索是先权限过滤再多信号重排的过程。","先按用户和项目作用域过滤"],
          ["它防止只按向量相似度选出过期或越权记录。","只按向量相似度找记忆会漏掉什么"],
          ["输入任务权限时间候选信号，输出带来源记录。","输入任务、主体权限、时间、候选记忆及五类评分信号，输出过滤并重排后的带来源记录"],
          ["综合相关时效重要来源置信并扣冲突惩罚。","综合相关性、时效性、重要度和来源置信"],
          ["总分用于排序而不是真值概率。","总分用于排序而非真值概率"],
          ["权限必须硬过滤，不能作为软惩罚。","权限不得用负分软惩罚代替硬过滤"]
        ]),
        six(5, [
          ["整合管理维护当前视图历史冲突和删除状态。","输出当前视图、历史轨迹、冲突状态或删除结果"],
          ["它处理新事实与旧事实冲突时怎样更新。","新事实与旧事实冲突时"],
          ["输入新旧记录时间来源纠正，输出版本化状态。","输入新旧记录、时间、来源和用户纠正，输出当前视图、历史轨迹、冲突状态或删除结果"],
          ["用版本失效保留审计并让摘要链接原证据。","通过版本失效而非物理覆盖保留审计"],
          ["当前值只是在规则下最适用的记录。","当前值只是在明确规则下最适用的记录"],
          ["无法裁决应并存或询问，模型总结不是验证。","模型总结不能充当事实验证"]
        ]),
        six(6, [
          ["记忆安全阻止不可信内容升级为持久规则。","阻断网页提示注入被持久化为未来规则"],
          ["它防止恶意网页长期污染后续任务。","污染未来很多次任务"],
          ["输入候选来源敏感作用域，输出写入或拒绝。","输入外部候选、来源、敏感度和目标作用域，输出允许写入的数据记录或拒绝决定"],
          ["外部内容标为数据且系统策略不可被覆盖。","外部内容始终标为数据"],
          ["过滤通过只覆盖已测试攻击。","过滤通过只覆盖已测攻击"],
          ["跨用户泄漏和间接注入仍须专门评测。","跨用户泄漏和间接注入仍须专门评测"]
        ]),
        six(9, [
          ["偏好案例展示不同作用域记录怎样命中和纠正。","偏好变化怎样进入、命中并被纠正"],
          ["它解决全局中文与项目英文应使用哪条记录。","系统该记住哪一句"],
          ["输入两级语言偏好，输出项目当前语言及来源。","输入用户级中文偏好与项目级英文约束，输出按项目作用域选择并带来源的当前语言"],
          ["先过滤权限再按作用域时效显式度重排。","先过滤权限，再按作用域、时效和显式程度重排"],
          ["m42 胜出表示它对项目 P 更具体。","m42 胜出表示它对项目 P 更具体"],
          ["它不表示全局中文偏好被删除。","不表示用户的全局中文偏好被删除"]
        ]),
        six(10, [
          ["生命周期图描述写存找用改的治理状态变化。","记忆是一条有治理闸门的生命周期"],
          ["它说明向量化写库为何只完成存储一步。","只完成了最容易的一小步"],
          ["输入候选和任务，输出受控记忆及纠正结果。","输入候选事件和任务请求，输出经过写入闸门、版本化存储、权限检索与反馈纠正的记忆"],
          ["每个箭头记录一次可审计的状态变化。","每个箭头都是可记录的状态变化"],
          ["图用于定位错误发生在哪个阶段。","定位错误发生在写、存、找、用还是改"],
          ["它不限定数据库，也不自动获得治理能力。","仅向量化写库不会自动获得权限、版本和删除能力"]
        ]),
        six(11, [
          ["冲突推理依据事实类型作用域时间和来源裁决。","冲突不是“选相似度最高”"],
          ["它避免计划现状和不同项目偏好互相覆盖。","住在上海”和“下周在北京”为什么不能互相覆盖"],
          ["输入实体属性类型作用域时间来源，输出冲突状态。","输入实体、属性、事实类型、作用域、有效时间和来源，输出并存、失效、当前选择或澄清请求"],
          ["仅同属性且时间作用域重叠才是直接冲突。","只有同一属性且时间作用域重叠时才构成直接冲突"],
          ["当前视图是规则下的选择而非永恒真相。","当前视图不是永恒真相"],
          ["相似度不能强行覆盖计划现状或不同作用域。","不能被相似度分数强行覆盖"]
        ]),
        six(12, [
          ["五阶段评测分别衡量写找用改忘及端到端价值。","评测要覆盖写、找、用、改、忘五个阶段"],
          ["它解释高召回为何仍可能被旧记忆带偏。","为什么 Agent 仍可能被旧记忆带偏"],
          ["输入跨轮任务，输出阶段指标和端到端指标。","输入含稳定、临时、冲突、敏感和恶意记录的跨轮任务，输出写入、检索、使用、纠正、遗忘及端到端指标"],
          ["对照无记忆基线并扣除陈旧和隐私成本。","与无记忆基线比较任务增益"],
          ["净贡献依赖指标尺度和风险权重。","净贡献依赖指标尺度与系数 λ"],
          ["高召回不能抵消跨用户泄漏。","不能用高召回抵消跨用户泄漏"]
        ])
      ]
    },
    mcp: {
      contractVersion: 2,
      examples: [{
        section: 5,
        evidence: {
          setup: "连接一个天气 Server 并查纽约天气",
          rule: "由 Host 校验和授权 tools/call",
          steps: "initialize、确认 initialized、tools/list",
          interpretation: "能力协商不等于用户授权"
        }
      }],
      formulas: [],
      termReviews: [{
        section: 1,
        reviewedAt: "2026-07-27",
        terms: [{
          name: "MCP",
          meaning: "规定 AI 应用与外部能力如何发现、连接和交换消息的开放协议",
          purpose: "减少不同应用和能力提供方之间重复编写专用适配器",
          definitionEvidence: "公共协议的连接结构",
          purposeEvidence: "重复编写连接适配器的问题"
        }]
      }],
      sectionContracts: [
        six(1, [
          ["MCP 用公共协议连接不同 AI 应用与能力提供方。","公共协议的连接结构"],
          ["它解决应用和工具重复编写两两适配器的问题。","重复编写连接适配器的问题"],
          ["输入 M 个应用 N 个能力，输出公共连接结构。","输入是 M 个应用和 N 个能力源，输出是双方各实现一次公共协议的连接结构"],
          ["双方各实现一次协议使理想集成数从乘积变加和。","由 M×N 变为 M+N"],
          ["加和表示连接代码可以复用。","表示连接代码可复用"],
          ["它不免除认证授权版本和语义适配。","不表示每个组合无需认证、授权、版本和语义适配"]
        ]),
        six(2, [
          ["MCP 是规定能力暴露发现调用的开放协议。","MCP 是规定能力怎样暴露、发现和调用的开放协议"],
          ["它让应用端和服务端按同一接口交换消息。","两边各按标准实现一次，就能互通"],
          ["输入协议实现端，输出结构化消息和生命周期。","输入是实现 MCP 的应用端与服务端，输出是能够互通的结构化消息和生命周期"],
          ["双方按公共接口实现并通过协议状态交换。","像 USB-C 统一接口"],
          ["兼容协议只表示能够交换消息。","兼容协议只说明能交换消息"],
          ["它不保证工具真实安全或适用。","不保证工具真实、安全或适合当前任务"]
        ]),
        six(3, [
          ["工具调用表达模型意图，MCP 负责外部能力连接。","输出工具调用层与 MCP 连接层"],
          ["它解决两者看似都是调用工具时怎样分工。","它和工具调用的分工"],
          ["输入工具意图和能力连接，输出两层责任。","输入模型提出的工具意图和外部能力连接，输出工具调用层与 MCP 连接层"],
          ["模型表达想做什么，Host 发现由谁怎样做。","模型用工具调用表达“想做什么”"],
          ["两层配合才可完成外部执行。","两层配合才能执行"],
          ["两者不能互相替代选择和连接责任。","工具调用也不解决跨提供方接入复用"]
        ]),
        six(4, [
          ["Host Client Server 是 MCP 的三类会话角色。","输出 Host、Client、Server 责任"],
          ["它区分用户应用单连接器和能力服务的责任。","一次 MCP 连接里，有三个角色。搞清谁是谁，整件事就清楚了"],
          ["输入会话连接能力，输出角色责任和原语目录。","输入用户会话、单个 Server 连接和服务能力，输出 Host、Client、Server 责任及 tools、resources、prompts 目录"],
          ["Host 管策略，Client 管单会话，Server 暴露能力。","每个 Client 维护一个 Server 会话"],
          ["角色关系表示通信边界。","角色关系说明通信边界"],
          ["它不授予 Server 全部会话资源权限。","不表示 Server 已获全部会话、资源或执行权限"]
        ]),
        six(5, [
          ["天气示例追踪初始化发现授权调用和结果处理。","从握手到调用工具"],
          ["它说明连接天气 Server 后怎样获得可检查结果。","连接一个天气 Server 并查纽约天气"],
          ["输入版本能力城市，输出会话目录和结果。","输入双方版本能力和城市参数，输出协商会话、工具目录与带来源结果"],
          ["依次初始化确认发现并授权调用。","initialize、确认 initialized、tools/list"],
          ["返回天气只表示 Server 给出结果。","返回天气只表示 Server 给出结果"],
          ["协商不等于授权，外部结果仍不可信。","能力协商不等于用户授权"]
        ]),
        six(6, [
          ["标准化形成可复用扩展组合的能力网络。","输出可复用、可扩展和可组合的能力网络"],
          ["它降低新增 Host 或 Server 的重复集成成本。","标准化带来了什么"],
          ["输入兼容双方，输出可组合能力网络。","输入多个兼容 Host 与 Server，输出可复用、可扩展和可组合的能力网络"],
          ["新增一方实现公共接口并由 Host 编排。","新增一方只实现公共接口"],
          ["M 加 N 是理想生态复用直觉。","M+N 是理想复用直觉"],
          ["版本认证扩展语义会限制实际互通。","仍会限制实际互通"]
        ]),
        six(7, [
          ["MCP 安全治理对连接权限调用和结果分别控制。","输出连接允许、最小权限、逐次授权或拒绝"],
          ["它处理外部 Server 带来的信任和注入风险。","连外部 Server 的代价"],
          ["输入身份资源风险内容，输出允许授权或拒绝。","输入 Server 身份、所需资源、工具风险和返回内容，输出连接允许、最小权限、逐次授权或拒绝"],
          ["Host 外部校验主体参数副作用并标记来源。","Host 在模型之外校验主体、参数和副作用"],
          ["可信 Server 仍可能后来被攻陷。","可信 Server 也可能被攻陷"],
          ["协议兼容和一次批准不能替代持续审计。","不能替代持续授权与审计"]
        ])
      ]
    },
    "mcp-architecture": {
      contractVersion: 2,
      examples: [{
        section: 4,
        evidence: {
          setup: "Client 从零连接天气 Server",
          rule: "若版本不兼容，Client 应断开",
          steps: "双方先 initialize，再确认 initialized、发现工具、由 Host 审批后调用",
          interpretation: "Host 把来源标记的结果作为不可信数据"
        }
      }],
      formulas: [{
        id: "mcp-total-latency",
        section: 4,
        formulaIndex: 1,
        symbols: [
          { name: "T", meaning: "各阶段耗时以及它们构成的端到端总延迟", evidence: "总延迟由连接协商、发现、策略决策、工具执行和模型消费相加" }
        ]
      }],
      termReviews: [
        { section: 1, reviewedAt: "2026-07-27", terms: [
          { name: "MCP", meaning: "Host 与外部工具或数据能力之间的公共连接协议", purpose: "减少不同应用与提供方之间重复编写专用适配器", definitionEvidence: "MCP 是 Host 与外部能力之间的公共连接协议", purposeEvidence: "解决重复集成" }
        ]},
        { section: 2, reviewedAt: "2026-07-27", terms: [
          { name: "Host", meaning: "持有用户会话、模型选择、同意和安全策略的 AI 应用", purpose: "统一协调不同 Server 并控制跨源上下文", definitionEvidence: "Host 持有用户目标与策略", purposeEvidence: "可隔离跨源上下文" },
          { name: "Client", meaning: "由 Host 创建、只维护一个特定 Server 会话的协议端", purpose: "隔离各 Server 的能力目录和消息路由", definitionEvidence: "Client 只维护一个 Server 会话", purposeEvidence: "一对一会话表示通信边界" },
          { name: "Server", meaning: "通过 MCP 暴露聚焦工具、资源或提示的服务程序", purpose: "让能力提供方用公共协议接入 Host", definitionEvidence: "Server 只接收完成请求所需的最少参数", purposeEvidence: "外部能力之间的公共连接协议" }
        ]},
        { section: 3, reviewedAt: "2026-07-27", terms: [
          { name: "JSON-RPC", meaning: "用结构化请求、响应和通知交换远程方法消息的协议格式", purpose: "承载 MCP 数据层的方法和生命周期消息", definitionEvidence: "数据层规定 JSON-RPC 方法", purposeEvidence: "生命周期和原语" },
          { name: "stdio", meaning: "通过本地进程标准输入输出交换协议消息的传输方式", purpose: "连接由 Host 启动的本地 Server", definitionEvidence: "stdio 或 HTTP 的连接", purposeEvidence: "本地进程与远端服务" }
        ]},
        { section: 8, reviewedAt: "2026-07-27", terms: [
          { name: "幂等键", meaning: "让同一业务动作的重复请求只产生一次副作用的稳定标识", purpose: "避免响应丢失后的重试造成重复写入", definitionEvidence: "写操作先用幂等键", purposeEvidence: "工具已执行但响应丢了" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["MCP 是 Host 与外部能力之间的公共连接协议。","MCP 是 Host 与外部能力之间的公共连接协议"],
          ["它解决不同应用与工具提供方重复集成的问题。","解决重复集成"],
          ["输入应用和提供方，输出统一生命周期消息。","输入是不同 AI 应用和工具提供方，输出是统一的发现、调用、错误与生命周期消息"],
          ["共享协议把连接工作由近似乘积降为加和。","从近似 M×N 降到 M+N"],
          ["收益是连接契约统一而非模型自动会用工具。","协议只统一交换契约"],
          ["它不保证兼容授权或调用决策。","不保证 schema 永久兼容，也不决定模型是否应调用或用户是否授权"]
        ]),
        six(2, [
          ["Host Client Server 是 MCP 的三层通信责任。","输出 Host、Client、Server 三层责任"],
          ["它避免把会话连接与服务能力混成一个应用。","为什么不能都叫“应用”"],
          ["输入会话连接能力，输出三层责任与最少上下文。","输入用户会话、单个连接和服务能力，输出 Host、Client、Server 三层责任"],
          ["Host 为每个 Server 建立隔离的一对一 Client。","Client 只维护一个 Server 会话"],
          ["一对一会话表示通信边界而非信任结论。","一对一会话表示通信边界"],
          ["Server 不应默认读取完整对话。","不表示 Server 已可信或可以读取完整对话"]
        ]),
        six(3, [
          ["数据层定义消息语义，传输层负责具体连接。","输出数据层语义与传输层风险"],
          ["它解释相同 MCP 方法为何仍有不同威胁。","上层方法相同不代表风险相同"],
          ["输入消息和连接方式，输出语义与传输风险。","输入同一条协议消息和具体连接方式，输出数据层语义与传输层风险"],
          ["JSON-RPC 承载方法，stdio 或 HTTP 传输消息。","数据层规定 JSON-RPC 方法"],
          ["连接成功只表示双方能通信。","成功建立连接只证明双方能通信"],
          ["本地和远端都须另做身份权限内容判断。","都必须另做身份、权限和内容信任判断"]
        ]),
        six(4, [
          ["初始化案例追踪版本协商发现审批调用和结果返回。","完整示例：逐步追踪一次初始化与工具调用"],
          ["它说明 Client 从零连接到可检查结果的完整状态。","到获得结果共经历哪些可检查状态"],
          ["输入版本能力 schema，输出会话与天气结果。","输入 Client/Server 版本、能力和天气工具 schema，输出协商后的会话与带来源的天气结果"],
          ["先初始化协商，再发现并由 Host 审批调用。","双方先 initialize，再确认 initialized、发现工具、由 Host 审批后调用"],
          ["总延迟是五个阶段耗时之和。","总延迟由连接协商、发现、策略决策、工具执行和模型消费相加"],
          ["版本变化超时晚到会使缓存和盲重试不安全。","版本变化、超时或晚到结果会使旧缓存和盲目重试不安全"]
        ]),
        six(5, [
          ["Host 是跨 Server 协调和信任汇合点。","由 Host 协调的隔离 Client 会话"],
          ["它防止不同 Server 直接获得跨源私有数据。","避免 Server 彼此直连获得跨源数据"],
          ["输入多个 Server 和上下文，输出隔离 Client 会话。","输入多个 Server 及各自所需上下文，输出由 Host 协调的隔离 Client 会话"],
          ["Host 最小化传递信息并在本地汇合结果。","Host 只向每个 Server 传最少信息并在本地汇合结果"],
          ["图中隔离表示设计责任而非协议强制保密。","图中的隔离表示设计责任"],
          ["共享凭据或完整会话仍会造成泄漏。","协议本身不会阻止泄漏"]
        ]),
        six(6, [
          ["Tools Resources Prompts 是控制主体不同的三类原语。","输出由不同主体控制的操作"],
          ["它解决把全部 Server 内容当成同类输入的混淆。","解决把所有 Server 内容都当成同一种模型输入的混淆"],
          ["输入动作资源提示，输出相应受控操作。","输入工具动作、上下文资源或可复用提示，输出由不同主体控制的操作"],
          ["模型提工具应用选资源用户选提示，Host 最终检查。","模型提出 Tool，应用选择 Resource，用户选择 Prompt"],
          ["原语类别决定典型控制者与主要风险。","三类 Server 原语的控制主体不同"],
          ["任何原语仍可能越权过期或包含提示注入。","任何原语仍可能越权、过期或包含提示注入"]
        ]),
        six(7, [
          ["能力协商声明协议特性，授权裁决具体请求。","能力协商输入双方支持的协议特性"],
          ["它防止把 tools 声明误当成全部工具权限。","能力协商不是授权清单"],
          ["输入特性或主体资源动作，输出方法集或允许决定。","授权输入主体、资源、动作和作用域，输出某次请求是否允许"],
          ["Host 限制参数，Server 执行权威资源授权。","Server 仍做权威资源授权"],
          ["声明 tools 只表示协议支持工具。","声明 tools 只表示协议支持工具"],
          ["它不能解释为所有用户可调用所有工具。","不能解释为任意用户可以调用所有工具"]
        ]),
        six(8, [
          ["恢复机制处理超时取消重连与副作用不确定性。","输出重试、查询状态、取消或停止决定"],
          ["它避免响应丢失后盲重试造成重复写入。","工具已执行但响应丢了"],
          ["输入请求超时动作幂等副作用，输出恢复决定。","输入请求 ID、超时、动作类型、幂等键和已知副作用，输出重试、查询状态、取消或停止决定"],
          ["读可重试，写先幂等或查状态，重连重新协商。","读操作通常可重试，写操作先用幂等键或查询结果"],
          ["取消只表示 Host 不再等待。","取消只表示 Host 不再等待"],
          ["取消不能证明远端动作没有完成。","不能证明远端动作没有完成"]
        ]),
        six(9, [
          ["选型是在 MCP 直接 API 和内部函数之间分配连接责任。","输出 MCP、直接 API 或内部函数方案"],
          ["它避免为追求标准化而包装每个内部函数。","把每个函数都包装成 MCP Server 会更标准吗"],
          ["输入复用发现延迟治理风险，输出连接方案。","输入复用范围、发现需求、延迟、认证、治理成本和攻击面，输出 MCP、直接 API 或内部函数方案"],
          ["跨 Host 复用选 MCP，稳定热路径优先直接调用。","跨 Host 生态复用最适合 MCP"],
          ["MCP 表示连接契约统一而非系统自动安全。","采用 MCP 表示连接契约更统一"],
          ["业务 API、SDK 和安全治理仍不可省略。","不表示业务 API、SDK 或安全治理可以省略"]
        ])
      ]
    },
    "code-execution": {
      contractVersion: 2,
      examples: [{
        section: 9,
        evidence: {
          setup: "候选补丁",
          rule: "宿主策略门",
          steps: "应用补丁 → 运行测试",
          interpretation: "通过产物也只导出补丁"
        }
      }],
      formulas: [{
        id: "worst-case-wall-clock",
        section: 7,
        formulaIndex: 1,
        symbols: [
          { name: "T", meaning: "公式中各项墙钟时间或计算出的最坏等待上界", evidence: "用户端到端等待上界" },
          { name: "N", meaning: "首次失败后允许再次执行的最大次数", evidence: "首次失败后最多再执行的次数" }
        ]
      }],
      termReviews: [
        { section: 2, reviewedAt: "2026-07-27", terms: [
          { name: "控制平面", meaning: "创建环境、注入策略并决定产物导出的宿主组件", purpose: "让候选代码不能修改自身权限和限额", definitionEvidence: "控制平面负责创建环境、注入策略和决定导出", purposeEvidence: "候选进程不能访问控制平面的令牌或修改自身限额" },
          { name: "完成谓词", meaning: "能够从外部判断任务是否真正完成的可检查条件", purpose: "避免把进程退出码当成业务成功", definitionEvidence: "预期产物和完成谓词", purposeEvidence: "独立验收输出" }
        ]},
        { section: 4, reviewedAt: "2026-07-27", terms: [
          { name: "fork bomb", meaning: "不断创建子进程以耗尽进程或系统资源的程序", purpose: "说明仅使用临时目录不能限制计算资源滥用", definitionEvidence: "防 fork bomb", purposeEvidence: "也不能防 fork bomb" }
        ]},
        { section: 5, reviewedAt: "2026-07-27", terms: [
          { name: "venv", meaning: "主要隔离 Python 包版本的虚拟环境", purpose: "避免把依赖隔离误认为主机安全隔离", definitionEvidence: "venv 主要隔离包版本", purposeEvidence: "不限制文件、网络和系统调用" },
          { name: "微型虚拟机", meaning: "以轻量虚拟机边界运行工作负载的隔离环境", purpose: "在高风险执行中加强共享内核之外的边界", definitionEvidence: "微型虚拟机强化边界", purposeEvidence: "高风险场景可叠加" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["代码执行让解释器运行候选程序并返回可观察证据。","代码执行是让解释器运行候选程序并返回可观察证据的工具"],
          ["它解决语言生成不擅长精确计算和一致重复的问题。","它解决语言生成不擅长精确计算和一致重复的问题"],
          ["输入任务代码数据环境，输出结果日志和产物。","输入是任务、代码、数据与运行环境，输出是结果、日志和产物"],
          ["按生成执行观察修正的闭环工作。","按“生成—执行—观察—修正”工作"],
          ["结果表示这次程序在给定环境中的行为。","结果只能说明这次程序在该环境中的行为"],
          ["结果不能自动证明程序正确安全或获发布授权。","不能自动证明程序正确、安全或已获发布授权"]
        ]),
        six(2, [
          ["最小执行闭环是策略执行观察与独立验收的状态链。","代码从生成到被信任要经过哪些状态"],
          ["它防止用进程正常结束代替任务真正完成。","不以“进程成功退出”代替任务成功"],
          ["输入代码数据策略谓词，输出验收产物与审计证据。","输入是候选代码、只读数据、策略和完成谓词，输出是经独立验收的产物与审计证据"],
          ["宿主先设边界再执行观察验收。","宿主先设边界，再执行、观察、验收"],
          ["退出码零只表示进程正常结束。","退出码 0 只表示进程正常结束"],
          ["令牌可见或谓词不可检查时闭环失去边界。","这条闭环就失去边界"]
        ]),
        six(3, [
          ["威胁模型按代码能力和可达资源估计最坏影响。","威胁判断取决于代码能力和可达资源"],
          ["它解决生成者没有恶意是否就安全的误判。","解决“作者没恶意是否就安全”的误判"],
          ["输入能力资源身份解析器，输出影响与最小权限。","输入是代码可调用的能力、可达文件与网络、运行身份和下游解析器，输出是最坏可达影响与应删除的权限"],
          ["从最坏可达效果逐项检查并删除无关能力。","应从“最坏可达效果”建模"],
          ["结论用于配置防护而非预测攻击必然发生。","模型结论用于配置防护，不是在预测攻击一定发生"],
          ["未知漏洞和配置错误仍可能穿透已知边界。","未知漏洞和配置错误仍可能穿透已知边界"]
        ]),
        six(4, [
          ["沙箱是对文件网络资源身份和生命周期的联合隔离。","五类隔离策略及审计记录"],
          ["它限制不可信代码可造成的损失半径。","只开一个新进程为什么不够"],
          ["输入所需资源和风险，输出隔离策略与审计记录。","输入是任务真正需要的资源和可承受损失，输出是五类隔离策略及审计记录"],
          ["宿主分别设限后联合检查。","宿主对文件、网络、资源、身份和生命周期分别设限，再联合检查"],
          ["无越界日志只解释本次已观察行为。","日志显示未越界，只能解释本次已观察行为"],
          ["它不能证明共享内核或查看器没有未知漏洞。","不能证明共享内核或查看器不存在未知漏洞"]
        ]),
        six(5, [
          ["虚拟环境隔离依赖版本，安全沙箱限制主机能力。","venv 主要隔离包版本"],
          ["它解决复现与隔离两个目标被混为一谈的问题。","“可复现”和“隔离”也不是同一件事"],
          ["输入复现要求风险和能力，输出环境隔离组合。","输入是复现要求、攻击风险和需要开放的主机能力，输出是依赖环境、容器或微型虚拟机的组合"],
          ["按风险叠加依赖锁定容器系统调用和虚拟机。","高风险场景可叠加非特权容器"],
          ["venv 解决包冲突，沙箱解决越权和损失半径。","venv 解决包版本冲突，沙箱解决越权和损失半径"],
          ["特权挂载或过宽出网会让容器隔离失效。","特权模式、危险挂载或过宽出网会让隔离失效"]
        ]),
        six(6, [
          ["供应链检查审查依赖来源和导出产物。","依赖与结果也不可信"],
          ["它防止安全代码被恶意包或危险文件间接破坏。","安装包可能被拼写劫持或执行安装脚本"],
          ["输入依赖与文件，输出允许决定和扫描证据。","输入是依赖名称、版本、来源和待导出文件，输出是允许或拒绝决定及扫描证据"],
          ["锁版本用可信镜像并检查产物类型与大小。","通过锁版本、可信镜像、类型与大小检查"],
          ["通过表示已知扫描规则没有命中。","通过扫描只说明已知规则未命中"],
          ["未知恶意包和解析器漏洞仍需最小权限。","未知恶意包、宏和解析器漏洞仍要求最小权限与安全查看"]
        ]),
        six(7, [
          ["双层预算同时限制单轮执行和整个修正循环。","沙箱内限额约束一次执行"],
          ["它避免重试排队和大量产物让资源上界失控。","缺一层都可能造成资源失控"],
          ["输入重试单轮排队预算，输出最坏等待上界。","公式输入三个量"],
          ["一加重试次数乘单轮上限再加排队启动。","4×30+12=132 秒"],
          ["结果是配置假设下的等待上界而非实际预测。","这个上界依赖配置假设，不是实际耗时预测"],
          ["它不覆盖外部人工审批所需时间。","不覆盖外部人工审批时间"]
        ]),
        six(8, [
          ["可信结果链把意图拆成受限执行与外部验收步骤。","从意图到可信结果"],
          ["它让执行反馈提升能力而不扩大损失半径。","怎样让执行反馈提升能力而不扩大损失半径"],
          ["输入意图风险代码谓词，输出产物或证据化停止。","输入是任务意图、风险等级、候选代码和完成谓词，输出是通过验收的有限产物或带证据的停止结果"],
          ["逐步缩小动作范围并让下一步可验证。","每一步缩小动作范围并让下一步可验证"],
          ["通过只表示产物满足已声明规则。","通过沙箱验收表示产物满足已声明规则"],
          ["发布转账生产写入仍必须重新授权。","这些外部动作必须重新授权"]
        ]),
        six(9, [
          ["缓存修复案例展示候选补丁经过策略门和独立验收。","安全边界由宿主在执行前配置、执行后复核"],
          ["它解决补丁测试通过为何仍不能直接写入生产。","不能直接把补丁写进生产仓库"],
          ["输入补丁测试和限额，输出观察证据与允许产物。","只导出补丁，不携带沙箱秘密与临时文件"],
          ["只读复制后执行测试并记录资源文件差异。","应用补丁 → 运行测试"],
          ["四项测试通过只支持已声明行为与本次资源观察。","已声明隔离与命中行为通过"],
          ["它不能证明任意输入安全或不存在其他缺陷。","代码没有其他安全缺陷"]
        ]),
        six(10, [
          ["对抗评测主动尝试越界并从沙箱外观察结果。","应让测试主动尝试越界"],
          ["它验证配置声明的隔离策略是否实际生效。","怎样证明策略真的生效"],
          ["输入攻击尝试与业务反例，输出安全和任务成绩。","安全性评测问“越界是否被阻断”"],
          ["逐项攻击文件网络进程磁盘和导出路径。","读取宿主秘密诱饵"],
          ["安全通过和任务通过是两张不同成绩单。","某一张满分不能替代另一张"],
          ["已测对抗通过不能证明不存在未知逃逸。","不能证明不存在未知逃逸"]
        ])
      ]
    },
    "vector-db": {
      contractVersion: 2,
      examples: [{
        section: 7,
        evidence: {
          setup: "一百万个 768 维向量",
          rule: "必须用精确搜索作为离线基准",
          steps: "ANN top-10",
          interpretation: "只说明近似索引复现了精确向量排序"
        }
      }],
      formulas: [],
      termReviews: [
        { section: 3, reviewedAt: "2026-07-27", terms: [
          { name: "HNSW", meaning: "沿多层邻接图导航的近似近邻索引", purpose: "减少大规模搜索需要访问的向量节点", definitionEvidence: "HNSW 沿多层邻接图导航", purposeEvidence: "它们减少访问或存储" },
          { name: "IVF", meaning: "先用粗聚类桶缩小候选范围的索引", purpose: "避免对全库向量逐个比较", definitionEvidence: "IVF 先选粗聚类桶", purposeEvidence: "减少访问或存储以换取可能漏掉真近邻" },
          { name: "PQ", meaning: "用短码近似保存与比较向量的压缩方法", purpose: "降低向量载荷和距离计算成本", definitionEvidence: "PQ 用短码近似向量", purposeEvidence: "减少访问或存储以换取可能漏掉真近邻" }
        ]}
      ],
      sectionContracts: [
        six(1, [
          ["向量数据库用嵌入作为检索键并管理原文元数据权限和版本。","向量只是一种检索键"],
          ["它解决大规模相似候选访问及其原文回填问题。","存进向量后，原文和权限去哪了"],
          ["输入向量和治理字段，输出相似候选及可取回原文。","输出相似候选及可取回的原始内容"],
          ["先按向量找候选，再回原文并按当前主体鉴权。","命中后仍需回原文并按当前主体鉴权"],
          ["高相似度表示空间接近，不表示事实可信。","不表示事实可信"],
          ["缺原文映射或权限字段的向量不能直接服务回答。","不能直接服务回答"]
        ]),
        six(2, [
          ["余弦、点积和欧氏距离是不同的向量排序度量。","距离与归一化"],
          ["它说明三种距离何时产生相同邻居排序。","余弦、点积和欧氏距离何时等价"],
          ["输入向量、归一化和模型约定，输出距离排序。","输出余弦、点积或欧氏距离排序"],
          ["归一化后按方向比较，未归一化点积还受模长影响。","未归一化时向量模长会改变点积"],
          ["距离分数表示模型空间关系，不是答案正确概率。","分数不能当正确概率"],
          ["度量必须匹配嵌入模型的训练与使用方式。","度量必须与模型训练方式一致"]
        ]),
        six(3, [
          ["ANN 用索引近似寻找向量空间中的最近邻。","为什么使用近似索引"],
          ["它避免精确全库扫描随向量数量线性增长。","全库逐个比较为什么不可扩展"],
          ["输入向量库和查询，输出近似 topK 邻居。","输出近似 topK 邻居"],
          ["HNSW 导航图、IVF 选桶、PQ 压缩后搜索。","HNSW 沿多层邻接图导航"],
          ["更少访问和存储以可能漏掉真正近邻为代价。","换取可能漏掉真近邻"],
          ["小数据或必须精确的任务可直接用全量搜索。","不能为“先进”强行近似"]
        ]),
        six(4, [
          ["索引参数控制近似召回、延迟、内存和构建成本。","索引参数的三角"],
          ["它指导 HNSW 的 ef 和 IVF probes 如何取值。","怎样调 HNSW 的 ef 或 IVF 的 probes"],
          ["输入参数与查询集，输出多维权衡曲线。","输出 Recall、延迟、内存及构建成本曲线"],
          ["增加搜索广度并与精确邻居逐查询对照。","搜索更广通常提升召回同时增加资源"],
          ["选点应满足证据召回和 SLO，而非只追求 QPS。","不是最大化单一 QPS"],
          ["参数变化后必须重新运行精确基准比较。","必须和精确邻居重新对照"]
        ]),
        six(5, [
          ["过滤感知检索在允许候选域内找相似结果。","过滤检索输入查询、租户与权限条件"],
          ["它避免全局 topK 后过滤把结果全部删除。","为何可能一个结果都没有"],
          ["输入查询权限和 k，输出允许域候选并再次鉴权。","输出只在允许候选域内搜索的结果"],
          ["索引按过滤条件扩大或限制搜索，返回时权威复核。","返回原文前再次权威鉴权"],
          ["过滤改善候选覆盖，不等于已经完成授权。","不等于完成授权"],
          ["敏感原文不能只依赖索引元数据决定访问。","不能只信索引元数据"]
        ]),
        six(6, [
          ["版本与删除管理保证同一查询只比较同一嵌入空间。","更新、删除与版本"],
          ["它处理换嵌入模型后旧向量不可直接混用的问题。","换嵌入模型后旧向量还能混用吗"],
          ["输入变更删除和版本，输出重建切换或删除状态。","输出新命名空间、双写重建、原子切换或全链路删除状态"],
          ["新版本独立重建并原子切换，删除沿副本缓存传播。","不同嵌入版本属于不同几何空间"],
          ["传播未完成表示查询仍可能命中陈旧或幽灵内容。","结果必须标记陈旧或停止服务"],
          ["跨版本距离不可直接比较，删除也不能只删主索引。","分数不能混比"]
        ]),
        six(7, [
          ["规模案例比较百万向量精确扫描与 HNSW 近似搜索。","百万向量为什么需要索引"],
          ["它量化原始内存、计算量和近似索引的召回代价。","精确扫描究竟付出多少存储和比较"],
          ["输入百万向量与两组 top10，输出内存计算和索引召回。","输出约 3.07GB 原始载荷、768M 维度乘加和索引 Recall10"],
          ["把 ANN top10 与精确 top10 求交并除以十。","ANN 命中精确集合 9 条得到 90%"],
          ["百分之九十只衡量索引复现精确向量排序。","只说明近似索引复现精确向量排序"],
          ["嵌入本身漏掉正确证据时高索引召回无法修复。","索引 Recall 再高也无用"]
        ]),
        six(8, [
          ["一致性链路让过滤更新撤权删除和版本穿过所有副本。","过滤、版本与删除怎样穿过全链路"],
          ["它解释低权限占比时全局 topK 后过滤为何失败。","为什么几乎注定失败"],
          ["输入过滤率和事件，输出候选及可审计传播状态。","输出过滤感知候选和可审计传播状态"],
          ["过滤感知搜索候选，生命周期事件按状态机传播。","全局 top10 期望仅 0.1 条属于该租户"],
          ["期望零点一是容量直觉，不是单次查询结果保证。","不是单次查询保证"],
          ["返回边界仍需按当前主体资源动作重新鉴权。","必须按当前主体、资源和动作鉴权"]
        ])
      ]
    },
  };

  Object.entries(contracts).forEach(([id, quality]) => {
    if (!window.DEEPDIVE[id]) throw new Error(`教学合同引用了不存在的页面：${id}`);
    window.DEEPDIVE[id].quality = quality;
  });
})();
