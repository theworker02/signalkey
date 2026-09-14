"""Rebuild five-part M3 and audit M1/M3 nominal assembly contacts with CGAL.
No inferred physical pass: contact at zero volume is permitted; positive overlap fails.
"""
import subprocess,json,hashlib,itertools,datetime
from pathlib import Path
import trimesh
root=Path(__file__).resolve().parents[1]
exe=root/'.local/tools/openscad/openscad-2021.01/openscad.com'
scratch=root/'.local/assembly-audit';scratch.mkdir(exist_ok=True)
def run(source,dest,*args):
 r=subprocess.run([str(exe),'-o',str(dest),*args,str(source)],capture_output=True,text=True)
 return r
def check_mesh(file):
 m=trimesh.load_mesh(file)
 assert m.is_watertight and m.is_winding_consistent and m.volume>0,file
 # Adjacency-based connectedness requires no optional networkx dependency.
 edges=[[] for _ in m.faces]
 for a,b in m.face_adjacency:edges[a].append(b);edges[b].append(a)
 seen={0};todo=[0]
 while todo:
  for v in edges[todo.pop()]:
   if v not in seen:seen.add(v);todo.append(v)
 assert len(seen)==len(m.faces),file
 assert abs(m.bounds[0,2])<.001,file
 return dict(file=file.name,sha256=hashlib.sha256(file.read_bytes()).hexdigest(),boundsMm=m.extents.tolist(),volumeMm3=float(m.volume),closed=True,oneBody=True)
reports=[]
for rev,rel,parts in [('M1','mechanical/enclosure.scad',['base','lid','cap','diffuser','carrier']),('M3','mechanical/closed-m3/enclosure.scad',['shell','lid','lens','tray','clamp'])]:
 source=root/rel; text=source.read_text(); prefix=text.split('if(part==')[0]
 out=source.parent/('exports' if rev=='M3' else 'assembly-validation');out.mkdir(exist_ok=True)
 meshes=[]
 if rev=='M3':
  for part in parts:
   file=out/(part+'.stl');r=run(source,file,'-D',f'part="{part}"');assert r.returncode==0,r.stderr
   meshes.append(check_mesh(file))
  for part in ['assembly','exploded','section']:
   r=run(source,out/(part+'.png'),'--imgsize=1500,1100','--autocenter','--viewall','--colorscheme=Tomorrow','-D',f'part="{part}"');assert r.returncode==0,r.stderr
 pairs=[]
 expressions=[(f'{a}/{b}',f'intersection(){{{a}();{b}();}}') for a,b in itertools.combinations(parts,2)]
 if rev=='M1':
  expressions += [(f'cap travel {d/100:.2f}',f'intersection(){{cap({d/100});union(){{base();lid();carrier();diffuser();}}}}') for d in range(0,61,5)]
  expressions += [('lid driver envelope', 'intersection(){union(){cap();diffuser();}for(x=[-20,20],y=[-20,20])translate([x,y,22])cylinder(h=30,d=4);}'),('carrier driver envelope','intersection(){base();for(x=[-22,22],y=[-9,9])translate([x,y,18.2])cylinder(h=30,d=4);}'),('provisional cable D3','intersection(){union(){base();lid();carrier();cap();}translate([0,40,8.8])rotate([90,0,0])cylinder(h=40,d=3);}')]
 for n,expression in expressions:
  src=scratch/'check.scad';dest=scratch/'check.stl';src.write_text(prefix+'\n'+expression)
  if dest.exists():dest.unlink()
  r=run(src,dest)
  volume=0.
  if dest.exists():
   mesh=trimesh.load_mesh(dest);volume=abs(float(mesh.volume))
  else:assert 'top level object is empty' in (r.stderr+r.stdout), (n,r.returncode,r.stdout,r.stderr)
  pairs.append(dict(check=n,overlapMm3=volume,passNominal=volume<.001))
 report=dict(revision=rev,date=datetime.datetime.now(datetime.timezone.utc).isoformat(),sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(),tool='OpenSCAD 2021.01 CGAL / trimesh',meshes=meshes,checks=pairs,physicalValidation=False,limits=['Nominal CAD only; no supplier full solids or measured tolerances','Zero-volume intended contact permitted','No strength, optical uniformity, temperature or retention validation'])
 (out/'assembly-verification.json').write_text(json.dumps(report,indent=2))
 reports.append(report)
 print(rev, sum(x['passNominal'] for x in pairs),'/',len(pairs),'nominal checks',flush=True)
assert all(x['passNominal'] for r in reports for x in r['checks']), 'Positive-volume assembly interference; inspect reports'
