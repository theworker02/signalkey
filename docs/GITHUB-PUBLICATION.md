# GitHub publication checklist

This repository is ready to be presented as an **engineering concept and partnership-development repository**. It is not ready to be presented as a released hardware product, a manufacturer-ready production package, or an open-source manufacturing design.

## Publish these source materials

- Desktop, protocol and firmware source, with the existing local-only security model and evidence clearly described.
- TILE T1 native SCAD, STL/3MF prototype exports, drawing sheets, BOM, physical-inspection record and prototype/production-route document.
- Hardware integration documentation, including the explicit P3 component-envelope gaps.
- The manufacturer partnership note and current readiness report.

## Do not present as verified

- Physical enclosure fit, button feel, LED optics, USB access, harness integrity, power behavior, durability, compliance, moldability, factory capability or production readiness.
- STEP, released PCB design, authorized firmware binary, production tooling, robot program, supplier quote, safety validation or certification.
- The amber prototype optical insert as proven preservation of the existing RGB status presentation.

## Repository setup

1. Create the GitHub repository as private or public according to the owner's disclosure decision.
2. Keep `output/`, `release/`, `.local/`, `node_modules/`, `dist/`, generated firmware build products and personal data out of source commits. Upload selected review ZIPs and portable builds only as GitHub Release assets after checking their contents.
3. Keep the release asset named `SignalKey-TILE-T1-Review-Kit.zip` with its adjacent verification JSON. It is a review/fit-prototype handoff, not a product release.
4. Review `LICENSE-STATUS.md` before enabling public contributions. No open-source grant is currently offered.
5. Before publishing, scan staged files for personal paths, user data, USB tokens, secret material, command output and unrelated binaries.

## Suggested GitHub description

> SignalKey is a local-first desktop workflow controller. This repository contains the 0.1.0-alpha.2 software foundation and the TILE T1 enclosure concept for prospective manufacturing-development partners.

## Suggested first release notes

> **Engineering concept release — not for manufacture.** Includes the TILE T1 parametric enclosure proposal, printable prototype meshes, drawings, P3 integration notes and a physical validation record. A manufacturing partner must complete DFM/DFA, controlled production CAD, sourcing, tooling, fixtures, validation and production release under a separate written agreement.

## Owner gates before a public production claim

- A selected license and contribution terms.
- Measured component envelopes and a successful P3 print-and-fit record.
- Real device/harness/USB/optical evidence and a controlled firmware identity.
- Production B-rep CAD, toleranced drawings, released electrical design and supplier-controlled BOM.
- Approved DFM, first article, quality plan, regulatory route and written production release.
