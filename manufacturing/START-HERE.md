# Current enclosure handoff: TILE T1 / P3 integration proposal

Start with `mechanical/tile-t1/README.md`, `mechanical/tile-t1/exports/T1-dimensioned-drawing.svg`, `mechanical/tile-t1/exports/T1-exploded-assembly.svg`, `mechanical/tile-t1/inspection-record.csv`, `mechanical/tile-t1/tile-t1-bom.csv`, `mechanical/tile-t1/PROTOTYPE-AND-PRODUCTION.md`, `hardware/prototype/WIRING-P3.md` and `docs/READINESS-INTEGRATION.md`.

Read [MANUFACTURER-PARTNERSHIP-NOTE.md](MANUFACTURER-PARTNERSHIP-NOTE.md) before scoping any factory work. The repository is a partnership/development handoff; the manufacturing partner must complete production engineering and receive a separate written production release.

T1 is the active larger enclosure proposal and uses bounded envelopes for the current P3 bench hardware. Its digital CAD/export checks do not substitute for print-and-fit, harness, optical, connector, durability or tooling validation. `closed-m3`, M2 and M1 remain superseded traceability material, not active build instructions.

# Retained SignalKey M2 / I1 review kit

Start with output/pdf/SignalKey-Prototype-and-Industrial-Build-Guide.pdf.

- mechanical/bench-m2/exports: printable STL parts, nine fit coupons, machining DXF inputs, renders and verification hashes.
- mechanical/bench-m2/README.md: part quantities, printing, assembly, hardware and dimensional source links.
- mechanical/bench-m2/inspection-record.csv: blank physical checks, all NOT_TESTED.
- manufacturing/industrial: CNC/fabrication and molded-product development plan, station route, control plan, initial process-failure analysis, robot process-interface proposal and capacity scenario.
- hardware: prototype wiring/BOM and incomplete electrical/PCB design inputs.
- firmware and scripts: checked source and reproducible build/export scripts. Local tool dependencies are not bundled.

Print coupons first; the default deck is D30.2 mm / 1.6 mm seat. Print one base, one deck and four spacers. STL units are mm. Check the full instructions before assembly or power.

This ZIP does not contain the desktop application, third-party toolchains, production PCB fabrication data, a released UF2, molds, robot/PLC code or safety validation. Obtain the matching SignalKey software repository/application separately. No factory or complete electronic product is approved for manufacture. Physical print, fit, load, power and production qualification remain outstanding.

SHA256SUMS.json hashes every bundled file except itself. These hashes provide integrity tracking, not a digital signature. Source code and design licensing remain an owner decision; see docs/LICENSING.md before redistributing.
