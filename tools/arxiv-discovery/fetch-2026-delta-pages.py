"""Resumable single-connection original-page metadata reader, without rejection inference."""
import collections,gzip,hashlib,html,json,pathlib,re,time,urllib.request
from html.parser import HTMLParser
ROOT=pathlib.Path(__file__).resolve().parents[2];HOME=ROOT/'.local/arxiv-2026-review'
class Meta(HTMLParser):
 def __init__(self):super().__init__();self.meta=collections.defaultdict(list)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='meta' and a.get('name','').startswith('citation_'):self.meta[a['name']].append(a.get('content',''))
def plain(s):return ' '.join(html.unescape(re.sub('<[^>]+>',' ',s)).split())
queue=json.loads((HOME/'delta-missing.json').read_text(encoding='utf-8'))['records'];done=set()
for name in ['delta-browser.jsonl','delta-http.jsonl']:
 p=HOME/name
 if p.exists():
  for line in p.read_text(encoding='utf-8').splitlines():
   if line.strip():done.add(json.loads(line)['arxivId'])
queue=[r for r in queue if r['arxivId'] not in done]
cache=HOME/'delta-pages';cache.mkdir(exist_ok=True)
last=time.monotonic();errors=[];success=0;consecutive=0
with (HOME/'delta-http.jsonl').open('a',encoding='utf-8') as out:
 for index,row in enumerate(queue):
  aid=row['arxivId'];url='https://arxiv.org/abs/'+aid
  try:
   path=cache/(aid+'.html.gz')
   if path.exists():raw=gzip.decompress(path.read_bytes())
   else:
    time.sleep(.2)
    with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'AIKnowledgeMap-LibraryResearch/1.0 (single connection, public metadata)'}),timeout=20) as response:raw=response.read()
    path.write_bytes(gzip.compress(raw))
   text=raw.decode('utf-8');parser=Meta();parser.feed(text);m=parser.meta
   assert m['citation_arxiv_id'][0]==aid
   assert m['citation_title'][0] and m['citation_abstract'][0]
   subject=re.search(r'<td[^>]*class=["\'][^"\']*\bsubjects\b[^"\']*["\'][^>]*>(.*?)</td>',text,re.S)
   subjects=plain(subject.group(1)) if subject else ''
   record={'arxivId':aid,'title':m['citation_title'][0],'abstract':m['citation_abstract'][0],'authors':m['citation_author'],'published':m['citation_date'][0].replace('/','-'),'categories':re.findall(r'\(([a-z-]+\.[A-Za-z-]+|[a-z-]+)\)',subjects),'url':url,'provenance':'arXiv original HTML page, checked 2026-09-23','responseSha256':hashlib.sha256(raw).hexdigest()}
   assert record['categories'], 'Subjects not parsed'
   out.write(json.dumps(record,ensure_ascii=False)+'\n');out.flush();success+=1;consecutive=0
  except Exception as exc:
   errors.append({'arxivId':aid,'url':url,'error':str(exc)});consecutive+=1
   print(json.dumps(errors[-1]),flush=True)
   if consecutive>=10:break
  if time.monotonic()-last>20:
   print(json.dumps({'position':index+1,'queue':len(queue),'success':success,'errors':len(errors)}),flush=True);last=time.monotonic()
report={'attempted':index+1 if queue else 0,'queue':len(queue),'success':success,'errors':errors,'complete':success==len(queue)}
(HOME/'delta-http-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report),flush=True)
