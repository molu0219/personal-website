import AsciiArt from '@/components/art/AsciiArt'
import { landscape, landscapeLegend } from '@/lib/ascii/landscape'

interface Props {
  content: string
  seed: string
  tags?: string[] | null
  cols: number
  rows: number
  /** Show the one-line legend of what the picture encodes. */
  legend?: boolean
  glyphClass?: string
  className?: string
}

/** A post's / project's generated ASCII landscape in a framed panel. */
export default function ContentArt({
  content,
  seed,
  tags,
  cols,
  rows,
  legend = true,
  glyphClass = 'text-[7px] leading-[8px] md:text-[8px] md:leading-[9px]',
  className = '',
}: Props) {
  return (
    <figure
      className={`ascii-dark m-0 overflow-hidden rounded-xl border ${className}`}
      style={{ borderColor: '#232323', background: '#0a0a0a' }}
    >
      <div className="flex justify-center overflow-hidden">
        <AsciiArt grid={landscape({ content, seed, tags }, cols, rows)} className={glyphClass} />
      </div>
      {legend && (
        <figcaption
          className="border-t px-4 py-2 text-[11px]"
          style={{ borderColor: '#232323', fontFamily: 'var(--font-mono)', color: '#6b6b65' }}
        >
          {landscapeLegend(content, tags)}
        </figcaption>
      )}
    </figure>
  )
}
