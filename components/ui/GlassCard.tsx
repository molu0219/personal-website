interface GlassCardProps {
  children: React.ReactNode
  className?: string
  /** Enables the hover lift/border state. Name kept for call-site compatibility. */
  hoverRipple?: boolean
  onClick?: () => void
}

// Pure-CSS card: no per-mousemove React state, no backdrop blur — both caused scroll/hover jank.
export default function GlassCard({ children, className = '', hoverRipple = false, onClick }: GlassCardProps) {
  const hover = hoverRipple || onClick
    ? 'transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--border-strong)]'
    : ''
  return (
    <div
      className={`rounded-xl overflow-hidden relative border border-[var(--border)] bg-[var(--surface)] ${hover} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
