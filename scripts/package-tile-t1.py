"""Create the frozen TILE T1 review handoff without replacing prior M3 evidence."""
from pathlib import Path
import hashlib, json, zipfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output"
DEST = OUT / "SignalKey-TILE-T1-Review-Kit.zip"
VERIFY = OUT / "SignalKey-TILE-T1-Review-Kit.verification.json"
FILES = [
    "README.md", "LICENSE-STATUS.md", "docs/README.md", "docs/READINESS-INTEGRATION.md", "docs/GITHUB-PUBLICATION.md", "manufacturing/START-HERE.md",
    "manufacturing/RELEASE-MANIFEST.md", "manufacturing/MANUFACTURER-PARTNERSHIP-NOTE.md", "hardware/prototype/README.md",
    "hardware/prototype/WIRING-P3.md", "hardware/pcb/ENGINEERING-REVIEW.md",
    "mechanical/README.md", "mechanical/tile-t1/README.md",
    "mechanical/tile-t1/tile-t1.scad", "mechanical/tile-t1/tile-t1-bom.csv",
    "mechanical/tile-t1/inspection-record.csv", "mechanical/tile-t1/PROTOTYPE-AND-PRODUCTION.md",
    "mechanical/tile-t1/STEP-EXPORT-BLOCKED.md", "mechanical/tile-t1/exports",
    "scripts/export-tile-t1.py", "scripts/draw-tile-t1.py", "scripts/package-tile-t1.py",
]
def sha(data): return hashlib.sha256(data).hexdigest()
members=[]
for spec in FILES:
    path=ROOT/spec
    paths=sorted(p for p in path.rglob("*") if p.is_file()) if path.is_dir() else [path]
    for p in paths:
        arc=p.relative_to(ROOT).as_posix(); data=p.read_bytes()
        members.append((p,arc,data))
manifest={"kit":"SignalKey TILE T1 review kit","revision":"T1","purpose":"digital-review and physical-fit-prototype handoff; not a production release","files":[{"path":a,"sha256":sha(d),"bytes":len(d)} for _,a,d in members]}
manifest_data=json.dumps(manifest,indent=2).encode()
with zipfile.ZipFile(DEST,"w",compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for _,arc,data in members:z.writestr(arc,data)
    z.writestr("SHA256SUMS.json",manifest_data)
with zipfile.ZipFile(DEST) as z:
    bad=z.testzip()
    assert bad is None, bad
    assert set(z.namelist()) == {a for _,a,_ in members}|{"SHA256SUMS.json"}
VERIFY.write_text(json.dumps({"archive":DEST.name,"sha256":sha(DEST.read_bytes()),"bytes":DEST.stat().st_size,"memberCount":len(members)+1,"zipReadback":"PASS","limitations":["No STEP B-rep export is included","No physical print/fit/electrical/optical/tooling result is included","Existing P3 hardware uses bounded, not measured, CAD envelopes"]},indent=2))
print("T1 package PASS:",DEST)
