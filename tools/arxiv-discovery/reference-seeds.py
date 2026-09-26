"""Extract explicit arXiv references from previously inspected seed papers.
References are discovery leads, never an importance or admission decision.
"""
import json,pathlib,re
ROOT=pathlib.Path(__file__).resolve().parents[2]
catalog=json.loads((ROOT/'proposals/arxiv-catalog/records.json').read_text(encoding='utf-8'))
found={};unavailable=[]
accepted=[r for r in catalog['records']if r['decision']in('admitted','existing-retained','merged-existing')]
for row in accepted:
    file=ROOT/'.tmp/arxiv-review'/(row['arxivId']+'.json')
    if not file.exists():unavailable.append(row['arxivId']);continue
    source=json.loads(file.read_text(encoding='utf-8'))
    text=source.get('pdf',{}).get('text')or source.get('html',{}).get('text','')
    # Require an explicit arXiv marker; don't interpret numbers in tables as IDs.
    for match in re.finditer(r'arxiv\s*(?:(?:\.org/(?:abs|pdf|html)/)|[:\s]+)(\d{4}\.\d{4,5}|[a-z.-]+/\d{7})(?:v\d+)?',text,re.I):
        aid=match.group(1)
        if aid==row['arxivId']:continue
        entry=found.setdefault(aid,{'arxivId':aid,'citingSeedIds':[],'contexts':[],'status':'explicit-reference-awaiting-metadata-check'})
        if row['arxivId']not in entry['citingSeedIds']:
            entry['citingSeedIds'].append(row['arxivId'])
            entry['contexts'].append({'seed':row['arxivId'],'text':' '.join(text[max(0,match.start()-160):match.end()+120].split())})
result={'schemaVersion':1,'date':'2026-09-23','seedCount':len(accepted),'missingSeedBodies':unavailable,'method':'显式arXiv标识的一跳参考线索；未声称完整提取所有参考文献，也未递归追踪全部文献链。','references':sorted(found.values(),key=lambda r:r['arxivId'])}
(ROOT/'proposals/arxiv-catalog/reference-search-seeds.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Accepted seed papers:',len(accepted),'Explicit arXiv reference IDs:',len(found),'Missing bodies:',len(unavailable))
