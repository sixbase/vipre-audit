import { useState, useMemo } from 'react'
import {
  componentStats, statByType, HEADLINE, colors, screens, fontStacks,
  screenBySlug, PRODUCTS, asset,
} from './lib/derive.js'

const TYPE_DESC = {
  button: 'The same action is dressed nine different ways — solid blue, navy ghost, plain text-link, rounded pill and a one-off peach CTA on the EDR login. Radius, fill and casing all disagree.',
  chart: 'Every dashboard reaches for its own charting style and palette — combo bars, treemaps, donuts, sankeys, sparklines — with no shared colour ramp or legend pattern.',
  table: 'Header treatment (grey vs blue, upper vs title case), row density, borders, sort affordances and row actions are decided per screen.',
  'data-card': 'Cards range from flat hairline boxes to heavy shadows to marketing gradients — different radii, padding and header styles across products.',
  'badge-status': 'The same states (success / error / severity) appear as plain coloured text, filled pastel pills and outlined chips — sometimes three ways on one screen.',
  'kpi-tile': 'Stat tiles differ in label casing, number scale, iconography and alignment from product to product.',
  search: 'Search is a pill on light pages and a 6px dark box on the explorer pages — different height, radius and icon placement.',
  'empty-state': 'No shared empty pattern: bare “No data” text, centred prompts, and full illustration-plus-CTA all coexist.',
  tab: 'Two unrelated idioms run side by side — horizontal underline/segmented tabs and vertical chevron-notch card rails.',
  'checkbox-radio-toggle': 'iOS-style pill toggles and classic radio groups are used interchangeably for the same on/off choices.',
  icon: 'Thin white line icons in the nav sit next to heavy black filled glyphs on launcher cards — at least two icon libraries in play.',
  link: 'Link colour and weight drift across two competing accent blues.',
  'header-topbar': 'The shared portal header — consistent by design.',
  'nav-sidebar': 'The shared portal navigation — consistent by design.',
}

function Chip({ v }) { return <span className={`chip ${v.tone}`}>{v.label}</span> }
function Ptag({ p }) { return <span className="ptag">{p}</span> }

function Topbar({ view, setView }) {
  const tabs = [['thesis', 'Thesis'], ['scorecard', 'Scorecard'], ['components', 'Components'], ['screens', 'Screens']]
  return (
    <div className="topbar">
      <div className="brand"><span className="dot" /> VIPRE <small>· Consistency Audit</small></div>
      <div className="nav">
        {tabs.map(([k, l]) => (
          <button key={k} className={view === k ? 'on' : ''} onClick={() => setView(k)}>{l}</button>
        ))}
      </div>
    </div>
  )
}

function Thesis({ setView }) {
  return (
    <div className="wrap thesis">
      <div className="eyebrow">Production UI audit · June 2026 · 58 screens, 4 products</div>
      <h1>One portal, four design languages.</h1>
      <p className="lede">
        The brief was “make it match the design system look and feel.” But across IES, EDR/ESM,
        SafeSend and the shared Portal, the products already disagree with each other at the
        component level. There is no single source of truth to conform to — so it has to be defined
        first, or every new screen just adds more drift.
      </p>
      <div className="bignums">
        <div className="bignum"><div className="n bad mono-num">{HEADLINE.buttonVariants}</div><div className="cap">distinct button styles for one action</div></div>
        <div className="bignum"><div className="n bad mono-num">{HEADLINE.blues}</div><div className="cap">different “brand” blues in live use</div></div>
        <div className="bignum"><div className="n bad mono-num">{HEADLINE.fonts}</div><div className="cap">font stacks — none is the DS font</div></div>
      </div>
      <div className="meta mono-num">
        {HEADLINE.screens} screens · {HEADLINE.products} products · {HEADLINE.instances} components catalogued · {HEADLINE.colorClusters} distinct accent colours
      </div>
      <div><button className="cta" onClick={() => setView('scorecard')}>See the evidence →</button></div>
    </div>
  )
}

function Scorecard({ openType }) {
  const max = componentStats[0].variants
  return (
    <div className="wrap">
      <div className="section" style={{ paddingTop: 'var(--s-8)' }}>
        <div className="eyebrow">The numbers</div>
        <h2 className="h2" style={{ marginTop: 8 }}>How much drift is in production</h2>
        <p className="sub">Each component should exist in one — at most a few — forms. This is how many distinct visual variants of each actually ship today.</p>
        <div className="stat-row">
          <div className="stat"><div className="n mono-num">{HEADLINE.products}</div><div className="l">Products</div></div>
          <div className="stat"><div className="n mono-num">{HEADLINE.screens}</div><div className="l">Screens audited</div></div>
          <div className="stat"><div className="n mono-num">{HEADLINE.instances}</div><div className="l">Components catalogued</div></div>
          <div className="stat"><div className="n mono-num">{HEADLINE.colorClusters}</div><div className="l">Accent colours</div></div>
          <div className="stat"><div className="n mono-num">{HEADLINE.blues}</div><div className="l">Distinct blues</div></div>
          <div className="stat"><div className="n mono-num">{HEADLINE.fonts}</div><div className="l">Font stacks</div></div>
        </div>
      </div>

      <div className="section">
        <h2 className="h2">Variants per component</h2>
        <p className="sub">Click any row to see the variants side by side. Bars coloured by verdict.</p>
        <div className="bars">
          {componentStats.map(s => (
            <button className="bar" key={s.type} onClick={() => openType(s.type)}>
              <span className="name">{s.label}</span>
              <span className="track"><span className={`fill ${s.verdict.tone}`} style={{ width: `${Math.max(4, (s.variants / max) * 100)}%` }} /></span>
              <span className="v mono-num">{s.variants}<small> /{s.nProducts}p</small></span>
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <h2 className="h2">Colour</h2>
        <p className="sub">
          Real pixels sampled from all {HEADLINE.screens} screens, then perceptually clustered so visually-identical
          shades collapse. {HEADLINE.colorClusters} accent colours survive — {HEADLINE.blues} of them blue. A defined
          system would ship a handful of tokens, not a spectrum.
        </p>
        <div className="swatches">
          {colors.clusters.slice(0, 24).map((c, i) => (
            <div className="sw" key={i}>
              <div className="chip-c" style={{ background: c.hex }} title={`${c.hex} · ${c.n_products} products`} />
              <div className="hx">{c.hex}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 'var(--s-7)', marginTop: 'var(--s-6)', flexWrap: 'wrap' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Corner radii in use</div>
            <div className="scale-chips">{HEADLINE.radii.map(r => <span className="scale-chip" key={r}>{r}px</span>)}</div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Heading sizes in use</div>
            <div className="scale-chips">{HEADLINE.headingSizes.map(r => <span className="scale-chip" key={r}>{r}px</span>)}</div>
          </div>
        </div>
        <div style={{ marginTop: 'var(--s-6)' }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Type families — one per product, none shared</div>
          <div className="scale-chips">
            {fontStacks.map((f, i) => <span className="scale-chip" key={i}><b>{f.product}</b> · {f.font.split(/[;(]/)[0].trim()}</span>)}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="working">
          <div className="h3">What is working</div>
          <p style={{ margin: 0, color: 'var(--ink-2)', maxWidth: '70ch' }}>
            One thing is consistent: the shared <b>Portal header and left navigation</b>. Same wordmark, icon set,
            ordering and active state across all four products. It holds <i>because it is owned</i> — a single
            component, maintained centrally. Everything rendered inside it drifts because nothing else is.
            That is the entire argument for the system: define and own the rest the way the shell is already owned.
          </p>
        </div>
      </div>
    </div>
  )
}

function Wall({ type, openShot }) {
  const s = statByType[type]
  const byProd = useMemo(() => {
    const m = {}
    for (const c of s.crops) (m[c.product] ||= []).push(c)
    return m
  }, [type])
  const hasCrops = s.crops.length > 0
  return (
    <div>
      <div className="wall-head">
        <h2>{s.label}</h2>
        <Chip v={s.verdict} />
        <span className="wall-count mono-num">{s.variants} variants · {s.nProducts} products · {s.instances} instances</span>
      </div>
      <p className="wall-desc">{s.verdict.note || TYPE_DESC[type] || 'Distinct visual variants observed across the audited products.'}</p>

      {hasCrops ? (
        PRODUCTS.filter(p => byProd[p]).map(p => (
          <div className="prod-group" key={p}>
            <h4>{p} · {byProd[p].length}</h4>
            <div className="crop-grid">
              {byProd[p].map(c => (
                <button className="crop" key={c.id} onClick={() => openShot(c.screen_slug)} title="View source screen">
                  <span className="imgbox"><img src={asset(`crops/${c.id}.jpg`)} alt={c.label} loading="lazy" /></span>
                  <span className="cap">{c.label || c.type}</span>
                </button>
              ))}
            </div>
          </div>
        ))
      ) : (
        <>
          <div className="eyebrow" style={{ marginBottom: 'var(--s-3)' }}>Shown in context — appears on {s.screens.length} screens</div>
          <div className="thumb-grid">
            {s.screens.map(slug => {
              const sc = screenBySlug[slug]
              if (!sc) return null
              return (
                <button className="thumb" key={slug} onClick={() => openShot(slug)}>
                  <img src={asset(`thumbs/${slug}.jpg`)} alt={slug} loading="lazy" />
                  <span className="cap"><span>{slug}</span><Ptag p={sc.product} /></span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function Components({ selected, setSelected, openShot }) {
  return (
    <div className="wrap section" style={{ paddingTop: 'var(--s-7)' }}>
      <div className="walls">
        <div className="wall-index">
          {componentStats.map(s => (
            <button key={s.type} className={selected === s.type ? 'on' : ''} onClick={() => setSelected(s.type)}>
              <span>{s.label}</span><span className="vk mono-num">{s.variants}</span>
            </button>
          ))}
        </div>
        <Wall type={selected} openShot={openShot} />
      </div>
    </div>
  )
}

function Screens({ openShot }) {
  const [filter, setFilter] = useState('All')
  const list = filter === 'All' ? screens : screens.filter(s => s.product === filter)
  return (
    <div className="wrap section" style={{ paddingTop: 'var(--s-7)' }}>
      <h2 className="h2">The evidence</h2>
      <p className="sub">All {screens.length} production screens behind this audit. Click to enlarge.</p>
      <div className="filterbar">
        {['All', ...PRODUCTS].map(p => (
          <button key={p} className={filter === p ? 'on' : ''} onClick={() => setFilter(p)}>
            {p} {p !== 'All' && <span className="mono-num">· {screens.filter(s => s.product === p).length}</span>}
          </button>
        ))}
      </div>
      <div className="thumb-grid">
        {list.map(s => (
          <button className="thumb" key={s.slug} onClick={() => openShot(s.slug)}>
            <img src={asset(`thumbs/${s.slug}.jpg`)} alt={s.slug} loading="lazy" />
            <span className="cap"><span>{s.slug}</span><Ptag p={s.product} /></span>
          </button>
        ))}
      </div>
    </div>
  )
}

function Lightbox({ slug, onClose }) {
  if (!slug) return null
  const sc = screenBySlug[slug]
  return (
    <div className="lb" onClick={onClose}>
      <div className="lb-inner" onClick={e => e.stopPropagation()}>
        <div className="lb-bar">
          <span className="mono-num" style={{ fontSize: 'var(--t-sm)' }}>{slug} · {sc?.product}</span>
          <button className="x" onClick={onClose}>×</button>
        </div>
        <img src={asset(`shots/${slug}.jpg`)} alt={slug} />
      </div>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState('thesis')
  const [selected, setSelected] = useState(componentStats[0].type)
  const [shot, setShot] = useState(null)
  const openType = t => { setSelected(t); setView('components') }

  return (
    <div className="app">
      <Topbar view={view} setView={setView} />
      <main className="app-main">
        {view === 'thesis' && <Thesis setView={setView} />}
        {view === 'scorecard' && <Scorecard openType={openType} />}
        {view === 'components' && <Components selected={selected} setSelected={setSelected} openShot={setShot} />}
        {view === 'screens' && <Screens openShot={setShot} />}
      </main>
      <footer>Vipre Consistency Audit · {HEADLINE.screens} screens · documentation of current state, June 2026</footer>
      <Lightbox slug={shot} onClose={() => setShot(null)} />
    </div>
  )
}
