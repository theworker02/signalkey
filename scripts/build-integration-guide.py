from pathlib import Path
import subprocess,json
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.pagesizes import landscape,A4
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
root=Path(__file__).resolve().parents[1]
assets=root/'mechanical/closed-m3/exports'
# MuPDF converts the local engineering SVGs; no generated/raster edit is involved.
code="import fitz; from pathlib import Path; p=Path('mechanical/closed-m3/exports'); [(lambda d,n: d[0].get_pixmap(matrix=fitz.Matrix(1.5,1.5)).save(str(p/(n+'.png'))))(fitz.open('pdf',fitz.open(str(p/(n+'.svg'))).convert_to_pdf()),n) for n in ['assembly-drawing','wiring']]"
subprocess.run([str(root/'.local/python/Scripts/python.exe'),'-X','utf8','-c',code],cwd=root,check=True)
pdfmetrics.registerFont(TTFont('Segoe','C:/Windows/Fonts/segoeui.ttf'))
pdfmetrics.registerFont(TTFont('SegoeBold','C:/Windows/Fonts/segoeuib.ttf'))
dest=root/'output/pdf/SignalKey-Closed-Enclosure-and-Integration-Guide.pdf';dest.parent.mkdir(exist_ok=True)
W,H=landscape(A4);c=canvas.Canvas(str(dest),pagesize=(W,H));c.setTitle('SignalKey — Closed enclosure, wiring and integration');c.setAuthor('Magnexis')
navy=colors.HexColor('#20334a');muted=colors.HexColor('#596b80');blue=colors.HexColor('#2a709f')
page=0
def text(x,y,t,size=11,bold=False,color=navy):
 c.setFillColor(color);c.setFont('SegoeBold' if bold else 'Segoe',size);c.drawString(x,y,t)
def para(x,top,w,t,size=11):
 p=Paragraph(t,ParagraphStyle('p',fontName='Segoe',fontSize=size,leading=size*1.45,textColor=navy))
 _,h=p.wrap(w,1000);assert top-h>28,(t,top,h);p.drawOn(c,x,top-h);return top-h
def start(kicker,title):
 global page
 if page:c.showPage()
 page+=1
 c.setFillColor(colors.white);c.rect(0,0,W,H,fill=1,stroke=0)
 text(38,H-36,'MAGNEXIS / SIGNALKEY',10,True,blue)
 text(38,H-61,kicker,10,False,muted)
 text(38,H-99,title,28,True)
 footer()
def footer():
 c.setStrokeColor(colors.HexColor('#dbe2e9'));c.line(38,29,W-38,29)
 text(38,15,'M3 / P3 • Engineering prototype • 13 September 2026',8,False,muted)
 text(W-91,15,f'{page:02d} / 08',8,False,muted)
def picture(name,x,y,w,h):c.drawImage(str(assets/name),x,y,width=w,height=h,preserveAspectRatio=True,anchor='c',mask='auto')
start('01 / ENCLOSED PROTOTYPE','A closed box. A button. A clear status light.')
picture('assembly.png',22,71,535,405)
text(580,459,'150 × 110 × 63 mm',20,True)
top=para(580,428,220,'Continuous walls, rounded corners and a removable lid. A white button sits beside a separate diffused RGB status light. The rear split clamp allows installation of a complete USB cable.')
top=para(580,top-18,220,'<b>Five printable parts</b><br/>Shell · lid · lens · LED tray · cable clamp')
top=para(580,top-18,220,'The view comes from the CAD geometry. Colours illustrate intent; it is not an optical simulation or a photograph of built hardware.',10)
para(38,64,745,'<b>Evidence:</b> nominal custom-part interference and mesh checks pass. Physical fit, cable retention, electrical behaviour and light uniformity remain untested. The prior open M2 structure is a bench fixture.',10)
start('02 / INSTALLATION ORDER','Build the lid assembly, then close the case.')
picture('exploded.png',25,80,425,390)
steps=[('1  Check the print','Print switch coupons first. Measure the case, holes, seat and lens. Clear debris before installing electronics.'),('2  Assemble the top upside down','Snap in the switch, insert the lens from below, seat the insulated LED ring in its tray, route leads through the notch and screw the tray to the lid.'),('3  Install controller and harness','Mount the Pico/breadboard and supplier-built protection harness on insulated supports. Keep all conductors clear of switch travel and screw posts.'),('4  Route the complete USB cable','Connect Pico first, form a relaxed internal loop, then assemble the split clamp around the cable. Confirm actual cable OD and retention.'),('5  Close and inspect','Connect service loops, lower the lid without pinching wires and tighten evenly. Check button return and captured lens before powered commissioning.')]
y=467
for head,body in steps:
 text(472,y,head,12,True);y=para(472,y-10,326,body,10)-22
para(38,65,745,'Exploded drawing shows the five custom parts. Electronics, adhesives, screws and the actual harness are purchased/supplier assemblies. Use the pin-level wiring schedule; do not wire from an appearance render.',10)
# Drawing sheets already contain their own complete title blocks.
for name in ['assembly-drawing.png','wiring.png']:
 c.showPage();page+=1;picture(name,22,38,W-44,H-49);footer()
start('05 / PIN-LEVEL ASSEMBLY','Wire by endpoint, then verify with a meter.')
rows=[('Pico40 / VBUS','U5.1 IN and U4.5 VCC'),('Pico3 / GND','U5.2, U4.3, U4.1 /OE, ring GND, switch return'),('Pico5 / GP3','Normally-open button contact; internal pull-up'),('Pico4 / GP2','U4.2 A; 100kΩ pulldown to GND'),('Pico6 / GP4','U5.3 EN; 100kΩ pulldown to GND'),('U4.4 Y','330Ω series resistor → ring DIN'),('U5.6 OUT','Ring5V and C3 positive; switched rail'),('U5.5 ILIM','100kΩ ±1% to GND'),('U5.4 FAULT','Test point;10kΩ to Pico36 / 3V3'),('C1 / C2','100nF X7R ≥10V, local bypass at each IC'),('C3','470µF ±20% ≥10V, AFTER U5; polarity checked')]
y=460
for i,(a,b) in enumerate(rows):
 if i%2==0:c.setFillColor(colors.HexColor('#f0f4f8'));c.rect(38,y-28,507,31,fill=1,stroke=0)
 text(47,y-12,a,9.5,True);para(196,y-1,338,b,9.4);y-=32
text(570,457,'BEFORE POWER',13,True)
top=para(570,438,230,'U4: SN74AHCT1G125DBVR<br/>U5: TPS2553DBVR<br/>Exact package pinouts matter. U5 is active-high. Bare ICs require a technician-built adapter.',10)
top=para(570,top-14,230,'Pico pins3 and5 are not adjacent. Use separate insulated contacts. Ring DOUT is unused. Do not connect LEDs to3V3 or parallel an external5V supply with USB.',10)
top=para(570,top-14,230,'The buffer stays on VBUS; the ring is gated. Measure VCC4.5–5.5V, startup and shutdown DIN, current limiting and suspend. The added50ms data delay is a bench starting value.',10)
para(38,80,745,'Full wire/passive specification, rail assumptions, proposed lengths and technician test order: hardware/prototype/WIRING-P3.md. Cable SKU, harness carrier, passive ordering codes and exact terminations remain supplier dependencies.',10)
start('06 / FIT, LIGHT AND MANUFACTURING','Give the wiring room. Measure the real assembly.')
picture('section.png',24,147,490,330)
para(38,143,464,'Section removes the front wall only to reveal the interior. The manufactured shell has all four walls. Coloured paths are proposed wiring routes; blocks are reference envelopes, not supplier component CAD.',10)
text(545,458,'PHYSICAL FIT RECORD',13,True)
top=para(545,438,255,'Record printer, filament lot, slicer and all measured dimensions. Start with opaque PETG parts and a translucent PETG lens; optical production material needs supplier selection.',10)
top=para(545,top-12,255,'Trial goals: size±0.3mm, flatness≤0.5mm, five clean assembly cycles,100/100 button returns, no pinched wire and all12pixels working. These are proposed acceptance goals, not measured results.',10)
top=para(545,top-12,255,'Ring-to-lens gap is1.8mm nominal before adhesive. Check hot spots, wire shadows, brightness and heat. A CAD colour cannot establish light quality. Capture photos and temperature/current readings.',10)
para(545,top-12,255,'FDM: fit prototypes.<br/>CNC: supplier-reviewed pockets and drilling.<br/>Molding: separate DFM with draft, cored posts, resin and tooling.<br/>Robot assembly: pretested modules, qualified fixture/torque and independent safety system.',10)
para(38,62,745,'Trace every custom and purchased item using manufacturing/traceability-m3.csv. M3 is not mold-ready and has no released carrier PCB, assembly robot motion program, qualified screw torque or proven cable pull limit.',10)
start('07 / READINESS EVIDENCE','Software evidence is stronger. Physical gates remain.')
rows=[('Profile → gesture → real command','PASS','Packaged UI; actual child process; approval dialog uses test adapter'),('Restart / portable upgrade / reinstall','PASS','Same Windows host; custom profile bytes retained; no startup execution'),('Duplicate / crash / no replay','PASS','Single admission; forced process exit recovered as interrupted/unknown'),('Automated software tests','23 PASS','Windows / Node 24.16; transport boundary uses fake HID'),('M1 and M3 nominal CAD','PASS','M1: 26 checks; M3: 10 part pairs; five M3 closed meshes'),('ARM compile/link','PASS','Pinned SDK and toolchain; invalid-ID build-check, not flashable'),('Physical USB / LEDs / print fit','BLOCKED','No received board, completed harness or printed parts'),('Clean PC / signed distribution / factory','PENDING','No second machine, signing, mold, supplier first article or validated cell')]
y=457
for i,(req,res,detail) in enumerate(rows):
 if i%2==0:c.setFillColor(colors.HexColor('#f0f4f8'));c.rect(38,y-35,765,40,fill=1,stroke=0)
 text(47,y-13,req,10,True);text(322,y-13,res,10,True,blue);para(405,y-2,382,detail,9.5);y-=42
para(38,104,745,'<b>Priority:</b> 1. Authorize USB identity and obtain a preassembled protected harness. 2. Measure received switch/cable/ring and print coupons. 3. Validate power, LED timing, suspend and thermal behaviour. 4. Fit/optics/retention trial. 5. Clean-machine installation and signed distribution. 6. Supplier DFM and factory validation.',10)
start('08 / REPRODUCTION AND SOURCES','A review kit you can reproduce and inspect.')
text(38,459,'WINDOWS / PORTABLE BUILD',13,True)
top=para(38,439,356,'Use Node24.16.0 and the unchanged lockfile. Run npm ci, npm run typecheck, npm test, npm run build and npm run package:win. Copy the whole resulting directory, not only the EXE. Read docs/WINDOWS-INSTALLATION.md for exact paths, upgrade, backup and uninstall.',11)
top=para(38,top-17,356,'Run npx tsx scripts/integration-demo.ts with both packaged revisions present. The test creates isolated data, executes a marker command, restarts, forces a crash and verifies no replay. Native confirmation is adapted in the test; manually verify the real dialog before distribution.',10)
top=para(38,top-17,356,'Profiles live outside the installation in Electron userData. Quit via the tray before backup or upgrade. Interrupted/cancelled actions may already have external effects: inspect those effects before any manual retry. The old alpha.2 parser cannot read interrupted history records.',10)
text(438,459,'ENGINEERING / PRIMARY REFERENCES',13,True)
refs=[('Pico dimensions and pinout','https://datasheets.raspberrypi.com/pico/pico-datasheet.pdf'),('LED ring1643 dimensions and lot variation','https://www.adafruit.com/product/1643'),('Selected arcade button471','https://www.adafruit.com/product/471'),('TI AHCT buffer pinout and limits','https://www.ti.com/lit/ds/symlink/sn74ahct1g125.pdf'),('TI TPS2553 limiter and pinout','https://www.ti.com/lit/ds/symlink/tps2553.pdf'),('NeoPixel wiring practices','https://learn.adafruit.com/adafruit-neopixel-uberguide/best-practices')]
y=432
for label,url in refs:
 text(438,y,label,10,False,blue);c.linkURL(url,(438,y-3,797,y+13),relative=0);y-=30
para(438,y-6,355,'CAD regeneration: scripts/verify-assemblies.py; scripts/render-closed.py. Drawings and traceability: scripts/draw-integration.py. Full findings: docs/READINESS-INTEGRATION.md. Hashes identify the frozen demo kit; they do not certify production readiness.',10)
para(38,77,760,'The original studio, profiles, gestures, run history, M1 study, M2 bench fixture and I1 industrial plan remain. M3/P3 is the enclosed direction. No parts were purchased, no hardware was tested, and no factory release or supplier order was made.',10)
c.save();print(dest)
