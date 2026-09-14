# Current active enclosure: TILE T1 / P3 integration proposal

Use [tile-t1/README.md](tile-t1/README.md) for the active larger TILE enclosure, CAD, printable exports, drawings, assembly route, inspection record and the separate prototype/production plan. T1 is sized around the existing P3 bench hardware rather than asserting that the compact concept image can contain it. It remains a virtual proposal until its physical record is completed.

`closed-m3`, `bench-m2` and the M1 study below are superseded enclosure references. They are retained for traceability only and must not be combined with T1 dimensions, optical parts, wiring or active assembly instructions.

# Superseded mechanical fit study M1

# Mechanical fit study M1

Editable source: `enclosure.scad`. Exports: `exports/base.stl`, `lid.stl`, `cap.stl`, `diffuser.stl`, `carrier.stl`. OpenSCAD 2021.01 rendered each part and `exploded.png`; trimesh checked closed surfaces, positive volume, winding and declared bounds. See `exports/verification.json` for hashes and exact results.

Assembled dimensions: 55 × 55 × 24 mm excluding feet; base height 20, lid thickness 2, cap top at Z24. Wall 2.2; corner radius 8. Cap body diameter 36, lid opening 36.7, radial gap 0.35. Flange diameter 38.5, thickness 1.2; carrier stop establishes 0.6 travel. Diffuser OD43/ID36.7, height1.4. Rear connector opening 12 × 6 centered Z8.8 is provisional. Four lid holes are on 40 × 40 centers. Carrier lugs use separate supports. See `exports/dimensions.svg` for a dimensional illustration, not a toleranced drawing.

STLs are individually normalized for printing; cap is flipped flat-face down. Their positions are not assembly coordinates. Assembly references remain in the source. Nominal exported bounds in mm: base55×55×20, lid55×55×2, cap38.5×38.5×10, diffuser43×43×1.4, carrier49.4×40.5×1.8. Samples within the cap stroke found zero volumetric overlap; flat coincident contacts in the collision diagnostic are not printable meshes. This is a sampled geometry check, not continuous-motion or tolerance proof.

Switch return/force/travel, final PCB, actual connector footprint, fasteners and thread engagement remain unresolved. Pilot holes and screw clearances are proposed geometry only. Print clearance coupons before fitting components. Check cap return, diffuser retention, carrier load path, cable forces, BOOTSEL/RUN access and insulation. A Pico H breadboard prototype needs a larger separate carrier.

Reproduce using OpenSCAD 2021.01:

```powershell
openscad -o mechanical/exports/base.stl -D 'part="base"' mechanical/enclosure.scad
# Repeat for lid, cap, diffuser and carrier.
openscad -o .local/collision.stl -D 'part="collision"' mechanical/enclosure.scad
python scripts/check-mechanical.py
```

The checker also expects the locally generated collision diagnostic documented in its source. No print, physical fit, strength, thermal, lifetime or moldability test was performed. No STEP exists. Printed-polymer fit prototypes are the next proposed process; molding needs a separate draft/wall/sink/undercut/shrink/ejector review.
