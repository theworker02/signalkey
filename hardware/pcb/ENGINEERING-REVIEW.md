# Custom PCB E1 — engineering inputs, not fabrication data

No schematic, routed board, approved footprints, Gerbers, drill/placement files or ERC/DRC reports exist. The block diagram in `../../docs/diagrams/power-tree.svg` is not a netlist. Exact LED, connector, protection components and switch remain unselected. Candidate BOM entries are not procurement approvals.

USB-C data receptacle → protection/inrush control → separate 3.3 V logic and switched/current-limited LED branches. Use two separate 5.1 kohm 1% proposed Rd resistors. Standard contacts A5/B5 are CC1/CC2, A6/B6 are D+, A7/B7 are D−; never treat these as an unselected footprint's pad numbers. Do not choose a power-only receptacle with internally shorted data contacts. No PD or higher-current advertisement detection is implemented.

The source review and exact clauses are in `../../docs/ENGINEERING-GUIDE.md`. Descriptor source now requests 500 mA configured. Preconfiguration limit is 100 mA; suspend limit is 2.5 mA including bus resistors averaged over any one-second interval. Firmware rail-control source exists on GP4, but whole-device low-power behavior, inrush and all current measurements remain pending.

E1 calculation inputs are `../power-assumptions.json`. With 12 pixels, 60 mA full-white assumption, 64/255 ceiling, 12 mA LED quiescent allowance and 75 mA logic input allowance, normal input is 267.7 mA. Proposed TPS2553 RILIM100 kohm ±1% gives calculated232.0–305.8 mA limits; worst limited input including logic is380.8 mA. Confirm enable pulldown, output capacitance, startup, data-line backpower, switch thermal/fault behavior and actual LED lot before power. Brightness software is not fault protection. The buffer must not inject current into a powered-off LED rail.

Proposed four-layer stack-up: components/signals, continuous ground, power/slow signals, ground/signals. Obtain manufacturer impedance geometry for nominal90 ohm differential USB routing before choosing trace widths. Follow [RP2040 hardware design guidance](https://datasheets.raspberrypi.com/rp2040/hardware-design-with-rp2040.pdf) for MCU support, USB termination, flash/crystal and decoupling; review exact parts and supply tolerances. Put ESD near the receptacle, preserve continuous return paths, and independently anchor the connector. Shield termination and EMC design remain unresolved.

Test access: protected VBUS,3V3,GND,RUN,SWDIO/SWCLK,GP2data,GP3button,GP4LED enable and limiter fault. Keep BOOTSEL accessible. Review the mechanical carrier so repeated load bypasses solder joints. Final regulator dissipation must use actual input/load/ambient values; no thermal result exists.

Order of work: freeze parts/drawings → schematic and independent review → footprint/mechanical review → layout → explained ERC/DRC results → DFM → revisioned fabrication pack → authorized engineering build → measurements. Until then, request only a design-service scope estimate, not a fabrication quote presented as build-ready.
