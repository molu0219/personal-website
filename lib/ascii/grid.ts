import { glyphClass } from '@/lib/ascii/palette'

const ESC: Record<string, string> = { '<': '&lt;', '>': '&gt;', '&': '&amp;' }

/**
 * Character-cell framebuffer rendered into a single <pre> as runs of
 * `<i class="a{mat}s{shade}">` spans (same approach as pelican-ride).
 */
export class AsciiGrid {
  cols = 0
  rows = 0
  /** Cell size in CSS px. */
  cw = 7
  ch = 12
  chars: string[] = []
  mats = new Uint8Array(0)
  lums = new Float32Array(0)
  /** Optional per-cell CSS colour; overrides the material palette when set. */
  colors: (string | null)[] = []

  constructor(private pre: HTMLPreElement) {}

  /** Measure the glyph cell at the pre's current font size. */
  private measureCell() {
    const probe = document.createElement('span')
    probe.textContent = 'M'.repeat(100)
    this.pre.textContent = ''
    this.pre.appendChild(probe)
    const r = probe.getBoundingClientRect()
    this.pre.removeChild(probe)
    const fs = parseFloat(getComputedStyle(this.pre).fontSize) || 12
    this.cw = r.width / 100 || fs * 0.6
    this.ch = fs // line-height: 1
  }

  private alloc() {
    const n = this.cols * this.rows
    this.chars = new Array(n).fill(' ')
    this.mats = new Uint8Array(n)
    this.lums = new Float32Array(n)
    this.colors = new Array(n).fill(null)
  }

  /** Fixed `cols × rows` grid (the pre sizes itself to its content). */
  setSize(cols: number, rows: number) {
    this.measureCell()
    this.cols = cols
    this.rows = rows
    this.alloc()
  }

  /** Fit the grid to `width × height` px at the pre's current font size. */
  measure(width: number, height: number) {
    this.measureCell()
    this.cols = Math.max(1, Math.floor(width / this.cw))
    this.rows = Math.max(1, Math.floor(height / this.ch))
    this.alloc()
  }

  clear() {
    this.chars.fill(' ')
    this.lums.fill(0)
    this.colors.fill(null)
  }

  set(col: number, row: number, ch: string, mat: number, lum: number) {
    if (col < 0 || row < 0 || col >= this.cols || row >= this.rows) return
    const k = row * this.cols + col
    this.chars[k] = ch
    this.mats[k] = mat
    this.lums[k] = lum
  }

  /** Write a string left-to-right (ASCII only: one char per cell). */
  text(col: number, row: number, s: string, mat: number, lum: number) {
    for (let i = 0; i < s.length; i++) this.set(col + i, row, s[i], mat, lum)
  }

  /** Cell under a client-space point, or null. */
  cellAt(clientX: number, clientY: number): [number, number] | null {
    const r = this.pre.getBoundingClientRect()
    const c = Math.floor((clientX - r.left) / this.cw)
    const w = Math.floor((clientY - r.top) / this.ch)
    return c >= 0 && w >= 0 && c < this.cols && w < this.rows ? [c, w] : null
  }

  compose() {
    let html = ''
    for (let r = 0; r < this.rows; r++) {
      let run = ''
      let cur = ''
      for (let c = 0; c < this.cols; c++) {
        const k = r * this.cols + c
        const ch = this.chars[k]
        if (ch === ' ') {
          run += ' '
          continue
        }
        const color = this.colors[k]
        const cls = color ? `style="color:${color}"` : `class=${glyphClass(this.mats[k], this.lums[k])}`
        if (cls !== cur) {
          if (run) html += cur ? `<i ${cur}>${run}</i>` : run
          run = ''
          cur = cls
        }
        run += ESC[ch] ?? ch
      }
      if (run) html += cur ? `<i ${cur}>${run}</i>` : run
      html += '\n'
    }
    this.pre.innerHTML = html
  }
}
