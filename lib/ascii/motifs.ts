import { parseBlocks, type FpCell } from '@/lib/ascii/blocks'
import { GlyphCanvas } from '@/lib/ascii/canvas'
import { landscape } from '@/lib/ascii/landscape'
import { MAT, RAMP } from '@/lib/ascii/palette'
import { hash2, hashString, rng } from '@/lib/ascii/noise'

/**
 * Content art: every post/project gets a motif that depicts its subject (a commit graph for a
 * git tool, candles for a trading bot, an agent network for a multi-agent system ...), and the
 * motif's details come from the document itself (sections → nodes/blocks/stages, real code lines
 * in the terminal, etc.). Falls back to the content landscape.
 */

export interface ArtInput {
  content: string
  /** Slug: picks the motif and seeds the details. */
  seed: string
  tags?: string[] | null
}

export type Motif =
  | 'commits'
  | 'candles'
  | 'odds'
  | 'chain'
  | 'orb'
  | 'bars'
  | 'radar'
  | 'network'
  | 'layers'
  | 'pipeline'
  | 'terminal'
  | 'landscape'

// Slug first (most specific), then tags. Order matters.
const RULES: [RegExp, Motif][] = [
  [/git|commit/, 'commits'],
  [/polymarket|prediction/, 'odds'],
  [/trading|candle|price|market/, 'candles'],
  [/token|solana|blockchain|ledger/, 'chain'],
  [/companion|3d|graphics|avatar/, 'orb'],
  [/eval|score|benchmark/, 'bars'],
  [/geo|seo|search|radar/, 'radar'],
  [/layer|enforce|guard|memory/, 'layers'],
  [/agent|harness|orchestr|robin/, 'network'],
  [/pipeline|workflow|content-/, 'pipeline'],
  [/command|cheat|cli|reference|shell|session/, 'terminal'],
]

export function pickMotif(seed: string, tags?: string[] | null): Motif {
  for (const [re, m] of RULES) if (re.test(seed)) return m
  const t = (tags ?? []).join(' ').toLowerCase()
  for (const [re, m] of RULES) if (re.test(t)) return m
  return 'landscape'
}

interface Ctx {
  rand: () => number
  seed: number
  sections: number
  headings: string[]
  code: string[]
  blocks: number
}

const ascii = (s: string) => s.replace(/[^\x20-\x7e]/g, '').trim()

function context(input: ArtInput): Ctx {
  const blocks = parseBlocks(input.content)
  const seed = hashString(input.seed)
  return {
    rand: rng(seed),
    seed,
    sections: Math.max(1, blocks.filter(b => b.kind === 'heading' && b.level <= 2).length),
    headings: blocks.flatMap(b => (b.kind === 'heading' ? [ascii(b.text)] : [])).filter(Boolean),
    code: blocks.flatMap(b => (b.kind === 'code' ? b.lines.map(ascii) : [])).filter(l => l.length > 2),
    blocks: blocks.length,
  }
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

// ── motifs ────────────────────────────────────────────────────────────────

/** git log --graph: lanes = branches, commits = blocks, merges as slopes. */
function commits(cv: GlyphCanvas, x: Ctx) {
  const lanes = clamp(2 + (x.sections % 3), 2, 4)
  const laneMat = [MAT.accent, MAT.ok, MAT.code, MAT.quote]
  const top = Math.max(1, Math.round(cv.rows * 0.18))
  const gap = Math.max(2, Math.floor((cv.rows - top * 2) / (lanes - 1 || 1)))
  const y = (l: number) => top + l * gap
  const step = Math.max(3, Math.round(cv.cols / clamp(x.blocks, 10, 26)))
  for (let l = 0; l < lanes; l++) {
    const start = l === 0 ? 1 : Math.round(cv.cols * (0.1 + 0.15 * l))
    const end = l === 0 ? cv.cols - 2 : Math.round(cv.cols * (0.55 + 0.1 * l))
    cv.line(start, y(l), end, y(l), laneMat[l], 0.45, '-')
    if (l > 0) {
      cv.line(start - gap, y(0), start, y(l), laneMat[l], 0.7) // branch off
      if (end < cv.cols - 6) cv.line(end, y(l), end + gap, y(0), laneMat[l], 0.7) // merge back
    }
    for (let c = start + 1; c < end; c += step) {
      const head = l === 0 && c + step >= end
      cv.put(c, y(l), head ? '@' : x.rand() < 0.2 ? 'O' : 'o', laneMat[l], head ? 1 : 0.9)
    }
  }
  cv.text(1, Math.min(cv.rows - 1, y(0) - 1), 'HEAD -> main', MAT.hud, 0.7)
}

/** Candlestick chart from a seeded random walk; volume bars below. */
function candles(cv: GlyphCanvas, x: Ctx) {
  const n = Math.floor((cv.cols - 2) / 2)
  const chartH = Math.round(cv.rows * 0.72)
  let p = 50
  const drift = (x.rand() - 0.45) * 1.2
  const bars: { o: number; c: number; h: number; l: number }[] = []
  for (let i = 0; i < n; i++) {
    const o = p
    p += drift + (x.rand() - 0.5) * 7
    bars.push({ o, c: p, h: Math.max(o, p) + x.rand() * 3, l: Math.min(o, p) - x.rand() * 3 })
  }
  const lo = Math.min(...bars.map(b => b.l))
  const hi = Math.max(...bars.map(b => b.h))
  const row = (v: number) => 1 + (chartH - 2) * (1 - (v - lo) / (hi - lo || 1))
  for (let r = 2; r < chartH; r += 3) for (let c = 0; c < cv.cols; c += 2) cv.put(c, r, '.', MAT.noise, 0.5)
  bars.forEach((b, i) => {
    const c = 1 + i * 2
    const up = b.c >= b.o
    const mat = up ? MAT.ok : MAT.accent
    for (let r = Math.round(row(b.h)); r <= Math.round(row(b.l)); r++) cv.put(c, r, '|', mat, 0.6)
    for (let r = Math.round(row(Math.max(b.o, b.c))); r <= Math.round(row(Math.min(b.o, b.c))); r++) cv.put(c, r, up ? '#' : '%', mat, 1)
    const vol = Math.round(x.rand() * (cv.rows - chartH - 1))
    for (let r = cv.rows - 1; r > cv.rows - 1 - vol; r--) cv.put(c, r, '=', MAT.hud, 0.45)
  })
}

/** Prediction-market odds: a few probability curves between 0% and 100%. */
function odds(cv: GlyphCanvas, x: Ctx) {
  const lines = clamp(2 + (x.sections % 3), 2, 4)
  const mats = [MAT.code, MAT.accent, MAT.ok, MAT.quote]
  for (const pct of [0.25, 0.5, 0.75]) {
    const r = Math.round((cv.rows - 2) * (1 - pct)) + 1
    for (let c = 0; c < cv.cols; c += 2) cv.put(c, r, '.', MAT.noise, 0.6)
    cv.text(cv.cols - 4, r, `${Math.round(pct * 100)}%`, MAT.hud, 0.6)
  }
  for (let l = 0; l < lines; l++) {
    let p = 0.2 + x.rand() * 0.6
    let prev: [number, number] | null = null
    for (let c = 0; c < cv.cols - 5; c += 2) {
      p = clamp(p + (x.rand() - 0.5) * 0.12, 0.03, 0.97)
      const r = 1 + (cv.rows - 3) * (1 - p)
      if (prev) cv.line(prev[0], prev[1], c, r, mats[l], 0.9)
      prev = [c, r]
    }
    if (prev) cv.put(prev[0], prev[1], '@', mats[l], 1)
  }
}

/** A chain of blocks with hashes; sections = blocks. */
function chain(cv: GlyphCanvas, x: Ctx) {
  const w = 12
  const h = 4
  const perRow = Math.max(1, Math.floor((cv.cols + 3) / (w + 4)))
  const count = clamp(x.sections + 2, 3, perRow * Math.max(1, Math.floor(cv.rows / (h + 2))))
  const rowsUsed = Math.ceil(count / perRow)
  const top = Math.max(0, Math.floor((cv.rows - rowsUsed * (h + 2)) / 2))
  for (let i = 0; i < count; i++) {
    const rowI = Math.floor(i / perRow)
    const col = rowI % 2 === 0 ? i % perRow : perRow - 1 - (i % perRow) // snake
    const c0 = 1 + col * (w + 4)
    const r0 = top + rowI * (h + 2)
    cv.box(c0, r0, c0 + w, r0 + h, MAT.code, 0.8)
    cv.text(c0 + 2, r0 + 1, `#${String(1000 + i * 37 + (x.seed % 97)).slice(-4)}`, MAT.hud, 0.8)
    cv.text(c0 + 2, r0 + 2, '0x' + (x.seed ^ (i * 2654435761)).toString(16).slice(0, 6).padStart(6, '0'), MAT.ink, 0.9)
    cv.text(c0 + 2, r0 + 3, Array.from({ length: 6 }, (_, k) => (hash2(i, k + x.seed) < 0.5 ? '=' : ':')).join(''), MAT.code, 0.5)
    if (i + 1 < count) {
      const nextRow = Math.floor((i + 1) / perRow)
      if (nextRow === rowI) {
        const dir = rowI % 2 === 0 ? 1 : -1
        const lc = dir > 0 ? c0 + w + 1 : c0 - 3
        cv.text(lc, r0 + 2, dir > 0 ? '-->' : '<--', MAT.accent, 1)
      } else {
        cv.text(c0 + w / 2, r0 + h + 1, '|', MAT.accent, 1)
      }
    }
  }
}

/** A lit sphere with latitude/longitude wireframe and an orbit ring. */
function orb(cv: GlyphCanvas, x: Ctx) {
  const R = cv.rows * 0.36
  const cc = cv.cols / 2
  const rc = cv.rows / 2
  const lx = -0.5 + x.rand() * 0.3
  const ly = -0.6
  const lz = 0.62
  for (let r = 0; r < cv.rows; r++)
    for (let c = 0; c < cv.cols; c++) {
      const nx = ((c - cc) * cv.aspect) / R
      const ny = (r - rc) / R
      const d = nx * nx + ny * ny
      if (d > 1) continue
      const nz = Math.sqrt(1 - d)
      const lum = clamp(nx * lx + ny * ly + nz * lz, 0, 1)
      // wireframe: latitude/longitude lines on the sphere surface
      const lat = Math.asin(ny)
      const lon = Math.atan2(nx, nz) + x.seed * 0.001
      const onGrid = Math.abs(Math.sin(lat * 6)) < 0.12 || Math.abs(Math.sin(lon * 5)) < 0.1
      cv.put(c, r, onGrid ? '+' : RAMP[Math.round(lum * (RAMP.length - 1))], onGrid ? MAT.accent : MAT.signal, 0.25 + lum * 0.75)
    }
  // orbit ring (front half drawn over the sphere, back half behind it)
  const steps = 160
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2
    const c = cc + (Math.cos(a) * R * 1.6) / cv.aspect
    const r = rc + Math.sin(a) * R * 0.35
    const front = Math.sin(a) > 0
    const cur = cv.get(c, r)
    if (front || !cur || cur.ch === ' ') cv.put(c, r, i % 4 === 0 ? 'o' : '.', MAT.quote, front ? 0.9 : 0.5)
  }
  cv.put(cc + (R * 1.6) / cv.aspect - 1, rc, '@', MAT.quote, 1)
  cv.grain((c, r) => hash2(c * 3 + x.seed, r * 7), 0.015, MAT.ink, 0.6)
}

/** Evaluation scoreboard: vertical bars, one per section, with a threshold line. */
function bars(cv: GlyphCanvas, x: Ctx) {
  const n = clamp(x.sections + 3, 5, Math.floor(cv.cols / 4))
  const w = Math.max(2, Math.floor((cv.cols - 2) / n) - 1)
  const pass = Math.round(cv.rows * 0.35)
  for (let i = 0; i < n; i++) {
    const v = 0.3 + x.rand() * 0.65
    const hgt = Math.round((cv.rows - 3) * v)
    const c0 = 1 + i * (w + 1)
    const ok = cv.rows - 2 - hgt <= pass
    for (let r = cv.rows - 2; r > cv.rows - 2 - hgt; r--) for (let c = c0; c < c0 + w; c++) cv.put(c, r, r === cv.rows - 1 - hgt ? '=' : '#', ok ? MAT.ok : MAT.hud, ok ? 0.9 : 0.55)
  }
  cv.line(0, pass, cv.cols - 1, pass, MAT.accent, 0.8, '-')
  cv.text(1, pass - 1, 'pass', MAT.accent, 0.9)
  cv.line(0, cv.rows - 1, cv.cols - 1, cv.rows - 1, MAT.hud, 0.6, '_')
}

/** Radar: rings, crosshair, a fading sweep and blips (one per section). */
function radar(cv: GlyphCanvas, x: Ctx) {
  const cc = cv.cols / 2
  const rc = cv.rows / 2
  const R = cv.rows * 0.46
  for (const k of [0.33, 0.66, 1]) cv.ring(cc, rc, R * k, MAT.ok, 0.45, '.')
  cv.line(cc - R / cv.aspect, rc, cc + R / cv.aspect, rc, MAT.ok, 0.3, '-')
  cv.line(cc, rc - R, cc, rc + R, MAT.ok, 0.3, '|')
  const sweep = x.rand() * Math.PI * 2
  for (let i = 0; i < 26; i++) {
    const a = sweep - i * 0.035
    cv.line(cc, rc, cc + (Math.cos(a) * R) / cv.aspect, rc + Math.sin(a) * R, MAT.ok, Math.max(0.15, 1 - i / 26), i === 0 ? undefined : ':')
  }
  for (let i = 0; i < clamp(x.sections, 3, 12); i++) {
    const a = x.rand() * Math.PI * 2
    const d = (0.25 + x.rand() * 0.7) * R
    cv.put(cc + (Math.cos(a) * d) / cv.aspect, rc + Math.sin(a) * d, i % 3 === 0 ? '*' : '+', MAT.accent, 1)
  }
}

/** Agent network: an orchestrator hub, worker nodes = sections, message packets on edges. */
function network(cv: GlyphCanvas, x: Ctx) {
  const n = clamp(x.sections, 4, 11)
  const cc = cv.cols / 2
  const rc = cv.rows / 2
  const nodes = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + x.rand() * 0.4
    const d = cv.rows * (0.3 + x.rand() * 0.14)
    return { c: cc + (Math.cos(a) * d) / cv.aspect, r: rc + Math.sin(a) * d }
  })
  nodes.forEach(p => cv.line(cc, rc, p.c, p.r, MAT.hud, 0.45))
  for (let i = 0; i < n; i++) if (x.rand() < 0.45) cv.line(nodes[i].c, nodes[i].r, nodes[(i + 1) % n].c, nodes[(i + 1) % n].r, MAT.code, 0.4)
  nodes.forEach((p, i) => {
    const t = 0.3 + x.rand() * 0.5
    cv.put(cc + (p.c - cc) * t, rc + (p.r - rc) * t, '*', MAT.accent, 1) // message in flight
    cv.text(p.c - 1, p.r, '(o)', MAT.ink, 1)
    cv.text(p.c - 1, p.r + 1, `w${i + 1}`, MAT.hud, 0.7)
  })
  cv.text(cc - 2, rc, '[@@]', MAT.accent, 1)
  cv.grain((c, r) => hash2(c + x.seed, r * 5), 0.01, MAT.noise, 0.8)
}

/** Nested layers around a core; one ring per section (max 5). */
function layers(cv: GlyphCanvas, x: Ctx) {
  const n = clamp(x.sections, 3, 5)
  const mats = [MAT.code, MAT.ok, MAT.quote, MAT.accent, MAT.signal]
  const cc = Math.floor(cv.cols / 2)
  const rc = Math.floor(cv.rows / 2)
  for (let i = n; i >= 1; i--) {
    const hw = Math.round((cv.cols / 2 - 2) * (i / n))
    const hh = Math.max(1, Math.round((cv.rows / 2 - 1) * (i / n)))
    cv.box(cc - hw, rc - hh, cc + hw, rc + hh, mats[(n - i) % mats.length], 0.85)
    cv.text(cc - hw + 2, rc - hh, ` L${n - i + 1} `, mats[(n - i) % mats.length], 1)
  }
  cv.text(cc - 2, rc, '[##]', MAT.accent, 1)
}

/** Pipeline: stages left→right (from headings), items flowing through the pipes. */
function pipeline(cv: GlyphCanvas, x: Ctx) {
  const n = clamp(x.sections, 3, 5)
  const w = Math.max(7, Math.floor((cv.cols - (n - 1) * 4) / n) - 1)
  const h = Math.min(4, cv.rows - 2)
  const r0 = Math.floor((cv.rows - h) / 2)
  for (let i = 0; i < n; i++) {
    const c0 = i * (w + 4)
    cv.box(c0, r0, c0 + w, r0 + h, i === n - 1 ? MAT.accent : MAT.code, 0.85)
    const label = (x.headings[i] ?? `stage${i + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, w - 2) || `s${i + 1}`
    cv.text(c0 + 1, r0 + 1, label, MAT.ink, 0.95)
    cv.text(c0 + 1, r0 + 2, '[]'.repeat(Math.max(1, Math.floor(x.rand() * ((w - 2) / 2)))), MAT.hud, 0.6)
    if (i < n - 1) cv.text(c0 + w + 1, r0 + Math.floor(h / 2), '==>', MAT.accent, 1)
  }
  // items waiting upstream and shipped downstream
  for (let r = 0; r < cv.rows; r++) {
    if (r >= r0 - 1 && r <= r0 + h + 1) continue
    for (let c = 0; c < cv.cols; c += 3) if (hash2(c + x.seed, r) < 0.12) cv.put(c, r, c < cv.cols / 2 ? '.' : 'o', c < cv.cols / 2 ? MAT.noise : MAT.ok, 0.8)
  }
}

/** Terminal window replaying real lines from the post's code blocks. */
function terminal(cv: GlyphCanvas, x: Ctx) {
  cv.box(0, 0, cv.cols - 1, cv.rows - 1, MAT.hud, 0.6)
  cv.text(2, 0, ' o o o ', MAT.accent, 0.9)
  cv.text(Math.max(10, Math.floor(cv.cols / 2) - 4), 0, ' zsh ', MAT.hud, 0.8)
  const lines = (x.code.length ? x.code : x.headings).slice(0, cv.rows - 3)
  let r = 2
  for (const l of lines) {
    if (r >= cv.rows - 2) break
    const isCmd = /^(\$|>|claude|npm|pnpm|git|cd|ls|cat|\/)/.test(l) || x.rand() < 0.35
    if (isCmd) {
      cv.text(2, r, '$', MAT.ok, 1)
      cv.text(4, r, l.replace(/^\$\s*/, '').slice(0, cv.cols - 6), MAT.ink, 0.95)
    } else cv.text(4, r, l.slice(0, cv.cols - 6), MAT.hud, 0.6)
    r++
  }
  if (r < cv.rows - 1) {
    cv.text(2, r, '$', MAT.ok, 1)
    cv.put(4, r, '_', MAT.accent, 1)
  }
}

const MOTIFS: Record<Exclude<Motif, 'landscape'>, (cv: GlyphCanvas, x: Ctx) => void> = {
  commits,
  candles,
  odds,
  chain,
  orb,
  bars,
  radar,
  network,
  layers,
  pipeline,
  terminal,
}

export function contentArt(input: ArtInput, cols: number, rows: number): FpCell[][] {
  const motif = pickMotif(input.seed, input.tags)
  if (motif === 'landscape') return landscape(input, cols, rows)
  const cv = new GlyphCanvas(cols, rows)
  MOTIFS[motif](cv, context(input))
  return cv.cells
}

/** One-line caption of what the picture encodes. */
export function artLegend(input: ArtInput): string {
  const motif = pickMotif(input.seed, input.tags)
  const x = context(input)
  const what: Record<Motif, string> = {
    commits: 'commit graph',
    candles: 'candles',
    odds: 'odds',
    chain: `${x.sections + 2} blocks`,
    orb: 'orbit',
    bars: 'eval scores',
    radar: 'radar',
    network: `${Math.max(4, Math.min(11, x.sections))} agents`,
    layers: `${Math.max(3, Math.min(5, x.sections))} layers`,
    pipeline: `${Math.max(3, Math.min(5, x.sections))} stages`,
    terminal: x.code.length ? `${x.code.length} lines replayed` : 'shell',
    landscape: `skyline = ${x.sections} sections`,
  }
  return `${motif} · ${what[motif]}`
}
