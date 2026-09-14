# TILE T1 enclosure — active P3 integration proposal

T1 is the active enclosure direction for SignalKey. It follows the selected TILE appearance: a warm off-white, rounded-square desktop body; one broad shallow-concave button; a short upper-right light feature; a recessed graphite base; rear USB; and no exposed top fasteners. It deliberately uses a **larger 128 × 108 × 52 mm envelope** so the existing P3 bench hardware can be placed without representing an impossible compact package.

This is a proposed partnership handoff, not a manufacturing release. See [Manufacturer partnership note](../../manufacturing/MANUFACTURER-PARTNERSHIP-NOTE.md): the manufacturing partner must complete DFM/DFA, controlled production CAD/drawings, supplier qualification, tooling, test fixtures, validation and release work before production.

The 78 × 78 × 23 mm image-study envelope is not the T1 production dimension. The actual P3 stack contains a 38.1 mm-deep arcade button, a Pico H with headers, an 82.6 × 55 × 9.3 mm breadboard, a 36.8 mm LED ring and hand wiring. A lower profile requires a future, measured PCB and switch redesign; this package does not pretend that change has happened.

## Design basis and status

| Item | T1 proposal | Basis / status |
| --- | --- | --- |
| Outside envelope | 128 W × 108 D × 52 H mm, excluding feet | Parametric packaging study; larger than the appearance study to bound current P3 parts. |
| White upper housing | 2.4 mm nominal wall, 2.8 mm nominal top | Digital geometry only. |
| Recessed graphite lower chassis | 3.2 mm base, 1.0 mm reveal | Digital geometry only. |
| Button | 104 × 84 mm planform, 15 mm corners, 1.2 mm nominal clearance | Digital geometry; clearance coupon supplied. |
| Motion | 0.60 mm target stroke, 0.78 mm hard-stop allowance | CAD target only; must be reconciled to measured switch travel. |
| Connector | Rear Micro-USB envelope, 12 × 6 mm opening | Current Pico H direction; exact datum is unmeasured. |
| Light | 11 × 2.2 mm upper-right aperture | Optical layout only; see colour limitation below. |

The model is a **virtual assembly**, a watertight mesh export and a documented physical-fit plan. It has not been printed, fitted, powered, cycle-tested or reviewed by a mold maker. No physical production claim is made.

## Hardware evidence and bounded envelopes

The current P3 hardware is retained. `hardware/pcb/ENGINEERING-REVIEW.md` records that there is no released board CAD, schematic or placement file. T1 therefore uses the existing documentation as an envelope, rather than inventing PCB geometry:

| Hardware | T1 placement | Known evidence | Required before release |
| --- | --- | --- | --- |
| Pico H | USB faces rear; carried with the breadboard setup | Existing firmware targets a Pico H and its Micro-USB connection. | Measure connector centerline, plug shroud, headers, board outline and keep-outs. |
| Adafruit 64 breadboard | Right-side prototype volume | Existing P3 material reports 82.6 × 55 × 9.3 mm. | Measure actual unit and mounting/retention method. |
| Adafruit 471 arcade switch | Left-side button load path | Existing P3 material reports 29.5 mm body, 33.2 mm bezel, 38.1 mm depth. | Measure actuator travel, operating force, release force, terminals and body tolerances. |
| Adafruit 1643 LED ring | Under the upper-right guide envelope | Existing P3 material reports 36.8 mm OD, 23.3 mm ID, 6.7 mm thick. | Measure actual LED position, brightness, heat, wiring exit and optical coupling. |
| Wiring | Routed below guide and held clear of button path | P3 wiring exists as a bench harness. | Photograph, measure bend radii/current protection and perform pull/continuity checks. |

The empty volume is **not claimed as expansion capacity**. Until the breadboard, Pico, switch terminals, LED-ring harness and four fastener/tool corridors are measured in a fitted assembly, there is no usable expansion allocation. A new PCB can establish one only after the real board outline, holes, keep-outs and connector datum are released.

## Files and reproducibility

| File | Purpose |
| --- | --- |
| `tile-t1.scad` | Native editable parametric source. Parameters are at the top of the file. |
| `exports/*.stl` | Printable compatibility meshes in millimetres. |
| `exports/*.3mf` | Printable 3MF compatibility exports. |
| `exports/views/*.svg` | CAD projection views. |
| `exports/T1-dimensioned-drawing.svg` | Dimensioned top, side, rear, underside and section sheet. |
| `exports/T1-exploded-assembly.svg` | Illustrated part/fastener order. |
| `exports/T1-section-annotations.svg` | Switch, guide, wiring and optical-section reference. |
| `tile-t1-bom.csv` | Custom/purchased part traceability. |
| `inspection-record.csv` | Blank physical validation record. |
| `PROTOTYPE-AND-PRODUCTION.md` | Separate FDM and molded-product requirements. |
| `STEP-EXPORT-BLOCKED.md` | Truthful STEP limitation and handoff path. |

Run this from the repository root after installing OpenSCAD and Python packages already used by this repository:

```powershell
& .local/python/Scripts/python.exe scripts/export-tile-t1.py
& .local/python/Scripts/python.exe scripts/draw-tile-t1.py
```

`export-tile-t1.py` creates meshes and checks each exported solid for positive volume and watertightness. Those checks establish export integrity only; they do not establish fit, tactile quality, durability, connector compatibility or production readiness.

## Mechanical arrangement and service sequence

The upper housing carries four M2.5 heat-set inserts. Four M2.5 × 8 underside screws enter through countersinks in the graphite chassis. Feet sit outside those screw locations, so the housing can be opened without removing adhesive feet.

1. Print and measure the three clearance-coupon variants before printing the cosmetic parts.
2. Install inserts in the upper housing using the selected insert supplier's temperature and depth instructions; inspect for tilt and surface read-through.
3. Assemble the broad button cap to the four guide shoes and guide/support. Verify free motion before electronics are installed.
4. Fit the actual arcade switch to the lower support, then measure and shim the plunger/stop relationship to its **measured** travel. The CAD's 0.60/0.78 mm values are starting geometry, not a switch specification.
5. Route the P3 harness below the guide plane, secure it at two removable tie points, and leave a service loop at the rear connector. Do not pinch insulation between the guide and chassis.
6. Place the LED ring and T1-04 light guide, then perform a dark-room light-leak and status-legibility observation.
7. Place the breadboard/Pico assembly only after its actual retention method and USB datum are measured. Check full plug insertion with representative cable housings.
8. Close the chassis with four underside screws and install the four feet after screw torque/service access is confirmed.

The button is not a plate balanced on one switch. Four distributed guide shoes constrain lateral motion and the guide/load posts take the normal overtravel load into the lower chassis. The center plunger triggers the existing arcade switch. This arrangement still needs physical corner-load testing because the selected switch's real travel and force are unrecorded.

## Light feature and status limitation

T1 uses the existing LED-ring envelope as an internal optical source for a short guide rather than exposing a large ring. An amber-tinted prototype guide best matches the selected appearance, but it can distort the current RGB status colours. The firmware/app semantics and non-colour status paths are unchanged by this mechanical package; **the optical colour presentation is not validated**.

Before a production decision, compare a clear/smoke-neutral optical PC guide and an amber-tinted guide with the actual status patterns. If colour differentiation is required, select the neutral guide or make a documented firmware/product decision after physical testing. Do not claim that an amber diffuser preserves RGB legibility.

## Physical validation required

Use `inspection-record.csv`; retain measurements, photographs and cable/switch part numbers with the build record. The acceptance numbers below are intentionally not invented:

- Measure the actual button's operating travel, operating force and release force, then set the stop gap so the switch cannot be overloaded.
- Test center, each edge midpoint and all four corners for actuation and return. Record force and travel; establish limits from the measured switch and intended service life.
- Inspect repeated presses for guide rub, rattle, cap rocking, binding, switch overload and loosening.
- Test three representative USB cable shells for full insertion, retention and no lateral load on the connector.
- Check M2.5 insert pull-out/torque using the chosen material/process, not a generic value.
- Check LED alignment, leakage at the button gap, readability in bright/dim ambient light, and any colour distortion.
- Check cable bend, chafe, continuity, strain relief, assembly-tool access, tip/slip during off-center presses, heat and disconnect/reconnect behavior with the real device.

## Supersession

T1 replaces M3 as the active enclosure instruction set. `mechanical/closed-m3` and the M1/M2 studies remain historical references only. They must not be combined with T1 dimensions, light geometry, wiring arrangement or assembly route.
