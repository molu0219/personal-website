'use client'

import { useState, useMemo } from 'react'
import PostRow, { type PostSummary } from '@/components/blog/PostRow'
import FilterBar, { ALL_TAG } from '@/components/ui/FilterBar'
import FeaturedPost from '@/components/blog/FeaturedPost'

type SortKey = 'newest' | 'oldest'

const SORT_OPTIONS = [
  { value: 'newest', label: '↓ newest' },
  { value: 'oldest', label: '↑ oldest' },
] as const

export default function BlogList({
  posts,
  viewCounts = {},
}: {
  posts: PostSummary[]
  viewCounts?: Record<string, number>
}) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')
  const [activeTag, setActiveTag] = useState(ALL_TAG)

  // Most-used tags first, so the collapsed filter row shows the ones that matter.
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>()
    posts.forEach(p => p.tags?.forEach(t => counts.set(t, (counts.get(t) ?? 0) + 1)))
    return counts
  }, [posts])
  const allTags = useMemo(
    () => Array.from(tagCounts.keys()).sort((a, b) => tagCounts.get(b)! - tagCounts.get(a)! || a.localeCompare(b)),
    [tagCounts],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = posts.filter(p => {
      if (activeTag !== ALL_TAG && !p.tags?.includes(activeTag)) return false
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

  // The newest post gets the featured slot only in the default, unfiltered view.
  const isDefaultView = !query.trim() && activeTag === ALL_TAG && sort === 'newest'
  const featured = isDefaultView && filtered.length > 1 ? filtered[0] : null
  const rows = featured ? filtered.slice(1) : filtered

  return (
    <div>
      {featured && <FeaturedPost post={featured} />}
      <FilterBar
        query={query}
        onQuery={setQuery}
        placeholder="Search posts…"
        sortOptions={SORT_OPTIONS}
        sort={sort}
        onSort={setSort}
        tags={allTags}
        activeTag={activeTag}
        onTag={setActiveTag}
        tagCount={tag => (tag === ALL_TAG ? posts.length : tagCounts.get(tag) ?? 0)}
      />

      {filtered.length === 0 ? (
        <p className="py-24 text-center text-sm" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          No posts match.
        </p>
      ) : (
        <ul>
          {rows.map(post => (
            <PostRow key={post.id} post={post} views={viewCounts[`/blog/${post.slug}`]} />
          ))}
        </ul>
      )}
    </div>
  )
}
