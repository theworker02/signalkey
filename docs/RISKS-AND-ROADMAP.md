# Remaining work and release gates

The first usable increment is 0.1.0-alpha.2. Do not call the entire manufacturing brief complete.

| Risk / gap | Current mitigation | Next gate |
|---|---|---|
| Arbitrary local command damage | Explicit configuration, disabled imports, native enable review; no shell interpolation | Windows Job Object adapter and stronger descendant cleanup tests |
| Physical stale/duplicate events | Heartbeat expiry, host replay cache, ACK bounds | Real boards and logic/USB trace; no non-idempotent replay |
| USB current/thermal fault | Conservative budget and documented hardware limiter need | Approved schematic, switched rail, measured current/suspend |
| Device firmware not commissioned | Pinned ARM compile/link check and three native tests pass | Authorized-ID UF2 generation, board flashing and physical USB/LED tests |
| Enclosure component fit/load | T1 digital meshes checked around bounded P3 envelopes; received parts not measured | Print T1 coupons, then validate switch guidance/stops, USB access, harness routing and off-center presses |
| Native packaging regressions | Development and portable Electron HID smoke pass | Clean Windows machine and signing/release review |
| SDK access by same-user software | Session token, loopback/origin/body/rate limits | Review Windows ACLs and named-pipe security adapter |
| Missing device identity license | No firmware identifier defaults | USB-IF VID or documented license before distribution |
| Unit economics unknown | Unknown quote template and labeled sensitivity model | Actual engineering/manufacturing/lab quotes |
| Usability/demand unknown | Real demo, interview/pilot worksheet | Consented pilots; no inferred demand |

Next software milestone: add custom light patterns, robust Job Object lifecycle, physical capability/readback validation, measured acknowledgement latency and native-dialog end-to-end tests; then assess 0.1.0 release criteria. OBS and Windows microphone adapters are planned and have no fake UI switches. No microphone privacy guarantee is made.

Next physical milestone: P2 staged commissioning in `hardware/prototype/BUILD-P2.md`: Pico H plus bench switch first, reviewed LED harness second, with measured host→light/press→host behavior. Then use the received-part measurements to print and fit TILE T1, capture the T1 inspection record, and only then progress to a controlled PCB/layout and partner DFM review. Manufacturing stages and quantities remain conditional on evidence.
