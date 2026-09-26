"""Traverse both directions of the 78 seed papers' public S2 citation index.
This is a discovery index, not original-paper evidence or an importance score.
"""
import datetime as dt,gzip,hashlib,json,pathlib,re,sqlite3,time,urllib.error,urllib.parse,urllib.request
ROOT=pathlib.Path(__file__).resolve().parents[2]
base=ROOT/'proposals/arxiv-catalog'
plan=json.loads((base/'systematic-search-plan.json').read_text(encoding='utf-8'))
home=ROOT/plan['runDirectory'];cache=home/'citation-responses';cache.mkdir(exist_ok=True)
db=sqlite3.connect(home/'citations.sqlite')
db.executescript('''
CREATE TABLE IF NOT EXISTS traversals(seed TEXT,direction TEXT,status TEXT,details TEXT,PRIMARY KEY(seed,direction));
CREATE TABLE IF NOT EXISTS pages(seed TEXT,direction TEXT,offset INTEGER,next_offset INTEGER,count INTEGER,url TEXT,sha256 TEXT,cache TEXT,PRIMARY KEY(seed,direction,offset));
CREATE TABLE IF NOT EXISTS edges(seed TEXT,direction TEXT,paper_id TEXT,arxiv_id TEXT,metadata TEXT,PRIMARY KEY(seed,direction,paper_id));
''')
catalog=json.loads((base/'records.json').read_text(encoding='utf-8'))['records']
seeds=[r['arxivId']for r in catalog if r['decision']in('admitted','existing-retained','merged-existing')]
last=0
def request(url):
    global last
    target=cache/(hashlib.sha256(url.encode()).hexdigest()+'.json.gz')
    if target.exists():return gzip.decompress(target.read_bytes()),target.name
    for attempt in range(4):
        time.sleep(max(0,1.2-(time.monotonic()-last)))
        try:
            last=time.monotonic()
            with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'AIKnowledgeMap-ResearchDiscovery/1.0'}),timeout=60)as r:raw=r.read()
            value=json.loads(raw)
            if not isinstance(value.get('data'),list):raise ValueError('No result list')
            target.write_bytes(gzip.compress(raw));return raw,target.name
        except urllib.error.HTTPError as e:
            if e.code==404 or attempt==3:raise
            wait=max(5*(attempt+1),int(e.headers.get('Retry-After','0'))if e.headers.get('Retry-After','0').isdigit()else 0)
            time.sleep(min(wait,60))
        except Exception:
            if attempt==3:raise
            time.sleep(5*(attempt+1))

def report():
    states=[{'seed':r[0],'direction':r[1],'status':r[2],'details':json.loads(r[3])}for r in db.execute('SELECT seed,direction,status,details FROM traversals')]
    result={'schemaVersion':1,'generatedAt':dt.datetime.now(dt.timezone.utc).isoformat(),
            'index':'Semantic Scholar Academic Graph API','seedCount':len(seeds),'plannedTraversals':len(seeds)*2,
            'completedTraversals':sum(r['status']=='complete'for r in states),
            'uniqueArxivLeads':db.execute('SELECT COUNT(DISTINCT arxiv_id)FROM edges WHERE arxiv_id IS NOT NULL').fetchone()[0],
            'uniqueIndexedPapers':db.execute('SELECT COUNT(DISTINCT paper_id)FROM edges').fetchone()[0],
            'edgeCount':db.execute('SELECT COUNT(*)FROM edges').fetchone()[0],
            'traversals':states,'database':(home/'citations.sqlite').relative_to(ROOT).as_posix(),
            'limitations':['One-hop indexed references and citations of 78 accepted seeds, not the complete scholarly citation graph.',
                          'Missing external arXiv IDs and unindexed papers remain discovery gaps.',
                          'Index records and citation counts do not establish importance, independence, correctness, or publication eligibility.',
                          'Index publication dates can be future journal issue dates; arXiv submission dates must be confirmed before admission.']}
    (base/'citation-search-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    return result

for seed in seeds:
    for direction in('references','citations'):
        state=db.execute('SELECT status FROM traversals WHERE seed=? AND direction=?',(seed,direction)).fetchone()
        if state and state[0]=='complete':continue
        db.execute('INSERT OR REPLACE INTO traversals VALUES(?,?,?,?)',(seed,direction,'running','{}'));db.commit();report()
        offset=0;seen=set();pages=0
        try:
            while True:
                url='https://api.semanticscholar.org/graph/v1/paper/arXiv:'+seed+'/'+direction+'?'+urllib.parse.urlencode({'fields':'title,externalIds,publicationDate','limit':1000,'offset':offset})
                raw,cached=request(url);value=json.loads(raw)
                if value.get('offset')!=offset:raise ValueError('Unexpected page offset')
                rows=value['data'];next_offset=value.get('next');pages+=1
                if next_offset is not None and(next_offset<=offset or not rows):raise ValueError('Invalid continuation cursor')
                for entry in rows:
                    paper=entry.get('citingPaper'if direction=='citations'else'citedPaper')or{}
                    pid=paper.get('paperId')
                    if not pid:continue # unresolved references remain visible in raw receipts
                    seen.add(pid)
                    aid=re.sub(r'v\d+$','',(paper.get('externalIds')or{}).get('ArXiv',''))or None
                    if aid and not re.fullmatch(r'(?:\d{4}\.\d{4,5}|[a-zA-Z.-]+/\d{7})',aid):aid=None
                    db.execute('INSERT OR REPLACE INTO edges VALUES(?,?,?,?,?)',(seed,direction,pid,aid,json.dumps(paper,ensure_ascii=False)))
                db.execute('INSERT OR REPLACE INTO pages VALUES(?,?,?,?,?,?,?,?)',(seed,direction,offset,next_offset,len(rows),url,hashlib.sha256(raw).hexdigest(),cached));db.commit()
                print(json.dumps({'seed':seed,'direction':direction,'offset':offset,'received':len(rows),'next':next_offset}),flush=True)
                if next_offset is None:break
                offset=next_offset
            db.execute('UPDATE traversals SET status=?,details=?WHERE seed=? AND direction=?',('complete',json.dumps({'pages':pages,'uniqueIndexedPapers':len(seen)}),seed,direction))
        except Exception as e:
            db.execute('UPDATE traversals SET status=?,details=?WHERE seed=? AND direction=?',('unavailable'if isinstance(e,urllib.error.HTTPError)and e.code==404 else'incomplete',json.dumps({'error':str(e),'nextOffset':offset}),seed,direction))
            print('INCOMPLETE',seed,direction,str(e),flush=True)
        db.commit();report()
result=report();print(json.dumps({k:result[k]for k in('completedTraversals','plannedTraversals','uniqueArxivLeads','edgeCount')}),flush=True);db.close()
