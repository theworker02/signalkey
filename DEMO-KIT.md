# SignalKey review kits

The active enclosure handoff is `output/SignalKey-TILE-T1-Review-Kit.zip`. Start with `mechanical/tile-t1/README.md` in that archive. It contains the larger T1 parametric source, printable STL/3MF exports, drawings, P3 wiring references, inspection record and prototype/production route. It is a digital review and physical-fit-prototype handoff, not a production release; STEP, physical fit, electrical, optical and tooling results are explicitly absent.

The M3 package described below is retained as a superseded historical review kit.

Read `output/pdf/SignalKey-Closed-Enclosure-and-Integration-Guide.pdf` first. It contains the closed box, exploded installation, dimensions, LED wiring, inspection procedure and readiness summary. Full instructions are in `docs/WINDOWS-INSTALLATION.md`, `docs/READINESS-INTEGRATION.md` and `hardware/prototype/WIRING-P3.md`.

Launch `release/0.1.0-alpha.2-integration/SignalKey-win32-x64/SignalKey.exe` for the current unsigned test application. Keep the entire directory together. The separate `release/0.1.0-alpha.2` folder is the preserved baseline used by the upgrade demonstration, not the recommended current launch target. No administrator installation or hardware is needed for the simulator.

To reproduce the integration demo, install the documented Node version, run `npm ci`, then `npx tsx scripts/integration-demo.ts`. It uses isolated temporary data and runs a real marker command. Test approval is adapted; this does not bypass production approval or prove the real native dialog. Read the report before interpreting any PASS as hardware evidence.

Print files are in `mechanical/closed-m3/exports`: shell, lid, lens, tray and clamp, one each, in millimetres. First print the switch coupons in the retained M2 kit and measure the received switch. M3 is a physical-fit prototype, not a finished or production-qualified electrical product. Follow the complete assembly instructions and supplier-dependency table.

`SHA256SUMS.json` identifies every included file except itself. Compare hashes before using a frozen review package. The ZIP verification record beside the archive records a complete re-read check and archive hash. Hashes are integrity evidence, not code signing, approval or qualification. Development node_modules and downloaded toolchains are deliberately absent; packaged Windows runtime dependencies are included. Follow the lockfiles/setup guides to restore build tools. Source/design licensing remains an owner decision; do not infer redistribution permission from this local review kit.
