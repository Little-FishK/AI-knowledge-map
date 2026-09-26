"""Resumable, single-connection arXiv discovery. Never writes published library data."""
import argparse, datetime as dt, gzip, hashlib, json, pathlib, re, sqlite3, time
import urllib.parse, urllib.request, xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parents[2]
NS = {'a':'http://www.w3.org/2005/Atom','o':'http://a9.com/-/spec/opensearch/1.1/','x':'http://arxiv.org/schemas/atom'}
SIZE = 2000

def bounded_query(q,begin=None,end=None):
    return '('+q['query']+') AND submittedDate:['+(begin or q['from'])+' TO '+(end or q['to'])+']'

def effective_query(q,begin,end,covered):
    expr=bounded_query(q,begin,end)
    if covered:expr='('+expr+') ANDNOT ('+' OR '.join('('+bounded_query(p)+')'for p in covered)+')'
    return expr

def bridge_query(expr,excluded):
    if excluded:
        return '('+expr+') ANDNOT ('+' OR '.join('submittedDate:['+b+' TO '+e+']'for b,e in excluded)+')'
    return expr

def canonical(value):
    return re.sub(r'v\d+$', '', re.sub(r'^https?://(?:export\.)?arxiv.org/(?:abs|pdf|html)/', '', value).removesuffix('.pdf'))

def parse_feed(raw):
    tree=ET.fromstring(raw)
    total=tree.findtext('o:totalResults',None,NS)
    if total is None: raise ValueError('API feed has no totalResults: '+raw[:250].decode(errors='replace'))
    entries=[]
    for e in tree.findall('a:entry',NS):
        url=e.findtext('a:id','',NS)
        if '/api/errors' in url: raise ValueError(e.findtext('a:summary','API error',NS))
        aid=canonical(url)
        if not re.fullmatch(r'(?:\d{4}\.\d{4,5}|[a-zA-Z.-]+/\d{7})',aid): raise ValueError('Invalid arxiv ID '+aid)
        entries.append(dict(arxivId=aid,version=(re.search(r'v\d+$',url)or[''])[0],title=' '.join(e.findtext('a:title','',NS).split()),abstract=' '.join(e.findtext('a:summary','',NS).split()),authors=[a.findtext('a:name','',NS)for a in e.findall('a:author',NS)],published=e.findtext('a:published','',NS),updated=e.findtext('a:updated','',NS),categories=[c.get('term')for c in e.findall('a:category',NS)],doi=e.findtext('x:doi',None,NS),journal=e.findtext('x:journal_ref',None,NS),url='https://arxiv.org/abs/'+aid))
    return int(total),int(tree.findtext('o:startIndex','0',NS)),entries

def exhaust(fetch, begin, end, split_limit=8000):
    """Certify every matching ID, rejecting partial, duplicate or shifting pages."""
    total,rows=fetch(begin,end,0)
    if total>split_limit:
        start_dt=dt.datetime.strptime(begin,'%Y%m%d%H%M');end_dt=dt.datetime.strptime(end,'%Y%m%d%H%M')
        minutes=int((end_dt-start_dt).total_seconds()//60)
        if minutes<1:raise ValueError('Too many hits within a minute; cannot split safely')
        mid=start_dt+dt.timedelta(minutes=minutes//2)
        left=exhaust(fetch,begin,mid.strftime('%Y%m%d%H%M'),split_limit)
        right=exhaust(fetch,(mid+dt.timedelta(minutes=1)).strftime('%Y%m%d%H%M'),end,split_limit)
        children=[left,right]
        if left['total']+right['total']<total:
            # arXiv minute bounds represent :00 seconds. The remainder of the
            # split minute needs an explicit bridge, excluding both children.
            excluded=[(left['from'],left['to']),(right['from'],right['to'])]
            bridge=exhaust(lambda b,e,s:fetch(b,e,s,excluded),left['to'],right['from'],split_limit)
            bridge['excludedDateRanges']=excluded;children.append(bridge)
        if sum(c['total']for c in children)!=total:raise ValueError('Partition totals differ from parent; index may have changed')
        return {'from':begin,'to':end,'total':total,'status':'complete','children':children}
    seen=set(r['arxivId']for r in rows);offset=len(rows)
    if len(seen)!=len(rows):raise ValueError('Duplicates within page')
    while offset<total:
        if not rows:raise ValueError('Empty page before reported end')
        t,rows=fetch(begin,end,offset)
        if t!=total:raise ValueError('Total changed while paginating')
        new=set(r['arxivId']for r in rows)
        if len(new)!=len(rows)or new&seen:raise ValueError('Repeated IDs across pages; pagination cannot be certified')
        seen|=new;offset+=len(rows)
    if offset!=total:raise ValueError('Harvest count differs from reported total')
    return {'from':begin,'to':end,'total':total,'unique':len(seen),'status':'complete'}

def main():
    p=argparse.ArgumentParser();p.add_argument('--only');p.add_argument('--report-only',action='store_true');args=p.parse_args()
    plan=json.loads((ROOT/'proposals/arxiv-catalog/systematic-search-plan.json').read_text(encoding='utf-8'))
    home=ROOT/plan.get('runDirectory','.local/arxiv-discovery/20260923');home.mkdir(parents=True,exist_ok=True)
    cache=home/'responses';cache.mkdir(exist_ok=True)
    db=sqlite3.connect(home/'discovery.sqlite');db.execute('PRAGMA journal_mode=WAL')
    db.executescript('''
    CREATE TABLE IF NOT EXISTS papers(id TEXT PRIMARY KEY, metadata TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS hits(query_id TEXT,id TEXT,PRIMARY KEY(query_id,id));
    CREATE TABLE IF NOT EXISTS queries(id TEXT PRIMARY KEY,plan_hash TEXT,status TEXT,total INTEGER,details TEXT);
    CREATE TABLE IF NOT EXISTS pages(query_id TEXT,partition TEXT,start INTEGER,total INTEGER,count INTEGER,url TEXT,sha256 TEXT,cache TEXT,PRIMARY KEY(query_id,partition,start));
    ''')
    last_request=0
    def request(url):
        nonlocal last_request
        key=hashlib.sha256(url.encode()).hexdigest();target=cache/(key+'.xml.gz')
        if target.exists(): return gzip.decompress(target.read_bytes()),target.name
        for attempt in range(3):
            time.sleep(max(0,3.1-(time.monotonic()-last_request)))
            try:
                last_request=time.monotonic()
                with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'AIKnowledgeMap-LibraryResearch/1.0 (single-connection metadata discovery)'}),timeout=90) as r: raw=r.read()
                parse_feed(raw)
                target.write_bytes(gzip.compress(raw))
                return raw,target.name
            except Exception:
                if attempt==2: raise
                time.sleep(3*(attempt+1))
    def page(q,begin,end,start,covered,excluded=None):
        # Preserve original request spelling for already-started unoptimized runs.
        expr=effective_query(q,begin,end,covered)if covered else q['query']+' AND submittedDate:['+begin+' TO '+end+']'
        expr=bridge_query(expr,excluded)
        url='https://export.arxiv.org/api/query?'+urllib.parse.urlencode({'search_query':expr,'start':start,'max_results':SIZE,'sortBy':'submittedDate','sortOrder':'ascending'})
        raw,cached=request(url);total,offset,rows=parse_feed(raw)
        if offset!=start:raise ValueError(f'Wrong page offset {offset}, expected {start}')
        db.execute('INSERT OR REPLACE INTO pages VALUES(?,?,?,?,?,?,?,?)',(q['id'],begin+'..'+end+('|bridge'if excluded else''),start,total,len(rows),url,hashlib.sha256(raw).hexdigest(),cached))
        for row in rows:
            existing=db.execute('SELECT metadata FROM papers WHERE id=?',(row['arxivId'],)).fetchone()
            if not existing or json.loads(existing[0])['updated']<=row['updated']:
                db.execute('INSERT OR REPLACE INTO papers VALUES(?,?)',(row['arxivId'],json.dumps(row,ensure_ascii=False)))
            db.execute('INSERT OR IGNORE INTO hits VALUES(?,?)',(q['id'],row['arxivId']))
        db.commit()
        print(json.dumps({'query':q['id'],'range':begin+'..'+end,'start':start,'total':total,'received':len(rows)},ensure_ascii=False),flush=True)
        return total,rows
    def report():
        summaries=[]
        for q in plan['queries']:
            row=db.execute('SELECT status,total,details FROM queries WHERE id=?',(q['id'],)).fetchone()
            count=db.execute('SELECT COUNT(*)FROM hits WHERE query_id=?',(q['id'],)).fetchone()[0]
            pages=db.execute('SELECT COUNT(*)FROM pages WHERE query_id=?',(q['id'],)).fetchone()[0]
            details=json.loads(row[2])if row else None
            covered=details.get('coveredByQueries',[])if details else[]
            summaries.append({**q,'status':row[0]if row else'not-started','reportedTotal':row[1]if row else None,'reportedTotalMeaning':'matching IDs outside previously covered queries'if covered else'all matching IDs','coveredByQueries':covered,'uniqueHarvested':count,'pageReceipts':pages,'details':details})
        result={'schemaVersion':1,'planRevision':plan.get('revision',1),'generatedAt':dt.datetime.now(dt.timezone.utc).isoformat(),'cutoffUTC':plan['cutoffUTC'],'scope':plan['description'],'queries':summaries,'uniquePapers':db.execute('SELECT COUNT(*)FROM papers').fetchone()[0],'queryHits':db.execute('SELECT COUNT(*)FROM hits').fetchone()[0],'completedQueries':sum(q['status']=='complete'for q in summaries),'totalQueries':len(summaries),'contentReviewComplete':False,'database':home.relative_to(ROOT).as_posix()+'/discovery.sqlite','rawResponseDirectory':home.relative_to(ROOT).as_posix()+'/responses'}
        (ROOT/'proposals/arxiv-catalog/systematic-search-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        return result
    if not args.report_only:
        for q in plan['queries']:
            if args.only and args.only not in q['id']:continue
            h=hashlib.sha256(json.dumps(q,sort_keys=True).encode()).hexdigest()
            previous=db.execute('SELECT plan_hash,status,details FROM queries WHERE id=?',(q['id'],)).fetchone()
            if previous and previous[0]!=h:raise ValueError('Query plan changed; use a new run rather than mixing evidence: '+q['id'])
            if previous and previous[1]=='complete':continue
            if previous:
                covered_ids=json.loads(previous[2]).get('coveredByQueries',[])
            else:
                covered_ids=[aid for aid in ('node-llm','node-neural-network')if aid!=q['id']and db.execute("SELECT 1 FROM queries WHERE id=? AND status='complete'",(aid,)).fetchone()]
            covered=[next(p for p in plan['queries']if p['id']==aid)for aid in covered_ids]
            proof={'coveredByQueries':covered_ids,'coverageRule':'Q is contained in union(previous complete queries, Q ANDNOT previous complete queries); no local keyword matching is used.'}
            db.execute('INSERT OR REPLACE INTO queries VALUES(?,?,?,?,?)',(q['id'],h,'running',None,json.dumps(proof)));db.commit();report()
            try:
                result=exhaust(lambda begin,end,start,excluded=None:page(q,begin,end,start,covered,excluded),q['from'],q['to'])
                result.update(proof)
                count=db.execute('SELECT COUNT(*)FROM hits WHERE query_id=?',(q['id'],)).fetchone()[0]
                if count!=result['total']:raise ValueError('Unique query IDs do not match reported total')
                db.execute('UPDATE queries SET status=?,total=?,details=?WHERE id=?',('complete',result['total'],json.dumps(result),q['id']))
            except Exception as e:
                db.execute('UPDATE queries SET status=?,details=?WHERE id=?',('incomplete',json.dumps({**proof,'error':str(e)}),q['id']))
                print('INCOMPLETE '+q['id']+' '+str(e),flush=True)
            db.commit();report()
    result=report();print(json.dumps({k:result[k]for k in ['uniquePapers','queryHits','completedQueries','totalQueries']}),flush=True)
    db.close()

if __name__=='__main__':main()
