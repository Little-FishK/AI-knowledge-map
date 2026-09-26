"""Verify snapshot/recent-list overlap and every top-level archive's pagination."""
import hashlib,html,json,pathlib,re,sqlite3
ROOT=pathlib.Path(__file__).resolve().parents[2];HOME=ROOT/'.local/arxiv-2026-review';OUT=ROOT/'proposals/academic-importance/arxiv-2026-20260923';REC=HOME/'recent'
def read(p):return json.loads(p.read_text(encoding='utf-8'))
groups=['astro-ph','cond-mat','cs','econ','eess','gr-qc','hep-ex','hep-lat','hep-ph','hep-th','math','math-ph','nlin','nucl-ex','nucl-th','physics','q-bio','q-fin','quant-ph','stat']
receipts=read(REC/'browser-list-receipts.txt');browser={r['url'].split('/list/')[1].split('/')[0]:r for r in receipts}
rows=[];union=set()
for group in groups:
 names=([group+'.json'] if (REC/(group+'.json')).exists() else [group+'.html'])
 if group=='cs':names+=['cs-2000.html','cs-4000.json']
 if group=='math':names+=['math-2000.json']
 ids=set();totals=set();files=[]
 for name in names:
  p=REC/name;raw=p.read_text(encoding='utf-8');page_ids=[]
  if p.suffix=='.json':
   d=json.loads(raw);page_ids=[re.search(r'\d{4}\.\d{4,5}',r['id']).group() for r in d['entries']];text=d.get('evidence',{}).get('total','')
  else:
   text=html.unescape(re.sub('<[^>]+>',' ',raw));page_ids=[re.search(r'/abs/(\d{4}\.\d{4,5})',dt).group(1) for dt in re.findall(r'<dt\b[^>]*>(.*?)</dt>',raw,re.S) if re.search(r'/abs/(\d{4}\.\d{4,5})',dt)]
  for total in re.findall(r'Total of\s+([\d,]+)\s+entries',text):totals.add(int(total.replace(',','')))
  ids.update(page_ids);files.append({'name':name,'entries':len(page_ids),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
 if group in browser:
  totals.update(int(t.replace(',','')) for t in re.findall(r'Total of\s+([\d,]+)\s+entries',browser[group]['head']))
 assert len(totals)==1 and len(ids)==next(iter(totals)),(group,len(ids),totals)
 union.update(ids);rows.append({'archive':group,'uniqueEntries':len(ids),'officialTotal':next(iter(totals)),'paginationComplete':True,'files':files})
recent={r['arxivId'] for r in read(HOME/'recent-records.json')['records']};assert recent==union,(len(recent-union),len(union-recent))
metadata=read(HOME/'delta-known.json')['records'];known={m['arxivId'] for m in metadata};missing=recent-known;assert not missing
db=sqlite3.connect(HOME/'all-2026.sqlite');snapshot_ids={r[0] for r in db.execute('select id from papers')}
latest=max(json.loads(r[0])['published'] for r in db.execute('select metadata from papers'));assert latest[:10]>='2026-09-17'
report={'checkedAt':'2026-09-23','snapshotAll2026Records':len(snapshot_ids),'snapshotLatestFirstSubmission':latest,'snapshotReceipt':'.local/arxiv-2026-review/snapshot-receipt.json','recentAnnouncementDates':['2026-09-17','2026-09-18','2026-09-21','2026-09-22','2026-09-23'],'recentArchiveCount':len(rows),'recentListsComplete':all(r['paginationComplete'] for r in rows),'recentUniqueIds':len(recent),'recentAlreadyInSnapshot':len(recent&snapshot_ids),'recentNotInSnapshot':len(recent-snapshot_ids),'missingRecentMetadata':len(missing),'dateCoverageBridge':'Full snapshot through Sept 17 v1 submissions; official recent lists overlap at Sept 17 announcements and continue through Sept 23. Public announcements only.','archives':rows,'limits':['Cannot include submissions not publicly announced by the capture date.','Snapshot older records use the captured version, not a fresh status check of every original. Current standing is required before admission.','External award/literature discovery is bounded separately; this receipt verifies metadata enumeration, not global semantic completeness.']}
(OUT/'collection-coverage-v3.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps({k:v for k,v in report.items() if k!='archives'},ensure_ascii=False))
