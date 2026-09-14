# SignalKey M2 printable bench kit

Revision M2 / 2026-09-13. A real open bench stand for P2 button-first commissioning. Digital geometry checked; physical print, fit and load tests have not been performed. This is not a finished consumer enclosure or a factory safety enclosure.

## Files and quantities

Print `exports/base.stl` once, `deck.stl` once, and `spacer-print-four.stl` four times. All STL dimensions are millimetres; import at 100% scale. The base/deck measure 180×110×3 mm, spacers 14 mm OD×45 mm with 3.4 mm bores. The assembled printed stack is 51 mm high before feet and button. A nominal 220×220 mm printer bed accommodates the largest part; check the slicer's usable area/brim first.

Nine separate 46×46 mm coupons cover holes 30.0/30.2/30.4 mm and seat thicknesses 1.2/1.6/2.0 mm. Print coupons before the deck. Filenames identify each combination. Test the actual switch from the intended lot: it must seat flat, both clips engage, release/reseat without cracking and remain retained during ordinary hand operation. Do not force it. The supplied deck uses hole 30.2 and seat 1.6. If a different coupon works, change `hole_d` and `seat_t` in `stand.scad`, regenerate, rerun checks and mark the new part revision; do not scale the entire model.

The deck STL is already inverted with its flat top on Z0 for support-free intended orientation; its underside counterbore faces upward while printing. Base lies flat; spacers print upright. Candidate settings for fit prototypes:0.4 mm nozzle, 0.2 mm layers, 4 perimeters, 5 top/bottom layers, 30% infill; spacers 100% infill. PETG is a proposed material; use the filament manufacturer's temperatures and dry-filament guidance. These settings are not a validated strength recipe. Inspect the slicer preview for unsupported islands or missing thin walls. No G-code is supplied because printer/filament settings differ.

## Purchased hardware

- Four M3×55 mm fully threaded pan-head machine screws and four matching M3 hex nuts; no washers in the nominal length calculation. Actual head/nut envelope must be checked. Four separate spacers are compressed between plates, with no tapped plastic threads.
- Four nonslip adhesive feet at least 6 mm high, positioned beneath the base near corners but clear of bolt heads/nuts and strap slots. Screws project nominally 4 mm below the base; feet must prevent desk contact after assembly.
- Pico H with factory headers, a Micro-USB data cable, Adafruit 471 switch or dimensionally reviewed equivalent, Adafruit 64 half-size breadboard (82.6×55×9.3 mm nominal), and two independently terminated switch wires. The breadboard and quick-connect wire set were out of stock on their source pages at review; obtain availability/approved equivalents before ordering.
- Use the breadboard's adhesive backing on the right-hand base area centred X35,Y0. Optional straps run through the four slots at X3/67,Y±35 around the bare breadboard ends, never over Pico components or contacts. Straps must not bow the breadboard or force header pins.

## Assembly sequence

1. With all power disconnected, measure coupons and test received switch fit. Check printed plates for flatness, cracks, strings and hole obstructions. Do not enlarge holes while electronics are installed.
2. Dry-assemble the base, four columns and deck with M3 bolts down from above and nuts beneath. Hand-snug evenly; stop if plastic dents, cracks or warps. No torque value is qualified. Confirm both plates are supported by all columns and no rocking occurs. Fit the feet and confirm metal cannot touch the desk.
3. Remove the deck. Stick the breadboard to the base; seat the Pico H across the breadboard centre trench, aligning both header rows without shorting opposite sides. USB faces the open end. Inspect every pin before pressing straight down. Leave the board's metal backing insulated; it must not touch exposed contacts.
4. Snap the tested switch into the deck from above. Use two individually labeled leads from its normally open contacts: one to GP3 (physical Pico pin5), one to GND (physical pin3). These pins are NOT adjacent. Use individual breadboard jumpers or single-position terminals; a two-position female housing cannot span them. Check the Pico orientation against its official pinout, then check continuity unpowered. GP2 and GP4 stay unconnected in Build A.
5. Route wires clear of screws and moving switch parts, reconnect the deck, and check cable access, contact insulation and retention. Do not bend switch terminals to gain height. The model reserves 46.4 mm from switch seat underside to base top; using a 38.1 mm depth allowance leaves 8.3 mm nominal clearance. This is not a substitute for measuring crimp/boot and wire bend clearance.
6. Only after an authorized-ID firmware is built and reviewed, commission the real board following `hardware/prototype/BUILD-P2.md`. The link-check ELF is not a flashable deliverable. Check press/double/hold, host loss, reconnect while held and recovery. Capture actual results in the supplied inspection record. No physical pass is prefilled.

## Non-print fabrication

`base_dxf.dxf` and `deck_dxf.dxf` are XY profiles at 1:1 millimetres, centred on the part, for 3 mm nominal stock. DXF is unitless unless the importer assigns mm: verify 180 mm overall width. The deck additionally requires the Ø38 underside pocket centred X-50,Y0, depth1.4 mm for the default 1.6 mm seat. `pocket_dxf.dxf` identifies that pocket only; it is not another through-cut. CNC machining of insulating sheet is a proposed low-volume alternative. A simple laser through-cut cannot produce the partial-depth pocket. A qualified fabricator must choose material, tooling, workholding and approved CAM. No G-code is supplied. Spacers may be turned from insulating stock to the same dimensions. Validate flatness, deburring, fit and fastener length after any material/process change.

## Verification and source boundary

Run `.local/python/Scripts/python.exe -X utf8 scripts/export-bench.py` with the project-local OpenSCAD 2021.01 and trimesh 4.8.1 tools. Evidence is `exports/verification.json`: closed single-body meshes, positive volumes, winding, print-origin placement and expected bounds. Digital geometry checks do not certify fatigue, layer bonding, retention, thermal behavior or electrical safety. Assembly images contain simplified reference envelopes; they are not complete component CAD. No STEP solid is supplied.

Primary dimensions: [button product](https://www.adafruit.com/product/471), [linked button drawing](https://cdn-shop.adafruit.com/datasheets/arcadebuttondim.jpg), [breadboard](https://www.adafruit.com/product/64), [Pico datasheet](https://datasheets.raspberrypi.com/pico/pico-datasheet.pdf), mechanical section and pinout. The button drawing shows 29.5 mm body and 33.2 mm bezel; it does not specify every clip/lot tolerance, hence the coupons. The breadboard is replaceable, but the received envelope must fit the 66×94 mm access opening.

Industrial production is a separate revision route; see `manufacturing/industrial/PLAN-I1.md`. Neither this breadboard nor the M2 stand is the proposed mass-produced consumer product.
