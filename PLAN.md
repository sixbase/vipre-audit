# Vipre Consistency Audit — Build Plan

## Thesis
There is no defined design system to conform to. 58 production screens across 4 products
(IES, EDR/ESM, SafeSend, Portal) drift from each other at the component level. Defining the
system must precede any redesign — or drift continues.

## Design ethos: minimal & elegant (the medium is the message)
The audit must look like what a *good* design system produces — so the contrast with the
audited product makes the argument wordlessly. One type family (Inter), generous whitespace, near-black
ink on warm off-white, a single calm accent, hairline rules, big editorial numbers. Data-journalism feel.

## Stance: documentation, not recommendation
This is a neutral record of the current state — it shows what exists and whether each component set
is consistent or fragmented. No "proposed"/"could-be" slots, no redesigns, no recommendations.
Variants are shown as REAL pixels from the screenshots (not CSS reconstructions, which would editorialize).

## Stack
- Vite + React, standalone, deployable to a static URL.
- A small hand-rolled CSS token layer (color/space/type/radius variables) — NO component library.
  The app practices the token discipline it advocates.
- Data layer: `catalog.json` (287 component observations) + `colors.json` (pixel-extracted clusters)
  + the 58 screenshots served from `public/`.

## Structure (4 views)
1. **Thesis / cover** — one sentence + the three headline numbers (35 button styles · 9 blues · 6 fonts).
2. **Scorecard** — divergence dashboard: variant-count bars per component, the real color-cluster
   swatch strip, font-stack list, radius & type scales. A "What's working" panel (shared shell). Each row links to its wall.
3. **Component walls** (the core) — one wall per component type. Each wall shows: verdict chip
   (Fragmented / Mixed / Solid), the variant count, and every variant laid side by side, each
   linking back to the source screenshot it came from. Empty "proposed" slot = the undefined decision (the funding ask made visible).
4. **Evidence / screens** — the 58 source screenshots, filterable by product, as provenance.

## How variants are shown (hybrid)
- **Reconstructed in clean CSS** from captured attributes — buttons, badges, inputs, tabs, color, type,
  radii. (Most damning walls — 35 buttons, 20 badges — render instantly and elegantly.)
- **Source-screenshot thumbnails** (full image in lightbox) — tables, charts, data cards, KPI tiles,
  empty states, nav, headers. Layout-level things shown as-captured.
- Every variant card links to its provenance screenshot.

## Headline metrics (locked)
- Variant count per component (35 buttons, 31 charts, 26 tables, 20 cards, 20 badges, 17 icons…).
- Color: 22 accent clusters, 9 blues (pixel-derived, ΔE-clustered — defensible).
- 6 font stacks (none is Rubik). 9 radii. 13 heading sizes.

## Wins column (credibility)
Shared Portal header + left nav is structurally identical across all products — proof the shell
works *because it is owned*. Everything inside drifts *because it isn't*.

## Out of scope (Phase 2 / the funded ask)
No "could-be" redesigns. Audit + scorecard only. Alvin's in-progress redesign stays out.
