from pathlib import Path
import html, json, csv, itertools
root=Path(__file__).resolve().parents[1]
out=root/'mechanical/closed-m3/exports';out.mkdir(exist_ok=True)
class Sheet:
 def __init__(self,title,subtitle):
  self.s=['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="820" viewBox="0 0 1200 820"><rect width="1200" height="820" fill="#fff"/><style>text{font-family:Segoe UI,Arial,sans-serif;fill:#22334b} .small{font-size:17px} .label{font-size:20px} .title{font-size:31px;font-weight:600}</style>']
  self.text(40,48,title,'title');self.text(40,80,subtitle,'small');self.line(40,100,1160,100,'#d8dfe7')
 def text(self,x,y,t,cls='label',anchor='start'):self.s.append(f'<text x="{x}" y="{y}" font-family="Arial" font-size="{31 if cls=="title" else 17 if cls=="small" else 20}" fill="#22334b" text-anchor="{anchor}">{html.escape(t)}</text>')
 def line(self,x,y,x2,y2,c='#26384d',w=2):self.s.append(f'<path d="M{x},{y} L{x2},{y2}" fill="none" stroke="{c}" stroke-width="{w}"/>')
 def rect(self,x,y,w,h,fill='#f2f5f8',r=0):self.s.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="#34475f" stroke-width="2"/>')
 def circle(self,x,y,r,fill='#fff'):self.s.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="#34475f" stroke-width="2"/>')
 def dim(self,x,y,x2,y2,label):
  self.line(x,y,x2,y2,'#46759b',1.3)
  if y==y2:
   self.line(x,y-7,x,y+7);self.line(x2,y-7,x2,y+7);self.text((x+x2)/2,y-10,label,'small','middle')
  else:
   self.line(x-7,y,x+7,y);self.line(x2-7,y2,x2+7,y2);self.text(x-12,(y+y2)/2,label,'small','end')
 def save(self,file):file.write_text(''.join(self.s)+'</svg>',encoding='utf8')

s=Sheet('M3 / closed enclosure assembly','Nominal dimensions in mm • Prototype fit drawing • Source: mechanical/closed-m3/enclosure.scad')
cx,cy,k=295,305,2.6
s.rect(cx-75*k,cy-55*k,150*k,110*k,'#f1f4f8',12*k)
for x,y in itertools.product([-65,65],[-45,45]):s.circle(cx+x*k,cy-y*k,1.7*k)
s.circle(cx-43*k,cy,16.6*k,'#fff');s.circle(cx+28*k,cy,21*k,'#cbeaf6')
s.dim(cx-75*k,137,cx+75*k,137,'150 overall')
s.dim(75,cy-55*k,75,cy+55*k,'110')
s.dim(cx-43*k,cy+85,cx+28*k,cy+85,'71 centres')
s.text(125,482,'PLAN / rear cable exit at +Y','small')
s.text(580,160,'CONTROL / LIGHT INTERFACES')
for i,t in enumerate(['Button: Ø30.2 bore at X−43,Y0','Ø38 relief; 1.6 mm snap-in seat','Light: Ø42.6 opening at X28,Y0','Lens: Ø42 × 3; flange Ø46 × 1.5','Tray: Ø38 pocket / Ø48 outer wall','Lid fasteners: X±65,Y±45; Ø3.4','Tray fasteners: X0/56,Y±22; Ø2.4','Case corner R12; walls 2.4; floor 3']):s.text(580,199+i*32,t,'small')
s.rect(100,557.8,390,156,'#eef2f7');s.rect(100,550,390,7.8,'#d4dce8')
s.rect(155,542.2,86,7.8,'#fff');s.dim(75,557.8,75,713.8,'60 shell')
s.text(110,748,'FRONT / case 63 high; bezel reference adds 3','small')
s.text(580,532,'LIGHT STACK / Z from outside floor')
for i,t in enumerate(['63.0  lid / lens top','60.0  shell top / lens flange shoulder','58.5  lens underside','58.3  tray rim (0.20 nominal axial gap)','56.7  maximum ring envelope top','50.0  ring seating floor','48.2  tray underside','1.8 mm ring-to-lens nominal optical gap']):s.text(580,566+i*26,t,'small')
s.save(out/'assembly-drawing.svg')

s=Sheet('P3 / wiring and lighting','Functional wiring map • Pin-to-pin authority: hardware/prototype/WIRING-P3.md • No powered hardware test')
s.rect(65,180,240,470,'#eef3f8',12);s.text(85,215,'PICO H / RP2040')
for y,t in [(260,'40  VBUS'),(330,'6    GP4 / enable'),(430,'4    GP2 / data'),(500,'5    GP3 / button'),(560,'3    GND'),(610,'36  3V3 / FAULT pull-up')]:s.text(85,y-8,t,'small')
s.rect(460,155,240,190,'#f5f1e9',10);s.text(480,184,'U5 / TPS2553DBVR');s.text(480,214,'1 IN       6 OUT','small');s.text(480,270,'3 EN','small');s.text(480,305,'5 ILIM / 4 FAULT','small');s.text(620,333,'2 GND','small')
s.rect(460,380,240,175,'#eef2fa',10);s.text(480,409,'U4 / AHCT1G125');s.text(480,444,'2 A          4 Y','small');s.text(480,481,'5 VCC = VBUS','small');s.text(480,521,'1 /OE + 3 GND → GND','small')
s.rect(910,155,245,400,'#edf8fc',14);s.text(930,185,'12 RGB LEDs');s.text(930,218,'1643 / 5V','small');s.circle(1033,305,62,'#d4eef9');s.circle(1033,305,37,'#fff');s.text(930,407,'DIN, not DOUT','small');s.text(930,476,'DOUT unconnected','small');s.text(930,516,'GND common','small')
red='#bb5147';blue='#386db3';yellow='#9e7819'
for a in [(305,260,350,260),(350,260,350,205),(350,205,460,205),(350,260,350,360),(350,360,420,360),(420,360,420,470),(420,470,460,470),(700,205,910,205)]:s.line(*a,red,3)
s.text(716,186,'LED_5V (gated)','small')
for a in [(305,330,390,330),(390,330,390,260),(390,260,460,260)]:s.line(*a,blue,3)
s.line(305,430,460,430,yellow,3);s.line(700,430,765,430,yellow,3);s.rect(765,414,75,32,'#fff');s.text(802,437,'330Ω','small','middle');s.line(840,430,910,430,yellow,3)
s.rect(460,615,240,65,'#f4f5f7',8);s.text(480,642,'471 / normally open');s.text(480,668,'two independent leads','small')
for a in [(305,500,355,500),(355,500,355,645),(355,645,460,645)]:s.line(*a,'#727b88',3)
s.line(305,560,330,560);s.line(330,560,330,731);s.line(330,731,1090,731,'#26384d',4)
s.line(700,650,735,650);s.line(735,650,735,731)
s.line(700,530,745,530);s.line(745,530,745,731)
s.line(700,330,725,330);s.line(725,330,725,731)
s.line(1090,555,1090,731)
s.text(805,715,'COMMON GROUND','small')
s.line(850,205,850,260,red,3);s.rect(770,260,125,66,'#fff');s.text(782,284,'+ 470µF','small');s.text(782,311,'C3 / ≥10V','small');s.line(850,326,875,326);s.line(875,326,875,731)
for x,y in [(350,260),(850,205),(330,731),(725,731),(735,731),(745,731),(875,731),(1090,731)]:s.circle(x,y,3,'#26384d')
s.text(65,770,'Crossings without dots are unconnected. Blocks are NOT package orientations. Exact IC pins: net table.','small')
s.text(65,800,'Local: 100nF at each IC; 100k on EN/A/ILIM; 10k FAULT pull-up to3V3. Bulk C3 goes AFTER the gate.','small')
s.save(out/'wiring.svg')

m=root/'mechanical/assembly-validation';m.mkdir(exist_ok=True)
s=Sheet('M1 / original five-part fit study','Historical compact concept • All mm • Not compatible with selected 38.1 mm-deep arcade switch')
s.rect(110,190,275,275,'#f3f5f8',40)
s.circle(247.5,327.5,107.5,'#d4eef9');s.circle(247.5,327.5,90,'#eef2f6')
s.dim(110,165,385,165,'55');s.dim(82,190,82,465,'55')
for x,y in itertools.product([-20,20],[-20,20]):s.circle(247.5+5*x,327.5+5*y,6)
for i,t in enumerate(['Base:55×55×20; wall2.2','Lid:55×55×2; undersideZ20','Cap:bodyØ36, flangeØ38.5; topZ24','Lid boreØ36.7 → radial gap0.35','Carrier:topZ18.2 / bottomZ16.4','Flange undersideZ18.8 → travel0.6','Diffuser:Ø43 / ID36.7 / height1.4','Diffuser seatZ21.4; topZ22.8','Rear opening12×6 atZ8.8','Lid screwsX±20,Y±20; Ø2.4','Carrier screwsX±22,Y±9; Ø2.4']):s.text(485,175+i*34,t,'small')
s.text(90,545,'Installation: board/harness → carrier → cap inserted from BELOW lid → lid/cap → diffuser.')
s.text(90,585,'Cap flange cannot pass through the lid hole. No selected spring/switch proves return.','small')
s.text(90,620,'Diffuser has no validated retention; PCB/connector/fasteners remain supplier dependencies.','small')
s.text(90,655,'Nominal collision audit covers all10 pairs,13 travel positions, tool access and a Ø3 route.','small')
s.text(90,700,'Do not interpret sampled CAD travel, mesh closure or a diagram as physical qualification.','small')
s.save(m/'assembly-drawing.svg')

# Blank physical records; actual results must be entered by the builder.
with (out.parent/'inspection-record.csv').open('w',newline='') as f:
 w=csv.writer(f);w.writerow(['test','instrument_or_method','target','actual','unit_serial','material_lot','operator','date','result'])
 for test,target in [('shell/lid size','150 x 110; fit trial ±0.3mm'),('flatness','≤0.5mm fit trial'),('button return','100 / 100 presses'),('assembly cycles','5 without damage'),('cable retention','approved force limit required before qualification'),('ring power/startup','scope VBUS LED_5V DIN GP4'),('all 12 pixels','all states visually checked'),('suspend current','whole device measured per USB test plan'),('max-white heat','30min; approved limits required'),('held reconnect','no input replay')]:w.writerow([test,'',target,'','','','','','NOT PERFORMED'])

with (root/'manufacturing/traceability-m3.csv').open('w',newline='') as f:
 w=csv.writer(f);w.writerow(['part','revision','cad','drawing','material','process','inspection','procurement_or_dependency'])
 for p in ['shell','lid','lens','tray','clamp']:
  w.writerow([p,'M3','mechanical/closed-m3/enclosure.scad; part='+p,'mechanical/closed-m3/exports/assembly-drawing.svg; README dimension schedule','translucent PETG trial' if p=='lens' else 'opaque PETG trial','FDM; CNC after supplier CAM review','mechanical/closed-m3/inspection-record.csv','resin/fastener/adhesive/torque qualification pending; not mold-ready'])
 for p in ['base','lid','cap','diffuser','carrier']:w.writerow([p,'M1','mechanical/enclosure.scad; part='+p,'mechanical/assembly-validation/assembly-drawing.svg','PETG fit-study candidate','FDM study only','assembly-verification.json + physical fit required','PCB/switch/return mechanism unresolved'])
 for p in ['base','deck','spacer']:
  w.writerow([p,'M2','mechanical/bench-m2/stand.scad; part='+p,'mechanical/bench-m2/README.md; exports/*_dxf.dxf for plates','PETG trial / insulating sheet for CNC','FDM; CNC plates/turned spacer','mechanical/bench-m2/inspection-record.csv','exact stock grade and fasteners supplier review'])
 for h,t in itertools.product([30,30.2,30.4],[1.2,1.6,2]):w.writerow([f'coupon-hole{h:g}-seat{t:g}','M2','mechanical/bench-m2/stand.scad; part=coupon','Ø'+str(h)+' hole; '+str(t)+' seat;46x46 envelope','same lot as deck','FDM','received switch fit; record best coupon','fit trial only'])
 for p,spec,dep in [('controller','Raspberry Pi Pico H / RP2040 factory headers','received header/USB envelope'),('switch','Adafruit471; nominal body29.5 bezel33.2','received clip panel range and insulated terminals'),('LED ring','Adafruit1643 RGB12;36.8 OD23.3 ID6.7 height','lot-specific LED silicon and pad positions'),('breadboard','Adafruit64;82.6x55x9.3','availability and received envelope'),('buffer','TI SN74AHCT1G125DBVR','technician adapter and decoupling'),('limiter','TI TPS2553DBVR;100k1% ILIM','technician adapter and thermal/layout review'),('passives','WIRING-P3.md value tolerance voltage schedule','exact manufacturer MPNs and footprints pending'),('USB cable','USB data cable; Pico Micro-B; targetOD4.0','exact SKU/OD/bend radius/length NOT SELECTED'),('switch leads','Adafruit1152 candidate; two separate insulated contacts','stock and exact terminal fit; no soldering by owner'),('fasteners','M3x12 qty4; M2x8 qty4; M2x10 qty2 thread-forming pan','specific screw family/pilots/torque supplier approval'),('harness carrier','35x25x12max insulated assembly + separate capacitor','supplier drawing/mounting and continuity test required')]:w.writerow([p,'P3','purchased / supplier assembly','manufacturer drawing + WIRING-P3.md',spec,'procure/assemble','incoming identity/dimensions + electrical checks',dep])
print('SVG drawings, blank fit record and complete part traceability generated.')
