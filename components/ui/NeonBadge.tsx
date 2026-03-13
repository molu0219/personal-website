type Color = 'cyan' | 'purple' | 'pink' | 'white'

const colorVar: Record<Color, string> = {
  cyan: 'var(--cyan)',
  purple: 'var(--purple)',
  pink: 'var(--pink)',
  white: 'var(--text-secondary)',
}

export default function NeonBadge({
  children,
  color = 'cyan',
  className = '',
}: {
  children: React.ReactNode
  color?: Color
  className?: string
}) {
  const c = colorVar[color]

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${className}`}
      style={{
        background: `color-mix(in srgb, ${c} 12%, transparent)`,
        borderColor: `color-mix(in srgb, ${c} 35%, transparent)`,
        color: c,
      }}
    >
      {children}
    </span>
  )
}
