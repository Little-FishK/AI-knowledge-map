"""Enumerate actual list entries; distinguish missing metadata from nonmatches."""
import collections,html,json,pathlib,re,sqlite3
ROOT=pathlib.Path(__file__).resolve().parents[2]; HOME=ROOT/'.local/arxiv-2026-review'
recent={};coverage=[]
def clean(s):return ' '.join(html.unescape(re.sub('<[^>]+>',' ',s)).split())
for p in (HOME/'recent').glob('*.html'):
 if p.name=='index.html':continue
 raw=p.read_text(encoding='utf-8')
 for dt,dd in re.findall(r'<dt\b[^>]*>(.*?)</dt>\s*<dd\b[^>]*>(.*?)</dd>',raw,re.S):
  ids=re.findall(r'/abs/(\d{4}\.\d{4,5})',dt)
  if not ids:continue
  aid=ids[0];recent.setdefault(aid,{'arxivId':aid,'listText':clean(dd),'listFiles':[]})['listFiles'].append(p.name)
for p in (HOME/'recent').glob('*.json'):
 raw=json.loads(p.read_text(encoding='utf-8'))
 for row in raw['entries']:
  ids=re.findall(r'(\d{4}\.\d{4,5})',row.get('id',''))
  if ids:recent.setdefault(ids[0],{'arxivId':ids[0],'listText':' '.join(row.get('text','').split()),'listFiles':[]})['listFiles'].append(p.name)
known={}; db=sqlite3.connect(HOME/'snapshot.sqlite')
for aid,raw in db.execute('SELECT id,metadata FROM papers'):
 if aid in recent:known[aid]=json.loads(raw)
all_db=sqlite3.connect(HOME/'all-2026.sqlite')
for aid in recent:
 if aid in known:continue
 row=all_db.execute('SELECT metadata FROM papers WHERE id=?',(aid,)).fetchone()
 if row:
  m=json.loads(row[0]);known[aid]={'arxivId':aid,'title':m['title'],'abstract':m['abstract'],'authors':m['authors_parsed'],'published':m['published'],'categories':m['categories'].split(),'comments':m.get('comments'),'doi':m.get('doi'),'journal':m.get('journal-ref'),'url':'https://arxiv.org/abs/'+aid,'provenance':'Cornell public arXiv snapshot'}
old=sqlite3.connect(ROOT/'.local/arxiv-discovery/20260923-r2/discovery.sqlite')
for aid in recent:
 if aid in known:continue
 row=old.execute('SELECT metadata FROM papers WHERE id=?',(aid,)).fetchone()
 if row:known[aid]=json.loads(row[0])
fresh=sqlite3.connect(HOME/'categories.sqlite')
for aid,raw in fresh.execute('SELECT id,metadata FROM papers'):
 if aid in recent:known[aid]=json.loads(raw)
browser_file=HOME/'delta-browser.jsonl'
if browser_file.exists():
 for line in browser_file.read_text(encoding='utf-8').splitlines():
  if not line.strip():continue
  r=json.loads(line);meta=collections.defaultdict(list)
  for m in r['meta']:meta[m['name']].append(m['content'])
  aid=r['arxivId'];date=meta['citation_date'][0].replace('/','-')
  assert meta['citation_arxiv_id'][0]==aid
  known[aid]={'arxivId':aid,'title':meta['citation_title'][0],'abstract':meta['citation_abstract'][0],'authors':meta['citation_author'],'published':date,'categories':re.findall(r'\(([a-z-]+\.[A-Za-z-]+|[a-z-]+)\)',r.get('subjects','')),'url':r['url'],'submissionHistory':r.get('history'),'provenance':'arXiv original page DOM read 2026-09-23'}
http_file=HOME/'delta-http.jsonl'
if http_file.exists():
 for line in http_file.read_text(encoding='utf-8').splitlines():
  if line.strip():
   r=json.loads(line)
   if r['arxivId'] in recent:known[r['arxivId']]=r
missing=[r for aid,r in sorted(recent.items(),reverse=True) if aid not in known]
(HOME/'recent-records.json').write_text(json.dumps({'records':list(recent.values())},ensure_ascii=False),encoding='utf-8')
(HOME/'delta-known.json').write_text(json.dumps({'records':list(known.values())},ensure_ascii=False),encoding='utf-8')
(HOME/'delta-missing.json').write_text(json.dumps({'records':missing},ensure_ascii=False),encoding='utf-8')
print(json.dumps({'uniqueRecentIds':len(recent),'knownMetadata':len(known),'missingMetadata':len(missing),'firstMissingIds':[r['arxivId'] for r in missing[:5]]}))
