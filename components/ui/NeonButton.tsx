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
  /** Trailing arrow keycap. Defaults to on for link buttons with a solid/outline variant. */
  arrow?: boolean
}

// Legacy variant names kept for call-site compatibility:
// cyan → primary (solid), purple → secondary (raised), pink → danger, ghost → quiet.
// Depth comes from a top inner highlight + a 1px hairline shadow, never a glow.
const VARIANT_CLASS: Record<Variant, string> = {
  cyan:
    'bg-[var(--text-primary)] text-[var(--bg)] border-transparent ' +
    'shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.12)] hover:bg-[color-mix(in_srgb,var(--text-primary)_88%,var(--bg))]',
  purple:
    'bg-[var(--surface)] text-[var(--text-primary)] border-[var(--border)] ' +
    'shadow-[inset_0_1px_0_rgb(255_255_255/0.05),0_1px_2px_rgb(0_0_0/0.04)] hover:bg-[var(--surface-2)] hover:border-[var(--border-strong)]',
  pink: 'bg-transparent text-[var(--accent)] border-[color-mix(in_srgb,var(--accent)_45%,transparent)] hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]',
  ghost: 'bg-transparent text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]',
}

// Arrow sits in a small keycap that takes a tint of the button's own text color.
const KEYCAP_CLASS: Record<Variant, string> = {
  cyan: 'bg-[color-mix(in_srgb,var(--bg)_14%,transparent)]',
  purple: 'bg-[var(--surface-2)] border border-[var(--border)]',
  pink: 'bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]',
  ghost: 'bg-[var(--surface-2)]',
}

const BASE =
  'group/btn inline-flex items-center justify-center gap-3 h-11 rounded-lg border text-sm font-medium ' +
  'transition-[background-color,border-color,color,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] ' +
  'active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 select-none'

function Keycap({ variant }: { variant: Variant }) {
  return (
    <span
      aria-hidden
      className={`grid h-6 w-6 place-items-center rounded-md text-xs ${KEYCAP_CLASS[variant]}`}
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      <span className="transition-transform duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:translate-x-0.5">
        →
      </span>
    </span>
  )
}

export default function NeonButton({
  children,
  variant = 'cyan',
  href,
  onClick,
  className = '',
  type = 'button',
  disabled,
  arrow,
}: NeonButtonProps) {
  const showArrow = arrow ?? (Boolean(href) && (variant === 'cyan' || variant === 'purple'))
  const padding = showArrow ? 'pl-5 pr-2.5' : 'px-5'
  const cls = `${BASE} ${padding} ${VARIANT_CLASS[variant]} ${className}`
  const content = (
    <>
      {children}
      {showArrow && <Keycap variant={variant} />}
    </>
  )

  if (href) {
    const isExternal = /^https?:\/\//.test(href)
    return isExternal ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {content}
      </a>
    ) : (
      <Link href={href} className={cls}>
        {content}
      </Link>
    )
  }

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={cls}>
      {content}
    </button>
  )
}
