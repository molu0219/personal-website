'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AsciiGrid } from '@/lib/ascii/grid'
import { GlyphCanvas } from '@/lib/ascii/canvas'
import { MAT } from '@/lib/ascii/palette'
import { hash2 } from '@/lib/ascii/noise'
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
  /** Server-rendered art per slug, shown in the side panel. */
  arts: Record<string, React.ReactNode>
  /** Small server-rendered art per slug, drawn as the node itself. */
  minis: Record<string, React.ReactNode>
  views?: Record<string, number>
  initial: string
}

const mono = { fontFamily: 'var(--font-mono)' } as const

/** Draw edges (shared stack), cluster spokes and grain into the map's <pre>. */
function drawEdges(
  pre: HTMLPreElement,
  box: HTMLElement,
  layout: ProjectMapLayout,
  active: string,
  cluster: ClusterKey | null,
) {
  const grid = new AsciiGrid(pre)
  grid.measure(box.clientWidth, box.clientHeight)
  const cv = new GlyphCanvas(grid.cols, grid.rows, grid.cw / grid.ch)
  const at = (x: number, y: number): [number, number] => [(x / 100) * grid.cols, (y / 100) * grid.rows]
  cv.grain((c, r) => hash2(c * 7, r * 13), 0.025, MAT.noise, 0.7)
  // Each cluster is a dashed ring around its members.
  for (const cl of layout.clusters) {
    const [cc, cr] = at(cl.x, cl.y)
    const on = cluster === cl.key
    const radius = Math.min(grid.rows * 0.24, (grid.cols * cv.aspect) * 0.16)
    cv.ring(cc, cr, radius, on ? MAT.accent : MAT.hud, on ? 0.8 : 0.3, '.', true)
  }
  for (const e of layout.edges) {
    const a = layout.nodes[e.a]
    const b = layout.nodes[e.b]
    const hot = a.slug === active || b.slug === active
    const dim = cluster && a.cluster !== cluster && b.cluster !== cluster
    const [ac, ar] = at(a.x, a.y)
    const [bc, br] = at(b.x, b.y)
    // Quiet dotted links; the hovered project's links become solid accent lines.
    cv.line(ac, ar, bc, br, hot ? MAT.accent : dim ? MAT.noise : MAT.code, hot ? 1 : dim ? 0.3 : 0.55, hot ? undefined : '.')
    if (hot) {
      // Label the shared stack at the edge's midpoint.
      const label = e.tags.slice(0, 2).join('+')
      cv.text((ac + bc) / 2 - label.length / 2, (ar + br) / 2, ` ${label} `, MAT.accent, 1)
    }
  }
  for (let r = 0; r < grid.rows; r++)
    for (let c = 0; c < grid.cols; c++) {
      const cell = cv.cells[r][c]
      grid.set(c, r, cell.ch, cell.mat, cell.lum)
    }
  grid.compose()
}

export default function ProjectMap({ layout, projects, arts, minis, views = {}, initial }: Props) {
  const boxRef = useRef<HTMLDivElement>(null)
  const preRef = useRef<HTMLPreElement>(null)
  const [active, setActive] = useState(initial)
  const [cluster, setCluster] = useState<ClusterKey | null>(null)

  useEffect(() => {
    const box = boxRef.current
    const pre = preRef.current
    if (!box || !pre) return
    const draw = () => drawEdges(pre, box, layout, active, cluster)
    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(box)
    document.fonts?.ready.then(draw).catch(() => {})
    return () => ro.disconnect()
  }, [layout, active, cluster])

  const current = projects.find(p => p.slug === active) ?? projects[0]
  const v = current ? views[`/projects/${current.slug}`] : undefined

  return (
    <div className="grid gap-6 py-10 lg:grid-cols-[1fr_380px]">
      <div
        ref={boxRef}
        className="ascii-dark relative h-[62vh] min-h-[460px] overflow-hidden rounded-xl border lg:h-[70vh] lg:min-h-[560px]"
        style={{ borderColor: '#232323', background: '#0a0a0a' }}
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
          const isActive = n.slug === active
          const dim = cluster !== null && n.cluster !== cluster
          return (
            <Link
              key={n.slug}
              href={`/projects/${n.slug}`}
              onMouseEnter={() => setActive(n.slug)}
              onFocus={() => setActive(n.slug)}
              aria-label={p.title}
              className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-center text-[11px] leading-tight transition-[color,opacity] duration-150"
              style={{
                ...mono,
                left: `${n.x}%`,
                top: `${n.y}%`,
                color: isActive ? '#ff7a2e' : '#ededeb',
                opacity: dim ? 0.3 : 1,
              }}
            >
              <span
                className="block overflow-hidden rounded-md border transition-[border-color,transform] duration-150"
                style={{ borderColor: isActive ? '#ff7a2e' : '#2a2a27', background: '#0a0a0a', transform: isActive ? 'scale(1.06)' : undefined }}
              >
                {minis[n.slug] ?? <span className="block px-2 text-sm">{MOTIF_GLYPH[n.motif]}</span>}
              </span>
              <span className="mt-1 hidden sm:block">{n.slug}</span>
            </Link>
          )
        })}

        <p className="absolute bottom-3 left-4 text-[11px]" style={{ ...mono, color: '#6b6b65' }}>
          {projects.length} projects · {layout.clusters.length} clusters · lines = shared stack · click a cluster to isolate it
        </p>
      </div>

      {current && (
        <aside className="flex flex-col gap-4">
          <div
            className="ascii-dark overflow-hidden rounded-xl border"
            style={{ borderColor: '#232323', background: '#0a0a0a' }}
          >
            {arts[current.slug]}
          </div>
          <p className="text-xs" style={{ ...mono, color: 'var(--text-muted)' }}>
            ~/projects/{current.slug}
            {v ? ` · ${v} views` : ''}
          </p>
          <h2 className="text-2xl font-medium leading-tight tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
            {current.title}
          </h2>
          {current.description && (
            <p className="text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {current.description}
            </p>
          )}
          {current.tags && current.tags.length > 0 && (
            <p className="text-xs" style={{ ...mono, color: 'var(--text-muted)' }}>
              {current.tags.map(t => `#${t}`).join('  ')}
            </p>
          )}
          <Link
            href={`/projects/${current.slug}`}
            className="group mt-2 text-sm"
            style={{ color: 'var(--text-primary)' }}
          >
            Open project <span className="inline-block transition-transform duration-150 group-hover:translate-x-0.5">→</span>
          </Link>
        </aside>
      )}
    </div>
  )
}
