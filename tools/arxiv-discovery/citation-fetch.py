"""Resolve citation-index arXiv IDs against original arXiv metadata, serially."""
import collections,datetime as dt,gzip,hashlib,json,pathlib,sqlite3,time,urllib.parse,urllib.request
from harvest import parse_feed
ROOT=pathlib.Path(__file__).resolve().parents[2];base=ROOT/'proposals/arxiv-catalog'
plan=json.loads((base/'systematic-search-plan.json').read_text(encoding='utf-8'));home=ROOT/plan['runDirectory']
db=sqlite3.connect(home/'discovery.sqlite');citations=sqlite3.connect(home/'citations.sqlite')
if db.execute("SELECT COUNT(*)FROM queries WHERE status='running'").fetchone()[0]or citations.execute("SELECT COUNT(*)FROM traversals WHERE status='running'").fetchone()[0]:
    raise SystemExit('Wait for topic and citation discovery to finish before resolving leads.')
db.execute('CREATE TABLE IF NOT EXISTS citation_leads(id TEXT PRIMARY KEY,relations TEXT,status TEXT,receipt TEXT)')
leads=collections.defaultdict(list)
for aid,seed,direction in citations.execute('SELECT arxiv_id,seed,direction FROM edges WHERE arxiv_id IS NOT NULL'):
    leads[aid].append({'seed':seed,'relation':'paper-cites-seed'if direction=='citations'else'seed-cites-paper'})
pending=[]
for aid,relations in leads.items():
    previous=db.execute('SELECT status FROM citation_leads WHERE id=?',(aid,)).fetchone()
    if previous and previous[0]in('resolved-by-id','resolved-existing','outside-cutoff'):continue
    if db.execute('SELECT 1 FROM papers WHERE id=?',(aid,)).fetchone():
        db.execute('INSERT OR REPLACE INTO citation_leads VALUES(?,?,?,?)',(aid,json.dumps(relations),'resolved-existing',None))
    else:pending.append(aid)
db.commit();last=0
def fetch(ids):
    global last
    url='https://export.arxiv.org/api/query?'+urllib.parse.urlencode({'id_list':','.join(ids),'max_results':len(ids)})
    file=home/'responses'/(hashlib.sha256(url.encode()).hexdigest()+'.xml.gz')
    if file.exists():raw=gzip.decompress(file.read_bytes())
    else:
        for attempt in range(3):
            time.sleep(max(0,3.1-(time.monotonic()-last)))
            try:
                last=time.monotonic()
                with urllib.request.urlopen(url,timeout=60)as response:raw=response.read()
                parse_feed(raw);file.write_bytes(gzip.compress(raw));break
            except Exception:
                if attempt==2:raise
                time.sleep(5*(attempt+1))
    _,_,rows=parse_feed(raw);found={r['arxivId']:r for r in rows}
    for aid in ids:
        paper=found.get(aid);status='resolved-by-id'if paper else'not-returned'
        if paper:
            if paper['published']>plan['cutoffUTC']:status='outside-cutoff'
            else:db.execute('INSERT OR REPLACE INTO papers VALUES(?,?)',(aid,json.dumps(paper,ensure_ascii=False)))
        receipt={'url':url,'cache':file.name,'sha256':hashlib.sha256(raw).hexdigest()}
        db.execute('INSERT OR REPLACE INTO citation_leads VALUES(?,?,?,?)',(aid,json.dumps(leads[aid]),status,json.dumps(receipt)))
    db.commit();print('Citation metadata batch:',len(ids),'returned:',len(found),flush=True)
def resolve(ids):
    try:fetch(ids)
    except Exception as e:
        if len(ids)>1:
            mid=len(ids)//2;resolve(ids[:mid]);resolve(ids[mid:])
        else:
            aid=ids[0];db.execute('INSERT OR REPLACE INTO citation_leads VALUES(?,?,?,?)',(aid,json.dumps(leads[aid]),'unresolved-error',json.dumps({'error':str(e)})));db.commit()
for start in range(0,len(pending),100):resolve(pending[start:start+100])
result={'schemaVersion':1,'generatedAt':dt.datetime.now(dt.timezone.utc).isoformat(),'totalLeads':len(leads),
        'statuses':dict(db.execute('SELECT status,COUNT(*)FROM citation_leads GROUP BY status')),
        'unresolved':[{'arxivId':r[0],'status':r[1],'detail':json.loads(r[2])if r[2]else None}for r in db.execute("SELECT id,status,receipt FROM citation_leads WHERE status IN('not-returned','unresolved-error')")],
        'importanceReviewComplete':False}
(base/'citation-metadata-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result,ensure_ascii=False));db.close();citations.close()
