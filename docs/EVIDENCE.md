# Verification evidence — updated 2026-09-13

**Active evidence:** 23 automated tests and typecheck pass; six packaged full-restart/upgrade/crash checkpoints pass. TILE T1 has six watertight prototype mesh exports and generated drawing sheets; see [T1 export verification](../mechanical/tile-t1/exports/T1-export-verification.json) and [the readiness report](READINESS-INTEGRATION.md). These are digital checks. Physical hardware, print-and-fit, optical, electrical, clean-machine installation and production qualification remain untested.

Current companion revision: 0.1.0-alpha.2. Native C firmware logic revision 0.0.3. The active enclosure is TILE T1, with a P3 bench-harness integration proposal. Earlier M1/M2/M3 evidence below is historical traceability, not active enclosure-release evidence. No physical hardware or certification result is inferred from software or geometry checks.

| Check | Observed result | Scope / limitation |
|---|---|---|
| `npm run typecheck` | PASS | Strict TypeScript host/UI checks |
| `npm test` | 23 tests PASS | Real process lifecycle, protocol/API boundaries, profile migration/persistence, history, fault behavior, interrupted-run recovery and duplicate-admission behavior |
| `npm run package:win` | PASS | Electron44.3.0/Vite8.3.0 build and unsigned Windows x64 portable package |
| Packaged `npm run test:desktop` | PASS | Actual UI pass/fail/recovery, create/edit/reload, disabled run, history display, stale-heartbeat recovery |
| Runtime renderer preferences | PASS | sandbox true, contextIsolation true, nodeIntegration false |
| Native HID module enumeration | PASS | Module loads in packaged Electron; no physical device interoperability asserted |
| `powershell -File scripts/test-firmware.ps1` | Three native C executables PASS | Zig 0.15.2 cc; golden/malformed reports, gestures, clock wrap, offline/reconnect release gate |
| OpenSCAD 2021.01 + `scripts/export-tile-t1.py` | Six T1 meshes PASS | Watertight, winding-consistent, positive-volume STL/3MF prototype exports; no fit or production claim |
| Four original SVG diagrams and PNG renders | Visually inspected | Source-backed power proposal, representative workflow, model dimensions and planning gates |
| Power budget | Calculated/tested | TI equations plus resistor tolerance; assumptions are not measurements |
| `powershell -File scripts/build-firmware-check.ps1` | ARM compile/link PASS | SDK 2.2.0/TinyUSB pinned; Arm GCC 14.3.1; strict warnings for project C; invalid 0:0 ID check only |
| Authorized-ID UF2, USB power/timing, physical enclosure | NOT VERIFIED | No board, bench measurements or physical print exists |
| Manufacturing/DFM/compliance/cost | DRAFT | No schematic/layout, approved fixture/limits, quotations or certifications |

Core tests verify history survives a service restart without restoring a current success. UI reload verifies profile persistence and history is displayed during the desktop flow. Native import/export/enable/delete dialogs are not fully automated end-to-end. Windows process-tree cleanup remains best effort using taskkill; no Job Object guarantee. Launch timing is runner-entry to process spawn, not button-to-light latency.

Recorded results: `evidence/packaged-smoke.json`, `evidence/native-firmware-tests.json`, `evidence/arm-firmware-build.json`, `../mechanical/exports/verification.json`. Screenshot: `evidence/desktop-success.png`. Full package file hashes: `evidence/package-inventory.json`. Hashes identify local artifacts; they are not code signatures or certificates. Keep the entire portable directory together.

```powershell
$env:SIGNALKEY_EXECUTABLE=(Resolve-Path 'release/0.1.0-alpha.2/SignalKey-win32-x64/SignalKey.exe').Path
npm run test:desktop
Remove-Item Env:SIGNALKEY_EXECUTABLE
```

The initial legacy GCC attempt lacked standard headers; the project-local Zig compiler resolved native C testing. On2026-09-13 the pinned Arm toolchain also resolved ARM/Pico compilation and linking. Early desktop test failures exposed ambiguous gesture labels and asynchronous editor readiness; both were corrected before the passing run. Earlier alpha1 evidence is superseded by the current package result.

Local engineering tools (not shipped in the app): OpenSCAD2021.01 portable, Zig 0.15.2 portable, Python venv with PyMuPDF1.26.4/trimesh4.8.1/numpy2.3.3. Tool downloads were obtained from official projects; no system-wide installation was made. OpenSCAD archive SHA256 FB0CAABF5BBC89F8F2F80C10B79AE64D697AAFF6EFD58B2756F5D6270EDB7BA7; Zig archive SHA256 3a0ed1e8799a2f8ce2a6e6290a9ff22e6906f8227865911fb7ddedc3cc14cb0c.

No commit, push, PR, public release, deployment, order or external message was made.

The ARM build caught reserved PIO label `zero` and a TinyUSB OS macro conflict; both were corrected. Source formatting resolved strict misleading-indentation warnings. `firmware/toolchain-lock.json` records official archive hashes and SDK commits. Current memory sections: 35,164 bytes text, 0 data, 3,888 bss; stack/heap peak is not measured. No application UF2 was generated and the scratch ELF must not be flashed. Desktop source/package remain alpha 2; their prior packaged smoke evidence is unchanged.

Normal device configuration rejects missing and zero USB identifiers; see `evidence/firmware-identity-gates.json`. The full 18-test host suite was rerun and passed on 2026-09-13 after firmware descriptor formatting. No desktop code changed in this increment.

M2/I1 checks: 12 STL files are single connected closed meshes with consistent winding, positive volume, Z0 print placement and expected bounds; 3 DXFs have closed contours, expected loop counts and dimensions. Seven PDF pages rendered with Poppler and visually inspected. Component dimensions checked against original button drawing and Pico/breadboard documentation. Industrial capacity arithmetic recomputed (71.37144 s). These are geometry/document checks, not physical manufacturing qualification. See `mechanical/bench-m2/exports/verification.json`.
