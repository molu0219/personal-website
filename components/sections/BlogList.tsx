'use client'

import { useState, useMemo } from 'react'
import PostRow, { type PostSummary } from '@/components/blog/PostRow'

type SortKey = 'newest' | 'oldest'

const chipBase = 'h-8 px-3 rounded-md text-xs border transition-colors duration-150'

function chipStyle(active: boolean): React.CSSProperties {
  return {
    fontFamily: 'var(--font-mono)',
    borderColor: active ? 'var(--text-primary)' : 'var(--border)',
    background: active ? 'var(--text-primary)' : 'transparent',
    color: active ? 'var(--bg)' : 'var(--text-secondary)',
  }
}

export default function BlogList({
  posts,
  viewCounts = {},
}: {
  posts: PostSummary[]
  viewCounts?: Record<string, number>
}) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')
  const [activeTag, setActiveTag] = useState('All')

  const allTags = useMemo(() => {
    const set = new Set<string>()
    posts.forEach(p => p.tags?.forEach(t => set.add(t)))
    return Array.from(set).sort()
  }, [posts])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = posts.filter(p => {
      if (activeTag !== 'All' && !p.tags?.includes(activeTag)) return false
      if (!q) return true
      return (
        p.title.toLowerCase().includes(q) ||
        (p.excerpt ?? '').toLowerCase().includes(q) ||
        (p.tags ?? []).some(t => t.toLowerCase().includes(q))
      )
    })
    const time = (p: PostSummary) => (p.published_at ? new Date(p.published_at).getTime() : 0)
    return [...matches].sort((a, b) => (sort === 'newest' ? time(b) - time(a) : time(a) - time(b)))
  }, [posts, query, sort, activeTag])

  return (
    <div>
      <div className="flex flex-col gap-4 py-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex gap-3">
          <input
            type="search"
            placeholder="Search posts…"
            aria-label="Search posts"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 min-w-0 h-9 px-3 rounded-md text-sm outline-none border bg-transparent transition-colors focus:border-[var(--text-primary)]"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
          <button
            type="button"
            onClick={() => setSort(s => (s === 'newest' ? 'oldest' : 'newest'))}
            className={chipBase}
            style={chipStyle(false)}
            aria-label={`Sort: ${sort}`}
          >
            {sort === 'newest' ? '↓ newest' : '↑ oldest'}
          </button>
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {['All', ...allTags].map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(tag)}
                aria-pressed={activeTag === tag}
                className={chipBase}
                style={chipStyle(activeTag === tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="py-24 text-center text-sm" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          No posts match.
        </p>
      ) : (
        <ul>
          {filtered.map(post => (
            <PostRow key={post.id} post={post} views={viewCounts[`/blog/${post.slug}`]} />
          ))}
        </ul>
      )}
    </div>
  )
}
