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

/** One frame: twinkling grain, rotating cluster rings, links with packets in flight. */
function drawFrame(
  grid: AsciiGrid,
  layout: ProjectMapLayout,
  active: string,
  cluster: ClusterKey | null,
  t: number,
) {
  const cv = new GlyphCanvas(grid.cols, grid.rows, grid.cw / grid.ch)
  const at = (x: number, y: number): [number, number] => [(x / 100) * grid.cols, (y / 100) * grid.rows]

  // Starfield: sparse dots that slowly breathe at their own phase.
  for (let r = 0; r < grid.rows; r++)
    for (let c = 0; c < grid.cols; c++) {
      const h = hash2(c * 7, r * 13)
      if (h > 0.03) continue
      const tw = 0.5 + 0.5 * Math.sin(t * (0.6 + h * 30) + h * 200)
      cv.put(c, r, h < 0.004 && tw > 0.8 ? '+' : '.', MAT.noise, 0.25 + tw * 0.7)
    }

  // Cluster rings: dashed, slowly rotating (the active cluster spins faster and glows).
  for (const cl of layout.clusters) {
    const [cc, cr] = at(cl.x, cl.y)
    const on = cluster === cl.key
    const radius = Math.min(grid.rows * 0.24, grid.cols * cv.aspect * 0.16)
    const steps = Math.ceil(radius * 14)
    const phase = t * (on ? 0.5 : 0.12) * (cl.x > 50 ? -1 : 1)
    for (let k = 0; k < steps; k++) {
      if (k % 3 === 2) continue
      const a = (k / steps) * Math.PI * 2 + phase
      cv.put(cc + (Math.cos(a) * radius) / cv.aspect, cr + Math.sin(a) * radius, '.', on ? MAT.accent : MAT.hud, on ? 0.85 : 0.35)
    }
  }

  // Links (shared stack) with packets travelling both ways.
  layout.edges.forEach((e, ei) => {
    const a = layout.nodes[e.a]
    const b = layout.nodes[e.b]
    const hot = a.slug === active || b.slug === active
    const dim = cluster && a.cluster !== cluster && b.cluster !== cluster
    const [ac, ar] = at(a.x, a.y)
    const [bc, br] = at(b.x, b.y)
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
      // Label the shared stack at the edge's midpoint.
      const label = e.tags.slice(0, 2).join('+')
      cv.text((ac + bc) / 2 - label.length / 2, (ar + br) / 2, ` ${label} `, MAT.accent, 1)
    }
  })

  grid.clear()
  for (let r = 0; r < grid.rows; r++)
    for (let c = 0; c < grid.cols; c++) {
      const cell = cv.cells[r][c]
      if (cell.ch !== ' ') grid.set(c, r, cell.ch, cell.mat, cell.lum)
    }
}

export default function ProjectMap({ layout, projects, minis, bodies, initial }: Props) {
  const boxRef = useRef<HTMLDivElement>(null)
  const preRef = useRef<HTMLPreElement>(null)
  const articleRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<string | null>(null)
  const [cluster, setCluster] = useState<ClusterKey | null>(null)
  // The open project lives in the URL hash (/projects#slug): shareable, and Back returns to the previous one.
  const hash = useSyncExternalStore(subscribeHash, readHash, () => '')
  const open = hash && bodies[hash] ? hash : initial
  const active = hover ?? open

  // Latest interaction state for the animation loop (kept in refs so the loop never restarts).
  const liveRef = useRef({ active, cluster })
  useEffect(() => {
    liveRef.current = { active, cluster }
  }, [active, cluster])

  useEffect(() => {
    const box = boxRef.current
    const pre = preRef.current
    if (!box || !pre) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const grid = new AsciiGrid(pre)
    let spider: Spider | null = null
    let pointer: { x: number; y: number } | null = null
    let t = 0
    let last = 0
    let raf = 0
    let visible = true
    let pilot = 0
    let pilotSince = 0

    const nodePx = (i: number) => {
      const n = layout.nodes[i]
      return { x: (n.x / 100) * box.clientWidth, y: (n.y / 100) * box.clientHeight }
    }
    const measure = () => {
      grid.measure(box.clientWidth, box.clientHeight)
      if (!spider) spider = new Spider(box.clientWidth * 0.5, box.clientHeight * 0.55)
      frame(0)
    }
    const frame = (dt: number) => {
      t += dt
      const { active: a, cluster: c } = liveRef.current
      drawFrame(grid, layout, a, c, t)
      if (spider && layout.nodes.length) {
        // The crawler follows the pointer inside the map; otherwise it tours the projects.
        if (!pointer && t - pilotSince > PILOT_DWELL) {
          pilot = (pilot + 1) % layout.nodes.length
          pilotSince = t
        }
        const target = pointer ?? nodePx(pilot)
        if (dt > 0) spider.step(dt, target.x, target.y - (pointer ? 0 : 34))
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
      const r = box.getBoundingClientRect()
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onLeave = () => {
      pointer = null
      pilotSince = t
    }
    const onVisibility = () => (document.hidden ? stop() : start())

    const ro = new ResizeObserver(measure)
    ro.observe(box)
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
      else stop()
    })
    io.observe(box)
    box.addEventListener('pointermove', onMove)
    box.addEventListener('pointerleave', onLeave)
    document.addEventListener('visibilitychange', onVisibility)
    document.fonts?.ready.then(measure).catch(() => {})
    measure()
    start()
    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      box.removeEventListener('pointermove', onMove)
      box.removeEventListener('pointerleave', onLeave)
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
        ref={boxRef}
        className="ascii-dark relative mt-10 h-[62vh] min-h-[460px] overflow-hidden rounded-xl border lg:h-[72vh] lg:min-h-[560px]"
        style={{ borderColor: '#232323', background: '#0a0a0a' }}
        onMouseLeave={() => setHover(null)}
      >
        <pre
          ref={preRef}
          aria-hidden
          className="ascii pointer-events-none absolute inset-0 m-0 whitespace-pre text-[10px] leading-[12px]"
          style={mono}
        />

        {layout.clusters.map(cl => {
          const on = cluster === cl.key
          return (
            <button
              key={cl.key}
              type="button"
              onClick={() => setCluster(on ? null : cl.key)}
              aria-pressed={on}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded px-1.5 text-[11px] tracking-wide transition-colors"
              style={{
                ...mono,
                left: `${cl.x}%`,
                top: `${cl.y}%`,
                color: on ? '#0a0a0a' : '#a3a39c',
                background: on ? '#ff7a2e' : '#0a0a0a',
                border: '1px solid #33332f',
              }}
            >
              [{cl.label}] {cl.count}
            </button>
          )
        })}

        {layout.nodes.map(n => {
          const p = projects.find(x => x.slug === n.slug)
          if (!p) return null
          const isOpen = n.slug === open
          const isActive = n.slug === active
          const dim = cluster !== null && n.cluster !== cluster
          return (
            <button
              key={n.slug}
              type="button"
              onClick={() => choose(n.slug)}
              onMouseEnter={() => setHover(n.slug)}
              onFocus={() => setHover(n.slug)}
              onBlur={() => setHover(null)}
              aria-label={p.title}
              aria-pressed={isOpen}
              className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-center text-[11px] leading-tight transition-[color,opacity] duration-150"
              style={{
                ...mono,
                left: `${n.x}%`,
                top: `${n.y}%`,
                color: isActive || isOpen ? '#ff7a2e' : '#ededeb',
                opacity: dim ? 0.3 : 1,
              }}
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
              <span className="mt-1 block max-w-[30vw] truncate sm:max-w-none">
                {isOpen ? '> ' : ''}
                {n.slug}
              </span>
            </button>
          )
        })}

        <p className="absolute bottom-3 left-4 right-4 text-[11px]" style={{ ...mono, color: '#6b6b65' }}>
          {projects.length} projects · {layout.clusters.length} clusters · lines = shared stack · click a project to open it below
        </p>
      </div>

      <div ref={articleRef} className="scroll-mt-20 pt-16">
        {bodies[open]}
      </div>
    </>
  )
}
