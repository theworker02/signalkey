# Engineering manifest — no manufacturing release

| Artifact | Revision | Evidence / state |
|---|---|---|
| Companion | 0.1.0-alpha.2 | Windows simulator, profile editor/history, local runner and SDK; see current software evidence |
| HID protocol | 1.0 | Host boundary tests and native C golden fixture pass; physical interoperability pending |
| Firmware | 0.0.3 | Three native tests and pinned ARM compile/link pass; authorized-ID UF2 and bench tests absent |
| Prototype wiring | P2 | Button-first bench plan with selected switch; P1/E1 LED harness remains second-stage proposal |
| Custom PCB | E1 | Datasheet-derived power calculations and candidate BOM; no schematic/layout |
| Enclosure | TILE T1 | Active larger P3 integration proposal; native parametric SCAD, printable meshes and drawings checked digitally; physical fit/return/strength/tooling unverified |
| Factory test | FT1 | Draft; fixture, channel-test firmware, provisioning and approved measurement limits absent |

This package supports engineering review and a design-service scope estimate. It does not authorize fabrication or orders. STL hashes are in `mechanical/exports/verification.json`; source-document hashes and software verification are in `docs/evidence`.

Required handoff before production:

- Approved schematic and PCB sources, fabrication/drill outputs, stack-up, reviewed BOM and alternates, placement/polarity drawings, resolved DFM exceptions and inspection criteria.
- Valid enclosure solids, toleranced part/assembly drawings, material/process/finish specification, validated component fit, fasteners, load path and recovery access. M1 STLs alone do not satisfy this gate.
- Pinned board firmware toolchain/SDK, binary and SHA-256, authorized USB identifiers, serial provisioning and recovery instructions, known software/firmware compatibility matrix.
- Reviewed fixture and test software, calibrated instruments, measurement uncertainty, numeric limits, golden/reference units with measured records, locked failure/rework process and traceable unit logs.
- Approved first article, validation reports, supplier change control, compliance route for intended markets, packaging/labeling, yield assumptions and actual cost quotations.

Every released file must carry a revision and hash in a frozen handoff inventory. Manufacturing changes require a documented disposition, revised affected artifacts and repeat tests determined by impact. Do not substitute an LED lot, connector or switch from appearance alone. No production quantity, tooling expense, supplier message or release has been approved.

2026-09-13: ARM evidence is `docs/evidence/arm-firmware-build.json`. It is a link-only check with invalid USB IDs, not a released binary. The bench switch needs 38.1 mm depth and is explicitly excluded from the 24 mm M1 enclosure. T1 is the active larger virtual packaging study; its CAD does not satisfy the physical release gates.

## M2 / I1 additions - 2026-09-13

M2 is a separate 180 x 110 x 51 mm open bench stand: 12 checked STL exports (3 stand-part files and 9 fit coupons), 3 checked DXF profiles, CAD renders and blank inspection record. Print four instances of the spacer. M1 remains a compact concept. I1 adds machining, molded-product development, EMS routing, proposed robot station interface, control plan and initial process-failure analysis. These artifacts do not release a production mold, PCB, robot cell or complete electrical assembly. The seven-page PDF guide is in `output/pdf`.
