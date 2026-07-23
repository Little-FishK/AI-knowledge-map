window.DEEPDIVE = window.DEEPDIVE || {};
window.DEEPDIVE["loss-function"] = {
  title: "损失函数：把‘哪里错了’变成可学习的方向",
  subtitle: "从业务代价到可微代理，从单样本误差到经验风险；用同一个数值例子看见损失、梯度和参数更新怎样接成闭环。",
  thesis: "损失函数不是模型成绩的另一个名字，而是训练系统选择的<b>可优化代理目标</b>：它把预测错误压成标量，局部斜率再告诉参数怎样改变。模型会忠实追逐这个数，因此损失的形状、权重与遗漏共同定义了它学会在乎什么。",
  html: `
<div class="dd-goals">
  <div class="dd-goals-h">读完这一页，你应该能自己回答：</div>
  <ul><li>为什么训练需要标量损失，而不能只说“答案不好”？</li><li>MSE、MAE、Huber 与交叉熵分别隐含怎样的误差假设？</li><li>为什么准确率、用户满意度等真实目标通常不能直接反向传播？</li><li>怎样从一个样本手算损失、梯度和一次参数更新？</li><li>为什么训练损失下降仍可能让产品变差，应该怎样发现？</li></ul>
</div>
<div class="dd-note key"><b>贯穿示例</b>　我们用最小回归模型 <code>ŷ=wx</code> 学习关系 <code>y=3x</code>。取一个样本 <code>x=2, y=6</code>，初始 <code>w=2</code>，于是预测 <code>ŷ=4</code>。这一处“差 2”会贯穿损失、梯度下降和反向传播三页。</div>

<section class="dd-sec"><h2><span class="dd-n">1</span>为什么“错了”必须先变成一个数<span class="dd-badge intuition">直觉</span></h2>
<p class="dd-lead">模型有成千上万个参数，一句“这次答得不好”怎样决定每个参数往哪边动？</p>
<p>训练需要一个能比较的目标。损失函数 <code>L(ŷ,y)</code> 接收预测与目标，输出一个标量：越小通常表示在我们写下的规则里越好。标量的导数把“结果好坏”连接到参数变化；没有它，优化器既不知道两个版本谁更好，也不知道一次微小修改的影响。</p>
<p>但压成一个数也会丢信息。把漏诊和误报都记作“错一次”，等于宣布它们代价相同；把长答案按 token 平均，等于选择一种长度权重。损失不是中立温度计，它是一份写进训练循环的价值取舍。</p>
<div class="dd-note warn"><b>你可能会困惑：损失越低，模型不是当然越好吗？</b>　只在“同一数据、同一损失定义、同一归一化”下，数值才可直接比较。换了样本权重、掩码或正则项，0.2 和 0.3 可能根本不是同一把尺。</div></section>

<section class="dd-sec"><h2><span class="dd-n">2</span>单个错误怎样变成训练目标<span class="dd-badge math">数学</span></h2>
<p class="dd-lead">一个样本有损失，整个训练集又应该优化什么？</p>
<div class="dd-formula">J(θ)= 1/n · Σᵢ L(f<sub>θ</sub>(xᵢ),yᵢ) + λR(θ)</div>
<p>前半是训练样本上的平均损失，叫经验风险；<code>R(θ)</code> 是可选的正则项，用来惩罚过大的权重或其他不希望出现的复杂性。训练真正执行的是让 <code>J(θ)</code> 下降，而我们真正关心的是未来未知样本上的期望风险。有限训练集与未知总体之间的差距，就是泛化问题。</p>
<table class="dd-table"><thead><tr><th>层次</th><th>回答的问题</th><th>常见误读</th></tr></thead><tbody><tr><td>单样本损失</td><td>这一次预测按当前规则错多少？</td><td>把一个异常样本当总体表现</td></tr><tr><td>批量损失</td><td>这批样本给出的梯度估计是什么？</td><td>把批次抖动当训练崩溃</td></tr><tr><td>训练经验风险</td><td>模型多贴合已见数据？</td><td>等同未来表现</td></tr><tr><td>验证/产品指标</td><td>未见数据和真实场景是否变好？</td><td>拿来直接求梯度</td></tr></tbody></table></section>

<section class="dd-sec"><h2><span class="dd-n">3</span>回归损失为什么有不同形状<span class="dd-badge math">数学</span></h2>
<p class="dd-lead">同样是“预测减真实值”，为什么平方、绝对值和 Huber 会学出不同模型？</p>
<figure class="dd-fig"><svg viewBox="0 0 660 250" role="img" aria-label="MSE、MAE 和 Huber 损失随误差变化的示意图"><line x1="55" y1="205" x2="625" y2="205" stroke="currentColor" opacity=".35"/><line x1="330" y1="28" x2="330" y2="220" stroke="currentColor" opacity=".35"/><path d="M80 45 Q205 205 330 205 Q455 205 580 45" fill="none" stroke="#8b5cf6" stroke-width="4"/><path d="M80 70 L330 205 L580 70" fill="none" stroke="#0ea5e9" stroke-width="4"/><path d="M80 75 L240 165 Q330 215 420 165 L580 75" fill="none" stroke="#10b981" stroke-width="4"/><text x="500" y="38" class="svg-t">MSE：远处增长快</text><text x="500" y="92" class="svg-t">MAE：恒定斜率</text><text x="500" y="132" class="svg-t">Huber：近处平方、远处线性</text><text x="615" y="225" class="svg-tn">误差 e</text><text x="340" y="24" class="svg-tn">损失</text></svg><figcaption>损失曲线的形状决定不同误差能产生多大的梯度；这不是只换一个评分公式。</figcaption></figure>
<table class="dd-table"><thead><tr><th>损失</th><th>形式</th><th>隐含偏好</th><th>主要风险</th></tr></thead><tbody><tr><td>MSE</td><td><code>e²</code></td><td>大误差应被更强纠正；固定方差高斯噪声下对应最大似然</td><td>离群值可支配梯度</td></tr><tr><td>MAE</td><td><code>|e|</code></td><td>误差大小线性计价；对应条件中位数</td><td>零点不可导、优化信号不如平方平滑</td></tr><tr><td>Huber</td><td>小误差平方，大误差线性</td><td>保留近处平滑，同时限制异常点影响</td><td>转折阈值需要按尺度选择</td></tr></tbody></table></section>

<section class="dd-sec"><h2><span class="dd-n">4</span>交叉熵为什么适合概率分类<span class="dd-badge math">数学</span></h2>
<p class="dd-lead">分类模型输出一组概率时，为什么只看“猜没猜中”还不够？</p>
<div class="dd-formula">L<sub>CE</sub>=−log p<sub>θ</sub>(y|x)</div>
<p>如果真实类别概率是 0.9，损失约为 0.105；若只有 0.01，损失约为 4.605。两次都可能在 0–1 准确率里只记一次对或错，但交叉熵能区分“差一点”和“自信地错”。它也等价于最大化训练数据在模型下的似然。</p>
<p>语言模型在每个位置预测真实下一个 token，同样使用交叉熵。平均交叉熵的指数是困惑度；它描述预测分布贴合文本的程度，不直接保证事实正确、遵循指令或没有伤害。</p>
<div class="dd-note math"><b>数值实现提醒</b>　实践通常把 softmax 与交叉熵合并成基于 logits 的稳定运算，避免先算极小概率再取对数造成下溢。</div></section>

<section class="dd-sec"><h2><span class="dd-n">5</span>为什么真实指标常常只能做代理的裁判<span class="dd-badge intuition">消歧</span></h2>
<p class="dd-lead">最终关心准确率、成交率或满意度，为什么不直接让优化器最大化它？</p>
<p>准确率随参数小幅变化时往往完全不动，跨过分类边界才突然跳变，因此几乎处处没有有用梯度。成交和满意度还可能延迟、稀疏并受模型之外因素影响。可微代理提供密集、连续的局部信号；真实指标则在验证阶段判断代理是否仍与目标一致。</p>
<table class="dd-table"><thead><tr><th>角色</th><th>需要的性质</th><th>例子</th></tr></thead><tbody><tr><td>训练损失</td><td>可微、频繁、数值稳定</td><td>交叉熵、MSE、排序代理</td></tr><tr><td>离线指标</td><td>可解释、贴近任务</td><td>F1、召回率、校准误差</td></tr><tr><td>产品目标</td><td>反映真实收益与伤害</td><td>成功率、人工接管、事故率</td></tr><tr><td>发布门槛</td><td>不能被平均值掩盖</td><td>关键切片最低召回、安全红线</td></tr></tbody></table></section>

<section class="dd-sec"><h2><span class="dd-n">6</span>权重、掩码和正则项怎样改写“模型在乎什么”<span class="dd-badge eng">工程</span></h2>
<p class="dd-lead">类别不平衡、不同 token 或高代价错误怎样进入同一个标量？</p>
<p>样本权重会放大某些案例的梯度；类别权重能让少数类不被多数类淹没；掩码决定哪些位置根本不计入目标；正则项把“参数不要太复杂”加入目标。Focal loss 进一步降低易样本贡献，让训练聚焦难例。</p>
<p>这些选择也会改变概率校准和有效训练分布。提高少数类召回可能增加误报；权重后的概率未必仍等于自然分布下的发生率。必须在未重加权的验证分布以及关键业务切片上重新测量。</p></section>

<section class="dd-sec"><h2><span class="dd-n">7</span>完整手算：一个误差怎样推动参数<span class="dd-badge math">数值例子</span></h2>
<p class="dd-lead">现在把“损失提供训练信号”落实成一串可以逐项核对的数字。</p>
<p>模型 <code>ŷ=wx</code>，样本 <code>x=2,y=6</code>，初始 <code>w=2</code>。为让导数整洁，取半平方损失 <code>L=½(ŷ−y)²</code>。</p>
<table class="dd-table"><thead><tr><th>步骤</th><th>计算</th><th>结果</th></tr></thead><tbody><tr><td>前向预测</td><td><code>ŷ=2×2</code></td><td>4</td></tr><tr><td>误差</td><td><code>e=4−6</code></td><td>−2</td></tr><tr><td>损失</td><td><code>L=½×(−2)²</code></td><td>2</td></tr><tr><td>对预测的斜率</td><td><code>∂L/∂ŷ=e</code></td><td>−2</td></tr><tr><td>对参数的梯度</td><td><code>∂L/∂w=e·x</code></td><td>−4</td></tr><tr><td>学习率 0.1 更新</td><td><code>w←2−0.1×(−4)</code></td><td>2.4</td></tr><tr><td>更新后损失</td><td><code>½(2.4×2−6)²</code></td><td>0.72</td></tr></tbody></table>
<div class="dd-note key"><b>观察闭环</b>　损失从 2 降到 0.72，不是因为模型“理解了 3 倍关系”，而是损失的局部斜率经链式法则到达 <code>w</code>，优化器再沿反方向走了一步。下一页会专门解释为什么这样走。</div></section>

<section class="dd-sec"><h2><span class="dd-n">8</span>损失曲线会怎样欺骗你<span class="dd-badge eng">失败模式</span></h2>
<p class="dd-lead">如果训练曲线一路下降，还有哪些严重问题完全看不出来？</p>
<table class="dd-table"><thead><tr><th>现象</th><th>隐藏问题</th><th>补充检查</th></tr></thead><tbody><tr><td>平均损失下降</td><td>少数群体或长尾任务恶化</td><td>按群体、难度和场景切片</td></tr><tr><td>训练损失很低</td><td>记住训练集，验证集变差</td><td>独立验证与时间外测试</td></tr><tr><td>代理指标变好</td><td>真实目标错位或被钻空子</td><td>人工评审、线上守护指标</td></tr><tr><td>不同实验数字更小</td><td>归一化或权重定义不同</td><td>锁定口径并报告分项</td></tr><tr><td>总损失正常</td><td>某个子损失已塌缩</td><td>记录每个目标与梯度贡献</td></tr></tbody></table></section>

<section class="dd-sec"><h2><span class="dd-n">9</span>怎样为一个任务选择并验证损失<span class="dd-badge eng">工程</span></h2>
<p class="dd-lead">面对新任务，选择损失应该从公式列表开始，还是从错误代价开始？</p>
<ol class="dd-steps"><li><b>先写真实决策：</b>模型输出会触发什么动作，哪类错误伤害最大。</li><li><b>定义输出语义：</b>是数值、概率、排序、序列还是多目标组合。</li><li><b>选择可微代理：</b>写清噪声假设、权重、掩码和归一化。</li><li><b>做微型手算：</b>检查正确方向、极端输入和零梯度区域。</li><li><b>做基线实验：</b>确认小数据上能过拟合，训练信号确实连通。</li><li><b>独立验证：</b>同时报告代理损失、任务指标、校准和关键切片。</li><li><b>监控错位：</b>上线后观察真实收益、伤害与分布漂移，不让训练目标替代产品目标。</li></ol></section>

<section class="dd-sec"><h2><span class="dd-n">10</span>把整条因果链连起来<span class="dd-badge intuition">综合</span></h2>
<p class="dd-lead">从真实问题到一次参数更新，中间每一环为什么都不可省？</p>
<ol class="dd-chain"><li>真实任务包含不同类型和代价的错误。</li><li>损失函数把选定的错误代价编码成可比较标量。</li><li>有限数据上的平均形成可计算的经验风险。</li><li>可微代理为预测和参数提供局部斜率。</li><li>反向传播把斜率高效分配给全部参数。</li><li>优化器用梯度更新参数，使训练代理下降。</li><li>验证集、切片和产品指标检查代理是否仍服务真实目标。</li><li>发现错位就改数据、损失、权重或决策流程，而不是继续盲目压低同一个数。</li></ol></section>

<section class="dd-sec"><h2><span class="dd-n">11</span>常见误解<span class="dd-badge intuition">消歧</span></h2>
<table class="dd-table"><thead><tr><th>误解</th><th>更准确的说法</th></tr></thead><tbody><tr><td>损失就是评价指标</td><td>损失服务求导；指标服务判断，两者应相关但职责不同。</td></tr><tr><td>损失为零说明模型完美</td><td>只说明在当前数据和定义下代理为零，可能仍有泄漏、过拟合或目标遗漏。</td></tr><tr><td>MSE 永远比 MAE 平滑所以更好</td><td>MSE 的强梯度也会让离群值支配训练；选择取决于噪声和代价。</td></tr><tr><td>类别加权只影响训练速度</td><td>它改变最优解和概率语义，必须重新校准与评估。</td></tr><tr><td>多目标损失直接相加即可</td><td>尺度不同会让某一项支配梯度，需要归一化、权重和冲突诊断。</td></tr></tbody></table></section>

<section class="dd-sec"><h2><span class="dd-n">12</span>检查你是否真的理解<span class="dd-badge intuition">自测</span></h2>
<ol class="dd-quiz"><li>为什么损失必须是标量，但标量化又会带来风险？</li><li>在贯穿示例中，把学习率从 0.1 改成 1，更新后的 <code>w</code> 和损失是多少？这说明什么？</li><li>为什么交叉熵能区分“犹豫地错”和“自信地错”，准确率不能？</li><li>类别权重提高后，为什么还要在自然分布上检查校准？</li><li>训练损失与验证损失都下降，是否已经证明产品目标改善？还缺什么证据？</li></ol>
<details class="dd-answers"><summary>参考答案</summary><ol><li>标量才能统一比较并求梯度；但压缩会隐含错误权重并丢掉群体、场景等结构。</li><li>梯度为 −4，所以 <code>w=6</code>；新预测 12，损失 18，反而更差，说明局部方向正确不代表任意步长都安全。</li><li>交叉熵连续使用真实类别概率，置信度越错惩罚越大；准确率只在决策边界两侧取 0/1。</li><li>重加权改变了训练分布和最优概率，输出未必仍代表真实发生率。</li><li>还需关键切片、校准、人工或线上任务结果、安全与伤害指标；代理和离线数据可能同时错位。</li></ol></details></section>

<section class="dd-sec"><h2><span class="dd-n">13</span>概念依赖与延伸学习<span class="dd-badge eng">路线</span></h2>
<table class="dd-table"><thead><tr><th>方向</th><th>接下来读</th><th>要带走的问题</th></tr></thead><tbody><tr><td>梯度怎样变成一步更新</td><td><a href="#" data-node="gradient-descent">梯度下降</a></td><td>方向正确时，步长为什么仍会失败？</td></tr><tr><td>全部参数梯度怎样算</td><td><a href="#" data-node="backprop">反向传播</a></td><td>链式法则如何复用中间结果？</td></tr><tr><td>怎样限制记忆训练集</td><td><a href="#" data-node="regularization">正则化</a>、<a href="#" data-node="overfitting">过拟合</a></td><td>训练代理与未知风险为什么分离？</td></tr><tr><td>代理目标被钻空子</td><td><a href="#" data-node="reward-hacking">奖励黑客</a></td><td>指标成为目标后会怎样失真？</td></tr><tr><td>最终怎样判断模型</td><td><a href="#" data-node="model-evaluation">模型评测</a></td><td>哪些切片与门槛不能被平均值替代？</td></tr></tbody></table>
<div class="dd-note key"><b>过关标准</b>　你不仅能写出 MSE 或交叉熵，还能从真实错误代价一路解释到代理、梯度、验证与上线守护指标，并指出这条链在哪些地方可能错位。</div></section>

<div class="dd-src"><b>资料来源与改编说明</b><ul><li><a href="https://www.deeplearningbook.org/contents/ml.html" target="_blank" rel="noopener">Deep Learning — Machine Learning Basics</a>：最大似然、经验风险与泛化。</li><li><a href="https://www.deeplearningbook.org/contents/optimization.html" target="_blank" rel="noopener">Deep Learning — Optimization for Training Deep Models</a>：代理损失与优化。</li><li><a href="https://developers.google.com/machine-learning/crash-course/linear-regression/loss" target="_blank" rel="noopener">Google ML Crash Course — Loss</a>：回归损失的教学参考。</li><li><a href="https://arxiv.org/abs/1708.02002" target="_blank" rel="noopener">Focal Loss for Dense Object Detection</a>：类别不平衡与损失重加权。</li></ul><p>正文、图示和数值演算均为本项目原创组织；来源用于核对定义、假设和边界。</p><div class="dd-src-date">访问日期：2026-07-22</div></div>`
};
