import type { FpCell } from '@/lib/ascii/blocks'

/** Tiny glyph canvas used by the content-art motifs. Coordinates are cells (col, row). */
export class GlyphCanvas {
  readonly cells: FpCell[][]
  constructor(
    readonly cols: number,
    readonly rows: number,
    /** Cell width / height, for round shapes. */
    readonly aspect = 0.55,
  ) {
    this.cells = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ ch: ' ', mat: 0, lum: 0 })))
  }

  put(c: number, r: number, ch: string, mat: number, lum: number) {
    c = Math.round(c)
    r = Math.round(r)
    if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) return
    this.cells[r][c] = { ch, mat, lum }
  }

  get(c: number, r: number): FpCell | null {
    c = Math.round(c)
    r = Math.round(r)
    return c < 0 || r < 0 || c >= this.cols || r >= this.rows ? null : this.cells[r][c]
  }

  text(c: number, r: number, s: string, mat: number, lum: number) {
    for (let i = 0; i < s.length; i++) this.put(c + i, r, s[i], mat, lum)
  }

  /** Straight line with a slope glyph picked from its on-screen angle (or a fixed glyph). */
  line(c0: number, r0: number, c1: number, r1: number, mat: number, lum: number, glyph?: string) {
    const dx = c1 - c0
    const dy = r1 - r0
    const ang = ((Math.atan2(-dy, dx * this.aspect) * 180) / Math.PI + 180) % 180
    const ch = glyph ?? (ang < 22.5 || ang >= 157.5 ? '-' : ang < 67.5 ? '/' : ang < 112.5 ? '|' : '\\')
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) * 1.2))
    for (let i = 0; i <= steps; i++) this.put(c0 + (dx * i) / steps, r0 + (dy * i) / steps, ch, mat, lum)
  }

  box(c0: number, r0: number, c1: number, r1: number, mat: number, lum: number) {
    for (let c = c0 + 1; c < c1; c++) {
      this.put(c, r0, '-', mat, lum)
      this.put(c, r1, '-', mat, lum)
    }
    for (let r = r0 + 1; r < r1; r++) {
      this.put(c0, r, '|', mat, lum)
      this.put(c1, r, '|', mat, lum)
    }
    for (const [c, r] of [[c0, r0], [c1, r0], [c0, r1], [c1, r1]]) this.put(c, r, '+', mat, lum)
  }

  /** Ellipse outline that looks round on screen (radius in rows). */
  ring(cc: number, rc: number, radius: number, mat: number, lum: number, ch = '.', dashed = false) {
    const steps = Math.ceil(radius * 14)
    for (let i = 0; i < steps; i++) {
      if (dashed && i % 3 === 2) continue
      const a = (i / steps) * Math.PI * 2
      this.put(cc + (Math.cos(a) * radius) / this.aspect, rc + Math.sin(a) * radius, ch, mat, lum)
    }
  }

  /** Sparse background dots so empty space still reads as a surface. */
  grain(seed: (c: number, r: number) => number, density: number, mat: number, lum: number, ch = '.') {
    for (let r = 0; r < this.rows; r++)
      for (let c = 0; c < this.cols; c++) if (this.cells[r][c].ch === ' ' && seed(c, r) < density) this.put(c, r, ch, mat, lum)
  }
}
