# SignalKey HID protocol 1.0

Vendor-defined HID usage page FF00, usage 1; no keyboard enumeration. USB full-speed interrupt IN/OUT endpoints, maximum packet 64 bytes, proposed polling interval 2 ms. One unnumbered report: no report ID is present on the wire. node-hid `write` receives **65 bytes**: leading zero report-ID byte followed by the 64-byte report; input decoder expects 64. Other libraries must adapt explicitly.

| Offset | Bytes | Meaning                          |
| ------ | ----: | -------------------------------- |
| 0      |     2 | Magic 53 4B                      |
| 2      |     1 | Major 1                          |
| 3      |     1 | Minor 0                          |
| 4      |     1 | Opcode                           |
| 5      |     2 | Sequence, unsigned little-endian |
| 7      |     1 | Payload count, 0–56              |
| 8      |    56 | Payload followed by zero padding |

Both major and minor must match for v1.0; future minor compatibility requires explicit negotiation. Malformed length, version, magic, opcode or padding is rejected. Host command sequences wrap at 65536 and ACKs echo them. No automatic retry is performed; ACK deadline is one second, at most 16 outstanding host requests. Unknown/missing responses fail visibly. A reconnect opens only the selected serial identity, re-handshakes and marks prior results unknown; actions never replay.

|  Op | Name             | Request/event payload                              | ACK payload                                  |
| --: | ---------------- | -------------------------------------------------- | -------------------------------------------- |
|   1 | HELLO            | empty; begin session, stale result cleared         | 1                                            |
|   2 | GET_CAPABILITIES | empty                                              | 2, feature bits 07, LED count 12, ceiling 64 |
|   3 | GET_STATE        | empty                                              | 3, state, brightness                         |
|   4 | BUTTON_EVENT     | gesture 0 press / 1 double / 2 hold                | unsolicited; own sequence space              |
|   5 | SET_LIGHT        | state 0–6                                          | 5                                            |
|   6 | SET_BRIGHTNESS   | channel ceiling 0–64; larger firmware values clamp | 6                                            |
|   7 | HEARTBEAT        | empty                                              | 7                                            |
|   8 | ACK              | opcode then optional data above                    | no ACK of ACK                                |
|   9 | ERROR            | error code then rejected opcode                    | no ACK                                       |

States: idle 0, running 1, success 2, failure 3, cancelled 4, unknown 5, disconnected 6. Feature bits: button=1, semantic light=2, heartbeat=4. Error codes: 1 invalid payload length, 2 invalid state, 3 unsupported direction/command. Invalid framing and rate excess are silently discarded so untrusted traffic cannot amplify replies. Firmware limit: 30 valid reports/second. The host handshake checks HELLO, queries capabilities, requires all three feature bits and validates LED count/brightness limits. It reads firmware state after light changes. This host targets the 12-pixel/64-ceiling baseline; physical variants need interoperability validation.

Priority: disconnected overrides display; active local runner overrides SDK; SDK status is a six-second lease and expires to unknown; otherwise the latest observed local result persists until another run or restart. No success state is persisted. Transport heartbeat continues during idle. Simulator freshness uses monotonic time and treats backward movement as stale. Firmware uses wrapping elapsed milliseconds.

Golden fixture is hand-specified and host tested. Native C protocol, button and session tests pass; the pinned ARM build also compiles and links. See docs/evidence/native-firmware-tests.json and arm-firmware-build.json. Neither result is physical USB validation. Host suppresses duplicate button sequences in a rolling 64-event cache and limits presses to ten per second. Reordered duplicates, malformed reports, missing ACKs and removal are exercised with a fake HID boundary; physical USB behavior remains unverified.
