"""Export and inspect SignalKey TILE T1 from its native OpenSCAD source.

The 3MF/STL files are prototype geometry. STEP requires a B-rep CAD translator
which is not installed in this workspace; see STEP-EXPORT-BLOCKED.md.
"""
from pathlib import Path
import hashlib, json, subprocess, datetime
import trimesh

root=Path(__file__).resolve().parents[1]
src=root/"mechanical/tile-t1/tile-t1.scad"
out=src.parent/"exports";out.mkdir(exist_ok=True)
openscad=root/".local/tools/openscad/openscad-2021.01/openscad.com"
parts={"T1-01-upper":"upper","T1-02-button":"button","T1-03-guide":"guide","T1-04-lightguide":"lightguide","T1-05-lower":"lower","T1-06-guide-coupon":"coupon"}
rows=[]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def invoke(args):
 r=subprocess.run([str(openscad),*args,str(src)],text=True,capture_output=True)
 assert r.returncode==0, r.stdout+r.stderr
for ident,part in parts.items():
 stl=out/f"{ident}.stl"
 three=out/f"{ident}.3mf"
 invoke(["-o",str(stl),"-D",f'part="{part}"'])
 invoke(["-o",str(three),"-D",f'part="{part}"'])
 mesh=trimesh.load_mesh(stl)
 assert mesh.is_watertight and mesh.is_winding_consistent and abs(mesh.volume)>1,ident
 if part!="coupon":
  adjacency=[[] for _ in mesh.faces]
  for a,b in mesh.face_adjacency: adjacency[a].append(b); adjacency[b].append(a)
  seen={0}; todo=[0]
  while todo:
   for v in adjacency[todo.pop()]:
    if v not in seen:seen.add(v);todo.append(v)
  assert len(seen)==len(mesh.faces),ident
 rows.append({"id":ident,"part":part,"stl":stl.name,"threeMf":three.name,"boundsMm":[round(float(x),3) for x in mesh.extents],"volumeMm3":round(abs(float(mesh.volume)),3),"watertight":True,"windingConsistent":True,"sha256Stl":sha(stl),"sha2563mf":sha(three)})
for view in ["assembly","exploded","section"]:
 invoke(["-o",str(out/f"{view}.png"),"--imgsize=1600,1200","--autocenter","--viewall","-D",f'part="{view}"'])
for view in ["top","rear","underside"]:
 invoke(["-o",str(out/f"{view}.svg"),"-D",f'part="{view}"'])
report={
 "revision":"T1","date":datetime.datetime.now(datetime.timezone.utc).isoformat(),
 "sourceSha256":sha(src),"tool":"OpenSCAD 2021.01 + trimesh",
 "scope":"Digital export/mesh checks only; no physical prototype or component-fit result",
 "parts":rows,
 "views":["assembly.png","exploded.png","section.png","top.svg","rear.svg","underside.svg"],
 "limits":["No STEP B-rep exporter installed","E1 PCB, USB-C connector, low-profile switch, LED and light-guide supplier drawings unavailable","No physical print, tactile, optical, thermal, connector or durability validation"]
}
(out/"T1-export-verification.json").write_text(json.dumps(report,indent=2))
print(f"T1 export PASS: {len(rows)} STL/3MF sets, watertight production meshes, 6 views.")
