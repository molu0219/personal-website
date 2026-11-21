import type { FpCell } from '@/lib/ascii/blocks'
import { glyphClass } from '@/lib/ascii/palette'

/** Server-rendered grid of coloured glyphs (palette classes), grouped into runs per row. */
export default function AsciiArt({ grid, className = '' }: { grid: FpCell[][]; className?: string }) {
  return (
    <pre aria-hidden className={`ascii m-0 whitespace-pre select-none ${className}`} style={{ fontFamily: 'var(--font-mono)' }}>
      {grid.map((row, r) => {
        const runs: { cls: string | null; text: string }[] = []
        for (const c of row) {
          const cls = c.ch === ' ' ? null : glyphClass(c.mat, c.lum)
          const last = runs[runs.length - 1]
          if (last && (last.cls === cls || cls === null)) last.text += c.ch
          else runs.push({ cls, text: c.ch })
        }
        return (
          <span key={r} className="block">
            {runs.map((run, i) => (run.cls ? <i key={i} className={run.cls}>{run.text}</i> : run.text))}
          </span>
        )
      })}
    </pre>
  )
}
