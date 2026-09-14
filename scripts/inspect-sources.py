"""Local primary-source extraction. Stores source-page text only in ignored .local."""
from pathlib import Path
import fitz, json, hashlib
root=Path('.local/sources')
selected=[root/'pico.pdf',next(root.rglob('USB Type-C Spec R2.5 - March 2026.pdf')),next(root.rglob('Suspend Current ECN.pdf')),next(root.rglob('usb_20.pdf'))]
terms={'pico':['GP2','VBUS','Micro-USB'], 'USB Type-C Spec R2.5 - March 2026':['5.1','Table 4-25','USB 2.0 D+','Default USB Power'], 'Suspend Current ECN':['2.5','100'], 'usb_20':['unit load','500 mA','100 mA']}
manifest=[]
for file in selected:
    doc=fitz.open(file)
    output=root/(file.stem+'.txt')
    output.write_text('\n'.join(f'\nPAGE {i+1}\n'+p.get_text() for i,p in enumerate(doc)),encoding='utf8')
    hits=[]
    for i,p in enumerate(doc):
        text=p.get_text()
        if any(term.lower() in text.lower() for term in terms[file.stem]):hits.append(i+1)
    print(file.name,'pages',len(doc),'hits',hits[:100])
    manifest.append({'title':file.name,'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'pages':len(doc),'matchedPages':hits})
Path('docs/evidence/source-documents.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
