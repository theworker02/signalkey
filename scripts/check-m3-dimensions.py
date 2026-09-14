from pathlib import Path
import json,hashlib,math
import trimesh
root=Path(__file__).resolve().parents[1];out=root/'mechanical/closed-m3/exports'
report=json.loads((out/'assembly-verification.json').read_text())
assert report['sourceSha256']==hashlib.sha256((out.parent/'enclosure.scad').read_bytes()).hexdigest()
expected={'shell':[150,110,60],'lid':[150,110,9],'lens':[46,46,4.5],'tray':[62,50,10.1],'clamp':[22,12,5]}
for name,dims in expected.items():
 m=trimesh.load_mesh(out/(name+'.stl'))
 assert all(abs(a-b)<.001 for a,b in zip(m.extents,dims)),name
 old=next(r for r in report['meshes'] if r['file']==name+'.stl')
 assert old['sha256']==hashlib.sha256((out/(name+'.stl')).read_bytes()).hexdigest()
checks={'lensRadialGapMm':(42.6-42)/2,'lensAxialGapMm':58.5-58.3,'ringRadialReserveMm':(38-36.8)/2,'ringToLensGapBeforeAdhesiveMm':58.5-(50+6.7),'switchSeatThicknessMm':63-61.4,'switchBodyToFloorMm':61.4-38.1-3,'trayDriverD4ToBodyRadialReserveMm':math.hypot(28,22)-24-2,'lidDriverD6ToLightReserveMm':min(math.hypot(x-28,y) for x in [-65,65] for y in [-45,45])-21-3,'clampDriverD4ToPocketXReserveMm':11.2-7-2}
assert all(v>0 for v in checks.values())
data={'method':'mesh bounds/hash recheck and nominal arithmetic; not physical inspection','expectedPrintBoundsMm':expected,'checks':checks,'limitations':['Actual tool tip/head envelopes and fastener torque unqualified','Adhesive thickness reduces optical reserve','Cable bore is not a qualified clamp','Purchased full component solids absent']}
(out/'dimension-verification.json').write_text(json.dumps(data,indent=2))
print('M3: five mesh bounds/hash checks and nine nominal fit/tool reserves pass.')
