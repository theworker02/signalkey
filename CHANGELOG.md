# TILE T1 partnership handoff — 2026-09-13

- Replaced the active enclosure direction with the larger 128 × 108 × 52 mm TILE T1 proposal, bounded around the existing P3 arcade-switch, Pico/breadboard and LED-ring prototype stack.
- Added editable parametric source, prototype STL/3MF exports, mesh report, dimensioned/exploded/section drawings, BOM, fit record and separated prototype/production route.
- Added a manufacturer partnership note, publishing checklist and source-availability license status. T1 remains a digital handoff: physical fit, electronics, optics, reliability and production qualification are not claimed.

# Integration / M3 closed enclosure / P3 wiring — 2026-09-13

- Preserved the alpha.2 studio; added in-flight run journaling, single admission before disk I/O, interrupted recovery without retry, and correct invalid-cwd state.
- Added real packaged process-restart, portable upgrade/reinstall, concurrent request and forced-exit demonstration; 23 automated tests pass.
- Added five-part closed CAD/STL enclosure, original M1 assembly audit, dimensioned sheets and an eight-page illustrated wiring/assembly guide.
- Specified protected LED wiring and supplier dependencies; extended firmware LED rail delay to50ms for the proposed capacitor, then recompiled ARM and reran native tests.
- Added Windows reproducibility/recovery guide, full part traceability and requirement-level readiness evidence. Physical hardware, print fit, optics and production remain unvalidated.

# M2 printable kit / I1 industrial plan - 2026-09-13

- Added printable bench base/deck/spacer and nine switch fit coupons, plus machining DXFs.
- Added seven-page illustrated build guide, assembly/inspection instructions and checked geometry evidence.
- Corrected nonadjacent Pico wiring termination in P2.
- Added industrial process route, control plan, initial PFMEA, robot-interface requirements and checked capacity scenario.
- Physical prints, complete electronics and factory cell remain unverified.

# Firmware 0.0.3 / build-readiness increment — 2026-09-13

- Pinned Pico SDK 2.2.0, TinyUSB and Arm GNU 14.3.Rel1; added local setup/build-check scripts and ARM link evidence.
- Fixed reserved PIO label and conflicting TinyUSB OS definition; made project C compile with strict warnings.
- Added offline-session gesture discard and release-before-rearm, plus native regression tests.
- Read time after USB callbacks to prevent heartbeat timestamp underflow.
- Added P2 button-first bench build plan using a real switch; documented why it cannot fit the M1 enclosure.
- No board was flashed, no application UF2 released, and desktop alpha 2 remains unchanged.

# 0.1.0-alpha.2 — 2026-09-12

- Rebuilt workflow studio with profile search/create/duplicate/delete, gesture editing, persistent history and fault simulation.
- Added strict v2 migration, safe import bindings, serialized mutations, state readback and capability validation.
- Improved runner error state, UTF-8 output ceiling and launch/result timing.
- Added native C gesture tests and GP4 LED supply control source; corrected configured current request to500 mA.
- Rendered and checked five M1 enclosure parts; added sourced E1 power model and four engineering diagrams.
- Expanded host and real Electron regression checks. Physical hardware and ARM firmware remain unverified.

# Changelog

## 0.1.0-alpha.1 — 2026-09-12

Initial SignalKey implementation: Electron/React companion; real command runner and explicit simulator gestures; profile validation/import migration/export/persistence; native command approval; bounded activity logs; tray/quit/login controls; authenticated local SDK/CLI; virtual and HID transports; protocol and process lifecycle tests; desktop screenshot evidence.

Added uncompiled RP2040/TinyUSB firmware source, proposed prototype wiring and PCB BOM/review report, unrendered parametric enclosure study, draft RFQ/factory tests/validation matrix/cost model/sponsor materials, bounded competitor research and compliance work list. These are not production releases or verified physical designs.
