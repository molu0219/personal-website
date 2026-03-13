'use client'

import { motion } from 'framer-motion'

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

const variantVars: Record<Variant, string> = {
  cyan: '--cyan',
  purple: '--purple',
  pink: '--pink',
  ghost: '',
}

export default function NeonButton({
  children,
  variant = 'cyan',
  href,
  onClick,
  className = '',
  type = 'button',
  disabled,
}: NeonButtonProps) {
  const isGhost = variant === 'ghost'
  const colorVar = isGhost ? 'var(--text-secondary)' : `var(${variantVars[variant]})`

  const inner = (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`relative px-6 py-2.5 rounded-lg font-medium text-sm tracking-wide ${className}`}
      style={{
        color: colorVar,
        border: `1px solid ${isGhost ? 'var(--border)' : `color-mix(in srgb, ${colorVar} 50%, transparent)`}`,
        background: 'var(--surface)',
        backdropFilter: 'blur(10px)',
        cursor: disabled ? 'not-allowed' : 'none',
        opacity: disabled ? 0.5 : 1,
        transition: 'box-shadow 0.2s, border-color 0.2s, background 0.2s',
      }}
      whileHover={
        disabled
          ? {}
          : {
              boxShadow: isGhost
                ? 'var(--shadow-md)'
                : `0 0 20px color-mix(in srgb, ${colorVar} 30%, transparent), 0 0 40px color-mix(in srgb, ${colorVar} 15%, transparent)`,
              borderColor: colorVar,
            }
      }
      whileTap={disabled ? {} : { scale: 0.97 }}
    >
      {children}
    </motion.button>
  )

  if (href) {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
        {inner}
      </a>
    )
  }
  return inner
}
