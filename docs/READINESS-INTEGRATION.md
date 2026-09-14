# SignalKey integration and physical-readiness report

2026-09-13. Continued from0.1.0-alpha.2; the workflow studio remains intact. Current integration package is a separate unsigned portable build. The active physical direction is **TILE T1 + P3 bench harness**: a larger, serviceable virtual enclosure that can bound the existing tall arcade switch, Pico/breadboard and LED-ring stack. M3, M2 and M1 are retained as superseded references. T1 has no physical fit, electrical or production validation.

## Requirement-by-requirement evidence

| Requirement / test | Result | Environment / evidence | Remaining limitation |
|---|---|---|---|
| Create profile → configure gesture → assign executable/args/cwd → enable → press → inspect result | PASS with approval-adapter boundary | Actual alpha.2 packaged Electron UI, real Node child; scripts/integration-demo.ts; evidence/integration-demo.json | Native dialog rendering/human interaction not tested; the test replaces its response only in the isolated main process |
| Quit/restart and retain profile/selection/bindings/history | PASS | Baseline application fully exits; integration EXE reopens same isolated userData; profile file byte equality | Same machine, not clean-PC evidence |
| Concurrent duplicate requests | PASS | Two actual IPC requests → one rejected; side-effect count increases once; reservation-before-journal regression | New manual presses after completion intentionally run again; cache is not a permanent idempotency ledger |
| Conflicting/missing gesture targets; edits during run | PASS | tests/recovery.test.ts and upgrades.test.ts; invalid target does not mutate saved mapping; referenced deletion rejected | One assignment per gesture by schema; same target on multiple different gestures is permitted |
| Cancel, timeout, bad cwd/executable | PASS | Real process tests plus cancel-during-intent-write regression; error state no longer inherits prior success | Cancellation is best effort, never rollback |
| Forced application exit during action; restart recovery | PASS | Real child writes marker, main process exits77, fresh app records interrupted and marker count stays unchanged | Child can survive; external effects may be partial or complete. No automatic retry. Power-loss/storage durability not qualified |
| Device disconnect during run and reconnect | PASS simulated | Active real child completes while virtual device is absent; no re-execution on restore | No physical USB removal/reconnect evidence |
| Protocol framing, ACK, timeout, malformed/duplicate input | PASS simulated boundary | Fake HID tests;64-byte framing,1s deadline, sequences; packages/protocol/README.md | Actual device still unavailable |
| Native firmware and ARM build | PASS | Native protocol/button/session tests; pinned SDK2.2.0 / GCC14.3.1 compile+link; evidence/*.json | No hardware flashed; invalid-ID link-check ELF is not a deployable image |
| TILE T1 larger virtual assembly and printable exports | PASS digital / physically blocked | `mechanical/tile-t1/tile-t1.scad`; six STL/3MF exports have watertight/winding/positive-volume checks; dimensioned, exploded and section sheets generated | P3 hardware uses bounded documentation envelopes; no received-part measurement, print-and-fit, connector, harness, optical, button or tooling validation |
| Original M1 five-part assembly | PASS nominal / physically blocked | mechanical/assembly-validation/assembly-verification.json:10 part pairs +13 cap positions +2 driver checks +Ø3 provisional route =26 | No selected compact switch, spring return, PCB, connector or qualified diffuser retention; no print test |
| Superseded M3 five-part assembly | PASS nominal / physically blocked | Five closed single-body STL files and10 pair intersections; mechanical/closed-m3/exports/assembly-verification.json | Historical reference only; full purchased solids/tolerances, cable clamp force, adhesive stack, optical uniformity and loads remain unverified |
| Dimensioned drawing and illustrated installation | DELIVERED / visually inspected | Eight-page closed-enclosure guide; M1/M3 assembly SVGs; M3 wiring SVG; mechanical README and blank inspection CSV | Fit drawing, not a complete toleranced production drawing release |
| Clean Windows build/install/upgrade/recovery/uninstall | Procedure delivered; same-host package tests PASS | docs/WINDOWS-INSTALLATION.md; package build; full relocation/reinstall; Authenticode NotSigned | Clean-machine install, actual installer/uninstaller and signing not tested/provided; portable removal instructions only |
| Custom and purchased part traceability | DELIVERED with explicit gaps | manufacturing/traceability-m3.csv maps M1/M2/M3 including every coupon; exact selected component IDs and P3 net schedule | Cable, fastener family, harness carrier, adhesive, passive order codes and production material grades still require supplier disposition |
| Industrial routes and robot adaptation | ENGINEERING PLAN retained / M3 application documented | I1 routing/control-plan/PFMEA/station contract + M3 CNC/mold constraints | No mold-ready solids, CAM, final PCB, robot motion program, safety validation or production first article |

`evidence/integration-checks.json`:23 tests pass, strict typecheck passes; Windows10.0.26200, Node24.16.0, npm11.13.0. Build: Electron44.3.0 / Vite8.3.0. `integration-demo.json`:six packaged demonstration checkpoints. Native firmware tests pass and ARM build was rerun after the proposed50ms LED rail startup delay. Test runs are not converted into physical pass claims.

## Findings resolved in this phase

- Existing desktop smoke only reloaded the renderer; the new demo performs full process restart, old-to-new portable upgrade and relocated-package startup.
- An action previously lacked a durable in-flight identity. A flushed intent now precedes spawn; final history precedes intent removal. Recovery marks unresolved outcomes interrupted and never retries them. Invalid intent fails closed. Execution admission is reserved synchronously before disk I/O, closing the duplicate-launch window.
- Invalid relative working directories could leave prior runner state visible during preflight rejection. Preflight now sets a fresh failure result.
- The open stand did not meet the requested physical product appearance. M3 adds four closed walls, removable lid, captured diffuser, LED tray and split cable clamp. The selected ring cannot surround the selected switch, so they are separated by71mm.
- Added the missing pin-level LED power/data/ground/enable circuit, buffer, current limiter and passive schedule. The proposed bulk capacitor motivated a longer firmware rail delay; actual waveforms remain required.
- Packaging excludes output/tmp directories and writes to a separate integration folder, preserving the original binary baseline.

## Prioritized unresolved risks

1. **P0 — no physical integration evidence.** Obtain Pico H, selected button/ring and technician-built insulated P3 harness. Resolve authorized USB identity and build the appropriate firmware before commissioning. Never flash the invalid-ID build-check ELF.
2. **P0 — electrical release gates.** Measure VBUS/buffer supply, inrush/current limit, data back-powering, maximum-white current, whole-device suspend and thermal behaviour. U5 FAULT is presently a test point; logical light state cannot detect an open LED harness or tripped rail.
3. **P1 — received-part fit and optics.** Confirm switch clips/boots, LED pad/adhesive height, cable OD/bend/retention, breadboard/Pico headers and supplier carrier mounting. Print coupons first, then all five M3 parts. Record actual fit,100 button returns, light hot spots and serviceability.
4. **P1 — crash side effects and downgrade.** Arbitrary commands can outlive an app crash; automatic retry is intentionally absent. Reconcile external effects before manual retry. Old alpha.2 cannot parse the new interrupted history state; preserve backups before downgrade.
5. **P1 — distribution qualification.** Run on a genuinely clean supported Windows machine; manually verify native approval, ordinary user ACLs, uninstall and login-startup behaviour. Establish signing and a versioned release identity before public distribution. Byte-for-byte build reproducibility is not claimed.
6. **P2 — factory readiness.** Resolve every traceability dependency, produce approved schematic/layout and toleranced drawings, qualify materials/fasteners/assembly force, then commission supplier DFM, fixtures and robot safety. Tall solid M3 prototype posts/saddle need coring/draft redesign for molding. No factory order or release is authorized by this package.

## Demonstration package

`output/SignalKey-Integration-M3-Review-Kit.zip` contains source and lockfile, tests/regeneration scripts, preserved engineering materials, the new guide and evidence, and both portable Windows package revisions required by the upgrade demo. Its manifest records the SHA256 of each included file; the outer verification JSON records archive hash and re-read verification. No live userData, SDK token, node_modules development tree or firmware toolchain cache is included. Tools and npm dependencies must be restored using the installation guide. The kit is a review/fit-prototype handoff, not a manufacturing release.
