# Hardware integration evidence boundary

Current compatibility: companion0.1.0-alpha.2 integration build; protocol1.0; RP2040 Pico firmware source0.0.3 with P3 startup-delay change; fixed12 RGB pixels, channel ceiling64/255, GP2 data, GP3 button, GP4 LED power enable. USB vendor-defined HID pageFF00/usage1, unnumbered64-byte reports, interrupt IN/OUT. node-hid write API needs a leading zero report-ID byte (65 bytes total); receive decoder accepts64 bytes. No keyboard device or arbitrary keystroke injection is used.

`packages/protocol/README.md` is the command/ACK table and `packages/protocol/golden.json` is the wire fixture. Sequence and padding requirements are implemented by the host and native C parser. ACK means that firmware accepted the command; GET_STATE reads firmware logic state. Neither ACK nor readback measures emitted light, current, physical switch motion or command side effects. A desktop process success means exit code0, not a semantic guarantee that an external deployment/build succeeded correctly.

Open sequence: authorized configured VID/PID + selected serial → HELLO → GET_CAPABILITIES → GET_STATE. Protocol major/minor both must match. Require button/light/heartbeat feature bits; the parser bounds LED count and ceiling, but only12/64 is the documented configuration. Do not infer arbitrary variant compatibility from accepting bounded values. Serial provisioning, final USB identifiers and a distributable authorized-ID UF2 are unavailable. Empty/ambiguous identities must be resolved during provisioning before user deployment.

Host ACK timeout1s; at most16 outstanding commands; no automatic command retry. Heartbeat every2s; stale after6s. Reconnect attempt every2s for the selected serial only, followed by fresh handshake and unknown light state. Button events have their own sequence domain; host suppresses duplicate sequences over a rolling64-event cache and limits10events/s. This is bounded transport deduplication, not a permanent business-action idempotency ledger. Fresh manual presses after completion intentionally execute again. Firmware session reset discards queued input and requires stable released button before accepting input, including reconnect while held.

An already-launched process continues when the display device disconnects; losing a status peripheral does not undo or replay the external command. Desktop manual execution remains possible when disconnected, with no claim of physical indication. Reconnection never replays a run. During suspension/shutdown the app requests cancellation; Windows process-tree termination is best effort and is not a durable JobObject containment guarantee.

| Evidence | Environment | Result | What it does NOT prove |
|---|---|---|---|
| tests/transport.test.ts | fake HID adapter on Windows | ACK correlation, missing ACK, removal, malformed input and duplicate events pass | Physical USB timing/enumeration or electrical device behaviour |
| tests/recovery.test.ts + integration-demo.json | Node service + actual packaged Electron/real child commands; virtual button | Concurrency and no replay after crash/restart pass | Exactly-once arbitrary external effects |
| packaged-smoke.json | prior same-host packaged app, native node-hid load/enumeration | Native binding loads | A SignalKey hardware unit was connected |
| native-firmware-tests.json | native C compiler/tests | Protocol, button and session tests pass | MCU timing or power |
| arm-firmware-build.json | pinned Pico SDK/Arm toolchain | Actual ARM compile/link passes | Flashing/boot/USB or LEDs; invalid-ID build-check only |
| Physical Pico/USB/button/LED test | No unit available | BLOCKED | All physical integration remains unverified |

Required physical capture: board/serial/USB IDs, firmware and app hashes, OS/controller/hub/cable, raw report logs with times, button press/release video, held reconnect, missing ACK/reset, measured rail/DIN waveforms, current at enumeration/suspend/max white and a per-pixel visual result. Keep simulated records in their own category. Use the blank [T1 inspection record](../mechanical/tile-t1/inspection-record.csv); no hardware pass is prefilled.
