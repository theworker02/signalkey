# P2: a staged, buildable bench prototype

Decision record · 2026-09-13. This is the next physical build proposal, not an assembled or tested product. Software alpha 2 is usable; firmware 0.0.3 now passes a real ARM compile/link check. Authorized USB IDs and a verified UF2 remain prerequisites for device commissioning.

## Architecture and scope

Use a Pico H with factory headers and its own Micro-USB data connection. Commission the button/USB path first, then add the separately reviewed LED harness. A technician supplies the assembled harness and measurements; the owner does not need to solder. The compact 55×55×24 mm M1 model is excluded from this bench build.

Selected bench switch candidate: [Adafruit471, translucent 30 mm arcade button](https://www.adafruit.com/product/471). It has a preinstalled microswitch, no built-in LED, and vendor-stated depth of 1.5 inches (38.1 mm) with unbent terminals. This alone exceeds M1's total24 mm height. Use a separate panel/large insulating carrier with at least 45 mm nominal clear space behind the panel, then verify terminal insulation, wire bend clearance, panel thickness and snap retention against the received part.45 mm is a starting clearance allowance, not a guaranteed fit. Do not bend terminals merely to force the concept enclosure to fit.

The vendor links [Adafruit1152, 0.11-inch quick-connect wire pairs](https://www.adafruit.com/product/1152) for this switch. Its product page was out of stock on 2026-09-13, so availability is a procurement blocker, not an assumed purchase. The supplier may quote an equivalent insulated 0.11-inch precrimped pair after contact-width and retention review; 0.187-inch lugs are not an automatic substitute. Its board-side connector is not assumed to mate directly with Pico pins. Request two independently terminated leads to GP3/header5 and GND/header3, labeled on both ends. Verify pin3 on the official Pico pinout before harness signoff. The switch is non-polarized; there is no 5 V connection to it.

## Build A — button and USB commissioning

| Connection | Implementation | Acceptance evidence |
|---|---|---|
| USB | Known data Micro-USB cable into Pico H | Enumerates actual approved VID/PID and unique serial |
| Button | Normally-open contacts between GP3/header5 and GND/header3 | Open at rest, closes when pressed; meter record before power |
| GP2 and GP4 | Left unconnected for this stage | No LED hardware or external supply attached |
| Mounting | Insulating carrier, retained cable and button panel | No loose conductors; press force supported by panel |

This stage uses the normal firmware with the external LED hardware absent. Reported semantic light state only demonstrates firmware state; it does not demonstrate physical feedback. Keep the desktop simulator disabled and explicitly select the real serial. Use only harmless bundled pass/fail workflows for first tests. Check single/double/hold, heartbeat expiry, unplug/replug, and a button held during reconnect. The held button must be released before a new gesture is accepted. Do not claim USB power compliance from this commissioning step.

## Build B — visible feedback and measured power

After Build A, add a preassembled Adafruit 1643 ring, AHCT buffer and reviewed switched/current-limited rail from the P1/E1 proposal. Obtain exact LED lot specifications. GP2 drives buffer input; reviewed buffer output drives DIN. GP4 enables the rail with external default-off pulldown. VBUS supplies the protected input; grounds are common. Prevent data-line backpower. Never power the same rail from USB and an independent supply without an engineered power path.

The E1 steady-state calculation is a design input, not authorization to wire an incomplete schematic. The technician must provide an actual harness schematic with exact package pins, resistor values, capacitor/ESD choices, connector pinout and polarity photographs before powering Build B. Measure configuration/suspend/inrush current, maximum permitted light, fault limiting and thermal behavior with recorded instruments. Full-device suspend power is still unresolved in firmware and must be addressed before a compliance claim.

## Handoff and stop conditions

For one prototype, deliver the assembled carrier, wire labels, circuit drawing, approved-ID firmware hash, serial, toolchain record, measured results, photos and recovery steps. No passing logs may be prefilled. Stop on shorts, unstable enumeration, unexpected command execution, excess current, hot components, binding switch or poor terminal retention. Retest after documented rework.

Only after both stages work should the next revision select a compact tactile switch, design the custom PCB around actual mechanical drawings, and replace M1 clearances with a measured tolerance stack. Neither a custom mold nor a routed PCB is required to prove the central press→command→observed feedback workflow.

This plan does not include an order or supplier contact. Component examples were checked against original product pages; prices/availability are not guaranteed and no unit-cost estimate is implied.

The M2 printable stand and fit coupons are in `mechanical/bench-m2`. Pins5 and3 are not adjacent; do not bridge them with a single two-position housing. Industrial process alternatives are in `manufacturing/industrial/PLAN-I1.md`.
