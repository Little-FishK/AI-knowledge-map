"""Close a bounded enumeration/necessary-evidence round, not a full-text review of all papers.

Requires zero missing recent metadata. Retains per-ID routes and actual review depth.
Never infers academic quality from a missing lookup match.
"""
import collections,gzip,hashlib,html,json,pathlib,re,sqlite3,unicodedata
from arxiv_2026_rules import ROOT,OUT,CATEGORIES,Rules
HOME=ROOT/'.local/arxiv-2026-review'
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def write(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def norm(s):return ''.join(sorted(re.findall('[a-z]+',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower())))
def inyear(m):return '2026-01-01'<=m.get('published','')<'2026-09-24'
assert not read(HOME/'delta-missing.json')['records'],'Recent metadata gaps remain'
assert read(HOME/'global-v3-base.json')['complete']
rules=Rules();db=sqlite3.connect(HOME/'global-v3.sqlite');all_db=sqlite3.connect(HOME/'all-2026.sqlite')
external=collections.defaultdict(list);external_log=[]
acl=read(OUT/'acl-anthology-award-leads.json')['records']
for r in acl:
 matches=r['arxivMatches']
 external_log.append({'title':r['title'],'url':r['url'],'award':r['award'],'matches':matches,'disposition':'matched' if matches else 'unresolved-arxiv-identity'})
 for m in matches:
  if inyear(m):external[m['arxivId']].append({'url':r['url'],'award':r['award'],'source':'ACL 2026 official XML'})
for b in read(OUT/'extra-official-leads.json')['batches']:
 for m in b['matches']:
  external_log.append({'title':m['title'],'url':b['url'],'award':b['award'],'matches':m['arxivMatches'],'disposition':'matched' if m['arxivMatches'] else 'unresolved-arxiv-identity'})
  for x in m['arxivMatches']:
   if inyear(x):external[x['arxivId']].append({'url':b['url'],'award':b['award'],'source':b['venue']})
updates=read(OUT/'article-evidence-updates.json')['records'];updates={r['arxivId']:r for r in updates}
eligible=read(OUT/'eligible-prior-reviews.json')['records'];eligible={r['arxivId']:r for r in eligible}
for aid,r in eligible.items():external[aid].append({'url':r['evaluation']['evidenceUrl'],'award':r['evaluation']['awardName'],'source':'ICML 2026'})
for aid,r in updates.items():
 if r.get('externalDiscoveryUrl'):external[aid].append({'url':r['externalDiscoveryUrl'],'source':'article-specific evidence follow-up'})
delta=read(HOME/'delta-known.json')['records'];before=db.execute('SELECT count(*) FROM papers').fetchone()[0]
delta_matches=0
for m in delta:
 if not inyear(m):continue
 aid=m['arxivId'];cats=sorted(CATEGORIES.intersection(m['categories']));queries,atoms=rules.match(m['title'],m['abstract'])
 if not(cats or queries or aid in external):continue
 delta_matches+=1
 # Keep author award claims present on the actual recent list; claims are never proof.
 routes={'categoryMatches':cats,'keywordQueryIds':queries,'keywordAtoms':atoms,'externalSources':external.get(aid,[])}
 db.execute('INSERT OR REPLACE INTO papers VALUES(?,?,?)',(aid,json.dumps(m,ensure_ascii=False),json.dumps(routes)))
for aid,sources in external.items():
 row=db.execute('SELECT metadata,routes FROM papers WHERE id=?',(aid,)).fetchone()
 if row:m=json.loads(row[0]);routes=json.loads(row[1])
 else:
  raw=all_db.execute('SELECT metadata FROM papers WHERE id=?',(aid,)).fetchone()
  assert raw,('Unresolved external metadata',aid)
  a=json.loads(raw[0]);m={'arxivId':aid,'title':' '.join(a['title'].split()),'abstract':a['abstract'],'authors':a['authors_parsed'],'published':a['published'],'categories':a['categories'].split(),'comments':a.get('comments'),'journal':a.get('journal-ref'),'url':'https://arxiv.org/abs/'+aid}
  cats=sorted(CATEGORIES.intersection(m['categories']));queries,atoms=rules.match(m['title'],m['abstract']);routes={'categoryMatches':cats,'keywordQueryIds':queries,'keywordAtoms':atoms}
 assert inyear(m),aid
 routes['externalSources']=sources
 db.execute('INSERT OR REPLACE INTO papers VALUES(?,?,?)',(aid,json.dumps(m,ensure_ascii=False),json.dumps(routes)))
db.commit()
# Reconcile historical API hits without falsely claiming exact local phrase matching.
legacy_file=OUT/'legacy-pool-reconciliation-v3.json'
legacy_missing=read(legacy_file)['records'] if legacy_file.exists() else [];legacy_added=0
with (OUT/'queue.jsonl').open(encoding='utf-8') as f:
 for line in f:
  r=json.loads(line);aid=r['arxivId']
  if db.execute('SELECT 1 FROM papers WHERE id=?',(aid,)).fetchone():continue
  m=r['metadata'];assert inyear(m)
  legacy_routes={'categoryMatches':r.get('categoryMatches',[]),'keywordQueryIds':[],'keywordAtoms':[],'externalSources':external.get(aid,[]),'historicalApiKeywordQueryIds':r.get('keywordQueryIds',[])}
  assert legacy_routes['categoryMatches'] or legacy_routes['historicalApiKeywordQueryIds'] or legacy_routes['externalSources'],aid
  db.execute('INSERT INTO papers VALUES(?,?,?)',(aid,json.dumps(m,ensure_ascii=False),json.dumps(legacy_routes)));legacy_added+=1
  legacy_missing.append({'arxivId':aid,'historicalKeywordQueryIds':r.get('keywordQueryIds',[]),'action':'retained-with-historical-api-hit-provenance'})
db.commit()
write(OUT/'legacy-pool-reconciliation-v3.json',{'note':'Earlier API hits retained as an additional frozen keyword-hit set. They are not falsely relabeled as local exact-phrase matches. No historical candidate silently removed.','records':legacy_missing})
recent={r['arxivId']:r for r in read(HOME/'recent-records.json')['records']}
claims_rx=re.compile(r'(?:best|outstanding|distinguished|test[ -]of[ -]time|classic)\s+(?:student\s+)?paper(?:\s+award)?|(?:paper|research)\s+award',re.I)
claims=[];counts=collections.Counter();route_counts=collections.Counter();months=collections.Counter();ids=set();article_specific=set(updates)|set(eligible)
with (OUT/'review-results-v3.jsonl').open('w',encoding='utf-8') as f:
 for aid,raw,route_raw in db.execute('SELECT id,metadata,routes FROM papers ORDER BY id'):
  m=json.loads(raw);routes=json.loads(route_raw);assert inyear(m) and aid not in ids;ids.add(aid)
  pieces=[{'field':k,'text':m[k]} for k in ('comments','journal','title','abstract') if m.get(k) and claims_rx.search(m[k])]
  if aid in recent and claims_rx.search(recent[aid]['listText']):pieces.append({'field':'recentList','text':recent[aid]['listText']})
  if pieces:claims.append({'arxivId':aid,'claims':pieces,'status':'unverified-claim-or-mention'})
  if aid in eligible:
   status='include-new';reason='ALL_SIX_PASSED';depth='six-steps';evidence='eligible-prior-reviews.json#'+aid;relevance='passed'
   assert len(eligible[aid]['steps'])==6 and all(s['status']=='passed' for s in eligible[aid]['steps'])
  elif aid in updates:
   u=updates[aid];status=u['disposition'];reason=u['reasonCode'];depth=u['reviewDepth'];evidence='article-evidence-updates.json#'+aid;relevance=u.get('relevance','not-semantically-reviewed')
  elif aid in external:
   status='needs-evidence';reason='EXTERNAL_LEAD_PREREQUISITES_UNRESOLVED';depth='metadata-and-official-list-match';evidence='external-leads-v3.json#'+aid;relevance='not-semantically-reviewed'
  elif pieces:
   status='needs-evidence';reason='UNVERIFIED_AWARD_CLAIM_OR_MENTION';depth='automated-evidence-lookup';evidence='metadata-award-leads-v3.json#'+aid;relevance='not-semantically-reviewed'
  else:
   status='deferred';reason='NO_ADMISSIBLE_EVIDENCE_IN_THIS_ROUND_INDEX';depth='automated-evidence-lookup';evidence=None;relevance='not-semantically-reviewed'
  record={'arxivId':aid,'title':m['title'],'published':m['published'],'url':m.get('url','https://arxiv.org/abs/'+aid),'routes':routes,'disposition':status,'reasonCode':reason,'reviewDepth':depth,'relevance':relevance,'evidenceRef':evidence,'allSixStepsCompleted':aid in eligible,'keptInCandidatePool':True,'checkedAt':'2026-09-23'}
  f.write(json.dumps(record,ensure_ascii=False,separators=(',',':'))+'\n');counts[status]+=1;months[m['published'][:7]]+=1
  for name,hit in [('categories',routes['categoryMatches']),('keywords',routes['keywordQueryIds'] or routes.get('historicalApiKeywordQueryIds')),('external',routes.get('externalSources'))]:
   if hit:route_counts[name]+=1
write(OUT/'metadata-award-leads-v3.json',{'note':'Mentions are not verified recipient claims; no pass from this regex. Includes latest list comments.','records':claims})
write(OUT/'external-leads-v3.json',{'note':'Bounded official lists; unresolved arXiv identity remains outside numeric arXiv pool until resolved. Matched records outside first-submission year are not in this experiment.','records':external_log})
write(OUT/'selected-v3.json',{'status':'eligible-for-library-inclusion','websitePublished':False,'records':list(eligible.values())})
coverage=read(OUT/'collection-coverage-v3.json');assert coverage['recentListsComplete'] and coverage['missingRecentMetadata']==0
summary={'version':'v3','importancePolicyVersion':'1.2','cutoff':'Public records available 2026-09-23; v1 >=2026-01-01 and <2026-09-24 UTC','roundStatus':'bounded-enumeration-and-necessary-evidence-dispositions-complete','candidateCount':len(ids),'routesOverlapping':dict(route_counts),'dispositions':dict(counts),'allSixStepsCompleted':len(eligible),'articleSpecificEvidenceRecords':len(article_specific.intersection(ids)),'automatedLookupOnly':sum(1 for aid in ids if aid not in article_specific and aid not in external),'semanticRelevanceNotClaimedForWholePool':True,'metadataAwardMentions':len(claims),'byFirstSubmissionMonth':dict(months),'snapshotCandidates':read(HOME/'global-v3-base.json')['selected'],'recentDeltaMatchingIncludingOverlap':delta_matches,'externalLeadsUnresolved':sum(r['disposition']=='unresolved-arxiv-identity' for r in external_log),'legacyPoolNonmatches':len(legacy_missing),'websitePublished':False,'limits':['This is not all-six-step completion for the whole pool. Missing prerequisite evidence stops the round by user authorization.','Absence from bounded evidence index is not proof of no award or no contribution.','Exact normalized Boolean phrase matching is versioned; not guaranteed identical to arXiv API stemming.','Public snapshot plus recent-announcement lists; unannounced and future 2026 submissions are excluded.','External lead universe is explicitly bounded, not every evaluation mechanism worldwide.']}
write(OUT/'summary-v3.json',summary)
validation={'uniqueIds':len(ids),'dispositionSumMatches':sum(counts.values())==len(ids),'allDatesInRange':True,'eligibleEveryStepPassed':True,'conflictExcluded':'2601.09373' not in eligible,'recentMetadataMissing':0,'resultSha256':hashlib.sha256((OUT/'review-results-v3.jsonl').read_bytes()).hexdigest(),'keywordPlanSha256':hashlib.sha256((OUT/'keyword-plan-global-v3.json').read_bytes()).hexdigest(),'legacyPoolNonmatches':len(legacy_missing)}
write(OUT/'validation-v3.json',validation);print(json.dumps(summary,ensure_ascii=False,indent=2))
