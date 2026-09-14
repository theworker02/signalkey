import subprocess,json,hashlib,sys
from pathlib import Path
import trimesh
root=Path(__file__).resolve().parents[1]
scad=root/'mechanical/bench-m2/stand.scad'
out=scad.parent/'exports';out.mkdir(exist_ok=True)
exe=root/'.local/tools/openscad/openscad-2021.01/openscad.com'
rows=[]
def export(name,part,expected,extra=[]):
 file=out/(name+'.stl')
 cmd=[str(exe),'-o',str(file),'-D',f'part="{part}"',*extra,str(scad)]
 r=subprocess.run(cmd,capture_output=True,text=True);assert r.returncode==0,r.stderr
 m=trimesh.load_mesh(file)
 assert m.is_watertight and m.is_winding_consistent and m.volume>0,name
 adjacency=[[] for _ in m.faces]
 for a,b in m.face_adjacency:adjacency[a].append(b);adjacency[b].append(a)
 visited={0};pending=[0]
 while pending:
  for v in adjacency[pending.pop()]:
   if v not in visited:visited.add(v);pending.append(v)
 assert len(visited)==len(m.faces),name
 assert all(abs(a-b)<.02 for a,b in zip(m.extents,expected)),(name,m.extents)
 assert abs(m.bounds[0,2])<.001,(name,m.bounds)
 rows.append(dict(file=file.name,boundsMm=m.extents.tolist(),volumeMm3=float(m.volume),closed=True,oneBody=True,sha256=hashlib.sha256(file.read_bytes()).hexdigest()))
export('base','base',[180,110,3]);export('deck','deck',[180,110,3]);export('spacer-print-four','spacer',[14,14,45])
for h in [30,30.2,30.4]:
 for t in [1.2,1.6,2]:export(f'coupon-hole{h:g}-seat{t:g}','coupon',[46,46,t],['-D',f'hole_d={h}','-D',f'seat_t={t}'])
for part in ['base_dxf','deck_dxf','pocket_dxf']:
 r=subprocess.run([str(exe),'-o',str(out/(part+'.dxf')),'-D',f'part="{part}"',str(scad)],capture_output=True,text=True);assert r.returncode==0,r.stderr
for part in ['assembly','exploded']:
 r=subprocess.run([str(exe),'-o',str(out/(part+'.png')),'--imgsize=1200,900','--autocenter','--viewall','-D',f'part="{part}"',str(scad)],capture_output=True,text=True);assert r.returncode==0,r.stderr
# Exact model-level relationships, not physical test results.
checks={'boltPitchMm':[160,90],'stackWithoutFeetMm':51,'buttonSeatToBaseMm':3+45+3-1.6-3,'buttonDepthAllowanceMm':38.1,'remainingButtonMarginMm':3+45+3-1.6-3-38.1,'breadboardEnvelopeMm':[55,82.6,9.3],'accessWindowMm':[66,94],'boltBelowBaseMm':55-51,'minimumFootHeightMm':6}
assert checks['remainingButtonMarginMm']>0
assert checks['accessWindowMm'][0]>55 and checks['accessWindowMm'][1]>82.6
report={'sourceSha256':hashlib.sha256(scad.read_bytes()).hexdigest(),'exporterSha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'revision':'M2','status':'digital geometry verified; physical fit and load untested','method':'OpenSCAD 2021.01 export; trimesh mesh checks; declared envelope checks','parts':rows,'checks':checks,'limits':['No physical print or received-part fit test','No structural simulation or load certification','No exact full component solids; assembly colors include reference envelopes','DXF profiles are machining inputs, not CNC programs']}
(out/'verification.json').write_text(json.dumps(report,indent=2))
subprocess.run([sys.executable,str(root/'scripts/check-bench-dxf.py')],cwd=root,check=True)
print(f'PASS: {len(rows)} single-body closed STL exports, 3 DXF profiles, 2 CAD renders; dimensional checks pass.')
