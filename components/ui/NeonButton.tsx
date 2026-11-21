import Link from 'next/link'

type Variant = 'cyan' | 'purple' | 'pink' | 'ghost'

interface NeonButtonProps {
  children: React.ReactNode
  variant?: Variant
  href?: string
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

// Legacy variant names kept for call-site compatibility:
// cyan → primary (solid), purple → secondary (outline), pink → danger, ghost → quiet.
const VARIANT_CLASS: Record<Variant, string> = {
  cyan: 'bg-[var(--text-primary)] text-[var(--bg)] border-transparent hover:opacity-85',
  purple: 'bg-transparent text-[var(--text-primary)] border-[var(--border-strong)] hover:bg-[var(--surface-2)]',
  pink: 'bg-transparent text-[var(--accent)] border-[color-mix(in_srgb,var(--accent)_45%,transparent)] hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]',
  ghost: 'bg-transparent text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]',
}

const BASE =
  'inline-flex items-center justify-center gap-2 h-10 px-5 rounded-md border text-sm font-medium ' +
  'transition-[background-color,color,opacity,transform] duration-150 ease-out active:scale-[0.98] ' +
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 select-none'

export default function NeonButton({
  children,
  variant = 'cyan',
  href,
  onClick,
  className = '',
  type = 'button',
  disabled,
}: NeonButtonProps) {
  const cls = `${BASE} ${VARIANT_CLASS[variant]} ${className}`

  if (href) {
    const isExternal = /^https?:\/\//.test(href)
    return isExternal ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    ) : (
      <Link href={href} className={cls}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={cls}>
      {children}
    </button>
  )
}
