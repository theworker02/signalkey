# Current electronics build plan: P3 inside TILE T1

See [WIRING-P3.md](WIRING-P3.md) for exact header/IC endpoints, protected LED rail, passive schedule and commissioning requirements. The active enclosure is now [../../mechanical/tile-t1/README.md](../../mechanical/tile-t1/README.md), a larger virtual proposal that bounds the P3 bench hardware. P2 remains the button-first commissioning stage. Neither electronics nor T1 has been physically tested.

# Earlier build stage: P2

See [BUILD-P2.md](BUILD-P2.md) for staged button-first commissioning, selected bench switch and harness constraints. The P1 ring harness below remains a proposal for the second stage.

# Development-board prototype P1 — review before power

No hardware was purchased, assembled or powered. Matthew has no soldering equipment; request preassembly of the ring/buffer harness and inspection from an assembly partner. Pico H headers reduce soldering but do not make the bare ring or level-shifter package solder-free. A breadboard prototype will exceed the proposed 55 mm enclosure.

Selected board family: official Raspberry Pi Pico H (RP2040, preinstalled headers, Micro-USB). [Pico documentation](https://www.raspberrypi.com/documentation/microcontrollers/pico-series.html) and [Pico datasheet](https://datasheets.raspberrypi.com/pico/pico-datasheet.pdf), consulted 2026-09-12. Custom PCB pin numbering is different; do not use this physical header table for QFN pins.

| Pico H header | Net | Proposed connection | Verification |
|---|---|---|---|
| 4 / GP2 | LED_DATA_3V3 | AHCT buffer input | Board pin assignment from Pico pinout; harness unbuilt |
| 6 / GP4 | LED_ENABLE | Proposed TPS2553 EN with external default-off pulldown | Circuit not built |
| 5 / GP3 | BUTTON_N | Normally open switch to GND; internal pull-up | Verify switch contact pair with meter |
| 3 / GND | ground | Common switch/buffer/ring return | Confirm continuity before power |
| 40 / VBUS | USB 5 V | Reviewed protected ring supply input | Do not connect to 3V3 or backfeed external power |
| 36 / 3V3 OUT | logic supply | Test point only; not ring power | Not a 5 V output |
| 30 / RUN | reset | Optional momentary GND reset | Accessible recovery |

Candidate lighting module: [Adafruit 1643, 12 RGB NeoPixels](https://www.adafruit.com/product/1643). Exact installed LED silicon can change; obtain lot-specific datasheet before approval. Use a 5 V [SN74AHCT1G125](https://www.ti.com/lit/ds/symlink/sn74ahct1g125.pdf) buffer: active-low OE to ground, A from GP2, Y through a proposed 330 ohm series resistor to DIN, and local 100 nF decoupling. DOUT remains unconnected. AHCT VIH minimum is 2 V at its specified 4.5–5.5 V supply, suitable for 3.3 V logic. Confirm exact package pin order from its drawing; do not wire by package appearance. The ring may require a higher input-high level than a 3.3 V GPIO can guarantee.

Conservative design assumption pending exact LED datasheet: 60 mA per pixel at full white. Twelve pixels could draw 720 mA, exceeding the proposed USB budget. Firmware ceiling 64/255 limits ideal dynamic white current to ~181 mA, plus quiescent/MCU losses. This is not fault protection. Require a reviewed current-limited LED rail, default OFF until configuration, with gate tied to mounted/suspend state before a powered prototype is approved. Firmware 0.0.2 implements GP4 rail-control source; the switch circuit and full-device suspend behavior remain unverified. See E1 power calculations: 500 mA configured request, 75 mA logic allowance, 12 mA LED quiescent allowance, proposed 100 kohm ±1% TPS2553 limit resistor. A lab supply/current-limited test fixture and measured USB current are necessary.

Assembly partner deliverable: board + ring + buffer + normally open button + harness mounted on insulating carrier; wire-color/pin photographs; continuity and short checks; measured current at black and maximum allowed white; connector strain relief; no exposed conductors. First power must be supervised and current limited. Never power the ring simultaneously from USB and a separate 5 V source without an engineered power-path solution.
