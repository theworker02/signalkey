from pathlib import Path
import hashlib,json,trimesh
expected={'base':[55,55,20],'lid':[55,55,2],'cap':[38.5,38.5,10],'diffuser':[43,43,1.4],'carrier':[49.4,40.5,1.8]}
results=[]
for name,dimensions in expected.items():
    file=Path('mechanical/exports')/(name+'.stl')
    mesh=trimesh.load_mesh(file)
    result={'part':name,'watertight':bool(mesh.is_watertight),'consistentWinding':bool(mesh.is_winding_consistent),'positiveVolume':bool(mesh.volume>0),'bounds_mm':mesh.extents.round(4).tolist(),'volume_mm3':round(float(mesh.volume),3),'sha256':hashlib.sha256(file.read_bytes()).hexdigest()}
    assert result['watertight'] and result['consistentWinding'] and result['positiveVolume'],result
    assert all(abs(a-b)<0.02 for a,b in zip(mesh.extents,dimensions)),result
    results.append(result)
collision=trimesh.load_mesh('.local/collision.stl')
collision_volume=abs(float(collision.volume)) if hasattr(collision,'volume') else 0
assert collision_volume<0.0001,collision_volume
report={'revision':'M1','method':'OpenSCAD 2021.01 CGAL export + trimesh 4.8.1 mesh inspection','parts':results,'sampledCollisionVolume_mm3':collision_volume,'limits':'Ideal geometry only. Collision result includes intended zero-volume contact faces. Samples cap travel at 0.05 mm steps. No printed fit, strength, return spring, connector or actual PCB validation.'}
Path('mechanical/exports/verification.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
