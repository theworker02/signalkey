# P3 — enclosed button and status light

Engineering prototype specification, 2026-09-13. This is a pin-level wiring design, not a tested harness or released PCB. The active housing integration is the larger [TILE T1 proposal](../../mechanical/tile-t1/README.md), not closed M3. T1 is intended to contain this P3 bench stack but has only digital envelope checks. The M2 open stand remains a commissioning fixture. No hardware is present for physical validation.

T1 places a broad guided cap over the selected arcade switch and uses the LED ring as an internal source for a short upper-right light guide. Adafruit 1643 has a 23.3 mm inner hole; the selected 471 button has a 29.5 mm body, so these parts MUST NOT be arranged concentrically. Ring reference envelope is OD36.8 × ID23.3 × total height6.7 mm. Supplier LED silicon may vary: procure by product number AND record received lot/silicon. The amber prototype guide can alter RGB appearance; see T1's optical limitation before treating the status palette as preserved visually.

## Electrical architecture

Pico H receives USB data and power through its factory Micro-USB connector. The entire cable enters the split rear saddle before closing the lid; no unselected panel-mount USB-C connector is implied. A technician must assemble and insulate the P3 buffer/current-limiter harness. Bare SOT-23 ICs cannot plug directly into a breadboard. The owner does not need to solder: this is a preassembly work specification for a qualified partner, not an order already placed.

U4 = SN74AHCT1G125DBVR, five-pin DBV package. U5 = TPS2553DBVR, six-pin DBV package, active-HIGH EN, auto-retry current limit; do not substitute TPS2552 or the -1 variant. Pin numbers below are device pins viewed according to the manufacturer top-view drawing, NOT breadboard positions.

| Net | Exact endpoints | Wire / assembly instruction |
|---|---|---|
| VBUS | Pico physical40 → U5.1 IN; U4.5 VCC | Red, proposed 24AWG stranded; buffer stays on VBUS, ring does not |
| GND | Pico physical3 → switch contact2, U5.2, U4.3, U4.1 /OE, ring GND, capacitor returns | Black; common ground; no chassis return |
| BUTTON_N | Pico physical5 GP3 → normally-open switch contact1 | White 26AWG; firmware pull-up; verify contact pair with meter |
| DATA_3V3 | Pico physical4 GP2 → U4.2 A | Yellow; add 100k 1% A-to-GND pulldown at U4 |
| DATA_5V | U4.4 Y → 330ohm 1% series resistor → ring DIN | Yellow; resistor near ring input; DOUT insulated and unused |
| LED_EN | Pico physical6 GP4 → U5.3 EN | Blue; 100k 1% EN-to-GND pulldown at U5 |
| LED_5V | U5.6 OUT → ring 5V; C3 positive | Red; never connect ring power to Pico 3V3 |
| ILIM | U5.5 → 100k 1% resistor → GND | Local component, short trace; calculated limit 232–306mA |
| FAULT_N | U5.4 → test point; 10k 1% pull-up to Pico physical36 3V3 | Open-drain diagnostic only; current firmware does not monitor it |
| C1 | 100nF X7R ≥10V U5.1-to-U5.2 | At U5; not at remote cable end |
| C2 | 100nF X7R ≥10V U4.5-to-U4.3 | At U4 |
| C3 | 470uF ±20% electrolytic ≥10V from LED_5V to GND | After U5 only; observe polarity; reserve Ø10×16mm maximum body envelope |

Physical Pico pins3 and5 are not adjacent. Use separately insulated contacts. All power rails and lead colours require continuity verification; never infer polarity from wire colour. No external power supply may backfeed Pico VBUS. Use data-capable USB cable with intact connector mouldings. Proposed wire lengths: button pair 150mm, ring bundle 180mm, controller-to-harness 120mm; cut lengths are trial values, finalize after lid-open service-loop fit. Keep the resistor-to-DIN leg short and ground alongside data. Avoid splices at the lid seam, screw columns and button clips.

U4 is powered upstream of the ring switch so its supply remains within its specified range during LED rail ramp. Firmware forces GP2 low before disabling GP4. The external GP2 pulldown holds data low during reset. Measure DIN during reset, enumeration, suspend and rail shutdown to confirm no back-powering. AHCT operation requires measured VCC 4.5–5.5V; USB presence alone does not guarantee that at the IC. A lower measured VCC requires a reviewed alternative buffer, not an undocumented substitution.

## Lighting and power acceptance

Protocol state mapping remains idle/dim white, running/blue pulse, success/green, failure/red double pulse, cancelled/amber, unknown/dim amber pattern. Colour and brightness are intentions; the render does not simulate scattering or prove uniformity. The diffuser is a translucent PETG fit prototype; an optical supplier must select opal PC/PMMA grade, transmission, surface finish and attachment for production.

The existing E1 model assumes 60mA/pixel full white, 12 pixels, channel ceiling64/255: about181mA dynamic plus12mA pixel idle and75mA logic =268mA. These are conservative assumptions, not measurements. The 100k limiter analysis gives232–306mA for the LED branch. Full-device worst-case model is381mA, below the proposed500mA configured USB request. See `../power-budget.json`; verify exact LED lot, low-VBUS behaviour, inrush, thermal rise and suspend current before powered release.

The added 470uF capacitor is downstream of the gate, not directly across USB input. With +20% capacitance, ideal charge time to5V at232mA is12.2ms before other loads. Firmware now delays data50ms after enabling; this is an engineering starting value requiring oscilloscope verification. Do not infer USB inrush compliance from this calculation. Firmware must keep the ring off before configuration and during suspend; measure whole-device limits, including the board, buffer and pull-ups. Current limiting and software brightness do not establish electrical qualification.

## Technician build and first-power sequence

1. Procure exact parts and obtain cable OD, switch clip range, ring lot, harness board drawing and termination details. Photograph labels. Check all net-table endpoints unpowered and record resistance/continuity; investigate shorts before applying power.
2. Assemble U4/U5/passives on an insulated carrier no larger than35×25×12mm (C3 separately secured within its envelope). Insulate every solder joint and ring pad. Supply a completed pin-to-pin test sheet and photos. Carrier layout and mounting are a supplier deliverable, not supplied Gerbers.
3. Test button-only commissioning first using BUILD-P2. Use authorized USB IDs and approved firmware. Existing link-check ELF has invalid IDs and must not be flashed.
4. On a controlled bench, validate the LED branch without risking a host port. Never parallel external5V and USB VBUS. Technician must choose the reviewed isolation/current-limited test setup. Measure limiter behaviour, rail ramp, black/max allowed white current, data levels and reset/suspend traces.
5. Install into M3 only after bench checks. Check every state, all12 pixels, uneven light/hot spots, wire shadows, button return, stale heartbeat and held-button reconnect. No command may replay at reconnect. Log actual serial, firmware hash, instruments, readings and disposition in the blank inspection record.

Primary sources: [Pico datasheet and pinout](https://datasheets.raspberrypi.com/pico/pico-datasheet.pdf); [Adafruit1643 dimensions/lot variation](https://www.adafruit.com/product/1643); [Adafruit471](https://www.adafruit.com/product/471); [TI buffer pinout/electrical limits](https://www.ti.com/lit/ds/symlink/sn74ahct1g125.pdf); [TI limiter pinout/capacitance](https://www.ti.com/lit/ds/symlink/tps2553.pdf); [NeoPixel wiring practices](https://learn.adafruit.com/adafruit-neopixel-uberguide/best-practices). Reviewed2026-09-13. Source dimensions do not supply production tolerances.
