import AsciiFingerprint from '@/components/art/AsciiFingerprint'
import { parseBlocks } from '@/lib/ascii/fingerprint'

interface Props {
  /** Path shown in the panel header, e.g. "~/blog/my-post.md". */
  path: string
  content: string
  cols: number
  maxRows: number
  linkHeadings?: boolean
  glyphClass?: string
  className?: string
}

/** A document's ASCII fingerprint in a framed panel with a one-line `wc`-style header. */
export default function ContentMap({
  path,
  content,
  cols,
  maxRows,
  linkHeadings,
  glyphClass = 'text-[9px] leading-[12px] md:text-[10px] md:leading-[13px]',
  className = '',
}: Props) {
  const blocks = parseBlocks(content)
  const count = (k: string) => blocks.filter(b => b.kind === k).length
  const stats = [
    `${count('heading')} sections`,
    count('code') && `${count('code')} code`,
    count('table') && `${count('table')} tables`,
    count('list') && `${count('list')} lists`,
  ].filter(Boolean)

  return (
    <figure
      className={`m-0 overflow-hidden rounded-xl border ${className}`}
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <figcaption
        className="flex items-center justify-between gap-4 border-b px-4 py-2 text-xs"
        style={{ borderColor: 'var(--border)', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
      >
        <span className="truncate">{path}</span>
        <span className="shrink-0">{stats.join(' · ')}</span>
      </figcaption>
      <div className="overflow-hidden px-4 py-4">
        <AsciiFingerprint content={content} cols={cols} maxRows={maxRows} linkHeadings={linkHeadings} className={glyphClass} />
      </div>
    </figure>
  )
}
