interface PageHeaderProps {
  /** Small mono label above the title, e.g. "~/blog". */
  eyebrow: string
  title: string
  description?: string
  children?: React.ReactNode
  /** Right-hand panel on desktop, e.g. an ASCII chart of the section's data. */
  aside?: React.ReactNode
}

export default function PageHeader({ eyebrow, title, description, children, aside }: PageHeaderProps) {
  return (
    <header
      className="pt-32 pb-10 md:pt-40 md:pb-14 border-b md:grid md:grid-cols-[1fr_auto] md:items-end md:gap-10"
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
      {aside && <div className="hidden md:block">{aside}</div>}
    </header>
  )
}
