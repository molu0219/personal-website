import { getGeometry, hashSeed, renderKnotText, TREFOIL, type KnotShape } from '@/lib/ascii-knot'

interface Props {
  /** Same seed → same angle, so a project keeps its picture across renders. */
  seed: string
  cols?: number
  rows?: number
  shape?: KnotShape
  className?: string
}

const CHAR_ASPECT = 0.6

/** Static ASCII knot frame. Server-renderable: plain text, no client JS. */
export default function AsciiStill({ seed, cols = 64, rows = 30, shape = TREFOIL, className = '' }: Props) {
  const h = hashSeed(seed)
  const unit = (shift: number) => ((h >>> shift) & 0xff) / 255
  const text = renderKnotText(
    {
      cols,
      rows,
      charAspect: CHAR_ASPECT,
      // Near the hero's three-quarter view so the knot never collapses edge-on.
      rotX: 0.75 + unit(0) * 0.5,
      rotY: (unit(8) - 0.5) * 0.9,
      rotZ: unit(16) * Math.PI * 2,
    },
    getGeometry(shape),
  )
  return (
    <pre
      aria-hidden="true"
      className={`m-0 select-none whitespace-pre ${className}`}
      style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
    >
      {text}
    </pre>
  )
}
