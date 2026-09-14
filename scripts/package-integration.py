"""Freeze a review kit without live user data, SDK credentials or tool caches."""
from pathlib import Path
import hashlib,json,zipfile,datetime
root=Path(__file__).resolve().parents[1]
out=root/'output';out.mkdir(exist_ok=True)
file=out/'SignalKey-Integration-M3-Review-Kit.zip'
files=[]
for folder in ['apps','brand','examples','packages','scripts','tests','docs','hardware','mechanical','manufacturing','firmware','release/0.1.0-alpha.2','release/0.1.0-alpha.2-integration']:
 files.extend(p for p in (root/folder).rglob('*') if p.is_file() and '__pycache__' not in p.parts and p.suffix!='.pyc')
for name in ['DEMO-KIT.md','README.md','CHANGELOG.md','SECURITY.md','CONTRIBUTING.md','package.json','package-lock.json','tsconfig.json','output/pdf/SignalKey-Closed-Enclosure-and-Integration-Guide.pdf','output/pdf/SignalKey-Prototype-and-Industrial-Build-Guide.pdf']:
 p=root/name
 if p.exists():files.append(p)
files=sorted(set(files))
for p in files:
 assert p.name.lower() not in ['sdk.json','active-run.json','history.json','.env'],p
 assert '.local' not in p.relative_to(root).parts,p
def digest_stream(stream):
 h=hashlib.sha256()
 while block:=stream.read(1024*1024):h.update(block)
 return h.hexdigest()
def digest(p):
 with p.open('rb') as f:return digest_stream(f)
manifest={p.relative_to(root).as_posix():digest(p) for p in files}
with zipfile.ZipFile(file,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=4,allowZip64=True) as z:
 for p in files:z.write(p,p.relative_to(root).as_posix())
 z.writestr('SHA256SUMS.json',json.dumps(manifest,indent=2))
with zipfile.ZipFile(file) as z:
 assert len(z.namelist())==len(manifest)+1
 for name,expected in manifest.items():
  with z.open(name) as f:assert digest_stream(f)==expected,name
report={'date':datetime.datetime.now(datetime.timezone.utc).isoformat(),'archive':file.name,'sha256':digest(file),'bytes':file.stat().st_size,'filesVerified':len(manifest),'allEntryHashesMatch':True,'containsBothPortableRevisions':True,'physicalHardwareValidated':False,'productionRelease':False}
(out/'integration-kit-verification.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
