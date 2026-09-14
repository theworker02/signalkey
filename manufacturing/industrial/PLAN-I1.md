# Industrial manufacturing plan I1

SignalKey / Magnexis / 2026-09-13. Process-engineering review package. No factory line, mold, robot cell or production PCB has been designed to release level, commissioned or qualified. The deliverables below define how to develop them. They are not executable machine instructions or a manufacturing approval.

## Three routes with explicit design changes

| Route | Suitable work | Product architecture | Remaining approval |
|---|---|---|---|
| FDM prototype | Fit and interaction learning | M2 stand, Pico H, breadboard and off-the-shelf switch | Coupons, physical fit, electrical commissioning |
| CNC / fabricated pilot | Repeatable low-volume bench kits or rugged pilot housings | M2 XY DXF plus underside pocket; turned spacers; or separately designed bent-sheet housing with insulation | Material/stock tolerances, CAM, deburring, surface treatment and first article |
| Injection-molded production | Sustained demand after design validation | Custom PCB, compact supported switch, molded base/lid/cap and optical diffuser, fixture-accessible test points | New production solids/drawings, mold DFM, PCB release, cell integration and qualification |

The M2 breadboard stand is not a mold master or a consumer product. M1 is an earlier compact fit study with unresolved switch/board fit. Neither should be converted directly into a production mold. Keep mechanical interfaces under revision control while changing processes.

## Production design input

Proposed product stack: molded base with locating datums; fixed PCB supports and connector anchors; independent switch load carrier; guided cap with positive stop and validated return; retained diffuser; screwed serviceable lid. Prefer a single top-down assembly direction where practical. Use asymmetric locating features to prevent 180-degree insertion. Present fasteners in one driver orientation. Avoid loose flexible wire routing by PCB placement or a keyed harness. Retain electrical clearances and recovery access. Final dimensions follow the selected switch, connector, LED and PCB, not the prior concept envelope.

Datum proposal for a new production drawing: A=base seating plane, B=longitudinal locating edge, C=unique end stop. Use three support pads, two lateral locators and one end locator in the nest; clamps seat the part without forcing molded distortion. Prefer round/diamond locating pins when two holes locate a rigid part, to avoid overconstraint. Critical dimensions include switch-to-cap stack, stop travel, connector position, PCB/support locations and diffuser retention. Each needs a specified tolerance, measurement method and measurement-system study before capability claims.

Injection-molding input: select exact resin grade, color and texture first. Keep walls reasonably uniform; start DFM discussions with ribs/boss walls around 40–60% of adjacent walls, not a universal drawing requirement. Draft, shrink, gate/ejector positions, weld lines, sink and undercuts depend on resin, texture, tool and geometry. Quote aluminum bridge tooling and steel production tooling separately. Review straight-pull feasibility, slides/lifters, interchangeable inserts, cavity identification, tool life/maintenance and replacement ownership. Run trial shots, dimensional conditioning and functional fit before approving tool corrections. No shrink factor, pressure, mold temperature or cycle recipe is guessed here. [Protolabs wall guidance](https://www.protolabs.com/resources/design-tips/improving-part-design-with-uniform-wall-thickness/) and [draft guidance](https://www.protolabs.com/resources/design-tips/improving-part-moldability-with-draft/) support these review topics; the toolmaker must approve the actual design.

PCB route: release schematic, BOM/approved alternates, layout/stack-up, fabrication/drill files, placement files, assembly/polarity drawing, stencil requirements and programming/test access. Supplier performs incoming material checks, solder-paste inspection, placement, profiled reflow, AOI, justified X-ray/other inspections, programming and electrical test. Agree the applicable IPC-J-STD-001 process requirements and IPC-A-610 acceptance revision/class contractually; do not claim that selecting Class 2 alone validates reliability. [IPC explains their complementary scope](https://www.ipc.org/news-release/ipc-releases-j-revisions-two-leading-standards-electronics-assembly). Package thermal/MSL/reflow constraints come from each exact component datasheet. Do not substitute LED silicon without current, timing and optical review.

## Workstation route

The detailed route is in `process-route.csv`. W10 incoming inspection segregates lots. W20 PCB fabrication/SMT remains at an approved EMS supplier. W30 programming creates traceable binary/serial records. W40 loads the lower housing and verifies orientation. W50 inserts PCB/carrier/optics. W60 closes and drives fasteners with recorded torque-angle results once limits are qualified. W70 performs electrical/USB/button/optical tests. W80 labels and verifies serial-to-test linkage, then packs. Rejects go to a locked disposition flow; rework retains the original failure and requires a complete applicable retest.

Keep manual and automated station outputs identical so automation can replace a validated manual operation without losing traceability. Product test failures and machine faults are distinct. Do not repeat a partially completed screw or press operation automatically after an uncertain result.

## Robot-arm adaptation

The proposed first automations are tray-to-nest handling, vision orientation checking, controlled screwdriving, test-fixture loading and labeling. Select robot payload from gripper+part+cabling mass, inertia and worst reach; no robot model or cycle guarantee is selected. Tiny loose translucent parts may need trays/escapements, vacuum tooling with pickup confirmation or compliant jaws with qualified force. Optical inspection requires controlled lighting and a measured reference; camera confidence alone is not a functional test.

Use calibrated product/nest/tool/camera coordinate frames, approach clearances and approved trajectories taught in the actual cell. Fixture presence, clamp status, part presence, tool health and a unique work-order transaction ID gate each operation. Require screw-present/pickup detection and torque-angle evaluation; insertion operations need measured force/displacement windows and jam recovery. Set limits only after instrumented trials. The companion app and its RGB status are not safety controls or an emergency stop.

A separate safety-rated controller and the robot's safety system govern guarding, stops, interlocks, safe restart and energy isolation. The integrator must assess the complete application, including end effectors, presses, sharp parts and human access. Collaborative branding does not establish safe operation without guarding. [ISO 10218-2:2025](https://www.iso.org/standard/73934.html) covers industrial robot applications/cells; only its public scope was consulted, not the full paid standard. [Universal Robots' integration guidance](https://www.universal-robots.com/manuals/EN/HTML/SW5_20/Content/prod-usr-man/complianceUR5e/H_g5_sections/safety_g5/integrat_valid.htm) assigns whole-system integration responsibilities. Applicable local standards and required safety performance must be determined by the integrator.

`station-interface.json` is a proposed non-safety handshake, not a PLC/robot program. Start is accepted once per transaction. Completion needs physical result evidence. Timeout, lost communications or E-stop requires a controlled hold and reconciliation; never silently replay motion. A reset request does not authorize machine restart. Qualified personnel define restart conditions in the actual controller.

## Capacity and economics

Size stations from observed cycle times and target good output, not robot marketing speed. Example only: 20 days/month ×2 shifts/day ×7 net scheduled hours gives 280 hours. For 10,000 good units/month, availability 0.85, performance 0.85 and quality 0.98 allow an ideal bottleneck cycle of 71.371 seconds per unit. Formula: scheduled seconds × availability × performance × quality / required good units. Quality is applied once. Batch oven, multi-cavity molding and parallel fixture capacity require separate models and buffer analysis. This is a calculation scenario, not measured throughput or a demand forecast.

Request itemized quotes for engineering, tooling, fixtures, programming, integration, guarding, qualification, calibration, training, spares, recurring labor/material, scrap/rework and maintenance. Compare automation against a validated manual process using realistic utilization and changeover. Do not buy a high-volume line before product demand, design and yields are demonstrated.

## Qualification gates and deliverables

1. Design review: approved component drawings, DFMEA, tolerance stack, electrical limits, software/firmware interfaces and service/recovery.
2. Process review: PFMEA, control plan, supplier capability evidence, measurement-system analysis, maintenance/calibration and controlled work instructions.
3. First article: actual dimensions, material/lot identification, electrical/optical/USB results, firmware hash and serial uniqueness.
4. Factory acceptance: dry cycles, missing/reversed parts, tool failures, communication loss, power interruption, reject segregation, traceability and recovery under the approved safety plan.
5. Site acceptance: repeat checks with installed utilities, guarding, trained operators and production materials; verify the measured rate over a defined run.
6. Release: approved records, unresolved deviations closed, controlled master files and signed responsibility matrix. A checklist alone is not approval.

Required release files still absent: production native solids/STEP and toleranced drawings, final PCB outputs, mold design, gripper/nest drawings, cell layout/reach analysis, actual robot/PLC programs, safety validation, qualified torque/force limits and real production-test software. I1 supports an engineering scope/RFQ, not an immediate factory build order.

DFMEA means design failure mode and effects analysis; PFMEA applies the same analysis to manufacturing processes. SPI is solder-paste inspection; AOI is automated optical inspection; EMS is an electronics manufacturing services supplier. Each is a defined review or process step, not a certification awarded by this document.

Initial process failure analysis is `pfmea-initial.csv`; no severity/occurrence/detection scores are fabricated. The proposed control plan is `control-plan.csv`; all unqualified numeric acceptance limits remain explicitly pending. `capacity-scenario.json` records the checked example assumptions and formula.
