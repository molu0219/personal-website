import Link from 'next/link'

interface Props {
  href: string
  /** Accent label, e.g. "latest" or "featured". */
  label: string
  /** Muted text after the label, e.g. a date or the stack. */
  meta?: string
  title: string
  excerpt?: string | null
  cta: string
  /** Server-rendered art (the entry's generated landscape). */
  art: React.ReactNode
}

/** The one highlighted entry at the top of /blog and /projects; same layout on both. */
export default function FeaturedEntry({ href, label, meta, title, excerpt, cta, art }: Props) {
  return (
    <Link
      href={href}
      className="group grid gap-6 py-10 border-b md:grid-cols-[1.15fr_1fr] md:items-center md:gap-10"
      style={{ borderColor: 'var(--border)' }}
    >
      <div>{art}</div>
      <div>
        <p className="mb-4 text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--accent)' }}>{label}</span>
          {meta && <> · {meta}</>}
        </p>
        <h2
          className="text-2xl md:text-3xl font-medium leading-tight tracking-[-0.02em] transition-colors group-hover:text-[var(--accent)]"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h2>
        {excerpt && (
          <p className="mt-4 text-[15px] leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
            {excerpt}
          </p>
        )}
        <p className="mt-6 text-sm" style={{ color: 'var(--text-primary)' }}>
          {cta} <span className="inline-block transition-transform duration-150 group-hover:translate-x-0.5">→</span>
        </p>
      </div>
    </Link>
  )
}
