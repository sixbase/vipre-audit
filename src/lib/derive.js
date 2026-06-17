import catalog from '../data/catalog.json'
import colors from '../data/colors.json'
import screens from '../data/screens.json'
import crops from '../data/crops.json'

export const PRODUCTS = ['IES', 'EDR/ESM', 'SafeSend', 'Portal/Admin']

// Resolve a public asset path against Vite's base (so it works at
// localhost:5190/vipre-audit/ in dev AND sixbase.github.io/vipre-audit/ in prod).
export const asset = (p) => import.meta.env.BASE_URL + p.replace(/^\//, '')

export const TYPE_LABEL = {
  button: 'Buttons', chart: 'Charts & data-viz', table: 'Tables',
  'data-card': 'Data cards', 'badge-status': 'Status badges', icon: 'Icons',
  link: 'Links', 'header-topbar': 'Header / top bar', 'kpi-tile': 'KPI tiles',
  search: 'Search fields', 'empty-state': 'Empty states', 'nav-sidebar': 'Navigation',
  tab: 'Tabs', breadcrumb: 'Breadcrumbs', 'checkbox-radio-toggle': 'Toggles & radios',
  pagination: 'Pagination', 'filter-chip': 'Filter chips', 'dropdown-menu': 'Dropdown menus',
  banner: 'Banners', input: 'Inputs', avatar: 'Avatars', select: 'Selects',
  'loading-state': 'Loading states', tooltip: 'Tooltips', modal: 'Modals',
  'toast-alert': 'Toasts',
}

// Components that are part of the supposedly-shared portal frame.
// The pixel/vision passes agree these are structurally consistent — the
// "variants" are responsive-scale / per-tenant differences, not redesigns.
// This is the credibility ("what's working") anchor.
const SHELL_OVERRIDE = {
  'nav-sidebar': 'The one component that IS owned: identical structure, order, icons and active-state across all four products. Variation is responsive scale + per-tenant entitlements, not design drift.',
  'header-topbar': 'Shared portal header — same VIPRE SYMPHONY wordmark, Material Symbols icon set and layout everywhere. The frame holds; everything inside it does not.',
}

export function verdictFor(type, variants) {
  if (SHELL_OVERRIDE[type]) return { key: 'consistent', label: 'Consistent', tone: 'good', note: SHELL_OVERRIDE[type] }
  if (variants >= 12) return { key: 'fragmented', label: 'Fragmented', tone: 'bad' }
  if (variants >= 7)  return { key: 'inconsistent', label: 'Inconsistent', tone: 'warn' }
  if (variants >= 4)  return { key: 'loose', label: 'Loose', tone: 'warn' }
  return { key: 'consistent', label: 'Consistent', tone: 'good' }
}

const slugByOrig = Object.fromEntries(screens.map(s => [s.orig, s.slug]))
export const screenBySlug = Object.fromEntries(screens.map(s => [s.slug, s]))

function origToSlug(file) {
  if (slugByOrig[file]) return slugByOrig[file]
  const base = file.replace(' (1)', '')
  return slugByOrig[base] || null
}

// ── per-component-type stats ────────────────────────────────
const byType = {}
for (const o of catalog.observations) {
  const t = o.component_type
  if (!byType[t]) byType[t] = { type: t, variants: new Set(), instances: 0, products: new Set(), screens: new Set() }
  const e = byType[t]
  e.instances++
  if (o.variant_key) e.variants.add(o.variant_key.trim().toLowerCase())
  e.products.add(o.product)
  const sl = origToSlug(o.file)
  if (sl) e.screens.add(sl)
}

const cropsByType = {}
for (const c of crops) (cropsByType[c.type] ||= []).push(c)

export const componentStats = Object.values(byType).map(e => {
  const variants = e.variants.size
  return {
    type: e.type,
    label: TYPE_LABEL[e.type] || e.type,
    variants,
    instances: e.instances,
    products: [...e.products],
    nProducts: e.products.size,
    screens: [...e.screens],
    crops: cropsByType[e.type] || [],
    verdict: verdictFor(e.type, variants),
  }
}).sort((a, b) => b.variants - a.variants)

export const statByType = Object.fromEntries(componentStats.map(s => [s.type, s]))

// ── headline numbers ────────────────────────────────────────
const fontSet = new Set(catalog.products.map(p => (p.tokens?.font_family_guess || '').split(/[;(]/)[0].trim()).filter(Boolean))
const radiiSet = new Set()
const headSet = new Set()
for (const p of catalog.products) {
  for (const r of (p.tokens?.radii_px_guess || [])) radiiSet.add(r)
  for (const h of (p.tokens?.heading_sizes_px_guess || [])) headSet.add(h)
}

export const HEADLINE = {
  products: PRODUCTS.length,
  screens: screens.length,
  instances: catalog.observations.length,
  buttonVariants: statByType['button']?.variants ?? 0,
  colorClusters: colors.clusters.length,
  blues: colors.blues.length,
  fonts: fontSet.size,
  radii: [...radiiSet].sort((a, b) => a - b),
  headingSizes: [...headSet].sort((a, b) => a - b),
}

export { colors, screens, crops, catalog }
export const fontStacks = (() => {
  const seen = new Set(), out = []
  for (const p of catalog.products) {
    if (seen.has(p.product)) continue
    seen.add(p.product)
    out.push({ product: p.product, font: p.tokens?.font_family_guess || '—' })
  }
  return out.sort((a, b) => PRODUCTS.indexOf(a.product) - PRODUCTS.indexOf(b.product))
})()
