import GithubSlugger from 'github-slugger'
import { MAT } from '@/lib/ascii/palette'
import { hashString } from '@/lib/ascii/noise'

/**
 * "Content fingerprint": a markdown document drawn as an ASCII minimap of its own structure.
 * Headings, prose, code, lists, quotes and tables each get their own glyphs and material,
 * so every post looks different and its shape (tutorial vs. reference vs. essay) is visible.
 */

export interface FpCell {
  ch: string
  mat: number
  lum: number
}

export interface FpRow {
  cells: FpCell[]
  /** Heading anchor (same slug rehype-slug generates), so the row can link into the article. */
  anchor?: string
  /** Heading text for tooltips / a11y. */
  label?: string
}

type Block =
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'para'; text: string }
  | { kind: 'code'; lines: string[]; lang: string }
  | { kind: 'list'; items: string[]; ordered: boolean }
  | { kind: 'quote'; text: string }
  | { kind: 'table'; rows: number; cols: number }
  | { kind: 'image' }
  | { kind: 'rule' }

export function parseBlocks(md: string): Block[] {
  const lines = md.replace(/\r\n?/g, '\n').split('\n')
  const blocks: Block[] = []
  let para: string[] = []
  const flush = () => {
    if (para.length) blocks.push({ kind: 'para', text: para.join(' ') })
    para = []
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const t = line.trim()
    const fence = t.match(/^(```|~~~)\s*([\w+-]*)/)
    if (fence) {
      flush()
      const code: string[] = []
      for (i++; i < lines.length && !lines[i].trim().startsWith(fence[1]); i++) code.push(lines[i])
      blocks.push({ kind: 'code', lines: code, lang: fence[2] })
      continue
    }
    if (!t) {
      flush()
      continue
    }
    const h = t.match(/^(#{1,6})\s+(.*)$/)
    if (h) {
      flush()
      blocks.push({ kind: 'heading', level: h[1].length, text: stripEmoji(h[2].replace(/[*_`]/g, '')) })
      continue
    }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) {
      flush()
      blocks.push({ kind: 'rule' })
      continue
    }
    if (/^!\[.*\]\(.*\)$/.test(t)) {
      flush()
      blocks.push({ kind: 'image' })
      continue
    }
    if (t.startsWith('|')) {
      flush()
      let rows = 0
      const cols = t.split('|').length - 2
      for (; i < lines.length && lines[i].trim().startsWith('|'); i++) if (!/^\|[\s:|-]+\|$/.test(lines[i].trim())) rows++
      i--
      blocks.push({ kind: 'table', rows, cols: Math.max(1, cols) })
      continue
    }
    const li = t.match(/^([-*+]|\d+[.)])\s+(.*)$/)
    if (li) {
      flush()
      const ordered = /\d/.test(li[1])
      const items = [li[2]]
      for (i++; i < lines.length; i++) {
        const m = lines[i].trim().match(/^([-*+]|\d+[.)])\s+(.*)$/)
        if (!m) break
        items.push(m[2])
      }
      i--
      blocks.push({ kind: 'list', items, ordered })
      continue
    }
    if (t.startsWith('>')) {
      flush()
      const q = [t.replace(/^>\s?/, '')]
      for (i++; i < lines.length && lines[i].trim().startsWith('>'); i++) q.push(lines[i].trim().replace(/^>\s?/, ''))
      i--
      blocks.push({ kind: 'quote', text: q.join(' ') })
      continue
    }
    para.push(t)
  }
  flush()
  return blocks
}

const isWide = (code: number) => code >= 0x2e80 // CJK and friends take two cells

/** Emoji carry no structure and render inconsistently in monospace (and make next/og fetch images). */
function stripEmoji(s: string): string {
  return s.replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, '').replace(/\s+/g, ' ').trim()
}
const CJK_GLYPHS = ':-:=-:'

/** Turn prose into texture that mirrors it: words, spaces, CJK runs and punctuation stay visible. */
function texture(text: string, mat: number, base: number): FpCell[] {
  const out: FpCell[] = []
  const plain = stripEmoji(text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, ''))
  for (const ch of plain) {
    const code = ch.codePointAt(0) ?? 32
    if (ch === ' ') out.push({ ch: ' ', mat, lum: 0 })
    else if (isWide(code)) {
      if (/[　-〿＀-／：-＠]/.test(ch)) {
        out.push({ ch: '.', mat, lum: base * 0.6 }, { ch: ' ', mat, lum: 0 })
      } else {
        const g = CJK_GLYPHS[code % CJK_GLYPHS.length]
        out.push({ ch: g, mat, lum: base }, { ch: g, mat, lum: base * 0.85 })
      }
    } else if (/[a-z]/.test(ch)) out.push({ ch: '-', mat, lum: base * 0.85 })
    else if (/[A-Z]/.test(ch)) out.push({ ch: '=', mat, lum: base })
    else if (/[0-9]/.test(ch)) out.push({ ch: '+', mat, lum: base })
    else out.push({ ch: '.', mat, lum: base * 0.6 })
  }
  return out
}

function wrap(cells: FpCell[], width: number, maxLines: number): FpCell[][] {
  const lines: FpCell[][] = []
  for (let i = 0; i < cells.length && lines.length < maxLines; i += width) lines.push(cells.slice(i, i + width))
  return lines
}

const str = (s: string, mat: number, lum: number): FpCell[] => Array.from(s, ch => ({ ch, mat, lum }))
const asciiOnly = (s: string) => s.replace(/[^\x20-\x7e]/g, '.')

export interface FingerprintOptions {
  cols: number
  /** Stop after this many rows (the tail is summarised as "... N more"). */
  maxRows: number
  /** Prose lines per paragraph before it is clipped (keeps long essays readable as a shape). */
  paraLines?: number
  codeLines?: number
}

export function fingerprint(md: string, opts: FingerprintOptions): FpRow[] {
  const { cols, maxRows } = opts
  const paraLines = opts.paraLines ?? 3
  const codeLines = opts.codeLines ?? 6
  const slugger = new GithubSlugger()
  const rows: FpRow[] = []
  const push = (cells: FpCell[], extra: Partial<FpRow> = {}) => rows.push({ cells: cells.slice(0, cols), ...extra })
  const blocks = parseBlocks(md)
  let lastKind = ''
  let drawn = 0

  for (const b of blocks) {
    if (rows.length >= maxRows) break
    drawn++
    if (lastKind && (b.kind === 'heading' || lastKind === 'code' || b.kind === 'code')) push([])
    lastKind = b.kind
    switch (b.kind) {
      case 'heading': {
        const anchor = slugger.slug(b.text)
        const marker = '#'.repeat(Math.min(3, b.level)) + ' '
        // Real heading text (CJK included): the map reads as an outline, prose stays texture.
        push([...str(marker, MAT.accent, 0.6), ...str(b.text, b.level <= 2 ? MAT.ink : MAT.hud, 1)], { anchor, label: b.text })
        break
      }
      case 'para':
        for (const line of wrap(texture(b.text, MAT.noise, 0.75), cols, paraLines)) push(line)
        break
      case 'list':
        b.items.slice(0, 5).forEach((item, i) => {
          const bullet = b.ordered ? `${i + 1}. ` : '* '
          push([...str(bullet, MAT.accent, 0.8), ...texture(item, MAT.noise, 0.85)])
        })
        if (b.items.length > 5) push(str(`  +${b.items.length - 5}`, MAT.hud, 0.6))
        break
      case 'quote':
        for (const line of wrap(texture(b.text, MAT.quote, 0.75), cols - 2, 2)) push([...str('| ', MAT.quote, 1), ...line])
        break
      case 'code': {
        const w = Math.min(cols, Math.max(16, ...b.lines.slice(0, codeLines).map(l => l.length + 4)))
        const tag = b.lang ? `[${b.lang}]` : ''
        push(str(('+-' + tag).padEnd(w - 1, '-') + '+', MAT.code, 0.6))
        b.lines.slice(0, codeLines).forEach(l => {
          const body = asciiOnly(l).slice(0, w - 4).padEnd(w - 4)
          push([...str('| ', MAT.code, 0.6), ...str(body, MAT.code, 0.95), ...str(' |', MAT.code, 0.6)])
        })
        if (b.lines.length > codeLines) push(str(`| ... +${b.lines.length - codeLines} lines`.padEnd(w - 1) + '|', MAT.code, 0.5))
        push(str('+'.padEnd(w - 1, '-') + '+', MAT.code, 0.6))
        break
      }
      case 'table': {
        const cellW = Math.max(3, Math.min(10, Math.floor((cols - 1) / b.cols) - 1))
        const sep = '+' + Array(b.cols).fill('-'.repeat(cellW)).join('+') + '+'
        const row = '|' + Array(b.cols).fill(':'.repeat(cellW)).join('|') + '|'
        push(str(sep, MAT.hud, 0.7))
        for (let r = 0; r < Math.min(b.rows, 4); r++) push(str(row, MAT.hud, r === 0 ? 0.9 : 0.5))
        push(str(sep, MAT.hud, 0.7))
        break
      }
      case 'image':
        push(str('[ image ]', MAT.hud, 0.7))
        break
      case 'rule':
        push(str('-'.repeat(Math.min(cols, 24)), MAT.hud, 0.4))
        break
    }
  }

  const rest = blocks.length - drawn
  if (rows.length >= maxRows) rows.length = maxRows - 1
  if (rest > 0) push(str(`... +${rest} more blocks`, MAT.hud, 0.5))
  return rows
}

/** Stable per-document variation, e.g. for picking an accent offset. */
export const fingerprintSeed = (md: string) => hashString(md.slice(0, 2000))

const SPINE_GLYPH: Record<Block['kind'], string> = {
  heading: '#',
  para: '-',
  code: '%',
  list: '*',
  quote: '>',
  table: '=',
  image: '@',
  rule: ' ',
}

/** One-line structural summary of a document, resampled to at most `width` glyphs. */
export function spine(md: string, width = 40): string {
  const glyphs = parseBlocks(md)
    .filter(b => b.kind !== 'rule')
    .map(b => (b.kind === 'heading' && b.level > 2 ? '+' : SPINE_GLYPH[b.kind]))
  if (glyphs.length <= width) return glyphs.join('')
  // Keep structural marks when downsampling: prefer the most "interesting" glyph in each bucket.
  const rank = (g: string) => '#%=*>+@-'.indexOf(g)
  let out = ''
  for (let i = 0; i < width; i++) {
    const bucket = glyphs.slice(Math.floor((i * glyphs.length) / width), Math.floor(((i + 1) * glyphs.length) / width))
    out += bucket.reduce((best, g) => (rank(g) < rank(best) ? g : best), '-')
  }
  return out
}
