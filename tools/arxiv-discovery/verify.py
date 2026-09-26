"""Check retrieval receipts independently; never equate discovery with editorial approval."""
import datetime as dt,gzip,hashlib,json,pathlib,sqlite3,urllib.parse
from harvest import parse_feed,effective_query,bridge_query
ROOT=pathlib.Path(__file__).resolve().parents[2]
plan=json.loads((ROOT/'proposals/arxiv-catalog/systematic-search-plan.json').read_text(encoding='utf-8'))
home=ROOT/plan['runDirectory'];db=sqlite3.connect(home/'discovery.sqlite')
errors=[];results=[];certified_sets={}
def leaves(tree):
    if 'children'in tree:
        children=tree['children']
        if len(children)not in(2,3):raise ValueError('Expected two children plus optional boundary bridge')
        left,right=children[:2]
        adjacent=(dt.datetime.strptime(left['to'],'%Y%m%d%H%M')+dt.timedelta(minutes=1)).strftime('%Y%m%d%H%M')
        if left['from']!=tree['from']or right['to']!=tree['to']or adjacent!=right['from']:
            raise ValueError('Date partition gap or overlap')
        if len(children)==3:
            bridge=children[2]
            if(bridge['from'],bridge['to'])!=(left['to'],right['from'])or bridge.get('excludedDateRanges')!=[[left['from'],left['to']],[right['from'],right['to']]]:
                raise ValueError('Invalid boundary bridge proof')
        if sum(c['total']for c in children)!=tree['total']:raise ValueError('Parent/child totals differ')
        for child in tree['children']:yield from leaves(child)
    else:yield tree

def branches(tree):
    if 'children'in tree:
        yield tree
        for child in tree['children']:yield from branches(child)
for q in plan['queries']:
    state=db.execute('SELECT status,total,details FROM queries WHERE id=?',(q['id'],)).fetchone()
    if not state or state[0]!='complete':
        results.append({'id':q['id'],'verified':False,'reason':state[0]if state else'not-started'});continue
    tree=json.loads(state[2]);query_ids=set();page_count=0
    try:
        dependencies=tree.get('coveredByQueries',[])
        if any(aid not in certified_sets for aid in dependencies):raise ValueError('Coverage dependency has not been verified')
        covered=[next(p for p in plan['queries']if p['id']==aid)for aid in dependencies]
        inherited=set().union(*(certified_sets[aid]for aid in dependencies))
        if(tree['from'],tree['to'],tree['total'])!=(q['from'],q['to'],state[1]):raise ValueError('Root range or total differs from plan')
        for branch in branches(tree):
            receipt=db.execute('SELECT total,sha256,cache FROM pages WHERE query_id=? AND partition=? AND start=0',(q['id'],branch['from']+'..'+branch['to'])).fetchone()
            if not receipt:raise ValueError('Missing parent count receipt')
            raw=gzip.decompress((home/'responses'/receipt[2]).read_bytes())
            if hashlib.sha256(raw).hexdigest()!=receipt[1]or parse_feed(raw)[0]!=branch['total']or receipt[0]!=branch['total']:
                raise ValueError('Parent count receipt mismatch')
        for leaf in leaves(tree):
            partition=leaf['from']+'..'+leaf['to']+('|bridge'if leaf.get('excludedDateRanges')else'');offset=0;ids=set()
            pages=db.execute('SELECT start,total,count,sha256,cache,url FROM pages WHERE query_id=? AND partition=? ORDER BY start',(q['id'],partition)).fetchall()
            if not pages:raise ValueError('No receipts for leaf '+partition)
            for start,total,count,digest,cached,url in pages:
                if start!=offset:raise ValueError('Pagination gap '+partition)
                params=urllib.parse.parse_qs(urllib.parse.urlparse(url).query)
                expected=effective_query(q,leaf['from'],leaf['to'],covered)if covered else q['query']+' AND submittedDate:['+leaf['from']+' TO '+leaf['to']+']'
                expected=bridge_query(expected,leaf.get('excludedDateRanges'))
                if params.get('search_query')!=[expected]or params.get('start')!=[str(start)]:raise ValueError('Receipt URL differs from planned query')
                raw=gzip.decompress((home/'responses'/cached).read_bytes())
                if hashlib.sha256(raw).hexdigest()!=digest:raise ValueError('Response digest mismatch '+cached)
                parsed_total,parsed_start,rows=parse_feed(raw)
                if (parsed_total,parsed_start,len(rows))!=(total,start,count):raise ValueError('Receipt does not match raw response')
                if total!=leaf['total']:raise ValueError('Leaf total drift')
                for row in rows:
                    if row['arxivId']in ids:raise ValueError('Duplicate within leaf')
                    stamp=row['published'].replace('-','').replace(':','').replace('T','')[:14]
                    if not leaf['from']+'00'<=stamp<=leaf['to']+'00':raise ValueError('Submission outside requested date range: '+row['arxivId'])
                    if any(b+'00'<=stamp<=e+'00'for b,e in leaf.get('excludedDateRanges',[])):
                        raise ValueError('Bridge includes excluded date range')
                    ids.add(row['arxivId'])
                offset+=count;page_count+=1
            if offset!=leaf['total']:raise ValueError('Leaf incomplete')
            if query_ids&ids:raise ValueError('Overlap across date partitions')
            query_ids|=ids
        stored={r[0]for r in db.execute('SELECT id FROM hits WHERE query_id=?',(q['id'],))}
        if len(query_ids)!=state[1]or stored!=query_ids:raise ValueError('Query union differs from harvested membership')
        if query_ids&inherited:raise ValueError('ANDNOT query returned an already-covered ID')
        if q['id']in('node-llm','node-neural-network'):
            certified_sets[q['id']]=query_ids|inherited
        results.append({'id':q['id'],'verified':True,'directlyRetrieved':len(query_ids),'coveredByQueries':dependencies,'verifiedLeafPages':page_count})
    except Exception as e:
        errors.append({'id':q['id'],'error':str(e)});results.append({'id':q['id'],'verified':False,'reason':str(e)})
accepted=json.loads((ROOT/'proposals/arxiv-catalog/records.json').read_text(encoding='utf-8'))['records']
missing=[r['arxivId']for r in accepted if r['decision']in('admitted','existing-retained','merged-existing')and not db.execute('SELECT 1 FROM papers WHERE id=?',(r['arxivId'],)).fetchone()]
report={'schemaVersion':1,'generatedAt':dt.datetime.now(dt.timezone.utc).isoformat(),'planRevision':plan['revision'],'queries':results,'verifiedQueries':sum(r['verified']for r in results),'plannedQueries':len(results),'allQueryTraversalsVerified':all(r['verified']for r in results),'errors':errors,'knownAcceptedSeedRecall':{'total':sum(r['decision']in('admitted','existing-retained','merged-existing')for r in accepted),'missingIds':missing},'importanceReviewComplete':False}
(ROOT/'proposals/arxiv-catalog/systematic-search-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in report.items()if k!='queries'},ensure_ascii=False))
if errors:raise SystemExit(1)
