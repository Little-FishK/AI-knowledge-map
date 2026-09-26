"""Apply the user-confirmed necessary-evidence short circuit to the 2024 pool."""
import collections,hashlib,json,pathlib,re,sqlite3,unicodedata
from arxiv_2026_rules import ROOT
HOME=ROOT/'.local/arxiv-2024-review';OUT=ROOT/'proposals/academic-importance/arxiv-2024-20260923';OUT.mkdir(parents=True,exist_ok=True);BASE=ROOT/'proposals/academic-importance'
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def write(n,d):(OUT/n).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def key(s):return re.sub('[^a-z0-9]','',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower())
base=read(HOME/'base-report.json');assert base['complete'];db=sqlite3.connect(HOME/'global-v3.sqlite')
reviews=read(BASE/'arxiv-100-20260923/reviews.json')['records'];reviewed={r['arxivId']:r for r in reviews if str(r.get('arxivId','')).startswith('24')}
completed=read(OUT/'neurips-2024-completed-reviews.json')['records'];eligible={r['arxivId']:r for r in completed};assert set(eligible)=={'2404.02905','2406.02507'}
census=read(BASE/'candidate-census-baseline-20260923.json');external={r['arxivId']:{**r,'sourceUrl':'registered mechanism evidence URL'} for r in census['formalCandidates'] if str(r['arxivId']).startswith('24')}
# Newly enumerated official 2024 award titles are discovery leads. They remain
# needs-evidence until the year-specific mechanism and major-AI gate are complete.
official_titles=[
 ('Visual Autoregressive Modeling: Scalable Image Generation via Next-Scale Prediction','https://blog.neurips.cc/2024/12/10/announcing-the-neurips-2024-best-paper-awards/','NeurIPS 2024 Best Paper'),
 ('Stochastic Taylor Derivative Estimator: Efficient amortization for arbitrary differential operators','https://blog.neurips.cc/2024/12/10/announcing-the-neurips-2024-best-paper-awards/','NeurIPS 2024 Best Paper'),
 ('Guiding a Diffusion Model with a Bad Version of Itself','https://blog.neurips.cc/2024/12/10/announcing-the-neurips-2024-best-paper-awards/','NeurIPS 2024 Best Paper'),
 ('The PRISM Alignment Dataset: What Participatory, Representative and Individualised Human Feedback Reveals About the Subjective and Multicultural Alignment of Large Language Models','https://blog.neurips.cc/2024/12/10/announcing-the-neurips-2024-best-paper-awards/','NeurIPS 2024 Best Paper, Datasets & Benchmarks'),
 ('Generalization in diffusion models arises from geometry-adaptive harmonic representations','https://blog.iclr.cc/2024/05/06/iclr-2024-outstanding-paper-awards/','ICLR 2024 Outstanding Paper'),
 ('Learning Interactive Real-World Simulators','https://blog.iclr.cc/2024/05/06/iclr-2024-outstanding-paper-awards/','ICLR 2024 Outstanding Paper'),
 ('Never Train from Scratch: Fair Comparison of Long-Sequence Models Requires Data-Driven Priors','https://blog.iclr.cc/2024/05/06/iclr-2024-outstanding-paper-awards/','ICLR 2024 Outstanding Paper'),
 ('Protein Discovery with Discrete Walk-Jump Sampling','https://blog.iclr.cc/2024/05/06/iclr-2024-outstanding-paper-awards/','ICLR 2024 Outstanding Paper'),
 ('Vision Transformers Need Registers','https://blog.iclr.cc/2024/05/06/iclr-2024-outstanding-paper-awards/','ICLR 2024 Outstanding Paper'),
 ('VideoPoet: A Large Language Model for Zero-Shot Video Generation','https://icml.cc/virtual/2024/awards_detail','ICML 2024 Best Paper')]
title_index=collections.defaultdict(list)
for aid,raw in db.execute('SELECT id,metadata FROM papers'):
 m=json.loads(raw);title_index[key(m['title'])].append(aid)
unresolved=[]
for title,url,award in official_titles:
 matches=title_index[key(title)]
 if not matches:unresolved.append({'title':title,'sourceUrl':url,'award':award,'status':'not-in-2024-candidate-title-index; may be a different first-submission year or unmatched title'})
 for aid in matches:external.setdefault(aid,{'arxivId':aid,'title':title,'mechanismId':'year-specific-mechanism-pending','reviewDisposition':'needs-evidence','sourceUrl':url,'award':award})
for aid in eligible:external[aid]['mechanismId']='neurips-2024-best';external[aid]['reviewDisposition']='include-new'
for aid,r in external.items():
 row=db.execute('SELECT routes FROM papers WHERE id=?',(aid,)).fetchone();assert row,aid;routes=json.loads(row[0]);routes['externalSources']=[{'mechanismId':r['mechanismId'],'sourceUrl':r.get('sourceUrl'),'award':r.get('award'),'reviewDisposition':r['reviewDisposition']}];db.execute('UPDATE papers SET routes=? WHERE id=?',(json.dumps(routes),aid))
db.commit();rx=re.compile(r'(?:best|outstanding|distinguished|test[ -]of[ -]time|classic)\s+(?:student\s+)?paper(?:\s+award)?|(?:paper|research)\s+award',re.I)
claims=[];counts=collections.Counter();depths=collections.Counter();routes_count=collections.Counter();months=collections.Counter();ids=set()
with (OUT/'review-results-v3.jsonl').open('w',encoding='utf-8') as f:
 for aid,raw,rr in db.execute('SELECT id,metadata,routes FROM papers ORDER BY id'):
  m=json.loads(raw);routes=json.loads(rr);assert '2024-01-01'<=m['published']<'2025-01-01' and aid not in ids;ids.add(aid)
  pieces=[{'field':k,'text':m[k]} for k in ('comments','journal','title','abstract') if m.get(k) and rx.search(m[k])]
  if pieces:claims.append({'arxivId':aid,'title':m['title'],'claims':pieces,'status':'unverified-claim-or-mention'})
  if aid in eligible:status='include-new';reason='ALL_SIX_PASSED';depth='six-steps';evidence='selected-v3.json#'+aid;relevance='passed'
  elif aid in reviewed and (reviewed[aid].get('importanceStatus')=='needs-evidence'):status='needs-evidence';reason='ARTICLE_SPECIFIC_MAJOR_AI_EVIDENCE_INSUFFICIENT';depth='article-specific-evidence-check';evidence='article-evidence-records-v3.json#'+aid;relevance=reviewed[aid].get('relevance',{}).get('status','not-semantically-reviewed')
  elif aid in external:status='needs-evidence';reason='FORMAL_CANDIDATE_PREREQUISITES_UNRESOLVED';depth='official-list-and-metadata-match';evidence='external-leads-v3.json#'+aid;relevance='not-semantically-reviewed'
  elif pieces:status='needs-evidence';reason='UNVERIFIED_AWARD_CLAIM_OR_MENTION';depth='automated-evidence-lookup';evidence='metadata-award-leads-v3.json#'+aid;relevance='not-semantically-reviewed'
  else:status='deferred';reason='NO_ADMISSIBLE_EVIDENCE_IN_THIS_ROUND_INDEX';depth='automated-evidence-lookup';evidence=None;relevance='not-semantically-reviewed'
  rec={'arxivId':aid,'title':m['title'],'published':m['published'],'url':m['url'],'routes':routes,'disposition':status,'reasonCode':reason,'reviewDepth':depth,'relevance':relevance,'evidenceRef':evidence,'allSixStepsCompleted':aid in eligible,'keptInCandidatePool':True,'checkedAt':'2026-09-23'}
  f.write(json.dumps(rec,ensure_ascii=False,separators=(',',':'))+'\n');counts[status]+=1;depths[depth]+=1;months[m['published'][:7]]+=1
  if routes['categoryMatches']:routes_count['categories']+=1
  if routes['keywordQueryIds']:routes_count['keywords']+=1
  if routes['externalSources']:routes_count['external']+=1
write('selected-v3.json',{'status':'eligible-for-library-inclusion','websitePublished':False,'records':list(eligible.values())})
write('article-evidence-records-v3.json',{'note':'Existing article-specific reviews; none completed all six steps under the current major-AI gate.','records':list(reviewed.values())})
write('external-leads-v3.json',{'scope':'Registered formal candidates plus newly enumerated official ICLR/NeurIPS/ICML 2024 award titles. New mechanisms are leads, not automatic passes.','records':list(external.values()),'unresolvedOrDifferentYear':unresolved})
write('metadata-award-leads-v3.json',{'note':'Automated phrase detection only; no automatic recipient or importance inference.','records':claims})
summary={'version':'v3','importancePolicyVersion':'1.2','dateRange':'First submission >=2024-01-01 and <2025-01-01 UTC','roundStatus':'bounded-enumeration-and-necessary-evidence-dispositions-complete','allArxiv2024FirstSubmissions':base['all2024FirstSubmissions'],'candidateCount':len(ids),'routesOverlapping':dict(routes_count),'dispositions':dict(counts),'actualReviewDepths':dict(depths),'allSixStepsCompleted':len(eligible),'articleSpecificEvidenceRecords':len(reviewed)+len(eligible),'officialTitleLeadsUnresolvedOrDifferentYear':len(unresolved),'metadataAwardMentions':len(claims),'byFirstSubmissionMonth':dict(months),'websitePublished':False,'limits':['Deferred is not rejection.','The external mechanism set remains bounded; newly found 2024 award titles without sufficient major-AI evidence are retained as leads rather than auto-approved.','The whole pool was not semantically or full-text reviewed.']}
write('summary-v3.json',summary);write('validation-v3.json',{'uniqueIds':len(ids),'dispositionSumMatches':sum(counts.values())==len(ids),'allDatesInRange':True,'allSixStepIds':sorted(eligible),'allSixStepsVerified':all(len(r['steps'])==6 and all(s['status']=='passed' for s in r['steps']) for r in eligible.values()),'resultSha256':hashlib.sha256((OUT/'review-results-v3.jsonl').read_bytes()).hexdigest(),'snapshotComplete':base['complete']});print(json.dumps(summary,ensure_ascii=False,indent=2))
