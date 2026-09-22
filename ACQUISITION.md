# Acquisition Brief â€” SignalKey

**Date:** 2026-09-22  
**Repository:** https://github.com/theworker02/signalkey  
**Default branch:** `main`  
**Primary language:** TypeScript  
**Status:** Diligence briefing only. **No acquisition has occurred** by virtue of this file.  
**License:** Proprietary â€” sale, written commercial license, or completed asset transfer required (see root `LICENSE`).  
**Valuation:** Not stated.  
**Contact:** GitHub [@theworker02](https://github.com/theworker02) Â· [thanks.dev/u/gh/theworker02](https://thanks.dev/u/gh/theworker02)

> Cloning or forking this repository does **not** grant production, redistribution, SaaS, OEM, or commercial rights.

---

## 1. Executive thesis

This project is **proprietary**. Production use, redistribution, and commercial deployment require a written commercial license or completed acquisition. See [LICENSE](./LICENSE) and [ACQUISITION.md](./ACQUISITION.md). Contact [@theworker02](https://github.com/theworker02). **A local-first desktop workflow controller with a tactile hardware direction.** SignalKey lets a person press a physical control, run an explicitly approved local workflow, and inspect its observed result. The desktop companion is at `0.1.0-alpha.2`; the physical product is an engineering concept under development. > **TILE T1 is an engineering partnership handoff, not a production release.** SignalKey supplies design intent, prototype-oriented CAD and evidence. A manufacturing partner must complete DFM/DFA, production CAD, sourcing, tooling, fixtures, qualification and release work under a separate written agreement.

**Why a buyer cares:** SignalKey packages transferable product IP â€” source, docs, in-repo brand assets, and a diligence room under `docs/acquisition/` â€” under a clear proprietary posture so diligence can proceed without mistaking the repo for open source.

---

## 2. Product snapshot

| Item | Detail |
|------|--------|
| Product | SignalKey |
| Repo | `theworker02/signalkey` |
| Language | TypeScript |
| Open source? | **No** â€” proprietary |
| Rightsholder | theworker02 |
| Diligence pack | `docs/acquisition/` |

### Capability highlights (from current materials)

- [Editable parametric model](mechanical/tile-t1/tile-t1.scad)
- [Assembly, drawings and prototype instructions](mechanical/tile-t1/README.md)
- [Dimensioned drawing](mechanical/tile-t1/exports/T1-dimensioned-drawing.svg), [exploded assembly](mechanical/tile-t1/exports/T1-exploded-assembly.svg) and [section reference](mechanical/tile-t1/exports/T1-section-annotations.svg)
- Printable STL and 3MF prototype exports, clearance coupons, a part BOM and a blank physical inspection record
- Separate [prototype and production route](mechanical/tile-t1/PROTOTYPE-AND-PRODUCTION.md)

---

## 3. Problem / opportunity

Teams evaluating SignalKey typically need either (a) a commercial right to run or embed it, or (b) outright ownership of the Product IP for strategic build-out. Public GitHub visibility without a proprietary license creates false assumptions about free production use. This brief and the linked data room make the commercial path explicit.

---

## 4. What ships today

Honest maturity: treat repository contents, README claims, tests, and release tags as the source of truth. Do not assume production customers, ARR, filed patents, or SLAs unless separately evidenced in diligence.

Typical transferable surfaces:

- Source tree and build/test scripts present in-repo
- Documentation and design notes
- Acquisition / diligence markdown under `docs/acquisition/`
- Branding assets committed to the repository (if any)

---

## 5. Demo / evaluation path (buyer)

Minimal path (no secrets required unless README says otherwise):

```
```powershell
npm ci
npm run build
npm start
```
```powershell
npm run typecheck
npm test
npm run build
npm run test:desktop
```
```powershell
npm run cli -- devices
npm run cli -- status
npm run cli -- run sample-pass
npm run cli -- light success
npm run demo:sdk
```
```mermaid
flowchart LR
  H[SignalKey hardware\nphysical input] -->|bounded HID protocol| M[Desktop main process]
  S[Virtual SignalKey\nsimulator] --> M
  M -->|validated IPC| U[Workflow studio]
  M -->|approved local action| R[Process runner]
  R -->|observed outcome| M
  M --> P[Local profiles and run history]
```
```

Extended evaluation: `docs/acquisition/BUYER_EVALUATION.md`. Written NDA / evaluation grants may be required for private materials.

---

## 6. What a transaction typically includes

Subject to definitive schedules:

| Included (typical) | Excluded (typical) |
|--------------------|--------------------|
| Repo materials + asserted original IP | Seller personal accounts / unrelated repos |
| Docs + diligence room at closing | Third-party dependency source under separate licenses |
| In-repo brand marks as assigned | Secrets without rotation plan |
| Know-how captured in docs | Fabricated revenue, user, or adoption metrics |

---

## 7. Suggested deal structures

| Structure | When it fits |
|-----------|--------------|
| Non-exclusive commercial license | Deploy/run under seat or environment terms |
| Exclusive field-of-use license | Buyer wants exclusivity; seller may retain entity |
| Asset / IP assignment | Buyer wants ownership of Materials outright |
| OEM / redistribution | Separate agreement â€” not implied here |

Commercial terms (price, earnouts, escrow) are negotiated under NDA with counsel.

---

## 8. Buyer diligence checklist

- [ ] Confirm Rightsholder identity and authority to sell/license
- [ ] Inventory Materials (`docs/acquisition/ASSET_INVENTORY.md`)
- [ ] Review IP posture (`IP_PROVENANCE.md`) and dependencies (`DEPENDENCY_INVENTORY.md`)
- [ ] Run evaluation script (`BUYER_EVALUATION.md`)
- [ ] Review risks (`RISK_REGISTER.md`)
- [ ] Agree transfer scope (`TRANSFER_MANIFEST.md`) and handoff (`HANDOFF_CHECKLIST.md`)
- [ ] Supersede root `LICENSE` at closing via definitive agreement

---

## 9. Related documents

| Document | Purpose |
|----------|---------|
| `LICENSE` | Proprietary â€” no default grant |
| `docs/acquisition/README.md` | Data-room index |
| `docs/acquisition/EXECUTIVE_SUMMARY.md` | One-page thesis |
| `README.md` | Product overview |
| `SECURITY.md` | Vulnerability reporting |
| `COMMERCIAL.md` | Licensing contact path |
| `.github/FUNDING.yml` | Sponsors / thanks.dev |

---

## 10. Disclaimer

This package is informational and **does not** create a binding offer, grant of rights, or investment advice. Engage counsel for any transaction.

---

*Document version: 2.0.0 / 2026-09-22 Â· Classification: acquisition briefing*
