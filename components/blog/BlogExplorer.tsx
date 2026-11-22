'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { PostSummary } from '@/components/blog/PostRow'
import PostHeatmap from '@/components/blog/PostHeatmap'

const ALL = 'all'
const MAX_DIRS = 9
const mono = { fontFamily: 'var(--font-mono)' } as const

interface Props {
  posts: PostSummary[]
  /** Server-rendered art per slug for the preview pane. */
  previews: Record<string, React.ReactNode>
  views?: Record<string, number>
}

/**
 * /blog as a ranger-style file manager: topics on the left (directories), posts in the
 * middle, a live preview on the right. Mouse hover or j/k selects, Enter opens, / searches.
 */
export default function BlogExplorer({ posts, previews, views = {} }: Props) {
  const router = useRouter()
  const [dir, setDir] = useState(ALL)
  const [month, setMonth] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(posts[0]?.slug ?? '')
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLOListElement>(null)

  // Topics = most-used tags (case-insensitive), as directories.
  const dirs = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of posts) for (const t of new Set((p.tags ?? []).map(t => t.toLowerCase()))) counts.set(t, (counts.get(t) ?? 0) + 1)
    return [
      { name: ALL, count: posts.length },
      ...Array.from(counts, ([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
        .slice(0, MAX_DIRS),
    ]
  }, [posts])

  const files = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter(p => {
      if (dir !== ALL && !(p.tags ?? []).some(t => t.toLowerCase() === dir)) return false
      if (month && !p.published_at?.startsWith(month)) return false
      if (!q) return true
      return [p.title, p.excerpt ?? '', ...(p.tags ?? [])].some(s => s.toLowerCase().includes(q))
    })
  }, [posts, dir, month, query])

  const current = files.find(p => p.slug === selected) ?? files[0]

  // Keyboard: j/k move, Enter open, h/l switch directory, / search, Esc clears.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.tagName === 'INPUT'
      if (e.key === 'Escape') {
        setQuery('')
        searchRef.current?.blur()
        return
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return
      const i = files.findIndex(p => p.slug === current?.slug)
      if (e.key === 'j' || e.key === 'k') {
        const next = files[Math.min(files.length - 1, Math.max(0, i + (e.key === 'j' ? 1 : -1)))]
        if (next) setSelected(next.slug)
        e.preventDefault()
      } else if (e.key === 'Enter' && current && !(e.target as HTMLElement)?.closest('a,button')) {
        router.push(`/blog/${current.slug}`)
      } else if (e.key === 'h' || e.key === 'l') {
        const d = dirs.findIndex(x => x.name === dir)
        setDir(dirs[(d + (e.key === 'l' ? 1 : dirs.length - 1)) % dirs.length].name)
      } else if (e.key === '/') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [files, current, dirs, dir, router])

  // Keep the selected row in view when moving with the keyboard.
  useEffect(() => {
    listRef.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [current?.slug])

  const total = files.reduce((n, p) => n + (p.minutes ?? 0), 0)
  const path = ['~/blog', dir !== ALL && dir, month].filter(Boolean).join('/')
  const pane = 'border-r last:border-r-0'

  return (
    <>
      <PostHeatmap posts={posts} month={month} onMonth={setMonth} />

      <section className="py-10">
        {/* title bar */}
        <div
          className="flex flex-wrap items-center gap-3 rounded-t-xl border border-b-0 px-4 py-2.5 text-xs"
          style={{ ...mono, borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <span style={{ color: 'var(--accent)' }}>{path}</span>
          {month && (
            <button type="button" onClick={() => setMonth(null)} style={{ color: 'var(--text-muted)' }}>
              [x month]
            </button>
          )}
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="/ search"
            aria-label="Search posts"
            className="ml-auto w-40 bg-transparent outline-none sm:w-56"
            style={{ color: 'var(--text-primary)' }}
          />
          <span className="hidden md:inline" style={{ color: 'var(--text-muted)' }}>
            j/k move · enter open · h/l topic
          </span>
        </div>

        <div
          className="grid overflow-hidden rounded-b-xl border md:grid-cols-[180px_1fr] lg:grid-cols-[190px_1fr_1.15fr]"
          style={{ borderColor: 'var(--border)', minHeight: 420 }}
        >
          {/* directories */}
          <nav aria-label="Topics" className={`${pane} flex gap-1 overflow-x-auto p-2 md:block md:overflow-visible`} style={{ borderColor: 'var(--border)' }}>
            {dirs.map(d => {
              const on = d.name === dir
              return (
                <button
                  key={d.name}
                  type="button"
                  onClick={() => setDir(d.name)}
                  aria-pressed={on}
                  className="flex shrink-0 items-center justify-between gap-3 whitespace-nowrap rounded px-2 py-1 text-left text-xs transition-colors md:w-full"
                  style={{ ...mono, background: on ? 'var(--accent)' : 'transparent', color: on ? 'var(--bg)' : 'var(--text-secondary)' }}
                >
                  <span className="truncate">{d.name === ALL ? './' : `${d.name}/`}</span>
                  <span style={{ opacity: 0.6 }}>{d.count}</span>
                </button>
              )
            })}
          </nav>

          {/* files */}
          <ol ref={listRef} className={`${pane} max-h-[560px] overflow-y-auto p-2`} style={{ borderColor: 'var(--border)' }}>
            {files.length === 0 && (
              <li className="px-2 py-6 text-xs" style={{ ...mono, color: 'var(--text-muted)' }}>
                0 files
              </li>
            )}
            {files.map(p => {
              const on = p.slug === current?.slug
              return (
                <li key={p.slug} aria-current={on}>
                  <Link
                    href={`/blog/${p.slug}`}
                    onMouseEnter={() => setSelected(p.slug)}
                    onFocus={() => setSelected(p.slug)}
                    className="grid grid-cols-[14px_44px_1fr_auto] items-baseline gap-2 rounded px-2 py-2 transition-colors"
                    style={{ background: on ? 'var(--surface-2)' : 'transparent' }}
                  >
                    <span className="text-xs" style={{ ...mono, color: 'var(--accent)' }}>
                      {on ? '>' : ''}
                    </span>
                    <span className="text-xs" style={{ ...mono, color: 'var(--text-muted)' }}>
                      {p.published_at?.slice(5, 10)}
                    </span>
                    <span className="truncate text-sm" style={{ color: on ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {p.title}
                    </span>
                    <span className="text-xs tabular-nums" style={{ ...mono, color: 'var(--text-muted)' }}>
                      {p.minutes ?? '–'}m
                    </span>
                  </Link>
                </li>
              )
            })}
          </ol>

          {/* preview */}
          {current && (
            <article className="hidden flex-col gap-3 p-4 lg:flex">
              <div className="ascii-dark overflow-hidden rounded-lg border" style={{ borderColor: '#232323', background: '#0a0a0a' }}>
                {previews[current.slug]}
              </div>
              <h2 className="text-lg font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>
                {current.title}
              </h2>
              {current.excerpt && (
                <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                  {current.excerpt}
                </p>
              )}
              {current.outline && current.outline.length > 0 && (
                <ul className="text-xs leading-6" style={mono}>
                  {current.outline.map(h => (
                    <li key={h} className="truncate" style={{ color: 'var(--text-muted)' }}>
                      <span style={{ color: 'var(--accent)' }}>#</span> {h}
                    </li>
                  ))}
                </ul>
              )}
              <Link href={`/blog/${current.slug}`} className="group mt-auto text-sm" style={{ color: 'var(--text-primary)' }}>
                Open <span className="text-xs" style={{ ...mono, color: 'var(--text-muted)' }}>↵</span>{' '}
                <span className="inline-block transition-transform duration-150 group-hover:translate-x-0.5">→</span>
              </Link>
            </article>
          )}
        </div>

        {/* status line */}
        <p className="mt-2 flex justify-between text-xs" style={{ ...mono, color: 'var(--text-muted)' }}>
          <span>
            {files.length} files · {total} min total
          </span>
          {current && (
            <span>
              {current.published_at?.slice(0, 10)}
              {views[`/blog/${current.slug}`] ? ` · ${views[`/blog/${current.slug}`]} views` : ''}
            </span>
          )}
        </p>
      </section>
    </>
  )
}
