"""Persist editorial follow-ups actually examined during the 2026 round."""
import json,pathlib,re,unicodedata
ROOT=pathlib.Path(__file__).resolve().parents[2];OUT=ROOT/'proposals/academic-importance/arxiv-2026-20260923'
def read(name):return json.loads((OUT/name).read_text(encoding='utf-8'))
def write(name,d):(OUT/name).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def norm(s):return ''.join(sorted(re.findall('[a-z]+',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower())))
topics={
'2601.01685':'多智能体串谋和信念操纵评测；独立引用不等同于重大贡献评价。',
'2601.03190':'局部遗忘与安全、效用关系；仍需明确外部评价说明其重大性。',
'2601.09361':'语言模型中的地理知识结构；作者实验和获奖身份不能单独证明重大性。',
'2601.09373':'语言模型体貌推理；后续研究质疑基准标签和结论范围，需复核。',
'2601.22027':'对话式推荐评测；需补独立专业评价说明其改变了何种重要研究方法。',
'2602.15173':'推理与对话模型的风险选择差异；独立重大性依据尚未齐备。',
'2602.21978':'跨模态模型研究；获奖名单之外尚缺明确重大贡献定位。',
'2604.04932':'细粒度生成文本检测；任务成绩和作者自述不能替代独立重大性证据。',
'2604.12148':'视觉与语言研究；本轮确认获奖线索，重大贡献依据仍待补。',
'2605.00768':'局部注意力的表达能力；官方评语确认严谨理论和实践联系，但未明确确认本政策要求的重要路线实质改变。',
'2607.06540':'全双工语音模型的声学、语义建模；作者姓名存在拼写差异，身份需补交叉链接。',
'2601.17181':'人类语言形式与意义的系统性；对 AI 发展的直接贡献范围及重大性都需外部依据。',
'2601.10925':'多语言联合分词与语素释义；作者报告的任务改进不足以证明重大贡献。',
'2604.15647':'对话信息增益和主张记忆评估；AI 发展贡献范围及重大性仍需外部依据。'}
rows=[]
for r in read('acl-anthology-award-leads.json')['records']:
 for m in r['arxivMatches']:
  aid=m['arxivId']
  if aid not in topics:continue
  authors=[' '.join(a[:2]) if isinstance(a,list) else a for a in m['authors']]
  identity=sorted(map(norm,authors))==sorted(map(norm,r['authors']))
  rows.append({'arxivId':aid,'title':m['title'],'checkedAt':'2026-09-23','disposition':'needs-evidence','reasonCode':'MAJOR_AI_CONTRIBUTION_EVIDENCE_INSUFFICIENT' if identity else 'IDENTITY_AND_MAJOR_AI_EVIDENCE_PENDING','reviewDepth':'article-specific-abstract-and-external-evidence-check','relevance':'needs-scope-evidence' if aid in ['2601.17181','2604.15647'] else 'passed','mechanismId':'acl-2026-best' if r['award']=='Best Paper' else 'acl-2026-outstanding','officialAward':r['award'],'externalDiscoveryUrl':r['url'],'identity':{'titleMatches':True,'normalizedAuthorSetMatches':identity,'limits':'Metadata correspondence; no automatic equivalence claim for different arXiv IDs.'},'aiDevelopmentContribution':{'status':'needs-evidence','reason':topics[aid]},'stepsNotCompleted':[6],'nextAction':'补独立专业评价的具体贡献定位；身份有差异则先补官方交叉链接。不能以获奖名称或引用次数代替。'})
for r in rows:
 if r['arxivId']=='2601.09373':
  r.update(disposition='recheck',reasonCode='UNRESOLVED_BENCHMARK_AND_CONCLUSION_CHALLENGE')
  r['aiDevelopmentContribution']['status']='recheck'
  r['conflict']={'url':'https://arxiv.org/abs/2608.25005','fullTextUrl':'https://arxiv.org/html/2608.25005v1','locator':'Abstract and sections 3–4','authors':['Kaiqiao Han','Yizhou Sun'],'relationship':'No author overlap with Bolei Ma and Yusuke Miyao; other relationships not established.','meaning':'Independent response challenges aspectual reduction, benchmark ambiguity and NLI labels. This signals a substantive unresolved dispute; it does not prove the original paper false or the award revoked.'}
  r['nextAction']='核对批评、原始数据和原作者回应后复核；本轮暂停采用。'
 if r['arxivId']=='2605.00768':
  r['externalAssessment']={'url':r['externalDiscoveryUrl'],'locator':'Award / Best Paper paragraph','meaning':'Committee recognizes rigorous explanation of complementary local/global attention expressivity and theory–practice connection. Does not by itself establish the stronger editorial major-development threshold.','relationship':'Official award committee assessment.'}
  r['excludedEvidence']=[{'url':'https://arxiv.org/html/2607.26988v1','reason':'Shares Ryan Cotterell with original paper; not independent follow-up evidence.'}]
for aid,title,mechanism,paper in [('2604.04539','FlashSAC','rss-2026-outstanding','99'),('2605.09999','Muninn','rss-2026-student','160'),('2607.11734','NeuralActuator','rss-2026-systems','159')]:
 rows.append({'arxivId':aid,'title':title,'checkedAt':'2026-09-23','disposition':'needs-evidence','reasonCode':'MAJOR_AI_CONTRIBUTION_EVIDENCE_INSUFFICIENT','reviewDepth':'article-specific-abstract-and-external-evidence-check','relevance':'passed','mechanismId':mechanism,'externalDiscoveryUrl':'https://roboticsconference.org/2026/program/awards/','paperIdentityUrl':'https://roboticsconference.org/2026/program/papers/'+paper+'/','aiDevelopmentContribution':{'status':'needs-evidence','reason':'官方获奖名单及原始论文摘要已核；暂无本轮可采信的具体重大 AI 贡献外部定位，作者速度或性能声明不单独通过。'},'stepsNotCompleted':[6],'nextAction':'补奖项委员会贡献评语或独立专业回顾中的明确定位。'})
write('article-evidence-updates.json',{'policyVersion':'1.2','note':'Supersedes earlier missing-mechanism notes for ACL/RSS. Partial article-specific checks are not all-six-step completion. No exclusion for academic quality.','records':rows})
d=read('acl-2026-mechanism-verification.json');d['limitations']='官方总名单未提供逐篇重大贡献评语；ACL Anthology 的部分 Best Paper 条目另有正式评语，需逐篇判断支持范围。未公开的分数及完整委员会不补造。特殊赛道不继承主会 Best/Outstanding 资格。';write('acl-2026-mechanism-verification.json',d)
print(json.dumps({'articleSpecificFollowups':len(rows),'recheck':sum(r['disposition']=='recheck' for r in rows)}))
