'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { AsciiGrid } from '@/lib/ascii/grid'
import { GlyphCanvas } from '@/lib/ascii/canvas'
import { MAT } from '@/lib/ascii/palette'
import { hash2 } from '@/lib/ascii/noise'
import { Spider } from '@/lib/ascii/spider'
import { MOTIF_GLYPH, type ClusterKey, type ProjectMapLayout } from '@/lib/ascii/project-map'

export interface MapEntry {
  slug: string
  title: string
  description?: string | null
  tags?: string[] | null
}

interface Props {
  layout: ProjectMapLayout
  projects: MapEntry[]
  /** Small server-rendered art per slug, drawn as the node itself. */
  minis: Record<string, React.ReactNode>
  /** Server-rendered full write-up per slug, opened under the map on click. */
  bodies: Record<string, React.ReactNode>
  initial: string
}

const mono = { fontFamily: 'var(--font-mono)' } as const

const subscribeHash = (cb: () => void) => {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}
const readHash = () => decodeURIComponent(window.location.hash.slice(1))

const FPS = 30
const PACKET_SPEED = 0.18 // edge lengths per second
const PILOT_DWELL = 3.5 // s the crawler spends at each project when idle
const BAND_MIN_WIDTH = 960 // px; narrower screens scroll the band sideways

interface Pt {
  x: number
  y: number
}
/** Measured positions (px, relative to the band) of nodes and cluster groups. */
interface Geometry {
  nodes: Map<string, Pt>
  groups: Map<ClusterKey, Pt & { r: number }>
}

/** One frame: twinkling field, rotating cluster rings, links with packets in flight. */
function drawFrame(grid: AsciiGrid, layout: ProjectMapLayout, geo: Geometry, active: string, cluster: ClusterKey | null, t: number) {
  const cv = new GlyphCanvas(grid.cols, grid.rows, grid.cw / grid.ch)
  const cell = (p: Pt): [number, number] => [p.x / grid.cw, p.y / grid.ch]

  // Starfield: sparse dots that slowly breathe at their own phase.
  for (let r = 0; r < grid.rows; r++)
    for (let c = 0; c < grid.cols; c++) {
      const h = hash2(c * 7, r * 13)
      if (h > 0.03) continue
      const tw = 0.5 + 0.5 * Math.sin(t * (0.6 + h * 30) + h * 200)
      cv.put(c, r, h < 0.004 && tw > 0.8 ? '+' : '.', MAT.noise, 0.25 + tw * 0.7)
    }

  // Cluster rings around each measured group, slowly rotating in alternating directions.
  layout.clusters.forEach((cl, i) => {
    const g = geo.groups.get(cl.key)
    if (!g) return
    const [cc, cr] = cell(g)
    const on = cluster === cl.key
    const radius = g.r / grid.ch
    const steps = Math.ceil(radius * 14)
    const phase = t * (on ? 0.5 : 0.12) * (i % 2 ? -1 : 1)
    for (let k = 0; k < steps; k++) {
      if (k % 3 === 2) continue
      const a = (k / steps) * Math.PI * 2 + phase
      cv.put(cc + (Math.cos(a) * radius) / cv.aspect, cr + Math.sin(a) * radius, '.', on ? MAT.accent : MAT.hud, on ? 0.85 : 0.35)
    }
  })

  // Links (shared stack) with packets travelling both ways.
  layout.edges.forEach((e, ei) => {
    const a = layout.nodes[e.a]
    const b = layout.nodes[e.b]
    const pa = geo.nodes.get(a.slug)
    const pb = geo.nodes.get(b.slug)
    if (!pa || !pb) return
    const hot = a.slug === active || b.slug === active
    const dim = cluster && a.cluster !== cluster && b.cluster !== cluster
    const [ac, ar] = cell(pa)
    const [bc, br] = cell(pb)
    cv.line(ac, ar, bc, br, hot ? MAT.accent : dim ? MAT.noise : MAT.code, hot ? 1 : dim ? 0.3 : 0.55, hot ? undefined : '.')
    if (!dim) {
      const len = Math.max(1, Math.hypot(bc - ac, (br - ar) / cv.aspect))
      for (const [k, dir] of [[0, 1], [0.5, -1]] as const) {
        const f = (t * PACKET_SPEED * (30 / len) + k + hash2(ei, 7)) % 1
        const u = dir > 0 ? f : 1 - f
        for (let tail = 0; tail < 3; tail++) {
          const v = u - dir * tail * (1.2 / len)
          if (v < 0 || v > 1) continue
          cv.put(ac + (bc - ac) * v, ar + (br - ar) * v, tail === 0 ? '*' : '.', hot ? MAT.accent : MAT.signal, 1 - tail * 0.3)
        }
      }
    }
    if (hot) {
      const label = e.tags.slice(0, 2).join('+')
      cv.text((ac + bc) / 2 - label.length / 2, (ar + br) / 2, ` ${label} `, MAT.accent, 1)
    }
  })

  grid.clear()
  for (let r = 0; r < grid.rows; r++)
    for (let c = 0; c < grid.cols; c++) {
      const x = cv.cells[r][c]
      if (x.ch !== ' ') grid.set(c, r, x.ch, x.mat, x.lum)
    }
}

export default function ProjectMap({ layout, projects, minis, bodies, initial }: Props) {
  const bandRef = useRef<HTMLDivElement>(null)
  const preRef = useRef<HTMLPreElement>(null)
  const articleRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<string | null>(null)
  const [cluster, setCluster] = useState<ClusterKey | null>(null)
  // The open project lives in the URL hash (/projects#slug): shareable, and Back returns to the previous one.
  const hash = useSyncExternalStore(subscribeHash, readHash, () => '')
  const open = hash && bodies[hash] ? hash : initial
  const active = hover ?? open

  // Latest interaction state for the animation loop (kept in a ref so the loop never restarts).
  const liveRef = useRef({ active, cluster })
  useEffect(() => {
    liveRef.current = { active, cluster }
  }, [active, cluster])

  useEffect(() => {
    const band = bandRef.current
    const pre = preRef.current
    if (!band || !pre) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const grid = new AsciiGrid(pre)
    const geo: Geometry = { nodes: new Map(), groups: new Map() }
    let spider: Spider | null = null
    let pointer: Pt | null = null
    let t = 0
    let last = 0
    let raf = 0
    let visible = true
    let pilot = 0
    let pilotSince = 0

    const center = (el: Element): Pt & { r: number } => {
      const b = band.getBoundingClientRect()
      const r = el.getBoundingClientRect()
      return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height / 2, r: Math.max(r.width, r.height) / 2 + 18 }
    }
    const measure = () => {
      grid.measure(band.scrollWidth, band.clientHeight)
      band.querySelectorAll<HTMLElement>('[data-node]').forEach(el => geo.nodes.set(el.dataset.node!, center(el.firstElementChild ?? el)))
      band.querySelectorAll<HTMLElement>('[data-group]').forEach(el => geo.groups.set(el.dataset.group as ClusterKey, center(el)))
      if (!spider) spider = new Spider(band.scrollWidth * 0.5, band.clientHeight * 0.6)
      frame(0)
    }
    const frame = (dt: number) => {
      t += dt
      const { active: a, cluster: c } = liveRef.current
      drawFrame(grid, layout, geo, a, c, t)
      if (spider && layout.nodes.length) {
        // The crawler follows the pointer inside the map; otherwise it tours the projects.
        if (!pointer && t - pilotSince > PILOT_DWELL) {
          pilot = (pilot + 1) % layout.nodes.length
          pilotSince = t
        }
        const n = geo.nodes.get(layout.nodes[pilot].slug)
        const target = pointer ?? (n ? { x: n.x, y: n.y - 40 } : { x: 0, y: 0 })
        if (dt > 0) spider.step(dt, target.x, target.y)
        spider.draw(grid)
      }
      grid.compose()
    }
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (now - last < 1000 / FPS) return
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      frame(dt)
    }
    const start = () => {
      if (reduceMotion || raf || !visible || document.hidden) return
      last = performance.now()
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }
    const onMove = (e: PointerEvent) => {
      const b = band.getBoundingClientRect()
      pointer = { x: e.clientX - b.left, y: e.clientY - b.top }
    }
    const onLeave = () => {
      pointer = null
      pilotSince = t
    }
    const onVisibility = () => (document.hidden ? stop() : start())

    const ro = new ResizeObserver(measure)
    ro.observe(band)
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
      else stop()
    })
    io.observe(band)
    band.addEventListener('pointermove', onMove)
    band.addEventListener('pointerleave', onLeave)
    document.addEventListener('visibilitychange', onVisibility)
    document.fonts?.ready.then(measure).catch(() => {})
    measure()
    start()
    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      band.removeEventListener('pointermove', onMove)
      band.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [layout])

  const choose = (slug: string) => {
    // pushState keeps Back working; it doesn't emit hashchange, so announce it for the store above.
    history.pushState(null, '', `#${encodeURIComponent(slug)}`)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    requestAnimationFrame(() => articleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  return (
    <>
      <div
        className="ascii-dark mt-10 overflow-x-auto overflow-y-hidden rounded-xl border"
        style={{ borderColor: '#232323', background: '#0a0a0a' }}
        onMouseLeave={() => setHover(null)}
      >
        <div ref={bandRef} className="relative h-[380px]" style={{ minWidth: BAND_MIN_WIDTH }}>
          <pre
            ref={preRef}
            aria-hidden
            className="ascii pointer-events-none absolute inset-0 m-0 whitespace-pre text-[10px] leading-[12px]"
            style={mono}
          />

          {/* One horizontal band of clusters; groups alternate up/down for rhythm. */}
          <div className="absolute inset-0 flex items-center justify-around px-6 pb-6">
            {layout.clusters.map((cl, i) => {
              const on = cluster === cl.key
              const members = layout.nodes.filter(n => n.cluster === cl.key)
              return (
                <div
                  key={cl.key}
                  data-group={cl.key}
                  className={`flex items-center gap-3 ${i % 2 ? 'flex-col-reverse translate-y-10' : 'flex-col -translate-y-10'}`}
                >
                  <div className="flex gap-4">
                    {members.map(n => {
                      const p = projects.find(x => x.slug === n.slug)
                      if (!p) return null
                      const isOpen = n.slug === open
                      const isActive = n.slug === active
                      const dim = cluster !== null && n.cluster !== cluster
                      return (
                        <button
                          key={n.slug}
                          data-node={n.slug}
                          type="button"
                          onClick={() => choose(n.slug)}
                          onMouseEnter={() => setHover(n.slug)}
                          onFocus={() => setHover(n.slug)}
                          onBlur={() => setHover(null)}
                          aria-label={p.title}
                          aria-pressed={isOpen}
                          className="whitespace-nowrap text-center text-[11px] leading-tight transition-[color,opacity] duration-150"
                          style={{ ...mono, color: isActive || isOpen ? '#ff7a2e' : '#ededeb', opacity: dim ? 0.3 : 1 }}
                        >
                          <span
                            className="block overflow-hidden rounded-md border transition-[border-color,transform] duration-150"
                            style={{
                              borderColor: isOpen ? '#ff7a2e' : isActive ? '#a3a39c' : '#2a2a27',
                              background: '#0a0a0a',
                              transform: isActive ? 'scale(1.06)' : undefined,
                            }}
                          >
                            {minis[n.slug] ?? <span className="block px-2 text-sm">{MOTIF_GLYPH[n.motif]}</span>}
                          </span>
                          <span className="mt-1 block">
                            {isOpen ? '> ' : ''}
                            {n.slug}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCluster(on ? null : cl.key)}
                    aria-pressed={on}
                    className="rounded px-1.5 text-[11px] tracking-wide transition-colors"
                    style={{
                      ...mono,
                      color: on ? '#0a0a0a' : '#a3a39c',
                      background: on ? '#ff7a2e' : '#0a0a0a',
                      border: '1px solid #33332f',
                    }}
                  >
                    [{cl.label}] {cl.count}
                  </button>
                </div>
              )
            })}
          </div>

          <p className="absolute bottom-3 left-4 text-[11px]" style={{ ...mono, color: '#6b6b65' }}>
            {projects.length} projects · {layout.clusters.length} clusters · lines = shared stack · click a project to open it below
          </p>
        </div>
      </div>

      <div ref={articleRef} className="scroll-mt-20 pt-16">
        {bodies[open]}
      </div>
    </>
  )
}
