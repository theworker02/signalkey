"""Generate clear, reviewable SVG drawing sheets for the TILE T1 proposal.

These are controlled illustrations tied to the parametric study, not GD&T drawings.
They deliberately label unmeasured component interfaces as provisional.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "mechanical" / "tile-t1" / "exports"
OUT.mkdir(parents=True, exist_ok=True)

CSS = """<style>text{font-family:Arial,sans-serif;fill:#252525}.t{font-size:22px;font-weight:bold}.h{font-size:14px;font-weight:bold}.n{font-size:11px}.d{stroke:#38424b;stroke-width:1.3;fill:none}.o{stroke:#202020;stroke-width:2;fill:#eee8df}.g{fill:#353535}.b{fill:#faf7f0;stroke:#303030;stroke-width:1.5}.a{stroke:#c57618;stroke-width:3;fill:none}.x{stroke:#c33;stroke-width:1.2;fill:none}</style>"""

def page(title, content):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="850" viewBox="0 0 1200 850">{CSS}<rect width="1200" height="850" fill="white"/><text x="45" y="48" class="t">{title}</text><text x="45" y="70" class="n">SignalKey TILE T1 · 128 × 108 × 52 mm integration proposal · dimensions in mm · digital study only</text>{content}<line x1="45" y1="810" x2="1155" y2="810" class="d"/><text x="45" y="833" class="n">Do not manufacture from this illustration alone. Refer to native parametric source, BOM, inspection record and measured component data.</text></svg>'''

def write(name, body):
    (OUT / name).write_text(page(name.replace(".svg", "").replace("-", " ").upper(), body), encoding="utf-8")

dim = '''
<text x="70" y="115" class="h">TOP VIEW — white housing / broad button / light guide</text>
<rect x="100" y="145" width="512" height="432" rx="72" class="o"/><rect x="148" y="193" width="416" height="336" rx="60" class="b"/>
<path d="M510 218 h38" class="a"/><text x="490" y="185" class="n">11 × 2.2 light feature</text>
<line x1="100" y1="125" x2="612" y2="125" class="d"/><path d="M100 120v10m512-10v10" class="d"/><text x="330" y="115" class="h">128</text>
<line x1="75" y1="145" x2="75" y2="577" class="d"/><path d="M70 145h10m-10 432h10" class="d"/><text x="45" y="370" class="h" transform="rotate(-90 45 370)">108</text>
<text x="210" y="370" class="h">104 × 84 cap</text><text x="205" y="390" class="n">1.2 nominal perimeter clearance</text>
<text x="700" y="115" class="h">SIDE VIEW — low visual mass, actual P3 depth</text>
<path d="M720 550 q0 25 32 25 h430 q32 0 32-25 v-145 q0-38-38-38H758 q-38 0-38 38z" class="o"/><rect x="728" y="548" width="478" height="28" rx="10" class="g"/><path d="M785 368 q0-22 24-22 h315 q24 0 24 22" class="b"/>
<line x1="670" y1="367" x2="670" y2="575" class="d"/><path d="M665 367h10m-10 208h10" class="d"/><text x="650" y="480" class="h" transform="rotate(-90 650 480)">52</text>
<text x="770" y="610" class="n">Graphite base: 3.2 high; 1.0 reveal. White wall: 2.4 nominal.</text>
<text x="70" y="665" class="h">REAR VIEW — connector datum provisional</text><rect x="100" y="690" width="512" height="72" rx="18" class="o"/><rect x="332" y="714" width="48" height="24" rx="5" class="g"/><text x="280" y="785" class="n">12 × 6 rear Micro-USB envelope; measure actual Pico H centerline and plug shell before cutting production tooling.</text>
<text x="700" y="665" class="h">UNDERSIDE — serviceable fasteners</text><rect x="720" y="690" width="480" height="72" rx="18" class="g"/><circle cx="765" cy="713" r="8" class="b"/><circle cx="1155" cy="713" r="8" class="b"/><circle cx="765" cy="742" r="8" class="b"/><circle cx="1155" cy="742" r="8" class="b"/><text x="815" y="785" class="n">Four M2.5 × 8 screws from below; four feet outside screw locations.</text>
'''
write("T1-dimensioned-drawing.svg", dim)

exploded = '''
<text x="70" y="125" class="h">EXPLODED ASSEMBLY — assemble from upper housing downward</text>
<rect x="350" y="150" width="500" height="145" rx="70" class="o"/><rect x="405" y="177" width="390" height="92" rx="50" class="b"/><text x="875" y="225" class="h">T1-01</text><text x="875" y="243" class="n">upper housing</text>
<rect x="425" y="340" width="350" height="110" rx="42" class="b"/><text x="800" y="395" class="h">T1-02</text><text x="800" y="413" class="n">button cap</text>
<rect x="450" y="490" width="300" height="38" rx="10" class="g"/><text x="775" y="512" class="h">T1-03</text><text x="775" y="530" class="n">guide/support</text>
<rect x="705" y="315" width="52" height="11" rx="3" fill="#d38a26"/><text x="775" y="325" class="h">T1-04</text><text x="775" y="343" class="n">light guide</text>
<circle cx="510" cy="586" r="38" class="d"/><text x="560" y="590" class="n">existing arcade switch envelope</text><rect x="645" y="548" width="145" height="75" class="d"/><text x="800" y="585" class="n">existing breadboard/Pico envelope</text>
<rect x="350" y="660" width="500" height="70" rx="28" class="g"/><text x="875" y="695" class="h">T1-05</text><text x="875" y="713" class="n">lower chassis</text>
<path d="M600 300v35m0 120v32m0 48v115" class="d"/><path d="M595 328l5 7 5-7m-10 152l5 7 5-7m-10 163l5 7 5-7" class="d"/>
<text x="75" y="770" class="n">Install four M2.5 inserts in T1-01; fit guide/button; measure switch travel and establish shim/stop; route harness; fit light guide; install electronics; close with four underside M2.5 × 8 screws; then fit feet.</text>
'''
write("T1-exploded-assembly.svg", exploded)

section = '''
<text x="70" y="125" class="h">SECTION A–A — button, switch, wiring and light routing</text>
<path d="M100 560 L100 270 Q100 220 155 220 H1000 Q1050 220 1050 270 V560Z" class="o"/><rect x="100" y="540" width="950" height="28" class="g"/>
<path d="M285 240 q0-35 38-35 h390 q38 0 38 35 v38 H285z" class="b"/><rect x="330" y="330" width="380" height="35" class="g"/><rect x="470" y="365" width="55" height="120" class="d"/><circle cx="497" cy="515" r="45" class="d"/>
<path d="M565 225 h82" class="a"/><rect x="590" y="245" width="130" height="44" class="d"/><circle cx="655" cy="267" r="35" class="d"/>
<path d="M720 475 C790 455 825 480 890 455" class="x"/><text x="895" y="452" class="n">removable harness route</text>
<text x="130" y="185" class="n">White upper housing; top fasteners absent</text><text x="335" y="320" class="n">T1-03 distributed guide / load path</text><text x="405" y="450" class="n">center plunger</text><text x="430" y="590" class="n">existing 471 button envelope</text><text x="700" y="210" class="n">T1-04 short guide</text><text x="735" y="300" class="n">existing 1643 ring envelope</text>
<text x="115" y="635" class="h">Motion targets: 0.60 stroke; 0.78 hard-stop allowance — both are CAD assumptions pending measured switch travel and force.</text>
<text x="115" y="675" class="n">Keep the guide plane clear of wires. The guide/load posts, not the PCB, receive normal overtravel. Test all corners after switch installation.</text>
<text x="115" y="710" class="n">Amber prototype guide may change RGB colour appearance. Compare clear/smoke-neutral and amber samples before selecting production optical material.</text>
'''
write("T1-section-annotations.svg", section)
print("Wrote T1 drawing sheets to", OUT)
