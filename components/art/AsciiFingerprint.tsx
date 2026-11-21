import { fingerprint, type FpCell, type FpRow } from '@/lib/ascii/fingerprint'
import { glyphClass } from '@/lib/ascii/palette'

interface Props {
  content: string
  cols: number
  maxRows: number
  /** Heading rows link to their section (#anchor), turning the map into a table of contents. */
  linkHeadings?: boolean
  className?: string
}

/** Group a row into runs of equal colour so the HTML stays small. */
function runs(cells: FpCell[]) {
  const out: { cls: string | null; text: string }[] = []
  for (const c of cells) {
    const cls = c.ch === ' ' ? null : glyphClass(c.mat, c.lum)
    const last = out[out.length - 1]
    if (last && (last.cls === cls || cls === null)) last.text += c.ch
    else out.push({ cls, text: c.ch })
  }
  return out
}

function Line({ row }: { row: FpRow }) {
  return (
    <>
      {runs(row.cells).map((r, i) =>
        r.cls ? (
          <i key={i} className={r.cls}>
            {r.text}
          </i>
        ) : (
          r.text
        ),
      )}
    </>
  )
}

/** Server-rendered ASCII minimap of a markdown document (see lib/ascii/fingerprint). */
export default function AsciiFingerprint({ content, cols, maxRows, linkHeadings, className = '' }: Props) {
  const rows = fingerprint(content, { cols, maxRows })
  return (
    <pre
      aria-hidden={linkHeadings ? undefined : true}
      className={`ascii m-0 whitespace-pre select-none ${className}`}
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      {rows.map((row, i) =>
        linkHeadings && row.anchor ? (
          <a
            key={i}
            href={`#${row.anchor}`}
            title={row.label}
            className="block -mx-1 px-1 rounded-sm transition-colors hover:bg-[var(--surface-2)]"
          >
            <Line row={row} />
          </a>
        ) : (
          <span key={i} className="block min-h-[1em]">
            <Line row={row} />
          </span>
        ),
      )}
    </pre>
  )
}
