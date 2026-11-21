import { AsciiGrid } from '@/lib/ascii/grid'
import { textMask, type TextMask } from '@/lib/ascii/mask'
import { MAT, edgeGlyph, rampChar } from '@/lib/ascii/palette'
import { hash1, hash2, hashString, rng, vnoise } from '@/lib/ascii/noise'
import { Spider } from '@/lib/ascii/spider'

/** Something real hidden in the noise: a post or project path the spider crawls and decodes. */
export interface Signal {
  /** ASCII path drawn in the grid, e.g. "~/blog/harness-ai-agent". */
  label: string
  /** Full (possibly CJK) title, shown in the HUD — never drawn in the grid. */
  title: string
  href: string
}

export interface FieldStats {
  posts: number
  projects: number
}

interface Placed extends Signal {
  col: number
  row: number
  reveal: number
}

interface Rect {
  c0: number
  r0: number
  c1: number
  r1: number
}

const HEX = '0123456789abcdef'
const GLITCH = '#$%?!*+=/\\|01{}[]~^'
const NAME_EDGE = 0.35
const NAME_RAMP = ':-=+*#%@'
const LENS_PX = 90 // radius used for the name's light falloff
const BODY_REVEAL_PX = 70 // body this close to a signal decodes it
const FOOT_REVEAL_PX = 26 // a planted foot this close decodes it
const CLEAR_PX = 44 // noise cleared around the spider so it stays readable
const NAV_PX = 56 // fixed navbar height: keep it clear of noise
const BOOT_END = 2.2
const AUTOPILOT_IDLE = 2.5 // s without pointer input before the lens drives itself
const AUTOPILOT_DWELL = 3.2 // s spent on each signal
const RIPPLE_SPEED = 70 // cells / s
const RIPPLE_LIFE = 0.9

const inRect = (c: number, r: number, b: Rect | null) => !!b && c >= b.c0 && c <= b.c1 && r >= b.r0 && r <= b.r1

export class SignalField {
  readonly grid: AsciiGrid
  private name: TextMask | null = null
  private nameBox: Rect = { c0: 0, r0: 0, c1: 0, r1: 0 }
  private calm: Rect | null = null
  private placed: Placed[] = []
  private reveal = new Float32Array(0) // per-cell boot reveal time
  private ripples: { c: number; r: number; t0: number }[] = []

  t = 0
  /** Lens centre in cell coordinates. */
  lens = { c: -100, r: -100 }
  private lensTarget = { c: -100, r: -100 }
  private pointer: { c: number; r: number } | null = null
  private spider: Spider | null = null
  private lastInput = -Infinity
  private pilotIndex = 0
  private pilotSince = 0
  /** Signal currently under the lens (or pointer), for the HUD. */
  focus: Placed | null = null
  hovered: Placed | null = null

  constructor(
    pre: HTMLPreElement,
    private nameLines: string[],
    private signals: Signal[],
    private stats: FieldStats,
    private font: string,
  ) {
    this.grid = new AsciiGrid(pre)
  }

  /** (Re)build everything that depends on size. `calm` is a client rect to keep clear for HTML copy. */
  layout(width: number, height: number, containerLeft: number, containerWidth: number, calm: DOMRect | null, origin: DOMRect) {
    const g = this.grid
    g.measure(width, height)
    const { cols, rows, cw, ch } = g

    const left = Math.max(1, Math.round(containerLeft / cw))
    const usable = Math.max(10, Math.floor(containerWidth / cw))
    const lines = usable < 72 ? this.nameLines.flatMap(l => l.split(' ')) : this.nameLines
    const nameCols = Math.min(usable, Math.floor(usable * (lines.length > 1 ? 0.9 : 0.86)))
    const nameRows = Math.max(8, Math.round((nameCols * cw) / ch / (lines.length > 1 ? 1.15 : 3.9)))
    const top = Math.max(Math.ceil(72 / ch), Math.round(rows * 0.2))
    this.nameBox = { c0: left, r0: top, c1: left + nameCols - 1, r1: top + nameRows - 1 }
    this.name = textMask(lines, nameCols, nameRows, cw / ch, this.font, 800)

    this.calm = calm
      ? {
          c0: Math.floor((calm.left - origin.left) / cw) - 2,
          r0: Math.floor((calm.top - origin.top) / ch) - 1,
          c1: Math.ceil((calm.right - origin.left) / cw) + 2,
          r1: Math.ceil((calm.bottom - origin.top) / ch),
        }
      : null

    this.place(cols, rows)

    this.reveal = new Float32Array(cols * rows)
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        this.reveal[r * cols + c] = 0.1 + 1.5 * ((c / cols) * 0.7 + (r / rows) * 0.3) + 0.3 * hash2(c, r)

    if (this.lens.c < 0 && this.placed[0]) this.lens = this.centre(this.placed[0])
  }

  /** Scatter signals in the free noise, away from the name, copy, nav and HUD rows. */
  private place(cols: number, rows: number) {
    const rand = rng(hashString(this.signals.map(s => s.href).join('|')) ^ cols)
    const taken: Rect[] = []
    const nb = this.nameBox
    const blocked = (b: Rect) =>
      b.r0 < Math.ceil(64 / this.grid.ch) ||
      b.r1 > rows - 3 ||
      b.c0 < 1 ||
      b.c1 > cols - 2 ||
      overlap(b, { c0: nb.c0 - 2, r0: nb.r0 - 1, c1: nb.c1 + 2, r1: nb.r1 + 1 }) ||
      (this.calm !== null && overlap(b, this.calm)) ||
      taken.some(t => overlap(b, { c0: t.c0 - 3, r0: t.r0 - 2, c1: t.c1 + 3, r1: t.r1 + 2 }))

    this.placed = []
    for (const s of this.signals) {
      const label = s.label.length > cols - 4 ? s.label.slice(0, cols - 5) + '~' : s.label
      for (let tries = 0; tries < 80; tries++) {
        const col = Math.floor(rand() * (cols - label.length))
        const row = Math.floor(rand() * rows)
        const box = { c0: col, r0: row, c1: col + label.length - 1, r1: row }
        if (blocked(box)) continue
        taken.push(box)
        this.placed.push({ ...s, label, col, row, reveal: 0 })
        break
      }
    }
  }

  private centre(p: Placed) {
    return { c: p.col + p.label.length / 2, r: p.row }
  }

  get bootDone() {
    return this.t >= BOOT_END
  }

  skipBoot() {
    this.t = Math.max(this.t, BOOT_END + 1)
  }

  pointerMove(clientX: number, clientY: number) {
    const cell = this.grid.cellAt(clientX, clientY)
    this.pointer = cell ? { c: cell[0], r: cell[1] } : null
    if (cell) {
      this.lensTarget = { c: cell[0], r: cell[1] }
      this.lastInput = this.t
    }
  }

  pointerLeave() {
    this.pointer = null
  }

  /** Returns the signal to open, if the click landed on a decoded one. */
  click(clientX: number, clientY: number): Signal | null {
    const cell = this.grid.cellAt(clientX, clientY)
    if (!cell) return null
    const hit = this.signalAt(cell[0], cell[1])
    if (hit && hit.reveal > 0.5) return hit
    this.ripples.push({ c: cell[0], r: cell[1], t0: this.t })
    return null
  }

  private signalAt(c: number, r: number): Placed | null {
    return this.placed.find(p => p.row === r && c >= p.col - 1 && c <= p.col + p.label.length) ?? null
  }

  step(dt: number) {
    this.t += dt
    const idle = this.t - this.lastInput > AUTOPILOT_IDLE
    if (idle && this.placed.length) {
      if (this.t - this.pilotSince > AUTOPILOT_DWELL) {
        this.pilotIndex = (this.pilotIndex + 1) % this.placed.length
        this.pilotSince = this.t
      }
      this.lensTarget = this.centre(this.placed[this.pilotIndex])
    }
    const { cw, ch } = this.grid
    // The spider crawls toward the target; the "lens" is just where its body is.
    if (!this.spider) this.spider = new Spider(this.lens.c * cw, this.lens.r * ch)
    const sp = this.spider
    sp.step(dt, this.lensTarget.c * cw, this.lensTarget.r * ch)
    this.lens = { c: sp.x / cw, r: sp.y / ch }

    const feet = sp.feet()
    // Distance in px from a point to a signal's text span.
    const toSpan = (p: Placed, x: number, y: number) =>
      Math.hypot(Math.max(0, Math.abs(x / cw - (p.col + p.label.length / 2)) - p.label.length / 2) * cw, y - p.row * ch - ch / 2)
    let best: Placed | null = null
    let bestD = Infinity
    for (const p of this.placed) {
      const d = toSpan(p, sp.x, sp.y)
      const touched = feet.some(f => toSpan(p, f.x, f.y) < FOOT_REVEAL_PX)
      const inside = d < BODY_REVEAL_PX || touched
      p.reveal = Math.min(1, Math.max(0, p.reveal + (inside ? dt * 2.4 : -dt * 1.2)))
      if (inside && d < bestD) {
        best = p
        bestD = d
      }
    }
    this.focus = best
    const ptr = this.pointer
    this.hovered = ptr ? this.signalAt(ptr.c, ptr.r) : null
    if (this.hovered && this.hovered.reveal < 0.5) this.hovered = null
    this.ripples = this.ripples.filter(r => this.t - r.t0 < RIPPLE_LIFE)
  }

  render() {
    const g = this.grid
    const { cols, rows, cw, ch } = g
    const t = this.t
    const booting = t < BOOT_END
    g.clear()

    const nb = this.nameBox
    const nm = this.name
    // Light for the name follows the lens, so decoding sweeps a highlight across the letters.
    const lx = this.lens.c
    const ly = this.lens.r
    const navRows = Math.ceil(NAV_PX / ch)

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (inRect(c, r, this.calm)) continue

        // ── name ──────────────────────────────────────────────
        if (nm && inRect(c, r, nb)) {
          const nc = c - nb.c0
          const nr = r - nb.r0
          const i = nr * nm.cols + nc
          const cov = nm.cov[i]
          if (cov > NAME_EDGE) {
            const at = (x: number, y: number) =>
              x < 0 || y < 0 || x >= nm.cols || y >= nm.rows ? 0 : nm.cov[y * nm.cols + x]
            const edge = at(nc - 1, nr) < NAME_EDGE || at(nc + 1, nr) < NAME_EDGE || at(nc, nr - 1) < NAME_EDGE || at(nc, nr + 1) < NAME_EDGE
            const sAt = (x: number, y: number) =>
              x < 0 || y < 0 || x >= nm.cols || y >= nm.rows ? 0 : nm.soft[y * nm.cols + x]
            const gx = sAt(nc + 1, nr) - sAt(nc - 1, nr)
            const gy = sAt(nc, nr - 1) - sAt(nc, nr + 1)
            // Pseudo-3D: normal from the blurred mask, point light at the lens.
            let nx = -gx * 2.2
            let ny = gy * 2.2
            let nz = 1
            const nl = Math.hypot(nx, ny, nz)
            nx /= nl; ny /= nl; nz /= nl
            let dx = (lx - c) * cw
            let dy = (r - ly) * ch
            let dz = 260
            const dl = Math.hypot(dx, dy, dz)
            dx /= dl; dy /= dl; dz /= dl
            const lambert = Math.max(0, nx * dx + ny * dy + nz * dz)
            const near = Math.max(0, 1 - Math.hypot((lx - c) * cw, (ly - r) * ch) / (LENS_PX * 1.6))
            const lum = 0.5 + 0.5 * lambert * (0.5 + 0.5 * near)
            if (edge) g.set(c, r, edgeGlyph(-gx, gy), MAT.ink, 0.7)
            else g.set(c, r, rampChar(lum, NAME_RAMP), near > 0.5 && lum > 0.8 ? MAT.accent : MAT.ink, lum)
            continue
          }
          // Calm halo around the letters so the name reads against the noise.
          if (nm.soft[i] > 0.04) continue
        }

        // ── noise: a slow ledger of hex pairs ────────────────
        if (c % 3 === 2 || r < navRows) continue
        const n = vnoise(c * 0.045 + t * 0.05, r * 0.11 - t * 0.025)
        if (n < 0.4) continue
        const epoch = Math.floor(t * 0.7 + hash2(c, r) * 9)
        const hex = HEX[Math.floor(hash2(c * 7 + epoch, r * 13) * 16)]
        if (Math.hypot((c - lx) * cw, (r - ly) * ch) < CLEAR_PX) continue
        g.set(c, r, hex, MAT.noise, (n - 0.4) * 1.1)
      }
    }

    // ── signals decoded by the crawler ───────────────────────
    for (const p of this.placed) {
      if (p.reveal <= 0) continue
      const hot = p === this.hovered
      for (let i = 0; i < p.label.length; i++) {
        const th = i / p.label.length
        const k = (p.reveal - th * 0.6) / 0.4
        if (k <= 0) continue
        const ch2 = k >= 1 ? p.label[i] : GLITCH[Math.floor(hash1(i * 31 + Math.floor(t * 24)) * GLITCH.length)]
        g.set(p.col + i, p.row, ch2, hot ? MAT.accent : MAT.signal, k >= 1 ? 1 : 0.55)
      }
      if (p.reveal > 0.9) {
        g.set(p.col - 2, p.row, '>', MAT.accent, 1)
        if (hot) for (let i = 0; i < p.label.length; i++) g.set(p.col + i, p.row + 1, '-', MAT.accent, 0.8)
      }
    }

    // ── click ripples ────────────────────────────────────────
    for (const rp of this.ripples) {
      const age = t - rp.t0
      const radius = age * RIPPLE_SPEED
      const fade = 1 - age / RIPPLE_LIFE
      for (let r = Math.max(0, Math.floor(rp.r - radius * 0.6) - 1); r <= Math.min(rows - 1, rp.r + radius * 0.6 + 1); r++)
        for (let c = Math.max(0, Math.floor(rp.c - radius) - 1); c <= Math.min(cols - 1, rp.c + radius + 1); c++) {
          const d = Math.hypot(c - rp.c, (r - rp.r) / 0.6)
          if (Math.abs(d - radius) < 1.1 && !inRect(c, r, this.calm) && !inRect(c, r, nb))
            g.set(c, r, GLITCH[Math.floor(hash2(c, r + Math.floor(t * 30)) * GLITCH.length)], MAT.accent, fade)
        }
    }

    // ── the crawler (the cursor) ─────────────────────────────
    this.spider?.draw(g)

    if (booting) this.renderBoot()
    g.compose()
  }

  /** Diagonal glitch reveal plus a short typed log with real counts. */
  private renderBoot() {
    const g = this.grid
    const t = this.t
    for (let k = 0; k < g.chars.length; k++) {
      const rv = this.reveal[k]
      if (t < rv - 0.3) g.chars[k] = ' '
      else if (t < rv) {
        g.chars[k] = GLITCH[Math.floor(hash1(k + Math.floor(t * 30) * 977) * GLITCH.length)]
        g.mats[k] = MAT.accent
        g.lums[k] = 0.45 + 0.4 * hash1(k + 3)
      }
    }
    const lines = [
      '> joey --decode --render=ascii',
      `  indexing ${this.stats.posts} posts .......... ok`,
      `  indexing ${this.stats.projects} projects ....... ok`,
      '  tracing signal ........... ok',
    ]
    const col = Math.max(1, g.cols - 40)
    const row0 = Math.ceil(72 / g.ch)
    let budget = t * 70
    lines.forEach((line, i) => {
      const s = line.slice(0, Math.max(0, Math.floor(budget)))
      budget -= line.length + 4
      g.text(col, row0 + i, ' '.repeat(38), MAT.hud, 0)
      g.text(col, row0 + i, s, s.endsWith('ok') ? MAT.ok : MAT.hud, 0.9)
    })
  }
}

function overlap(a: Rect, b: Rect) {
  return a.c0 <= b.c1 && a.c1 >= b.c0 && a.r0 <= b.r1 && a.r1 >= b.r0
}
