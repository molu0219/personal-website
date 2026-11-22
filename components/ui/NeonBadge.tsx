type Color = 'cyan' | 'purple' | 'pink' | 'white'

// Badges are deliberately neutral (mono, hairline border). `color` is kept for
// call-site compatibility; only 'pink' renders with the accent.
export default function NeonBadge({
  children,
  color = 'cyan',
  className = '',
}: {
  children: React.ReactNode
  color?: Color
  className?: string
}) {
  const isAccent = color === 'pink'
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-[11px] leading-5 border ${className}`}
      style={{
        fontFamily: 'var(--font-mono)',
        borderColor: isAccent ? 'color-mix(in srgb, var(--accent) 40%, transparent)' : 'var(--border)',
        color: isAccent ? 'var(--accent)' : 'var(--text-secondary)',
        background: 'var(--surface)',
      }}
    >
      {children}
    </span>
  )
}
