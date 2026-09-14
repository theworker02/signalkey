import hashlib,json,zipfile
from pathlib import Path
root=Path(__file__).resolve().parents[1]
files=[]
for folder in ['mechanical','manufacturing','hardware','docs/diagrams']:
 files += [p for p in (root/folder).rglob('*') if p.is_file()]
files += [p for p in (root/'firmware').iterdir() if p.is_file()]
for name in ['output/pdf/SignalKey-Prototype-and-Industrial-Build-Guide.pdf','manufacturing/RELEASE-MANIFEST.md','manufacturing/FACTORY-TEST.md','manufacturing/START-HERE.md','docs/LICENSING.md','docs/ENGINEERING-GUIDE.md','scripts/build-manufacturing-guide.py','docs/evidence/arm-firmware-build.json','docs/evidence/native-firmware-tests.json','packages/protocol/golden.json','scripts/export-bench.py','scripts/check-bench-dxf.py','scripts/setup-firmware-tools.ps1','scripts/build-firmware-check.ps1','scripts/test-firmware.ps1']:
 files.append(root/name)
manifest={str(p.relative_to(root)).replace('\\','/'):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(set(files))}
out=root/'output/SignalKey-M2-I1-Manufacturing-Review-Kit.zip'
with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED) as z:
 for name in manifest:z.write(root/name,name)
 z.writestr('SHA256SUMS.json',json.dumps(manifest,indent=2))
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 for name,digest in manifest.items():assert hashlib.sha256(z.read(name)).hexdigest()==digest
print(f'PASS: {len(manifest)} files packaged, every archived hash verified; {out.stat().st_size:,} bytes')
(root/'output/manufacturing-kit-verification.json').write_text(json.dumps({'file':out.name,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'files':len(manifest),'archiveIntegrity':'PASS','limits':'Digital integrity only; not physical manufacturing approval'},indent=2))
