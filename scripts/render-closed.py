"""CAD illustrations: same custom solids, CGAL-evaluated for clean preview faces.
Coloured harness paths are proposed routing, NOT dimensioned supplier cable CAD.
"""
import subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[1]
source=(root/'mechanical/closed-m3/enclosure.scad').read_text()
for name in ['shell','tray','lens','lid','clamp']:
 source=source.replace(f'){name}();',f')render(){name}();')
# Add reference-only harness blocks and routing. No production part geometry changes.
source=source.replace('if(explode==0)references();','if(explode==0){references();wiring_reference();}')
source+='''
module segment(a,b,d=1.8){v=b-a;translate(a)rotate([0,acos(v.z/norm(v)),atan2(v.y,v.x)])cylinder(h=norm(v),d=d);}
module cable(points,d=1.8){for(i=[0:len(points)-2])segment(points[i],points[i+1],d);}
module wiring_reference(){
 color("#416f94")translate([-57.5,-42.5,3])cube([35,25,12]);
 color("#445066")translate([-18,-30,3])cylinder(h=16,d=10);
 color("#c55d50")cable([[20,-20,15],[-25,-25,8],[-35,-25,15]]);
 color("#d7b64c")cable([[-30,-25,15],[-5,-28,20],[28,-25,30],[28,-22,50]]);
 color("#c55d50")cable([[-33,-25,15],[-7,-30,18],[30,-27,32],[30,-22,50]]);
 color("#252b34")cable([[-36,-25,15],[-9,-32,18],[32,-29,32],[32,-22,50]]);
 color("#d6dbe3")cable([[-43,2,23.3],[-43,18,12],[15,20,12],[20,5,15]]);
 color("#252b34")cable([[-43,5,23.3],[-43,22,10],[12,24,10],[20,8,15]]);
 color("#3d444e")cable([[30,25.5,18],[30,39,18],[0,39,30],[0,43,55],[0,75,55]],4);
}
'''
temp=root/'.local/assembly-audit/render.scad';temp.write_text(source)
exe=root/'.local/tools/openscad/openscad-2021.01/openscad.com'
for name in ['assembly','exploded','section']:
 r=subprocess.run([str(exe),'-o',str(root/f'mechanical/closed-m3/exports/{name}.png'),'--imgsize=1500,1100','--autocenter','--viewall','--colorscheme=Tomorrow','-D',f'part="{name}"',str(temp)],capture_output=True,text=True)
 assert r.returncode==0,(r.stdout,r.stderr)
print('Rendered M3 with evaluated faces and explicitly illustrative wiring routes.')
