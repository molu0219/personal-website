/** Markdown → structural blocks, plus the shared glyph cell type for ASCII art grids. */

export interface FpCell {
  ch: string
  mat: number
  lum: number
}

export type Block =
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

/** Emoji carry no structure and render inconsistently in monospace (and make next/og fetch images). */
function stripEmoji(s: string): string {
  return s.replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, '').replace(/\s+/g, ' ').trim()
}
