import { parseBlocks, type FpCell } from '@/lib/ascii/blocks'
import { MAT } from '@/lib/ascii/palette'
import { hash2, hashString, vnoise } from '@/lib/ascii/noise'

/**
 * "Content landscape": a piece of ASCII art generated from a document.
 *  - the far mountain range IS the article: one peak per section, height ∝ section length
 *  - mid / near ridges and trees come from the slug (stable per post), relief from total length
 *  - stars ∝ code blocks + lists; the time of day (palette) comes from the main tag
 */

export interface LandscapeInput {
  /** Markdown body. */
  content: string
  /** Stable seed, e.g. the slug. */
  seed: string
  tags?: string[] | null
}

interface Scheme {
  name: 'dusk' | 'night' | 'day'
  sky: number
  glow: number
  sun: number
  far: number
  mid: number
  near: number
}

const SCHEMES: Scheme[] = [
  { name: 'dusk', sky: MAT.noise, glow: MAT.accent, sun: MAT.signal, far: MAT.accent, mid: MAT.hud, near: MAT.ink },
  { name: 'night', sky: MAT.code, glow: MAT.code, sun: MAT.ink, far: MAT.code, mid: MAT.hud, near: MAT.ink },
  { name: 'day', sky: MAT.quote, glow: MAT.quote, sun: MAT.quote, far: MAT.hud, mid: MAT.ok, near: MAT.ok },
]

function pickScheme(seed: string, tags?: string[] | null): Scheme {
  const t = (tags ?? []).join(' ').toLowerCase()
  if (/chain|web3|solidity|trading|token|defi|crypto|binance|polymarket/.test(t)) return SCHEMES[1]
  if (/geo|seo|3d|art|design|companion/.test(t)) return SCHEMES[2]
  if (/ai|agent|claude|workflow|automation/.test(t)) return SCHEMES[0]
  return SCHEMES[hashString(seed) % 3]
}

/** Text length of each top-level section (split at h1/h2). */
function sectionLengths(md: string): number[] {
  const out: number[] = []
  let cur = 0
  for (const b of parseBlocks(md)) {
    if (b.kind === 'heading' && b.level <= 2) {
      if (cur > 0 || out.length) out.push(cur)
      cur = 1
      continue
    }
    cur +=
      b.kind === 'para' || b.kind === 'quote'
        ? b.text.length
        : b.kind === 'code'
          ? b.lines.join('').length * 0.6
          : b.kind === 'list'
            ? b.items.join('').length
            : 40
  }
  out.push(cur)
  return out.filter(n => n > 0).slice(0, 14)
}

const fbm = (x: number, y: number) => vnoise(x, y) * 0.6 + vnoise(x * 2.1, y * 2.1) * 0.3 + vnoise(x * 4.3, y * 4.3) * 0.1

export function landscape(input: LandscapeInput, cols: number, rows: number): FpCell[][] {
  const seed = hashString(input.seed)
  const sOff = (seed % 997) * 0.37
  const scheme = pickScheme(input.seed, input.tags)
  const blocks = parseBlocks(input.content)
  const sections = sectionLengths(input.content)
  const total = sections.reduce((a, b) => a + b, 0) || 1
  const maxSec = Math.max(...sections, 1)
  const starCount = 6 + 4 * blocks.filter(b => b.kind === 'code' || b.kind === 'list').length

  // ── ridge heights (rows from the bottom) ─────────────────
  const n = sections.length
  const far = new Float32Array(cols)
  const mid = new Float32Array(cols)
  const near = new Float32Array(cols)
  const relief = Math.min(1, 0.45 + total / 12000)
  for (let c = 0; c < cols; c++) {
    const x = c / cols
    let h = 0
    for (let i = 0; i < n; i++) {
      const px = (i + 0.5) / n + (hash2(seed, i) - 0.5) * (0.35 / n)
      const width = (1.25 / n) * (0.8 + 0.4 * hash2(i, seed))
      const d = Math.abs(x - px) / width
      if (d < 1) h = Math.max(h, (0.3 + 0.7 * (sections[i] / maxSec)) * Math.pow(1 - d, 1.35))
    }
    far[c] = rows * (0.3 + 0.36 * h + 0.03 * fbm(c * 0.25 + sOff, 1.3))
    mid[c] = rows * (0.16 + 0.14 * relief * fbm(c * 0.045 + sOff, 7.1))
    near[c] = rows * (0.06 + 0.07 * fbm(c * 0.09 + sOff + 31, 3.3))
  }

  // ── sun / moon ───────────────────────────────────────────
  const sunC = cols * (0.18 + 0.64 * hash2(seed, 99))
  const sunR = rows * (0.11 + 0.05 * hash2(seed, 7))
  const sunRow = rows * (0.32 + 0.16 * hash2(seed, 13))
  const horizon = rows - Math.max(...Array.from(far)) // highest peak row

  const grid: FpCell[][] = []
  const blank = (): FpCell => ({ ch: ' ', mat: scheme.sky, lum: 0 })
  for (let r = 0; r < rows; r++) {
    const row: FpCell[] = []
    for (let c = 0; c < cols; c++) {
      const fromBottom = rows - r - 0.5
      let cell = blank()

      // sky: sparse grain thickening into a glow band above the range
      const t = r / rows
      const glow = Math.max(0, 1 - Math.abs(r - (horizon + rows * 0.08)) / (rows * 0.28))
      // Thin horizontal cloud streaks inside the glow band.
      const cloud = fbm(c * 0.03 + sOff, r * 0.9)
      if (glow > 0.3 && cloud > 0.64) {
        cell = { ch: cloud > 0.72 ? '~' : '-', mat: scheme.glow, lum: 0.2 + glow * 0.55 }
      } else if (hash2(c * 3 + seed, r * 7) < 0.012 + glow * 0.05) {
        cell = { ch: '.', mat: scheme.sky, lum: 0.4 + glow * 0.4 }
      }
      // stars in the upper sky
      if (t < 0.45 && hash2(c + seed * 3, r * 13) < starCount / (cols * rows * 0.45)) {
        const b = hash2(c, r + seed)
        cell = { ch: b > 0.85 ? '*' : b > 0.6 ? '+' : '.', mat: MAT.ink, lum: 0.5 + b * 0.5 }
      }

      // sun / moon (drawn before ridges, so peaks occlude it)
      const dx = (c - sunC) * 0.5
      const dy = r - sunRow
      const ds = Math.hypot(dx, dy)
      if (ds < sunR) {
        const k = 1 - ds / sunR
        const isMoonShadow = scheme.name === 'night' && Math.hypot(dx + sunR * 0.45, dy - sunR * 0.15) < sunR * 0.85
        if (!isMoonShadow) cell = { ch: k > 0.55 ? '@' : k > 0.3 ? '%' : '#', mat: scheme.sun, lum: 0.6 + k * 0.4 }
      } else if (ds < sunR * 1.6 && scheme.name !== 'night' && hash2(c, r) < 0.35) {
        cell = { ch: '.', mat: scheme.glow, lum: 0.6 }
      }

      // ridges, back to front
      const layers: [Float32Array, number, string, number][] = [
        [far, scheme.far, ':', 0.55],
        [mid, scheme.mid, '=', 0.72],
        [near, scheme.near, '#', 0.92],
      ]
      for (const [hs, mat, fill, lum] of layers) {
        if (fromBottom > hs[c]) continue
        const top = fromBottom > hs[c] - 1
        if (top) {
          const slope = (hs[Math.min(cols - 1, c + 1)] - hs[Math.max(0, c - 1)]) / 2
          cell = { ch: slope > 0.35 ? '/' : slope < -0.35 ? '\\' : '_', mat, lum: Math.min(1, lum + 0.25) }
          // trees on the near ridge
          if (hs === near && hash2(c * 5, seed) < 0.12) cell = { ch: '^', mat, lum: 1 }
        } else {
          const depth = (hs[c] - fromBottom) / Math.max(1, hs[c])
          const g = hash2(c * 11 + seed, r * 17)
          // Far layers are airy, near ones dense: aerial perspective in glyph density.
          const density = hs === far ? 0.3 : hs === mid ? 0.55 : 0.8
          const ch = g < density ? fill : g < density + 0.25 ? '.' : ' '
          cell = { ch, mat, lum: lum * (1 - depth * 0.5) }
        }
      }
      row.push(cell)
    }
    grid.push(row)
  }
  return grid
}

/** Caption describing what the picture encodes, e.g. "skyline: 8 sections". */
export function landscapeLegend(content: string, tags?: string[] | null): string {
  const s = sectionLengths(content).length
  return `skyline = ${s} section${s === 1 ? '' : 's'} · ${pickScheme('', tags).name}`
}
