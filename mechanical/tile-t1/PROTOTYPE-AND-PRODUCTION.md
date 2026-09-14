# T1 prototype and production routes

## FDM prototype route

Use PETG for the opaque prototype parts, not a brittle cosmetic resin for the button guides or screw interfaces. Print T1-01 white upper housing opening-up so supports remain in the hidden cavity; orient T1-05 base-down; print T1-02 with its show surface upward only after a surface-quality trial; print T1-03 flat; print T1-04 in a clear material using the supplier's optical orientation recommendation. Protect visible white surfaces from support contact.

Print T1-06 first. Its 1.20, 1.35 and 1.50 mm variants are process-specific trials, not a declared production tolerance. Use the coupon result and the actual machine/material before changing the CAD's nominal button clearance. Sanding, filler and a low-sheen painted finish may approximate the reference appearance but are not equivalent to molded fine texture. Insert bores and bosses need a sample pull/torque test with the exact printer, filament and insert.

The supplied meshes are suitable for prototype print preparation after the machine operator validates orientation, supports, slice preview and dimensions. They do not authorize unattended production.

## Injection-molded product route

The T1 SCAD study establishes the desired silhouette and service architecture; it is **not injection-mold-tool release geometry**. A tooling engineer must recreate or convert the approved B-rep into a moldable model and review these items:

| Topic | Required production decision |
| --- | --- |
| Resin | Select PC-ABS or PC with UV, drop, chemical and heat requirements; verify colour/texture coupons in warm off-white and graphite. |
| Draft | Add process/tool-specific draft to all pull-direction faces, including button opening, guide features, bosses and rear connector opening. |
| Wall and sink | Analyze nominal walls, ribs and bosses; core heavy bosses; inspect for sink/read-through on the show surface. |
| Parting line | Hold it at the intentional graphite-base seam where appearance impact is lowest. |
| Gates and ejectors | Put gate vestige/ejector witness marks on hidden underside or internal surfaces; validate knit lines and warp. |
| Undercuts/tool actions | Review button retention, rear connector opening and guide retention. Use lifters/slides only when approved against cost and service needs. |
| Optical part | Use optical-grade PC/PMMA as appropriate, polish its optical faces and mask/texture non-optical faces. Validate light leakage and colour. |
| Inserts | Select insert family, boss geometry and controlled thermal/staking operation; inspect position, depth and pull/torque after molding. |

No draft angle, mold shrink value, gate location, ejector force, cycle time, robot speed or production capacity is claimed in this package because those values depend on the selected resin, tool, molder, machine and finalized B-rep.

## Factory/automation concept

The intended production route is a serviceable product assembly, not an adhesive-sealed shell: molded/inspected upper and lower parts; insert installation; button/guide verification; harness/LED assembly; PCB or bench-module installation; functional optical/USB test; underside screw closure; foot application; final traceability and pack-out. A robot cell can be evaluated for part presentation, insert loading, screwdriving, vision inspection and label application only after tolerances, fixtures, torque values, ESD handling and safety assessment are defined. The physical validation record remains the release gate.
