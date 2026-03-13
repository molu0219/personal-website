'use client'

import { forwardRef } from 'react'

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`px-4 py-2.5 rounded-lg text-sm outline-none transition-all ${className}`}
          style={{
            background: 'var(--surface)',
            border: error ? '1px solid color-mix(in srgb, var(--pink) 50%, transparent)' : '1px solid var(--border)',
            color: 'var(--text-primary)',
            backdropFilter: 'blur(10px)',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = 'var(--cyan)'
            e.currentTarget.style.boxShadow = '0 0 0 2px var(--border)'
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = error ? 'color-mix(in srgb, var(--pink) 50%, transparent)' : 'var(--border)'
            e.currentTarget.style.boxShadow = 'none'
          }}
          {...props}
        />
        {error && <span className="text-xs" style={{ color: 'var(--pink)' }}>{error}</span>}
      </div>
    )
  }
)

GlassInput.displayName = 'GlassInput'
export default GlassInput
