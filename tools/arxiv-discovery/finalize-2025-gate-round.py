"""Apply the user-confirmed necessary-evidence short circuit to the 2025 pool."""
import collections,hashlib,json,pathlib,re,sqlite3
from arxiv_2026_rules import ROOT

HOME=ROOT/'.local/arxiv-2025-review';OUT=ROOT/'proposals/academic-importance/arxiv-2025-20260923';OUT.mkdir(parents=True,exist_ok=True)
BASE=ROOT/'proposals/academic-importance'
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def write(name,d):(OUT/name).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

base=read(HOME/'base-report.json');assert base['complete']
reviews=read(BASE/'arxiv-100-20260923/reviews.json')['records']
reviewed={r['arxivId']:r for r in reviews if str(r.get('arxivId','')).startswith('25')}
eligible={aid:r for aid,r in reviewed.items() if r.get('decision')=='include-new'}
assert set(eligible)=={'2503.14858','2505.17638','2505.06708'}
for r in eligible.values():assert len(r['steps'])==6 and all(x['status']=='passed' for x in r['steps'])
census=read(BASE/'candidate-census-baseline-20260923.json')
external={r['arxivId']:r for r in census['formalCandidates'] if str(r['arxivId']).startswith('25')}
db=sqlite3.connect(HOME/'global-v3.sqlite')
for aid,r in external.items():
 row=db.execute('SELECT metadata,routes FROM papers WHERE id=?',(aid,)).fetchone();assert row,aid
 routes=json.loads(row[1]);routes['externalSources']=[{'mechanismId':r['mechanismId'],'source':'verified formal candidate baseline','reviewDisposition':r['reviewDisposition']}]
 db.execute('UPDATE papers SET routes=? WHERE id=?',(json.dumps(routes),aid))
db.commit()
rx=re.compile(r'(?:best|outstanding|distinguished|test[ -]of[ -]time|classic)\s+(?:student\s+)?paper(?:\s+award)?|(?:paper|research)\s+award',re.I)
claims=[];counts=collections.Counter();depths=collections.Counter();route_counts=collections.Counter();months=collections.Counter();ids=set()
with (OUT/'review-results-v3.jsonl').open('w',encoding='utf-8') as f:
 for aid,raw,rr in db.execute('SELECT id,metadata,routes FROM papers ORDER BY id'):
  m=json.loads(raw);routes=json.loads(rr);assert '2025-01-01'<=m['published']<'2026-01-01' and aid not in ids;ids.add(aid)
  pieces=[{'field':k,'text':m[k]} for k in ('comments','journal','title','abstract') if m.get(k) and rx.search(m[k])]
  if pieces:claims.append({'arxivId':aid,'title':m['title'],'claims':pieces,'status':'unverified-claim-or-mention'})
  if aid in eligible:status='include-new';reason='ALL_SIX_PASSED';depth='six-steps';evidence='selected-v3.json#'+aid;relevance='passed'
  elif aid in reviewed:status='needs-evidence';reason='ARTICLE_SPECIFIC_MAJOR_AI_EVIDENCE_INSUFFICIENT';depth='article-specific-evidence-check';evidence='article-evidence-records-v3.json#'+aid;relevance=reviewed[aid].get('relevance',{}).get('status','not-semantically-reviewed')
  elif aid in external:status='needs-evidence';reason='FORMAL_CANDIDATE_PREREQUISITES_UNRESOLVED';depth='official-list-and-metadata-match';evidence='external-leads-v3.json#'+aid;relevance='not-semantically-reviewed'
  elif pieces:status='needs-evidence';reason='UNVERIFIED_AWARD_CLAIM_OR_MENTION';depth='automated-evidence-lookup';evidence='metadata-award-leads-v3.json#'+aid;relevance='not-semantically-reviewed'
  else:status='deferred';reason='NO_ADMISSIBLE_EVIDENCE_IN_THIS_ROUND_INDEX';depth='automated-evidence-lookup';evidence=None;relevance='not-semantically-reviewed'
  row={'arxivId':aid,'title':m['title'],'published':m['published'],'url':m['url'],'routes':routes,'disposition':status,'reasonCode':reason,'reviewDepth':depth,'relevance':relevance,'evidenceRef':evidence,'allSixStepsCompleted':aid in eligible,'keptInCandidatePool':True,'checkedAt':'2026-09-23'}
  f.write(json.dumps(row,ensure_ascii=False,separators=(',',':'))+'\n');counts[status]+=1;depths[depth]+=1;months[m['published'][:7]]+=1
  if routes['categoryMatches']:route_counts['categories']+=1
  if routes['keywordQueryIds']:route_counts['keywords']+=1
  if routes['externalSources']:route_counts['external']+=1
write('selected-v3.json',{'status':'eligible-for-library-inclusion','websitePublished':False,'records':list(eligible.values())})
write('article-evidence-records-v3.json',{'note':'Existing article-specific reviews retained. Only three records completed all six steps; all others stop at missing major-AI evidence.','records':[r for aid,r in reviewed.items() if aid not in eligible]})
write('external-leads-v3.json',{'scope':'Verified 2025-first-submission formal candidates already identified through enabled official mechanisms. This is a bounded external-evidence set, not every award worldwide.','records':list(external.values())})
write('metadata-award-leads-v3.json',{'note':'Automated phrase detection only. A mention can concern another paper, nomination, workshop or nonqualifying prize.','records':claims})
summary={'version':'v3','importancePolicyVersion':'1.2','dateRange':'First submission >=2025-01-01 and <2026-01-01 UTC','roundStatus':'bounded-enumeration-and-necessary-evidence-dispositions-complete','allArxiv2025FirstSubmissions':base['all2025FirstSubmissions'],'candidateCount':len(ids),'routesOverlapping':dict(route_counts),'dispositions':dict(counts),'actualReviewDepths':dict(depths),'allSixStepsCompleted':len(eligible),'articleSpecificEvidenceRecords':len(reviewed),'metadataAwardMentions':len(claims),'byFirstSubmissionMonth':dict(months),'websitePublished':False,'limits':['Missing prerequisite evidence stops the round under the user-confirmed rule; deferred is not rejection.','The whole pool was not semantically or full-text reviewed.','A bounded registered-mechanism evidence set is not every evaluation mechanism worldwide.','The 2026-09-19 snapshot contains all 2025 first submissions but later status only as captured; inclusion candidates require individual standing checks.']}
write('summary-v3.json',summary)
validation={'uniqueIds':len(ids),'dispositionSumMatches':sum(counts.values())==len(ids),'allDatesInRange':True,'allSixStepIds':sorted(eligible),'allSixStepsVerified':True,'selectedNotWebsitePublished':True,'resultSha256':hashlib.sha256((OUT/'review-results-v3.jsonl').read_bytes()).hexdigest(),'snapshotComplete':base['complete']}
write('validation-v3.json',validation);print(json.dumps(summary,ensure_ascii=False,indent=2))
