# Vipre · Consistency Audit

An interactive documentation of the current-state UI consistency across Vipre's
production products — **IES, EDR/ESM, SafeSend and the shared Portal** — built from
58 production screenshots.

**Live site:** https://sixbase.github.io/vipre-audit/

## What it shows

A neutral record of the current state (not a redesign or recommendation):

- **Thesis** — there is no single defined design system to conform to.
- **Scorecard** — distinct variants per component, real pixel-sampled colour clusters,
  radius/type scales, and what *is* consistent.
- **Components** — every variant of each component shown side by side (real crops for
  controls, in-context screens for layout-level components).
- **Screens** — all 58 source screenshots, filterable by product.

Headline: **35** distinct button styles · **9** different "brand" blues · **6** font
stacks · **22** accent colours · **287** components catalogued.

## Develop

```bash
npm install
npm run dev      # http://localhost:5190/vipre-audit/
npm run build    # static site to dist/
```

## How the data was produced

- `data/catalog.json` — component inventory cataloged from the screenshots.
- `data/colors.json` — colours extracted from real pixels and perceptually clustered
  (`data/extract_colors.py`, ΔE < 12).
- `public/crops` — components cropped from full-resolution screenshots (`data/make_crops.py`).
- `data/screens.json` + `public/shots`, `public/thumbs` — web-sized screenshots (`data/prep_images.py`).

Deployed automatically to GitHub Pages on every push to `main`.
