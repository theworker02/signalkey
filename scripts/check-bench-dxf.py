from pathlib import Path
import json,collections
out=Path('mechanical/bench-m2/exports'); results=[]
for name,expected in [('base_dxf',9),('deck_dxf',7),('pocket_dxf',1)]:
 raw=(out/(name+'.dxf')).read_text().splitlines();pairs=list(zip([v.strip() for v in raw[::2]],[v.strip() for v in raw[1::2]]));segments=[];record={};in_line=False
 for k,v in pairs+[('0','END')]:
  if k=='0':
   if in_line:
    segments.append(((float(record['10']),float(record['20'])),(float(record['11']),float(record['21']))))
   in_line=v=='LINE';record={}
  elif in_line:record[k]=v
 graph=collections.defaultdict(list)
 for a,b in segments:graph[a].append(b);graph[b].append(a)
 assert all(len(n)==2 for n in graph.values()),name
 seen=set();components=[]
 for p in graph:
  if p in seen:continue
  stack=[p];seen.add(p);points=[]
  while stack:
   q=stack.pop();points.append(q)
   for r in graph[q]:
    if r not in seen:seen.add(r);stack.append(r)
  components.append(points)
 assert len(components)==expected,(name,len(components))
 bounds=[max(v[a] for v in graph)-min(v[a] for v in graph) for a in [0,1]]
 target=[38,38] if name=='pocket_dxf' else [180,110]
 assert all(abs(a-b)<.02 for a,b in zip(bounds,target))
 if name=='deck_dxf':
  c=min(components,key=lambda c:abs(sum(p[0] for p in c)/len(c)+50))
  assert abs(max(p[0] for p in c)-min(p[0] for p in c)-30.2)<.02
 results.append(dict(file=name+'.dxf',closedLoops=len(components),boundsMm=bounds))
p=out/'verification.json';report=json.loads(p.read_text());report['dxfChecks']=results;p.write_text(json.dumps(report,indent=2))
print('PASS: DXF loops closed, no dangling segments; expected contour counts, overall sizes and deck hole verified.')
