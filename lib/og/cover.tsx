import { ImageResponse } from 'next/og'
import type { FpCell } from '@/lib/ascii/fingerprint'
import { landscape, landscapeLegend } from '@/lib/ascii/landscape'
import { loadGoogleFont, type OgFont } from '@/lib/og/fonts'

export const COVER_SIZE = { width: 1200, height: 630 }

// Dark theme tokens from app/globals.css; covers are always dark so they read in feeds.
const C = {
  bg: '#0a0a0a',
  panel: '#111111',
  text: '#ededeb',
  secondary: '#a3a39c',
  muted: '#6b6b65',
  accent: '#ff7a2e',
  border: '#232323',
}

// Dark ASCII palette (lo, hi) per material id — mirrors the "ASCII palette (F010)" block in globals.css.
const MAT_DARK: [string, string][] = [
  ['#1c1c1a', '#55554e'],
  ['#33332f', '#f2f2ee'],
  ['#4a200a', '#ff7a2e'],
  ['#6a3010', '#ffc08f'],
  ['#34342f', '#b4b4ac'],
  ['#183224', '#74e39a'],
  ['#16303c', '#82cdee'],
  ['#3a2e16', '#f0c66e'],
]

const MAP_FONT_PX = 9
const MAP_LINE_PX = 10
const MAP_COLS = 72
const MAP_ROWS = 44
const PANEL_W = 430

export interface CoverInput {
  /** Path shown top-left, e.g. "~/blog". */
  section: string
  title: string
  /** Bottom meta line, e.g. date and tags. */
  meta: string
  /** File path shown in the map panel header, e.g. "~/blog/slug.md". */
  path: string
  /** Markdown of the post/project: drawn as its generated ASCII landscape. */
  content: string
  /** Stable seed (slug) and tags: they pick ridge shapes and palette. */
  seed: string
  tags?: string[] | null
}

const hex = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16))

function glyphColor(cell: FpCell): string {
  const [lo, hi] = MAT_DARK[cell.mat] ?? MAT_DARK[0]
  const t = Math.pow(Math.min(1, Math.max(0, cell.lum)), 0.85)
  const a = hex(lo)
  const b = hex(hi)
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`
}

function titleSize(title: string): number {
  // CJK glyphs are ~2x as wide as Latin; size by visual length.
  const len = Array.from(title).reduce((n, ch) => n + (ch.charCodeAt(0) > 0x2e80 ? 2 : 1), 0)
  if (len <= 24) return 60
  if (len <= 40) return 52
  return 44
}

async function loadFonts(input: CoverInput, mapText: string): Promise<OgFont[]> {
  const chrome = `${input.section}${input.meta}${input.path}joey@chen0123456789 ·skyline=sectionsduskdaynight…`
  const results = await Promise.allSettled([
    loadGoogleFont('Noto Sans TC', 500, input.title),
    loadGoogleFont('Geist Mono', 400, `${chrome}${mapText}`),
    // CJK fallback for headings inside the map and Chinese tags.
    loadGoogleFont('Noto Sans TC', 400, `${chrome}${mapText}`),
  ])
  const fonts = results.flatMap(r => (r.status === 'fulfilled' ? [r.value] : []))
  results.forEach(r => r.status === 'rejected' && console.error(r.reason))
  return fonts
}

// Plain function, not a component: satori does not render fragments returned by components.
function mapLines(rows: FpCell[][]) {
  return rows.map((cells, i) => {
    const runs: { color: string; text: string }[] = []
    for (const c of cells) {
      const color = glyphColor(c)
      const last = runs[runs.length - 1]
      if (last && (last.color === color || c.ch === ' ')) last.text += c.ch
      else runs.push({ color, text: c.ch })
    }
    return (
      <div key={i} style={{ display: 'flex', flexShrink: 0, whiteSpace: 'pre', height: MAP_LINE_PX }}>
        {runs.map((r, j) => (
          <span key={j} style={{ color: r.color }}>
            {r.text}
          </span>
        ))}
      </div>
    )
  })
}

export async function renderCover(input: CoverInput): Promise<ImageResponse> {
  const rows = landscape({ content: input.content, seed: input.seed, tags: input.tags }, MAP_COLS, MAP_ROWS)
  const mapText = Array.from(new Set(rows.flatMap(r => r.map(c => c.ch)))).join('')
  const stats = landscapeLegend(input.content, input.tags)
  const fonts = await loadFonts(input, mapText)
  const mono = 'Geist Mono, Noto Sans TC'

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: C.bg, padding: '56px 64px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: COVER_SIZE.width - 128 - PANEL_W - 48, marginRight: 48 }}>
          <div style={{ display: 'flex', fontFamily: mono, fontSize: 22, color: C.muted }}>{input.section}</div>
          <div
            style={{
              display: 'flex',
              fontFamily: 'Noto Sans TC',
              fontWeight: 500,
              fontSize: titleSize(input.title),
              lineHeight: 1.2,
              color: C.text,
            }}
          >
            {input.title}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: mono, fontSize: 20 }}>
            <div style={{ display: 'flex', color: C.muted }}>{input.meta}</div>
            <div style={{ display: 'flex', color: C.secondary }}>
              joey<span style={{ color: C.accent }}>@</span>chen
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            width: PANEL_W,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            background: C.panel,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 16px',
              borderBottom: `1px solid ${C.border}`,
              fontFamily: mono,
              fontSize: 13,
              color: C.muted,
            }}
          >
            <span>{stats}</span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '12px 14px',
              fontFamily: mono,
              fontSize: MAP_FONT_PX,
              lineHeight: 1,
            }}
          >
            {mapLines(rows)}
          </div>
        </div>
      </div>
    ),
    // An empty `fonts` array disables next/og's bundled default; omit it so a font outage
    // degrades to Latin-only text instead of a 500.
    { ...COVER_SIZE, ...(fonts.length > 0 ? { fonts } : {}) },
  )
}
