// ─────────────────────────────────────────────────────────────────────────
// Vipre audit — screenshot capture harness (Playwright)
//
// Why this exists: the original 58 screenshots came from a full-page browser
// extension that stitches viewport tiles, which smears fixed/sticky elements
// into opaque "blocks". Playwright renders each page in ONE real pass, so that
// artifact cannot happen — and it can open drawers / modals before capturing.
//
// Usage:
//   npm run capture:login     log in to the portal once; session is saved
//   npm run capture           INTERACTIVE: drive the UI, name shots by hand
//   npm run capture:run       BATCH: run capture/shots.json automatically
//
// Output PNGs land in capture/out/. The auth session lives in capture/.auth/
// (git-ignored — it holds your cookies, never commit it).
// ─────────────────────────────────────────────────────────────────────────
import { chromium } from 'playwright'
import readline from 'node:readline'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const AUTH_DIR = path.join(__dirname, '.auth')
const OUT_DIR = path.join(__dirname, 'out')
const BASE = process.env.PORTAL_URL || 'https://ices-dev-portal.electric.net'

fs.mkdirSync(OUT_DIR, { recursive: true })
const cmd = (process.argv[2] || 'interactive').toLowerCase()

function prompt(q) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(res => rl.question(q, a => { rl.close(); res(a) }))
}
function sanitize(s) {
  return s.trim().replace(/[^a-z0-9-_ ]+/gi, '').replace(/\s+/g, '-').toLowerCase() || 'shot'
}
async function launch() {
  return chromium.launchPersistentContext(AUTH_DIR, {
    headless: false,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // crisp, retina-quality output
  })
}
// Hide the recurring "Feedback" widget so it doesn't sit over real UI.
const HIDE_OVERLAYS = `[class*="feedback" i],[id*="feedback" i],
  iframe[title*="feedback" i]{display:none !important}`

async function shoot(page, name, { clip } = {}) {
  await page.addStyleTag({ content: HIDE_OVERLAYS }).catch(() => {})
  const file = path.join(OUT_DIR, sanitize(name) + '.png')
  if (clip) {
    const el = await page.$(clip)
    if (!el) throw new Error(`clip selector not found: ${clip}`)
    await el.screenshot({ path: file })
  } else {
    await page.screenshot({ path: file, fullPage: true })
  }
  return file
}

// ── LOGIN ────────────────────────────────────────────────────────────────
if (cmd === 'login') {
  const ctx = await launch()
  const page = ctx.pages()[0] || await ctx.newPage()
  await page.goto(BASE).catch(() => {})
  console.log('\n▶ Log in to the portal in the browser window that just opened.')
  await prompt('  When you are fully logged in, press Enter here to save the session… ')
  await ctx.close()
  console.log('✓ Session saved to capture/.auth — future captures reuse it.\n')
  process.exit(0)
}

// ── INTERACTIVE (recommended for drawers & modals) ─────────────────────────
if (cmd === 'interactive') {
  const ctx = await launch()
  const page = ctx.pages()[0] || await ctx.newPage()
  await page.goto(BASE).catch(() => {})
  let latest = page
  ctx.on('page', p => { latest = p })            // follow the newest tab
  page.on('framenavigated', () => { latest = page })
  console.log(`
▶ Interactive capture. The browser window is yours:
   • Navigate to any page; open any DRAWER or MODAL — get the exact state you want.
   • Come back here, type a NAME, press Enter → full-page PNG saved to capture/out/.
   • Just press Enter (empty) to re-capture the current page with an auto name.
   • Type  q  then Enter to finish.
`)
  let i = 0
  while (true) {
    const ans = await prompt('shot name (q to quit): ')
    if (ans.trim().toLowerCase() === 'q') break
    const target = ctx.pages().includes(latest) ? latest : (ctx.pages().at(-1) || page)
    try {
      const f = await shoot(target, ans || `shot-${String(++i).padStart(2, '0')}`)
      console.log('   ✓ saved → ' + path.relative(process.cwd(), f))
    } catch (e) { console.log('   ✗ ' + e.message) }
  }
  await ctx.close()
  process.exit(0)
}

// ── BATCH (repeatable, config-driven) ──────────────────────────────────────
if (cmd === 'run') {
  const cfgPath = path.join(__dirname, 'shots.json')
  const shots = JSON.parse(fs.readFileSync(cfgPath, 'utf8')).filter(s => s.url)
  const ctx = await launch()
  const page = ctx.pages()[0] || await ctx.newPage()
  console.log(`\n▶ Batch capture: ${shots.length} shots\n`)
  for (const s of shots) {
    const url = s.url.startsWith('http') ? s.url : BASE + s.url
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
      for (const step of s.steps || []) {
        if (step.click) await page.click(step.click)
        if (step.fill) await page.fill(step.fill[0], step.fill[1])
        if (step.press) await page.keyboard.press(step.press)
        if (step.waitFor) await page.waitForSelector(step.waitFor, { timeout: 15000 })
        if (step.wait) await page.waitForTimeout(step.wait)
      }
      if (s.waitFor) await page.waitForSelector(s.waitFor, { timeout: 15000 })
      await page.waitForTimeout(s.settle ?? 700)
      const f = await shoot(page, s.name, { clip: s.clipSelector })
      console.log('   ✓ ' + s.name + ' → ' + path.relative(process.cwd(), f))
    } catch (e) { console.log('   ✗ ' + s.name + ': ' + e.message) }
  }
  await ctx.close()
  process.exit(0)
}

console.log(`Unknown command "${cmd}". Use: login | interactive | run`)
process.exit(1)
