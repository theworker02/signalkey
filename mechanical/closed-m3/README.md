# M3 — closed desktop enclosure

Current enclosed prototype direction. Five printable custom parts: shell, lid, lens, LED tray and rear cable clamp. The 150×110×63mm case has continuous sidewalls, rounded corners, a removable top and a separate button and light. The purchased button reference projects another3mm nominal above the lid; measure the received bezel. M1 and the M2 open test stand remain archived engineering alternatives, not representations of this product.

Open `enclosure.scad` in OpenSCAD2021.01; `part="assembly"`, `"exploded"` and `"section"` show assembly views. Exports are millimetres. Shell and clamp print upright; lid is inverted automatically; lens flange and tray floor lie on Z0. Print one of each. Four walls are complete except for the deliberate split cable passage at the rear. The enclosure is not sealed or IP rated.

## Dimensioned interfaces

Origin is case XY centre at outside floor Z0; +Y is rear. Outside150×110, corner radius12, floor3, walls2.4, shell top60, lid top63. Lid holes Ø3.4 at X±65,Y±45 align with shell Ø2.5 pilot bores fromZ48. Four proposed M3×12 pan-head thread-forming screws give9mm nominal engagement below the3mm lid. Exact screw family and pilot requirement are supplier dependencies; do not use ordinary machine screws as an undocumented substitute or assign an untested torque.

Switch centreX-43,Y0: Ø30.2 through bore; Ø38 underside relief leaves a1.6mm seat. Use existing M2 coupons to qualify the received Adafruit471 clips. Supplier nominal bodyØ29.5, bezelØ33.2. Reserved38.1mm depth below seat undersideZ61.4 endsZ23.3, leaving20.3mm above the floor. This reserve must also accommodate terminals, insulated boots and bends; those are not supplier solids in CAD.

Light centreX28,Y0: lid openingØ42.6; lensØ42 gives0.30mm nominal radial clearance. FlangeØ46×1.5 fromZ58.5 to60 prevents lifting through the lid. Tray rim endsZ58.3, leaving0.20mm axial clearance below flange. LED pocketØ38 receives nominal ringØ36.8:0.60mm radial reserve. Ring total envelopeZ50–56.7 leaves1.8mm nominal gap below lens underside58.5. This is a fit allowance, not validated optical mixing distance. Ring leads exit through an8mm front notch; no screws pass through unprovided ring mounting holes.

Tray mounting: X0/56,Y±22; four Ø2.4 through holes, lugsZ52–54; lid bossesZ54–60 with Ø1.8 pilots. Proposed M2×8 thread-forming pan screws installed from below:2mm lug +6mm engagement. Verify tip does not dimple the lid and head does not foul wires. Insulating adhesive pads on ring PCB underside are a supplier-selected retention method; add their measured thickness to stack and revise lens gap. Do not put adhesive on LEDs or copper pads.

Rear split guide: cable axisX0,Z55 alongY, nominal cable boreØ4.0. Clamp22×12×5, screw centresX±7,Y48; Ø2.4 holes and Ø4.8 counterbores fromZ57. Proposed M2×10 pan screws:2mm remaining seat +8mm pilot engagement. Verify actual head≤Ø4.5×2.5 and remaining lid clearance. Cable OD/compression, liner and bend radius remain supplier/physical dependencies. A nominal round hole alone is not proven strain relief. Regenerate `cable_d` for the received cable and perform pull testing before use.

Breadboard reserved55×82.6×9.3 atX2.5..57.5,Y±41.3,Z3..12.3; Pico H sits over its trench. Header height and plugs are approximate reference geometry. Keep left-front35×25×12mm for the supplier-built protection harness, and a separate Ø10×16mm capacitor. Secure and insulate both after receiving exact drawings; the current solid does not claim mounting compatibility with an unselected carrier.

## Illustrated assembly order

1. Print fit coupons first. Inspect dimensions, flatness, hole sizes and mating surfaces. Remove strings/debris before any electronics enter. See exports/assembly.png, exploded.png, section.png and assembly-drawing.svg.
2. With power disconnected, assemble the top upside down: snap tested button through from the outside, insert the lens from below so its flange contacts the lid, place the insulated ring in its tray with LEDs toward lens, route leads through the notch, then screw the tray to the lid bosses. The tray captures the lens flange. Confirm ring retention before inverting.
3. Install breadboard/controller on insulated adhesive mounting on the floor. Place the reviewed P3 harness and capacitor clear of button travel, screw posts and USB plug. No bare board may rest on conductors. Follow hardware/prototype/WIRING-P3.md and wiring.svg.
4. Plug the complete USB cable into Pico with lid open. Route it to the rear saddle with a relaxed service loop. Fit and qualify the separate clamp around the cable; no USB connector has to pass through the final small hole. Loosen/remove clamp before removing cable.
5. Connect button and ring service loops, hold lid beside case and inspect all routing. Lower lid vertically without trapping wires. Install four lid screws evenly; stop at distortion. No qualified torque is supplied. Confirm flat seating, free button return, secure lens and cable access.
6. After electrical bench release, commission light/state behaviour, then perform the physical fit procedure. Do not label the unit production-ready from mesh or nominal collision checks.

## Print-and-fit procedure

Candidate prototype material: opaque PETG shell/lid/tray/clamp and translucent natural PETG lens. Suggested starting slicer settings:0.4mm nozzle,0.2mm layers,4 walls,5 top/bottom layers,30% infill; inspect overhangs and support contact on lid bosses. Lens may require solid infill; test optical coupons rather than promising transparency. Use filament supplier temperatures. No printer-specific G-code is supplied.

Record printer, nozzle, material lot, drying, slicer version, orientation, supports and actual measurements in inspection-record.csv. Proposed fit-trial acceptance: shell/lid overall within±0.3mm; flatness≤0.5mm; no rocking; every fastener accessible; no cracks or stripped posts after five assembly cycles; button returns100/100 presses; no cable trapped during five lid cycles; all12LEDs visible through lens with no direct exposed LED; record hot spots photographically. These are trial goals, not validated production tolerances. Measure cable force/displacement with a documented fixture and establish an approved pull limit before claiming strain relief. For heat tests log ambient/current/temperature after30min maximum allowed white; establish material/component limits with the responsible engineer, not guesswork.

## Manufacturing routes

FDM supplies fit prototypes. Low-volume CNC can make a pocketed insulating polymer shell and machined lid/tray/clamp plus opal sheet/turned lens, but blind holes, tool radii and workholding need supplier CAM review. Injection molding requires a separate DFM revision: draft, uniform walls, cored rather than solid tall posts/saddle, screw system, shrinkage, gate/ejector layout and resin selection. This SCAD is NOT a mold tool master. See manufacturing/industrial/PLAN-I1.md and traceability-m3.csv. Robotics may place a pretested lid/harness subassembly and drive screws only after fixture, vision, torque and safety validation; the supplied station handshake is not a robot motion program.
