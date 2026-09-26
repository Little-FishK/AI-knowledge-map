"""Collect observed recent-list links and retrieve missing metadata; preserve failures."""
import hashlib, html, json, pathlib, re, sqlite3, time, urllib.request
from harvest import parse_feed
ROOT=pathlib.Path(__file__).resolve().parents[2]
HOME=ROOT/'.local/arxiv-2026-review'
RECENT=HOME/'recent'
def get(url):
    time.sleep(3.1)
    with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'AIKnowledgeMap-LibraryResearch/1.0'}),timeout=35) as r:return r.read()
if __name__=='__main__':
    root=get('https://arxiv.org/').decode()
    (RECENT/'index.html').write_text(root,encoding='utf-8')
    archives=sorted(a for a in set(re.findall(r'href=["\'](?:https://arxiv.org)?/list/([^/]+)/recent',root)) if '.' not in a)
    reports=[]
    for archive in archives:
        path=RECENT/(archive+'.html')
        url='https://arxiv.org/list/'+archive+'/recent?show=2000'
        try:
            raw=path.read_text(encoding='utf-8') if path.exists() else get(url).decode()
            path.write_text(raw,encoding='utf-8')
            total=int(re.search(r'Total of\s+(\d+)\s+entries',raw).group(1))
            ids=set(re.findall(r'<dt\b[^>]*>.*?/abs/(\d{4}\.\d{4,5})',raw,re.S))
            reports.append({'archive':archive,'url':url,'total':total,'idsOnSavedFirstPage':len(ids),'additionalPagesRequired':total>len(ids)})
        except Exception as e:reports.append({'archive':archive,'url':url,'error':str(e)})
        print(json.dumps(reports[-1]),flush=True)
        (HOME/'recent-list-coverage.json').write_text(json.dumps(reports,indent=2),encoding='utf-8')
