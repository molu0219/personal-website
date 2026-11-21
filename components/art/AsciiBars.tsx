import { glyphClass, MAT } from '@/lib/ascii/palette'

interface Props {
  /** Shown above the chart, e.g. "$ git log --format=%ad | uniq -c". */
  command: string
  rows: { label: string; value: number }[]
  /** Bar length for the largest value. */
  width?: number
  className?: string
}

/** Server-rendered horizontal bar chart in glyphs; the largest bar takes the accent. */
export default function AsciiBars({ command, rows, width = 24, className = '' }: Props) {
  const max = Math.max(1, ...rows.map(r => r.value))
  const labelW = Math.max(...rows.map(r => r.label.length))
  return (
    <pre
      className={`ascii m-0 whitespace-pre text-[11px] leading-[18px] ${className}`}
      style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
    >
      <span className={glyphClass(MAT.hud, 0.6)}>{command}</span>
      {'\n'}
      {rows.map(r => {
        const n = Math.max(1, Math.round((r.value / max) * width))
        const top = r.value === max
        return (
          <span key={r.label}>
            <span className={glyphClass(MAT.hud, 0.85)}>{r.label.padStart(labelW)} </span>
            <span className={glyphClass(top ? MAT.accent : MAT.ink, top ? 1 : 0.55)}>{'#'.repeat(n)}</span>
            <span className={glyphClass(MAT.noise, 0.8)}>{'.'.repeat(width - n)}</span>
            <span className={glyphClass(MAT.hud, 0.9)}> {r.value}</span>
            {'\n'}
          </span>
        )
      })}
    </pre>
  )
}
