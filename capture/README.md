# Capture harness

Re-shoot the audit's source screenshots with Playwright — **no stitching artifacts**, and
able to capture **drawers and modals** (states a full-page extension can't reach).

## One-time setup

```bash
npm install
npx playwright install chromium     # downloads the browser Playwright drives
```

## 1. Log in once

```bash
npm run capture:login
```

A real Chrome window opens at the portal. Log in normally, then press Enter in the terminal.
Your session is saved to `capture/.auth/` and reused by every capture afterwards.
(`.auth/` holds your cookies and is git-ignored — never commit it.)

## 2a. Interactive capture — best for drawers & modals

```bash
npm run capture
```

The browser is yours. Navigate anywhere, **open the drawer or modal you want documented**,
then switch back to the terminal, type a name, and press Enter — a full-page PNG is saved to
`capture/out/`. No CSS selectors to hunt for. Type `q` to finish.

## 2b. Batch capture — repeatable, for re-shooting many pages

Edit `capture/shots.json` (each entry = a page URL, plus optional `steps` to click open a
modal/drawer before the shot), then:

```bash
npm run capture:run
```

## 3. Fold the new shots into the audit

Drop the PNGs from `capture/out/` into the source screenshots folder, then the existing
pipeline regenerates everything (`data/prep_images.py` → cataloging → `data/make_crops.py`),
and a `git push` auto-redeploys the live site. Hand them to Claude and it will re-run the
pipeline for you.

## Notes
- Output is 2× (retina) for crisp crops.
- The recurring blue **Feedback** widget is auto-hidden during capture.
- `capture/out/` and `capture/.auth/` are git-ignored.
