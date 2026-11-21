import AsciiStill from '@/components/art/AsciiStill'
import type { KnotShape } from '@/lib/ascii-knot'

interface Props {
  seed: string
  shape?: KnotShape
  className?: string
}

/** Cover-sized frame holding a seeded static knot. Replaces the old raster covers on-site. */
export default function AsciiBanner({ seed, shape, className = '' }: Props) {
  return (
    <div
      className={`flex aspect-[1200/630] items-center justify-center overflow-hidden rounded-xl border ${className}`}
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <AsciiStill seed={seed} shape={shape} cols={120} rows={44} className="text-[5px] leading-[5px] sm:text-[6px] sm:leading-[6px]" />
    </div>
  )
}
