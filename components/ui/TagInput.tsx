'use client'

import { useState, useEffect } from 'react'

interface Props {
  label?: string
  value: string[]
  onChange: (tags: string[]) => void
  className?: string
}

export default function TagInput({ label, value, onChange, className = '' }: Props) {
  // Keep raw text in sync with value, but let user type freely
  const [raw, setRaw] = useState(value.join(', '))

  // Sync from parent when value changes externally (e.g. initial load)
  useEffect(() => {
    setRaw(value.join(', '))
  }, [value.join(',')])

  const commitTags = (text: string) => {
    const tags = text.split(',').map(t => t.trim()).filter(Boolean)
    onChange(tags)
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <input
        className={`px-4 py-2.5 rounded-lg text-sm outline-none transition-all ${className}`}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
        }}
        value={raw}
        onChange={e => setRaw(e.target.value)}
        onBlur={() => commitTags(raw)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commitTags(raw) } }}
        placeholder="Tag1, Tag2, Tag3"
        onFocus={e => {
          e.currentTarget.style.borderColor = 'var(--cyan)'
          e.currentTarget.style.boxShadow = '0 0 0 2px var(--border)'
        }}
      />
    </div>
  )
}
