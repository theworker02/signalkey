# Factory test specification FT1 — draft

Fixture proposal: keyed insulating nest, pogo access to GND/protected VBUS/3V3/SWD/RUN/LED enable/fault, independently current-limited and fused supply, calibrated USB power analyzer, known-good data cable, Windows host with fixed test version, operator-visible result, barcode reader/label printer. An inline USB meter alone cannot prove safety or compliance. Final fixture schematic and measurement uncertainty are unverified.

1. Scan work order, PCB revision, enclosure revision, firmware hash and serial. Reject duplicate serials; do not silently provision a duplicate.
2. Unpowered visual inspection: polarity, solder joints, foreign objects, connector anchors, switch support, housing damage. Record rework separately.
3. Unpowered short/resistance checks against approved limits. Limits are not set yet; do not infer them from a working sample.
4. Controlled first power using engineer-approved current limit; observe inrush and stable rails. Abort on overcurrent/abnormal heating. Record numeric results, instrument ID and calibration date.
5. Program pinned firmware. Verify flash contents/readback where tool supports it; record binary SHA-256. Exercise BOOTSEL recovery and RUN reset.
6. Enumerate approved VID/PID, serial and descriptors. HELLO/capabilities/state must match the version manifest. Reject unexpected serial or report length; verify firmware by programming/readback evidence.
7. Exercise single/double/hold separately. Run harmless host pass/fail samples; correlate input sequence, host exit code and ring outcome.
8. Drive each LED channel and inspect all pixels/diffusion. Measure maximum permitted brightness current, hardware fault ceiling, configuration and suspend states against approved electrical limits.
9. Stop host heartbeat: stale indication by six-second expiry plus one animation frame; restart must not re-execute an action. Unplug/replug selected device, then verify a different device never steals the target.
10. Mechanically check cap return, stops, switch carrier, connector fit and nonslip base. Complete label/packaging inspection.

Any failed stage locks result FAIL and sends the unit to a separate marked bin. Only a complete rerun after logged rework can produce PASS. Never reset a failure by unplugging. Operator sees numeric test stage/result, not only a green light. Require authorized first-article approval before lot release.

Log schema: UTC timestamp, operator, lot, serial, hardware/firmware/protocol/test revisions, firmware hash, host OS/build, instrument IDs, measured rails/current/timing, stage results, failure code, rework record, final disposition. Do not populate sample logs with invented passes.

No fixture, provisioning service or automated factory test application exists yet. Per-channel factory drive is a requirement; the current protocol exposes semantic states only. Add an explicitly controlled engineering firmware/test path before step 8 can be automated. USB steady-state limits are preconfiguration 100 mA, configured 500 mA, and suspend 2.5 mA including bus resistors, averaged over any one-second interval; transient/inrush acceptance and instrument uncertainty need a reviewed test plan. Proposed E1 current calculations are not measured pass limits.

The v1 HELLO response acknowledges the protocol command; it does not expose a firmware version or hash. Match firmware to the manifest using the programmer record/readback, not an invented HID identity field.
