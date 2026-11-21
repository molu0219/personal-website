'use client'

import { useState, useMemo } from 'react'
import FilterBar, { ALL_TAG } from '@/components/ui/FilterBar'
import ProjectCard, { type ProjectSummary } from '@/components/project/ProjectCard'

type SortKey = 'newest' | 'oldest' | 'featured'

const SORT_OPTIONS = [
  { value: 'newest', label: '↓ newest' },
  { value: 'oldest', label: '↑ oldest' },
  { value: 'featured', label: '★ featured' },
] as const

const time = (p: ProjectSummary) => (p.created_at ? new Date(p.created_at).getTime() : 0)

export default function ProjectGrid({
  projects,
  viewCounts = {},
}: {
  projects: ProjectSummary[]
  viewCounts?: Record<string, number>
}) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')
  const [activeTag, setActiveTag] = useState(ALL_TAG)

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>()
    projects.forEach(p => p.tags?.forEach(t => counts.set(t, (counts.get(t) ?? 0) + 1)))
    return counts
  }, [projects])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = projects.filter(p => {
      if (activeTag !== ALL_TAG && !p.tags?.includes(activeTag)) return false
      if (!q) return true
      return (
        p.title.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q) ||
        (p.tags ?? []).some(t => t.toLowerCase().includes(q))
      )
    })
    return [...matches].sort((a, b) => {
      if (sort === 'featured') return Number(!!b.featured) - Number(!!a.featured) || time(b) - time(a)
      return sort === 'newest' ? time(b) - time(a) : time(a) - time(b)
    })
  }, [projects, query, sort, activeTag])

  if (projects.length === 0) {
    return (
      <p className="py-32 text-center text-sm" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
        No projects yet.
      </p>
    )
  }

  return (
    <div>
      <FilterBar
        query={query}
        onQuery={setQuery}
        placeholder="Search projects…"
        sortOptions={SORT_OPTIONS}
        sort={sort}
        onSort={setSort}
        tags={Array.from(tagCounts.keys()).sort((a, b) => tagCounts.get(b)! - tagCounts.get(a)! || a.localeCompare(b))}
        activeTag={activeTag}
        onTag={setActiveTag}
        tagCount={tag => (tag === ALL_TAG ? projects.length : tagCounts.get(tag) ?? 0)}
      />
      {filtered.length === 0 ? (
        <p className="py-24 text-center text-sm" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          No projects match.
        </p>
      ) : (
        <div className="grid gap-x-6 gap-y-12 pt-10 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(project => (
            <ProjectCard key={project.id} project={project} views={viewCounts[`/projects/${project.slug}`]} />
          ))}
        </div>
      )}
    </div>
  )
}
