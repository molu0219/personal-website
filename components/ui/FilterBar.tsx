'use client'

import { useState } from 'react'

export interface FilterBarProps<S extends string> {
  query: string
  onQuery: (v: string) => void
  placeholder: string
  sortOptions: readonly { value: S; label: string }[]
  sort: S
  onSort: (v: S) => void
  tags: string[]
  activeTag: string
  onTag: (v: string) => void
  /** Optional count shown next to each tag. */
  tagCount?: (tag: string) => number
  /** Tags shown before collapsing the rest behind "+N". Pass tags most-used first. */
  maxVisibleTags?: number
}

export const ALL_TAG = 'All'

const DEFAULT_MAX_VISIBLE_TAGS = 8

const chip = 'h-8 px-3 rounded-md text-xs border transition-colors duration-150 whitespace-nowrap'

function chipStyle(active: boolean): React.CSSProperties {
  return {
    fontFamily: 'var(--font-mono)',
    borderColor: active ? 'var(--text-primary)' : 'var(--border)',
    background: active ? 'var(--text-primary)' : 'transparent',
    color: active ? 'var(--bg)' : 'var(--text-secondary)',
  }
}

function visibleTags(tags: string[], active: string, max: number, expanded: boolean): string[] {
  if (expanded || tags.length <= max) return tags
  const head = tags.slice(0, max)
  // Keep the selected tag on screen even when it lives in the collapsed tail.
  return active !== ALL_TAG && !head.includes(active) ? [...head, active] : head
}

export default function FilterBar<S extends string>(p: FilterBarProps<S>) {
  const [expanded, setExpanded] = useState(false)
  const max = p.maxVisibleTags ?? DEFAULT_MAX_VISIBLE_TAGS
  const shown = visibleTags(p.tags, p.activeTag, max, expanded)
  const hiddenCount = p.tags.length - shown.length
  const canToggle = p.tags.length > max

  return (
    <div className="flex flex-col gap-4 py-6 border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder={p.placeholder}
          aria-label={p.placeholder}
          value={p.query}
          onChange={e => p.onQuery(e.target.value)}
          className="flex-1 min-w-[180px] h-9 px-3 rounded-md text-sm outline-none border bg-transparent transition-colors focus:border-[var(--text-primary)]"
          style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        />
        <div className="flex gap-1.5" role="group" aria-label="Sort">
          {p.sortOptions.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => p.onSort(o.value)}
              aria-pressed={p.sort === o.value}
              className={chip}
              style={chipStyle(p.sort === o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {p.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {[ALL_TAG, ...shown].map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => p.onTag(tag)}
              aria-pressed={p.activeTag === tag}
              className={chip}
              style={chipStyle(p.activeTag === tag)}
            >
              {tag}
              {p.tagCount && <span className="ml-1.5 opacity-50">{p.tagCount(tag)}</span>}
            </button>
          ))}
          {canToggle && (
            <button
              type="button"
              onClick={() => setExpanded(v => !v)}
              aria-expanded={expanded}
              className={`${chip} border-dashed`}
              style={{ ...chipStyle(false), color: 'var(--text-muted)' }}
            >
              {expanded ? 'less' : `+${hiddenCount}`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
