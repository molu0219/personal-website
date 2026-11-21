import AsciiKnot from '@/components/art/AsciiKnot'
import type { KnotShape } from '@/lib/ascii-knot'

interface PageHeaderProps {
  /** Small mono label above the title, e.g. "~/blog". */
  eyebrow: string
  title: string
  description?: string
  children?: React.ReactNode
  /** ASCII knot shown on the right on desktop; each section uses its own shape. */
  knot?: KnotShape
}

export default function PageHeader({ eyebrow, title, description, children, knot }: PageHeaderProps) {
  return (
    <header
      className="pt-32 pb-10 md:pt-40 md:pb-14 border-b md:grid md:grid-cols-[1fr_320px] md:items-end md:gap-10"
      style={{ borderColor: 'var(--border)' }}
    >
      <div>
      <p className="text-xs mb-4" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
        {eyebrow}
      </p>
      <h1
        className="text-4xl md:text-6xl font-medium tracking-[-0.03em] leading-[1.05]"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
      >
        {title}
        <span style={{ color: 'var(--accent)' }}>.</span>
      </h1>
      {description && (
        <p className="mt-5 max-w-xl text-base md:text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>
      )}
      {children}
      </div>
      {knot && (
        <AsciiKnot
          shape={knot}
          speed={0.6}
          glyphClass="text-[7px] leading-[7px]"
          className="hidden md:block h-[220px] -mb-6"
        />
      )}
    </header>
  )
}
