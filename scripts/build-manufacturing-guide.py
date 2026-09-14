from pathlib import Path
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,PageBreak,Image,Table,TableStyle,Flowable
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
root=Path(__file__).resolve().parents[1]
pdfmetrics.registerFont(TTFont('Segoe','C:/Windows/Fonts/segoeui.ttf'))
pdfmetrics.registerFont(TTFont('SegoeBold','C:/Windows/Fonts/segoeuib.ttf'))
s=getSampleStyleSheet();s.add(ParagraphStyle(name='Body',fontName='Segoe',fontSize=10,leading=15,spaceAfter=9,textColor=colors.HexColor('#25364b')));s.add(ParagraphStyle(name='TitleSK',fontName='SegoeBold',fontSize=27,leading=33,spaceAfter=16,textColor=colors.HexColor('#18354e')));s.add(ParagraphStyle(name='SubSK',fontName='SegoeBold',fontSize=14,leading=19,spaceBefore=12,spaceAfter=8,textColor=colors.HexColor('#285c7d')));s.add(ParagraphStyle(name='SmallSK',parent=s['Body'],fontSize=8,leading=11));story=[]
def p(t,style='Body'):story.append(Paragraph(t,s[style]))
def title(n,t):p('SIGNALKEY / MAGNEXIS   |   '+n,'SmallSK');p(t,'TitleSK')
def sub(t):p(t,'SubSK')
def page():story.append(PageBreak())
def table(rows,widths):
 t=Table([[Paragraph(str(c),s['SmallSK']) for c in row]for row in rows],colWidths=widths,hAlign='LEFT');t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#dce8f1')),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),('LINEBELOW',(0,0),(-1,-1),.3,colors.HexColor('#c1d1df'))]));story.append(t);story.append(Spacer(1,10))
title('M2 + I1 / 13 SEP 2026','Prototype kit &amp; industrial build plan')
p('Printable bench hardware, CNC profile inputs, assembly instructions and a staged factory automation plan. Desktop companion: alpha 2. Firmware: 0.0.3 ARM compile/link checked.')
story.append(Image(str(root/'mechanical/bench-m2/exports/assembly.png'),width=480,height=360))
sub('What is verified')
p('Twelve STL exports have closed, consistently wound, single-body meshes and checked dimensions. Three DXF profiles have closed contours and checked sizes. CAD renders and this booklet were inspected. Firmware and host verification are recorded separately.')
p('<b>What remains unverified:</b> physical print quality, received-part fit, strength, thermal behavior, electrical commissioning, production tooling and robot-cell safety. This is a review/fit-prototype package, not a released manufacturing pack.')
page();title('01 / DRAWING','M2 bench geometry')
class Drawing(Flowable):
 def __init__(self):Flowable.__init__(self);self.width=480;self.height=290
 def draw(self):
  c=self.canv;k=2.3;ox=245;oy=147
  c.setStrokeColor(colors.HexColor('#37617c'));c.setFillColor(colors.HexColor('#eff4f7'));c.roundRect(ox-90*k,oy-55*k,180*k,110*k,5*k,fill=1)
  c.setFillColor(colors.white);c.circle(ox-50*k,oy,15.1*k,fill=1);c.roundRect(ox+2*k,oy-47*k,66*k,94*k,3*k,fill=1)
  for x in [-80,80]:
   for y in [-45,45]:c.circle(ox+x*k,oy+y*k,1.7*k,fill=1)
  c.setFillColor(colors.HexColor('#18354e'));c.setFont('Segoe',10);c.drawCentredString(ox,oy+55*k+12,'180 mm overall / 160 mm bolt pitch');c.drawString(5,5,'Top view. 110 mm depth; 90 mm bolt pitch in Y. Not to scale.')
  c.setFont('Segoe',8);c.drawString(47,oy-48,'Hole D30.2');c.drawString(47,oy-60,'centre X-50, Y0');c.drawString(280,oy,'66 x 94 access');c.drawString(280,oy-13,'centre X35, Y0')
story.append(Drawing())
table([['Feature','Nominal specification'],['Plates / columns','Base and deck: 180 x 110 x 3 mm. Four columns: D14 x 45 mm.'],['Switch mounting seat','D30.2 through hole; D38 underside pocket, 1.4 mm deep. Remaining seat: 1.6 mm.'],['Fasteners','Four M3 x 55 fully threaded pan-head screws and M3 nuts. D3.4 bores, centres X +/-80, Y +/-45. No washers in nominal stack.'],['Vertical stack','3 + 45 + 3 = 51 mm before feet/button. Bolts project 4 mm below base. Feet at least 6 mm tall.'],['Board mounting','Adhesive half-size breadboard centred X35, Y0. Nominal 55 x 82.6 x 9.3 mm; opening larger than board envelope.']],[125,355])
p('Coordinates are millimetres from plate centre, viewed from above. DXF import must be assigned millimetres and checked at 180 mm overall width. The deck STL is flipped into print orientation; DXF profiles retain assembly XY coordinates.','SmallSK')
page();title('02 / PRINT PREPARATION','Print the fit coupons first')
table([['File / quantity','Purpose'],['base.stl / 1','Flat base with fastener holes and optional strap slots.'],['deck.stl / 1','Flat-top-on-bed orientation; pocket faces upward in print.'],['spacer-print-four.stl / 4','Upright columns with through bores.'],['coupon-hole...-seat... / selected trials','Nine combinations: holes 30.0 / 30.2 / 30.4; seats 1.2 / 1.6 / 2.0 mm. Each coupon 46 x 46 mm.']],[205,275])
sub('Initial slicer settings - not strength qualification')
p('Import at 100% in millimetres. Candidate PETG fit-prototype settings: 0.4 mm nozzle, 0.2 mm layers, 4 perimeters, 5 top/bottom layers, 30% infill; columns 100% infill. Use the filament supplier\'s temperature/drying guidance. Verify the bed\'s usable area and any brim. The largest part is 180 x 110 mm.')
p('Inspect every layer preview. The intended orientation needs no supports, but your slicer must confirm this. Reject missing walls, islands, severe warping, cracks or poor layer bonding. No universal G-code is supplied.')
sub('Choose a mounting interface from actual parts')
p('Measure each trial hole/seat and test the received switch. It must sit flat and both clips must engage without cracking or forced insertion. Check release and reseating. Record the chosen combination. The default deck is D30.2 / 1.6 mm; if another combination works, edit hole_d and seat_t, regenerate the deck and rerun verification. Never scale the whole model to tune one hole.')
sub('Why coupons are required')
p('The source button drawing shows a 29.5 mm body and 33.2 mm bezel; clip tolerance and printing error are not fully specified. A dimensionally closed mesh cannot establish physical retention. The supplied inspection record has no prefilled pass results.')
page();title('03 / ASSEMBLY','Build the unpowered stand')
p('<b>1.</b> Check coupon fit and plate flatness. Dry-fit four columns between base and deck. Insert M3 x 55 screws downward, fit nuts under the base and hand-snug evenly. Stop on denting, cracking or plate warp. No torque limit has been qualified.')
p('<b>2.</b> Add nonslip adhesive feet at least 6 mm high, clear of bolts and slots. Confirm no metal touches the desk and all feet carry load. Actual nut/head dimensions and screw projection must be measured.')
p('<b>3.</b> Remove the deck. Mount the breadboard on the right-hand base area using its adhesive. Optional straps cross its bare ends via the base slots; keep them off the Pico and all contacts. Seat Pico H headers across the centre trench after checking every pin aligns. Keep the backing insulated.')
p('<b>4.</b> Insert the tested switch from above. Connect its two normally open contacts using separate labeled leads: GP3 / physical Pico pin 5, and GND / physical pin 3. <b>These pins are not adjacent.</b> Do not use one two-position housing to bridge them. Confirm pin numbering with the official Pico diagram; check continuity before power.')
p('<b>5.</b> Route wires away from moving parts and screws. Refit the deck; check crimp insulation, retention and bend space. Do not bend terminals to force fit. The default model reserves 46.4 mm below the seat to base, leaving 8.3 mm against the conservative 38.1 mm switch-depth allowance.')
p('<b>6.</b> Leave GP2/GP4 disconnected for button-only commissioning. Use an approved-ID firmware build and harmless sample workflows. The build-check ELF has invalid IDs and must not be flashed. Check single/double/hold, heartbeat loss, reconnection and a held button across reconnect. Record actual results.')
sub('The LED stage is separate')
p('Only add the ring, buffer and switched/current-limited supply after its real circuit/harness has been reviewed and measured. The M2 kit does not complete that circuit. Semantic light readback without LEDs is not optical verification. Follow BUILD-P2.md and the E1 electrical review.')
page();title('04 / INDUSTRIAL ROUTES','Manufacture beyond printing')
table([['Route','Required preparation'],['CNC insulating-sheet bench kit','Use base/deck DXF at 1:1 mm in 3 mm stock. Machine the deck underside D38 pocket to 1.4 mm depth. Turn four D14 x 45 spacers with D3.4 bores. Fabricator approves material, CAM, clamping and finish.'],['Fabricated pilot enclosure','Design a separate sheet or machined housing around frozen parts. Add insulation, connector load path, edge protection and toleranced assembly drawings. M2 profiles are not a bent-sheet production drawing.'],['Molded consumer product','New production solids: selected resin, walls, ribs, draft, gates, ejectors, shrink and optical surfaces. Replace breadboard with custom PCB. Validate real switch/connector fit. M1/M2 are not mold masters.']],[145,335])
sub('Proposed production sequence')
p('Incoming lot inspection -> PCB fabrication/SMT -> programming and serial verification -> locate base in fixture -> insert PCB/carrier/optics -> close and fasten -> electrical/USB/button/optical tests -> label and pack. Each station preserves lot, unit serial, product revision and result history. Failed units enter a controlled rework flow.')
sub('PCB and tooling gates')
p('Release reviewed PCB fabrication/assembly outputs and agree IPC process/acceptance requirements with the supplier. Exact component data controls moisture, reflow and handling. Mold DFM and trial shots must establish fit and cosmetic quality. Production dimensions, molds, qualified process recipes and factory programs remain absent; I1 defines the engineering work needed.')
p('Detailed station operations and deliverables: manufacturing/industrial/PLAN-I1.md and process-route.csv.','SmallSK')
page();title('05 / AUTOMATION','Robot-cell integration plan')
p('Candidate operations: tray-to-nest handling, orientation inspection, controlled screwdriving, test-fixture loading and labeling. Keep manual and automated station result contracts the same. No robot model, payload, speed or trajectory is assumed.')
sub('Fixtures and tooling')
p('Define product, nest, camera and tool coordinate frames. A proposed 3-2-1 locating scheme seats the base without overconstraint; final datum features come from production drawings. Qualify jaw/vacuum pickup, part presence, clamp status, insertion force/displacement and torque-angle windows through measured trials. Optical parts need controlled illumination and clean handling.')
sub('Process handshake - not a safety interface')
p('Unique transaction -> accepted -> running -> complete, product_fail or machine_fault. Duplicate IDs return recorded state and never repeat motion. Lost acknowledgement, power loss or uncertain outcome requires reconciliation. Reset does not authorize restart. The JSON interface file specifies this contract only; no PLC or robot program has been implemented.')
sub('Safety stays in the machine system')
p('The robot integrator assesses the complete cell under applicable requirements, including guarding, stops, interlocks, tool hazards and recovery. ISO 10218-2:2025 is a relevant scope reference; its full text was not reviewed here. A collaborative robot is not automatically safe without guarding. SignalKey and its RGB status are not safety controls and must never substitute for an emergency stop.')
sub('Capacity example, not a factory promise')
p('20 days x 2 shifts x 7 net scheduled hours = 280 hours/month. For 10,000 good units, availability 0.85, performance 0.85 and quality 0.98 give a maximum ideal bottleneck cycle of 71.371 seconds. Quality is counted once. Actual trials, parallel stations, changeovers, scrap and buffer sizing determine real throughput.')
page();title('06 / INSPECTION & SOURCES','Release only on evidence')
table([['Gate','Required evidence'],['Prototype fit','Measured coupons, retained switch, stable stack, actual cable/terminal clearance, isolated wiring.'],['Electrical commissioning','Approved USB identity and binary, measured current states, real gestures, stale/reconnect behavior and optical checks.'],['Production design','Approved native solids/STEP, toleranced drawings, BOM/PCB pack, exact materials, tooling DFM and service plan.'],['Factory / site acceptance','Measured process windows, instrument calibration, missing/reversed-part tests, fault/restart tests, traceability and approved cell safety validation.'],['Lot release','First-article approval, closed deviations, unit test records, rework trace and responsible signoff.']],[135,345])
p('Digital verification: exports/verification.json. Blank field record: inspection-record.csv. No physical manufacturing pass or certification is inferred from these documents. Inspect all incoming parts and repeat affected tests after substitutions or process changes.')
sub('Primary reference register')
p('Adafruit471 and linked arcadebuttondim.jpg: button body/bezel drawing and conservative depth allowance. Adafruit64: 82.6 x 55 x 9.3 mm breadboard. Raspberry Pi Pico datasheet: dimensions and physical pin numbering. Product availability may change.','SmallSK')
p('adafruit.com/product/471<br/>cdn-shop.adafruit.com/datasheets/arcadebuttondim.jpg<br/>adafruit.com/product/64<br/>datasheets.raspberrypi.com/pico/pico-datasheet.pdf','SmallSK')
p('Industrial source scope: Protolabs wall/draft guidance; IPC explanation of J-STD-001 and A-610; ISO 10218-2:2025 public scope; Universal Robots whole-system integration responsibility. Full links and limitations are in PLAN-I1.md. These references support planning; they do not certify this design.','SmallSK')
def footer(c,d):
 c.setStrokeColor(colors.HexColor('#bed0dd'));c.line(42,40,553,40);c.setFont('Segoe',8);c.setFillColor(colors.HexColor('#4a6479'));c.drawString(42,26,'M2 / I1 | Digital prototype - not released for manufacture');c.drawRightString(553,26,str(d.page))
file=root/'output/pdf/SignalKey-Prototype-and-Industrial-Build-Guide.pdf'
SimpleDocTemplate(str(file),pagesize=(595,842),rightMargin=57,leftMargin=57,topMargin=42,bottomMargin=55,title='SignalKey M2 Prototype and I1 Industrial Build Guide',author='Magnexis').build(story,onFirstPage=footer,onLaterPages=footer)
print(file)
